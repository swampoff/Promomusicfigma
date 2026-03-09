/**
 * РАДИОСТАНЦИИ — Каталог интернет-радиостанций PromoFM
 *
 * Title: Интернет-радиостанции — слушать онлайн бесплатно | PromoFM
 * Description: Каталог интернет-радиостанций PromoFM: слушайте онлайн бесплатно, выбирайте
 * жанр и настроение. AI-подбор станций для бизнеса, ротация для артистов.
 *
 * SEO: интернет радиостанции, слушать радио онлайн, каталог радиостанций,
 * онлайн радио бесплатно, радио по жанрам, радио для ресторана, радио для кафе,
 * ротация на радио, попасть на радио, независимые радиостанции
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Radio, Music, Headphones, Search, Filter, Play, Pause,
  Globe, Star, TrendingUp, Users, Zap, Crown, ArrowRight,
  Heart, Volume2, BarChart3, CheckCircle2, Sparkles, Clock,
  Mic2, Disc3, Activity, Target, Shield, Award, Store,
  Coffee, Hotel, Building2, ChevronDown, MapPin
} from 'lucide-react';

interface RadioStationsPageProps {
  onGetStarted: () => void;
}

export function RadioStationsPage({ onGetStarted }: RadioStationsPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState('all');

  const genres = [
    { id: 'all', label: 'Все', icon: Radio, count: 120 },
    { id: 'pop', label: 'Поп', icon: Music, count: 24 },
    { id: 'rock', label: 'Рок', icon: Disc3, count: 18 },
    { id: 'electronic', label: 'Электроника', icon: Zap, count: 22 },
    { id: 'hiphop', label: 'Хип-хоп', icon: Mic2, count: 16 },
    { id: 'jazz', label: 'Джаз & Блюз', icon: Headphones, count: 12 },
    { id: 'lounge', label: 'Lounge', icon: Coffee, count: 14 },
    { id: 'classical', label: 'Классика', icon: Award, count: 8 },
    { id: 'indie', label: 'Инди', icon: Heart, count: 6 },
  ];

  const featuredStations = [
    { name: 'PromoFM Hits', genre: 'Поп', listeners: 2841, mood: 'Энергичное', isLive: true, color: 'from-pink-500 to-rose-500' },
    { name: 'PromoFM Lounge', genre: 'Lounge', listeners: 1456, mood: 'Спокойное', isLive: true, color: 'from-blue-500 to-cyan-500' },
    { name: 'PromoFM Electronic', genre: 'Электроника', listeners: 987, mood: 'Драйвовое', isLive: true, color: 'from-purple-500 to-violet-500' },
    { name: 'PromoFM Jazz', genre: 'Джаз', listeners: 634, mood: 'Расслабляющее', isLive: true, color: 'from-amber-500 to-orange-500' },
    { name: 'PromoFM Hip-Hop', genre: 'Хип-хоп', listeners: 1123, mood: 'Уличное', isLive: true, color: 'from-emerald-500 to-teal-500' },
    { name: 'PromoFM Indie', genre: 'Инди', listeners: 412, mood: 'Атмосферное', isLive: false, color: 'from-indigo-500 to-blue-500' },
  ];

  const advantages = [
    { icon: Sparkles, title: 'AI-подбор станций', desc: 'Алгоритм анализирует жанр, темп, настроение и подбирает идеальное радио для вашей задачи' },
    { icon: Shield, title: 'Лицензионная музыка', desc: 'Все станции транслируют легальный контент — безопасно для бизнеса, без штрафов от РАО' },
    { icon: BarChart3, title: 'Аналитика в реальном времени', desc: 'Количество слушателей, география аудитории, пиковые часы — всё в вашем кабинете' },
    { icon: Target, title: 'Музыка под бизнес', desc: 'Специальные станции для ресторанов, кафе, отелей, магазинов — с учётом целевой аудитории' },
    { icon: Mic2, title: 'Ротация для артистов', desc: 'Отправьте трек на модерацию — и попадите в ротацию радиостанций с реальной аудиторией' },
    { icon: Clock, title: '24/7 без перерывов', desc: 'Радио работает круглосуточно. AI-диджей управляет эфиром, подбирает треки по времени суток' },
  ];

  const forWhom = [
    { icon: Headphones, title: 'Слушатели', desc: 'Бесплатное онлайн-радио по жанрам и настроению. Открывайте новую музыку каждый день.', accent: 'text-blue-400' },
    { icon: Store, title: 'Рестораны и кафе', desc: 'Фоновая музыка, создающая атмосферу. Легально, без штрафов, с расписанием по часам.', accent: 'text-emerald-400' },
    { icon: Hotel, title: 'Отели и лобби', desc: 'Ненавязчивое радио для общих зон. Lounge, jazz, ambient — под стиль вашего заведения.', accent: 'text-amber-400' },
    { icon: Building2, title: 'Торговые центры', desc: 'Энергичное радио для торгового зала. Рекламные вставки вашего бренда между треками.', accent: 'text-purple-400' },
    { icon: Music, title: 'Музыканты', desc: 'Отправьте трек в ротацию, получите реальных слушателей и аналитику по прослушиваниям.', accent: 'text-pink-400' },
    { icon: Mic2, title: 'Лейблы и дистрибьюторы', desc: 'Промо-кампании на радиостанциях. Таргетированная ротация по жанру и аудитории.', accent: 'text-cyan-400' },
  ];

  const steps = [
    { num: '01', title: 'Выберите станцию', desc: 'Используйте фильтры по жанру, настроению или AI-рекомендацию. Слушайте превью в один клик.' },
    { num: '02', title: 'Подключите к бизнесу', desc: 'Привяжите станцию к заведению. Настройте расписание: утром lounge, вечером энергичнее.' },
    { num: '03', title: 'Запустите ротацию', desc: 'Артисты загружают треки через кабинет. После модерации — трек попадает в эфир станции.' },
    { num: '04', title: 'Отслеживайте аналитику', desc: 'Смотрите статистику: слушатели, география, пиковое время, обратная связь аудитории.' },
  ];

  const comparison = [
    { feature: 'Бесплатное прослушивание', us: true, yandex: true, radio101: true, spotify: false },
    { feature: 'Легально для бизнеса', us: true, yandex: false, radio101: false, spotify: false },
    { feature: 'AI-подбор под заведение', us: true, yandex: false, radio101: false, spotify: false },
    { feature: 'Ротация для артистов', us: true, yandex: false, radio101: false, spotify: false },
    { feature: 'Аналитика для бизнеса', us: true, yandex: false, radio101: false, spotify: false },
    { feature: 'Расписание по часам', us: true, yandex: false, radio101: false, spotify: false },
    { feature: 'Рекламные вставки бренда', us: true, yandex: false, radio101: false, spotify: false },
    { feature: 'Без рекламы для слушателей', us: true, yandex: false, radio101: true, spotify: false },
  ];

  const faqs = [
    {
      q: 'Можно ли слушать радиостанции бесплатно?',
      a: 'Да, все радиостанции PromoFM доступны бесплатно для личного прослушивания. Платные тарифы нужны только для бизнес-использования (рестораны, кафе, магазины), где требуется лицензия на публичное воспроизведение.',
    },
    {
      q: 'Как попасть в ротацию радиостанции?',
      a: 'Зарегистрируйтесь как артист, загрузите трек через личный кабинет. После модерации (1-3 дня) трек попадёт в ротацию станций подходящего жанра. Вы получите аналитику: сколько раз прозвучал трек, в какое время, какая аудитория.',
    },
    {
      q: 'Чем PromoFM отличается от Яндекс.Радио или 101.ru?',
      a: 'PromoFM — это не только плеер, а полноценная платформа. Для бизнеса: легальное использование, расписание, рекламные слоты. Для артистов: реальная ротация с аналитикой. Для слушателей: AI-подбор без навязчивой рекламы.',
    },
    {
      q: 'Безопасно ли использовать PromoFM в ресторане или кафе?',
      a: 'Полностью безопасно. Все треки в каталоге лицензированы для публичного воспроизведения. Вы получаете документы, подтверждающие право на использование музыки. Штрафы от РАО/ВОИС вам не грозят.',
    },
    {
      q: 'Сколько стоит радио для бизнеса?',
      a: 'Бесплатно для личного использования. Для бизнеса — от 4 990 ₽/месяц (тариф «Старт» с 1 зоной). Бизнес-тариф включает лицензию, расписание, аналитику и поддержку.',
    },
    {
      q: 'Можно ли создать свою радиостанцию на PromoFM?',
      a: 'Да! В разделе Promo.Air вы можете создать корпоративную радиостанцию для бизнеса: выбрать жанры, настроить расписание, добавить джинглы и рекламные вставки вашего бренда.',
    },
  ];

  const stats = [
    { icon: Radio, value: '120+', label: 'радиостанций', color: 'text-blue-400' },
    { icon: Music, value: '50 000+', label: 'треков в каталоге', color: 'text-pink-400' },
    { icon: Users, value: '15 000+', label: 'слушателей в день', color: 'text-emerald-400' },
    { icon: Globe, value: '24/7', label: 'онлайн-вещание', color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">

      {/* ═══════════════════════════════════════════════ */}
      {/* H1 — HERO */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-12 xs:py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-15" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px] opacity-10" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-6">
              <div className="relative">
                <Radio className="w-4 h-4 text-blue-400" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-sm font-semibold">120+ станций в эфире прямо сейчас</span>
            </motion.div>

            <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
              <span className="text-white">Интернет-радиостанции</span>
              <span className="block text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-400 mt-2">
                слушайте онлайн бесплатно — по жанру, настроению и для бизнеса
              </span>
            </h1>

            <p className="text-sm xs:text-base sm:text-lg text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Каталог интернет-радиостанций PromoFM: от попа до джаза, от лёгкого lounge до энергичной электроники. AI-подбор станций для ресторанов и кафе. Ротация для артистов с аналитикой прослушиваний.
            </p>

            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="group w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-3">
                Слушать радио
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-base sm:text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <Store className="w-5 h-5" /> Радио для бизнеса
              </motion.button>
            </div>
          </motion.div>

          {/* Live Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                <div className="text-xl sm:text-2xl font-black">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* H2 — Каталог станций по жанрам */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black tracking-tight">Каталог радиостанций по жанрам — выберите своё звучание</h2>
                <p className="text-xs sm:text-sm text-gray-500">Более 120 станций в 9 жанровых категориях</p>
              </div>
            </div>

            {/* Genre Filter */}
            <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
              {genres.map((g) => (
                <button key={g.id} onClick={() => setActiveGenre(g.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeGenre === g.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}>
                  <g.icon className="w-3.5 h-3.5" />
                  {g.label}
                  <span className={`text-[10px] ${activeGenre === g.id ? 'text-white/70' : 'text-gray-600'}`}>
                    {g.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Featured Stations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {featuredStations.map((station) => (
                <motion.div key={station.name} whileHover={{ y: -4 }}
                  className="group relative p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${station.color} flex items-center justify-center shadow-lg`}>
                      <Radio className="w-6 h-6 text-white" />
                    </div>
                    {station.isLive && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-green-400">LIVE</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-black mb-1">{station.name}</h3>
                  <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {station.genre}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {station.mood}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Users className="w-3 h-3" /> {station.listeners.toLocaleString()} слушателей
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all">
                      <Play className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-6 sm:mt-8">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="px-6 py-3 bg-white/5 rounded-2xl font-bold text-sm border border-white/10 hover:bg-white/10 transition-all inline-flex items-center gap-2">
                Все 120+ станций <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* H2 — Преимущества радиостанций PromoFM */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black tracking-tight">Почему слушают радио на PromoFM — преимущества платформы</h2>
                <p className="text-xs sm:text-sm text-gray-500">AI-подбор, легальная музыка, аналитика и ротация для артистов</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {advantages.map((adv) => (
                <div key={adv.title} className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10">
                  <adv.icon className="w-8 h-8 text-emerald-400 mb-3" />
                  <h3 className="text-sm sm:text-base font-black mb-2">{adv.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{adv.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* H2 — Для кого: слушатели, бизнес, артисты */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black tracking-tight">Кому подходят радиостанции PromoFM</h2>
                <p className="text-xs sm:text-sm text-gray-500">Слушатели, бизнес, музыканты и лейблы</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {forWhom.map((item) => (
                <div key={item.title} className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <item.icon className={`w-8 h-8 ${item.accent} mb-3`} />
                  <h3 className="text-sm sm:text-base font-black mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* H2 — Как подключиться — 4 шага */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black tracking-tight">Как начать слушать радио или подключить его к бизнесу</h2>
                <p className="text-xs sm:text-sm text-gray-500">4 простых шага от выбора до аналитики</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {steps.map((step) => (
                <div key={step.num} className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-3xl sm:text-4xl font-black text-white/10 mb-3">{step.num}</div>
                  <h3 className="text-sm sm:text-base font-black mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* H2 — Сравнение с конкурентами */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black tracking-tight">PromoFM vs Яндекс.Радио, 101.ru и Spotify — сравнение</h2>
                <p className="text-xs sm:text-sm text-gray-500">Почему бизнесу и артистам выгоднее PromoFM</p>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-xs sm:text-sm font-bold text-gray-400">Возможность</th>
                    <th className="text-center py-3 px-3 text-xs sm:text-sm font-black text-blue-400">PromoFM</th>
                    <th className="text-center py-3 px-3 text-xs sm:text-sm font-bold text-gray-500">Яндекс</th>
                    <th className="text-center py-3 px-3 text-xs sm:text-sm font-bold text-gray-500">101.ru</th>
                    <th className="text-center py-3 px-3 text-xs sm:text-sm font-bold text-gray-500">Spotify</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.feature} className="border-b border-white/5">
                      <td className="py-3 px-3 text-xs sm:text-sm text-gray-300">{row.feature}</td>
                      <td className="text-center py-3 px-3">
                        {row.us
                          ? <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                          : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="text-center py-3 px-3">
                        {row.yandex
                          ? <CheckCircle2 className="w-5 h-5 text-gray-500 mx-auto" />
                          : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="text-center py-3 px-3">
                        {row.radio101
                          ? <CheckCircle2 className="w-5 h-5 text-gray-500 mx-auto" />
                          : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="text-center py-3 px-3">
                        {row.spotify
                          ? <CheckCircle2 className="w-5 h-5 text-gray-500 mx-auto" />
                          : <span className="text-gray-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* H2 — FAQ */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black tracking-tight">Частые вопросы о радиостанциях PromoFM</h2>
                <p className="text-xs sm:text-sm text-gray-500">Ответы на популярные вопросы</p>
              </div>
            </div>

            <div className="max-w-3xl space-y-2 sm:space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left">
                    <span className="text-xs sm:text-sm font-bold pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === i && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="px-4 sm:px-5 pb-4 sm:pb-5">
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* CTA */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
              <Radio className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4 text-white">Включите своё радио</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-xl mx-auto">
              Слушайте бесплатно, подключите к бизнесу или отправьте свой трек в ротацию — всё на одной платформе.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-3">
                Открыть каталог станций <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
