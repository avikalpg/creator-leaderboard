"use client";

import React from "react";
import { ExternalLink, Sparkles, Info } from "lucide-react";

interface BreakoutPost {
  id: string;
  url: string;
  views: number;
  likes: number;
  comments: number;
  title?: string | null;
  ratio?: number;
  medianViews?: number;
  creator: {
    name: string;
    houseName: string;
    instagramHandle?: string | null;
  };
}

interface BreakoutAlertBannerProps {
  breakouts: BreakoutPost[];
  onOpenHowItWorks?: (sectionId: string) => void;
}

export function BreakoutAlertBanner({ breakouts, onOpenHowItWorks }: BreakoutAlertBannerProps) {
  if (!breakouts || breakouts.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
              Breakout Hall of Fame
            </p>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium tracking-tight">
              Study-Worthy <span className="italic font-normal font-serif text-neutral-300">Outliers</span>
            </h2>
            {onOpenHowItWorks && (
              <button
                onClick={() => onOpenHowItWorks("outlier-ratio")}
                title="How Outliers are calculated"
                className="text-neutral-500 hover:text-white transition-colors p-1"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-neutral-500 max-w-sm">
          Top breakthrough post per creator, ranked by multiplier over their personal median baseline.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {breakouts.slice(0, 4).map((post) => (
          <div
            key={post.id}
            className="genc-card genc-card-hover p-4 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  {post.ratio ? `${post.ratio}x Outlier` : "Breakout"}
                </span>

                <div className="text-right">
                  <span className="font-mono text-base font-bold text-white">
                    {post.views >= 1000
                      ? `${(post.views / 1000).toFixed(1)}k`
                      : post.views}{" "}
                    <span className="text-[10px] text-neutral-500 uppercase font-sans font-normal">views</span>
                  </span>
                  {post.medianViews && (
                    <div className="font-mono text-[10px] text-neutral-500">
                      median: {post.medianViews >= 1000 ? `${(post.medianViews / 1000).toFixed(1)}k` : post.medianViews}
                    </div>
                  )}
                </div>
              </div>

              <h4 className="font-semibold text-white text-sm group-hover:text-amber-200 transition-colors line-clamp-1">
                {post.creator.name}
              </h4>
              <p className="font-mono text-[11px] text-neutral-400 mt-0.5">
                {post.creator.houseName} • @{post.creator.instagramHandle}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="truncate max-w-[170px] text-neutral-500 text-[11px]">
                {post.title ? `"${post.title}"` : "Reel"}
              </span>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-neutral-300 hover:text-white transition-colors font-medium text-xs bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full border border-white/10"
              >
                <span>Study</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
