/**
 * PRICING PAGE - Публичная страница тарифов Promo.music
 * Glassmorphism дизайн, три тарифа + FAQ
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check, X, Star, Zap, Crown, Music, Headphones, BarChart3,
  Radio, Calendar, TestTube, Send, Shield, ArrowRight, Sparkles,
  Users, MessageSquare, TrendingUp, Disc3, Mic2, Globe,
  Sliders, Building2,
} from 'lucide-react';

interface PricingPageProps {
  onGetStarted: () => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'Старт',
    price: 0,
    period: 'бесплатно',
    description: 'Базовый набор для начинающих артистов',
    icon: Music,
    gradient: 'from-slate-500 to-slate-600',
    borderColor: 'border-white/10',
    popular: false,
    features: [
      { text: 'Профиль артиста', included: true },
      { text: 'Загрузка до 5 треков', included: true },
      { text: 'Базовая аналитика', included: true },
      { text: 'Участие в чартах', included: true },
      { text: 'Публикация новостей', included: true },
      { text: 'Promo.lab - 1 тест-драйв', included: true },
      { text: 'Приоритетная ротация', included: false },
      { text: 'Расширенная аналитика', included: false },
      { text: 'Питчинг в плейлисты', included: false },
      { text: 'Персональный менеджер', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Профессионал',
    price: 990,
    period: '/ месяц',
    description: 'Для активных артистов и продюсеров',
    icon: Zap,
    gradient: 'from-[#FF577F] to-[#FF3366]',
    borderColor: 'border-[#FF577F]/30',
    popular: true,
    features: [
      { text: 'Всё из тарифа Старт', included: true },
      { text: 'Загрузка до 50 треков', included: true },
      { text: 'Расширенная аналитика', included: true },
      { text: 'Приоритетная ротация на радио', included: true },
      { text: 'Promo.lab - 5 тест-драйвов / мес', included: true },
      { text: 'Питчинг в плейлисты', included: true },
      { text: 'Публикация концертов', included: true },
      { text: 'Интеграция с соцсетями', included: true },
      { text: 'Коллаборации с другими артистами', included: true },
      { text: 'Персональный менеджер', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 2990,
    period: '/ месяц',
    description: 'Максимум возможностей для продвижения',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500/30',
    popular: false,
    features: [
      { text: 'Всё из тарифа Профессионал', included: true },
      { text: 'Безлимитная загрузка треков', included: true },
      { text: 'Персональный менеджер', included: true },
      { text: 'Promo.lab - безлимит', included: true },
      { text: 'Приоритетная модерация', included: true },
      { text: 'Верификация профиля', included: true },
      { text: 'Эксклюзивный питчинг', included: true },
      { text: 'Доступ к маркетплейсу продюсеров', included: true },
      { text: 'Продвинутые отчёты и экспорт', included: true },
      { text: 'API-доступ для интеграций', included: true },
    ],
  },
];

const DJ_PLANS = [
  {
    id: 'dj-free',
    name: 'DJ Старт',
    price: 0,
    period: 'бесплатно',
    icon: Disc3,
    gradient: 'from-violet-500 to-purple-600',
    features: ['Профиль в каталоге DJ', 'До 3 миксов', 'Базовый календарь', 'Приём заявок на букинг'],
  },
  {
    id: 'dj-pro',
    name: 'DJ Про',
    price: 1490,
    period: '/ месяц',
    icon: Headphones,
    gradient: 'from-purple-500 to-violet-600',
    features: ['Безлимит миксов', 'Приоритет в каталоге', 'Расширенная аналитика', 'Промо-кампании', 'Коллаборации'],
  },
];

const VENUE_PLANS = [
  {
    id: 'venue-start',
    name: 'Старт',
    price: 4990,
    period: '/ месяц',
    icon: Radio,
    gradient: 'from-blue-500 to-cyan-500',
    popular: false,
    badge: null as string | null,
    features: ['1 зона воспроизведения', '5 000+ треков', 'До 5 плейлистов', 'Email поддержка'],
  },
  {
    id: 'venue-business',
    name: 'Бизнес',
    price: 9990,
    period: '/ месяц',
    icon: Crown,
    gradient: 'from-[#FF577F] to-purple-500',
    popular: true,
    badge: null as string | null,
    features: ['До 4 зон', '20 000+ треков', 'Полная аналитика + тепловые карты', 'Расписание по часам', 'Приоритетная поддержка 24/7', 'Брендированные джинглы'],
  },
  {
    id: 'venue-network',
    name: 'Сеть',
    price: 14990,
    period: '/ месяц',
    icon: Globe,
    gradient: 'from-amber-500 to-orange-500',
    popular: false,
    badge: null as string | null,
    features: ['Безлимит зон', '50 000+ треков + эксклюзивы', 'Мультилокация', 'API + CRM интеграция', 'Персональный менеджер'],
  },
  {
    id: 'venue-enterprise',
    name: 'Enterprise',
    price: null as number | null,
    period: '',
    icon: Building2,
    gradient: 'from-violet-500 to-indigo-500',
    popular: false,
    badge: 'Для сетей 10+',
    features: ['Всё из тарифа Сеть', 'SLA 99.9%', 'Брендированное приложение', 'Выделенный консьерж', 'Индивидуальные условия'],
  },
];

const PRODUCER_PLANS = [
  {
    id: 'producer-start',
    name: 'Инженер Старт',
    price: 2990,
    period: '/ месяц',
    icon: Sliders,
    gradient: 'from-teal-500 to-emerald-500',
    features: ['Профиль в каталоге', 'До 5 услуг', 'Базовая аналитика', 'Приём заказов', 'Портфолио до/после'],
  },
  {
    id: 'producer-pro',
    name: 'Инженер Про',
    price: 7990,
    period: '/ месяц',
    icon: Mic2,
    gradient: 'from-emerald-500 to-teal-600',
    features: ['Безлимит услуг', 'Приоритет в каталоге', 'Расширенная аналитика', 'Коллаборации', 'Promo.ai ассистент'],
  },
  {
    id: 'producer-premium',
    name: 'Инженер Премиум',
    price: 19990,
    period: '/ месяц',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600',
    features: ['Всё из Инженер Про', 'Верификация профиля', 'Персональный менеджер', 'Эксклюзивные заказы', 'Продвинутые отчёты и экспорт'],
  },
];

type Tab = 'artists' | 'dj' | 'venues' | 'producers';

export function PricingPage({ onGetStarted }: PricingPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('artists');
  const [annual, setAnnual] = useState(false);

  const tabs: { key: Tab; label: string; icon: typeof Music }[] = [
    { key: 'artists', label: 'Артистам', icon: Music },
    { key: 'dj', label: 'DJs', icon: Disc3 },
    { key: 'venues', label: 'Заведениям', icon: Radio },
    { key: 'producers', label: 'Инженерам', icon: Sliders },
  ];

  const discount = annual ? 0.8 : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF577F]/10 border border-[#FF577F]/20 text-[#FF577F] text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Тарифы
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3">
          Выберите свой{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF577F] to-[#FF3366]">тариф</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
          Гибкие планы для артистов, DJs и заведений. Начните бесплатно и масштабируйтесь по мере роста.
        </p>
      </motion.div>

      {/* Tab selector */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="inline-flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-[#FF577F]/20 text-[#FF577F] border border-[#FF577F]/30'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Annual toggle */}
      <div className="flex justify-center items-center gap-3 mb-8 sm:mb-10">
        <span className={`text-xs sm:text-sm font-medium ${!annual ? 'text-white' : 'text-slate-500'}`}>Ежемесячно</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-[#FF577F]' : 'bg-white/10'}`}
        >
          <motion.div
            animate={{ x: annual ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
          />
        </button>
        <span className={`text-xs sm:text-sm font-medium ${annual ? 'text-white' : 'text-slate-500'}`}>
          Годовой
          <span className="ml-1.5 text-[10px] text-green-400 font-bold">-20%</span>
        </span>
      </div>

      {/* Artist plans */}
      {activeTab === 'artists' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto"
        >
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border ${plan.borderColor} p-5 sm:p-6 flex flex-col ${
                plan.popular ? 'ring-1 ring-[#FF577F]/30 shadow-lg shadow-[#FF577F]/5' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#FF577F] to-[#FF3366] rounded-full text-[10px] font-bold text-white">
                  Популярный
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                <plan.icon className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{plan.description}</p>

              <div className="mb-5">
                {plan.price === 0 ? (
                  <div className="text-3xl font-black text-white">Бесплатно</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">
                      {Math.round(plan.price * discount).toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  </div>
                )}
                {annual && plan.price > 0 && (
                  <div className="text-[10px] text-green-400 mt-1">
                    Экономия {Math.round(plan.price * 12 * 0.2).toLocaleString('ru-RU')} ₽ / год
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs">
                    {f.included ? (
                      <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={f.included ? 'text-slate-300' : 'text-slate-600'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onGetStarted}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white shadow-lg shadow-[#FF577F]/20'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {plan.price === 0 ? 'Начать бесплатно' : 'Попробовать'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* DJ plans */}
      {activeTab === 'dj' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto"
        >
          {DJ_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                <plan.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <div className="mb-5">
                {plan.price === 0 ? (
                  <div className="text-3xl font-black text-white">Бесплатно</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{Math.round(plan.price * discount).toLocaleString('ru-RU')} ₽</span>
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  </div>
                )}
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onGetStarted}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-white/5 text-white border border-white/10 hover:bg-white/10 flex items-center justify-center gap-2">
                Подключить <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Venue plans */}
      {activeTab === 'venues' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-6xl mx-auto"
        >
          {VENUE_PLANS.map((plan, i) => {
            const isEnterprise = plan.price == null;
            return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border p-5 sm:p-6 flex flex-col ${
                plan.popular ? 'border-[#FF577F]/30 ring-1 ring-[#FF577F]/30 shadow-lg shadow-[#FF577F]/5' : 'border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#FF577F] to-[#FF3366] rounded-full text-[10px] font-bold text-white">
                  Популярный
                </div>
              )}
              {plan.badge && !plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] font-bold text-white">
                  {plan.badge}
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                <plan.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <div className="mb-5 flex items-baseline gap-1">
                {isEnterprise ? (
                  <span className="text-2xl font-black text-white">По запросу</span>
                ) : (
                  <>
                    <span className="text-3xl font-black text-white">{Math.round(plan.price! * discount).toLocaleString('ru-RU')} ₽</span>
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  </>
                )}
              </div>
              {annual && !isEnterprise && (
                <div className="text-[10px] text-green-400 -mt-4 mb-4">
                  Экономия {Math.round(plan.price! * 12 * 0.2).toLocaleString('ru-RU')} ₽ / год
                </div>
              )}
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onGetStarted}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white shadow-lg shadow-[#FF577F]/20'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}>
                {isEnterprise ? 'Связаться' : 'Подключить'} <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Producer/Engineer plans */}
      {activeTab === 'producers' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto"
        >
          {PRODUCER_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                <plan.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <div className="mb-5 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{Math.round(plan.price * discount).toLocaleString('ru-RU')} ₽</span>
                <span className="text-xs text-slate-500">{plan.period}</span>
              </div>
              {annual && (
                <div className="text-[10px] text-green-400 -mt-4 mb-4">
                  Экономия {Math.round(plan.price * 12 * 0.2).toLocaleString('ru-RU')} ₽ / год
                </div>
              )}
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onGetStarted}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-white/5 text-white border border-white/10 hover:bg-white/10 flex items-center justify-center gap-2">
                Подключить <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Comparison note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 sm:mt-16 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-green-400" />
          Все тарифы включают защиту данных и поддержку 24/7
        </div>
      </motion.div>

      {/* Enterprise CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-10 sm:mt-14 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 sm:p-8 text-center max-w-2xl mx-auto"
      >
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Нужно индивидуальное решение?</h3>
        <p className="text-sm text-slate-400 mb-5">
          Для крупных лейблов, сетей заведений и медиакомпаний мы предлагаем персональные условия
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white font-bold text-sm shadow-lg shadow-[#FF577F]/20"
        >
          <MessageSquare className="w-4 h-4" />
          Связаться с нами
        </motion.button>
      </motion.div>
    </div>
  );
}