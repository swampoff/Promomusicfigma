/**
 * DJ NOTIFICATIONS - Центр уведомлений
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell, Calendar, DollarSign, Star, MessageSquare, Music,
  CheckCircle, Users, Radio, AlertCircle, Check, Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'message' | 'system' | 'collab';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'booking', title: 'Новый букинг', description: 'Club Neon подтвердил букинг на 14 февраля, 23:00', time: '5 мин назад', read: false },
  { id: '2', type: 'payment', title: 'Оплата получена', description: 'Зачислено 45 000 &#8381; за выступление в Sky Lounge', time: '2 часа назад', read: false },
  { id: '3', type: 'review', title: 'Новый отзыв', description: 'Анна К. оставила отзыв: "Потрясающий сет! 10/10"', time: '4 часа назад', read: false },
  { id: '4', type: 'collab', title: 'Запрос коллаборации', description: 'DJ Aurora предлагает B2B сет на Spring Festival', time: '6 часов назад', read: true },
  { id: '5', type: 'message', title: 'Сообщение от менеджера', description: 'Grand Hall: "Уточните, пожалуйста, райдер для мероприятия 15 марта"', time: '8 часов назад', read: true },
  { id: '6', type: 'system', title: 'Микс одобрен', description: 'Ваш микс "Night Session Vol.3" прошёл модерацию', time: '1 день назад', read: true },
  { id: '7', type: 'booking', title: 'Напоминание', description: 'Через 3 дня - выступление в Club Neon. Проверьте райдер.', time: '1 день назад', read: true },
  { id: '8', type: 'payment', title: 'Вывод средств', description: 'Вывод 30 000 &#8381; на карту **** 4582 обработан', time: '2 дня назад', read: true },
  { id: '9', type: 'review', title: 'Новая оценка', description: 'Ваш рейтинг обновлён: 4.9 (+0.1)', time: '3 дня назад', read: true },
  { id: '10', type: 'system', title: 'Обновление платформы', description: 'Добавлена интеграция с Spotify для автоматической синхронизации миксов', time: '5 дней назад', read: true },
];

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
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const markRead = (id: string) => {
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
    </div>
  );
}
