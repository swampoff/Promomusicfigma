import config from '@/config/environment';
/**
 * PROMOTION PROMO LAB - Экспериментальное продвижение
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Beaker,
  Brain,
  Zap,
  Sparkles,
  Target,
  Video,
  Coins,
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader,
  Plus,
  Send,
  BarChart3,
  ArrowLeft,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface Experiment {
  id: string;
  experiment_name: string;
  experiment_type: string;
  hypothesis: string;
  description: string;
  budget: number;
  duration_days: number;
  status: string;
  metrics: {
    reach?: number;
    engagement?: number;
    conversions?: number;
  };
  results: Record<string, any>;
  learning: string;
  created_at: string;
}

const EXPERIMENT_TYPES = [
  {
    id: 'ai_targeting',
    name: 'Умный таргетинг',
    description: 'Умный таргетинг аудитории',
    icon: Brain,
    price: 25000,
    features: [
      'ML-алгоритмы подбора',
      'Предиктивная аналитика',
      'Авто-оптимизация',
      'A/B тесты',
    ],
    recommended: true,
  },
  {
    id: 'viral_challenge',
    name: 'Вирусный челлендж',
    description: 'Создание трендового челленджа',
    icon: Zap,
    price: 35000,
    features: [
      'Креатив и механика',
      'Сиды с инфлюенсерами',
      'Tracking распространения',
      'UGC мониторинг',
    ],
  },
  {
    id: 'nft_drop',
    name: 'NFT Drop',
    description: 'Запуск коллекции NFT',
    icon: Sparkles,
    price: 50000,
    features: [
      'Создание коллекции',
      'Смарт-контракты',
      'Маркетинг дропа',
      'Community management',
    ],
  },
  {
    id: 'meta_collab',
    name: 'Мета-коллаборации',
    description: 'Неожиданные коллаборации',
    icon: Users,
    price: 40000,
    features: [
      'Поиск партнёров',
      'Crossover контент',
      'Совместный промо',
      'Новая аудитория',
    ],
  },
  {
    id: 'custom',
    name: 'Кастомный эксперимент',
    description: 'Ваша уникальная идея',
    icon: Beaker,
    price: 30000,
    features: [
      'Индивидуальный подход',
      'Консультация экспертов',
      'Прототипирование',
      'Измерение результатов',
    ],
  },
];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  running: 'Идёт эксперимент',
  analyzing: 'Анализ результатов',
  completed: 'Завершён',
  failed: 'Не удалось',
  cancelled: 'Отменён',
};

export function PromotionPromoLab() {
  const { subscription } = useSubscription();
  const { userId, isAuthenticated } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    experiment_name: '',
    experiment_type: 'ai_targeting',
    hypothesis: '',
    description: '',
    duration_days: 14,
  });

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadExperiments();
    } else {
      setLoading(false);
    }
  }, [userId, isAuthenticated]);

  const loadExperiments = async (showToast = false) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${config.functionsUrl}/api/promotion/promolab/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setExperiments(data.data || []);
      
      if (showToast) {
        toast.success('Данные обновлены');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(message);
      console.error('Error loading experiments:', error);
      
      toast.error('Ошибка загрузки данных', {
        description: message,
        action: {
          label: 'Повторить',
          onClick: () => loadExperiments(false),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.experiment_name) {
      toast.error('Название эксперимента обязательно');
      return;
    }

    if (!formData.hypothesis) {
      toast.error('Гипотеза обязательна');
      return;
    }

    if (formData.hypothesis.length > 500) {
      toast.error('Гипотеза слишком длинная', {
        description: 'Максимум 500 символов',
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedType = EXPERIMENT_TYPES.find((t) => t.id === formData.experiment_type);
      const basePrice = selectedType?.price || 0;
      const discount = subscription?.limits?.discounts?.marketing || 0;
      const finalPrice = Math.round(basePrice * (1 - discount));

      const response = await fetch(
        `${config.functionsUrl}/api/promotion/promolab/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            artist_id: userId,
            experiment_name: formData.experiment_name,
            experiment_type: formData.experiment_type,
            hypothesis: formData.hypothesis,
            description: formData.description,
            budget: finalPrice,
            duration_days: formData.duration_days,
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || 'Failed to submit');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Эксперимент запущен!', {
          description: `Бюджет: ${finalPrice.toLocaleString()} ₽ на ${formData.duration_days} дней`,
          duration: 5000,
        });
        
        setShowForm(false);
        setFormData({
          experiment_name: '',
          experiment_type: 'ai_targeting',
          hypothesis: '',
          description: '',
          duration_days: 14,
        });
        
        loadExperiments(false);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('Error submitting experiment:', error);
      
      toast.error('Ошибка при запуске эксперимента', {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDiscountedPrice = (price: number) => {
    if (!subscription?.limits?.discounts?.marketing) return price;
    const discount = subscription.limits.discounts.marketing;
    return Math.round(price * (1 - discount));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'text-white/60',
      running: 'text-purple-400',
      analyzing: 'text-blue-400',
      completed: 'text-green-400',
      failed: 'text-red-400',
      cancelled: 'text-red-400',
    };
    return colors[status] || 'text-white/60';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      draft: Clock,
      running: TrendingUp,
      analyzing: BarChart3,
      completed: CheckCircle2,
      failed: XCircle,
      cancelled: XCircle,
    };
    return icons[status] || Clock;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-500 mb-4 animate-spin mx-auto" />
          <p className="text-white/60">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">Ошибка загрузки</h3>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={() => loadExperiments(false)}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#0a0a14] p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад к экспериментам
          </button>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Beaker className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Новый эксперимент</h1>
            </div>
            <p className="text-white/60">
              Тестируйте смелые идеи и находите новые каналы роста
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Тип эксперимента</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXPERIMENT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.experiment_type === type.id;
                const originalPrice = type.price;
                const discountedPrice = getDiscountedPrice(originalPrice);
                const hasDiscount = discountedPrice !== originalPrice;

                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative backdrop-blur-xl rounded-2xl p-6 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 border-2 border-purple-500'
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => setFormData({ ...formData, experiment_type: type.id })}
                  >
                    {type.recommended && (
                      <div className="absolute -top-3 right-4">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ТРЕНДОВОЕ
                        </div>
                      </div>
                    )}

                    <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-purple-400' : 'text-white/60'}`} />
                    <h4 className="text-lg font-semibold text-white mb-2">{type.name}</h4>
                    <p className="text-white/60 text-sm mb-4">{type.description}</p>

                    <ul className="space-y-2 mb-4">
                      {type.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-white/70">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-baseline gap-2">
                        {hasDiscount && (
                          <span className="text-white/40 line-through text-lg">
                            {originalPrice.toLocaleString()} ₽
                          </span>
                        )}
                        <span className="text-2xl font-bold text-white">
                          {discountedPrice.toLocaleString()} ₽
                        </span>
                      </div>
                      {hasDiscount && subscription && (
                        <p className="text-green-400 text-sm mt-1">
                          Скидка {Math.round(subscription.limits.discounts.marketing * 100)}% по подписке
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white">Детали эксперимента</h3>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Название эксперимента <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.experiment_name}
                onChange={(e) => setFormData({ ...formData, experiment_name: e.target.value })}
                placeholder="Например: Умный таргетинг Gen Z"
                maxLength={200}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Гипотеза <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.hypothesis}
                onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                placeholder="Что вы хотите проверить? Например: Использование умного таргетинга на аудиторию 18-25 лет увеличит CTR на 30%"
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.hypothesis.length}/500 символов
              </p>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">
                Описание и детали
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Опишите план эксперимента, целевые метрики, критерии успеха..."
                maxLength={2000}
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.description.length}/2000 символов
              </p>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">
                Длительность (дней)
              </label>
              <input
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 14 })}
                min={7}
                max={60}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-xs text-white/40 mt-1">
                Рекомендуем 14-30 дней для достоверных результатов
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.experiment_name || !formData.hypothesis}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="contents">
                  <Loader className="w-5 h-5 animate-spin" />
                  Запуск...
                </span>
              ) : (
                <span className="contents">
                  <Send className="w-5 h-5" />
                  Запустить эксперимент
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Beaker className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">PROMO Lab 🧪</h1>
                <p className="text-white/60">Экспериментальное продвижение</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Новый эксперимент
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Всего экспериментов</p>
            <p className="text-3xl font-bold text-white">{experiments.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Идут сейчас</p>
            <p className="text-3xl font-bold text-purple-400">
              {experiments.filter((e) => e.status === 'running').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Успешно</p>
            <p className="text-3xl font-bold text-green-400">
              {experiments.filter((e) => e.status === 'completed').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">На анализе</p>
            <p className="text-3xl font-bold text-blue-400">
              {experiments.filter((e) => e.status === 'analyzing').length}
            </p>
          </div>
        </div>

        {experiments.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Beaker className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Нет экспериментов</h3>
            <p className="text-white/60 mb-6">
              Начните тестировать смелые гипотезы для роста
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Запустить эксперимент
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {experiments.map((experiment) => {
              const StatusIcon = getStatusIcon(experiment.status);
              const experimentType = EXPERIMENT_TYPES.find(t => t.id === experiment.experiment_type);
              const TypeIcon = experimentType?.icon || Beaker;
              
              return (
                <motion.div
                  key={experiment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <TypeIcon className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-semibold text-white">
                          {experiment.experiment_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                        <span>{experimentType?.name || experiment.experiment_type}</span>
                        <span>•</span>
                        <span>{experiment.duration_days} дней</span>
                        <span>•</span>
                        <span>{new Date(experiment.created_at).toLocaleDateString('ru-RU')}</span>
                      </div>
                      <p className="text-white/70 text-sm">
                        <Target className="w-4 h-4 inline mr-2" />
                        <strong>Гипотеза:</strong> {experiment.hypothesis}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 ${getStatusColor(experiment.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{STATUS_LABELS[experiment.status] || experiment.status}</span>
                    </div>
                  </div>

                  {experiment.description && (
                    <p className="text-white/60 text-sm mb-4">{experiment.description}</p>
                  )}

                  {experiment.metrics && Object.keys(experiment.metrics).length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {experiment.metrics.reach && (
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                          <p className="text-2xl font-bold text-white mb-1">
                            {experiment.metrics.reach.toLocaleString()}
                          </p>
                          <p className="text-xs text-white/60">Охват</p>
                        </div>
                      )}
                      {experiment.metrics.engagement && (
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                          <p className="text-2xl font-bold text-cyan-400 mb-1">
                            {experiment.metrics.engagement.toFixed(1)}%
                          </p>
                          <p className="text-xs text-white/60">Вовлечённость</p>
                        </div>
                      )}
                      {experiment.metrics.conversions && (
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                          <p className="text-2xl font-bold text-green-400 mb-1">
                            {experiment.metrics.conversions}
                          </p>
                          <p className="text-xs text-white/60">Конверсий</p>
                        </div>
                      )}
                    </div>
                  )}

                  {experiment.learning && experiment.status === 'completed' && (
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-green-400 font-semibold text-sm mb-1">Ключевое learning:</p>
                          <p className="text-white/80 text-sm">{experiment.learning}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}