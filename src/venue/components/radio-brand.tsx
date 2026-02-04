/**
 * RADIO BRAND - Управление радиобрендом заведения
 * Максимально оптимизированный компонент с полным адаптивом
 * 
 * Структура:
 * - Плейлисты - управление плейлистами для эфира
 * - Эфир - live плеер и управление вещанием
 * - Контент - джинглы, реклама, анонсы
 * - Аналитика - статистика и отчеты
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music, Radio, Mic2, BarChart3, Play, Pause, Plus, 
  Settings, Power, PowerOff, Volume2, VolumeX, Volume1,
  SkipForward, Edit, Trash2, Upload, Calendar, Clock,
  Users, Eye, Activity, TrendingUp, Megaphone, Moon,
  Zap, Info, List as ListIcon, CheckCircle, AlertCircle,
  Download, Share2, Copy, X, Sparkles, DollarSign, 
  FileAudio, Send, Loader2, CheckCheck, XCircle
} from 'lucide-react';
import { JingleOrderModal, type JingleOrder } from './jingle-order-modal';

// =====================================================
// TYPES
// =====================================================

type Tab = 'playlists' | 'broadcast' | 'content' | 'analytics';
type ContentType = 'jingles' | 'ads' | 'announcements';
type PlaylistStatus = 'active' | 'draft' | 'archived';

interface Playlist {
  id: number;
  name: string;
  tracks: number;
  duration: number;
  status: PlaylistStatus;
  isActive: boolean;
  createdAt: string;
}

interface QueueItem {
  id: number;
  title: string;
  artist: string;
  type: 'track' | 'jingle' | 'advertisement';
  isPlaying: boolean;
  duration: number;
}

interface ContentItem {
  id: number;
  title: string;
  duration: number;
  bitrate: number;
  isActive: boolean;
  type: ContentType;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function RadioBrand() {
  const [activeTab, setActiveTab] = useState<Tab>('broadcast');

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 pb-32 space-y-4 sm:space-y-6">
      {/* Header */}
      <Header />

      {/* Tabs Navigation */}
      <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'playlists' && <PlaylistsTab />}
          {activeTab === 'broadcast' && <BroadcastTab />}
          {activeTab === 'content' && <ContentTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// HEADER COMPONENT
// =====================================================

function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 truncate">
          Радиобренд
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 truncate">
          Управление радиовещанием заведения
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all text-sm sm:text-base">
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Создать</span>
        </button>
        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all">
          <Settings className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>
      </div>
    </div>
  );
}

// =====================================================
// TABS NAVIGATION
// =====================================================

interface TabsNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

function TabsNavigation({ activeTab, onTabChange }: TabsNavigationProps) {
  const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
    { id: 'playlists', label: 'Плейлисты', icon: Music },
    { id: 'broadcast', label: 'Эфир', icon: Radio },
    { id: 'content', label: 'Контент', icon: Mic2 },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
  ];

  return (
    <div className="flex gap-1.5 sm:gap-2 border-b border-white/10 pb-2 sm:pb-4 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          {...tab}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
  );
}

// =====================================================
// TAB BUTTON
// =====================================================

interface TabButtonProps {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, icon: Icon, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
        active
          ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
      <span className="hidden xs:inline">{label}</span>
    </button>
  );
}

// =====================================================
// PLAYLISTS TAB
// =====================================================

function PlaylistsTab() {
  const playlists: Playlist[] = useMemo(() => [
    { id: 1, name: 'Утренний вайб', tracks: 45, duration: 180, status: 'active', isActive: false, createdAt: '2024-01-15' },
    { id: 2, name: 'Обеденный чилл', tracks: 32, duration: 128, status: 'active', isActive: false, createdAt: '2024-01-14' },
    { id: 3, name: 'Вечерний кайф', tracks: 58, duration: 232, status: 'active', isActive: true, createdAt: '2024-01-13' },
    { id: 4, name: 'Weekend Party', tracks: 40, duration: 160, status: 'draft', isActive: false, createdAt: '2024-01-12' },
    { id: 5, name: 'Lounge Music', tracks: 35, duration: 140, status: 'active', isActive: false, createdAt: '2024-01-11' },
  ], []);

  const stats = useMemo(() => ({
    total: playlists.length,
    active: playlists.filter(p => p.status === 'active').length,
    totalTracks: playlists.reduce((acc, p) => acc + p.tracks, 0),
    totalHours: Math.floor(playlists.reduce((acc, p) => acc + p.duration, 0) / 60),
  }), [playlists]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard label="Плейлистов" value={stats.total} icon={Music} color="purple" />
        <StatCard label="Активных" value={stats.active} icon={CheckCircle} color="green" />
        <StatCard label="Треков" value={stats.totalTracks} icon={ListIcon} color="blue" />
        <StatCard label="Часов" value={`${stats.totalHours}ч`} icon={Clock} color="amber" />
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}

        {/* Add New Playlist Card */}
        <AddPlaylistCard />
      </div>
    </div>
  );
}

// =====================================================
// PLAYLIST CARD
// =====================================================

interface PlaylistCardProps {
  playlist: Playlist;
}

function PlaylistCard({ playlist }: PlaylistCardProps) {
  const handleEdit = useCallback(() => {
    console.log('Edit playlist:', playlist.id);
  }, [playlist.id]);

  const handleDelete = useCallback(() => {
    console.log('Delete playlist:', playlist.id);
  }, [playlist.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group p-3 sm:p-4 md:p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
    >
      {/* Cover */}
      <div className="relative mb-3 sm:mb-4 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/20 aspect-square flex items-center justify-center overflow-hidden">
        <Music className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-white/40" />
        
        {/* Playing Badge */}
        {playlist.isActive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            <span className="text-[10px] sm:text-xs text-white font-semibold">В ЭФИРЕ</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="mb-2 sm:mb-3 min-w-0">
        <h3 className="text-sm sm:text-base text-white font-bold mb-1 truncate">{playlist.name}</h3>
        <p className="text-xs sm:text-sm text-slate-400 truncate">
          {playlist.tracks} треков • {playlist.duration} мин
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold truncate ${
          playlist.status === 'active'
            ? 'bg-green-500/20 text-green-300'
            : 'bg-slate-500/20 text-slate-400'
        }`}>
          {playlist.status === 'active' ? 'Активен' : 'Черновик'}
        </span>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button 
            onClick={handleEdit}
            className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <Edit className="w-3 sm:w-4 h-3 sm:h-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// ADD PLAYLIST CARD
// =====================================================

function AddPlaylistCard() {
  return (
    <div className="p-3 sm:p-4 md:p-5 rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center aspect-square min-h-[200px] sm:min-h-[250px]">
      <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3 sm:mb-4">
        <Plus className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-indigo-400" />
      </div>
      <h3 className="text-sm sm:text-base text-white font-bold mb-1">Создать плейлист</h3>
      <p className="text-xs sm:text-sm text-slate-400">Добавить новый</p>
    </div>
  );
}

// =====================================================
// BROADCAST TAB
// =====================================================

function BroadcastTab() {
  const [isRadioEnabled, setIsRadioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [quietMode, setQuietMode] = useState({
    enabled: false,
    startTime: '00:00',
    endTime: '07:00'
  });

  const currentTrack = useMemo(() => ({
    title: 'Summer Vibes',
    artist: 'DJ Kool',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    duration: 261,
    currentTime: 134
  }), []);

  const queue: QueueItem[] = useMemo(() => [
    { id: 1, title: 'Summer Vibes', artist: 'DJ Kool', type: 'track', isPlaying: true, duration: 261 },
    { id: 2, title: 'Night Drive', artist: 'The Weeknd', type: 'track', isPlaying: false, duration: 245 },
    { id: 3, title: 'Sunset Lounge - Джингл', artist: 'Фирменный', type: 'jingle', isPlaying: false, duration: 15 },
    { id: 4, title: 'Pizza House - Реклама', artist: 'Спонсор', type: 'advertisement', isPlaying: false, duration: 30 },
    { id: 5, title: 'Tropical House', artist: 'Kygo', type: 'track', isPlaying: false, duration: 298 },
  ], []);

  const progressPercentage = useMemo(
    () => (currentTrack.currentTime / currentTrack.duration) * 100,
    [currentTrack]
  );

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getVolumeIcon = useCallback(() => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  }, [isMuted, volume]);

  const VolumeIcon = getVolumeIcon();

  const handleToggleRadio = useCallback(() => {
    setIsRadioEnabled(prev => !prev);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Radio Control Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base text-white font-bold truncate">Радиовещание</h3>
            <p className="text-xs sm:text-sm text-slate-400 truncate">Автоматический эфир</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleToggleRadio}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              isRadioEnabled
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-white/5 border border-white/10 text-slate-400'
            }`}
          >
            {isRadioEnabled ? (
              <>
                <Power className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="hidden xs:inline">Включено</span>
              </>
            ) : (
              <>
                <PowerOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="hidden xs:inline">Выключено</span>
              </>
            )}
          </button>

          {isRadioEnabled && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-[10px] sm:text-xs md:text-sm text-green-300 font-medium whitespace-nowrap">В ЭФИРЕ</span>
            </div>
          )}
        </div>
      </div>

      {/* Player & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Player */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-4 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-white/10"
          >
            {/* Cover & Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Cover */}
              <div className="relative flex-shrink-0">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-xl sm:rounded-2xl object-cover shadow-2xl"
                />
                {isRadioEnabled && isPlaying && (
                  <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex gap-0.5 sm:gap-1 bg-black/50 px-1.5 sm:px-2 py-1 rounded-lg backdrop-blur-sm">
                    <div className="w-0.5 sm:w-1 h-3 sm:h-4 bg-white animate-pulse"></div>
                    <div className="w-0.5 sm:w-1 h-3 sm:h-4 bg-white animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-0.5 sm:w-1 h-3 sm:h-4 bg-white animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left min-w-0 w-full sm:w-auto">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-base sm:text-lg text-slate-400 mb-3 sm:mb-4 truncate">{currentTrack.artist}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Users className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>3.2K</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>145K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 mb-2">
                <span>{formatTime(currentTrack.currentTime)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
              <div className="h-1.5 sm:h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Volume */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:flex-1 sm:max-w-xs">
                <button
                  onClick={handleToggleMute}
                  className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex-shrink-0"
                  disabled={!isRadioEnabled}
                >
                  <VolumeIcon className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  disabled={!isRadioEnabled}
                  className="flex-1 h-1.5 sm:h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-400 w-8 sm:w-12 text-right flex-shrink-0">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Play Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlay}
                  disabled={!isRadioEnabled}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {isPlaying ? (
                    <Pause className="w-5 sm:w-6 h-5 sm:h-6" />
                  ) : (
                    <Play className="w-5 sm:w-6 h-5 sm:h-6 ml-0.5" />
                  )}
                </button>
                <button
                  disabled={!isRadioEnabled}
                  className="p-2.5 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-50"
                >
                  <SkipForward className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <StatCard label="Онлайн" value="3.2K" icon={Activity} color="green" />
            <StatCard label="Треков" value="1.2K" icon={Music} color="blue" />
            <StatCard label="Слушателей" value="145K" icon={Users} color="purple" />
            <StatCard label="Эфир" value="18ч" icon={Clock} color="amber" />
          </div>
        </div>

        {/* Queue */}
        <div className="p-3 sm:p-4 md:p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Music className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
            <span>Очередь</span>
          </h3>

          <div className="space-y-2">
            {queue.map((item) => (
              <QueueItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Quiet Mode */}
        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Moon className="w-5 sm:w-6 h-5 sm:h-6 text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">Режим тишины</h3>
                <p className="text-xs sm:text-sm text-slate-400 truncate">Автопауза ночью</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={quietMode.enabled}
                onChange={(e) => setQuietMode({ ...quietMode, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 sm:w-11 h-5 sm:h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {quietMode.enabled && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm text-slate-400 mb-2">Начало</label>
                <input
                  type="time"
                  value={quietMode.startTime}
                  onChange={(e) => setQuietMode({ ...quietMode, startTime: e.target.value })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-slate-400 mb-2">Конец</label>
                <input
                  type="time"
                  value={quietMode.endTime}
                  onChange={(e) => setQuietMode({ ...quietMode, endTime: e.target.value })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stream Info */}
        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">Поток вещания</h3>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">URL:</span>
              <span className="text-white font-mono text-[10px] sm:text-xs truncate">stream.promo.fm/12345</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Статус:</span>
              <span className="text-green-400 font-medium">🟢 Онлайн</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Обновлено:</span>
              <span className="text-white">3 сек назад</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// QUEUE ITEM CARD
// =====================================================

interface QueueItemCardProps {
  item: QueueItem;
}

function QueueItemCard({ item }: QueueItemCardProps) {
  const getTypeIcon = useCallback((type: QueueItem['type']) => {
    switch (type) {
      case 'track': return '🎵';
      case 'jingle': return '✨';
      case 'advertisement': return '📢';
    }
  }, []);

  return (
    <div
      className={`p-2 sm:p-3 rounded-lg transition-all ${
        item.isPlaying
          ? 'bg-purple-500/20 border border-purple-500/30'
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
        {item.isPlaying && (
          <div className="flex gap-0.5">
            <div className="w-0.5 h-2.5 sm:h-3 bg-purple-400 animate-pulse"></div>
            <div className="w-0.5 h-2.5 sm:h-3 bg-purple-400 animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-0.5 h-2.5 sm:h-3 bg-purple-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
          {getTypeIcon(item.type)}
        </span>
      </div>
      <p className="text-white text-xs sm:text-sm font-medium truncate">{item.title}</p>
      <p className="text-[10px] sm:text-xs text-slate-400 truncate">{item.artist}</p>
    </div>
  );
}

// =====================================================
// CONTENT TAB
// =====================================================

function ContentTab() {
  const [contentType, setContentType] = useState<ContentType>('jingles');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<ContentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const contentItems: ContentItem[] = useMemo(() => [
    { id: 1, title: 'Sunset Lounge - Фирменный джингл', duration: 15, bitrate: 320, isActive: true, type: 'jingles' },
    { id: 2, title: 'Промо акции - Анонс', duration: 20, bitrate: 320, isActive: true, type: 'jingles' },
    { id: 3, title: 'Приветствие гостей', duration: 12, bitrate: 256, isActive: false, type: 'jingles' },
    ...uploadedFiles,
  ], [uploadedFiles]);

  const filteredContent = useMemo(
    () => contentItems.filter(item => item.type === contentType),
    [contentItems, contentType]
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
      alert('Пожалуйста, загрузите файл формата MP3 или WAV');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер: 10 МБ');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload (в реальном приложении здесь будет загрузка в Supabase Storage)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create new content item
      const newItem: ContentItem = {
        id: Date.now(),
        title: file.name.replace(/\.(mp3|wav)$/i, ''),
        duration: Math.floor(Math.random() * 30) + 10, // Random duration
        bitrate: 320,
        isActive: false,
        type: contentType,
      };

      setUploadedFiles(prev => [...prev, newItem]);
      
      console.log('✅ File uploaded:', newItem);
      alert(`Файл "${file.name}" успешно загружен!`);
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Type Selector */}
      <div className="flex flex-wrap gap-2">
        <ContentTypeButton
          type="jingles"
          icon={Mic2}
          label="Джинглы"
          active={contentType === 'jingles'}
          onClick={() => setContentType('jingles')}
        />
        <ContentTypeButton
          type="ads"
          icon={Megaphone}
          label="Реклама"
          active={contentType === 'ads'}
          onClick={() => setContentType('ads')}
        />
        <ContentTypeButton
          type="announcements"
          icon={Radio}
          label="Анонсы"
          active={contentType === 'announcements'}
          onClick={() => setContentType('announcements')}
        />
      </div>

      {/* Order/Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Button (for all content types) */}
        <button
          onClick={() => setShowOrderModal(true)}
          className="p-6 sm:p-8 rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:from-amber-500/20 hover:to-orange-500/10 transition-all text-center group"
        >
          <Sparkles className="w-10 sm:w-12 h-10 sm:h-12 text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-sm sm:text-base text-white font-bold mb-1">
            Заказать {contentType === 'jingles' ? 'джингл' : contentType === 'ads' ? 'рекламу' : 'анонс'}
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mb-2">
            Мы создадим за 10 минут
          </p>
          <p className="text-xs text-amber-400 font-semibold">
            От 2000₽ до 10000₽
          </p>
        </button>

        {/* Upload Section */}
        <label 
          className={`p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer block ${
            isUploading 
              ? 'border-blue-500/50 bg-blue-500/10' 
              : 'border-white/20 hover:border-purple-500/50'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-10 sm:w-12 h-10 sm:h-12 text-blue-400 mx-auto mb-3 sm:mb-4 animate-spin" />
              <p className="text-sm sm:text-base text-white font-medium mb-1">
                Загрузка...
              </p>
              <p className="text-xs sm:text-sm text-slate-400">Пожалуйста, подождите</p>
            </>
          ) : (
            <>
              <Upload className="w-10 sm:w-12 h-10 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-white font-medium mb-1">
                Загрузить {contentType === 'jingles' ? 'джингл' : contentType === 'ads' ? 'рекламу' : 'анонс'}
              </p>
              <p className="text-xs sm:text-sm text-slate-400">MP3, WAV • Макс 10 МБ</p>
            </>
          )}
          <input
            type="file"
            accept="audio/mpeg, audio/wav, audio/mp3"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        <p className="text-xs sm:text-sm text-slate-400">
          Загруженный контент ({filteredContent.length})
        </p>
        
        {filteredContent.map((item) => (
          <ContentItemCard key={item.id} item={item} />
        ))}

        {filteredContent.length === 0 && (
          <div className="p-8 sm:p-12 text-center rounded-xl bg-white/5 border border-white/10">
            <AlertCircle className="w-10 sm:w-12 h-10 sm:h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-slate-400">Контент не загружен</p>
          </div>
        )}
      </div>

      {/* Order Modal */}
      <JingleOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        contentType={contentType}
        onSubmit={(order: JingleOrder) => {
          console.log('Order submitted:', order);
          setShowOrderModal(false);
        }}
      />
    </div>
  );
}

// =====================================================
// CONTENT TYPE BUTTON
// =====================================================

interface ContentTypeButtonProps {
  type: ContentType;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

function ContentTypeButton({ icon: Icon, label, active, onClick }: ContentTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-xs sm:text-sm ${
        active
          ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
      }`}
    >
      <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
      <span>{label}</span>
    </button>
  );
}

// =====================================================
// CONTENT ITEM CARD
// =====================================================

interface ContentItemCardProps {
  item: ContentItem;
}

function ContentItemCard({ item }: ContentItemCardProps) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Music className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base text-white font-medium truncate">{item.title}</p>
            <p className="text-xs sm:text-sm text-slate-400">
              {item.duration} сек • {item.bitrate} кбит/с
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs whitespace-nowrap ${
            item.isActive ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-400'
          }`}>
            {item.isActive ? 'Активен' : 'Неактивен'}
          </span>
          <button className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// ANALYTICS TAB
// =====================================================

function AnalyticsTab() {
  const topTracks = useMemo(() => [
    { id: 1, title: 'Summer Vibes', artist: 'DJ Kool', plays: 185 },
    { id: 2, title: 'Night Drive', artist: 'The Weeknd', plays: 142 },
    { id: 3, title: 'Tropical House', artist: 'Kygo', plays: 128 },
    { id: 4, title: 'Sunset Boulevard', artist: 'Chill Masters', plays: 115 },
    { id: 5, title: 'Ocean Dreams', artist: 'Lounge Cafe', plays: 98 },
  ], []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Проиграно" value="1.2K" icon={Music} color="blue" />
        <StatCard label="Слушателей" value="145K" icon={Users} color="purple" />
        <StatCard label="Время" value="18ч" icon={Clock} color="green" />
        <StatCard label="Вовлеченность" value="76%" icon={TrendingUp} color="amber" />
      </div>

      {/* Top Tracks */}
      <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-base sm:text-lg font-bold text-white mb-4">Топ-10 треков</h3>
        <div className="space-y-2 sm:space-y-3">
          {topTracks.map((track, index) => (
            <div 
              key={track.id} 
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <span className="text-lg sm:text-2xl font-bold text-slate-600 w-6 sm:w-8 flex-shrink-0">
                  #{index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base text-white font-medium truncate">{track.title}</p>
                  <p className="text-xs sm:text-sm text-slate-400 truncate">{track.artist}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm sm:text-base text-white font-bold">{track.plays}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">проигрываний</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// STAT CARD COMPONENT
// =====================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'green' | 'blue' | 'purple' | 'amber';
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    green: 'from-green-500/10 to-green-600/5 border-green-500/30 text-green-400',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/30 text-purple-400',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/30 text-amber-400',
  };

  return (
    <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <Icon className="w-4 sm:w-5 h-4 sm:h-5 mb-2" />
      <p className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{value}</p>
      <p className="text-[10px] sm:text-xs opacity-80 truncate">{label}</p>
    </div>
  );
}