import config from '@/config/environment';
/**
 * CONCERT MODERATION - Расширенная страница модерации концертов
 * Максимальный адаптив + полный функционал + логика
 * v2: Real API calls to /api/concert-moderation
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, MapPin, CheckCircle, XCircle, Eye, Clock, Filter, Search,
  ThumbsUp, ThumbsDown, AlertCircle, X, Users, Ticket, ChevronDown,
  ChevronUp, User, TrendingUp, Grid, List, SlidersHorizontal,
  CheckSquare, DollarSign, Tag, FileText, MoreVertical, Info,
  ExternalLink, Share2, Heart, MessageSquare, Music
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicApiKey } from '@/utils/auth/info';
import { authClient } from '@/utils/auth/client';

const API_BASE = `${config.functionsUrl}/api/concert-moderation`;

async function modApiFetch(path: string, options: RequestInit = {}) {
  const token = (await authClient.auth.getSession()).data.session?.access_token || publicApiKey;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res.json();
}

// Интерфейс концерта (из API)
interface Concert {
  id: number;
  title: string;
  artist: string;
  city: string;
  venue: string;
  venue_address: string;
  date: string;
  time: string;
  type: string;
  banner_image_url: string;
  ticket_price_from: number;
  ticket_price_to: number;
  ticket_link: string;
  ticket_capacity: number;
  description: string;
  moderation_status: string;
  rejection_reason: string | null;
  moderation_comment: string | null;
  user_id: string;
  source: string;
  created_at: string;
  updated_at: string;
  // UI aliases
  banner?: string;
  artistAvatar?: string;
  status?: string;
  venue_name?: string;
  ticketPriceFrom?: number;
  ticketPriceTo?: number;
  ticketLink?: string;
  clicks?: number;
  moderationNote?: string;
  isPaid?: boolean;
  userId?: string;
  createdAt?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'artist' | 'clicks' | 'title' | 'concertDate';

export function ConcertModeration() {
  // ==================== STATE ====================
  const [allConcerts, setAllConcerts] = useState<Concert[]>([]);
  const [loadingConcerts, setLoadingConcerts] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('concertDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [selectedConcerts, setSelectedConcerts] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // ==================== LOAD FROM API ====================
  const fetchConcerts = async () => {
    try {
      setLoadingConcerts(true);
      const data = await modApiFetch('/pending?status=all');
      const items = data?.data || [];
      // Normalize API fields to UI fields
      const normalized = items.map((c: any) => ({
        ...c,
        status: c.moderation_status || c.status || 'pending',
        artist: c.artist || c.artist_name || '',
        venue: c.venue || c.venue_name || '',
        banner: c.banner_image_url || c.banner || '',
        artistAvatar: '',
        ticketPriceFrom: c.ticket_price_from ?? c.ticketPriceFrom ?? 0,
        ticketPriceTo: c.ticket_price_to ?? c.ticketPriceTo ?? 0,
        ticketLink: c.ticket_link || c.ticketLink || '',
        clicks: c.clicks || 0,
        moderationNote: c.moderation_comment || c.rejection_reason || '',
        isPaid: false,
        userId: c.user_id || '',
        createdAt: c.created_at || c.createdAt || new Date().toISOString(),
      }));
      setAllConcerts(normalized);
    } catch (error) {
      console.error('Error loading concerts:', error);
      toast.error('Ошибка загрузки концертов');
    } finally {
      setLoadingConcerts(false);
    }
  };

  useEffect(() => { fetchConcerts(); }, []);

  // ==================== COMPUTED ====================
  const concerts = allConcerts;

  const uniqueCities = useMemo(() => {
    const cities = [...new Set(concerts.map(c => c.city).filter(Boolean))];
    return ['all', ...cities];
  }, [concerts]);

  const filteredAndSortedConcerts = useMemo(() => {
    let result = concerts.filter(concert => {
      const matchesFilter = filter === 'all' || concert.status === filter;
      const matchesCity = cityFilter === 'all' || concert.city === cityFilter;
      const matchesSearch = (concert.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (concert.artist || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (concert.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (concert.venue || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesCity && matchesSearch;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          break;
        case 'artist':
          comparison = (a.artist || '').localeCompare(b.artist || '');
          break;
        case 'clicks':
          comparison = (b.clicks || 0) - (a.clicks || 0);
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'concertDate':
          comparison = new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [concerts, filter, cityFilter, searchQuery, sortBy, sortOrder]);

  // ==================== STATS ====================
  const stats = useMemo(() => ({
    total: concerts.length,
    pending: concerts.filter(c => c.status === 'pending').length,
    approved: concerts.filter(c => ['approved', 'published'].includes(c.status || '')).length,
    rejected: concerts.filter(c => c.status === 'rejected').length,
    totalClicks: concerts.reduce((sum, c) => sum + (c.clicks || 0), 0),
  }), [concerts]);

  // ==================== HANDLERS ====================
  const handleApprove = async (concertId: number, note?: string) => {
    const concert = concerts.find(c => c.id === concertId);
    if (!concert) {
      toast.error('Концерт не найден');
      return;
    }

    try {
      const result = await modApiFetch('/manage', {
        method: 'POST',
        body: JSON.stringify({
          concertId,
          action: 'approve',
          moderator_notes: note || 'Концерт одобрен модератором',
        }),
      });

      if (!result.success) {
        toast.error(result.error || 'Ошибка при одобрении');
        return;
      }

      const coinsMsg = result.coinsAwarded ? ` +${result.coinsAwarded} монет организатору` : '';
      toast.success('Концерт одобрен!', {
        description: `Концерт опубликован.${coinsMsg}`,
      });

      // Update local state
      setAllConcerts(prev => prev.map(c =>
        c.id === concertId ? { ...c, status: 'published', moderationNote: note || '' } : c
      ));
      setSelectedConcert(null);
      setModerationNote('');
      setSelectedConcerts(prev => {
        const next = new Set(prev);
        next.delete(concertId);
        return next;
      });
    } catch (error) {
      console.error('Error approving concert:', error);
      toast.error('Ошибка при одобрении концерта');
    }
  };

  const handleReject = async (concertId: number, note: string) => {
    if (!note.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    const concert = concerts.find(c => c.id === concertId);
    if (!concert) {
      toast.error('Концерт не найден');
      return;
    }

    try {
      const result = await modApiFetch('/manage', {
        method: 'POST',
        body: JSON.stringify({
          concertId,
          action: 'reject',
          rejection_reason: note,
          moderator_notes: note,
        }),
      });

      if (!result.success) {
        toast.error(result.error || 'Ошибка при отклонении');
        return;
      }

      toast.error('Концерт отклонён', {
        description: 'Организатор увидит причину отклонения',
      });

      setAllConcerts(prev => prev.map(c =>
        c.id === concertId ? { ...c, status: 'rejected', moderationNote: note } : c
      ));
      setSelectedConcert(null);
      setModerationNote('');
      setSelectedConcerts(prev => {
        const next = new Set(prev);
        next.delete(concertId);
        return next;
      });
    } catch (error) {
      console.error('Error rejecting concert:', error);
      toast.error('Ошибка при отклонении концерта');
    }
  };

  const handleBulkApprove = async () => {
    const ids = [...selectedConcerts];
    try {
      const result = await modApiFetch('/batch', {
        method: 'POST',
        body: JSON.stringify({ concertIds: ids, action: 'approve' }),
      });
      if (result.success) {
        toast.success(`Одобрено концертов: ${ids.length}`);
        fetchConcerts();
      }
    } catch {
      toast.error('Ошибка массового одобрения');
    }
    setSelectedConcerts(new Set());
  };

  const handleBulkReject = async () => {
    if (!moderationNote.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }
    const ids = [...selectedConcerts];
    try {
      const result = await modApiFetch('/batch', {
        method: 'POST',
        body: JSON.stringify({ concertIds: ids, action: 'reject' }),
      });
      if (result.success) {
        toast.error(`Отклонено концертов: ${ids.length}`);
        fetchConcerts();
      }
    } catch {
      toast.error('Ошибка массового отклонения');
    }
    setSelectedConcerts(new Set());
    setModerationNote('');
  };

  const toggleConcertSelection = (concertId: number) => {
    setSelectedConcerts(prev => {
      const next = new Set(prev);
      if (next.has(concertId)) {
        next.delete(concertId);
      } else {
        next.add(concertId);
      }
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'published':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
      case 'published':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      default:
        return 'На модерации';
    }
  };

  // ==================== LOADING ====================
  if (loadingConcerts) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <span className="ml-3 text-gray-400">Загрузка концертов...</span>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="space-y-3 xs:space-y-4 md:space-y-6">
      {/* ==================== HEADER ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-lg xs:rounded-xl md:rounded-2xl border border-white/10 p-3 xs:p-4 md:p-6"
      >
        {/* Title & Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 xs:gap-4 mb-3 xs:mb-4 md:mb-6">
          <div className="flex items-center gap-2.5 xs:gap-3 md:gap-4">
            <div className="p-1.5 xs:p-2 md:p-3 rounded-lg xs:rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <Calendar className="w-5 h-5 xs:w-6 xs:h-6 md:w-8 md:h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-lg xs:text-xl md:text-3xl font-bold text-white">Модерация концертов</h1>
              <p className="text-[10px] xs:text-xs md:text-base text-gray-400">Проверяйте и одобряйте события</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:flex md:items-center gap-1.5 xs:gap-2">
            <div className="px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
              <div className="text-[10px] xs:text-xs text-gray-400">Ожидают</div>
              <div className="text-base xs:text-lg md:text-xl font-bold text-yellow-400">{stats.pending}</div>
            </div>
            <div className="px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-[10px] xs:text-xs text-gray-400">Одобрено</div>
              <div className="text-base xs:text-lg md:text-xl font-bold text-green-400">{stats.approved}</div>
            </div>
          </div>
        </div>

        {/* Info Banner when no concerts */}
        {allConcerts.length === 0 && (
          <div className="mb-3 xs:mb-4 p-2.5 xs:p-3 md:p-4 rounded-lg xs:rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 xs:gap-3">
            <AlertCircle className="w-4 h-4 xs:w-5 xs:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-[10px] xs:text-xs md:text-sm font-semibold text-blue-400 mb-0.5 xs:mb-1">Нет концертов для модерации</h3>
              <p className="text-[10px] xs:text-xs text-gray-300">
                Концерты появятся здесь когда артисты отправят их на модерацию через свой кабинет.
              </p>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="space-y-2.5 xs:space-y-3">
          <div className="flex flex-col sm:flex-row gap-1.5 xs:gap-2 md:gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию, артисту, городу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-white text-sm md:text-base placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Фильтры</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* View Toggle */}
            <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Status Filter */}
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'approved', 'rejected'].map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType as any)}
                      className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all ${
                        filter === filterType
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {filterType === 'all' && 'Все'}
                      {filterType === 'pending' && `На модерации (${stats.pending})`}
                      {filterType === 'approved' && `Одобрено (${stats.approved})`}
                      {filterType === 'rejected' && `Отклонено (${stats.rejected})`}
                    </button>
                  ))}
                </div>

                {/* City & Sort */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm md:text-base focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="all">Все города</option>
                    {uniqueCities.filter(c => c !== 'all').map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm md:text-base focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="concertDate">По дате концерта</option>
                    <option value="date">По дате загрузки</option>
                    <option value="artist">По артисту</option>
                    <option value="clicks">По переходам</option>
                    <option value="title">По названию</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 md:py-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Убывание' : 'Возрастание'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        {selectedConcerts.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 md:p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 text-sm md:text-base">
              <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
              <span className="text-white font-medium">
                Выбрано: <strong>{selectedConcerts.size}</strong> {selectedConcerts.size === 1 ? 'концерт' : 'концертов'}
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleBulkApprove}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <CheckCircle className="w-4 h-4" />
                Одобрить все
              </button>
              <button
                onClick={handleBulkReject}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <XCircle className="w-4 h-4" />
                Отклонить все
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ==================== CONCERTS LIST ==================== */}
      {filteredAndSortedConcerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-12 text-center"
        >
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Концерты не найдены</h3>
          <p className="text-gray-400">Попробуйте изменить фильтры или параметры поиска</p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        // ==================== GRID VIEW ====================
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAndSortedConcerts.map((concert, index) => (
            <motion.div
              key={concert.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-orange-500/30 transition-all group"
            >
              {/* Poster */}
              <div className="relative h-48">
                <img
                  src={concert.banner}
                  alt={concert.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Checkbox */}
                <button
                  onClick={() => toggleConcertSelection(concert.id)}
                  className="absolute top-2 left-2 w-6 h-6 rounded border-2 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-orange-500/50 transition-all z-10"
                >
                  {selectedConcerts.has(concert.id) && (
                    <CheckSquare className="w-5 h-5 text-orange-400" />
                  )}
                </button>

                {/* Status Badge */}
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg border text-xs font-medium backdrop-blur-sm ${getStatusColor(concert.status || '')}`}>
                  {getStatusText(concert.status || '')}
                </span>

                {/* Artist */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="text-white font-semibold text-sm">{concert.artist}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{concert.title}</h3>

                <div className="space-y-1.5 mb-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{concert.venue}, {concert.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{formatDate(concert.date)} {concert.time && `• ${concert.time}`}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {concert.ticketPriceFrom ? (
                      <span className="flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        от {concert.ticketPriceFrom}₽
                      </span>
                    ) : null}
                  </div>
                </div>

                {concert.moderationNote && (
                  <div className="mb-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-300 line-clamp-2">{concert.moderationNote}</p>
                  </div>
                )}

                {/* Actions */}
                {concert.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(concert.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Одобрить
                    </button>
                    <button
                      onClick={() => {
                        setSelectedConcert(concert);
                        setModerationNote('');
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <XCircle className="w-3 h-3" />
                      Отклонить
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // ==================== LIST VIEW ====================
        <div className="space-y-3 md:space-y-4">
          {filteredAndSortedConcerts.map((concert, index) => (
            <motion.div
              key={concert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-orange-500/30 transition-all"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Checkbox & Poster */}
                  <div className="flex items-start gap-3 md:gap-4">
                    <button
                      onClick={() => toggleConcertSelection(concert.id)}
                      className="mt-2 flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded border-2 border-white/20 flex items-center justify-center hover:border-orange-500/50 transition-all"
                    >
                      {selectedConcerts.has(concert.id) && (
                        <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                      )}
                    </button>

                    <div className="relative group flex-shrink-0 w-32 md:w-40 lg:w-48">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden">
                        <img
                          src={concert.banner}
                          alt={concert.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => setSelectedConcert(concert)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/60 transition-all rounded-lg"
                      >
                        <Eye className="w-8 h-8 md:w-10 md:h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    {/* Concert Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-white mb-1">
                        {concert.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 md:w-4 md:h-4" />
                          {concert.artist}
                        </span>
                        <span>•</span>
                        <span>{concert.type || 'Концерт'}</span>
                      </div>

                      <p className="text-xs md:text-sm text-gray-500 mb-3 line-clamp-2">
                        {concert.description}
                      </p>

                      {/* Details */}
                      <div className="space-y-1.5 mb-2 text-xs md:text-sm text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{concert.venue}, {concert.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{formatDate(concert.date)} {concert.time && `• ${concert.time}`}</span>
                        </div>
                      </div>

                      {/* Status & Stats */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg border text-xs md:text-sm font-medium ${getStatusColor(concert.status || '')}`}>
                          {getStatusText(concert.status || '')}
                        </span>
                        {concert.ticketPriceFrom ? (
                          <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                            <Ticket className="w-3 h-3 md:w-4 md:h-4" />
                            {concert.ticketPriceFrom}₽ - {concert.ticketPriceTo}₽
                          </span>
                        ) : null}
                      </div>

                      {/* Moderation Note */}
                      {concert.moderationNote && (
                        <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs md:text-sm text-red-300">{concert.moderationNote}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {concert.status === 'pending' && (
                    <div className="flex lg:flex-col gap-2 mt-2 lg:mt-0">
                      <button
                        onClick={() => handleApprove(concert.id)}
                        className="flex-1 lg:flex-initial px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Одобрить</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedConcert(concert);
                          setModerationNote('');
                        }}
                        className="flex-1 lg:flex-initial px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Отклонить</span>
                      </button>
                      <button
                        onClick={() => setSelectedConcert(concert)}
                        className="lg:hidden px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ==================== MODERATION MODAL ==================== */}
      <AnimatePresence>
        {selectedConcert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedConcert(null);
              setModerationNote('');
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Модерация концерта</h2>
                  <p className="text-gray-400">"{selectedConcert.title}" - {selectedConcert.artist}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedConcert(null);
                    setModerationNote('');
                  }}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Poster */}
              {selectedConcert.banner && (
                <div className="mb-6">
                  <img
                    src={selectedConcert.banner}
                    alt={selectedConcert.title}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Description */}
              {selectedConcert.description && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Описание</h3>
                  <p className="text-white text-sm">{selectedConcert.description}</p>
                </div>
              )}

              {/* Concert Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Место</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedConcert.venue}</p>
                  <p className="text-gray-400 text-xs">{selectedConcert.city}</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Дата и время</p>
                  <p className="text-white font-semibold text-sm md:text-base">{formatDate(selectedConcert.date)}</p>
                  <p className="text-gray-400 text-xs">{selectedConcert.time}</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Билеты</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedConcert.ticketPriceFrom || 0}₽ - {selectedConcert.ticketPriceTo || 0}₽</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Источник</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedConcert.source || 'user'}</p>
                </div>
              </div>

              {/* Ticket Link */}
              {selectedConcert.ticketLink && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Ссылка на билеты</h3>
                  <a
                    href={selectedConcert.ticketLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-2"
                  >
                    {selectedConcert.ticketLink}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Moderation Actions */}
              {selectedConcert.status === 'pending' && (
                <div className="space-y-4">
                  {/* Note Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Комментарий модератора
                    </label>
                    <textarea
                      value={moderationNote}
                      onChange={(e) => setModerationNote(e.target.value)}
                      placeholder="Укажите причину отклонения или оставьте комментарий..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 resize-none"
                    />
                  </div>

                  {/* Quick Rejection Reasons */}
                  <div>
                    <div className="text-sm font-medium text-gray-400 mb-3">Быстрые причины отклонения:</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Некорректная информация о месте',
                        'Неверная дата проведения',
                        'Проблемы с постером',
                        'Нарушение авторских прав',
                        'Неполная информация',
                      ].map((reason) => (
                        <button
                          key={reason}
                          onClick={() => setModerationNote(reason)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleApprove(selectedConcert.id, moderationNote || undefined)}
                      className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Одобрить концерт
                    </button>
                    <button
                      onClick={() => handleReject(selectedConcert.id, moderationNote)}
                      className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Отклонить концерт
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
