/**
 * PUBLISH ORDERS PAGE - Мои публикации
 * Отображает список заказов на публикацию с фильтрами и статусами
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video, Calendar, Clock, ChevronRight, Eye, Trash2, RefreshCw,
  Filter, Search, CheckCircle, AlertCircle, Loader2, FileVideo,
  XCircle, CreditCard, Upload, ExternalLink, MoreVertical
} from 'lucide-react';
import {
  fetchUserOrders, deleteOrder, payOrder,
  type PublishOrder, type PublishStatus,
  STATUS_LABELS, STATUS_COLORS,
} from '@/utils/api/publish-api';

interface PublishOrdersPageProps {
  onPublish?: () => void;
}

export function PublishOrdersPage({ onPublish }: PublishOrdersPageProps) {
  const [orders, setOrders] = useState<PublishOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'video' | 'concert'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const userId = localStorage.getItem('artistProfileId') || 'demo-artist';

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUserOrders(userId);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load publish orders:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((o) => {
    if (filter !== 'all' && o.type !== filter) return false;
    if (searchQuery && !o.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (orderId: string) => {
    if (!confirm('Удалить заказ?')) return;
    setProcessingId(orderId);
    const success = await deleteOrder(orderId);
    if (success) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
    setProcessingId(null);
  };

  const handlePay = async (orderId: string) => {
    setProcessingId(orderId);
    const updated = await payOrder(orderId, 'card');
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
    setProcessingId(null);
  };

  const statusIcon = (status: PublishStatus) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4" />;
      case 'pending_review':
      case 'in_review': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending_payment': return <CreditCard className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 xs:space-y-6">
      {/* Header */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl xs:text-2xl font-black text-white">Мои публикации</h1>
          <p className="text-xs xs:text-sm text-slate-500 mt-1">
            {orders.length > 0 ? `${orders.length} публикаций` : 'Нет публикаций'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onPublish && (
            <button
              onClick={onPublish}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF577F] to-purple-500 text-white text-sm font-bold shadow-lg shadow-[#FF577F]/20 hover:from-[#FF4D7D] hover:to-purple-400 transition-all"
            >
              <Upload className="w-4 h-4" />
              Новая публикация
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col xs:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          {(['all', 'video', 'concert'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f === 'all' ? 'Все' : f === 'video' ? 'Видео' : 'Концерты'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 xs:py-16"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <FileVideo className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-base xs:text-lg font-bold text-white mb-2">Нет публикаций</h3>
          <p className="text-xs xs:text-sm text-slate-500 mb-4">
            {orders.length === 0
              ? 'Создайте первую публикацию - видео или анонс концерта'
              : 'По выбранному фильтру ничего не найдено'}
          </p>
          {onPublish && orders.length === 0 && (
            <button
              onClick={onPublish}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF577F] to-purple-500 text-white text-sm font-bold shadow-lg shadow-[#FF577F]/20"
            >
              <Upload className="w-4 h-4" />
              Создать публикацию
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 xs:p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-3 xs:gap-4">
                  {/* Type Icon */}
                  <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    order.type === 'video'
                      ? 'bg-[#FF577F]/20'
                      : 'bg-orange-500/20'
                  }`}>
                    {order.type === 'video'
                      ? <Video className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
                      : <Calendar className="w-5 h-5 xs:w-6 xs:h-6 text-orange-400" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm xs:text-base font-bold text-white truncate">{order.title}</h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {statusIcon(order.status)}
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] xs:text-xs text-slate-500">
                      <span>{order.type === 'video' ? 'Видео' : 'Концерт'}</span>
                      <span>
                        {order.plan === 'free' ? 'Бесплатный' : order.plan === 'standard' ? 'Стандарт' : 'Премиум'}
                      </span>
                      {order.price > 0 && <span>{order.price.toLocaleString()} ₽</span>}
                      <span>{new Date(order.createdAt).toLocaleDateString('ru')}</span>
                    </div>

                    {order.revisionNotes && (
                      <p className="mt-2 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">
                        Доработка: {order.revisionNotes}
                      </p>
                    )}
                    {order.rejectionReason && (
                      <p className="mt-2 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                        Отклонено: {order.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {order.status === 'pending_payment' && (
                      <button
                        onClick={() => handlePay(order.id)}
                        disabled={processingId === order.id}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold hover:from-green-400 hover:to-emerald-500 transition-all disabled:opacity-50"
                      >
                        {processingId === order.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Оплатить'
                        )}
                      </button>
                    )}
                    {['draft', 'rejected', 'cancelled'].includes(order.status) && (
                      <button
                        onClick={() => handleDelete(order.id)}
                        disabled={processingId === order.id}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        {processingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
