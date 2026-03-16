/**
 * SUPPORT PAGE - Техподдержка для артиста
 * Адаптив: 320px → 4K
 * Connects to real tickets-system API on backend
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicApiKey } from '@/utils/auth/info';
import { authClient } from '@/utils/auth/client';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Plus, Search, Filter, Clock, CheckCircle2,
  X, Send, Paperclip, Image as ImageIcon, FileText, AlertCircle,
  HelpCircle, ThumbsUp, ThumbsDown, Star, Archive, Trash2,
  ChevronDown, Tag, Zap, Phone, Mail, MessageCircle, ExternalLink,
  Sparkles, RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/config/environment';

interface Ticket {
  id: string;
  subject: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  description: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
  attachments: Attachment[];
  rating?: number;
  tags: string[];
}

interface Message {
  id: string;
  sender_type: 'user' | 'support' | 'admin';
  sender_name: string;
  sender_avatar?: string;
  message: string;
  timestamp: string;
  attachments: Attachment[];
  is_internal?: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

type TicketStatus = 'open' | 'waiting_response' | 'in_progress' | 'resolved' | 'closed';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Category = 
  | 'technical' 
  | 'billing' 
  | 'moderation' 
  | 'feature_request' 
  | 'account' 
  | 'pitching'
  | 'other';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  helpful: number;
}

// ── API Helper ──
const TICKETS_BASE = `${config.functionsUrl}/tickets-system`;

async function ticketsApiCall(path: string, options?: RequestInit) {
  const { data: { session } } = await authClient.auth.getSession();
  const res = await fetch(`${TICKETS_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${session?.access_token || publicApiKey}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  return res.json();
}

export function SupportPage({ onRestartTour }: { onRestartTour?: () => void }) {
  const { user } = useAuth();
  const userId = user?.id || '';

  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'create'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FAQ данные
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'Как загрузить трек?',
      answer: 'Перейдите в раздел "Треки" → "Загрузить трек". Выберите файл в формате MP3, WAV или FLAC (до 100 МБ). Заполните метаданные: название, жанр, описание. Нажмите "Опубликовать".',
      category: 'Треки',
      views: 1245,
      helpful: 892
    },
    {
      id: '2',
      question: 'Почему мой трек отклонен модерацией?',
      answer: 'Причины могут быть: низкое качество звука, нарушение авторских прав, несоответствие жанру, отсутствие метаданных. Проверьте уведомления для деталей.',
      category: 'Модерация',
      views: 987,
      helpful: 654
    },
    {
      id: '3',
      question: 'Как работает питчинг?',
      answer: 'Питчинг - это отправка вашего трека партнерам (радио, плейлисты, блогеры). Создайте кампанию → Выберите партнеров → Укажите бюджет → Отправьте. Партнеры рассмотрят и дадут feedback.',
      category: 'Питчинг',
      views: 2341,
      helpful: 1876
    },
    {
      id: '4',
      question: 'Как изменить тариф подписки?',
      answer: 'Откройте "Настройки" → "Подписка" → "Изменить тариф". Выберите новый план и подтвердите. Изменения вступят в силу немедленно.',
      category: 'Подписка',
      views: 543,
      helpful: 421
    },
    {
      id: '5',
      question: 'Почему не списались деньги?',
      answer: 'Проверьте баланс, статус карты, лимиты. Попробуйте другую карту или метод оплаты. Если проблема сохраняется - напишите в поддержку.',
      category: 'Оплата',
      views: 765,
      helpful: 543
    }
  ]);

  // Load real tickets from API
  const loadTickets = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await ticketsApiCall(`/user/${userId}`);
      if (data.success && data.data) {
        // Normalize messages field (backend stores as data.messages)
        const normalized = data.data.map((t: any) => ({
          ...t,
          messages: (t.messages || []).map((m: any) => ({
            id: m.id,
            sender_type: m.sender_type || 'user',
            sender_name: m.sender_type === 'user' ? 'Вы' : (m.sender_name || 'Поддержка'),
            sender_avatar: m.sender_avatar,
            message: m.message,
            timestamp: m.created_at || m.timestamp,
            attachments: m.attachments || [],
            is_internal: m.internal_note,
          })),
          attachments: t.attachments || [],
          tags: t.tags || [],
        }));
        setTickets(normalized);
      }
    } catch (err) {
      console.error('[Support] Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      sender_type: 'user',
      sender_name: 'Вы',
      message: replyMessage,
      timestamp: new Date().toISOString(),
      attachments: []
    };

    // Optimistic update
    setTickets(tickets.map(t =>
      t.id === selectedTicket.id
        ? {
            ...t,
            messages: [...t.messages, newMessage],
            status: 'waiting_response' as const,
            updated_at: new Date().toISOString()
          }
        : t
    ));

    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage],
      status: 'waiting_response',
      updated_at: new Date().toISOString()
    });

    setReplyMessage('');
    setAttachments([]);

    // Send to real API
    try {
      const res = await ticketsApiCall(`/${selectedTicket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          sender_id: userId,
          sender_type: 'user',
          message: replyMessage,
          attachments: [],
        }),
      });
      if (res.success) {
        toast.success('Сообщение отправлено');
        // Also update status on server
        await ticketsApiCall(`/${selectedTicket.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'waiting_response' }),
        });
      } else {
        toast.error(res.error || 'Ошибка отправки');
      }
    } catch (err) {
      console.error('[Support] Send reply error:', err);
      toast.error('Ошибка отправки сообщения');
    }
  };

  const handleRateTicket = async (ticketId: string, rating: number) => {
    setTickets(tickets.map(t =>
      t.id === ticketId ? { ...t, rating } : t
    ));

    // Send rating to real API
    try {
      const res = await ticketsApiCall(`/${ticketId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating }),
      });
      if (res.success) {
        toast.success('Спасибо за оценку!');
      }
    } catch (err) {
      console.error('[Support] Rate error:', err);
      toast.success('Спасибо за оценку!');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: TicketStatus) => {
    const colors = {
      open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      waiting_response: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status];
  };

  const getStatusText = (status: TicketStatus) => {
    const texts = {
      open: 'Открыт',
      waiting_response: 'Ожидает ответа',
      in_progress: 'В работе',
      resolved: 'Решен',
      closed: 'Закрыт'
    };
    return texts[status];
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[priority];
  };

  const getCategoryIcon = (category: Category) => {
    const icons = {
      technical: AlertCircle,
      billing: FileText,
      moderation: CheckCircle2,
      feature_request: Zap,
      account: HelpCircle,
      pitching: MessageSquare,
      other: HelpCircle
    };
    return icons[category] || HelpCircle;
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-6 mb-4 sm:mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex-shrink-0">
              <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-pink-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">Техподдержка</h1>
              <p className="text-xs sm:text-sm text-gray-400">Мы всегда на связи 24/7</p>
            </div>
          </div>

          {/* Contact methods */}
          <div className="flex gap-2 self-start lg:self-auto flex-shrink-0">
            <a
              href="mailto:support@promo-music.ru"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all text-sm"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Email</span>
            </a>
            <a
              href="tel:+78005553535"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all text-sm"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Звонок</span>
            </a>
            <a
              href="https://t.me/promomusic_support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white transition-all text-sm hover:shadow-lg hover:shadow-blue-500/30"
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Telegram</span>
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {[
            { id: 'tickets', label: 'Мои обращения', icon: MessageSquare },
            { id: 'faq', label: 'База знаний', icon: HelpCircle },
            { id: 'create', label: 'Создать тикет', icon: Plus }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Restart Tour Card */}
      {onRestartTour && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-5 mb-4 sm:mb-6"
        >
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Обзор платформы</h3>
                <p className="text-xs text-slate-400">Пройдите интерактивный тур по всем разделам кабинета</p>
              </div>
            </div>
            <button
              onClick={onRestartTour}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 text-purple-200 hover:text-white text-sm font-medium transition-all group"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-[-180deg] transition-transform duration-500" />
              Пройти тур
              <kbd className="hidden lg:inline-flex px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-slate-500 font-mono ml-1">?</kbd>
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Мои обращения */}
        {activeTab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по тикетам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all text-sm sm:text-base"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {[
                    { value: 'all', label: 'Все' },
                    { value: 'open', label: 'Открытые' },
                    { value: 'in_progress', label: 'В работе' },
                    { value: 'resolved', label: 'Решенные' }
                  ].map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value as any)}
                      className={`px-3 sm:px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
                        statusFilter === filter.value
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 sm:p-12 text-center">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Нет тикетов</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4">Создайте первое обращение, если нужна помощь</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                >
                  Создать тикет
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {filteredTickets.map((ticket, index) => {
                  const CategoryIcon = getCategoryIcon(ticket.category);
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedTicket(ticket)}
                      className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 hover:border-pink-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex-shrink-0">
                          <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate">{ticket.subject}</h3>
                              <p className="text-xs sm:text-sm text-gray-400 line-clamp-1">{ticket.description}</p>
                            </div>
                            <span className="text-xs font-mono text-gray-500 flex-shrink-0">{ticket.id}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                            <span className={`px-2 sm:px-3 py-1 rounded-full font-medium border ${getStatusColor(ticket.status)}`}>
                              {getStatusText(ticket.status)}
                            </span>
                            <span className={`px-2 sm:px-3 py-1 rounded-full font-medium border ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority === 'urgent' ? 'Срочно' :
                               ticket.priority === 'high' ? 'Высокий' :
                               ticket.priority === 'medium' ? 'Средний' : 'Низкий'}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                              {ticket.messages.length}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              {new Date(ticket.updated_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* База знаний (FAQ) */}
        {activeTab === 'faq' && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Часто задаваемые вопросы</h2>
              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <motion.details
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4 group"
                  >
                    <summary className="cursor-pointer text-white font-semibold flex items-start justify-between gap-4 text-sm sm:text-base">
                      <span className="flex-1">{item.question}</span>
                      <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                    </summary>
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                      <p className="text-sm sm:text-base text-gray-300">{item.answer}</p>
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="px-2 py-1 rounded-lg bg-white/5">{item.category}</span>
                          <span>{item.views} просмотров</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Полезно?</span>
                          <button className="p-1.5 rounded-lg bg-white/5 hover:bg-green-500/20 hover:text-green-400 transition-all">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all">
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.details>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Создание тикета */}
        {activeTab === 'create' && (
          <CreateTicketForm onSuccess={() => { loadTickets(); setActiveTab('tickets'); }} />
        )}
      </AnimatePresence>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <TicketDetailsModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onSendReply={handleSendReply}
            onRate={handleRateTicket}
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
            attachments={attachments}
            setAttachments={setAttachments}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
            removeAttachment={removeAttachment}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Компонент создания тикета
function CreateTicketForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [priority, setPriority] = useState<Priority>('medium');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ticketsApiCall('/create', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id || 'anonymous',
          subject: subject.trim(),
          description: description.trim(),
          category,
          priority,
          attachments: [],
        }),
      });

      if (res.success) {
        toast.success('Тикет создан! Мы ответим в течение 24 часов.');
        onSuccess();
      } else {
        toast.error(res.error || 'Ошибка создания тикета');
      }
    } catch (err) {
      console.error('[Support] Create ticket error:', err);
      toast.error('Ошибка создания тикета');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-6"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Создать обращение</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Тема */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Тема обращения *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Кратко опишите проблему"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all"
            maxLength={100}
          />
        </div>

        {/* Категория и приоритет */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Категория *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 transition-all"
            >
              <option value="technical">Техническая проблема</option>
              <option value="billing">Оплата и подписка</option>
              <option value="moderation">Модерация</option>
              <option value="pitching">Питчинг</option>
              <option value="account">Аккаунт</option>
              <option value="feature_request">Запрос функции</option>
              <option value="other">Другое</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Приоритет</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 transition-all"
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
              <option value="urgent">Срочный</option>
            </select>
          </div>
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Подробное описание *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите проблему максимально подробно..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all resize-none"
            rows={6}
            maxLength={1000}
          />
          <div className="text-xs text-gray-400 mt-1 text-right">
            {description.length}/1000
          </div>
        </div>

        {/* Вложения */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Прикрепить файлы
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setAttachments(prev => [...prev, ...files]);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-pink-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Paperclip className="w-5 h-5" />
            <span>Выбрать файлы (скриншоты, логи)</span>
          </button>
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-sm text-gray-300 truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 transition-all ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50"
          >
            {submitting ? 'Отправка...' : 'Отправить обращение'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// Компонент модалки деталей тикета
function TicketDetailsModal({
  ticket,
  onClose,
  onSendReply,
  onRate,
  replyMessage,
  setReplyMessage,
  attachments,
  setAttachments,
  fileInputRef,
  handleFileSelect,
  removeAttachment
}: any) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.messages]);

  return (
    <div className="contents">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-full max-w-4xl z-50 max-h-[90vh] overflow-hidden"
      >
        <div className="backdrop-blur-xl bg-[#0a0a14]/95 rounded-2xl border border-white/20 flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg sm:text-2xl font-bold text-white truncate">{ticket.subject}</h2>
                  <span className="text-xs font-mono text-gray-500 flex-shrink-0">{ticket.id}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                    {getStatusText(ticket.status)}
                  </span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority === 'urgent' ? 'Срочно' :
                     ticket.priority === 'high' ? 'Высокий' :
                     ticket.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {ticket.messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender_type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender_type === 'user'
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}>
                  {message.sender_type === 'user' ? '👤' : '💬'}
                </div>
                <div className={`flex-1 ${message.sender_type === 'user' ? 'items-end' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${message.sender_type === 'user' ? 'justify-end' : ''}`}>
                    <span className="text-white font-semibold text-xs sm:text-sm">{message.sender_name}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(message.timestamp).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl max-w-full sm:max-w-2xl ${
                    message.sender_type === 'user'
                      ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    <p className="text-sm sm:text-base text-gray-200 break-words">{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Form */}
          {ticket.status !== 'closed' && (
            <div className="p-4 sm:p-6 border-t border-white/10 space-y-3">
              {/* Rating для resolved тикетов */}
              {ticket.status === 'resolved' && !ticket.rating && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-green-400 mb-3">Оцените качество поддержки:</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => onRate(ticket.id, rating)}
                        className="p-2 rounded-lg hover:bg-green-500/20 transition-all"
                      >
                        <Star className="w-6 h-6 text-yellow-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 sm:gap-3">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Введите ответ..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all resize-none text-sm sm:text-base"
                  rows={3}
                />
              </div>
              <div className="flex justify-between items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 sm:p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={onSendReply}
                  disabled={!replyMessage.trim()}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Отправить</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Helper functions (вынесены из компонента)
function getStatusColor(status: TicketStatus) {
  const colors = {
    open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    waiting_response: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };
  return colors[status];
}

function getStatusText(status: TicketStatus) {
  const texts = {
    open: 'Открыт',
    waiting_response: 'Ожидает ответа',
    in_progress: 'В работе',
    resolved: 'Решен',
    closed: 'Закрыт'
  };
  return texts[status];
}

function getPriorityColor(priority: Priority) {
  const colors = {
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30'
  };
  return colors[priority];
}