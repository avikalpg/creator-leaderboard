"use client";

import React from "react";
import { Trophy, Shield, Plus, Settings, RefreshCw } from "lucide-react";

interface HeaderProps {
  creatorsCount: number;
  housesCount: number;
  lastSyncTime?: string;
  onOpenAdmin: (tab?: "creator" | "settings" | "sync") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({
  creatorsCount,
  housesCount,
  lastSyncTime,
  onOpenAdmin,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                  GenC Cohort Leaderboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  Rewarding momentum, cadence discipline, and creative breakouts
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{creatorsCount} Creators</span>
              <span className="text-gray-600">•</span>
              <span>{housesCount} Houses</span>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Leaderboard Data"
              className="p-2 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            </button>

            <button
              onClick={() => onOpenAdmin("creator")}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Creator</span>
            </button>

            <button
              onClick={() => onOpenAdmin("settings")}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
