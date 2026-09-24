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

export async function GET() {
  try {
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
          take: 15,
        },
      },
    });

    const scoredCreators = creators.map((creator) => {
      const rawPosts: RawPost[] = creator.posts.map((p) => ({
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

      return {
        id: creator.id,
        name: creator.name,
        houseName: creator.houseName,
        instagramHandle: creator.instagramHandle,
        youtubeHandle: creator.youtubeHandle,
        targetCadence: creator.targetCadence,
        followersCount: creator.followersCount,
        bio: creator.bio,
        recentPosts: creator.posts.slice(0, 5),
        score,
      };
    });

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

    // Get true personal baseline outliers (1 top breakout per creator, ranked by multiplier over median)
    const creatorBreakouts: Array<{
      id: string;
      url: string;
      views: number;
      likes: number;
      comments: number;
      title?: string | null;
      ratio: number;
      medianViews: number;
      creator: {
        name: string;
        houseName: string;
        instagramHandle?: string | null;
      };
    }> = [];

    for (const c of creators) {
      if (!c.posts || c.posts.length === 0) continue;
      const sortedViews = c.posts.map((p) => p.views).sort((a, b) => a - b);
      const mid = Math.floor(sortedViews.length / 2);
      const median = Math.max(50, sortedViews[mid] || 100);

      let bestPost = c.posts[0];
      let bestRatio = bestPost.views / median;

      for (const p of c.posts) {
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
    const breakouts = creatorBreakouts.slice(0, 8);

    const lastSync = await prisma.syncLog.findFirst({
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({
      creators: rankedCreators,
      houses,
      breakouts,
      settings,
      lastSync,
    });
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
