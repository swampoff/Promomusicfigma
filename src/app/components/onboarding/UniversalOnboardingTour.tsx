/**
 * UNIVERSAL ONBOARDING TOUR - Интерактивный тур по кабинету
 * Для всех кабинетов кроме Artist (у того свой OnboardingTour)
 * Компактная плавающая карточка с пошаговым гайдом
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronRight, ChevronLeft, Disc3, Radio, MapPin, Sliders,
  LayoutDashboard, Music2, Calendar, DollarSign, BarChart3,
  User, Settings, Star, Headphones, Users, Zap, PartyPopper,
  Building2, Mic2, Wallet, CheckCircle2, ArrowRight,
} from 'lucide-react';

type TourRole = 'dj' | 'radio_station' | 'producer' | 'venue';

const LS_TOUR_KEY = (role: TourRole) => `promo_tour_${role}_v1`;

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tip?: string;
  section?: string;
}

const TOUR_STEPS: Record<TourRole, TourStep[]> = {
  dj: [
    {
      id: 'welcome', title: 'Добро пожаловать, DJ!',
      description: 'Ваш персональный кабинет для управления карьерой диджея. Пройдите короткий тур - узнайте ключевые возможности.',
      icon: Disc3, color: 'from-purple-500 to-violet-600',
      tip: 'Кабинет DJ полностью адаптирован под мобильные устройства',
    },
    {
      id: 'home', title: 'Главная панель',
      description: 'Сводка активных букингов, предстоящих событий и доходов. Всё важное - на одном экране.',
      icon: LayoutDashboard, color: 'from-purple-500 to-violet-600',
      section: 'home', tip: 'Виджеты обновляются автоматически',
    },
    {
      id: 'mixes', title: 'Мои миксы',
      description: 'Загружайте и управляйте миксами, треками и сетами. Добавляйте метаданные, обложки и теги для лучшего охвата.',
      icon: Music2, color: 'from-purple-500 to-fuchsia-500',
      section: 'mixes', tip: 'Качественные обложки увеличивают клики на 40%',
    },
    {
      id: 'bookings', title: 'Букинги',
      description: 'Получайте заявки от клубов и заведений, управляйте расписанием и подтверждайте выступления без посредников.',
      icon: Calendar, color: 'from-violet-500 to-purple-600',
      section: 'bookings', tip: 'Быстрый ответ на заявки увеличивает конверсию',
    },
    {
      id: 'analytics', title: 'Аналитика',
      description: 'Статистика прослушиваний, география аудитории, рейтинг и динамика доходов. Данные обновляются ежедневно.',
      icon: BarChart3, color: 'from-purple-500 to-violet-600',
      section: 'analytics', tip: 'Отслеживайте рост аудитории по регионам',
    },
    {
      id: 'finances', title: 'Финансы',
      description: 'История выплат за выступления, баланс монет и доходы по периодам. Экспорт отчётов для бухгалтерии.',
      icon: DollarSign, color: 'from-green-500 to-emerald-500',
      section: 'finances', tip: 'Все транзакции хранятся в истории навсегда',
    },
    {
      id: 'done', title: 'Вы готовы работать!',
      description: 'Начните с загрузки миксов и настройки профиля. Активный DJ с заполненным профилем получает в 3 раза больше заявок.',
      icon: PartyPopper, color: 'from-purple-500 to-violet-600',
      tip: 'Повторить тур: Настройки - Поддержка',
    },
  ],
  radio_station: [
    {
      id: 'welcome', title: 'Добро пожаловать на радио!',
      description: 'Кабинет радиостанции для работы с артистами, рекламными слотами и аудиторией. Быстрый тур по основным разделам.',
      icon: Radio, color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'requests', title: 'Заявки артистов',
      description: 'Принимайте и отклоняйте заявки артистов на ротацию. Прослушивайте треки прямо в кабинете, оставляйте комментарии.',
      icon: Music2, color: 'from-indigo-500 to-blue-500',
      section: 'artist-requests', tip: 'Артисты получают уведомления о статусе заявки',
    },
    {
      id: 'adslots', title: 'Рекламные слоты',
      description: 'Управляйте рекламным инвентарём: временные слоты, форматы, заказы от рекламодателей и автоматические отчёты.',
      icon: Zap, color: 'from-amber-500 to-orange-500',
      section: 'ad-slots', tip: 'Пиковые часы (07-09, 17-20) стоят дороже',
    },
    {
      id: 'analytics', title: 'Аналитика',
      description: 'Слушательская аудитория, охват, рейтинг ротации по жанрам и платформам. Данные в реальном времени.',
      icon: BarChart3, color: 'from-indigo-500 to-purple-500',
      section: 'analytics', tip: 'Экспортируйте отчёты для рекламодателей',
    },
    {
      id: 'profile', title: 'Профиль станции',
      description: 'Публичная страница радиостанции: частота, форматы, аудитория, контакты. Заполненный профиль привлекает больше артистов.',
      icon: Radio, color: 'from-indigo-500 to-purple-500',
      section: 'profile', tip: 'Добавьте логотип и обложку для узнаваемости',
    },
    {
      id: 'done', title: 'Всё готово!',
      description: 'Начните с настройки профиля и обработки первых заявок от артистов. Удачи в эфире!',
      icon: PartyPopper, color: 'from-indigo-500 to-purple-500',
    },
  ],
  producer: [
    {
      id: 'welcome', title: 'Кабинет продюсера готов!',
      description: 'Управляйте услугами, заказами и портфолио в одном месте. Быстрый тур по ключевым разделам.',
      icon: Sliders, color: 'from-teal-500 to-emerald-500',
    },
    {
      id: 'overview', title: 'Обзор',
      description: 'Активные заказы, доходы и рейтинг на главной панели. Видите только то, что требует внимания прямо сейчас.',
      icon: LayoutDashboard, color: 'from-teal-500 to-emerald-500',
      section: 'overview', tip: 'Оперативно отвечайте на новые заказы',
    },
    {
      id: 'services', title: 'Мои услуги',
      description: 'Создавайте пакеты услуг: сведение, мастеринг, аранжировка. Задавайте цены, сроки и условия. Это ваш маркетплейс.',
      icon: Star, color: 'from-teal-500 to-cyan-500',
      section: 'services', tip: 'Подробное описание услуги увеличивает конверсию',
    },
    {
      id: 'portfolio', title: 'Портфолио',
      description: 'Загружайте работы с аудио до/после, добавляйте кейсы и отзывы клиентов. Портфолио - ваша лучшая реклама.',
      icon: Music2, color: 'from-emerald-500 to-teal-600',
      section: 'portfolio', tip: 'Сравнение "до/после" работает убедительнее слов',
    },
    {
      id: 'orders', title: 'Заказы',
      description: 'Все поступившие заказы с чатом, файлами и историей. Отслеживайте статус и сроки в одном месте.',
      icon: CheckCircle2, color: 'from-teal-500 to-emerald-500',
      section: 'orders', tip: 'Укладывайтесь в сроки - это основа репутации',
    },
    {
      id: 'wallet', title: 'Кошелёк',
      description: 'Выплаты за заказы, история транзакций и вывод средств. Минимальная сумма вывода 1 000 ₽.',
      icon: Wallet, color: 'from-green-500 to-emerald-500',
      section: 'wallet', tip: 'Выплаты обрабатываются в рабочие дни',
    },
    {
      id: 'done', title: 'Вперёд к заказам!',
      description: 'Создайте первую услугу и загрузите портфолио. Продюсеры с портфолио получают на 70% больше заказов.',
      icon: PartyPopper, color: 'from-teal-500 to-emerald-500',
    },
  ],
  venue: [
    {
      id: 'welcome', title: 'Кабинет заведения готов!',
      description: 'Управляйте музыкальным оформлением, букингом и интеграцией с радио. Быстрый тур по основным разделам.',
      icon: Building2, color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'dashboard', title: 'Дашборд',
      description: 'Активная музыка, ближайшие выступления и статистика посещаемости. Центр управления заведением.',
      icon: LayoutDashboard, color: 'from-amber-500 to-orange-500',
      section: 'dashboard', tip: 'Настройте виджеты под ваши приоритеты',
    },
    {
      id: 'booking', title: 'Букинг',
      description: 'Принимайте заявки от артистов и DJ прямо в кабинете. Согласуйте условия и расписание без переписок по email.',
      icon: Calendar, color: 'from-orange-500 to-amber-600',
      section: 'booking', tip: 'Оперативный ответ привлекает лучших исполнителей',
    },
    {
      id: 'radio', title: 'Радио-интеграция',
      description: 'Подключите готовые плейлисты и радиопоток к музыкальной системе заведения. Лицензионная музыка без хлопот.',
      icon: Radio, color: 'from-amber-500 to-yellow-500',
      section: 'radio-integration', tip: 'Готовые плейлисты по жанрам и настроению',
    },
    {
      id: 'analytics', title: 'Аналитика',
      description: 'Посещаемость, пиковые часы, популярные исполнители у ваших гостей. Данные для принятия решений.',
      icon: BarChart3, color: 'from-amber-500 to-orange-500',
      section: 'analytics', tip: 'Используйте данные для планирования мероприятий',
    },
    {
      id: 'done', title: 'Заведение настроено!',
      description: 'Начните с подключения радио-плейлиста и опубликуйте открытые слоты для букинга. Удачи!',
      icon: PartyPopper, color: 'from-amber-500 to-orange-500',
    },
  ],
};

interface UniversalOnboardingTourProps {
  role: TourRole;
  onNavigate?: (section: string) => void;
  forceShow?: boolean;
  onClose?: () => void;
}

export function UniversalOnboardingTour({ role, onNavigate, forceShow, onClose }: UniversalOnboardingTourProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceShow) { setVisible(true); setStep(0); return; }
    const done = localStorage.getItem(LS_TOUR_KEY(role));
    if (!done) {
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
  }, [role, forceShow]);

  const steps = TOUR_STEPS[role];
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  const close = () => {
    localStorage.setItem(LS_TOUR_KEY(role), 'done');
    setVisible(false);
    onClose?.();
  };

  const next = () => {
    if (isLast) { close(); return; }
    const nextStep = steps[step + 1];
    if (nextStep.section) onNavigate?.(nextStep.section);
    setStep(s => s + 1);
  };

  const prev = () => {
    if (isFirst) return;
    setStep(s => s - 1);
  };

  if (!visible) return null;

  const Icon = current.icon;

  const ROLE_COLORS: Record<TourRole, string> = {
    dj:            'from-purple-500 to-violet-600',
    radio_station: 'from-indigo-500 to-purple-500',
    producer:      'from-teal-500 to-emerald-500',
    venue:         'from-amber-500 to-orange-500',
  };
  const baseColor = ROLE_COLORS[role];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-20 right-4 xs:right-5 z-[150] w-[calc(100vw-2rem)] xs:w-80 sm:w-96"
        >
          <div className="bg-[#0e1022]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className={`bg-gradient-to-r ${current.color} p-4 relative`}>
              <div onClick={close} className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                <X className="w-4 h-4 text-white/70" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {current.title}
                  </div>
                  <div className="text-white/60 text-xs">
                    Шаг {step + 1} из {steps.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-white/5">
              <motion.div
                className={`h-full bg-gradient-to-r ${baseColor}`}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Body */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                >
                  <p className="text-slate-300 text-sm leading-relaxed mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {current.description}
                  </p>
                  {current.tip && (
                    <div className="bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2">
                      <p className="text-slate-500 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                        💡 {current.tip}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 flex items-center justify-between">
              <div
                onClick={prev}
                className={`flex items-center gap-1 text-sm transition-colors cursor-pointer ${isFirst ? 'text-slate-700 pointer-events-none' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ChevronLeft className="w-4 h-4" />
                Назад
              </div>

              {/* Dots */}
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setStep(i)}
                    className={`rounded-full cursor-pointer transition-all duration-200 ${
                      i === step
                        ? `w-4 h-1.5 bg-gradient-to-r ${baseColor}`
                        : i < step
                        ? 'w-1.5 h-1.5 bg-white/25'
                        : 'w-1.5 h-1.5 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <div
                onClick={next}
                className={`flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r ${baseColor} rounded-lg text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity`}
              >
                {isLast ? 'Готово' : 'Далее'}
                {isLast ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
