"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BreakoutAlertBanner } from "@/components/BreakoutAlertBanner";
import { HouseStandings, HouseData } from "@/components/HouseStandings";
import { CreatorTable, CreatorRowData } from "@/components/CreatorTable";
import { AdminModal } from "@/components/AdminModal";
import { CreatorDetailModal } from "@/components/CreatorDetailModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";
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
  const [adminTab, setAdminTab] = useState<"roster" | "creator" | "settings" | "sync">("roster");
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [activeHowItWorksSection, setActiveHowItWorksSection] = useState<string | null>(null);

  const handleOpenHowItWorks = (section?: string) => {
    setActiveHowItWorksSection(section || null);
    setHowItWorksOpen(true);
  };

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
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col selection:bg-white selection:text-black">
      <Header
        creatorsCount={creators.length}
        housesCount={houses.length}
        lastSyncTime={lastSync?.completedAt}
        onOpenAdmin={handleOpenAdmin}
        onOpenHowItWorks={() => handleOpenHowItWorks()}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 flex-1 w-full">
        {/* GenC Editorial Hero */}
        <section className="text-center py-10 sm:py-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-300">
              GenC Creator Cohort • Benchmark
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight text-white leading-[1.15]">
            Momentum, Cadence &{" "}
            <span className="italic font-normal font-serif text-neutral-300">Breakouts</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-neutral-400 font-sans max-w-xl mx-auto leading-relaxed">
            A level playing field measuring view acceleration, posting discipline, and creative breakthroughs—not vanity follower counts.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => handleOpenHowItWorks()}
              className="genc-btn-secondary text-xs px-4 py-2 font-mono flex items-center gap-1.5"
            >
              <span>Explore Metric Math & Formulas ↗</span>
            </button>
          </div>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
            <RefreshCw className="w-6 h-6 animate-spin text-white" />
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
              Syncing cohort metrics...
            </p>
          </div>
        ) : (
          <>
            {/* Breakout Banner */}
            <BreakoutAlertBanner
              breakouts={breakouts}
              onOpenHowItWorks={handleOpenHowItWorks}
            />

            {/* Navigation Tabs (Pill style) */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-6">
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === "leaderboard"
                    ? "bg-white text-black font-semibold shadow-md"
                    : "bg-white/5 text-neutral-400 hover:text-white border border-white/5 hover:border-white/15"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Creator Leaderboard</span>
              </button>

              <button
                onClick={() => setActiveTab("houses")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === "houses"
                    ? "bg-white text-black font-semibold shadow-md"
                    : "bg-white/5 text-neutral-400 hover:text-white border border-white/5 hover:border-white/15"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>The House Cup</span>
                <span className="font-mono text-[10px] bg-neutral-800 px-1.5 py-0.2 rounded-full text-neutral-300">
                  {houses.length}
                </span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === "leaderboard" && (
              <CreatorTable
                creators={creators}
                onSelectCreator={(c) => setSelectedCreator(c)}
                onOpenHowItWorks={handleOpenHowItWorks}
              />
            )}

            {activeTab === "houses" && (
              <div>
                <HouseStandings
                  houses={houses}
                  onOpenHowItWorks={handleOpenHowItWorks}
                />
                <div className="mt-12">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <h3 className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                      Roster Breakdown By House
                    </h3>
                  </div>
                  <CreatorTable
                    creators={creators}
                    onSelectCreator={(c) => setSelectedCreator(c)}
                    onOpenHowItWorks={handleOpenHowItWorks}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 py-8 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-400 font-medium">GenC</span>
            <span>•</span>
            <p>Designed for the GenC Creator Cohort</p>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-neutral-500">
            <span>Updates every 15m via home daemon</span>
            <span>•</span>
            <button
              onClick={() => handleOpenHowItWorks()}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              How It Works
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenAdmin("sync")}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Sync Engine
            </button>
            <span>•</span>
            <a
              href="https://www.genc.club"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              genc.club ↗
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminModal
        isOpen={adminModalOpen}
        initialTab={adminTab}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={loadData}
        creators={creators}
        currentSettings={settings}
        lastSync={lastSync}
      />

      <CreatorDetailModal
        creator={selectedCreator}
        onClose={() => setSelectedCreator(null)}
      />

      <HowItWorksModal
        isOpen={howItWorksOpen}
        activeSection={activeHowItWorksSection}
        onClose={() => setHowItWorksOpen(false)}
      />
    </div>
  );
}
