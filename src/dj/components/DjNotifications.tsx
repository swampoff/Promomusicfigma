/**
 * DJ NOTIFICATIONS - Центр уведомлений
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell, Calendar, DollarSign, Star, MessageSquare, Music,
  CheckCircle, Users, Radio, AlertCircle, Check, Trash2
} from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '@/utils/supabase/client';

const DJ_API = `https://${projectId}.supabase.co/functions/v1/server/api/dj-studio`;

async function djFetch(path: string, options: RequestInit = {}) {
  const token = (await supabase.auth.getSession()).data.session?.access_token || publicAnonKey;
  const res = await fetch(`${DJ_API}${path}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
  });
  return res.json();
}

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'message' | 'system' | 'collab';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const typeIcons: Record<string, typeof Bell> = {
  booking: Calendar, payment: DollarSign, review: Star,
  message: MessageSquare, system: AlertCircle, collab: Users,
};
const typeColors: Record<string, string> = {
  booking: 'from-purple-500/20 to-violet-500/20 text-purple-400',
  payment: 'from-emerald-500/20 to-green-500/20 text-emerald-400',
  review: 'from-yellow-500/20 to-amber-500/20 text-yellow-400',
  message: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
  system: 'from-gray-500/20 to-slate-500/20 text-gray-400',
  collab: 'from-pink-500/20 to-fuchsia-500/20 text-pink-400',
};

export function DjNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    djFetch('/notifications')
      .then((data) => {
        const items = Array.isArray(data) ? data : (data.notifications ?? data.data ?? []);
        setNotifications(items.map((n: any) => ({
          id: String(n.id),
          type: n.type ?? 'system',
          title: n.title ?? '',
          description: n.description ?? '',
          time: n.time ?? n.created_at ?? '',
          read: Boolean(n.read),
        })));
      })
      .catch((err) => console.error('[DjNotifications] fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markAllRead = async () => {
    try {
      await djFetch('/notifications/read', { method: 'POST', body: JSON.stringify({ all: true }) });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('[DjNotifications] markAllRead error:', err);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const markRead = async (id: string) => {
    try {
      await djFetch('/notifications/read', { method: 'POST', body: JSON.stringify({ ids: [id] }) });
    } catch (err) {
      console.error('[DjNotifications] markRead error:', err);
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white">Уведомления</h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300">
              {unreadCount} новых
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400 hover:bg-white/10 transition-all"
          >
            <Check className="w-3.5 h-3.5" /> Прочитать все
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg text-xs xs:text-sm font-bold transition-all ${
              filter === f
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            {f === 'all' ? `Все (${notifications.length})` : `Непрочитанные (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse" />
          <p className="text-sm font-bold">Загрузка уведомлений...</p>
        </div>
      ) : (
      <div className="space-y-1.5 xs:space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Нет уведомлений</p>
          </div>
        ) : (
          filtered.map((notification, i) => {
            const Icon = typeIcons[notification.type];
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => markRead(notification.id)}
                className={`p-3 xs:p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  notification.read
                    ? 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                    : 'bg-purple-500/5 border-purple-500/15 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-start gap-2.5 xs:gap-3">
                  <div className={`w-8 h-8 xs:w-9 xs:h-9 rounded-lg bg-gradient-to-br ${typeColors[notification.type]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xs xs:text-sm font-bold truncate ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] xs:text-xs text-gray-500 line-clamp-1 mt-0.5" dangerouslySetInnerHTML={{ __html: notification.description }} />
                    <span className="text-[9px] xs:text-[10px] text-gray-600 mt-1 block">{notification.time}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotification(notification.id); }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-600 hover:text-red-400" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      )}
    </div>
  );
}
