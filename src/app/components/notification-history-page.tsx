/**
 * NOTIFICATION HISTORY PAGE - Полный центр уведомлений артиста
 *
 * Функционал:
 * - Единый экран ВСЕХ уведомлений (публикации, коллаборации, финансы, система)
 * - Группировка по дате (Сегодня, Вчера, На этой неделе, Ранее)
 * - Категории-фильтры: Все | Публикации | Коллаборации | Финансы | Система
 * - Поиск по тексту
 * - SSE real-time индикатор
 * - Навигация к заказу при клике на publish-уведомление
 * - Настройки звука и email-уведомлений inline
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, CheckCircle, XCircle, AlertCircle, Eye,
  ArrowRight, RotateCcw, Upload, CreditCard, Loader2,
  Volume2, VolumeX, Search, CheckCheck, Calendar,
  Handshake, DollarSign, Shield, Wifi, WifiOff,
  RefreshCw, Settings, ChevronRight, MessageSquare,
  Coins, Info, Zap, Filter, Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  isSoundEnabled,
  toggleSound,
  getSoundVolume,
  setSoundVolume,
  playNotificationSound,
} from '@/utils/notification-sound';
import {
  useNotificationSSE,
  type NotificationCategory,
  type UnifiedNotification,
} from '@/utils/hooks/useNotificationSSE';

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

const CATEGORY_CONFIG: Record<NotificationCategory, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  publish: { icon: Upload,     color: 'text-cyan-400',    bg: 'bg-cyan-500/20',    label: 'Публикации' },
  collab:  { icon: Handshake,  color: 'text-amber-400',   bg: 'bg-amber-500/20',   label: 'Коллаборации' },
  finance: { icon: DollarSign, color: 'text-green-400',   bg: 'bg-green-500/20',   label: 'Финансы' },
  system:  { icon: Shield,     color: 'text-indigo-400',  bg: 'bg-indigo-500/20',  label: 'Система' },
};

type CategoryFilter = 'all' | NotificationCategory;

const CATEGORY_TABS: { id: CategoryFilter; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'all',     label: 'Все',           icon: Bell,        color: 'text-white' },
  { id: 'publish', label: 'Публикации',    icon: Upload,      color: 'text-cyan-400' },
  { id: 'collab',  label: 'Коллаборации',  icon: Handshake,   color: 'text-amber-400' },
  { id: 'finance', label: 'Финансы',       icon: DollarSign,  color: 'text-green-400' },
  { id: 'system',  label: 'Система',       icon: Shield,      color: 'text-indigo-400' },
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

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} д назад`;
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

// ── Notification icon resolver ───────────────────────────

function getNotifIcon(notif: UnifiedNotification): { icon: React.ElementType; color: string; bg: string } {
  // Publish notifications - use status
  if (notif.category === 'publish' && notif.status) {
    const si = STATUS_ICON_MAP[notif.status];
    if (si) return { icon: si.icon, color: si.color, bg: si.bg };
  }

  // Category-based fallback
  switch (notif.type) {
    case 'collab_offer':    return { icon: Handshake,     color: 'text-amber-400',   bg: 'bg-amber-500/20' };
    case 'collab_response': return { icon: CheckCircle,   color: 'text-green-400',   bg: 'bg-green-500/20' };
    case 'collab_message':  return { icon: MessageSquare, color: 'text-blue-400',    bg: 'bg-blue-500/20' };
    case 'finance_payment': return { icon: Coins,         color: 'text-green-400',   bg: 'bg-green-500/20' };
    case 'system_update':   return { icon: Zap,           color: 'text-indigo-400',  bg: 'bg-indigo-500/20' };
    case 'system_security': return { icon: Shield,        color: 'text-red-400',     bg: 'bg-red-500/20' };
    default:
      return CATEGORY_CONFIG[notif.category] || { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-500/20' };
  }
}

// ── Component ────────────────────────────────────────────

interface NotificationHistoryPageProps {
  onNavigateToOrder?: (orderId: string) => void;
  onNavigateToCollabs?: () => void;
}

export function NotificationHistoryPage({ onNavigateToOrder, onNavigateToCollabs }: NotificationHistoryPageProps) {
  const userId = localStorage.getItem('artistProfileId') || 'demo-artist';

  const {
    notifications,
    allNotifications,
    unreadCount,
    loading,
    sseConnected,
    refresh,
    markAllRead,
    byCategory,
    typePrefs,
  } = useNotificationSSE({ userId });

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [volume, setVolume] = useState(getSoundVolume);
  const [groupMode, setGroupMode] = useState<'date' | 'type'>('date');

  // Filter by category + search
  const filtered = useMemo(() => {
    let items = byCategory(categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(n =>
        n.message.toLowerCase().includes(q) ||
        n.title.toLowerCase().includes(q) ||
        (n.comment && n.comment.toLowerCase().includes(q))
      );
    }
    return items;
  }, [byCategory, categoryFilter, searchQuery]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, UnifiedNotification[]> = {};
    for (const n of filtered) {
      const group = getDateGroup(n.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    }
    return groups;
  }, [filtered]);

  const groupOrder = ['Сегодня', 'Вчера', 'На этой неделе', 'Ранее'];

  // Group by event type
  const TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    status_change:    { label: 'Смена статуса',      icon: Eye,            color: 'text-blue-400',    bg: 'bg-blue-500/20' },
    collab_offer:     { label: 'Предложения коллабов', icon: Handshake,    color: 'text-amber-400',   bg: 'bg-amber-500/20' },
    collab_response:  { label: 'Ответы на коллабы',    icon: CheckCircle,  color: 'text-green-400',   bg: 'bg-green-500/20' },
    collab_message:   { label: 'Сообщения коллабов',   icon: MessageSquare, color: 'text-blue-400',   bg: 'bg-blue-500/20' },
    finance_payment:  { label: 'Платежи',              icon: Coins,        color: 'text-green-400',   bg: 'bg-green-500/20' },
    system_update:    { label: 'Обновления системы',   icon: Zap,          color: 'text-indigo-400',  bg: 'bg-indigo-500/20' },
    system_security:  { label: 'Безопасность',         icon: Shield,       color: 'text-red-400',     bg: 'bg-red-500/20' },
  };

  const groupedByType = useMemo(() => {
    const groups: Record<string, UnifiedNotification[]> = {};
    for (const n of filtered) {
      const key = n.type || (n.category === 'publish' ? 'status_change' : n.category);
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    }
    // Sort groups by count (descending)
    const sorted = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
    return sorted;
  }, [filtered]);

  // Category counts (based on ALL notifications, not filtered by prefs)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allNotifications.length };
    for (const n of allNotifications) {
      counts[n.category] = (counts[n.category] || 0) + 1;
    }
    return counts;
  }, [allNotifications]);

  // Handlers
  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success('Все уведомления отмечены как прочитанные');
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    setSoundVolume(val);
  };

  const handleTestSound = () => {
    playNotificationSound('normal');
  };

  const handleNotifClick = (notif: UnifiedNotification) => {
    if (notif.category === 'publish' && notif.linkedId && onNavigateToOrder) {
      onNavigateToOrder(notif.linkedId);
    } else if (notif.category === 'collab' && onNavigateToCollabs) {
      onNavigateToCollabs();
    }
  };

  // Count hidden by prefs
  const hiddenByPrefs = allNotifications.length - notifications.length;

  return (
    <div className="max-w-4xl mx-auto space-y-5 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF577F]/20 border border-[#FF577F]/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#FF577F]" />
            </div>
            Уведомления
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-sm text-slate-400">
              {notifications.length} уведомлений
              {unreadCount > 0 && <span className="text-[#FF577F] font-bold ml-1">({unreadCount} новых)</span>}
            </p>
            {/* SSE indicator */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              sseConnected
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                : 'bg-slate-500/15 text-slate-500 border border-slate-500/25'
            }`}>
              {sseConnected ? (
                <>
                  <Wifi className="w-2.5 h-2.5" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="w-2.5 h-2.5" />
                  Polling
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => refresh()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Обновить</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Прочитать все</span>
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
            <Settings className="w-3.5 h-3.5" />
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
            <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                Быстрые настройки звука
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <span className="text-sm text-white">Звуковые уведомления</span>
                </div>
                <button
                  onClick={handleToggleSound}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    soundOn ? 'bg-emerald-500' : 'bg-white/20'
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
                    className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#FF577F]"
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

              <p className="text-[10px] text-slate-600 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Расширенные настройки уведомлений доступны в разделе Настройки &rarr; Уведомления
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto scrollbar-thin">
        {CATEGORY_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const count = categoryCounts[tab.id] || 0;
          return (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === tab.id
                  ? 'bg-[#FF577F]/20 text-[#FF577F] border border-[#FF577F]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{tab.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  categoryFilter === tab.id ? 'bg-[#FF577F]/30 text-[#FF577F]' : 'bg-white/10 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search + Group mode toggle */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по уведомлениям..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:border-[#FF577F]/50 focus:ring-2 focus:ring-[#FF577F]/20 outline-none transition-all"
          />
        </div>
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5 flex-shrink-0">
          <button
            onClick={() => setGroupMode('date')}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
              groupMode === 'date'
                ? 'bg-[#FF577F]/20 text-[#FF577F]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Группировка по дате"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">По дате</span>
          </button>
          <button
            onClick={() => setGroupMode('type')}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
              groupMode === 'type'
                ? 'bg-[#FF577F]/20 text-[#FF577F]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Группировка по типу события"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">По типу</span>
          </button>
        </div>
      </div>

      {/* Hidden by prefs banner */}
      {hiddenByPrefs > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
          <Filter className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {hiddenByPrefs} {hiddenByPrefs === 1 ? 'уведомление скрыто' : hiddenByPrefs < 5 ? 'уведомления скрыты' : 'уведомлений скрыто'} настройками типов.
            Управление в Настройки &rarr; Уведомления по типу.
          </span>
        </div>
      )}

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
            {searchQuery || categoryFilter !== 'all' ? 'Ничего не найдено' : 'Нет уведомлений'}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {searchQuery || categoryFilter !== 'all'
              ? 'Попробуйте изменить фильтры или поисковый запрос'
              : 'Уведомления появятся здесь при активности на платформе'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupMode === 'date' ? (
            /* ── Date grouping ── */
            groupOrder.map((groupName) => {
              const items = grouped[groupName];
              if (!items || items.length === 0) return null;

              return (
                <div key={groupName}>
                  {/* Date group header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{groupName}</h3>
                    <span className="text-[10px] text-slate-600">({items.length})</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  {/* Notification items */}
                  <div className="space-y-1">
                    {items.map((notif, idx) => (
                      <NotificationItem
                        key={notif.id}
                        notif={notif}
                        idx={idx}
                        onNotifClick={handleNotifClick}
                        onNavigateToOrder={onNavigateToOrder}
                        onNavigateToCollabs={onNavigateToCollabs}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            /* ── Type grouping ── */
            groupedByType.map(([typeKey, items]) => {
              const typeInfo = TYPE_LABELS[typeKey] || CATEGORY_CONFIG[typeKey as NotificationCategory] || {
                label: typeKey,
                icon: AlertCircle,
                color: 'text-slate-400',
                bg: 'bg-slate-500/20',
              };
              const TypeIcon = typeInfo.icon;
              const unreadInGroup = items.filter(n => !n.read).length;

              return (
                <div key={typeKey}>
                  {/* Type group header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${typeInfo.bg}`}>
                      <TypeIcon className={`w-3.5 h-3.5 ${typeInfo.color}`} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{typeInfo.label}</h3>
                    <span className="text-[10px] text-slate-600">({items.length})</span>
                    {unreadInGroup > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#FF577F]/20 text-[#FF577F]">
                        {unreadInGroup} новых
                      </span>
                    )}
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  {/* Notification items */}
                  <div className="space-y-1">
                    {items.map((notif, idx) => (
                      <NotificationItem
                        key={notif.id}
                        notif={notif}
                        idx={idx}
                        onNotifClick={handleNotifClick}
                        onNavigateToOrder={onNavigateToOrder}
                        onNavigateToCollabs={onNavigateToCollabs}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Connection info footer */}
      {!loading && notifications.length > 0 && (
        <div className="flex items-center justify-center py-4 text-[10px] text-slate-600">
          {sseConnected ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Обновления в реальном времени через SSE
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Обновления каждые 15 секунд
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── NotificationItem component ───────────────────────────

interface NotificationItemProps {
  notif: UnifiedNotification;
  idx: number;
  onNotifClick: (notif: UnifiedNotification) => void;
  onNavigateToOrder?: (orderId: string) => void;
  onNavigateToCollabs?: () => void;
}

function NotificationItem({ notif, idx, onNotifClick, onNavigateToOrder, onNavigateToCollabs }: NotificationItemProps) {
  const iconInfo = getNotifIcon(notif);
  const NotifIcon = iconInfo.icon;
  const catInfo = CATEGORY_CONFIG[notif.category];
  const isClickable = (notif.category === 'publish' && !!notif.linkedId && !!onNavigateToOrder)
    || (notif.category === 'collab' && !!onNavigateToCollabs);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.02 }}
    >
      <button
        onClick={() => onNotifClick(notif)}
        disabled={!isClickable}
        className={`w-full text-left px-4 py-3.5 rounded-xl transition-all group ${
          isClickable ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'
        } ${
          !notif.read ? 'bg-white/[0.03] border border-white/[0.06]' : 'border border-transparent'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${iconInfo.bg}`}>
            <NotifIcon className={`w-4.5 h-4.5 ${iconInfo.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-sm leading-relaxed ${!notif.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                  {notif.message}
                </p>
              </div>
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-[#FF577F] flex-shrink-0 mt-1.5" />
              )}
            </div>

            {notif.comment && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                &laquo;{notif.comment}&raquo;
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-600">
                {formatRelativeTime(notif.createdAt)}
              </span>

              {/* Category badge */}
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${catInfo.bg} ${catInfo.color}`}>
                {catInfo.label}
              </span>

              {/* Publish status badge */}
              {notif.status && STATUS_ICON_MAP[notif.status] && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${STATUS_ICON_MAP[notif.status].bg} ${STATUS_ICON_MAP[notif.status].color}`}>
                  {STATUS_ICON_MAP[notif.status].label}
                </span>
              )}

              {notif.title && notif.category === 'publish' && (
                <span className="text-[10px] text-slate-600 truncate max-w-[150px]">
                  {notif.title}
                </span>
              )}
            </div>
          </div>

          {/* Navigate arrow */}
          {isClickable && (
            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 flex-shrink-0 mt-1 transition-colors" />
          )}
        </div>
      </button>
    </motion.div>
  );
}