"use client";

import { ThemePreset } from "../../theme-engine";

interface SignalLinks {
  solscan_tx?: string;
  solscan_token?: string;
  pumpdotfun?: string;
}

export interface Signal {
  type: "whale_in" | "whale_out" | "swap" | "unknown";
  description: string;
  amount?: number;
  tokenSymbol?: string;
  mint?: string;
  txSignature?: string;
  links: SignalLinks;
}

interface SignalCardProps {
  signal: Signal;
  index: number;
  theme: ThemePreset;
}

const TYPE_CONFIG = {
  whale_in:  { icon: "↓", label: "WHALE IN" },
  whale_out: { icon: "↑", label: "WHALE OUT" },
  swap:      { icon: "⇄", label: "SWAP" },
  unknown:   { icon: "·", label: "EVENT" },
};

export default function SignalCard({ signal, index, theme }: SignalCardProps) {
  const config = TYPE_CONFIG[signal.type] ?? TYPE_CONFIG.unknown;
  const isWhaleIn = signal.type === "whale_in";
  const isWhaleOut = signal.type === "whale_out";
  const isSwap = signal.type === "swap";

  const color = isWhaleIn ? "#4ade80" : isWhaleOut ? "#f87171" : isSwap ? "#facc15" : theme.textMuted;

  const tweetText = encodeURIComponent(
    `🐋 Solana Signal\n\n${signal.description}\n\n${signal.links?.solscan_tx ?? ""}\n\n#Solana #DeFi`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  const shortMint = signal.mint
    ? `${signal.mint.slice(0, 6)}...${signal.mint.slice(-4)}`
    : null;

  const shortTx = signal.txSignature
    ? `${signal.txSignature.slice(0, 8)}...`
    : null;

  return (
    <div style={{
      border: `1px solid ${theme.border}`,
      background: theme.bg,
      borderRadius: '0.5rem',
      padding: '1rem',
      transition: 'border-color 0.2s',
      marginBottom: '0.75rem',
      fontFamily: 'monospace'
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.primary}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '2px', flexShrink: 0 }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ fontSize: '1.125rem', color }}>{config.icon}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color }}>
              {config.label}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: theme.textMain, lineHeight: 1.6, margin: 0 }}>
            {signal.description}
          </p>
        </div>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flexShrink: 0,
            padding: '0.375rem 0.75rem',
            border: `1px solid ${theme.border}`,
            borderRadius: '0.25rem',
            color: theme.textMuted,
            fontSize: '0.75rem',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.textMain; e.currentTarget.style.color = theme.textMain; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted; }}
        >
          Share ↗
        </a>
      </div>

      {/* Meta + Links */}
      <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', paddingLeft: '4rem' }}>
        {shortMint && (
          <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>mint: {shortMint}</span>
        )}
        {shortTx && (
          <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>tx: {shortTx}</span>
        )}
        {signal.links?.solscan_tx && (
           <a href={signal.links.solscan_tx} target="_blank" rel="noopener noreferrer"
           style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(0,0,0,0.1)', border: `1px solid ${theme.border}`, color: theme.textMuted, textDecoration: 'none' }}>
           Solscan TX ↗
         </a>
        )}
        {signal.links?.solscan_token && (
          <a href={signal.links.solscan_token} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(0,0,0,0.1)', border: `1px solid ${theme.border}`, color: theme.textMuted, textDecoration: 'none' }}>
          Token ↗
        </a>
        )}
        {signal.links?.pumpdotfun && (
          <a href={signal.links.pumpdotfun} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(0,0,0,0.1)', border: `1px solid ${theme.border}`, color: theme.textMuted, textDecoration: 'none' }}>
          Pump.fun ↗
        </a>
        )}
      </div>
    </div>
  );
}
