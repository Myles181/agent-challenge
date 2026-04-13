"use client";

import { useState } from 'react';
import { useTheme, ThemeSwitcher } from './theme-engine';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './hero.module.css';
import { 
  Rocket, 
  Zap, 
  Radio, 
  Satellite, 
  Cpu, 
  Shield, 
  TrendingUp, 
  Building2, 
  Brain, 
  Gem, 
  Globe, 
  Link, 
  ArrowRight,
  Sparkles,
  Search,
  Activity,
  X,
  Database,
  Orbit,
  CircleDot,
  Wallet
} from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-primary)] flex items-center justify-center shadow-2xl shadow-[rgba(var(--theme-primary-rgb),0.50)] border border-[rgba(var(--theme-primary-rgb),0.30)] group-hover:border-[var(--theme-primary)] group-hover:shadow-[rgba(var(--theme-primary-rgb),0.40)] transition-all duration-500">
      <div className="w-6 h-3 bg-white/40 rounded-full group-hover:scale-110 transition-transform" />
    </div>
    <span className="font-extrabold text-3xl tracking-tighter text-white">IQ-5<span className="text-[var(--theme-primary)]">AI</span></span>
  </div>
);

const NAV_ITEMS = [
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'solutions', label: 'Solutions', href: '#use-cases' },
  { id: 'integrations', label: 'Integrations', href: '#integrations' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
];

const Nav = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  
  return (
    <motion.nav 
       initial={{ y: -100, opacity: 0, x: "-50%" }}
       animate={{ y: 0, opacity: 1, x: "-50%" }}
       transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
       className={styles.navWrapper}
    >
       <div className={styles.navGroup} onMouseLeave={() => setHovered(null)}>
          {NAV_ITEMS.map(item => (
            <a 
              key={item.id}
              href={item.href}
              className={styles.navItem}
              onMouseEnter={() => setHovered(item.id)}
            >
              {hovered === item.id && (
                <motion.div
                  layoutId="navHover"
                  className={styles.navHoverBackground}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </a>
          ))}
       </div>
       <div className="w-[1px] h-6 bg-white/10 mx-2" />
       <a href="#" className={styles.navItemActive}>
         <Sparkles className="w-3 h-3 inline mr-1" />
         Protocol Hub
       </a>
    </motion.nav>
  );
};

const FeatureCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
  <div className={styles.featureCard}>
    <div className={styles.featureIcon}>{icon}</div>
    <h3 className={styles.featureTitle}>{title}</h3>
    <p className={styles.featureText}>{text}</p>
  </div>
);

const WalletModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const router = useRouter();

  const connectWallet = (name: string) => {
    // Simulating connection
    setTimeout(() => {
      onClose();
      router.push('/dashboard');
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className={styles.modalContent}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.closeModal} onClick={onClose}>
              <X className="w-6 h-6" />
            </div>
            
            <h2 className="text-3xl font-black mb-2 tracking-tight">Connect Wallet</h2>
            <p className="text-zinc-500 mb-8 font-medium">Select your preferred provider to access the IQ-5 Sentinel Dashboard.</p>
            
            <div className={styles.walletList}>
              {[
                { name: 'Phantom', icon: '👻' },
                { name: 'Solflare', icon: '☀️' },
                { name: 'Backpack', icon: '🎒' }
              ].map((wallet) => (
                <div 
                  key={wallet.name} 
                  className={styles.walletOption}
                  onClick={() => connectWallet(wallet.name)}
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 text-xl">
                    {wallet.icon}
                  </div>
                  <span className="flex-1">{wallet.name}</span>
                  <ArrowRight className="w-4 h-4 text-zinc-700" />
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-zinc-900 text-center">
              <p className="text-zinc-600 text-sm">New to Solana? <a href="#" className="text-[var(--theme-primary)] font-bold">Learn more</a></p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Visualization = () => {
  return (
    <div className={styles.visualizerContainer}>
      <svg className={styles.svgFlow} viewBox="0 0 1200 800">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Central Core Pulse */}
        <circle cx="600" cy="400" r="120" className={styles.pulseCircle} />
        <circle cx="600" cy="400" r="80" className={styles.pulseCircle} style={{ animationDelay: '1s' }} />

        {/* Concentric Rotating Rings */}
        <circle cx="600" cy="400" r="180" className={styles.rotatingRing} />
        <circle cx="600" cy="400" r="280" className={styles.rotatingRing} style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
        <circle cx="600" cy="400" r="380" className={styles.rotatingRing} style={{ animationDuration: '90s' }} />

        {/* Core Glow */}
        <circle cx="600" cy="400" r="40" fill="url(#coreGradient)" filter="url(#glow)">
           <animate attributeName="r" values="35;45;35" dur="3s" repeatCount="indefinite" />
        </circle>
        
        <defs>
          <radialGradient id="coreGradient">
            <stop offset="0%" stopColor="var(--theme-primary)" />
            <stop offset="100%" stopColor="var(--theme-primary)" />
          </radialGradient>
        </defs>

        {/* Orbital Paths and Satellites */}
        <circle r="6" className={styles.particle} filter="url(#glow)">
           <animateMotion dur="10s" repeatCount="indefinite" path="M 600,220 A 180,180 0 1,1 599.9,220 Z" />
        </circle>
        
        <circle r="8" className={styles.particle} filter="url(#glow)">
           <animateMotion dur="25s" repeatCount="indefinite" begin="-5s" path="M 600,120 A 280,280 0 1,1 599.9,120 Z" />
        </circle>
        <circle r="4" className={styles.particle} opacity="0.4">
           <animateMotion dur="25s" repeatCount="indefinite" begin="-15s" path="M 600,120 A 280,280 0 1,1 599.9,120 Z" />
        </circle>

        <circle r="10" className={styles.particle} filter="url(#glow)">
           <animateMotion dur="40s" repeatCount="indefinite" path="M 600,20 A 380,380 0 1,1 599.9,20 Z" />
        </circle>
      </svg>

      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-380px, -200px)' }} className={styles.node + " animate-pulse"}>
        <div className={styles.nodeInside}><Gem className="w-5 h-5" /></div>
      </div>

      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(310px, 150px)' }} className={styles.node + " animate-pulse"}>
        <div className={styles.nodeInside}><Zap className="w-5 h-5" /></div>
      </div>
      
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-500px, 100px)' }}>
          <div className={styles.statusPill} style={{borderColor: 'rgba(var(--theme-primary-rgb), 0.2)'}}>
            <span className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-500" />
               Nosana Grid Active
            </span>
          </div>
      </div>

      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(420px, -220px)' }}>
          <div className={styles.statusPill} style={{borderColor: 'rgba(var(--theme-primary-rgb), 0.2)'}}>
            <span className="flex items-center gap-3">
               <Activity className="w-4 h-4 text-[var(--theme-primary)]" />
               4.2k TX/sec
            </span>
          </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const { activeTheme, selectTheme } = useTheme();

  return (
    <div className={styles.heroContainer} style={{
      "--theme-primary": activeTheme.primary,
      "--theme-primary-rgb": activeTheme.primaryRgb,
      "--theme-glow": activeTheme.glow,
      "--theme-appBg": activeTheme.appBg,
      "--theme-panelBg": activeTheme.panelBg,
      "--theme-textMain": activeTheme.textMain,
      "--theme-textMuted": activeTheme.textMuted,
      "--theme-border": activeTheme.border,
      color: activeTheme.textMain,
    } as React.CSSProperties}>
    <ThemeSwitcher activeTheme={activeTheme} selectTheme={selectTheme} />
      <header className="fixed top-0 left-0 right-0 px-12 py-8 flex justify-between items-center z-50">
        <Logo />
        <div className={styles.authButtons}>
          <button className={styles.magicButton} onClick={() => setIsWalletOpen(true)}>
            <Wallet className="w-4 h-4 mr-1" /> Connect
          </button>
        </div>
      </header>

      <Nav />

      <main className={styles.mainContent}>
        <div className={styles.floatAnimation}>
           <div className={styles.dashboardBadge}>
              <span className="w-3 h-3 bg-[var(--theme-primary)] rounded-full animate-ping mr-3" />
              {/* Pulse Ingress Active */}
           </div>

           <h1 className={styles.heading}>
             IQ-5 AI: Dominate<br />
             The Chain with Intelligence.
           </h1>

           <p className={styles.subheading}>
             The fastest blockchain monitoring agent ever built. Track billion-dollar flows, automate trading signals, and control the social narrative on decentralized GPU power.
           </p>

           <div className="flex justify-center gap-4 mb-16">
             {/* <button className={styles.primaryButton} onClick={() => setIsWalletOpen(true)}>
                <Rocket className="w-5 h-5 inline mr-2" />
                Initialize IQ-5 Protocol
             </button> */}
             <div className={styles.magicButton} onClick={() => setIsWalletOpen(true)}>
               <Activity className="w-4 h-4 text-[var(--theme-primary)]" /> Orbital Mode
             </div>
           </div>
        </div>

        <Visualization />

        <div className={styles.brandsFooter + " animate-pulse"}>
           <span className={styles.brandLogo}>SOLANA</span>
           <span className={styles.brandLogo}>ETHEREUM</span>
           <span className={styles.brandLogo}>BITCOIN</span>
           <span className={styles.brandLogo}>CHAINLINK</span>
           <span className={styles.brandLogo}>NOSANA</span>
        </div>
      </main>

      <section id="features" className={styles.sectionWrapper}>
        <div className="mb-24">
          <span className="text-[var(--theme-primary)] font-bold tracking-[0.2em] text-xs uppercase mb-6 block">Sub-Second Vigilance</span>
          <h2 className="text-7xl font-black mb-8 tracking-tighter">Vigilance. Automation. Results.</h2>
          <p className="text-zinc-500 max-w-3xl mx-auto text-xl leading-relaxed font-medium">
            Stop drowning in chain noise. IQ-5 AI filters every transaction through ElizaOS logic to deliver the pure alpha you need to lead the market.
          </p>
        </div>
        
        <div className={styles.featuresGrid}>
          <FeatureCard 
            icon={<Radio className="w-8 h-8 text-[var(--theme-primary)]" />}
            title="Satellite Scan"
            text="Distributed RPCB monitoring across all major chains. We catch liquidity migrations before they hit the DEX feeders."
          />
          <FeatureCard 
            icon={<Satellite className="w-8 h-8 text-[var(--theme-primary)]" />}
            title="Auto-X Engine"
            text="Your AI agent owns the social narrative. Custom-logic broadcasting that grows your trader network while you sleep."
          />
          <FeatureCard 
            icon={<Cpu className="w-8 h-8 text-[var(--theme-primary)]" />}
            title="Nosana Compute"
            text="The first agent protocol to run on decentralized GPUs. High-performance inference with zero-downtime reliability."
          />
        </div>
      </section>

      <section id="use-cases" className={styles.sectionWrapper}>
        <div className="grid md:grid-cols-2 gap-16 items-center bg-zinc-900/40 p-20 rounded-[5rem] border border-zinc-800 text-left relative overflow-hidden group hover:border-[rgba(var(--theme-primary-rgb),0.20)] transition-all duration-700">
           <div className="relative z-10">
              <h2 className="text-6xl font-black mb-10 tracking-tighter">The Alpha Scenarios.</h2>
              <div className="space-y-12">
                 <div className="flex gap-8 group/item">
                    <div className="p-4 rounded-xl bg-[rgba(var(--theme-primary-rgb),0.10)] border border-[rgba(var(--theme-primary-rgb),0.20)] group-hover/item:bg-[rgba(var(--theme-primary-rgb),0.20)] transition-all">
                       <TrendingUp className="w-8 h-8 text-[var(--theme-primary)]" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black mb-3">Liquidity Injection Tracking</h4>
                       <p className="text-zinc-500 text-lg">Spot when massive stables move into new DEX pools. IQ-5 flags potential runners in seconds.</p>
                    </div>
                 </div>
                 <div className="flex gap-8 group/item">
                    <div className="p-4 rounded-xl bg-[rgba(var(--theme-primary-rgb),0.10)] border border-[rgba(var(--theme-primary-rgb),0.20)] group-hover/item:bg-[rgba(var(--theme-primary-rgb),0.20)] transition-all">
                       <Building2 className="w-8 h-8 text-[var(--theme-primary)]" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black mb-3">Institutional Flow Alerts</h4>
                       <p className="text-zinc-500 text-lg">Real-time telemetry on whale-to-CEX inflows. Understand sell pressure before it happens.</p>
                    </div>
                 </div>
                 <div className="flex gap-8 group/item">
                    <div className="p-4 rounded-xl bg-[rgba(var(--theme-primary-rgb),0.10)] border border-[rgba(var(--theme-primary-rgb),0.20)] group-hover/item:bg-[rgba(var(--theme-primary-rgb),0.20)] transition-all">
                       <Brain className="w-8 h-8 text-[var(--theme-primary)]" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black mb-3">Smart Money Mimicry</h4>
                       <p className="text-zinc-500 text-lg">Follow the highest PnL wallets automatically. Your agent copies the strategy, you reap the alpha.</p>
                    </div>
                 </div>
              </div>
           </div>
           <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[rgba(var(--theme-primary-rgb),0.5)] to-[rgba(var(--theme-primary-rgb),0.5)] rounded-3xl border border-[rgba(var(--theme-primary-rgb),0.10)] flex items-center justify-center p-12">
                 <div className="w-full h-full border border-dashed border-[rgba(var(--theme-primary-rgb),0.20)] rounded-full animate-[spin_60s_linear_infinite] flex items-center justify-center">
                    <div className="w-1/2 h-1/2 bg-[rgba(var(--theme-primary-rgb),0.10)] rounded-full blur-3xl animate-pulse" />
                 </div>
              </div>
           </div>
           <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-radial-gradient from-[rgba(var(--theme-primary-rgb),0.5)] to-transparent pointer-events-none" />
        </div>
      </section>

      <section id="integrations" className={styles.sectionWrapper}>
        <h2 className="text-6xl font-black mb-16 tracking-tight">Ecosystem Synergy.</h2>
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
           {['X / TWITTER', 'DISCORD', 'TELEGRAM', 'SLACK', 'POSTGRES', 'WEBSOCKET', 'NOSANA CLOUD', 'ELIZAOS V2'].map(item => (
             <div key={item} className="px-10 py-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 font-bold tracking-widest text-zinc-500 hover:text-[var(--theme-primary)] hover:border-[rgba(var(--theme-primary-rgb),0.30)] hover:bg-[var(--theme-primary)]/5 transition-all cursor-crosshair">
               {item}
             </div>
           ))}
        </div>
      </section>

      <section id="faq" className={styles.sectionWrapper}>
        <h2 className="text-6xl font-black mb-20 tracking-tighter text-center">Intelligence FAQ.</h2>
        <div className="max-w-4xl mx-auto space-y-8">
           <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>How does IQ-5 achieve sub-second latency? <ArrowRight className="w-5 h-5 text-[var(--theme-primary)]" /></div>
              <p className={styles.faqAnswer}>By utilizing Nosana's distributed GPU network, we colocate our ElizaOS agents with the highest-reliability RPC nodes on every major chain.</p>
           </div>
           <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>Can I customize the Auto-X broadcast logic? <ArrowRight className="w-5 h-5 text-[var(--theme-primary)]" /></div>
              <p className={styles.faqAnswer}>Absolutely. You have full control over the IQ-5 filters, allowing you to define exactly what constitutes a "broadcastable" event based on volume, frequency, and sentiment.</p>
           </div>
           <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>Is my monitoring encrypted? <ArrowRight className="w-5 h-5 text-[var(--theme-primary)]" /></div>
              <p className={styles.faqAnswer}>Yes. Your agent logic and specific wallet lists are never exposed to centralized servers. Your intelligence remains yours.</p>
           </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaHeading}>Dominance is Non-Optional.</h2>
        <p className="text-zinc-500 text-2xl mb-16 max-w-2xl mx-auto font-medium text-center">
          Traders are already bridging to the next generation of automation. Join 1,200+ elite desks using IQ-5 AI.
        </p>
        <div className="flex flex-col items-center gap-10 text-center">
          <div className="flex -space-x-4">
             {[...Array(5)].map((_, i) => (
                <img key={i} className="w-14 h-14 rounded-full border-4 border-[#000103] shadow-lg" src={`https://ui-avatars.com/api/?name=${i}&background=333&color=fff`} />
             ))}
             <div className="w-14 h-14 rounded-full border-4 border-[#000103] bg-[var(--theme-primary)] flex items-center justify-center font-extrabold text-xs ring-4 ring-[rgba(var(--theme-primary-rgb),0.20)] ring-offset-4 ring-offset-zinc-950">
               +1.2k
             </div>
          </div>
          <button className={styles.primaryButton} onClick={() => setIsWalletOpen(true)}>
            <Zap className="w-5 h-5 inline mr-2" />
            Initialize IQ-5 Protocol
          </button>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
           <div className={styles.footerCol}>
              <Logo />
              <p className="mt-8 text-zinc-500 max-w-xs text-lg leading-relaxed">
                 The world's first decentralized intelligence protocol for autonomous on-chain monitoring.
              </p>
           </div>
           <div className={styles.footerCol}>
              <h4>Intelligence</h4>
              <ul>
                 <li><a href="#">Surveillance</a></li>
                 <li><a href="#">Protocol v2</a></li>
                 <li><a href="#">Agent Logic</a></li>
                 <li><a href="#">Nosana Cloud</a></li>
              </ul>
           </div>
           <div className={styles.footerCol}>
              <h4>Technical</h4>
              <ul>
                 <li><a href="#">API Access</a></li>
                 <li><a href="#">Network Status</a></li>
                 <li><a href="#">Security Audit</a></li>
              </ul>
           </div>
           <div className={styles.footerCol}>
              <h4>Ecosystem</h4>
              <ul>
                 <li><a href="#">X / Twitter</a></li>
                 <li><a href="#">Discord Hub</a></li>
                 <li><a href="#">Nosana Labs</a></li>
                 <li><a href="#">ElizaOS Repo</a></li>
              </ul>
           </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-24 pt-10 border-t border-zinc-900 text-zinc-700 flex justify-between items-center text-sm font-medium tracking-wide">
           <div>© 2026 IQ-5 PROTOCOL. CRYPTOGRAPHICALLY SECURED.</div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-[var(--theme-primary)] transition-colors">PRIVACY_PROTOCOL</a>
              <a href="#" className="hover:text-[var(--theme-primary)] transition-colors">SERVICE_LEVEL_AGREEMENT</a>
           </div>
        </div>
      </footer>

      {/* Extreme Glowing backgrounds */}
      <div style={{ position: 'absolute', left: '-10%', top: '5%', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(var(--theme-primary-rgb), 0.04) 0%, transparent 70%)', filter: 'blur(120px)' }} className="pointer-events-none" />
      <div style={{ position: 'absolute', right: '-15%', top: '40%', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(var(--theme-primary-rgb), 0.06) 0%, transparent 70%)', filter: 'blur(120px)' }} className="pointer-events-none" />
      <div style={{ position: 'absolute', left: '20%', bottom: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(var(--theme-primary-rgb), 0.03) 0%, transparent 70%)', filter: 'blur(120px)' }} className="pointer-events-none" />

      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </div>
  );
}
