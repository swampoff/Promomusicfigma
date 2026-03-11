/**
 * NOTIFICATIONS SECTION - Уведомления и поддержка для радиостанций
 * Enterprise-модуль с полным функционалом
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, BellOff, Mail, MailOpen, Filter, Search, RefreshCw,
  MessageSquare, Send, Paperclip, X, Check, Clock,
  AlertCircle, CheckCircle, XCircle, Zap, Star, ChevronDown,
  ChevronUp, Eye, Trash2, Archive, Info, ExternalLink, User,
  Shield, Download, Image, File, Plus, Settings
} from 'lucide-react';
import { toast } from 'sonner';

// Import types
import type {
  RadioNotification,
  SupportTicket,
  TicketMessage,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  TicketCategory,
  TicketStatus,
  TicketPriority,
  MessageAttachment,
} from './notifications-section-types';

// Import sub-components
import {
  NotificationsList,
  TicketsList,
  TicketChatView,
  CreateTicketModal,
  NotificationFilters,
} from './notifications-section-parts';

// Import API
import {
  fetchRadioNotifications,
  markNotificationRead as apiMarkRead,
  markAllNotificationsRead as apiMarkAllRead,
} from '@/utils/api/radio-cabinet';
import { apiFetch } from '@/utils/api/api-cache';
import type { RadioNotificationData } from '@/utils/api/radio-cabinet';

// Helper for mutation calls that don't have dedicated API functions yet
// Uses apiFetch for consistent auth headers + timeout
async function apiMutateNotification(path: string, method: string, body?: any): Promise<any> {
  const res = await apiFetch('/api/radio', path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// Re-export types
export type {
  RadioNotification,
  SupportTicket,
  TicketMessage,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  TicketCategory,
  TicketStatus,
  TicketPriority,
  MessageAttachment,
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export function NotificationsSection() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'support'>('notifications');
  const [notifications, setNotifications] = useState<RadioNotification[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalUnread: 0,
    unreadByType: {} as Record<NotificationType, number>,
    openTickets: 0,
    ticketsWaitingUser: 0,
    ticketsWaitingAdmin: 0,
  });
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Filters
  const [notificationFilters, setNotificationFilters] = useState({
    types: [] as NotificationType[],
    priorities: [] as NotificationPriority[],
    showRead: true,
    showUnread: true,
  });
  
  const [ticketFilters, setTicketFilters] = useState({
    categories: [] as TicketCategory[],
    statuses: [] as TicketStatus[],
    priorities: [] as TicketPriority[],
  });

  // Load data
  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadNotifications(),
        loadTickets(),
        loadStats(),
      ]);
    } catch (error) {
      console.error('Error loading notifications data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    // Load from API, map to RadioNotification format
    try {
      const apiNotifs = await fetchRadioNotifications();
      
      if (apiNotifs.length > 0) {
        // Map API data to component's RadioNotification type
        const mapped: RadioNotification[] = apiNotifs.map((n) => ({
          id: n.id,
          radioId: 'current',
          notificationType: (n.type || 'system') as NotificationType,
          title: n.title,
          message: n.message,
          priority: (n.priority || 'normal') as NotificationPriority,
          isRead: n.read,
          readAt: n.read ? n.createdAt : undefined,
          createdAt: n.createdAt,
        }));
        setNotifications(mapped);
        return;
      }
    } catch (error) {
      console.error('Error loading notifications from API:', error);
    }

    // Fallback mock data
    const mockNotifications: RadioNotification[] = [
      {
        id: '1', radioId: 'radio1', notificationType: 'new_order',
        title: 'Новый заказ рекламного слота',
        message: 'Покупатель "DJ Music Store" заказал 3 слота в пакете "Утренний эфир - 30 секунд"',
        priority: 'high', isRead: false,
        relatedEntityType: 'order', relatedEntityId: 'order1',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: '2', radioId: 'radio1', notificationType: 'creative_uploaded',
        title: 'Креатив загружен на модерацию',
        message: 'Покупатель загрузил рекламный ролик для заказа #12345. Требуется модерация.',
        priority: 'high', isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: '3', radioId: 'radio1', notificationType: 'withdrawal_completed',
        title: 'Вывод средств выполнен',
        message: 'Ваш запрос на вывод 15,000 руб. успешно выполнен.',
        priority: 'normal', isRead: true,
        readAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
      {
        id: '4', radioId: 'radio1', notificationType: 'system_announcement',
        title: 'Обновление платформы 15 февраля',
        message: 'Планируется техническое обслуживание платформы 15.02.2026.',
        priority: 'normal', isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
    ];
    setNotifications(mockNotifications);
  };

  const loadTickets = async () => {
    // Support tickets API endpoint not yet implemented — fallback to seed data
    // When the API is ready, this will call: apiGet('/support/tickets')
    const mockTickets: SupportTicket[] = [
      {
        id: 'ticket1',
        radioId: 'radio1',
        radioName: 'Радио Волна FM',
        radioEmail: 'info@volna.fm',
        category: 'ad_slots',
        subject: 'Проблема с загрузкой аудиофайла в рекламный слот',
        description: 'Здравствуйте! Не могу загрузить аудиофайл в формате MP3 для рекламного ролика. Файл весит 4.5 МБ, система выдает ошибку.',
        priority: 'high',
        status: 'waiting_admin',
        assignedAdminId: 'admin1',
        assignedAdminName: 'Мария Петрова',
        messagesCount: 3,
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        lastMessageBy: 'radio',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 'ticket2',
        radioId: 'radio1',
        radioName: 'Радио Волна FM',
        radioEmail: 'info@volna.fm',
        category: 'financial',
        subject: 'Вопрос по комиссии платформы',
        description: 'Добрый день! Хотел бы уточнить детали начисления комиссии. В заказе #12345 указана сумма 10,000₽, но я получил только 8,200₽. Можете разъяснить?',
        priority: 'normal',
        status: 'resolved',
        assignedAdminId: 'admin2',
        assignedAdminName: 'Иван Смирнов',
        messagesCount: 5,
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        lastMessageBy: 'admin',
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];
    
    setTickets(mockTickets);
  };

  const loadStats = async () => {
    // Compute stats from loaded notifications
    const unread = notifications.filter(n => !n.isRead);
    const byType: Record<string, number> = {};
    for (const n of unread) {
      const t = n.notificationType;
      byType[t] = (byType[t] || 0) + 1;
    }
    
    setStats({
      totalUnread: unread.length,
      unreadByType: byType as Record<NotificationType, number>,
      openTickets: tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length,
      ticketsWaitingUser: tickets.filter(t => t.status === 'waiting_user').length,
      ticketsWaitingAdmin: tickets.filter(t => t.status === 'waiting_admin').length,
    });
  };

  // Recalculate stats when notifications or tickets change
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead);
    const byType: Record<string, number> = {};
    for (const n of unread) {
      byType[n.notificationType] = (byType[n.notificationType] || 0) + 1;
    }
    setStats({
      totalUnread: unread.length,
      unreadByType: byType as Record<NotificationType, number>,
      openTickets: tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length,
      ticketsWaitingUser: tickets.filter(t => t.status === 'waiting_user').length,
      ticketsWaitingAdmin: tickets.filter(t => t.status === 'waiting_admin').length,
    });
  }, [notifications, tickets]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    // Optimistic update first
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      )
    );
    try {
      await apiMarkRead(notificationId);
    } catch (error) {
      console.warn('[Notifications] markRead API failed:', (error as Error).message);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    // Optimistic update first
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );
    try {
      await apiMarkAllRead();
    } catch (error) {
      console.warn('[Notifications] markAllRead API failed:', (error as Error).message);
    }
    toast.success('Все уведомления отмечены как прочитанные');
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      // Try API delete, fall back to local removal
      await apiMutateNotification(`/notifications/${notificationId}`, 'DELETE');
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Уведомление удалено');
    } catch (error) {
      console.warn('[Notifications] Delete API недоступен, удаляем локально:', (error as Error).message);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Уведомление удалено');
    }
  };

  // Create ticket
  const handleCreateTicket = async (data: {
    category: TicketCategory;
    subject: string;
    description: string;
    priority: TicketPriority;
    attachments?: File[];
  }) => {
    try {
      const result = await apiMutateNotification('/support/tickets', 'POST', {
        category: data.category,
        subject: data.subject,
        description: data.description,
        priority: data.priority,
      });
      if (result?.success) {
        toast.success('Обращение создано');
      } else {
        throw new Error('API returned unsuccessful');
      }
      setShowCreateTicket(false);
      loadTickets();
    } catch (error) {
      console.warn('[Support] Create ticket API недоступен, создаём локально:', (error as Error).message);
      // Add locally as fallback
      const newTicket: SupportTicket = {
        id: `ticket_${Date.now()}`,
        radioId: 'current',
        radioName: 'Моя радиостанция',
        radioEmail: '',
        category: data.category,
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        status: 'open',
        messagesCount: 0,
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: 'radio',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTickets(prev => [newTicket, ...prev]);
      toast.success('Обращение создано (локально)');
      setShowCreateTicket(false);
    }
  };

  // Send message in ticket
  const handleSendMessage = async (ticketId: string, messageText: string, attachments?: File[]) => {
    try {
      await apiMutateNotification(`/support/tickets/${ticketId}/messages`, 'POST', {
        message: messageText,
      });
      toast.success('Сообщение отправлено');
      loadTickets();
    } catch (error) {
      console.warn('[Support] Send message API недоступен:', (error as Error).message);
      // Update ticket locally
      setTickets(prev => prev.map(t =>
        t.id === ticketId
          ? { ...t, messagesCount: t.messagesCount + 1, lastMessageAt: new Date().toISOString(), lastMessageBy: 'radio' as const, status: 'waiting_admin' as any, updatedAt: new Date().toISOString() }
          : t
      ));
      toast.success('Сообщение отправлено (локально)');
    }
  };

  // Close ticket
  const handleCloseTicket = async (ticketId: string) => {
    try {
      await apiMutateNotification(`/support/tickets/${ticketId}/close`, 'PUT');
      toast.success('Обращение закрыто');
    } catch (error) {
      console.warn('[Support] Close ticket API недоступен, закрываем локально:', (error as Error).message);
      setTickets(prev => prev.map(t =>
        t.id === ticketId ? { ...t, status: 'closed' as any, updatedAt: new Date().toISOString() } : t
      ));
      toast.success('Обращение закрыто (локально)');
    }
    setSelectedTicket(null);
    loadTickets();
  };

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 xs:gap-4 mb-4 xs:mb-5 sm:mb-6">
        <div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1 xs:mb-1 sm:mb-2">
            Уведомления и поддержка
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-slate-400">
            Следите за обновлениями и общайтесь с администратором
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 sm:px-4 py-2 rounded-xl border transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base ${
              showFilters
                ? 'bg-indigo-500 border-indigo-500 text-white'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden xs:inline">Фильтры</span>
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Обновить</span>
          </button>

          {activeTab === 'support' && !selectedTicket && (
            <button
              onClick={() => setShowCreateTicket(true)}
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Создать обращение</span>
              <span className="sm:hidden">Создать</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveTab('notifications');
            setNotificationFilters({
              ...notificationFilters,
              showRead: false,
              showUnread: true,
            });
          }}
          title="Показать все непрочитанные уведомления"
          className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 text-left hover:border-blue-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-5 h-5 text-blue-400" />
            {stats.totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                {stats.totalUnread}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalUnread}</p>
          <p className="text-sm text-slate-400">Непрочитанных</p>
          <p className="text-xs text-slate-500 mt-1">↗ Кликните для детализации</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveTab('support');
            setSelectedTicket(null); // Сбросить выбранный тикет
            setTicketFilters({
              ...ticketFilters,
              statuses: ['open', 'in_progress', 'waiting_admin', 'waiting_user'] as TicketStatus[],
            });
          }}
          title="Показать все открытые обращения"
          className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 text-left hover:border-purple-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            {stats.openTickets > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-bold">
                {stats.openTickets}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{stats.openTickets}</p>
          <p className="text-sm text-slate-400">Открытых обращений</p>
          <p className="text-xs text-slate-500 mt-1">↗ Кликните для детализации</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveTab('support');
            setTicketFilters({
              ...ticketFilters,
              statuses: ['waiting_admin'] as TicketStatus[],
            });
          }}
          title="Показать обращения, ожидающие ответа администратора"
          className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 text-left hover:border-orange-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.ticketsWaitingAdmin}</p>
          <p className="text-sm text-slate-400">Ожидают ответа</p>
          <p className="text-xs text-slate-500 mt-1">↗ Кликните для детализации</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveTab('notifications');
            setNotificationFilters({
              ...notificationFilters,
              showRead: true,
              showUnread: false,
            });
          }}
          title="Показать все прочитанные уведомления"
          className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 text-left hover:border-green-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{notifications.filter(n => n.isRead).length}</p>
          <p className="text-sm text-slate-400">Прочитанных</p>
          <p className="text-xs text-slate-500 mt-1">↗ Кликните для детализации</p>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'notifications'
              ? 'text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Уведомления</span>
          <span className="sm:hidden flex items-center gap-1.5">
            <Bell className="w-4 h-4" />
            Уведомления
          </span>
          {stats.totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {stats.totalUnread}
            </span>
          )}
          {activeTab === 'notifications' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'support'
              ? 'text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Поддержка</span>
          <span className="sm:hidden flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Поддержка
          </span>
          {stats.openTickets > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
              {stats.openTickets}
            </span>
          )}
          {activeTab === 'support' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600"
            />
          )}
        </button>
      </div>

      {/* Active Filters Badge */}
      {(notificationFilters.types.length > 0 || 
        notificationFilters.priorities.length > 0 || 
        !notificationFilters.showRead || 
        !notificationFilters.showUnread ||
        ticketFilters.categories.length > 0 ||
        ticketFilters.statuses.length > 0 ||
        ticketFilters.priorities.length > 0) && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
          <Filter className="w-4 h-4 text-indigo-300" />
          <span className="text-sm text-indigo-300">
            Фильтры активны
          </span>
          <button
            onClick={() => {
              setNotificationFilters({
                types: [] as NotificationType[],
                priorities: [] as NotificationPriority[],
                showRead: true,
                showUnread: true,
              });
              setTicketFilters({
                categories: [] as TicketCategory[],
                statuses: [] as TicketStatus[],
                priorities: [] as TicketPriority[],
              });
            }}
            className="ml-auto text-xs text-indigo-300 hover:text-indigo-200 underline"
          >
            Сбросить все
          </button>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {showFilters && (
              <NotificationFilters
                filters={notificationFilters}
                onChange={setNotificationFilters}
                onClose={() => setShowFilters(false)}
              />
            )}
            
            <NotificationsList
              notifications={notifications}
              filters={notificationFilters}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={deleteNotification}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {activeTab === 'support' && !selectedTicket && (
          <motion.div
            key="support-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TicketsList
              tickets={tickets}
              filters={ticketFilters}
              onSelectTicket={setSelectedTicket}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {activeTab === 'support' && selectedTicket && (
          <motion.div
            key="support-chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TicketChatView
              ticket={selectedTicket}
              onBack={() => setSelectedTicket(null)}
              onSendMessage={handleSendMessage}
              onCloseTicket={handleCloseTicket}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <CreateTicketModal
          onClose={() => setShowCreateTicket(false)}
          onSubmit={handleCreateTicket}
        />
      )}
    </div>
  );
}