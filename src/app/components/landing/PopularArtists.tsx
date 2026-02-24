/**
 * POPULAR ARTISTS - Круглые аватарки популярных артистов
 * Горизонтальная прокрутка, glassmorphism + розовая палитра
 * Данные из API/KV Store с фоллбэком
 * Все размеры через inline style чтобы гарантировать корректный рендер
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, Play, Star, TrendingUp,
  Music2, MapPin, BadgeCheck, Loader2, RefreshCw,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { getPopularArtists, formatStat, type PopularArtist } from '@/utils/api/popular-artists';

const AUTO_REFRESH_MS = 60_000;

/* ── Responsive size helper ────────────────────────────── */

function useResponsiveSizes() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 375);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // circle diameter, text container width, gap, item gap, initials font
  if (width >= 1280) return { circle: 56, textW: 80, gap: 12, igap: 8, initials: 14, name: 12, genre: 10, bp: 'xl' } as const;
  if (width >= 1024) return { circle: 52, textW: 74, gap: 10, igap: 6, initials: 13, name: 12, genre: 10, bp: 'lg' } as const;
  if (width >= 768)  return { circle: 48, textW: 70, gap: 10, igap: 6, initials: 13, name: 12, genre: 10, bp: 'md' } as const;
  if (width >= 640)  return { circle: 44, textW: 66, gap: 8,  igap: 5, initials: 12, name: 11, genre: 9, bp: 'sm' } as const;
  if (width >= 475)  return { circle: 40, textW: 60, gap: 6,  igap: 4, initials: 11, name: 10, genre: 8, bp: 'xs' } as const;
  return { circle: 36, textW: 56, gap: 4, igap: 4, initials: 10, name: 9, genre: 7, bp: 'base' } as const;
}

/* ── Color palette ─────────────────────────────────────── */

const COLORS = [
  { bg: 'linear-gradient(135deg, #FF577F, #FF3366)', ring: '#FF577F' },
  { bg: 'linear-gradient(135deg, #06b6d4, #2563eb)', ring: '#06b6d4' },
  { bg: 'linear-gradient(135deg, #a855f7, #7c3aed)', ring: '#a855f7' },
  { bg: 'linear-gradient(135deg, #f59e0b, #ea580c)', ring: '#f59e0b' },
  { bg: 'linear-gradient(135deg, #10b981, #0d9488)', ring: '#10b981' },
  { bg: 'linear-gradient(135deg, #ec4899, #e11d48)', ring: '#ec4899' },
  { bg: 'linear-gradient(135deg, #6366f1, #2563eb)', ring: '#6366f1' },
  { bg: 'linear-gradient(135deg, #d946ef, #9333ea)', ring: '#d946ef' },
  { bg: 'linear-gradient(135deg, #8b5cf6, #4f46e5)', ring: '#8b5cf6' },
  { bg: 'linear-gradient(135deg, #ef4444, #ea580c)', ring: '#ef4444' },
  { bg: 'linear-gradient(135deg, #14b8a6, #06b6d4)', ring: '#14b8a6' },
  { bg: 'linear-gradient(135deg, #0ea5e9, #2563eb)', ring: '#0ea5e9' },
];

function getColor(i: number) { return COLORS[i % COLORS.length]; }

function getInitials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatTimeAgo(ts: number): string {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 5) return 'только что';
  if (d < 60) return `${d} сек назад`;
  if (d < 3600) return `${Math.floor(d / 60)} мин назад`;
  return `${Math.floor(d / 3600)} ч назад`;
}

/* ── Skeleton ──────────────────────────────────────────── */

function Skeleton({ index, sizes }: { index: number; sizes: ReturnType<typeof useResponsiveSizes> }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0 snap-center" style={{ gap: sizes.igap, width: sizes.textW }}>
      <div
        className="rounded-full bg-white/5 animate-pulse"
        style={{ width: sizes.circle, height: sizes.circle, animationDelay: `${index * 100}ms` }}
      />
      <div className="flex flex-col items-center gap-1">
        <div className="h-2.5 bg-white/5 rounded animate-pulse" style={{ width: sizes.circle * 0.8, animationDelay: `${index * 100 + 50}ms` }} />
        <div className="h-2 bg-white/5 rounded animate-pulse" style={{ width: sizes.circle * 0.55, animationDelay: `${index * 100 + 100}ms` }} />
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────── */

interface PopularArtistsProps {
  onArtistClick?: (artistId: string, artistName: string) => void;
}

export function PopularArtists({ onArtistClick }: PopularArtistsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sizes = useResponsiveSizes();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [artists, setArtists] = useState<PopularArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [, tick] = useState(0);

  const loadArtists = useCallback(async (force = false) => {
    if (force) setIsRefreshing(true); else setIsLoading(true);
    try {
      const data = await getPopularArtists(force);
      setArtists(data);
      setLastUpdated(Date.now());
    } catch { /* keep stale */ }
    finally { setIsLoading(false); setIsRefreshing(false); }
  }, []);

  useEffect(() => { loadArtists(false); }, [loadArtists]);

  useEffect(() => {
    const id = setInterval(() => {
      getPopularArtists(true).then(d => { setArtists(d); setLastUpdated(Date.now()); }).catch(() => {});
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { const id = setInterval(() => tick(n => n + 1), 10_000); return () => clearInterval(id); }, []);

  const handleRefresh = useCallback(() => { if (!isRefreshing) loadArtists(true); }, [isRefreshing, loadArtists]);

  const updateScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScroll, { passive: true });
    const t = setTimeout(updateScroll, 100);
    return () => { el.removeEventListener('scroll', updateScroll); clearTimeout(t); };
  }, [updateScroll, artists]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -scrollRef.current.clientWidth * 0.55 : scrollRef.current!.clientWidth * 0.55, behavior: 'smooth' });
  };

  /* ── Empty state ───────────────────────────────────── */

  if (!isLoading && artists.length === 0) {
    return (
      <section className="mt-6 sm:mt-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FF577F] to-[#FF3366] flex items-center justify-center shadow-lg shadow-[#FF577F]/20">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h2 className="text-base sm:text-xl font-black tracking-tight text-white">Популярные артисты</h2>
        </div>
        <div className="text-center py-10">
          <Music2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-xs text-slate-500 mb-3">Артисты скоро появятся</p>
          <button onClick={handleRefresh} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400 hover:text-white transition-all">
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>
      </section>
    );
  }

  /* ── Ring size for circles ──────────────────────────── */
  const ringOffset = sizes.circle <= 40 ? 2 : 3;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mt-6 sm:mt-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-5 lg:mb-7">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#FF577F] to-[#FF3366] flex items-center justify-center shadow-lg shadow-[#FF577F]/20">
            <Star className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight leading-tight">
              <span className="text-white">Популярные </span>
              <span className="bg-gradient-to-r from-[#FF577F] to-[#FF3366] bg-clip-text text-transparent">артисты</span>
            </div>
            <p className="hidden sm:block text-[10px] sm:text-xs md:text-sm text-slate-500 font-medium mt-0.5 leading-tight">
              Самые востребованные музыканты платформы
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {lastUpdated > 0 && (
            <span className="hidden md:inline text-[10px] text-slate-600 font-medium mr-1">{formatTimeAgo(lastUpdated)}</span>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={handleRefresh} disabled={isRefreshing}
            title="Обновить"
            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all border ${
              isRefreshing ? 'bg-[#FF577F]/10 border-[#FF577F]/30 cursor-wait' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#FF577F]/30'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isRefreshing ? 'text-[#FF577F] animate-spin' : 'text-white/70'}`} />
          </motion.button>
          <button onClick={() => scroll('left')} disabled={!canScrollLeft}
            className={`hidden sm:flex w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 border border-white/10 items-center justify-center transition-all ${canScrollLeft ? 'hover:bg-white/10 hover:border-[#FF577F]/30' : 'opacity-30 cursor-default'}`}>
            <ChevronLeft className="w-4 h-4 text-white/70" />
          </button>
          <button onClick={() => scroll('right')} disabled={!canScrollRight}
            className={`hidden sm:flex w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 border border-white/10 items-center justify-center transition-all ${canScrollRight ? 'hover:bg-white/10 hover:border-[#FF577F]/30' : 'opacity-30 cursor-default'}`}>
            <ChevronRight className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Refresh indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mb-3 overflow-hidden">
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#FF577F]/5 border border-[#FF577F]/15">
              <Loader2 className="w-3.5 h-3.5 text-[#FF577F] animate-spin" />
              <span className="text-[10px] sm:text-xs text-[#FF577F]/70 font-medium">Обновление данных...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carousel */}
      <div className="relative group/carousel">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide pb-2 pt-3 -mx-3 sm:mx-0 px-3 sm:px-0 snap-x snap-mandatory sm:snap-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', gap: sizes.gap }}
        >
          {/* Skeletons */}
          {isLoading && artists.length === 0 && Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={`s-${i}`} index={i} sizes={sizes} />
          ))}

          {/* Artists */}
          {artists.map((artist, index) => {
            const color = getColor(index);
            const hasAvatar = !!artist.avatarUrl;
            const isHovered = hoveredId === artist.id;
            const playSize = Math.round(sizes.circle * 0.4);
            const playIcon = Math.round(playSize * 0.45);

            return (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col items-center flex-shrink-0 snap-center cursor-pointer group/artist"
                style={{ gap: sizes.igap, width: sizes.textW }}
                onMouseEnter={() => setHoveredId(artist.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onArtistClick?.(artist.id, artist.name)}
              >
                {/* Avatar */}
                <div className="relative" style={{ width: sizes.circle, height: sizes.circle }}>
                  {/* Animated ring */}
                  <motion.div
                    className="absolute rounded-full opacity-0 group-hover/artist:opacity-100 transition-opacity duration-300"
                    style={{
                      inset: -ringOffset,
                      background: color.bg,
                      padding: ringOffset - 0.5,
                    }}
                    animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="w-full h-full rounded-full bg-[#0a0a14]" />
                  </motion.div>

                  {/* Static ring */}
                  <div
                    className="absolute rounded-full group-hover/artist:opacity-0 transition-opacity duration-300"
                    style={{
                      inset: -ringOffset,
                      boxShadow: `inset 0 0 0 ${ringOffset <= 2 ? 1.5 : 2}px ${color.ring}99`,
                    }}
                  />

                  {/* Circle content */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative rounded-full overflow-hidden"
                    style={{ width: sizes.circle, height: sizes.circle }}
                  >
                    {hasAvatar ? (
                      <ImageWithFallback src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: color.bg }}>
                        <span className="text-white font-black select-none" style={{ fontSize: sizes.initials }}>
                          {getInitials(artist.name)}
                        </span>
                      </div>
                    )}

                    {/* Hover play */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/artist:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={isHovered ? { scale: 1 } : { scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="rounded-full bg-[#FF577F] flex items-center justify-center shadow-lg shadow-[#FF577F]/30"
                        style={{ width: playSize, height: playSize }}
                      >
                        <Play className="text-white" style={{ width: playIcon, height: playIcon, marginLeft: 1 }} fill="white" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Position badge (top-3) */}
                  {index < 3 && (
                    <div
                      className="absolute flex items-center justify-center rounded-full border-[1.5px] border-[#0a0a14] z-10"
                      style={{
                        top: -2, right: -2,
                        width: sizes.circle <= 40 ? 14 : 18,
                        height: sizes.circle <= 40 ? 14 : 18,
                        background: color.bg,
                      }}
                    >
                      <span className="font-black text-white" style={{ fontSize: sizes.circle <= 40 ? 6 : 8 }}>{index + 1}</span>
                    </div>
                  )}

                  {/* Verified */}
                  {artist.isVerified && index >= 3 && (
                    <div className="absolute z-10" style={{ bottom: -2, right: -2 }}>
                      <BadgeCheck style={{ width: sizes.circle <= 40 ? 12 : 16, height: sizes.circle <= 40 ? 12 : 16 }} className="text-[#FF577F] fill-[#0a0a14] drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Name & Genre — wider than circle for readability */}
                <div className="text-center w-full">
                  <p className="font-bold text-white truncate group-hover/artist:text-[#FF577F] transition-colors duration-200 leading-tight" style={{ fontSize: sizes.name }}>
                    {artist.name}
                  </p>
                  <p className="text-slate-500 truncate mt-px leading-tight" style={{ fontSize: sizes.genre }}>
                    {artist.genre}
                  </p>
                  {artist.city && sizes.bp !== 'base' && (
                    <p className="flex items-center justify-center gap-0.5 text-slate-600 mt-px leading-tight" style={{ fontSize: sizes.genre }}>
                      <MapPin style={{ width: sizes.genre, height: sizes.genre }} className="flex-shrink-0" />
                      <span className="truncate">{artist.city}</span>
                    </p>
                  )}
                </div>

                {/* Stats hover — desktop */}
                <motion.div
                  initial={{ opacity: 0, y: -5, height: 0 }}
                  animate={isHovered ? { opacity: 1, y: 0, height: 'auto' } : { opacity: 0, y: -5, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 overflow-hidden"
                >
                  <TrendingUp className="w-2.5 h-2.5 text-[#FF577F] flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{formatStat(artist.plays)} прослушиваний</span>
                </motion.div>

                {/* Mobile stats */}
                <div className="sm:hidden flex items-center gap-0.5" style={{ marginTop: -2 }}>
                  <TrendingUp className="text-[#FF577F]/60 flex-shrink-0" style={{ width: 8, height: 8 }} />
                  <span className="font-bold text-slate-600" style={{ fontSize: sizes.genre + 1 }}>{formatStat(artist.plays)}</span>
                </div>
              </motion.div>
            );
          })}

          {/* View All */}
          {!isLoading && artists.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + artists.length * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col items-center flex-shrink-0 snap-center cursor-pointer group/all"
              style={{ gap: sizes.igap, width: sizes.textW }}
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-white/5 border-2 border-dashed border-white/15 group-hover/all:border-[#FF577F]/40 flex items-center justify-center transition-all duration-300 group-hover/all:bg-[#FF577F]/5"
                style={{ width: sizes.circle, height: sizes.circle }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <ChevronRight style={{ width: sizes.circle * 0.35, height: sizes.circle * 0.35 }} className="text-white/40 group-hover/all:text-[#FF577F] transition-colors" />
                  <span className="text-white/30 group-hover/all:text-[#FF577F]/70 font-bold uppercase tracking-wider transition-colors" style={{ fontSize: Math.max(5, sizes.circle * 0.15) }}>
                    все
                  </span>
                </div>
              </motion.div>
              <div className="text-center w-full">
                <p className="font-bold text-slate-500 group-hover/all:text-[#FF577F] transition-colors leading-tight" style={{ fontSize: sizes.name }}>
                  Все артисты
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Gradient edges */}
        <div className={`hidden sm:block absolute left-0 top-0 bottom-2 w-8 md:w-12 bg-gradient-to-r from-[#0a0a14] to-transparent pointer-events-none z-10 transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`hidden sm:block absolute right-0 top-0 bottom-2 w-8 md:w-12 bg-gradient-to-l from-[#0a0a14] to-transparent pointer-events-none z-10 transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* Summary stats */}
      {!isLoading && artists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 sm:mt-5 flex items-center justify-center gap-3 sm:gap-5 flex-wrap"
        >
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">{artists.length} артистов</span>
          </div>
          <div className="w-px h-3.5 bg-white/10" />
          <div className="text-[10px] sm:text-xs text-slate-500 font-medium">
            {formatStat(artists.reduce((s, a) => s + a.plays, 0))} прослушиваний
          </div>
          <div className="hidden sm:block w-px h-3.5 bg-white/10" />
          <div className="hidden sm:block text-[10px] sm:text-xs text-slate-500 font-medium">
            {formatStat(artists.reduce((s, a) => s + a.listeners, 0))} подписчиков
          </div>
          {lastUpdated > 0 && (
            <span className="contents">
              <div className="md:hidden w-px h-3.5 bg-white/10" />
              <div className="md:hidden flex items-center gap-1 text-[9px] text-slate-600 font-medium">
                <RefreshCw className="w-2.5 h-2.5" />
                <span>{formatTimeAgo(lastUpdated)}</span>
              </div>
            </span>
          )}
        </motion.div>
      )}
    </motion.section>
  );
}