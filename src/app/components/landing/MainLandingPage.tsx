/**
 * MAIN LANDING PAGE - Новая главная страница promo.music
 * Современный дизайн в стиле glassmorphism с динамическим контентом
 * 
 * Структура:
 * 1. Hero Section - Главная секция с CTA
 * 2. Top Charts - TOP 20 из чартов радиостанций
 * 3. New Releases - Новинки от музыкантов
 * 4. Trending - Популярные треки
 * 5. CTA Section - Призыв к действию
 */

import { HeroSection } from './HeroSection';
import { TopChartsSection } from './TopChartsSection';
import { NewReleasesSection } from './NewReleasesSection';
import { TrendingSection } from './TrendingSection';
import { ArrowRight, Music, Zap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { motion } from 'motion/react';

interface MainLandingPageProps {
  onLogin: () => void;
}

export function MainLandingPage({ onLogin }: MainLandingPageProps) {
  const handleExplore = () => {
    // Scroll to top charts
    document.getElementById('top-charts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <HeroSection onExplore={handleExplore} onLogin={onLogin} />

      {/* Top Charts Section */}
      <div id="top-charts">
        <TopChartsSection />
      </div>

      {/* New Releases Section */}
      <NewReleasesSection />

      {/* Trending Section */}
      <TrendingSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Final CTA Section */}
      <CTASection onLogin={onLogin} />
    </div>
  );
}

// ==============================================
// FEATURES SECTION
// ==============================================
function FeaturesSection() {
  const features = [
    {
      icon: '📻',
      title: 'Мониторинг радиостанций',
      description: 'Отслеживайте эфиры 4 крупнейших радиостанций России в реальном времени',
      color: 'from-purple-600 to-blue-600',
    },
    {
      icon: '📊',
      title: 'Аналитика ротаций',
      description: 'Подробная статистика прослушиваний и позиций в чартах с экспортом данных',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      icon: '🎯',
      title: 'Таргетированные кампании',
      description: 'Создавайте рекламные кампании с точным таргетингом по радиостанциям',
      color: 'from-cyan-600 to-teal-600',
    },
    {
      icon: '💎',
      title: 'AI-агент контента',
      description: 'Автоматизация контента с парсингом чартов и генерацией новостей',
      color: 'from-teal-600 to-green-600',
    },
    {
      icon: '💰',
      title: 'Монетизация',
      description: 'Зарабатывайте на рекламных слотах с прозрачной системой выплат 85%/15%',
      color: 'from-green-600 to-yellow-600',
    },
    {
      icon: '🚀',
      title: 'Enterprise уровень',
      description: 'Полноценная бизнес-система с модерацией, партнеркой и персональными скидками',
      color: 'from-yellow-600 to-orange-600',
    },
  ];

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Возможности платформы</span>
          </div>
          
          <h2 className="text-4xl xs:text-5xl md:text-6xl font-bold text-white mb-4">
            Всё для продвижения
          </h2>
          <p className="text-lg xs:text-xl text-slate-400 max-w-3xl mx-auto">
            Enterprise-решение для музыкантов, радиостанций и заведений с полным набором инструментов
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all"
            >
              {/* Icon */}
              <div className="text-6xl mb-6">{feature.icon}</div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Gradient Border on Hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==============================================
// FINAL CTA SECTION
// ==============================================
function CTASection({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-slate-950 to-pink-900/20" />
      
      {/* Animated Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"
      />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-purple-300">
            <Music className="w-4 h-4" />
            <span className="text-sm font-medium">Начните продвижение сегодня</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl xs:text-5xl md:text-6xl font-bold text-white mb-6">
            Готовы к запуску?
          </h2>

          {/* Description */}
          <p className="text-xl xs:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Присоединяйтесь к платформе и начните продвигать свою музыку на радиостанциях уже сегодня
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col xs:flex-row items-center justify-center gap-4">
            <Button
              onClick={onLogin}
              size="lg"
              className="w-full xs:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-10 py-7 shadow-2xl shadow-purple-500/25"
            >
              Начать бесплатно
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={onLogin}
              size="lg"
              variant="outline"
              className="w-full xs:w-auto border-white/20 text-white text-lg px-10 py-7 hover:bg-white/10 backdrop-blur-xl"
            >
              Узнать больше
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>4 радиостанции</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>24/7 мониторинг</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Real-time аналитика</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
