import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateCreatorScore,
  DEFAULT_SETTINGS,
  ScoringSettings,
  RawPost,
} from "@/lib/scoring";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, creatorId, estimatedViews } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A valid video/reel URL is required." }, { status: 400 });
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
        { error: "Could not recognize format. Please provide a valid Instagram Reel or YouTube Short URL." },
        { status: 400 }
      );
    }

    // 2. Identify the creator
    let creator = null;
    if (creatorId) {
      creator = await prisma.creator.findUnique({ where: { id: creatorId } });
    }

    if (!creator) {
      return NextResponse.json(
        { error: "Please select which cohort creator this video belongs to." },
        { status: 400 }
      );
    }

    // 3. Initial views (defaults to 50 if not specified, will be auto-refreshed by background daemon)
    const initialViews = typeof estimatedViews === "number" && estimatedViews > 0 ? estimatedViews : 50;

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
        capturedAt: new Date(),
      },
      create: {
        creatorId: creator.id,
        platform,
        externalId,
        url: normalizedUrl,
        views: initialViews,
        likes: Math.round(initialViews * 0.05),
        comments: Math.round(initialViews * 0.005),
        publishedAt: new Date(),
        capturedAt: new Date(),
      },
    });

    // 5. Load settings & recalculate creator score immediately
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
      message: `Reel linked to ${creator.name} and indexed. It will be tracked continuously!`,
      post,
      score,
      creatorName: creator.name,
    });
  } catch (error: any) {
    console.error("Error submitting reel link:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
