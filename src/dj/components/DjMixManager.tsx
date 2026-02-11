/**
 * DJ MIX MANAGER - Управление миксами диджея
 * Загрузка, редактирование, статистика, монетизация миксов
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Headphones, Upload, Play, Pause, Heart, Download, Eye,
  MessageSquare, Edit3, Trash2, Plus, Music, Clock, Tag,
  TrendingUp, DollarSign, Globe, Filter, Search, MoreVertical,
  ExternalLink, Share2
} from 'lucide-react';

interface Mix {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  duration: string;
  genres: string[];
  bpmRange: string;
  plays: number;
  likes: number;
  downloads: number;
  comments: number;
  isDownloadable: boolean;
  isPremium: boolean;
  price: number;
  isFeatured: boolean;
  status: 'published' | 'draft' | 'processing';
  recordedLive: boolean;
  recordedAt: string;
  date: string;
  platform: string;
}

export function DjMixManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'published' | 'draft' | 'premium'>('all');
  const [playingMixId, setPlayingMixId] = useState<string | null>(null);

  const mixes: Mix[] = [
    {
      id: '1',
      title: 'Deep House Session Vol. 12',
      description: 'Двухчасовой микс с лучшими deep house треками зимы 2026. Записан в Pravda Club.',
      coverUrl: 'https://images.unsplash.com/photo-1670529275215-d952f9633a4d?w=300',
      duration: '1:24:30',
      genres: ['Deep House', 'Progressive'],
      bpmRange: '120-126',
      plays: 2340,
      likes: 187,
      downloads: 45,
      comments: 12,
      isDownloadable: true,
      isPremium: false,
      price: 0,
      isFeatured: true,
      status: 'published',
      recordedLive: true,
      recordedAt: 'Pravda Club, Москва',
      date: '5 фев 2026',
      platform: 'PROMO.FM'
    },
    {
      id: '2',
      title: 'Techno Underground Mix',
      description: 'Тёмный техно-микс для ценителей. Featuring треки от Amelie Lens, Charlotte de Witte.',
      coverUrl: 'https://images.unsplash.com/photo-1761858736318-f1fe86aec4db?w=300',
      duration: '2:01:15',
      genres: ['Techno', 'Minimal'],
      bpmRange: '128-135',
      plays: 1890,
      likes: 156,
      downloads: 38,
      comments: 8,
      isDownloadable: true,
      isPremium: true,
      price: 299,
      isFeatured: false,
      status: 'published',
      recordedLive: false,
      recordedAt: '',
      date: '1 фев 2026',
      platform: 'SoundCloud'
    },
    {
      id: '3',
      title: 'Melodic Journey #8',
      description: 'Мелодичный техно-микс с упором на атмосферу и эмоции. Идеально для вечернего прослушивания.',
      coverUrl: 'https://images.unsplash.com/photo-1670529275215-d952f9633a4d?w=300',
      duration: '1:45:00',
      genres: ['Melodic Techno', 'Progressive'],
      bpmRange: '122-128',
      plays: 3120,
      likes: 245,
      downloads: 67,
      comments: 19,
      isDownloadable: true,
      isPremium: false,
      price: 0,
      isFeatured: true,
      status: 'published',
      recordedLive: true,
      recordedAt: 'A2 Green Concert, СПб',
      date: '28 янв 2026',
      platform: 'Mixcloud'
    },
    {
      id: '4',
      title: 'Funky Disco Grooves',
      description: 'Work in progress - готовлю новый фанки-микс для летнего сезона.',
      coverUrl: 'https://images.unsplash.com/photo-1761858736318-f1fe86aec4db?w=300',
      duration: '0:45:00',
      genres: ['Nu Disco', 'Funk', 'House'],
      bpmRange: '118-124',
      plays: 0,
      likes: 0,
      downloads: 0,
      comments: 0,
      isDownloadable: false,
      isPremium: false,
      price: 0,
      isFeatured: false,
      status: 'draft',
      recordedLive: false,
      recordedAt: '',
      date: '8 фев 2026',
      platform: ''
    },
  ];

  const filteredMixes = mixes.filter((mix) => {
    if (filterType === 'published' && mix.status !== 'published') return false;
    if (filterType === 'draft' && mix.status !== 'draft') return false;
    if (filterType === 'premium' && !mix.isPremium) return false;
    if (searchQuery && !mix.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Total stats
  const totalPlays = mixes.reduce((sum, m) => sum + m.plays, 0);
  const totalLikes = mixes.reduce((sum, m) => sum + m.likes, 0);
  const totalDownloads = mixes.reduce((sum, m) => sum + m.downloads, 0);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl lg:text-2xl xl:text-3xl font-black text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
            Мои миксы
          </h1>
          <p className="text-xs lg:text-sm text-gray-400 mt-1">Управляйте промо-миксами, лайв-сетами и радио-шоу</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-xs lg:text-sm font-bold shadow-lg shadow-purple-500/30 transition-all"
        >
          <Upload className="w-4 h-4" />
          Загрузить микс
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 lg:gap-3">
        {[
          { icon: Headphones, label: 'Миксов', value: mixes.length, color: 'text-purple-400' },
          { icon: Play, label: 'Прослушиваний', value: totalPlays.toLocaleString(), color: 'text-cyan-400' },
          { icon: Heart, label: 'Лайков', value: totalLikes, color: 'text-pink-400' },
          { icon: Download, label: 'Скачиваний', value: totalDownloads, color: 'text-green-400' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white/5 backdrop-blur-xl rounded-xl p-3 lg:p-4 border border-white/10 text-center">
              <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <div className="text-base lg:text-lg font-black text-white">{stat.value}</div>
              <div className="text-[10px] text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск миксов..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'published', 'draft', 'premium'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'Все' : type === 'published' ? 'Опубликованные' : type === 'draft' ? 'Черновики' : 'Премиум'}
            </button>
          ))}
        </div>
      </div>

      {/* Mixes List */}
      <div className="space-y-3">
        {filteredMixes.map((mix) => (
          <motion.div
            key={mix.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/20 transition-all"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Cover */}
              <div className="relative w-full sm:w-32 lg:w-40 h-32 sm:h-auto flex-shrink-0 group">
                <img src={mix.coverUrl} alt={mix.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setPlayingMixId(playingMixId === mix.id ? null : mix.id)}
                    className="w-10 h-10 rounded-full bg-purple-500/80 flex items-center justify-center"
                  >
                    {playingMixId === mix.id ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                </div>
                {mix.isPremium && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-yellow-500/90 rounded text-[9px] font-bold text-black">
                    PREMIUM
                  </div>
                )}
                {mix.status === 'draft' && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-gray-500/90 rounded text-[9px] font-bold text-white">
                    DRAFT
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-3 lg:p-4 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-sm lg:text-base font-bold text-white truncate">{mix.title}</h3>
                    <p className="text-[10px] lg:text-xs text-gray-400 line-clamp-1">{mix.description}</p>
                  </div>
                  <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
                  <span className="flex items-center gap-1 text-[10px] lg:text-xs text-gray-500">
                    <Clock className="w-3 h-3" /> {mix.duration}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] lg:text-xs text-gray-500">
                    <Music className="w-3 h-3" /> {mix.bpmRange} BPM
                  </span>
                  {mix.recordedLive && (
                    <span className="flex items-center gap-1 text-[10px] lg:text-xs text-red-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
                    </span>
                  )}
                  {mix.platform && (
                    <span className="flex items-center gap-1 text-[10px] lg:text-xs text-gray-500">
                      <ExternalLink className="w-3 h-3" /> {mix.platform}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-600">{mix.date}</span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {mix.genres.map((genre) => (
                    <span key={genre} className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[9px] font-bold text-purple-300">
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] lg:text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {mix.plays.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {mix.likes}</span>
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {mix.downloads}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {mix.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {mix.isPremium && (
                      <span className="text-[10px] font-bold text-yellow-400 mr-2">{mix.price} ₽</span>
                    )}
                    <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Редактировать">
                      <Edit3 className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Поделиться">
                      <Share2 className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                    </button>
                    <button className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors" title="Удалить">
                      <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}