"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Cpu, Activity, Terminal, Zap, ShieldCheck, Globe } from "lucide-react";
import { useElizaChat } from "../../../hooks/useElizaChat";

import { ThemePreset } from "../../theme-engine";

const IQ5Core = ({ isThinking, isConnected, isFocused, theme }: { isThinking: boolean; isConnected: boolean; isFocused: boolean; theme: ThemePreset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isThinkingRef = useRef(isThinking);
  useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;

    const nodes = Array.from({ length: 24 }, (_, i) => ({
      baseAngle: (i / 24) * Math.PI * 2,
      r: isFocused ? 110 : 45,
      speed: 0.002 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2,
      size: 1 + Math.random() * 2,
    }));

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const thinking = isThinkingRef.current;
      
      // Core Glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, thinking ? 60 : 40);
      grad.addColorStop(0, theme.glow);
      grad.addColorStop(0.5, theme.bg);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, thinking ? 60 : 40, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Connections
      ctx.beginPath();
      ctx.lineWidth = 0.5;
      nodes.forEach((n, i) => {
        const a = n.baseAngle + Math.sin(t * n.speed * 60 + n.phase) * 0.3;
        const r = n.r + Math.sin(t * 0.5 + n.phase) * (thinking ? 15 : 8);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;

        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        
        // Connect to neighbors
        const next = nodes[(i + 1) % nodes.length];
        const na = next.baseAngle + Math.sin(t * next.speed * 60 + next.phase) * 0.3;
        const nr = next.r + Math.sin(t * 0.5 + next.phase) * (thinking ? 15 : 8);
        ctx.lineTo(cx + Math.cos(na) * nr, cy + Math.sin(na) * nr);
      });
      ctx.strokeStyle = thinking ? theme.primary : (theme.isLight ? "rgba(0,0,0,0.1)" : theme.bg);
      ctx.stroke();

      // Nodes
      nodes.forEach((n) => {
        const a = n.baseAngle + Math.sin(t * n.speed * 60 + n.phase) * 0.3;
        const r = n.r + Math.sin(t * 0.5 + n.phase) * (thinking ? 15 : 8);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        
        ctx.beginPath();
        ctx.arc(x, y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = thinking ? (theme.isLight ? theme.primary : "#fff") : theme.primary;
        ctx.fill();
        
        if (thinking) {
          ctx.beginPath();
          ctx.arc(x, y, n.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = theme.glow;
          ctx.fill();
        }
      });

      t += 0.016;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isFocused, theme]);

  return (
    <div style={{ position: "relative", width: "100%", height: isFocused ? 200 : 100, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <canvas ref={canvasRef} width={300} height={300} style={{ width: 150, height: 150 }} />
      {isFocused && (
        <div style={{ position: "absolute", bottom: -20, display: "flex", gap: "1rem" }}>
          <Zap size={14} color="rgba(255,255,255,0.2)" />
          <ShieldCheck size={14} color="rgba(255,255,255,0.2)" />
          <Globe size={14} color="rgba(255,255,255,0.2)" />
        </div>
      )}
    </div>
  );
};

export default function ChatPanel({ isFocused, theme }: { isFocused: boolean; theme: ThemePreset }) {
  const { messages, connected, loading, sendMessage } = useElizaChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: isFocused ? "2.5rem" : "1rem", color: theme.textMain }}>
      <header style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: isFocused ? "1.5rem" : "1rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={isFocused ? 20 : 16} color={theme.primary} />
            Neural <span style={{ color: theme.textMuted }}>Core</span>
          </h2>
          {isFocused && <span style={{ fontSize: "0.6rem", color: theme.textMuted, fontWeight: 700 }}>SESSION_ID: 0x48...A2</span>}
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? theme.primary : theme.border }} />
      </header>

      <IQ5Core isThinking={loading} isConnected={connected} isFocused={isFocused} theme={theme} />

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", margin: "1.5rem 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {isFocused && messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "1rem",
              borderRadius: 16,
              background: msg.role === "agent" ? theme.bg : (theme.isLight ? "#f1f5f9" : "rgba(255,255,255,0.03)"),
              border: `1px solid ${theme.border}`,
              maxWidth: "75%",
              alignSelf: msg.role === "agent" ? "flex-start" : "flex-end",
              boxShadow: theme.isLight ? "0 2px 8px rgba(0,0,0,0.02)" : "none"
            }}
          >
            <div style={{ fontSize: "0.85rem", lineHeight: 1.5, color: theme.textMain }}>{msg.text}</div>
          </motion.div>
        ))}
        {!isFocused && messages.slice(-1).map((msg, i) => (
          <div key={i} style={{ fontSize: "0.7rem", color: theme.textMuted, textAlign: "center", fontStyle: "italic" }}>
            {msg.text.slice(0, 40)}...
          </div>
        ))}
        {loading && isFocused && (
          <div style={{ fontSize: "0.6rem", color: theme.primary, fontWeight: 700 }}>THINKING...</div>
        )}
      </div>

      <div style={{ 
        padding: "0.5rem", borderRadius: 16, background: theme.isLight ? "#f1f5f9" : "rgba(255,255,255,0.02)", 
        border: `1px solid ${theme.border}`, display: "flex", gap: "8px" 
      }}>
        <input
          type="text"
          value={input}
          placeholder={isFocused ? "Execute command..." : "Core focused"}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={!isFocused || loading}
          style={{ flex: 1, background: "transparent", border: "none", color: theme.textMain, outline: "none", padding: "8px", fontSize: "0.9rem" }}
        />
        <button
          onClick={handleSend}
          disabled={!isFocused || !input.trim() || loading}
          style={{ 
            width: 36, height: 36, borderRadius: 10, 
            background: theme.primary, 
            border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" 
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
