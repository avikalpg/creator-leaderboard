"use client";

import React, { useState } from "react";
import { X, Plus, Sliders, RefreshCw, Lock, CheckCircle, AlertCircle } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  initialTab?: "creator" | "settings" | "sync";
  onClose: () => void;
  onSuccess: () => void;
  currentSettings?: {
    windowDays: number;
    minPostsForSlope: number;
    slopeSampleSize: number;
    breakoutThreshold: number;
    breakoutHousePoints: number;
    consistencyHouseWeight: number;
    momentumHouseWeight: number;
  };
  lastSync?: {
    startedAt: string;
    completedAt?: string;
    status: string;
    summary?: string;
  } | null;
}

export function AdminModal({
  isOpen,
  initialTab = "creator",
  onClose,
  onSuccess,
  currentSettings,
  lastSync,
}: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<"creator" | "settings" | "sync">(initialTab);
  const [password, setPassword] = useState("genc2026");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [houseName, setHouseName] = useState("House Matrix");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [targetCadence, setTargetCadence] = useState("ALTERNATE");
  const [bio, setBio] = useState("");

  // Settings states
  const [settings, setSettings] = useState(
    currentSettings || {
      windowDays: 14,
      minPostsForSlope: 3,
      slopeSampleSize: 5,
      breakoutThreshold: 3.0,
      breakoutHousePoints: 25,
      consistencyHouseWeight: 0.5,
      momentumHouseWeight: 10.0,
    }
  );

  if (!isOpen) return null;

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          houseName,
          instagramHandle,
          youtubeHandle,
          targetCadence,
          bio,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add creator");

      setStatusMsg({ type: "success", text: `Creator "${name}" successfully registered!` });
      setName("");
      setInstagramHandle("");
      setYoutubeHandle("");
      setBio("");
      onSuccess();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            window_days: settings.windowDays,
            min_posts_for_slope: settings.minPostsForSlope,
            slope_sample_size: settings.slopeSampleSize,
            breakout_threshold: settings.breakoutThreshold,
            breakout_house_points: settings.breakoutHousePoints,
            consistency_house_weight: settings.consistencyHouseWeight,
            momentum_house_weight: settings.momentumHouseWeight,
          },
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      setStatusMsg({ type: "success", text: "Scoring parameters saved successfully!" });
      onSuccess();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerSync = async () => {
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");

      setStatusMsg({
        type: "success",
        text: `Sync completed! Collected ${data.result?.postsCollected ?? 0} posts across ${
          data.result?.creatorsCount ?? 0
        } creators.`,
      });
      onSuccess();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Admin Dashboard</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Password & Tabs Bar */}
        <div className="p-4 bg-gray-950/70 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setActiveTab("creator");
                setStatusMsg(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "creator"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Creator</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setStatusMsg(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Rules & Weights</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("sync");
                setStatusMsg(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "sync"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Controls</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Passphrase:</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-24 bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {statusMsg && (
            <div
              className={`mb-5 p-3 rounded-lg text-xs flex items-center gap-2 ${
                statusMsg.type === "success"
                  ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-950/40 border border-rose-500/30 text-rose-300"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* TAB 1: ADD CREATOR */}
          {activeTab === "creator" && (
            <form onSubmit={handleAddCreator} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Creator Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sneha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    House Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. House Phoenix"
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Target Cadence
                  </label>
                  <select
                    value={targetCadence}
                    onChange={(e) => setTargetCadence(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="DAILY">Daily (7 posts / wk)</option>
                    <option value="ALTERNATE">Alternate Days (3–4 posts / wk)</option>
                    <option value="BIWEEKLY">Bi-weekly (2 posts / wk)</option>
                    <option value="WEEKLY">Weekly (1 post / wk)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. chaiandcontext"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    YouTube Handle / Channel
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @contrariantechie"
                    value={youtubeHandle}
                    onChange={(e) => setYoutubeHandle(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Bio / Focus Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI, Architecture, Business breakdowns"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Add Creator to Cohort</span>
              </button>
            </form>
          )}

          {/* TAB 2: RULES & WEIGHTS */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Evaluation Window (Days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="60"
                    value={settings.windowDays}
                    onChange={(e) =>
                      setSettings({ ...settings, windowDays: parseInt(e.target.value, 10) || 14 })
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Rolling period for cadence & medians</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Slope Sample Size
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={settings.slopeSampleSize}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        slopeSampleSize: parseInt(e.target.value, 10) || 5,
                      })
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Last N posts used for view velocity regression</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Breakout Threshold Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1.5"
                    max="10.0"
                    value={settings.breakoutThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        breakoutThreshold: parseFloat(e.target.value) || 3.0,
                      })
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Multiplier over median to award Breakout Badge</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Breakout House Points
                  </label>
                  <input
                    type="number"
                    value={settings.breakoutHousePoints}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        breakoutHousePoints: parseFloat(e.target.value) || 25,
                      })
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Bonus points awarded to House per member breakout</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Discipline Weight Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.consistencyHouseWeight}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        consistencyHouseWeight: parseFloat(e.target.value) || 0.5,
                      })
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">House points per consistency %</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Momentum Slope Multiplier
                  </label>
                  <input
                    type="number"
                    step="1.0"
                    value={settings.momentumHouseWeight}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        momentumHouseWeight: parseFloat(e.target.value) || 10.0,
                      })
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Multiplier on House median slope</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Parameters & Recalculate"}
              </button>
            </form>
          )}

          {/* TAB 3: SYNC CONTROLS */}
          {activeTab === "sync" && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                  Last Automated Sync
                </span>
                <p className="font-mono text-sm text-white mt-1">
                  {lastSync?.completedAt
                    ? new Date(lastSync.completedAt).toLocaleString()
                    : "No sync record yet"}
                </p>
                {lastSync?.summary && (
                  <p className="text-xs text-gray-400 mt-2 bg-gray-900/60 p-2 rounded border border-gray-850">
                    {lastSync.summary}
                  </p>
                )}
              </div>

              <div className="text-xs text-gray-400 leading-relaxed">
                Sync polls YouTube Data API v3 and Instagram (Apify/Local provider), records video snapshots, computes view velocity slopes, detects breakouts, and broadcasts to Discord if configured.
              </div>

              <button
                onClick={handleTriggerSync}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>{isLoading ? "Running Full Cohort Sync..." : "Run Cohort Sync Now"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
