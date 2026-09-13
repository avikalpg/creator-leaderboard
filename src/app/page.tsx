"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BreakoutAlertBanner } from "@/components/BreakoutAlertBanner";
import { HouseStandings, HouseData } from "@/components/HouseStandings";
import { CreatorTable, CreatorRowData } from "@/components/CreatorTable";
import { AdminModal } from "@/components/AdminModal";
import { CreatorDetailModal } from "@/components/CreatorDetailModal";
import { Trophy, Shield, Sparkles, RefreshCw } from "lucide-react";

export default function Home() {
  const [creators, setCreators] = useState<CreatorRowData[]>([]);
  const [houses, setHouses] = useState<HouseData[]>([]);
  const [breakouts, setBreakouts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [lastSync, setLastSync] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"leaderboard" | "houses" | "breakouts">("leaderboard");

  // Modals
  const [selectedCreator, setSelectedCreator] = useState<CreatorRowData | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"creator" | "settings" | "sync">("creator");

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setCreators(data.creators || []);
        setHouses(data.houses || []);
        setBreakouts(data.breakouts || []);
        setSettings(data.settings || null);
        setLastSync(data.lastSync || null);
      }
    } catch (err) {
      console.error("Failed to load leaderboard data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdmin = (tab: "creator" | "settings" | "sync" = "creator") => {
    setAdminTab(tab);
    setAdminModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex flex-col">
      <Header
        creatorsCount={creators.length}
        housesCount={houses.length}
        lastSyncTime={lastSync?.completedAt}
        onOpenAdmin={handleOpenAdmin}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Calculating GenC cohort metrics...</p>
          </div>
        ) : (
          <>
            {/* Breakout Banner */}
            <BreakoutAlertBanner breakouts={breakouts} />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "leaderboard"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Creator Leaderboard</span>
              </button>

              <button
                onClick={() => setActiveTab("houses")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "houses"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>The House Cup</span>
                <span className="text-[10px] font-mono bg-indigo-950/80 px-1.5 py-0.5 rounded text-indigo-300">
                  {houses.length}
                </span>
              </button>
            </div>

            {/* Views */}
            {activeTab === "leaderboard" && (
              <div>
                <CreatorTable
                  creators={creators}
                  onSelectCreator={(c) => setSelectedCreator(c)}
                />
              </div>
            )}

            {activeTab === "houses" && (
              <div>
                <HouseStandings houses={houses} />
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Member Breakdown By House
                  </h3>
                  <CreatorTable
                    creators={creators}
                    onSelectCreator={(c) => setSelectedCreator(c)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-850 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>Built for the GenC Creator Cohort • Momentum & Consistency First</p>
          <div className="flex items-center gap-2">
            <span>Updates every 6–12h</span>
            <span>•</span>
            <button
              onClick={() => handleOpenAdmin("sync")}
              className="text-indigo-400 hover:underline"
            >
              Sync Dashboard
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminModal
        isOpen={adminModalOpen}
        initialTab={adminTab}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={loadData}
        currentSettings={settings}
        lastSync={lastSync}
      />

      <CreatorDetailModal
        creator={selectedCreator}
        onClose={() => setSelectedCreator(null)}
      />
    </div>
  );
}
