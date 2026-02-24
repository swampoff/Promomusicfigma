/**
 * ПРОМО.ЭИР — Единая радиосистема для заведений
 * 
 * Концепция: Живое радио для бизнеса с умным курированием,
 * многозонным управлением, аналитикой и интеграцией с ПРОМО.ГИД
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Radio, Store, Coffee, Hotel, Dumbbell, Building2, Music,
  BarChart3, CheckCircle2, Zap, Crown, ArrowRight, Play, Pause,
  Headphones, Volume2, Settings, Globe, Star, Award,
  TrendingUp, Users, Target, Sparkles, Wifi, Clock,
  Layers, Shield, Mic2, Monitor, MapPin, Activity
} from 'lucide-react';

interface PromoAirPageProps {
  onGetStarted: () => void;
}

export function PromoAirPage({ onGetStarted }: PromoAirPageProps) {
  const [activeZone, setActiveZone] = useState('main');
  const [isLivePlaying, setIsLivePlaying] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  const zones = [
    { id: 'main', name: 'Зал', genre: 'Lounge', volume: 65, tracks: 128, color: 'from-blue-500 to-cyan-500' },
    { id: 'bar', name: 'Бар', genre: 'Jazz', volume: 45, tracks: 86, color: 'from-purple-500 to-pink-500' },
    { id: 'terrace', name: 'Терраса', genre: 'Chillout', volume: 35, tracks: 64, color: 'from-emerald-500 to-teal-500' },
    { id: 'vip', name: 'VIP', genre: 'Deep House', volume: 55, tracks: 142, color: 'from-amber-500 to-orange-500' },
  ];

  const liveStats = [
    { icon: Radio, label: 'Заведений онлайн', value: '47', color: 'text-green-400' },
    { icon: Music, label: 'Треков в базе', value: '15K+', color: 'text-[#FF577F]' },
    { icon: Users, label: 'Слушателей сейчас', value: '2,841', color: 'text-blue-400' },
    { icon: Clock, label: 'Часов эфира/день', value: '560+', color: 'text-purple-400' },
  ];

  const features = [
    {
      icon: Layers, title: 'Многозонное управление',
      description: 'Разные плейлисты для каждой зоны заведения. Зал, бар, терраса, VIP - своя атмосфера в каждом пространстве.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles, title: 'Умное курирование',
      description: 'Система подбирает музыку под время суток, загруженность зала и настроение гостей. Многозонное управление. Полное лицензирование.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Volume2, title: 'Аудиореклама и джинлы',
      description: 'Брендированные блоки, объявления акций, голосовые приветствия. Профессиональная озвучка силами ПРОМО.',
      color: 'from-[#FF577F] to-orange-500',
    },
    {
      icon: BarChart3, title: 'Аналитика в реальном времени',
      description: 'Какая музыка удерживает гостей дольше? Корреляция жанров с выручкой. Тепловые карты настроений.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Shield, title: 'Лицензирование под ключ',
      description: 'Забудьте о штрафах за нелегальную музыку. Полное лицензирование всего каталога включено в подписку.',
      color: 'from-amber-500 to-yellow-500',
    },
    {
      icon: MapPin, title: 'Интеграция с ПРОМО.ГИД',
      description: 'Ваше заведение появляется на публичной карте: «Сейчас играет...». Привлекайте гостей, которые ищут атмосферу.',
      color: 'from-violet-500 to-indigo-500',
    },
  ];

  const businessTypes = [
    { icon: Coffee, title: 'Рестораны', desc: 'Атмосфера для каждого блюда', count: '20+', img: '☕' },
    { icon: Store, title: 'Ритейл', desc: 'Музыка, повышающая продажи', count: '15+', img: '🛍️' },
    { icon: Hotel, title: 'Отели', desc: 'Премиальное сопровождение', count: '10+', img: '🏨' },
    { icon: Dumbbell, title: 'Фитнес', desc: 'Мотивация в ритме', count: '5+', img: '💪' },
    { icon: Mic2, title: 'Бары & Клубы', desc: 'Энергия ночной жизни', count: '12+', img: '🎤' },
    { icon: Monitor, title: 'Коворкинги', desc: 'Фокус и продуктивность', count: '8+', img: '💻' },
  ];

  const plans = [
    {
      name: 'Старт', icon: Radio, monthlyPrice: 4990, yearlyPrice: 49900,
      color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30',
      features: ['1 зона', '5 000+ треков', 'Базовая аналитика', 'Email поддержка'],
      popular: false, badge: null as string | null,
    },
    {
      name: 'Бизнес', icon: Crown, monthlyPrice: 9990, yearlyPrice: 99900,
      color: 'from-[#FF577F]/20 to-purple-500/20', border: 'border-[#FF577F]/30',
      features: ['До 4 зон', '20 000+ треков', 'Полная аналитика + тепловые карты', 'Расписание по часам', 'Приоритетная поддержка 24/7', 'Брендированные джинглы'],
      popular: true, badge: 'Популярный',
    },
    {
      name: 'Сеть', icon: Globe, monthlyPrice: 14990, yearlyPrice: 149900,
      color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30',
      features: ['Безлимит зон', '50 000+ треков + эксклюзивы', 'Мультилокация', 'API + CRM интеграция', 'Персональный менеджер'],
      popular: false, badge: null as string | null,
    },
    {
      name: 'Enterprise', icon: Building2, monthlyPrice: null as number | null, yearlyPrice: null as number | null,
      color: 'from-violet-500/20 to-indigo-500/20', border: 'border-violet-500/30',
      features: ['Всё из тарифа Сеть', 'SLA 99.9%', 'Брендированное приложение', 'Выделенный консьерж', 'Индивидуальные условия'],
      popular: false, badge: 'Для сетей 10+',
    },
  ];

  const activeZoneData = zones.find(z => z.id === activeZone)!;

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden py-12 xs:py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-15" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[150px] opacity-10" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-6">
              <div className="relative">
                <Radio className="w-4 h-4 text-blue-400" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-sm font-semibold">Единая радиосистема для бизнеса</span>
            </motion.div>

            <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
              <span className="text-white">ПРОМО</span>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">.ЭИР</span>
            </h1>

            <p className="text-base xs:text-lg sm:text-xl text-gray-300 mb-3 max-w-3xl mx-auto">
              Живое радио, которое <span className="text-blue-400 font-semibold">понимает ваш бизнес</span>
            </p>
            <p className="text-sm xs:text-base sm:text-lg text-gray-500 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Система подбирает музыку под время суток, загруженность зала и настроение гостей. Многозонное управление. Полное лицензирование.
            </p>

            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="group w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-3">
                Подключить заведение
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-base sm:text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <Play className="w-5 h-5" /> Демо эфира
              </motion.button>
            </div>
          </motion.div>

          {/* Live Dashboard Preview */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-10 sm:mt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden">
              {/* Dashboard Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-white/5 gap-2 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Radio className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Кофейня «Аромат»</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-green-400">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      В эфире • 4 зоны активны
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 hidden sm:block">12:34 МСК</span>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                    <Activity className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] font-bold text-green-400">LIVE</span>
                  </div>
                </div>
              </div>

              {/* Zones */}
              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                  {zones.map(zone => (
                    <motion.button
                      key={zone.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveZone(zone.id)}
                      className={`relative p-3 sm:p-4 rounded-xl border transition-all text-left ${
                        activeZone === zone.id
                          ? 'bg-white/5 border-blue-500/30 shadow-lg shadow-blue-500/5'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-bold">{zone.name}</span>
                        {activeZone === zone.id && (
                          <div className="flex items-end gap-[1.5px] h-3">
                            {[0, 1, 2].map(i => (
                              <motion.div key={i}
                                animate={{ height: ['2px', '10px', '2px'] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                className={`w-[1.5px] rounded-full bg-gradient-to-t ${zone.color}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{zone.genre}</span>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-white/5">
                          <div className={`h-full rounded-full bg-gradient-to-r ${zone.color}`} style={{ width: `${zone.volume}%` }} />
                        </div>
                        <span className="text-[9px] text-slate-600 font-mono">{zone.volume}%</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Now Playing in active zone */}
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeZoneData.color} flex items-center justify-center`}>
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{activeZoneData.name} • {activeZoneData.genre}</p>
                        <p className="text-[10px] text-slate-500">{activeZoneData.tracks} треков в ротации</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsLivePlaying(!isLivePlaying)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isLivePlaying ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-white/10'}`}
                    >
                      {isLivePlaying ? <Pause className="w-3.5 h-3.5 text-white" fill="white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />}
                    </motion.button>
                  </div>

                  {/* Mini waveform */}
                  <div className="flex items-end gap-[2px] h-8 justify-center">
                    {Array.from({ length: 40 }, (_, i) => {
                      const h = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 20;
                      return (
                        <motion.div
                          key={i}
                          animate={isLivePlaying ? { height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] } : { height: `${h * 0.2}%` }}
                          transition={{ duration: 1 + Math.random() * 0.5, repeat: isLivePlaying ? Infinity : 0, ease: "easeInOut" }}
                          className={`w-[3px] sm:w-1 rounded-full bg-gradient-to-t ${activeZoneData.color} opacity-60`}
                          style={{ minHeight: '2px' }}
                        />
                      );
                    })}
                  </div>

                  {/* Current track info */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
                        <Music className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold">Sunset Boulevard</p>
                        <p className="text-[9px] text-slate-500">Ambient Dreams</p>
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-600 font-mono">2:45 / 4:12</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Banner: Статистика */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-8 sm:mb-12 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-blue-600/20" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.08)_0%,transparent_70%)]" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-cyan-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-black tracking-tight">Статистика в реальном времени</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Прямо сейчас на платформе ПРОМО.ЭИР</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold text-green-400">LIVE</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {liveStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10 text-center group hover:bg-white/10 transition-all">
                  <Icon className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <div className="text-xl sm:text-3xl font-black mb-0.5 sm:mb-1">{stat.value}</div>
                  <div className="text-[10px] sm:text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          {/* Section Banner: Индустрии */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-8 sm:mb-12 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/15 via-blue-500/10 to-purple-600/15" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.06)_0%,transparent_70%)]" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-purple-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-black tracking-tight">Для любого бизнеса</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">70+ заведений уже подключены к единой радиосети</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] sm:text-xs font-bold text-purple-400">70+</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {businessTypes.map((type, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 text-center group hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">{type.img}</div>
                <h3 className="text-xs sm:text-sm font-black mb-0.5">{type.title}</h3>
                <p className="text-[9px] sm:text-xs text-gray-500 mb-1.5">{type.desc}</p>
                <span className="text-[10px] font-bold text-blue-400">{type.count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Banner: Возможности */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-8 sm:mb-12 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF577F]/15 via-purple-500/10 to-[#FF577F]/15" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,87,127,0.06)_0%,transparent_70%)]" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-[#FF577F]/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-lg shadow-[#FF577F]/20 shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-black tracking-tight">Почему ПРОМО.ЭИР?</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Полный пакет для создания уникальной аудио-идентичности</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF577F]/10 border border-[#FF577F]/20">
                <Zap className="w-3.5 h-3.5 text-[#FF577F]" />
                <span className="text-[10px] sm:text-xs font-bold text-[#FF577F]">6 решений</span>
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                  className="group relative bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 hover:border-white/20 transition-all">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-base sm:text-xl font-black mb-2 sm:mb-3">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          {/* Section Banner: Подключение */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-8 sm:mb-12 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/15 via-teal-500/10 to-emerald-600/15" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.06)_0%,transparent_70%)]" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-emerald-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-black tracking-tight">Как подключиться?</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Запуск за 24 часа. Без сложного оборудования.</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] sm:text-xs font-bold text-emerald-400">4 шага</span>
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { step: '01', icon: Settings, title: 'Заявка', desc: 'Заполните форму - мы свяжемся за 1 час' },
              { step: '02', icon: Layers, title: 'Настройка', desc: 'Подберём плейлисты и настроим зоны' },
              { step: '03', icon: Wifi, title: 'Подключение', desc: 'Запуск на любом устройстве с интернетом' },
              { step: '04', icon: Activity, title: 'Мониторинг', desc: 'Аналитика и оптимизация 24/7' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="absolute -top-3 -left-3 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-black text-sm shadow-lg">{s.step}</div>
                <s.icon className="w-8 h-8 text-blue-400 mb-3 ml-6" />
                <h3 className="text-sm sm:text-base font-black mb-1 sm:mb-2">{s.title}</h3>
                <p className="text-[11px] sm:text-sm text-gray-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Banner: Тарифы */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-8 sm:mb-12 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/15 via-orange-500/10 to-amber-600/15" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.06)_0%,transparent_70%)]" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-amber-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-black tracking-tight">Тарифы</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">14 дней бесплатного пробного периода для каждого плана</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] sm:text-xs font-bold text-amber-400">FREE TRIAL</span>
              </div>
            </div>
          </motion.div>

          {/* Trial banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 sm:mb-10 text-center p-5 sm:p-8 rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 border border-green-500/20"
          >
            <h2 className="text-xl sm:text-2xl font-black mb-2">Попробуйте бесплатно 14 дней</h2>
            <p className="text-sm text-slate-400 mb-4">Без карты. Без обязательств. Полный доступ.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 inline-flex items-center gap-2">
              Начать бесплатно <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setBillingPeriod('month')}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                  billingPeriod === 'month' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Месяц
              </button>
              <button
                onClick={() => setBillingPeriod('year')}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all relative ${
                  billingPeriod === 'year' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Год
                <span className="absolute -top-2 -right-3 px-1.5 py-0.5 rounded-full bg-green-500 text-white text-[9px] font-bold">-17%</span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              const isEnterprise = plan.monthlyPrice == null;
              const displayPrice = isEnterprise
                ? null
                : billingPeriod === 'month'
                ? plan.monthlyPrice
                : plan.yearlyPrice;
              const yearSavings = !isEnterprise && plan.monthlyPrice != null
                ? Math.round(plan.monthlyPrice * 12 * 0.17)
                : 0;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className={`relative ${plan.popular ? 'lg:scale-105 z-10' : ''}`}>
                  {(plan.badge || plan.popular) && (
                    <div className={`absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold z-10 shadow-lg ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#FF577F] to-purple-500 shadow-[#FF577F]/30'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30'
                    }`}>
                      {plan.badge || 'Популярный'}
                    </div>
                  )}
                  <div className={`h-full bg-gradient-to-br ${plan.color} backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 border ${plan.border} hover:scale-[1.02] transition-all`}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3 sm:mb-4">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black mb-1 sm:mb-2">{plan.name}</h3>
                    <div className="mb-1 sm:mb-2">
                      {isEnterprise ? (
                        <span className="text-xl sm:text-3xl font-black">По запросу</span>
                      ) : (
                        <span className="contents">
                          <span className="text-2xl sm:text-3xl font-black">
                            {displayPrice!.toLocaleString('ru-RU')} ₽
                          </span>
                          <span className="text-gray-400 text-sm">/{billingPeriod === 'month' ? 'мес' : 'год'}</span>
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'year' && !isEnterprise && (
                      <p className="text-[11px] text-green-400 mb-3">
                        Экономия {yearSavings.toLocaleString('ru-RU')} ₽/год
                      </p>
                    )}
                    {billingPeriod === 'month' && !isEnterprise && plan.yearlyPrice != null && (
                      <p className="text-[10px] text-slate-500 mb-3">
                        или {plan.yearlyPrice.toLocaleString('ru-RU')} ₽/год
                      </p>
                    )}
                    {isEnterprise && <div className="mb-3" />}
                    <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-[11px] sm:text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 text-green-400" />
                          <span className="text-gray-300">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={onGetStarted} className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
                      plan.popular ? 'bg-gradient-to-r from-[#FF577F] to-purple-500 hover:shadow-lg hover:shadow-[#FF577F]/30' : 'bg-white/10 hover:bg-white/20'
                    }`}>
                      {isEnterprise ? 'Связаться' : 'Попробовать 14 дней'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            <div className="relative p-8 sm:p-12 text-center">
              <Radio className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-white" />
              <h2 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4 text-white">Запустите радио за 24 часа</h2>
              <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Присоединяйтесь к 70+ заведениям, создающим уникальную атмосферу с ПРОМО.ЭИР
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-blue-600 rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3">
                Подключить заведение <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}