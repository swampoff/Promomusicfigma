/**
 * ARTIST PUBLIC PROFILE PAGE
 * Полноценная публичная страница артиста
 * Glassmorphism + розовая палитра promo.music
 * Реальные данные из API (профиль, треки, похожие артисты)
 * Полностью адаптивная (xs → 2xl)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Play, Pause, Heart, Share2, ExternalLink,
  MapPin, Calendar, Disc3, Users, Headphones, Music2,
  BadgeCheck, Star, Globe, Mail, Building2,
  Instagram, Youtube, Twitter, Music, Loader2,
  TrendingUp, Award, Mic2, Clock, ChevronRight, Sparkles,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  getArtistProfile, getArtistTracks, getSimilarArtists,
  type ArtistFullProfile, type ArtistTrack, type SimilarArtist,
} from '@/utils/api/artist-profile-public';
import { formatStat } from '@/utils/api/api-cache';

interface ArtistPublicProfileProps {
  artistId: string;
  artistName?: string;
  onBack: () => void;
  onPlayTrack?: (track: { id: string; title: string; artist: string; cover?: string; duration?: string }) => void;
  onArtistNavigate?: (artistId: string, artistName: string) => void;
}

// ── Hero banner images ──────────────────────────────────

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1721623777765-1381ba32859c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHMlMjBkYXJrfGVufDF8fHx8MTc3MDYzMDg0Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1573210947075-71f1caf5ad6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMGRhcmslMjBuZW9ufGVufDF8fHx8MTc3MDcyMDE0MXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1748698535024-e246f0da88dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwbXVzaWMlMjBwZXJmb3JtYW5jZSUyMHB1cnBsZSUyMGxpZ2h0c3xlbnwxfHx8fDE3NzA3MjA5NjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1636930245053-a5503c411cd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMHR1cm50YWJsZSUyMG5lb24lMjBjbHVifGVufDF8fHx8MTc3MDcyMDk2NXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1765224747205-3c9c23f0553c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nZXIlMjBtaWNyb3Bob25lJTIwc3BvdGxpZ2h0JTIwZGFya3xlbnwxfHx8fDE3NzA3MjA5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

function getHeroImage(id: string) {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return HERO_IMAGES[hash % HERO_IMAGES.length];
}

// ── Genre color mapping ─────────────────────────────────

function getGenreColor(genre: string): string {
  const g = genre.toLowerCase();
  if (g.includes('pop') && !g.includes('dream')) return 'from-pink-500 to-rose-600';
  if (g.includes('rock') && !g.includes('post')) return 'from-red-500 to-orange-600';
  if (g.includes('hip') || g.includes('rap') || g.includes('trap')) return 'from-amber-500 to-yellow-600';
  if (g.includes('electro') || g.includes('techno') || g.includes('house')) return 'from-cyan-500 to-blue-600';
  if (g.includes('jazz') || g.includes('soul') || g.includes('neo-soul')) return 'from-violet-500 to-purple-600';
  if (g.includes('indie') || g.includes('folk')) return 'from-emerald-500 to-teal-600';
  if (g.includes('ambient') || g.includes('dream') || g.includes('post-rock')) return 'from-indigo-500 to-blue-600';
  if (g.includes('lo-fi') || g.includes('chill')) return 'from-purple-500 to-fuchsia-600';
  if (g.includes('r&b')) return 'from-fuchsia-500 to-pink-600';
  if (g.includes('punk')) return 'from-orange-500 to-red-600';
  if (g.includes('synth')) return 'from-violet-500 to-indigo-600';
  if (g.includes('shoegaze')) return 'from-rose-500 to-pink-600';
  return 'from-slate-500 to-slate-600';
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── Stat Card ────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-3 sm:p-4 overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
      <div className="relative">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2 sm:mb-3 shadow-lg`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <p className="text-lg sm:text-xl md:text-2xl font-black text-white font-mono">{value}</p>
        <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Similar Artist Card ─────────────────────────────────

function SimilarArtistCard({ artist, onClick }: { artist: SimilarArtist; onClick: () => void }) {
  const genreColor = getGenreColor(artist.genre);
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-3 sm:p-4 text-left overflow-hidden group w-full"
    >
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${genreColor} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-300`} />

      <div className="relative flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white/5 group-hover:ring-[#FF577F]/30 transition-all">
          {artist.avatarUrl ? (
            <ImageWithFallback src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${genreColor} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{getInitials(artist.name)}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-white truncate group-hover:text-[#FF577F] transition-colors">{artist.name}</p>
            {artist.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-[#FF577F] flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r ${genreColor} text-white/90`}>{artist.genre}</span>
            {artist.city && <span className="text-[10px] text-slate-500 truncate">{artist.city}</span>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-slate-500 font-mono">{formatStat(artist.plays)} plays</span>
            <span className="text-[10px] text-slate-500 font-mono">{formatStat(artist.followers)} fans</span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#FF577F] flex-shrink-0 transition-colors" />
      </div>
    </motion.button>
  );
}

// ── Main Component ───────────────────────────────────────

export function ArtistPublicProfile({ artistId, artistName, onBack, onPlayTrack, onArtistNavigate }: ArtistPublicProfileProps) {
  const [profile, setProfile] = useState<ArtistFullProfile | null>(null);
  const [tracks, setTracks] = useState<ArtistTrack[]>([]);
  const [similar, setSimilar] = useState<SimilarArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  // Load all data in parallel
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setTracksLoading(true);
    setSimilarLoading(true);
    setError(null);

    // Profile (critical)
    try {
      const data = await getArtistProfile(artistId);
      if (data) {
        setProfile(data);
      } else {
        setError('Профиль не найден');
      }
    } catch {
      setError('Ошибка загрузки профиля');
    } finally {
      setIsLoading(false);
    }

    // Tracks (non-critical, parallel)
    getArtistTracks(artistId)
      .then(t => setTracks(t))
      .catch(() => setTracks([]))
      .finally(() => setTracksLoading(false));

    // Similar (non-critical, parallel)
    getSimilarArtists(artistId)
      .then(s => setSimilar(s))
      .catch(() => setSimilar([]))
      .finally(() => setSimilarLoading(false));
  }, [artistId]);

  useEffect(() => {
    loadAllData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadAllData]);

  const handlePlayTrack = useCallback((track: ArtistTrack) => {
    if (playingTrackId === track.id) {
      setPlayingTrackId(null);
      return;
    }
    setPlayingTrackId(track.id);
    onPlayTrack?.({
      id: track.id,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
    });
  }, [playingTrackId, onPlayTrack]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: profile?.fullName || artistName || 'Артист',
        text: `Послушай ${profile?.fullName || artistName} на Promo.Music`,
        url: window.location.href,
      }).catch(() => {});
    }
  }, [profile, artistName]);

  const handleSimilarClick = useCallback((a: SimilarArtist) => {
    onArtistNavigate?.(a.id, a.name);
  }, [onArtistNavigate]);

  // ── Loading State ─────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#FF577F] animate-spin" />
        <div className="text-center">
          <p className="text-white font-bold text-lg">{artistName || 'Загрузка...'}</p>
          <p className="text-slate-500 text-sm mt-1">Загружаем профиль артиста</p>
        </div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────

  if (error || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Music2 className="w-12 h-12 text-white/10" />
        <p className="text-slate-400 text-sm">{error || 'Профиль не найден'}</p>
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
      </div>
    );
  }

  const hasAvatar = !!profile.avatarUrl;
  const heroImg = getHeroImage(profile.id);
  const mainGenre = profile.genres[0] || 'Music';
  const genreColor = getGenreColor(mainGenre);
  const careerYears = profile.careerStart ? (new Date().getFullYear() - parseInt(profile.careerStart)) : null;

  const socials = [
    profile.socials?.instagram && { icon: Instagram, label: 'Instagram', value: profile.socials.instagram, url: `https://instagram.com/${profile.socials.instagram.replace('@', '')}` },
    profile.socials?.youtube && { icon: Youtube, label: 'YouTube', value: profile.socials.youtube, url: `https://youtube.com/${profile.socials.youtube}` },
    profile.socials?.twitter && { icon: Twitter, label: 'Twitter', value: profile.socials.twitter, url: `https://twitter.com/${profile.socials.twitter.replace('@', '')}` },
    profile.socials?.spotify && { icon: Music, label: 'Spotify', value: profile.socials.spotify, url: `https://open.spotify.com/artist/${profile.socials.spotify}` },
    profile.socials?.appleMusic && { icon: Music2, label: 'Apple Music', value: profile.socials.appleMusic, url: '#' },
  ].filter(Boolean) as Array<{ icon: any; label: string; value: string; url: string }>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Back Button ──────────────────────────────────── */}
      <div className="mb-4 sm:mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF577F]/30 text-sm text-white/80 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Назад</span>
        </motion.button>
      </div>

      {/* ── Hero Section ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8"
      >
        <div className="absolute inset-0">
          <ImageWithFallback src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14]/60 to-transparent" />
        </div>

        <div className="relative px-4 sm:px-6 md:px-8 pt-20 sm:pt-28 md:pt-36 pb-6 sm:pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="relative flex-shrink-0"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl sm:rounded-3xl overflow-hidden ring-4 ring-[#FF577F]/40 shadow-2xl shadow-[#FF577F]/20">
                {hasAvatar ? (
                  <ImageWithFallback src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${genreColor} flex items-center justify-center`}>
                    <span className="text-white font-black text-2xl sm:text-3xl md:text-4xl select-none">{getInitials(profile.fullName)}</span>
                  </div>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-[#0a0a14] rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF577F]" />
                </div>
              )}
            </motion.div>

            {/* Name & Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {profile.genres.slice(0, 2).map(g => (
                  <span key={g} className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r ${getGenreColor(g)} text-white shadow-lg`}>{g}</span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">{profile.fullName}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                {profile.city && (
                  <span className="flex items-center gap-1 text-xs sm:text-sm text-slate-400">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-[#FF577F]" />
                    {profile.city}{profile.country ? `, ${profile.country}` : ''}
                  </span>
                )}
                {careerYears != null && careerYears > 0 && (
                  <span className="flex items-center gap-1 text-xs sm:text-sm text-slate-400">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                    {careerYears} {careerYears === 1 ? 'год' : careerYears < 5 ? 'года' : 'лет'} на сцене
                  </span>
                )}
                {profile.label && (
                  <span className="flex items-center gap-1 text-xs sm:text-sm text-slate-400">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                    {profile.label}
                  </span>
                )}
              </div>
              {profile.rating > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < Math.round(profile.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-amber-400">{profile.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-sm transition-all ${
                  isFollowing
                    ? 'bg-white/10 border border-[#FF577F]/40 text-[#FF577F]'
                    : 'bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white shadow-lg shadow-[#FF577F]/30'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? 'fill-[#FF577F]' : ''}`} />
                {isFollowing ? 'Подписан' : 'Подписаться'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleShare}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#FF577F]/30 flex items-center justify-center transition-all">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              </motion.button>
              {profile.website && (
                <motion.a whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#FF577F]/30 flex items-center justify-center transition-all">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                </motion.a>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ───────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
        <StatCard icon={Headphones} label="Прослушиваний" value={formatStat(profile.totalPlays)} color="from-[#FF577F] to-[#FF3366]" />
        <StatCard icon={Users} label="Подписчиков" value={formatStat(profile.totalFollowers)} color="from-cyan-500 to-blue-600" />
        <StatCard icon={Disc3} label="Треков" value={String(profile.totalTracks)} color="from-purple-500 to-violet-600" />
        <StatCard icon={Mic2} label="Концертов" value={String(profile.totalConcerts)} color="from-amber-500 to-orange-600" />
        <StatCard icon={Award} label="Рейтинг" value={profile.rating.toFixed(1)} color="from-emerald-500 to-teal-600" />
      </motion.div>

      {/* ── Bio Section ──────────────────────────────────── */}
      {profile.bio && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
            <div className="w-1 h-5 sm:h-6 rounded-full bg-gradient-to-b from-[#FF577F] to-[#FF3366]" />
            Об артисте
          </h2>
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 sm:p-6">
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            {profile.languages?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.languages.map(lang => (
                  <span key={lang} className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 font-medium">{lang}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Two Column Layout: Tracks + Sidebar ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        {/* Tracks (3/5) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-3">
          <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-1 h-5 sm:h-6 rounded-full bg-gradient-to-b from-[#FF577F] to-[#FF3366]" />
            Популярные треки
            {tracksLoading && <Loader2 className="w-4 h-4 text-[#FF577F] animate-spin ml-1" />}
          </h2>

          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
            {tracksLoading && tracks.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#FF577F] animate-spin" />
              </div>
            ) : tracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Music2 className="w-10 h-10 text-white/10 mb-2" />
                <p className="text-xs text-slate-500">Треки пока не добавлены</p>
              </div>
            ) : (
              tracks.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  onClick={() => handlePlayTrack(track)}
                  className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-3.5 cursor-pointer transition-all group/track ${
                    playingTrackId === track.id ? 'bg-[#FF577F]/10' : 'hover:bg-white/[0.03]'
                  } ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}
                >
                  {/* Track number / play */}
                  <div className="w-7 sm:w-8 text-center flex-shrink-0">
                    <span className={`text-xs sm:text-sm font-bold group-hover/track:hidden ${playingTrackId === track.id ? 'text-[#FF577F]' : 'text-slate-600'}`}>
                      {playingTrackId === track.id ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <div className="w-0.5 h-3 bg-[#FF577F] rounded-full animate-pulse" />
                          <div className="w-0.5 h-4 bg-[#FF577F] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-0.5 h-2 bg-[#FF577F] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      ) : (i + 1)}
                    </span>
                    <div className="hidden group-hover/track:flex items-center justify-center">
                      {playingTrackId === track.id ? <Pause className="w-4 h-4 text-[#FF577F]" /> : <Play className="w-4 h-4 text-[#FF577F]" fill="#FF577F" />}
                    </div>
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm sm:text-base font-semibold truncate ${playingTrackId === track.id ? 'text-[#FF577F]' : 'text-white'}`}>{track.title}</p>
                      {track.isExplicit && (
                        <span className="flex-shrink-0 text-[8px] font-bold px-1 py-px rounded bg-white/10 text-slate-400 leading-none">E</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] sm:text-xs text-slate-500 truncate">{track.artist}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-px rounded-full bg-gradient-to-r ${getGenreColor(track.genre)} text-white/80 hidden sm:inline`}>{track.genre}</span>
                    </div>
                  </div>

                  {/* Likes */}
                  <div className="hidden md:flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                    <Heart className="w-3 h-3" />
                    <span className="font-mono">{formatStat(track.likes)}</span>
                  </div>

                  {/* Plays */}
                  <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-mono">{formatStat(track.plays)}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-mono flex-shrink-0">
                    <span>{track.duration}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Sidebar Info (2/5) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* Social Links */}
          {socials.length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
                <div className="w-1 h-5 sm:h-6 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600" />
                Соцсети
              </h2>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-3 sm:p-4 space-y-1.5">
                {socials.map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group/social">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover/social:bg-[#FF577F]/10 transition-colors">
                      <s.icon className="w-4 h-4 text-slate-400 group-hover/social:text-[#FF577F] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white">{s.label}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">{s.value}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover/social:text-[#FF577F] transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(profile.bookingEmail || profile.website) && (
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
                <div className="w-1 h-5 sm:h-6 rounded-full bg-gradient-to-b from-purple-500 to-violet-600" />
                Контакты
              </h2>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-3 sm:p-4 space-y-2">
                {profile.bookingEmail && (
                  <a href={`mailto:${profile.bookingEmail}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group/c">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover/c:bg-purple-500/10 transition-colors">
                      <Mail className="w-4 h-4 text-slate-400 group-hover/c:text-purple-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white">Букинг</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">{profile.bookingEmail}</p>
                    </div>
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group/c">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover/c:bg-purple-500/10 transition-colors">
                      <Globe className="w-4 h-4 text-slate-400 group-hover/c:text-purple-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white">Сайт</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">{profile.website}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Career Info */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
              Карьера
            </h2>
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-3 sm:p-4 space-y-3">
              {profile.careerStart && (
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-500">Начало карьеры</span>
                  <span className="text-xs sm:text-sm font-bold text-white">{profile.careerStart}</span>
                </div>
              )}
              {profile.label && (
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-500">Лейбл</span>
                  <span className="text-xs sm:text-sm font-bold text-white">{profile.label}</span>
                </div>
              )}
              {profile.manager && (
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-500">Менеджер</span>
                  <span className="text-xs sm:text-sm font-bold text-white">{profile.manager}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-500">Локация</span>
                  <span className="text-xs sm:text-sm font-bold text-white">{profile.location}</span>
                </div>
              )}
              {profile.genres.length > 0 && (
                <div>
                  <span className="text-xs sm:text-sm text-slate-500 block mb-2">Жанры</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.genres.map(g => (
                      <span key={g} className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r ${getGenreColor(g)} text-white/90`}>{g}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Similar Artists Section ───────────────────────── */}
      {(similar.length > 0 || similarLoading) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 sm:mt-12"
        >
          <h2 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-5 flex items-center gap-2">
            <div className="w-1 h-5 sm:h-6 rounded-full bg-gradient-to-b from-[#FF577F] to-purple-600" />
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF577F]" />
            Похожие артисты
            {similarLoading && <Loader2 className="w-4 h-4 text-[#FF577F] animate-spin ml-1" />}
          </h2>

          {similarLoading && similar.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/5 rounded w-24" />
                      <div className="h-2 bg-white/5 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {similar.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                >
                  <SimilarArtistCard artist={a} onClick={() => handleSimilarClick(a)} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Bottom spacer ────────────────────────────────── */}
      <div className="h-8 sm:h-12" />
    </motion.div>
  );
}