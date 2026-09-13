import { prisma } from "./prisma";
import {
  calculateCreatorScore,
  calculateHouseStandings,
  DEFAULT_SETTINGS,
  ScoringSettings,
  RawPost,
} from "./scoring";
import { fetchInstagramViaApify } from "./scrapers/instagram-apify";
import { fetchInstagramViaLocalBrowser } from "./scrapers/instagram-local";
import { fetchYouTubeChannelVideos, ScrapedPost } from "./scrapers/youtube";
import { sendDiscordWebhook } from "./discord";

export async function runFullSync() {
  const syncLog = await prisma.syncLog.create({
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    // 1. Load settings
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

    // 2. Fetch all creators
    const creators = await prisma.creator.findMany();
    if (creators.length === 0) {
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "SUCCESS",
          completedAt: new Date(),
          summary: "No creators registered.",
        },
      });
      return { success: true, count: 0 };
    }

    // 3. Ingest Instagram
    const igHandles = creators
      .map((c) => c.instagramHandle)
      .filter((h): h is string => Boolean(h));

    let igResults = await fetchInstagramViaApify(igHandles);
    const hasApifyData = Object.keys(igResults).some(
      (k) => igResults[k].posts.length > 0
    );

    // Fallback to local browser if Apify returned no items
    if (!hasApifyData) {
      console.log("Falling back to local headless browser scraper...");
      igResults = {};
      for (const h of igHandles) {
        const localRes = await fetchInstagramViaLocalBrowser(h);
        igResults[h.toLowerCase()] = localRes;
      }
    }

    // 4. Ingest YouTube & Save Posts
    let totalPostsCollected = 0;

    for (const creator of creators) {
      const postsToUpsert: ScrapedPost[] = [];
      let maxFollowers = creator.followersCount;

      // Handle Instagram
      if (creator.instagramHandle) {
        const igData = igResults[creator.instagramHandle.toLowerCase()];
        if (igData) {
          if (igData.followers > maxFollowers) maxFollowers = igData.followers;
          postsToUpsert.push(...igData.posts);
        }
      }

      // Handle YouTube
      if (creator.youtubeChannelId || creator.youtubeHandle) {
        const ytTarget = creator.youtubeChannelId || creator.youtubeHandle!;
        const ytData = await fetchYouTubeChannelVideos(ytTarget);
        if (ytData.followers > maxFollowers) maxFollowers = ytData.followers;
        postsToUpsert.push(...ytData.posts);
      }

      // Upsert Posts
      for (const p of postsToUpsert) {
        await prisma.postSnapshot.upsert({
          where: {
            platform_externalId: {
              platform: p.platform,
              externalId: p.externalId,
            },
          },
          update: {
            views: p.views,
            likes: p.likes,
            comments: p.comments,
            title: p.title,
            capturedAt: new Date(),
          },
          create: {
            creatorId: creator.id,
            platform: p.platform,
            externalId: p.externalId,
            url: p.url,
            title: p.title,
            views: p.views,
            likes: p.likes,
            comments: p.comments,
            publishedAt: p.publishedAt,
            capturedAt: new Date(),
          },
        });
        totalPostsCollected++;
      }

      if (maxFollowers !== creator.followersCount) {
        await prisma.creator.update({
          where: { id: creator.id },
          data: { followersCount: maxFollowers },
        });
      }
    }

    // 5. Calculate Scores & Snapshots for each creator
    const scoredCreators: Array<{
      creator: (typeof creators)[0];
      score: ReturnType<typeof calculateCreatorScore>;
    }> = [];

    const newBreakouts: Array<{ creatorName: string; ratio: number; views: number }> = [];

    for (const creator of creators) {
      const allPosts = await prisma.postSnapshot.findMany({
        where: { creatorId: creator.id },
        orderBy: { publishedAt: "desc" },
      });

      const rawPosts: RawPost[] = allPosts.map((p) => ({
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

      if (score.isBreakout) {
        const topView = Math.max(...rawPosts.map((p) => p.views), 0);
        newBreakouts.push({
          creatorName: creator.name,
          ratio: score.breakoutRatio,
          views: topView,
        });
      }

      scoredCreators.push({ creator, score });
    }

    // 6. House Cup Calculation
    const houseStandings = calculateHouseStandings(
      scoredCreators.map((sc) => ({
        houseName: sc.creator.houseName,
        score: sc.score,
      })),
      settings
    );

    // 7. Update SyncLog
    const summary = `Synced ${creators.length} creators, ${totalPostsCollected} posts. Top House: ${
      houseStandings[0]?.houseName || "None"
    }`;

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "SUCCESS",
        completedAt: new Date(),
        creatorsCount: creators.length,
        postsCollected: totalPostsCollected,
        summary,
      },
    });

    // 8. Discord Webhook Push (if configured)
    if (process.env.DISCORD_WEBHOOK_URL) {
      scoredCreators.sort((a, b) => b.score.pointsTotal - a.score.pointsTotal);
      const top3 = scoredCreators.slice(0, 3);

      await sendDiscordWebhook(process.env.DISCORD_WEBHOOK_URL, {
        title: "🏆 GenC Cohort Leaderboard Update",
        description: `Automated sync completed for ${creators.length} creators across ${houseStandings.length} Houses.`,
        fields: [
          {
            name: "👑 Top Momentum Creators",
            value: top3
              .map(
                (c, idx) =>
                  `**#${idx + 1} ${c.creator.name}** (${c.creator.houseName})\n` +
                  `🔥 Slope: \`${c.score.viewVelocitySlope > 0 ? "+" : ""}${c.score.viewVelocitySlope}\` | 🎯 Consistency: \`${c.score.consistencyScore}%\` | Total Pts: \`${c.score.pointsTotal}\``
              )
              .join("\n\n"),
          },
          {
            name: "🏰 House Cup Standings",
            value: houseStandings
              .map(
                (h) =>
                  `**#${h.rank} ${h.houseName}** — \`${h.totalPoints} pts\` (${h.memberCount} creators, Avg Discipline: \`${h.disciplineScore}%\`)`
              )
              .join("\n"),
          },
          ...(newBreakouts.length > 0
            ? [
                {
                  name: "🚀 Recent Breakout Alerts",
                  value: newBreakouts
                    .map(
                      (b) =>
                        `⭐ **${b.creatorName}**: **${b.ratio}x** over baseline (${b.views.toLocaleString()} views)!`
                    )
                    .join("\n"),
                },
              ]
            : []),
        ],
      });
    }

    return {
      success: true,
      creatorsCount: creators.length,
      postsCollected: totalPostsCollected,
      houseStandings,
    };
  } catch (err: any) {
    console.error("Sync failed:", err);
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        summary: err.message || "Unknown error",
      },
    });
    throw err;
  }
}
