/**
 * RADIO BRAND SECTION - Управление радиобрендом заведения
 * Полноценная страница для управления внутренним радиовещанием
 * 
 * Функционал:
 * - Детальный плеер с визуализацией
 * - Управление громкостью
 * - Включение/выключение радио
 * - Режим тишины
 * - Расписание плейлистов
 * - Управление контентом (джинглы, анонсы)
 * - Аналитика проигрываний
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Radio, Play, Pause, SkipForward, Volume2, VolumeX, Volume1,
  Settings, Calendar, Clock, Music, Mic2, Megaphone, BarChart3,
  Power, PowerOff, TrendingUp, Users, Eye, Activity, Zap,
  Plus, Edit, Trash2, Check, X, ChevronRight, ChevronDown,
  Moon, Sun, RefreshCw, Download, Upload, AlertCircle, Info
} from 'lucide-react';

type Tab = 'player' | 'playlists' | 'content' | 'schedule' | 'analytics' | 'settings';

export function RadioBrandSection() {
  const [activeTab, setActiveTab] = useState<Tab>('player');
  
  // Radio state
  const [isRadioEnabled, setIsRadioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  // Current track (mock)
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Summer Vibes',
    artist: 'DJ Kool',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    duration: 261, // секунды
    currentTime: 134,
    type: 'track' as const
  });

  // Settings
  const [settings, setSettings] = useState({
    quietMode: {
      enabled: false,
      startTime: '00:00',
      endTime: '07:00',
      days: 'all' as 'all' | 'weekdays' | 'weekends'
    },
    autoInsert: {
      jingleFrequency: 15, // минут
      adFrequency: 10, // треков
      announcementFrequency: 20 // треков
    }
  });

  return (
    <div className="min-h-screen p-6 pb-32 space-y-6">{/* Added pb-32 for player space */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Радиобренд заведения
              </h1>
              <p className="text-sm text-slate-400">Sunset Lounge Bar</p>
            </div>
          </div>
        </div>

        {/* Radio On/Off Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRadioEnabled(!isRadioEnabled)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
              isRadioEnabled
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            {isRadioEnabled ? (
              <>
                <Power className="w-4 h-4" />
                <span className="hidden sm:inline">Радио включено</span>
              </>
            ) : (
              <>
                <PowerOff className="w-4 h-4" />
                <span className="hidden sm:inline">Радио выключено</span>
              </>
            )}
          </button>

          {isRadioEnabled && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs sm:text-sm text-green-300 font-medium">В ЭФИРЕ</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <TabButton label="Плеер" icon={Play} active={activeTab === 'player'} onClick={() => setActiveTab('player')} />
        <TabButton label="Плейлисты" icon={Music} active={activeTab === 'playlists'} onClick={() => setActiveTab('playlists')} />
        <TabButton label="Контент" icon={Mic2} active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
        <TabButton label="Расписание" icon={Calendar} active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
        <TabButton label="Аналитика" icon={BarChart3} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        <TabButton label="Настройки" icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      {/* Content */}
      {activeTab === 'player' && (
        <PlayerTab
          isRadioEnabled={isRadioEnabled}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          currentTrack={currentTrack}
        />
      )}
      {activeTab === 'playlists' && <PlaylistsTab />}
      {activeTab === 'content' && <ContentTab />}
      {activeTab === 'schedule' && <ScheduleTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'settings' && <SettingsTab settings={settings} setSettings={setSettings} />}
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
      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${
        active
          ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// =====================================================
// PLAYER TAB
// =====================================================

interface PlayerTabProps {
  isRadioEnabled: boolean;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  currentTrack: any;
}

function PlayerTab({
  isRadioEnabled,
  isPlaying,
  setIsPlaying,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  currentTrack
}: PlayerTabProps) {
  const progressPercentage = (currentTrack.currentTime / currentTrack.duration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  // Mock queue
  const queue = [
    { id: 1, title: 'Summer Vibes', artist: 'DJ Kool', type: 'track', isPlaying: true },
    { id: 2, title: 'Night Drive', artist: 'The Weeknd', type: 'track', isPlaying: false },
    { id: 3, title: 'Sunset Lounge - Джингл', artist: 'Фирменный', type: 'jingle', isPlaying: false },
    { id: 4, title: 'Pizza House - Реклама', artist: 'Спонсор', type: 'advertisement', isPlaying: false },
    { id: 5, title: 'Tropical House', artist: 'Kygo', type: 'track', isPlaying: false },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Player */}
      <div className="lg:col-span-2 space-y-6">
        {/* Current Track Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-white/10 overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          </div>

          <div className="relative z-10">
            {/* Cover & Info */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {/* Cover */}
              <div className="relative group">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="w-48 h-48 rounded-2xl object-cover shadow-2xl"
                />
                {isRadioEnabled && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white">
                      {isPlaying ? (
                        <div className="flex gap-1">
                          <div className="w-1 h-8 bg-white animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-8 bg-white animate-pulse" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-8 bg-white animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      ) : (
                        <Play className="w-12 h-12" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="mb-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                    {currentTrack.type === 'track' ? '🎵 Трек' : currentTrack.type === 'jingle' ? '✨ Джингл' : '📢 Реклама'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {currentTrack.title}
                </h2>
                <p className="text-lg text-slate-400 mb-4">{currentTrack.artist}</p>

                {/* Stats */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>3,200 слушателей</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>145K показов</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                <span>{formatTime(currentTrack.currentTime)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              {/* Volume */}
              <div className="flex items-center gap-3 flex-1 max-w-xs">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  disabled={!isRadioEnabled}
                >
                  <VolumeIcon className="w-5 h-5 text-white" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (parseFloat(e.target.value) > 0) setIsMuted(false);
                  }}
                  disabled={!isRadioEnabled}
                  className="flex-1"
                />
                <span className="text-sm text-slate-400 w-12 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Play Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={!isRadioEnabled}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <button
                  disabled={!isRadioEnabled}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoCard label="Онлайн" value="3.2K" icon={Activity} color="green" />
          <InfoCard label="Проиграно" value="1,250" icon={Music} color="blue" />
          <InfoCard label="Слушателей" value="145K" icon={Users} color="purple" />
          <InfoCard label="Вовлеченность" value="76%" icon={TrendingUp} color="amber" />
        </div>
      </div>

      {/* Queue */}
      <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-400" />
          Очередь
        </h3>

        <div className="space-y-2">
          {queue.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg transition-all ${
                item.isPlaying
                  ? 'bg-purple-500/20 border border-purple-500/30'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {item.isPlaying && (
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-purple-400 animate-pulse"></div>
                    <div className="w-0.5 h-3 bg-purple-400 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-0.5 h-3 bg-purple-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {item.type === 'track' ? '🎵' : item.type === 'jingle' ? '✨' : '📢'}
                </span>
              </div>
              <p className="text-white text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-slate-400 truncate">{item.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Info Card Component
interface InfoCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'green' | 'blue' | 'purple' | 'amber';
}

function InfoCard({ label, value, icon: Icon, color }: InfoCardProps) {
  const colorClasses = {
    green: 'from-green-500/10 to-green-600/5 border-green-500/30 text-green-400',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/30 text-purple-400',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/30 text-amber-400',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

// =====================================================
// PLAYLISTS TAB
// =====================================================

function PlaylistsTab() {
  const playlists = [
    { id: 1, name: 'Утренний вайб', tracks: 45, duration: 180, active: true, status: 'active' },
    { id: 2, name: 'Обеденное время', tracks: 38, duration: 152, active: false, status: 'active' },
    { id: 3, name: 'Вечерний кайф', tracks: 52, duration: 208, active: false, status: 'active' },
    { id: 4, name: 'Выходные', tracks: 60, duration: 240, active: false, status: 'draft' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">Управление плейлистами для радиовещания</p>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all">
          <Plus className="w-4 h-4" />
          Создать плейлист
        </button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1">{playlist.name}</h3>
                <p className="text-sm text-slate-400">{playlist.tracks} треков • {playlist.duration} мин</p>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                playlist.active
                  ? 'bg-green-500/20 text-green-300'
                  : playlist.status === 'active'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-slate-500/20 text-slate-400'
              }`}>
                {playlist.active ? '🔴 В эфире' : playlist.status === 'active' ? 'Активен' : 'Черновик'}
              </span>
              {!playlist.active && playlist.status === 'active' && (
                <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                  Активировать
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// CONTENT TAB
// =====================================================

function ContentTab() {
  const [contentType, setContentType] = useState<'jingles' | 'ads' | 'announcements'>('jingles');

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setContentType('jingles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            contentType === 'jingles'
              ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
              : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Mic2 className="w-4 h-4" />
          Джинглы
        </button>
        <button
          onClick={() => setContentType('ads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            contentType === 'ads'
              ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
              : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Реклама
        </button>
        <button
          onClick={() => setContentType('announcements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            contentType === 'announcements'
              ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
              : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Radio className="w-4 h-4" />
          Анонсы
        </button>
      </div>

      {/* Upload */}
      <div className="p-6 rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-all text-center cursor-pointer">
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-white font-medium mb-1">Загрузить {contentType === 'jingles' ? 'джингл' : contentType === 'ads' ? 'рекламу' : 'анонс'}</p>
        <p className="text-sm text-slate-400">MP3, WAV • Макс 10 МБ</p>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        <p className="text-sm text-slate-400">Загруженный контент (3)</p>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Music className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">Sunset Lounge - Фирменный джингл</p>
                  <p className="text-sm text-slate-400">15 сек • 320 кбит/с</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
                  Активен
                </span>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// SCHEDULE TAB  
// =====================================================

function ScheduleTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400">Автоматическое переключение плейлистов по расписанию</p>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all">
          <Plus className="w-4 h-4" />
          Добавить слот
        </button>
      </div>

      {/* Schedule Slots */}
      <div className="space-y-3">
        {[
          { name: 'Утренний плейлист', playlist: 'Утренний вайб', days: 'Пн-Пт', time: '07:00 - 12:00', active: true },
          { name: 'Обеденный эфир', playlist: 'Обеденное время', days: 'Пн-Пт', time: '12:00 - 15:00', active: true },
          { name: 'Вечерний кайф', playlist: 'Вечерний кайф', days: 'Пт-Сб', time: '18:00 - 23:00', active: true },
        ].map((slot, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-white font-bold mb-1">{slot.name}</h4>
                <p className="text-sm text-purple-400">{slot.playlist}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={slot.active} className="sr-only peer" readOnly />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {slot.days}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {slot.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// ANALYTICS TAB
// =====================================================

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard label="Проиграно треков" value="1,250" icon={Music} color="blue" />
        <InfoCard label="Слушателей" value="145K" icon={Users} color="purple" />
        <InfoCard label="Время в эфире" value="18ч" icon={Clock} color="green" />
        <InfoCard label="Вовлеченность" value="76%" icon={TrendingUp} color="amber" />
      </div>

      {/* Top Tracks */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Топ-10 треков</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-600">#{i}</span>
                <div>
                  <p className="text-white font-medium">Summer Vibes</p>
                  <p className="text-sm text-slate-400">DJ Kool</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">185</p>
                <p className="text-xs text-slate-400">проигрываний</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// SETTINGS TAB
// =====================================================

interface SettingsTabProps {
  settings: any;
  setSettings: (settings: any) => void;
}

function SettingsTab({ settings, setSettings }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Quiet Mode */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Moon className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Режим тишины</h3>
              <p className="text-sm text-slate-400">Автоматическая пауза в указанное время</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.quietMode.enabled}
              onChange={(e) => setSettings({
                ...settings,
                quietMode: { ...settings.quietMode, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        {settings.quietMode.enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Начало</label>
              <input
                type="time"
                value={settings.quietMode.startTime}
                onChange={(e) => setSettings({
                  ...settings,
                  quietMode: { ...settings.quietMode, startTime: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Окончание</label>
              <input
                type="time"
                value={settings.quietMode.endTime}
                onChange={(e) => setSettings({
                  ...settings,
                  quietMode: { ...settings.quietMode, endTime: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Auto-Insert Settings */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Автоматические вставки
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Джингл каждые (минут)</label>
            <input
              type="number"
              value={settings.autoInsert.jingleFrequency}
              onChange={(e) => setSettings({
                ...settings,
                autoInsert: { ...settings.autoInsert, jingleFrequency: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Реклама каждые (треков)</label>
            <input
              type="number"
              value={settings.autoInsert.adFrequency}
              onChange={(e) => setSettings({
                ...settings,
                autoInsert: { ...settings.autoInsert, adFrequency: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Анонс каждые (треков)</label>
            <input
              type="number"
              value={settings.autoInsert.announcementFrequency}
              onChange={(e) => setSettings({
                ...settings,
                autoInsert: { ...settings.autoInsert, announcementFrequency: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>
        </div>
      </div>

      {/* Stream Info */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Информация о потоке</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">URL потока:</span>
            <span className="text-white font-mono">stream.promo.fm/venue_12345</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Статус:</span>
            <span className="text-green-400 font-medium">🟢 Онлайн</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Последнее обновление:</span>
            <span className="text-white">3 секунды назад</span>
          </div>
        </div>
      </div>
    </div>
  );
}