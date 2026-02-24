/**
 * PUBLISH MODERATION - Модерация публикаций (видео/концерты)
 * Полный цикл: загрузка - модерация - оплата - публикация
 *
 * Подключен к API: GET /admin/all, GET /admin/stats, PUT /orders/:id/status, PUT /admin/batch-status
 * Push-уведомления артистам при изменении статуса (серверная сторона)
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye,
  Filter, Search, RefreshCw, ChevronRight, ChevronDown, X,
  Shield, DollarSign, Tag, FileText, MapPin, Ticket, Link as LinkIcon,
  ExternalLink, Loader2, Send, RotateCcw, ThumbsUp, ThumbsDown,
  FileVideo, Music, User, ArrowRight, BarChart3, CheckSquare, Square,
  Layers, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAllOrders, fetchOrderStats, updateOrderStatus, batchUpdateOrderStatus,
  type PublishOrder, type PublishStatus,
  STATUS_LABELS, STATUS_COLORS,
} from '@/utils/api/publish-api';

type FilterTab = 'pending' | 'all' | 'published' | 'rejected';

export function PublishModeration() {
  const [orders, setOrders] = useState<PublishOrder[]>([]);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'concert'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PublishOrder | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [moderationComment, setModerationComment] = useState('');

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchComment, setBatchComment] = useState('');
  const [showBatchComment, setShowBatchComment] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        fetchAllOrders(),
        fetchOrderStats(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load publish moderation data:', err);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filter === 'pending' && !['pending_review', 'in_review'].includes(o.status)) return false;
      if (filter === 'published' && o.status !== 'published') return false;
      if (filter === 'rejected' && o.status !== 'rejected') return false;
      if (typeFilter !== 'all' && o.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!o.title.toLowerCase().includes(q) && !o.userId.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [orders, filter, typeFilter, searchQuery]);

  const pendingCount = useMemo(
    () => orders.filter((o) => ['pending_review', 'in_review'].includes(o.status)).length,
    [orders],
  );

  // Batch-eligible orders (those that can be moderated)
  const batchEligibleIds = useMemo(
    () => new Set(filteredOrders.filter((o) => ['pending_review', 'in_review'].includes(o.status)).map((o) => o.id)),
    [filteredOrders],
  );

  const selectedEligibleIds = useMemo(
    () => [...selectedIds].filter((id) => batchEligibleIds.has(id)),
    [selectedIds, batchEligibleIds],
  );

  const allEligibleSelected = batchEligibleIds.size > 0 && selectedEligibleIds.length === batchEligibleIds.size;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allEligibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(batchEligibleIds));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setShowBatchComment(false);
    setBatchComment('');
  };

  const handleAction = async (orderId: string, action: 'approve' | 'reject' | 'revision' | 'in_review') => {
    setProcessingId(orderId);
    try {
      const statusMap: Record<string, string> = {
        approve: 'approved',
        reject: 'rejected',
        revision: 'revision',
        in_review: 'in_review',
      };
      const updated = await updateOrderStatus(
        orderId,
        statusMap[action],
        moderationComment || undefined,
        action === 'reject' ? moderationComment || undefined : undefined,
      );
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        setSelectedOrder(updated);
        setModerationComment('');
        const labels: Record<string, string> = {
          approve: 'Публикация одобрена',
          reject: 'Публикация отклонена',
          revision: 'Отправлено на доработку',
          in_review: 'Взято на проверку',
        };
        toast.success(labels[action]);
        // Refresh stats
        fetchOrderStats().then((s) => s && setStats(s));
      } else {
        toast.error('Ошибка при обновлении статуса');
      }
    } catch (err: any) {
      toast.error(`Ошибка: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject' | 'revision') => {
    if (selectedEligibleIds.length === 0) {
      toast.error('Нет выбранных заказов для модерации');
      return;
    }

    if (action === 'reject' && !batchComment.trim()) {
      toast.error('Укажите причину отклонения для пакетной операции');
      setShowBatchComment(true);
      return;
    }

    if (action === 'revision' && !batchComment.trim()) {
      toast.error('Укажите что нужно доработать для пакетной операции');
      setShowBatchComment(true);
      return;
    }

    setBatchProcessing(true);
    try {
      const statusMap: Record<string, string> = {
        approve: 'approved',
        reject: 'rejected',
        revision: 'revision',
      };

      const result = await batchUpdateOrderStatus(
        selectedEligibleIds,
        statusMap[action],
        batchComment || undefined,
        action === 'reject' ? batchComment || undefined : undefined,
      );

      if (result) {
        // Update local orders with results
        const updatedMap = new Map<string, PublishOrder>();
        for (const r of result.results) {
          if (r.success && r.order) {
            updatedMap.set(r.id, r.order);
          }
        }

        setOrders((prev) => prev.map((o) => updatedMap.get(o.id) || o));

        const actionLabels: Record<string, string> = {
          approve: 'одобрено',
          reject: 'отклонено',
          revision: 'отправлено на доработку',
        };
        toast.success(
          `Пакетная модерация: ${result.summary.succeeded} ${actionLabels[action]}` +
          (result.summary.failed > 0 ? `, ${result.summary.failed} с ошибкой` : ''),
        );

        clearSelection();
        // Refresh stats
        fetchOrderStats().then((s) => s && setStats(s));
      } else {
        toast.error('Ошибка пакетной модерации');
      }
    } catch (err: any) {
      toast.error(`Ошибка: ${err.message}`);
    } finally {
      setBatchProcessing(false);
    }
  };

  return (
    <div className="space-y-4 xs:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
            Модерация публикаций
          </h1>
          <p className="text-xs xs:text-sm text-slate-400 mt-1">
            Проверка и одобрение видео и концертов от артистов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Push-уведомления</span>
            <span className="sm:hidden">Push</span>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="На модерации"
            value={(stats.pending_review || 0) + (stats.in_review || 0)}
            color="amber"
            icon={Clock}
          />
          <StatCard
            label="Опубликовано"
            value={stats.published || 0}
            color="green"
            icon={CheckCircle}
          />
          <StatCard
            label="Отклонено"
            value={stats.rejected || 0}
            color="red"
            icon={XCircle}
          />
          <StatCard
            label="Всего"
            value={stats.total || 0}
            color="blue"
            icon={BarChart3}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tab Filters */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          {([
            { id: 'pending' as FilterTab, label: 'На модерации', count: pendingCount },
            { id: 'all' as FilterTab, label: 'Все', count: orders.length },
            { id: 'published' as FilterTab, label: 'Опубликовано', count: 0 },
            { id: 'rejected' as FilterTab, label: 'Отклонено', count: 0 },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setFilter(tab.id); clearSelection(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
              {tab.id === 'pending' && pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          {(['all', 'video', 'concert'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === t
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'Все типы' : t === 'video' ? 'Видео' : 'Концерты'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или ID..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Batch Action Bar */}
      <AnimatePresence>
        {selectedEligibleIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 xs:p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm text-white font-bold">
                    Выбрано: {selectedEligibleIds.length}
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-slate-400 hover:text-white transition-all underline"
                  >
                    Сбросить
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  {showBatchComment && (
                    <input
                      type="text"
                      value={batchComment}
                      onChange={(e) => setBatchComment(e.target.value)}
                      placeholder="Комментарий для пакетной операции..."
                      className="w-full sm:w-64 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                    />
                  )}
                  {!showBatchComment && (
                    <button
                      onClick={() => setShowBatchComment(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-all"
                    >
                      + Добавить комментарий
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBatchAction('approve')}
                      disabled={batchProcessing}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 transition-all disabled:opacity-50"
                    >
                      {batchProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                      Одобрить все ({selectedEligibleIds.length})
                    </button>
                    <button
                      onClick={() => handleBatchAction('revision')}
                      disabled={batchProcessing}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 transition-all disabled:opacity-50"
                    >
                      {batchProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      На доработку
                    </button>
                    <button
                      onClick={() => handleBatchAction('reject')}
                      disabled={batchProcessing}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all disabled:opacity-50"
                    >
                      {batchProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsDown className="w-3.5 h-3.5" />}
                      Отклонить все
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area: Split view */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Orders List */}
        <div className={`flex-1 ${selectedOrder ? 'lg:max-w-[50%]' : ''}`}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-red-400" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Нет заказов</h3>
              <p className="text-xs text-slate-500">
                {filter === 'pending' ? 'Все публикации проверены' : 'По фильтру ничего не найдено'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All Row */}
              {batchEligibleIds.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-all"
                  >
                    {allEligibleSelected
                      ? <CheckSquare className="w-4 h-4 text-indigo-400" />
                      : <Square className="w-4 h-4" />
                    }
                    {allEligibleSelected ? 'Снять все' : `Выбрать все на модерации (${batchEligibleIds.size})`}
                  </button>
                </div>
              )}

              {filteredOrders.map((order) => {
                const isEligible = batchEligibleIds.has(order.id);
                const isSelected = selectedIds.has(order.id);

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-center gap-2 p-3 xs:p-4 rounded-xl border transition-all ${
                      selectedOrder?.id === order.id
                        ? 'bg-white/10 border-red-500/40'
                        : isSelected
                          ? 'bg-indigo-500/10 border-indigo-500/30'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    {/* Checkbox */}
                    {isEligible && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(order.id);
                        }}
                        className="flex-shrink-0 p-0.5"
                      >
                        {isSelected
                          ? <CheckSquare className="w-4 h-4 text-indigo-400" />
                          : <Square className="w-4 h-4 text-slate-600 hover:text-slate-400 transition-all" />
                        }
                      </button>
                    )}

                    {/* Order card content - clickable */}
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setModerationComment('');
                      }}
                      className="flex-1 text-left flex items-center gap-3 min-w-0"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        order.type === 'video' ? 'bg-[#FF577F]/20' : 'bg-orange-500/20'
                      }`}>
                        {order.type === 'video'
                          ? <Video className="w-5 h-5 text-[#FF577F]" />
                          : <Calendar className="w-5 h-5 text-orange-400" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-bold text-white truncate">{order.title}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] xs:text-xs text-slate-500">
                          <span>{order.userId}</span>
                          <span>{order.plan === 'free' ? 'Бесплатный' : order.plan === 'standard' ? 'Стандарт' : 'Премиум'}</span>
                          <span>{new Date(order.createdAt).toLocaleDateString('ru')}</span>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium flex-shrink-0 ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:w-[50%] flex-shrink-0 sticky top-4"
            >
              <div className="p-4 xs:p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      selectedOrder.type === 'video' ? 'bg-[#FF577F]/20' : 'bg-orange-500/20'
                    }`}>
                      {selectedOrder.type === 'video'
                        ? <Video className="w-6 h-6 text-[#FF577F]" />
                        : <Calendar className="w-6 h-6 text-orange-400" />
                      }
                    </div>
                    <div>
                      <h3 className="text-base xs:text-lg font-bold text-white">{selectedOrder.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedOrder.status]}`}>
                          {STATUS_LABELS[selectedOrder.status]}
                        </span>
                        <span className="text-xs text-slate-500">ID: {selectedOrder.id}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-2 p-3 rounded-xl bg-white/5">
                  <DetailRow icon={User} label="Артист" value={selectedOrder.userId} />
                  <DetailRow icon={Tag} label="Тариф" value={selectedOrder.plan === 'free' ? 'Бесплатный' : selectedOrder.plan === 'standard' ? 'Стандарт' : 'Премиум'} />
                  {selectedOrder.price > 0 && (
                    <DetailRow icon={DollarSign} label="Цена" value={`${selectedOrder.price.toLocaleString()} ₽`} />
                  )}
                  <DetailRow icon={Clock} label="Создано" value={new Date(selectedOrder.createdAt).toLocaleString('ru')} />

                  {selectedOrder.type === 'video' && (
                    <div className="contents">
                      {selectedOrder.videoUrl && (
                        <DetailRow icon={LinkIcon} label="Видео" value={selectedOrder.videoUrl} truncate />
                      )}
                      {selectedOrder.videoCategory && (
                        <DetailRow icon={FileVideo} label="Категория" value={selectedOrder.videoCategory} />
                      )}
                      {selectedOrder.tags && selectedOrder.tags.length > 0 && (
                        <DetailRow icon={Tag} label="Теги" value={selectedOrder.tags.join(', ')} />
                      )}
                    </div>
                  )}

                  {selectedOrder.type === 'concert' && (
                    <div className="contents">
                      {selectedOrder.eventDate && (
                        <DetailRow icon={Calendar} label="Дата" value={`${selectedOrder.eventDate}${selectedOrder.eventTime ? ` ${selectedOrder.eventTime}` : ''}`} />
                      )}
                      {selectedOrder.city && (
                        <DetailRow icon={MapPin} label="Город" value={selectedOrder.city} />
                      )}
                      {selectedOrder.venueName && (
                        <DetailRow icon={Music} label="Площадка" value={selectedOrder.venueName} />
                      )}
                      {selectedOrder.genre && (
                        <DetailRow icon={Tag} label="Жанр" value={selectedOrder.genre} />
                      )}
                      {(selectedOrder.ticketPriceMin || selectedOrder.ticketPriceMax) && (
                        <DetailRow icon={Ticket} label="Билеты" value={`${selectedOrder.ticketPriceMin || '?'} - ${selectedOrder.ticketPriceMax || '?'} ₽`} />
                      )}
                    </div>
                  )}
                </div>

                {selectedOrder.description && (
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-slate-500 mb-1 font-bold">Описание</p>
                    <p className="text-sm text-slate-300">{selectedOrder.description}</p>
                  </div>
                )}

                {/* Previous notes */}
                {selectedOrder.moderatorComment && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400 mb-1 font-bold">Комментарий модератора</p>
                    <p className="text-sm text-green-300">{selectedOrder.moderatorComment}</p>
                  </div>
                )}
                {selectedOrder.rejectionReason && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 mb-1 font-bold">Причина отклонения</p>
                    <p className="text-sm text-red-300">{selectedOrder.rejectionReason}</p>
                  </div>
                )}
                {selectedOrder.revisionNotes && (
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <p className="text-xs text-orange-400 mb-1 font-bold">На доработку</p>
                    <p className="text-sm text-orange-300">{selectedOrder.revisionNotes}</p>
                  </div>
                )}

                {/* Notification indicator */}
                <div className="flex items-center gap-2 text-xs text-blue-400/70">
                  <Bell className="w-3 h-3" />
                  Артист получит push-уведомление при изменении статуса
                </div>

                {/* Moderation Actions */}
                {['pending_review', 'in_review'].includes(selectedOrder.status) && (
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <textarea
                      value={moderationComment}
                      onChange={(e) => setModerationComment(e.target.value)}
                      placeholder="Комментарий модератора (необязательно)..."
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-white placeholder:text-slate-600 text-sm h-16 resize-none"
                    />

                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.status === 'pending_review' && (
                        <ActionButton
                          label="Взять на проверку"
                          icon={Eye}
                          color="blue"
                          loading={processingId === selectedOrder.id}
                          onClick={() => handleAction(selectedOrder.id, 'in_review')}
                        />
                      )}
                      <ActionButton
                        label="Одобрить"
                        icon={ThumbsUp}
                        color="green"
                        loading={processingId === selectedOrder.id}
                        onClick={() => handleAction(selectedOrder.id, 'approve')}
                      />
                      <ActionButton
                        label="На доработку"
                        icon={RotateCcw}
                        color="orange"
                        loading={processingId === selectedOrder.id}
                        onClick={() => {
                          if (!moderationComment.trim()) {
                            toast.error('Укажите что нужно доработать');
                            return;
                          }
                          handleAction(selectedOrder.id, 'revision');
                        }}
                      />
                      <ActionButton
                        label="Отклонить"
                        icon={ThumbsDown}
                        color="red"
                        loading={processingId === selectedOrder.id}
                        onClick={() => {
                          if (!moderationComment.trim()) {
                            toast.error('Укажите причину отклонения');
                            return;
                          }
                          handleAction(selectedOrder.id, 'reject');
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Payment & Published info */}
                {selectedOrder.paidAt && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    Оплачено {new Date(selectedOrder.paidAt).toLocaleString('ru')} ({selectedOrder.paymentMethod || 'card'})
                  </div>
                )}
                {selectedOrder.publishedAt && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Опубликовано {new Date(selectedOrder.publishedAt).toLocaleString('ru')}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: 'amber' | 'green' | 'red' | 'blue';
  icon: React.ElementType;
}) {
  const colorMap = {
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/30 text-amber-400',
    green: 'from-green-500/10 to-green-600/5 border-green-500/30 text-green-400',
    red: 'from-red-500/10 to-red-600/5 border-red-500/30 text-red-400',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-400',
  };

  return (
    <div className={`p-3 xs:p-4 rounded-xl bg-gradient-to-br border ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl xs:text-3xl font-black text-white">{value}</p>
      <p className="text-[10px] xs:text-xs opacity-80 mt-1">{label}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  truncate,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs xs:text-sm">
      <Icon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
      <span className="text-slate-500">{label}:</span>
      <span className={`text-white font-medium ${truncate ? 'truncate max-w-[180px]' : ''}`}>{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  color,
  loading,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  color: 'green' | 'red' | 'orange' | 'blue';
  loading: boolean;
  onClick: () => void;
}) {
  const colorMap = {
    green: 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30',
    orange: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/30',
    blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${colorMap[color]}`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}