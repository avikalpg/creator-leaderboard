"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Instagram,
  Youtube,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Info,
} from "lucide-react";

export interface CreatorRowData {
  id: string;
  rank: number;
  name: string;
  houseName: string;
  instagramHandle?: string | null;
  youtubeHandle?: string | null;
  targetCadence: string;
  followersCount: number;
  bio?: string | null;
  recentPosts: Array<{
    id: string;
    views: number;
    url: string;
    publishedAt: string | Date;
  }>;
  score: {
    consistencyScore: number;
    viewVelocitySlope: number;
    rollingMedianViews: number;
    breakoutRatio: number;
    isBreakout: boolean;
    engagementDensity: number;
    postsInWindow: number;
    pointsTotal: number;
    badges: string[];
  };
}

interface CreatorTableProps {
  creators: CreatorRowData[];
  onSelectCreator: (creator: CreatorRowData) => void;
  onOpenHowItWorks?: (sectionId: string) => void;
}

export function CreatorTable({ creators, onSelectCreator, onOpenHowItWorks }: CreatorTableProps) {
  const [search, setSearch] = useState("");
  const [houseFilter, setHouseFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<
    "points" | "slope" | "consistency" | "breakout" | "followers"
  >("points");

  const houses = Array.from(new Set(creators.map((c) => c.houseName)));

  // Filter
  const filtered = creators.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.instagramHandle && c.instagramHandle.toLowerCase().includes(search.toLowerCase())) ||
      (c.youtubeHandle && c.youtubeHandle.toLowerCase().includes(search.toLowerCase()));

    const matchesHouse = houseFilter === "ALL" || c.houseName === houseFilter;
    return matchesSearch && matchesHouse;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "points") return b.score.pointsTotal - a.score.pointsTotal;
    if (sortBy === "slope") return b.score.viewVelocitySlope - a.score.viewVelocitySlope;
    if (sortBy === "consistency") return b.score.consistencyScore - a.score.consistencyScore;
    if (sortBy === "breakout") return b.score.breakoutRatio - a.score.breakoutRatio;
    if (sortBy === "followers") return b.followersCount - a.followersCount;
    return 0;
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-black font-mono font-bold text-xs shadow-sm">
          1
        </span>
      );
    if (rank === 2)
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-300 text-black font-mono font-bold text-xs shadow-sm">
          2
        </span>
      );
    if (rank === 3)
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-mono font-bold text-xs shadow-sm">
          3
        </span>
      );
    return (
      <span className="font-mono text-xs font-medium text-neutral-500">
        #{rank}
      </span>
    );
  };

  return (
    <div className="genc-card overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search creator or handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900/80 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 bg-neutral-900/80 border border-white/10 rounded-full px-3 py-2 text-xs text-neutral-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={houseFilter}
              onChange={(e) => setHouseFilter(e.target.value)}
              className="bg-transparent text-neutral-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-neutral-900">All Houses</option>
              {houses.map((h) => (
                <option key={h} value={h} className="bg-neutral-900">
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Pills */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 md:pb-0">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 mr-1">
            Sort:
          </span>
          {(
            [
              { key: "points", label: "Points" },
              { key: "slope", label: "Velocity" },
              { key: "consistency", label: "Consistency" },
              { key: "breakout", label: "Outliers" },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                sortBy === s.key
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-white/5 text-neutral-400 hover:text-white border border-white/5 hover:border-white/15"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-300">
          <thead className="bg-black/30 font-mono text-[10px] uppercase font-semibold text-neutral-500 tracking-widest border-b border-white/5">
            <tr>
              <th className="py-3.5 px-4 w-14 text-center">Rank</th>
              <th className="py-3.5 px-4">Creator</th>
              <th className="py-3.5 px-4">House</th>
              <th className="py-3.5 px-4">
                <div className="flex items-center gap-1">
                  <span>Cadence Discipline</span>
                  {onOpenHowItWorks && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenHowItWorks("cadence-discipline");
                      }}
                      title="Learn about Cadence Discipline formula"
                      className="text-neutral-500 hover:text-white transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>
              <th className="py-3.5 px-4">
                <div className="flex items-center gap-1">
                  <span>View Velocity (Slope)</span>
                  {onOpenHowItWorks && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenHowItWorks("view-velocity");
                      }}
                      title="Learn about View Velocity Slope formula"
                      className="text-neutral-500 hover:text-white transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>
              <th className="py-3.5 px-4">
                <div className="flex items-center gap-1">
                  <span>Outlier Ratio</span>
                  {onOpenHowItWorks && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenHowItWorks("outlier-ratio");
                      }}
                      title="Learn about Outlier Ratio formula"
                      className="text-neutral-500 hover:text-white transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>
              <th className="py-3.5 px-4">
                <div className="flex items-center gap-1">
                  <span>Engagement</span>
                  {onOpenHowItWorks && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenHowItWorks("engagement-density");
                      }}
                      title="Learn about Engagement Density formula"
                      className="text-neutral-500 hover:text-white transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>Points</span>
                  {onOpenHowItWorks && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenHowItWorks("points-total");
                      }}
                      title="Learn about Cohort Points formula"
                      className="text-neutral-500 hover:text-white transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>
              <th className="py-3.5 px-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((creator) => {
              const isPositiveSlope = creator.score.viewVelocitySlope > 0;

              return (
                <tr
                  key={creator.id}
                  onClick={() => onSelectCreator(creator)}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-4 text-center">
                    {getRankBadge(creator.rank)}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-mono font-semibold text-white text-xs">
                        {creator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white group-hover:text-neutral-200 transition-colors">
                            {creator.name}
                          </span>
                          {creator.score.badges.includes("BREAKOUT_OUTLIER") && (
                            <span
                              title="Breakout Reel detected! (>3x baseline)"
                              className="p-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20"
                            >
                              <Sparkles className="w-3 h-3" />
                            </span>
                          )}
                          {creator.score.badges.includes("FAST_MOVER") && (
                            <span
                              title="Accelerating View Velocity"
                              className="p-1 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20"
                            >
                              <Zap className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                          {creator.instagramHandle && (
                            <span className="flex items-center gap-1 hover:text-neutral-400">
                              <Instagram className="w-3 h-3 text-pink-400/80" />
                              @{creator.instagramHandle}
                            </span>
                          )}
                          {creator.youtubeHandle && (
                            <span className="flex items-center gap-1 hover:text-neutral-400">
                              <Youtube className="w-3 h-3 text-red-400/80" />
                              {creator.youtubeHandle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono text-neutral-300 bg-white/5 border border-white/5">
                      {creator.houseName}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-white text-xs">
                          {creator.score.consistencyScore}%
                        </span>
                        <span className="font-mono text-[10px] text-neutral-500 uppercase">
                          ({creator.targetCadence.toLowerCase()})
                        </span>
                      </div>
                      <div className="w-24 bg-neutral-900 rounded-full h-1 mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            creator.score.consistencyScore >= 80
                              ? "bg-white"
                              : creator.score.consistencyScore >= 50
                              ? "bg-amber-400"
                              : "bg-neutral-600"
                          }`}
                          style={{ width: `${creator.score.consistencyScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      {isPositiveSlope ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-neutral-500" />
                      )}
                      <span
                        className={`font-mono text-xs font-semibold ${
                          isPositiveSlope ? "text-emerald-400" : "text-neutral-400"
                        }`}
                      >
                        {creator.score.viewVelocitySlope > 0 ? "+" : ""}
                        {creator.score.viewVelocitySlope}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          creator.score.isBreakout ? "text-amber-300" : "text-neutral-400"
                        }`}
                      >
                        {creator.score.breakoutRatio}x
                      </span>
                      {creator.score.isBreakout && (
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                          Outlier
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-mono text-xs text-neutral-400">
                      {creator.score.engagementDensity}%
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <span className="font-mono text-base font-semibold text-white">
                      {creator.score.pointsTotal}
                    </span>
                  </td>

                  <td className="py-4 px-3 text-right">
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
