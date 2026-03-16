import config from '@/config/environment';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, TrendingUp, Music2, Sparkles, Download, Share2, Clock, CheckCircle, CreditCard, Shield, Users, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicApiKey } from '@/utils/auth/info';

interface ExpertReview {
  id: string;
  expert_name: string;
  expert_email: string;
  status: string;
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
  audio_notes?: { id: string; timestamp: string; comment: string; category: string }[];
  completed_at?: string;
}

interface TrackTestRequest {
  id: string;
  track_title: string;
  artist_name: string;
  genre?: string;
  status: string;
  required_expert_count: number;
  completed_reviews_count: number;
  average_rating?: number;
  category_averages?: {
    mixing_mastering: number;
    arrangement: number;
    originality: number;
    commercial_potential: number;
  };
  consolidated_feedback?: string;
  consolidated_recommendations?: string;
  created_at: string;
  completed_at?: string;
}

interface TrackTestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

export function TrackTestDetailsModal({ isOpen, onClose, requestId }: TrackTestDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<TrackTestRequest | null>(null);
  const [reviews, setReviews] = useState<ExpertReview[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'experts'>('summary');

  useEffect(() => {
    if (isOpen && requestId) {
      fetchDetails();
    }
  }, [isOpen, requestId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${config.functionsUrl}/api/track-test/requests/${requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch details');
      }

      const data = await response.json();
      setRequest(data.request);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching track test details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8) return 'bg-green-400/10 border-green-400/20';
    if (score >= 6) return 'bg-yellow-400/10 border-yellow-400/20';
    return 'bg-red-400/10 border-red-400/20';
  };

  // ── Progress stepper logic ──
  const STEPS = [
    { key: 'payment', label: 'Оплата', icon: CreditCard },
    { key: 'moderation', label: 'Модерация', icon: Shield },
    { key: 'experts', label: 'Эксперты', icon: Users },
    { key: 'review', label: 'Оценка', icon: Star },
    { key: 'analysis', label: 'Анализ', icon: FileText },
    { key: 'report', label: 'Отчёт', icon: Send },
  ] as const;

  const getStepIndex = (status: string): number => {
    switch (status) {
      case 'pending_payment': return 0;
      case 'payment_succeeded':
      case 'pending_moderation': return 1;
      case 'moderation_rejected': return -1; // rejected
      case 'pending_expert_assignment': return 2;
      case 'experts_assigned': return 2;
      case 'in_review':
      case 'review_in_progress': return 3;
      case 'analysis_generated':
      case 'pending_admin_review':
      case 'pending_admin_approval': return 4;
      case 'completed': return 5;
      case 'rejected': return -1;
      default: return 0;
    }
  };

  const isRejected = request?.status === 'moderation_rejected' || request?.status === 'rejected';

  // ── Download report ──
  const handleDownloadReport = useCallback(() => {
    if (!request) return;
    const lines: string[] = [];
    lines.push(`ОТЧЁТ ПО ТЕСТУ ТРЕКА - ПРОМО.МУЗЫКА`);
    lines.push(`${'='.repeat(50)}`);
    lines.push(`Трек: ${request.track_title}`);
    lines.push(`Артист: ${request.artist_name}`);
    if (request.genre) lines.push(`Жанр: ${request.genre}`);
    lines.push(`Дата создания: ${new Date(request.created_at).toLocaleDateString('ru-RU')}`);
    if (request.completed_at) lines.push(`Дата завершения: ${new Date(request.completed_at).toLocaleDateString('ru-RU')}`);
    lines.push('');

    if (request.average_rating) {
      lines.push(`СРЕДНЯЯ ОЦЕНКА: ${request.average_rating.toFixed(1)}/10`);
      lines.push(`Экспертов: ${request.completed_reviews_count}`);
      lines.push('');
    }

    if (request.category_averages) {
      lines.push(`ОЦЕНКИ ПО КРИТЕРИЯМ:`);
      lines.push(`  Сведение и мастеринг: ${request.category_averages.mixing_mastering.toFixed(1)}/10`);
      lines.push(`  Аранжировка: ${request.category_averages.arrangement.toFixed(1)}/10`);
      lines.push(`  Оригинальность: ${request.category_averages.originality.toFixed(1)}/10`);
      lines.push(`  Коммерческий потенциал: ${request.category_averages.commercial_potential.toFixed(1)}/10`);
      lines.push('');
    }

    if (request.consolidated_feedback) {
      lines.push(`ОБЩИЙ ФИДБЕК:`);
      lines.push(request.consolidated_feedback);
      lines.push('');
    }

    if (request.consolidated_recommendations) {
      lines.push(`РЕКОМЕНДАЦИИ:`);
      lines.push(request.consolidated_recommendations);
      lines.push('');
    }

    if (reviews.length > 0) {
      lines.push(`${'='.repeat(50)}`);
      lines.push(`ОЦЕНКИ ЭКСПЕРТОВ (${reviews.length})`);
      lines.push('');
      reviews.forEach((rv, idx) => {
        if (rv.status !== 'completed') return;
        lines.push(`--- Эксперт ${idx + 1}: ${rv.expert_name} ---`);
        lines.push(`Общая оценка: ${rv.overall_score}/10`);
        lines.push(`Сведение: ${rv.mixing_mastering_score} | Аранжировка: ${rv.arrangement_score} | Оригинальность: ${rv.originality_score} | Потенциал: ${rv.commercial_potential_score}`);
        if (rv.general_feedback) lines.push(`Комментарий: ${rv.general_feedback}`);
        if (rv.recommendations) lines.push(`Рекомендации: ${rv.recommendations}`);
        if (rv.audio_notes && rv.audio_notes.length > 0) {
          lines.push(`Замечания по таймкодам:`);
          rv.audio_notes.forEach(n => lines.push(`  [${n.timestamp}] (${n.category}) ${n.comment}`));
        }
        lines.push('');
      });
    }

    lines.push(`${'='.repeat(50)}`);
    lines.push(`Сгенерировано на ПРОМО.МУЗЫКА`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `track-test-${request.track_title.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Отчёт скачан');
  }, [request, reviews]);

  // ── Share link ──
  const handleShare = useCallback(() => {
    if (!request) return;
    const text = request.average_rating
      ? `Тест трека "${request.track_title}" - ${request.artist_name} | Оценка: ${request.average_rating.toFixed(1)}/10 | ПРОМО.МУЗЫКА`
      : `Тест трека "${request.track_title}" - ${request.artist_name} | ПРОМО.МУЗЫКА`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Скопировано в буфер обмена');
    }).catch(() => {
      toast.error('Не удалось скопировать');
    });
  }, [request]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0a0a14] rounded-2xl border border-white/10 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-1">
                {request?.track_title || 'Загрузка...'}
              </h3>
              <p className="text-gray-400">{request?.artist_name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : request ? (
            <div className="contents">
              {/* Progress Stepper */}
              <div className="mb-6">
                {isRejected ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-400 text-sm font-medium">
                      {request.status === 'moderation_rejected'
                        ? 'Заявка отклонена на модерации. Средства возвращены.'
                        : 'Анализ отклонён администратором.'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(request.status);
                      const StepIcon = step.icon;
                      const isCompleted = idx < currentIdx;
                      const isCurrent = idx === currentIdx;
                      const isFuture = idx > currentIdx;

                      return (
                        <div key={step.key} className="flex items-center flex-1 last:flex-none">
                          {/* Step circle */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isCompleted
                                  ? 'bg-purple-500 border-purple-500'
                                  : isCurrent
                                  ? 'bg-purple-500/20 border-purple-400 animate-pulse'
                                  : 'bg-white/5 border-white/10'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : (
                                <StepIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-purple-300' : 'text-gray-500'}`} />
                              )}
                            </div>
                            <span
                              className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                                isCompleted
                                  ? 'text-purple-400'
                                  : isCurrent
                                  ? 'text-purple-300'
                                  : 'text-gray-600'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                          {/* Connector line */}
                          {idx < STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 mx-1 mt-[-14px] rounded-full transition-colors ${
                                isCompleted ? 'bg-purple-500' : 'bg-white/10'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-white/10">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'summary'
                      ? 'text-purple-400 border-purple-400'
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  Сводка
                </button>
                <button
                  onClick={() => setActiveTab('experts')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'experts'
                      ? 'text-purple-400 border-purple-400'
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  Оценки экспертов ({reviews.length})
                </button>
              </div>

              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  {/* Overall Rating */}
                  {request.average_rating && (
                    <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <p className="text-gray-400 mb-2">Средняя оценка</p>
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-8 h-8 text-yellow-400 fill-current" />
                        <span className="text-5xl font-bold text-white">
                          {request.average_rating.toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-xl">/10</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        На основе {request.completed_reviews_count} оценок
                      </p>
                    </div>
                  )}

                  {/* Category Scores */}
                  {request.category_averages && (
                    <div>
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        Оценки по критериям
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${getScoreBackground(request.category_averages.mixing_mastering)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">🎵 Сведение и мастеринг</span>
                            <span className={`text-2xl font-bold ${getScoreColor(request.category_averages.mixing_mastering)}`}>
                              {request.category_averages.mixing_mastering.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                request.category_averages.mixing_mastering >= 8
                                  ? 'bg-green-400'
                                  : request.category_averages.mixing_mastering >= 6
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${request.category_averages.mixing_mastering * 10}%` }}
                            />
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl border ${getScoreBackground(request.category_averages.arrangement)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">🎯 Аранжировка</span>
                            <span className={`text-2xl font-bold ${getScoreColor(request.category_averages.arrangement)}`}>
                              {request.category_averages.arrangement.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                request.category_averages.arrangement >= 8
                                  ? 'bg-green-400'
                                  : request.category_averages.arrangement >= 6
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${request.category_averages.arrangement * 10}%` }}
                            />
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl border ${getScoreBackground(request.category_averages.originality)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">🏆 Оригинальность</span>
                            <span className={`text-2xl font-bold ${getScoreColor(request.category_averages.originality)}`}>
                              {request.category_averages.originality.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                request.category_averages.originality >= 8
                                  ? 'bg-green-400'
                                  : request.category_averages.originality >= 6
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${request.category_averages.originality * 10}%` }}
                            />
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl border ${getScoreBackground(request.category_averages.commercial_potential)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">📈 Коммерческий потенциал</span>
                            <span className={`text-2xl font-bold ${getScoreColor(request.category_averages.commercial_potential)}`}>
                              {request.category_averages.commercial_potential.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                request.category_averages.commercial_potential >= 8
                                  ? 'bg-green-400'
                                  : request.category_averages.commercial_potential >= 6
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${request.category_averages.commercial_potential * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Consolidated Feedback */}
                  {request.consolidated_feedback && (
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Общий фидбек
                      </h4>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 whitespace-pre-line">
                          {request.consolidated_feedback}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {request.consolidated_recommendations && (
                    <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Music2 className="w-5 h-5 text-purple-400" />
                        Рекомендации
                      </h4>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 whitespace-pre-line">
                          {request.consolidated_recommendations}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2" onClick={handleDownloadReport}>
                      <Download className="w-5 h-5" />
                      Скачать отчет
                    </button>
                    <button className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2" onClick={handleShare}>
                      <Share2 className="w-5 h-5" />
                      Поделиться
                    </button>
                  </div>
                </div>
              )}

              {/* Experts Tab */}
              {activeTab === 'experts' && (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-6 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h5 className="text-white font-semibold">
                            {review.expert_name}
                          </h5>
                          <p className="text-sm text-gray-400">
                            {review.completed_at
                              ? new Date(review.completed_at).toLocaleDateString('ru-RU')
                              : 'В процессе'}
                          </p>
                        </div>
                        {review.status === 'completed' && (
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-xl font-bold text-white">
                              {review.overall_score}
                            </span>
                          </div>
                        )}
                      </div>

                      {review.status === 'completed' ? (
                        <div className="contents">
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="text-center p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-gray-400 mb-1">Сведение</p>
                              <p className={`text-lg font-bold ${getScoreColor(review.mixing_mastering_score)}`}>
                                {review.mixing_mastering_score}
                              </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-gray-400 mb-1">Аранжировка</p>
                              <p className={`text-lg font-bold ${getScoreColor(review.arrangement_score)}`}>
                                {review.arrangement_score}
                              </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-gray-400 mb-1">Оригинальность</p>
                              <p className={`text-lg font-bold ${getScoreColor(review.originality_score)}`}>
                                {review.originality_score}
                              </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-gray-400 mb-1">Потенциал</p>
                              <p className={`text-lg font-bold ${getScoreColor(review.commercial_potential_score)}`}>
                                {review.commercial_potential_score}
                              </p>
                            </div>
                          </div>

                          {review.general_feedback && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-400 mb-1">Общий фидбек:</p>
                              <p className="text-gray-300">{review.general_feedback}</p>
                            </div>
                          )}

                          {review.recommendations && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Рекомендации:</p>
                              <p className="text-gray-300">{review.recommendations}</p>
                            </div>
                          )}

                          {/* Audio Notes (Замечания по таймкодам) */}
                          {review.audio_notes && review.audio_notes.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                              <p className="text-sm text-gray-400 mb-2 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                Замечания по таймкодам ({review.audio_notes.length})
                              </p>
                              <div className="space-y-2">
                                {review.audio_notes.map((note) => (
                                  <div
                                    key={note.id}
                                    className="flex items-start gap-3 p-2.5 rounded-lg bg-cyan-400/5 border border-cyan-400/10"
                                  >
                                    <span className="px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 text-xs font-mono font-bold flex-shrink-0">
                                      {note.timestamp}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs text-cyan-400/70 font-medium">{note.category}</span>
                                      <p className="text-gray-300 text-sm mt-0.5">{note.comment}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">
                          Оценка в процессе...
                        </p>
                      )}
                    </div>
                  ))}

                  {reviews.length === 0 && (
                    <p className="text-gray-400 text-center py-8">
                      Эксперты еще не назначены
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Не удалось загрузить данные
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}