/**
 * RADIO BRAND - Управление радиобрендом заведения
 * Максимально оптимизированный компонент с полным адаптивом
 * 
 * Структура:
 * - Плейлисты - управление плейлистами для эфира
 * - Эфир - live плеер и управление вещанием
 * - Контент - джинглы, реклама, анонсы (с системой заказа)
 * - Аналитика - статистика и отчеты
 * 
 * Последние обновления:
 * ✅ Максимальный адаптив для всех компонентов (мобильные, планшеты, десктопы)
 * ✅ Система заказа контента с отображением экономии от подписки (скидка 50%)
 * ✅ Прозрачное ценообразование: джингл 1500₽/2500₽, реклама 2000₽/3000₽, анонс 2500₽/3500₽
 * ✅ Красивое уведомление об успешной отправке заказа
 * ✅ Визуальные индикаторы для срочных заказов
 * ✅ Подробное логирование для тестирования
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { useVenuePlayer } from '../contexts/VenuePlayerContext';
import type { Playlist as VenuePlaylist } from '../types/venue-types';
import { RadioPlayerStatus } from './RadioPlayerStatus';
import { VenueSimplePlayer } from './VenueSimplePlayer';

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

function RadioBrand() {
  const [activeTab, setActiveTab] = useState<Tab>('broadcast');
  // TODO: Получить venueId из контекста или пропсов
  const venueId = 'temp-venue-id'; // Временно для демонстрации

  console.log('[RadioBrand] Component loaded successfully! ✅');

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 pb-32 space-y-4 sm:space-y-6">
      {/* Header */}
      <Header venueId={venueId} />

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

function Header({ venueId }: { venueId: string }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Радиобренд</h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-400">Управление контентом заведения</p>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Статус подключения плеера к платформе */}
        <RadioPlayerStatus venueId={venueId} />
      </div>
    </div>
  );
}

// =====================================================
// TABS NAVIGATION
// =====================================================

function TabsNavigation({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'playlists', label: 'Плейлисты', icon: Music },
    { id: 'broadcast', label: 'Эфир', icon: Radio },
    { id: 'content', label: 'Контент', icon: Megaphone },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm sm:text-base ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden xs:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// =====================================================
// PLAYLISTS TAB
// =====================================================

function PlaylistsTab() {
  const player = useVenuePlayer();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: 1, name: 'Вечерний джаз', tracks: 45, duration: 180, status: 'active', isActive: true, createdAt: '2024-01-15' },
    { id: 2, name: 'Утренний чил', tracks: 32, duration: 120, status: 'active', isActive: false, createdAt: '2024-01-10' },
    { id: 3, name: 'Пятничный драйв', tracks: 58, duration: 240, status: 'draft', isActive: false, createdAt: '2024-01-20' },
    { id: 4, name: 'Лаунж микс', tracks: 28, duration: 95, status: 'active', isActive: false, createdAt: '2024-01-18' },
    { id: 5, name: 'Воскресный блюз', tracks: 38, duration: 155, status: 'draft', isActive: false, createdAt: '2024-01-22' },
  ]);

  const handlePlayPlaylist = (playlist: Playlist) => {
    // TODO: Загрузить треки плейлиста и начать воспроизведение
    console.log('Playing playlist:', playlist.name);
  };

  const handleActivatePlaylist = (playlistId: number) => {
    setPlaylists(prev => prev.map(p => ({
      ...p,
      isActive: p.id === playlistId
    })));
  };

  const handleDeletePlaylist = (playlistId: number) => {
    if (confirm('Удалить плейлист?')) {
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    }
  };

  const getStatusBadge = (status: PlaylistStatus) => {
    switch (status) {
      case 'active':
        return <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">Активный</span>;
      case 'draft':
        return <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">Черновик</span>;
      case 'archived':
        return <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-300 border border-gray-500/30">Архив</span>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Мои плейлисты</h2>
          <p className="text-sm text-slate-400">{playlists.length} плейлистов • {playlists.reduce((acc, p) => acc + p.tracks, 0)} треков</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all text-sm shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Создать плейлист
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Всего треков</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{playlists.reduce((acc, p) => acc + p.tracks, 0)}</div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Время</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{Math.floor(playlists.reduce((acc, p) => acc + p.duration, 0) / 60)} ч</div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Активных</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{playlists.filter(p => p.status === 'active').length}</div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-slate-400">Черновики</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{playlists.filter(p => p.status === 'draft').length}</div>
        </div>
      </div>

      {/* Playlists grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {playlists.map((playlist) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all"
          >
            {/* Active indicator */}
            {playlist.isActive && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}

            {/* Cover placeholder */}
            <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-3 flex items-center justify-center relative overflow-hidden">
              <Music className="w-12 h-12 text-purple-400" />
              {playlist.isActive && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-1 h-8 bg-white animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-8 bg-white animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-8 bg-white animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mb-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-bold text-base truncate flex-1">{playlist.name}</h3>
                {getStatusBadge(playlist.status)}
              </div>
              <p className="text-sm text-slate-400 mb-1">{playlist.tracks} треков • {Math.floor(playlist.duration / 60)} ч {playlist.duration % 60} мин</p>
              <p className="text-xs text-slate-500">Создан: {new Date(playlist.createdAt).toLocaleDateString('ru-RU')}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePlayPlaylist(playlist)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                Играть
              </button>
              <button 
                onClick={() => handleActivatePlaylist(playlist.id)}
                className={`px-3 py-2 rounded-lg transition-all ${
                  playlist.isActive 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
                title={playlist.isActive ? 'Активен' : 'Активировать'}
              >
                <Radio className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSelectedPlaylist(playlist)}
                className="px-3 py-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
                title="Редактировать"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeletePlaylist(playlist.id)}
                className="px-3 py-2 rounded-lg bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {playlists.length === 0 && (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет плейлистов</h3>
          <p className="text-slate-400 mb-4">Создайте свой первый плейлист</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Создать плейлист
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================
// BROADCAST TAB
// =====================================================

function BroadcastTab() {
  // TODO: Получить venueId из контекста или пропсов
  const venueId = 'temp-venue-id';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Упрощённый плеер для заведения */}
      <VenueSimplePlayer venueId={venueId} />
    </div>
  );
}

// =====================================================
// CONTENT TAB
// =====================================================

function ContentTab() {
  const [contentType, setContentType] = useState<ContentType>('jingles');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  
  const [jingles, setJingles] = useState<ContentItem[]>([
    { id: 1, title: 'Фирменный джингл - Открытие', duration: 15, bitrate: 320, isActive: true, type: 'jingles' },
    { id: 2, title: 'Фирменный джингл - Закрытие', duration: 12, bitrate: 320, isActive: true, type: 'jingles' },
    { id: 3, title: 'Переход между треками', duration: 8, bitrate: 320, isActive: true, type: 'jingles' },
  ]);

  const [ads, setAds] = useState<ContentItem[]>([
    { id: 1, title: 'Pizza House - Акция недели', duration: 30, bitrate: 192, isActive: true, type: 'ads' },
    { id: 2, title: 'Local Coffee - Новое меню', duration: 25, bitrate: 192, isActive: true, type: 'ads' },
    { id: 3, title: 'Sport Club - Скидка 20%', duration: 20, bitrate: 192, isActive: false, type: 'ads' },
  ]);

  const [announcements, setAnnouncements] = useState<ContentItem[]>([
    { id: 1, title: 'Анонс: Live выступление в пятницу', duration: 45, bitrate: 192, isActive: true, type: 'announcements' },
    { id: 2, title: 'Новогодняя вечеринка', duration: 38, bitrate: 192, isActive: false, type: 'announcements' },
  ]);

  const getContentList = () => {
    switch (contentType) {
      case 'jingles': return jingles;
      case 'ads': return ads;
      case 'announcements': return announcements;
    }
  };

  const handleToggleActive = (id: number) => {
    const updateFn = (items: ContentItem[]) => 
      items.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item);
    
    switch (contentType) {
      case 'jingles': setJingles(updateFn); break;
      case 'ads': setAds(updateFn); break;
      case 'announcements': setAnnouncements(updateFn); break;
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Удалить контент?')) {
      const filterFn = (items: ContentItem[]) => items.filter(item => item.id !== id);
      
      switch (contentType) {
        case 'jingles': setJingles(filterFn); break;
        case 'ads': setAds(filterFn); break;
        case 'announcements': setAnnouncements(filterFn); break;
      }
    }
  };

  const handleUploadComplete = (newItem: ContentItem) => {
    switch (newItem.type) {
      case 'jingles':
        setJingles(prev => [...prev, newItem]);
        break;
      case 'ads':
        setAds(prev => [...prev, newItem]);
        break;
      case 'announcements':
        setAnnouncements(prev => [...prev, newItem]);
        break;
    }
    setShowUploadModal(false);
  };

  const contentList = getContentList();

  const contentTypeConfig = {
    jingles: {
      label: 'Джинглы',
      icon: Mic2,
      color: 'purple',
      description: 'Фирменные аудио-заставки и переходы'
    },
    ads: {
      label: 'Реклама',
      icon: Megaphone,
      color: 'orange',
      description: 'Рекламные блоки партнёров'
    },
    announcements: {
      label: 'Анонсы',
      icon: Sparkles,
      color: 'blue',
      description: 'Анонсы событий и мероприятий'
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Контент</h2>
          <p className="text-sm text-slate-400">Управление дополнительным аудио-контентом</p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
          <button 
            onClick={() => setShowOrderModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white font-medium hover:from-orange-600 hover:to-pink-700 transition-all text-sm shadow-lg whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden xs:inline">Заказать через Promo</span>
            <span className="xs:hidden">Заказать</span>
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all text-sm shadow-lg whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>Загрузить</span>
          </button>
        </div>
      </div>

      {/* Content Type Selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(contentTypeConfig) as ContentType[]).map((type) => {
          const config = contentTypeConfig[type];
          const Icon = config.icon;
          const isActive = contentType === type;
          
          return (
            <button
              key={type}
              onClick={() => setContentType(type)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{config.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                isActive ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {getContentList().length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-medium mb-1">{contentTypeConfig[contentType].label}</h3>
            <p className="text-sm text-slate-400">{contentTypeConfig[contentType].description}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <FileAudio className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Всего файлов</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{contentList.length}</div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Активных</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{contentList.filter(c => c.isActive).length}</div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Общее время</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">
            {Math.floor(contentList.reduce((acc, c) => acc + c.duration, 0) / 60)}:{String(contentList.reduce((acc, c) => acc + c.duration, 0) % 60).padStart(2, '0')}
          </div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400">Ср. качество</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">
            {Math.round(contentList.reduce((acc, c) => acc + c.bitrate, 0) / contentList.length)} kbps
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-2">
        {contentList.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                item.isActive 
                  ? 'bg-purple-500/20 border border-purple-500/30' 
                  : 'bg-white/5'
              }`}>
                <FileAudio className={`w-6 h-6 ${item.isActive ? 'text-purple-400' : 'text-slate-500'}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium truncate">{item.title}</h3>
                  {item.isActive && (
                    <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-300 border border-green-500/30 whitespace-nowrap">
                      Активен
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {item.bitrate} kbps
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => console.log('Play', item.id)}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all"
                  title="Прослушать"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleToggleActive(item.id)}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-all ${
                    item.isActive 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                  title={item.isActive ? 'Деактивировать' : 'Активировать'}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button 
                  className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
                  title="Редактировать"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {contentList.length === 0 && (
        <div className="text-center py-12">
          <FileAudio className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет контента</h3>
          <p className="text-slate-400 mb-4">Загрузите ваш первый {contentTypeConfig[contentType].label.toLowerCase()}</p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all"
          >
            <Upload className="w-5 h-5 inline mr-2" />
            Загрузить файл
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadContentModal
            onClose={() => setShowUploadModal(false)}
            onUploadComplete={handleUploadComplete}
            defaultContentType={contentType}
          />
        )}
      </AnimatePresence>

      {/* Order Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <OrderContentModal
            onClose={() => setShowOrderModal(false)}
            onOrderComplete={(orderId) => {
              console.log('🎉 [ContentTab] Заказ получен! ID:', orderId);
              setShowOrderModal(false);
              setLastOrderId(orderId);
              setShowSuccessNotification(true);
              // Автоматически скрываем уведомление через 5 секунд
              setTimeout(() => setShowSuccessNotification(false), 5000);
            }}
            defaultContentType={contentType}
          />
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccessNotification && lastOrderId && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] w-[calc(100%-2rem)] max-w-md"
          >
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/90 to-emerald-600/90 backdrop-blur-xl border border-green-400/50 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base mb-1">Заказ успешно отправлен!</h3>
                  <p className="text-white/90 text-sm mb-2">
                    Заказ #{lastOrderId} создан и отправлен в обработку.
                  </p>
                  <p className="text-white/70 text-xs">
                    Мы свяжемся с вами в течение 24 часов для уточнения деталей.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessNotification(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-all flex-shrink-0"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// ANALYTICS TAB
// =====================================================

function AnalyticsTab() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  
  // Mock data
  const stats = {
    totalListeners: 12458,
    avgListenTime: 18.5,
    totalPlays: 3247,
    uniqueTracks: 186,
    peakHour: '19:00 - 21:00',
    topGenre: 'Jazz',
    engagement: 87.3,
    retention: 72.8
  };

  const topTracks = [
    { id: 1, title: 'Summer Vibes', artist: 'DJ Kool', plays: 487, duration: '4:21', trend: '+12%' },
    { id: 2, title: 'Night Drive', artist: 'The Weeknd', plays: 423, duration: '4:05', trend: '+8%' },
    { id: 3, title: 'Tropical House', artist: 'Kygo', plays: 395, duration: '4:58', trend: '+15%' },
    { id: 4, title: 'Smooth Jazz', artist: 'Miles Davis', plays: 362, duration: '5:32', trend: '-3%' },
    { id: 5, title: 'City Lights', artist: 'Unknown', plays: 341, duration: '3:47', trend: '+5%' },
  ];

  const hourlyData = [
    { hour: '00:00', listeners: 45 },
    { hour: '03:00', listeners: 23 },
    { hour: '06:00', listeners: 89 },
    { hour: '09:00', listeners: 156 },
    { hour: '12:00', listeners: 234 },
    { hour: '15:00', listeners: 312 },
    { hour: '18:00', listeners: 487 },
    { hour: '21:00', listeners: 523 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Аналитика радиобренда</h2>
          <p className="text-sm text-slate-400">Статистика прослушиваний и вовлечённости</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
          {(['day', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range === 'day' && 'День'}
              {range === 'week' && 'Неделя'}
              {range === 'month' && 'Месяц'}
              {range === 'year' && 'Год'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-slate-400">Слушателей</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.totalListeners.toLocaleString()}</div>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12% за неделю
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-pink-400" />
            <span className="text-xs text-slate-400">Ср. время</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.avgListenTime} мин</div>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +8% за неделю
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-5 h-5 text-indigo-400" />
            <span className="text-xs text-slate-400">Воспроизведений</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.totalPlays.toLocaleString()}</div>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +15% за неделю
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-slate-400">Вовлечённость</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.engagement}%</div>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +5% за неделю
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Hourly Activity */}
        <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">А��тивность по часам</h3>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-3">
            {hourlyData.map((item, index) => {
              const maxListeners = Math.max(...hourlyData.map(d => d.listeners));
              const width = (item.listeners / maxListeners) * 100;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{item.hour}</span>
                    <span className="font-medium text-white">{item.listeners}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-3 sm:space-y-4">
          <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-400" />
                <span className="text-sm text-slate-400">Пиковое время</span>
              </div>
              <span className="text-lg font-bold text-white">{stats.peakHour}</span>
            </div>
            <p className="text-xs text-slate-500">Максимальное количество слушателей в этот период</p>
          </div>

          <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-slate-400">Популярный жанр</span>
              </div>
              <span className="text-lg font-bold text-white">{stats.topGenre}</span>
            </div>
            <p className="text-xs text-slate-500">Самый прослушиваемый музыкальный жанр</p>
          </div>

          <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-400">Удержание</span>
              </div>
              <span className="text-lg font-bold text-white">{stats.retention}%</span>
            </div>
            <p className="text-xs text-slate-500">Процент слушателей, возвращающихся к радио</p>
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Топ треков</h3>
          <TrendingUp className="w-5 h-5 text-purple-400" />
        </div>
        <div className="space-y-2">
          {topTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                index === 1 ? 'bg-gray-400/20 text-gray-300' :
                index === 2 ? 'bg-orange-500/20 text-orange-300' :
                'bg-white/5 text-slate-400'
              }`}>
                {index + 1}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{track.title}</h4>
                <p className="text-xs text-slate-400 truncate">{track.artist} • {track.duration}</p>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="text-white font-medium">{track.plays}</div>
                <div className={`text-xs ${
                  track.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {track.trend}
                </div>
              </div>

              {/* Play Button */}
              <button className="p-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all">
                <Play className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-center">
        <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
          <Download className="w-5 h-5" />
          <span>Экспортировать отчёт</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================
// UPLOAD CONTENT MODAL
// =====================================================

interface UploadContentModalProps {
  onClose: () => void;
  onUploadComplete: (item: ContentItem) => void;
  defaultContentType: ContentType;
}

function UploadContentModal({ onClose, onUploadComplete, defaultContentType }: UploadContentModalProps) {
  const [selectedType, setSelectedType] = useState<ContentType>(defaultContentType);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const contentTypeOptions = [
    { value: 'jingles' as ContentType, label: 'Джингл', icon: Mic2, color: 'purple' },
    { value: 'ads' as ContentType, label: 'Реклама', icon: Megaphone, color: 'orange' },
    { value: 'announcements' as ContentType, label: 'Анонс', icon: Sparkles, color: 'blue' },
  ];

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/')) {
      alert('Можно загружать только аудио файлы');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('Размер файла не должен превышать 50MB');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      alert('Заполните все обязательные поля');
      return;
    }

    setIsUploading(true);

    // Симуляция загрузки
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Создаем новый элемент контента
    const newItem: ContentItem = {
      id: Date.now(),
      title: title.trim(),
      duration: Math.floor(Math.random() * 60) + 10,
      bitrate: 192,
      isActive: true,
      type: selectedType,
    };

    onUploadComplete(newItem);
    setIsUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-white/10 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Загрузить контент</h2>
            <p className="text-sm text-slate-400">Добавьте джингл, рекламу или анонс</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">Тип контента</label>
          <div className="grid grid-cols-3 gap-3">
            {contentTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedType(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-purple-400' : ''}`} />
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Название <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название контента"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Аудио файл <span className="text-red-400">*</span>
          </label>
          
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/20 hover:border-white/30'
              }`}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">
                Перетащите файл сюда или нажмите для выбора
              </p>
              <p className="text-sm text-slate-400">
                Поддерживаются: MP3, WAV, OGG, AAC (макс. 50MB)
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <FileAudio className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{file.name}</h4>
                  <p className="text-sm text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300">
              <strong className="text-white">Рекомендации:</strong>
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                <li>• Формат: MP3 или WAV</li>
                <li>• Битрейт: 192-320 kbps для лучшего качества</li>
                <li>• Длительность джинглов: 5-15 секунд</li>
                <li>• Длительность рекламы: 15-30 секунд</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !title.trim() || isUploading}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Загрузить
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// =====================================================
// ORDER CONTENT MODAL
// =====================================================

interface OrderContentModalProps {
  onClose: () => void;
  onOrderComplete: (orderId: number) => void;
  defaultContentType: ContentType;
}

function OrderContentModal({ onClose, onOrderComplete, defaultContentType }: OrderContentModalProps) {
  const [selectedType, setSelectedType] = useState<ContentType>(defaultContentType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [musicStyle, setMusicStyle] = useState('');
  const [urgency, setUrgency] = useState<'standard' | 'urgent'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentTypeOptions = [
    { 
      value: 'jingles' as ContentType, 
      label: 'Джингл', 
      icon: Mic2, 
      color: 'purple',
      description: 'Короткий музыкальный идентификатор вашего бренда с возможной озвучкой',
      standardPrice: 1500,
      urgentPrice: 2500,
      fullPrice: 3000,
      urgentFullPrice: 5000,
      recommendedDuration: '5-15'
    },
    { 
      value: 'ads' as ContentType, 
      label: 'Реклама', 
      icon: Megaphone, 
      color: 'orange',
      description: 'Профессиональная озвучка рекламного текста с музыкальным сопровождением',
      standardPrice: 2000,
      urgentPrice: 3000,
      fullPrice: 4000,
      urgentFullPrice: 6000,
      recommendedDuration: '15-30'
    },
    { 
      value: 'announcements' as ContentType, 
      label: 'Анонс', 
      icon: Sparkles, 
      color: 'blue',
      description: 'Информационный ролик о событиях, акциях и специальных предложениях',
      standardPrice: 2500,
      urgentPrice: 3500,
      fullPrice: 5000,
      urgentFullPrice: 7000,
      recommendedDuration: '20-40'
    },
  ];

  const currentTypeConfig = contentTypeOptions.find(opt => opt.value === selectedType)!;

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);

    // Формируем данные заказа
    const orderData = {
      type: selectedType,
      typeLabel: currentTypeConfig.label,
      title: title.trim(),
      description: description.trim(),
      duration: parseInt(duration),
      musicStyle: musicStyle.trim(),
      urgency,
      price: estimatedPrice,
      estimatedTime,
      createdAt: new Date().toISOString(),
    };

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 [OrderContentModal] ОТПРАВКА ЗАКАЗА');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.table(orderData);
    console.log('⏳ Обработка заказа...');

    // Симуляция отправки заказа
    await new Promise(resolve => setTimeout(resolve, 1500));

    const orderId = Date.now();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [OrderContentModal] ЗАКАЗ УСПЕШНО ОТПРАВЛЕН!');
    console.log('🆔 Order ID:', orderId);
    console.log('💰 Итоговая стоимость:', estimatedPrice, '₽');
    console.log('⏱️ Срок выполнения:', estimatedTime);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    onOrderComplete(orderId);
    setIsSubmitting(false);
  };

  const estimatedPrice = urgency === 'urgent' ? currentTypeConfig.urgentPrice : currentTypeConfig.standardPrice;
  const estimatedTime = urgency === 'urgent' ? '24 часа' : '3-5 дней';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl bg-slate-900 border border-white/10 p-4 sm:p-6"
      >
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">Заказать контент через Promo.Music</h2>
            <p className="text-xs sm:text-sm text-slate-400">Профессиональное создание аудио-контента</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-all flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
          </button>
        </div>

        {/* Content Type Selector */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-white mb-2 sm:mb-3">Тип контента</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {contentTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedType(option.value)}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 ${isSelected ? 'text-purple-400' : ''}`} />
                  <div className="text-xs sm:text-sm font-medium">{option.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Type Description & Pricing */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <h4 className="text-sm sm:text-base text-white font-medium mb-1">{currentTypeConfig.label}</h4>
              <p className="text-xs sm:text-sm text-slate-400 mb-2">{currentTypeConfig.description}</p>
              <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
                  <span className="truncate">Длительность: {currentTypeConfig.recommendedDuration} сек</span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
              <div className="text-xs text-slate-400 mb-1">Стоимость</div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">{currentTypeConfig.standardPrice} ₽</div>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400 mb-1">
                <span>💎</span>
                <span className="whitespace-nowrap">Экономия {currentTypeConfig.fullPrice - currentTypeConfig.standardPrice}₽</span>
              </div>
              <div className="text-xs text-orange-400">Срочно: {currentTypeConfig.urgentPrice} ₽</div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Название <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Джингл для вечернего эфира"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border border-white/10 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        {/* Description */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Описание и требования <span className="text-red-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите подробно, что вы хотите получить: настроение, стиль, текст для озвучки, музыкальные предпочтения..."
            rows={4}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border border-white/10 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
          />
        </div>

        {/* Duration & Music Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Длительность (сек)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="5"
              max="60"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border border-white/10 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Стиль музыки</label>
            <input
              type="text"
              value={musicStyle}
              onChange={(e) => setMusicStyle(e.target.value)}
              placeholder="Джаз, рок, поп..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border border-white/10 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>



        {/* Urgency */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-white mb-2 sm:mb-3">Срочность</label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => setUrgency('standard')}
              className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                urgency === 'standard'
                  ? 'bg-blue-500/20 border-blue-500 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Clock className="w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1 sm:mb-2" />
              <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">Стандарт</div>
              <div className="text-[10px] sm:text-xs text-slate-400">3-5 дней</div>
            </button>
            <button
              onClick={() => setUrgency('urgent')}
              className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                urgency === 'urgent'
                  ? 'bg-orange-500/20 border-orange-500 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Zap className="w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1 sm:mb-2" />
              <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">Срочно</div>
              <div className="text-[10px] sm:text-xs text-slate-400">24 часа</div>
            </button>
          </div>
        </div>

        {/* Price Estimate */}
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all ${
          urgency === 'urgent' 
            ? 'bg-orange-500/10 border-orange-500/30' 
            : 'bg-green-500/10 border-green-500/30'
        }`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs sm:text-sm text-slate-400 mb-1">Итоговая стоимость</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {estimatedPrice} ₽
                </div>
                {urgency === 'urgent' && (
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 animate-pulse" />
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm text-slate-400 mb-1">Срок выполнения</div>
              <div className={`text-base sm:text-lg font-medium whitespace-nowrap ${
                urgency === 'urgent' ? 'text-orange-300' : 'text-white'
              }`}>
                {estimatedTime}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-2 sm:gap-3">
            <Info className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-300">
              <strong className="text-white">Как это работает:</strong>
              <ul className="mt-2 space-y-1 text-[10px] sm:text-xs text-slate-400">
                <li>1. Вы отправляете заказ с подробным описанием</li>
                <li>2. Мы свяжемся с вами для уточнения деталей</li>
                <li>3. Создадим контент согласно вашим требованиям</li>
                <li>4. Отправим вам на согласование</li>
                <li>5. После оплаты файлы будут доступны в вашем кабинете</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 border border-white/10 text-sm sm:text-base text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || isSubmitting}
            className="flex-1 px-4 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-sm sm:text-base text-white font-medium hover:from-orange-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                <span>Отправка...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>Отправить заказ</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default RadioBrand;