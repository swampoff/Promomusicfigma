import config from '@/config/environment';
/**
 * CONTENT ORDERS ADMIN - Админ-панель заказов контента
 * 
 * Функции:
 * - Просмотр всех заказов
 * - Фильтрация по статусу
 * - Обновление статуса
 * - Добавление комментариев
 * - Загрузка аудио
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Clock, User, FileAudio, CheckCircle, XCircle,
  AlertCircle, Loader2, Play, Download, MessageSquare,
  RefreshCw, Filter, Search, ChevronDown, Upload, Send
} from 'lucide-react';

import { toast } from 'sonner';

interface ContentOrder {
  id: string;
  venueId: string;
  venueName: string;
  contentType: 'jingles' | 'ads' | 'announcements';
  text: string;
  style: string;
  duration: number;
  voiceType: string;
  price: number;
  status: OrderStatus;
  audioUrl?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'review'
  | 'ready'
  | 'approved'
  | 'revision'
  | 'completed'
  | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Ожидает', color: 'yellow', icon: Clock },
  processing: { label: 'В работе', color: 'blue', icon: Loader2 },
  review: { label: 'На проверке', color: 'purple', icon: AlertCircle },
  ready: { label: 'Готов', color: 'green', icon: CheckCircle },
  approved: { label: 'Утвержден', color: 'emerald', icon: CheckCircle },
  revision: { label: 'Доработка', color: 'orange', icon: RefreshCw },
  completed: { label: 'Завершен', color: 'teal', icon: CheckCircle },
  cancelled: { label: 'Отменен', color: 'red', icon: XCircle },
};

const CONTENT_TYPE_LABELS = {
  jingles: 'Джингл',
  ads: 'Реклама',
  announcements: 'Анонс'
};

export function ContentOrdersAdmin() {
  const [orders, setOrders] = useState<ContentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ContentOrder | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState<ContentOrder | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: 'admin' });
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(
        `${config.functionsUrl}/api/content-orders/orders?${params}`,
        {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzUzMzMsImV4cCI6MjA4NDkxMTMzM30.N3nzO5WooZSPS6U_b4_KEqD1ZIA-82q5_yMHKy-Jsg0'
          }
        }
      );

      if (!response.ok) {
        console.error('HTTP error fetching orders:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Response body:', errorText);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, adminComment?: string) => {
    try {
      const response = await fetch(
        `${config.functionsUrl}/api/content-orders/orders/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzUzMzMsImV4cCI6MjA4NDkxMTMzM30.N3nzO5WooZSPS6U_b4_KEqD1ZIA-82q5_yMHKy-Jsg0'
          },
          body: JSON.stringify({ status, adminComment })
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchOrders();
        setShowStatusMenu(null);
      } else {
        console.error('Failed to update order:', data.error);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const generateAudioWithElevenLabs = async (orderId: string, customText?: string) => {
    setGeneratingAudio(orderId);
    try {
      const response = await fetch(
        '${config.functionsUrl}/api/elevenlabs/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzUzMzMsImV4cCI6MjA4NDkxMTMzM30.N3nzO5WooZSPS6U_b4_KEqD1ZIA-82q5_yMHKy-Jsg0'
          },
          body: JSON.stringify({ orderId, customText })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Аудио успешно сгенерировано!`);
        fetchOrders(); // Refresh to show updated order
        setShowGenerateModal(null); // Close modal
      } else {
        console.error('Generation failed:', data.error);
        toast.error(`Ошибка генерации: ${data.error}`);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Ошибка при отправке в ElevenLabs');
    } finally {
      setGeneratingAudio(null);
    }
  };

  const createDemoOrder = async () => {
    try {
      const response = await fetch(
        '${config.functionsUrl}/api/content-orders/demo',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzUzMzMsImV4cCI6MjA4NDkxMTMzM30.N3nzO5WooZSPS6U_b4_KEqD1ZIA-82q5_yMHKy-Jsg0'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success('Демо-заказ создан!');
        fetchOrders();
      } else {
        console.error('Failed to create demo order:', data.error);
        toast.error(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating demo order:', error);
      toast.error('Ошибка при создании демо-заказа');
    }
  };

  const filteredOrders = orders.filter(order => 
    order.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    ready: orders.filter(o => o.status === 'ready').length,
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6 bg-[#0a0a14]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
            Заказы контента
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Управление заказами джинглов, рекламы и анонсов
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Обновить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Всего" value={stats.total} color="slate" />
        <StatCard label="Ожидают" value={stats.pending} color="yellow" />
        <StatCard label="В работе" value={stats.processing} color="blue" />
        <StatCard label="Готовы" value={stats.ready} color="green" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по заведению или тексту..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
          className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        >
          <option value="all">Все статусы</option>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <option key={status} value={status}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white/5 border border-white/10">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">Заказы не найдены</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
              onSelect={() => setSelectedOrder(order)}
              showStatusMenu={showStatusMenu === order.id}
              setShowStatusMenu={(show) => setShowStatusMenu(show ? order.id : null)}
              onGenerateAudio={generateAudioWithElevenLabs}
              onShowGenerateModal={setShowGenerateModal}
              generatingAudio={generatingAudio}
            />
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
          onGenerateAudio={generateAudioWithElevenLabs}
          generatingAudio={generatingAudio}
        />
      )}

      {/* Generate Audio Modal */}
      {showGenerateModal && (
        <GenerateAudioModal
          order={showGenerateModal}
          onClose={() => setShowGenerateModal(null)}
          onGenerateAudio={generateAudioWithElevenLabs}
          generatingAudio={generatingAudio}
        />
      )}
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

interface StatCardProps {
  label: string;
  value: number;
  color: 'slate' | 'yellow' | 'blue' | 'green';
}

function StatCard({ label, value, color }: StatCardProps) {
  const colors = {
    slate: 'from-slate-500/10 to-slate-600/5 border-slate-500/30 text-slate-400',
    yellow: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/30 text-yellow-400',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-400',
    green: 'from-green-500/10 to-green-600/5 border-green-500/30 text-green-400',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${colors[color]}`}>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

// =====================================================
// ORDER CARD
// =====================================================

interface OrderCardProps {
  order: ContentOrder;
  onStatusChange: (orderId: string, status: OrderStatus, comment?: string) => void;
  onSelect: () => void;
  showStatusMenu: boolean;
  setShowStatusMenu: (show: boolean) => void;
  onGenerateAudio: (orderId: string, customText?: string) => void;
  onShowGenerateModal: (order: ContentOrder) => void;
  generatingAudio: string | null;
}

function OrderCard({ order, onStatusChange, onSelect, showStatusMenu, setShowStatusMenu, onGenerateAudio, onShowGenerateModal, generatingAudio }: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">{order.venueName}</h3>
              <p className="text-sm text-slate-400">
                {CONTENT_TYPE_LABELS[order.contentType]} • {order.duration}с • {order.price.toLocaleString('ru-RU')}₽
              </p>
            </div>

            {/* Status Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusMenu(!showStatusMenu);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusConfig.color === 'green' ? 'bg-green-500/20 text-green-300' :
                  statusConfig.color === 'blue' ? 'bg-blue-500/20 text-blue-300' :
                  statusConfig.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-300' :
                  statusConfig.color === 'purple' ? 'bg-purple-500/20 text-purple-300' :
                  statusConfig.color === 'orange' ? 'bg-orange-500/20 text-orange-300' :
                  statusConfig.color === 'red' ? 'bg-red-500/20 text-red-300' :
                  'bg-slate-500/20 text-slate-300'
                }`}
              >
                <StatusIcon className={`w-3.5 h-3.5 ${order.status === 'processing' ? 'animate-spin' : ''}`} />
                <span>{statusConfig.label}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Status Menu */}
              <AnimatePresence>
                {showStatusMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 p-2 rounded-lg bg-[#0a0a14] border border-white/10 shadow-2xl z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <button
                        key={status}
                        onClick={() => onStatusChange(order.id, status as OrderStatus)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-all text-left"
                      >
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="text-sm text-white line-clamp-2 mb-2">{order.text}</p>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Стиль: {order.style}</span>
              <span>•</span>
              <span>Голос: {order.voiceType}</span>
              <span>•</span>
              <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>

            {/* Generate Audio Button */}
            {(order.status === 'pending' || order.status === 'ready') && !order.audioUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowGenerateModal(order);
                }}
                disabled={generatingAudio === order.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {generatingAudio === order.id ? (
                  <span className="contents">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Генерация...</span>
                  </span>
                ) : (
                  <span className="contents">
                    <Send className="w-3.5 h-3.5" />
                    <span>В ElevenLabs</span>
                  </span>
                )}
              </button>
            )}

            {/* Audio Ready Badge */}
            {order.audioUrl && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 flex-shrink-0">
                <FileAudio className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-semibold text-green-300">Аудио готово</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// ORDER DETAIL MODAL
// =====================================================

interface OrderDetailModalProps {
  order: ContentOrder;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus, comment?: string) => void;
  onGenerateAudio: (orderId: string) => void;
  generatingAudio: string | null;
}

function OrderDetailModal({ order, onClose, onStatusChange, onGenerateAudio, generatingAudio }: OrderDetailModalProps) {
  const [comment, setComment] = useState(order.adminComment || '');
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const handleSave = () => {
    onStatusChange(order.id, selectedStatus, comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a14] border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b border-white/10 bg-[#0a0a14]/95 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white">{order.venueName}</h2>
          <p className="text-sm text-slate-400">Заказ #{order.id.slice(-8)}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Тип" value={CONTENT_TYPE_LABELS[order.contentType]} />
            <InfoItem label="Длительность" value={`${order.duration} секунд`} />
            <InfoItem label="Стиль" value={order.style} />
            <InfoItem label="Голос" value={order.voiceType} />
            <InfoItem label="Цена" value={`${order.price.toLocaleString('ru-RU')}₽`} />
            <InfoItem label="Создан" value={new Date(order.createdAt).toLocaleString('ru-RU')} />
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Текст:</label>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-white">
              {order.text}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Статус:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Комментарий администратора:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Добавьте комментарий..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>

          {/* Generate Audio Button */}
          {order.status === 'ready' && (
            <div className="mt-4">
              <button
                onClick={() => onGenerateAudio(order.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
                disabled={generatingAudio === order.id}
              >
                {generatingAudio === order.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileAudio className="w-4 h-4" />
                )}
                Генерировать аудио
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-white/10 bg-[#0a0a14]/95 backdrop-blur-xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all"
          >
            Сохранить
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// =====================================================
// GENERATE AUDIO MODAL
// =====================================================

interface GenerateAudioModalProps {
  order: ContentOrder;
  onClose: () => void;
  onGenerateAudio: (orderId: string, customText?: string) => void;
  generatingAudio: string | null;
}

function GenerateAudioModal({ order, onClose, onGenerateAudio, generatingAudio }: GenerateAudioModalProps) {
  const [editedText, setEditedText] = useState(order.text);
  const [charCount, setCharCount] = useState(order.text.length);

  const handleTextChange = (newText: string) => {
    setEditedText(newText);
    setCharCount(newText.length);
  };

  const handleGenerate = () => {
    // Отправляем отредактированный текст если он отличается от оригинала
    const textToSend = editedText !== order.text ? editedText : undefined;
    onGenerateAudio(order.id, textToSend);
  };

  const isTextChanged = editedText !== order.text;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a14] border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b border-white/10 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Генерация аудио в ElevenLabs</h2>
              <p className="text-sm text-slate-400">{order.venueName} • Заказ #{order.id.slice(-8)}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Тип</p>
              <p className="text-sm font-semibold text-white">{CONTENT_TYPE_LABELS[order.contentType]}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Голос</p>
              <p className="text-sm font-semibold text-white capitalize">{order.voiceType}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Стиль</p>
              <p className="text-sm font-semibold text-white capitalize">{order.style}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Длительность</p>
              <p className="text-sm font-semibold text-white">{order.duration}с</p>
            </div>
          </div>

          {/* Text Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-indigo-400" />
                Текст для генерации
              </label>
              <div className="flex items-center gap-2">
                {isTextChanged && (
                  <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-medium">
                    Изменен
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {charCount} символов
                </span>
              </div>
            </div>
            
            <textarea
              value={editedText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Введите текст для генерации аудио..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none font-mono text-sm leading-relaxed"
            />
            
            <p className="text-xs text-slate-500 mt-2">
              💡 Вы можете отредактировать текст перед отправкой в ElevenLabs. Оригинальный текст из заказа сохранится.
            </p>
          </div>

          {/* Voice Settings Preview */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Настройки генерации
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400 mb-1">Модель:</p>
                <p className="text-white font-medium">eleven_monolingual_v1</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Формат:</p>
                <p className="text-white font-medium">MP3</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          {charCount > 1000 && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-200">Длинный текст</p>
                <p className="text-xs text-amber-300/80 mt-1">
                  Текст содержит {charCount} символов. Генерация может занять больше времени.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-white/10 bg-[#0a0a14]/95 backdrop-blur-xl flex gap-3">
          <button
            onClick={onClose}
            disabled={generatingAudio === order.id}
            className="flex-1 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмена
          </button>
          <button
            onClick={handleGenerate}
            disabled={generatingAudio === order.id || !editedText.trim()}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generatingAudio === order.id ? (
              <span className="contents">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Генерация...</span>
              </span>
            ) : (
              <span className="contents">
                <Send className="w-5 h-5" />
                <span>Отправить в ElevenLabs</span>
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}