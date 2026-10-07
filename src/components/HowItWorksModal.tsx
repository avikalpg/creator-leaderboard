"use client";

import React, { useEffect, useRef } from "react";
import { X, Target, TrendingUp, Sparkles, Zap, Shield, HelpCircle, ChevronRight } from "lucide-react";

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
      <div className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-medium text-white tracking-tight">
                How It Works & <span className="italic font-normal text-neutral-400">Scoring Rules</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Rewarding momentum, cadence discipline, and creative breakthroughs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
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
        <div className="p-6 overflow-y-auto space-y-8 text-sm text-neutral-300">
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
            
            {/* Plain English explanation */}
            <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
              Discipline is personal. A creator who commits to 3 posts/week and hits it every 48 hours is just as disciplined as someone posting daily. 
            </p>
            <div className="space-y-1.5 text-xs text-neutral-400 mb-3">
              <p>• <strong>No Hard Drop-off Cliffs:</strong> Instead of dropping older posts off a cliff on day 15, we use an <strong>exponential half-life decay of 14 days</strong>. If you took a 3-day rest, your hard work from 2 weeks ago still gives you partial credit so your consistency doesn’t crash overnight.</p>
              <p>• <strong>The Creative Day Rule:</strong> If you upload the same video to both Instagram and YouTube on Monday, it counts as <strong>1 creative day</strong> toward your cadence target, not two duplicate posts.</p>
              <p>• <strong>Pacing Regularity:</strong> Posting 4 reels on Sunday and none for 13 days is penalized compared to rhythmic, consistent uploads.</p>
            </div>

            {/* Expandable Math Accordion */}
            <details className="group mt-3 bg-black/50 border border-white/10 rounded-xl p-3">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white flex items-center justify-between">
                <span>▶ View Exact Mathematical Formula</span>
                <span className="text-[10px] text-neutral-500 group-open:hidden">Click to expand</span>
              </summary>
              <div className="mt-3 pt-3 border-t border-white/5 font-mono text-xs text-emerald-300 space-y-2 overflow-x-auto">
                <p>Weight(age_days) = 2^(-age_days / 14)</p>
                <p>Actual Decayed Posts = Σ Weight(age_of_unique_post_day)</p>
                <p>Expected Decayed Volume = (Target Rate / 7) × 15.526</p>
                <p>Discipline = 100 × min(1.0, Actual / Expected) × [ 1 / (1 + 0.4 × σ_interval) ]</p>
              </div>
            </details>
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

            {/* Plain English explanation */}
            <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
              Measures whether your recent reach is accelerating upward (+m) or cooling down (-m) across your last 5 posts.
            </p>
            <div className="space-y-1.5 text-xs text-neutral-400 mb-3">
              <p>• <strong>Normalized to Your Own Baseline:</strong> Your views are divided by your personal 30-day median. Climbing from 200 → 600 views gives you the same high positive velocity (+2.0) as climbing from 20k → 60k.</p>
              <p>• <strong>Platform Isolation:</strong> Instagram Reels and YouTube Shorts operate on different algorithm scales. Slopes are calculated independently per platform so cross-posting never distorts your view trajectory.</p>
            </div>

            {/* Expandable Math Accordion */}
            <details className="group mt-3 bg-black/50 border border-white/10 rounded-xl p-3">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white flex items-center justify-between">
                <span>▶ View Exact Linear Regression Formula</span>
                <span className="text-[10px] text-neutral-500 group-open:hidden">Click to expand</span>
              </summary>
              <div className="mt-3 pt-3 border-t border-white/5 font-mono text-xs text-indigo-300 space-y-2 overflow-x-auto">
                <p>y_i = Views_i / max(50, Personal Median Views)</p>
                <p>x_i = [0, 1, 2, ..., N-1] (Last N chronological posts)</p>
                <p>Slope (m) = Σ (x_i - x̄)(y_i - ȳ) / Σ (x_i - x̄)²</p>
              </div>
            </details>
          </div>

          {/* 3. Outlier Ratio & Breakouts */}
          <div
            ref={sectionRefs["outlier-ratio"]}
            className={`p-5 rounded-2xl border transition-all ${
              activeSection === "outlier-ratio" ? "border-amber-500/50 bg-amber-950/10" : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="font-serif text-xl font-medium text-white">3. Outlier Ratio & Breakout Hall of Fame</h4>
            </div>

            {/* Plain English explanation */}
            <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
              Detects viral breakthroughs where a video significantly out-performs your normal numbers (trigger threshold: ≥ 3.0× personal median).
            </p>
            <div className="space-y-1.5 text-xs text-neutral-400 mb-3">
              <p>• <strong>The Factual Number Never Changes:</strong> On your card and profile, your true achievement stays untouched (e.g. <code>9.5x Outlier</code> or <code>43.1x Outlier</code>).</p>
              <p>• <strong>Smooth Points Half-Life:</strong> A breakout awards +30 points. Rather than vanishing to 0 on day 15, points decay with a 14-day half-life (+30 pts on day 0 → +15 pts on day 14 → +7.5 pts on day 28). This smoothly makes way for new winners while still rewarding your past breakout.</p>
              <p>• <strong>Hall of Fame Freshness:</strong> The cards are sorted by freshness priority (<code>Ratio × 2^(-age/14)</code>). Fresh hits get the top spotlight, while videos from months ago naturally fade away.</p>
            </div>

            {/* Expandable Math Accordion */}
            <details className="group mt-3 bg-black/50 border border-white/10 rounded-xl p-3">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white flex items-center justify-between">
                <span>▶ View Exact Outlier & Decay Formulas</span>
                <span className="text-[10px] text-neutral-500 group-open:hidden">Click to expand</span>
              </summary>
              <div className="mt-3 pt-3 border-t border-white/5 font-mono text-xs text-amber-300 space-y-2 overflow-x-auto">
                <p>Raw Outlier Ratio = max(Post Views) / max(50, Personal Median)</p>
                <p>Breakout Points = 30 × 2^(-age_in_days / 14)</p>
                <p>Hall of Fame Priority = Raw Ratio × 2^(-age_in_days / 14)</p>
              </div>
            </details>
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

            <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
              Measures audience resonance and conversational depth per impression. Comments are weighted 2× because meaningful conversation reflects stronger community connection than passive scrolls.
            </p>

            {/* Expandable Math Accordion */}
            <details className="group mt-3 bg-black/50 border border-white/10 rounded-xl p-3">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white flex items-center justify-between">
                <span>▶ View Engagement Density Formula</span>
                <span className="text-[10px] text-neutral-500 group-open:hidden">Click to expand</span>
              </summary>
              <div className="mt-3 pt-3 border-t border-white/5 font-mono text-xs text-cyan-300 space-y-2 overflow-x-auto">
                <p>Engagement Density = [ (Total Likes + Total Comments × 2) / max(1, Total Views) ] × 100</p>
              </div>
            </details>
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
              <h4 className="font-serif text-xl font-medium text-white">5. Cohort Points (The Composite Score)</h4>
            </div>

            <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
              The primary composite score ranking creators on the main leaderboard. It rewards consistency first, view acceleration second, and creative breakthroughs third.
            </p>

            {/* Expandable Math Accordion */}
            <details className="group mt-3 bg-black/50 border border-white/10 rounded-xl p-3">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white flex items-center justify-between">
                <span>▶ View Point Composition Formula</span>
                <span className="text-[10px] text-neutral-500 group-open:hidden">Click to expand</span>
              </summary>
              <div className="mt-3 pt-3 border-t border-white/5 font-mono text-xs text-white space-y-2 overflow-x-auto">
                <p>Total Points = (Discipline Score × 0.5)</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (max(0, View Velocity Slope) × 15)</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ [ 30 × 2^(-breakout_age / 14) ]</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (Engagement Density × 2)</p>
              </div>
            </details>
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

            <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
              How <strong>Kaelix</strong>, <strong>Orvane</strong>, <strong>Myrith</strong>, and <strong>Syvora</strong> compete as teams.
            </p>
            <div className="space-y-1.5 text-xs text-neutral-400 mb-3">
              <p>• <strong>Team Discipline:</strong> Every member who maintains their cadence adds to the House score.</p>
              <p>• <strong>Median House Slope:</strong> We use the <em>median</em> view velocity across members so that one viral member cannot carry an inactive house. Collective teamwork is required to win the House Cup.</p>
              <p>• <strong>Breakout Bonus:</strong> Member breakouts contribute bonus points to their House, decaying smoothly with the 14-day half-life.</p>
            </div>

            {/* Expandable Math Accordion */}
            <details className="group mt-3 bg-black/50 border border-white/10 rounded-xl p-3">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white flex items-center justify-between">
                <span>▶ View House Point Calculation Formula</span>
                <span className="text-[10px] text-neutral-500 group-open:hidden">Click to expand</span>
              </summary>
              <div className="mt-3 pt-3 border-t border-white/5 font-mono text-xs text-amber-300 space-y-2 overflow-x-auto">
                <p>House Points = (Average Member Discipline × 0.5)</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (Median Member Slope × 10.0)</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ Σ [ 25 × 2^(-member_breakout_age / 14) ]</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
