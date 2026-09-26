export interface RawPost {
  id: string;
  creatorId: string;
  platform: string;
  externalId: string;
  url: string;
  title?: string | null;
  views: number;
  likes: number;
  comments: number;
  publishedAt: Date;
}

export interface ScoringSettings {
  windowDays: number;
  minPostsForSlope: number;
  slopeSampleSize: number;
  breakoutThreshold: number;
  breakoutHousePoints: number;
  consistencyHouseWeight: number;
  momentumHouseWeight: number;
}

export const DEFAULT_SETTINGS: ScoringSettings = {
  windowDays: 14,
  minPostsForSlope: 3,
  slopeSampleSize: 5,
  breakoutThreshold: 3.0,
  breakoutHousePoints: 25,
  consistencyHouseWeight: 0.5,
  momentumHouseWeight: 10.0,
};

export interface CreatorScoreResult {
  consistencyScore: number;
  viewVelocitySlope: number;
  rollingMedianViews: number;
  breakoutRatio: number;
  isBreakout: boolean;
  engagementDensity: number;
  postsInWindow: number;
  pointsTotal: number;
  badges: string[];
}

function computeOLS(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const x = Array.from({ length: n }, (_, i) => i);
  const xBar = (n - 1) / 2;
  const yBar = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - xBar) * (values[i] - yBar);
    den += Math.pow(x[i] - xBar, 2);
  }
  return den === 0 ? 0 : Number((num / den).toFixed(3));
}

export function calculateCreatorScore(
  rawPosts: RawPost[],
  targetCadence: string,
  settings: ScoringSettings = DEFAULT_SETTINGS,
  platformFilter: "ALL" | "INSTAGRAM" | "YOUTUBE" = "ALL"
): CreatorScoreResult {
  const now = new Date().getTime();
  const windowMs = settings.windowDays * 24 * 60 * 60 * 1000;
  const baselineMs = 30 * 24 * 60 * 60 * 1000;

  // Filter by platform if requested
  const posts =
    platformFilter === "ALL"
      ? rawPosts
      : rawPosts.filter((p) => p.platform === platformFilter);

  // 1. Filter posts in window and baseline
  const recentPosts = posts
    .filter((p) => now - new Date(p.publishedAt).getTime() <= windowMs)
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

  const baselinePosts = posts.filter(
    (p) => now - new Date(p.publishedAt).getTime() <= baselineMs
  );

  const postsToMedian = baselinePosts.length > 0 ? baselinePosts : posts;
  const sortedViews = postsToMedian.map((p) => p.views).sort((a, b) => a - b);

  let rollingMedianViews = 100;
  if (sortedViews.length > 0) {
    const mid = Math.floor(sortedViews.length / 2);
    rollingMedianViews =
      sortedViews.length % 2 === 0
        ? (sortedViews[mid - 1] + sortedViews[mid]) / 2
        : sortedViews[mid];
  }
  rollingMedianViews = Math.max(50, rollingMedianViews);

  // 2. Consistency & Regularity (Deduplicating same-day cross-posts)
  const cadenceTargets: Record<string, number> = {
    DAILY: 7,
    ALTERNATE: 3.5,
    BIWEEKLY: 2,
    WEEKLY: 1,
  };
  const weeklyTarget = cadenceTargets[targetCadence.toUpperCase()] || 3.5;
  const expectedPosts = (weeklyTarget * settings.windowDays) / 7;

  // Group same-day posts across platforms so 1 video posted on IG + YT = 1 creative output day
  const uniqueOutputDays = new Set(
    recentPosts.map((p) => new Date(p.publishedAt).toISOString().split("T")[0])
  );
  const effectivePostsCount = uniqueOutputDays.size;
  const executionRatio = Math.min(1.0, effectivePostsCount / Math.max(1, expectedPosts));

  let regularityMultiplier = 0.5;
  if (recentPosts.length >= 2) {
    const intervals: number[] = [];
    for (let i = 1; i < recentPosts.length; i++) {
      const diffDays =
        (new Date(recentPosts[i].publishedAt).getTime() -
          new Date(recentPosts[i - 1].publishedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      intervals.push(diffDays);
    }
    const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((acc, val) => acc + Math.pow(val - meanInterval, 2), 0) /
      intervals.length;
    const stdDev = Math.sqrt(variance);
    regularityMultiplier = 1 / (1 + stdDev * 0.4);
  } else if (recentPosts.length === 1) {
    regularityMultiplier = 0.7;
  } else {
    regularityMultiplier = 0.0;
  }

  const consistencyScore = Math.min(
    100,
    Math.round(100 * executionRatio * regularityMultiplier)
  );

  // 3. View Velocity Slope (Platform-Aware Linear Regression)
  let viewVelocitySlope = 0;

  if (platformFilter !== "ALL") {
    // Pure platform slope
    const sample = [...posts]
      .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
      .slice(-settings.slopeSampleSize);

    if (sample.length >= settings.minPostsForSlope) {
      viewVelocitySlope = computeOLS(sample.map((p) => p.views / rollingMedianViews));
    }
  } else {
    // Combined mode: evaluate IG and YT independently so algorithms don't pollute each other
    const igPosts = posts.filter((p) => p.platform === "INSTAGRAM");
    const ytPosts = posts.filter((p) => p.platform === "YOUTUBE");

    const sampleIg = igPosts
      .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
      .slice(-settings.slopeSampleSize);

    const sampleYt = ytPosts
      .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
      .slice(-settings.slopeSampleSize);

    const igMedian =
      igPosts.length > 0
        ? Math.max(50, [...igPosts].map((p) => p.views).sort((a, b) => a - b)[Math.floor(igPosts.length / 2)] || 100)
        : rollingMedianViews;

    const ytMedian =
      ytPosts.length > 0
        ? Math.max(50, [...ytPosts].map((p) => p.views).sort((a, b) => a - b)[Math.floor(ytPosts.length / 2)] || 100)
        : rollingMedianViews;

    const slopeIg = sampleIg.length >= settings.minPostsForSlope ? computeOLS(sampleIg.map((p) => p.views / igMedian)) : null;
    const slopeYt = sampleYt.length >= settings.minPostsForSlope ? computeOLS(sampleYt.map((p) => p.views / ytMedian)) : null;

    if (slopeIg !== null && slopeYt !== null) {
      // Pick platform with higher sample volume, or higher absolute slope
      viewVelocitySlope = sampleIg.length >= sampleYt.length ? slopeIg : slopeYt;
    } else if (slopeIg !== null) {
      viewVelocitySlope = slopeIg;
    } else if (slopeYt !== null) {
      viewVelocitySlope = slopeYt;
    } else {
      viewVelocitySlope = 0;
    }
  }

  // 4. Outlier / Breakout Detection
  const maxRecentViews =
    recentPosts.length > 0
      ? Math.max(...recentPosts.map((p) => p.views))
      : posts.length > 0
      ? Math.max(...posts.map((p) => p.views))
      : 0;

  const breakoutRatio = Number((maxRecentViews / rollingMedianViews).toFixed(2));
  const isBreakout = breakoutRatio >= settings.breakoutThreshold;

  // 5. Engagement Density
  const totalViews = recentPosts.reduce((acc, p) => acc + p.views, 0);
  const totalInteractions = recentPosts.reduce(
    (acc, p) => acc + p.likes + p.comments * 2,
    0
  );
  const engagementDensity =
    totalViews > 0
      ? Number(((totalInteractions / totalViews) * 100).toFixed(2))
      : 0;

  // 6. Badges
  const badges: string[] = [];
  if (viewVelocitySlope >= 0.5) badges.push("FAST_MOVER");
  if (isBreakout) badges.push("BREAKOUT_OUTLIER");
  if (consistencyScore >= 80) badges.push("IRON_CREATOR");
  if (engagementDensity >= 8.0) badges.push("HIGH_RESONANCE");

  // 7. Aggregate individual points
  const pointsTotal = Number(
    (
      consistencyScore * 0.5 +
      Math.max(0, viewVelocitySlope) * 15 +
      (isBreakout ? 30 : 0) +
      engagementDensity * 2
    ).toFixed(1)
  );

  return {
    consistencyScore,
    viewVelocitySlope,
    rollingMedianViews,
    breakoutRatio,
    isBreakout,
    engagementDensity,
    postsInWindow: recentPosts.length,
    pointsTotal,
    badges,
  };
}

export interface HouseStanding {
  houseName: string;
  memberCount: number;
  totalPoints: number;
  disciplineScore: number;
  momentumSlope: number;
  breakoutCount: number;
  rank: number;
}

export const OFFICIAL_HOUSES = ["Kaelix", "Orvane", "Myrith", "Syvora"];

export function calculateHouseStandings(
  creatorsWithScores: Array<{
    houseName: string;
    score: CreatorScoreResult;
  }>,
  settings: ScoringSettings = DEFAULT_SETTINGS
): HouseStanding[] {
  const groups: Record<
    string,
    Array<{
      score: CreatorScoreResult;
    }>
  > = {};

  for (const h of OFFICIAL_HOUSES) {
    groups[h] = [];
  }

  for (const c of creatorsWithScores) {
    if (c.houseName && c.houseName !== "Unassigned") {
      if (!groups[c.houseName]) groups[c.houseName] = [];
      groups[c.houseName].push(c);
    }
  }

  const result: HouseStanding[] = [];

  for (const [houseName, members] of Object.entries(groups)) {
    const memberCount = members.length;
    if (memberCount === 0) {
      result.push({
        houseName,
        memberCount: 0,
        totalPoints: 0,
        disciplineScore: 0,
        momentumSlope: 0,
        breakoutCount: 0,
        rank: 0,
      });
      continue;
    }

    const avgDiscipline =
      members.reduce((sum, m) => sum + m.score.consistencyScore, 0) / memberCount;

    const slopes = members.map((m) => m.score.viewVelocitySlope).sort((a, b) => a - b);
    const mid = Math.floor(slopes.length / 2);
    const medianSlope =
      slopes.length % 2 === 0
        ? (slopes[mid - 1] + slopes[mid]) / 2
        : slopes[mid];

    const breakoutCount = members.filter((m) => m.score.isBreakout).length;

    const totalPoints = Number(
      (
        avgDiscipline * settings.consistencyHouseWeight +
        Math.max(0, medianSlope) * settings.momentumHouseWeight +
        breakoutCount * settings.breakoutHousePoints
      ).toFixed(1)
    );

    result.push({
      houseName,
      memberCount,
      totalPoints,
      disciplineScore: Number(avgDiscipline.toFixed(1)),
      momentumSlope: Number(medianSlope.toFixed(2)),
      breakoutCount,
      rank: 0,
    });
  }

  result.sort((a, b) => b.totalPoints - a.totalPoints);
  result.forEach((h, idx) => {
    h.rank = idx + 1;
  });

  return result;
}
