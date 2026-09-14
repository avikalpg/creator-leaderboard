"use client";

import React, { useState } from "react";
import { X, Plus, Sliders, RefreshCw, Lock, CheckCircle, AlertCircle, Users, Edit3, Trash2, Save } from "lucide-react";
import { CreatorRowData } from "./CreatorTable";

const COHORT_HOUSES = ["Kaelix", "Orvane", "Myrith", "Syvora", "Unassigned"];

interface AdminModalProps {
  isOpen: boolean;
  initialTab?: "roster" | "creator" | "settings" | "sync";
  onClose: () => void;
  onSuccess: () => void;
  creators?: CreatorRowData[];
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
  initialTab = "roster",
  onClose,
  onSuccess,
  creators = [],
  currentSettings,
  lastSync,
}: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<"roster" | "creator" | "settings" | "sync">(initialTab);
  const [password, setPassword] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("genc_admin_pass") || "";
    }
    return "";
  });
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("genc_admin_pass", val);
    }
  };

  // Add Creator form state
  const [name, setName] = useState("");
  const [houseName, setHouseName] = useState("Orvane");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [targetCadence, setTargetCadence] = useState("ALTERNATE");
  const [bio, setBio] = useState("");

  // Edit Creator state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHouse, setEditHouse] = useState("Orvane");
  const [editIg, setEditIg] = useState("");
  const [editYt, setEditYt] = useState("");
  const [editCadence, setEditCadence] = useState("ALTERNATE");

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

  const handleStartEdit = (c: CreatorRowData) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditHouse(c.houseName);
    setEditIg(c.instagramHandle || "");
    setEditYt(c.youtubeHandle || "");
    setEditCadence(c.targetCadence);
    setStatusMsg(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!password.trim()) {
      setStatusMsg({ type: "error", text: "Please enter the admin passphrase above to save changes." });
      return;
    }
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/creators", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editName,
          houseName: editHouse,
          instagramHandle: editIg,
          youtubeHandle: editYt,
          targetCadence: editCadence,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update creator");

      setStatusMsg({ type: "success", text: `Updated "${editName}" successfully!` });
      setEditingId(null);
      onSuccess();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCreator = async (id: string, creatorName: string) => {
    if (!password.trim()) {
      setStatusMsg({ type: "error", text: "Please enter the admin passphrase above to delete a creator." });
      return;
    }
    if (!confirm(`Are you sure you want to remove ${creatorName} from the cohort?`)) return;

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/creators?id=${id}&password=${encodeURIComponent(password)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete creator");

      setStatusMsg({ type: "success", text: `Removed "${creatorName}" from cohort.` });
      onSuccess();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setStatusMsg({ type: "error", text: "Please enter the admin passphrase above to add a creator." });
      return;
    }
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
    if (!password.trim()) {
      setStatusMsg({ type: "error", text: "Please enter the admin passphrase above to save settings." });
      return;
    }
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
    if (!password.trim()) {
      setStatusMsg({ type: "error", text: "Please enter the admin passphrase above to run sync." });
      return;
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-neutral-400" />
            <h3 className="font-serif text-lg font-medium text-white">Cohort Admin & Roster</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Password & Tabs Bar */}
        <div className="p-4 bg-black/40 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => {
                setActiveTab("roster");
                setStatusMsg(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === "roster"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Roster</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("creator");
                setStatusMsg(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === "creator"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
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
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === "settings"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Rules</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("sync");
                setStatusMsg(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === "sync"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              Admin Passphrase:
            </span>
            <input
              type="password"
              placeholder="Enter passphrase"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-32 sm:w-36 bg-black/60 border border-white/10 rounded-full px-3 py-1 text-xs text-white placeholder-neutral-600 font-mono focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans">
          {statusMsg && (
            <div
              className={`mb-5 p-3 rounded-2xl text-xs flex items-center gap-2 ${
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

          {/* TAB 1: MANAGE ROSTER */}
          {activeTab === "roster" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                  Registered Creators ({creators.length})
                </span>
                <span className="text-[11px] text-neutral-500">
                  Houses: Kaelix, Orvane, Myrith, Syvora
                </span>
              </div>

              {creators.map((c) => {
                const isEditing = editingId === c.id;

                if (isEditing) {
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-neutral-900 border border-white/20 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">House</label>
                          <select
                            value={editHouse}
                            onChange={(e) => setEditHouse(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white cursor-pointer"
                          >
                            {COHORT_HOUSES.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">Instagram</label>
                          <input
                            type="text"
                            value={editIg}
                            onChange={(e) => setEditIg(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            placeholder="username"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">YouTube</label>
                          <input
                            type="text"
                            value={editYt}
                            onChange={(e) => setEditYt(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            placeholder="@handle"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">Cadence</label>
                          <select
                            value={editCadence}
                            onChange={(e) => setEditCadence(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white cursor-pointer"
                          >
                            <option value="DAILY">Daily</option>
                            <option value="ALTERNATE">Alternate</option>
                            <option value="BIWEEKLY">Biweekly</option>
                            <option value="WEEKLY">Weekly</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded-full text-xs text-neutral-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(c.id)}
                          disabled={isLoading}
                          className="genc-btn-primary px-4 py-1 text-xs flex items-center gap-1.5"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{c.name}</span>
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                          {c.houseName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                        {c.instagramHandle && <span>IG: @{c.instagramHandle}</span>}
                        {c.youtubeHandle && <span>• YT: {c.youtubeHandle}</span>}
                        <span>• Cadence: {c.targetCadence.toLowerCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(c)}
                        title="Edit Creator Details"
                        className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCreator(c.id, c.name)}
                        title="Remove Creator"
                        className="p-1.5 rounded-full text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ADD CREATOR */}
          {activeTab === "creator" && (
            <form onSubmit={handleAddCreator} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5">
                  Creator Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saran, Samarth, Nitin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5">
                    House Assignment
                  </label>
                  <select
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
                  >
                    {COHORT_HOUSES.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5">
                    Target Cadence
                  </label>
                  <select
                    value={targetCadence}
                    onChange={(e) => setTargetCadence(e.target.value)}
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
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
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. techwithsoundu"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5">
                    YouTube Handle / Channel
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @TechWithSoundu"
                    value={youtubeHandle}
                    onChange={(e) => setYoutubeHandle(e.target.value)}
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5">
                  Bio / Focus Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI, Architecture, Home Appliances"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 genc-btn-primary py-3 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Add Creator to Cohort</span>
              </button>
            </form>
          )}

          {/* TAB 3: RULES & WEIGHTS */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
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
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Rolling period for cadence & medians</p>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
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
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Last N posts used for view velocity regression</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
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
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Multiplier over median for Breakout Badge</p>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
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
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">House points awarded per member breakout</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
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
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">House points per consistency %</p>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
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
                    className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Multiplier on House median slope</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 genc-btn-primary py-3 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Parameters & Recalculate"}
              </button>
            </form>
          )}

          {/* TAB 4: SYNC CONTROLS */}
          {activeTab === "sync" && (
            <div className="space-y-4">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <span className="font-mono text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Last Automated Sync
                </span>
                <p className="font-mono text-sm text-white mt-1">
                  {lastSync?.completedAt
                    ? new Date(lastSync.completedAt).toLocaleString()
                    : "No sync record yet"}
                </p>
                {lastSync?.summary && (
                  <p className="text-xs text-neutral-400 mt-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    {lastSync.summary}
                  </p>
                )}
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Sync polls YouTube Data API v3 and Instagram (Apify/Local provider), records video snapshots, computes view velocity slopes, detects breakouts, and broadcasts to Discord.
              </p>

              <button
                onClick={handleTriggerSync}
                disabled={isLoading}
                className="w-full genc-btn-primary py-3 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>{isLoading ? "Running Cohort Sync..." : "Run Cohort Sync Now"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
