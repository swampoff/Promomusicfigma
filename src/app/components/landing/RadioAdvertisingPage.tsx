/**
 * СОЗДАНИЕ РАДИОРЕКЛАМЫ — SEO-лендинг
 *
 * Title: Создание радиорекламы — заказать рекламный ролик для радио | Promo.Air
 * Description: Создание радиорекламы полного цикла: сценарий, озвучка, продакшн и
 * размещение в эфире. Производство рекламных роликов для радио и бизнеса.
 *
 * SEO: создание радиорекламы, радиореклама, заказать радиорекламу,
 * сделать радиорекламу, рекламный ролик для радио, производство рекламных роликов,
 * аудиореклама, реклама на радио
 */

import { motion } from 'motion/react';
import {
  Megaphone, Radio, Mic2, Music, Volume2, ArrowRight,
  CheckCircle2, Star, Sparkles, Target, TrendingUp,
  BarChart3, Users, Building2, Zap, Clock, Play,
  Award, Globe, Shield, Headphones, Disc3
} from 'lucide-react';

interface RadioAdvertisingPageProps {
  onGetStarted: () => void;
}

export function RadioAdvertisingPage({ onGetStarted }: RadioAdvertisingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">

      {/* ═══════════════════════════ */}
      {/* H1 — HERO */}
      {/* ═══════════════════════════ */}
      <section className="relative overflow-hidden py-12 xs:py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-[150px] opacity-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[150px] opacity-10" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-6">
              <Megaphone className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold">Студия производства радиорекламы</span>
            </motion.div>

            <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
              Создание радиорекламы
            </h1>
            <p className="text-base xs:text-lg sm:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Производство рекламных роликов для радио полного цикла: от сценария до размещения в эфире. Профессиональная озвучка, сведение и аналитика охвата.
            </p>

            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-3">
                Заказать радиорекламу
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-base sm:text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <Play className="w-5 h-5" /> Примеры роликов
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ЧТО МЫ ДЕЛАЕМ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/15 via-blue-500/10 to-cyan-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-cyan-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shrink-0">
                <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Что такое создание радиорекламы</h2>
            </div>
          </motion.div>

          <div className="space-y-5 text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl">
            <p>
              Радиореклама — один из самых эффективных каналов для локального бизнеса. Аудиореклама достигает аудитории в моменты, когда визуальная реклама недоступна: за рулём, в зале ожидания, в магазине, на кухне.
            </p>
            <p>
              Promo.Air предлагает создание радиорекламы полного цикла: от написания сценария и подбора голоса до профессиональной записи, сведения и размещения рекламного ролика в эфире платформы.
            </p>
            <p>
              Сделать радиорекламу можно как для размещения на радиостанциях, так и для внутреннего эфира вашего заведения через платформу Promo.Air.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ФОРМАТЫ РАДИОРЕКЛАМЫ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/15 via-indigo-500/10 to-purple-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-purple-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shrink-0">
                <Mic2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Форматы рекламных роликов для радио</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Megaphone, title: 'Рекламный аудиоролик', desc: 'Классический формат 15–30 секунд: сценарий, голос диктора, музыкальная подложка, звуковые эффекты. Идеально для акций и предложений.', h3: true },
              { icon: Mic2, title: 'Имиджевый ролик', desc: 'Продолжительный формат 30–60 секунд: история бренда, эмоциональный нарратив, фирменная музыка. Для формирования имиджа компании.', h3: true },
              { icon: Disc3, title: 'Музыкальный джингл', desc: 'Запоминающаяся мелодия с текстом — песенный формат рекламы. Создание джинглов, которые люди напевают.', h3: true },
              { icon: Volume2, title: 'Голосовое объявление', desc: 'Лаконичный формат 10–15 секунд: объявление акции, события, изменения графика. Быстро и по делу.', h3: true },
              { icon: Radio, title: 'Спонсорская интеграция', desc: 'Нативная реклама в рамках эфирной программы: «Рубрика при поддержке...». Органичное размещение внутри контента.', h3: true },
              { icon: Target, title: 'Таргетированная аудиореклама', desc: 'Размещение рекламы в конкретных зонах и заведениях через платформу Promo.Air. Гео- и аудиторный таргетинг.', h3: true },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                  className="group bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-white/10 hover:border-cyan-500/30 transition-all">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
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
      {/* H2 — ПРОЦЕСС СОЗДАНИЯ */}
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
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Как мы создаём радиорекламу</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {[
              { step: '01', title: 'Бриф', desc: 'Изучаем задачу, аудиторию, конкурентов и формат размещения' },
              { step: '02', title: 'Сценарий', desc: 'Пишем текст ролика с учётом хронометража и целевого действия' },
              { step: '03', title: 'Озвучка', desc: 'Профессиональные дикторы, подбор голоса под характер бренда' },
              { step: '04', title: 'Продакшн', desc: 'Сведение, музыкальная подложка, звуковые эффекты, мастеринг' },
              { step: '05', title: 'Размещение', desc: 'Интеграция в эфир Promo.Air или передача для внешних радиостанций' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                <div className="absolute -top-3 -left-3 w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-black text-sm shadow-lg">{s.step}</div>
                <div className="ml-5 mt-1">
                  <h3 className="text-sm font-black mb-1">{s.title}</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ПРЕИМУЩЕСТВА */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/15 via-orange-500/10 to-amber-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-amber-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Почему заказать радиорекламу у нас</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Mic2, title: 'Профессиональная студия', desc: 'Собственная студия звукозаписи с акустической обработкой. Профессиональные микрофоны, мониторы и обработка.', color: 'from-cyan-500 to-blue-500' },
              { icon: Users, title: 'Пул дикторов', desc: '20+ профессиональных голосов: мужские, женские, молодые, зрелые. Подберём идеальный голос для вашего бренда.', color: 'from-purple-500 to-pink-500' },
              { icon: Target, title: 'Размещение в эфире', desc: 'Не только создание, но и размещение. Рекламный ролик для радио попадает в эфир 70+ заведений платформы Promo.Air.', color: 'from-[#FF577F] to-orange-500' },
              { icon: BarChart3, title: 'Аналитика охвата', desc: 'Сколько раз прозвучал ролик, в каких заведениях, какой охват аудитории. Данные для оптимизации рекламной кампании.', color: 'from-green-500 to-emerald-500' },
              { icon: Clock, title: 'Сроки от 3 дней', desc: 'Стандартный рекламный ролик — 3–5 рабочих дней. Срочный продакшн — от 24 часов.', color: 'from-amber-500 to-yellow-500' },
              { icon: Sparkles, title: 'Полный цикл', desc: 'От идеи до эфира в одном окне. Не нужно искать отдельно копирайтера, диктора, звукорежиссёра и площадку.', color: 'from-violet-500 to-indigo-500' },
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
      {/* CTA */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            <div className="relative p-8 sm:p-12 text-center">
              <Megaphone className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-white" />
              <h2 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4 text-white">Закажите рекламный ролик</h2>
              <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Создание радиорекламы от 3 дней. Сценарий, озвучка, продакшн и размещение в эфире 70+ заведений.
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-cyan-600 rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3">
                Обсудить проект <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
