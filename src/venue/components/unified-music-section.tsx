/**
 * UNIFIED MUSIC SECTION - Объединенный раздел управления музыкой
 * Включает: плейлисты, радиобренд, контент, настройки
 * 
 * Структура:
 * - Плейлисты - управление плейлистами заведения
 * - Радио - настройка радиовещания
 * - Контент - джинглы, реклама, анонсы
 * - Аналитика - статистика проигрываний
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Music, Radio, Mic2, BarChart3, Play, Pause, Plus,
  Settings, Power, PowerOff, Volume2, VolumeX, Volume1,
  SkipForward, Edit, Trash2, Upload, Calendar, Clock,
  Users, Eye, Activity, TrendingUp, Megaphone, Moon,
  Zap, Info, List as ListIcon
} from 'lucide-react';
import type { Playlist } from '../types/venue-types';

type Tab = 'playlists' | 'radio' | 'content' | 'analytics';

export function UnifiedMusicSection() {
  const [activeTab, setActiveTab] = useState<Tab>('playlists');

  return (
    <div className="min-h-screen p-6 pb-32 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Музыка и Радио
          </h1>
          <p className="text-slate-400">
            Управление плейлистами, радиовещанием и контентом
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Создать плейлист</span>
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <TabButton
          label="Плейлисты"
          icon={Music}
          active={activeTab === 'playlists'}
          onClick={() => setActiveTab('playlists')}
        />
        <TabButton
          label="Радиобренд"
          icon={Radio}
          active={activeTab === 'radio'}
          onClick={() => setActiveTab('radio')}
        />
        <TabButton
          label="Контент"
          icon={Mic2}
          active={activeTab === 'content'}
          onClick={() => setActiveTab('content')}
        />
        <TabButton
          label="Аналитика"
          icon={BarChart3}
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'playlists' && <PlaylistsTab />}
      {activeTab === 'radio' && <RadioBrandTab />}
      {activeTab === 'content' && <ContentTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
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
      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${active
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
// PLAYLISTS TAB
// =====================================================

function PlaylistsTab() {
  // Mock data
  const playlists = [
    { id: 1, name: 'Вечерний джаз', tracks: 45, duration: 180, status: 'active', isActive: false },
    { id: 2, name: 'Утренний чилл', tracks: 32, duration: 128, status: 'active', isActive: false },
    { id: 3, name: 'Weekend Vibes', tracks: 58, duration: 232, status: 'draft', isActive: false },
    { id: 4, name: 'Lunch Time', tracks: 40, duration: 160, status: 'active', isActive: false },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Всего плейлистов" value="4" icon={Music} color="purple" />
        <StatCard label="Активных" value="3" icon={Play} color="green" />
        <StatCard label="Всего треков" value="175" icon={ListIcon} color="blue" />
        <StatCard label="Часов музыки" value="29ч" icon={Clock} color="amber" />
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            {/* Cover */}
            <div className="relative mb-4 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/20 aspect-square flex items-center justify-center overflow-hidden">
              <Music className="w-12 h-12 text-white/40" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="mb-3">
              <h3 className="text-white font-bold mb-1 truncate">{playlist.name}</h3>
              <p className="text-sm text-slate-400">
                {playlist.tracks} треков • {playlist.duration} мин
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${playlist.status === 'active'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-slate-500/20 text-slate-400'
                }`}>
                {playlist.status === 'active' ? 'Активен' : 'Черновик'}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add New Playlist Card */}
        <div className="p-5 rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[250px]">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-white font-bold mb-1">Создать плейлист</h3>
          <p className="text-sm text-slate-400">Добавить новый плейлист</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// RADIO BRAND TAB
// =====================================================

function RadioBrandTab() {
  const [isRadioEnabled, setIsRadioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [quietMode, setQuietMode] = useState({
    enabled: false,
    startTime: '00:00',
    endTime: '07:00'
  });

  const currentTrack = {
    title: 'Summer Vibes',
    artist: 'DJ Kool',
    cover: '/banners/radio.png',
    duration: 261,
    currentTime: 134
  };

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
  ];

  return (
    <div className="space-y-6">
      {/* Radio Control Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">Радиовещание</h3>
            <p className="text-sm text-slate-400">Автоматическое формирование эфира</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRadioEnabled(!isRadioEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isRadioEnabled
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-white/5 border border-white/10 text-slate-400'
              }`}
          >
            {isRadioEnabled ? (
              <>
                <Power className="w-4 h-4" />
                <span className="hidden sm:inline">Включено</span>
              </>
            ) : (
              <>
                <PowerOff className="w-4 h-4" />
                <span className="hidden sm:inline">Выключено</span>
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

      {/* Player & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Player */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-white/10"
          >
            {/* Cover & Info */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {/* Cover */}
              <div className="relative">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="w-48 h-48 rounded-2xl object-cover shadow-2xl"
                />
                {isRadioEnabled && isPlaying && (
                  <div className="absolute bottom-3 right-3 flex gap-1 bg-black/50 px-2 py-1 rounded-lg">
                    <div className="w-1 h-4 bg-white animate-pulse"></div>
                    <div className="w-1 h-4 bg-white animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-4 bg-white animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {currentTrack.title}
                </h2>
                <p className="text-lg text-slate-400 mb-4">{currentTrack.artist}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>3.2K слушателей</span>
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
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
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
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <button
                  disabled={!isRadioEnabled}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-50"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            <StatCard label="Онлайн" value="3.2K" icon={Activity} color="green" />
            <StatCard label="Проиграно" value="1.2K" icon={Music} color="blue" />
            <StatCard label="Слушателей" value="145K" icon={Users} color="purple" />
            <StatCard label="Эфир" value="18ч" icon={Clock} color="amber" />
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
                className={`p-3 rounded-lg transition-all ${item.isPlaying
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

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quiet Mode */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Moon className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Режим тишины</h3>
                <p className="text-sm text-slate-400">Автопауза ночью</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quietMode.enabled}
                onChange={(e) => setQuietMode({ ...quietMode, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {quietMode.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Начало</label>
                <input
                  type="time"
                  value={quietMode.startTime}
                  onChange={(e) => setQuietMode({ ...quietMode, startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Конец</label>
                <input
                  type="time"
                  value={quietMode.endTime}
                  onChange={(e) => setQuietMode({ ...quietMode, endTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stream Info */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Поток вещания</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">URL:</span>
              <span className="text-white font-mono text-xs">stream.promo.fm/venue_12345</span>
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${contentType === 'jingles'
              ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
              : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
            }`}
        >
          <Mic2 className="w-4 h-4" />
          Джинглы
        </button>
        <button
          onClick={() => setContentType('ads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${contentType === 'ads'
              ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
              : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
            }`}
        >
          <Megaphone className="w-4 h-4" />
          Реклама
        </button>
        <button
          onClick={() => setContentType('announcements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${contentType === 'announcements'
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
        <p className="text-white font-medium mb-1">
          Загрузить {contentType === 'jingles' ? 'джингл' : contentType === 'ads' ? 'рекламу' : 'анонс'}
        </p>
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
// ANALYTICS TAB
// =====================================================

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Проиграно" value="1,250" icon={Music} color="blue" />
        <StatCard label="Слушателей" value="145K" icon={Users} color="purple" />
        <StatCard label="Время" value="18ч" icon={Clock} color="green" />
        <StatCard label="Вовлеченность" value="76%" icon={TrendingUp} color="amber" />
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
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}
