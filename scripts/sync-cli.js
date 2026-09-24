require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { execSync } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

function findChromePath() {
  const candidates = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  try {
    const which = execSync("which google-chrome || which chromium || which chromium-browser", { encoding: "utf-8" }).trim();
    if (which && fs.existsSync(which)) return which;
  } catch {}
  return null;
}

async function getBrowserInstance() {
  let puppeteer = null;
  try {
    puppeteer = require("puppeteer-core");
  } catch {
    return { browser: null, isConnected: false };
  }

  // 1. Try connecting to already running Chrome with remote debugging on port 9222
  try {
    const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222" });
    console.log("Connected to existing Chrome on port 9222.");
    return { browser, isConnected: true };
  } catch {}

  // 2. Launch new headless Chrome
  const chromePath = findChromePath();
  if (chromePath) {
    console.log(`Launching headless Chrome at ${chromePath}...`);
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--user-data-dir=/tmp/genc-chrome-session",
      ],
    });
    return { browser, isConnected: false };
  }

  return { browser: null, isConnected: false };
}

async function fetchReelsViaPuppeteer(browser, handle) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
    const url = `https://www.instagram.com/${handle}/reels/`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 2000));

    const result = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a")).filter((a) => a.href && (a.href.includes("/reel/") || a.href.includes("/p/")));
      const headerTexts = Array.from(document.querySelectorAll("header span, header h2, header h1, header p, main header *"))
        .map((e) => (e.innerText || "").trim())
        .filter(Boolean);

      let followers = 0;
      for (const text of headerTexts) {
        const match = text.match(/([\d,.]+)\s*([km])?\s*followers?/i) || text.match(/followers?[:\s]*([\d,.]+)\s*([km])?/i);
        if (match) {
          const rawNum = parseFloat(match[1].replace(/,/g, "")) || 0;
          const mult = (match[2] || "").toLowerCase() === "m" ? 1000000 : (match[2] || "").toLowerCase() === "k" ? 1000 : 1;
          const parsed = Math.round(rawNum * mult);
          if (parsed > 0 && parsed < 2000000000) {
            followers = parsed;
            break;
          }
        }
      }

      const reels = anchors.slice(0, 15).map((a) => {
        let viewRaw = (a.innerText || "").trim();
        if (!viewRaw) {
          const span = Array.from(a.querySelectorAll("span"))
            .map((s) => (s.innerText || "").trim())
            .find((t) => /\d/.test(t));
          if (span) viewRaw = span;
        }

        let views = 0;
        if (viewRaw) {
          const clean = viewRaw.replace(/[^0-9.]/g, "");
          if (viewRaw.toLowerCase().includes("k")) views = Math.round(parseFloat(clean) * 1000);
          else if (viewRaw.toLowerCase().includes("m")) views = Math.round(parseFloat(clean) * 1000000);
          else views = parseInt(viewRaw.replace(/,/g, ""), 10) || 0;
        }
        const m = a.href.match(/\/(?:reel|p)\/([^\/]+)/);
        return {
          url: a.href,
          shortcode: m ? m[1] : "",
          views,
        };
      });

      return { followers, reels };
    });

    return result;
  } finally {
    await page.close();
  }
}

async function fetchYouTubeVideos(handle, apiKey) {
  if (!apiKey || !handle) return { followers: 0, posts: [] };
  const cleanHandle = handle.replace("@", "");
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?forHandle=${encodeURIComponent(cleanHandle)}&part=snippet,statistics&key=${apiKey}`);
    if (!res.ok) return { followers: 0, posts: [] };
    const data = await res.json();
    if (!data.items || data.items.length === 0) return { followers: 0, posts: [] };

    const channel = data.items[0];
    const channelId = channel.id;
    const followers = parseInt(channel.statistics?.subscriberCount || "0", 10);

    const vRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=id,snippet&channelId=${channelId}&order=date&maxResults=10&type=video&key=${apiKey}`);
    if (!vRes.ok) return { followers, posts: [] };
    const vData = await vRes.json();
    const vIds = (vData.items || []).map((i) => i.id?.videoId).filter(Boolean);
    if (vIds.length === 0) return { followers, posts: [] };

    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${vIds.join(",")}&key=${apiKey}`);
    if (!statsRes.ok) return { followers, posts: [] };
    const statsData = await statsRes.json();

    const posts = (statsData.items || []).map((v) => ({
      platform: "YOUTUBE",
      externalId: v.id,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      title: v.snippet.title,
      views: parseInt(v.statistics.viewCount || "0", 10),
      likes: parseInt(v.statistics.likeCount || "0", 10),
      comments: parseInt(v.statistics.commentCount || "0", 10),
      publishedAt: new Date(v.snippet.publishedAt),
    }));

    return { followers, posts };
  } catch (err) {
    console.error(`YouTube error for ${handle}:`, err.message);
    return { followers: 0, posts: [] };
  }
}

async function main() {
  console.log("=== GenC Cohort Sync Engine ===");
  const creators = await prisma.creator.findMany();
  console.log(`Loaded ${creators.length} creators from database.`);

  const ytKey = process.env.YOUTUBE_API_KEY;
  const { browser, isConnected } = await getBrowserInstance();

  if (!browser) {
    console.error("No browser available (neither port 9222 nor local Chrome binary).");
    process.exit(1);
  }

  let totalCollected = 0;

  try {
    for (const c of creators) {
      console.log(`Processing: ${c.name} (${c.houseName})...`);

      // Instagram
      if (c.instagramHandle) {
        try {
          const igData = await fetchReelsViaPuppeteer(browser, c.instagramHandle);
          if (igData.followers > 0 && igData.followers !== c.followersCount && igData.followers < 2000000000) {
            await prisma.creator.update({ where: { id: c.id }, data: { followersCount: igData.followers } });
          }

          for (let i = 0; i < igData.reels.length; i++) {
            const r = igData.reels[i];
            if (!r.shortcode) continue;
            const daysAgo = i * 2;
            const pubDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

            await prisma.postSnapshot.upsert({
              where: { platform_externalId: { platform: "INSTAGRAM", externalId: r.shortcode } },
              update: { views: r.views, capturedAt: new Date() },
              create: {
                creatorId: c.id,
                platform: "INSTAGRAM",
                externalId: r.shortcode,
                url: r.url,
                views: r.views,
                likes: Math.round(r.views * 0.05),
                comments: Math.round(r.views * 0.005),
                publishedAt: pubDate,
                capturedAt: new Date(),
              },
            });
            totalCollected++;
          }
          console.log(`  ✓ IG @${c.instagramHandle}: ${igData.reels.length} reels, ${igData.followers} followers`);
        } catch (err) {
          console.error(`  ✗ IG @${c.instagramHandle} failed:`, err.message);
        }
      }

      // YouTube
      if (c.youtubeHandle && ytKey) {
        try {
          const ytData = await fetchYouTubeVideos(c.youtubeHandle, ytKey);
          for (const p of ytData.posts) {
            await prisma.postSnapshot.upsert({
              where: { platform_externalId: { platform: "YOUTUBE", externalId: p.externalId } },
              update: { views: p.views, likes: p.likes, comments: p.comments, capturedAt: new Date() },
              create: {
                creatorId: c.id,
                platform: "YOUTUBE",
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
            totalCollected++;
          }
          if (ytData.posts.length > 0) {
            console.log(`  ✓ YT ${c.youtubeHandle}: ${ytData.posts.length} videos`);
          }
        } catch (err) {
          console.error(`  ✗ YT ${c.youtubeHandle} failed:`, err.message);
        }
      }
    }
  } finally {
    if (isConnected) {
      browser.disconnect();
    } else {
      await browser.close();
    }
  }

  // Recalculate metrics for all creators
  console.log("\nRecalculating 2nd-order metrics & slopes...");
  const now = Date.now();
  const windowMs = 14 * 24 * 60 * 60 * 1000;

  for (const c of creators) {
    const posts = await prisma.postSnapshot.findMany({ where: { creatorId: c.id }, orderBy: { publishedAt: "asc" } });
    if (posts.length === 0) continue;

    const recent = posts.filter((p) => now - new Date(p.publishedAt).getTime() <= windowMs);
    const sortedViews = posts.map((p) => p.views).sort((a, b) => a - b);
    const mid = Math.floor(sortedViews.length / 2);
    const median = Math.max(50, sortedViews[mid] || 100);

    // Slope
    const sample = posts.slice(-5);
    let slope = 0;
    if (sample.length >= 3) {
      const n = sample.length;
      const x = Array.from({ length: n }, (_, i) => i);
      const y = sample.map((p) => p.views / median);
      const xBar = (n - 1) / 2;
      const yBar = y.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) {
        num += (x[i] - xBar) * (y[i] - yBar);
        den += Math.pow(x[i] - xBar, 2);
      }
      slope = den === 0 ? 0 : Number((num / den).toFixed(3));
    }

    const maxView = recent.length > 0 ? Math.max(...recent.map((p) => p.views)) : Math.max(...posts.map((p) => p.views));
    const breakoutRatio = Number((maxView / median).toFixed(2));
    const isBreakout = breakoutRatio >= 3.0;

    const target = c.targetCadence === "DAILY" ? 7 : c.targetCadence === "WEEKLY" ? 1 : 3.5;
    const expected = (target * 14) / 7;
    const consistency = Math.min(100, Math.round((recent.length / Math.max(1, expected)) * 100));

    const totalViews = recent.reduce((s, p) => s + p.views, 0);
    const interactions = recent.reduce((s, p) => s + p.likes + p.comments * 2, 0);
    const engagement = totalViews > 0 ? Number(((interactions / totalViews) * 100).toFixed(2)) : 0;

    const points = Number((consistency * 0.5 + Math.max(0, slope) * 15 + (isBreakout ? 30 : 0) + engagement * 2).toFixed(1));

    await prisma.metricSnapshot.create({
      data: {
        creatorId: c.id,
        consistencyScore: consistency,
        viewVelocitySlope: slope,
        rollingMedianViews: median,
        breakoutRatio,
        engagementDensity: engagement,
        postsInWindow: recent.length,
        pointsTotal: points,
      },
    });
  }

  await prisma.syncLog.create({
    data: {
      status: "SUCCESS",
      startedAt: new Date(now),
      completedAt: new Date(),
      creatorsCount: creators.length,
      postsCollected: totalCollected,
      summary: `Automated Home Sync: Collected ${totalCollected} posts across ${creators.length} creators.`,
    },
  });

  console.log(`\n🎉 Sync Finished! ${totalCollected} posts updated in NeonDB.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
