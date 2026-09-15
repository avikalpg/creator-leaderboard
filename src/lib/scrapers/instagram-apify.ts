import { ScrapedPost } from "./youtube";

export interface InstagramScrapeResult {
  username: string;
  followers: number;
  posts: ScrapedPost[];
}

export async function fetchInstagramViaApify(
  usernames: string[],
  apiKey?: string
): Promise<Record<string, InstagramScrapeResult>> {
  const token = apiKey || process.env.APIFY_API_KEY;
  if (!token) {
    console.warn("APIFY_API_KEY not found in environment");
    return {};
  }

  const cleanUsernames = usernames.map((u) => u.replace(/^@/, "").trim()).filter(Boolean);
  if (cleanUsernames.length === 0) return {};

  try {
    const directUrls = cleanUsernames.map((u) => `https://www.instagram.com/${u}/reels/`);

    console.log(`Starting Apify Instagram scrape for ${cleanUsernames.length} handles (${directUrls.length} reel URLs)...`);
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}&timeout=180`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directUrls,
          resultsLimit: 15,
        }),
      }
    );

    if (!runRes.ok) {
      const errText = await runRes.text();
      console.error(`Apify request failed (${runRes.status}):`, errText);
      return {};
    }

    const items = await runRes.json();
    const results: Record<string, InstagramScrapeResult> = {};

    for (const u of cleanUsernames) {
      results[u.toLowerCase()] = {
        username: u,
        followers: 0,
        posts: [],
      };
    }

    for (const item of items) {
      const owner = (item.ownerUsername || item.username || "").toLowerCase();
      if (!owner || !results[owner]) continue;

      if (item.ownerFollowersCount && item.ownerFollowersCount > results[owner].followers) {
        results[owner].followers = item.ownerFollowersCount;
      }

      const views =
        item.videoViewCount ||
        item.videoPlayCount ||
        item.viewsCount ||
        item.likesCount ||
        0;

      const shortcode = item.shortCode || item.code || item.id;
      if (!shortcode) continue;

      results[owner].posts.push({
        platform: "INSTAGRAM",
        externalId: shortcode,
        url: item.url || `https://www.instagram.com/reel/${shortcode}/`,
        title: item.caption ? item.caption.slice(0, 100) : undefined,
        views: parseInt(views.toString(), 10) || 0,
        likes: parseInt((item.likesCount || 0).toString(), 10) || 0,
        comments: parseInt((item.commentsCount || 0).toString(), 10) || 0,
        publishedAt: item.timestamp ? new Date(item.timestamp) : new Date(),
      });
    }

    return results;
  } catch (error) {
    console.error("Error executing Apify Instagram scrape:", error);
    return {};
  }
}
