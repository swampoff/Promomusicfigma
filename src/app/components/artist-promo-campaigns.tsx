/**
 * ARTIST PROMO CAMPAIGNS - Создание и управление промо-кампаниями
 *
 * Флоу: Артист создаёт → Админ одобряет → Запуск
 * Статусы: pending_review → approved → active | rejected
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Megaphone, Plus, X, Loader2, CheckCircle, XCircle,
  Clock, Rocket, Eye, Trash2, Send, Target, Users,
  Radio, Music2, TrendingUp, DollarSign, Calendar,
  ChevronDown, ChevronUp, AlertTriangle, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/marketing-campaigns`;
const H: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` };

// ── Types ──

interface Campaign {
  id: string;
  campaign_name: string;
  user_id: string;
  artist_name: string;
  description: string;
  content_ids: string[];
  start_date: string | null;
  end_date: string | null;
  channels: string[];
  target_audience: {
    age_range: string;
    gender: string;
    geography: string[];
    interests: string[];
  };
  budget_preference: string;
  custom_budget: number;
  final_price: number;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  launched_at?: string;
}

interface Props {
  userId?: string;
  artistName?: string;
}

// ── Status helpers ──

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending_review: { label: 'На модерации', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/25', icon: Clock },
  approved:       { label: 'Одобрена',     color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25', icon: CheckCircle },
  active:         { label: 'Запущена',     color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/25', icon: Rocket },
  rejected:       { label: 'Отклонена',    color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/25', icon: XCircle },
  completed:      { label: 'Завершена',    color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/25', icon: CheckCircle },
};

const CHANNELS = [
  { id: 'radio', label: 'Радио', icon: Radio },
  { id: 'playlists', label: 'Плейлисты', icon: Music2 },
  { id: 'social', label: 'Соцсети', icon: Users },
  { id: 'venues', label: 'Заведения', icon: Target },
  { id: 'banners', label: 'Баннеры', icon: Megaphone },
  { id: 'push', label: 'Push-уведомления', icon: Zap },
];

const BUDGETS = [
  { id: 'economy', label: 'Эконом', price: 2990, desc: 'Базовое продвижение - 1 канал' },
  { id: 'medium', label: 'Стандарт', price: 7990, desc: 'До 3 каналов, таргетинг' },
  { id: 'premium', label: 'Премиум', price: 14990, desc: 'Все каналы, приоритет' },
  { id: 'custom', label: 'Индивидуальный', price: 0, desc: 'Обсудим ваш бюджет' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} д назад`;
}

export function ArtistPromoCampaigns({ userId = 'artist-1', artistName = 'Артист' }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ── Fetch campaigns ──
  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch(`${API}/campaigns/${userId}`, { headers: H });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setCampaigns(data.data || []);
      }
    } catch (e) {
      console.warn('Fetch campaigns error:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  // ── Delete campaign ──
  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`${API}/campaigns/${id}`, { method: 'DELETE', headers: H });
      if (res.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        toast.success('Кампания удалена');
      }
    } catch { toast.error('Ошибка удаления'); }
    setDeleting(null);
  };

  // ── Stats ──
  const stats = {
    total: campaigns.length,
    pending: campaigns.filter(c => c.status === 'pending_review').length,
    active: campaigns.filter(c => c.status === 'active').length,
    approved: campaigns.filter(c => c.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold" style={{ fontSize: '1.25rem' }}>Промо-кампании</div>
              <div className="text-gray-500 text-xs">Создавайте и отслеживайте рекламные кампании</div>
            </div>
          </div>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowForm(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Новая кампания</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Всего', value: stats.total, color: 'text-white', bg: 'bg-white/5' },
          { label: 'На модерации', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Одобрено', value: stats.approved, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Активных', value: stats.active, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-white/10 p-3 text-center`}>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Campaign List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400 text-sm mb-1">Нет кампаний</div>
          <div className="text-gray-600 text-xs">Создайте первую промо-кампанию для продвижения вашей музыки</div>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => {
            const st = STATUS_MAP[c.status] || STATUS_MAP.pending_review;
            const StIcon = st.icon;
            const expanded = expandedId === c.id;
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 overflow-hidden"
              >
                {/* Campaign header row */}
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
                      <span className={`text-[10px] font-medium ${st.color}`}>{st.label}</span>
                      <span className="text-gray-600 text-[10px]">{timeAgo(c.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.channels.length > 0 && (
                      <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                        {c.channels.length} канал{c.channels.length > 1 ? (c.channels.length < 5 ? 'а' : 'ов') : ''}
                      </span>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>

                {/* Expanded details */}
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
                        {c.description && (
                          <div className="text-gray-400 text-xs leading-relaxed">{c.description}</div>
                        )}

                        {/* Channels */}
                        {c.channels.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {c.channels.map(ch => {
                              const chan = CHANNELS.find(x => x.id === ch);
                              return (
                                <span key={ch} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px]">
                                  {chan && <chan.icon className="w-3 h-3" />}
                                  {chan?.label || ch}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Info grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {c.budget_preference && (
                            <div className="bg-white/[0.03] rounded-lg p-2">
                              <div className="text-[10px] text-gray-600">Бюджет</div>
                              <div className="text-xs text-white font-medium mt-0.5">
                                {BUDGETS.find(b => b.id === c.budget_preference)?.label || c.budget_preference}
                                {c.final_price > 0 && ` - ${c.final_price.toLocaleString('ru-RU')} ₽`}
                              </div>
                            </div>
                          )}
                          {c.start_date && (
                            <div className="bg-white/[0.03] rounded-lg p-2">
                              <div className="text-[10px] text-gray-600">Начало</div>
                              <div className="text-xs text-white font-medium mt-0.5">{formatDate(c.start_date)}</div>
                            </div>
                          )}
                          {c.end_date && (
                            <div className="bg-white/[0.03] rounded-lg p-2">
                              <div className="text-[10px] text-gray-600">Окончание</div>
                              <div className="text-xs text-white font-medium mt-0.5">{formatDate(c.end_date)}</div>
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
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {(c.status === 'pending_review' || c.status === 'rejected') && (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleDelete(c.id); } }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 text-xs transition-colors cursor-pointer"
                            >
                              {deleting === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              <span>Удалить</span>
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

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showForm && (
          <CreateCampaignModal
            userId={userId}
            artistName={artistName}
            onClose={() => setShowForm(false)}
            onCreated={() => { fetchCampaigns(); setShowForm(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════
// CREATE CAMPAIGN MODAL
// ══════════════════════════════════════════════════

function CreateCampaignModal({
  userId,
  artistName,
  onClose,
  onCreated,
}: {
  userId: string;
  artistName: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [budget, setBudget] = useState('medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ageRange, setAgeRange] = useState('18-45');
  const [geography, setGeography] = useState('Россия');

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const canNext = () => {
    if (step === 1) return name.trim().length >= 3;
    if (step === 2) return selectedChannels.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const budgetInfo = BUDGETS.find(b => b.id === budget);
      const res = await fetch(`${API}/campaigns`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({
          campaign_name: name.trim(),
          user_id: userId,
          artist_name: artistName,
          description: description.trim(),
          channels: selectedChannels,
          content_ids: ['track-1'],
          start_date: startDate || null,
          end_date: endDate || null,
          budget_preference: budget,
          final_price: budgetInfo?.price || 0,
          target_audience: {
            age_range: ageRange,
            gender: 'all',
            geography: geography.split(',').map(g => g.trim()).filter(Boolean),
            interests: [],
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Кампания отправлена на модерацию');
        onCreated();
      } else {
        toast.error(data.error || 'Ошибка создания');
      }
    } catch (e) {
      toast.error('Ошибка сети');
    }
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl backdrop-blur-2xl bg-[#12121f]/95 border border-white/15 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Новая промо-кампания</div>
              <div className="text-gray-500 text-[10px]">Шаг {step} из 3</div>
            </div>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={onClose}
            onKeyDown={(e) => { if (e.key === 'Enter') onClose(); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-5 space-y-4" style={{ minHeight: '280px' }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-white font-medium text-sm">Основная информация</div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">Название кампании</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например: Продвижение сингла «Новый день»"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">Описание (необязательно)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Цели кампании, особые пожелания..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs block mb-1.5">Дата начала</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1.5">Дата окончания</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-white font-medium text-sm">Каналы продвижения</div>
                <div className="text-gray-500 text-xs">Выберите один или несколько каналов</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CHANNELS.map(ch => {
                    const sel = selectedChannels.includes(ch.id);
                    return (
                      <div
                        key={ch.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleChannel(ch.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') toggleChannel(ch.id); }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                          sel
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                            : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.06]'
                        }`}
                      >
                        <ch.icon className="w-5 h-5" />
                        <span className="text-[11px] font-medium">{ch.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs block mb-1.5">Возраст аудитории</label>
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="14-25">14 - 25</option>
                      <option value="18-35">18 - 35</option>
                      <option value="18-45">18 - 45</option>
                      <option value="25-55">25 - 55</option>
                      <option value="all">Все возрасты</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1.5">География</label>
                    <input
                      type="text"
                      value={geography}
                      onChange={(e) => setGeography(e.target.value)}
                      placeholder="Россия, СНГ"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-white font-medium text-sm">Бюджет</div>
                <div className="space-y-2">
                  {BUDGETS.map(b => (
                    <div
                      key={b.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setBudget(b.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setBudget(b.id); }}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        budget === b.id
                          ? 'bg-purple-500/15 border-purple-500/40'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div>
                        <div className={`text-sm font-medium ${budget === b.id ? 'text-purple-300' : 'text-white'}`}>{b.label}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{b.desc}</div>
                      </div>
                      {b.price > 0 && (
                        <div className={`text-sm font-bold ${budget === b.id ? 'text-purple-300' : 'text-gray-400'}`}>
                          {b.price.toLocaleString('ru-RU')} ₽
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Итого</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">{name}</div>
                      <div className="text-gray-500 text-[11px]">
                        {selectedChannels.length} канал{selectedChannels.length !== 1 ? (selectedChannels.length < 5 ? 'а' : 'ов') : ''} - {ageRange} лет - {geography}
                      </div>
                    </div>
                    <div className="text-purple-300 text-lg font-bold">
                      {(BUDGETS.find(b => b.id === budget)?.price || 0).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
          <div
            role="button"
            tabIndex={0}
            onClick={() => { if (step > 1) setStep(step - 1); else onClose(); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { if (step > 1) setStep(step - 1); else onClose(); } }}
            className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors cursor-pointer"
          >
            {step > 1 ? 'Назад' : 'Отмена'}
          </div>

          {step < 3 ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => { if (canNext()) setStep(step + 1); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && canNext()) setStep(step + 1); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                canNext()
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              <span>Далее</span>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => { if (!submitting) handleSubmit(); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !submitting) handleSubmit(); }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{submitting ? 'Отправка...' : 'Отправить на модерацию'}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
