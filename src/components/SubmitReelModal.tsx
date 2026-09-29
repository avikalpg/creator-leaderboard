"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle, AlertCircle, RefreshCw, Send, Link as LinkIcon, ChevronDown } from "lucide-react";
import { CreatorRowData } from "./CreatorTable";

interface SubmitReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  creators: CreatorRowData[];
}

export function SubmitReelModal({ isOpen, onClose, onSuccess, creators }: SubmitReelModalProps) {
  const [url, setUrl] = useState("");
  const [manualCreatorId, setManualCreatorId] = useState("");
  const [showOverride, setShowOverride] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/reels/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          creatorId: manualCreatorId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to index video");

      setStatusMsg({
        type: "success",
        text: `✓ ${data.message || `Reel linked to ${data.creatorName} and indexed.`}`,
      });

      setUrl("");
      setManualCreatorId("");
      setShowOverride(false);
      onSuccess();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
      // If creator was not matched automatically, open the manual override selector
      if (err.message.includes("not registered") || err.message.includes("select")) {
        setShowOverride(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-white tracking-tight">
                Submit <span className="italic font-normal font-serif text-neutral-300">Trial Reel</span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Paste any Instagram Trial Reel or YouTube Short
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

        {/* Form Body - Single Input UX */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {statusMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
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

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1.5">
              Reel / Video Link
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="url"
                required
                autoFocus
                placeholder="https://www.instagram.com/reels/DdoNOniT2ok/"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-neutral-900/90 border border-white/10 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1.5 leading-relaxed">
              Creator, handles, views, and engagement are detected automatically from the link.
            </p>
          </div>

          {/* Optional Creator Override (only if needed) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOverride(!showOverride)}
              className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
            >
              <span>{showOverride ? "Hide creator override" : "Need to manually assign creator?"}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showOverride ? "rotate-180" : ""}`} />
            </button>

            {showOverride && (
              <div className="mt-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  Select Creator Manually:
                </label>
                <select
                  value={manualCreatorId}
                  onChange={(e) => setManualCreatorId(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
                >
                  <option value="">Auto-detect from URL (Default)</option>
                  {creators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.houseName})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full genc-btn-primary py-3 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Inspecting Link & Detecting Creator...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Index Reel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
