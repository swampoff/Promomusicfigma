/**
 * МУЗЫКА ДЛЯ РЕСТОРАНОВ И КАФЕ — SEO-лендинг
 *
 * Title: Музыка для ресторанов и кафе — легальное музыкальное оформление | Promo.Air
 * Description: Легальная фоновая музыка для ресторанов, кафе, баров и отелей без РАО.
 * Музыкальное оформление бизнеса с аналитикой и многозонным управлением.
 *
 * SEO: музыка для ресторанов, музыка для кафе, фоновая музыка для бизнеса,
 * легальная музыка для ресторана, музыкальное оформление ресторанов,
 * музыка для бизнеса без лицензии, радио для кафе, радио для ресторанов
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Coffee, Music, Radio, Headphones, ArrowRight, CheckCircle2,
  Star, Shield, Volume2, BarChart3, Layers, Clock, Zap,
  Users, TrendingUp, Heart, Award, Sparkles, Globe,
  Hotel, Store, Dumbbell, Monitor, Building2, Wifi, Play
} from 'lucide-react';

interface MusicForRestaurantsPageProps {
  onGetStarted: () => void;
}

export function MusicForRestaurantsPage({ onGetStarted }: MusicForRestaurantsPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">

      {/* ═══════════════════════════ */}
      {/* H1 — HERO */}
      {/* ═══════════════════════════ */}
      <section className="relative overflow-hidden py-12 xs:py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-[150px] opacity-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-[150px] opacity-10" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-6">
              <Coffee className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold">Легальная фоновая музыка для HoReCa</span>
            </motion.div>

            <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
              Музыка для ресторанов и кафе
            </h1>
            <p className="text-base xs:text-lg sm:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Легальное музыкальное оформление ресторанов, кафе, баров и отелей. Фоновая музыка для бизнеса без штрафов РАО и ВОИС — 15 000+ треков, многозонное управление, аналитика.
            </p>

            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-3">
                Попробовать 14 дней бесплатно
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-base sm:text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <Play className="w-5 h-5" /> Демо эфира
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ПРОБЛЕМА: ШТРАФЫ ЗА МУЗЫКУ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/15 via-orange-500/10 to-red-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-red-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Штрафы за нелегальную музыку — до 5 000 000 ₽</h2>
            </div>
          </motion.div>

          <div className="space-y-5 text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl mb-8">
            <p>
              Каждый ресторан, кафе или магазин, включающий музыку для гостей, обязан иметь лицензию на публичное воспроизведение. РАО и ВОИС регулярно проводят проверки, а штрафы за нелегальное использование музыки достигают <span className="text-red-400 font-semibold">5 000 000 ₽</span>.
            </p>
            <p>
              Promo.Air решает эту проблему: весь каталог состоит из независимого и лицензированного контента. Музыка для бизнеса без лицензии через РАО/ВОИС — <span className="text-green-400 font-semibold">легально и включено в подписку</span>.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Без штрафов', desc: 'Полная юридическая защита. Документы для проверяющих органов.', color: 'text-green-400' },
              { icon: CheckCircle2, title: 'Без РАО / ВОИС', desc: 'Независимый каталог — не нужны договоры с коллективными управляющими.', color: 'text-green-400' },
              { icon: Zap, title: 'Одна подписка', desc: 'Всё включено: музыка, лицензия, обновления каталога, поддержка.', color: 'text-green-400' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="text-center p-5 rounded-2xl bg-green-500/5 border border-green-500/15">
                <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-3`} />
                <h3 className="text-sm font-bold mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ВОЗМОЖНОСТИ ПЛАТФОРМЫ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-blue-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-blue-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Возможности музыкального оформления</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Layers, title: 'Многозонное управление', desc: 'Разная музыка для зала, бара, террасы и VIP — своя атмосфера в каждом пространстве ресторана.', color: 'from-blue-500 to-cyan-500' },
              { icon: Clock, title: 'Расписание по часам', desc: 'Утром — джаз, днём — lounge, вечером — deep house. Автоматическая смена настроения под время суток.', color: 'from-purple-500 to-pink-500' },
              { icon: BarChart3, title: 'Аналитика влияния музыки', desc: 'Какая музыка удерживает гостей дольше? Корреляция жанров с выручкой и средним чеком.', color: 'from-green-500 to-emerald-500' },
              { icon: Music, title: '15 000+ треков', desc: 'Курированный каталог с ежемесячными обновлениями. Все жанры: jazz, lounge, chillout, pop, классика, этно.', color: 'from-amber-500 to-orange-500' },
              { icon: Radio, title: 'Брендированный эфир', desc: 'Джинглы вашего ресторана, голосовые объявления акций, брендированное радио для кафе.', color: 'from-[#FF577F] to-purple-500' },
              { icon: Globe, title: 'Интеграция с Promo.Guide', desc: 'Ваше заведение на карте «Сейчас играет...». Привлекайте гостей, которые ищут атмосферу.', color: 'from-violet-500 to-indigo-500' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                  className="group bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 hover:border-white/20 transition-all">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-base sm:text-xl font-black mb-2 sm:mb-3">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ДЛЯ КАКОГО БИЗНЕСА */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/15 via-blue-500/10 to-purple-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-purple-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shrink-0">
                <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Фоновая музыка для любого бизнеса</h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { icon: Coffee, title: 'Рестораны', desc: 'Атмосфера для каждого блюда', img: '☕' },
              { icon: Coffee, title: 'Кафе', desc: 'Уют и комфорт для гостей', img: '🍰' },
              { icon: Hotel, title: 'Отели', desc: 'Премиальное сопровождение', img: '🏨' },
              { icon: Store, title: 'Бары', desc: 'Энергия ночной жизни', img: '🍸' },
              { icon: Dumbbell, title: 'Фитнес', desc: 'Мотивация в ритме', img: '💪' },
              { icon: Monitor, title: 'Салоны', desc: 'Расслабляющая среда', img: '💆' },
            ].map((type, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 text-center group hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-pointer">
                <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">{type.img}</div>
                <h3 className="text-xs sm:text-sm font-black mb-0.5">{type.title}</h3>
                <p className="text-[9px] sm:text-xs text-gray-500">{type.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — КАК ПОДКЛЮЧИТЬСЯ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/15 via-teal-500/10 to-emerald-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-emerald-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shrink-0">
                <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Подключение за 24 часа</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { step: '01', title: 'Заявка', desc: 'Оставьте заявку — мы свяжемся за 1 час' },
              { step: '02', title: 'Подбор музыки', desc: 'Подберём жанры и настроим плейлисты под ваш формат' },
              { step: '03', title: 'Запуск', desc: 'Работает на любом устройстве с интернетом' },
              { step: '04', title: 'Оптимизация', desc: 'Аналитика и тонкая настройка по данным' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10">
                <div className="absolute -top-3 -left-3 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-black text-sm shadow-lg">{s.step}</div>
                <div className="ml-6 mt-1">
                  <h3 className="text-sm sm:text-base font-black mb-1">{s.title}</h3>
                  <p className="text-[11px] sm:text-sm text-gray-400">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — FAQ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">Частые вопросы</h2>
          <div className="space-y-3">
            {[
              { q: 'Сколько стоит музыка для ресторана?', a: 'Подписка от 4 990 ₽/мес. Включает 5 000+ треков, лицензию и базовую аналитику. 14 дней бесплатно.' },
              { q: 'Нужно ли платить РАО за музыку в кафе?', a: 'Нет. Каталог Promo.Air состоит из независимого контента, лицензированного напрямую. РАО и ВОИС не требуются.' },
              { q: 'Какое оборудование нужно?', a: 'Любое устройство с интернетом: планшет, компьютер, медиаплеер. Специальное оборудование не требуется.' },
              { q: 'Можно ли включить разную музыку в баре и зале?', a: 'Да, многозонное управление доступно от тарифа «Бизнес». До 4 зон с отдельными плейлистами и громкостью.' },
              { q: 'Как быстро можно запустить?', a: 'За 24 часа. Мы подберём музыку, настроим зоны и подключим ваше заведение к платформе.' },
            ].map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="rounded-xl border border-white/10 overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-all">
                  <span className="text-sm sm:text-base font-bold pr-4">{faq.q}</span>
                  <span className={`text-lg transition-transform ${activeFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* CTA */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            <div className="relative p-8 sm:p-12 text-center">
              <Coffee className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-white" />
              <h2 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4 text-white">Музыка для вашего заведения</h2>
              <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                14 дней бесплатно. Легальная фоновая музыка для ресторана, кафе или бара — без штрафов и без сложностей.
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-emerald-600 rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3">
                Начать бесплатно <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
