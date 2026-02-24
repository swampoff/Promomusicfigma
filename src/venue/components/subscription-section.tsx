/**
 * SUBSCRIPTION SECTION - Управление подпиской заведения
 * Enterprise-модуль для управления тарифным планом и платежами
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Star, Check, X, CreditCard, Calendar, TrendingUp,
  Zap, Shield, Crown, ArrowRight, Clock, AlertCircle,
  Gift, Sparkles, Building2, Radio as RadioIcon, BarChart3
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, YEARLY_DISCOUNT_PERCENT, TRIAL_PERIOD_DAYS } from '../constants/subscription-plans';
import type { SubscriptionPlan, BillingCycle } from '../types/venue-types';
import { fetchVenueProfile } from '@/utils/api/venue-cabinet';
import { apiFetch } from '@/utils/api/api-cache';
import { toast } from 'sonner';

export function SubscriptionSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Текущая подписка - загружается из профиля
  const [currentSubscription, setCurrentSubscription] = useState({
    plan: 'business' as SubscriptionPlan,
    status: 'active' as const,
    startDate: '2026-02-01',
    endDate: '2026-03-03',
    autoRenew: true,
    billingCycle: 'monthly' as BillingCycle,
  });

  // Load subscription from venue profile
  useEffect(() => {
    fetchVenueProfile().then((profile) => {
      if (profile) {
        const planId = (profile.subscriptionPlan || 'business') as SubscriptionPlan;
        setCurrentSubscription(prev => ({
          ...prev,
          plan: planId,
          status: profile.subscriptionStatus === 'active' ? 'active' : 'active',
          startDate: profile.createdAt?.slice(0, 10) || prev.startDate,
        }));
      }
    }).catch(console.error);
  }, []);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateSavings = (monthlyPrice: number, yearlyPrice: number): number => {
    return (monthlyPrice * 12) - yearlyPrice;
  };

  const handleSelectPlan = (planId: SubscriptionPlan) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1 xs:mb-2">
          Управление подпиской ⭐
        </h2>
        <p className="text-xs xs:text-sm sm:text-base text-slate-400">
          Выберите тарифный план, который подходит вашему заведению
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 xs:p-5 sm:p-6 rounded-xl xs:rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4">
            <div className="flex items-start gap-3 xs:gap-4">
              <div className="p-2 xs:p-3 rounded-lg xs:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Crown className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">
                    {SUBSCRIPTION_PLANS.find(p => p.id === currentSubscription.plan)?.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold">
                    Активна
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-2">
                  {billingCycle === 'monthly' ? 'Ежемесячная оплата' : 'Годовая оплата'}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Активна до {new Date(currentSubscription.endDate).toLocaleDateString('ru-RU')}
                  </div>
                  {currentSubscription.autoRenew && (
                    <div className="flex items-center gap-1 text-green-400">
                      <Check className="w-4 h-4" />
                      Автопродление
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-sm">
              Управление подпиской
            </button>
          </div>
        </motion.div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 xs:gap-3 p-1 rounded-lg xs:rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 xs:px-6 py-1.5 xs:py-2 rounded-md xs:rounded-lg transition-all font-medium text-sm xs:text-base ${
              billingCycle === 'monthly'
                ? 'bg-indigo-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ежемесячно
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 xs:px-6 py-1.5 xs:py-2 rounded-md xs:rounded-lg transition-all font-medium relative text-sm xs:text-base ${
              billingCycle === 'yearly'
                ? 'bg-indigo-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ежегодно
            <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">
              -{YEARLY_DISCOUNT_PERCENT}%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const savings = (billingCycle === 'yearly' && plan.monthlyPrice != null && plan.yearlyPrice != null)
            ? calculateSavings(plan.monthlyPrice, plan.yearlyPrice)
            : 0;
          const isCurrentPlan = currentSubscription?.plan === plan.id;
          const isEnterprise = plan.monthlyPrice == null;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                plan.popular
                  ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold">
                    Популярный
                  </span>
                </div>
              )}

              {!plan.popular && isEnterprise && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold">
                    Для сетей 10+
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold">
                    Текущий
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                
                {isEnterprise ? (
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">По запросу</span>
                  </div>
                ) : (
                  <div className="contents">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-white">
                        {formatPrice(price!)}
                      </span>
                      <span className="text-slate-400">
                        / {billingCycle === 'monthly' ? 'мес' : 'год'}
                      </span>
                    </div>

                    {billingCycle === 'yearly' && savings > 0 && (
                      <p className="text-sm text-green-400">
                        Экономия {formatPrice(savings)} в год
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Zones */}
              <div className="mb-3">
                <FeatureItem
                  text={`${plan.zones === 'unlimited' ? 'Безлимит' : plan.zones} ${plan.zones === 1 ? 'зона' : plan.zones === 'unlimited' ? 'зон' : 'зоны'}`}
                  included={true}
                />
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <FeatureItem
                  text={`${plan.features.maxPlaylists === 'unlimited' 
                    ? 'Безлимит' 
                    : plan.features.maxPlaylists} плейлистов`}
                  included={true}
                />
                <FeatureItem
                  text={plan.features.libraryAccess === 'basic' 
                    ? '5 000+ треков' 
                    : plan.features.libraryAccess === 'full'
                    ? '20 000+ треков'
                    : '50 000+ треков + эксклюзивы'}
                  included={true}
                />
                <FeatureItem
                  text="Аналитика"
                  included={plan.features.analytics}
                />
                <FeatureItem
                  text="Расписание воспроизведения"
                  included={plan.features.scheduling}
                />
                <FeatureItem
                  text="Мультилокация"
                  included={plan.features.multiLocation}
                />
                <FeatureItem
                  text="API доступ"
                  included={plan.features.apiAccess}
                />
                <FeatureItem
                  text="Приоритетная поддержка"
                  included={plan.features.prioritySupport}
                />
                <FeatureItem
                  text="Брендированный контент"
                  included={plan.features.customBranding}
                />
                {plan.features.sla && (
                  <FeatureItem text="SLA 99.9%" included={true} />
                )}
                {plan.features.dedicatedApp && (
                  <FeatureItem text="Брендированное приложение" included={true} />
                )}
                {plan.features.concierge && (
                  <FeatureItem text="Выделенный консьерж" included={true} />
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => isEnterprise ? toast.info('Напишите нам на hello@promo.music для обсуждения Enterprise-тарифа') : handleSelectPlan(plan.id)}
                disabled={isCurrentPlan}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  isCurrentPlan
                    ? 'bg-white/5 text-slate-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isCurrentPlan ? 'Текущий план' : isEnterprise ? 'Связаться' : 'Выбрать план'}
              </button>

              {!isCurrentPlan && plan.id === 'start' && (
                <p className="text-center text-xs text-slate-400 mt-2">
                  {TRIAL_PERIOD_DAYS} дней бесплатно
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard
          icon={Shield}
          title="Безопасные платежи"
          description="Все транзакции защищены"
        />
        <InfoCard
          icon={Clock}
          title="Отмена в любой момент"
          description="Без долгосрочных обязательств"
        />
        <InfoCard
          icon={Sparkles}
          title="Обновления включены"
          description="Новые функции бесплатно"
        />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)!}
          billingCycle={billingCycle}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          onConfirm={async () => {
            const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
            if (!plan) return;
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const venueId = localStorage.getItem('venue_user_id') || 'venue-demo';
            const venueName = localStorage.getItem('venue_name') || 'Заведение';

            try {
              // Симуляция обработки платежа
              await new Promise(resolve => setTimeout(resolve, 1500));

              // Записать подписку через payments API -> recordRevenue()
              const res = await apiFetch('/api/payments', '/sync/subscription', {
                method: 'POST',
                body: JSON.stringify({
                  user_id: venueId,
                  subscription_data: {
                    plan: plan.id,
                    amount: price,
                    billingCycle,
                    userName: venueName,
                  },
                }),
              });

              if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.error('Subscription sync error:', errData);
              }

              setCurrentSubscription(prev => ({
                ...prev,
                plan: plan.id as SubscriptionPlan,
                billingCycle,
                startDate: new Date().toISOString().slice(0, 10),
                endDate: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 86400000).toISOString().slice(0, 10),
              }));

              toast.success(`Подписка "${plan.name}" успешно оформлена`);
            } catch (err) {
              console.error('Subscription payment error:', err);
              toast.error('Ошибка при оформлении подписки');
            }

            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

interface FeatureItemProps {
  text: string;
  included: boolean;
}

function FeatureItem({ text, included }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-2">
      {included ? (
        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
      ) : (
        <X className="w-5 h-5 text-slate-600 flex-shrink-0" />
      )}
      <span className={`text-sm ${included ? 'text-white' : 'text-slate-600'}`}>
        {text}
      </span>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function InfoCard({ icon: Icon, title, description }: InfoCardProps) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <Icon className="w-6 h-6 text-indigo-400 mb-2" />
      <h4 className="text-white font-medium mb-1">{title}</h4>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

interface PaymentModalProps {
  plan: any;
  billingCycle: BillingCycle;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  formatPrice: (price: number) => string;
}

function PaymentModal({ plan, billingCycle, onClose, onConfirm, formatPrice }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-6 rounded-2xl bg-[#0a0a14] border border-white/20 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Подтверждение оплаты</h3>
          <p className="text-slate-400">Переход к оплате тарифа</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Тариф:</span>
            <span className="text-white font-medium">{plan.name}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Период:</span>
            <span className="text-white font-medium">
              {billingCycle === 'monthly' ? 'Ежемесячно' : 'Ежегодно'}
            </span>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-slate-400">Итого:</span>
            <span className="text-2xl font-bold text-white">{formatPrice(price)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="contents">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Обработка...
              </span>
            ) : (
              'Оплатить'
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Нажимая "Оплатить", вы соглашаетесь с условиями использования
        </p>
      </motion.div>
    </motion.div>
  );
}