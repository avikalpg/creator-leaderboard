"use client";

import React from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  Zap,
  Instagram,
  Youtube,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { CreatorRowData } from "./CreatorTable";

interface CreatorDetailModalProps {
  creator: CreatorRowData | null;
  onClose: () => void;
}

export function CreatorDetailModal({ creator, onClose }: CreatorDetailModalProps) {
  if (!creator) return null;

  const isPositiveSlope = creator.score.viewVelocitySlope > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-950 via-gray-900 to-indigo-950/30 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-600/30">
              {creator.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl text-white">{creator.name}</h3>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Rank #{creator.rank}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
                <span className="text-gray-300 font-medium">{creator.houseName}</span>
                <span>•</span>
                <span className="text-indigo-400 font-medium uppercase text-[10px]">
                  {creator.targetCadence} Target
                </span>
                {creator.followersCount > 0 && (
                  <>
                    <span>•</span>
                    <span>{creator.followersCount.toLocaleString()} followers</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs">
                {creator.instagramHandle && (
                  <a
                    href={`https://www.instagram.com/${creator.instagramHandle}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>@{creator.instagramHandle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {creator.youtubeHandle && (
                  <span className="flex items-center gap-1 text-red-400">
                    <Youtube className="w-3.5 h-3.5" />
                    <span>{creator.youtubeHandle}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Bio */}
          {creator.bio && (
            <p className="text-xs text-gray-300 bg-gray-950/60 p-3 rounded-xl border border-gray-800/80 leading-relaxed">
              {creator.bio}
            </p>
          )}

          {/* Metric Breakdown Cards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Cohort Metric Analysis
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Consistency</span>
                </div>
                <div className="font-mono text-lg font-bold text-white">
                  {creator.score.consistencyScore}%
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {creator.score.postsInWindow} posts in window
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1">
                  {isPositiveSlope ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>View Slope</span>
                </div>
                <div
                  className={`font-mono text-lg font-bold ${
                    isPositiveSlope ? "text-emerald-400" : "text-gray-400"
                  }`}
                >
                  {creator.score.viewVelocitySlope > 0 ? "+" : ""}
                  {creator.score.viewVelocitySlope}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Regression slope (last 5)
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Outlier Ratio</span>
                </div>
                <div className="font-mono text-lg font-bold text-amber-400">
                  {creator.score.breakoutRatio}x
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Baseline: {creator.score.rollingMedianViews} views
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Total Points</span>
                </div>
                <div className="font-mono text-lg font-bold text-indigo-400">
                  {creator.score.pointsTotal}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Discipline + Momentum
                </div>
              </div>
            </div>
          </div>

          {/* Recent Video / Reel History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Recent Tracked Videos / Reels
              </h4>
              <span className="text-[11px] text-gray-500">
                {creator.recentPosts.length} posts recorded
              </span>
            </div>

            {creator.recentPosts.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-500 bg-gray-950/40 rounded-xl border border-gray-850">
                No videos recorded yet. Run a sync from Admin Settings.
              </div>
            ) : (
              <div className="space-y-2">
                {creator.recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-950 border border-gray-800/80 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400">
                        <Instagram className="w-4 h-4 text-pink-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {post.views.toLocaleString()} views
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
