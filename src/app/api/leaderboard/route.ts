import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateCreatorScore,
  calculateHouseStandings,
  DEFAULT_SETTINGS,
  ScoringSettings,
  RawPost,
} from "@/lib/scoring";

export const dynamic = "force-dynamic";

function generatePlatformView(
  creators: any[],
  settings: ScoringSettings,
  filter: "ALL" | "INSTAGRAM" | "YOUTUBE"
) {
  const scoredCreators = creators
    .map((creator) => {
      const creatorPosts =
        filter === "ALL"
          ? creator.posts
          : creator.posts.filter((p: any) => p.platform === filter);

      const hasPlatformPresence =
        filter === "ALL" ||
        (filter === "INSTAGRAM" && creator.instagramHandle) ||
        (filter === "YOUTUBE" && (creator.youtubeHandle || creator.youtubeChannelId));

      if (!hasPlatformPresence && creatorPosts.length === 0) {
        return null;
      }

      const rawPosts: RawPost[] = creatorPosts.map((p: any) => ({
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

      const score = calculateCreatorScore(rawPosts, creator.targetCadence, settings, filter);

      return {
        id: creator.id,
        name: creator.name,
        houseName: creator.houseName,
        instagramHandle: creator.instagramHandle,
        youtubeHandle: creator.youtubeHandle,
        targetCadence: creator.targetCadence,
        followersCount: creator.followersCount,
        bio: creator.bio,
        recentPosts: creatorPosts.slice(0, 8),
        score,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  scoredCreators.sort((a, b) => b.score.pointsTotal - a.score.pointsTotal);
  const rankedCreators = scoredCreators.map((c, idx) => ({
    ...c,
    rank: idx + 1,
  }));

  const houses = calculateHouseStandings(
    scoredCreators.map((c) => ({
      houseName: c.houseName,
      score: c.score,
    })),
    settings
  );

  const creatorBreakouts: any[] = [];
  for (const c of creators) {
    const postsForOutliers =
      filter === "ALL" ? c.posts : c.posts.filter((p: any) => p.platform === filter);

    if (!postsForOutliers || postsForOutliers.length === 0) continue;
    const sortedViews = postsForOutliers.map((p: any) => p.views).sort((a: number, b: number) => a - b);
    const mid = Math.floor(sortedViews.length / 2);
    const median = Math.max(50, sortedViews[mid] || 100);

    let bestPost = postsForOutliers[0];
    let bestRatio = bestPost.views / median;

    for (const p of postsForOutliers) {
      const r = p.views / median;
      if (r > bestRatio) {
        bestRatio = r;
        bestPost = p;
      }
    }

    if (bestRatio >= 2.0 && bestPost.views >= 100) {
      creatorBreakouts.push({
        id: bestPost.id,
        url: bestPost.url,
        views: bestPost.views,
        likes: bestPost.likes,
        comments: bestPost.comments,
        title: bestPost.title,
        platform: bestPost.platform,
        ratio: Number(bestRatio.toFixed(1)),
        medianViews: median,
        creator: {
          name: c.name,
          houseName: c.houseName,
          instagramHandle: c.instagramHandle,
        },
      });
    }
  }

  creatorBreakouts.sort((a, b) => b.ratio - a.ratio);

  return {
    creators: rankedCreators,
    houses,
    breakouts: creatorBreakouts.slice(0, 8),
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const platformParam = (searchParams.get("platform") || "all").toUpperCase();
    const platformFilter: "ALL" | "INSTAGRAM" | "YOUTUBE" =
      platformParam === "INSTAGRAM" || platformParam === "YOUTUBE" ? platformParam : "ALL";

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

    const creators = await prisma.creator.findMany({
      include: {
        posts: {
          orderBy: { publishedAt: "desc" },
          take: 20,
        },
      },
    });

    const lastSync = await prisma.syncLog.findFirst({
      orderBy: { startedAt: "desc" },
    });

    // Precompute all 3 platform views in a single database pass
    const platforms = {
      ALL: generatePlatformView(creators, settings, "ALL"),
      INSTAGRAM: generatePlatformView(creators, settings, "INSTAGRAM"),
      YOUTUBE: generatePlatformView(creators, settings, "YOUTUBE"),
    };

    const current = platforms[platformFilter] || platforms.ALL;

    return NextResponse.json({
      platforms,
      creators: current.creators,
      houses: current.houses,
      breakouts: current.breakouts,
      settings,
      lastSync,
    });
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
