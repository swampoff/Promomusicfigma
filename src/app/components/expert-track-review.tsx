import config from '@/config/environment';
/**
 * EXPERT TRACK REVIEW - Shared component for DJ, Producer & Engineer cabinets
 * Experts can browse available track tests, claim them, submit reviews,
 * and earn coins + rating bonuses.
 *
 * Color theming via `accentColor` prop:
 *   DJ → purple, Producer → teal, Engineer → pink
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlaskConical, Music, Star, Coins, TrendingUp, Clock, Users,
  ChevronRight, CheckCircle2, AlertCircle, Loader2, Send,
  Headphones, Sliders, Sparkles, Target, BarChart3, ArrowRight,
  RefreshCw, Award, X, ChevronDown, ChevronUp, Mic, Plus, Trash2,
  Zap, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { useSSEContext } from '@/utils/contexts/SSEContext';

// ── Types ──

interface TrackTest {
  id: string;
  track_title: string;
  artist_name: string;
  genre?: string;
  status: string;
  required_expert_count: number;
  completed_reviews_count: number;
  assigned_experts: string[];
  created_at: string;
}

interface MyReview {
  review: {
    id: string;
    request_id: string;
    status: 'assigned' | 'in_progress' | 'completed';
    mixing_mastering_score: number;
    arrangement_score: number;
    originality_score: number;
    commercial_potential_score: number;
    overall_score: number;
    general_feedback: string;
    reward_points: number;
    completed_at?: string;
  };
  request: TrackTest;
}

interface ExpertStats {
  total_assigned: number;
  total_completed: number;
  total_coins: number;
  rating_bonus: number;
}

interface ReviewFormData {
  mixing_mastering_score: number;
  arrangement_score: number;
  originality_score: number;
  commercial_potential_score: number;
  overall_score: number;
  mixing_mastering_feedback: string;
  arrangement_feedback: string;
  originality_feedback: string;
  commercial_potential_feedback: string;
  general_feedback: string;
  recommendations: string;
  audio_notes: AudioNote[];
}

interface AudioNote {
  id: string;
  timestamp: string;  // e.g. "1:23"
  comment: string;
  category: 'mixing' | 'arrangement' | 'vocal' | 'general';
}

// ── Color presets ──

type AccentTheme = 'purple' | 'teal' | 'pink';

const ACCENT = {
  purple: {
    bg: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-500/10',
    bgLightHover: 'hover:bg-purple-500/20',
    border: 'border-purple-500/20',
    borderActive: 'border-purple-500/40',
    text: 'text-purple-400',
    textBright: 'text-purple-300',
    fill: 'fill-purple-400',
    shadow: 'shadow-purple-500/20',
    btn: 'bg-purple-600 hover:bg-purple-500',
    ring: 'ring-purple-500/30',
    gradient: 'from-purple-400 to-violet-400',
  },
  teal: {
    bg: 'from-teal-500 to-emerald-500',
    bgLight: 'bg-teal-500/10',
    bgLightHover: 'hover:bg-teal-500/20',
    border: 'border-teal-500/20',
    borderActive: 'border-teal-500/40',
    text: 'text-teal-400',
    textBright: 'text-teal-300',
    fill: 'fill-teal-400',
    shadow: 'shadow-teal-500/20',
    btn: 'bg-teal-600 hover:bg-teal-500',
    ring: 'ring-teal-500/30',
    gradient: 'from-teal-400 to-emerald-400',
  },
  pink: {
    bg: 'from-[#FF577F] to-rose-600',
    bgLight: 'bg-[#FF577F]/10',
    bgLightHover: 'hover:bg-[#FF577F]/20',
    border: 'border-[#FF577F]/20',
    borderActive: 'border-[#FF577F]/40',
    text: 'text-[#FF577F]',
    textBright: 'text-[#FF6B8F]',
    fill: 'fill-[#FF577F]',
    shadow: 'shadow-[#FF577F]/20',
    btn: 'bg-[#FF577F] hover:bg-[#FF4D7D]',
    ring: 'ring-[#FF577F]/30',
    gradient: 'from-[#FF577F] to-rose-400',
  },
} as const;

// ── Props ──

export interface ExpertTrackReviewProps {
  expertId: string;
  expertName: string;
  expertRole: 'dj' | 'producer' | 'engineer';
  accentColor: AccentTheme;
}

// ── API helpers ──

const API_BASE = `${config.functionsUrl}/api/track-test`;
const headers = { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };

async function fetchAvailable(expertId: string): Promise<TrackTest[]> {
  const res = await fetch(`${API_BASE}/available-for-review?expert_id=${encodeURIComponent(expertId)}`, { headers });
  const data = await res.json();
  return data.success ? data.tests : [];
}

async function fetchMyReviews(expertId: string): Promise<MyReview[]> {
  const res = await fetch(`${API_BASE}/expert/my-reviews?expert_id=${encodeURIComponent(expertId)}`, { headers });
  const data = await res.json();
  return data.success ? data.reviews : [];
}

async function fetchStats(expertId: string): Promise<ExpertStats> {
  const res = await fetch(`${API_BASE}/expert/stats?expert_id=${encodeURIComponent(expertId)}`, { headers });
  const data = await res.json();
  return data.success ? data.stats : { total_assigned: 0, total_completed: 0, total_coins: 0, rating_bonus: 0 };
}

async function claimReview(requestId: string, expertId: string, expertName: string, expertRole: string) {
  const res = await fetch(`${API_BASE}/claim-review`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ request_id: requestId, expert_id: expertId, expert_name: expertName, expert_role: expertRole }),
  });
  return res.json();
}

async function submitReview(reviewId: string, form: ReviewFormData) {
  const res = await fetch(`${API_BASE}/submit-review`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ review_id: reviewId, ...form }),
  });
  return res.json();
}

// ── Helpers ──

const GENRE_EMOJI: Record<string, string> = {
  Pop: '🎤', Electronic: '🎧', 'Lo-Fi': '🌙', 'R&B': '💜', 'Hip-Hop': '🎹',
  Rock: '🎸', Jazz: '\ud83c\udfb7', Classical: '🎻', Reggaeton: '💃', Metal: '🤘',
};

function genreEmoji(g?: string) { return g ? GENRE_EMOJI[g] || '🎵' : '🎵'; }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} мин. назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч. назад`;
  return `${Math.floor(hrs / 24)} дн. назад`;
}

// ── Sub-components ──

function ScoreSlider({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent: typeof ACCENT.purple;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className={`text-sm font-black ${accent.text}`}>{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer accent-current"
        style={{ accentColor: accent.text.includes('#') ? '#FF577F' : undefined }}
      />
      <div className="flex justify-between text-[9px] text-slate-600">
        <span>1</span><span>5</span><span>10</span>
      </div>
    </div>
  );
}

// ── Main Component ──

export function ExpertTrackReview({ expertId, expertName, expertRole, accentColor }: ExpertTrackReviewProps) {
  const a = ACCENT[accentColor];
  const sse = useSSEContext();
  const [tab, setTab] = useState<'available' | 'my' | 'stats'>('available');
  const [availableTests, setAvailableTests] = useState<TrackTest[]>([]);
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [stats, setStats] = useState<ExpertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<'quick' | 'full'>('quick');

  const [form, setForm] = useState<ReviewFormData>({
    mixing_mastering_score: 5,
    arrangement_score: 5,
    originality_score: 5,
    commercial_potential_score: 5,
    overall_score: 5,
    mixing_mastering_feedback: '',
    arrangement_feedback: '',
    originality_feedback: '',
    commercial_potential_feedback: '',
    general_feedback: '',
    recommendations: '',
    audio_notes: [],
  });

  const roleLabel = expertRole === 'dj' ? 'DJ' : expertRole === 'producer' ? 'Продюсер' : 'Звукоинженер';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tests, reviews, s] = await Promise.all([
        fetchAvailable(expertId),
        fetchMyReviews(expertId),
        fetchStats(expertId),
      ]);
      setAvailableTests(tests);
      setMyReviews(reviews);
      setStats(s);
    } catch (e) {
      console.error('Error loading expert track test data:', e);
    } finally {
      setLoading(false);
    }
  }, [expertId]);

  useEffect(() => { loadData(); }, [loadData]);

  // SSE: auto-refresh when new track test becomes available
  useEffect(() => {
    if (!sse) return;
    const handler = (data: any) => {
      toast.info(`Новый трек для тестирования: ${data?.trackTitle || 'Новый трек'}`, {
        icon: '🎵',
        duration: 4000,
      });
      loadData();
    };
    sse.on('track_test_available', handler);
    return () => { sse.off('track_test_available', handler); };
  }, [sse, loadData]);

  const handleClaim = async (testId: string) => {
    setClaiming(testId);
    try {
      const result = await claimReview(testId, expertId, expertName, expertRole);
      if (result.success) {
        toast.success('Тест трека взят в работу! +50 монет за рецензию');
        await loadData();
        setTab('my');
      } else {
        toast.error(result.error || 'Не удалось взять тест');
      }
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setClaiming(null);
    }
  };

  const handleSubmitReview = async (reviewId: string) => {
    if (!form.general_feedback.trim()) {
      toast.error('Напишите общий комментарий к треку');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitReview(reviewId, form);
      if (result.success) {
        toast.success(`Рецензия отправлена! +${result.reward || 50} монет`);
        setReviewingId(null);
        setForm({
          mixing_mastering_score: 5, arrangement_score: 5, originality_score: 5,
          commercial_potential_score: 5, overall_score: 5,
          mixing_mastering_feedback: '', arrangement_feedback: '',
          originality_feedback: '', commercial_potential_feedback: '',
          general_feedback: '', recommendations: '',
          audio_notes: [],
        });
        await loadData();
      } else {
        toast.error(result.error || 'Не удалось отправить');
      }
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setSubmitting(false);
    }
  };

  const assignedReviews = myReviews.filter(r => r.review.status === 'assigned' || r.review.status === 'in_progress');
  const completedReviews = myReviews.filter(r => r.review.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${a.bg} p-6 sm:p-8`}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
              className="absolute w-1 rounded-full bg-white"
              style={{ height: `${20 + i * 8}px`, left: `${10 + i * 16}%`, bottom: '0' }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="w-6 h-6 text-white" />
              <h2 className="text-xl sm:text-2xl font-black text-white">Тестирование треков</h2>
            </div>
            <p className="text-white/70 text-sm max-w-lg">
              Оценивайте треки артистов как {roleLabel.toLowerCase()}-эксперт. За каждую рецензию вы получаете монеты и повышение рейтинга.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-black text-white">{stats?.total_coins || 0}</div>
              <div className="text-[10px] text-white/70 font-medium flex items-center gap-1">
                <Coins className="w-3 h-3" /> Монеты
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-black text-white">+{stats?.rating_bonus?.toFixed(2) || '0.00'}</div>
              <div className="text-[10px] text-white/70 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Рейтинг
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
        {([
          { id: 'available', label: 'Доступные', icon: Music, badge: availableTests.length },
          { id: 'my', label: 'Мои рецензии', icon: Star, badge: assignedReviews.length },
          { id: 'stats', label: 'Статистика', icon: BarChart3 },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              tab === t.id
                ? `${a.btn} text-white shadow-lg ${a.shadow}`
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden xs:inline">{t.label}</span>
            {'badge' in t && t.badge !== undefined && t.badge > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === t.id ? 'bg-white/20' : `${a.bgLight} ${a.text}`
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Обновить"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className={`w-8 h-8 ${a.text} animate-spin`} />
        </div>
      )}

      {/* ═══ AVAILABLE TESTS ═══ */}
      {!loading && tab === 'available' && (
        <div className="space-y-3">
          {availableTests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/[0.03] rounded-2xl border border-white/5"
            >
              <CheckCircle2 className={`w-12 h-12 mx-auto mb-3 ${a.text} opacity-40`} />
              <p className="text-slate-400 text-sm">Сейчас нет доступных тестов</p>
              <p className="text-slate-600 text-xs mt-1">Новые треки появятся в ближайшее время</p>
            </motion.div>
          ) : (
            availableTests.map((test, idx) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={`bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-sm rounded-xl border border-white/10 hover:${a.borderActive} transition-all p-4 sm:p-5 group`}
              >
                <div className="flex items-start gap-4">
                  {/* Genre icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.bg} flex items-center justify-center flex-shrink-0 text-xl shadow-lg ${a.shadow} group-hover:scale-110 transition-transform`}>
                    {genreEmoji(test.genre)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white mb-0.5 truncate">{test.track_title}</h3>
                        <p className="text-xs text-slate-400">{test.artist_name}</p>
                      </div>
                      <button
                        onClick={() => handleClaim(test.id)}
                        disabled={claiming === test.id}
                        className={`flex-shrink-0 ${a.btn} text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg ${a.shadow} transition-all flex items-center gap-1.5 disabled:opacity-50`}
                      >
                        {claiming === test.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="contents">
                            <Headphones className="w-3.5 h-3.5" />
                            Взять
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-2.5 flex-wrap text-[10px] sm:text-xs text-slate-500">
                      {test.genre && (
                        <span className={`px-2 py-0.5 rounded-full ${a.bgLight} ${a.text} font-bold`}>
                          {test.genre}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {(test.assigned_experts || []).length}/{test.required_expert_count} экспертов
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(test.created_at)}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Coins className="w-3 h-3" />
                        +50 монет
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ═══ MY REVIEWS ═══ */}
      {!loading && tab === 'my' && (
        <div className="space-y-4">
          {/* Assigned / in progress */}
          {assignedReviews.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${a.text}`} />
                Ожидают вашей оценки
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${a.bgLight} ${a.text}`}>
                  {assignedReviews.length}
                </span>
              </h3>
              {assignedReviews.map((item, idx) => (
                <motion.div
                  key={item.review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white/[0.04] rounded-xl border ${a.border} overflow-hidden`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${a.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                          {genreEmoji(item.request?.genre)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{item.request?.track_title}</h4>
                          <p className="text-xs text-slate-400">{item.request?.artist_name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setReviewingId(reviewingId === item.review.id ? null : item.review.id)}
                        className={`${a.btn} text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg ${a.shadow} flex items-center gap-1.5 transition-all`}
                      >
                        <Star className="w-3.5 h-3.5" />
                        Оценить
                      </button>
                    </div>
                  </div>

                  {/* Review form */}
                  <AnimatePresence>
                    {reviewingId === item.review.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                          {/* Mode toggle */}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                              {reviewMode === 'quick'
                                ? 'Быстрая оценка - только баллы и короткий комментарий'
                                : 'Полная рецензия - баллы, комментарии, рекомендации, таймкоды'}
                            </p>
                            <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-lg border border-white/10 flex-shrink-0 ml-3">
                              <button
                                type="button"
                                onClick={() => setReviewMode('quick')}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                  reviewMode === 'quick'
                                    ? `${a.btn} text-white shadow-sm`
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <Zap className="w-3 h-3" />
                                Быстрая
                              </button>
                              <button
                                type="button"
                                onClick={() => setReviewMode('full')}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                  reviewMode === 'full'
                                    ? `${a.btn} text-white shadow-sm`
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <FileText className="w-3 h-3" />
                                Полная
                              </button>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <ScoreSlider label="Сведение и мастеринг" value={form.mixing_mastering_score} onChange={(v) => setForm(f => ({ ...f, mixing_mastering_score: v }))} accent={a} />
                            <ScoreSlider label="Аранжировка" value={form.arrangement_score} onChange={(v) => setForm(f => ({ ...f, arrangement_score: v }))} accent={a} />
                            <ScoreSlider label="Оригинальность" value={form.originality_score} onChange={(v) => setForm(f => ({ ...f, originality_score: v }))} accent={a} />
                            <ScoreSlider label="Коммерческий потенциал" value={form.commercial_potential_score} onChange={(v) => setForm(f => ({ ...f, commercial_potential_score: v }))} accent={a} />
                          </div>

                          <ScoreSlider label="Общая оценка" value={form.overall_score} onChange={(v) => setForm(f => ({ ...f, overall_score: v }))} accent={a} />

                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Общий комментарий *</label>
                            <textarea
                              value={form.general_feedback}
                              onChange={(e) => setForm(f => ({ ...f, general_feedback: e.target.value }))}
                              placeholder={reviewMode === 'quick' ? 'Краткое впечатление о треке (1-2 предложения)...' : 'Ваши впечатления о треке...'}
                              className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 resize-none ${reviewMode === 'quick' ? 'h-12' : 'h-20'}`}
                            />
                          </div>

                          {/* Full mode: extra fields */}
                          {reviewMode === 'full' && (
                            <div className="contents">
                              <div>
                                <label className="text-xs text-slate-400 block mb-1">Рекомендации артисту</label>
                                <textarea
                                  value={form.recommendations}
                                  onChange={(e) => setForm(f => ({ ...f, recommendations: e.target.value }))}
                                  placeholder="Что можно улучшить..."
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 resize-none h-16"
                                />
                              </div>

                              {/* Audio notes / timestamped comments */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs text-slate-400 flex items-center gap-1.5">
                                    <Mic className="w-3 h-3" />
                                    Замечания по таймкодам
                                  </label>
                                  {form.audio_notes.length < 5 && (
                                    <button
                                      type="button"
                                      onClick={() => setForm(f => ({
                                        ...f,
                                        audio_notes: [
                                          ...f.audio_notes,
                                          { id: crypto.randomUUID(), timestamp: '0:00', comment: '', category: 'general' },
                                        ],
                                      }))}
                                      className={`text-[10px] font-bold ${a.text} ${a.bgLightHover} px-2 py-1 rounded-lg flex items-center gap-1 transition-colors`}
                                    >
                                      <Plus className="w-3 h-3" /> Добавить
                                    </button>
                                  )}
                                </div>
                                {form.audio_notes.length === 0 && (
                                  <p className="text-[10px] text-slate-600 mb-1">
                                    Укажите таймкод и замечание к конкретному моменту трека (до 5 замечаний)
                                  </p>
                                )}
                                <div className="space-y-2">
                                  {form.audio_notes.map((note, ni) => (
                                    <div key={note.id} className="flex items-start gap-2 bg-white/[0.03] rounded-lg p-2 border border-white/5">
                                      <input
                                        value={note.timestamp}
                                        onChange={(e) => {
                                          const notes = [...form.audio_notes];
                                          notes[ni] = { ...notes[ni], timestamp: e.target.value };
                                          setForm(f => ({ ...f, audio_notes: notes }));
                                        }}
                                        placeholder="1:23"
                                        className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono placeholder-slate-600 focus:outline-none focus:border-white/20 flex-shrink-0"
                                      />
                                      <select
                                        value={note.category}
                                        onChange={(e) => {
                                          const notes = [...form.audio_notes];
                                          notes[ni] = { ...notes[ni], category: e.target.value as AudioNote['category'] };
                                          setForm(f => ({ ...f, audio_notes: notes }));
                                        }}
                                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/20 flex-shrink-0 appearance-none w-24"
                                      >
                                        <option value="mixing">Сведение</option>
                                        <option value="arrangement">Аранжировка</option>
                                        <option value="vocal">Вокал</option>
                                        <option value="general">Общее</option>
                                      </select>
                                      <input
                                        value={note.comment}
                                        onChange={(e) => {
                                          const notes = [...form.audio_notes];
                                          notes[ni] = { ...notes[ni], comment: e.target.value };
                                          setForm(f => ({ ...f, audio_notes: notes }));
                                        }}
                                        placeholder="Замечание к этому моменту..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white/20"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setForm(f => ({
                                          ...f,
                                          audio_notes: f.audio_notes.filter(n => n.id !== note.id),
                                        }))}
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1 text-amber-400">
                                <Coins className="w-3.5 h-3.5" /> +50 монет
                              </span>
                              <span className="flex items-center gap-1 text-emerald-400">
                                <TrendingUp className="w-3.5 h-3.5" /> +0.05 рейтинг
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setReviewingId(null)}
                                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                Отмена
                              </button>
                              <button
                                onClick={() => handleSubmitReview(item.review.id)}
                                disabled={submitting}
                                className={`${a.btn} text-white text-xs font-bold px-5 py-2 rounded-xl shadow-lg ${a.shadow} flex items-center gap-1.5 disabled:opacity-50 transition-all`}
                              >
                                {submitting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <span className="contents">
                                    <Send className="w-3.5 h-3.5" />
                                    Отправить
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}

          {/* Completed */}
          {completedReviews.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Завершённые рецензии
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                  {completedReviews.length}
                </span>
              </h3>
              {completedReviews.map((item, idx) => (
                <motion.div
                  key={item.review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedReview(expandedReview === item.review.id ? null : item.review.id)}
                    className="w-full p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-sm flex-shrink-0">
                        {genreEmoji(item.request?.genre)}
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{item.request?.track_title}</h4>
                        <p className="text-xs text-slate-500">{item.request?.artist_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className={`text-sm font-black ${a.text}`}>{item.review.overall_score}/10</div>
                        <div className="text-[10px] text-slate-500">+50 монет</div>
                      </div>
                      {expandedReview === item.review.id ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedReview === item.review.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { label: 'Сведение', score: item.review.mixing_mastering_score },
                              { label: 'Аранжировка', score: item.review.arrangement_score },
                              { label: 'Оригинальность', score: item.review.originality_score },
                              { label: 'Коммерция', score: item.review.commercial_potential_score },
                            ].map((s) => (
                              <div key={s.label} className="bg-white/5 rounded-lg p-2 text-center">
                                <div className={`text-base font-black ${a.text}`}>{s.score}</div>
                                <div className="text-[9px] text-slate-500">{s.label}</div>
                              </div>
                            ))}
                          </div>
                          {item.review.general_feedback && (
                            <p className="text-xs text-slate-400 italic">"{item.review.general_feedback}"</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}

          {assignedReviews.length === 0 && completedReviews.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/[0.03] rounded-2xl border border-white/5"
            >
              <Star className={`w-12 h-12 mx-auto mb-3 ${a.text} opacity-40`} />
              <p className="text-slate-400 text-sm">У вас пока нет рецензий</p>
              <button
                onClick={() => setTab('available')}
                className={`mt-3 text-xs font-bold ${a.text} hover:underline flex items-center gap-1 mx-auto`}
              >
                Посмотреть доступные тесты <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* ═══ STATS ═══ */}
      {!loading && tab === 'stats' && stats && (
        <div className="space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Взято в работу', value: stats.total_assigned, icon: FlaskConical, color: a.text },
              { label: 'Завершено', value: stats.total_completed, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Монеты заработано', value: stats.total_coins, icon: Coins, color: 'text-amber-400' },
              { label: 'Бонус к рейтингу', value: `+${stats.rating_bonus.toFixed(2)}`, icon: TrendingUp, color: a.text },
            ].map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                className={`bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center`}
              >
                <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                <div className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-white/[0.04] rounded-xl border ${a.border} p-5`}
          >
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${a.text}`} />
              Как это работает
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Возьмите трек', desc: 'Выберите трек из списка доступных тестов и возьмите его в работу', icon: Headphones },
                { step: '2', title: 'Оцените', desc: 'Прослушайте трек и оцените по 5 критериям от 1 до 10, напишите фидбек', icon: Sliders },
                { step: '3', title: 'Получите бонусы', desc: 'За каждую рецензию - 50 монет и +0.05 к вашему рейтингу на платформе', icon: Award },
              ].map((s, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${a.bg} flex items-center justify-center flex-shrink-0 text-xs font-black text-white`}>
                    {s.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">{s.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Reward tiers */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/[0.04] rounded-xl border border-white/10 p-5"
          >
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Уровни экспертизы
            </h3>
            <div className="space-y-2">
              {[
                { level: 'Новичок', range: '0-4 рецензий', bonus: '50 монет/рецензия', active: stats.total_completed < 5 },
                { level: 'Эксперт', range: '5-19 рецензий', bonus: '75 монет/рецензия', active: stats.total_completed >= 5 && stats.total_completed < 20 },
                { level: 'Мастер', range: '20-49 рецензий', bonus: '100 монет/рецензия', active: stats.total_completed >= 20 && stats.total_completed < 50 },
                { level: 'Гуру', range: '50+ рецензий', bonus: '150 монет/рецензия', active: stats.total_completed >= 50 },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    tier.active
                      ? `${a.bgLight} border ${a.borderActive}`
                      : 'bg-white/[0.02] border border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      tier.active ? `bg-gradient-to-br ${a.bg} text-white` : 'bg-white/5 text-slate-600'
                    }`}>
                      {idx === 0 ? '🌱' : idx === 1 ? '⭐' : idx === 2 ? '🏆' : '👑'}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${tier.active ? 'text-white' : 'text-slate-500'}`}>{tier.level}</div>
                      <div className="text-[10px] text-slate-500">{tier.range}</div>
                    </div>
                  </div>
                  <div className={`text-xs font-bold ${tier.active ? a.text : 'text-slate-600'}`}>
                    {tier.bonus}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}