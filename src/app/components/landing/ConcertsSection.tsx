/**
 * CONCERTS SECTION - Секция концертов для публичной страницы
 * Агрегирует концерты из нескольких источников
 * Адаптивный: xs (475px) - 2xl (1536px+)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, MapPin, Clock, Ticket, ArrowRight, Users,
  Loader2, RefreshCw, Music, ExternalLink, Filter
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useLandingConcerts } from '@/hooks/useLandingData';
import type { LandingConcert } from '@/hooks/useLandingData';

/* ── Типы ──────────────────────────────────── */

interface NormalizedConcert {
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
  source: string;
  externalUrl?: string;
  contentRating?: string;
  description?: string;
}

/* ── Fallback mock данные ──────────────────── */

const FALLBACK_CONCERTS: NormalizedConcert[] = [
  {
    id: 'mock-1', title: 'Сандра Live', artist: 'Сандра', date: '2026-03-15', time: '20:00',
    venue: 'Adrenaline Stadium', city: 'Москва',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    ticketPriceFrom: '2000', ticketPriceTo: '6000', capacity: 8000, ticketsSold: 5200,
    source: 'promo_artist',
  },
  {
    id: 'mock-2', title: 'Лиана Live', artist: 'Лиана', date: '2026-03-22', time: '20:00',
    venue: 'А2 Green Concert', city: 'Санкт-Петербург',
    coverImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    ticketPriceFrom: '1500', ticketPriceTo: '4500', capacity: 4000, ticketsSold: 2800,
    source: 'promo_artist',
  },
  {
    id: 'mock-3', title: 'Дэн Live', artist: 'Дэн', date: '2026-04-05', time: '22:00',
    venue: 'MOSAIQUE Club', city: 'Казань',
    coverImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    ticketPriceFrom: '2500', ticketPriceTo: '7000', capacity: 1500, ticketsSold: 1100,
    source: 'promo_artist',
  },
  {
    id: 'mock-4', title: 'Максам Live', artist: 'Максам', date: '2026-04-12', time: '20:00',
    venue: 'Teleclub', city: 'Екатеринбург',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    ticketPriceFrom: '1500', ticketPriceTo: '5000', capacity: 2500, ticketsSold: 1600,
    source: 'promo_artist',
  },
  {
    id: 'mock-5', title: 'Стелла Live', artist: 'Стелла', date: '2026-04-20', time: '21:00',
    venue: 'Arena Hall', city: 'Краснодар',
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    ticketPriceFrom: '2000', ticketPriceTo: '5500', capacity: 3000, ticketsSold: 1900,
    source: 'promo_artist',
  },
  {
    id: 'mock-6', title: 'Тимур Live', artist: 'Тимур', date: '2026-05-01', time: '20:00',
    venue: 'Pravda Club', city: 'Новосибирск',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    ticketPriceFrom: '1800', ticketPriceTo: '4500', capacity: 1200, ticketsSold: 950,
    source: 'promo_artist',
  },
];

/* ── Города ─────────────────────────────────── */

const CITIES = [
  { label: 'Все города', value: '' },
  { label: 'Москва', value: 'Москва' },
  { label: 'Санкт-Петербург', value: 'Санкт-Петербург' },
  { label: 'Краснодар', value: 'Краснодар' },
  { label: 'Екатеринбург', value: 'Екатеринбург' },
  { label: 'Казань', value: 'Казань' },
  { label: 'Новосибирск', value: 'Новосибирск' },
  { label: 'Сочи', value: 'Сочи' },
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

/* ── (source badges removed - sources are transparent to users) ── */

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
  const { data: serverConcerts, isLoading, refetch } = useLandingConcerts(12);
  const [cityFilter, setCityFilter] = useState('');
  const [showCityFilter, setShowCityFilter] = useState(false);

  // Нормализация: серверные данные и fallback приводятся к единому виду
  const allConcerts: NormalizedConcert[] = serverConcerts
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
        source: c.source || 'promo_artist',
        externalUrl: c.yandexUrl,
        contentRating: c.contentRating,
        description: c.description,
      }))
    : FALLBACK_CONCERTS;

  // Фильтрация по городу
  const concerts = cityFilter
    ? allConcerts.filter(c => c.city === cityFilter)
    : allConcerts;

  // Уникальные города из данных
  const availableCities = [...new Set(allConcerts.map(c => c.city).filter(Boolean))];

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1.5 xs:mb-2 font-display leading-tight">
            Предстоящие концерты
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-slate-400">
            Афиши, билеты и события артистов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Обновить"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCityFilter(!showCityFilter)}
            className={`p-2 rounded-full transition-colors ${showCityFilter ? 'bg-[#FF577F]/20 text-[#FF577F]' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'}`}
            title="Фильтр по городу"
          >
            <Filter className="w-4 h-4" />
          </button>
          <Button
            size="sm"
            className="hidden sm:flex bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full"
          >
            Все концерты
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* City Filter */}
      <AnimatePresence>
        {showCityFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 pb-1">
              {CITIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCityFilter(c.value)}
                  className={`px-2.5 py-1 rounded-full text-[10px] xs:text-xs font-medium transition-all ${
                    cityFilter === c.value
                      ? 'bg-[#FF577F]/20 text-[#FF577F] border border-[#FF577F]/30'
                      : 'bg-white/5 text-slate-500 border border-transparent hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
              {/* Показываем города из данных, которых нет в стандартном списке */}
              {availableCities
                .filter(c => !CITIES.some(fc => fc.value === c))
                .map(c => (
                  <button
                    key={c}
                    onClick={() => setCityFilter(c)}
                    className={`px-2.5 py-1 rounded-full text-[10px] xs:text-xs font-medium transition-all ${
                      cityFilter === c
                        ? 'bg-[#FF577F]/20 text-[#FF577F] border border-[#FF577F]/30'
                        : 'bg-white/5 text-slate-500 border border-transparent hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Concerts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => <ConcertSkeleton key={i} />)}
        </div>
      ) : concerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Нет концертов по выбранным фильтрам</p>
          <p className="text-slate-600 text-xs mt-1">
            Попробуйте изменить город
          </p>
          <button
            onClick={() => setCityFilter('')}
            className="mt-3 text-xs text-[#FF577F] hover:underline"
          >
            Сбросить фильтры
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {concerts.map((concert, index) => (
            <motion.div
              key={concert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#FF577F]/50 transition-all cursor-pointer"
            >
              {/* Concert Image */}
              <div className="relative h-40 xs:h-48 sm:h-56 overflow-hidden">
                {concert.coverImage ? (
                  <ImageWithFallback
                    src={concert.coverImage}
                    alt={concert.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FF577F]/30 to-purple-600/30 flex items-center justify-center">
                    <Music className="w-12 h-12 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Price Badge */}
                {concert.ticketPriceFrom && Number(concert.ticketPriceFrom) > 0 && (
                  <div className="absolute top-3 xs:top-4 right-3 xs:right-4 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full bg-[#FF577F] backdrop-blur-md text-white text-xs xs:text-sm font-bold shadow-lg">
                    <Ticket className="w-3 h-3 xs:w-3.5 xs:h-3.5 inline mr-1" />
                    от {Number(concert.ticketPriceFrom).toLocaleString('ru-RU')}₽
                  </div>
                )}

                {/* Content rating */}
                {concert.contentRating && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-slate-400 border border-white/10">
                    {concert.contentRating}
                  </div>
                )}
              </div>

              {/* Concert Info */}
              <div className="p-4 xs:p-5 sm:p-6 space-y-3 xs:space-y-4">
                {/* Artist */}
                {concert.artist && (
                  <div className="text-xs xs:text-sm text-[#FF577F] font-bold">
                    {concert.artist}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-base xs:text-lg sm:text-xl font-black text-white line-clamp-2 group-hover:text-[#FF577F] transition-colors">
                  {concert.title}
                </h3>

                {/* Description */}
                {concert.description && (
                  <p className="text-[10px] xs:text-xs text-slate-500 line-clamp-2">{concert.description}</p>
                )}

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
                    <span className="truncate">
                      {concert.venue}{concert.venue && concert.city ? ', ' : ''}{concert.city}
                    </span>
                  </div>
                </div>

                {/* Sold progress (only for promo concerts with data) */}
                {concert.capacity && concert.capacity > 0 && concert.ticketsSold != null && (
                  <SoldProgress sold={concert.ticketsSold} total={concert.capacity} />
                )}

                {/* CTA Button */}
                {concert.externalUrl ? (
                  <motion.a
                    href={concert.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 xs:py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#FF577F] to-purple-500 hover:from-[#FF4D7D] hover:to-purple-600 text-white font-bold text-xs xs:text-sm transition-all shadow-md shadow-[#FF577F]/20 flex items-center justify-center gap-2"
                  >
                    Купить билет
                    <ExternalLink className="w-3.5 h-3.5" />
                  </motion.a>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 xs:py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#FF577F] to-purple-500 hover:from-[#FF4D7D] hover:to-purple-600 text-white font-bold text-xs xs:text-sm transition-all shadow-md shadow-[#FF577F]/20"
                  >
                    Купить билет
                  </motion.button>
                )}
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FF577F]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Legend */}
      {!isLoading && concerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[10px] xs:text-xs text-slate-600"
        >
          <span className="text-slate-700">Обновляется автоматически</span>
        </motion.div>
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