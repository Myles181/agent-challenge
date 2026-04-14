"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../chat.module.css';
import { 
  Send, 
  Cpu, 
  Activity, 
  ArrowLeft,
  Terminal,
  Zap,
  ShieldCheck,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { useElizaChat } from '../../hooks/useElizaChat';

// --- Neural Mesh Canvas Component ---
const IQ5Core = ({ isThinking, isConnected }: { isThinking: boolean, isConnected: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isThinkingRef = useRef(isThinking);
  useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;

    const COL = {
      node:     'rgba(220,80,80,1)',
      nodeGlow: 'rgba(220,38,38,0.2)',
      line:     'rgba(220,100,80,VAL)',
      pulse:    'rgba(255,180,180,VAL)',
    };

    const N = 14;
    const nodes = Array.from({ length: N }, (_, i) => {
      const angle = (i / N) * Math.PI * 2;
      const r = 100 + (Math.random() - 0.5) * 40;
      return { baseAngle: angle, r, speed: 0.003 + Math.random() * 0.004, phase: Math.random() * Math.PI * 2, rPhase: Math.random() * Math.PI * 2 };
    });

    const innerNodes = Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return { baseAngle: angle, r: 48, speed: 0.006 + Math.random() * 0.003, phase: Math.random() * Math.PI * 2, rPhase: Math.random() * Math.PI * 2 };
    });

    const pulses: { x1: number; y1: number; x2: number; y2: number; p: number; speed: number }[] = [];
    let pulseTimer = 0;
    let t = 0;

    function nodePos(n: typeof nodes[0], time: number): [number, number] {
      const a = n.baseAngle + Math.sin(time * n.speed * 60 + n.phase) * 0.25;
      const r = n.r + Math.sin(time * 0.8 + n.rPhase) * 14;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    }

    function dist(a: [number, number], b: [number, number]) {
      return Math.hypot(a[0] - b[0], a[1] - b[1]);
    }

    function spawnPulse(x1: number, y1: number, x2: number, y2: number) {
      const thinking = isThinkingRef.current;
      pulses.push({ x1, y1, x2, y2, p: 0, speed: (thinking ? 0.03 : 0.018) + Math.random() * 0.014 });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const thinking = isThinkingRef.current;

      const outerPos = nodes.map(n => nodePos(n, t));
      const innerPos = innerNodes.map(n => nodePos(n, t));

      // Center orb
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, thinking ? 52 : 38);
      grad.addColorStop(0, thinking ? 'rgba(220,38,38,0.5)' : 'rgba(220,38,38,0.25)');
      grad.addColorStop(1, 'rgba(220,38,38,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, thinking ? 52 : 38, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, thinking ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = COL.node;
      ctx.fill();

      // Outer–outer connections
      for (let i = 0; i < outerPos.length; i++) {
        for (let j = i + 1; j < outerPos.length; j++) {
          const d = dist(outerPos[i], outerPos[j]);
          if (d < 130) {
            const alpha = (1 - d / 130) * (thinking ? 0.55 : 0.35);
            ctx.beginPath();
            ctx.moveTo(outerPos[i][0], outerPos[i][1]);
            ctx.lineTo(outerPos[j][0], outerPos[j][1]);
            ctx.strokeStyle = COL.line.replace('VAL', alpha.toFixed(2));
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Inner–outer connections
      for (let i = 0; i < innerPos.length; i++) {
        const closest = outerPos.map((p, j) => ({ j, d: dist(innerPos[i], p) })).sort((a, b) => a.d - b.d).slice(0, 2);
        for (const { j, d } of closest) {
          const alpha = (1 - d / 200) * (thinking ? 0.65 : 0.45);
          ctx.beginPath();
          ctx.moveTo(innerPos[i][0], innerPos[i][1]);
          ctx.lineTo(outerPos[j][0], outerPos[j][1]);
          ctx.strokeStyle = COL.line.replace('VAL', Math.max(0, alpha).toFixed(2));
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Center–inner connections
      for (const p of innerPos) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p[0], p[1]);
        ctx.strokeStyle = COL.line.replace('VAL', '0.3');
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Spawn pulses
      const spawnInterval = thinking ? 12 : 28;
      pulseTimer++;
      if (pulseTimer > spawnInterval) {
        pulseTimer = 0;
        const i = Math.floor(Math.random() * outerPos.length);
        const j = Math.floor(Math.random() * innerPos.length);
        if (Math.random() > 0.5) {
          spawnPulse(outerPos[i][0], outerPos[i][1], innerPos[j][0], innerPos[j][1]);
        } else {
          const k = Math.floor(Math.random() * outerPos.length);
          if (dist(outerPos[i], outerPos[k]) < 130) spawnPulse(outerPos[i][0], outerPos[i][1], outerPos[k][0], outerPos[k][1]);
        }
      }

      // Draw pulses + trails
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pu = pulses[i];
        pu.p += pu.speed;
        if (pu.p > 1) { pulses.splice(i, 1); continue; }
        const px = pu.x1 + (pu.x2 - pu.x1) * pu.p;
        const py = pu.y1 + (pu.y2 - pu.y1) * pu.p;
        const fade = Math.sin(pu.p * Math.PI);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = COL.pulse.replace('VAL', (fade * 0.9).toFixed(2));
        ctx.fill();
        for (let tr = 1; tr <= 3; tr++) {
          const tp = Math.max(0, pu.p - tr * 0.04);
          const tx = pu.x1 + (pu.x2 - pu.x1) * tp;
          const ty = pu.y1 + (pu.y2 - pu.y1) * tp;
          ctx.beginPath();
          ctx.arc(tx, ty, 1.5 - tr * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = COL.pulse.replace('VAL', (fade * 0.3 / tr).toFixed(2));
          ctx.fill();
        }
      }

      // Draw nodes (outer + inner)
      for (const p of [...outerPos, ...innerPos]) {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 7, 0, Math.PI * 2);
        ctx.fillStyle = COL.nodeGlow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p[0], p[1], 2.5, 0, Math.PI * 2);
        ctx.fillStyle = COL.node;
        ctx.fill();
      }

      // Scanning boundary ring
      const scanR = 105 + Math.sin(t * 0.6) * 12;
      ctx.beginPath();
      ctx.arc(cx, cy, scanR, 0, Math.PI * 2);
      ctx.strokeStyle = thinking ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      t += 0.016;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.visualSection}>
      <div className={styles.coreGlow} />
      <canvas
        ref={canvasRef}
        width={420}
        height={420}
        style={{ width: '420px', height: '420px' }}
      />

      {/* Floating Intel badges */}
      <div className="absolute inset-x-0 bottom-12 flex justify-center gap-8 px-12 transition-opacity duration-1000" style={{ opacity: isConnected ? 1 : 0.3 }}>
        <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                <ShieldCheck className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Secure</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                <Zap className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Nosana GPU</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                <Globe className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Mainnet</span>
        </div>
      </div>

      <div className="absolute top-12 left-12 flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            <Cpu className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter uppercase whitespace-nowrap">IQ-5 <span className="text-red-500">Neural Core</span></span>
            <span className="text-[9px] font-mono text-zinc-500 tracking-widest">OS_STATUS: {isConnected ? "ONLINE" : "BOOTING..."}</span>
        </div>
      </div>
    </div>
  );
};



export default function ChatPage() {
  const { messages, connected, loading, sendMessage } = useElizaChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className={styles.chatLayoutContainer}>
      <div className={styles.splitLayout}>
        
        {/* Left Side: Visualization */}
        <IQ5Core isThinking={loading} isConnected={connected} />

        {/* Right Side: Chat Terminal */}
        <main className={styles.chatSection}>
          <header className={styles.chatHeader}>
            <div className="flex items-center gap-4">
               <Link href="/dashboard" className="p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all">
                  <ArrowLeft className="w-4 h-4" />
               </Link>
               <div>
                  <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-red-500" />
                    Sentinel Command
                  </h1>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Encryption_v2</span>
                    <span className="text-[8px] font-mono text-red-500/50">NODE_PRD_442</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-red-500' : 'bg-zinc-800'} ${loading ? 'animate-pulse' : ''}`} />
            </div>
          </header>

          <div className={styles.messageArea} ref={scrollRef}>
             <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.role === 'agent' ? -10 : 10, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className={`${styles.messageBubble} ${msg.role === 'agent' ? styles.agentMessage : styles.userMessage}`}
                    style={{ maxWidth: '75%' }}
                  >
                    <div className="text-[11px] uppercase font-bold tracking-[0.15em] mb-3 flex items-center gap-2 text-zinc-100/60">
                       {msg.role === 'agent' ? <Cpu className="w-3.5 h-3.5 text-red-500" /> : <Terminal className="w-3.5 h-3.5 text-zinc-400" />}
                       {msg.role === 'agent' ? "IQ-5 Neural Logic" : "Terminal Command"}
                    </div>
                    <div className="break-words whitespace-pre-wrap font-medium text-[15px] text-white">
                       {msg.text}
                    </div>
                  </motion.div>
                ))}
             </AnimatePresence>
             
             {loading && (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex items-center gap-3 px-4 py-2"
                >
                   <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                   <span className="text-[10px] font-mono text-red-500/40 tracking-[0.3em] uppercase">Processing_Neural_Input...</span>
                </motion.div>
             )}
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.consoleHeader}>
                <div className={styles.consoleLabel}>
                    <div className={styles.statusBlink} />
                    <span>System_Active</span>
                    <span className="opacity-20">//</span>
                    <span className="text-red-500/50">Protocol_v3.2</span>
                </div>
                <div className={styles.consoleLabel}>
                    <span>Signal: 100%</span>
                    <span className="opacity-20">//</span>
                    <span className="text-zinc-500 text-[9px]">Lat: 18ms</span>
                </div>
            </div>
            <div className={styles.inputWrapper}>
               <div className="pl-4 pr-2 text-red-500/50">
                  <Terminal className="w-4 h-4" />
               </div>
               <input 
                  type="text" 
                  placeholder={connected ? "Await operator command..." : "Initializing sequence..."}
                  className={styles.chatInput}
                  value={input}
                  disabled={loading}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <button 
                  className={styles.sendBtn} 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
               >
                  <Send className="w-4 h-4" />
               </button>
            </div>
            <div className="mt-4 flex items-center justify-between px-2">
                <div className="flex gap-4">
                    <span className="text-[8px] font-mono text-zinc-600 tracking-widest uppercase">Mem: 4.2GB</span>
                    <span className="text-[8px] font-mono text-zinc-600 tracking-widest uppercase">Grid: Nosana_X1</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-500 uppercase flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                    Terminal_ID: 0x7F2...91A
                </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
