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

    // Get breakouts
    const breakouts = await prisma.postSnapshot.findMany({
      where: {
        views: { gt: 100 },
      },
      orderBy: { views: "desc" },
      take: 8,
      include: {
        creator: {
          select: { name: true, houseName: true, instagramHandle: true },
        },
      },
    });

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
