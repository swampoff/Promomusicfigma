/**
 * NOTIFICATION BELL - Колокольчик с дропдаун-панелью уведомлений
 *
 * - SSE real-time: мгновенно показывает новые уведомления
 * - Дропдаун со списком уведомлений из cross-cabinet API
 * - Прочитать одно / прочитать все
 * - Glassmorphism-дизайн
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell, Check, CheckCheck, X, CreditCard, Shield,
  Upload, Music, Send, MessageSquare, AlertTriangle,
  ShoppingBag, Headphones, Radio, Zap, Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSSEContext } from '@/utils/contexts/SSEContext';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface NotificationBellProps {
  userId?: string;
  accentColor?: string; // e.g. 'red', 'purple', 'cyan'
}

interface Notification {
  id: string;
  targetUserId: string;
  targetRole: string;
  sourceRole: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;
const H = { Authorization: `Bearer ${publicAnonKey}` };

// ── Иконка по типу уведомления ──
function typeIcon(type: string) {
  switch (type) {
    case 'subscription_updated':
    case 'subscription_payment':
      return CreditCard;
    case 'publish_status':
    case 'track_moderation':
      return Upload;
    case 'collab_offer':
    case 'collab_response':
    case 'collab_message':
      return Music;
    case 'pitching_update':
      return Send;
    case 'new_direct_message':
    case 'chat_message':
      return MessageSquare;
    case 'system_alert':
      return AlertTriangle;
    case 'service_order_new':
    case 'service_order_update':
    case 'order_update':
      return ShoppingBag;
    case 'booking_update':
      return Headphones;
    case 'beat_purchased':
      return Star;
    case 'payment_received':
      return CreditCard;
    case 'admin_action':
      return Shield;
    default:
      return Zap;
  }
}

// ── Цвет по типу ──
function typeColor(type: string): string {
  switch (type) {
    case 'subscription_updated':
    case 'subscription_payment':
      return 'text-amber-400';
    case 'payment_received':
      return 'text-emerald-400';
    case 'system_alert':
      return 'text-red-400';
    case 'collab_offer':
    case 'collab_response':
      return 'text-violet-400';
    case 'publish_status':
    case 'track_moderation':
      return 'text-blue-400';
    case 'new_direct_message':
    case 'chat_message':
      return 'text-cyan-400';
    case 'beat_purchased':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
}

// ── Относительное время ──
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'только что';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} д`;
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// ── Accent helpers ──
function accentRing(accent: string): string {
  switch (accent) {
    case 'red': return 'ring-red-500/40';
    case 'purple': return 'ring-purple-500/40';
    case 'cyan': return 'ring-cyan-500/40';
    case 'amber': return 'ring-amber-500/40';
    case 'emerald': return 'ring-emerald-500/40';
    default: return 'ring-white/20';
  }
}
function accentBadge(accent: string): string {
  switch (accent) {
    case 'red': return 'bg-red-500';
    case 'purple': return 'bg-purple-500';
    case 'cyan': return 'bg-cyan-500';
    case 'amber': return 'bg-amber-500';
    case 'emerald': return 'bg-emerald-500';
    default: return 'bg-red-500';
  }
}

export function NotificationBell({ userId = 'demo-user-123', accentColor = 'red' }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const sseCtx = useSSEContext();
  const prevCountRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch unread count (lightweight) ──
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/cross-cabinet/user/${userId}/unread-count`, {
        headers: H,
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const c = data.count || 0;
          setUnreadCount(c);
          if (c > prevCountRef.current && prevCountRef.current >= 0) {
            triggerShake();
          }
          prevCountRef.current = c;
        }
      }
    } catch { /* silent */ }
  }, [userId]);

  // ── Fetch full notification list (for dropdown) ──
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cross-cabinet/user/${userId}?limit=30`, {
        headers: H,
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          const unread = data.notifications.filter((n: Notification) => !n.read).length;
          setUnreadCount(unread);
          prevCountRef.current = unread;
        }
      }
    } catch (err) {
      console.warn('[NotificationBell] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ── Mark one as read ──
  const markRead = useCallback(async (notifId: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await fetch(`${API_URL}/api/cross-cabinet/user/${userId}/read/${notifId}`, {
        method: 'PUT',
        headers: H,
      });
    } catch { /* silent */ }
  }, [userId]);

  // ── Mark all as read ──
  const markAllRead = useCallback(async () => {
    setMarkingAll(true);
    // Optimistic
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    prevCountRef.current = 0;

    try {
      await fetch(`${API_URL}/api/cross-cabinet/user/${userId}/read-all`, {
        method: 'PUT',
        headers: H,
      });
    } catch { /* silent */ }
    setMarkingAll(false);
  }, [userId]);

  // ── Shake animation ──
  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 700);
  }, []);

  // ── Toggle dropdown ──
  const togglePanel = useCallback(() => {
    setOpen(prev => {
      if (!prev) {
        // Opening - fetch fresh data
        fetchNotifications();
      }
      return !prev;
    });
  }, [fetchNotifications]);

  // ── Close on click outside ──
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Close on Escape ──
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // ── SSE: subscribe to all notification events ──
  useEffect(() => {
    if (!sseCtx) return;

    const handleSSEEvent = (data: any) => {
      // Bump unread count instantly
      setUnreadCount(prev => {
        const next = prev + 1;
        prevCountRef.current = next;
        return next;
      });
      triggerShake();

      // If panel is open, prepend new notification
      if (data && data.notificationId) {
        const newNotif: Notification = {
          id: data.notificationId,
          targetUserId: userId,
          targetRole: data.targetRole || 'admin',
          sourceRole: data.sourceRole || 'system',
          type: data.type || 'notification',
          title: data.title || 'Новое уведомление',
          message: data.message || '',
          link: data.link,
          metadata: data.metadata,
          read: false,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
      }
    };

    const events = [
      'notification', 'collab_offer', 'collab_response', 'collab_message',
      'chat_message', 'new_direct_message', 'order_update', 'booking_update',
      'moderation_update', 'artist_request', 'service_order_new',
      'service_order_update', 'beat_purchased', 'beat_review_new',
      'system_alert', 'publish_status', 'payment_received',
      'track_test_available', 'subscription_updated', 'subscription_payment',
    ];

    for (const evt of events) sseCtx.on(evt, handleSSEEvent);
    return () => { for (const evt of events) sseCtx.off(evt, handleSSEEvent); };
  }, [sseCtx, userId, triggerShake]);

  // ── Initial fetch + polling ──
  useEffect(() => {
    fetchUnreadCount();
    const interval = sseCtx?.sseConnected ? 120000 : 30000;
    pollingRef.current = setInterval(fetchUnreadCount, interval);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchUnreadCount, sseCtx?.sseConnected]);

  const unreadNotifs = notifications.filter(n => !n.read);
  const readNotifs = notifications.filter(n => n.read);

  return (
    <div className="relative">
      {/* ── Bell Button ── */}
      <motion.div
        ref={bellRef}
        role="button"
        tabIndex={0}
        aria-label={`Уведомления${unreadCount > 0 ? ` (${unreadCount} непрочитанных)` : ''}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: shake ? [0, -10, 10, -8, 8, -4, 4, 0] : 0,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ rotate: { duration: 0.6 } }}
        onClick={togglePanel}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePanel(); }}
        className={`w-10 h-10 xs:w-11 xs:h-11 lg:w-12 lg:h-12 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg hover:bg-white/20 transition-all touch-manipulation relative cursor-pointer ${
          open ? `ring-2 ${accentRing(accentColor)}` : ''
        }`}
      >
        <Bell className="w-5 h-5 lg:w-6 lg:h-6" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-1.5 -right-1.5 min-w-5 h-5 ${accentBadge(accentColor)} text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 shadow-lg`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}

        {/* SSE status dot */}
        {sseCtx && (
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0a0a14] ${
              sseCtx.sseConnected ? 'bg-emerald-400' : 'bg-red-400'
            }`}
            title={sseCtx.sseConnected ? 'Подключено' : 'Отключено'}
          />
        )}
      </motion.div>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-[340px] xs:w-[380px] max-h-[70vh] rounded-2xl backdrop-blur-2xl bg-[#12121f]/95 border border-white/15 shadow-2xl shadow-black/40 z-[200] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">Уведомления</span>
                {unreadCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full ${accentBadge(accentColor)} text-white text-[10px] font-bold`}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={markAllRead}
                    onKeyDown={(e) => { if (e.key === 'Enter') markAllRead(); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Прочитать все"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Все</span>
                  </div>
                )}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpen(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setOpen(false); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(70vh - 52px)' }}>
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell className="w-8 h-8 mb-2 opacity-30" />
                  <span className="text-sm">Нет уведомлений</span>
                </div>
              ) : (
                <div className="py-1">
                  {/* Unread section */}
                  {unreadNotifs.length > 0 && (
                    <div>
                      <div className="px-4 pt-2 pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Новые</span>
                      </div>
                      {unreadNotifs.map(n => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onMarkRead={markRead}
                          accentColor={accentColor}
                        />
                      ))}
                    </div>
                  )}
                  {/* Read section */}
                  {readNotifs.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Прочитанные</span>
                      </div>
                      {readNotifs.slice(0, 15).map(n => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onMarkRead={markRead}
                          accentColor={accentColor}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Single notification row ──

function NotificationItem({
  notification: n,
  onMarkRead,
  accentColor,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  accentColor: string;
}) {
  const Icon = typeIcon(n.type);
  const color = typeColor(n.type);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => { if (!n.read) onMarkRead(n.id); }}
      onKeyDown={(e) => { if (e.key === 'Enter' && !n.read) onMarkRead(n.id); }}
      className={`flex items-start gap-3 px-4 py-2.5 transition-colors cursor-pointer group ${
        n.read
          ? 'opacity-50 hover:opacity-70'
          : 'hover:bg-white/5'
      }`}
    >
      {/* Icon */}
      <div className={`mt-0.5 w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center ${
        n.read ? 'bg-white/5' : 'bg-white/10'
      }`}>
        <Icon className={`w-4 h-4 ${n.read ? 'text-gray-500' : color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-xs font-medium leading-tight line-clamp-1 ${
              n.read ? 'text-gray-400' : 'text-white'
            }`}
          >
            {n.title}
          </span>
          <span className="text-[10px] text-gray-500 whitespace-nowrap flex-shrink-0 mt-0.5">
            {timeAgo(n.createdAt)}
          </span>
        </div>
        <div className={`text-[11px] leading-tight mt-0.5 line-clamp-2 ${
          n.read ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {n.message}
        </div>
        {/* Source role badge */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px] uppercase tracking-wider text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
            {roleLabel(n.sourceRole)}
          </span>
          {!n.read && (
            <div className="ml-auto flex items-center gap-0.5 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Check className="w-3 h-3" />
              <span>Прочитано</span>
            </div>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!n.read && (
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${accentBadge(accentColor)}`} />
      )}
    </div>
  );
}

function roleLabel(role: string): string {
  switch (role) {
    case 'admin': return 'Админ';
    case 'artist': return 'Артист';
    case 'dj': return 'Диджей';
    case 'radio': return 'Радио';
    case 'venue': return 'Площадка';
    case 'producer': return 'Продюсер';
    case 'system': return 'Система';
    default: return role;
  }
}
