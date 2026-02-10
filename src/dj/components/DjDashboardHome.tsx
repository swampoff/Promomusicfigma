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

  // Quick stats
  const stats = [
    { icon: Headphones, label: 'Миксы', value: '24', change: '+3', trend: 'up', color: 'from-purple-500 to-violet-500' },
    { icon: Play, label: 'Прослушивания', value: '12.4K', change: '+18%', trend: 'up', color: 'from-violet-500 to-fuchsia-500' },
    { icon: Calendar, label: 'Букинги', value: '8', change: '+2', trend: 'up', color: 'from-purple-600 to-indigo-500' },
    { icon: DollarSign, label: 'Заработок', value: '285K', change: '+24%', trend: 'up', color: 'from-fuchsia-500 to-purple-500' },
    { icon: Star, label: 'Рейтинг', value: '4.8', change: '+0.2', trend: 'up', color: 'from-violet-600 to-purple-400' },
    { icon: Users, label: 'Подписчики', value: '1.2K', change: '+89', trend: 'up', color: 'from-purple-400 to-violet-600' },
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

  // Upcoming bookings
  const upcomingBookings = [
    {
      id: '1',
      eventName: 'Club Night @ Pravda',
      date: '14 фев 2026',
      time: '23:00 - 04:00',
      venue: 'Pravda Club',
      city: 'Москва',
      status: 'confirmed',
      amount: '35,000 ₽',
      eventType: 'Клубная вечеринка'
    },
    {
      id: '2',
      eventName: 'Корпоратив Digital Agency',
      date: '18 фев 2026',
      time: '19:00 - 23:00',
      venue: 'Loft Hall',
      city: 'Москва',
      status: 'deposit_paid',
      amount: '50,000 ₽',
      eventType: 'Корпоратив'
    },
    {
      id: '3',
      eventName: 'Winter Festival',
      date: '22 фев 2026',
      time: '16:00 - 20:00',
      venue: 'A2 Green Concert',
      city: 'СПб',
      status: 'pending',
      amount: '75,000 ₽',
      eventType: 'Фестиваль'
    },
  ];

  // Recent mixes
  const recentMixes = [
    {
      id: '1',
      title: 'Deep House Session Vol. 12',
      duration: '1:24:30',
      plays: 2340,
      likes: 187,
      downloads: 45,
      genres: ['Deep House', 'Progressive'],
      cover: 'https://images.unsplash.com/photo-1670529275215-d952f9633a4d?w=200',
      date: '5 фев 2026'
    },
    {
      id: '2',
      title: 'Techno Underground Mix',
      duration: '2:01:15',
      plays: 1890,
      likes: 156,
      downloads: 38,
      genres: ['Techno', 'Minimal'],
      cover: 'https://images.unsplash.com/photo-1761858736318-f1fe86aec4db?w=200',
      date: '1 фев 2026'
    },
    {
      id: '3',
      title: 'Melodic Journey #8',
      duration: '1:45:00',
      plays: 3120,
      likes: 245,
      downloads: 67,
      genres: ['Melodic Techno', 'Progressive'],
      cover: 'https://images.unsplash.com/photo-1670529275215-d952f9633a4d?w=200',
      date: '28 янв 2026'
    },
  ];

  // Notifications
  const notifications = [
    { type: 'booking', message: 'Новый запрос на букинг от Loft Hall', time: '2 часа назад', icon: Calendar },
    { type: 'review', message: 'Новый отзыв от клиента (5 звёзд)', time: '5 часов назад', icon: Star },
    { type: 'mix', message: 'Ваш микс набрал 1000+ прослушиваний', time: '1 день назад', icon: Headphones },
    { type: 'payment', message: 'Перевод 35,000 ₽ зачислен', time: '2 дня назад', icon: DollarSign },
  ];

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Ожидает' },
    accepted: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Принят' },
    deposit_paid: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Депозит' },
    confirmed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Подтверждён' },
    completed: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Завершён' },
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl xl:rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-violet-600/20 to-fuchsia-600/30" />
        <div className="absolute inset-0 backdrop-blur-xl bg-white/5" />
        <div className="relative p-5 lg:p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Disc3 className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xs lg:text-sm font-bold text-purple-300 uppercase tracking-wider">DJ Dashboard</span>
              </div>
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black text-white mb-1">
                Добро пожаловать, <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">{localStorage.getItem('djName') || 'DJ'}</span>
              </h1>
              <p className="text-sm lg:text-base text-gray-400">Управляйте карьерой, букингами и миксами в одном месте</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('profile')}
                className="px-4 py-2 lg:px-5 lg:py-2.5 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 text-sm font-bold hover:bg-white/20 transition-all"
              >
                Редактировать профиль
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('mixes')}
                className="px-4 py-2 lg:px-5 lg:py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Загрузить микс
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/10 group hover:bg-white/10 transition-all"
            >
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 lg:mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="text-lg lg:text-2xl font-black text-white">{stat.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] lg:text-xs text-gray-400">{stat.label}</span>
                <span className="text-[10px] lg:text-xs text-green-400 font-bold">{stat.change}</span>
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
        <h2 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(action.section)}
                className="flex flex-col items-center gap-2 p-3 lg:p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:shadow-lg transition-shadow`}>
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className="text-[10px] lg:text-xs font-bold text-gray-300 text-center leading-tight">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid xl:grid-cols-5 gap-4 lg:gap-6">

        {/* Upcoming Bookings — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-3"
        >
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h2 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
              Предстоящие букинги
            </h2>
            <button
              onClick={() => onNavigate('bookings')}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              Все букинги <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingBookings.map((booking) => {
              const status = statusColors[booking.status] || statusColors.pending;
              return (
                <motion.div
                  key={booking.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer"
                  onClick={() => onNavigate('bookings')}
                >
                  <div className="flex items-start justify-between gap-3 mb-2 lg:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm lg:text-base font-bold text-white truncate">{booking.eventName}</h3>
                      <p className="text-xs text-gray-400">{booking.eventType}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] lg:text-xs font-bold ${status.bg} ${status.text} whitespace-nowrap`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {booking.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {booking.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {booking.venue}, {booking.city}
                    </span>
                  </div>
                  <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Гонорар</span>
                    <span className="text-sm lg:text-base font-black text-white">{booking.amount}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Notifications — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="xl:col-span-2"
        >
          <h2 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
            Уведомления
          </h2>
          <div className="space-y-2 lg:space-y-3">
            {notifications.map((notif, index) => {
              const Icon = notif.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-3 lg:p-4 border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm text-white font-medium leading-tight">{notif.message}</p>
                      <p className="text-[10px] lg:text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Platform Benefits Mini */}
          <div className="mt-4 lg:mt-6 bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-purple-500/20">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
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
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Recent Mixes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h2 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
            <Headphones className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
            Последние миксы
          </h2>
          <button
            onClick={() => onNavigate('mixes')}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            Все миксы <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
          {recentMixes.map((mix) => (
            <motion.div
              key={mix.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
            >
              {/* Cover */}
              <div className="relative h-32 lg:h-36 overflow-hidden">
                <img src={mix.cover} alt={mix.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                  <div className="flex gap-1">
                    {mix.genres.map((g) => (
                      <span key={g} className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[9px] text-white font-bold">{g}</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-white/80 font-mono">{mix.duration}</span>
                </div>
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-purple-500/80 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-3 lg:p-4">
                <h3 className="text-sm lg:text-base font-bold text-white truncate mb-1">{mix.title}</h3>
                <p className="text-[10px] lg:text-xs text-gray-500 mb-2">{mix.date}</p>
                <div className="flex items-center gap-3 text-[10px] lg:text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {mix.plays.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {mix.likes}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {mix.downloads}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Earnings Overview + Referral */}
      <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
        {/* Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-5 lg:p-6 border border-white/10"
        >
          <h3 className="text-sm lg:text-base font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-yellow-400" />
            Финансы
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm text-gray-400">Баланс</span>
              <span className="text-lg lg:text-xl font-black text-white">142,500 ₽</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm text-gray-400">В обработке</span>
              <span className="text-sm font-bold text-yellow-400">35,000 ₽</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm text-gray-400">За этот месяц</span>
              <span className="text-sm font-bold text-green-400">+85,000 ₽</span>
            </div>
            <div className="pt-3 border-t border-white/5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('finances')}
                className="w-full py-2.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl text-xs lg:text-sm font-bold text-yellow-300 hover:border-yellow-500/50 transition-all"
              >
                Вывести средства
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Referral Program */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-xl lg:rounded-2xl p-5 lg:p-6 border border-purple-500/20"
        >
          <h3 className="text-sm lg:text-base font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Реферальная программа
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm text-gray-400">Приглашено</span>
              <span className="text-lg lg:text-xl font-black text-white">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm text-gray-400">Бонусы</span>
              <span className="text-sm font-bold text-purple-400">8,500 ₽</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 mt-2">
              <p className="text-[10px] lg:text-xs text-gray-400 mb-1">Ваш реферальный код</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-xs lg:text-sm font-mono text-purple-300 truncate">DJPULSE2026</code>
                <button className="px-3 py-2 bg-purple-500/20 rounded-lg text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-colors">
                  Копировать
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}