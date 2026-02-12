/**
 * NOTIFICATION HISTORY PAGE - Полная история уведомлений артиста
 *
 * Функционал:
 * - Полный архив всех уведомлений с пагинацией
 * - Фильтры по типу статуса (одобрено, отклонено, доработка и пр.)
 * - Поиск по тексту уведомлений
 * - Группировка по дате (Сегодня, Вчера, Ранее)
 * - Управление настройками звука и email-уведомлений
 * - Навигация к заказу при клике
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, CheckCircle, XCircle, AlertCircle, Eye,
  ArrowRight, RotateCcw, Upload, CreditCard, Loader2,
  Volume2, VolumeX, Search, Filter, Mail, MailCheck,
  CheckCheck, ChevronDown, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchArtistNotifications,
  markNotificationsRead,
  fetchEmailPreferences,
  updateEmailPreferences,
  type PublishNotification,
  type EmailNotificationPrefs,
  STATUS_LABELS,
} from '@/utils/api/publish-api';
import {
  isSoundEnabled,
  toggleSound,
  getSoundVolume,
  setSoundVolume,
  playNotificationSound,
} from '@/utils/notification-sound';

// ── Status config ────────────────────────────────────────

const STATUS_ICON_MAP: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  in_review:       { icon: Eye,          color: 'text-blue-400',    bg: 'bg-blue-500/20',    label: 'На проверке' },
  approved:        { icon: CheckCircle,  color: 'text-green-400',   bg: 'bg-green-500/20',   label: 'Одобрено' },
  pending_payment: { icon: CreditCard,   color: 'text-purple-400',  bg: 'bg-purple-500/20',  label: 'Ожидает оплаты' },
  revision:        { icon: RotateCcw,    color: 'text-orange-400',  bg: 'bg-orange-500/20',  label: 'На доработке' },
  rejected:        { icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/20',     label: 'Отклонено' },
  published:       { icon: Upload,       color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Опубликовано' },
  paid:            { icon: CheckCircle,  color: 'text-green-400',   bg: 'bg-green-500/20',   label: 'Оплачено' },
};

type StatusFilter = 'all' | string;

const FILTER_TABS: { id: StatusFilter; label: string; color: string }[] = [
  { id: 'all',             label: 'Все',            color: 'text-white' },
  { id: 'approved',        label: 'Одобрено',       color: 'text-green-400' },
  { id: 'published',       label: 'Опубликовано',   color: 'text-emerald-400' },
  { id: 'revision',        label: 'Доработка',      color: 'text-orange-400' },
  { id: 'rejected',        label: 'Отклонено',      color: 'text-red-400' },
  { id: 'in_review',       label: 'На проверке',    color: 'text-blue-400' },
  { id: 'pending_payment', label: 'Ожидает оплаты', color: 'text-purple-400' },
];

// ── Date helpers ─────────────────────────────────────────

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (date >= today) return 'Сегодня';
  if (date >= yesterday) return 'Вчера';
  if (date >= weekAgo) return 'На этой неделе';
  return 'Ранее';
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} д назад`;
  return formatFullDate(dateStr);
}

// ── Component ────────────────────────────────────────────

interface NotificationHistoryPageProps {
  onNavigateToOrder?: (orderId: string) => void;
}

export function NotificationHistoryPage({ onNavigateToOrder }: NotificationHistoryPageProps) {
  const [notifications, setNotifications] = useState<PublishNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [volume, setVolume] = useState(getSoundVolume);
  const [emailPrefs, setEmailPrefs] = useState<EmailNotificationPrefs | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const userId = localStorage.getItem('artistProfileId') || 'demo-artist';

  // Загрузка уведомлений
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications: data } = await fetchArtistNotifications(userId);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Загрузка email-настроек
  const loadEmailPrefs = useCallback(async () => {
    try {
      const prefs = await fetchEmailPreferences(userId);
      setEmailPrefs(prefs);
    } catch (err) {
      console.error('Failed to load email prefs:', err);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
    loadEmailPrefs();
  }, [loadNotifications, loadEmailPrefs]);

  // Фильтрация
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (statusFilter !== 'all' && n.newStatus !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!n.message.toLowerCase().includes(q) && !n.orderTitle.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [notifications, statusFilter, searchQuery]);

  // Группировка по дате
  const grouped = useMemo(() => {
    const groups: Record<string, PublishNotification[]> = {};
    for (const n of filtered) {
      const group = getDateGroup(n.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    }
    return groups;
  }, [filtered]);

  const groupOrder = ['Сегодня', 'Вчера', 'На этой неделе', 'Ранее'];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Статистика по статусам
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of notifications) {
      counts[n.newStatus] = (counts[n.newStatus] || 0) + 1;
    }
    return counts;
  }, [notifications]);

  // Отметить все как прочитанные
  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('Все уведомления отмечены как прочитанные');
    } catch (err) {
      toast.error('Ошибка при отметке уведомлений');
    }
  };

  // Переключение звука
  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  // Изменение громкости
  const handleVolumeChange = (val: number) => {
    setVolume(val);
    setSoundVolume(val);
  };

  // Тестовый звук
  const handleTestSound = () => {
    playNotificationSound('normal');
  };

  // Сохранение email-настроек
  const handleSaveEmailPrefs = async (prefs: Partial<EmailNotificationPrefs>) => {
    setEmailLoading(true);
    try {
      const updated = await updateEmailPreferences(userId, prefs);
      if (updated) {
        setEmailPrefs(updated);
        toast.success('Настройки email-уведомлений сохранены');
      }
    } catch (err) {
      toast.error('Ошибка сохранения настроек');
    } finally {
      setEmailLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return STATUS_ICON_MAP[status] || { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-500/20', label: status };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF577F]/20 border border-[#FF577F]/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#FF577F]" />
            </div>
            История уведомлений
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {notifications.length} уведомлений
            {unreadCount > 0 && <span className="text-[#FF577F] font-bold ml-1">({unreadCount} непрочитанных)</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Прочитать все
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              showSettings
                ? 'bg-[#FF577F]/20 text-[#FF577F] border-[#FF577F]/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            Настройки
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5">
              <h3 className="text-sm font-bold text-white">Настройки уведомлений</h3>

              {/* Sound Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    <span className="text-sm text-white">Звуковые уведомления</span>
                  </div>
                  <button
                    onClick={handleToggleSound}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      soundOn ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        soundOn ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {soundOn && (
                  <div className="flex items-center gap-3 pl-6">
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(volume * 100)}
                      onChange={(e) => handleVolumeChange(parseInt(e.target.value) / 100)}
                      className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#FF577F]"
                    />
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <button
                      onClick={handleTestSound}
                      className="text-[10px] text-[#FF577F] hover:text-[#FF6B8F] font-bold transition-all"
                    >
                      Тест
                    </button>
                  </div>
                )}
              </div>

              {/* Email Settings */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white">Email-уведомления</span>
                </div>

                {emailPrefs ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                    {[
                      { key: 'onApproved', label: 'Одобрено', color: 'text-green-400' },
                      { key: 'onPublished', label: 'Опубликовано', color: 'text-emerald-400' },
                      { key: 'onRevision', label: 'На доработке', color: 'text-orange-400' },
                      { key: 'onRejected', label: 'Отклонено', color: 'text-red-400' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={emailPrefs[item.key as keyof EmailNotificationPrefs] as boolean}
                          onChange={(e) =>
                            handleSaveEmailPrefs({ [item.key]: e.target.checked })
                          }
                          disabled={emailLoading}
                          className="w-4 h-4 rounded bg-white/5 border-white/20 text-[#FF577F] focus:ring-[#FF577F]/50 cursor-pointer"
                        />
                        <span className={`text-xs ${item.color} group-hover:text-white transition-all`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 pl-6">Загрузка настроек...</p>
                )}

                {emailPrefs?.email && (
                  <div className="flex items-center gap-2 pl-6">
                    <MailCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] text-slate-500">Отправка на: {emailPrefs.email}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3">
        {/* Status filter tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto scrollbar-thin">
          {FILTER_TABS.map((tab) => {
            const count = tab.id === 'all' ? notifications.length : (statusCounts[tab.id] || 0);
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-[#FF577F]/20 text-[#FF577F] border border-[#FF577F]/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    statusFilter === tab.id ? 'bg-[#FF577F]/30 text-[#FF577F]' : 'bg-white/10 text-slate-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по тексту уведомления..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:border-[#FF577F]/50 focus:ring-2 focus:ring-[#FF577F]/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF577F]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Bell className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-lg text-slate-400 font-bold">
            {searchQuery || statusFilter !== 'all' ? 'Ничего не найдено' : 'Нет уведомлений'}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {searchQuery || statusFilter !== 'all'
              ? 'Попробуйте изменить фильтры или поисковый запрос'
              : 'Уведомления о статусе публикаций появятся здесь'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupOrder.map((groupName) => {
            const items = grouped[groupName];
            if (!items || items.length === 0) return null;

            return (
              <div key={groupName}>
                {/* Group header */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{groupName}</h3>
                  <span className="text-[10px] text-slate-600">({items.length})</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {items.map((notif, idx) => {
                    const statusInfo = getStatusInfo(notif.newStatus);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <button
                          onClick={() => {
                            if (onNavigateToOrder) onNavigateToOrder(notif.orderId);
                          }}
                          className={`w-full text-left px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all group ${
                            !notif.read ? 'bg-white/[0.03] border border-white/[0.06]' : 'border border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Status Icon */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${statusInfo.bg}`}>
                              <StatusIcon className={`w-4.5 h-4.5 ${statusInfo.color}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm leading-relaxed ${!notif.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                                  {notif.message}
                                </p>
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full bg-[#FF577F] flex-shrink-0 mt-1.5" />
                                )}
                              </div>

                              {notif.comment && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                                  &laquo;{notif.comment}&raquo;
                                </p>
                              )}

                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] text-slate-600">
                                  {formatRelativeTime(notif.createdAt)}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                                {notif.orderTitle && (
                                  <span className="text-[10px] text-slate-600 truncate max-w-[150px]">
                                    {notif.orderTitle}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Navigate arrow */}
                            {onNavigateToOrder && (
                              <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 flex-shrink-0 mt-1 transition-colors" />
                            )}
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
