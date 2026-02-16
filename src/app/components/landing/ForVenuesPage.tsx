/**
 * FOR VENUES PAGE - Промо-страница для заведений
 * Преимущества ПРОМО.ЭИР, калькулятор ROI, шаги подключения
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Music, Radio, BarChart3, Shield, Zap, ArrowRight, Globe,
  Volume2, Wifi, Users, TrendingUp, CheckCircle2, Star,
  MapPin, Coins, Headphones, Calendar, Crown,
  Building2, Sparkles, Settings, Play, Check, X,
  Store, Activity, MessageSquare, Minus, Plus,
} from 'lucide-react';

interface ForVenuesPageProps {
  onGetStarted: () => void;
}

const VENUE_TYPES = [
  { icon: Store, label: 'Рестораны', desc: 'Музыка под атмосферу заведения' },
  { icon: Building2, label: 'Бары и клубы', desc: 'Энергичные плейлисты для вечеринок' },
  { icon: Headphones, label: 'Кофейни', desc: 'Уютный фон для работы и отдыха' },
  { icon: Globe, label: 'Отели', desc: 'Премиальный саунд для лобби и спа' },
  { icon: Users, label: 'Фитнес-клубы', desc: 'Мотивирующие треки для тренировок' },
  { icon: MapPin, label: 'Торговые центры', desc: 'Фоновая музыка для шоппинга' },
];

const FEATURES = [
  { icon: Music, title: 'Легальная музыка', desc: 'Полностью лицензированный каталог. Забудьте о штрафах за нелегальное использование.', gradient: 'from-pink-500 to-rose-500' },
  { icon: Radio, title: 'Умное радио', desc: 'ПРОМО.ЭИР автоматически подбирает музыку под время дня, день недели и тип заведения.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: BarChart3, title: 'Аналитика', desc: 'Узнайте, какая музыка нравится вашим гостям. Данные о предпочтениях и поведении.', gradient: 'from-violet-500 to-purple-500' },
  { icon: Coins, title: 'Монетизация', desc: 'Зарабатывайте на рекламных слотах в эфире и спонсированных треках.', gradient: 'from-emerald-500 to-green-500' },
  { icon: Settings, title: 'Полный контроль', desc: 'Управляйте плейлистами, расписанием и настройками из единой панели.', gradient: 'from-amber-500 to-orange-500' },
  { icon: Shield, title: 'Без рисков', desc: 'Все авторские отчисления включены. Полная юридическая защита.', gradient: 'from-red-500 to-pink-500' },
];

const COMPARISON = [
  { feature: 'Легальность музыки', without: 'Риск штрафов', with: 'Полная лицензия', advantage: true },
  { feature: 'Подбор музыки', without: 'Вручную или случайно', with: 'Умные алгоритмы', advantage: true },
  { feature: 'Аналитика гостей', without: 'Отсутствует', with: 'Детальная статистика', advantage: true },
  { feature: 'Монетизация эфира', without: 'Невозможна', with: 'Рекламные слоты', advantage: true },
  { feature: 'Управление', without: 'Разрозненные источники', with: 'Единая панель', advantage: true },
  { feature: 'Стоимость', without: 'Скрытые расходы', with: 'Прозрачная подписка', advantage: true },
];

const STEPS = [
  { num: '01', title: 'Регистрация', desc: 'Создайте аккаунт заведения за 2 минуты', icon: Users },
  { num: '02', title: 'Настройка', desc: 'Выберите стиль, жанры и расписание музыки', icon: Settings },
  { num: '03', title: 'Подключение', desc: 'Установите плеер - работает на любом устройстве', icon: Wifi },
  { num: '04', title: 'Запуск', desc: 'Музыка играет, гости довольны, вы зарабатываете', icon: Play },
];

export function ForVenuesPage({ onGetStarted }: ForVenuesPageProps) {
  const [venuesPerMonth, setVenuesPerMonth] = useState(1);
  const [avgCheck, setAvgCheck] = useState(2000);

  const monthlyRevenue = venuesPerMonth * 8 * 30 * 150; // ad slots
  const guestLift = Math.round(avgCheck * 0.12);

  return (
    <div className="relative">
      {/* ── Hero Section ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-6">
              <Store className="w-3.5 h-3.5" />
              Для заведений
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
              Музыка, которая{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">зарабатывает</span>
              {' '}для вас
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-8">
              ПРОМО.ЭИР - легальная музыкальная платформа для бизнеса. Умные плейлисты, аналитика предпочтений гостей и монетизация эфира.
            </p>
            <div className="flex flex-col xs:flex-row items-center justify-center gap-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20">
                <Zap className="w-4 h-4" />
                Подключить ПРОМО.ЭИР
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <span className="text-xs text-slate-600">14 дней бесплатно</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Venue Types ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-xl sm:text-2xl font-black text-white text-center mb-8">
            Для любого формата заведения
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {VENUE_TYPES.map((v, i) => (
              <motion.div key={v.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-4 hover:bg-white/[0.06] hover:border-cyan-500/20 transition-all">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <v.icon className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-0.5">{v.label}</h3>
                <p className="text-[10px] text-slate-500">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Почему ПРОМО.ЭИР?</h2>
            <p className="text-sm text-slate-400">Всё для музыкального сопровождения вашего бизнеса</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="group rounded-xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 hover:bg-white/[0.04] hover:border-white/10 transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Без Promo.air vs с Promo.air</h2>
          </motion.div>
          <div className="bg-white/[0.02] rounded-xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-3 bg-white/[0.03] p-3 text-[10px] sm:text-xs font-bold text-slate-500">
              <span>Возможность</span>
              <span className="text-center">Без платформы</span>
              <span className="text-center text-cyan-400">С Promo.air</span>
            </div>
            {COMPARISON.map((row, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="grid grid-cols-3 p-3 border-t border-white/5 text-xs">
                <span className="text-slate-300 font-medium">{row.feature}</span>
                <span className="text-center text-red-400/70 flex items-center justify-center gap-1">
                  <X className="w-3 h-3" /> {row.without}
                </span>
                <span className="text-center text-green-400 flex items-center justify-center gap-1">
                  <Check className="w-3 h-3" /> {row.with}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Подключение за 4 шага</h2>
          </motion.div>
          <div className="flex flex-col sm:flex-row gap-4">
            {STEPS.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex-1 relative">
                <div className="bg-white/[0.03] rounded-xl border border-white/10 p-5 text-center h-full">
                  <div className="text-2xl font-black text-cyan-500/20 mb-2">{step.num}</div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-[10px] text-slate-500">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-2 w-4 text-white/10">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI Calculator ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Калькулятор выгоды</h2>
            <p className="text-sm text-slate-400">Оцените потенциальный доход от Promo.air</p>
          </motion.div>
          <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 sm:p-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-slate-500 font-bold mb-2 block">Количество точек</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setVenuesPerMonth(Math.max(1, venuesPerMonth - 1))}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-lg font-black text-white w-8 text-center">{venuesPerMonth}</span>
                  <button onClick={() => setVenuesPerMonth(Math.min(50, venuesPerMonth + 1))}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold mb-2 block">Средний чек, ₽</label>
                <input
                  type="number"
                  value={avgCheck}
                  onChange={e => setAvgCheck(Math.max(500, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cyan-500/10 rounded-xl p-4 text-center border border-cyan-500/20">
                <div className="text-[10px] text-cyan-400/80 mb-1">Доход от рекламы</div>
                <div className="text-xl font-black text-cyan-400">{monthlyRevenue.toLocaleString('ru-RU')} ₽</div>
                <div className="text-[9px] text-slate-500">в месяц</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
                <div className="text-[10px] text-green-400/80 mb-1">Рост среднего чека</div>
                <div className="text-xl font-black text-green-400">+{guestLift.toLocaleString('ru-RU')} ₽</div>
                <div className="text-[9px] text-slate-500">на гостя</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-10" />
            <div className="absolute inset-0 border border-cyan-500/20 rounded-2xl" />
            <div className="relative p-8 sm:p-10 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-white mb-3">
                Начните с бесплатного периода
              </h2>
              <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                14 дней бесплатно. Без обязательств. Полный функционал Promo.air для вашего заведения.
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow">
                <Store className="w-4 h-4" />
                Подключить заведение
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}