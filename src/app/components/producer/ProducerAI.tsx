/**
 * PRODUCER AI ASSISTANT
 * AI-ассистент продюсера - анализ данных, рекомендации, чат с Mistral AI
 * Подключён к /api/producer-studio/ai/analyze
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Send, Loader2, RefreshCw, Bot, User,
  TrendingUp, Target, Lightbulb, BarChart3, Clock,
  MessageSquare, Zap, ChevronDown,
} from 'lucide-react';
import * as studioApi from '@/utils/api/producer-studio';

interface ProducerAIProps {
  producerId: string;
  producerName: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: 'Как увеличить доход?', prompt: 'Как мне увеличить доход от продюсирования? Дай конкретные советы на основе моих данных.' },
  { icon: Target, label: 'Оптимизация цен', prompt: 'Проанализируй мои услуги и предложи оптимальные цены для максимальной прибыли.' },
  { icon: Lightbulb, label: 'Новые услуги', prompt: 'Какие новые услуги мне стоит добавить для расширения клиентской базы?' },
  { icon: BarChart3, label: 'Анализ загрузки', prompt: 'Проанализируй мою загрузку по календарю и предложи как оптимизировать расписание.' },
  { icon: MessageSquare, label: 'Работа с клиентами', prompt: 'Дай рекомендации по улучшению коммуникации с клиентами на основе моих диалогов.' },
  { icon: Zap, label: 'Общий анализ', prompt: 'Сделай полный анализ моего кабинета продюсера и дай рекомендации по развитию.' },
];

function formatAIContent(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/- /g, '<span class="text-teal-400 mr-1">-</span> ');
}

export function ProducerAI({ producerId, producerName }: ProducerAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load last AI response on mount
  useEffect(() => {
    (async () => {
      const result = await studioApi.fetchAiHistory(producerId);
      if (result.success && result.data) {
        setMessages([
          { id: 'hist-q', role: 'user', content: result.data.question || 'Общий анализ', timestamp: result.data.timestamp },
          { id: 'hist-a', role: 'assistant', content: result.data.response, timestamp: result.data.timestamp },
        ]);
        setShowQuickPrompts(false);
      }
    })();
  }, [producerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowQuickPrompts(false);

    const result = await studioApi.aiAnalyze({ producerId, question: text.trim() });

    if (result.success) {
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: result.data.response,
        timestamp: new Date().toISOString(),
        model: result.data.model,
      };
      setMessages(prev => [...prev, aiMsg]);
    } else {
      const errMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: 'Произошла ошибка при обращении к AI. Попробуйте ещё раз.',
        timestamp: new Date().toISOString(),
        model: 'error',
      };
      setMessages(prev => [...prev, errMsg]);
    }

    setIsLoading(false);
  }, [producerId, isLoading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  const handleReset = useCallback(() => {
    setMessages([]);
    setShowQuickPrompts(true);
    setInput('');
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">AI-ассистент</h2>
          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />Mistral AI
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Новый диалог
          </button>
        )}
      </div>

      {/* Chat container */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: '500px', maxHeight: 'calc(100vh - 280px)' }}>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Welcome state */}
          <AnimatePresence>
            {showQuickPrompts && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-teal-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Привет, {producerName.split(' ')[0]}!
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                  Я анализирую ваши данные - заказы, календарь, услуги, отзывы - и даю рекомендации по развитию бизнеса.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      onClick={() => sendMessage(qp.prompt)}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/5 hover:border-purple-500/20 hover:bg-purple-500/5 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors">
                        <qp.icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{qp.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-teal-500/20 border border-teal-500/20 text-white'
                      : 'bg-white/[0.04] border border-white/5 text-gray-300'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      className="ai-content prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatAIContent(msg.content) }}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-gray-600">
                    {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.model && msg.model !== 'error' && (
                    <span className="text-[9px] text-purple-500/60 bg-purple-500/5 px-1.5 py-0.5 rounded-full">
                      {msg.model === 'fallback' ? 'шаблон' : msg.model}
                    </span>
                  )}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-teal-400" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="bg-white/[0.04] border border-white/5 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-sm text-gray-400">Анализирую данные...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts bar (collapsed after first message) */}
        {messages.length > 0 && !isLoading && (
          <div className="px-4 pb-2">
            <button
              onClick={() => setShowQuickPrompts(p => !p)}
              className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-400 transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              Быстрые вопросы
              <ChevronDown className={`w-3 h-3 transition-transform ${showQuickPrompts ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showQuickPrompts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-1.5 mt-2"
                >
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(qp.prompt)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[10px] text-gray-400 hover:text-white hover:border-purple-500/20 transition-colors"
                    >
                      {qp.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-white/5 p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Задайте вопрос AI-ассистенту..."
                rows={1}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/40 resize-none max-h-32"
                style={{ minHeight: '42px' }}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-2 text-center">
            AI анализирует ваши данные из KV Store - диалоги, календарь, услуги, настройки
          </p>
        </div>
      </div>
    </div>
  );
}
