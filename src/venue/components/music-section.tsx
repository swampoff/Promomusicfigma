/**
 * MUSIC SECTION - Управление музыкой для заведения
 * Enterprise-модуль для управления плейлистами и треками
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music, Play, Pause, Plus, Search, Filter, Clock, 
  MoreVertical, Edit, Trash2, Download, Share2, Calendar,
  Shuffle, Volume2, SkipForward, CheckCircle, XCircle,
  List, Grid, TrendingUp, Settings, Upload, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import type { Playlist, PlaylistTrack } from '../types/venue-types';
import {
  fetchVenuePlaylists,
  createVenuePlaylist,
  updateVenuePlaylist,
  deleteVenuePlaylist,
} from '@/utils/api/venue-cabinet';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'draft' | 'archived';

export function MusicSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback mock data - used when API returns empty
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: 'pl1',
      venueId: 'venue1',
      ownerId: 'user1',
      title: 'Вечерний джаз',
      description: 'Расслабляющая джазовая музыка для вечерних часов',
      coverImageUrl: null,
      contentItems: [
        {
          id: 'track1',
          trackId: 't1',
          title: 'Smooth Jazz Evening',
          artist: 'Marcus Miller',
          duration: 245,
          coverUrl: null,
          addedAt: new Date().toISOString(),
        },
        {
          id: 'track2',
          trackId: 't2',
          title: 'Blue Note Sunset',
          artist: 'Pat Metheny',
          duration: 312,
          coverUrl: null,
          addedAt: new Date().toISOString(),
        },
      ],
      trackCount: 45,
      totalDuration: 10800,
      isPublic: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pl2',
      venueId: 'venue1',
      ownerId: 'user1',
      title: 'Утренний чилл',
      description: 'Легкая фоновая музыка для утренних часов',
      coverImageUrl: null,
      contentItems: [],
      trackCount: 32,
      totalDuration: 7680,
      isPublic: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pl3',
      venueId: 'venue1',
      ownerId: 'user1',
      title: 'Weekend Vibes',
      description: 'Энергичная музыка для выходных',
      coverImageUrl: null,
      contentItems: [],
      trackCount: 58,
      totalDuration: 13920,
      isPublic: false,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pl4',
      venueId: 'venue1',
      ownerId: 'user1',
      title: 'Lunch Time',
      description: 'Приятная музыка для обеда',
      coverImageUrl: null,
      contentItems: [],
      trackCount: 40,
      totalDuration: 9600,
      isPublic: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Load playlists from API
  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const apiPlaylists = await fetchVenuePlaylists();
      if (apiPlaylists && apiPlaylists.length > 0) {
        setPlaylists(apiPlaylists as unknown as Playlist[]);
      }
    } catch (error) {
      console.error('Error loading playlists, using fallback mocks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         playlist.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || playlist.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    /* console.log('Playing playlist:', playlist.id);*/
    toast.success(`Воспроизведение: ${playlist.title}`);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот плейлист?')) {
      try {
        const ok = await deleteVenuePlaylist(playlistId);
        if (ok) {
          setPlaylists(prev => prev.filter(p => p.id !== playlistId));
          toast.success('Плейлист удалён');
        } else {
          toast.error('Не удалось удалить плейлист');
        }
      } catch (error) {
        console.error('Error deleting playlist:', error);
        toast.error('Ошибка при удалении плейлиста');
      }
    }
  };

  const handleSavePlaylist = async (data: { title: string; description: string }) => {
    try {
      if (selectedPlaylist) {
        // Update existing playlist
        const updated = await updateVenuePlaylist(selectedPlaylist.id, {
          title: data.title,
          description: data.description,
        } as any);
        if (updated) {
          setPlaylists(prev => prev.map(p =>
            p.id === selectedPlaylist.id
              ? { ...p, title: data.title, description: data.description, updatedAt: new Date().toISOString() }
              : p
          ));
          toast.success('Плейлист обновлён');
        } else {
          toast.error('Не удалось обновить плейлист');
        }
      } else {
        // Create new playlist
        const created = await createVenuePlaylist({
          title: data.title,
          description: data.description,
        } as any);
        if (created) {
          setPlaylists(prev => [...prev, created as unknown as Playlist]);
          toast.success('Плейлист создан');
        } else {
          toast.error('Не удалось создать плейлист');
        }
      }
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast.error('Ошибка при сохранении плейлиста');
    } finally {
      setIsCreatingPlaylist(false);
      setSelectedPlaylist(null);
    }
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4">
        <div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1 xs:mb-2">
            Управление музыкой 🎵
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-slate-400">
            Создавайте и управляйте плейлистами для вашего заведения
          </p>
        </div>

        <button
          onClick={() => setIsCreatingPlaylist(true)}
          className="w-full sm:w-auto px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg xs:rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all text-sm xs:text-base"
        >
          <Plus className="w-4 h-4 xs:w-5 xs:h-5" />
          Создать плейлист
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
        <div className="p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 xs:gap-2 mb-1">
            <Music className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-indigo-400" />
            <span className="text-[10px] xs:text-xs text-slate-400">Всего плейлистов</span>
          </div>
          <p className="text-lg xs:text-2xl font-bold text-white">{playlists.length}</p>
        </div>

        <div className="p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 xs:gap-2 mb-1">
            <CheckCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-green-400" />
            <span className="text-[10px] xs:text-xs text-slate-400">Активных</span>
          </div>
          <p className="text-lg xs:text-2xl font-bold text-white">
            {playlists.filter(p => p.status === 'active').length}
          </p>
        </div>

        <div className="p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 xs:gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-400" />
            <span className="text-[10px] xs:text-xs text-slate-400">Общая длительность</span>
          </div>
          <p className="text-lg xs:text-2xl font-bold text-white">
            {formatDuration(playlists.reduce((sum, p) => sum + p.totalDuration, 0))}
          </p>
        </div>

        <div className="p-3 xs:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 xs:gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-amber-400" />
            <span className="text-[10px] xs:text-xs text-slate-400">Всего треков</span>
          </div>
          <p className="text-lg xs:text-2xl font-bold text-white">
            {playlists.reduce((sum, p) => sum + p.trackCount, 0)}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск плейлистов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
          >
            <option value="all">Все</option>
            <option value="active">Активные</option>
            <option value="draft">Черновики</option>
            <option value="archived">Архив</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlists Grid/List */}
      {filteredPlaylists.length === 0 ? (
        <div className="py-12 text-center">
          <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Плейлисты не найдены</h3>
          <p className="text-slate-400 mb-6">
            {searchQuery
              ? 'Попробуйте изменить поисковый запрос'
              : 'Создайте свой первый плейлист'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreatingPlaylist(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              Создать плейлист
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onPlay={() => handlePlayPlaylist(playlist)}
              onEdit={() => setSelectedPlaylist(playlist)}
              onDelete={() => handleDeletePlaylist(playlist.id)}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPlaylists.map((playlist) => (
            <PlaylistListItem
              key={playlist.id}
              playlist={playlist}
              onPlay={() => handlePlayPlaylist(playlist)}
              onEdit={() => setSelectedPlaylist(playlist)}
              onDelete={() => handleDeletePlaylist(playlist.id)}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Playlist Modal */}
      <AnimatePresence>
        {(isCreatingPlaylist || selectedPlaylist) && (
          <PlaylistEditorModal
            playlist={selectedPlaylist}
            onClose={() => {
              setIsCreatingPlaylist(false);
              setSelectedPlaylist(null);
            }}
            onSave={handleSavePlaylist}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatDuration: (seconds: number) => string;
}

function PlaylistCard({ playlist, onPlay, onEdit, onDelete, formatDuration }: PlaylistCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all relative"
    >
      {/* Cover */}
      <div className="aspect-square rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 flex items-center justify-center relative overflow-hidden">
        <Music className="w-12 h-12 text-white/50" />
        
        {/* Play Button Overlay */}
        <button
          onClick={onPlay}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        >
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <Play className="w-6 h-6 text-black ml-1" />
          </div>
        </button>
      </div>

      {/* Info */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-semibold truncate flex-1">{playlist.title}</h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg hover:bg-white/10 transition-all"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>
            
            {showMenu && (
              <div className="contents">
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-40 p-2 rounded-xl bg-[#0a0a14] border border-white/20 shadow-xl">
                  <button
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    className="w-full px-3 py-2 rounded-lg text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Редактировать
                  </button>
                  <button
                    onClick={() => { onDelete(); setShowMenu(false); }}
                    className="w-full px-3 py-2 rounded-lg text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-400 line-clamp-2 mb-2">
          {playlist.description || 'Без описания'}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span>{playlist.trackCount} треков</span>
        <span>•</span>
        <span>{formatDuration(playlist.totalDuration)}</span>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {playlist.status === 'active' ? (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
            <CheckCircle className="w-3 h-3" />
            Активен
          </span>
        ) : playlist.status === 'draft' ? (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs">
            <Edit className="w-3 h-3" />
            Черновик
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-500/20 text-slate-300 text-xs">
            <XCircle className="w-3 h-3" />
            Архив
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface PlaylistListItemProps {
  playlist: Playlist;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatDuration: (seconds: number) => string;
}

function PlaylistListItem({ playlist, onPlay, onEdit, onDelete, formatDuration }: PlaylistListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-4"
    >
      {/* Play Button */}
      <button
        onClick={onPlay}
        className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center hover:scale-105 transition-all flex-shrink-0"
      >
        <Play className="w-5 h-5 text-white ml-0.5" />
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate mb-1">{playlist.title}</h3>
        <p className="text-sm text-slate-400 truncate">{playlist.description || 'Без описания'}</p>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-4 text-sm text-slate-400">
        <span>{playlist.trackCount} треков</span>
        <span>{formatDuration(playlist.totalDuration)}</span>
      </div>

      {/* Status */}
      <div className="hidden md:block">
        {playlist.status === 'active' ? (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
            <CheckCircle className="w-3 h-3" />
            Активен
          </span>
        ) : playlist.status === 'draft' ? (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs">
            <Edit className="w-3 h-3" />
            Черновик
          </span>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-white/10 transition-all"
        >
          <Edit className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </motion.div>
  );
}

interface PlaylistEditorModalProps {
  playlist: Playlist | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

function PlaylistEditorModal({ playlist, onClose, onSave }: PlaylistEditorModalProps) {
  const [title, setTitle] = useState(playlist?.title || '');
  const [description, setDescription] = useState(playlist?.description || '');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg p-6 rounded-2xl bg-[#0a0a14] border border-white/20 shadow-2xl"
      >
        <h3 className="text-2xl font-bold text-white mb-6">
          {playlist ? 'Редактировать плейлист' : 'Создать плейлист'}
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Вечерний джаз"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание плейлиста..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={() => onSave({ title, description })}
            disabled={!title.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {playlist ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}