/**
 * ARTIST NOTIFICATION CENTER - Bell dropdown с real-time уведомлениями
 *
 * Функционал:
 * - Bell-иконка с badge непрочитанных уведомлений
 * - Выпадающая панель со списком уведомлений
 * - SSE real-time обновления (заменяет 30-сек polling)
 * - Индикатор SSE-подключения (Live / Polling)
 * - Звуковые оповещения через Web Audio API
 * - Toast при появлении новых уведомлений
 * - Автоматическая отметка как прочитанных при открытии
 * - Навигация к заказу / странице истории при клике
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, CheckCircle, XCircle, AlertCircle, Eye,
  ArrowRight, X, RotateCcw, Upload, CreditCard, Loader2,
  Volume2, VolumeX, History, Wifi, WifiOff, Handshake,
  DollarSign, Shield, MessageSquare, Coins, Zap, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  isSoundEnabled,
  toggleSound,
} from '@/utils/notification-sound';
import {
  useNotificationSSE,
  type UnifiedNotification,
  type NotificationCategory,
} from '@/utils/hooks/useNotificationSSE';

// ── Icon resolver ────────────────────────────────────────

const STATUS_ICON_MAP: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  in_review:       { icon: Eye,          color: 'text-blue-400',    bg: 'bg-blue-500/20' },
  approved:        { icon: CheckCircle,  color: 'text-green-400',   bg: 'bg-green-500/20' },
  pending_payment: { icon: CreditCard,   color: 'text-purple-400',  bg: 'bg-purple-500/20' },
  revision:        { icon: RotateCcw,    color: 'text-orange-400',  bg: 'bg-orange-500/20' },
  rejected:        { icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/20' },
  published:       { icon: Upload,       color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  paid:            { icon: CheckCircle,  color: 'text-green-400',   bg: 'bg-green-500/20' },
};

function getNotifIcon(notif: UnifiedNotification): { icon: React.ElementType; color: string; bg: string } {
  if (notif.category === 'publish' && notif.status) {
    const si = STATUS_ICON_MAP[notif.status];
    if (si) return si;
  }
  switch (notif.type) {
    case 'collab_offer':    return { icon: Handshake,     color: 'text-amber-400',   bg: 'bg-amber-500/20' };
    case 'collab_response': return { icon: CheckCircle,   color: 'text-green-400',   bg: 'bg-green-500/20' };
    case 'collab_message':  return { icon: MessageSquare, color: 'text-blue-400',    bg: 'bg-blue-500/20' };
    case 'finance_payment': return { icon: Coins,         color: 'text-green-400',   bg: 'bg-green-500/20' };
    case 'system_update':   return { icon: Zap,           color: 'text-indigo-400',  bg: 'bg-indigo-500/20' };
    case 'system_security': return { icon: Shield,        color: 'text-red-400',     bg: 'bg-red-500/20' };
    default:                return { icon: AlertCircle,   color: 'text-slate-400',   bg: 'bg-slate-500/20' };
  }
}

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  publish: 'Публикация',
  collab: 'Коллаборация',
  finance: 'Финансы',
  system: 'Система',
};

function formatTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} д назад`;
  return new Date(dateStr).toLocaleDateString('ru');
}

// ── Component ────────────────────────────────────────────

interface ArtistNotificationCenterProps {
  userId: string;
  onNavigateToOrder?: (orderId: string) => void;
  onNavigateToHistory?: () => void;
  compact?: boolean;
}

export function ArtistNotificationCenter({
  userId,
  onNavigateToOrder,
  onNavigateToHistory,
  compact = false,
}: ArtistNotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    sseConnected,
    refresh,
    markAllRead,
  } = useNotificationSSE({ userId });

  const [isOpen, setIsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark all as read when opening
  const handleOpen = useCallback(async () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadCount > 0) {
      try {
        await markAllRead();
      } catch (err) {
        console.error('Failed to mark notifications as read:', err);
      }
    }
  }, [isOpen, unreadCount, markAllRead]);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
    toast.success(next ? 'Звук уведомлений включен' : 'Звук уведомлений выключен', {
      duration: 2000,
    });
  };

  const handleNotifClick = (notif: UnifiedNotification) => {
    if (notif.category === 'publish' && notif.linkedId && onNavigateToOrder) {
      onNavigateToOrder(notif.linkedId);
      setIsOpen(false);
    } else if (onNavigateToHistory) {
      onNavigateToHistory();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className={`relative flex items-center justify-center transition-all ${
          compact
            ? 'w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10'
            : 'w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10'
        }`}
      >
        <Bell className={`${compact ? 'w-3.5 h-3.5 xs:w-4 xs:h-4' : 'w-5 h-5'} text-slate-300 ${isOpen ? 'text-white' : ''}`} />

        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute flex items-center justify-center bg-[#FF577F] text-white font-bold shadow-lg shadow-[#FF577F]/30 ${
                compact
                  ? '-top-1 -right-1 min-w-[16px] h-[16px] rounded-full text-[9px] px-1'
                  : '-top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] px-1'
              }`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* SSE live dot */}
        {sseConnected && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-gray-900" />
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-[200] mt-2 rounded-2xl bg-[#0a0a14]/98 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden ${
              compact ? 'right-0 w-[320px] xs:w-[360px]' : 'right-0 w-[380px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF577F]" />
                <h3 className="text-sm font-bold text-white">Уведомления</h3>
                {notifications.length > 0 && (
                  <span className="text-[10px] text-slate-500">({notifications.length})</span>
                )}
                {/* SSE badge */}
                <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                  sseConnected
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-slate-500/15 text-slate-500'
                }`}>
                  {sseConnected ? <><Wifi className="w-2 h-2" /> Live</> : <><WifiOff className="w-2 h-2" /> Poll</>}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {/* Sound Toggle */}
                <button
                  onClick={handleToggleSound}
                  className={`p-1.5 rounded-lg transition-all ${
                    soundOn
                      ? 'hover:bg-white/10 text-emerald-400'
                      : 'hover:bg-white/10 text-slate-600'
                  }`}
                  title={soundOn ? 'Выключить звук' : 'Включить звук'}
                >
                  {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF577F]" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500">Нет уведомлений</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Здесь будут уведомления о вашей активности
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  {notifications.slice(0, 15).map((notif) => {
                    const iconInfo = getNotifIcon(notif);
                    const NotifIcon = iconInfo.icon;

                    return (
                      <motion.button
                        key={notif.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleNotifClick(notif)}
                        className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-all border-b border-white/[0.04] last:border-b-0 ${
                          !notif.read ? 'bg-white/[0.02]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${iconInfo.bg}`}>
                            <NotifIcon className={`w-4 h-4 ${iconInfo.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${!notif.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                              {notif.message}
                            </p>

                            {notif.comment && (
                              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 italic">
                                &laquo;{notif.comment}&raquo;
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-slate-600">
                                {formatTime(notif.createdAt)}
                              </span>
                              <span className="text-[8px] text-slate-600 px-1 py-0.5 rounded bg-white/5">
                                {CATEGORY_LABELS[notif.category]}
                              </span>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF577F]" />
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          {(onNavigateToOrder || onNavigateToHistory) && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                {onNavigateToHistory ? (
                  <button
                    onClick={() => {
                      onNavigateToHistory();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-[10px] text-[#FF577F] hover:text-[#FF6B8F] font-medium transition-all"
                  >
                    <History className="w-3 h-3" />
                    Все уведомления
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-600">
                    {sseConnected ? 'Real-time обновления' : 'Обновление каждые 15 сек'}
                  </span>
                )}
                <button
                  onClick={() => refresh()}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white font-medium transition-all"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Обновить
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}