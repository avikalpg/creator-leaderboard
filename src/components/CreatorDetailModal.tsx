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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-mono font-bold text-white text-sm">
              {creator.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-serif text-2xl font-medium text-white">{creator.name}</h3>
                <span className="font-mono text-[11px] font-bold text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded-full">
                  Rank #{creator.rank}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-1">
                <span className="text-neutral-300 font-medium">{creator.houseName}</span>
                <span>•</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  {creator.targetCadence} Target
                </span>
                {creator.followersCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{creator.followersCount.toLocaleString()} followers</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs">
                {creator.instagramHandle && (
                  <a
                    href={`https://www.instagram.com/${creator.instagramHandle}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span>@{creator.instagramHandle}</span>
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                  </a>
                )}
                {creator.youtubeHandle && (
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    <span>{creator.youtubeHandle}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {creator.bio && (
            <p className="text-xs text-neutral-300 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5 leading-relaxed">
              {creator.bio}
            </p>
          )}

          {/* Metric Breakdown Cards */}
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
              Cohort Metric Analysis
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5">
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mb-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Consistency</span>
                </div>
                <div className="font-mono text-xl font-light text-white">
                  {creator.score.consistencyScore}%
                </div>
                <div className="font-mono text-[10px] text-neutral-500 mt-1">
                  {creator.score.postsInWindow} posts in window
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5">
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mb-1">
                  {isPositiveSlope ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                  <span>View Slope</span>
                </div>
                <div
                  className={`font-mono text-xl font-light ${
                    isPositiveSlope ? "text-emerald-400" : "text-neutral-400"
                  }`}
                >
                  {creator.score.viewVelocitySlope > 0 ? "+" : ""}
                  {creator.score.viewVelocitySlope}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 mt-1">
                  Regression slope (last 5)
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5">
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Outlier Ratio</span>
                </div>
                <div className="font-mono text-xl font-light text-amber-300">
                  {creator.score.breakoutRatio}x
                </div>
                <div className="font-mono text-[10px] text-neutral-500 mt-1">
                  Median: {creator.score.rollingMedianViews} views
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5">
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mb-1">
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>Points</span>
                </div>
                <div className="font-mono text-xl font-light text-white">
                  {creator.score.pointsTotal}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 mt-1">
                  Discipline + Velocity
                </div>
              </div>
            </div>
          </div>

          {/* Recent Video History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                Recent Tracked Videos / Reels
              </span>
              <span className="font-mono text-[11px] text-neutral-500">
                {creator.recentPosts.length} posts
              </span>
            </div>

            <div className="space-y-2">
              {creator.recentPosts.map((post) => {
                const isYouTube =
                  post.platform === "YOUTUBE" ||
                  (post.url && (post.url.includes("youtube.com") || post.url.includes("youtu.be")));

                return (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-400 shrink-0">
                        {isYouTube ? (
                          <Youtube className="w-4 h-4 text-red-500" />
                        ) : (
                          <Instagram className="w-4 h-4 text-pink-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-sm text-white">
                            {post.views.toLocaleString()} views
                          </span>
                          <span
                            className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              isYouTube
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                            }`}
                          >
                            {isYouTube ? "YouTube" : "Instagram"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          {post.title && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[200px] sm:max-w-xs text-neutral-400">
                                {post.title}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-white hover:text-neutral-300 font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors shrink-0"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
