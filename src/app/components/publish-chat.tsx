/**
 * PUBLISH CHAT - In-app чат артист-модератор прямо в карточке заказа
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchChatMessages, sendChatMessage, type ChatMessage } from '@/utils/api/chat-api';

interface PublishChatProps {
  orderId: string;
  userId: string;
  userName: string;
  role: 'artist' | 'moderator';
}

export function PublishChat({ orderId, userId, userName, role }: PublishChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const msgs = await fetchChatMessages(orderId);
    setMessages(msgs);
    setLoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [orderId]);

  useEffect(() => {
    if (isExpanded) loadMessages();
  }, [isExpanded, loadMessages]);

  // Polling каждые 10 секунд когда чат открыт
  useEffect(() => {
    if (!isExpanded) return;
    const interval = setInterval(() => loadMessages(), 10000);
    return () => clearInterval(interval);
  }, [isExpanded, loadMessages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText('');
    setSending(true);
    const result = await sendChatMessage(orderId, {
      senderId: userId,
      senderName: userName,
      senderRole: role,
      text: msg,
    });
    setSending(false);
    if (result) {
      setMessages(prev => [...prev, result]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const unreadCount = messages.filter(m => !m.read && m.senderRole !== role).length;

  return (
    <div className="mt-3 rounded-xl border border-white/10 overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">
            Чат с {role === 'artist' ? 'модератором' : 'артистом'}
          </span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-[#FF577F] text-white text-[9px] font-bold rounded-full min-w-[16px] text-center">
              {unreadCount}
            </span>
          )}
          {messages.length > 0 && (
            <span className="text-[10px] text-slate-600">({messages.length})</span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {/* Chat Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Messages */}
            <div className="max-h-[280px] overflow-y-auto px-3 py-2 space-y-2 bg-black/20">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center py-6 text-[10px] text-slate-600">
                  Начните диалог с {role === 'artist' ? 'модератором' : 'артистом'}
                </p>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === role ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${
                      msg.senderRole === role
                        ? 'bg-[#FF577F]/20 text-pink-100 rounded-br-sm'
                        : 'bg-white/5 text-slate-300 rounded-bl-sm'
                    }`}>
                      <span className="text-[9px] font-semibold block mb-0.5 opacity-50">{msg.senderName}</span>
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className="text-[8px] opacity-30 block text-right mt-0.5">
                        {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2 border-t border-white/5">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Сообщение..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF577F]/30"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="p-1.5 bg-[#FF577F]/20 hover:bg-[#FF577F]/30 rounded-lg transition-colors disabled:opacity-30"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF577F]" /> : <Send className="w-3.5 h-3.5 text-[#FF577F]" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
