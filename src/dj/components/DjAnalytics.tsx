/**
 * DJ ANALYTICS - Аналитика диджея
 * Статистика выступлений, популярность миксов, география, доходы
 */

import { motion } from 'motion/react';
import {
  BarChart3, TrendingUp, Users, MapPin, Headphones, Calendar,
  Star, Globe, DollarSign, Eye, Play, Heart, ArrowUpRight,
  Music, Clock, Target, Award, Zap
} from 'lucide-react';

export function DjAnalytics() {

  const monthlyStats = [
    { month: 'Авг', bookings: 3, earnings: 45000 },
    { month: 'Сен', bookings: 5, earnings: 72000 },
    { month: 'Окт', bookings: 4, earnings: 58000 },
    { month: 'Ноя', bookings: 6, earnings: 95000 },
    { month: 'Дек', bookings: 8, earnings: 185000 },
    { month: 'Янв', bookings: 5, earnings: 78000 },
    { month: 'Фев', bookings: 6, earnings: 85000 },
  ];

  const maxEarnings = Math.max(...monthlyStats.map(s => s.earnings));

  const topMixes = [
    { title: 'Melodic Journey #8', plays: 3120, growth: '+23%' },
    { title: 'Deep House Session Vol. 12', plays: 2340, growth: '+15%' },
    { title: 'Techno Underground Mix', plays: 1890, growth: '+8%' },
    { title: 'Summer Vibes 2025', plays: 1650, growth: '+5%' },
    { title: 'Minimal Selection #4', plays: 1230, growth: '+12%' },
  ];

  const geography = [
    { city: 'Москва', bookings: 18, percentage: 45 },
    { city: 'Санкт-Петербург', bookings: 8, percentage: 20 },
    { city: 'Сочи', bookings: 5, percentage: 12.5 },
    { city: 'Казань', bookings: 4, percentage: 10 },
    { city: 'Екатеринбург', bookings: 3, percentage: 7.5 },
    { city: 'Другие', bookings: 2, percentage: 5 },
  ];

  const performanceMetrics = [
    { icon: Star, label: 'Средний рейтинг', value: '4.8', subtext: 'из 5.0', color: 'text-yellow-400' },
    { icon: Calendar, label: 'Всего выступлений', value: '40', subtext: 'за всё время', color: 'text-cyan-400' },
    { icon: Users, label: 'Повторные клиенты', value: '68%', subtext: 'возвращаются', color: 'text-green-400' },
    { icon: Clock, label: 'Среднее время сета', value: '4.5ч', subtext: 'за выступление', color: 'text-purple-400' },
    { icon: DollarSign, label: 'Средний чек', value: '42K ₽', subtext: 'за букинг', color: 'text-orange-400' },
    { icon: Target, label: 'Конверсия', value: '72%', subtext: 'заявок принято', color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-400" />
          Аналитика
        </h1>
        <p className="text-xs lg:text-sm text-gray-400 mt-1">Подробная статистика вашей карьеры DJ</p>
      </motion.div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 lg:gap-3">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-3 lg:p-4 border border-white/10 text-center"
            >
              <Icon className={`w-5 h-5 ${metric.color} mx-auto mb-1.5`} />
              <div className={`text-lg lg:text-xl font-black ${metric.color}`}>{metric.value}</div>
              <div className="text-[10px] text-gray-500">{metric.label}</div>
              <div className="text-[9px] text-gray-600">{metric.subtext}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid xl:grid-cols-5 gap-4 lg:gap-6">
        {/* Earnings Chart — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-3 bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/10"
        >
          <h2 className="text-sm lg:text-base font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Доходы по месяцам
          </h2>
          <div className="flex items-end gap-2 lg:gap-3 h-40 lg:h-48">
            {monthlyStats.map((stat, index) => {
              const heightPercent = (stat.earnings / maxEarnings) * 100;
              return (
                <div key={stat.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] lg:text-[10px] text-gray-400 font-bold">
                    {(stat.earnings / 1000).toFixed(0)}K
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.5, ease: 'easeOut' }}
                    className={`w-full rounded-t-lg ${
                      index === monthlyStats.length - 1
                        ? 'bg-gradient-to-t from-cyan-500 to-cyan-400'
                        : 'bg-gradient-to-t from-white/10 to-white/20'
                    }`}
                  />
                  <span className="text-[9px] lg:text-[10px] text-gray-500">{stat.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] lg:text-xs text-gray-500">Общий доход: <span className="text-white font-bold">{monthlyStats.reduce((s, m) => s + m.earnings, 0).toLocaleString()} ₽</span></span>
            <span className="text-[10px] lg:text-xs text-green-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +18% vs прошлый период
            </span>
          </div>
        </motion.div>

        {/* Top Mixes — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="xl:col-span-2 bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/10"
        >
          <h2 className="text-sm lg:text-base font-bold text-white mb-4 flex items-center gap-2">
            <Headphones className="w-4 h-4 text-purple-400" />
            Топ миксов
          </h2>
          <div className="space-y-2 lg:space-y-3">
            {topMixes.map((mix, index) => (
              <div key={mix.title} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-black text-gray-500">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm text-white font-medium truncate">{mix.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(mix.plays / topMixes[0].plays) * 100}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500">{mix.plays.toLocaleString()}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-400">{mix.growth}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Geography */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/10"
      >
        <h2 className="text-sm lg:text-base font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          География выступлений
        </h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-3">
          {geography.map((geo, index) => (
            <div key={geo.city} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white font-medium">{geo.city}</span>
                  <span className="text-[10px] text-gray-500">{geo.bookings} букингов</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${geo.percentage}%` }}
                    transition={{ delay: 0.4 + index * 0.05, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  />
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-400">{geo.percentage}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-indigo-500/20"
      >
        <h2 className="text-sm lg:text-base font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          Достижения
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
          {[
            { icon: Zap, label: 'Первый букинг', unlocked: true },
            { icon: Star, label: 'Рейтинг 4.5+', unlocked: true },
            { icon: Headphones, label: '10+ миксов', unlocked: true },
            { icon: Users, label: '1000 подписчиков', unlocked: true },
            { icon: Calendar, label: '25 выступлений', unlocked: true },
            { icon: Globe, label: '5+ городов', unlocked: true },
            { icon: DollarSign, label: '1M+ заработано', unlocked: true },
            { icon: Target, label: 'Верификация', unlocked: true },
          ].map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.label}
                className={`flex items-center gap-2 p-2.5 rounded-xl ${
                  achievement.unlocked
                    ? 'bg-yellow-500/10 border border-yellow-500/20'
                    : 'bg-white/5 border border-white/5 opacity-40'
                }`}
              >
                <Icon className={`w-4 h-4 ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-600'}`} />
                <span className="text-[10px] lg:text-xs font-bold text-white">{achievement.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
