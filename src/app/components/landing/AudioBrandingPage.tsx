/**
 * АУДИОБРЕНДИНГ ДЛЯ БИЗНЕСА — SEO-лендинг
 *
 * Title: Аудиобрендинг для бизнеса — заказать звуковую идентичность бренда | Promo.Air
 * Description: Заказать аудиобрендинг для компании: фирменные джинглы, аудиологотип,
 * звуковой стиль бренда, брендовые музыкальные темы. Профессиональная студия Promo.Air.
 *
 * SEO: аудиобрендинг, аудиобрендинг для компаний, заказать аудиобрендинг,
 * фирменный звук бренда, аудиологотип, создание джинглов, звуковая идентичность,
 * музыкальная идентичность бренда, саунд-дизайн
 */

import { motion } from 'motion/react';
import {
  Volume2, Music, Mic2, Radio, Disc3, Headphones,
  ArrowRight, CheckCircle2, Star, Sparkles, Target,
  TrendingUp, Award, Zap, Users, Building2, Heart,
  Clock, Shield, Globe, Megaphone, Play
} from 'lucide-react';

interface AudioBrandingPageProps {
  onGetStarted: () => void;
}

export function AudioBrandingPage({ onGetStarted }: AudioBrandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">

      {/* ═══════════════════════════ */}
      {/* H1 — HERO */}
      {/* ═══════════════════════════ */}
      <section className="relative overflow-hidden py-12 xs:py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF577F] rounded-full blur-[150px] opacity-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px] opacity-10" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-6">
              <Volume2 className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-semibold">Студия аудиобрендинга</span>
            </motion.div>

            <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
              Аудиобрендинг для бизнеса
            </h1>
            <p className="text-base xs:text-lg sm:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Создаём фирменный звук бренда: джинглы, аудиологотип, звуковую идентичность и брендовые музыкальные темы. Профессиональная студия и продакшн полного цикла.
            </p>

            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#FF577F] to-purple-500 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-[#FF577F]/30 transition-all flex items-center justify-center gap-3">
                Заказать аудиобрендинг
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-base sm:text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <Play className="w-5 h-5" /> Примеры работ
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ЧТО ТАКОЕ АУДИОБРЕНДИНГ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF577F]/15 via-purple-500/10 to-[#FF577F]/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-[#FF577F]/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-lg shrink-0">
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Что такое аудиобрендинг</h2>
            </div>
          </motion.div>

          <div className="space-y-5 text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl">
            <p>
              Аудиобрендинг — это создание звуковой идентичности компании. Так же, как визуальный брендинг формирует узнаваемый стиль через логотип и цвета, аудиобрендинг создаёт <span className="text-[#FF577F] font-semibold">уникальное звучание</span>, которое клиенты ассоциируют с вашим брендом.
            </p>
            <p>
              Музыкальная идентичность бренда включает джинглы, аудиологотип, звуковое оформление пространств, рекламные ролики и брендовые музыкальные темы. Всё это формирует целостный фирменный звук бренда.
            </p>
            <p>
              Исследования показывают, что звуковые элементы бренда увеличивают узнаваемость на <span className="text-white font-semibold">96%</span> и повышают эмоциональную вовлечённость аудитории в 2,5 раза по сравнению с визуальной рекламой.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — УСЛУГИ АУДИОБРЕНДИНГА */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/15 via-indigo-500/10 to-purple-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-purple-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Услуги аудиобрендинга для компаний</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Disc3, title: 'Создание джинглов', desc: 'Фирменные звуковые заставки, которые запоминаются с первого прослушивания. Заказать джингл можно от идеи до готовой записи — мы ведём проект полного цикла.', h3: true },
              { icon: Volume2, title: 'Аудиологотип бренда', desc: 'Короткий звуковой символ компании — узнаваемость за 3 секунды. Аудиологотип — это «визитка» бренда в звуке, как Intel Inside или McDonald\'s.', h3: true },
              { icon: Music, title: 'Брендовые музыкальные темы', desc: 'Оригинальные композиции, отражающие характер и ценности бренда. Музыкальное продюсирование от аранжировки до мастеринга.', h3: true },
              { icon: Megaphone, title: 'Саунд-дизайн пространства', desc: 'Комплексное звуковое оформление физических и цифровых пространств: офисов, магазинов, приложений, сайтов.', h3: true },
              { icon: Mic2, title: 'Голосовое оформление', desc: 'Подбор голоса бренда, запись IVR, голосовых помощников, навигации, приветствий. Профессиональные дикторы.', h3: true },
              { icon: Radio, title: 'Звуковая стратегия', desc: 'Разработка целостной стратегии звуковой идентичности: от аудита текущего звучания до внедрения во все каналы коммуникации.', h3: true },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                  className="group bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-white/10 hover:border-[#FF577F]/30 transition-all">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FF577F]/20 to-purple-500/20 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF577F]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ЗАЧЕМ БИЗНЕСУ АУДИОБРЕНДИНГ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/15 via-orange-500/10 to-amber-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-amber-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Зачем бизнесу аудиобрендинг</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Heart, title: 'Эмоциональная связь', desc: 'Звук вызывает эмоции быстрее визуала. Фирменный звук бренда создаёт глубокую связь с аудиторией на подсознательном уровне.', color: 'from-pink-500 to-rose-500' },
              { icon: Award, title: 'Узнаваемость +96%', desc: 'Бренды с аудиоидентичностью узнаются в 96% случаев. Аудиологотип работает даже без визуального контакта — в радио, подкастах, навигации.', color: 'from-amber-500 to-yellow-500' },
              { icon: Target, title: 'Дифференциация', desc: 'В России менее 5% компаний используют аудиобрендинг. Это уникальная возможность выделиться среди конкурентов.', color: 'from-cyan-500 to-blue-500' },
              { icon: Users, title: 'Лояльность клиентов', desc: 'Знакомые звуки вызывают доверие. Постоянное звуковое оформление формирует привычку и лояльность к бренду.', color: 'from-green-500 to-emerald-500' },
              { icon: Megaphone, title: 'Мультиканальность', desc: 'Один фирменный звук работает везде: радио, ТВ, соцсети, приложения, точки продаж, мероприятия, подкасты.', color: 'from-purple-500 to-violet-500' },
              { icon: TrendingUp, title: 'Рост конверсий', desc: 'Аудиореклама с фирменным звучанием показывает на 24% более высокую конверсию по сравнению с безликим звуковым фоном.', color: 'from-indigo-500 to-blue-500' },
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
      {/* H2 — КОМУ ПОДХОДИТ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/15 via-purple-500/10 to-violet-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-violet-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Кому подходит аудиобрендинг</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              { title: 'Ритейл и торговые сети', desc: 'Звуковое оформление магазинов, торговых центров и бутиков. Единый фирменный звук для всех точек сети.' },
              { title: 'HoReCa', desc: 'Рестораны, кафе, отели, бары — аудиобрендинг формирует атмосферу пространства и усиливает впечатления гостей.' },
              { title: 'IT и финтех', desc: 'Звуковое оформление приложений, нотификаций, IVR. Технологические бренды всё чаще создают свой саунд.' },
              { title: 'Корпорации и бренды', desc: 'Полный цикл аудиобрендинга для компаний: от звуковой стратегии до внедрения во все каналы коммуникации.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <CheckCircle2 className="w-6 h-6 text-[#FF577F] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold mb-1.5">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — КАК МЫ РАБОТАЕМ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/15 via-teal-500/10 to-emerald-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-emerald-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shrink-0">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Как мы работаем</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { step: '01', title: 'Бриф и аудит', desc: 'Изучаем ваш бренд, целевую аудиторию и конкурентов. Анализируем текущее звучание.' },
              { step: '02', title: 'Звуковая стратегия', desc: 'Разрабатываем концепцию звуковой идентичности: тональность, инструменты, настроение.' },
              { step: '03', title: 'Продакшн', desc: 'Создаём все элементы в профессиональной студии: джинглы, аудиологотип, темы.' },
              { step: '04', title: 'Внедрение', desc: 'Интегрируем звуковую идентичность во все каналы: радио, приложения, точки продаж.' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="absolute -top-3 -left-3 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center font-black text-sm shadow-lg">{s.step}</div>
                <div className="ml-6 mt-1">
                  <h3 className="text-sm sm:text-base font-black mb-1 sm:mb-2">{s.title}</h3>
                  <p className="text-[11px] sm:text-sm text-gray-400">{s.desc}</p>
                </div>
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF577F] via-purple-500 to-[#FF577F]" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            <div className="relative p-8 sm:p-12 text-center">
              <Volume2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-white" />
              <h2 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4 text-white">Создадим звук вашего бренда</h2>
              <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Заказать аудиобрендинг — от звуковой стратегии до готовых элементов. Профессиональная студия, опыт 50+ проектов.
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-[#FF577F] rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3">
                Обсудить проект <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
