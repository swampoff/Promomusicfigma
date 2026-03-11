import config from '@/config/environment';
/**
 * DJ COLLABORATIONS - Коллаборации и B2B проекты
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users, MessageSquare, Star, MapPin, Music, Handshake,
  ChevronRight, Plus, Filter, CheckCircle, Clock
} from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '@/utils/supabase/client';

const DJ_API = `${config.functionsUrl}/api/dj-studio`;

async function djFetch(path: string, options: RequestInit = {}) {
  const token = (await supabase.auth.getSession()).data.session?.access_token || publicAnonKey;
  const res = await fetch(`${DJ_API}${path}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
  });
  return res.json();
}

interface CollabRequest {
  id: string;
  djName: string;
  djCity: string;
  genres: string[];
  rating: number;
  type: 'b2b' | 'remix' | 'event' | 'mentorship';
  message: string;
  date: string;
  status: 'incoming' | 'outgoing' | 'active' | 'completed';
}

const typeLabels: Record<string, string> = { b2b: 'B2B сет', remix: 'Ремикс', event: 'Событие', mentorship: 'Менторство' };
const typeColors: Record<string, string> = { b2b: 'bg-purple-500/20 text-purple-300', remix: 'bg-pink-500/20 text-pink-300', event: 'bg-blue-500/20 text-blue-300', mentorship: 'bg-emerald-500/20 text-emerald-300' };
const statusLabels: Record<string, string> = { incoming: 'Входящий', outgoing: 'Исходящий', active: 'Активный', completed: 'Завершён' };

export function DjCollaborations() {
  const [collabs, setCollabs] = useState<CollabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incoming' | 'active' | 'completed'>('all');

  const loadCollabs = () => {
    djFetch('/collaborations')
      .then((data) => {
        const items: CollabRequest[] = Array.isArray(data) ? data : (data.collaborations ?? data.data ?? []);
        setCollabs(items.map((c: any) => ({
          id: String(c.id),
          djName: c.dj_name ?? c.djName ?? '',
          djCity: c.dj_city ?? c.djCity ?? '',
          genres: Array.isArray(c.genres) ? c.genres : [],
          rating: Number(c.rating ?? 0),
          type: c.type,
          message: c.message ?? '',
          date: c.date ?? c.created_at ?? '',
          status: c.status,
        })));
      })
      .catch((err) => console.error('[DjCollaborations] fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCollabs(); }, []);

  const handleAccept = async (id: string) => {
    try {
      await djFetch(`/collaborations/${id}/accept`, { method: 'PUT' });
      setCollabs(prev => prev.map(c => c.id === id ? { ...c, status: 'active' as const } : c));
    } catch (err) { console.error('[DjCollaborations] accept error:', err); }
  };

  const handleDecline = async (id: string) => {
    try {
      await djFetch(`/collaborations/${id}/decline`, { method: 'PUT' });
      setCollabs(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error('[DjCollaborations] decline error:', err); }
  };

  const filtered = collabs.filter(c => {
    if (filter === 'incoming') return c.status === 'incoming';
    if (filter === 'active') return c.status === 'active' || c.status === 'outgoing';
    if (filter === 'completed') return c.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white">Коллаборации</h1>
          <p className="text-xs xs:text-sm text-gray-400 mt-0.5">Совместные проекты, B2B сеты, ремиксы</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Найти DJ
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2.5 xs:gap-3">
        {[
          { label: 'Входящие', value: collabs.filter(c => c.status === 'incoming').length, icon: MessageSquare, color: 'text-purple-400' },
          { label: 'Активные', value: collabs.filter(c => c.status === 'active').length, icon: Handshake, color: 'text-green-400' },
          { label: 'Завершённые', value: collabs.filter(c => c.status === 'completed').length, icon: CheckCircle, color: 'text-violet-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 xs:p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-center"
          >
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
            <div className="text-lg xs:text-xl font-black text-white">{s.value}</div>
            <div className="text-[10px] xs:text-xs text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'incoming', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg text-xs xs:text-sm font-bold transition-all ${
              filter === f
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'Все' : f === 'incoming' ? 'Входящие' : f === 'active' ? 'Активные' : 'Завершённые'}
          </button>
        ))}
      </div>

      {/* Collab cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <Handshake className="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse" />
          <p className="text-sm font-bold">Загрузка коллабораций...</p>
        </div>
      ) : (
      <div className="space-y-2.5 xs:space-y-3">
        {filtered.map((collab, i) => (
          <motion.div
            key={collab.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-3.5 xs:p-4 sm:p-5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-3 xs:gap-4">
              <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0 text-sm xs:text-base font-black text-purple-400">
                {collab.djName.split(' ').map(w => w[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm xs:text-base font-bold text-white truncate">{collab.djName}</h3>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] xs:text-[9px] font-bold ${typeColors[collab.type]}`}>
                    {typeLabels[collab.type]}
                  </span>
                  <ChevronRight className="w-4 h-4 text-purple-500/0 group-hover:text-purple-400 transition-all ml-auto flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[10px] xs:text-xs text-gray-500 mb-1.5">
                  <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{collab.djCity}</span>
                  <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-400" />{collab.rating}</span>
                  <span className="flex items-center gap-0.5"><Music className="w-3 h-3" />{collab.genres.join(', ')}</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{collab.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[9px] xs:text-[10px] font-bold ${
                    collab.status === 'incoming' ? 'text-purple-400' :
                    collab.status === 'active' ? 'text-green-400' :
                    collab.status === 'outgoing' ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {statusLabels[collab.status]}
                  </span>
                  <span className="text-[9px] text-gray-600">{new Date(collab.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            </div>
            {collab.status === 'incoming' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => handleAccept(collab.id)}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg text-xs font-bold text-white hover:shadow-purple-500/30 hover:shadow-md transition-all"
                >
                  Принять
                </button>
                <button
                  onClick={() => handleDecline(collab.id)}
                  className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400 hover:bg-white/10 transition-all"
                >
                  Отклонить
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
}
