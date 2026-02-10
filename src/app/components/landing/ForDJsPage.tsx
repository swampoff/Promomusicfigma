/**
 * FOR DJS PAGE — Уникальный лендинг для диджеев
 * ОТЛИЧИЯ ОТ ARTIST PAGE:
 * - Горизонтальный таймлайн букинг-процесса (вместо grid-шагов)
 * - Секция «Без платформы vs С платформой» (сравнительная таблица)
 * - Alternating layout фич (зигзаг: иконка + текст слева/справа)
 * - Встроенный мини-превью DJ Marketplace
 * - Калькулятор заработка (интерактивный)
 * - Compact pricing bar (горизонтальный, не grid-карточки)
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Disc3, TrendingUp, Users, Calendar, DollarSign, Headphones,
  Star, ArrowRight, MapPin, Play,
  BarChart3, Wallet, Zap, Radio, Globe,
  Shield, Award, CheckCircle2,
  UserCheck, Eye, Tag, Wrench, Gift,
  ArrowDown, Minus, Plus, X, Check
} from 'lucide-react';
import djHeroImage from "figma:asset/ca808e4b4b1d6241e1fb4b048e027e543644b4dd.png";

interface ForDJsPageProps {
  onGetStarted: () => void;
}

export function ForDJsPage({ onGetStarted }: ForDJsPageProps) {

  /* ═══════ INTERACTIVE CALCULATOR ═══════ */
  const [gigsPerMonth, setGigsPerMonth] = useState(4);
  const [avgPrice, setAvgPrice] = useState(25000);
  const calcGross = gigsPerMonth * avgPrice;
  const calcCommission = calcGross * 0.15;
  const calcNet = calcGross - calcCommission;

  /* ═══════ DATA ═══════ */

  const comparisonRows = [
    { feature: 'Поиск клиентов', without: 'Сарафанное радио, соцсети', with: 'DJ Marketplace - клиенты сами находят', advantage: true },
    { feature: 'Букинг', without: 'Переписка в мессенджерах', with: 'Заявки в кабинете, статусы, чат', advantage: true },
    { feature: 'Ценообразование', without: 'Ручной расчёт каждый раз', with: 'Автоматические множители (выходные, праздники)', advantage: true },
    { feature: 'Гонорар', without: 'Агент берёт 30–50%', with: '85% остаётся вам', advantage: true },
    { feature: 'Портфолио', without: 'SoundCloud + ссылки в шапке', with: 'Единая витрина: миксы, фото, видео, отзывы', advantage: true },
    { feature: 'Финансы', without: 'Таблица в Excel', with: 'Дашборд: баланс, транзакции, вывод', advantage: true },
    { feature: 'Аналитика', without: 'Нет данных', with: 'География, конверсия, рост рейтинга', advantage: true },
    { feature: 'Рефералы', without: 'Нет', with: 'Бонус за каждого приглашённого DJ', advantage: true },
  ];

  const timelineSteps = [
    { icon: UserCheck, label: 'Профиль', sub: 'Жанры, ставки, райдер' },
    { icon: Globe, label: 'Marketplace', sub: 'Клиенты находят вас' },
    { icon: Calendar, label: 'Букинг', sub: 'Заявка → депозит → ✓' },
    { icon: Headphones, label: 'Выступление', sub: 'Делаете то, что любите' },
    { icon: Wallet, label: 'Оплата', sub: '85% на баланс' },
  ];

  const coreFeatures = [
    {
      icon: Calendar,
      title: 'Букинг без посредников',
      points: ['Приём заявок в кабинете', 'Статусы: ожидает → депозит → подтверждён', 'Чат с клиентом', 'Push-уведомления'],
      accent: 'purple',
    },
    {
      icon: DollarSign,
      title: 'Динамическое ценообразование',
      points: ['x1.3 выходные (Пт–Сб)', 'x2.0 праздники', 'x1.5 свадьбы', 'Клиент видит финальную цену'],
      accent: 'amber',
    },
    {
      icon: Headphones,
      title: 'Портфолио миксов',
      points: ['Загрузка до 500MB', 'Прослушивания, лайки, скачивания', 'Продажа премиум-миксов', 'SoundCloud / Mixcloud'],
      accent: 'violet',
    },
    {
      icon: BarChart3,
      title: 'Аналитика карьеры',
      points: ['География букингов', 'Конверсия заявок', 'Динамика рейтинга', 'Рост подписчиков'],
      accent: 'emerald',
    },
  ];

  const extraTools = [
    { icon: Globe, label: 'Marketplace' },
    { icon: MapPin, label: 'Календарь' },
    { icon: Tag, label: 'Аддоны' },
    { icon: Wrench, label: 'Райдер' },
    { icon: Users, label: 'Коллабы' },
    { icon: Gift, label: 'Рефералы' },
    { icon: Radio, label: 'Promo.air' },
    { icon: Shield, label: 'Гарантии' },
  ];

  const marketplacePreview = [
    { name: 'DJ Pulse', city: 'Москва', genre: 'House', rating: 4.9, price: '25K' },
    { name: 'DJ Stella', city: 'СПб', genre: 'Open Format', rating: 5.0, price: '30K' },
    { name: 'DJ Aurora', city: 'Москва', genre: 'Trance', rating: 4.9, price: '35K' },
  ];

  const accentColor = (a: string) => {
    const map: Record<string, string> = {
      purple: 'from-purple-500 to-violet-500',
      amber: 'from-amber-500 to-orange-500',
      violet: 'from-violet-500 to-fuchsia-500',
      emerald: 'from-emerald-500 to-green-500',
    };
    return map[a] || map.purple;
  };

  const accentText = (a: string) => {
    const map: Record<string, string> = {
      purple: 'text-purple-400',
      amber: 'text-amber-400',
      violet: 'text-violet-400',
      emerald: 'text-emerald-400',
    };
    return map[a] || map.purple;
  };

  /* ═══════ RENDER ═══════ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">

      {/* ═══════ HERO IMAGE ═══════ */}
      <section className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[65vh] xl:h-[70vh] max-h-[700px] overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[400px] xl:w-[500px] h-[250px] sm:h-[300px] xl:h-[350px] bg-purple-600 rounded-full"
            style={{ filter: 'blur(120px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute top-1/3 right-1/4 w-[250px] sm:w-[350px] xl:w-[400px] h-[200px] sm:h-[250px] xl:h-[300px] bg-violet-600 rounded-full"
            style={{ filter: 'blur(100px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="absolute bottom-1/4 left-1/4 w-[220px] sm:w-[300px] xl:w-[350px] h-[180px] sm:h-[220px] xl:h-[250px] bg-fuchsia-500 rounded-full"
            style={{ filter: 'blur(110px)' }}
          />
        </div>

        <motion.img
          src={djHeroImage}
          alt="DJ за пультом"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: [1, 1.01, 1] }}
          transition={{
            opacity: { duration: 1.2, ease: 'easeOut' },
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          }}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ mixBlendMode: 'lighten' }}
        />

        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`neon-${i}`}
            className={`absolute rounded-full ${i % 3 === 0 ? 'bg-purple-400' : i % 3 === 1 ? 'bg-violet-400' : 'bg-fuchsia-400'}`}
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${10 + i * 10}%`,
              bottom: `${20 + (i % 3) * 15}%`,
            }}
            animate={{ y: [0, -35 - i * 4, 0], opacity: [0, 0.8, 0], scale: [0.5, 1.4, 0.5] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
          />
        ))}

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-6 right-6 sm:top-10 sm:right-10 w-16 h-16 sm:w-24 sm:h-24 opacity-[0.05]"
        >
          <Disc3 className="w-full h-full text-white" />
        </motion.div>

        <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-52 bg-gradient-to-t from-gray-900 via-black/90 to-transparent" />

        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 px-3 sm:px-5 lg:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-purple-500/20 mb-4">
              <Disc3 className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-sm font-bold text-white/90">DJ Marketplace & Букинг-платформа</span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl xl:text-6xl font-black leading-tight max-w-3xl">
              <span className="block text-white/90">Букинги, миксы,</span>
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                заработок
              </motion.span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ═══════ CTA + QUICK BENEFITS ═══════ */}
      <section className="relative py-8 sm:py-10 px-3 sm:px-5 lg:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-5 leading-relaxed">
              Клиенты находят вас в каталоге, бронируют напрямую - без агентов и посредников.
              85% гонорара ваши. Портфолио, аналитика и финансы в одном кабинете.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-bold text-base shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2">
                Создать DJ-профиль <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-xl font-bold text-base border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                <Play className="w-4 h-4" /> Смотреть демо
              </motion.button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
              {['85% гонорара', 'Бесплатный старт', 'Вывод от 500 ₽', 'Без карты'].map((t, i) => (
                <span key={i} className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-purple-400" />{t}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ HORIZONTAL BOOKING TIMELINE (уникальный) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl sm:text-2xl font-black text-center mb-6">
          Путь к первому <span className="text-purple-400">букингу</span>
        </motion.h2>

        {/* Desktop: horizontal line with dots */}
        <div className="hidden sm:block relative">
          <div className="absolute top-6 left-[10%] right-[10%] h-px bg-gradient-to-r from-purple-500/40 via-violet-500/30 to-purple-500/40" />
          <div className="flex justify-between px-[5%]">
            {timelineSteps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="flex flex-col items-center text-center w-[18%]"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-2 shadow-lg shadow-purple-500/20 relative z-10">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white">{s.label}</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">{s.sub}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical */}
        <div className="sm:hidden space-y-3">
          {timelineSteps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">{s.label}</span>
                  <span className="text-xs text-gray-500 ml-2">{s.sub}</span>
                </div>
                {i < timelineSteps.length - 1 && <ArrowRight className="w-3 h-3 text-purple-500/40 ml-auto" />}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════ COMPARISON TABLE (уникальная секция) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-black mb-1">
            Без платформы <span className="text-gray-500">vs</span> <span className="text-purple-400">С PROMO.FM</span>
          </h2>
          <p className="text-xs text-gray-500">Почему 120+ DJ уже перешли к нам</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr,1fr,1fr] text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
            <div className="px-3 py-2.5 lg:px-4" />
            <div className="px-3 py-2.5 lg:px-4 text-center text-gray-600">Без платформы</div>
            <div className="px-3 py-2.5 lg:px-4 text-center text-purple-400">PROMO.FM</div>
          </div>
          {/* Rows */}
          {comparisonRows.map((row, i) => (
            <div key={i} className={`grid grid-cols-[1fr,1fr,1fr] text-[10px] lg:text-xs items-center ${i % 2 === 0 ? 'bg-white/[0.01]' : ''} ${i < comparisonRows.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="px-3 py-2 lg:px-4 lg:py-3 font-bold text-white/80">{row.feature}</div>
              <div className="px-3 py-2 lg:px-4 lg:py-3 text-center text-gray-600 flex items-center justify-center gap-1">
                <X className="w-3 h-3 text-red-500/50 hidden sm:block" />
                <span className="line-clamp-2">{row.without}</span>
              </div>
              <div className="px-3 py-2 lg:px-4 lg:py-3 text-center text-purple-300 flex items-center justify-center gap-1">
                <Check className="w-3 h-3 text-green-400 flex-shrink-0 hidden sm:block" />
                <span className="line-clamp-2">{row.with}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ═══════ CORE FEATURES — ZIGZAG LAYOUT (уникальный) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl sm:text-2xl font-black text-center mb-6">
          Что внутри <span className="text-purple-400">DJ-кабинета</span>
        </motion.h2>

        <div className="space-y-3 lg:space-y-4">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * idx }}
                className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/20 transition-all overflow-hidden"
              >
                <div className={`flex flex-col sm:flex-row ${!isEven ? 'sm:flex-row-reverse' : ''} items-stretch`}>
                  {/* Icon block */}
                  <div className={`flex items-center justify-center p-4 sm:p-5 sm:w-[140px] lg:w-[160px] bg-gradient-to-br ${accentColor(feat.accent)} flex-shrink-0`}>
                    <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-3 sm:p-4 lg:p-5">
                    <h3 className="text-sm lg:text-base font-black text-white mb-2">{feat.title}</h3>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      {feat.points.map((p, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[10px] lg:text-xs text-gray-300">
                          <CheckCircle2 className={`w-3 h-3 flex-shrink-0 mt-0.5 ${accentText(feat.accent)}`} />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════ EXTRA TOOLS — COMPACT PILLS (уникальный) ═══════ */}
      <section className="py-4 sm:py-6 px-3 sm:px-5 lg:px-6">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xs text-gray-500 text-center mb-3">И ещё 8 инструментов:</motion.p>
        <div className="flex flex-wrap justify-center gap-2">
          {extraTools.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.04 * i }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] lg:text-xs font-medium text-gray-300 hover:border-purple-500/30 hover:text-purple-300 transition-all cursor-default"
              >
                <Icon className="w-3 h-3 text-purple-400" />
                {t.label}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════ EARNINGS CALCULATOR (уникальный интерактив) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-purple-500/20">
          <h3 className="text-base lg:text-lg font-black text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            Калькулятор заработка
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {/* Gigs slider */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Букингов в месяц</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setGigsPerMonth(Math.max(1, gigsPerMonth - 1))} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-2xl font-black text-purple-400 w-8 text-center">{gigsPerMonth}</span>
                <button onClick={() => setGigsPerMonth(Math.min(20, gigsPerMonth + 1))} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Price slider */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Средний чек (₽)</label>
              <input
                type="range"
                min={5000}
                max={100000}
                step={5000}
                value={avgPrice}
                onChange={e => setAvgPrice(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>5K</span>
                <span className="text-sm font-bold text-white">{(avgPrice / 1000).toFixed(0)}K ₽</span>
                <span>100K</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-2 lg:gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-[10px] text-gray-500 mb-0.5">Валовый</div>
              <div className="text-sm lg:text-base font-black text-white">{(calcGross / 1000).toFixed(0)}K ₽</div>
            </div>
            <div className="bg-red-500/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-[10px] text-gray-500 mb-0.5">Комиссия 15%</div>
              <div className="text-sm lg:text-base font-black text-red-400">−{(calcCommission / 1000).toFixed(0)}K ₽</div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/20">
              <div className="text-[10px] text-gray-500 mb-0.5">Ваш доход</div>
              <div className="text-sm lg:text-base font-black text-purple-400">{(calcNet / 1000).toFixed(0)}K ₽</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════ MARKETPLACE PREVIEW (уникальная секция) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-black mb-1">
            Ваш профиль в <span className="text-purple-400">DJ Каталоге</span>
          </h2>
          <p className="text-xs text-gray-500">Так клиенты видят диджеев на платформе</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {marketplacePreview.map((dj, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <Disc3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white truncate">{dj.name}</span>
                  <CheckCircle2 className="w-3 h-3 text-purple-400 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-500">
                  <span>{dj.city}</span>
                  <span>•</span>
                  <span>{dj.genre}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-0.5 text-[10px]">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-white">{dj.rating}</span>
                </div>
                <div className="text-[9px] font-bold text-purple-400">от {dj.price}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="px-5 py-2 bg-white/5 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-300 hover:bg-purple-500/10 transition-all inline-flex items-center gap-1.5">
            Открыть DJ Каталог <ArrowRight className="w-3 h-3" />
          </motion.button>
        </div>
      </section>

      {/* ═══════ COMPACT PRICING (горизонтальный, не карточки) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl sm:text-2xl font-black text-center mb-5">
          Тарифы для <span className="text-purple-400">DJ</span>
        </motion.h2>

        <div className="space-y-2 lg:space-y-3">
          {/* Starter */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/[0.03] rounded-xl p-3 lg:p-4 border border-white/10">
            <div className="flex items-center gap-3 sm:w-[160px] lg:w-[200px] flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"><Disc3 className="w-4 h-4 text-white" /></div>
              <div>
                <div className="text-sm font-black text-white">Starter</div>
                <div className="text-xs text-gray-500">Бесплатно</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 flex-1 text-[10px] lg:text-xs text-gray-400">
              {['Профиль в каталоге', '5 миксов', '5 букингов/мес', 'Базовая аналитика'].map((f, i) => (
                <span key={i} className="flex items-center gap-1"><Zap className="w-2.5 h-2.5 text-gray-600" />{f}</span>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
              className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-all flex-shrink-0">
              Начать
            </motion.button>
          </motion.div>

          {/* Pro */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-purple-500/[0.08] rounded-xl p-3 lg:p-4 border border-purple-500/30 relative">
            <span className="absolute -top-2 right-3 px-2 py-0.5 bg-purple-500 text-white text-[8px] font-black rounded-full uppercase">Популярный</span>
            <div className="flex items-center gap-3 sm:w-[160px] lg:w-[200px] flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center"><Award className="w-4 h-4 text-white" /></div>
              <div>
                <div className="text-sm font-black text-white">Pro</div>
                <div className="text-xs text-purple-400 font-bold">1,990 ₽/мес</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 flex-1 text-[10px] lg:text-xs text-gray-300">
              {['Безлимит миксов', 'Безлимит букингов', 'Дин. цены', 'Promo.air', 'Приоритет', 'Рефералы'].map((f, i) => (
                <span key={i} className="flex items-center gap-1"><Zap className="w-2.5 h-2.5 text-purple-400" />{f}</span>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg text-xs font-bold shadow shadow-purple-500/20 flex-shrink-0">
              Выбрать
            </motion.button>
          </motion.div>

          {/* Agency */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/[0.03] rounded-xl p-3 lg:p-4 border border-white/10">
            <div className="flex items-center gap-3 sm:w-[160px] lg:w-[200px] flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
              <div>
                <div className="text-sm font-black text-white">Agency</div>
                <div className="text-xs text-gray-500">9,990 ₽/мес</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 flex-1 text-[10px] lg:text-xs text-gray-400">
              {['До 20 DJ', 'Единый дашборд', 'Авто-распределение', 'API', 'Менеджер'].map((f, i) => (
                <span key={i} className="flex items-center gap-1"><Zap className="w-2.5 h-2.5 text-gray-600" />{f}</span>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
              className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-all flex-shrink-0">
              Связаться
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS (уникальная секция — у артиста нет) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl sm:text-2xl font-black text-center mb-5">
          Что говорят <span className="text-purple-400">DJ</span>
        </motion.h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { name: 'DJ Pulse', city: 'Москва', text: 'Удобно принимать букинги в кабинете. Средний чек вырос благодаря динамическим ценам.', bookings: 7, rating: 4.9 },
            { name: 'DJ Stella', city: 'СПб', text: 'Клиенты сами бронируют через профиль - экономлю кучу времени на переписках.', bookings: 12, rating: 5.0 },
            { name: 'DJ Nexus', city: 'Казань', text: '3 букинга за первый месяц. Реферальная программа - приятный бонус.', bookings: 3, rating: 4.7 },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 * i }}
              className="bg-white/[0.04] rounded-xl p-3 lg:p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Disc3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  <span className="text-[9px] text-gray-600 ml-1.5">{t.city}</span>
                </div>
              </div>
              <p className="text-[10px] lg:text-xs text-gray-400 italic mb-2 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 text-[9px] text-gray-500">
                <span className="font-bold text-white">{t.bookings} букингов</span>
                <span className="flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />{t.rating}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6 pb-12 sm:pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-500/15 to-violet-500/15 backdrop-blur-sm rounded-xl lg:rounded-2xl p-5 lg:p-8 border border-purple-500/20 text-center relative overflow-hidden">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-10 -right-10 w-40 h-40 opacity-5">
            <Disc3 className="w-full h-full" />
          </motion.div>
          <Headphones className="w-10 h-10 mx-auto mb-3 text-purple-400" />
          <h3 className="text-xl sm:text-2xl font-black mb-2">Начни зарабатывать на том, что любишь</h3>
          <p className="text-xs lg:text-sm text-gray-400 mb-5 max-w-md mx-auto">
            Создай профиль, загрузи миксы и получи первый букинг. Бесплатно.
          </p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-bold text-base shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2">
            <Disc3 className="w-5 h-5" /> Создать DJ-профиль
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}