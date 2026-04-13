"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import SignalCard, { Signal } from "./SignalCard";
import { ThemePreset } from "../../theme-engine";

interface SignalsData {
  wallet: string;
  signals: Signal[];
  txCount: number;
  fetchedAt: string;
}

export default function DashboardPanel({ isFocused, theme }: { isFocused: boolean; theme: ThemePreset }) {
  const [data, setData] = useState<SignalsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/signals");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch signals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 60_000);
    return () => clearInterval(interval);
  }, []);

  const shortWallet = data?.wallet
    ? `${data.wallet.slice(0, 4)}...${data.wallet.slice(-4)}`
    : "—";

  return (
    <div style={{ padding: isFocused ? "2.5rem" : "1.5rem", height: "100%", overflowY: "auto", color: theme.textMain, fontFamily: "monospace" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: isFocused ? "1.5rem" : "1.2rem", fontWeight: "bold", letterSpacing: "-0.02em", color: theme.textMain }}>
          Whale Signals
        </h1>
        <p style={{ fontSize: "0.875rem", color: theme.textMuted, marginTop: "0.5rem" }}>
          Watching <span style={{ color: theme.primary }}>{shortWallet}</span>
          {data && (
            <>
              {" "}· {data.txCount} txs scanned ·{" "}
              <span style={{ color: theme.textMuted, opacity: 0.8 }}>
                {new Date(data.fetchedAt).toLocaleTimeString()}
              </span>
            </>
          )}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button
          onClick={fetchSignals}
          disabled={loading}
          style={{
            fontSize: "0.75rem",
            padding: "0.375rem 0.75rem",
            border: `1px solid ${theme.border}`,
            borderRadius: "0.25rem",
            color: theme.textMuted,
            background: "transparent",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.4 : 1,
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { if(!loading) { e.currentTarget.style.borderColor = theme.textMain; e.currentTarget.style.color = theme.textMain; } }}
          onMouseLeave={(e) => { if(!loading) { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted; } }}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div style={{ border: "1px solid #991b1b", background: "rgba(153, 27, 27, 0.2)", borderRadius: "0.5rem", padding: "1rem", fontSize: "0.875rem", color: "#f87171", marginBottom: "1rem" }}>
          ✕ {error}
        </div>
      )}

      {loading && !data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ border: `1px solid ${theme.border}`, background: theme.bg, borderRadius: "0.5rem", padding: "1rem", height: "5rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
          ))}
        </div>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {data.signals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: theme.textMuted }}>
              No signals detected yet
            </div>
          ) : (
            data.signals.slice(0, isFocused ? 20 : 5).map((signal, i) => (
              <SignalCard key={i} signal={signal} index={i} theme={theme} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
