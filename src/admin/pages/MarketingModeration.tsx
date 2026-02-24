/**
 * MARKETING MODERATION - Модерация промо-кампаний (реальный API)
 *
 * Флоу: Артист создаёт → Админ одобряет/отклоняет → Запуск
 * Подключено к /marketing-campaigns/* роутам
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Megaphone, CheckCircle, XCircle, Search, Filter, Loader2,
  Clock, Rocket, Eye, ChevronDown, ChevronUp, AlertTriangle,
  Radio, Music2, Users, Target, Zap, RefreshCw, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/marketing-campaigns`;
const H: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` };

interface Campaign {
  id: string;
  campaign_name: string;
  user_id: string;
  artist_name: string;
  description: string;
  channels: string[];
  target_audience: {
    age_range: string;
    gender: string;
    geography: string[];
    interests: string[];
  };
  budget_preference: string;
  final_price: number;
  status: string;
  rejection_reason: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  launched_at?: string;
}

type FilterStatus = 'all' | 'pending_review' | 'approved' | 'active' | 'rejected' | 'completed';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending_review: { label: 'На модерации', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/25', icon: Clock },
  approved:       { label: 'Одобрена',     color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25', icon: CheckCircle },
  active:         { label: 'Запущена',     color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/25', icon: Rocket },
  rejected:       { label: 'Отклонена',    color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/25', icon: XCircle },
  completed:      { label: 'Завершена',    color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/25', icon: CheckCircle },
};

const CHANNEL_LABELS: Record<string, string> = {
  radio: 'Радио', playlists: 'Плейлисты', social: 'Соцсети',
  venues: 'Заведения', banners: 'Баннеры', push: 'Push',
};

function fmtDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} д назад`;
}

export function MarketingModeration() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Campaign | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Fetch all campaigns ──
  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch(`${API}/campaigns/all`, { headers: H });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setCampaigns(data.data || []);
      }
    } catch (e) {
      console.warn('Fetch campaigns error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  // ── Actions ──
  const handleApprove = async (c: Campaign) => {
    setActionLoading(c.id);
    try {
      const res = await fetch(`${API}/campaigns/${c.id}/approve`, {
        method: 'POST', headers: H, body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Кампания «${c.campaign_name}» одобрена`);
        fetchCampaigns();
      } else toast.error(data.error || 'Ошибка');
    } catch { toast.error('Ошибка сети'); }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }
    setActionLoading(rejectTarget.id);
    try {
      const res = await fetch(`${API}/campaigns/${rejectTarget.id}/reject`, {
        method: 'POST', headers: H,
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Кампания «${rejectTarget.campaign_name}» отклонена`);
        fetchCampaigns();
      } else toast.error(data.error || 'Ошибка');
    } catch { toast.error('Ошибка сети'); }
    setActionLoading(null);
    setRejectTarget(null);
    setRejectionReason('');
  };

  const handleLaunch = async (c: Campaign) => {
    setActionLoading(c.id);
    try {
      const res = await fetch(`${API}/campaigns/${c.id}/launch`, {
        method: 'POST', headers: H, body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Кампания «${c.campaign_name}» запущена!`);
        fetchCampaigns();
      } else toast.error(data.error || 'Ошибка');
    } catch { toast.error('Ошибка сети'); }
    setActionLoading(null);
  };

  // ── Filter & search ──
  let filtered = campaigns;
  if (filter !== 'all') filtered = filtered.filter(c => c.status === filter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c =>
      c.campaign_name.toLowerCase().includes(q) ||
      c.artist_name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }

  // ── Stats ──
  const stats = {
    total: campaigns.length,
    pending: campaigns.filter(c => c.status === 'pending_review').length,
    approved: campaigns.filter(c => c.status === 'approved').length,
    active: campaigns.filter(c => c.status === 'active').length,
    rejected: campaigns.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'Всего', value: stats.total, color: 'text-white', bg: 'bg-white/5 border-white/10' },
          { label: 'На модерации', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Одобрено', value: stats.approved, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Активных', value: stats.active, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Отклонено', value: stats.rejected, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.bg}`}>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию, артисту..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-500/30"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterStatus)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
        >
          <option value="all">Все статусы</option>
          <option value="pending_review">На модерации</option>
          <option value="approved">Одобрено</option>
          <option value="active">Активно</option>
          <option value="rejected">Отклонено</option>
        </select>
        <div
          role="button"
          tabIndex={0}
          onClick={() => { setLoading(true); fetchCampaigns(); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { setLoading(true); fetchCampaigns(); } }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Обновить</span>
        </div>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 backdrop-blur-xl bg-white/[0.03] rounded-2xl border border-white/10">
          <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400 text-sm">Кампании не найдены</div>
          <div className="text-gray-600 text-xs mt-1">Измените фильтр или дождитесь новых заявок от артистов</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, idx) => {
            const st = STATUS_CFG[c.status] || STATUS_CFG.pending_review;
            const StIcon = st.icon;
            const expanded = expandedId === c.id;
            const isLoading = actionLoading === c.id;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 overflow-hidden"
              >
                {/* Header row */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setExpandedId(expanded ? null : c.id); }}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${st.bg} border flex-shrink-0`}>
                    <StIcon className={`w-4 h-4 ${st.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{c.campaign_name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-gray-500 text-[10px]">{c.artist_name}</span>
                      <span className="text-gray-700 text-[10px]">{timeAgo(c.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg} border ${st.color}`}>
                      {st.label}
                    </span>
                    {c.final_price > 0 && (
                      <span className="text-xs text-gray-400 font-medium">
                        {c.final_price.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3">
                        {/* Description */}
                        {c.description && (
                          <div className="text-gray-400 text-xs leading-relaxed">{c.description}</div>
                        )}

                        {/* Channels */}
                        {c.channels.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {c.channels.map(ch => (
                              <span key={ch} className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px]">
                                {CHANNEL_LABELS[ch] || ch}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Info grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="bg-white/[0.03] rounded-lg p-2">
                            <div className="text-[10px] text-gray-600">Артист</div>
                            <div className="text-xs text-white font-medium mt-0.5">{c.artist_name}</div>
                          </div>
                          <div className="bg-white/[0.03] rounded-lg p-2">
                            <div className="text-[10px] text-gray-600">user_id</div>
                            <div className="text-xs text-gray-300 font-mono mt-0.5">{c.user_id}</div>
                          </div>
                          {c.start_date && (
                            <div className="bg-white/[0.03] rounded-lg p-2">
                              <div className="text-[10px] text-gray-600">Начало</div>
                              <div className="text-xs text-white font-medium mt-0.5">{fmtDate(c.start_date)}</div>
                            </div>
                          )}
                          {c.end_date && (
                            <div className="bg-white/[0.03] rounded-lg p-2">
                              <div className="text-[10px] text-gray-600">Окончание</div>
                              <div className="text-xs text-white font-medium mt-0.5">{fmtDate(c.end_date)}</div>
                            </div>
                          )}
                        </div>

                        {/* Target audience */}
                        {c.target_audience && (
                          <div className="bg-white/[0.03] rounded-lg p-2">
                            <div className="text-[10px] text-gray-600 mb-1">Аудитория</div>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-[10px] text-gray-300 bg-white/5 px-1.5 py-0.5 rounded">{c.target_audience.age_range}</span>
                              {c.target_audience.geography.map(g => (
                                <span key={g} className="text-[10px] text-gray-300 bg-white/5 px-1.5 py-0.5 rounded">{g}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rejection reason */}
                        {c.status === 'rejected' && c.rejection_reason && (
                          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-red-400 text-[10px] font-medium">Причина отклонения</div>
                              <div className="text-red-300 text-xs mt-0.5">{c.rejection_reason}</div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {c.status === 'pending_review' && (
                            <div className="contents">
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); handleApprove(c); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleApprove(c); } }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors cursor-pointer"
                              >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                <span>Одобрить</span>
                              </div>
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); setRejectTarget(c); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setRejectTarget(c); } }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Отклонить</span>
                              </div>
                            </div>
                          )}
                          {c.status === 'approved' && (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); handleLaunch(c); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleLaunch(c); } }}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium hover:from-blue-600 hover:to-cyan-600 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                            >
                              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                              <span>Запустить кампанию</span>
                            </div>
                          )}
                          {c.status === 'active' && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                              <Rocket className="w-3.5 h-3.5" />
                              <span>Кампания активна с {fmtDate(c.launched_at || c.approved_at || null)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setRejectTarget(null); setRejectionReason(''); }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl backdrop-blur-2xl bg-[#12121f]/95 border border-white/15 shadow-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-white font-semibold text-sm">Отклонить кампанию</div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => { setRejectTarget(null); setRejectionReason(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setRejectTarget(null); setRejectionReason(''); } }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </div>
              </div>
              <div className="text-gray-400 text-xs mb-3">
                Кампания: <span className="text-white font-medium">{rejectTarget.campaign_name}</span>
                <br />
                Артист: <span className="text-white">{rejectTarget.artist_name}</span>
              </div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Укажите причину отклонения..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/40 resize-none"
              />
              <div className="flex items-center gap-2 mt-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleReject}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleReject(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  <span>Отклонить</span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => { setRejectTarget(null); setRejectionReason(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setRejectTarget(null); setRejectionReason(''); } }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium text-center hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Отмена
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
