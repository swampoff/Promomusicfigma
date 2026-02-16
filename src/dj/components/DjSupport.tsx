/**
 * DJ SUPPORT - FAQ и тикеты поддержки
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle, MessageSquare, ChevronDown, ChevronRight, Search,
  Send, Clock, CheckCircle, AlertCircle, Plus
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  lastUpdate: string;
  messages: number;
}

const FAQ_DATA: FAQ[] = [
  { question: 'Как загрузить микс на платформу?', answer: 'Перейдите в раздел "Миксы", нажмите "Загрузить микс". Поддерживаемые форматы: MP3, WAV, FLAC. Максимальный размер файла - 500 MB. После загрузки микс пройдёт модерацию в течение 24 часов.', category: 'Миксы' },
  { question: 'Как работает система букингов?', answer: 'Площадки и организаторы могут отправить вам запрос на букинг через ваш публичный профиль. Вы получите уведомление и сможете принять или отклонить запрос. При принятии букинга создаётся контракт с указанием гонорара и условий.', category: 'Букинги' },
  { question: 'Как вывести заработанные средства?', answer: 'Перейдите в раздел "Финансы" > "Вывод средств". Минимальная сумма вывода - 1000 &#8381;. Доступные способы: банковская карта, QIWI, ЮMoney. Срок зачисления - 1-3 рабочих дня.', category: 'Финансы' },
  { question: 'Что такое питчинг радиостанциям?', answer: 'Питчинг позволяет отправить ваш микс на рассмотрение радиостанциям-партнёрам. Если микс будет принят, он попадёт в ротацию станции, а вы получите роялти за каждый эфир.', category: 'Продвижение' },
  { question: 'Как настроить публичный профиль?', answer: 'Перейдите в раздел "Профиль". Заполните биографию, добавьте фото, укажите жанры и город. Чем полнее профиль, тем выше ваш рейтинг и видимость в DJ Marketplace.', category: 'Профиль' },
  { question: 'Какова комиссия платформы?', answer: 'Комиссия ПРОМО.МУЗЫКА составляет 10% с каждого букинга. Питчинг и загрузка миксов - бесплатно. Баннерная реклама оплачивается отдельно по выбранному тарифу.', category: 'Финансы' },
];

const MOCK_TICKETS: Ticket[] = [
  { id: 'TK-1042', subject: 'Не приходит оплата за букинг 12 января', status: 'in_progress', lastUpdate: '2 часа назад', messages: 4 },
  { id: 'TK-1038', subject: 'Ошибка при загрузке микса (превышен размер)', status: 'resolved', lastUpdate: '3 дня назад', messages: 6 },
  { id: 'TK-1035', subject: 'Запрос на верификацию профиля', status: 'open', lastUpdate: '5 дней назад', messages: 2 },
];

const ticketStatusLabels: Record<string, string> = { open: 'Открыт', in_progress: 'В работе', resolved: 'Решён' };
const ticketStatusColors: Record<string, string> = { open: 'text-yellow-400', in_progress: 'text-blue-400', resolved: 'text-green-400' };
const ticketStatusIcons: Record<string, typeof Clock> = { open: AlertCircle, in_progress: Clock, resolved: CheckCircle };

export function DjSupport() {
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaq = searchQuery
    ? FAQ_DATA.filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    : FAQ_DATA;

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white">Поддержка</h1>
        <p className="text-xs xs:text-sm text-gray-400 mt-0.5">FAQ, тикеты и связь с менеджером</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {[
          { id: 'faq' as const, label: 'Частые вопросы', icon: HelpCircle },
          { id: 'tickets' as const, label: `Мои тикеты (${MOCK_TICKETS.length})`, icon: MessageSquare },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 xs:px-4 py-2.5 text-xs xs:text-sm font-bold transition-all border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'text-purple-300 border-purple-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по вопросам..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {filteredFaq.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-3.5 xs:p-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 bg-purple-500/10 rounded text-[9px] font-bold text-purple-400 flex-shrink-0">{faq.category}</span>
                  <span className="text-xs xs:text-sm font-bold text-white truncate">{faq.question}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-xs xs:text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          <button className="w-full py-3 border-2 border-dashed border-purple-500/20 rounded-xl text-sm font-bold text-purple-400 hover:bg-purple-500/5 hover:border-purple-500/40 transition-all flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Создать тикет
          </button>

          {MOCK_TICKETS.map((ticket, i) => {
            const StatusIcon = ticketStatusIcons[ticket.status];
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3.5 xs:p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-600">{ticket.id}</span>
                      <StatusIcon className={`w-3.5 h-3.5 ${ticketStatusColors[ticket.status]}`} />
                      <span className={`text-[10px] font-bold ${ticketStatusColors[ticket.status]}`}>{ticketStatusLabels[ticket.status]}</span>
                    </div>
                    <h3 className="text-xs xs:text-sm font-bold text-white truncate">{ticket.subject}</h3>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                      <span>{ticket.lastUpdate}</span>
                      <span>{ticket.messages} сообщений</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}