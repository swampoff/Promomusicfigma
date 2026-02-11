/**
 * HERO SECTION - Главная секция landing page
 * Glassmorphism дизайн с динамическими эффектами
 * Статистика из API через usePlatformStats с fallback на mock
 */

import { useEffect, useState } from 'react';
import { Play, Sparkles, Zap, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { motion } from 'motion/react';
import { usePlatformStats } from '@/hooks/useLandingData';

interface HeroSectionProps {
  onExplore: () => void;
  onLogin: () => void;
}

// Fallback статистика
const FALLBACK_STATS = {
  totalArtists: 12,
  totalTracks: 48,
  totalPlays: 2850000,
  totalSubscribers: 340,
  updatedAt: new Date().toISOString(),
};

export function HeroSection({ onExplore, onLogin }: HeroSectionProps) {
  const { data: stats, isLoading: statsLoading } = usePlatformStats();

  const displayStats = stats || FALLBACK_STATS;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-3 xs:px-4 py-16 xs:py-20 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />

      {/* Glassmorphism Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 -left-20 bg-gradient-to-br from-purple-600/40 to-pink-600/40 rounded-full blur-3xl"
        style={{ width: 400, height: 400 }}
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 -right-20 bg-gradient-to-tl from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl"
        style={{ width: 500, height: 500 }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-600/20 to-pink-600/20 rounded-full blur-3xl"
        style={{ width: 350, height: 350 }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          animate={{
            y: [0, -100, 0],
            x: Math.random() * 100 - 50,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto text-center z-10 px-3 xs:px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 xs:gap-2.5 px-3 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-2.5 sm:py-3 mb-6 xs:mb-8 sm:mb-10 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-xl border border-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </motion.div>
            <span className="text-[10px] xs:text-xs sm:text-sm font-semibold tracking-wide">Enterprise платформа для музыкальной индустрии</span>
            <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-yellow-400" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 xs:mb-5 sm:mb-6 md:mb-8 leading-[0.9] tracking-tight"
          >
            <motion.span
              className="block mb-2 xs:mb-3 sm:mb-4 text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Promo
            </motion.span>
            <motion.span
              className="block text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: '200% 200%' }}
            >
              .music
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8 xs:mb-10 sm:mb-12 space-y-2 xs:space-y-3 sm:space-y-4"
          >
            <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-bold leading-snug max-w-4xl mx-auto">
              Маркетинговая экосистема <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                для музыкантов
              </span>
            </p>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto font-medium">
              Продвигайте треки на радиостанциях - Анализируйте эфиры - Зарабатывайте на ротациях
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-2.5 xs:gap-3 sm:gap-4 mb-10 xs:mb-12 sm:mb-16 max-w-2xl mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 xs:flex-initial"
            >
              <Button
                onClick={onExplore}
                size="lg"
                className="group relative w-full xs:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white text-sm xs:text-base sm:text-lg px-6 xs:px-8 sm:px-10 py-5 xs:py-6 sm:py-7 shadow-2xl shadow-purple-500/30 border-0 overflow-hidden font-bold"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                <Play className="w-4 h-4 xs:w-5 xs:h-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Начать бесплатно</span>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 xs:flex-initial"
            >
              <Button
                onClick={onLogin}
                size="lg"
                variant="outline"
                className="w-full xs:w-auto bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white text-sm xs:text-base sm:text-lg px-6 xs:px-8 sm:px-10 py-5 xs:py-6 sm:py-7 hover:bg-white/10 hover:border-white/30 shadow-xl font-semibold"
              >
                Войти в кабинет
              </Button>
            </motion.div>
          </motion.div>

          {/* Live Stats from API */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 max-w-4xl mx-auto"
          >
            <AnimatedStatCard
              targetValue={displayStats.totalArtists}
              label="Артистов"
              icon="🎤"
              delay={0}
              isLoading={statsLoading}
              suffix=""
            />
            <AnimatedStatCard
              targetValue={displayStats.totalTracks}
              label="Треков"
              icon="🎵"
              delay={0.1}
              isLoading={statsLoading}
              suffix=""
            />
            <AnimatedStatCard
              targetValue={displayStats.totalPlays}
              label="Прослушиваний"
              icon="📡"
              className="col-span-2 xs:col-span-1"
              delay={0.2}
              isLoading={statsLoading}
              formatLarge
              suffix=""
            />
          </motion.div>

          {/* Data source indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-4 xs:mt-6"
          >
            {stats ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/60 text-[9px] xs:text-[10px]">
                <Wifi className="w-2.5 h-2.5" />
                live
              </span>
            ) : !statsLoading ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-slate-500 text-[9px] xs:text-[10px]">
                <WifiOff className="w-2.5 h-2.5" />
                demo
              </span>
            ) : null}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Animated Stat Card with counter ─────────────────── */

function AnimatedStatCard({
  targetValue,
  label,
  icon,
  className = "",
  delay,
  isLoading,
  formatLarge,
  suffix = "",
}: {
  targetValue: number;
  label: string;
  icon: string;
  className?: string;
  delay: number;
  isLoading: boolean;
  formatLarge?: boolean;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isLoading || hasAnimated) return;

    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(targetValue * eased));

      if (current >= steps) {
        clearInterval(timer);
        setCount(targetValue);
        setHasAnimated(true);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetValue, isLoading, hasAnimated]);

  // Reset animation when targetValue changes
  useEffect(() => {
    setHasAnimated(false);
    setCount(0);
  }, [targetValue]);

  const formatDisplay = (val: number): string => {
    if (formatLarge) {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    }
    return val.toLocaleString('ru-RU') + suffix;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 + delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative p-4 xs:p-5 sm:p-6 rounded-xl xs:rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 rounded-xl xs:rounded-2xl transition-all" />
      <div className="relative">
        <div className="text-xl xs:text-2xl sm:text-3xl mb-1.5 xs:mb-2">{icon}</div>
        {isLoading ? (
          <div className="h-8 xs:h-10 sm:h-12 bg-white/5 rounded animate-pulse mb-1.5 xs:mb-2 w-3/4" />
        ) : (
          <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-1 xs:mb-1.5 sm:mb-2">
            {formatDisplay(count)}
          </div>
        )}
        <div className="text-[10px] xs:text-xs sm:text-sm md:text-base text-slate-400 font-medium">{label}</div>
      </div>
    </motion.div>
  );
}