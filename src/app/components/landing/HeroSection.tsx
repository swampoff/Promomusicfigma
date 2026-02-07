/**
 * HERO SECTION - Главная секция landing page
 * Улучшенный glassmorphism дизайн с динамическими эффектами
 */

import { Music, Play, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onExplore: () => void;
  onLogin: () => void;
}

export function HeroSection({ onExplore, onLogin }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
      
      {/* Multiple Glassmorphism Orbs with different animations */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-10 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/40 to-pink-600/40 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-10 -right-20 w-[600px] h-[600px] bg-gradient-to-tl from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-orange-600/20 to-pink-600/20 rounded-full blur-3xl"
      />

      {/* Enhanced Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          animate={{
            y: [0, -100, 0],
            x: Math.random() * 100 - 50,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto text-center z-10 px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Enhanced Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 mb-8 sm:mb-10 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-xl border border-purple-500/30 text-purple-300 text-xs sm:text-sm shadow-lg shadow-purple-500/10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            <span className="font-semibold tracking-wide">Enterprise платформа для музыкальной индустрии</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </motion.div>

          {/* Enhanced Main Heading with better responsive typography */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 sm:mb-8 leading-[0.9] tracking-tight"
          >
            <motion.span
              className="block mb-3 sm:mb-4 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Promo
            </motion.span>
            <motion.span
              className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              .Music
            </motion.span>
          </motion.h1>

          {/* Enhanced Subtitle with better spacing and typography */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-10 sm:mb-12 space-y-3 sm:space-y-4"
          >
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-bold leading-snug max-w-4xl mx-auto">
              Маркетинговая экосистема <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                для музыкантов
              </span>
            </p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto font-medium">
              Продвигайте треки на радиостанциях • Анализируйте эфиры • Зарабатывайте на ротациях
            </p>
          </motion.div>

          {/* Enhanced CTA Buttons with better mobile layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 max-w-2xl mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-initial"
            >
              <Button
                onClick={onExplore}
                size="lg"
                className="group relative w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-2xl shadow-purple-500/30 border-0 overflow-hidden font-bold"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Начать бесплатно</span>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-initial"
            >
              <Button
                onClick={onLogin}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 hover:bg-white/10 hover:border-white/30 shadow-xl font-semibold"
              >
                Войти в кабинет
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats with better mobile grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto"
          >
            <StatCard number="4" label="Радиостанции" icon="📻" delay={0} />
            <StatCard number="1000+" label="Треков в ротации" icon="🎵" delay={0.1} />
            <StatCard number="24/7" label="Мониторинг эфиров" icon="📡" className="xs:col-span-2 lg:col-span-1" delay={0.2} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({ number, label, icon, className = "", delay }: { number: string; label: string; icon: string; className?: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 + delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 rounded-2xl transition-all" />
      <div className="relative">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-4xl xs:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
          {number}
        </div>
        <div className="text-sm xs:text-base text-slate-400 font-medium">{label}</div>
      </div>
    </motion.div>
  );
}