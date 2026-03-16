/**
 * PENDING PARTNERS — Заявки на регистрацию партнёров (Радио, Заведение, DJ, Продюсер, Инженер)
 * Реальные данные из /auth/admin/pending-users
 */

import config from '@/config/environment';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, CheckCircle, XCircle, Clock, Mail, RefreshCw,
  Radio, Building2, Music2, Headphones, Wrench, AlertTriangle,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { authClient } from '@/utils/auth/client';

const API = `${config.functionsUrl}/auth/admin`;

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = (await authClient.auth.getSession()).data.session?.access_token || '';
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
  });
  return res.json();
}

interface PendingUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const ROLE_META: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
  radio_station: { label: 'Радиостанция', icon: Radio,     color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  venue:         { label: 'Заведение',    icon: Building2,  color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  dj:            { label: 'DJ',           icon: Headphones, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  producer:      { label: 'Продюсер',     icon: Music2,     color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  engineer:      { label: 'Инженер',      icon: Wrench,     color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
};

export function PendingPartners() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/pending-users');
      if (res.success) setUsers(res.data || []);
      else toast.error(res.error || 'Ошибка загрузки');
    } catch {
      toast.error('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (userId: string, name: string) => {
    setProcessingId(userId);
    try {
      const res = await adminFetch('/approve-user', { method: 'POST', body: JSON.stringify({ userId }) });
      if (res.success) {
        toast.success(`${name} — одобрено!`);
        setUsers(prev => prev.filter(u => u.userId !== userId));
      } else {
        toast.error(res.error || 'Ошибка');
      }
    } catch {
      toast.error('Ошибка соединения');
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (userId: string, name: string) => {
    setProcessingId(userId);
    try {
      const res = await adminFetch('/reject-user', { method: 'POST', body: JSON.stringify({ userId, reason: rejectReason }) });
      if (res.success) {
        toast.success(`${name} — отклонено`);
        setUsers(prev => prev.filter(u => u.userId !== userId));
        setRejectingId(null);
        setRejectReason('');
      } else {
        toast.error(res.error || 'Ошибка');
      }
    } catch {
      toast.error('Ошибка соединения');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

  const roleCount = (role: string) => users.filter(u => u.role === role).length;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            Заявки партнёров
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Ожидают одобрения: <span className="text-amber-400 font-semibold">{users.length}</span>
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Role filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterRole('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterRole === 'all' ? 'bg-white/15 border-white/30 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
        >
          Все ({users.length})
        </button>
        {Object.entries(ROLE_META).map(([role, meta]) => {
          const count = roleCount(role);
          if (count === 0) return null;
          return (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterRole === role ? `${meta.color}` : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle className="w-16 h-16 text-green-400/50 mb-4" />
          <p className="text-white font-semibold text-lg">Нет заявок</p>
          <p className="text-gray-500 text-sm mt-1">Все партнёрские заявки обработаны</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((user) => {
              const meta = ROLE_META[user.role] || { label: user.role, icon: Users, color: 'text-gray-400 bg-white/5 border-white/10' };
              const Icon = meta.icon;
              const isProcessing = processingId === user.userId;
              const isRejecting = rejectingId === user.userId;
              const registeredAt = new Date(user.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

              return (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  layout
                  className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold truncate">{user.name || '—'}</p>
                        <p className="text-gray-400 text-sm flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
                          <span className="text-gray-600 text-xs">{registeredAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isRejecting ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => approve(user.userId, user.name)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 text-sm font-semibold transition-all disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Одобрить
                        </button>
                        <button
                          onClick={() => setRejectingId(user.userId)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Отклонить
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 w-full sm:w-72">
                        <textarea
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Причина отклонения (необязательно)"
                          rows={2}
                          className="w-full px-3 py-2 bg-white/5 border border-red-500/30 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => reject(user.userId, user.name)}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm font-semibold transition-all disabled:opacity-50"
                          >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Подтвердить
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason(''); }}
                            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm transition-all"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Empty tip */}
      {!loading && users.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300/80 text-sm">
            После одобрения партнёр получит письмо на email и сможет войти в кабинет.
            При отклонении — письмо с причиной отказа.
          </p>
        </div>
      )}
    </div>
  );
}
