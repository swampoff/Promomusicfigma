/**
 * BOOKING STATS CARDS - Адаптивные карточки статистики
 * Responsive дизайн для всех устройств
 */

import { motion } from 'motion/react';
import { 
  Calendar, CheckCircle, DollarSign, TrendingUp, 
  Clock, Users, Award, Zap, LucideIcon
} from 'lucide-react';

interface StatCard {
  id: string;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
  bgColor: string;
  description?: string;
}

interface BookingStatsCardsProps {
  stats?: {
    total: number;
    confirmed: number;
    totalSpent: number;
    avgRating: number;
    upcomingCount?: number;
    completedCount?: number;
  };
}

export function BookingStatsCards({ stats }: BookingStatsCardsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const cards: StatCard[] = [
    {
      id: 'total',
      label: 'Всего букингов',
      value: String(stats?.total || 12),
      change: '+3',
      changeType: 'positive',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-cyan-500/20',
      description: 'За последние 30 дней',
    },
    {
      id: 'confirmed',
      label: 'Подтверждено',
      value: String(stats?.confirmed || 8),
      change: '+2',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-emerald-500/20',
      description: 'Готовы к проведению',
    },
    {
      id: 'spent',
      label: 'Потрачено',
      value: formatPrice(stats?.totalSpent || 285000),
      change: '+12%',
      changeType: 'neutral',
      icon: DollarSign,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-pink-500/20',
      description: 'Общая сумма',
    },
    {
      id: 'rating',
      label: 'Средний рейтинг',
      value: String(stats?.avgRating || 4.8),
      change: '+0.2',
      changeType: 'positive',
      icon: Award,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-orange-500/20',
      description: 'От артистов',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const showChange = card.change !== undefined;
        
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden"
          >
            {/* Card */}
            <div className={`
              relative p-4 sm:p-5 rounded-2xl 
              bg-gradient-to-br ${card.bgColor}
              border border-white/10 
              hover:border-white/20
              transition-all duration-300
              hover:scale-[1.02]
            `}>
              {/* Icon Background */}
              <div className="absolute top-2 right-2 opacity-10">
                <Icon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className={`
                  w-10 h-10 sm:w-12 sm:h-12 
                  rounded-xl 
                  bg-white/10 
                  flex items-center justify-center 
                  mb-3 sm:mb-4
                  group-hover:scale-110
                  transition-transform
                `}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color}`} />
                </div>

                {/* Label */}
                <p className="text-slate-300 text-xs sm:text-sm mb-1 sm:mb-2">
                  {card.label}
                </p>

                {/* Value */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {card.value}
                  </span>
                  
                  {showChange && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={`
                        text-xs sm:text-sm font-medium
                        ${card.changeType === 'positive' ? 'text-green-400' : 
                          card.changeType === 'negative' ? 'text-red-400' : 
                          'text-slate-400'}
                      `}
                    >
                      {card.change}
                    </motion.span>
                  )}
                </div>

                {/* Description */}
                {card.description && (
                  <p className="text-xs text-slate-400 truncate">
                    {card.description}
                  </p>
                )}
              </div>

              {/* Hover Effect */}
              <div className="
                absolute inset-0 
                bg-gradient-to-br from-white/0 to-white/5
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                pointer-events-none
              " />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Дополнительный компонент для детальной статистики
export function BookingStatsDetailed() {
  const stats = [
    { label: 'Активных букингов', value: 3, icon: Clock, color: 'text-blue-400' },
    { label: 'Ожидают ответа', value: 2, icon: Calendar, color: 'text-yellow-400' },
    { label: 'Завершенных', value: 15, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Уникальных артистов', value: 8, icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 truncate">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Компонент прогресс-бара для мобильных
export function BookingProgressMobile({ 
  current, 
  total 
}: { 
  current: number; 
  total: number 
}) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-300">Прогресс по букингам</span>
        <span className="text-sm font-medium text-white">{current}/{total}</span>
      </div>
      
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
        />
      </div>

      <p className="text-xs text-slate-400 mt-2">
        {percentage}% букингов подтверждено
      </p>
    </div>
  );
}
