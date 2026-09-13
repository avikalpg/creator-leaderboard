"use client";

import React from "react";
import { Zap, ExternalLink, Sparkles } from "lucide-react";

interface BreakoutPost {
  id: string;
  url: string;
  views: number;
  likes: number;
  comments: number;
  title?: string | null;
  creator: {
    name: string;
    houseName: string;
    instagramHandle?: string | null;
  };
}

interface BreakoutAlertBannerProps {
  breakouts: BreakoutPost[];
  onSelectCreator?: (creatorName: string) => void;
}

export function BreakoutAlertBanner({ breakouts }: BreakoutAlertBannerProps) {
  if (!breakouts || breakouts.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
          Cohort Breakout Hall of Fame (Study-Worthy Reels)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {breakouts.slice(0, 4).map((post) => (
          <div
            key={post.id}
            className="group relative bg-gray-900/70 border border-amber-500/20 hover:border-amber-500/50 rounded-xl p-3.5 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Zap className="w-2.5 h-2.5" />
                  Viral Outlier
                </span>
                <p className="font-semibold text-white text-sm mt-1.5 truncate">
                  {post.creator.name}
                </p>
                <p className="text-xs text-gray-400">
                  {post.creator.houseName} • @{post.creator.instagramHandle}
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-amber-400 text-base">
                  {post.views >= 1000
                    ? `${(post.views / 1000).toFixed(1)}k`
                    : post.views}{" "}
                  <span className="text-[10px] text-gray-400 uppercase font-sans">views</span>
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
              <span className="truncate max-w-[170px] text-gray-300">
                {post.title ? `"${post.title}"` : "Reel"}
              </span>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Study</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
