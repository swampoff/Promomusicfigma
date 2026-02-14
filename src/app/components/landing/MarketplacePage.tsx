/**
 * MARKETPLACE - Маркетплейс битов и услуг продюсеров/звукоинженеров
 * Два раздела: Биты (инструменталы) и Услуги (сведение, мастеринг и т.д.)
 * Данные загружаются из /api/marketplace (seed beat:public:*, producer_service:public:*)
 * Цветовая схема: indigo/purple/cyan (градиент)
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Star, Music, Filter, X, Heart, Play, Pause, Clock, Users,
  Award, CheckCircle2, ShoppingCart, Sliders,
  Headphones, Mic, Volume2, Radio, Tag, SkipForward, SkipBack,
  Disc3, Settings, Layers, Package,
  Calculator, MessageSquare, BadgeCheck, Store, Loader2,
  ThumbsUp, Send, Briefcase,
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { marketplaceImage as marketplaceBanner } from '@/app/assets/banners';
import {
  fetchBeats, fetchBeatsStats, fetchServices, fetchServicesStats,
  fetchBeatReviews, submitBeatReview, toggleReviewHelpful,
  type Beat as ApiBeat, type ProducerServicePublic, type BeatsStats, type ServicesStats,
  type BeatReview, type ReviewStats,
} from '@/utils/api/marketplace';
import { ServiceOrdersPanel } from './ServiceOrdersPanel';
import { DigitalGoodsMarketplace } from './DigitalGoodsMarketplace';

interface MarketplacePageProps {
  onGetStarted: () => void;
}

/* ═══════════════════════════════════════ */
/* LOCAL TYPES (UI-enriched)               */
/* ═══════════════════════════════════════ */

interface Beat {
  id: string;
  title: string;
  producerName: string;
  producerId: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  plays: number;
  likes: number;
  purchases: number;
  reviewsCount: number;
  prices: { basic: number; premium: number; exclusive: number };
  duration: string;
  isNew: boolean;
  rating: number;
}

interface ServiceItem {
  id: string;
  type: ServiceType;
  title: string;
  description: string;
  producerName: string;
  producerId: string;
  rating: number;
  reviews: number;
  price: number;
  priceMax?: number;
  currency: string;
  deliveryDays: number;
  completedOrders: number;
  includes: string[];
}

type ServiceType = 'mixing' | 'mastering' | 'beatmaking' | 'arrangement' | 'sound_design' | 'vocal_recording' | 'ghost_production' | 'consultation' | 'session_musician';

/* ═══════════════════════════════════════ */
/* CONSTANTS                               */
/* ═══════════════════════════════════════ */

const BEAT_GENRES = ['Hip-Hop', 'Trap', 'R&B', 'Pop', 'Electronic', 'Lo-Fi', 'Drill', 'House', 'Techno', 'Rock', 'Jazz', 'Indie', 'Dance'];
const BEAT_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const LICENSE_TYPES = ['Basic', 'Premium', 'Exclusive'] as const;

const SERVICE_TYPES_MAP: Record<string, { label: string; icon: typeof Headphones; color: string }> = {
  mixing: { label: 'Сведение', icon: Sliders, color: 'from-blue-500 to-cyan-500' },
  mastering: { label: 'Мастеринг', icon: Volume2, color: 'from-purple-500 to-pink-500' },
  beatmaking: { label: 'Битмейкинг', icon: Music, color: 'from-orange-500 to-red-500' },
  arrangement: { label: 'Аранжировка', icon: Layers, color: 'from-emerald-500 to-teal-500' },
  sound_design: { label: 'Саунд-дизайн', icon: Radio, color: 'from-violet-500 to-indigo-500' },
  vocal_recording: { label: 'Запись вокала', icon: Mic, color: 'from-rose-500 to-pink-500' },
  ghost_production: { label: 'Гост-продакшн', icon: Disc3, color: 'from-gray-500 to-slate-500' },
  consultation: { label: 'Консультация', icon: MessageSquare, color: 'from-cyan-500 to-blue-500' },
  session_musician: { label: 'Сессионный музыкант', icon: Headphones, color: 'from-amber-500 to-orange-500' },
};

const BEAT_PRICE_RANGES = [
  { label: 'Любая', min: 0, max: Infinity },
  { label: 'До 5K', min: 0, max: 5000 },
  { label: '5K - 10K', min: 5000, max: 10000 },
  { label: '10K - 20K', min: 10000, max: 20000 },
  { label: 'От 20K', min: 20000, max: Infinity },
];

const SERVICE_PRICE_RANGES = [
  { label: 'Любая', min: 0, max: Infinity },
  { label: 'До 5K', min: 0, max: 5000 },
  { label: '5K - 10K', min: 5000, max: 10000 },
  { label: '10K - 25K', min: 10000, max: 25000 },
  { label: 'От 25K', min: 25000, max: Infinity },
];

// Genre-based gradient backgrounds for beats without covers
const GENRE_GRADIENTS: Record<string, string> = {
  'Trap': 'from-red-900/80 to-black/80',
  'Hip-Hop': 'from-amber-900/80 to-gray-900/80',
  'Pop': 'from-pink-800/80 to-purple-900/80',
  'Electronic': 'from-cyan-900/80 to-blue-900/80',
  'Lo-Fi': 'from-teal-900/80 to-slate-900/80',
  'Drill': 'from-gray-800/80 to-black/80',
  'House': 'from-violet-900/80 to-indigo-900/80',
  'Techno': 'from-slate-800/80 to-gray-900/80',
  'R&B': 'from-purple-900/80 to-pink-900/80',
  'Rock': 'from-orange-900/80 to-red-900/80',
  'Jazz': 'from-amber-800/80 to-yellow-900/80',
  'Indie': 'from-emerald-900/80 to-teal-900/80',
  'Dance': 'from-fuchsia-900/80 to-violet-900/80',
};

/* ═══════════════════════════════════════ */
/* HELPERS                                 */
/* ═══════════════════════════════════════ */

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return String(n);
}

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU');
}

/** Convert API beat to UI-enriched beat */
function adaptBeat(api: ApiBeat): Beat {
  const createdDate = api.createdAt ? new Date(api.createdAt) : new Date(0);
  const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

  return {
    id: api.id,
    title: api.title,
    producerName: api.producer || 'Producer',
    producerId: api.producerId || '',
    bpm: api.bpm,
    key: api.key,
    genre: api.genre,
    tags: api.tags || [],
    plays: api.plays || 0,
    likes: api.likes || 0,
    purchases: api.purchases || 0,
    reviewsCount: (api as any).reviewsCount || 0,
    prices: {
      basic: api.licenseTypes?.basic || api.price || 0,
      premium: api.licenseTypes?.premium || (api.price || 0) * 3,
      exclusive: api.licenseTypes?.exclusive || (api.price || 0) * 10,
    },
    duration: api.duration || '3:00',
    isNew: daysSinceCreated < 14,
    rating: api.rating || 0,
  };
}

/** Convert API service to UI-enriched service */
function adaptService(api: ProducerServicePublic): ServiceItem {
  return {
    id: api.id,
    type: (api.type || 'mixing') as ServiceType,
    title: api.title,
    description: api.description || '',
    producerName: api.producer || 'Специалист',
    producerId: api.producerId || '',
    rating: api.rating || 0,
    reviews: api.orders || 0,
    price: api.basePrice || api.minPrice || 0,
    priceMax: api.maxPrice,
    currency: '₽',
    deliveryDays: api.deliveryDays || 5,
    completedOrders: api.orders || 0,
    includes: api.includes || [],
  };
}

/** Producer initials for avatar placeholder */
function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* Loading skeleton card */
function SkeletonCard() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden animate-pulse">
      <div className="aspect-square bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-8 bg-white/5 rounded w-full mt-3" />
      </div>
    </div>
  );
}

function SkeletonServiceCard() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden animate-pulse p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-white/5 rounded w-1/2" />
          <div className="h-2.5 bg-white/5 rounded w-1/3" />
        </div>
      </div>
      <div className="h-5 bg-white/5 rounded w-24" />
      <div className="h-4 bg-white/5 rounded w-3/4" />
      <div className="h-3 bg-white/5 rounded w-full" />
      <div className="h-3 bg-white/5 rounded w-full" />
      <div className="h-10 bg-white/5 rounded w-full mt-2" />
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* COMPONENT                               */
/* ═══════════════════════════════════════ */

export function MarketplacePage({ onGetStarted }: MarketplacePageProps) {
  const [activeTab, setActiveTab] = useState<'beats' | 'services' | 'orders' | 'digital'>('beats');

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* ═══════ BANNER ═══════ */}
      <div className="relative w-full overflow-hidden">
        <ImageWithFallback src={marketplaceBanner} alt="Маркетплейс Promo.music" className="w-full h-auto block" />
      </div>

      {/* ═══════ TABS ═══════ */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex items-center gap-1 py-2">
            <button
              onClick={() => setActiveTab('beats')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'beats'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music className="w-4 h-4" />
              Биты
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'services'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              Услуги
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Заказы
            </button>
            <button
              onClick={() => setActiveTab('digital')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'digital'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              Товары
            </button>
          </div>
        </div>
      </div>

      {/* ═══════ TAB CONTENT ═══════ */}
      <AnimatePresence mode="wait">
        {activeTab === 'beats' ? (
          <motion.div key="beats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <BeatsMarketplace onGetStarted={onGetStarted} />
          </motion.div>
        ) : activeTab === 'services' ? (
          <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <ServicesMarketplace onGetStarted={onGetStarted} />
          </motion.div>
        ) : activeTab === 'orders' ? (
          <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <ServiceOrdersPanel />
          </motion.div>
        ) : (
          <motion.div key="digital" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <DigitalGoodsMarketplace onGetStarted={onGetStarted} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  B E A T S   M A R K E T P L A C E                     */
/* ═══════════════════════════════════════════════════════ */

function BeatsMarketplace({ onGetStarted }: { onGetStarted: () => void }) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [stats, setStats] = useState<BeatsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [keyFilter, setKeyFilter] = useState('');
  const [priceIdx, setPriceIdx] = useState(0);
  const [licenseFilter, setLicenseFilter] = useState<'' | 'basic' | 'premium' | 'exclusive'>('');
  const [bpmMin, setBpmMin] = useState('');
  const [bpmMax, setBpmMax] = useState('');
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'rating' | 'price_asc' | 'price_desc'>('popular');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null);
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(null);

  // Fetch beats and stats on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [beatsResult, statsResult] = await Promise.all([
          fetchBeats({ limit: 100 }),
          fetchBeatsStats(),
        ]);
        if (!cancelled) {
          setBeats((beatsResult.beats || []).map(adaptBeat));
          setStats(statsResult);
        }
      } catch (err) {
        console.error('Failed to load beats marketplace:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const priceRange = BEAT_PRICE_RANGES[priceIdx];

  const filtered = useMemo(() => {
    const result = beats.filter(b => {
      if (search) {
        const q = search.toLowerCase();
        if (!b.title.toLowerCase().includes(q) && !b.producerName.toLowerCase().includes(q) && !b.genre.toLowerCase().includes(q) && !b.tags.some(t => t.toLowerCase().includes(q))) return false;
      }
      if (genre && b.genre !== genre) return false;
      if (keyFilter && !b.key.startsWith(keyFilter)) return false;
      if (bpmMin && b.bpm < Number(bpmMin)) return false;
      if (bpmMax && b.bpm > Number(bpmMax)) return false;
      if (priceIdx > 0 && (b.prices.basic < priceRange.min || b.prices.basic > priceRange.max)) return false;
      return true;
    });
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'new': return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'popular': return b.plays - a.plays;
        case 'rating': return b.rating - a.rating;
        case 'price_asc': return a.prices.basic - b.prices.basic;
        case 'price_desc': return b.prices.basic - a.prices.basic;
        default: return 0;
      }
    });
  }, [beats, search, genre, keyFilter, bpmMin, bpmMax, priceIdx, sortBy]);

  const activeCount = [genre, keyFilter, priceIdx > 0, bpmMin, bpmMax, licenseFilter].filter(Boolean).length;

  const clearFilters = () => { setSearch(''); setGenre(''); setKeyFilter(''); setPriceIdx(0); setBpmMin(''); setBpmMax(''); setLicenseFilter(''); };

  const toggleFav = (id: string) => setFavorites(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleCart = (id: string) => setCart(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const sortLabels: Record<typeof sortBy, string> = {
    new: 'Новые', popular: 'Популярные', rating: 'По рейтингу', price_asc: 'Дешевле', price_desc: 'Дороже',
  };

  return (
    <div className="pb-20">
      {/* Stats */}
      <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: Music, label: 'Битов', value: stats?.totalBeats ?? beats.length, color: 'text-indigo-400' },
            { icon: Star, label: 'Рейтинг', value: stats?.avgRating?.toFixed(1) ?? '-', color: 'text-yellow-400' },
            { icon: ShoppingCart, label: 'Продано', value: formatNumber(stats?.totalSold ?? 0), color: 'text-emerald-400' },
            { icon: Users, label: 'Продюсеров', value: stats?.activeProducers ?? 0, color: 'text-purple-400' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-4 text-center"
            >
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className="text-lg sm:text-xl font-black text-white">{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 sm:px-5 lg:px-6 mb-3">
        <div className="max-w-2xl mx-auto relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Название, жанр, тег или продюсер..."
            className="w-full pl-10 pr-12 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-center gap-3 mb-3 px-3">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filtersOpen || activeCount > 0 ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />Фильтры
          {activeCount > 0 && <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[9px] font-black rounded-full">{activeCount}</span>}
        </motion.button>
        {activeCount > 0 && <button onClick={clearFilters} className="text-[10px] text-gray-500 hover:text-indigo-400 transition-colors">Сбросить все</button>}
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="max-w-2xl mx-auto mb-4 overflow-hidden px-3 sm:px-5 lg:px-6"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-4">
              {/* Genre */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Жанр</label>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setGenre('')} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${!genre ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>Все</button>
                  {(stats?.genres || BEAT_GENRES).map(g => (
                    <button key={g} onClick={() => setGenre(g === genre ? '' : g)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${genre === g ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{g}</button>
                  ))}
                </div>
              </div>

              {/* BPM range */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">BPM</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={bpmMin} onChange={e => setBpmMin(e.target.value)} placeholder="от"
                    className="w-20 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/40" />
                  <span className="text-gray-600 text-xs">-</span>
                  <input type="number" value={bpmMax} onChange={e => setBpmMax(e.target.value)} placeholder="до"
                    className="w-20 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/40" />
                </div>
              </div>

              {/* Key */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Тональность</label>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setKeyFilter('')} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${!keyFilter ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>Все</button>
                  {BEAT_KEYS.map(k => (
                    <button key={k} onClick={() => setKeyFilter(k === keyFilter ? '' : k)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${keyFilter === k ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{k}</button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Цена (Basic лицензия)</label>
                <div className="flex flex-wrap gap-1.5">
                  {BEAT_PRICE_RANGES.map((r, idx) => (
                    <button key={idx} onClick={() => setPriceIdx(idx)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${priceIdx === idx ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{r.label}</button>
                  ))}
                </div>
              </div>

              {/* License type */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Тип лицензии</label>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setLicenseFilter('')} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${!licenseFilter ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>Все</button>
                  {LICENSE_TYPES.map(l => (
                    <button key={l} onClick={() => setLicenseFilter(l.toLowerCase() as any)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${licenseFilter === l.toLowerCase() ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort + count */}
      <div className="px-3 sm:px-5 lg:px-6 mb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {loading ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" />Загрузка...</span>
            ) : (
              <>Найдено: <span className="text-white font-bold">{filtered.length}</span> битов</>
            )}
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {(Object.keys(sortLabels) as Array<typeof sortBy>).map(key => (
              <button key={key} onClick={() => setSortBy(key)}
                className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                  sortBy === key ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-600 hover:text-gray-400'
                }`}
              >{sortLabels[key]}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Beat cards */}
      <section className="px-3 sm:px-5 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Music className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-bold text-gray-400 mb-2">Биты не найдены</h3>
              <p className="text-sm text-gray-600 mb-4">Попробуйте изменить фильтры</p>
              <button onClick={clearFilters} className="text-sm text-indigo-400 hover:text-indigo-300 font-bold">Сбросить фильтры</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {filtered.map((beat, idx) => (
                <BeatCard
                  key={beat.id}
                  beat={beat}
                  index={idx}
                  isFav={favorites.has(beat.id)}
                  inCart={cart.has(beat.id)}
                  isPlaying={playingBeatId === beat.id}
                  onToggleFav={() => toggleFav(beat.id)}
                  onToggleCart={() => toggleCart(beat.id)}
                  onPlay={() => setPlayingBeatId(playingBeatId === beat.id ? null : beat.id)}
                  onOpenDetail={() => setSelectedBeatId(beat.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mini Player */}
      <AnimatePresence>
        {playingBeatId && (() => {
          const beat = filtered.find(b => b.id === playingBeatId) || beats.find(b => b.id === playingBeatId);
          return beat ? (
            <BeatMiniPlayer
              beat={beat}
              onClose={() => setPlayingBeatId(null)}
              onNext={() => {
                const i = filtered.findIndex(b => b.id === playingBeatId);
                if (i < filtered.length - 1) setPlayingBeatId(filtered[i + 1].id);
              }}
              onPrev={() => {
                const i = filtered.findIndex(b => b.id === playingBeatId);
                if (i > 0) setPlayingBeatId(filtered[i - 1].id);
              }}
            />
          ) : null;
        })()}
      </AnimatePresence>

      {/* Cart indicator */}
      {cart.size > 0 && !playingBeatId && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
          className="fixed bottom-4 right-4 z-40"
        >
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30"
          >
            <ShoppingCart className="w-4 h-4" />
            Корзина ({cart.size})
          </motion.button>
        </motion.div>
      )}

      {/* Beat Detail Modal */}
      <AnimatePresence>
        {selectedBeatId && (() => {
          const beat = beats.find(b => b.id === selectedBeatId);
          return beat ? (
            <BeatDetailModal
              beat={beat}
              onClose={() => setSelectedBeatId(null)}
              isFav={favorites.has(beat.id)}
              inCart={cart.has(beat.id)}
              isPlaying={playingBeatId === beat.id}
              onToggleFav={() => toggleFav(beat.id)}
              onToggleCart={() => toggleCart(beat.id)}
              onPlay={() => setPlayingBeatId(playingBeatId === beat.id ? null : beat.id)}
            />
          ) : null;
        })()}
      </AnimatePresence>

      {/* Bottom CTA */}
      <section className="px-3 sm:px-5 lg:px-6 mt-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-5 lg:p-6 border border-indigo-500/20 text-center"
          >
            <Music className="w-8 h-8 mx-auto mb-3 text-indigo-400" />
            <h3 className="text-lg sm:text-xl font-black mb-2">Продюсер? Продавайте свои биты</h3>
            <p className="text-xs lg:text-sm text-gray-400 mb-4 max-w-md mx-auto">
              Загружайте инструменталы, устанавливайте цены и лицензии. Комиссия всего 10%.
            </p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all inline-flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              Создать витрину
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ═══════ BEAT CARD ═══════ */

function BeatCard({ beat, index, isFav, inCart, isPlaying, onToggleFav, onToggleCart, onPlay, onOpenDetail }: {
  beat: Beat; index: number; isFav: boolean; inCart: boolean; isPlaying: boolean;
  onToggleFav: () => void; onToggleCart: () => void; onPlay: () => void; onOpenDetail: () => void;
}) {
  const gradient = GENRE_GRADIENTS[beat.genre] || 'from-indigo-900/80 to-purple-900/80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }} layout
      className={`bg-white/5 backdrop-blur-sm rounded-xl border transition-all overflow-hidden group ${
        isPlaying ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'border-white/10 hover:border-indigo-500/30'
      }`}
    >
      {/* Cover - genre gradient with waveform icon */}
      <div className="relative aspect-square overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Music className="w-20 h-20 text-white" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play button */}
        <button onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            isPlaying ? 'bg-indigo-500 scale-100' : 'bg-white/20 hover:bg-indigo-500 hover:scale-110'
          }`}>
            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
          </div>
        </button>

        {/* Badges */}
        {beat.isNew && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 rounded-full text-[9px] font-black text-white">NEW</span>
        )}
        <button onClick={onToggleFav} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-400 text-red-400' : 'text-white/70'}`} />
        </button>

        {/* BPM + Key */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[9px] font-bold text-white">{beat.bpm} BPM</span>
          <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[9px] font-bold text-white">{beat.key}</span>
        </div>
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[9px] text-white/70">{beat.duration}</span>
      </div>

      {/* Info */}
      <div className="p-3">
        <button onClick={onOpenDetail} className="text-left w-full group/title">
          <h4 className="text-sm font-black text-white truncate mb-0.5 group-hover/title:text-indigo-300 transition-colors">{beat.title}</h4>
        </button>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[6px] font-black text-white">{getInitials(beat.producerName)}</span>
          </div>
          <span className="text-[10px] text-gray-400 truncate">{beat.producerName}</span>
        </div>

        {/* Genre + tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="px-1.5 py-0.5 bg-indigo-500/15 border border-indigo-500/20 rounded text-[9px] font-bold text-indigo-300">{beat.genre}</span>
          {beat.tags.slice(0, 2).map(t => (
            <span key={t} className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] text-gray-500">{t}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Play className="w-3 h-3" />{formatNumber(beat.plays)}</span>
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatNumber(beat.likes)}</span>
          <button onClick={onOpenDetail} className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{beat.rating}
            {beat.reviewsCount > 0 && <span className="text-gray-600">({beat.reviewsCount})</span>}
          </button>
        </div>

        {/* Prices */}
        <div className="flex items-center gap-1 mb-3">
          <span className="px-2 py-1 bg-white/5 rounded-lg text-[9px] text-center flex-1">
            <span className="block text-gray-500">Basic</span>
            <span className="font-black text-white">{formatPrice(beat.prices.basic)} ₽</span>
          </span>
          <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[9px] text-center flex-1">
            <span className="block text-indigo-400">Premium</span>
            <span className="font-black text-white">{formatPrice(beat.prices.premium)} ₽</span>
          </span>
          <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] text-center flex-1">
            <span className="block text-amber-400">Exclusive</span>
            <span className="font-black text-white">{formatPrice(beat.prices.exclusive)} ₽</span>
          </span>
        </div>

        {/* Action */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onToggleCart}
          className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            inCart
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow shadow-indigo-500/20'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {inCart ? 'В корзине' : 'В корзину'}
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ═══════ BEAT MINI PLAYER ═══════ */

function BeatMiniPlayer({ beat, onClose, onNext, onPrev }: {
  beat: Beat; onClose: () => void; onNext: () => void; onPrev: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const gradient = GENRE_GRADIENTS[beat.genre] || 'from-indigo-900/80 to-purple-900/80';

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + 0.5));
    }, 100);
    return () => clearInterval(timer);
  }, [beat.id]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10"
    >
      {/* Progress */}
      <div className="h-0.5 bg-white/5">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="px-3 sm:px-5 py-2.5 flex items-center gap-3">
        {/* Cover mini */}
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
          <Music className="w-4 h-4 text-white/50" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{beat.title}</p>
          <p className="text-[10px] text-gray-500 truncate">{beat.producerName} - {beat.bpm} BPM - {beat.key}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="text-gray-500 hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>
          <button className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
            <Pause className="w-4 h-4 text-white" />
          </button>
          <button onClick={onNext} className="text-gray-500 hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>
        </div>

        {/* Producer tag */}
        <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-[9px] text-gray-500">
          <Tag className="w-3 h-3" />{beat.producerName}
        </span>

        {/* Close */}
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors ml-1"><X className="w-4 h-4" /></button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  S E R V I C E S   M A R K E T P L A C E               */
/* ═══════════════════════════════════════════════════════ */

function ServicesMarketplace({ onGetStarted }: { onGetStarted: () => void }) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [stats, setStats] = useState<ServicesStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceIdx, setPriceIdx] = useState(0);
  const [sortBy, setSortBy] = useState<'recommended' | 'popular' | 'rating' | 'price_asc' | 'price_desc'>('recommended');
  const [calcOpen, setCalcOpen] = useState(false);

  // Fetch services and stats on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [servicesResult, statsResult] = await Promise.all([
          fetchServices({ limit: 100 }),
          fetchServicesStats(),
        ]);
        if (!cancelled) {
          setServices((servicesResult.services || []).map(adaptService));
          setStats(statsResult);
        }
      } catch (err) {
        console.error('Failed to load services marketplace:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const priceRange = SERVICE_PRICE_RANGES[priceIdx];

  const filtered = useMemo(() => {
    const result = services.filter(s => {
      if (search) {
        const q = search.toLowerCase();
        const typeLabel = SERVICE_TYPES_MAP[s.type]?.label || '';
        if (!s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q) && !s.producerName.toLowerCase().includes(q) && !typeLabel.toLowerCase().includes(q)) return false;
      }
      if (typeFilter && s.type !== typeFilter) return false;
      if (priceIdx > 0 && (s.price < priceRange.min || s.price > priceRange.max)) return false;
      return true;
    });
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'recommended': return (b.rating * b.completedOrders) - (a.rating * a.completedOrders);
        case 'popular': return b.completedOrders - a.completedOrders;
        case 'rating': return b.rating - a.rating;
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        default: return 0;
      }
    });
  }, [services, search, typeFilter, priceIdx, sortBy]);

  // Derive available service types from loaded data
  const availableTypes = useMemo(() => {
    const types = new Set(services.map(s => s.type));
    return Object.entries(SERVICE_TYPES_MAP).filter(([key]) => types.has(key as ServiceType));
  }, [services]);

  const sortLabels: Record<typeof sortBy, string> = {
    recommended: 'Рекомендуемые', popular: 'Популярные', rating: 'По рейтингу', price_asc: 'Дешевле', price_desc: 'Дороже',
  };

  return (
    <div className="pb-12">
      {/* Stats */}
      <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: Package, label: 'Услуг', value: stats?.totalServices ?? services.length, color: 'text-purple-400' },
            { icon: Star, label: 'Рейтинг', value: stats?.avgRating?.toFixed(1) ?? '-', color: 'text-yellow-400' },
            { icon: CheckCircle2, label: 'Заказов', value: formatNumber(stats?.totalOrders ?? 0), color: 'text-emerald-400' },
            { icon: Users, label: 'Специалистов', value: stats?.activeProducers ?? 0, color: 'text-cyan-400' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-4 text-center"
            >
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className="text-lg sm:text-xl font-black text-white">{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search + Calculator */}
      <div className="px-3 sm:px-5 lg:px-6 mb-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Услуга, описание или имя специалиста..."
              className="w-full pl-10 pr-12 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>}
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCalcOpen(true)}
            className="flex items-center gap-1.5 px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-all flex-shrink-0"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Калькулятор</span>
          </motion.button>
        </div>
      </div>

      {/* Service type filter */}
      <div className="px-3 sm:px-5 lg:px-6 mb-4">
        <div className="max-w-2xl mx-auto flex flex-wrap gap-1.5 justify-center">
          <button onClick={() => setTypeFilter('')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
              !typeFilter ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >Все</button>
          {availableTypes.map(([key, val]) => (
            <button key={key} onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                typeFilter === key ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <val.icon className="w-3 h-3" />{val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price filter */}
      <div className="px-3 sm:px-5 lg:px-6 mb-4">
        <div className="max-w-2xl mx-auto flex flex-wrap gap-1.5 justify-center">
          {SERVICE_PRICE_RANGES.map((r, idx) => (
            <button key={idx} onClick={() => setPriceIdx(idx)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                priceIdx === idx ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gray-600 hover:text-gray-400'
              }`}
            >{r.label}</button>
          ))}
        </div>
      </div>

      {/* Sort + count */}
      <div className="px-3 sm:px-5 lg:px-6 mb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {loading ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" />Загрузка...</span>
            ) : (
              <>Найдено: <span className="text-white font-bold">{filtered.length}</span> услуг</>
            )}
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {(Object.keys(sortLabels) as Array<typeof sortBy>).map(key => (
              <button key={key} onClick={() => setSortBy(key)}
                className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                  sortBy === key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gray-600 hover:text-gray-400'
                }`}
              >{sortLabels[key]}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Service cards */}
      <section className="px-3 sm:px-5 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonServiceCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-bold text-gray-400 mb-2">Услуги не найдены</h3>
              <p className="text-sm text-gray-600 mb-4">Попробуйте изменить фильтры</p>
              <button onClick={() => { setSearch(''); setTypeFilter(''); setPriceIdx(0); }} className="text-sm text-purple-400 hover:text-purple-300 font-bold">Сбросить фильтры</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {filtered.map((service, idx) => (
                <ServiceCard key={service.id} service={service} index={idx} onOrder={onGetStarted} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-3 sm:px-5 lg:px-6 mt-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-5 lg:p-6 border border-purple-500/20 text-center"
          >
            <Headphones className="w-8 h-8 mx-auto mb-3 text-purple-400" />
            <h3 className="text-lg sm:text-xl font-black mb-2">Предлагайте свои услуги</h3>
            <p className="text-xs lg:text-sm text-gray-400 mb-4 max-w-md mx-auto">
              Сведение, мастеринг, аранжировка - найдите клиентов на платформе Promo.music.
            </p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Стать специалистом
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Calculator modal */}
      <AnimatePresence>
        {calcOpen && <ServiceCalculator onClose={() => setCalcOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════ SERVICE CARD ═══════ */

function ServiceCard({ service, index, onOrder }: { service: ServiceItem; index: number; onOrder: () => void }) {
  const st = SERVICE_TYPES_MAP[service.type] || { label: service.type, icon: Settings, color: 'from-gray-500 to-gray-600' };
  const StIcon = st.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }} layout
      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/30 transition-all overflow-hidden group"
    >
      <div className="p-4">
        {/* Producer row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-white">{getInitials(service.producerName)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white truncate">{service.producerName}</span>
              <BadgeCheck className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-white">{service.rating}</span>
              <span>({service.reviews} заказов)</span>
            </div>
          </div>
        </div>

        {/* Service type badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r ${st.color} rounded-lg text-[10px] font-bold text-white mb-2`}>
          <StIcon className="w-3 h-3" />
          {st.label}
        </div>

        {/* Title + desc */}
        <h4 className="text-sm font-black text-white mb-1">{service.title}</h4>
        <p className="text-[10px] text-gray-400 leading-relaxed mb-3 line-clamp-2">{service.description}</p>

        {/* Includes */}
        <div className="space-y-1 mb-3">
          {service.includes.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Price + delivery */}
        <div className="flex items-center justify-between mb-3 p-2.5 bg-white/5 rounded-lg">
          <div>
            <p className="text-sm font-black text-white">
              {formatPrice(service.price)} {service.currency}
              {service.priceMax && <span className="text-gray-500 font-normal"> - {formatPrice(service.priceMax)} {service.currency}</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{service.deliveryDays} дн.</p>
          </div>
        </div>

        {/* Orders count */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-3">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" />{service.completedOrders} заказов выполнено</span>
        </div>

        {/* Action */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onOrder}
          className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-xs font-bold text-white shadow shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Заказать услугу
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ═══════ SERVICE CALCULATOR ═══════ */

type CalcServiceType = 'mixing' | 'mastering' | 'beatmaking' | 'arrangement' | 'sound_design' | 'vocal_recording';

const CALC_SERVICE_TYPES: Record<CalcServiceType, { label: string; icon: typeof Headphones; color: string }> = {
  mixing: { label: 'Сведение', icon: Sliders, color: 'from-blue-500 to-cyan-500' },
  mastering: { label: 'Мастеринг', icon: Volume2, color: 'from-purple-500 to-pink-500' },
  beatmaking: { label: 'Битмейкинг', icon: Music, color: 'from-orange-500 to-red-500' },
  arrangement: { label: 'Аранжировка', icon: Layers, color: 'from-emerald-500 to-teal-500' },
  sound_design: { label: 'Саунд-дизайн', icon: Radio, color: 'from-violet-500 to-indigo-500' },
  vocal_recording: { label: 'Запись вокала', icon: Mic, color: 'from-rose-500 to-pink-500' },
};

function ServiceCalculator({ onClose }: { onClose: () => void }) {
  const [selectedServices, setSelectedServices] = useState<Set<CalcServiceType>>(new Set());
  const [trackCount, setTrackCount] = useState(1);
  const [urgency, setUrgency] = useState<'normal' | 'fast' | 'urgent'>('normal');

  const basePrices: Record<CalcServiceType, number> = {
    mixing: 8000, mastering: 3000, beatmaking: 15000, arrangement: 10000, sound_design: 5000, vocal_recording: 5000,
  };

  const urgencyMultiplier = { normal: 1, fast: 1.5, urgent: 2 };

  const total = useMemo(() => {
    let sum = 0;
    selectedServices.forEach(s => { sum += basePrices[s]; });
    return Math.round(sum * trackCount * urgencyMultiplier[urgency]);
  }, [selectedServices, trackCount, urgency]);

  const toggleService = (s: CalcServiceType) => {
    setSelectedServices(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0a0a14] border border-white/10 rounded-2xl w-full max-w-md p-5 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-400" />
            Калькулятор стоимости
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Select services */}
        <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Выберите услуги</p>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {(Object.entries(CALC_SERVICE_TYPES) as Array<[CalcServiceType, typeof CALC_SERVICE_TYPES[CalcServiceType]]>).map(([key, val]) => (
            <button key={key} onClick={() => toggleService(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${
                selectedServices.has(key) ? `bg-gradient-to-r ${val.color} text-white` : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <val.icon className="w-3.5 h-3.5" />
              {val.label}
              {selectedServices.has(key) && <span className="ml-auto text-[9px]">{formatPrice(basePrices[key])} ₽</span>}
            </button>
          ))}
        </div>

        {/* Track count */}
        <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Количество треков</p>
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 5, 10].map(n => (
            <button key={n} onClick={() => setTrackCount(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                trackCount === n ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >{n}</button>
          ))}
        </div>

        {/* Urgency */}
        <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Срочность</p>
        <div className="flex items-center gap-2 mb-5">
          {[
            { key: 'normal' as const, label: 'Обычная', mult: 'x1' },
            { key: 'fast' as const, label: 'Быстрая', mult: 'x1.5' },
            { key: 'urgent' as const, label: 'Срочная', mult: 'x2' },
          ].map(u => (
            <button key={u.key} onClick={() => setUrgency(u.key)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                urgency === u.key ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {u.label}
              <span className="block text-[9px] opacity-70 mt-0.5">{u.mult}</span>
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-center">
          <p className="text-xs text-gray-400 mb-1">Предварительная стоимость</p>
          <p className="text-2xl font-black text-white">
            {selectedServices.size > 0 ? `${formatPrice(total)} ₽` : '- ₽'}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">Точная цена зависит от сложности проекта</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  B E A T   D E T A I L   M O D A L                     */
/* ═══════════════════════════════════════════════════════ */

function BeatDetailModal({ beat, onClose, isFav, inCart, isPlaying, onToggleFav, onToggleCart, onPlay }: {
  beat: Beat; onClose: () => void; isFav: boolean; inCart: boolean; isPlaying: boolean;
  onToggleFav: () => void; onToggleCart: () => void; onPlay: () => void;
}) {
  const [reviews, setReviews] = useState<BeatReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [tab, setTab] = useState<'info' | 'reviews'>('info');

  const gradient = GENRE_GRADIENTS[beat.genre] || 'from-indigo-900/80 to-purple-900/80';

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const data = await fetchBeatReviews(beat.id);
      if (data) {
        setReviews(data.reviews);
        setReviewStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load beat reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }, [beat.id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0a0a14] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl my-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header with beat cover */}
        <div className={`relative h-40 sm:h-52 bg-gradient-to-br ${gradient} flex-shrink-0`}>
          <div className="absolute inset-0 flex items-center justify-center opacity-15">
            <Music className="w-32 h-32 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent" />

          {/* Close */}
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Play */}
          <button onClick={onPlay} className="absolute top-3 left-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
              isPlaying ? 'bg-indigo-500' : 'bg-white/20 hover:bg-indigo-500'
            }`}>
              {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
            </div>
          </button>

          {/* Beat info overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              {beat.isNew && <span className="px-2 py-0.5 bg-emerald-500 rounded-full text-[9px] font-black text-white">NEW</span>}
              <span className="px-2 py-0.5 bg-indigo-500/30 backdrop-blur-sm rounded-full text-[9px] font-bold text-indigo-200">{beat.genre}</span>
              <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[9px] text-white/80">{beat.bpm} BPM</span>
              <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[9px] text-white/80">{beat.key}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{beat.title}</h2>
            <p className="text-sm text-gray-300">by {beat.producerName}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-white/10 px-4 flex-shrink-0">
          <button onClick={() => setTab('info')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              tab === 'info' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >Подробности</button>
          <button onClick={() => setTab('reviews')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'reviews' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            Отзывы
            {reviewStats && reviewStats.total > 0 && (
              <span className="px-1.5 py-0.5 bg-indigo-500/20 rounded-full text-[9px] font-black text-indigo-300">{reviewStats.total}</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'info' ? (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Прослушивания', value: formatNumber(beat.plays), icon: Play },
                  { label: 'Лайки', value: formatNumber(beat.likes), icon: Heart },
                  { label: 'Продажи', value: formatNumber(beat.purchases), icon: ShoppingCart },
                  { label: 'Рейтинг', value: beat.rating.toFixed(1), icon: Star },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-2.5 text-center">
                    <s.icon className="w-3.5 h-3.5 mx-auto mb-1 text-gray-500" />
                    <p className="text-sm font-black text-white">{s.value}</p>
                    <p className="text-[9px] text-gray-600">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {beat.tags.map(t => (
                  <span key={t} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] text-gray-400">{t}</span>
                ))}
              </div>

              {/* License prices */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Лицензии</h4>
                <div className="space-y-2">
                  {[
                    { type: 'Basic', price: beat.prices.basic, desc: 'MP3 файл, до 5 000 копий, кредит автора', color: 'border-white/10 bg-white/5' },
                    { type: 'Premium', price: beat.prices.premium, desc: 'WAV + стемы, неограниченные копии, кредит автора', color: 'border-indigo-500/20 bg-indigo-500/5' },
                    { type: 'Exclusive', price: beat.prices.exclusive, desc: 'Полная передача прав, все форматы, без ограничений', color: 'border-amber-500/20 bg-amber-500/5' },
                  ].map(l => (
                    <div key={l.type} className={`flex items-center justify-between p-3 rounded-xl border ${l.color}`}>
                      <div>
                        <span className="text-xs font-bold text-white">{l.type}</span>
                        <p className="text-[10px] text-gray-500 mt-0.5">{l.desc}</p>
                      </div>
                      <span className="text-sm font-black text-white whitespace-nowrap ml-3">{formatPrice(l.price)} ₽</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onToggleCart}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    inCart
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow shadow-indigo-500/20'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {inCart ? 'В корзине' : 'В корзину'}
                </motion.button>
                <button onClick={onToggleFav}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                    isFav ? 'bg-red-500/15 border-red-500/30' : 'bg-white/5 border-white/10 hover:border-red-500/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-red-400 text-red-400' : 'text-gray-500'}`} />
                </button>
              </div>
            </>
          ) : (
            /* Reviews tab */
            <BeatReviewsTab
              beatId={beat.id}
              reviews={reviews}
              stats={reviewStats}
              loading={loadingReviews}
              showForm={showReviewForm}
              onToggleForm={() => setShowReviewForm(!showReviewForm)}
              onReviewSubmitted={() => { setShowReviewForm(false); loadReviews(); }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════ REVIEWS TAB ═══════ */

function BeatReviewsTab({ beatId, reviews, stats, loading, showForm, onToggleForm, onReviewSubmitted }: {
  beatId: string; reviews: BeatReview[]; stats: ReviewStats | null; loading: boolean;
  showForm: boolean; onToggleForm: () => void; onReviewSubmitted: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Stats summary */}
      {stats && stats.total > 0 && (
        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
          <div className="text-center flex-shrink-0">
            <p className="text-3xl font-black text-white">{stats.avgRating}</p>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(stats.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} />
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{stats.total} отзывов</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats.distribution[star] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-3 text-right">{star}</span>
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-600 w-6">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write review button */}
      <motion.button whileTap={{ scale: 0.98 }} onClick={onToggleForm}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-bold text-indigo-300 hover:bg-indigo-500/15 transition-all"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {showForm ? 'Скрыть форму' : 'Написать отзыв'}
      </motion.button>

      {/* Review form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <ReviewForm beatId={beatId} onSubmitted={onReviewSubmitted} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-500 font-bold">Пока нет отзывов</p>
          <p className="text-[10px] text-gray-600 mt-1">Купите бит, чтобы оставить отзыв</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} beatId={beatId} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════ REVIEW FORM ═══════ */

function ReviewForm({ beatId, onSubmitted }: { beatId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) { setError('Выберите рейтинг'); return; }
    if (!text.trim()) { setError('Напишите текст отзыва'); return; }
    setError('');
    setSubmitting(true);

    try {
      // Demo user - в реальном приложении берём из auth context
      const result = await submitBeatReview(beatId, 'demo-user', 'Пользователь', rating, text.trim(), title.trim() || undefined);
      if (result) {
        onSubmitted();
      } else {
        setError('Не удалось отправить отзыв. Возможно, вы ещё не купили этот бит.');
      }
    } catch (err) {
      setError('Ошибка при отправке отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
      {/* Star rating */}
      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Оценка</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(s)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star className={`w-6 h-6 transition-colors ${
                s <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-700 hover:text-gray-500'
              }`} />
            </button>
          ))}
          {rating > 0 && <span className="text-xs text-gray-400 ml-2">{rating} из 5</span>}
        </div>
      </div>

      {/* Title (optional) */}
      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Заголовок (необязательно)</label>
        <input
          type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Кратко о впечатлении..."
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/40"
        />
      </div>

      {/* Text */}
      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Отзыв</label>
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Расскажите о качестве бита, звуке, удобстве работы..."
          rows={3}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/40 resize-none"
        />
      </div>

      {/* Error */}
      {error && <p className="text-[10px] text-red-400">{error}</p>}

      {/* Submit */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        {submitting ? 'Отправка...' : 'Опубликовать отзыв'}
      </motion.button>
    </div>
  );
}

/* ═══════ REVIEW CARD ═══════ */

function ReviewCard({ review, beatId }: { review: BeatReview; beatId: string }) {
  const [helpful, setHelpful] = useState(review.helpful || 0);
  const [isHelpful, setIsHelpful] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleHelpful = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const result = await toggleReviewHelpful(beatId, review.id, 'demo-user');
      if (result) {
        setHelpful(result.helpful);
        setIsHelpful(result.isHelpful);
      }
    } catch (err) {
      console.error('Failed to toggle helpful:', err);
    } finally {
      setToggling(false);
    }
  };

  const licenseLabels: Record<string, string> = {
    basic: 'Basic', premium: 'Premium', exclusive: 'Exclusive',
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'сегодня';
    if (days === 1) return 'вчера';
    if (days < 7) return `${days} дн. назад`;
    if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
    return `${Math.floor(days / 30)} мес. назад`;
  };

  return (
    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] font-black text-white">{getInitials(review.userName)}</span>
          </div>
          <div>
            <span className="text-xs font-bold text-white">{review.userName}</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} />
                ))}
              </div>
              {review.licenseType && (
                <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/15 rounded text-indigo-300">{licenseLabels[review.licenseType] || review.licenseType}</span>
              )}
            </div>
          </div>
        </div>
        <span className="text-[10px] text-gray-600">{timeAgo(review.createdAt)}</span>
      </div>

      {/* Title */}
      {review.title && <p className="text-xs font-bold text-white mb-1">{review.title}</p>}

      {/* Text */}
      <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{review.text}</p>

      {/* Helpful */}
      <button
        onClick={handleHelpful}
        disabled={toggling}
        className={`flex items-center gap-1.5 text-[10px] transition-colors ${
          isHelpful ? 'text-indigo-400' : 'text-gray-600 hover:text-gray-400'
        }`}
      >
        <ThumbsUp className={`w-3 h-3 ${isHelpful ? 'fill-indigo-400' : ''}`} />
        Полезно{helpful > 0 ? ` (${helpful})` : ''}
      </button>
    </div>
  );
}
