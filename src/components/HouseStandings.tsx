"use client";

import React from "react";
import { Shield, Target, Award, Users, TrendingUp } from "lucide-react";

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

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
              Cohort Team Dynamics
            </p>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium tracking-tight">
            The House <span className="italic font-normal font-serif text-neutral-300">Cup</span>
          </h2>
        </div>
        <p className="text-xs text-neutral-500 max-w-sm">
          Scored by collective member discipline + median momentum slope + team breakout bonuses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {houses.map((house) => {
          const isLeader = house.rank === 1;

          return (
            <div
              key={house.houseName}
              className={`genc-card genc-card-hover p-6 flex flex-col justify-between relative overflow-hidden ${
                isLeader ? "border-amber-400/30 bg-gradient-to-b from-neutral-900 to-[#141414]" : ""
              }`}
            >
              {isLeader && (
                <div className="absolute top-0 right-0 bg-amber-400 text-black font-mono font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-md">
                  ★ Leading
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                      #{house.rank}
                    </span>
                    <h3 className="font-serif text-xl font-medium text-white tracking-tight">
                      {house.houseName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                    <Users className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{house.memberCount} members</span>
                  </div>
                </div>

                <div className="my-5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-4xl sm:text-5xl font-extralight text-white tracking-tight">
                      {house.totalPoints}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                      pts
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 text-center">
                <div className="bg-white/[0.03] rounded-xl p-2.5">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">
                    Discipline
                  </span>
                  <span className="font-mono text-xs font-semibold text-white">
                    {house.disciplineScore}%
                  </span>
                </div>

                <div className="bg-white/[0.03] rounded-xl p-2.5">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">
                    Momentum
                  </span>
                  <span className="font-mono text-xs font-semibold text-white">
                    {house.momentumSlope > 0 ? `+${house.momentumSlope}` : house.momentumSlope}
                  </span>
                </div>

                <div className="bg-white/[0.03] rounded-xl p-2.5">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">
                    Breakouts
                  </span>
                  <span className="font-mono text-xs font-semibold text-white">
                    {house.breakoutCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
