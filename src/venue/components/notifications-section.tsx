/**
 * NOTIFICATIONS SECTION - Уведомления и поддержка для заведения
 * Enterprise-модуль с уведомлениями, чатом и тикетами
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, MessageCircle, FileText, CheckCircle, Clock, 
  AlertCircle, Star, Calendar, DollarSign, Music, UserCheck,
  Send, Paperclip, X, Filter, Search, MoreVertical, Radio,
  TrendingUp, Zap, Shield, Package
} from 'lucide-react';
import type { VenueNotification, VenueNotificationType, NotificationPriority } from '../types/venue-types';
import { fetchVenueNotifications, markVenueNotificationRead } from '@/utils/api/venue-cabinet';

type Tab = 'notifications' | 'chat' | 'tickets';
type NotificationFilter = 'all' | 'unread' | 'important';

export function NotificationsSection() {
  const [activeTab, setActiveTab] = useState<Tab>('notifications');
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock notifications as fallback
  const [notifications, setNotifications] = useState<VenueNotification[]>([
    {
      id: '1',
      venueId: 'venue1',
      notificationType: 'booking_request',
      priority: 'high',
      title: 'Новая заявка на букинг',
      message: 'DJ Max отправил заявку на 15 февраля 2026',
      actionUrl: '/venue/booking',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      venueId: 'venue1',
      notificationType: 'track_received',
      priority: 'normal',
      title: 'Новый трек от радио',
      message: 'PROMO.FM Radio добавила трек в вашу библиотеку',
      actionUrl: '/venue/music',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      venueId: 'venue1',
      notificationType: 'subscription_expiring',
      priority: 'urgent',
      title: 'Подписка заканчивается',
      message: 'Ваша подписка "Профессиональный" заканчивается через 7 дней',
      actionUrl: '/venue/subscription',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: '4',
      venueId: 'venue1',
      notificationType: 'content_approved',
      priority: 'normal',
      title: 'Контент одобрен',
      message: 'Ваш джингл "Приветствие" прошел модерацию',
      actionUrl: null,
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]);

  // Load notifications from API
  useEffect(() => {
    setLoading(true);
    fetchVenueNotifications().then((data) => {
      if (data && data.length > 0) {
        const mapped: VenueNotification[] = data.map((n) => ({
          id: n.id,
          venueId: 'venue1',
          notificationType: (n.type || 'system_announcement') as VenueNotificationType,
          priority: (n.priority || 'normal') as NotificationPriority,
          title: n.title,
          message: n.message,
          actionUrl: null,
          isRead: n.read,
          createdAt: n.createdAt,
        }));
        setNotifications(mapped);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    important: notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length,
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' 
      || (filter === 'unread' && !notification.isRead)
      || (filter === 'important' && (notification.priority === 'high' || notification.priority === 'urgent'));
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    markVenueNotificationRead(id).catch(console.error);
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    unreadIds.forEach(id => markVenueNotificationRead(id).catch(console.error));
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const getNotificationIcon = (type: VenueNotificationType) => {
    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
        return UserCheck;
      case 'track_received':
        return Music;
      case 'subscription_expiring':
      case 'subscription_renewed':
      case 'subscription_expired':
        return Star;
      case 'content_approved':
      case 'content_rejected':
        return FileText;
      case 'system_announcement':
      case 'platform_update':
        return Bell;
      default:
        return Bell;
    }
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4">
        <div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1 xs:mb-2">
            Уведомления и поддержка 🔔
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-slate-400">
            Будьте в курсе всех важных событий
          </p>
        </div>

        {activeTab === 'notifications' && stats.unread > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="w-full sm:w-auto px-3 xs:px-4 py-2 rounded-lg xs:rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs xs:text-sm"
          >
            Отметить все как прочитанные
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
        <motion.button
          onClick={() => setFilter('all')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-3 xs:p-4 rounded-lg xs:rounded-xl border transition-all ${
            filter === 'all'
              ? 'bg-indigo-500/20 border-indigo-500/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <Bell className="w-4 h-4 xs:w-5 xs:h-5 text-indigo-400 mb-1 xs:mb-2 mx-auto" />
          <p className="text-lg xs:text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-[10px] xs:text-xs text-slate-400 mt-0.5 xs:mt-1">Всего</p>
        </motion.button>

        <motion.button
          onClick={() => setFilter('unread')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-3 xs:p-4 rounded-lg xs:rounded-xl border transition-all ${
            filter === 'unread'
              ? 'bg-purple-500/20 border-purple-500/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <AlertCircle className="w-4 h-4 xs:w-5 xs:h-5 text-purple-400 mb-1 xs:mb-2 mx-auto" />
          <p className="text-lg xs:text-2xl font-bold text-white">{stats.unread}</p>
          <p className="text-[10px] xs:text-xs text-slate-400 mt-0.5 xs:mt-1">Новые</p>
        </motion.button>

        <motion.button
          onClick={() => setFilter('important')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-3 xs:p-4 rounded-lg xs:rounded-xl border transition-all ${
            filter === 'important'
              ? 'bg-amber-500/20 border-amber-500/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <Star className="w-4 h-4 xs:w-5 xs:h-5 text-amber-400 mb-1 xs:mb-2 mx-auto" />
          <p className="text-lg xs:text-2xl font-bold text-white">{stats.important}</p>
          <p className="text-[10px] xs:text-xs text-slate-400 mt-0.5 xs:mt-1">Важные</p>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton
          active={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
          icon={Bell}
          label="Уведомления"
          badge={stats.unread}
        />
        <TabButton
          active={activeTab === 'chat'}
          onClick={() => setActiveTab('chat')}
          icon={MessageCircle}
          label="Чат с администратором"
        />
        <TabButton
          active={activeTab === 'tickets'}
          onClick={() => setActiveTab('tickets')}
          icon={FileText}
          label="Тикеты поддержки"
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск уведомлений..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
              />
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Нет уведомлений</h3>
                <p className="text-slate-400">
                  {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'У вас пока нет уведомлений'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map(notification => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    formatTime={formatTime}
                    getIcon={getNotificationIcon}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <ChatSection />
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <TicketsSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

function TabButton({ active, onClick, icon: Icon, label, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

interface NotificationCardProps {
  notification: VenueNotification;
  onMarkAsRead: () => void;
  formatTime: (date: string) => string;
  getIcon: (type: VenueNotificationType) => React.ElementType;
}

function NotificationCard({ notification, onMarkAsRead, formatTime, getIcon }: NotificationCardProps) {
  const Icon = getIcon(notification.notificationType);
  
  const priorityColors = {
    low: 'text-slate-400',
    normal: 'text-blue-400',
    high: 'text-amber-400',
    urgent: 'text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        notification.isRead
          ? 'bg-white/5 border-white/10 hover:bg-white/10'
          : 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'
      }`}
      onClick={onMarkAsRead}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${notification.isRead ? 'bg-white/10' : 'bg-indigo-500/20'}`}>
          <Icon className={`w-5 h-5 ${priorityColors[notification.priority]}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-medium ${notification.isRead ? 'text-slate-300' : 'text-white'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {formatTime(notification.createdAt)}
            </span>
          </div>
          
          <p className={`text-sm line-clamp-2 ${notification.isRead ? 'text-slate-400' : 'text-slate-300'}`}>
            {notification.message}
          </p>

          {notification.actionUrl && !notification.isRead && (
            <button className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-all">
              Перейти →
            </button>
          )}
        </div>

        {!notification.isRead && (
          <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2"></div>
        )}
      </div>
    </motion.div>
  );
}

function ChatSection() {
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: '1',
      sender: 'admin',
      text: 'Здравствуйте! Чем могу помочь?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: '2',
      sender: 'venue',
      text: 'Добрый день! У меня вопрос по подписке',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ];

  return (
    <div className="h-[600px] flex flex-col rounded-xl bg-white/5 border border-white/10">
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'venue' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-xl ${
                msg.sender === 'venue'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
          />
          <button className="px-4 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketsSection() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-400">Ваши обращения в службу поддержки</p>
        <button className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all">
          Создать тикет
        </button>
      </div>

      <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Нет активных тикетов</h3>
        <p className="text-slate-400 mb-4">Создайте тикет, если у вас есть вопрос</p>
      </div>
    </div>
  );
}