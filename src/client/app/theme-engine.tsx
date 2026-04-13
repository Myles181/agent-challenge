"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "lucide-react";

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  primaryRgb: string;
  glow: string;
  bg: string;
  appBg: string;
  panelBg: string;
  textMain: string;
  textMuted: string;
  border: string;
  isLight?: boolean;
}

export const THEMES: ThemePreset[] = [
  { 
    id: "sentinel", name: "Sentinel", primary: "#dc2626", primaryRgb: "220, 38, 38", glow: "rgba(220, 38, 38, 0.4)", bg: "rgba(220, 38, 38, 0.08)",
    appBg: "#000000", panelBg: "rgba(255, 255, 255, 0.02)", textMain: "#ffffff", textMuted: "rgba(255, 255, 255, 0.4)", border: "rgba(255, 255, 255, 0.05)"
  },
  { 
    id: "quantum", name: "Quantum", primary: "#06b6d4", primaryRgb: "6, 182, 212", glow: "rgba(6, 182, 212, 0.4)", bg: "rgba(6, 182, 212, 0.08)",
    appBg: "#020617", panelBg: "rgba(30, 41, 59, 0.4)", textMain: "#f1f5f9", textMuted: "rgba(148, 163, 184, 0.6)", border: "rgba(30, 41, 59, 0.6)"
  },
  { 
    id: "nebula", name: "Nebula", primary: "#2563eb", primaryRgb: "37, 99, 235", glow: "rgba(37, 99, 235, 0.2)", bg: "rgba(37, 99, 235, 0.06)",
    appBg: "#f8fafc", panelBg: "#ffffff", textMain: "#0f172a", textMuted: "#64748b", border: "#e2e8f0", isLight: true
  },
  { 
    id: "matrix", name: "Matrix", primary: "#22c55e", primaryRgb: "34, 197, 94", glow: "rgba(34, 197, 94, 0.4)", bg: "rgba(34, 197, 94, 0.08)",
    appBg: "#000000", panelBg: "rgba(0, 20, 0, 0.4)", textMain: "#22c55e", textMuted: "rgba(34, 197, 94, 0.5)", border: "rgba(34, 197, 94, 0.2)"
  },
  { 
    id: "sol", name: "Sol", primary: "#f59e0b", primaryRgb: "245, 158, 11", glow: "rgba(245, 158, 11, 0.4)", bg: "rgba(245, 158, 11, 0.08)",
    appBg: "#0a0a05", panelBg: "rgba(40, 30, 10, 0.3)", textMain: "#fbbf24", textMuted: "rgba(251, 191, 36, 0.5)", border: "rgba(251, 191, 36, 0.2)"
  },
];

export function useTheme() {
  const [activeTheme, setActiveTheme] = useState<ThemePreset>(THEMES[0]);

  useEffect(() => {
    const saved = localStorage.getItem("sentinel_theme");
    if (saved) {
      const theme = THEMES.find(t => t.id === saved);
      if (theme) setActiveTheme(theme);
    }
  }, []);

  const selectTheme = (theme: ThemePreset) => {
    setActiveTheme(theme);
    localStorage.setItem("sentinel_theme", theme.id);
  };

  return { activeTheme, selectTheme };
}

export function ThemeSwitcher({ activeTheme, selectTheme }: { activeTheme: ThemePreset, selectTheme: (t: ThemePreset) => void }) {
  const [showThemePanel, setShowThemePanel] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {showThemePanel && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-4 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl"
            style={{ background: activeTheme.panelBg, borderColor: activeTheme.border }}
          >
            <div className="text-[10px] font-bold tracking-widest uppercase mb-3 px-2" style={{ color: activeTheme.textMuted }}>Neural Profiles</div>
            <div className="flex flex-col gap-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => selectTheme(theme)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all hover:bg-white/5"
                  style={{ 
                    background: activeTheme.id === theme.id ? theme.bg : "transparent",
                    color: activeTheme.textMain
                  }}
                >
                  <div className="h-3 w-3 rounded-full" style={{ background: theme.primary, boxShadow: `0 0 10px ${theme.glow}` }} />
                  <span style={{ color: activeTheme.id === theme.id ? theme.primary : activeTheme.textMain }}>{theme.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowThemePanel(!showThemePanel)}
        className="flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition-shadow"
        style={{ 
          borderColor: activeTheme.border, 
          background: activeTheme.panelBg,
          color: activeTheme.primary,
          boxShadow: activeTheme.isLight ? "0 4px 12px rgba(0,0,0,0.05)" : `0 0 20px ${activeTheme.glow}`
        }}
      >
        <Palette size={20} />
      </motion.button>
    </div>
  );
}
