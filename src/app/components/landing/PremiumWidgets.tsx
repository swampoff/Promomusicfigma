/**
 * PREMIUM WIDGETS - Премиум виджеты в стиле glassmorphism
 * С улучшенной адаптивностью и анимациями
 */

import { motion } from 'motion/react';
import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Gift, Headphones, Crown, Music, TrendingUp, Zap, Star, Award, Target } from 'lucide-react';
import { GlassCard, GlassButton } from './GlassCard';

/**
 * MAGNETIC EFFECT - Магнитный эффект для элементов
 * Элемент следует за курсором с плавной анимацией
 */
interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  disabled?: boolean; // Отключаем на мобильных
}

export function Magnetic({ children, strength = 0.4, disabled = false }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Проверяем размер экрана
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (disabled || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      setPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (element) {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [strength, disabled, isMobile]);

  return (
    <div ref={ref} className="inline-block">
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * TRACK TEST WIDGET - Виджет тестирования трека с адаптивностью
 */
export function TrackTestWidget() {
  return (
    <GlassCard variant="gradient" blur="lg" glow className="p-3 xs:p-4 relative overflow-hidden group">
      {/* Декоративный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF577F]/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <motion.div 
        className="relative z-10"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Иконка с анимацией */}
        <motion.div 
          className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center mb-2.5 xs:mb-3 shadow-lg shadow-[#FF577F]/30"
          animate={{
            boxShadow: [
              '0 0 15px rgba(255,87,127,0.3)',
              '0 0 25px rgba(255,87,127,0.5)',
              '0 0 15px rgba(255,87,127,0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
        </motion.div>

        <h3 className="text-sm xs:text-base font-black mb-1 xs:mb-1.5 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Тест трека
        </h3>
        <p className="text-[10px] xs:text-xs text-slate-400 mb-2.5 xs:mb-3 leading-relaxed">
          AI-оценка потенциала вашего трека за 60 секунд
        </p>

        <GlassButton variant="neon" size="sm" className="w-full">
          <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5 mr-1 xs:mr-1.5" />
          <span className="hidden xs:inline">Протестировать</span>
          <span className="xs:hidden">Тест</span>
        </GlassButton>
      </motion.div>

      {/* Плавающие частицы */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-10 -right-10 w-20 h-20 bg-[#FF577F]/10 rounded-full blur-xl"
      />
    </GlassCard>
  );
}

/**
 * SPECIAL OFFER WIDGET - Виджет спецпредложений
 */
export function SpecialOfferWidget() {
  return (
    <GlassCard variant="premium" blur="lg" className="p-3 xs:p-4 relative overflow-hidden group">
      {/* Анимированный градиент */}
      <motion.div
        animate={{
          background: [
            'linear-gradient(45deg, rgba(255,87,127,0.1), rgba(168,85,247,0.1))',
            'linear-gradient(90deg, rgba(168,85,247,0.1), rgba(59,130,246,0.1))',
            'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(255,87,127,0.1))',
            'linear-gradient(45deg, rgba(255,87,127,0.1), rgba(168,85,247,0.1))',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute inset-0"
      />

      <div className="relative z-10">
        <motion.div 
          className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-2.5 xs:mb-3 shadow-lg"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <Gift className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
        </motion.div>

        <h3 className="text-sm xs:text-base font-black mb-1 xs:mb-1.5 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Спецпредложения
        </h3>
        <p className="text-[10px] xs:text-xs text-slate-400 mb-2.5 xs:mb-3">
          🎉 -50% на все тарифы до конца месяца
        </p>

        <GlassButton variant="secondary" size="sm" className="w-full">
          <span className="hidden xs:inline">Смотреть акции</span>
          <span className="xs:hidden">Акции</span>
        </GlassButton>
      </div>
    </GlassCard>
  );
}

/**
 * SUBSCRIPTION WIDGET - Виджет подписки
 */
export function SubscriptionWidget() {
  return (
    <GlassCard variant="neon" blur="lg" className="p-3 xs:p-4 relative overflow-hidden">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-[#FF577F]/5 to-transparent"
      />

      <div className="relative z-10">
        <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg xs:rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center mb-2.5 xs:mb-3 border border-[#FF577F]/30">
          <Crown className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
        </div>

        <h3 className="text-sm xs:text-base font-black mb-1 xs:mb-1.5">Premium</h3>
        <p className="text-[10px] xs:text-xs text-slate-400 mb-2.5 xs:mb-3">
          Безлимитные загрузки и продвижение
        </p>

        <GlassButton variant="primary" size="sm" className="w-full" glow>
          <Crown className="w-3 h-3 xs:w-3.5 xs:h-3.5 mr-1 xs:mr-1.5" />
          <span className="hidden xs:inline">Подключить</span>
          <span className="xs:hidden">Pro</span>
        </GlassButton>
      </div>
    </GlassCard>
  );
}

/**
 * HEADPHONES WIDGET - Виджет наушников
 */
export function HeadphonesWidget() {
  return (
    <GlassCard variant="gradient" blur="lg" className="p-3 xs:p-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <motion.div className="relative z-10" whileHover={{ y: -4 }}>
        <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-2.5 xs:mb-3 shadow-lg">
          <Headphones className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
        </div>

        <h3 className="text-sm xs:text-base font-black mb-1 xs:mb-1.5">Студийные наушники</h3>
        <p className="text-[10px] xs:text-xs text-slate-400 mb-1.5 xs:mb-2">
          <span className="line-through text-slate-500">₽24,990</span>
          <span className="ml-1.5 xs:ml-2 text-[#FF577F] font-bold">₽14,990</span>
        </p>
        <p className="text-[9px] xs:text-[10px] text-emerald-400 mb-2.5 xs:mb-3">✓ Скидка 40% для артистов</p>

        <GlassButton variant="secondary" size="sm" className="w-full">
          <span className="hidden xs:inline">Купить со скидкой</span>
          <span className="xs:hidden">Купить</span>
        </GlassButton>
      </motion.div>
    </GlassCard>
  );
}

/**
 * TOP ARTISTS WIDGET - Виджет топ артистов
 */
interface Artist {
  id: string;
  name: string;
  points: number;
  rank: number;
}

export function TopArtistsWidget({ artists }: { artists: Artist[] }) {
  return (
    <GlassCard variant="hover" blur="lg" className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Award className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-black">Топ артистов</h3>
      </div>

      <div className="space-y-2">
        {artists.map((artist, index) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
            className="flex items-center gap-3 p-2 rounded-lg transition-colors"
          >
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
              ${index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' : ''}
              ${index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' : ''}
              ${index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' : ''}
              ${index > 2 ? 'bg-white/10 text-slate-400' : ''}
            `}>
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{artist.name}</p>
              <p className="text-[10px] text-slate-400">{artist.points.toLocaleString()} pts</p>
            </div>

            {index === 0 && (
              <motion.div
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-4 h-4 text-yellow-500" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <GlassButton variant="ghost" size="sm" className="w-full mt-3">
        <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
        Полный рейтинг
      </GlassButton>
    </GlassCard>
  );
}

/**
 * STATS CARD - Статистическая карточка
 */
interface StatsCardProps {
  icon: any;
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  color?: string;
}

export function StatsCard({ icon: Icon, title, value, change, trend, color = '#FF577F' }: StatsCardProps) {
  return (
    <GlassCard variant="hover" blur="md" className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}40, ${color}20)`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>

        {change && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              trend === 'up' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            <motion.div
              animate={{ y: trend === 'up' ? [-2, 0, -2] : [2, 0, 2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {trend === 'up' ? '↑' : '↓'}
            </motion.div>
            {change}
          </motion.div>
        )}
      </div>

      <p className="text-2xl font-black mb-1">{value}</p>
      <p className="text-xs text-slate-400">{title}</p>
    </GlassCard>
  );
}