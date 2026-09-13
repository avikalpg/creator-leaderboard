"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Target,
  Instagram,
  Youtube,
  Award,
  ChevronRight,
  Search,
  Filter,
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
}

export function CreatorTable({ creators, onSelectCreator }: CreatorTableProps) {
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
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 text-sm">
          🥇
        </span>
      );
    if (rank === 2)
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-400/20 text-gray-300 font-bold border border-gray-400/40 text-sm">
          🥈
        </span>
      );
    if (rank === 3)
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 font-bold border border-amber-700/40 text-sm">
          🥉
        </span>
      );
    return (
      <span className="font-mono text-xs font-semibold text-gray-400">
        #{rank}
      </span>
    );
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Controls Bar */}
      <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search creator or handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-gray-400">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={houseFilter}
              onChange={(e) => setHouseFilter(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-gray-900">All Houses</option>
              {houses.map((h) => (
                <option key={h} value={h} className="bg-gray-900">
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Pills */}
        <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 md:pb-0">
          <span className="text-gray-500 mr-1 text-[11px] uppercase font-semibold">Sort:</span>
          {(
            [
              { key: "points", label: "Points" },
              { key: "slope", label: "Velocity (Slope)" },
              { key: "consistency", label: "Consistency" },
              { key: "breakout", label: "Breakout" },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                sortBy === s.key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-950 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950/70 text-[11px] uppercase font-semibold text-gray-400 tracking-wider border-b border-gray-800">
            <tr>
              <th className="py-3.5 px-4 w-14 text-center">Rank</th>
              <th className="py-3.5 px-4">Creator</th>
              <th className="py-3.5 px-4">House</th>
              <th className="py-3.5 px-4">Cadence Discipline</th>
              <th className="py-3.5 px-4">View Velocity (Slope)</th>
              <th className="py-3.5 px-4">Outlier Ratio</th>
              <th className="py-3.5 px-4">Engagement</th>
              <th className="py-3.5 px-4 text-right">Cohort Points</th>
              <th className="py-3.5 px-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-sans">
            {sorted.map((creator) => {
              const isPositiveSlope = creator.score.viewVelocitySlope > 0;

              return (
                <tr
                  key={creator.id}
                  onClick={() => onSelectCreator(creator)}
                  className="hover:bg-gray-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-4 text-center">
                    {getRankBadge(creator.rank)}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                        {creator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                            {creator.name}
                          </span>
                          {creator.score.badges.includes("BREAKOUT_OUTLIER") && (
                            <span
                              title="Breakout Reel detected! (>3x median)"
                              className="p-0.5 rounded bg-amber-500/10 text-amber-400"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {creator.score.badges.includes("FAST_MOVER") && (
                            <span
                              title="Accelerating View Velocity"
                              className="p-0.5 rounded bg-emerald-500/10 text-emerald-400"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          {creator.instagramHandle && (
                            <span className="flex items-center gap-1 hover:text-gray-300">
                              <Instagram className="w-3 h-3 text-pink-500" />
                              @{creator.instagramHandle}
                            </span>
                          )}
                          {creator.youtubeHandle && (
                            <span className="flex items-center gap-1 hover:text-gray-300">
                              <Youtube className="w-3 h-3 text-red-500" />
                              {creator.youtubeHandle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                      {creator.houseName}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">
                          {creator.score.consistencyScore}%
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase">
                          ({creator.targetCadence.toLowerCase()})
                        </span>
                      </div>
                      <div className="w-24 bg-gray-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            creator.score.consistencyScore >= 80
                              ? "bg-emerald-500"
                              : creator.score.consistencyScore >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${creator.score.consistencyScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      {isPositiveSlope ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-gray-500" />
                      )}
                      <span
                        className={`font-mono font-bold text-xs ${
                          isPositiveSlope ? "text-emerald-400" : "text-gray-400"
                        }`}
                      >
                        {creator.score.viewVelocitySlope > 0 ? "+" : ""}
                        {creator.score.viewVelocitySlope}
                      </span>
                      <span className="text-[10px] text-gray-500">slope</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <span
                        className={`font-mono font-bold text-xs ${
                          creator.score.isBreakout ? "text-amber-400" : "text-gray-400"
                        }`}
                      >
                        {creator.score.breakoutRatio}x
                      </span>
                      {creator.score.isBreakout && (
                        <span className="text-[10px] uppercase font-semibold text-amber-500">
                          Outlier
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-mono text-xs text-gray-300">
                      {creator.score.engagementDensity}%
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <span className="font-mono font-extrabold text-base text-white">
                      {creator.score.pointsTotal}
                    </span>
                  </td>

                  <td className="py-4 px-3 text-right">
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
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
