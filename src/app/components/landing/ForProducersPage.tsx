/**
 * FOR PRODUCERS PAGE - Продюсерская экосистема Promo.music
 * Beats Marketplace (API), Services Calculator, Audio Before/After (Web Audio)
 * Полностью адаптивный: xs (475px) - 2xl (1536px+)
 */

import { motion, useInView, AnimatePresence } from 'motion/react';
import {
  Music, TrendingUp, Users, BarChart3, Zap, Target, Sparkles, Sliders,
  PlayCircle, Star, CheckCircle2, Crown, DollarSign, Headphones,
  ShoppingCart, Upload, Disc3, Mic2, Settings, Wallet, FileText, Shield,
  Package, Clock, Award, Play, Pause, Volume2, Lock,
  ArrowDown, Layers, Gauge, GitBranch, MessageSquare, BadgeCheck, Monitor,
  AlertCircle, Calculator, ChevronDown, Minus, Plus,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import producerHeroImage from "figma:asset/ade4bda61e3006203aaddfdec034541c58c8e762.png";
import { useBeats, useProducerServices, usePortfolio } from '@/hooks/useLandingData';
import type { MarketplaceBeat, ProducerService as ProducerServiceType, PortfolioItem } from '@/hooks/useLandingData';

interface ForProducersPageProps {
  onGetStarted: () => void;
}

/* ── Section heading helper ─────────────────────────────── */

function SectionHeading({ badge, title, accent, subtitle }: {
  badge?: string; title: string; accent: string; subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-10 sm:mb-14"
    >
      {badge && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3 h-3" />
          {badge}
        </div>
      )}
      <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 leading-tight">
        {title} <span className="text-blue-400">{accent}</span>
      </h2>
      <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    </motion.div>
  );
}

/* ── Glass card helper ──────────────────────────────────── */

function GlassCard({ children, className = '', delay = 0, hover = true }: {
  children: React.ReactNode; className?: string; delay?: number; hover?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={`bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.08] transition-colors hover:border-blue-500/20 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ── Skeleton loader ───────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-4 sm:p-5 animate-pulse">
      <div className="aspect-square rounded-xl bg-white/[0.06] mb-3 sm:mb-4" />
      <div className="h-4 bg-white/[0.06] rounded mb-2 w-3/4" />
      <div className="h-3 bg-white/[0.06] rounded mb-3 w-1/2" />
      <div className="flex gap-2 mb-3">
        <div className="h-5 bg-white/[0.06] rounded-full w-14" />
        <div className="h-5 bg-white/[0.06] rounded-full w-10" />
        <div className="h-5 bg-white/[0.06] rounded-full w-12" />
      </div>
      <div className="flex justify-between">
        <div className="h-5 bg-white/[0.06] rounded w-16" />
        <div className="h-4 bg-white/[0.06] rounded w-20" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WEB AUDIO - Before/After Demo Player
   Генерирует синтезированные звуки для демонстрации
   ═══════════════════════════════════════════════════════════ */

type AudioVariant = 'before' | 'after';

// Audio profiles per service type
const AUDIO_PROFILES: Record<string, {
  before: { freq: number; type: OscillatorType; gain: number; filterFreq: number; distortion: number };
  after: { freq: number; type: OscillatorType; gain: number; filterFreq: number; distortion: number };
}> = {
  'Сведение': {
    before: { freq: 220, type: 'sawtooth', gain: 0.35, filterFreq: 800, distortion: 0.3 },
    after: { freq: 220, type: 'sawtooth', gain: 0.22, filterFreq: 4000, distortion: 0 },
  },
  'Мастеринг': {
    before: { freq: 330, type: 'triangle', gain: 0.18, filterFreq: 1200, distortion: 0 },
    after: { freq: 330, type: 'triangle', gain: 0.28, filterFreq: 8000, distortion: 0 },
  },
  'Аранжировка': {
    before: { freq: 261.63, type: 'sine', gain: 0.2, filterFreq: 2000, distortion: 0 },
    after: { freq: 261.63, type: 'square', gain: 0.15, filterFreq: 6000, distortion: 0 },
  },
  'Ремикс': {
    before: { freq: 196, type: 'sine', gain: 0.2, filterFreq: 3000, distortion: 0 },
    after: { freq: 196, type: 'sawtooth', gain: 0.18, filterFreq: 5000, distortion: 0.05 },
  },
  'Саунд-дизайн': {
    before: { freq: 440, type: 'sine', gain: 0.2, filterFreq: 5000, distortion: 0 },
    after: { freq: 440, type: 'sawtooth', gain: 0.12, filterFreq: 1500, distortion: 0.1 },
  },
};

function useAudioPlayer() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode[]; gain: GainNode } | null>(null);
  const [playing, setPlaying] = useState<string | null>(null); // "id-before" | "id-after"

  const stop = useCallback(() => {
    if (nodesRef.current) {
      const { osc, gain } = nodesRef.current;
      gain.gain.exponentialRampToValueAtTime(0.001, (ctxRef.current?.currentTime ?? 0) + 0.1);
      setTimeout(() => {
        osc.forEach(o => { try { o.stop(); } catch {} });
      }, 120);
      nodesRef.current = null;
    }
    setPlaying(null);
  }, []);

  const play = useCallback((id: string, variant: AudioVariant, serviceType: string) => {
    stop();

    const profile = AUDIO_PROFILES[serviceType] || AUDIO_PROFILES['Сведение'];
    const p = profile[variant];

    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(p.gain, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Low-pass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(p.filterFreq, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);
      filter.connect(masterGain);

      // Waveshaper for distortion (before sounds)
      let lastNode: AudioNode = filter;
      if (p.distortion > 0) {
        const waveshaper = ctx.createWaveShaper();
        const amount = p.distortion * 400;
        const samples = 44100;
        const curve = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
          const x = (i * 2) / samples - 1;
          curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
        }
        waveshaper.curve = curve;
        waveshaper.connect(filter);
        lastNode = waveshaper;
      }

      const oscillators: OscillatorNode[] = [];

      // Base note
      const osc1 = ctx.createOscillator();
      osc1.type = p.type;
      osc1.frequency.setValueAtTime(p.freq, ctx.currentTime);
      osc1.connect(lastNode);
      osc1.start();
      oscillators.push(osc1);

      // Harmony (fifth up)
      const osc2 = ctx.createOscillator();
      osc2.type = variant === 'after' ? 'sine' : p.type;
      osc2.frequency.setValueAtTime(p.freq * 1.5, ctx.currentTime);
      const harmonyGain = ctx.createGain();
      harmonyGain.gain.setValueAtTime(variant === 'after' ? 0.12 : 0.06, ctx.currentTime);
      osc2.connect(harmonyGain);
      harmonyGain.connect(lastNode);
      osc2.start();
      oscillators.push(osc2);

      // Sub bass for "after" to show more fullness
      if (variant === 'after') {
        const sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(p.freq / 2, ctx.currentTime);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.08, ctx.currentTime);
        sub.connect(subGain);
        subGain.connect(filter);
        sub.start();
        oscillators.push(sub);
      }

      // LFO for before - slight detuning to show "messy" sound
      if (variant === 'before') {
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(4.5, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(8, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfo.start();
        oscillators.push(lfo);
      }

      nodesRef.current = { osc: oscillators, gain: masterGain };
      const key = `${id}-${variant}`;
      setPlaying(key);

      // Auto-stop after 4 seconds
      setTimeout(() => {
        if (nodesRef.current?.gain === masterGain) {
          stop();
        }
      }, 4000);
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { play, stop, playing };
}

/* ── Before/After Card ──────────────────────────────────── */

function BeforeAfterCard({
  item, audioPlayer,
}: {
  item: PortfolioItem;
  audioPlayer: ReturnType<typeof useAudioPlayer>;
}) {
  const { play, stop, playing } = audioPlayer;
  const beforeKey = `${item.id}-before`;
  const afterKey = `${item.id}-after`;
  const isBeforePlaying = playing === beforeKey;
  const isAfterPlaying = playing === afterKey;

  const handlePlay = (variant: AudioVariant) => {
    const key = `${item.id}-${variant}`;
    if (playing === key) {
      stop();
    } else {
      play(item.id, variant, item.type);
    }
  };

  return (
    <GlassCard delay={0} className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0">
          <h4 className="font-bold text-sm sm:text-base truncate">{item.title}</h4>
          <p className="text-xs text-slate-500">{item.artist} - {item.year}</p>
        </div>
        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] sm:text-xs rounded-full font-semibold flex-shrink-0 ml-2">
          {item.type}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">{item.description}</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Before */}
        <button
          onClick={() => handlePlay('before')}
          className={`rounded-xl p-3 sm:p-4 border text-center transition-all cursor-pointer ${
            isBeforePlaying
              ? 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/5'
              : 'bg-white/[0.03] border-white/5 hover:bg-red-500/5 hover:border-red-500/15'
          }`}
        >
          <div className="text-[10px] sm:text-xs text-slate-500 mb-2">До обработки</div>
          <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${
            isBeforePlaying ? 'bg-red-500/25' : 'bg-red-500/10'
          }`}>
            {isBeforePlaying ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                <Pause className="w-4 h-4 text-red-400" />
              </motion.div>
            ) : (
              <Play className="w-4 h-4 text-red-400 ml-0.5" />
            )}
          </div>
          {isBeforePlaying && (
            <div className="flex items-end justify-center gap-0.5 h-3 mb-1">
              {[...Array(8)].map((_, j) => (
                <motion.div
                  key={j}
                  animate={{ height: [2, 6 + Math.random() * 6, 2] }}
                  transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, delay: j * 0.04 }}
                  className="w-0.5 bg-red-400/60 rounded-full"
                  style={{ minHeight: 2 }}
                />
              ))}
            </div>
          )}
          <span className="text-[10px] sm:text-xs text-slate-400">
            {isBeforePlaying ? 'Играет...' : 'Слушать'}
          </span>
        </button>

        {/* After */}
        <button
          onClick={() => handlePlay('after')}
          className={`rounded-xl p-3 sm:p-4 border text-center transition-all cursor-pointer ${
            isAfterPlaying
              ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5'
              : 'bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10 hover:border-blue-500/20'
          }`}
        >
          <div className="text-[10px] sm:text-xs text-blue-400 font-semibold mb-2">После обработки</div>
          <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${
            isAfterPlaying ? 'bg-blue-500/30' : 'bg-blue-500/20'
          }`}>
            {isAfterPlaying ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                <Pause className="w-4 h-4 text-blue-400" />
              </motion.div>
            ) : (
              <Play className="w-4 h-4 text-blue-400 ml-0.5" />
            )}
          </div>
          {isAfterPlaying && (
            <div className="flex items-end justify-center gap-0.5 h-3 mb-1">
              {[...Array(8)].map((_, j) => (
                <motion.div
                  key={j}
                  animate={{ height: [2, 6 + Math.random() * 6, 2] }}
                  transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, delay: j * 0.04 }}
                  className="w-0.5 bg-blue-400/60 rounded-full"
                  style={{ minHeight: 2 }}
                />
              ))}
            </div>
          )}
          <span className="text-[10px] sm:text-xs text-blue-400 font-semibold">
            {isAfterPlaying ? 'Играет...' : 'Слушать'}
          </span>
        </button>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SERVICE CALCULATOR - Интерактивный виджет
   ═══════════════════════════════════════════════════════════ */

const SERVICE_TYPES_CALC = [
  { type: 'mixing', label: 'Сведение', icon: Sliders, basePrice: 8000, perTrack: true, deliveryDays: 4 },
  { type: 'mastering', label: 'Мастеринг', icon: Gauge, basePrice: 5000, perTrack: true, deliveryDays: 2 },
  { type: 'arrangement', label: 'Аранжировка', icon: Layers, basePrice: 15000, perTrack: true, deliveryDays: 6 },
  { type: 'vocal_recording', label: 'Запись вокала', icon: Mic2, basePrice: 3000, perTrack: false, deliveryDays: 1 },
  { type: 'ghost_production', label: 'Гост-продакшн', icon: GitBranch, basePrice: 25000, perTrack: true, deliveryDays: 10 },
  { type: 'beatmaking', label: 'Кастомный бит', icon: Music, basePrice: 10000, perTrack: true, deliveryDays: 5 },
  { type: 'sound_design', label: 'Саунд-дизайн', icon: Headphones, basePrice: 12000, perTrack: false, deliveryDays: 7 },
  { type: 'consultation', label: 'Консультация', icon: MessageSquare, basePrice: 2000, perTrack: false, deliveryDays: 0 },
];

function ServiceCalculator() {
  const [selectedServices, setSelectedServices] = useState<string[]>(['mixing']);
  const [trackCount, setTrackCount] = useState(1);
  const [isRush, setIsRush] = useState(false);
  const [extraRevisions, setExtraRevisions] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const RUSH_SURCHARGE = 0.5; // 50% за срочность
  const REVISION_PRICE = 2000;
  const COMMISSION = 0.10;

  const calculation = useMemo(() => {
    let baseTotal = 0;
    let totalDays = 0;

    for (const svcType of selectedServices) {
      const svc = SERVICE_TYPES_CALC.find(s => s.type === svcType);
      if (!svc) continue;
      if (svc.perTrack) {
        baseTotal += svc.basePrice * trackCount;
      } else {
        baseTotal += svc.basePrice;
      }
      totalDays = Math.max(totalDays, svc.deliveryDays);
    }

    const revisionsTotal = extraRevisions * REVISION_PRICE;
    const subtotal = baseTotal + revisionsTotal;
    const rushAmount = isRush ? subtotal * RUSH_SURCHARGE : 0;
    const total = subtotal + rushAmount;
    const commission = total * COMMISSION;
    const producerEarns = total - commission;

    if (isRush) {
      totalDays = Math.max(1, Math.ceil(totalDays * 0.5));
    }

    return { baseTotal, revisionsTotal, rushAmount, total, commission, producerEarns, totalDays };
  }, [selectedServices, trackCount, isRush, extraRevisions]);

  const toggleService = (type: string) => {
    setSelectedServices(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const fmt = (n: number) => n.toLocaleString('ru-RU');

  return (
    <GlassCard delay={0} hover={false} className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          Калькулятор стоимости
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-slate-400 hover:text-white transition-colors"
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        {/* Service selection */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Выберите услуги</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SERVICE_TYPES_CALC.map(svc => {
              const isSelected = selectedServices.includes(svc.type);
              return (
                <button
                  key={svc.type}
                  onClick={() => toggleService(svc.type)}
                  className={`p-2.5 rounded-xl text-[10px] sm:text-xs font-medium transition-all text-left flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-500/15 border border-blue-500/30 text-blue-300'
                      : 'bg-white/[0.03] border border-white/5 text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <svc.icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="truncate">{svc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Track count */}
        <div className="mb-5">
          <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Количество треков</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTrackCount(Math.max(1, trackCount - 1))}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="text-2xl font-black text-blue-400 w-12 text-center">{trackCount}</div>
            <button
              onClick={() => setTrackCount(Math.min(20, trackCount + 1))}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={1}
              max={20}
              value={trackCount}
              onChange={e => setTrackCount(Number(e.target.value))}
              className="flex-1 accent-blue-500 h-1"
            />
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setIsRush(!isRush)}
            className={`p-3 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              isRush
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                : 'bg-white/[0.03] border border-white/5 text-slate-400 hover:bg-white/[0.06]'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isRush ? 'text-amber-400' : 'text-slate-500'}`} />
            Срочный заказ (+50%)
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Правки +{extraRevisions}</span>
            <button
              onClick={() => setExtraRevisions(Math.max(0, extraRevisions - 1))}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setExtraRevisions(Math.min(10, extraRevisions + 1))}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="border-t border-white/[0.06] pt-5 space-y-3">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Базовая стоимость</span>
            <span>{fmt(calculation.baseTotal)} ₽</span>
          </div>
          {calculation.revisionsTotal > 0 && (
            <div className="flex justify-between text-sm text-slate-400">
              <span>Доп. правки ({extraRevisions} x {fmt(REVISION_PRICE)} ₽)</span>
              <span>+{fmt(calculation.revisionsTotal)} ₽</span>
            </div>
          )}
          {calculation.rushAmount > 0 && (
            <div className="flex justify-between text-sm text-amber-400">
              <span>Наценка за срочность</span>
              <span>+{fmt(calculation.rushAmount)} ₽</span>
            </div>
          )}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Итого</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-400">{fmt(calculation.total)} ₽</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Комиссия платформы (10%)</span>
            <span className="text-red-400">-{fmt(calculation.commission)} ₽</span>
          </div>
          <div className="flex justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <span className="text-sm font-semibold text-emerald-400">Продюсер получит</span>
            <span className="text-lg font-black text-emerald-400">{fmt(calculation.producerEarns)} ₽</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Ориентировочный срок: {calculation.totalDays === 0 ? 'Онлайн' : `${calculation.totalDays} дн.`}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function ForProducersPage({ onGetStarted }: ForProducersPageProps) {
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });
  const [activeLicense, setActiveLicense] = useState<'basic' | 'premium' | 'exclusive'>('premium');
  const [playingBeat, setPlayingBeat] = useState<string | null>(null);

  // API data hooks
  const { data: beatsData, isLoading: beatsLoading, error: beatsError } = useBeats({ sort: 'popular', limit: 8 });
  const { data: servicesData, isLoading: servicesLoading } = useProducerServices();
  const { data: portfolioData, isLoading: portfolioLoading } = usePortfolio();

  // Audio player for before/after
  const audioPlayer = useAudioPlayer();

  // Fallback demo beats when API not available
  const fallbackBeats: MarketplaceBeat[] = [
    { id: 'fb-1', title: 'Midnight Flow', producer: 'BeatKing', bpm: 140, key: 'Am', genre: 'Trap', tags: ['dark','melodic'], duration: '3:12', price: 5000, plays: 12400, purchases: 23, rating: 4.9, status: 'active', createdAt: new Date().toISOString() },
    { id: 'fb-2', title: 'Summer Vibes', producer: 'SoundMaster', bpm: 120, key: 'C', genre: 'Pop', tags: ['upbeat','summer'], duration: '2:58', price: 7500, plays: 8900, purchases: 41, rating: 4.8, status: 'active', createdAt: new Date().toISOString() },
    { id: 'fb-3', title: 'Dark Energy', producer: 'NightBeats', bpm: 150, key: 'F#m', genre: 'Drill', tags: ['drill','aggressive'], duration: '3:38', price: 6000, plays: 15600, purchases: 18, rating: 4.7, status: 'active', createdAt: new Date().toISOString() },
    { id: 'fb-4', title: 'Lo-Fi Dreams', producer: 'ChillProd', bpm: 85, key: 'Dm', genre: 'Lo-Fi', tags: ['chill','lofi'], duration: '4:01', price: 4000, plays: 22100, purchases: 67, rating: 5.0, status: 'active', createdAt: new Date().toISOString() },
  ];

  const beats = beatsData ?? fallbackBeats;

  const fallbackPortfolio: PortfolioItem[] = [
    { id: 'pf-1', title: 'Сведение вокала R&B трека', artist: 'Лиана', type: 'Сведение', year: '2025', description: 'Баланс вокала с бэкингом, деэссер, компрессия, ревербератор.', producerId: 'artist-maxam' },
    { id: 'pf-2', title: 'Мастеринг Trap альбома', artist: 'Тимур', type: 'Мастеринг', year: '2025', description: 'EQ, мультибэнд-компрессия, лимитирование до -14 LUFS.', producerId: 'artist-dan' },
    { id: 'pf-3', title: 'Аранжировка поп-хита', artist: 'Сандра', type: 'Аранжировка', year: '2026', description: 'Из демо на телефон - в полноценную аранжировку с живыми струнными.', producerId: 'artist-alisa' },
    { id: 'pf-4', title: 'Техно-ремикс клубного трека', artist: 'Ева', type: 'Ремикс', year: '2025', description: 'Переработка оригинала в техно-формат для клубного DJ-сета.', producerId: 'artist-eva' },
  ];

  const portfolio = portfolioData ?? fallbackPortfolio;

  /* ── Static data ────────────────────────────────────── */

  const stats = [
    { label: 'Продюсеров', value: '1,200+', icon: Users, growth: '+38%' },
    { label: 'Битов в каталоге', value: '8,500+', icon: Music, growth: '+64%' },
    { label: 'Продаж за месяц', value: '2,100+', icon: ShoppingCart, growth: '+52%' },
    { label: 'Средний рейтинг', value: '4.8', icon: Star, growth: '+0.3' },
  ];

  const licenses = {
    basic: {
      name: 'Basic Lease', nameRu: 'Базовая аренда', price: '5 000 ₽',
      color: 'from-slate-500 to-slate-600', borderColor: 'border-slate-500/30',
      features: [
        { text: 'Формат MP3 (320 kbps)', included: true },
        { text: 'До 5 000 стримов', included: true },
        { text: 'Некоммерческое использование', included: true },
        { text: 'Указание автора бита', included: true },
        { text: 'WAV / STEMS', included: false },
        { text: 'Коммерческое использование', included: false },
        { text: 'Безлимитные стримы', included: false },
      ],
    },
    premium: {
      name: 'Premium Lease', nameRu: 'Премиум-аренда', price: '15 000 ₽',
      color: 'from-blue-500 to-cyan-500', borderColor: 'border-blue-500/30',
      features: [
        { text: 'Формат WAV (24-bit)', included: true },
        { text: 'До 50 000 стримов', included: true },
        { text: 'Коммерческое использование', included: true },
        { text: 'Указание автора бита', included: true },
        { text: 'Использование в видео', included: true },
        { text: 'STEMS (мультитрек)', included: false },
        { text: 'Безлимитные стримы', included: false },
      ],
    },
    exclusive: {
      name: 'Exclusive Rights', nameRu: 'Эксклюзивные права', price: '50 000+ ₽',
      color: 'from-amber-500 to-orange-500', borderColor: 'border-amber-500/30',
      features: [
        { text: 'WAV + STEMS (мультитрек)', included: true },
        { text: 'Безлимитные стримы', included: true },
        { text: 'Полное коммерческое использование', included: true },
        { text: 'Бит снимается с продажи', included: true },
        { text: 'Полная передача прав', included: true },
        { text: 'Лицензионное соглашение', included: true },
        { text: 'Приоритетная поддержка', included: true },
      ],
    },
  };

  const SERVICE_TYPE_LABELS: Record<string, { label: string; icon: typeof Sliders }> = {
    mixing: { label: 'Сведение', icon: Sliders },
    mastering: { label: 'Мастеринг', icon: Gauge },
    arrangement: { label: 'Аранжировка', icon: Layers },
    vocal_recording: { label: 'Запись вокала', icon: Mic2 },
    ghost_production: { label: 'Гост-продакшн', icon: GitBranch },
    beatmaking: { label: 'Битмейкинг', icon: Music },
    sound_design: { label: 'Саунд-дизайн', icon: Headphones },
    consultation: { label: 'Консультация', icon: MessageSquare },
  };

  const dashboardTabs = [
    { icon: BarChart3, label: 'Обзор', desc: 'Статистика продаж, прослушиваний, рейтинг' },
    { icon: Music, label: 'Мои биты', desc: 'Управление каталогом битов' },
    { icon: Settings, label: 'Профиль', desc: 'Портфолио, специализации, оборудование' },
    { icon: Package, label: 'Услуги', desc: 'Управление услугами и заказами' },
    { icon: Wallet, label: 'Кошелёк', desc: 'Баланс, транзакции, вывод средств' },
  ];

  const features = [
    { icon: Music, title: 'Beats Marketplace', desc: 'Продавайте биты с гибкой системой лицензий. Мини-плеер для прослушивания, теги, BPM, тональность.' },
    { icon: Sliders, title: 'Services Marketplace', desc: 'Предлагайте услуги сведения, мастеринга, аранжировки. Примеры работ до/после, калькулятор стоимости.' },
    { icon: FileText, title: 'Лицензии и договоры', desc: 'Автоматическая генерация лицензионных соглашений. Basic Lease, Premium, Exclusive.' },
    { icon: BarChart3, title: 'Producer Dashboard', desc: 'Управление битами, профилем, услугами, финансами. Аналитика продаж и прослушиваний.' },
    { icon: Wallet, title: 'Финансы и вывод', desc: 'Прозрачная система комиссий (10%). Вывод от 500 ₽ на карту, ЮMoney, банковский счёт.' },
    { icon: Target, title: 'Продвижение битов', desc: 'Featured listing, баннеры на главной, genre spotlight. Статистика показов, кликов, конверсий.' },
    { icon: Star, title: 'Репутация и отзывы', desc: 'Система рейтингов и отзывов от покупателей. Детальные оценки: качество, коммуникация, сроки.' },
    { icon: Award, title: 'Портфолио до/после', desc: 'Демонстрируйте качество работы с аудио до и после обработки. Обложки, описания, внешние ссылки.' },
    { icon: Shield, title: 'Гарантии платформы', desc: 'Моментальный доступ к файлам, лицензионное соглашение, возврат при проблемах с доставкой.' },
  ];

  const workflow = [
    { step: '01', title: 'Создайте профиль', desc: 'Укажите специализации, загрузите портфолио, настройте оборудование и ПО', icon: Settings },
    { step: '02', title: 'Загрузите биты', desc: 'Добавьте аудио, обложку, BPM, тональность, жанр. Настройте цены лицензий', icon: Upload },
    { step: '03', title: 'Публикуйте услуги', desc: 'Опишите что включено, сроки, примеры до/после, требования к материалам', icon: Package },
    { step: '04', title: 'Получайте заказы', desc: 'Покупатели находят вас через маркетплейс. 90% от продажи - ваш доход', icon: DollarSign },
  ];

  const specializations = [
    'Битмейкинг', 'Сведение', 'Мастеринг', 'Аранжировка', 'Саунд-дизайн',
    'Гост-продакшн', 'Запись вокала', 'Сессионная работа', 'Консультации', 'Полный продакшн',
  ];

  const commissionExample = {
    beatPrice: 15000,
    commission: 0.10,
    get commissionAmount() { return this.beatPrice * this.commission; },
    get netAmount() { return this.beatPrice - this.commissionAmount; },
  };

  const formatNumber = (n: number) => n.toLocaleString('ru-RU');

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white pb-12 sm:pb-16 md:pb-20">

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '50vh' }}>
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.18, 0.32, 0.18] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/4 rounded-full bg-blue-500"
            style={{ width: 420, height: 320, filter: 'blur(130px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.22, 1], opacity: [0.12, 0.25, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-1/4 right-1/4 rounded-full bg-cyan-500"
            style={{ width: 360, height: 280, filter: 'blur(110px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.10, 0.20, 0.10] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute top-1/2 right-1/3 rounded-full bg-violet-500"
            style={{ width: 300, height: 240, filter: 'blur(100px)' }}
          />
        </div>

        <motion.img
          src={producerHeroImage}
          alt="Студия звукозаписи"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: [1, 1.01, 1] }}
          transition={{
            opacity: { duration: 1.2, ease: 'easeOut' },
            scale: { duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          }}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ mixBlendMode: 'lighten' }}
        />

        <div className="absolute top-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-b from-[#0a0a14] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-44 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="absolute bottom-8 sm:bottom-14 left-0 right-0 px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-blue-500/20 mb-4">
              <Disc3 className="w-4 h-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-bold text-white/90">Для продюсеров и битмейкеров</span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black leading-tight max-w-4xl">
              Монетизируй{' '}
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                style={{ backgroundSize: '200% auto' }}
              >
                свой звук
              </motion.span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 mt-3 sm:mt-4 max-w-2xl leading-relaxed">
              Продавай биты, предлагай услуги сведения и мастеринга, строй репутацию - всё в одной экосистеме Promo.music
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA row */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
            <Button onClick={onGetStarted} className="bg-blue-500 hover:bg-blue-600 font-bold px-8 py-6 rounded-full text-base sm:text-lg group w-full sm:w-auto">
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Начать продавать
            </Button>
            <Button variant="outline" className="border-2 border-white/20 hover:bg-white/10 font-bold px-8 py-6 rounded-full text-base sm:text-lg w-full sm:w-auto">
              <PlayCircle className="w-5 h-5 mr-2" />
              Смотреть демо
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-400">
            {['Бесплатная регистрация', 'Комиссия всего 10%', 'Вывод от 500 ₽', 'Генератор лицензий'].map((text, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <div ref={statsRef} className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isStatsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 * i }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/[0.08] text-center group"
            >
              <s.icon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-400 mb-1">{s.value}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mb-1.5">{s.label}</div>
              <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                {s.growth}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════ BEATS MARKETPLACE (API) ═══════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SectionHeading
          badge="Маркетплейс"
          title="Продавай биты"
          accent="по всему миру"
          subtitle="Каталог с поиском по жанру, BPM, тональности и тегам. Мини-плеер для прослушивания, три типа лицензий."
        />

        {/* API status indicator */}
        {beatsData && (
          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-emerald-400/70">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Данные загружены с сервера - {beats.length} битов</span>
          </div>
        )}
        {beatsError && (
          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-amber-400/70">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Используются демо-данные</span>
          </div>
        )}

        {beatsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {beats.slice(0, 8).map((beat, i) => (
              <GlassCard key={beat.id} delay={i * 0.06} className="p-4 sm:p-5 group">
                {/* Cover */}
                <div className="relative aspect-square rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 mb-3 sm:mb-4 overflow-hidden flex items-center justify-center">
                  <Music className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400/40" />
                  <button
                    onClick={() => setPlayingBeat(playingBeat === beat.id ? null : beat.id)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      {playingBeat === beat.id ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                    </div>
                  </button>
                  {playingBeat === beat.id && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-end gap-0.5 h-4">
                        {[...Array(20)].map((_, j) => (
                          <motion.div
                            key={j}
                            animate={{ height: [4, 8 + Math.random() * 10, 4] }}
                            transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, delay: j * 0.05 }}
                            className="flex-1 bg-blue-400 rounded-full"
                            style={{ minHeight: 2 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Duration badge */}
                  {beat.duration && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] text-white/70 font-mono">
                      {beat.duration}
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-sm sm:text-base truncate">{beat.title}</h4>
                <p className="text-xs text-slate-400 mb-2">{beat.producer}</p>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 bg-white/5 rounded-full">{beat.bpm} BPM</span>
                  <span className="px-2 py-0.5 bg-white/5 rounded-full">{beat.key}</span>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full">{beat.genre}</span>
                </div>
                {beat.tags && beat.tags.length > 0 && (
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    {beat.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-white/[0.03] text-slate-500 rounded">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm sm:text-base text-blue-400">{formatNumber(beat.price)} ₽</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-0.5"><Play className="w-2.5 h-2.5" />{formatNumber(beat.plays)}</span>
                    <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-amber-400" />{beat.rating}</span>
                  </div>
                </div>
                {/* License types preview */}
                {beat.licenseTypes && (
                  <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-1 text-center">
                    <div className="text-[8px] sm:text-[9px] text-slate-500">
                      <div className="text-slate-300 font-semibold">{formatNumber(beat.licenseTypes.basic)} ₽</div>
                      Basic
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-blue-400/70">
                      <div className="text-blue-400 font-semibold">{formatNumber(beat.licenseTypes.premium)} ₽</div>
                      Premium
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-amber-400/70">
                      <div className="text-amber-400 font-semibold">{formatNumber(beat.licenseTypes.exclusive)} ₽</div>
                      Exclusive
                    </div>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════ LICENSE TYPES ═══════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SectionHeading
          badge="Лицензирование"
          title="Три типа"
          accent="лицензий"
          subtitle="Гибкая система для каждого сценария - от демо-проектов до полного коммерческого использования"
        />
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 flex-wrap">
          {(['basic', 'premium', 'exclusive'] as const).map((type) => {
            const lic = licenses[type];
            const isActive = activeLicense === type;
            return (
              <button
                key={type}
                onClick={() => setActiveLicense(type)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${lic.color} shadow-lg`
                    : 'bg-white/5 hover:bg-white/10 text-slate-400'
                }`}
              >
                {type === 'exclusive' && <Crown className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
                {lic.name}
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLicense}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="max-w-lg mx-auto"
          >
            {(() => {
              const lic = licenses[activeLicense];
              return (
                <div className={`bg-white/[0.04] backdrop-blur-sm rounded-3xl p-6 sm:p-8 border ${lic.borderColor} relative overflow-hidden`}>
                  {activeLicense === 'exclusive' && (
                    <div className="absolute top-4 right-4"><Crown className="w-8 h-8 text-amber-400/30" /></div>
                  )}
                  <div className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${lic.color} bg-clip-text text-transparent mb-2`}>{lic.name}</div>
                  <div className="text-sm text-slate-400 mb-4">{lic.nameRu}</div>
                  <div className="text-3xl sm:text-4xl font-black mb-6">{lic.price}</div>
                  <div className="space-y-3">
                    {lic.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        {f.included ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                        <span className={f.included ? 'text-slate-200' : 'text-slate-600'}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ═══════════════════════ SERVICES MARKETPLACE (API) ═══════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SectionHeading
          badge="Услуги"
          title="Предлагай"
          accent="услуги"
          subtitle="Сведение, мастеринг, аранжировка, запись вокала, гост-продакшн и консультации - с примерами работ до/после"
        />

        {servicesData && (
          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-emerald-400/70">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Реальные услуги продюсеров - {servicesData.length} активных</span>
          </div>
        )}

        {servicesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : servicesData && servicesData.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {servicesData.map((svc, i) => {
              const meta = SERVICE_TYPE_LABELS[svc.type] || { label: svc.type, icon: Package };
              const IconComp = meta.icon;
              return (
                <GlassCard key={svc.id} delay={i * 0.06} className="p-4 sm:p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                      <IconComp className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-xs text-blue-400 font-semibold">{meta.label}</div>
                      <h4 className="font-bold text-xs sm:text-sm truncate">{svc.title}</h4>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mb-3">{svc.producer}</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-blue-400">{formatNumber(svc.basePrice)} ₽</div>
                      <div className="text-[9px] text-slate-500">Цена</div>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-2 text-center">
                      <div className="text-sm font-bold">{svc.deliveryDays === 0 ? 'Онлайн' : `${svc.deliveryDays} дн.`}</div>
                      <div className="text-[9px] text-slate-500">Срок</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{svc.rating}</span>
                    <span>{svc.orders} заказов</span>
                    {svc.revisions > 0 && <span>{svc.revisions} правки</span>}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm">Услуги загружаются...</p>
        )}
      </section>

      {/* ═══════════════════════ SERVICE CALCULATOR ═══════════════════════ */}
      <section className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SectionHeading
          badge="Калькулятор"
          title="Рассчитай"
          accent="стоимость"
          subtitle="Оцени бюджет проекта и узнай сколько заработает продюсер с учётом комиссии платформы"
        />
        <ServiceCalculator />
      </section>

      {/* ═══════════════════════ FINANCIAL MODEL ═══════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SectionHeading
          badge="Финансы"
          title="Прозрачная"
          accent="монетизация"
          subtitle="Комиссия платформы всего 10%. Вы получаете 90% от каждой продажи. Вывод от 500 ₽."
        />
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <GlassCard delay={0} hover={false} className="p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              Пример расчёта
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-sm text-slate-400">Цена бита (Premium Lease)</span>
                <span className="font-bold text-lg">{formatNumber(commissionExample.beatPrice)} ₽</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                <span className="text-sm text-slate-400">Комиссия платформы (10%)</span>
                <span className="font-bold text-red-400">-{formatNumber(commissionExample.commissionAmount)} ₽</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="text-sm font-semibold text-emerald-400">Вы получаете</span>
                <span className="font-black text-2xl text-emerald-400">{formatNumber(commissionExample.netAmount)} ₽</span>
              </div>
            </div>
          </GlassCard>
          <GlassCard delay={0.1} hover={false} className="p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              Вывод средств
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Минимальная сумма вывода', value: '500 ₽', icon: ArrowDown },
                { label: 'Способы вывода', value: 'Карта, ЮMoney, Банк', icon: Shield },
                { label: 'Срок обработки', value: '1-3 рабочих дня', icon: Clock },
                { label: 'Promo-коины за активность', value: 'Бонусы за загрузки', icon: Award },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">{item.label}</div>
                    <div className="text-sm font-semibold">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ═══════════════════════ PORTFOLIO BEFORE/AFTER (Audio) ═══════════════════════ */}
      <section className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SectionHeading
          badge="Портфолио"
          title="Покажи качество"
          accent="до / после"
          subtitle="Загружай примеры работ с аудио до и после обработки - нажми кнопки для прослушивания синтезированного демо"
        />

        {portfolioData && (
          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-emerald-400/70">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Портфолио загружено с сервера - {portfolio.length} работ</span>
          </div>
        )}

        {portfolioLoading ? (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {portfolio.map((item) => (
              <BeforeAfterCard key={item.id} item={item} audioPlayer={audioPlayer} />
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-full text-xs text-blue-400/70">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Аудио генерируется Web Audio API - демонстрация разницы до/после обработки</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ DASHBOARD PREVIEW ═══════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SectionHeading
          badge="Дашборд"
          title="Producer"
          accent="Dashboard"
          subtitle="Централизованная панель управления - биты, профиль, услуги, финансы, аналитика продаж"
        />
        <GlassCard delay={0} hover={false} className="p-5 sm:p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {dashboardTabs.map((tab, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-white/5 hover:bg-blue-500/10 rounded-xl p-3 sm:p-4 text-center cursor-pointer transition-colors border border-transparent hover:border-blue-500/20 group"
              >
                <tab.icon className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-2 text-blue-400/60 group-hover:text-blue-400 transition-colors" />
                <div className="text-xs sm:text-sm font-semibold mb-0.5">{tab.label}</div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 leading-tight hidden sm:block">{tab.desc}</div>
              </motion.div>
            ))}
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4 sm:p-6 border border-white/5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[
                { label: 'Битов', val: beatsData ? String(beatsData.length) : '24', color: 'text-blue-400' },
                { label: 'Продаж', val: '156', color: 'text-emerald-400' },
                { label: 'Доход', val: '234K ₽', color: 'text-amber-400' },
                { label: 'Рейтинг', val: '4.9', color: 'text-violet-400' },
              ].map((m, i) => (
                <div key={i} className="text-center p-3 bg-white/[0.03] rounded-lg">
                  <div className={`text-lg sm:text-2xl font-black ${m.color}`}>{m.val}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <Monitor className="w-4 h-4 text-blue-400" />
              <span>Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ═══════════════════════ SPECIALIZATIONS ═══════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SectionHeading badge="Специализации" title="Укажи свои" accent="навыки" subtitle="Выбери специализации, чтобы покупатели могли найти именно тебя" />
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
          {specializations.map((spec, i) => (
            <motion.div
              key={spec}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.06, y: -2 }}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs sm:text-sm font-medium cursor-default hover:bg-blue-500/10 hover:border-blue-500/20 transition-colors"
            >
              {spec}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ FEATURES GRID ═══════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SectionHeading badge="Возможности" title="Всё для" accent="продюсера" subtitle="Полный цикл монетизации - от создания контента до управления финансами и продвижения" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <GlassCard key={i} delay={i * 0.05} className="p-5 sm:p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="font-bold text-sm sm:text-base mb-2">{f.title}</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ WORKFLOW ═══════════════════════ */}
      <section className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SectionHeading badge="Как начать" title="4 простых" accent="шага" subtitle="От регистрации до первого дохода - быстрый старт на платформе" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {workflow.map((w, i) => (
            <GlassCard key={i} delay={i * 0.08} className="p-5 sm:p-6 relative">
              <div className="text-3xl sm:text-4xl font-black text-blue-500/10 absolute top-4 right-4">{w.step}</div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4">
                <w.icon className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="font-bold text-sm sm:text-base mb-2">{w.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{w.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ FINAL CTA ═══════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <GlassCard delay={0} hover={false} className="p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500" style={{ filter: 'blur(140px)', opacity: 0.12 }} />
          </div>
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-6">
                <BadgeCheck className="w-3.5 h-3.5" />
                Начни зарабатывать уже сегодня
              </div>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
                Твой звук -<br />твой <span className="text-blue-400">доход</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
                Регистрация бесплатна. Загружай биты, предлагай услуги, получай 90% от каждой продажи.
                Promo.music - экосистема для продюсеров.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Button onClick={onGetStarted} className="bg-blue-500 hover:bg-blue-600 font-bold px-10 py-6 rounded-full text-base sm:text-lg group w-full sm:w-auto">
                  <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Создать аккаунт продюсера
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-[10px] sm:text-xs text-slate-500">
                {['Без ежемесячной платы', 'Комиссия 10%', 'Генератор лицензий', 'Вывод от 500 ₽'].map((t, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-400/50" />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
