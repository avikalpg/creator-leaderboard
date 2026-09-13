"use client";

import React from "react";
import { Shield, Flame, Target, Award, Users } from "lucide-react";

export interface HouseData {
  houseName: string;
  memberCount: number;
  totalPoints: number;
  disciplineScore: number;
  momentumSlope: number;
  breakoutCount: number;
  rank: number;
}

interface HouseStandingsProps {
  houses: HouseData[];
}

export function HouseStandings({ houses }: HouseStandingsProps) {
  if (!houses || houses.length === 0) return null;

  const houseColorMap: Record<string, { border: string; bg: string; text: string }> = {
    "House Matrix": {
      border: "border-emerald-500/30",
      bg: "from-emerald-950/20 to-gray-900/40",
      text: "text-emerald-400",
    },
    "House Phoenix": {
      border: "border-rose-500/30",
      bg: "from-rose-950/20 to-gray-900/40",
      text: "text-rose-400",
    },
    "House Titan": {
      border: "border-indigo-500/30",
      bg: "from-indigo-950/20 to-gray-900/40",
      text: "text-indigo-400",
    },
    "House Orion": {
      border: "border-cyan-500/30",
      bg: "from-cyan-950/20 to-gray-900/40",
      text: "text-cyan-400",
    },
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">The House Cup Standings</h2>
        </div>
        <p className="text-xs text-gray-400">
          Ranked by aggregate consistency + median view momentum + breakout bonuses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {houses.map((house) => {
          const colors = houseColorMap[house.houseName] || {
            border: "border-gray-800",
            bg: "from-gray-900 to-gray-950",
            text: "text-gray-300",
          };

          const isLeader = house.rank === 1;

          return (
            <div
              key={house.houseName}
              className={`relative rounded-2xl border ${colors.border} bg-gradient-to-b ${colors.bg} p-5 backdrop-blur-md transition-all hover:-translate-y-1`}
            >
              {isLeader && (
                <div className="absolute -top-3 right-4 bg-amber-500 text-gray-950 font-bold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md shadow-amber-500/30">
                  <Award className="w-3 h-3" />
                  Leading House
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded">
                    #{house.rank}
                  </span>
                  <h3 className={`font-bold text-lg ${colors.text}`}>
                    {house.houseName}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{house.memberCount} members</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                    {house.totalPoints}
                  </span>
                  <span className="text-xs text-gray-400 uppercase font-semibold">pts</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-800/60 text-center">
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mb-0.5">
                    <Target className="w-3 h-3 text-emerald-400" />
                    <span>Discipline</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white">
                    {house.disciplineScore}%
                  </span>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mb-0.5">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>Momentum</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white">
                    {house.momentumSlope > 0 ? `+${house.momentumSlope}` : house.momentumSlope}
                  </span>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mb-0.5">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>Breakouts</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white">
                    {house.breakoutCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
