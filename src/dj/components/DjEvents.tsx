/**
 * DJ EVENTS - Управление событиями DJ
 * Календарь выступлений, создание событий, история
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music, Calendar, MapPin, Clock, Users, Plus, Filter,
  ChevronRight, Ticket, Star, TrendingUp, X, DollarSign
} from 'lucide-react';

interface DjEvent {
  id: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  type: 'club' | 'festival' | 'private' | 'stream';
  status: 'upcoming' | 'confirmed' | 'completed' | 'cancelled';
  fee: number;
  capacity: number;
  ticketsSold?: number;
}

const MOCK_EVENTS: DjEvent[] = [
  { id: '1', title: 'Friday Night Vibes', venue: 'Club Neon', city: 'Москва', date: '2026-02-14', time: '23:00', type: 'club', status: 'confirmed', fee: 45000, capacity: 500, ticketsSold: 380 },
  { id: '2', title: 'Sunset Terrace Session', venue: 'Sky Lounge', city: 'Москва', date: '2026-02-20', time: '19:00', type: 'club', status: 'upcoming', fee: 35000, capacity: 200, ticketsSold: 120 },
  { id: '3', title: 'Electronic Spring Festival', venue: 'Expo Arena', city: 'Санкт-Петербург', date: '2026-03-08', time: '16:00', type: 'festival', status: 'confirmed', fee: 120000, capacity: 5000, ticketsSold: 3200 },
  { id: '4', title: 'Private Corporate Event', venue: 'Grand Hall', city: 'Казань', date: '2026-03-15', time: '20:00', type: 'private', status: 'upcoming', fee: 80000, capacity: 150 },
  { id: '5', title: 'Live Stream Mix Marathon', venue: 'Online', city: 'Twitch / YouTube', date: '2026-02-22', time: '18:00', type: 'stream', status: 'upcoming', fee: 0, capacity: 99999 },
  { id: '6', title: 'New Year Afterparty', venue: 'Bar Decor', city: 'Москва', date: '2026-01-02', time: '01:00', type: 'club', status: 'completed', fee: 55000, capacity: 300, ticketsSold: 300 },
  { id: '7', title: 'Techno Underground', venue: 'Basement Club', city: 'Москва', date: '2026-01-18', time: '23:30', type: 'club', status: 'completed', fee: 30000, capacity: 200, ticketsSold: 190 },
];

const typeLabels: Record<string, string> = { club: 'Клуб', festival: 'Фестиваль', private: 'Приватный', stream: 'Стрим' };
const typeColors: Record<string, string> = { club: 'bg-purple-500/20 text-purple-300', festival: 'bg-pink-500/20 text-pink-300', private: 'bg-amber-500/20 text-amber-300', stream: 'bg-cyan-500/20 text-cyan-300' };
const statusLabels: Record<string, string> = { upcoming: 'Ожидает', confirmed: 'Подтверждено', completed: 'Завершено', cancelled: 'Отменено' };
const statusColors: Record<string, string> = { upcoming: 'bg-yellow-500/20 text-yellow-300', confirmed: 'bg-green-500/20 text-green-300', completed: 'bg-gray-500/20 text-gray-400', cancelled: 'bg-red-500/20 text-red-300' };

export function DjEvents() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = MOCK_EVENTS.filter(e => {
    if (filter === 'upcoming') return e.status === 'upcoming' || e.status === 'confirmed';
    if (filter === 'completed') return e.status === 'completed';
    return true;
  });

  const stats = {
    upcoming: MOCK_EVENTS.filter(e => e.status === 'upcoming' || e.status === 'confirmed').length,
    completed: MOCK_EVENTS.filter(e => e.status === 'completed').length,
    totalRevenue: MOCK_EVENTS.filter(e => e.status === 'completed').reduce((s, e) => s + e.fee, 0),
    avgFee: Math.round(MOCK_EVENTS.reduce((s, e) => s + e.fee, 0) / MOCK_EVENTS.length),
  };

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white">События</h1>
          <p className="text-xs xs:text-sm text-gray-400 mt-0.5">Управление выступлениями и мероприятиями</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Создать событие
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 xs:gap-3">
        {[
          { label: 'Предстоящие', value: stats.upcoming, icon: Calendar, color: 'text-purple-400' },
          { label: 'Завершённые', value: stats.completed, icon: Star, color: 'text-green-400' },
          { label: 'Доход (завершённые)', value: `${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-400' },
          { label: 'Средний гонорар', value: `${(stats.avgFee / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-violet-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 xs:p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
          >
            <s.icon className={`w-4 h-4 xs:w-5 xs:h-5 ${s.color} mb-1.5`} />
            <div className="text-lg xs:text-xl sm:text-2xl font-black text-white">{s.value}</div>
            <div className="text-[10px] xs:text-xs text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'upcoming', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg text-xs xs:text-sm font-bold transition-all ${
              filter === f
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'Все' : f === 'upcoming' ? 'Предстоящие' : 'Завершённые'}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="space-y-2.5 xs:space-y-3">
        {filtered.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-3.5 xs:p-4 sm:p-5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-3 xs:gap-4">
              {/* Date block */}
              <div className="flex-shrink-0 w-12 xs:w-14 sm:w-16 text-center">
                <div className="text-[10px] xs:text-xs text-gray-500 uppercase font-bold">
                  {new Date(event.date).toLocaleDateString('ru', { month: 'short' })}
                </div>
                <div className="text-xl xs:text-2xl sm:text-3xl font-black text-white leading-none">
                  {new Date(event.date).getDate()}
                </div>
                <div className="text-[9px] xs:text-[10px] text-gray-600">
                  {new Date(event.date).toLocaleDateString('ru', { weekday: 'short' })}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm xs:text-base sm:text-lg font-black text-white truncate">{event.title}</h3>
                  <ChevronRight className="w-4 h-4 text-purple-500/0 group-hover:text-purple-400 transition-all group-hover:translate-x-0.5 flex-shrink-0" />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] xs:text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}, {event.city}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                  {event.fee > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{event.fee.toLocaleString('ru')} &#8381;</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] xs:text-[10px] font-bold ${typeColors[event.type]}`}>
                    {typeLabels[event.type]}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] xs:text-[10px] font-bold ${statusColors[event.status]}`}>
                    {statusLabels[event.status]}
                  </span>
                  {event.ticketsSold !== undefined && (
                    <span className="flex items-center gap-0.5 text-[9px] xs:text-[10px] text-gray-500">
                      <Ticket className="w-3 h-3" />{event.ticketsSold}/{event.capacity}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#12132a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 xs:p-6 sm:p-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg xs:text-xl font-black text-white">Новое событие</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-3.5">
                <input placeholder="Название события" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Площадка" className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                  <input placeholder="Город" className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50" />
                  <input type="time" className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Гонорар" className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
                  <select className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50">
                    <option value="club">Клуб</option>
                    <option value="festival">Фестиваль</option>
                    <option value="private">Приватный</option>
                    <option value="stream">Стрим</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                >
                  Создать событие
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
