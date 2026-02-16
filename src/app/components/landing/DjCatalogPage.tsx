/**
 * DJ CATALOG PAGE - Публичный каталог диджеев
 * Использует dj-marketplace API (fetchDjList)
 * Фильтры: город, жанр, цена, рейтинг
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, Star, Filter, X, Loader2, Disc3,
  CheckCircle2, Calendar, Coins, ChevronDown,
  Headphones, ArrowRight, Users, Zap,
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { fetchDjList, type DjProfile, type DjListFilters } from '@/utils/api/dj-marketplace';

interface DjCatalogPageProps {
  onDjClick: (djId: string) => void;
  onGetStarted: () => void;
}

const CITIES = ['Все города', 'Москва', 'Санкт-Петербург', 'Казань', 'Нижний Новгород', 'Екатеринбург', 'Новосибирск', 'Краснодар', 'Сочи'];
const GENRES = ['Все жанры', 'House', 'Techno', 'Deep House', 'Trance', 'Drum & Bass', 'Hip-Hop', 'Open Format', 'Pop', 'R&B'];
const SORT_OPTIONS = [
  { value: 'rating' as const, label: 'По рейтингу' },
  { value: 'price_asc' as const, label: 'Цена: по возрастанию' },
  { value: 'price_desc' as const, label: 'Цена: по убыванию' },
  { value: 'popularity' as const, label: 'По популярности' },
];

export function DjCatalogPage({ onDjClick, onGetStarted }: DjCatalogPageProps) {
  const [djs, setDjs] = useState<DjProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Все города');
  const [genre, setGenre] = useState('Все жанры');
  const [sort, setSort] = useState<DjListFilters['sort']>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const loadDjs = useCallback(async () => {
    setLoading(true);
    const filters: DjListFilters = {
      sort,
      ...(city !== 'Все города' && { city }),
      ...(genre !== 'Все жанры' && { genre }),
      ...(search && { search }),
      ...(verifiedOnly && { verified: true }),
      ...(availableOnly && { available: true }),
    };
    const result = await fetchDjList(filters);
    setDjs(result);
    setLoading(false);
  }, [city, genre, sort, search, verifiedOnly, availableOnly]);

  useEffect(() => {
    loadDjs();
  }, [loadDjs]);

  const clearFilters = () => {
    setCity('Все города');
    setGenre('Все жанры');
    setSort('rating');
    setSearch('');
    setVerifiedOnly(false);
    setAvailableOnly(false);
  };

  const hasActiveFilters = city !== 'Все города' || genre !== 'Все жанры' || search || verifiedOnly || availableOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-3">
              <Disc3 className="w-3.5 h-3.5" />
              DJ Marketplace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Каталог{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">диджеев</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">Найдите идеального DJ для вашего мероприятия</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users className="w-4 h-4" />
            {loading ? '...' : `${djs.length} диджеев`}
          </div>
        </div>
      </motion.div>

      {/* Search & Filters Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mb-6 space-y-3">
        <div className="flex gap-2">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Имя DJ, жанр, город..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/40 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Фильтры
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] flex items-center justify-center">!</span>
            )}
          </button>
        </div>

        {/* Expandable filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/[0.02] rounded-xl border border-white/10 p-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* City */}
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold mb-1 block">Город</label>
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500/40 appearance-none"
                    >
                      {CITIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                    </select>
                  </div>
                  {/* Genre */}
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold mb-1 block">Жанр</label>
                    <select
                      value={genre}
                      onChange={e => setGenre(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500/40 appearance-none"
                    >
                      {GENRES.map(g => <option key={g} value={g} className="bg-gray-900">{g}</option>)}
                    </select>
                  </div>
                  {/* Sort */}
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold mb-1 block">Сортировка</label>
                    <select
                      value={sort}
                      onChange={e => setSort(e.target.value as DjListFilters['sort'])}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500/40 appearance-none"
                    >
                      {SORT_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-gray-900">{s.label}</option>)}
                    </select>
                  </div>
                  {/* Toggles */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold mb-1 block">Фильтры</label>
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-purple-500" />
                      Верифицированные
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-purple-500" />
                      Свободны сейчас
                    </label>
                  </div>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <X className="w-3 h-3" /> Сбросить фильтры
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          <span className="ml-3 text-sm text-slate-400">Загрузка каталога...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && djs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Disc3 className="w-12 h-12 text-purple-500/30 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Диджеи не найдены</h3>
          <p className="text-sm text-slate-500 mb-4">Попробуйте изменить фильтры или поисковый запрос</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              <X className="w-4 h-4" /> Сбросить фильтры
            </button>
          )}
        </div>
      )}

      {/* DJ Grid */}
      {!loading && djs.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {djs.map((dj, i) => (
            <motion.div
              key={dj.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              onClick={() => onDjClick(dj.id)}
              className="group cursor-pointer rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 overflow-hidden hover:border-purple-500/30 hover:bg-white/[0.05] transition-all"
            >
              {/* Header with avatar */}
              <div className="relative h-20 bg-gradient-to-r from-purple-600/30 via-violet-600/20 to-fuchsia-600/10">
                <div className="absolute -bottom-6 left-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-3 border-gray-900 shadow-xl">
                    <ImageWithFallback src={dj.photo} alt={dj.name} className="w-full h-full object-cover" />
                  </div>
                  {dj.available && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900" />
                  )}
                </div>
                {dj.verified && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-purple-400" />
                    <span className="text-[9px] text-purple-300 font-bold">PRO</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 pt-8">
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mb-0.5">{dj.name}</h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                  <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{dj.city}</span>
                  <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{dj.completedGigs} букингов</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className={`w-3 h-3 ${si < Math.round(dj.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white">{dj.rating}</span>
                  <span className="text-[9px] text-slate-600">({dj.reviewsCount})</span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {dj.genres.slice(0, 3).map(g => (
                    <span key={g} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-bold text-purple-300">{g}</span>
                  ))}
                  {dj.genres.length > 3 && (
                    <span className="px-2 py-0.5 bg-white/5 rounded-full text-[9px] text-slate-500">+{dj.genres.length - 3}</span>
                  )}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <span className="text-[9px] text-slate-600">от</span>
                    <span className="text-base font-black text-purple-400 ml-1">{(dj.priceFrom / 1000).toFixed(0)}K ₽</span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-bold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                    Подробнее <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 sm:mt-16 rounded-2xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 p-6 sm:p-8 text-center"
      >
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Вы - диджей?</h3>
        <p className="text-sm text-slate-400 mb-5">
          Зарегистрируйтесь как DJ и получайте заявки на букинг прямо в личном кабинете
        </p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20">
          <Zap className="w-4 h-4" />
          Создать профиль DJ
        </motion.button>
      </motion.div>
    </div>
  );
}