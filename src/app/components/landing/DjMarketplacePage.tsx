/**
 * DJ MARKETPLACE — Публичный каталог диджеев
 * Клиенты находят и бронируют DJ без авторизации (букинг требует логин)
 * Фильтрация по жанру, городу, рейтингу, цене
 * Цветовая схема: purple/violet (соответствует ForDJsPage)
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, Star, Disc3, Calendar, Music, Filter, X,
  ChevronDown, Heart, Play, Clock, Users, Award, Headphones,
  Sparkles, ArrowRight, CheckCircle2, Zap, TrendingUp, Globe
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { DjProfilePage } from './DjProfilePage';
import type { DjProfileData } from './DjProfilePage';

interface DjMarketplacePageProps {
  onGetStarted: () => void;
}

/* ═══════ MOCK DATA ═══════ */

interface DjProfile {
  id: string;
  name: string;
  photo: string;
  city: string;
  genres: string[];
  rating: number;
  reviewsCount: number;
  priceFrom: number;
  experience: string;
  verified: boolean;
  available: boolean;
  topGenre: string;
  completedGigs: number;
  bio: string;
  tags: string[];
}

const ALL_GENRES = [
  'House', 'Techno', 'Deep House', 'EDM', 'Trance', 'Hip-Hop',
  'Pop', 'R&B', 'Drum & Bass', 'Disco', 'Lounge', 'Open Format'
];

const ALL_CITIES = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург',
  'Новосибирск', 'Сочи', 'Краснодар', 'Ростов-на-Дону'
];

const MOCK_DJS: DjProfile[] = [
  {
    id: 'dj-1',
    name: 'DJ Pulse',
    photo: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400&h=400&fit=crop&crop=face',
    city: 'Москва',
    genres: ['House', 'Deep House', 'Techno'],
    rating: 4.9,
    reviewsCount: 34,
    priceFrom: 25000,
    experience: '8 лет',
    verified: true,
    available: true,
    topGenre: 'House',
    completedGigs: 7,
    bio: 'Резидент лучших клубов Москвы. Энергичные сеты от deep до tech house.',
    tags: ['Клубы', 'Фестивали', 'Корпоративы']
  },
  {
    id: 'dj-2',
    name: 'DJ Stella',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    city: 'Санкт-Петербург',
    genres: ['Pop', 'R&B', 'Disco', 'Open Format'],
    rating: 5.0,
    reviewsCount: 42,
    priceFrom: 30000,
    experience: '6 лет',
    verified: true,
    available: true,
    topGenre: 'Open Format',
    completedGigs: 12,
    bio: 'Свадебный и event DJ №1 в Питере. Знаю, как сделать ваш праздник незабываемым.',
    tags: ['Свадьбы', 'Корпоративы', 'Дни рождения']
  },
  {
    id: 'dj-3',
    name: 'DJ Nexus',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    city: 'Казань',
    genres: ['Techno', 'Trance', 'EDM'],
    rating: 4.7,
    reviewsCount: 18,
    priceFrom: 15000,
    experience: '4 года',
    verified: true,
    available: false,
    topGenre: 'Techno',
    completedGigs: 3,
    bio: 'Dark techno и melodic trance. Постоянный гость андеграундных вечеринок.',
    tags: ['Клубы', 'Underground', 'Рейвы']
  },
  {
    id: 'dj-4',
    name: 'DJ Mirage',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    city: 'Сочи',
    genres: ['Lounge', 'Deep House', 'Disco'],
    rating: 4.8,
    reviewsCount: 27,
    priceFrom: 20000,
    experience: '5 лет',
    verified: true,
    available: true,
    topGenre: 'Lounge',
    completedGigs: 9,
    bio: 'Beach party и lounge атмосфера. Летние сеты у бассейна - мой конёк.',
    tags: ['Beach Party', 'Lounge', 'Рестораны']
  },
  {
    id: 'dj-5',
    name: 'DJ Volt',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    city: 'Екатеринбург',
    genres: ['EDM', 'House', 'Drum & Bass'],
    rating: 4.6,
    reviewsCount: 15,
    priceFrom: 18000,
    experience: '3 года',
    verified: false,
    available: true,
    topGenre: 'EDM',
    completedGigs: 5,
    bio: 'Энергия на максимум! EDM, bass house и drum & bass для взрывных вечеринок.',
    tags: ['Фестивали', 'Клубы', 'Студенческие']
  },
  {
    id: 'dj-6',
    name: 'DJ Aurora',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    city: 'Москва',
    genres: ['Trance', 'EDM', 'House'],
    rating: 4.9,
    reviewsCount: 31,
    priceFrom: 35000,
    experience: '10 лет',
    verified: true,
    available: true,
    topGenre: 'Trance',
    completedGigs: 11,
    bio: 'Emotional trance и progressive house. Создаю атмосферу, которую вы запомните навсегда.',
    tags: ['Фестивали', 'Клубы', 'Open Air']
  },
  {
    id: 'dj-7',
    name: 'DJ Crypto',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    city: 'Краснодар',
    genres: ['Hip-Hop', 'R&B', 'Pop'],
    rating: 4.5,
    reviewsCount: 12,
    priceFrom: 12000,
    experience: '2 года',
    verified: false,
    available: true,
    topGenre: 'Hip-Hop',
    completedGigs: 4,
    bio: 'Hip-hop, trap и R&B. Молодой, энергичный, всегда на одной волне с аудиторией.',
    tags: ['Вечеринки', 'Студенческие', 'Бары']
  },
  {
    id: 'dj-8',
    name: 'DJ Phantom',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    city: 'Новосибирск',
    genres: ['Techno', 'Deep House', 'House'],
    rating: 4.8,
    reviewsCount: 22,
    priceFrom: 22000,
    experience: '7 лет',
    verified: true,
    available: true,
    topGenre: 'Deep House',
    completedGigs: 8,
    bio: 'Глубокий саунд и минимализм. Резидент клуба Tele-Club. Миксы на Mixcloud: 50K+ plays.',
    tags: ['Клубы', 'After-party', 'Корпоративы']
  },
];

const PRICE_RANGES = [
  { label: 'Любая', min: 0, max: Infinity },
  { label: 'До 15K', min: 0, max: 15000 },
  { label: '15K – 25K', min: 15000, max: 25000 },
  { label: '25K – 40K', min: 25000, max: 40000 },
  { label: 'От 40K', min: 40000, max: Infinity },
];

/* ═══════ COMPONENT ═══════ */

export function DjMarketplacePage({ onGetStarted }: DjMarketplacePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedPriceIdx, setSelectedPriceIdx] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [expandedDj, setExpandedDj] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'popularity'>('rating');
  const [selectedDj, setSelectedDj] = useState<DjProfile | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const priceRange = PRICE_RANGES[selectedPriceIdx];

  const filteredDjs = useMemo(() => {
    const filtered = MOCK_DJS.filter(dj => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = dj.name.toLowerCase().includes(q) ||
          dj.city.toLowerCase().includes(q) ||
          dj.genres.some(g => g.toLowerCase().includes(q)) ||
          dj.tags.some(t => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (selectedCity && dj.city !== selectedCity) return false;
      if (selectedGenre && !dj.genres.includes(selectedGenre)) return false;
      if (dj.priceFrom < priceRange.min || dj.priceFrom > priceRange.max) return false;
      if (onlyAvailable && !dj.available) return false;
      if (onlyVerified && !dj.verified) return false;
      return true;
    });

    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'price_asc': return a.priceFrom - b.priceFrom;
        case 'price_desc': return b.priceFrom - a.priceFrom;
        case 'popularity': return b.completedGigs - a.completedGigs;
        default: return 0;
      }
    });
  }, [searchQuery, selectedCity, selectedGenre, selectedPriceIdx, onlyAvailable, onlyVerified, sortBy]);

  const activeFiltersCount = [
    selectedCity, selectedGenre, selectedPriceIdx > 0, onlyAvailable, onlyVerified
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedGenre('');
    setSelectedPriceIdx(0);
    setOnlyAvailable(false);
    setOnlyVerified(false);
  };

  const sortLabels: Record<typeof sortBy, string> = {
    rating: 'По рейтингу',
    price_asc: 'Сначала дешёвые',
    price_desc: 'Сначала дорогие',
    popularity: 'По популярности',
  };

  // If a DJ profile is selected, show profile page
  if (selectedDj) {
    return (
      <DjProfilePage
        dj={selectedDj as DjProfileData}
        onBack={() => setSelectedDj(null)}
        onBook={onGetStarted}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white pb-12">

      {/* ═══════ HERO ═══════ */}
      <section className="relative py-8 sm:py-12 px-3 sm:px-5 lg:px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[300px] h-[200px] bg-purple-600/20 rounded-full" style={{ filter: 'blur(100px)' }} />
          <div className="absolute bottom-0 right-1/4 w-[250px] h-[180px] bg-violet-500/15 rounded-full" style={{ filter: 'blur(80px)' }} />
        </div>

        <div className="relative text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 backdrop-blur-xl rounded-full border border-purple-500/20 mb-4">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-xs sm:text-sm font-bold text-purple-300">DJ Marketplace</span>
              <span className="px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-[9px] font-bold text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black mb-2">
              Найдите идеального <span className="text-purple-400">DJ</span>
            </h1>
            <p className="text-sm lg:text-base text-gray-400 max-w-lg mx-auto">
              {MOCK_DJS.length} диджеев в {ALL_CITIES.length} городах. Фильтруйте по жанру, бюджету и рейтингу.
            </p>
          </motion.div>
        </div>

        {/* ═══════ SEARCH BAR ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative max-w-2xl mx-auto mb-4"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Имя, жанр, город или тег..."
              className="w-full pl-10 pr-12 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* ═══════ FILTER TOGGLE ═══════ */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filtersOpen || activeFiltersCount > 0
                ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[9px] font-black rounded-full">{activeFiltersCount}</span>
            )}
          </motion.button>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="text-[10px] text-gray-500 hover:text-purple-400 transition-colors">
              Сбросить все
            </button>
          )}
        </div>

        {/* ═══════ FILTERS PANEL ═══════ */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-2xl mx-auto mb-6 overflow-hidden"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-4">
                {/* City */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Город</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCity('')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${!selectedCity ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                      Все
                    </button>
                    {ALL_CITIES.map(city => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city === selectedCity ? '' : city)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${selectedCity === city ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Genre */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Жанр</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedGenre('')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${!selectedGenre ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                      Все
                    </button>
                    {ALL_GENRES.map(genre => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre === selectedGenre ? '' : genre)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${selectedGenre === genre ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Бюджет</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRICE_RANGES.map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPriceIdx(idx)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${selectedPriceIdx === idx ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={e => setOnlyAvailable(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500/30"
                    />
                    <span className="text-[10px] text-gray-400">Только свободные</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyVerified}
                      onChange={e => setOnlyVerified(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500/30"
                    />
                    <span className="text-[10px] text-gray-400">Только верифицированные</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════ RESULTS COUNT ═══════ */}
      <div className="px-3 sm:px-5 lg:px-6 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Найдено: <span className="text-white font-bold">{filteredDjs.length}</span> DJ
          </span>
          <div className="flex items-center gap-1.5">
            {(['rating', 'price_asc', 'price_desc', 'popularity'] as const).map(key => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                  sortBy === key
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {sortLabels[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ DJ CARDS GRID ═══════ */}
      <section className="px-3 sm:px-5 lg:px-6">
        {filteredDjs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Disc3 className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-400 mb-2">DJ не найдены</h3>
            <p className="text-sm text-gray-600 mb-4">Попробуйте изменить фильтры или поисковый запрос</p>
            <button onClick={clearFilters} className="text-sm text-purple-400 hover:text-purple-300 font-bold">
              Сбросить фильтры
            </button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-3 lg:gap-4">
            {filteredDjs.map((dj, idx) => (
              <motion.div
                key={dj.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                layout
                className="bg-white/5 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all overflow-hidden group"
              >
                {/* Top row: photo + info */}
                <div className="p-3 lg:p-4">
                  <div className="flex gap-3 lg:gap-4">
                    {/* Photo */}
                    <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={dj.photo}
                        alt={dj.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Online / Offline dot */}
                      <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${dj.available ? 'bg-green-400' : 'bg-gray-500'}`} />
                      {/* Fav button */}
                      <button
                        onClick={() => toggleFavorite(dj.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className={`w-3 h-3 ${favorites.has(dj.id) ? 'fill-red-400 text-red-400' : 'text-white/70'}`} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm lg:text-base font-black text-white truncate cursor-pointer hover:text-purple-300 transition-colors" onClick={() => setSelectedDj(dj)}>{dj.name}</h3>
                        {dj.verified && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-gray-500 mb-1.5">
                        <MapPin className="w-3 h-3" />
                        <span>{dj.city}</span>
                        <span className="text-gray-700">•</span>
                        <Clock className="w-3 h-3" />
                        <span>{dj.experience}</span>
                      </div>
                      {/* Rating + Price */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-white">{dj.rating}</span>
                          <span className="text-[10px] text-gray-600">({dj.reviewsCount})</span>
                        </div>
                        <div className="text-xs font-black text-purple-400">
                          от {(dj.priceFrom / 1000).toFixed(0)}K ₽
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-[10px] lg:text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">{dj.bio}</p>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dj.genres.slice(0, 3).map(g => (
                      <span key={g} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-bold text-purple-300">
                        {g}
                      </span>
                    ))}
                    {dj.genres.length > 3 && (
                      <span className="px-2 py-0.5 bg-white/5 rounded-full text-[9px] text-gray-500">
                        +{dj.genres.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {dj.tags.map(tag => (
                      <span key={tag} className="text-[9px] text-gray-600">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Bottom action bar */}
                <div className="px-3 lg:px-4 py-2.5 lg:py-3 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{dj.completedGigs} букингов</span>
                    {dj.available && (
                      <span className="flex items-center gap-1 text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Свободен
                      </span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDj(dj)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg text-[10px] lg:text-xs font-bold shadow shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-1"
                  >
                    Забронировать
                    <ArrowRight className="w-3 h-3" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════ BOTTOM CTA ═══════ */}
      <section className="px-3 sm:px-5 lg:px-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-5 lg:p-6 border border-purple-500/20 text-center"
        >
          <Disc3 className="w-8 h-8 mx-auto mb-3 text-purple-400" />
          <h3 className="text-lg sm:text-xl font-black mb-2">
            Вы DJ? Создайте свой профиль
          </h3>
          <p className="text-xs lg:text-sm text-gray-400 mb-4 max-w-md mx-auto">
            Попадите в каталог, принимайте букинги и зарабатывайте. Бесплатная регистрация.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2"
          >
            <Headphones className="w-4 h-4" />
            Зарегистрироваться как DJ
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}