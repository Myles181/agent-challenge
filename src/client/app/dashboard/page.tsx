"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../dashboard.module.css";
import DashboardPanel from "./components/DashboardPanel";
import ChatPanel from "./components/ChatPanel";
import { Maximize2, Palette } from "lucide-react";
import { ThemePreset, THEMES, useTheme } from "../theme-engine";

type FocusState = "dashboard" | "chat" | "balanced";

export default function DashboardPage() {
  const [focus, setFocus] = useState<FocusState>("balanced");
  const { activeTheme, selectTheme } = useTheme();
  const [showThemePanel, setShowThemePanel] = useState(false);

  const getFlexBasis = (panel: "dashboard" | "chat") => {
    if (focus === "balanced") return "50%";
    if (focus === panel) return "82%";
    return "18%";
  };

  return (
    <div className={styles.dashboardWrapper} style={{ background: activeTheme.appBg, color: activeTheme.textMain }}>
      {/* Floating Theme Switcher */}
      <div className={styles.themeSwitcherBox}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowThemePanel(!showThemePanel)}
          className={styles.themeButton}
          style={{ 
            borderColor: activeTheme.border, 
            background: activeTheme.panelBg,
            color: activeTheme.primary,
            boxShadow: activeTheme.isLight ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
          }}
        >
          <Palette size={18} />
        </motion.button>
        
        <AnimatePresence>
          {showThemePanel && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className={styles.themeDropdown}
              style={{ background: activeTheme.panelBg, borderColor: activeTheme.border }}
            >
              <div className="text-[10px] font-bold tracking-widest uppercase mb-3 px-2" style={{ color: activeTheme.textMuted }}>Neural Profiles</div>
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => selectTheme(theme)}
                  className={`${styles.themeOption}`}
                  style={{ 
                    background: activeTheme.id === theme.id ? theme.bg : "transparent",
                    color: activeTheme.textMain
                  }}
                >
                  <div className={styles.colorCircle} style={{ background: theme.primary, boxShadow: `0 0 10px ${theme.glow}` }} />
                  <span className={styles.themeName} style={{ color: activeTheme.id === theme.id ? theme.primary : activeTheme.textMain }}>{theme.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dashboard Panel */}
      <motion.div
        layout
        initial={false}
        animate={{ 
          flexBasis: getFlexBasis("dashboard"),
        }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className={`${styles.panelContainer} ${focus === "dashboard" ? styles.panelFocused : ""} ${focus === "chat" ? styles.crushed : ""}`}
        style={{ 
          background: activeTheme.panelBg, 
          borderColor: activeTheme.isLight && focus === "dashboard" ? activeTheme.primary : activeTheme.border,
          boxShadow: activeTheme.isLight ? "0 10px 40px rgba(0,0,0,0.03)" : "none"
        }}
        onClick={() => setFocus(focus === "dashboard" ? "balanced" : "dashboard")}
      >
        <div className={styles.weightIndicator} style={{ color: activeTheme.textMuted }}>MTL_EXPR_DASH_01</div>
        <DashboardPanel isFocused={focus !== "chat"} theme={activeTheme} />
        
        {focus === "chat" && (
          <div className={styles.crushedOverlay} style={{ background: activeTheme.isLight ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
            <Maximize2 size={24} color={activeTheme.textMuted} />
          </div>
        )}
      </motion.div>

      {/* Chat Panel */}
      <motion.div
        layout
        initial={false}
        animate={{ 
          flexBasis: getFlexBasis("chat"),
        }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className={`${styles.panelContainer} ${focus === "chat" ? styles.panelFocused : ""} ${focus === "dashboard" ? styles.crushed : ""}`}
        style={{ 
          background: activeTheme.panelBg, 
          borderColor: activeTheme.isLight && focus === "chat" ? activeTheme.primary : activeTheme.border,
          boxShadow: activeTheme.isLight ? "0 10px 40px rgba(0,0,0,0.03)" : "none"
        }}
        onClick={() => setFocus(focus === "chat" ? "balanced" : "chat")}
      >
        <div className={styles.weightIndicator} style={{ color: activeTheme.textMuted }}>MTL_EXPR_CORE_02</div>
        <ChatPanel isFocused={focus !== "dashboard"} theme={activeTheme} />

        {focus === "dashboard" && (
          <div className={styles.crushedOverlay} style={{ background: activeTheme.isLight ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
            <Maximize2 size={24} color={activeTheme.textMuted} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
