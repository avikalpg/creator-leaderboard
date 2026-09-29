import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateCreatorScore,
  DEFAULT_SETTINGS,
  ScoringSettings,
  RawPost,
} from "@/lib/scoring";

async function extractInstagramMetadata(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;
    const html = await res.text();

    const getMeta = (prop: string) => {
      const match =
        html.match(new RegExp(`<meta\\s+[^>]*property=["']${prop}["'][^>]*content=["']([^"']+)["']`, "i")) ||
        html.match(new RegExp(`<meta\\s+[^>]*content=["']([^"']+)["'][^>]*property=["']${prop}["']`, "i"));
      return match ? match[1] : null;
    };

    const ogUrl = getMeta("og:url") || url;
    const ogTitle = getMeta("og:title") || "";
    const ogDesc = getMeta("og:description") || "";

    const handleMatch = ogUrl.match(/instagram\.com\/([a-zA-Z0-9._]+)\/(?:reel|p)\//i);
    const handle = handleMatch ? handleMatch[1].toLowerCase() : null;

    const nameMatch = ogTitle.match(/^([^:]+?)\s+on\s+Instagram/i);
    const authorName = nameMatch ? nameMatch[1].trim() : null;

    let likes = 0;
    const likesMatch = ogDesc.match(/([\d,.]+)\s*likes?/i);
    if (likesMatch) {
      likes = parseInt(likesMatch[1].replace(/,/g, ""), 10) || 0;
    }

    let comments = 0;
    const commentsMatch = ogDesc.match(/([\d,.]+)\s*comments?/i);
    if (commentsMatch) {
      comments = parseInt(commentsMatch[1].replace(/,/g, ""), 10) || 0;
    }

    let caption: string | null = null;
    const captionMatch = ogDesc.match(/:\s*&quot;([\s\S]*?)&quot;/) || ogTitle.match(/:\s*&quot;([\s\S]*?)&quot;/);
    if (captionMatch) {
      caption = captionMatch[1].replace(/&#x[0-9a-f]+;/gi, "").trim();
    }

    return {
      canonicalUrl: ogUrl,
      handle,
      authorName,
      likes,
      comments,
      caption,
    };
  } catch (err) {
    console.error("Error extracting Instagram metadata:", err);
    return null;
  }
}

async function extractYouTubeMetadata(videoId: string, apiKey: string) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    const v = data.items[0];
    return {
      channelId: v.snippet.channelId,
      channelTitle: v.snippet.channelTitle,
      title: v.snippet.title,
      views: parseInt(v.statistics.viewCount || "0", 10),
      likes: parseInt(v.statistics.likeCount || "0", 10),
      comments: parseInt(v.statistics.commentCount || "0", 10),
    };
  } catch (err) {
    console.error("Error extracting YouTube metadata:", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, creatorId, estimatedViews } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Please enter a video or reel link." }, { status: 400 });
    }

    const trimmedUrl = url.trim();

    // 1. Detect platform and extract external ID
    let platform: "INSTAGRAM" | "YOUTUBE" = "INSTAGRAM";
    let externalId = "";
    let normalizedUrl = trimmedUrl;

    const igMatch = trimmedUrl.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
    const ytMatch = trimmedUrl.match(/(?:shorts\/|watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);

    if (igMatch) {
      platform = "INSTAGRAM";
      externalId = igMatch[1];
      normalizedUrl = `https://www.instagram.com/reel/${externalId}/`;
    } else if (ytMatch) {
      platform = "YOUTUBE";
      externalId = ytMatch[1];
      normalizedUrl = `https://www.youtube.com/watch?v=${externalId}`;
    } else {
      return NextResponse.json(
        { error: "Unrecognized URL. Please provide an Instagram Reel (/reels/...) or YouTube Short link." },
        { status: 400 }
      );
    }

    // 2. Automatically extract author & views from the link
    let detectedHandle: string | null = null;
    let detectedName: string | null = null;
    let autoLikes = 0;
    let autoComments = 0;
    let autoTitle: string | null = null;
    let autoViews = typeof estimatedViews === "number" && estimatedViews > 0 ? estimatedViews : 0;

    if (platform === "INSTAGRAM") {
      const igMeta = await extractInstagramMetadata(trimmedUrl);
      if (igMeta) {
        detectedHandle = igMeta.handle;
        detectedName = igMeta.authorName;
        autoLikes = igMeta.likes;
        autoComments = igMeta.comments;
        autoTitle = igMeta.caption;
        if (autoViews === 0 && autoLikes > 0) {
          // Conservative estimate based on typical reel like ratio (~5%)
          autoViews = Math.max(100, Math.round(autoLikes * 20));
        }
      }
    } else if (platform === "YOUTUBE") {
      const ytKey = process.env.YOUTUBE_API_KEY;
      if (ytKey) {
        const ytMeta = await extractYouTubeMetadata(externalId, ytKey);
        if (ytMeta) {
          detectedName = ytMeta.channelTitle;
          autoTitle = ytMeta.title;
          autoViews = ytMeta.views;
          autoLikes = ytMeta.likes;
          autoComments = ytMeta.comments;
        }
      }
    }

    if (autoViews === 0) autoViews = 50;

    // 3. Match the creator in the database
    let creator = null;

    if (creatorId) {
      creator = await prisma.creator.findUnique({ where: { id: creatorId } });
    }

    if (!creator && detectedHandle) {
      creator = await prisma.creator.findFirst({
        where: {
          instagramHandle: {
            equals: detectedHandle,
          },
        },
      });
    }

    if (!creator && detectedName) {
      creator = await prisma.creator.findFirst({
        where: {
          OR: [
            { name: { contains: detectedName } },
            { youtubeHandle: { contains: detectedName } },
          ],
        },
      });
    }

    if (!creator) {
      const hint = detectedHandle ? `@${detectedHandle}` : detectedName ? `"${detectedName}"` : "this account";
      return NextResponse.json(
        {
          error: `Detected post from ${hint}, but this creator is not registered in the cohort yet. Please add them via Admin Settings first.`,
          detectedHandle,
          detectedName,
        },
        { status: 404 }
      );
    }

    // 4. Upsert PostSnapshot
    const post = await prisma.postSnapshot.upsert({
      where: {
        platform_externalId: {
          platform,
          externalId,
        },
      },
      update: {
        creatorId: creator.id,
        url: normalizedUrl,
        title: autoTitle || undefined,
        views: autoViews > 0 ? autoViews : undefined,
        likes: autoLikes > 0 ? autoLikes : undefined,
        comments: autoComments > 0 ? autoComments : undefined,
        capturedAt: new Date(),
      },
      create: {
        creatorId: creator.id,
        platform,
        externalId,
        url: normalizedUrl,
        title: autoTitle,
        views: autoViews,
        likes: autoLikes,
        comments: autoComments,
        publishedAt: new Date(),
        capturedAt: new Date(),
      },
    });

    // 5. Recalculate creator scores
    const settingsRows = await prisma.setting.findMany();
    const settingsMap = new Map(settingsRows.map((s) => [s.key, s.value]));

    const settings: ScoringSettings = {
      windowDays: parseInt(settingsMap.get("window_days") || "14", 10),
      minPostsForSlope: parseInt(settingsMap.get("min_posts_for_slope") || "3", 10),
      slopeSampleSize: parseInt(settingsMap.get("slope_sample_size") || "5", 10),
      breakoutThreshold: parseFloat(settingsMap.get("breakout_threshold") || "3.0"),
      breakoutHousePoints: parseFloat(settingsMap.get("breakout_house_points") || "25"),
      consistencyHouseWeight: parseFloat(settingsMap.get("consistency_house_weight") || "0.5"),
      momentumHouseWeight: parseFloat(settingsMap.get("momentum_house_weight") || "10.0"),
    };

    const allCreatorPosts = await prisma.postSnapshot.findMany({
      where: { creatorId: creator.id },
      orderBy: { publishedAt: "asc" },
    });

    const rawPosts: RawPost[] = allCreatorPosts.map((p) => ({
      id: p.id,
      creatorId: p.creatorId,
      platform: p.platform,
      externalId: p.externalId,
      url: p.url,
      title: p.title,
      views: p.views,
      likes: p.likes,
      comments: p.comments,
      publishedAt: p.publishedAt,
    }));

    const score = calculateCreatorScore(rawPosts, creator.targetCadence, settings);

    await prisma.metricSnapshot.create({
      data: {
        creatorId: creator.id,
        consistencyScore: score.consistencyScore,
        viewVelocitySlope: score.viewVelocitySlope,
        rollingMedianViews: score.rollingMedianViews,
        breakoutRatio: score.breakoutRatio,
        engagementDensity: score.engagementDensity,
        postsInWindow: score.postsInWindow,
        pointsTotal: score.pointsTotal,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Matched to ${creator.name} (${creator.houseName})! Reel indexed successfully.`,
      creatorName: creator.name,
      creatorHouse: creator.houseName,
      views: autoViews,
      post,
    });
  } catch (error: any) {
    console.error("Error submitting reel link:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
