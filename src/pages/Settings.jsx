import { motion } from "framer-motion";
import { ArrowLeft, Download, Trash2, Cloud, CloudOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { exportProgress } from "../utils/storage";

export function Settings({ progress, sync }) {
  const navigate = useNavigate();
  const { state, completedCount, totalActivities, overallPercent, resetAll } = progress;
  const {
    syncPhrase,
    setSyncPhrase,
    syncStatus,
    lastSynced,
    isConfigured,
    hasSyncPhrase,
  } = sync;

  const [phraseInput, setPhraseInput] = useState(syncPhrase);
  const [showPhrase, setShowPhrase] = useState(false);

  function handleExport() {
    const data = exportProgress();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-tracker-progress-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (window.confirm("This will erase ALL your progress. Are you sure?")) {
      if (window.confirm("Really? This cannot be undone.")) {
        resetAll();
        navigate("/");
      }
    }
  }

  function handleSavePhrase() {
    setSyncPhrase(phraseInput);
  }

  function handleDisconnect() {
    setPhraseInput("");
    setSyncPhrase("");
  }

  const statusLabel = {
    idle: "Not connected",
    syncing: "Syncing...",
    synced: "Synced",
    error: "Sync failed",
    offline: "Offline",
  };

  const statusColor = {
    idle: "var(--text-dim)",
    syncing: "var(--phase-1)",
    synced: "var(--success)",
    error: "var(--destructive)",
    offline: "var(--text-muted)",
  };

  return (
    <motion.div
      className="min-h-screen pb-10"
      initial={{ x: "50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "50%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 32 }}
    >
      {/* Nav */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-[var(--text-muted)] cursor-pointer p-2 -ml-2 rounded-lg active:bg-[var(--bg-card)] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
        </div>
        <span className="text-base font-display font-semibold text-[var(--text-primary)]">
          Settings
        </span>
        <div className="flex-1" />
      </div>

      {/* Sync Section */}
      <div className="px-5 pt-4 pb-6">
        <h2 className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-widest mb-3">
          Cloud Sync
        </h2>
        <div
          className="rounded-xl p-4 border space-y-3"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          {!isConfigured ? (
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Cloud sync is not configured yet. Set <code className="text-xs px-1 py-0.5 rounded bg-[var(--bg-input)] text-[var(--text-secondary)]">VITE_SUPABASE_URL</code> and <code className="text-xs px-1 py-0.5 rounded bg-[var(--bg-input)] text-[var(--text-secondary)]">VITE_SUPABASE_ANON_KEY</code> to enable.
            </p>
          ) : (
            <>
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasSyncPhrase ? (
                    <Cloud size={16} style={{ color: statusColor[syncStatus] }} />
                  ) : (
                    <CloudOff size={16} className="text-[var(--text-dim)]" />
                  )}
                  <span
                    className="text-sm font-medium"
                    style={{ color: statusColor[syncStatus] }}
                  >
                    {statusLabel[syncStatus]}
                  </span>
                </div>
                {lastSynced && (
                  <span className="text-xs text-[var(--text-dim)]">
                    {lastSynced.toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Phrase Input */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1.5 block">
                  Sync phrase — same phrase on any device = same data
                </label>
                <div className="flex gap-2">
                  <input
                    type={showPhrase ? "text" : "password"}
                    value={phraseInput}
                    onChange={(e) => setPhraseInput(e.target.value)}
                    placeholder="Enter a secret phrase..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  />
                  <button
                    onClick={() => setShowPhrase(!showPhrase)}
                    className="px-2 py-2 rounded-lg text-xs text-[var(--text-muted)] cursor-pointer"
                    style={{
                      backgroundColor: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {showPhrase ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {hasSyncPhrase && phraseInput === syncPhrase ? (
                  <button
                    onClick={handleDisconnect}
                    className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer border"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--text-muted)",
                      borderColor: "var(--border)",
                    }}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleSavePhrase}
                    disabled={!phraseInput.trim()}
                    className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-30"
                    style={{
                      background: "var(--gradient-hero)",
                      color: "white",
                      border: "none",
                    }}
                  >
                    {hasSyncPhrase ? "Update" : "Connect"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 pb-6">
        <h2 className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-widest mb-3">
          Progress
        </h2>
        <div
          className="rounded-xl p-4 space-y-3 border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <StatRow label="Overall" value={`${overallPercent}%`} />
          <div className="border-t border-[var(--border-subtle)]" />
          <StatRow
            label="Activities"
            value={`${completedCount} / ${totalActivities}`}
          />
          <StatRow
            label="Current streak"
            value={`${state.streak.current} days`}
          />
          <StatRow
            label="Best streak"
            value={`${state.streak.best} days`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 space-y-2.5">
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer border"
          style={{
            backgroundColor: "var(--bg-card)",
            color: "var(--text-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <Download size={16} />
          Export Progress
        </button>

        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer border"
          style={{
            backgroundColor: "var(--destructive-bg)",
            color: "var(--destructive)",
            borderColor: "rgba(217, 83, 79, 0.15)",
          }}
        >
          <Trash2 size={16} />
          Reset All Progress
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 pt-10 text-center">
        <p className="text-xs text-[var(--text-dim)]">
          AI Fundamentals Tracker v1.0
        </p>
        <p className="text-xs text-[var(--text-dim)] mt-1">
          Built with {"\u2764\uFE0F"} and Claude
        </p>
      </div>
    </motion.div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium tabular-nums text-[var(--text-primary)]">
        {value}
      </span>
    </div>
  );
}
