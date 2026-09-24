"use client";

import React from "react";
import { GenCLogo } from "./GenCLogo";
import { Plus, Settings, RefreshCw, HelpCircle } from "lucide-react";

interface HeaderProps {
  creatorsCount: number;
  housesCount: number;
  lastSyncTime?: string;
  onOpenAdmin: (tab?: "creator" | "settings" | "sync") => void;
  onOpenHowItWorks: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({
  creatorsCount,
  housesCount,
  lastSyncTime,
  onOpenAdmin,
  onOpenHowItWorks,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="sticky top-4 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#141414]/90 backdrop-blur-xl border border-white/10 rounded-full px-5 py-3 shadow-2xl flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="text-white hover:opacity-90 transition-opacity">
            <GenCLogo className="h-4 sm:h-5 w-auto" />
          </div>
          <div className="hidden sm:block h-4 w-[1px] bg-neutral-800" />
          <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-widest text-neutral-400">
            Leaderboard
          </span>
        </div>

        {/* Center Pill Stats */}
        <div className="hidden md:flex items-center gap-2 bg-neutral-900/80 border border-white/5 rounded-full px-3.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-300">
            {creatorsCount} Creators
          </span>
          <span className="text-neutral-600 text-xs">•</span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            {housesCount} Houses
          </span>
          {lastSyncTime && (
            <>
              <span className="text-neutral-600 text-xs">•</span>
              <span className="font-mono text-[10px] text-neutral-500">
                Synced {new Date(lastSyncTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Leaderboard Data"
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-850 border border-white/5 rounded-full transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-white" : ""}`} />
          </button>

          <button
            onClick={() => onOpenAdmin("creator")}
            className="genc-btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Creator</span>
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="genc-btn-secondary text-xs p-2 sm:px-3 sm:py-2 flex items-center gap-1.5"
            title="How It Works & Metric Formulas"
          >
            <HelpCircle className="w-3.5 h-3.5 text-neutral-300" />
            <span className="hidden sm:inline">How It Works</span>
          </button>

          <button
            onClick={() => onOpenAdmin("settings")}
            className="genc-btn-secondary text-xs p-2 sm:px-3 sm:py-2 flex items-center gap-1.5"
            title="Admin & Rules"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-300" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
