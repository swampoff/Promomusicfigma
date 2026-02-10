/**
 * PROMO.GUIDE APP - ФАЗА 1 (МИНИМАЛЬНАЯ ВЕРСИЯ)
 * 
 * ТОЛЬКО READ-ONLY:
 * - Показать список venue
 * - Показать "сейчас играет"
 * - Фильтры (город, тип, жанр)
 * - Venue detail page
 * - "Построить маршрут"
 * 
 * БЕЗ:
 * - QR-кодов
 * - Социального слоя
 * - Геймификации
 * - Регистрации
 */

import { useState } from 'react';
import { Music, MapPin, Filter, Clock, Star, Navigation, ExternalLink } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { motion } from 'motion/react';

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
  nowPlaying: NowPlaying | null;
  phoneNumber?: string;
  website?: string;
  coverImage?: string;
  description?: string;
  hours?: string;
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
    phoneNumber: '+7 (495) 123-45-67',
    website: 'sunset-lounge.com',
    description: 'Авторская кухня и виниловые вечера в сердце Москвы',
    hours: 'Пн-Вс: 12:00 - 02:00',
    nowPlaying: {
      track: 'So What',
      artist: 'Miles Davis',
      album: 'Kind of Blue',
      coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
      genre: 'Jazz',
      startedAt: '2026-02-04T18:30:00Z'
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
    description: 'Культовый техно-клуб с мировыми DJ',
    hours: 'Чт-Сб: 23:00 - 06:00',
    nowPlaying: {
      track: 'Feel It',
      artist: 'Amelie Lens',
      coverUrl: 'https://images.unsplash.com/photo-1571266028243-d220c6e87ad0?w=300&h=300&fit=crop',
      genre: 'Techno',
      startedAt: '2026-02-04T19:15:00Z'
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
    description: 'Specialty кофе и виниловая коллекция',
    hours: 'Пн-Вс: 08:00 - 22:00',
    nowPlaying: {
      track: 'Such Great Heights',
      artist: 'The Postal Service',
      album: 'Give Up',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      genre: 'Indie',
      startedAt: '2026-02-04T18:45:00Z'
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
    hours: 'Вт-Вс: 18:00 - 23:00',
    nowPlaying: {
      track: 'Blue Train',
      artist: 'John Coltrane',
      coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop',
      genre: 'Jazz',
      startedAt: '2026-02-04T19:00:00Z'
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
    description: 'Живой рок каждые выходные',
    hours: 'Пн-Вс: 15:00 - 01:00',
    nowPlaying: null // Настройка выключена или закрыто
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

  // Фильтрация заведений
  const filteredVenues = venues.filter(venue => {
    if (filters.onlyOpen && !venue.isOpen) return false;
    if (filters.onlyWithMusic && !venue.nowPlaying) return false;
    if (filters.genre !== 'all' && !venue.genres.includes(filters.genre)) return false;
    if (filters.type !== 'all' && venue.type !== filters.type) return false;
    return true;
  });

  // Если выбрано venue - показываем detail page
  if (selectedVenue) {
    return (
      <VenueDetailPage
        venue={selectedVenue}
        onBack={() => setSelectedVenue(null)}
      />
    );
  }

  // Иначе - показываем список
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <HeroSection />

      {/* Filters */}
      <FiltersBar filters={filters} setFilters={setFilters} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <VenuesGrid
          venues={filteredVenues}
          onVenueClick={(venue) => setSelectedVenue(venue)}
        />
      </div>
    </div>
  );
}

// ==============================================
// HERO SECTION (упрощенная)
// ==============================================
function HeroSection() {
  const stats = {
    venues: mockVenues.length,
    liveNow: mockVenues.filter(v => v.nowPlaying).length
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-slate-950 to-blue-900/20 border-b border-white/10">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
            Promo<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">.Guide</span>
          </h1>

          <p className="text-xl text-slate-300 mb-2">
            Открывай заведения через музыку
          </p>

          <p className="text-slate-400">
            Узнай где прямо сейчас звучат твои любимые жанры
          </p>
        </motion.div>

        {/* Simple Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-white">{stats.venues}</div>
            <div className="text-sm text-slate-400">Заведений</div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div>
            <div className="text-3xl font-bold text-green-400">{stats.liveNow}</div>
            <div className="text-sm text-slate-400">Сейчас играет</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ==============================================
// FILTERS BAR (упрощенная)
// ==============================================
function FiltersBar({ filters, setFilters }: any) {
  const genres = ['all', 'Jazz', 'Techno', 'House', 'Indie', 'Rock', 'Soul'];
  const types = ['all', 'bar', 'club', 'cafe', 'restaurant', 'lounge'];

  return (
    <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-slate-400" />

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
// VENUE CARD (упрощенная)
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
              <Star className="w-4 h-4 text-blue-400 fill-current" />
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
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/20 text-center">
          <span className="text-slate-500 text-sm">—</span>
        </div>
      )}
    </motion.div>
  );
}

// ==============================================
// VENUE DETAIL PAGE (упрощенная)
// ==============================================
function VenueDetailPage({ venue, onBack }: { venue: Venue; onBack: () => void }) {
  // Google Maps URL
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${venue.coords.lat},${venue.coords.lng}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950"
    >
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button onClick={onBack} variant="outline">
          ← Назад к списку
        </Button>

        {/* Cover */}
        {venue.coverImage && (
          <div className="h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <img src={venue.coverImage} alt={venue.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Main Info */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-white">{venue.name}</h1>
            {venue.verified && <Star className="w-6 h-6 text-blue-400 fill-current" />}
          </div>

          <div className="space-y-3 text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              <span>{venue.address}, {venue.city}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>{venue.hours || 'Уточняйте время работы'}</span>
            </div>

            {venue.phoneNumber && (
              <div className="flex items-center gap-2">
                <span className="text-purple-400">📞</span>
                <a href={`tel:${venue.phoneNumber}`} className="hover:text-purple-400 transition-colors">
                  {venue.phoneNumber}
                </a>
              </div>
            )}

            {venue.website && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-purple-400" />
                <a
                  href={`https://${venue.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition-colors"
                >
                  {venue.website}
                </a>
              </div>
            )}
          </div>

          {venue.description && (
            <p className="mt-4 text-slate-400">{venue.description}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
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
          <div className="mt-4">
            <div className="text-sm text-slate-400 mb-2">Музыкальные стили:</div>
            <div className="flex flex-wrap gap-2">
              {venue.genres.map((genre) => (
                <Badge key={genre} className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="w-4 h-4 mr-2" />
                Построить маршрут
              </a>
            </Button>
          </div>
        </div>

        {/* Now Playing */}
        {venue.nowPlaying && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 border border-purple-500/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Сейчас играет
            </h3>

            <div className="flex gap-4">
              <img
                src={venue.nowPlaying.coverUrl}
                alt="Cover"
                className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
              />

              <div className="flex-1">
                <h4 className="text-xl font-bold text-white mb-1">
                  {venue.nowPlaying.track}
                </h4>
                <p className="text-lg text-purple-300 mb-2">
                  {venue.nowPlaying.artist}
                </p>
                {venue.nowPlaying.album && (
                  <p className="text-sm text-slate-400">{venue.nowPlaying.album}</p>
                )}
                <Badge className="mt-2 bg-purple-500/10 border-purple-500/30 text-purple-300">
                  {venue.nowPlaying.genre}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}