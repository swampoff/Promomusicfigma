/**
 * PROMO.GUIDE - Музыкальный Shazam наоборот
 * 
 * Концепция: Показываем где прямо сейчас играет классная музыка
 * Win-Win-Win: Venue получают трафик, артисты — промо, мы — доминацию
 */

import { useState, useEffect } from 'react';
import { Music, MapPin, Filter, Clock, Star, Navigation, TrendingUp, Radio, Headphones } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

// ==============================================
// TYPES
// ==============================================
interface NowPlaying {
  track: string;
  artist: string;
  album?: string;
  coverUrl: string;
  genre: string;
  startedAt: string;
  source: 'radio' | 'playlist' | 'artist';
  sourceName: string;
}

interface Venue {
  id: string;
  name: string;
  type: 'restaurant' | 'bar' | 'cafe' | 'club' | 'hotel' | 'lounge';
  address: string;
  city: string;
  coords: { lat: number; lng: number };
  rating: number;
  capacity: number;
  genres: string[];
  isOpen: boolean;
  openUntil?: string;
  verified: boolean;
  premium: boolean;
  nowPlaying: NowPlaying | null;
  phoneNumber?: string;
  website?: string;
  coverImage?: string;
  description?: string;
}

// ==============================================
// MOCK DATA (будет заменено на API)
// ==============================================
const mockVenues: Venue[] = [
  {
    id: 'venue-1',
    name: 'Sunset Lounge Bar',
    type: 'lounge',
    address: 'ул. Тверская, 15',
    city: 'Москва',
    coords: { lat: 55.7642, lng: 37.6068 },
    rating: 4.8,
    capacity: 100,
    genres: ['Jazz', 'Soul', 'Lounge'],
    isOpen: true,
    openUntil: '02:00',
    verified: true,
    premium: true,
    phoneNumber: '+7 (495) 123-45-67',
    website: 'sunset-lounge.com',
    description: 'Авторская кухня и виниловые вечера в сердце Москвы',
    nowPlaying: {
      track: 'So What',
      artist: 'Miles Davis',
      album: 'Kind of Blue',
      coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
      genre: 'Jazz',
      startedAt: '2026-02-04T18:30:00Z',
      source: 'radio',
      sourceName: 'Jazz FM Radio'
    }
  },
  {
    id: 'venue-2',
    name: 'NEON Club',
    type: 'club',
    address: 'Кутузовский пр., 12',
    city: 'Москва',
    coords: { lat: 55.7422, lng: 37.5633 },
    rating: 4.6,
    capacity: 300,
    genres: ['Techno', 'House', 'Electronic'],
    isOpen: true,
    openUntil: '06:00',
    verified: true,
    premium: true,
    description: 'Культовый техно-клуб с мировыми DJ',
    nowPlaying: {
      track: 'Feel It',
      artist: 'Amelie Lens',
      coverUrl: 'https://images.unsplash.com/photo-1571266028243-d220c6e87ad0?w=300&h=300&fit=crop',
      genre: 'Techno',
      startedAt: '2026-02-04T19:15:00Z',
      source: 'artist',
      sourceName: 'Amelie Lens'
    }
  },
  {
    id: 'venue-3',
    name: 'Coffee & Vinyl',
    type: 'cafe',
    address: 'Патриаршие пруды, 5',
    city: 'Москва',
    coords: { lat: 55.7644, lng: 37.5927 },
    rating: 4.9,
    capacity: 40,
    genres: ['Indie', 'Alternative', 'Lo-Fi'],
    isOpen: true,
    openUntil: '22:00',
    verified: true,
    premium: false,
    description: 'Specialty кофе и виниловая коллекция',
    nowPlaying: {
      track: 'Such Great Heights',
      artist: 'The Postal Service',
      album: 'Give Up',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      genre: 'Indie',
      startedAt: '2026-02-04T18:45:00Z',
      source: 'playlist',
      sourceName: 'Indie Classics'
    }
  },
  {
    id: 'venue-4',
    name: 'Jazz Corner Club',
    type: 'bar',
    address: 'Новинский бульвар, 8',
    city: 'Москва',
    coords: { lat: 55.7539, lng: 37.5844 },
    rating: 4.7,
    capacity: 80,
    genres: ['Jazz', 'Blues', 'Swing'],
    isOpen: true,
    openUntil: '23:00',
    verified: true,
    premium: false,
    nowPlaying: {
      track: 'Blue Train',
      artist: 'John Coltrane',
      coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop',
      genre: 'Jazz',
      startedAt: '2026-02-04T19:00:00Z',
      source: 'radio',
      sourceName: 'Jazz FM Radio'
    }
  },
  {
    id: 'venue-5',
    name: 'Rock Pub Moscow',
    type: 'bar',
    address: 'ул. Арбат, 27',
    city: 'Москва',
    coords: { lat: 55.7509, lng: 37.5902 },
    rating: 4.3,
    capacity: 120,
    genres: ['Rock', 'Afrobeat', 'Alternative'],
    isOpen: false,
    openUntil: '01:00',
    verified: false,
    premium: false,
    description: 'Живой рок каждые выходные',
    nowPlaying: null // Настройка выключена
  }
];

// ==============================================
// MAIN COMPONENT
// ==============================================
export default function PromoGuideApp() {
  const [venues, setVenues] = useState<Venue[]>(mockVenues);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [filters, setFilters] = useState({
    genre: 'all',
    type: 'all',
    onlyOpen: false,
    onlyWithMusic: true
  });
  const [view, setView] = useState<'map' | 'list' | 'venue'>('list');

  // Фильтрация заведений
  const filteredVenues = venues.filter(venue => {
    if (filters.onlyOpen && !venue.isOpen) return false;
    if (filters.onlyWithMusic && !venue.nowPlaying) return false;
    if (filters.genre !== 'all' && !venue.genres.includes(filters.genre)) return false;
    if (filters.type !== 'all' && venue.type !== filters.type) return false;
    return true;
  });

  // Статистика
  const stats = {
    totalVenues: venues.length,
    activeNow: venues.filter(v => v.nowPlaying).length,
    genres: Array.from(new Set(venues.flatMap(v => v.genres))).length,
    cities: Array.from(new Set(venues.map(v => v.city))).length
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <HeroSection stats={stats} />

      {/* Filters */}
      <FiltersBar filters={filters} setFilters={setFilters} />

      {/* View Toggle */}
      <ViewToggle view={view} setView={setView} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === 'list' && (
          <VenuesGrid 
            venues={filteredVenues} 
            onVenueClick={(venue) => {
              setSelectedVenue(venue);
              setView('venue');
            }}
          />
        )}

        {view === 'map' && (
          <MapView 
            venues={filteredVenues}
            onVenueClick={(venue) => {
              setSelectedVenue(venue);
              setView('venue');
            }}
          />
        )}

        {view === 'venue' && selectedVenue && (
          <VenueDetailPage 
            venue={selectedVenue}
            onBack={() => setView('list')}
          />
        )}
      </div>

      {/* Live Feed */}
      <LiveFeed venues={venues.filter(v => v.nowPlaying)} />
    </div>
  );
}

// ==============================================
// HERO SECTION
// ==============================================
function HeroSection({ stats }: { stats: any }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-slate-950 to-blue-900/20 border-b border-white/10">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm mb-6">
            <TrendingUp className="w-4 h-4" />
            Музыкальный гид нового поколения
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            Promo<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">.Guide</span>
          </h1>

          <p className="text-xl lg:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto">
            Shazam наоборот: не "что играет?", а <span className="text-purple-400 font-semibold">"где играет классное?"</span>
          </p>

          <p className="text-slate-400 max-w-2xl mx-auto">
            Откройте заведения через музыку. Узнайте где прямо сейчас звучат ваши любимые артисты и жанры.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          <StatCard icon={MapPin} label="Заведений" value={stats.totalVenues} />
          <StatCard icon={Music} label="В эфире" value={stats.activeNow} color="text-green-400" />
          <StatCard icon={Headphones} label="Жанров" value={stats.genres} />
          <StatCard icon={Radio} label="Городов" value={stats.cities} />
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = 'text-purple-400' }: any) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center">
      <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

// ==============================================
// FILTERS BAR
// ==============================================
function FiltersBar({ filters, setFilters }: any) {
  const genres = ['all', 'Jazz', 'Techno', 'House', 'Indie', 'Rock', 'Soul', 'Blues'];
  const types = ['all', 'bar', 'club', 'cafe', 'restaurant', 'lounge', 'hotel'];

  return (
    <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-slate-400" />

          {/* Genre Filter */}
          <select
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>
                {genre === 'all' ? 'Все жанры' : genre}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'Все типы' : type}
              </option>
            ))}
          </select>

          {/* Toggle Filters */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onlyOpen}
              onChange={(e) => setFilters({ ...filters, onlyOpen: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-slate-300">Только открытые</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onlyWithMusic}
              onChange={(e) => setFilters({ ...filters, onlyWithMusic: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-slate-300">С музыкой сейчас</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ==============================================
// VIEW TOGGLE
// ==============================================
function ViewToggle({ view, setView }: any) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1">
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'list'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Список
        </button>
        <button
          onClick={() => setView('map')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'map'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Карта
        </button>
      </div>
    </div>
  );
}

// ==============================================
// VENUES GRID
// ==============================================
function VenuesGrid({ venues, onVenueClick }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map((venue: Venue) => (
        <VenueCard key={venue.id} venue={venue} onClick={() => onVenueClick(venue)} />
      ))}

      {venues.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Нет заведений по выбранным фильтрам</p>
        </div>
      )}
    </div>
  );
}

// ==============================================
// VENUE CARD
// ==============================================
function VenueCard({ venue, onClick }: { venue: Venue; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group cursor-pointer p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
              {venue.name}
            </h3>
            {venue.verified && (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            )}
            {venue.premium && (
              <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-300 text-xs">
                Premium
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {venue.address}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-white">{venue.rating}</span>
        </div>
        <span className="text-slate-400">•</span>
        <span className="text-slate-400">{venue.capacity} мест</span>
        <span className="text-slate-400">•</span>
        <span className={venue.isOpen ? 'text-green-400' : 'text-red-400'}>
          {venue.isOpen ? `До ${venue.openUntil}` : 'Закрыто'}
        </span>
      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-2 mb-4">
        {venue.genres.slice(0, 3).map((genre) => (
          <Badge key={genre} variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs">
            {genre}
          </Badge>
        ))}
      </div>

      {/* Now Playing */}
      {venue.nowPlaying ? (
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <img
              src={venue.nowPlaying.coverUrl}
              alt="Cover"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Music className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-xs text-purple-300">Сейчас играет</span>
              </div>
              <div className="text-white font-medium text-sm truncate">
                {venue.nowPlaying.artist}
              </div>
              <div className="text-purple-300 text-xs truncate">
                {venue.nowPlaying.track}
              </div>
            </div>
            <MusicBars />
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/20 text-center">
          <span className="text-slate-500 text-sm">🔒 Музыка скрыта</span>
        </div>
      )}
    </motion.div>
  );
}

// ==============================================
// MUSIC BARS ANIMATION
// ==============================================
function MusicBars() {
  return (
    <div className="flex gap-0.5">
      {[0, 75, 150].map((delay) => (
        <div
          key={delay}
          className="w-1 h-4 bg-purple-400 rounded-full animate-music-bar"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

// ==============================================
// MAP VIEW (Placeholder)
// ==============================================
function MapView({ venues, onVenueClick }: any) {
  return (
    <div className="h-[600px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 mb-2">Интерактивная карта</p>
        <p className="text-sm text-slate-500">Интеграция с картами будет добавлена</p>
        <div className="mt-6">
          <Button onClick={() => {}}>
            <Navigation className="w-4 h-4 mr-2" />
            Включить карту
          </Button>
        </div>
      </div>
    </div>
  );
}

// ==============================================
// VENUE DETAIL PAGE
// ==============================================
function VenueDetailPage({ venue, onBack }: { venue: Venue; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button onClick={onBack} variant="outline">
        ← Назад к списку
      </Button>

      {/* Cover */}
      <div className="h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
        {venue.coverImage && (
          <img src={venue.coverImage} alt={venue.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Main Info */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white">{venue.name}</h1>
              {venue.verified && <Star className="w-6 h-6 text-blue-400 fill-current" />}
              {venue.premium && (
                <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-300">
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {venue.address}, {venue.city}
            </p>
            {venue.description && (
              <p className="text-slate-300 mt-4">{venue.description}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="text-white font-medium">{venue.rating}</span>
              <span className="text-slate-400">рейтинг</span>
            </div>
            <div className="text-slate-400">{venue.capacity} мест</div>
            <div className={`font-medium ${venue.isOpen ? 'text-green-400' : 'text-red-400'}`}>
              {venue.isOpen ? `Открыто до ${venue.openUntil}` : 'Закрыто'}
            </div>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Музыкальный стиль</h3>
            <div className="flex flex-wrap gap-2">
              {venue.genres.map((genre) => (
                <Badge key={genre} className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Navigation className="w-4 h-4 mr-2" />
              Построить маршрут
            </Button>
            {venue.phoneNumber && (
              <Button variant="outline" className="flex-1">
                Позвонить
              </Button>
            )}
          </div>
        </div>

        {/* Right Column - Now Playing */}
        <div className="lg:w-96 space-y-6">
          {venue.nowPlaying ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 border border-purple-500/30">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                Сейчас в эфире
              </h3>

              <div className="space-y-4">
                <img
                  src={venue.nowPlaying.coverUrl}
                  alt="Cover"
                  className="w-full aspect-square rounded-xl object-cover"
                />

                <div>
                  <h4 className="text-2xl font-bold text-white mb-1">
                    {venue.nowPlaying.track}
                  </h4>
                  <p className="text-lg text-purple-300 mb-2">
                    {venue.nowPlaying.artist}
                  </p>
                  {venue.nowPlaying.album && (
                    <p className="text-sm text-slate-400">{venue.nowPlaying.album}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                    {venue.nowPlaying.genre}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    от {venue.nowPlaying.sourceName}
                  </span>
                </div>

                <Button className="w-full bg-white/10 hover:bg-white/20">
                  Найти этот трек на promo.music
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-500/5 border border-slate-500/20 text-center">
              <Music className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Музыка сейчас не транслируется</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ==============================================
// LIVE FEED
// ==============================================
function LiveFeed({ venues }: { venues: Venue[] }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-white">Сейчас в эфире</span>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {venues.map((venue) => (
            <div key={venue.id} className="flex-shrink-0 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <img
                src={venue.nowPlaying!.coverUrl}
                alt="Cover"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <div className="text-sm text-white font-medium truncate">
                  {venue.nowPlaying!.artist} - {venue.nowPlaying!.track}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {venue.name}
                </div>
              </div>
              <MusicBars />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}