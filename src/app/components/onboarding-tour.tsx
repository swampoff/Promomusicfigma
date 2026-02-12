/**
 * ONBOARDING TOUR - Пошаговый гайд для новых артистов
 * Подсветка элементов интерфейса с объяснениями
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronRight, ChevronLeft, Upload, Music2, TrendingUp,
  Bell, Wallet, Rocket, Sparkles, PartyPopper, CheckCircle2,
  Handshake,
} from 'lucide-react';

const LS_TOUR_KEY = 'promo_onboarding_completed';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  section?: string;
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в promo.music!',
    description: 'Ваш персональный кабинет для управления музыкальной карьерой. Давайте познакомимся с основными разделами.',
    icon: Sparkles,
    color: 'from-pink-500 to-purple-500',
  },
  {
    id: 'publish',
    title: 'Публикация контента',
    description: 'Публикуйте видеоклипы и концерты через систему модерации. Выбирайте тариф, отправляйте на проверку и отслеживайте статус в реальном времени.',
    icon: Upload,
    color: 'from-[#FF577F] to-purple-500',
    section: 'publish',
    tip: 'Начните с бесплатного тарифа, чтобы попробовать систему',
  },
  {
    id: 'tracks',
    title: 'Управление треками',
    description: 'Загружайте треки, управляйте метаданными и отслеживайте статистику. Drag & drop для сортировки плейлистов.',
    icon: Music2,
    color: 'from-cyan-500 to-blue-500',
    section: 'tracks',
    tip: 'Используйте тест трека для анализа качества перед публикацией',
  },
  {
    id: 'analytics',
    title: 'Аналитика',
    description: 'Подробная статистика: прослушивания, география аудитории, возрастные группы, платформы и доходы с графиками.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-500',
    section: 'analytics',
    tip: 'Публикуйте контент в пиковые часы (18:00-21:00) для максимального охвата',
  },
  {
    id: 'collaboration',
    title: 'Коллаборации с продюсерами',
    description: 'Получайте предложения битов и услуг от продюсеров. Обсуждайте детали в чате, принимайте или отклоняйте офферы.',
    icon: Handshake,
    color: 'from-amber-500 to-orange-500',
    section: 'collaboration',
    tip: 'Включите уведомления, чтобы не пропустить интересные предложения',
  },
  {
    id: 'notifications',
    title: 'Real-time уведомления',
    description: 'Мгновенные уведомления через SSE, звуковые оповещения и нативные push-уведомления. Настройте под себя.',
    icon: Bell,
    color: 'from-violet-500 to-purple-500',
    section: 'notifications',
    tip: 'Разрешите push-уведомления для оповещений даже при закрытой вкладке',
  },
  {
    id: 'promotion',
    title: 'Продвижение',
    description: 'Питчинг треков на плейлисты, маркетинговые кампании и PR. Используйте монеты для доступа к премиум-функциям.',
    icon: Rocket,
    color: 'from-pink-500 to-rose-500',
    section: 'pitching',
  },
  {
    id: 'finances',
    title: 'Финансы',
    description: 'Отслеживайте доходы от стримов, донаты, историю транзакций и баланс монет. Экспортируйте отчёты.',
    icon: Wallet,
    color: 'from-green-500 to-emerald-500',
    section: 'payments',
  },
  {
    id: 'done',
    title: 'Вы готовы!',
    description: 'Используйте Cmd+K для быстрого поиска по разделам. Удачи в продвижении вашей музыки!',
    icon: PartyPopper,
    color: 'from-yellow-500 to-orange-500',
    tip: 'Cmd+K / Ctrl+K - быстрый доступ к любому разделу',
  },
];

interface OnboardingTourProps {
  onNavigate?: (section: string) => void;
  forceShow?: boolean;
  onComplete?: () => void;
}

export function OnboardingTour({ onNavigate, forceShow, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      setCurrentStep(0);
      return;
    }
    const completed = localStorage.getItem(LS_TOUR_KEY);
    if (!completed) {
      // Показываем через 2 секунды после загрузки
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      const nextStep = TOUR_STEPS[currentStep + 1];
      if (nextStep.section && onNavigate) {
        onNavigate(nextStep.section);
      }
    } else {
      handleComplete();
    }
  }, [currentStep, onNavigate]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(LS_TOUR_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(LS_TOUR_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        >
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-[#12122a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="h-1 bg-white/5">
              <motion.div
                className={`h-full bg-gradient-to-r ${step.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5">
              <span className="text-xs text-slate-500 font-medium">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Пропустить
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-xl font-bold text-white mb-3">{step.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{step.description}</p>

              {step.tip && (
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  <span className="text-xs text-yellow-200/80">{step.tip}</span>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-6 pb-6">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Назад
              </button>

              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep ? `bg-gradient-to-r ${step.color} w-6` :
                      i < currentStep ? 'bg-white/30' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${step.color} hover:opacity-90 transition-opacity shadow-lg`}
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Начать
                  </>
                ) : (
                  <>
                    Далее
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);
  
  const isCompleted = () => localStorage.getItem(LS_TOUR_KEY) === 'true';
  const resetTour = () => {
    localStorage.removeItem(LS_TOUR_KEY);
    setShowTour(true);
  };

  return { showTour, setShowTour, isCompleted, resetTour };
}
