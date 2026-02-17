/**
 * ПРОМО.ГИД - тизер + интерактивное демо
 * 
 * Hero: waitlist с атмосферными fireflies (CSS animations).
 * Демо: lazy-loaded PromoGuideApp из /src/promo-guide/
 */

import { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MapPin, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';

const PromoGuideApp = lazy(() => import('@/promo-guide/PromoGuideApp'));

/* ---------- Firefly data ---------- */
interface Firefly {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  driftX: number;
  driftY: number;
  color: string;
  glow: string;
}

const COLORS = [
  { bg: 'rgba(168,85,247,0.8)', glow: 'rgba(168,85,247,0.4)' },
  { bg: 'rgba(139,92,246,0.75)', glow: 'rgba(139,92,246,0.35)' },
  { bg: 'rgba(99,102,241,0.7)', glow: 'rgba(99,102,241,0.3)' },
  { bg: 'rgba(59,130,246,0.7)', glow: 'rgba(59,130,246,0.3)' },
  { bg: 'rgba(255,87,127,0.75)', glow: 'rgba(255,87,127,0.35)' },
  { bg: 'rgba(236,72,153,0.65)', glow: 'rgba(236,72,153,0.3)' },
  { bg: 'rgba(34,211,238,0.6)', glow: 'rgba(34,211,238,0.25)' },
];

function makeFireflies(count: number): Firefly[] {
  return Array.from({ length: count }, (_, i) => {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      id: i,
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: 3 + Math.random() * 5,
      dur: 5 + Math.random() * 8,
      delay: Math.random() * 6,
      driftX: -40 + Math.random() * 80,
      driftY: -50 + Math.random() * 100,
      color: c.bg,
      glow: c.glow,
    };
  });
}

/* ---------- CSS keyframes (injected once) ---------- */
const STYLE_ID = 'promo-guide-fireflies';

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes firefly-float {
      0%   { transform: translate(0, 0) scale(0); opacity: 0; }
      15%  { transform: translate(var(--dx1), var(--dy1)) scale(1); opacity: 0.9; }
      50%  { transform: translate(var(--dx2), var(--dy2)) scale(0.8); opacity: 0.5; }
      85%  { transform: translate(var(--dx3), var(--dy3)) scale(1.1); opacity: 0.85; }
      100% { transform: translate(0, 0) scale(0); opacity: 0; }
    }
    @keyframes line-draw {
      0%   { stroke-dashoffset: 1; opacity: 0; }
      30%  { opacity: 0.7; }
      70%  { opacity: 0.5; }
      100% { stroke-dashoffset: 0; opacity: 0; }
    }
    .firefly-particle {
      animation: firefly-float var(--dur) var(--delay) ease-in-out infinite;
      will-change: transform, opacity;
    }
    .guide-line {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      animation: line-draw var(--ldur) var(--ldelay) ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

/* ---------- Component ---------- */
interface PromoGuidePageProps {
  onGetStarted: () => void;
}

export function PromoGuidePage({ onGetStarted }: PromoGuidePageProps) {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const fireflies = useMemo(() => makeFireflies(35), []);

  useMemo(() => ensureStyles(), []);

  const handleWaitlist = () => {
    if (!email || !email.includes('@')) {
      toast.error('Введите корректный email');
      return;
    }
    setJoined(true);
    toast.success('Вы в списке! Мы уведомим о запуске.');
  };

  const lines = [
    { x1: '15%', y1: '25%', x2: '35%', y2: '40%' },
    { x1: '35%', y1: '40%', x2: '58%', y2: '28%' },
    { x1: '58%', y1: '28%', x2: '80%', y2: '48%' },
    { x1: '22%', y1: '68%', x2: '48%', y2: '55%' },
    { x1: '48%', y1: '55%', x2: '72%', y2: '72%' },
    { x1: '10%', y1: '50%', x2: '22%', y2: '68%' },
    { x1: '72%', y1: '72%', x2: '88%', y2: '60%' },
    { x1: '40%', y1: '15%', x2: '58%', y2: '28%' },
  ];

  /* ===== Demo fullscreen overlay ===== */
  if (showDemo) {
    return (
      <div className="relative min-h-screen bg-[#0a0a14]">
        {/* Close demo button */}
        <div className="fixed top-3 right-3 z-[200]">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDemo(false)}
            className="flex items-center gap-1.5 px-3 py-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full text-xs font-bold text-white hover:bg-white/10 transition-all shadow-xl"
          >
            <X className="w-3.5 h-3.5" /> Закрыть демо
          </motion.button>
        </div>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
              <p className="text-sm text-gray-500">Загрузка ПРОМО.ГИД...</p>
            </div>
          </div>
        }>
          <PromoGuideApp />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="relative" style={{ minHeight: '100vh' }}>
      {/* Full-page dark background */}
      <div className="absolute inset-0 bg-[#0a0a14]" />

      {/* ===== Ambient glows ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] left-[25%] w-[400px] h-[400px] bg-purple-600 rounded-full opacity-[0.08]" style={{ filter: 'blur(200px)' }} />
        <div className="absolute bottom-[25%] right-[20%] w-[350px] h-[350px] bg-blue-600 rounded-full opacity-[0.06]" style={{ filter: 'blur(200px)' }} />
        <motion.div
          animate={{ opacity: [0.04, 0.09, 0.04], scale: [1, 1.12, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF577F] rounded-full"
          style={{ filter: 'blur(240px)' }}
        />
      </div>

      {/* ===== Fireflies (CSS animations) ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {fireflies.map(f => (
          <div
            key={f.id}
            className="absolute rounded-full firefly-particle"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: f.size,
              height: f.size,
              backgroundColor: f.color,
              boxShadow: `0 0 ${f.size * 4}px ${f.size * 1.5}px ${f.glow}`,
              '--dur': `${f.dur}s`,
              '--delay': `${f.delay}s`,
              '--dx1': `${f.driftX * 0.3}px`,
              '--dy1': `${f.driftY * 0.3}px`,
              '--dx2': `${f.driftX}px`,
              '--dy2': `${f.driftY}px`,
              '--dx3': `${f.driftX * 0.6}px`,
              '--dy3': `${f.driftY * 0.7}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ===== Subtle connection lines (hint at network) ===== */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" style={{ opacity: 0.06 }}>
        <defs>
          <linearGradient id="pg-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(139,92,246,0.8)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.4)" />
          </linearGradient>
        </defs>
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="url(#pg-line-grad)"
            strokeWidth="1"
            pathLength="1"
            className="guide-line"
            style={{
              '--ldur': `${4 + i * 0.7}s`,
              '--ldelay': `${1.5 + i * 1}s`,
            } as React.CSSProperties}
          />
        ))}
      </svg>

      {/* ===== Content ===== */}
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6" style={{ minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center max-w-lg w-full"
        >
          {/* Logo */}
          <h1 className="text-4xl xs:text-5xl sm:text-6xl font-black mb-8 sm:mb-10 leading-tight">
            <span className="text-white">ПРОМО</span>
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">.ГИД</span>
          </h1>

          {/* Heading */}
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-white mb-4 sm:mb-5 leading-snug">
            Будьте первыми
          </h2>

          {/* Subtitle */}
          <p className="text-sm xs:text-base sm:text-lg text-gray-400 mb-8 sm:mb-10 leading-relaxed max-w-md mx-auto">
            ПРОМО.ГИД изменит то, как вы открываете город. Присоединяйтесь к waitlist - первые участники получат бесплатный доступ навсегда.
          </p>

          {/* Waitlist form */}
          {!joined ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col xs:flex-row gap-2.5 sm:gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleWaitlist()}
                placeholder="your@email.com"
                className="flex-1 px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm sm:text-base text-white placeholder:text-slate-600 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleWaitlist}
                className="px-6 sm:px-7 py-3.5 sm:py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all whitespace-nowrap"
              >
                Хочу доступ
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-green-400">Вы в списке! Уведомим о запуске.</span>
            </motion.div>
          )}

          {/* Demo button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 sm:mt-8"
          >
            <button
              onClick={() => setShowDemo(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 hover:border-purple-500/30 transition-all group"
            >
              <MapPin className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              Попробовать демо
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 transition-colors" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}