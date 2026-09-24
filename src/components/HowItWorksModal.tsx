"use client";

import React, { useEffect, useRef } from "react";
import { X, Target, TrendingUp, Sparkles, Zap, Shield, HelpCircle, ArrowRight } from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  activeSection?: string | null;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, activeSection, onClose }: HowItWorksModalProps) {
  const sectionRefs = {
    "cadence-discipline": useRef<HTMLDivElement>(null),
    "view-velocity": useRef<HTMLDivElement>(null),
    "outlier-ratio": useRef<HTMLDivElement>(null),
    "engagement-density": useRef<HTMLDivElement>(null),
    "points-total": useRef<HTMLDivElement>(null),
    "house-cup": useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    if (isOpen && activeSection && sectionRefs[activeSection as keyof typeof sectionRefs]?.current) {
      setTimeout(() => {
        sectionRefs[activeSection as keyof typeof sectionRefs].current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  }, [isOpen, activeSection]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-medium text-white tracking-tight">
                How It Works & <span className="italic font-normal text-neutral-400">Scoring Math</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Exact formulas leveling the playing field for all cohort creators
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Nav Bar */}
        <div className="px-6 py-3 bg-black/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest mr-1">Jump to:</span>
          {[
            { id: "cadence-discipline", label: "Discipline" },
            { id: "view-velocity", label: "Velocity (Slope)" },
            { id: "outlier-ratio", label: "Outliers" },
            { id: "engagement-density", label: "Engagement" },
            { id: "points-total", label: "Points" },
            { id: "house-cup", label: "House Cup" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sectionRefs[item.id as keyof typeof sectionRefs]?.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-colors whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-8 font-sans text-sm text-neutral-300">
          {/* Philosophy Banner */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <h4 className="font-serif text-lg text-white font-medium mb-1">
              The Anti-Vanity Principle
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Traditional leaderboards rank by lifetime followers or total views, ensuring only established creators win. 
              The GenC Leaderboard measures <strong>momentum, regularity, and personal breakthroughs</strong>. A creator with 14 followers who finds their format and accelerates will outscore an inactive account with 100,000 followers.
            </p>
          </div>

          {/* 1. Cadence Discipline */}
          <div
            ref={sectionRefs["cadence-discipline"]}
            className={`p-5 rounded-2xl border transition-all ${
              activeSection === "cadence-discipline" ? "border-emerald-500/50 bg-emerald-950/10" : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h4 className="font-serif text-xl font-medium text-white">1. Cadence Discipline (0–100%)</h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Discipline is personal. A creator who commits to 3 posts/week and hits it every 48 hours is just as disciplined as someone posting daily. We score execution ratio multiplied by a pacing regularity factor:
            </p>

            <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-xs text-emerald-300 mb-3 overflow-x-auto">
              <code>
                Discipline = 100 × min(1.0, Actual Posts / Expected Posts) × Regularity Multiplier
                <br /><br />
                where Expected Posts = (Target Cadence Rate × Window Days) / 7
                <br />
                Regularity Multiplier = 1 / (1 + 0.4 × std_dev(days between consecutive posts))
              </code>
            </div>

            <ul className="text-xs text-neutral-400 space-y-1 list-disc pl-4">
              <li><strong>Target Cadences:</strong> Daily (7/wk), Alternate Days (3.5/wk), Biweekly (2/wk), Weekly (1/wk).</li>
              <li><strong>Pacing Regularity:</strong> Posting 4 reels on Sunday and none for 13 days incurs a variance penalty compared to posting rhythmically every 48 hours.</li>
            </ul>
          </div>

          {/* 2. View Velocity Slope */}
          <div
            ref={sectionRefs["view-velocity"]}
            className={`p-5 rounded-2xl border transition-all ${
              activeSection === "view-velocity" ? "border-indigo-500/50 bg-indigo-950/10" : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h4 className="font-serif text-xl font-medium text-white">2. View Velocity / Momentum Slope (m)</h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Calculates the trajectory of a creator’s reach across their last 5 posts using Ordinary Least Squares (OLS) linear regression. Views are normalized by each creator’s own 30-day rolling median:
            </p>

            <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-xs text-indigo-300 mb-3 overflow-x-auto">
              <code>
                y_i = Views_i / max(50, Personal 30-day Median Views)
                <br />
                x_i = [0, 1, 2, ..., N-1] (chronological post sequence)
                <br /><br />
                Slope (m) = Σ (x_i - x̄)(y_i - ȳ) / Σ (x_i - x̄)²
              </code>
            </div>

            <ul className="text-xs text-neutral-400 space-y-1 list-disc pl-4">
              <li><strong>Positive Slope (+m):</strong> Indicates accelerating distribution (your format is gaining momentum).</li>
              <li><strong>Why it levels the field:</strong> Because views are divided by your personal baseline, climbing from 200 → 600 views yields the same positive slope (+2.0) as climbing from 20k → 60k.</li>
            </ul>
          </div>

          {/* 3. Outlier Ratio */}
          <div
            ref={sectionRefs["outlier-ratio"]}
            className={`p-5 rounded-2xl border transition-all ${
              activeSection === "outlier-ratio" ? "border-amber-500/50 bg-amber-950/10" : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="font-serif text-xl font-medium text-white">3. Outlier Ratio (Breakout Multiplier)</h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Detects algorithmic breakouts relative to what is normal for that specific creator:
            </p>

            <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-xs text-amber-300 mb-3 overflow-x-auto">
              <code>
                Breakout Ratio = max(Post Views in Window) / max(50, Personal 30-day Median Views)
                <br />
                Trigger: Ratio ≥ 3.0× awards the Breakout Outlier Badge
              </code>
            </div>

            <ul className="text-xs text-neutral-400 space-y-1 list-disc pl-4">
              <li><strong>Breakout Hall of Fame:</strong> Deduplicates per creator—highlighting each member's personal top breakthrough so the cohort can study winning hooks and retention mechanics.</li>
              <li><strong>Bonus Points:</strong> A verified breakout awards +30 points to the creator and +25 bonus points to their House.</li>
            </ul>
          </div>

          {/* 4. Engagement Density */}
          <div
            ref={sectionRefs["engagement-density"]}
            className={`p-5 rounded-2xl border transition-all ${
              activeSection === "engagement-density" ? "border-cyan-500/50 bg-cyan-950/10" : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h4 className="font-serif text-xl font-medium text-white">4. Engagement Density (%)</h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Measures audience resonance and conversational depth per impression:
            </p>

            <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-xs text-cyan-300 mb-3 overflow-x-auto">
              <code>
                Engagement Density = [ (Total Likes + Total Comments × 2) / max(1, Total Views) ] × 100
              </code>
            </div>

            <p className="text-xs text-neutral-400">
              Comments are weighted 2× because meaningful conversation reflects stronger community connection than passive views.
            </p>
          </div>

          {/* 5. Cohort Points */}
          <div
            ref={sectionRefs["points-total"]}
            className={`p-5 rounded-2xl border transition-all ${
              activeSection === "points-total" ? "border-white/50 bg-white/[0.05]" : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-white" />
              <h4 className="font-serif text-xl font-medium text-white">5. Cohort Points Total (Composite Score)</h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Combines all four dimensions into the final leaderboard ranking:
            </p>

            <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-xs text-white mb-3 overflow-x-auto">
              <code>
                Total Points = (Discipline Score × 0.5) 
                             + (max(0, View Velocity Slope) × 15) 
                             + (Breakout Bonus: 30 pts) 
                             + (Engagement Density × 2)
              </code>
            </div>
          </div>

          {/* 6. House Cup */}
          <div
            ref={sectionRefs["house-cup"]}
            className={`p-5 rounded-2xl border transition-all ${
              activeSection === "house-cup" ? "border-amber-500/50 bg-amber-950/10" : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h4 className="font-serif text-xl font-medium text-white">6. The House Cup Mechanics</h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              How Kaelix, Orvane, Myrith, and Syvora compete as teams:
            </p>

            <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-xs text-amber-300 mb-3 overflow-x-auto">
              <code>
                House Points = (Average Member Discipline × 0.5)
                             + (Median Member Slope × 10.0)
                             + (Total House Breakouts × 25 pts)
              </code>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Notice that the <strong>median</strong> slope is used for the momentum component: one viral member cannot carry an inactive house. True team discipline across all housemates is required to win the House Cup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
