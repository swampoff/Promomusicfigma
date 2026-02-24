/**
 * SUBSCRIPTION PAGE - УПРАВЛЕНИЕ ПОДПИСКАМИ
 * Кредитная модель: подписка = кредиты на рассылки + скидки на услуги
 * Каноничная система v19: Тест-драйв / Старт / Про / Бизнес
 */

import { Crown, Sparkles, Check, Zap, TrendingUp, Shield, BarChart3, Music, Coins, Target, MessageSquare, Clock, Mail, Star, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { CreditCard, X, Loader2, CheckCircle, Receipt, ShieldCheck } from 'lucide-react';

interface Subscription {
  tier: 'spark' | 'start' | 'pro' | 'elite';
  tierName?: string;
  price: number;
  expires_at: string;
  status: 'active' | 'expired' | 'cancelled';
  features: string[];
}

interface SubscriptionPageProps {
  userId: string;
  currentSubscription: Subscription;
  onSubscriptionChange: (subscription: Subscription) => void;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

// Каноничные тарифные планы (v19)
const SUBSCRIPTION_PLANS = [
  {
    id: 'spark',
    name: 'Тест-драйв',
    subtitle: 'Знакомство с платформой',
    price_month: 0,
    price_year: 0,
    credits: 0,
    extra_mailing_price: 7000,
    icon: Music,
    color: 'from-gray-500 to-gray-600',
    features: [
      { text: 'Профиль артиста', icon: Music },
      { text: 'Загрузка треков', icon: Music },
      { text: 'Пресс-релиз для 1 трека', icon: MessageSquare },
      { text: 'Доступ к базе знаний', icon: BarChart3 },
      { text: '10% комиссия с донатов', icon: Coins },
      { text: 'Доп. рассылка - 7 000 ₽', icon: Mail },
    ],
    discounts: { pitching: 0, marketing: 0, track_test: 0, banners: 0 },
    donation_fee: 0.10,
    coins_bonus: 0,
  },
  {
    id: 'start',
    name: 'Старт',
    subtitle: 'Для старта и редких релизов',
    price_month: 8990,
    price_year: 89900,
    credits: 1,
    extra_mailing_price: 5000,
    icon: Star,
    color: 'from-green-500 to-emerald-500',
    popular: false,
    features: [
      { text: '1 рассылка/мес (экономия 28%)', icon: Mail },
      { text: 'Скидка 5% на питчинг', icon: Target },
      { text: 'Скидка 5% на маркетинг', icon: TrendingUp },
      { text: 'Скидка 5% на баннеры', icon: Shield },
      { text: '7% комиссия с донатов', icon: Coins },
      { text: '+5% бонус к коинам', icon: Sparkles },
      { text: 'Доп. рассылка - 5 000 ₽', icon: Mail },
    ],
    discounts: { pitching: 0.05, marketing: 0.05, track_test: 0, banners: 0.05 },
    donation_fee: 0.07,
    coins_bonus: 0.05,
  },
  {
    id: 'pro',
    name: 'Про',
    subtitle: 'Для активных артистов',
    price_month: 39990,
    price_year: 399900,
    credits: 3,
    extra_mailing_price: 4000,
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      { text: '3 рассылки/мес (экономия 43%)', icon: Mail },
      { text: 'Скидка 10% на питчинг', icon: Target },
      { text: 'Скидка 15% на маркетинг', icon: TrendingUp },
      { text: 'Скидка 10% на тест трека', icon: Music },
      { text: 'Скидка 10% на баннеры', icon: Shield },
      { text: '5% комиссия с донатов', icon: Coins },
      { text: '+15% бонус к коинам', icon: Sparkles },
      { text: 'Приоритетная поддержка', icon: MessageSquare },
      { text: 'Доп. рассылка - 4 000 ₽', icon: Mail },
    ],
    discounts: { pitching: 0.10, marketing: 0.15, track_test: 0.10, banners: 0.10 },
    donation_fee: 0.05,
    coins_bonus: 0.15,
  },
  {
    id: 'elite',
    name: 'Бизнес',
    subtitle: 'Для лейблов и агентств',
    price_month: 149990,
    price_year: 1499900,
    credits: 10,
    extra_mailing_price: 3000,
    icon: Crown,
    color: 'from-yellow-500 to-orange-500',
    popular: false,
    features: [
      { text: '10 рассылок/мес (экономия 57%)', icon: Mail },
      { text: 'Скидка 15% на питчинг', icon: Target },
      { text: 'Скидка 25% на маркетинг', icon: TrendingUp },
      { text: 'Скидка 20% на тест трека', icon: Music },
      { text: 'Скидка 15% на баннеры', icon: Shield },
      { text: '3% комиссия с донатов', icon: Coins },
      { text: '+25% бонус к коинам', icon: Sparkles },
      { text: 'Персональный менеджер', icon: MessageSquare },
      { text: 'Доп. рассылка - 3 000 ₽', icon: Mail },
    ],
    discounts: { pitching: 0.15, marketing: 0.25, track_test: 0.20, banners: 0.15 },
    donation_fee: 0.03,
    coins_bonus: 0.25,
  },
];

export function SubscriptionPage({ userId, currentSubscription, onSubscriptionChange }: SubscriptionPageProps) {
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const plansRef = useRef<HTMLDivElement>(null);
  const [confirmPlan, setConfirmPlan] = useState<typeof SUBSCRIPTION_PLANS[0] | null>(null);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [receiptData, setReceiptData] = useState<any>(null);

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === currentSubscription.tier);

  const openPaymentModal = (planId: string) => {
    if (planId === currentSubscription.tier) {
      toast.info('Вы уже используете этот план');
      return;
    }
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (plan) {
      setConfirmPlan(plan);
      setPaymentStep('confirm');
      setReceiptData(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirmPlan) return;

    setPaymentStep('processing');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/subscriptions/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          tier: confirmPlan.id,
          interval: billingInterval,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const price = billingInterval === 'year' ? confirmPlan.price_year : confirmPlan.price_month;
        setReceiptData({
          planName: confirmPlan.name,
          price,
          interval: billingInterval,
          expiresAt: data.data.expires_at,
          credits: confirmPlan.credits,
          txDate: new Date().toISOString(),
        });
        setPaymentStep('success');
        onSubscriptionChange(data.data);
      } else {
        toast.error('Ошибка активации подписки');
        setConfirmPlan(null);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Не удалось изменить подписку');
      setConfirmPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setConfirmPlan(null);
    setPaymentStep('confirm');
    setReceiptData(null);
  };

  // handleUpgrade removed - replaced by openPaymentModal + handleConfirmPayment

  const getDaysLeft = () => {
    if (currentSubscription.tier === 'spark') return null;
    const expiresAt = new Date(currentSubscription.expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const daysLeft = getDaysLeft();

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-3">
          Управление подпиской
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-400">
          Кредитная модель: подписка включает рассылки и скидки на все услуги
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 sm:p-6 rounded-2xl bg-gradient-to-r ${currentPlan.color} bg-opacity-10 border-2 border-white/20`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {currentPlan.icon && <currentPlan.icon className="w-8 h-8 text-white" />}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Текущий план: {currentPlan.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  {currentSubscription.tier === 'spark' ? (
                    'Бесплатный тест-драйв'
                  ) : (
                    <span className="contents">
                      {currentSubscription.status === 'active' ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Осталось {daysLeft} {daysLeft === 1 ? 'день' : daysLeft && daysLeft < 5 ? 'дня' : 'дней'}
                          {' '} | {currentPlan.credits} рассылок/мес
                        </span>
                      ) : (
                        <span className="text-red-400">Подписка истекла</span>
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {currentSubscription.tier !== 'elite' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-white text-gray-900 font-semibold transition-all shadow-lg text-sm sm:text-base"
                onClick={scrollToPlans}
              >
                Улучшить план
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Credits & Discounts Overview */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Сравнение тарифов</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <Mail className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">Рассылки/мес</p>
            <p className="text-xs text-gray-400">
              Тест-драйв: 0 | Старт: 1 | Про: 3 | Бизнес: 10
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <Target className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">Скидка на маркетинг</p>
            <p className="text-xs text-gray-400">
              Тест-драйв: 0% | Старт: 5% | Про: 15% | Бизнес: 25%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <Coins className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">Комиссия с донатов</p>
            <p className="text-xs text-gray-400">
              Тест-драйв: 10% | Старт: 7% | Про: 5% | Бизнес: 3%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <Mail className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">Доп. рассылка</p>
            <p className="text-xs text-gray-400">
              Тест-драйв: 7 000 ₽ | Старт: 5 000 ₽ | Про: 4 000 ₽ | Бизнес: 3 000 ₽
            </p>
          </div>
        </div>
      </div>

      {/* Billing Interval Toggle */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
          <button
            onClick={() => setBillingInterval('month')}
            className={`px-4 sm:px-6 py-2 rounded-md text-sm font-semibold transition-all ${
              billingInterval === 'month'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ежемесячно
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`px-4 sm:px-6 py-2 rounded-md text-sm font-semibold transition-all ${
              billingInterval === 'year'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ежегодно
            <span className="ml-1 text-green-400 text-xs">-17%</span>
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div ref={plansRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {SUBSCRIPTION_PLANS.map((plan, index) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === currentSubscription.tier;
          const canDowngrade = SUBSCRIPTION_PLANS.findIndex(p => p.id === currentSubscription.tier) > index;
          const price = billingInterval === 'year' ? plan.price_year : plan.price_month;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 sm:p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 shadow-xl shadow-purple-500/20'
                  : isCurrentPlan
                  ? `bg-gradient-to-br ${plan.color} bg-opacity-20 border-2 border-white/30`
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg">
                    Популярный
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-lg">
                    Текущий
                  </span>
                </div>
              )}

              <div className="text-center mb-4 sm:mb-6">
                <Icon className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`} />
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-3">{plan.subtitle}</p>

                {/* Credits Badge */}
                {plan.credits > 0 && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full mb-3">
                    <Mail className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-400">{plan.credits} рассылок/мес</span>
                  </div>
                )}

                <div className="mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {price === 0 ? '0' : price.toLocaleString()}
                  </span>
                  {price > 0 && <span className="text-gray-400 text-sm ml-1">₽</span>}
                </div>
                <p className="text-xs text-gray-500">
                  {price === 0 ? 'бесплатно' : billingInterval === 'year' ? 'в год' : 'в месяц'}
                </p>
                {billingInterval === 'year' && plan.price_month > 0 && (
                  <p className="text-xs text-green-400 mt-1">
                    Экономия {(plan.price_month * 12 - plan.price_year).toLocaleString()} ₽/год
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {plan.features.map((feature, idx) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <FeatureIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-300">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: isCurrentPlan ? 1 : 1.05 }}
                whileTap={{ scale: isCurrentPlan ? 1 : 0.95 }}
                onClick={() => !isCurrentPlan && openPaymentModal(plan.id)}
                disabled={isCurrentPlan || loading}
                className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                  isCurrentPlan
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isCurrentPlan ? 'Текущий план' : canDowngrade ? 'Понизить' : 'Выбрать план'}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Часто задаваемые вопросы</h3>
        <div className="space-y-3">
          <details className="p-3 rounded-xl bg-white/5 border border-white/10">
            <summary className="font-semibold text-white cursor-pointer text-sm sm:text-base">
              Что такое кредит рассылки?
            </summary>
            <p className="mt-2 text-xs sm:text-sm text-gray-400">
              Кредит рассылки - это одна полноценная рассылка вашего трека по базе редакторов, кураторов и плейлистов. Подписка включает определённое количество кредитов в месяц. Дополнительные рассылки можно приобрести по сниженной цене.
            </p>
          </details>
          <details className="p-3 rounded-xl bg-white/5 border border-white/10">
            <summary className="font-semibold text-white cursor-pointer text-sm sm:text-base">
              Можно ли отменить подписку?
            </summary>
            <p className="mt-2 text-xs sm:text-sm text-gray-400">
              Да, вы можете отменить подписку в любое время. Доступ к функциям сохранится до конца оплаченного периода. Неиспользованные кредиты не переносятся.
            </p>
          </details>
          <details className="p-3 rounded-xl bg-white/5 border border-white/10">
            <summary className="font-semibold text-white cursor-pointer text-sm sm:text-base">
              Чем выгодна годовая оплата?
            </summary>
            <p className="mt-2 text-xs sm:text-sm text-gray-400">
              При годовой оплате вы платите за 10 месяцев вместо 12 - экономия составляет 17%. Кредиты рассылок начисляются ежемесячно в полном объёме.
            </p>
          </details>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {confirmPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget && paymentStep !== 'processing') closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#12122a]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-purple-500/10"
            >
              {paymentStep === 'confirm' && (() => {
                const price = billingInterval === 'year' ? confirmPlan.price_year : confirmPlan.price_month;
                const ConfirmIcon = confirmPlan.icon;
                return (
                  <div className="contents">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${confirmPlan.color} flex items-center justify-center`}>
                          <ConfirmIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-white" style={{ fontSize: '18px' }}>Подтверждение оплаты</div>
                          <p className="text-xs text-gray-400">Тариф «{confirmPlan.name}»</p>
                        </div>
                      </div>
                      <div
                        onClick={closeModal}
                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Тариф</span>
                          <span className="text-sm font-semibold text-white">{confirmPlan.name}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Период</span>
                          <span className="text-sm font-semibold text-white">{billingInterval === 'year' ? 'Год' : 'Месяц'}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Рассылок/мес</span>
                          <span className="text-sm font-semibold text-cyan-400">{confirmPlan.credits}</span>
                        </div>
                        <div className="border-t border-white/10 pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-bold text-white">Итого</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              {price === 0 ? 'Бесплатно' : `${price.toLocaleString()} ₽`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {price > 0 && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="text-sm font-semibold text-white mb-3">Способ оплаты</div>
                          <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-400/30 cursor-pointer">
                              <input type="radio" name="payMethod" defaultChecked className="accent-purple-500" />
                              <CreditCard className="w-5 h-5 text-purple-400" />
                              <div>
                                <div className="text-sm text-white">Банковская карта</div>
                                <div className="text-xs text-gray-400">Visa, MasterCard, МИР</div>
                              </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer opacity-50">
                              <input type="radio" name="payMethod" disabled className="accent-purple-500" />
                              <Coins className="w-5 h-5 text-yellow-400" />
                              <div>
                                <div className="text-sm text-white">Промо-коины</div>
                                <div className="text-xs text-gray-400">Скоро</div>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2 text-xs text-gray-500">
                        <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Оплата защищена. Подписку можно отменить в любое время. Возврат пропорционально неиспользованному периоду.</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div
                        onClick={closeModal}
                        className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-semibold text-center cursor-pointer hover:bg-white/15 transition text-sm"
                      >
                        Отмена
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmPayment}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-center cursor-pointer shadow-lg shadow-purple-500/30 text-sm"
                      >
                        {price === 0 ? 'Активировать' : `Оплатить ${price.toLocaleString()} ₽`}
                      </motion.div>
                    </div>
                  </div>
                );
              })()}

              {paymentStep === 'processing' && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-12 h-12 mx-auto mb-4"
                  >
                    <Loader2 className="w-12 h-12 text-purple-400" />
                  </motion.div>
                  <div className="text-lg font-bold text-white mb-2" style={{ fontSize: '18px' }}>Обработка платежа</div>
                  <p className="text-sm text-gray-400">Пожалуйста, подождите...</p>
                </div>
              )}

              {paymentStep === 'success' && receiptData && (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </motion.div>
                  <div className="text-xl font-bold text-white mb-1" style={{ fontSize: '20px' }}>Подписка активирована</div>
                  <p className="text-sm text-gray-400 mb-6">Тариф «{receiptData.planName}» успешно подключён</p>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-left">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Квитанция</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Тариф</span>
                        <span className="text-sm text-white font-medium">{receiptData.planName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Сумма</span>
                        <span className="text-sm text-white font-medium">
                          {receiptData.price > 0 ? `${receiptData.price.toLocaleString()} ₽` : 'Бесплатно'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Период</span>
                        <span className="text-sm text-white font-medium">{receiptData.interval === 'year' ? 'Годовая' : 'Ежемесячная'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Рассылок/мес</span>
                        <span className="text-sm text-cyan-400 font-medium">{receiptData.credits}</span>
                      </div>
                      {receiptData.expiresAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Действует до</span>
                          <span className="text-sm text-white font-medium">{new Date(receiptData.expiresAt).toLocaleDateString('ru-RU')}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-white/10 pt-2">
                        <span className="text-sm text-gray-400">Дата</span>
                        <span className="text-sm text-white font-medium">{new Date(receiptData.txDate).toLocaleString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-center cursor-pointer shadow-lg text-sm"
                  >
                    Отлично, закрыть
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export subscription plans for use in other components
export { SUBSCRIPTION_PLANS };