/**
 * DJ DASHBOARD HOME - Главная страница кабинета диджея
 * Обзор статистики, быстрые действия, предстоящие букинги, последние миксы
 */

import { motion } from 'motion/react';
import {
  Disc3, TrendingUp, Users, Calendar, DollarSign, Headphones,
  Music, Star, ArrowRight, Clock, MapPin, Play, Upload,
  BarChart3, Wallet, Sparkles, Zap, Radio, Eye, Heart,
  Download, MessageSquare, CheckCircle2, AlertCircle, UserCheck
} from 'lucide-react';

interface DjDashboardHomeProps {
  onNavigate: (section: string) => void;
}

export function DjDashboardHome({ onNavigate }: DjDashboardHomeProps) {
  const djName = localStorage.getItem('djName') || localStorage.getItem('userName') || 'DJ';

  // Stats — real data (zeros for new users, will be populated from API)
  const stats = [
    { icon: Headphones, label: 'Миксы', value: '0', change: '—', color: 'from-purple-500 to-violet-500' },
    { icon: Play, label: 'Прослушивания', value: '0', change: '—', color: 'from-violet-500 to-fuchsia-500' },
    { icon: Calendar, label: 'Букинги', value: '0', change: '—', color: 'from-purple-600 to-indigo-500' },
    { icon: DollarSign, label: 'Заработок', value: '0', change: '—', color: 'from-fuchsia-500 to-purple-500' },
    { icon: Star, label: 'Рейтинг', value: '—', change: '', color: 'from-violet-600 to-purple-400' },
    { icon: Users, label: 'Подписчики', value: '0', change: '—', color: 'from-purple-400 to-violet-600' },
  ];

  // Quick actions
  const quickActions = [
    { icon: Upload, label: 'Загрузить микс', section: 'mixes', color: 'from-purple-500 to-violet-500' },
    { icon: Calendar, label: 'Букинги', section: 'bookings', color: 'from-violet-500 to-fuchsia-500' },
    { icon: Wallet, label: 'Кошелёк', section: 'finances', color: 'from-purple-600 to-indigo-500' },
    { icon: Users, label: 'Коллаборации', section: 'collaborations', color: 'from-fuchsia-500 to-purple-500' },
    { icon: BarChart3, label: 'Аналитика', section: 'analytics', color: 'from-violet-600 to-purple-400' },
    { icon: Radio, label: 'Продвижение', section: 'promotion', color: 'from-purple-400 to-violet-600' },
  ];

  return (
    <div className="space-y-4 xs:space-y-5 lg:space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl xs:rounded-2xl xl:rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-violet-600/20 to-fuchsia-600/30" />
        <div className="absolute inset-0 backdrop-blur-xl bg-white/5" />
        <div className="relative p-3.5 xs:p-5 lg:p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4">
            <div>
              <div className="flex items-center gap-1.5 xs:gap-2 mb-1">
                <Disc3 className="w-4 h-4 xs:w-5 xs:h-5 lg:w-6 lg:h-6 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-[10px] xs:text-xs lg:text-sm font-bold text-purple-300 uppercase tracking-wider">DJ Dashboard</span>
              </div>
              <h1 className="text-xl xs:text-2xl lg:text-3xl xl:text-4xl font-black text-white mb-1">
                Добро пожаловать, <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">{djName}</span>
              </h1>
              <p className="text-xs xs:text-sm lg:text-base text-gray-400">Управляйте карьерой, букингами и миксами в одном месте</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('profile')}
                className="flex-1 sm:flex-none px-3 py-1.5 xs:px-4 xs:py-2 lg:px-5 lg:py-2.5 bg-white/10 backdrop-blur-xl rounded-lg xs:rounded-xl border border-white/10 text-xs xs:text-sm font-bold hover:bg-white/20 transition-all truncate"
              >
                Редактировать профиль
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('mixes')}
                className="flex-1 sm:flex-none px-3 py-1.5 xs:px-4 xs:py-2 lg:px-5 lg:py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-1.5 xs:gap-2"
              >
                <Upload className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                <span className="truncate">Загрузить микс</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2 xs:gap-3 lg:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-xl rounded-lg xs:rounded-xl lg:rounded-2xl p-2.5 xs:p-3 lg:p-4 border border-white/10 group hover:bg-white/10 transition-all"
            >
              <div className={`w-7 h-7 xs:w-8 xs:h-8 lg:w-10 lg:h-10 rounded-md xs:rounded-lg lg:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-1.5 xs:mb-2 lg:mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="text-base xs:text-lg lg:text-2xl font-black text-white">{stat.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] xs:text-[10px] lg:text-xs text-gray-400">{stat.label}</span>
                {stat.change && <span className="text-[9px] xs:text-[10px] lg:text-xs text-gray-500 font-bold">{stat.change}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm xs:text-base lg:text-lg font-bold text-white mb-2.5 xs:mb-3 lg:mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-1.5 xs:gap-2 lg:gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(action.section)}
                className="flex flex-col items-center gap-1.5 xs:gap-2 p-2 xs:p-3 lg:p-4 bg-white/5 backdrop-blur-xl rounded-lg xs:rounded-xl border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className={`w-8 h-8 xs:w-10 xs:h-10 lg:w-12 lg:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:shadow-lg transition-shadow`}>
                  <Icon className="w-4 h-4 xs:w-5 xs:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className="text-[9px] xs:text-[10px] lg:text-xs font-bold text-gray-300 text-center leading-tight">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid xl:grid-cols-5 gap-3 xs:gap-4 lg:gap-6">

        {/* Bookings — empty state */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-3"
        >
          <div className="flex items-center justify-between mb-2.5 xs:mb-3 lg:mb-4">
            <h2 className="text-sm xs:text-base lg:text-lg font-bold text-white flex items-center gap-1.5 xs:gap-2">
              <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 lg:w-5 lg:h-5 text-purple-400" />
              Предстоящие букинги
            </h2>
            <button
              onClick={() => onNavigate('bookings')}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              Все букинги <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-lg xs:rounded-xl lg:rounded-2xl p-6 xs:p-8 lg:p-10 border border-white/10 text-center">
            <Calendar className="w-10 h-10 xs:w-12 xs:h-12 text-purple-500/30 mx-auto mb-3" />
            <p className="text-sm xs:text-base text-gray-400 font-medium mb-1">Пока нет букингов</p>
            <p className="text-xs text-gray-500 mb-4">Заполните профиль и добавьте миксы, чтобы получать предложения от заведений</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('profile')}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-all"
            >
              Заполнить профиль
            </motion.button>
          </div>
        </motion.div>

        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="xl:col-span-2"
        >
          <h2 className="text-sm xs:text-base lg:text-lg font-bold text-white mb-2.5 xs:mb-3 lg:mb-4 flex items-center gap-1.5 xs:gap-2">
            <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 lg:w-5 lg:h-5 text-yellow-400" />
            Начните здесь
          </h2>
          <div className="space-y-1.5 xs:space-y-2 lg:space-y-3">
            {[
              { icon: UserCheck, text: 'Заполните профиль DJ', section: 'profile' },
              { icon: Upload, text: 'Загрузите первый микс', section: 'mixes' },
              { icon: Calendar, text: 'Настройте календарь доступности', section: 'bookings' },
              { icon: Radio, text: 'Активируйте продвижение', section: 'promotion' },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  onClick={() => onNavigate(step.section)}
                  className="bg-white/5 backdrop-blur-xl rounded-lg xs:rounded-xl p-2.5 xs:p-3 lg:p-4 border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 xs:gap-3">
                    <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-md xs:rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-400" />
                    </div>
                    <p className="text-[10px] xs:text-xs lg:text-sm text-white font-medium">{step.text}</p>
                    <ArrowRight className="w-3 h-3 text-gray-500 ml-auto flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Platform Benefits Mini */}
          <div className="mt-3 xs:mt-4 lg:mt-6 bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-xl rounded-lg xs:rounded-xl lg:rounded-2xl p-3 xs:p-4 lg:p-5 border border-purple-500/20">
            <h3 className="text-xs xs:text-sm font-bold text-white mb-2 xs:mb-3 flex items-center gap-1.5 xs:gap-2">
              <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-400" />
              Преимущества платформы
            </h3>
            <ul className="space-y-2">
              {[
                'Букинги без посредников — 85% гонорара',
                'Динамическое ценообразование',
                'Календарь доступности',
                'Портфолио и промо-миксы',
                'Реферальная программа',
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-1.5 xs:gap-2 text-[10px] xs:text-xs text-gray-300">
                  <CheckCircle2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Mixes — empty state */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-2.5 xs:mb-3 lg:mb-4">
          <h2 className="text-sm xs:text-base lg:text-lg font-bold text-white flex items-center gap-1.5 xs:gap-2">
            <Headphones className="w-3.5 h-3.5 xs:w-4 xs:h-4 lg:w-5 lg:h-5 text-purple-400" />
            Последние миксы
          </h2>
          <button
            onClick={() => onNavigate('mixes')}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            Все миксы <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-lg xs:rounded-xl lg:rounded-2xl p-6 xs:p-8 border border-white/10 text-center">
          <Headphones className="w-10 h-10 xs:w-12 xs:h-12 text-purple-500/30 mx-auto mb-3" />
          <p className="text-sm xs:text-base text-gray-400 font-medium mb-1">Пока нет миксов</p>
          <p className="text-xs text-gray-500 mb-4">Загрузите ваш первый микс, чтобы начать получать прослушивания</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('mixes')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg text-xs font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
          >
            <Upload className="w-3.5 h-3.5 inline mr-1.5" />
            Загрузить микс
          </motion.button>
        </div>
      </motion.div>

      {/* Finances — clean for new users */}
      <div className="grid sm:grid-cols-2 gap-3 xs:gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-xl rounded-lg xs:rounded-xl lg:rounded-2xl p-3.5 xs:p-5 lg:p-6 border border-white/10"
        >
          <h3 className="text-xs xs:text-sm lg:text-base font-bold text-white mb-3 xs:mb-4 flex items-center gap-1.5 xs:gap-2">
            <Wallet className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-yellow-400" />
            Финансы
          </h3>
          <div className="space-y-2 xs:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] xs:text-xs lg:text-sm text-gray-400">Баланс</span>
              <span className="text-base xs:text-lg lg:text-xl font-black text-white">0 ₽</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] xs:text-xs lg:text-sm text-gray-400">В обработке</span>
              <span className="text-xs xs:text-sm font-bold text-gray-500">0 ₽</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] xs:text-xs lg:text-sm text-gray-400">За этот месяц</span>
              <span className="text-xs xs:text-sm font-bold text-gray-500">0 ₽</span>
            </div>
            <div className="pt-2 xs:pt-3 border-t border-white/5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('finances')}
                className="w-full py-2 xs:py-2.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg xs:rounded-xl text-[10px] xs:text-xs lg:text-sm font-bold text-yellow-300 hover:border-yellow-500/50 transition-all"
              >
                Подробнее
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Referral Program */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-lg xs:rounded-xl lg:rounded-2xl p-3.5 xs:p-5 lg:p-6 border border-purple-500/20"
        >
          <h3 className="text-xs xs:text-sm lg:text-base font-bold text-white mb-3 xs:mb-4 flex items-center gap-1.5 xs:gap-2">
            <Users className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-400" />
            Реферальная программа
          </h3>
          <div className="space-y-2 xs:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] xs:text-xs lg:text-sm text-gray-400">Приглашено</span>
              <span className="text-base xs:text-lg lg:text-xl font-black text-white">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] xs:text-xs lg:text-sm text-gray-400">Бонусы</span>
              <span className="text-xs xs:text-sm font-bold text-gray-500">0 ₽</span>
            </div>
            <p className="text-[10px] xs:text-xs text-gray-500">Приглашайте коллег и получайте бонусы за каждую регистрацию</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
