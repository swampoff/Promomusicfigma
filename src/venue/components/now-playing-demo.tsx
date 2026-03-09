/**
 * NOW PLAYING DEMO
 * Демонстрация как "сейчас играет" отображается для посетителей
 */

import { Music, MapPin, Star, Clock, Users } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

export function NowPlayingDemo() {
  return (
    <div className="min-h-screen p-8 bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎵 "Сейчас играет" - Демонстрация
          </h1>
          <p className="text-slate-400 text-lg">
            Так посетители видят вашу музыку в публичном каталоге
          </p>
        </div>

        {/* Scenario 1: Catalog View */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm">1</div>
            В каталоге заведений
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* With Now Playing */}
            <VenueCard
              name="Sunset Lounge Bar"
              address="ул. Тверская, 15"
              rating={4.8}
              capacity={100}
              genres={['Jazz', 'Soul', 'Lounge']}
              nowPlaying={{
                track: "So What",
                artist: "Miles Davis",
                album: "Kind of Blue",
                position: 154,
                duration: 562,
                isPlaying: true
              }}
              showNowPlaying={true}
            />

            {/* Without Now Playing */}
            <VenueCard
              name="Rock Bar Moscow"
              address="Новинский бульвар, 8"
              rating={4.2}
              capacity={80}
              genres={['Rock', 'Metal']}
              nowPlaying={null}
              showNowPlaying={false}
            />
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <p className="text-purple-300 text-sm">
              <strong>⬅️ Слева:</strong> Настройка включена - посетители видят "Miles Davis - So What"<br />
              <strong>➡️ Справа:</strong> Настройка выключена - музыка скрыта
            </p>
          </div>
        </div>

        {/* Scenario 2: Mobile Nearby */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm">2</div>
            В мобильном приложении "Рядом со мной"
          </h2>

          <div className="max-w-sm mx-auto">
            <MobileNearbyView />
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
            <p className="text-indigo-300 text-sm">
              <strong>📱 Mobile:</strong> Посетитель гуляет по городу → видит что играет → идет в бар!
            </p>
          </div>
        </div>

        {/* Scenario 3: Full Player Widget */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm">3</div>
            В публичном профиле заведения
          </h2>

          <div className="max-w-2xl mx-auto">
            <PublicPlayerWidget />
          </div>

          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <p className="text-green-300 text-sm">
              <strong>🎵 Полный плеер:</strong> Посетитель видит обложку, прогресс, альбом
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">🔧 Как это работает</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step
              number="1"
              title="Venue включает трек"
              description="В кабинете venue выбирает трек и нажимает Play"
            />
            <Step
              number="2"
              title="Backend обновляет статус"
              description="Сохраняется в venue_playback_status с public_visibility"
            />
            <Step
              number="3"
              title="Посетители видят"
              description="Публичный API показывает данные в каталогах и картах"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// VENUE CARD
// =====================================================
interface VenueCardProps {
  name: string;
  address: string;
  rating: number;
  capacity: number;
  genres: string[];
  nowPlaying: {
    track: string;
    artist: string;
    album?: string;
    position: number;
    duration: number;
    isPlaying: boolean;
  } | null;
  showNowPlaying: boolean;
}

function VenueCard({ name, address, rating, capacity, genres, nowPlaying, showNowPlaying }: VenueCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
          <p className="text-slate-400 text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {address}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-white">{rating}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Users className="w-4 h-4" />
          <span>{capacity} мест</span>
        </div>
      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-2 mb-4">
        {genres.map((genre) => (
          <Badge key={genre} variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
            {genre}
          </Badge>
        ))}
      </div>

      {/* Now Playing */}
      {showNowPlaying && nowPlaying ? (
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-purple-400 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">
                {nowPlaying.artist} - {nowPlaying.track}
              </div>
              <div className="text-purple-300 text-xs">
                {formatTime(nowPlaying.position)} / {formatTime(nowPlaying.duration)}
              </div>
            </div>
            {nowPlaying.isPlaying && (
              <div className="flex gap-0.5">
                <MusicBar delay={0} />
                <MusicBar delay={75} />
                <MusicBar delay={150} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/20">
          <div className="text-slate-500 text-sm flex items-center gap-2">
            <Music className="w-4 h-4" />
            Музыкальная информация скрыта
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// MOBILE NEARBY VIEW
// =====================================================
function MobileNearbyView() {
  const venues = [
    {
      name: "Sunset Lounge Bar",
      distance: "0.5 км",
      nowPlaying: "Miles Davis - So What",
      rating: 4.8,
      status: "Открыто до 02:00"
    },
    {
      name: "Jazz Corner Club",
      distance: "1.2 км",
      nowPlaying: "John Coltrane - Blue Train",
      rating: 4.6,
      status: "Открыто до 23:00"
    },
    {
      name: "Rock Bar",
      distance: "1.8 км",
      nowPlaying: null,
      rating: 4.2,
      status: "Открыто до 01:00"
    }
  ];

  return (
    <div className="bg-slate-900 rounded-3xl border-4 border-slate-700 p-4 shadow-2xl">
      {/* Phone Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <Clock className="w-5 h-5 text-white" />
        <div className="text-white font-medium">📍 Заведения рядом</div>
        <div className="w-5" />
      </div>

      {/* Venues List */}
      <div className="space-y-3">
        {venues.map((venue) => (
          <div key={venue.name} className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{venue.name}</div>
                {venue.nowPlaying ? (
                  <div className="text-purple-400 text-xs flex items-center gap-1 mt-1">
                    <Music className="w-3 h-3" />
                    {venue.nowPlaying}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs mt-1">🔒 Музыка скрыта</div>
                )}
              </div>
              <div className="text-slate-400 text-xs">{venue.distance}</div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                {venue.rating}
              </div>
              <div className="text-green-400">{venue.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// PUBLIC PLAYER WIDGET
// =====================================================
function PublicPlayerWidget() {
  const nowPlaying = {
    track: "So What",
    artist: "Miles Davis",
    album: "Kind of Blue",
    year: 1959,
    genre: "Jazz",
    coverUrl: "/banners/radio.png",
    position: 154,
    duration: 562,
    source: "Jazz FM Radio"
  };

  const progress = (nowPlaying.position / nowPlaying.duration) * 100;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 border border-purple-500/30 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Сейчас играет</h3>
      </div>

      <div className="flex gap-6">
        {/* Cover */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg">
            <img
              src={nowPlaying.coverUrl}
              alt="Album cover"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-2xl font-bold text-white mb-1 truncate">
            {nowPlaying.track}
          </h4>
          <p className="text-lg text-purple-300 mb-2 truncate">
            {nowPlaying.artist}
          </p>
          <p className="text-sm text-slate-400 mb-4">
            {nowPlaying.album} ({nowPlaying.year})
          </p>

          {/* Progress */}
          <div className="space-y-2">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{formatTime(nowPlaying.position)}</span>
              <span>{formatTime(nowPlaying.duration)}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-4 text-xs">
            <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
              {nowPlaying.genre}
            </Badge>
            <span className="text-slate-400">
              Добавлено от {nowPlaying.source}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// STEP COMPONENT
// =====================================================
function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
        {number}
      </div>
      <h4 className="text-white font-medium mb-2">{title}</h4>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}

// =====================================================
// MUSIC BAR ANIMATION
// =====================================================
function MusicBar({ delay }: { delay: number }) {
  return (
    <div
      className="w-1 h-4 bg-purple-400 rounded-full animate-music-bar"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

// =====================================================
// UTILS
// =====================================================
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
