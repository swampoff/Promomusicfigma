/**
 * CONCERT DETAIL PAGE - Детальная страница концерта
 * Загружает данные из списка концертов (getConcerts) и фильтрует по ID
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Calendar, MapPin, Clock, Ticket, Users,
  Loader2, Music, Share2, Heart, ExternalLink,
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import * as landingApi from '@/utils/api/landing-data';
import type { LandingConcert } from '@/utils/api/landing-data';

interface ConcertDetailPageProps {
  concertId: string;
  onBack: () => void;
  onArtistClick?: (artistId: string) => void;
}

export function ConcertDetailPage({ concertId, onBack, onArtistClick }: ConcertDetailPageProps) {
  const [concert, setConcert] = useState<LandingConcert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      // Load all concerts and filter by ID (no dedicated single-concert endpoint)
      const result = await landingApi.getConcerts({ limit: 100 });
      if (result.success && result.data) {
        const found = result.data.find(c => c.id === concertId);
        if (found) {
          setConcert(found);
        } else {
          setError('Концерт не найден');
        }
      } else {
        setError(result.error || 'Ошибка загрузки');
      }
      setLoading(false);
    }
    load();
  }, [concertId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
        <span className="ml-3 text-sm text-slate-400">Загрузка...</span>
      </div>
    );
  }

  if (error || !concert) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Концерт не найден</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'Запрашиваемый концерт не существует'}</p>
        <button onClick={onBack} className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Вернуться к афише
        </button>
      </div>
    );
  }

  const eventDate = concert.date
    ? new Date(concert.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })
    : '';

  const soldPercentage = concert.capacity > 0
    ? Math.round((concert.ticketsSold / concert.capacity) * 100)
    : 0;

  const fallbackCover = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Назад к афише
      </motion.button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden mb-6 sm:mb-8"
      >
        <ImageWithFallback
          src={concert.coverImage || fallbackCover}
          alt={concert.title}
          className="w-full h-48 sm:h-64 lg:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Date badge */}
        <div className="absolute top-4 left-4 bg-orange-500/90 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
          <div className="text-lg font-black text-white leading-none">
            {concert.date ? new Date(concert.date).getDate() : '?'}
          </div>
          <div className="text-[9px] text-white/80 font-bold uppercase">
            {concert.date ? new Date(concert.date).toLocaleDateString('ru-RU', { month: 'short' }) : ''}
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-1">
            {concert.title}
          </h1>
          <div className="flex items-center gap-1 text-sm text-white/80">
            <Music className="w-3.5 h-3.5" />
            <button
              onClick={() => concert.artistId && onArtistClick?.(concert.artistId)}
              className="hover:text-orange-300 transition-colors font-medium"
            >
              {concert.artist}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        {/* Date & Time */}
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            Дата и время
          </div>
          <div className="text-sm font-bold text-white capitalize">{eventDate}</div>
          {concert.time && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
              <Clock className="w-3 h-3" /> Начало в {concert.time}
            </div>
          )}
        </div>

        {/* Venue */}
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            Площадка
          </div>
          <div className="text-sm font-bold text-white">{concert.venue}</div>
          <div className="text-xs text-slate-400 mt-1">{concert.city}</div>
        </div>

        {/* Tickets */}
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Ticket className="w-3.5 h-3.5 text-orange-400" />
            Билеты
          </div>
          <div className="text-sm font-bold text-white">
            {concert.ticketPriceFrom && concert.ticketPriceTo
              ? `${Number(concert.ticketPriceFrom).toLocaleString()} - ${Number(concert.ticketPriceTo).toLocaleString()} ₽`
              : concert.ticketPriceFrom
                ? `от ${Number(concert.ticketPriceFrom).toLocaleString()} ₽`
                : 'Уточняется'
            }
          </div>
        </div>

        {/* Capacity */}
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Users className="w-3.5 h-3.5 text-orange-400" />
            Вместимость
          </div>
          <div className="text-sm font-bold text-white">
            {concert.capacity > 0 ? `${concert.capacity.toLocaleString()} мест` : 'Уточняется'}
          </div>
          {concert.ticketsSold > 0 && concert.capacity > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>Продано {concert.ticketsSold.toLocaleString()}</span>
                <span>{soldPercentage}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    soldPercentage > 80 ? 'bg-red-500' : soldPercentage > 50 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${soldPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Description */}
      {concert.description && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] rounded-xl p-5 border border-white/10 mb-6 sm:mb-8"
        >
          <h3 className="text-sm font-bold text-white mb-3">О мероприятии</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{concert.description}</p>
        </motion.div>
      )}

      {/* Genre */}
      {concert.genre && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-6 sm:mb-8"
        >
          <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-bold text-orange-300">
            {concert.genre}
          </span>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-white/5"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          Купить билет
        </motion.button>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLiked(!liked)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              liked
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: concert.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="w-11 h-11 rounded-xl bg-white/5 text-slate-400 border border-white/10 flex items-center justify-center"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Back */}
      <div className="mt-8 text-center">
        <button onClick={onBack} className="text-sm text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Вся афиша
        </button>
      </div>
    </div>
  );
}
