/**
 * CONCERTS SECTION - Секция концертов для главной страницы
 * Загружает данные из Supabase KV через useLandingConcerts() с fallback на mock
 * Адаптивный: xs (475px) - 2xl (1536px+)
 */

import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Ticket, ArrowRight, Users, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useLandingConcerts } from '@/hooks/useLandingData';
import type { LandingConcert } from '@/hooks/useLandingData';

/* ── Fallback mock данные ──────────────────── */

interface MockConcert {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  coverImage?: string;
  ticketPriceFrom?: string;
  ticketPriceTo?: string;
  capacity?: number;
  ticketsSold?: number;
}

const FALLBACK_CONCERTS: MockConcert[] = [
  {
    id: 'mock-1',
    title: 'Сандра Live',
    artist: 'Сандра',
    date: '2026-03-15',
    time: '20:00',
    venue: 'Adrenaline Stadium',
    city: 'Москва',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    ticketPriceFrom: '2000',
    ticketPriceTo: '6000',
    capacity: 8000,
    ticketsSold: 5200,
  },
  {
    id: 'mock-2',
    title: 'Лиана Live',
    artist: 'Лиана',
    date: '2026-03-22',
    time: '20:00',
    venue: 'А2 Green Concert',
    city: 'Санкт-Петербург',
    coverImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    ticketPriceFrom: '1500',
    ticketPriceTo: '4500',
    capacity: 4000,
    ticketsSold: 2800,
  },
  {
    id: 'mock-3',
    title: 'Дэн Live',
    artist: 'Дэн',
    date: '2026-04-05',
    time: '22:00',
    venue: 'MOSAIQUE Club',
    city: 'Казань',
    coverImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    ticketPriceFrom: '2500',
    ticketPriceTo: '7000',
    capacity: 1500,
    ticketsSold: 1100,
  },
  {
    id: 'mock-4',
    title: 'Максам Live',
    artist: 'Максам',
    date: '2026-04-12',
    time: '20:00',
    venue: 'Teleclub',
    city: 'Екатеринбург',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    ticketPriceFrom: '1500',
    ticketPriceTo: '5000',
    capacity: 2500,
    ticketsSold: 1600,
  },
  {
    id: 'mock-5',
    title: 'Стелла Live',
    artist: 'Стелла',
    date: '2026-04-20',
    time: '21:00',
    venue: 'Arena Hall',
    city: 'Краснодар',
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    ticketPriceFrom: '2000',
    ticketPriceTo: '5500',
    capacity: 3000,
    ticketsSold: 1900,
  },
  {
    id: 'mock-6',
    title: 'Тимур Live',
    artist: 'Тимур',
    date: '2026-05-01',
    time: '20:00',
    venue: 'Pravda Club',
    city: 'Новосибирск',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    ticketPriceFrom: '1800',
    ticketPriceTo: '4500',
    capacity: 1200,
    ticketsSold: 950,
  },
];

/* ── Skeleton loader ────────────────────────── */

function ConcertSkeleton() {
  return (
    <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 border border-white/10 animate-pulse">
      <div className="h-40 xs:h-48 sm:h-56 bg-white/[0.06]" />
      <div className="p-4 xs:p-5 sm:p-6 space-y-3">
        <div className="h-3 bg-white/[0.06] rounded w-20" />
        <div className="h-5 bg-white/[0.06] rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-white/[0.06] rounded w-1/2" />
          <div className="h-3 bg-white/[0.06] rounded w-2/3" />
        </div>
        <div className="h-9 bg-white/[0.06] rounded-xl" />
      </div>
    </div>
  );
}

/* ── Форматирование даты ────────────────────── */

function formatConcertDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/* ── Процент проданных билетов ──────────────── */

function SoldProgress({ sold, total }: { sold: number; total: number }) {
  const pct = Math.min(100, Math.round((sold / total) * 100));
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[10px] xs:text-xs text-slate-500 mb-1">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {sold.toLocaleString('ru-RU')} / {total.toLocaleString('ru-RU')}
        </span>
        <span className={pct > 80 ? 'text-red-400 font-bold' : ''}>{pct}%</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct > 80
              ? 'linear-gradient(to right, #ef4444, #f97316)'
              : 'linear-gradient(to right, #FF577F, #a855f7)',
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CONCERTS SECTION - Основной компонент
   ═══════════════════════════════════════════════ */

export function ConcertsSection() {
  const { data: serverConcerts, isLoading, error, refetch } = useLandingConcerts(6);

  // Нормализация: серверные данные и fallback приводятся к единому виду
  const concerts: MockConcert[] = serverConcerts
    ? serverConcerts.map((c: LandingConcert) => ({
        id: c.id,
        title: c.title,
        artist: c.artist,
        date: c.date,
        time: c.time,
        venue: c.venue,
        city: c.city,
        coverImage: c.coverImage,
        ticketPriceFrom: c.ticketPriceFrom,
        ticketPriceTo: c.ticketPriceTo,
        capacity: c.capacity,
        ticketsSold: c.ticketsSold,
      }))
    : FALLBACK_CONCERTS;

  const isFromServer = !!serverConcerts;

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1.5 xs:mb-2 font-display leading-tight">
            Предстоящие концерты
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-slate-400">
            Не пропустите лучшие музыкальные события артистов Promo.music
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {isFromServer && (
            <button
              onClick={refetch}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Обновить"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <Button
            size="sm"
            className="bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full"
          >
            Все концерты
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* Data source indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 text-xs"
      >
        {isFromServer ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
            <Wifi className="w-3 h-3" />
            <span className="hidden xs:inline">Загружено с сервера</span>
            <span className="xs:hidden">Сервер</span>
          </span>
        ) : isLoading ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Загрузка...
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400">
            <WifiOff className="w-3 h-3" />
            Демо-данные
            {error && <span className="text-yellow-500/60 ml-1">- {error}</span>}
          </span>
        )}
      </motion.div>

      {/* Concerts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => <ConcertSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {concerts.map((concert, index) => (
            <motion.div
              key={concert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#FF577F]/50 transition-all cursor-pointer"
            >
              {/* Concert Image */}
              <div className="relative h-40 xs:h-48 sm:h-56 overflow-hidden">
                <ImageWithFallback
                  src={concert.coverImage}
                  alt={concert.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Price Badge */}
                {concert.ticketPriceFrom && (
                  <div className="absolute top-3 xs:top-4 right-3 xs:right-4 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full bg-[#FF577F] backdrop-blur-md text-white text-xs xs:text-sm font-bold shadow-lg">
                    <Ticket className="w-3 h-3 xs:w-3.5 xs:h-3.5 inline mr-1" />
                    от {Number(concert.ticketPriceFrom).toLocaleString('ru-RU')}₽
                  </div>
                )}
              </div>

              {/* Concert Info */}
              <div className="p-4 xs:p-5 sm:p-6 space-y-3 xs:space-y-4">
                {/* Artist */}
                <div className="text-xs xs:text-sm text-[#FF577F] font-bold">
                  {concert.artist}
                </div>

                {/* Title */}
                <h3 className="text-base xs:text-lg sm:text-xl font-black text-white line-clamp-2 group-hover:text-[#FF577F] transition-colors">
                  {concert.title}
                </h3>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs xs:text-sm text-slate-400">
                    <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0 text-[#FF577F]" />
                    <span className="truncate">{formatConcertDate(concert.date)}</span>
                    <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0 text-[#FF577F] ml-1" />
                    <span className="truncate">{concert.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs xs:text-sm text-slate-400">
                    <MapPin className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0 text-[#FF577F]" />
                    <span className="truncate">{concert.venue}, {concert.city}</span>
                  </div>
                </div>

                {/* Sold progress */}
                {concert.capacity && concert.ticketsSold != null && (
                  <SoldProgress sold={concert.ticketsSold} total={concert.capacity} />
                )}

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-2 xs:py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#FF577F] to-purple-500 hover:from-[#FF4D7D] hover:to-purple-600 text-white font-bold text-xs xs:text-sm transition-all shadow-md shadow-[#FF577F]/20"
                >
                  Купить билет
                </motion.button>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FF577F]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Mobile Show All Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="sm:hidden flex justify-center mt-6"
      >
        <Button
          size="lg"
          className="bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-8 py-6 rounded-full text-sm"
        >
          Все концерты
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
