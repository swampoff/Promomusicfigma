import { Play, Heart, Share2, TrendingUp, Users, Music2, Plus, Sparkles, Zap, Target, ArrowRight, ExternalLink, Disc3, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { PromotedConcertsSidebar, PromotedConcert } from '@/app/components/promoted-concerts-sidebar';
import { PromotedNewsBlock } from '@/app/components/promoted-news-block';
import { initDemoData, checkNeedsInit } from '@/utils/initDemoData';
import { useArtistProfile } from '@/utils/hooks/useArtistProfile';
import { formatStat } from '@/utils/api/artist-profile';
import { GenreTag } from '@/app/components/genre-icon';
import { PromoLogo } from '@/app/components/promo-logo';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  preview: string;
  coverImage: string;
  date: string;
  status: string;
  views: number;
  likes: number;
  comments: number;
  isPaid: boolean;
  createdAt: string;
}

interface HomePageProps {
  onNavigate: (section: string) => void;
  promotedConcerts?: PromotedConcert[];
  promotedNews?: NewsItem[];
}

const recentTracks = [
  { id: 1, title: 'Midnight Dreams', plays: '2.4K', likes: 340, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400' },
  { id: 2, title: 'Electric Soul', plays: '1.8K', likes: 280, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' },
  { id: 3, title: 'Summer Vibes', plays: '3.1K', likes: 420, cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400' },
];

const recommendations = [
  {
    title: 'Запустите питчинг',
    description: 'Продвиньте свой лучший трек и получите до 50К новых слушателей',
    icon: Target,
    action: 'Начать кампанию',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-400/30',
    iconColor: 'text-purple-400',
    route: 'rating',
  },
  {
    title: 'Добавьте новый релиз',
    description: 'Загрузите свежий трек и покажите его своей аудитории',
    icon: Plus,
    action: 'Загрузить трек',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-400/30',
    iconColor: 'text-cyan-400',
    route: 'tracks',
  },
];

// Статические shadow-классы (Tailwind не поддерживает динамическую генерацию)
const STAT_SHADOW: Record<string, string> = {
  'text-cyan-400': 'hover:shadow-cyan-500/10',
  'text-pink-400': 'hover:shadow-pink-500/10',
  'text-orange-400': 'hover:shadow-orange-500/10',
  'text-emerald-400': 'hover:shadow-emerald-500/10',
};

export function HomePage({ 
  onNavigate = () => {}, 
  promotedConcerts, 
  promotedNews,
}: HomePageProps) {
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());

  // Единый хук - кэшированный профиль и статистика
  const { profile, stats, firstName, city, genres: artistGenres } = useArtistProfile();

  // Initialize demo data safely
  useEffect(() => {
    checkNeedsInit()
      .then((needs) => { if (needs) return initDemoData(); })
      .catch(() => console.log('Using local mock data (API not available)'));
  }, []);

  // Карточки статистики (мемоизированы, не IIFE в JSX)
  const statCards = useMemo(() => [
    {
      label: 'Прослушивания',
      value: formatStat(stats?.totalPlays ?? profile?.totalPlays ?? 0),
      icon: Play,
      color: 'text-cyan-400',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-500/20',
      route: 'analytics',
    },
    {
      label: 'Подписчики',
      value: formatStat(stats?.totalFollowers ?? profile?.totalFollowers ?? 0),
      icon: Users,
      color: 'text-pink-400',
      gradient: 'from-pink-500/20 to-purple-500/20',
      border: 'border-pink-500/20',
      route: 'analytics',
    },
    {
      label: 'Концерты',
      value: String(stats?.totalConcerts ?? profile?.totalConcerts ?? 0),
      icon: Calendar,
      color: 'text-orange-400',
      gradient: 'from-orange-500/20 to-amber-500/20',
      border: 'border-orange-500/20',
      route: 'concerts',
    },
    {
      label: 'Треки',
      value: String(profile?.totalTracks ?? 0),
      icon: Disc3,
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-green-500/20',
      border: 'border-emerald-500/20',
      route: 'tracks',
    },
  ], [stats, profile]);

  const hasRealData = Boolean(stats || profile);

  const handlePlay = (trackId: number) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId);
  };

  const toggleLike = (trackId: number) => {
    setLikedTracks(prev => {
      const next = new Set(prev);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4 sm:gap-6 lg:gap-8 max-w-[1600px] mx-auto w-full">
      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 min-w-0">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-cyan-900/40 border border-white/10 shadow-2xl"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 text-center">
            {/* Animated Logo */}
            <div className="flex justify-center mb-4 sm:mb-5">
              <PromoLogo size="xl" showText={false} animated delay={0.1} />
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 sm:mb-6"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-400 text-xs sm:text-sm font-semibold whitespace-nowrap">ПРОМО.МУЗЫКА</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 px-2 leading-tight break-words"
            >
              {firstName
                ? <span className="contents">{firstName}, <span className="bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-cyan-400 bg-clip-text text-transparent">добро пожаловать</span></span>
                : <span className="contents"><span className="bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-cyan-400 bg-clip-text text-transparent">Ваша музыка</span> заслуживает большего</span>}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2"
            >
              Маркетинговая экосистема для музыкантов
            </motion.p>

            {city && artistGenres.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-6 px-2"
              >
                <span className="text-gray-300 text-sm sm:text-base md:text-lg">{city}</span>
                <span className="text-gray-500">·</span>
                {artistGenres.map((g) => (
                  <GenreTag key={g} genre={g} size="sm" active />
                ))}
                <span className="text-gray-500">-</span>
                <span className="text-gray-300 text-sm sm:text-base md:text-lg">ваш путь к вершинам</span>
              </motion.div>
            ) : (
              <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
                Ваш музыкальный путь начинается здесь
              </p>
            )}
          
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('tracks')}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Загрузить трек</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('analytics')}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm sm:text-base font-semibold transition-all duration-300 border border-white/20 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Смотреть аналитику</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats from Supabase */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const shadowClass = STAT_SHADOW[stat.color] || '';
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.08 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => onNavigate(stat.route)}
                className={`group relative p-4 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-gradient-to-br ${stat.gradient} border ${stat.border} cursor-pointer hover:shadow-lg ${shadowClass} transition-all duration-300`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-400 text-[10px] sm:text-xs mb-0.5 truncate">{stat.label}</div>
                    <div className={`text-xl sm:text-2xl font-bold ${stat.color} truncate`}>{stat.value}</div>
                  </div>
                </div>
                {hasRealData && (
                  <div className="mt-2 flex items-center text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Подробнее</span>
                    <ArrowRight className="w-2.5 h-2.5 ml-1 flex-shrink-0" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <motion.button
                key={rec.route}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(rec.route)}
                className={`p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br ${rec.gradient} border ${rec.borderColor} hover:border-opacity-50 transition-all duration-300 text-left group relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0">
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${rec.iconColor}`} />
                    </div>
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">{rec.title}</h3>
                  <p className="text-gray-300 text-sm sm:text-base mb-4 break-words">{rec.description}</p>
                  
                  <div className="flex items-center text-cyan-400 text-sm sm:text-base font-semibold group-hover:gap-2 transition-all">
                    <span className="truncate">{rec.action}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">Популярные треки</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('tracks')}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
            >
              <span>Все треки</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </motion.button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {recentTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 5 }}
                className="group p-3 sm:p-4 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={track.cover} 
                      alt={track.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePlay(track.id)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {playingTrack === track.id ? (
                        <div className="flex gap-1">
                          <div className="w-1 h-3 sm:h-4 bg-white rounded-full animate-pulse" />
                          <div className="w-1 h-3 sm:h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        </div>
                      ) : (
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
                      )}
                    </motion.button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-1 truncate">{track.title}</div>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{track.plays}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors flex-shrink-0 ${likedTracks.has(track.id) ? 'fill-pink-400 text-pink-400' : ''}`} />
                        <span className="whitespace-nowrap">{track.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(track.id)}
                    className={`p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-pink-500/20 transition-all duration-300 ${likedTracks.has(track.id) ? 'bg-pink-500/20' : ''}`}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${likedTracks.has(track.id) ? 'fill-pink-400 text-pink-400 scale-110' : 'text-gray-400'}`} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-cyan-500/20 transition-all duration-300"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onNavigate('rating')}
                    className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 border border-purple-400/30"
                  >
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('concerts')}
            className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 hover:border-orange-400/50 transition-all duration-300 text-left group"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">Концерты</h3>
            <p className="text-gray-300 text-xs sm:text-sm truncate">
              {profile?.totalConcerts ? `${profile.totalConcerts} событий` : '3 предстоящих события'}
            </p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.05, rotate: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('messages')}
            className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 text-left group relative"
          >
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] sm:text-xs font-bold">3</span>
            </div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">Сообщения</h3>
            <p className="text-gray-300 text-xs sm:text-sm truncate">3 новых сообщения</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('news')}
            className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 hover:border-green-400/50 transition-all duration-300 text-left group sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">Новости</h3>
            <p className="text-gray-300 text-xs sm:text-sm truncate">Поделитесь с фанатами</p>
          </motion.button>
        </div>

        {/* Upcoming Concerts Section */}
        {promotedConcerts && promotedConcerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
                Предстоящие концерты
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('concerts')}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
              >
                <span>Все концерты</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {promotedConcerts.slice(0, 3).map((concert, index) => (
                <motion.div
                  key={concert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-400/50 transition-all cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={concert.banner}
                      alt={concert.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    
                    <div className="absolute top-3 right-3 px-3 py-2 rounded-xl bg-purple-500/80 backdrop-blur-md text-center border border-purple-400/50">
                      <div className="text-xl font-bold text-white leading-none mb-1">
                        {new Date(concert.date).getDate()}
                      </div>
                      <div className="text-[10px] text-purple-200 uppercase font-semibold">
                        {new Date(concert.date).toLocaleDateString('ru-RU', { month: 'short' })}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
                      {concert.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Target className="w-4 h-4 flex-shrink-0 text-purple-400" />
                      <span className="truncate">{concert.city}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Music2 className="w-4 h-4 flex-shrink-0 text-purple-400" />
                      <span className="truncate">{concert.time} · {concert.type}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{concert.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{concert.clicks.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4 sm:space-y-6 min-w-0">
        {promotedConcerts && promotedConcerts.length > 0 && (
          <PromotedConcertsSidebar concerts={promotedConcerts} />
        )}
        {promotedNews && promotedNews.length > 0 && (
          <PromotedNewsBlock newsItems={promotedNews} />
        )}
      </div>
    </div>
  );
}