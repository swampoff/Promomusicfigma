import { motion, AnimatePresence } from "motion/react";
import React from "react";
import { ArrowRight, Sparkles, TrendingUp, Radio, DollarSign, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassButton } from "./GlassCard";
import { Magnetic } from "./PremiumWidgets";
import { FloatingParticles } from "./GlassCard";

/**
 * PREMIUM HERO BANNER - Улучшенный с адаптивностью и анимациями
 * Главный баннер с автопрокруткой, 3D эффектами и магнитной анимацией
 */

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  button: string;
  icon: any;
  color: string;
}

const banners: Banner[] = [
  {
    id: 1,
    title: "Promo.music",
    subtitle: "Продвижение нового уровня",
    description: "AI-агент для создания контента, интеграция с радиостанциями и полная аналитика вашего промо в реальном времени",
    button: "Начать продвижение",
    icon: Sparkles,
    color: "#FF577F",
  },
  {
    id: 2,
    title: "AI-Агент",
    subtitle: "Автоматизация контента",
    description: "Революционная система на базе Mistral AI для создания промо-материалов, описаний треков и контента для соцсетей",
    button: "Попробовать AI",
    icon: TrendingUp,
    color: "#8B5CF6",
  },
  {
    id: 3,
    title: "Радиостанции",
    subtitle: "Прямой эфир вашей музыки",
    description: "Интеграция с радиостанциями, ротация треков и детальная аналитика прослушиваний в реальном времени",
    button: "Найти радио",
    icon: Radio,
    color: "#3B82F6",
  },
  {
    id: 4,
    title: "Монетизация",
    subtitle: "Зарабатывай на музыке",
    description: "Партнерская программа, система тарифов и прозрачная финансовая отчетность для максимального дохода",
    button: "Узнать больше",
    icon: DollarSign,
    color: "#10B981",
  },
];

export function PremiumHeroBanner() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const currentBanner = banners[currentIndex];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative rounded-xl xs:rounded-2xl overflow-hidden h-[320px] xs:h-[380px] sm:h-[420px] md:h-[480px] lg:h-[500px]">
      {/* Анимированный градиентный фон */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            background: [
              `linear-gradient(135deg, ${currentBanner.color}40, transparent)`,
              `linear-gradient(225deg, ${currentBanner.color}40, transparent)`,
              `linear-gradient(135deg, ${currentBanner.color}40, transparent)`,
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            opacity: { duration: 0.5 },
            background: { duration: 10, repeat: Infinity }
          }}
          className="absolute inset-0"
        />
      </AnimatePresence>

      {/* Стеклянный слой */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />

      {/* Плавающие частицы */}
      <FloatingParticles color={currentBanner.color} />

      {/* Навигационные кнопки */}
      <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-2 xs:px-4 pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrev}
          className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-colors pointer-events-auto"
        >
          <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-colors pointer-events-auto"
        >
          <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
        </motion.button>
      </div>

      <div className="absolute inset-0 flex items-center">
        {/* Контент с анимацией слайда */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative z-10 p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 w-full"
          >
            <div className="max-w-2xl">
              {/* Иконка с 3D эффектом */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 1 }}
                className="mb-3 xs:mb-4 md:mb-6"
              >
                <Magnetic>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg xs:rounded-xl md:rounded-2xl items-center justify-center shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${currentBanner.color}, ${currentBanner.color}80)`,
                      boxShadow: `0 15px 50px ${currentBanner.color}40`,
                    }}
                  >
                    <currentBanner.icon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </motion.div>
                </Magnetic>
              </motion.div>

              {/* Заголовок */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-1 xs:mb-2"
              >
                <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  {currentBanner.title}
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 xs:mb-3 sm:mb-4 md:mb-6"
                style={{ color: currentBanner.color }}
              >
                {currentBanner.subtitle}
              </motion.p>

              {/* Описание */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-300 text-xs xs:text-sm sm:text-base md:text-lg mb-3 xs:mb-4 sm:mb-6 md:mb-8 leading-relaxed max-w-xl line-clamp-2 xs:line-clamp-3"
              >
                {currentBanner.description}
              </motion.p>

              {/* Кнопка */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <GlassButton
                  variant="primary"
                  size="lg"
                  glow
                  className="group text-xs xs:text-sm sm:text-base"
                  style={{
                    background: `linear-gradient(135deg, ${currentBanner.color}, ${currentBanner.color}cc)`,
                  }}
                >
                  <span className="hidden xs:inline">{currentBanner.button}</span>
                  <span className="xs:hidden">Начать</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 ml-1 xs:ml-1.5 sm:ml-2" />
                  </motion.div>
                </GlassButton>
              </motion.div>
            </div>

            {/* Декоративные элементы */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute top-6 xs:top-10 sm:top-16 md:top-20 right-6 xs:right-10 sm:right-16 md:right-20 w-16 h-16 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full blur-3xl opacity-30"
              style={{ background: currentBanner.color }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Индикаторы прогресса */}
      <div className="absolute bottom-4 xs:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 xs:gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className="group relative"
          >
            <div
              className={`h-0.5 xs:h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-10 xs:w-12 bg-white" : "w-5 xs:w-6 bg-white/30"
              }`}
            />
            {index === currentIndex && (
              <motion.div
                layoutId="progress"
                className="absolute inset-0 h-0.5 xs:h-1 rounded-full bg-gradient-to-r from-[#FF577F] to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * COMPACT HERO - Улучшенная компактная версия для мобильных
 */
export function CompactHeroBanner() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const currentBanner = banners[currentIndex];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative rounded-lg xs:rounded-xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            background: `linear-gradient(135deg, ${currentBanner.color}20, transparent)`
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        />
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 p-3 xs:p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-2.5 xs:mb-3 sm:mb-4">
            <motion.div 
              className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-lg xs:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${currentBanner.color}, ${currentBanner.color}cc)`,
              }}
              animate={{
                boxShadow: [
                  `0 8px 16px ${currentBanner.color}30`,
                  `0 8px 24px ${currentBanner.color}50`,
                  `0 8px 16px ${currentBanner.color}30`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <currentBanner.icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm xs:text-base sm:text-lg font-black truncate">{currentBanner.title}</h2>
              <p className="text-[10px] xs:text-xs text-slate-400 truncate">{currentBanner.subtitle}</p>
            </div>
          </div>

          <p className="text-[11px] xs:text-xs sm:text-sm text-slate-300 mb-2.5 xs:mb-3 sm:mb-4 leading-relaxed line-clamp-2">
            {currentBanner.description}
          </p>

          <GlassButton 
            variant="primary" 
            size="sm" 
            className="w-full text-[11px] xs:text-xs sm:text-sm"
            style={{
              background: `linear-gradient(135deg, ${currentBanner.color}, ${currentBanner.color}cc)`,
            }}
          >
            <span className="hidden xs:inline">{currentBanner.button}</span>
            <span className="xs:hidden">Начать</span>
            <Play className="w-3 h-3 xs:w-3.5 xs:h-3.5 ml-1 xs:ml-1.5" />
          </GlassButton>

          {/* Индикаторы */}
          <div className="flex gap-1 justify-center mt-2.5 xs:mt-3">
            {banners.map((_, idx) => (
              <div
                key={idx}
                className={`h-0.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-white' : 'w-3 bg-white/30'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}