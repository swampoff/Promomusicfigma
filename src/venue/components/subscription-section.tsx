/**
 * SUBSCRIPTION SECTION - Управление подпиской заведения
 * Enterprise-модуль для управления тарифным планом и платежами
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Star, Check, X, CreditCard, Calendar, TrendingUp,
  Zap, Shield, Crown, ArrowRight, Clock, AlertCircle,
  Gift, Sparkles, Building2, Radio as RadioIcon, BarChart3
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, YEARLY_DISCOUNT_PERCENT, TRIAL_PERIOD_DAYS } from '../constants/subscription-plans';
import type { SubscriptionPlan, BillingCycle } from '../types/venue-types';

export function SubscriptionSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mock текущей подписки
  const currentSubscription = {
    plan: 'professional' as SubscriptionPlan,
    status: 'active' as const,
    startDate: '2026-02-01',
    endDate: '2026-03-03',
    autoRenew: true,
    billingCycle: 'monthly' as BillingCycle,
  };

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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Управление подпиской ⭐
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Выберите тарифный план, который подходит вашему заведению
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Crown className="w-6 h-6 text-white" />
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
        <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg transition-all font-medium ${
              billingCycle === 'monthly'
                ? 'bg-indigo-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ежемесячно
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg transition-all font-medium relative ${
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const savings = billingCycle === 'yearly' 
            ? calculateSavings(plan.monthlyPrice, plan.yearlyPrice)
            : 0;
          const isCurrentPlan = currentSubscription?.plan === plan.id;

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
                    ⭐ Популярный
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
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">
                    {formatPrice(price)}
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

              {/* Features */}
              <div className="space-y-3 mb-6">
                <FeatureItem
                  text={`${plan.features.maxPlaylists === 'unlimited' 
                    ? 'Безлимит' 
                    : plan.features.maxPlaylists} плейлистов`}
                  included={true}
                />
                <FeatureItem
                  text={`${plan.features.maxTracks === 'unlimited' 
                    ? 'Безлимит' 
                    : plan.features.maxTracks} треков`}
                  included={true}
                />
                <FeatureItem
                  text={plan.features.libraryAccess === 'basic' 
                    ? '5000+ треков' 
                    : plan.features.libraryAccess === 'full'
                    ? '20000+ треков'
                    : '50000+ треков + эксклюзивы'}
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
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrentPlan}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  isCurrentPlan
                    ? 'bg-white/5 text-slate-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isCurrentPlan ? 'Текущий план' : 'Выбрать план'}
              </button>

              {!isCurrentPlan && plan.id === 'basic' && (
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
          onConfirm={() => {
            console.log('Payment confirmed');
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
  onConfirm: () => void;
  formatPrice: (price: number) => string;
}

function PaymentModal({ plan, billingCycle, onClose, onConfirm, formatPrice }: PaymentModalProps) {
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

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
        className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl"
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
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            Оплатить
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Нажимая "Оплатить", вы соглашаетесь с условиями использования
        </p>
      </motion.div>
    </motion.div>
  );
}
