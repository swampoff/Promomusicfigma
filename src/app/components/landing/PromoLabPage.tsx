/**
 * PROMO.LAB — Оценка трека перед релизом | Экспертный разбор и анализ
 *
 * Title: Оценка трека перед релизом — экспертный разбор и анализ музыки | Promo.Lab
 * Description: Профессиональная оценка трека онлайн: разбор по 10 критериям, фидбек от экспертов
 * индустрии, AI-анализ и детальный отчёт. Тестирование трека перед релизом за 2-72 часа.
 *
 * SEO: оценка трека, разбор трека, оценка трека онлайн, экспертная оценка трека,
 * тест трека перед релизом, фидбек на трек, тестирование трека, анализ музыки,
 * проверка трека перед релизом, оценка качества сведения, как понять готов ли трек
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  TestTube, Sparkles, BarChart3, CheckCircle2, Crown, ArrowRight,
  TrendingUp, Users, Zap, Star, Brain, AudioLines, Activity,
  Shield, Clock, Target, Award, Music, Play, Mic2,
  FileAudio, ChevronRight, Eye, MessageCircle, Lightbulb,
  Headphones, Radio, Disc3, Heart, Globe, Volume2
} from 'lucide-react';

interface PromoLabPageProps {
  onGetStarted: () => void;
  onTestTrack?: () => void;
}

export function PromoLabPage({ onGetStarted, onTestTrack }: PromoLabPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const criteria = [
    { name: 'Продюсирование', score: 8.7, color: 'from-purple-500 to-violet-500' },
    { name: 'Мелодичность', score: 9.1, color: 'from-pink-500 to-rose-500' },
    { name: 'Вокал', score: 7.9, color: 'from-blue-500 to-cyan-500' },
    { name: 'Текст', score: 8.3, color: 'from-amber-500 to-orange-500' },
    { name: 'Микс / Мастеринг', score: 8.0, color: 'from-green-500 to-emerald-500' },
    { name: 'Коммерческий потенциал', score: 8.5, color: 'from-[#FF577F] to-purple-500' },
    { name: 'Уникальность', score: 9.3, color: 'from-indigo-500 to-blue-500' },
    { name: 'Хитовость', score: 7.8, color: 'from-red-500 to-pink-500' },
    { name: 'Радио-пригодность', score: 8.1, color: 'from-teal-500 to-cyan-500' },
    { name: 'Тренд-соответствие', score: 8.9, color: 'from-violet-500 to-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">

      {/* ═══════════════════════════ */}
      {/* H1 — HERO */}
      {/* ═══════════════════════════ */}
      <section className="relative overflow-hidden py-12 xs:py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-15" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#FF577F] rounded-full blur-[150px] opacity-10" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-6">
              <TestTube className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold">Тест-драйв трека перед релизом</span>
            </motion.div>

            <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
              Оценка трека перед релизом
            </h1>
            <p className="text-base xs:text-lg sm:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Экспертный разбор трека по 10 критериям, AI-анализ и профессиональный фидбек. Узнайте реальный потенциал до релиза — детальный отчёт за 2-72 часа.
            </p>

            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onTestTrack || onGetStarted}
                className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-purple-500 to-[#FF577F] rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-3">
                <TestTube className="w-5 h-5" />
                Отправить трек на оценку
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-base sm:text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <Eye className="w-5 h-5" /> Пример отчёта
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ЧТО ТАКОЕ PROMO.LAB */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/15 via-[#FF577F]/10 to-purple-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-purple-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-[#FF577F] flex items-center justify-center shadow-lg shrink-0">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Что такое Promo.Lab — зачем нужна оценка трека</h2>
            </div>
          </motion.div>

          <div className="space-y-5 text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl">
            <p>
              Promo.Lab — первый русскоязычный сервис профессиональной <span className="text-purple-400 font-semibold">оценки трека перед релизом</span>. Мы помогаем артистам, продюсерам и битмейкерам получить честный экспертный разбор, понять сильные и слабые стороны трека и подготовиться к успешному релизу.
            </p>
            <p>
              Вместо того чтобы спрашивать друзей в VK-группах или Telegram-чатах, вы получаете <span className="text-white font-semibold">структурированную оценку трека онлайн</span> от панели экспертов индустрии — продюсеров, A&R-менеджеров, радиоведущих и музыкальных критиков.
            </p>
            <p>
              Каждый трек анализируется по 10 критериям: от качества продюсирования и мелодичности до коммерческого потенциала и радио-пригодности. Результат — детальный отчёт с баллами, рекомендациями и планом действий.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12">
            {[
              { icon: TestTube, value: '1,200+', label: 'Треков оценено', color: 'text-purple-400' },
              { icon: Users, value: '50+', label: 'Экспертов в панели', color: 'text-[#FF577F]' },
              { icon: Star, value: '4.9', label: 'Средняя оценка сервиса', color: 'text-amber-400' },
              { icon: Target, value: '73%', label: 'Попали в ротацию', color: 'text-green-400' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10 text-center group hover:bg-white/10 transition-all">
                  <Icon className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 ${s.color} group-hover:scale-110 transition-transform`} />
                  <div className="text-xl sm:text-3xl font-black mb-0.5 sm:mb-1">{s.value}</div>
                  <div className="text-[10px] sm:text-sm text-gray-400">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — КАК МЫ ОЦЕНИВАЕМ (10 КРИТЕРИЕВ + DEMO CARD) */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/15 via-blue-500/10 to-indigo-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-indigo-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Разбор трека по 10 критериям — как выглядит оценка</h2>
            </div>
          </motion.div>

          <div className="space-y-4 text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl mb-8">
            <p>
              Каждый трек проходит экспертную оценку по 10 профессиональным критериям. Это не субъективное «нравится / не нравится», а структурированный разбор, который показывает <span className="text-white font-semibold">конкретные точки роста</span> и помогает понять, готов ли трек к релизу.
            </p>
          </div>

          {/* Demo Score Card */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-4xl mx-auto">
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-[#FF577F]/30 flex items-center justify-center border border-purple-500/20">
                    <Music className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black">Blinding Lights</h3>
                    <p className="text-xs text-slate-400">The Weeknd &bull; Synthwave / Pop</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 to-[#FF577F] bg-clip-text text-transparent">8.5</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Общий балл</div>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-purple-500/50 flex items-center justify-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-[#FF577F] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {criteria.map((c, i) => (
                  <motion.div key={c.name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.05 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] sm:text-xs font-medium text-slate-400">{c.name}</span>
                      <span className="text-[11px] sm:text-xs font-black font-mono text-white">{c.score}</span>
                    </div>
                    <div className="h-1.5 sm:h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${c.score * 10}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${c.color}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }}
                className="mt-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-[#FF577F]/10 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-purple-400 mb-1">Вердикт эксперта</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                      Высокий коммерческий потенциал. Синтвейв-продакшн и запоминающийся хук делают трек идеальным для радио-ротации.
                      Рекомендуется усилить низкие частоты в бридже и рассмотреть ремикс для клубного формата.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <p className="text-center text-xs text-gray-600 mt-3">Пример оценки — реальные отчёты содержат развёрнутые комментарии по каждому критерию</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ЗАЧЕМ НУЖНА ПРОВЕРКА ТРЕКА ПЕРЕД РЕЛИЗОМ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/15 via-orange-500/10 to-amber-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-amber-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Зачем нужна проверка трека перед релизом</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Shield, title: 'Не потратить бюджет на слабый релиз', desc: 'Промо, дистрибуция, обложка — стоят денег. Оценка трека до релиза покажет, стоит ли инвестировать в продвижение или сначала доработать материал.', color: 'from-green-500 to-emerald-500' },
              { icon: Target, title: 'Понять реальный потенциал', desc: 'Друзья скажут «огонь», а слушатели пролистают. Экспертная оценка даёт объективный взгляд: готов ли трек конкурировать с рынком.', color: 'from-purple-500 to-violet-500' },
              { icon: TrendingUp, title: 'Увеличить шансы на ротацию', desc: '73% треков, прошедших через Promo.Lab, попали в ротацию на радиостанциях и плейлистах. Предрелизная подготовка — ключ к охватам.', color: 'from-[#FF577F] to-pink-500' },
              { icon: MessageCircle, title: 'Получить план доработки', desc: 'Не просто «хорошо/плохо», а конкретные рекомендации: что исправить в миксе, как усилить хук, какой формат продвижения выбрать.', color: 'from-blue-500 to-cyan-500' },
              { icon: Radio, title: 'Проверить радио-пригодность', desc: 'Подходит ли трек для радиоэфира? Хронометраж, формат, громкость, чистота микса — всё это влияет на решение программных директоров.', color: 'from-amber-500 to-yellow-500' },
              { icon: Sparkles, title: 'Выделиться среди 100 000 релизов в день', desc: 'Каждый день на стриминги выходят сотни тысяч треков. Профессиональный разбор помогает довести трек до уровня, заметного алгоритмам и кураторам.', color: 'from-indigo-500 to-blue-500' },
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
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Кому подходит тестирование трека</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              { title: 'Начинающие артисты', desc: 'Первый релиз? Получите профессиональный фидбек на трек от экспертов, а не от друзей. Поймите, где вы находитесь и что подтянуть.', icon: '🎤' },
              { title: 'Хип-хоп и рэп артисты', desc: 'Оценка текста, флоу, продакшна и коммерческого потенциала. Разбор с учётом специфики русскоязычного рэп-рынка.', icon: '🎧' },
              { title: 'Продюсеры и битмейкеры', desc: 'Отправьте инструментал на оценку: качество сведения, аранжировка, тренд-соответствие. Поймите, насколько ваш бит конкурентен.', icon: '🎹' },
              { title: 'Электронные музыканты', desc: 'EDM, house, techno, drum & bass — оценка структуры, саунд-дизайна, энергетики трека и пригодности для DJ-сетов.', icon: '🔊' },
              { title: 'Поп-исполнители', desc: 'Хитовость мелодии, качество вокала, радио-формат — всё, что определяет судьбу поп-трека на стримингах и в эфире.', icon: '🌟' },
              { title: 'Инди и рок-группы', desc: 'Оценка звучания, аранжировки, баланса инструментов. Рекомендации по миксу и мастерингу для рок-формата.', icon: '🎸' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <span className="text-2xl sm:text-3xl flex-shrink-0">{item.icon}</span>
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
      {/* H2 — КАК ЭТО РАБОТАЕТ */}
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
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Как получить оценку трека — 4 простых шага</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { step: '01', icon: FileAudio, title: 'Загрузите трек', desc: 'MP3 или WAV до 50 МБ. Укажите жанр и что хотите узнать. Регистрация не нужна — только email.' },
              { step: '02', icon: Brain, title: 'AI + экспертный анализ', desc: 'Система анализирует трек по 10 критериям. Параллельно трек слушает панель из 3-5 экспертов индустрии.' },
              { step: '03', icon: BarChart3, title: 'Детальный отчёт', desc: 'PDF-отчёт с баллами по каждому критерию, развёрнутыми комментариями и конкретными рекомендациями.' },
              { step: '04', icon: Sparkles, title: 'План действий', desc: 'Что доработать, как продвигать, куда отправлять — пошаговая стратегия для вашего трека.' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="absolute -top-3 -left-3 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-[#FF577F] flex items-center justify-center font-black text-sm shadow-lg">{s.step}</div>
                <s.icon className="w-8 h-8 text-purple-400 mb-3 ml-6" />
                <h3 className="text-sm sm:text-base font-black mb-1 sm:mb-2">{s.title}</h3>
                <p className="text-[11px] sm:text-sm text-gray-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ПОЧЕМУ PROMO.LAB, А НЕ... */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF577F]/15 via-pink-500/10 to-[#FF577F]/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-[#FF577F]/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-lg shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Почему Promo.Lab, а не VK-группы и SubmitHub</h2>
            </div>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-bold text-gray-400"></th>
                  <th className="text-center py-3 px-4 font-black text-purple-400">Promo.Lab</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-500">VK / Telegram</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-500">SubmitHub / Groover</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-500">Фрилансеры</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'На русском языке', lab: true, vk: true, submit: false, freelance: true },
                  { feature: 'Профессиональные эксперты', lab: true, vk: false, submit: '~', freelance: '~' },
                  { feature: '10 критериев оценки', lab: true, vk: false, submit: false, freelance: false },
                  { feature: 'AI-анализ трека', lab: true, vk: false, submit: false, freelance: false },
                  { feature: 'Гарантия сроков', lab: true, vk: false, submit: true, freelance: false },
                  { feature: 'План продвижения', lab: true, vk: false, submit: false, freelance: '~' },
                  { feature: 'Оплата из России', lab: true, vk: true, submit: false, freelance: true },
                  { feature: 'Цена от', lab: '₽990', vk: 'Бесплатно', submit: '~$2', freelance: '₽1500+' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-3 px-4 font-medium text-white">{row.feature}</td>
                    {[row.lab, row.vk, row.submit, row.freelance].map((val, j) => (
                      <td key={j} className="text-center py-3 px-4">
                        {val === true ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" /> :
                         val === false ? <span className="text-red-400/60">—</span> :
                         val === '~' ? <span className="text-yellow-400/60">~</span> :
                         <span className={j === 0 ? 'font-black text-purple-400' : 'text-gray-500'}>{val}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — ТАРИФЫ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/15 via-blue-500/10 to-cyan-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-cyan-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shrink-0">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Сколько стоит оценка трека — тарифы</h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                name: 'Express', icon: Zap, price: '₽990', period: '',
                color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30',
                time: '2-4 часа',
                features: ['Экспресс-анализ за 2-4 часа', '10 критериев оценки', 'Общий балл потенциала', 'PDF-отчёт на email'],
                popular: false
              },
              {
                name: 'Pro', icon: Crown, price: '₽2 990', period: '',
                color: 'from-[#FF577F]/20 to-purple-500/20', border: 'border-[#FF577F]/30',
                time: '24-48 часов',
                features: ['Полный разбор + 3 эксперта', '10 критериев + комментарии', 'Персональные рекомендации', 'План продвижения трека', 'Сравнение с TOP-100 жанра', 'Повторная оценка бесплатно'],
                popular: true
              },
              {
                name: 'Premium', icon: Award, price: '₽7 990', period: '',
                color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30',
                time: '48-72 часа',
                features: ['Анализ + 5 экспертов + менторство', 'Все возможности Pro +', 'Видео-разбор от эксперта', 'Стратегия релиза', 'Рекомендации по сведению и мастерингу', 'Прямой контакт с лейблами', '3 месяца поддержки'],
                popular: false
              },
            ].map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 bg-gradient-to-r from-purple-500 to-[#FF577F] rounded-full text-[10px] sm:text-xs font-bold z-10 shadow-lg">Рекомендуем</div>
                  )}
                  <div className={`h-full bg-gradient-to-br ${plan.color} backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 border ${plan.border} hover:scale-[1.02] transition-all`}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] sm:text-xs font-mono text-slate-400">{plan.time}</span>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black mb-1 sm:mb-2">{plan.name}</h3>
                    <div className="mb-4 sm:mb-6">
                      <span className="text-2xl sm:text-4xl font-black">{plan.price}</span>
                      <span className="text-sm text-gray-400 ml-1">за трек</span>
                    </div>
                    <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-[11px] sm:text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 text-green-400" />
                          <span className="text-gray-300">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={onTestTrack || onGetStarted} className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
                      plan.popular ? 'bg-gradient-to-r from-purple-500 to-[#FF577F] hover:shadow-lg hover:shadow-purple-500/30' : 'bg-white/10 hover:bg-white/20'
                    }`}>
                      Отправить трек
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ */}
      {/* H2 — FAQ */}
      {/* ═══════════════════════════ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/15 via-emerald-500/10 to-teal-600/15" />
            <div className="relative px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 border border-teal-500/15 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shrink-0">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight">Частые вопросы об оценке треков</h2>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: 'Как понять, готов ли трек к релизу?', a: 'Отправьте трек на оценку в Promo.Lab — вы получите объективный разбор по 10 критериям. Если общий балл выше 7.0 и нет критических замечаний по миксу, трек можно выпускать. Эксперты также укажут, что стоит доработать перед релизом.' },
              { q: 'Кто оценивает мой трек?', a: 'Панель из 3-5 экспертов музыкальной индустрии: действующие продюсеры, A&R-менеджеры лейблов, программные директора радиостанций, музыкальные журналисты. Все эксперты подобраны под жанр вашего трека.' },
              { q: 'Можно ли отправить инструментал или бит?', a: 'Да, мы оцениваем инструментальные треки и биты. Критерии адаптируются: вместо оценки вокала и текста анализируем глубже структуру, саунд-дизайн и аранжировку.' },
              { q: 'Чем это отличается от SubmitHub?', a: 'SubmitHub — это отправка кураторам плейлистов ради размещения. Promo.Lab — это детальный разбор трека с конкретными рекомендациями по доработке. Мы не размещаем — мы помогаем понять и улучшить трек до релиза.' },
              { q: 'Что если трек получит низкий балл?', a: 'Низкий балл — это не приговор, а дорожная карта. Вы получите конкретные рекомендации: что исправить в миксе, как улучшить аранжировку, над чем поработать. На тарифе Pro повторная оценка бесплатна.' },
              { q: 'Как быстро я получу результат?', a: 'Express — 2-4 часа, Pro — 24-48 часов, Premium — 48-72 часа. Сроки гарантированы. Если оценка задерживается — следующая бесплатно.' },
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-[#FF577F] to-purple-600" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            <div className="relative p-8 sm:p-12 text-center">
              <TestTube className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-white" />
              <h2 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4 text-white">Узнайте потенциал вашего трека</h2>
              <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Профессиональная оценка трека онлайн от ₽990. Экспертный разбор по 10 критериям, AI-анализ и план действий. Результат за 2 часа.
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onTestTrack || onGetStarted}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-purple-600 rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3">
                <TestTube className="w-5 h-5" />
                Отправить трек на оценку
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
