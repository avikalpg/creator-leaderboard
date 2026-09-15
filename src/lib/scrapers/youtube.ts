export interface ScrapedPost {
  platform: "YOUTUBE" | "INSTAGRAM";
  externalId: string;
  url: string;
  title?: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: Date;
}

export async function fetchYouTubeChannelVideos(
  channelIdOrHandle: string,
  apiKey?: string
): Promise<{ followers: number; posts: ScrapedPost[] }> {
  const key = apiKey || process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.warn("YouTube API key not found");
    return { followers: 0, posts: [] };
  }

  try {
    let resolvedChannelId = channelIdOrHandle;
    let followers = 0;

    // 1. Resolve handle using official YouTube forHandle endpoint
    if (channelIdOrHandle.startsWith("@") || !channelIdOrHandle.startsWith("UC")) {
      const handleClean = channelIdOrHandle.replace("@", "");
      const handleRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?forHandle=${encodeURIComponent(
          handleClean
        )}&part=snippet,statistics&key=${key}`
      );

      if (handleRes.ok) {
        const handleData = await handleRes.json();
        if (handleData.items && handleData.items.length > 0) {
          resolvedChannelId = handleData.items[0].id;
          followers = parseInt(handleData.items[0].statistics?.subscriberCount || "0", 10);
        }
      }

      // Fallback search if forHandle didn't resolve
      if (!resolvedChannelId.startsWith("UC")) {
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            handleClean
          )}&type=channel&maxResults=1&key=${key}`
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.items && searchData.items.length > 0) {
            resolvedChannelId = searchData.items[0].snippet.channelId;
          }
        }
      }
    }

    // 2. Fetch channel statistics if not already obtained
    if (followers === 0 && resolvedChannelId.startsWith("UC")) {
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${resolvedChannelId}&key=${key}`
      );
      if (channelRes.ok) {
        const channelData = await channelRes.json();
        if (channelData.items && channelData.items.length > 0) {
          followers = parseInt(channelData.items[0].statistics.subscriberCount || "0", 10);
        }
      }
    }

    // 3. Fetch latest videos for channel
    const searchVideosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id,snippet&channelId=${resolvedChannelId}&order=date&maxResults=15&type=video&key=${key}`
    );

    if (!searchVideosRes.ok) {
      console.warn(`YouTube search failed for ${resolvedChannelId}`);
      return { followers, posts: [] };
    }

    const searchVideosData = await searchVideosRes.json();
    const videoIds = (searchVideosData.items || [])
      .map((item: any) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return { followers, posts: [] };
    }

    // 4. Fetch full video statistics (views, likes, comments)
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(
        ","
      )}&key=${key}`
    );

    if (!statsRes.ok) {
      return { followers, posts: [] };
    }

    const statsData = await statsRes.json();
    const posts: ScrapedPost[] = (statsData.items || []).map((v: any) => {
      return {
        platform: "YOUTUBE" as const,
        externalId: v.id,
        url: `https://www.youtube.com/watch?v=${v.id}`,
        title: v.snippet.title,
        views: parseInt(v.statistics.viewCount || "0", 10),
        likes: parseInt(v.statistics.likeCount || "0", 10),
        comments: parseInt(v.statistics.commentCount || "0", 10),
        publishedAt: new Date(v.snippet.publishedAt),
      };
    });

    return { followers, posts };
  } catch (error) {
    console.error(`Error scraping YouTube channel ${channelIdOrHandle}:`, error);
    return { followers: 0, posts: [] };
  }
}
