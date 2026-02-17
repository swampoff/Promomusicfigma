/**
 * ARTIST NOTIFICATION CENTER - Unified drawer with Notifications + Messages
 *
 * Desktop adaptive:
 * - Notifications tab: 440px drawer
 * - Messages tab: 740px drawer with split view (conversation list + chat side-by-side)
 *
 * Mobile:
 * - Full-screen overlay, single-column with slide transitions
 *
 * Features:
 * - Bell icon with combined badge (notifications + unread messages)
 * - SSE real-time updates
 * - Inline compact chat within the drawer
 * - Escape key navigation (chat → list → close)
 * - Portal rendering to escape transformed parent containers (backdrop-blur, transform)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, CheckCircle, XCircle, AlertCircle, Eye,
  ArrowRight, X, RotateCcw, Upload, CreditCard, Loader2,
  Volume2, VolumeX, History, Wifi, WifiOff, Handshake,
  Shield, MessageSquare, Coins, Zap, RefreshCw,
  Send, ArrowLeft, Search,
  Paperclip, Smile,
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
import { useMessages } from '@/utils/contexts/MessagesContext';

// ── Helpers ──────────────────────────────────────────────

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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

// ── Demo data ────────────────────────────────────────────

interface DemoConversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  source: 'direct' | 'collab' | 'support';
}

interface DemoMessage {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

const DEMO_CONVERSATIONS: DemoConversation[] = [
  { id: 'c1', name: 'Дмитрий Козлов', avatar: 'ДК', lastMessage: 'За новый альбом! Спасибо за эмоции', time: '10 мин', unread: 2, online: true, source: 'direct' },
  { id: 'c2', name: 'Максам', avatar: 'М', lastMessage: 'Давай обсудим бит подробнее', time: '2 ч', unread: 1, online: true, source: 'collab' },
  { id: 'c3', name: 'Мария Сидорова', avatar: 'МС', lastMessage: 'Ждём новых треков! Вы лучшие!', time: '1 ч', unread: 0, online: true, source: 'direct' },
  { id: 'c4', name: 'Иван Петров', avatar: 'ИП', lastMessage: 'Отличная музыка! Продолжайте!', time: '3 ч', unread: 1, online: false, source: 'direct' },
  { id: 'c5', name: 'Дэн', avatar: 'Д', lastMessage: 'Мастеринг готов, проверяй', time: '1 д', unread: 0, online: false, source: 'collab' },
  { id: 'c6', name: 'Алиса', avatar: 'А', lastMessage: 'Аранжировка почти готова!', time: '2 д', unread: 0, online: false, source: 'collab' },
  { id: 'c7', name: 'Поддержка ПРОМО.МУЗЫКА', avatar: '?', lastMessage: 'Рады помочь! Обращайтесь.', time: '5 д', unread: 0, online: true, source: 'support' },
];

const DEMO_MESSAGES: Record<string, DemoMessage[]> = {
  c1: [
    { id: 1, text: 'Привет! Очень нравится твоя музыка', sender: 'other', time: '14:30' },
    { id: 2, text: 'Спасибо большое!', sender: 'me', time: '14:32' },
    { id: 3, text: 'Когда планируешь новый релиз?', sender: 'other', time: '14:33' },
    { id: 4, text: 'Сейчас работаю над новым EP, выйдет скоро!', sender: 'me', time: '14:35' },
    { id: 5, text: 'За новый альбом! Спасибо за эмоции', sender: 'other', time: '15:10' },
  ],
  c2: [
    { id: 1, text: 'Привет! Слышал твои треки, хочу предложить бит', sender: 'other', time: '10:15' },
    { id: 2, text: 'Интересно! Скинь превью?', sender: 'me', time: '10:30' },
    { id: 3, text: 'Давай обсудим бит подробнее', sender: 'other', time: '14:20' },
  ],
  c3: [
    { id: 1, text: 'Привет! Когда следующий концерт?', sender: 'other', time: '12:20' },
    { id: 2, text: 'Планирую выступление в следующем месяце', sender: 'me', time: '12:25' },
    { id: 3, text: 'Ждём новых треков! Вы лучшие!', sender: 'other', time: '12:27' },
  ],
  c4: [
    { id: 1, text: 'Отличный трек!', sender: 'other', time: '09:15' },
    { id: 2, text: 'Спасибо! Давайте обсудим', sender: 'me', time: '09:20' },
    { id: 3, text: 'Отличная музыка! Продолжайте!', sender: 'other', time: '09:25' },
  ],
  c5: [
    { id: 1, text: 'Закончил мастеринг твоих треков', sender: 'other', time: '10:00' },
    { id: 2, text: 'Супер, как быстро!', sender: 'me', time: '10:15' },
    { id: 3, text: 'Мастеринг готов, проверяй', sender: 'other', time: '10:30' },
  ],
  c6: [
    { id: 1, text: 'Начала работу над аранжировкой', sender: 'other', time: '11:00' },
    { id: 2, text: 'Отлично! Жду с нетерпением', sender: 'me', time: '11:10' },
    { id: 3, text: 'Аранжировка почти готова!', sender: 'other', time: '15:00' },
  ],
  c7: [
    { id: 1, text: 'Добро пожаловать в ПРОМО.МУЗЫКА!', sender: 'other', time: '09:00' },
    { id: 2, text: 'Спасибо! Пока всё понятно', sender: 'me', time: '09:05' },
    { id: 3, text: 'Рады помочь! Обращайтесь.', sender: 'other', time: '09:10' },
  ],
};

function getSourceBadge(source: string) {
  switch (source) {
    case 'collab':  return { label: 'Коллаб', color: 'text-amber-400 bg-amber-500/15 border-amber-500/20' };
    case 'support': return { label: 'Поддержка', color: 'text-blue-400 bg-blue-500/15 border-blue-500/20' };
    default:        return null;
  }
}

// ── Sub-components ───────────────────────────────────────

/* Conversation list item */
function ConversationItem({
  conv,
  isSelected,
  onClick,
}: {
  conv: DemoConversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const badge = getSourceBadge(conv.source);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 transition-all border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] ${
        isSelected ? 'bg-white/[0.06] border-l-2 border-l-cyan-500' : ''
      } ${conv.unread > 0 ? 'bg-white/[0.02]' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${
            conv.source === 'collab'
              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : conv.source === 'support'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
              : 'bg-gradient-to-br from-cyan-500 to-blue-600'
          }`}>
            {conv.avatar}
          </div>
          {conv.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0a14]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>
                {conv.name}
              </span>
              {badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold border flex-shrink-0 ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-600 flex-shrink-0">{conv.time}</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className={`text-xs truncate ${conv.unread > 0 ? 'text-slate-300' : 'text-slate-500'}`}>
              {conv.lastMessage}
            </p>
            {conv.unread > 0 && (
              <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-cyan-500 text-white text-[9px] font-bold px-1 flex-shrink-0">
                {conv.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* Chat area (reused in both mobile and desktop) */
function ChatArea({
  conversation,
  messages,
  chatInput,
  setChatInput,
  onSend,
  onBack,
  showBackButton,
  chatEndRef,
  inputRef,
}: {
  conversation: DemoConversation;
  messages: DemoMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  onSend: () => void;
  onBack?: () => void;
  showBackButton: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const sourceBadge = getSourceBadge(conversation.source);
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="relative flex-shrink-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
            conversation.source === 'collab'
              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : conversation.source === 'support'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
              : 'bg-gradient-to-br from-cyan-500 to-blue-600'
          }`}>
            {conversation.avatar}
          </div>
          {conversation.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0a14]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{conversation.name}</p>
          <p className="text-[10px] text-slate-500">
            {conversation.online ? 'В сети' : 'Не в сети'}
          </p>
        </div>
        {sourceBadge && (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${sourceBadge.color}`}>
            {sourceBadge.label}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-600">Начните общение</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] lg:max-w-[75%] px-3.5 py-2.5 rounded-2xl ${
                msg.sender === 'me'
                  ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white rounded-br-md'
                  : 'bg-white/[0.07] text-slate-200 border border-white/[0.06] rounded-bl-md'
              }`}>
                <p className="text-[13px] leading-relaxed">{msg.text}</p>
                <p className={`text-[9px] mt-1 ${msg.sender === 'me' ? 'text-white/50 text-right' : 'text-slate-600'}`}>
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] focus-within:border-purple-500/40 transition-colors">
            <input
              ref={inputRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
              placeholder="Написать сообщение..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none min-w-0"
            />
            <button className="p-0.5 text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
              <Smile className="w-4 h-4" />
            </button>
            <button className="p-0.5 text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSend}
            disabled={!chatInput.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-purple-500/20 flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* Empty chat placeholder (desktop split) */
function EmptyChatPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-slate-700" />
      </div>
      <p className="text-sm text-slate-400 font-medium mb-1">Выберите диалог</p>
      <p className="text-xs text-slate-600 max-w-[200px]">
        Выберите собеседника из списка слева, чтобы начать общение
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────

type TabId = 'notifications' | 'messages';

interface ArtistNotificationCenterProps {
  userId: string;
  onNavigateToOrder?: (orderId: string) => void;
  onNavigateToHistory?: () => void;
  compact?: boolean;
  unreadMessages?: number;
}

export function ArtistNotificationCenter({
  userId,
  onNavigateToOrder,
  onNavigateToHistory,
  compact = false,
  unreadMessages = 0,
}: ArtistNotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    sseConnected,
    refresh,
    markAllRead,
  } = useNotificationSSE({ userId });

  const msgCtx = useMessages();
  const isDesktop = useIsDesktop();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('notifications');
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [localMessages, setLocalMessages] = useState<Record<string, DemoMessage[]>>(DEMO_MESSAGES);
  const [conversations, setConversations] = useState<DemoConversation[]>(DEMO_CONVERSATIONS);

  const panelRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Message unread: prefer prop → context → demo conversations fallback
  const msgUnread = unreadMessages || msgCtx?.unreadTotal || conversations.reduce((s, c) => s + c.unread, 0);
  // Combined badge: notifications + messages
  const totalUnread = unreadCount + msgUnread;

  // Drawer width: wider for messages on desktop
  const drawerWidth = activeTab === 'messages' && isDesktop
    ? 'w-full sm:w-[420px] lg:w-[740px] xl:w-[800px]'
    : 'w-full sm:w-[420px] lg:w-[440px]';

  // ── Effects ──

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeChatId && !isDesktop) setActiveChatId(null);
        else setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, activeChatId, isDesktop]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, localMessages]);

  useEffect(() => {
    if (activeChatId) setTimeout(() => inputRef.current?.focus(), 200);
  }, [activeChatId]);

  // On desktop, auto-select first conversation when switching to messages tab
  useEffect(() => {
    if (isDesktop && activeTab === 'messages' && !activeChatId && conversations.length > 0) {
      setActiveChatId(conversations[0].id);
    }
  }, [isDesktop, activeTab]);

  // ── Handlers ──

  const handleOpen = useCallback(async () => {
    setIsOpen(prev => !prev);
    if (!isOpen && unreadCount > 0) {
      try { await markAllRead(); } catch (e) { console.error('Mark read failed:', e); }
    }
  }, [isOpen, unreadCount, markAllRead]);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
    toast.success(next ? 'Звук уведомлений включен' : 'Звук уведомлений выключен', { duration: 2000 });
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

  const handleOpenChat = (conv: DemoConversation) => {
    setActiveChatId(conv.id);
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
    setChatInput('');
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeChatId) return;
    const text = chatInput.trim();
    const capturedChatId = activeChatId;
    const newMsg: DemoMessage = {
      id: Date.now(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalMessages(prev => ({
      ...prev,
      [capturedChatId]: [...(prev[capturedChatId] || []), newMsg],
    }));
    setConversations(prev => prev.map(c =>
      c.id === capturedChatId ? { ...c, lastMessage: text, time: 'Сейчас' } : c
    ));
    setChatInput('');

    if (Math.random() > 0.3) {
      setTimeout(() => {
        const replies = ['Понял, спасибо!', 'Отлично!', 'Звучит здорово!', 'Договорились!', 'Супер, жду!', 'Хорошо!'];
        const reply: DemoMessage = {
          id: Date.now() + 1,
          text: replies[Math.floor(Math.random() * replies.length)],
          sender: 'other',
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        };
        setLocalMessages(prev => ({
          ...prev,
          [capturedChatId]: [...(prev[capturedChatId] || []), reply],
        }));
      }, 1500 + Math.random() * 2000);
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c =>
      c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const activeConversation = activeChatId ? conversations.find(c => c.id === activeChatId) : null;
  const activeChatMessages = activeChatId ? (localMessages[activeChatId] || []) : [];

  // ── Render ──

  return (
    <>
      {/* ─── Bell Button ─── */}
      <button
        onClick={handleOpen}
        className={`relative flex items-center justify-center transition-all ${
          compact
            ? 'w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10'
            : 'w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10'
        }`}
      >
        <Bell className={`${compact ? 'w-3.5 h-3.5 xs:w-4 xs:h-4' : 'w-5 h-5'} text-slate-300 ${isOpen ? 'text-white' : ''}`} />
        <AnimatePresence>
          {totalUnread > 0 && (
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
              {totalUnread > 9 ? '9+' : totalUnread}
            </motion.span>
          )}
        </AnimatePresence>
        {sseConnected && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-gray-900" />
        )}
      </button>

      {/* ─── Overlay + Drawer (Portal to escape transformed parents) ─── */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setIsOpen(false); if (!isDesktop) setActiveChatId(null); }}
                className="fixed inset-0 z-[190] bg-black/50 backdrop-blur-sm"
              />

              {/* Drawer */}
              <motion.div
                ref={panelRef}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className={`fixed top-0 right-0 bottom-0 z-[200] bg-[#0a0a14] border-l border-white/10 flex flex-col shadow-2xl shadow-black/60 ${drawerWidth}`}
              >
                {/* ─── Header ─── */}
                <div className="flex items-center justify-between px-4 lg:px-5 py-3.5 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FF577F]" />
                    <h2 className="text-sm sm:text-base font-bold text-white">Центр уведомлений</h2>
                    <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                      sseConnected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-500'
                    }`}>
                      {sseConnected ? <><Wifi className="w-2 h-2" /> Live</> : <><WifiOff className="w-2 h-2" /> Poll</>}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleToggleSound}
                      className={`p-1.5 rounded-lg transition-all ${soundOn ? 'hover:bg-white/10 text-emerald-400' : 'hover:bg-white/10 text-slate-600'}`}
                      title={soundOn ? 'Выключить звук' : 'Включить звук'}
                    >
                      {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { setIsOpen(false); if (!isDesktop) setActiveChatId(null); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ─── Tabs ─── */}
                <div className="flex border-b border-white/10 bg-white/[0.01] flex-shrink-0">
                  <button
                    onClick={() => { setActiveTab('notifications'); if (!isDesktop) setActiveChatId(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative ${
                      activeTab === 'notifications' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span>Уведомления</span>
                    {unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#FF577F] text-white text-[10px] font-bold px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    {activeTab === 'notifications' && (
                      <motion.div
                        layoutId="notifTabUnified"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-[#FF577F] to-purple-500 rounded-full"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => { setActiveTab('messages'); if (!isDesktop) setActiveChatId(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative ${
                      activeTab === 'messages' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Сообщения</span>
                    {msgUnread > 0 && (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-cyan-500 text-white text-[10px] font-bold px-1">
                        {msgUnread > 9 ? '9+' : msgUnread}
                      </span>
                    )}
                    {activeTab === 'messages' && (
                      <motion.div
                        layoutId="notifTabUnified"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      />
                    )}
                  </button>
                </div>

                {/* ─── Tab Content ─── */}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <AnimatePresence mode="wait">

                    {/* ════════ NOTIFICATIONS TAB ════════ */}
                    {activeTab === 'notifications' && (
                      <motion.div
                        key="notifications"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 flex flex-col min-h-0"
                      >
                        <div className="flex-1 overflow-y-auto scrollbar-thin">
                          {loading && notifications.length === 0 ? (
                            <div className="flex items-center justify-center py-16">
                              <Loader2 className="w-6 h-6 animate-spin text-[#FF577F]" />
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="text-center py-16 px-6">
                              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Bell className="w-7 h-7 text-slate-600" />
                              </div>
                              <p className="text-sm text-slate-400 font-medium">Нет уведомлений</p>
                              <p className="text-xs text-slate-600 mt-1.5">Здесь будут уведомления о вашей активности</p>
                            </div>
                          ) : (
                            <div className="py-1">
                              {notifications.slice(0, 30).map((notif) => {
                                const iconInfo = getNotifIcon(notif);
                                const NotifIcon = iconInfo.icon;
                                return (
                                  <motion.button
                                    key={notif.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => handleNotifClick(notif)}
                                    className={`w-full text-left px-4 lg:px-5 py-3.5 hover:bg-white/5 transition-all border-b border-white/[0.04] last:border-b-0 ${
                                      !notif.read ? 'bg-white/[0.02]' : ''
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${iconInfo.bg}`}>
                                        <NotifIcon className={`w-4 h-4 ${iconInfo.color}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-[13px] leading-relaxed ${!notif.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                                          {notif.message}
                                        </p>
                                        {notif.comment && (
                                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 italic">
                                            &laquo;{notif.comment}&raquo;
                                          </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1.5">
                                          <span className="text-[10px] text-slate-600">{formatTime(notif.createdAt)}</span>
                                          <span className="text-[9px] text-slate-600 px-1.5 py-0.5 rounded bg-white/5">
                                            {CATEGORY_LABELS[notif.category]}
                                          </span>
                                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#FF577F]" />}
                                        </div>
                                      </div>
                                      {(onNavigateToOrder || onNavigateToHistory) && (
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-1.5" />
                                      )}
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 lg:px-5 py-3 border-t border-white/10 bg-white/[0.02] flex-shrink-0">
                          <div className="flex items-center justify-between">
                            {onNavigateToHistory ? (
                              <button
                                onClick={() => { onNavigateToHistory(); setIsOpen(false); }}
                                className="flex items-center gap-1.5 text-[11px] text-[#FF577F] hover:text-[#FF6B8F] font-medium transition-all"
                              >
                                <History className="w-3.5 h-3.5" />
                                Все уведомления
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600">
                                {sseConnected ? 'Real-time обновления' : 'Обновление каждые 15 сек'}
                              </span>
                            )}
                            <button
                              onClick={() => refresh()}
                              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white font-medium transition-all"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Обновить
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ════════ MESSAGES TAB ════════ */}
                    {activeTab === 'messages' && (
                      <motion.div
                        key="messages"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 flex flex-col min-h-0"
                      >
                        {isDesktop ? (
                          /* ═══ Desktop: split view ═══ */
                          <div className="flex-1 flex min-h-0">
                            {/* Left: conversation list (fixed 280px) */}
                            <div className="w-[280px] xl:w-[300px] flex flex-col min-h-0 border-r border-white/[0.06] flex-shrink-0">
                              {/* Search */}
                              <div className="px-3 py-2.5 border-b border-white/[0.06] flex-shrink-0">
                                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                                  <Search className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                                  <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Поиск..."
                                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none min-w-0"
                                  />
                                  {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="text-slate-600 hover:text-white">
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* List */}
                              <div className="flex-1 overflow-y-auto scrollbar-thin">
                                {filteredConversations.length === 0 ? (
                                  <div className="text-center py-10 px-4">
                                    <MessageSquare className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500">
                                      {searchQuery ? 'Не найдено' : 'Нет диалогов'}
                                    </p>
                                  </div>
                                ) : (
                                  filteredConversations.map((conv) => (
                                    <ConversationItem
                                      key={conv.id}
                                      conv={conv}
                                      isSelected={activeChatId === conv.id}
                                      onClick={() => handleOpenChat(conv)}
                                    />
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Right: chat area */}
                            <div className="flex-1 flex flex-col min-h-0">
                              {activeConversation ? (
                                <ChatArea
                                  conversation={activeConversation}
                                  messages={activeChatMessages}
                                  chatInput={chatInput}
                                  setChatInput={setChatInput}
                                  onSend={handleSendMessage}
                                  showBackButton={false}
                                  chatEndRef={chatEndRef}
                                  inputRef={inputRef}
                                />
                              ) : (
                                <EmptyChatPlaceholder />
                              )}
                            </div>
                          </div>
                        ) : (
                          /* ═══ Mobile: single-column with transitions ═══ */
                          <AnimatePresence mode="wait">
                            {activeChatId && activeConversation ? (
                              <motion.div
                                key="mobileChat"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{ duration: 0.15 }}
                                className="flex-1 flex flex-col min-h-0"
                              >
                                <ChatArea
                                  conversation={activeConversation}
                                  messages={activeChatMessages}
                                  chatInput={chatInput}
                                  setChatInput={setChatInput}
                                  onSend={handleSendMessage}
                                  onBack={() => setActiveChatId(null)}
                                  showBackButton={true}
                                  chatEndRef={chatEndRef}
                                  inputRef={inputRef}
                                />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="mobileConvList"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.15 }}
                                className="flex-1 flex flex-col min-h-0"
                              >
                                {/* Search */}
                                <div className="px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                                    <Search className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                                    <input
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      placeholder="Поиск диалогов..."
                                      className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none min-w-0"
                                    />
                                    {searchQuery && (
                                      <button onClick={() => setSearchQuery('')} className="text-slate-600 hover:text-white">
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Conversations */}
                                <div className="flex-1 overflow-y-auto scrollbar-thin">
                                  {filteredConversations.length === 0 ? (
                                    <div className="text-center py-16 px-6">
                                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <MessageSquare className="w-7 h-7 text-slate-600" />
                                      </div>
                                      <p className="text-sm text-slate-400 font-medium">
                                        {searchQuery ? 'Ничего не найдено' : 'Нет сообщений'}
                                      </p>
                                      <p className="text-xs text-slate-600 mt-1.5">
                                        {searchQuery ? 'Попробуйте другой запрос' : 'Начните новый диалог'}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="py-1">
                                      {filteredConversations.map((conv) => (
                                        <ConversationItem
                                          key={conv.id}
                                          conv={conv}
                                          isSelected={false}
                                          onClick={() => handleOpenChat(conv)}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}