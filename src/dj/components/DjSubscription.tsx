/**
 * DJ SUBSCRIPTION - Управление подпиской DJ
 * Glassmorphism дизайн, 3 плана: Starter / Pro / Agency
 * Подключён к /api/dj-studio/plans и /api/dj-studio/subscription/:djId
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Disc3, Headphones, Users, Check, Crown, Zap, Shield,
  ArrowRight, Sparkles, Calendar, Star, Loader2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

interface DjPlan {
  id: string;
  name: string;
  price: number;
  priceYear: number;
  currency: string;
  description: string;
  features: string[];
  limits: Record<string, any>;
  popular: boolean;
  color: string;
}

interface DjSubscription {
  djId: string;
  planId: string;
  planName: string;
  status: string;
  price: number;
  currency?: string;
  interval?: string;
  startDate: string;
  endDate: string | null;
  limits?: Record<string, any>;
}

const planIcons: Record<string, typeof Disc3> = {
  starter: Disc3,
  pro: Headphones,
  agency: Users,
};

const planGradients: Record<string, string> = {
  starter: 'from-slate-500 to-slate-600',
  pro: 'from-purple-500 to-violet-600',
  agency: 'from-amber-500 to-orange-500',
};

const planBorderColors: Record<string, string> = {
  starter: 'border-white/10',
  pro: 'border-purple-500/30',
  agency: 'border-amber-500/30',
};

export function DjSubscription() {
  const djProfileId = localStorage.getItem('djProfileId') || 'dj-1';

  const [plans, setPlans] = useState<DjPlan[]>([]);
  const [subscription, setSubscription] = useState<DjSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/api/dj-studio/plans`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }),
        fetch(`${API_BASE}/api/dj-studio/subscription/${djProfileId}`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }),
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.data || []);
      }

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.data || null);
      }
    } catch (error) {
      console.error('Error loading DJ subscription data:', error);
      toast.error('Не удалось загрузить данные подписки');
    } finally {
      setLoading(false);
    }
  };

  const changePlan = async (planId: string) => {
    if (subscription?.planId === planId && subscription?.interval === (annual ? 'year' : 'month')) {
      toast.info('Этот план уже активен');
      return;
    }

    setChanging(planId);
    try {
      const res = await fetch(`${API_BASE}/api/dj-studio/subscription/${djProfileId}/change`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, interval: annual ? 'year' : 'month' }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubscription(data.data);
        const plan = plans.find(p => p.id === planId);
        toast.success(`План ${plan?.name || planId} активирован`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Ошибка при смене плана');
      }
    } catch (error) {
      console.error('Error changing DJ plan:', error);
      toast.error('Не удалось сменить план');
    } finally {
      setChanging(null);
    }
  };

  const currentPlanId = subscription?.planId || 'starter';
  const currentInterval = subscription?.interval || 'month';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Бессрочно';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="text-sm text-gray-400">Загрузка подписки...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-3">
          <Crown className="w-7 h-7 text-purple-400" />
          Подписка
        </h1>
        <p className="text-sm text-gray-400">
          Управление тарифным планом DJ-кабинета
        </p>
      </motion.div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Текущий план</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            subscription?.status === 'active'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {subscription?.status === 'active' ? 'Активен' : subscription?.status || 'Активен'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${planGradients[currentPlanId] || planGradients.starter} flex items-center justify-center flex-shrink-0`}>
            {(() => {
              const Icon = planIcons[currentPlanId] || Disc3;
              return <Icon className="w-7 h-7 text-white" />;
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-black text-white">{subscription?.planName || 'Starter'}</div>
            <div className="text-sm text-gray-400">
              {(subscription?.price || 0) === 0
                ? 'Бесплатно'
                : `${(subscription?.price || 0).toLocaleString('ru-RU')} ₽ / ${currentInterval === 'year' ? 'год' : 'мес'}`
              }
            </div>
          </div>
          {subscription?.endDate && (
            <div className="text-right flex-shrink-0 hidden sm:block">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Действует до</div>
              <div className="text-sm font-semibold text-white">{formatDate(subscription.endDate)}</div>
            </div>
          )}
        </div>

        {subscription?.endDate && (
          <div className="mt-3 sm:hidden text-xs text-gray-400">
            <Calendar className="w-3 h-3 inline mr-1" />
            Действует до {formatDate(subscription.endDate)}
          </div>
        )}
      </motion.div>

      {/* Annual Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex justify-center items-center gap-3"
      >
        <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-gray-500'}`}>Ежемесячно</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-purple-500' : 'bg-white/10'}`}
        >
          <motion.div
            animate={{ x: annual ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
          />
        </button>
        <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-gray-500'}`}>
          Годовой
          <span className="ml-1.5 text-[10px] text-green-400 font-bold">-17%</span>
        </span>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map((plan, i) => {
          const Icon = planIcons[plan.id] || Disc3;
          const gradient = planGradients[plan.id] || planGradients.starter;
          const borderColor = planBorderColors[plan.id] || planBorderColors.starter;
          const isCurrentPlan = currentPlanId === plan.id && currentInterval === (annual ? 'year' : 'month');
          const isCurrentPlanAnyInterval = currentPlanId === plan.id;
          const price = annual ? (plan.priceYear || 0) : plan.price;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className={`relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border ${borderColor} p-5 flex flex-col ${
                plan.popular ? 'ring-1 ring-purple-500/30 shadow-lg shadow-purple-500/5' : ''
              } ${isCurrentPlanAnyInterval ? 'ring-2 ring-green-500/30' : ''}`}
            >
              {plan.popular && !isCurrentPlanAnyInterval && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full text-[9px] font-bold text-white">
                  Популярный
                </div>
              )}

              {isCurrentPlanAnyInterval && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-500 rounded-full text-[9px] font-bold text-white">
                  Текущий
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-lg font-bold text-white mb-0.5">{plan.name}</h3>
              <p className="text-[11px] text-gray-500 mb-3">{plan.description}</p>

              <div className="mb-4">
                {price === 0 ? (
                  <div className="text-2xl font-black text-white">Бесплатно</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">
                      {price.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-xs text-gray-500">/ {annual ? 'год' : 'мес'}</span>
                  </div>
                )}
                {annual && plan.price > 0 && (
                  <div className="text-[10px] text-green-400 mt-0.5">
                    Экономия {Math.round(plan.price * 2).toLocaleString('ru-RU')} ₽ / год
                  </div>
                )}
              </div>

              <ul className="space-y-1.5 mb-5 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs text-gray-300">
                    <Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={!isCurrentPlan ? { scale: 1.03 } : {}}
                whileTap={!isCurrentPlan ? { scale: 0.97 } : {}}
                onClick={() => !isCurrentPlan && changePlan(plan.id)}
                disabled={isCurrentPlan || changing !== null}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isCurrentPlan
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400 cursor-default'
                    : changing === plan.id
                    ? 'bg-purple-500/30 text-purple-300 cursor-wait'
                    : plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {isCurrentPlan ? (
                  <><Check className="w-4 h-4" /> Активен</>
                ) : changing === plan.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Подключаем...</>
                ) : (
                  <>{plan.price === 0 ? 'Перейти' : 'Подключить'} <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Info note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-start gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/10"
      >
        <Shield className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-400 leading-relaxed">
          <p className="font-semibold text-gray-300 mb-1">Оплата через Т-Банк и ЮKassa</p>
          <p>Смена плана происходит мгновенно. При переходе на более дорогой план разница будет рассчитана пропорционально. Отмена подписки доступна в любой момент.</p>
        </div>
      </motion.div>
    </div>
  );
}
