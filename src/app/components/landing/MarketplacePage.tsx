/**
 * MARKETPLACE - Маркетплейс для продюсеров и звукоинженеров
 * Два раздела: Биты (инструменталы) и Услуги (сведение, мастеринг и т.д.)
 * Цветовая схема: indigo/purple/cyan (градиент)
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Star, Music, Filter, X, Heart, Play, Pause, Clock, Users,
  Award, Sparkles, ArrowRight, CheckCircle2, Zap, ShoppingCart, Sliders,
  Headphones, Mic, Volume2, Radio, Tag, ChevronDown, SkipForward, SkipBack,
  Disc3, FileAudio, Settings, Layers, DollarSign, TrendingUp, Package,
  Calculator, Eye, MessageSquare, Shield, Crown, BadgeCheck, Store
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import marketplaceBanner from 'figma:asset/c0a0e796e55eb9177cb3bdca7b49b52a7d09dd24.png';

interface MarketplacePageProps {
  onGetStarted: () => void;
}

/* ═══════════════════════════════════════ */
/* TYPES                                   */
/* ═══════════════════════════════════════ */

interface Beat {
  id: string;
  title: string;
  producer: { name: string; avatar: string; verified: boolean };
  cover: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  plays: number;
  likes: number;
  prices: { basic: number; premium: number; exclusive: number };
  duration: string;
  isNew: boolean;
  rating: number;
}

interface ProducerService {
  id: string;
  producer: { name: string; avatar: string; verified: boolean; rating: number; reviews: number };
  type: ServiceType;
  title: string;
  description: string;
  includes: string[];
  price: number;
  priceMax?: number;
  currency: string;
  deliveryDays: number;
  completedOrders: number;
}

type ServiceType = 'mixing' | 'mastering' | 'beatmaking' | 'arrangement' | 'sound_design' | 'vocal_recording';

/* ═══════════════════════════════════════ */
/* CONSTANTS                               */
/* ═══════════════════════════════════════ */

const BEAT_GENRES = ['Hip-Hop', 'Trap', 'R&B', 'Pop', 'Electronic', 'Lo-Fi', 'Drill', 'Afrobeat', 'Reggaeton', 'Rock'];
const BEAT_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const LICENSE_TYPES = ['Basic', 'Premium', 'Exclusive'] as const;

const SERVICE_TYPES: Record<ServiceType, { label: string; icon: typeof Headphones; color: string }> = {
  mixing: { label: 'Сведение', icon: Sliders, color: 'from-blue-500 to-cyan-500' },
  mastering: { label: 'Мастеринг', icon: Volume2, color: 'from-purple-500 to-pink-500' },
  beatmaking: { label: 'Битмейкинг', icon: Music, color: 'from-orange-500 to-red-500' },
  arrangement: { label: 'Аранжировка', icon: Layers, color: 'from-emerald-500 to-teal-500' },
  sound_design: { label: 'Саунд-дизайн', icon: Radio, color: 'from-violet-500 to-indigo-500' },
  vocal_recording: { label: 'Запись вокала', icon: Mic, color: 'from-rose-500 to-pink-500' },
};

/* ═══════════════════════════════════════ */
/* MOCK DATA                               */
/* ═══════════════════════════════════════ */

const MOCK_BEATS: Beat[] = [
  {
    id: 'b1', title: 'Midnight Cipher', bpm: 140, key: 'F#', genre: 'Trap', tags: ['Dark', 'Hard'], plays: 12400, likes: 342, duration: '3:28', isNew: true, rating: 4.9,
    producer: { name: 'RXZNCE', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', verified: true },
    cover: 'https://images.unsplash.com/photo-1770320606337-ad3fba0fb2a8?w=400&q=80',
    prices: { basic: 2990, premium: 7990, exclusive: 29990 },
  },
  {
    id: 'b2', title: 'Velvet Dreams', bpm: 90, key: 'D', genre: 'R&B', tags: ['Smooth', 'Chill'], plays: 8700, likes: 256, duration: '3:45', isNew: false, rating: 4.8,
    producer: { name: 'Sofia Beats', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80', verified: true },
    cover: 'https://images.unsplash.com/photo-1624154670578-42532d763bd3?w=400&q=80',
    prices: { basic: 1990, premium: 5990, exclusive: 19990 },
  },
  {
    id: 'b3', title: 'Neon Pulse', bpm: 128, key: 'A', genre: 'Electronic', tags: ['Synth', 'Dance'], plays: 15200, likes: 489, duration: '4:12', isNew: true, rating: 4.7,
    producer: { name: 'Electra', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', verified: true },
    cover: 'https://images.unsplash.com/photo-1581270959718-ddf742175087?w=400&q=80',
    prices: { basic: 3490, premium: 8990, exclusive: 34990 },
  },
  {
    id: 'b4', title: 'Street Gospel', bpm: 85, key: 'G', genre: 'Hip-Hop', tags: ['Boom Bap', 'Soul'], plays: 6300, likes: 198, duration: '3:15', isNew: false, rating: 4.6,
    producer: { name: 'BeatKing', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', verified: false },
    cover: 'https://images.unsplash.com/photo-1587951441307-ac41385fb1cb?w=400&q=80',
    prices: { basic: 1490, premium: 4990, exclusive: 14990 },
  },
  {
    id: 'b5', title: 'Cloud Nine', bpm: 75, key: 'C', genre: 'Lo-Fi', tags: ['Chill', 'Study'], plays: 22100, likes: 876, duration: '2:58', isNew: false, rating: 4.9,
    producer: { name: 'LoFi Labs', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80', verified: true },
    cover: 'https://images.unsplash.com/photo-1610716632424-4d45990bcd48?w=400&q=80',
    prices: { basic: 990, premium: 2990, exclusive: 9990 },
  },
  {
    id: 'b6', title: 'Tokyo Drift', bpm: 145, key: 'E', genre: 'Drill', tags: ['UK Drill', 'Dark'], plays: 9400, likes: 312, duration: '3:02', isNew: true, rating: 4.5,
    producer: { name: 'RXZNCE', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', verified: true },
    cover: 'https://images.unsplash.com/photo-1646500366920-b4c5ce29237d?w=400&q=80',
    prices: { basic: 2490, premium: 6990, exclusive: 24990 },
  },
  {
    id: 'b7', title: 'Tropical Haze', bpm: 100, key: 'B', genre: 'Reggaeton', tags: ['Latin', 'Summer'], plays: 11800, likes: 445, duration: '3:33', isNew: false, rating: 4.7,
    producer: { name: 'Sofia Beats', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80', verified: true },
    cover: 'https://images.unsplash.com/photo-1770320606337-ad3fba0fb2a8?w=400&q=80',
    prices: { basic: 2490, premium: 6490, exclusive: 22990 },
  },
  {
    id: 'b8', title: 'Golden Hour', bpm: 110, key: 'F', genre: 'Pop', tags: ['Upbeat', 'Catchy'], plays: 18500, likes: 623, duration: '3:48', isNew: false, rating: 4.8,
    producer: { name: 'Electra', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', verified: true },
    cover: 'https://images.unsplash.com/photo-1624154670578-42532d763bd3?w=400&q=80',
    prices: { basic: 2990, premium: 7490, exclusive: 27990 },
  },
];

const MOCK_SERVICES: ProducerService[] = [
  {
    id: 's1', type: 'mixing', title: 'Профессиональное сведение',
    description: 'Полное сведение вашего трека с использованием аналогового оборудования и плагинов мирового класса.',
    includes: ['До 48 дорожек', '2 бесплатные правки', 'Stem-export', 'Совместимость со стримингом'],
    price: 8000, priceMax: 15000, currency: '₽', deliveryDays: 3, completedOrders: 156,
    producer: { name: 'Максим Звук', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', verified: true, rating: 4.9, reviews: 89 },
  },
  {
    id: 's2', type: 'mastering', title: 'Мастеринг для стриминга',
    description: 'Финальная обработка трека для максимального звучания на всех платформах: Spotify, Apple Music, Яндекс.',
    includes: ['Loudness оптимизация', 'LUFS калибровка', 'Форматы: WAV/MP3/FLAC', 'Сертификат мастеринга'],
    price: 3000, priceMax: 7000, currency: '₽', deliveryDays: 2, completedOrders: 312,
    producer: { name: 'Anna Master', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80', verified: true, rating: 5.0, reviews: 142 },
  },
  {
    id: 's3', type: 'beatmaking', title: 'Кастомный бит под заказ',
    description: 'Создание уникального бита с нуля по вашему референсу и ТЗ. Полная эксклюзивность.',
    includes: ['Эксклюзивные права', 'Stems включены', 'Неограниченные правки', 'Коммерческое использование'],
    price: 15000, priceMax: 50000, currency: '₽', deliveryDays: 7, completedOrders: 67,
    producer: { name: 'BeatKing', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', verified: false, rating: 4.6, reviews: 34 },
  },
  {
    id: 's4', type: 'arrangement', title: 'Аранжировка трека',
    description: 'Профессиональная аранжировка: подбор инструментов, гармонии, структура трека от идеи до финала.',
    includes: ['Живые инструменты', 'Midi + Audio', 'Структура и форма', 'До 3 правок'],
    price: 10000, priceMax: 25000, currency: '₽', deliveryDays: 5, completedOrders: 93,
    producer: { name: 'LoFi Labs', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80', verified: true, rating: 4.8, reviews: 52 },
  },
  {
    id: 's5', type: 'sound_design', title: 'Саунд-дизайн для проекта',
    description: 'Создание уникальных звуков, атмосфер и текстур. Звуковое оформление для музыки, игр и видео.',
    includes: ['Кастомные пресеты', 'Foley и SFX', 'Атмосферы и текстуры', 'Форматы по запросу'],
    price: 5000, priceMax: 20000, currency: '₽', deliveryDays: 4, completedOrders: 45,
    producer: { name: 'Electra', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', verified: true, rating: 4.7, reviews: 28 },
  },
  {
    id: 's6', type: 'vocal_recording', title: 'Запись вокала в студии',
    description: 'Профессиональная запись вокала на студии с топовым оборудованием. Neumann U87, Neve 1073.',
    includes: ['3 часа сессии', 'Чистка и тюнинг', 'Comp-вокал', 'Файлы 24bit/48kHz'],
    price: 5000, priceMax: 12000, currency: '₽', deliveryDays: 1, completedOrders: 203,
    producer: { name: 'Максим Звук', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', verified: true, rating: 4.9, reviews: 89 },
  },
];

const BEAT_PRICE_RANGES = [
  { label: 'Любая', min: 0, max: Infinity },
  { label: 'До 2K', min: 0, max: 2000 },
  { label: '2K - 5K', min: 2000, max: 5000 },
  { label: '5K - 10K', min: 5000, max: 10000 },
  { label: 'От 10K', min: 10000, max: Infinity },
];

const SERVICE_PRICE_RANGES = [
  { label: 'Любая', min: 0, max: Infinity },
  { label: 'До 5K', min: 0, max: 5000 },
  { label: '5K - 10K', min: 5000, max: 10000 },
  { label: '10K - 25K', min: 10000, max: 25000 },
  { label: 'От 25K', min: 25000, max: Infinity },
];

/* ═══════════════════════════════════════ */
/* HELPER                                  */
/* ═══════════════════════════════════════ */

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return String(n);
}

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU');
}

/* ═══════════════════════════════════════ */
/* COMPONENT                               */
/* ═══════════════════════════════════════ */

export function MarketplacePage({ onGetStarted }: MarketplacePageProps) {
  const [activeTab, setActiveTab] = useState<'beats' | 'services'>('beats');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
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
          </div>
        </div>
      </div>

      {/* ═══════ TAB CONTENT ═══════ */}
      <AnimatePresence mode="wait">
        {activeTab === 'beats' ? (
          <motion.div key="beats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <BeatsMarketplace onGetStarted={onGetStarted} />
          </motion.div>
        ) : (
          <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <ServicesMarketplace onGetStarted={onGetStarted} />
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

  const priceRange = BEAT_PRICE_RANGES[priceIdx];

  const filtered = useMemo(() => {
    const result = MOCK_BEATS.filter(b => {
      if (search) {
        const q = search.toLowerCase();
        if (!b.title.toLowerCase().includes(q) && !b.producer.name.toLowerCase().includes(q) && !b.genre.toLowerCase().includes(q) && !b.tags.some(t => t.toLowerCase().includes(q))) return false;
      }
      if (genre && b.genre !== genre) return false;
      if (keyFilter && b.key !== keyFilter) return false;
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
  }, [search, genre, keyFilter, bpmMin, bpmMax, priceIdx, sortBy]);

  const activeCount = [genre, keyFilter, priceIdx > 0, bpmMin, bpmMax, licenseFilter].filter(Boolean).length;

  const clearFilters = () => { setSearch(''); setGenre(''); setKeyFilter(''); setPriceIdx(0); setBpmMin(''); setBpmMax(''); setLicenseFilter(''); };

  const toggleFav = (id: string) => setFavorites(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleCart = (id: string) => setCart(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const totalBeats = MOCK_BEATS.length;
  const avgRating = (MOCK_BEATS.reduce((a, b) => a + b.rating, 0) / MOCK_BEATS.length).toFixed(1);
  const totalSold = 1247;
  const activeProducers = 4;

  const sortLabels: Record<typeof sortBy, string> = {
    new: 'Новые', popular: 'Популярные', rating: 'По рейтингу', price_asc: 'Дешевле', price_desc: 'Дороже',
  };

  return (
    <div className="pb-20">
      {/* Stats */}
      <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: Music, label: 'Битов', value: totalBeats, color: 'text-indigo-400' },
            { icon: Star, label: 'Рейтинг', value: avgRating, color: 'text-yellow-400' },
            { icon: ShoppingCart, label: 'Продано', value: formatNumber(totalSold), color: 'text-emerald-400' },
            { icon: Users, label: 'Продюсеров', value: activeProducers, color: 'text-purple-400' },
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
                  {BEAT_GENRES.map(g => (
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
          <span className="text-xs text-gray-500">Найдено: <span className="text-white font-bold">{filtered.length}</span> битов</span>
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
          {filtered.length === 0 ? (
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
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mini Player */}
      <AnimatePresence>
        {playingBeatId && (
          <BeatMiniPlayer
            beat={MOCK_BEATS.find(b => b.id === playingBeatId)!}
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
        )}
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

function BeatCard({ beat, index, isFav, inCart, isPlaying, onToggleFav, onToggleCart, onPlay }: {
  beat: Beat; index: number; isFav: boolean; inCart: boolean; isPlaying: boolean;
  onToggleFav: () => void; onToggleCart: () => void; onPlay: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }} layout
      className={`bg-white/5 backdrop-blur-sm rounded-xl border transition-all overflow-hidden group ${
        isPlaying ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'border-white/10 hover:border-indigo-500/30'
      }`}
    >
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden">
        <ImageWithFallback src={beat.cover} alt={beat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
        <h4 className="text-sm font-black text-white truncate mb-0.5">{beat.title}</h4>
        <div className="flex items-center gap-1.5 mb-2">
          <ImageWithFallback src={beat.producer.avatar} alt={beat.producer.name} className="w-4 h-4 rounded-full object-cover" />
          <span className="text-[10px] text-gray-400 truncate">{beat.producer.name}</span>
          {beat.producer.verified && <BadgeCheck className="w-3 h-3 text-indigo-400 flex-shrink-0" />}
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
          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{beat.rating}</span>
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
        {/* Cover */}
        <ImageWithFallback src={beat.cover} alt={beat.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{beat.title}</p>
          <p className="text-[10px] text-gray-500 truncate">{beat.producer.name} - {beat.bpm} BPM - {beat.key}</p>
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
          <Tag className="w-3 h-3" />{beat.producer.name}
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
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceType | ''>('');
  const [priceIdx, setPriceIdx] = useState(0);
  const [sortBy, setSortBy] = useState<'recommended' | 'popular' | 'rating' | 'price_asc' | 'price_desc'>('recommended');
  const [calcOpen, setCalcOpen] = useState(false);

  const priceRange = SERVICE_PRICE_RANGES[priceIdx];

  const filtered = useMemo(() => {
    const result = MOCK_SERVICES.filter(s => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q) && !s.producer.name.toLowerCase().includes(q) && !SERVICE_TYPES[s.type].label.toLowerCase().includes(q)) return false;
      }
      if (typeFilter && s.type !== typeFilter) return false;
      if (priceIdx > 0 && (s.price < priceRange.min || s.price > priceRange.max)) return false;
      return true;
    });
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'recommended': return b.producer.rating * b.completedOrders - a.producer.rating * a.completedOrders;
        case 'popular': return b.completedOrders - a.completedOrders;
        case 'rating': return b.producer.rating - a.producer.rating;
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        default: return 0;
      }
    });
  }, [search, typeFilter, priceIdx, sortBy]);

  const totalServices = MOCK_SERVICES.length;
  const avgRating = (MOCK_SERVICES.reduce((a, s) => a + s.producer.rating, 0) / MOCK_SERVICES.length).toFixed(1);
  const totalOrders = MOCK_SERVICES.reduce((a, s) => a + s.completedOrders, 0);
  const totalPros = new Set(MOCK_SERVICES.map(s => s.producer.name)).size;

  const sortLabels: Record<typeof sortBy, string> = {
    recommended: 'Рекомендуемые', popular: 'Популярные', rating: 'По рейтингу', price_asc: 'Дешевле', price_desc: 'Дороже',
  };

  return (
    <div className="pb-12">
      {/* Stats */}
      <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: Package, label: 'Услуг', value: totalServices, color: 'text-purple-400' },
            { icon: Star, label: 'Рейтинг', value: avgRating, color: 'text-yellow-400' },
            { icon: CheckCircle2, label: 'Заказов', value: formatNumber(totalOrders), color: 'text-emerald-400' },
            { icon: Users, label: 'Специалистов', value: totalPros, color: 'text-cyan-400' },
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
          {(Object.entries(SERVICE_TYPES) as Array<[ServiceType, typeof SERVICE_TYPES[ServiceType]]>).map(([key, val]) => (
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
          <span className="text-xs text-gray-500">Найдено: <span className="text-white font-bold">{filtered.length}</span> услуг</span>
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
          {filtered.length === 0 ? (
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

function ServiceCard({ service, index, onOrder }: { service: ProducerService; index: number; onOrder: () => void }) {
  const st = SERVICE_TYPES[service.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }} layout
      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/30 transition-all overflow-hidden group"
    >
      <div className="p-4">
        {/* Producer row */}
        <div className="flex items-center gap-3 mb-3">
          <ImageWithFallback src={service.producer.avatar} alt={service.producer.name} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white truncate">{service.producer.name}</span>
              {service.producer.verified && <BadgeCheck className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-white">{service.producer.rating}</span>
              <span>({service.producer.reviews} отзывов)</span>
            </div>
          </div>
        </div>

        {/* Service type badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r ${st.color} rounded-lg text-[10px] font-bold text-white mb-2`}>
          <st.icon className="w-3 h-3" />
          {st.label}
        </div>

        {/* Title + desc */}
        <h4 className="text-sm font-black text-white mb-1">{service.title}</h4>
        <p className="text-[10px] text-gray-400 leading-relaxed mb-3 line-clamp-2">{service.description}</p>

        {/* Includes */}
        <div className="space-y-1 mb-3">
          {service.includes.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Price + delivery + orders */}
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

function ServiceCalculator({ onClose }: { onClose: () => void }) {
  const [selectedServices, setSelectedServices] = useState<Set<ServiceType>>(new Set());
  const [trackCount, setTrackCount] = useState(1);
  const [urgency, setUrgency] = useState<'normal' | 'fast' | 'urgent'>('normal');

  const basePrices: Record<ServiceType, number> = {
    mixing: 8000, mastering: 3000, beatmaking: 15000, arrangement: 10000, sound_design: 5000, vocal_recording: 5000,
  };

  const urgencyMultiplier = { normal: 1, fast: 1.5, urgent: 2 };

  const total = useMemo(() => {
    let sum = 0;
    selectedServices.forEach(s => { sum += basePrices[s]; });
    return Math.round(sum * trackCount * urgencyMultiplier[urgency]);
  }, [selectedServices, trackCount, urgency]);

  const toggleService = (s: ServiceType) => {
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
        className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-5 shadow-xl"
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
          {(Object.entries(SERVICE_TYPES) as Array<[ServiceType, typeof SERVICE_TYPES[ServiceType]]>).map(([key, val]) => (
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
