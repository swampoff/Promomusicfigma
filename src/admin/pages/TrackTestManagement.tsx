import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlaskConical, CheckCircle, XCircle, Clock, Users, Send, Eye,
  ChevronDown, RefreshCw, AlertTriangle, Star, TrendingUp,
  FileText, MessageSquare, Filter, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/track-test`;
const headers: HeadersInit = {
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
};

// ── Types ──

interface TrackTestRequest {
  id: string;
  user_id: string | null;
  track_title: string;
  artist_name: string;
  genre?: string;
  guest_email?: string;
  status: string;
  payment_status: string;
  payment_amount: number;
  payment_transaction_id?: string;
  required_expert_count: number;
  completed_reviews_count: number;
  assigned_experts: string[];
  average_rating?: number;
  category_averages?: {
    mixing_mastering: number;
    arrangement: number;
    originality: number;
    commercial_potential: number;
  };
  final_analysis?: string;
  consolidated_feedback?: string;
  consolidated_recommendations?: string;
  admin_approval_status?: string;
  moderation_notes?: string;
  rejection_reason?: string;
  feedback_sent_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface ExpertReview {
  id: string;
  expert_name: string;
  expert_email: string;
  status: string;
  overall_score: number;
  mixing_mastering_score: number;
  arrangement_score: number;
  originality_score: number;
  commercial_potential_score: number;
  general_feedback: string;
  recommendations: string;
  audio_notes?: { id: string; timestamp: string; comment: string; category: string }[];
  completed_at?: string;
}

// ── Status config ──

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending_payment: { label: 'Ожидает оплаты', color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20', icon: Clock },
  payment_succeeded: { label: 'Оплачено', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle },
  pending_moderation: { label: 'На модерации', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', icon: Clock },
  moderation_rejected: { label: 'Отклонено', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: XCircle },
  pending_expert_assignment: { label: 'Ожидает экспертов', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', icon: Users },
  experts_assigned: { label: 'Эксперты назначены', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: Users },
  in_review: { label: 'Идет оценка', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: RefreshCw },
  review_in_progress: { label: 'Идет оценка', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: RefreshCw },
  analysis_generated: { label: 'Анализ готов', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20', icon: FileText },
  pending_admin_review: { label: 'Ожидает одобрения', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: Eye },
  pending_admin_approval: { label: 'Ожидает одобрения', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: Eye },
  completed: { label: 'Завершено', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', icon: CheckCircle },
  rejected: { label: 'Отклонено', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: XCircle },
};

const FILTER_TABS = [
  { id: 'all', label: 'Все' },
  { id: 'action_needed', label: 'Требуют действия' },
  { id: 'in_progress', label: 'В процессе' },
  { id: 'completed', label: 'Завершены' },
];

function getStatusInfo(status: string) {
  return STATUS_CONFIG[status] || { label: status, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20', icon: Clock };
}

// ── Component ──

export function TrackTestManagement() {
  const [requests, setRequests] = useState<TrackTestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailReviews, setDetailReviews] = useState<ExpertReview[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [moderationNote, setModerationNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/requests`, { headers });
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error loading track test requests:', err);
      toast.error('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const loadReviews = async (requestId: string) => {
    try {
      setDetailLoading(true);
      const res = await fetch(`${API_BASE}/requests/${requestId}`, { headers });
      const data = await res.json();
      if (data.success) {
        setDetailReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetailReviews([]);
    } else {
      setExpandedId(id);
      loadReviews(id);
    }
  };

  // ── Actions ──

  const handleModerate = async (requestId: string, action: 'approve' | 'reject') => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`${API_BASE}/moderate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          request_id: requestId,
          action,
          notes: moderationNote || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'approve' ? 'Заявка одобрена' : 'Заявка отклонена, средства возвращены');
        setModerationNote('');
        setRejectionReason('');
        await loadRequests();
      } else {
        toast.error(data.error || 'Ошибка модерации');
      }
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinalize = async (requestId: string, action: 'approve' | 'reject') => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`${API_BASE}/finalize`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          request_id: requestId,
          action,
          rejection_reason: action === 'reject' ? rejectionReason : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'approve') {
          toast.success('Анализ одобрен');
        } else {
          toast.success('Анализ отклонён');
        }
        setRejectionReason('');
        await loadRequests();
      } else {
        toast.error(data.error || 'Ошибка финализации');
      }
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendFeedback = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`${API_BASE}/send-feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ request_id: requestId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Отчёт отправлен артисту');
        await loadRequests();
      } else {
        toast.error(data.error || 'Ошибка отправки');
      }
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filtering ──

  const actionNeededStatuses = ['payment_succeeded', 'pending_moderation', 'analysis_generated', 'pending_admin_review', 'pending_admin_approval'];
  const inProgressStatuses = ['pending_expert_assignment', 'experts_assigned', 'in_review', 'review_in_progress'];
  const completedStatuses = ['completed', 'rejected', 'moderation_rejected'];

  const filtered = requests.filter((r) => {
    if (search) {
      const s = search.toLowerCase();
      if (!r.track_title.toLowerCase().includes(s) && !r.artist_name.toLowerCase().includes(s) && !r.id.toLowerCase().includes(s)) {
        return false;
      }
    }
    if (filter === 'action_needed') return actionNeededStatuses.includes(r.status);
    if (filter === 'in_progress') return inProgressStatuses.includes(r.status);
    if (filter === 'completed') return completedStatuses.includes(r.status);
    return true;
  });

  const counts = {
    all: requests.length,
    action_needed: requests.filter((r) => actionNeededStatuses.includes(r.status)).length,
    in_progress: requests.filter((r) => inProgressStatuses.includes(r.status)).length,
    completed: requests.filter((r) => completedStatuses.includes(r.status)).length,
  };

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <FlaskConical className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Тест трека</h2>
            <p className="text-sm text-gray-400">Управление заявками на экспертную оценку</p>
          </div>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Всего заявок</p>
          <p className="text-2xl font-bold text-white">{counts.all}</p>
        </div>
        <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
          <p className="text-yellow-400 text-xs mb-1">Требуют действия</p>
          <p className="text-2xl font-bold text-yellow-400">{counts.action_needed}</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-400/5 border border-blue-400/20">
          <p className="text-blue-400 text-xs mb-1">В процессе</p>
          <p className="text-2xl font-bold text-blue-400">{counts.in_progress}</p>
        </div>
        <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/20">
          <p className="text-green-400 text-xs mb-1">Завершены</p>
          <p className="text-2xl font-bold text-green-400">{counts.completed}</p>
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-60">{counts[tab.id as keyof typeof counts]}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по треку, артисту или ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Request list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FlaskConical className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Заявок не найдено</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const si = getStatusInfo(req.status);
            const StatusIcon = si.icon;
            const isExpanded = expandedId === req.id;
            const needsModeration = req.status === 'payment_succeeded' || req.status === 'pending_moderation';
            const needsFinalization = req.status === 'analysis_generated' || req.status === 'pending_admin_review' || req.status === 'pending_admin_approval';
            const needsFeedbackSend = req.status === 'completed' && !req.feedback_sent_date;

            return (
              <motion.div
                key={req.id}
                layout
                className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden"
              >
                {/* Row header */}
                <button
                  onClick={() => handleExpand(req.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold truncate">{req.track_title}</span>
                      <span className="text-gray-500">-</span>
                      <span className="text-gray-400 truncate">{req.artist_name}</span>
                      {req.genre && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">{req.genre}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{new Date(req.created_at).toLocaleDateString('ru-RU')}</span>
                      <span>{req.payment_amount} ₽</span>
                      <span>{req.completed_reviews_count}/{req.required_expert_count} экспертов</span>
                      {req.feedback_sent_date && <span className="text-green-500">Отчёт отправлен</span>}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${si.bg} ${si.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {si.label}
                  </div>

                  {/* Action indicator */}
                  {(needsModeration || needsFinalization || needsFeedbackSend) && (
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  )}

                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 space-y-4 border-t border-white/5">
                        {/* Info grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">ID</p>
                            <p className="text-xs text-gray-300 font-mono">{req.id.slice(0, 12)}...</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Пользователь</p>
                            <p className="text-xs text-gray-300">{req.guest_email || req.user_id || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Транзакция</p>
                            <p className="text-xs text-gray-300 font-mono">{req.payment_transaction_id?.slice(0, 12) || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Оплата</p>
                            <p className={`text-xs font-medium ${req.payment_status === 'completed' ? 'text-green-400' : req.payment_status === 'refunded' ? 'text-red-400' : 'text-yellow-400'}`}>
                              {req.payment_status === 'completed' ? 'Оплачено' : req.payment_status === 'refunded' ? 'Возврат' : 'Ожидает'}
                            </p>
                          </div>
                        </div>

                        {/* Average rating */}
                        {req.average_rating && (
                          <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-400" />
                              <span className="text-xl font-bold text-white">{req.average_rating.toFixed(1)}</span>
                              <span className="text-gray-500 text-sm">/10</span>
                            </div>
                            {req.category_averages && (
                              <div className="flex gap-4 text-xs text-gray-400">
                                <span>Сведение: <strong className="text-white">{req.category_averages.mixing_mastering}</strong></span>
                                <span>Аранж.: <strong className="text-white">{req.category_averages.arrangement}</strong></span>
                                <span>Ориг.: <strong className="text-white">{req.category_averages.originality}</strong></span>
                                <span>Потенциал: <strong className="text-white">{req.category_averages.commercial_potential}</strong></span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Consolidated feedback */}
                        {req.consolidated_feedback && (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-purple-400" />
                              Консолидированный анализ
                            </h4>
                            <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{req.consolidated_feedback}</p>
                            {req.consolidated_recommendations && (
                              <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed mt-3 pt-3 border-t border-white/5">
                                {req.consolidated_recommendations}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Expert reviews */}
                        {detailLoading ? (
                          <div className="py-4 text-center">
                            <RefreshCw className="w-5 h-5 text-gray-500 animate-spin mx-auto" />
                          </div>
                        ) : detailReviews.length > 0 && (
                          <div>
                            <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-400" />
                              Оценки экспертов ({detailReviews.length})
                            </h4>
                            <div className="space-y-2">
                              {detailReviews.map((rv) => (
                                <div key={rv.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 flex items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white text-sm font-medium">{rv.expert_name}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${rv.status === 'completed' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                                        {rv.status === 'completed' ? 'Завершено' : 'В процессе'}
                                      </span>
                                    </div>
                                    {rv.status === 'completed' && (
                                      <div className="contents">
                                        <div className="flex gap-3 mt-1 text-xs text-gray-400">
                                          <span>Свед: <strong className="text-white">{rv.mixing_mastering_score}</strong></span>
                                          <span>Аранж: <strong className="text-white">{rv.arrangement_score}</strong></span>
                                          <span>Ориг: <strong className="text-white">{rv.originality_score}</strong></span>
                                          <span>Потенц: <strong className="text-white">{rv.commercial_potential_score}</strong></span>
                                          <span>Общая: <strong className="text-yellow-400">{rv.overall_score}</strong></span>
                                        </div>
                                        {rv.general_feedback && (
                                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{rv.general_feedback}</p>
                                        )}
                                        {rv.audio_notes && rv.audio_notes.length > 0 && (
                                          <div className="mt-1 flex items-center gap-1 text-xs text-cyan-400">
                                            <Clock className="w-3 h-3" />
                                            {rv.audio_notes.length} замечание(й) по таймкодам
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {rv.status === 'completed' && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-yellow-400" />
                                      <span className="text-white font-bold">{rv.overall_score}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="pt-2 space-y-3">
                          {/* Moderation actions */}
                          {needsModeration && (
                            <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20 space-y-3">
                              <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
                                <AlertTriangle className="w-4 h-4" />
                                Требуется модерация
                              </div>
                              <textarea
                                placeholder="Заметки модерации (необязательно)..."
                                value={moderationNote}
                                onChange={(e) => setModerationNote(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400/30 resize-none"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleModerate(req.id, 'approve')}
                                  disabled={actionLoading === req.id}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Одобрить
                                </button>
                                <button
                                  onClick={() => {
                                    if (!moderationNote.trim()) {
                                      toast.error('Укажите причину отклонения');
                                      return;
                                    }
                                    handleModerate(req.id, 'reject');
                                  }}
                                  disabled={actionLoading === req.id}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Отклонить + возврат
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Finalization actions */}
                          {needsFinalization && (
                            <div className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20 space-y-3">
                              <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
                                <FileText className="w-4 h-4" />
                                Анализ готов - требуется одобрение
                              </div>
                              <textarea
                                placeholder="Причина отклонения (если отклоняете)..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/30 resize-none"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleFinalize(req.id, 'approve')}
                                  disabled={actionLoading === req.id}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Одобрить анализ
                                </button>
                                <button
                                  onClick={() => {
                                    if (!rejectionReason.trim()) {
                                      toast.error('Укажите причину отклонения');
                                      return;
                                    }
                                    handleFinalize(req.id, 'reject');
                                  }}
                                  disabled={actionLoading === req.id}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Отклонить
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Send feedback to artist */}
                          {needsFeedbackSend && (
                            <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/20">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                                  <Send className="w-4 h-4" />
                                  Отчёт одобрен - отправить артисту
                                </div>
                                <button
                                  onClick={() => handleSendFeedback(req.id)}
                                  disabled={actionLoading === req.id}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                  <Send className="w-4 h-4" />
                                  Отправить отчёт
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Feedback already sent */}
                          {req.feedback_sent_date && (
                            <div className="flex items-center gap-2 text-xs text-green-400/60">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Отчёт отправлен {new Date(req.feedback_sent_date).toLocaleString('ru-RU')}
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
    </div>
  );
}