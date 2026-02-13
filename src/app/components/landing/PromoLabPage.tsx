/**
 * PROMO.LAB — Лаборатория оценки треков
 * 
 * Экспертная оценка + анализ потенциала трека
 * Связано с TrackSubmitModal (openTrackModal('test'))
 */

import { motion } from 'motion/react';
import {
  TestTube, Sparkles, BarChart3, CheckCircle2, Crown, ArrowRight,
  TrendingUp, Users, Zap, Star, Brain, AudioLines, Activity,
  Shield, Clock, Target, Award, Music, Play, Mic2,
  FileAudio, ChevronRight, Eye
} from 'lucide-react';

interface PromoLabPageProps {
  onGetStarted: () => void;
  onTestTrack?: () => void;
}

export function PromoLabPage({ onGetStarted, onTestTrack }: PromoLabPageProps) {

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

  const howItWorks = [
    { step: '01', icon: FileAudio, title: 'Загрузите трек', desc: 'MP3/WAV до 50 МБ. Без регистрации - только email.' },
    { step: '02', icon: Brain, title: 'Анализ трека', desc: 'Система оценивает по 10+ критериям за 2 часа.' },
    { step: '03', icon: Users, title: 'Экспертная оценка', desc: 'Панель из 3-5 экспертов индустрии даёт feedback.' },
    { step: '04', icon: BarChart3, title: 'Детальный отчёт', desc: 'PDF-отчёт с баллами, рекомендациями и планом.' },
  ];

  const plans = [
    {
      name: 'Express', icon: Zap, price: '₽990', period: '',
      color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30',
      time: '2-4 часа',
      features: ['Экспресс-анализ', '10 критериев оценки', 'Общий балл потенциала', 'PDF-отчёт на email'],
      popular: false
    },
    {
      name: 'Pro', icon: Crown, price: '₽2 990', period: '',
      color: 'from-[#FF577F]/20 to-purple-500/20', border: 'border-[#FF577F]/30',
      time: '24-48 часов',
      features: ['Полный анализ + 3 эксперта', '10 критериев + комментарии', 'Персональные рекомендации', 'План продвижения', 'Сравнение с TOP-100', 'Повторная оценка бесплатно'],
      popular: true
    },
    {
      name: 'Premium', icon: Award, price: '₽7 990', period: '',
      color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30',
      time: '48-72 часа',
      features: ['Анализ + 5 экспертов + менторство', 'Все критерии Pro +', 'Видео-разбор от эксперта', 'Стратегия релиза', 'Рекомендации по микс/мастеру', 'Прямой контакт с лейблами', '3 месяца поддержки'],
      popular: false
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* TEXT HERO + BUTTONS + DEMO CARD */}
      <section className="relative overflow-hidden py-12 xs:py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-15" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#FF577F] rounded-full blur-[150px] opacity-10" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="text-base xs:text-lg sm:text-xl text-gray-300 mb-3 max-w-3xl mx-auto">
              Узнай <span className="text-purple-400 font-semibold">реальный потенциал</span> трека до релиза
            </p>
            <p className="text-sm xs:text-base sm:text-lg text-gray-500 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Анализ по 10+ критериям + оценка экспертов музыкальной индустрии. Детальный отчёт за 2-72 часа.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onTestTrack || onGetStarted}
                className="group w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-purple-500 to-[#FF577F] rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-3">
                <TestTube className="w-5 h-5" />
                Протестировать трек
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-base sm:text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <Eye className="w-5 h-5" /> Пример отчёта
              </motion.button>
            </div>
          </motion.div>

          {/* Demo Score Card */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-10 sm:mt-16 max-w-4xl mx-auto">
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
                  <motion.div key={c.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] sm:text-xs font-medium text-slate-400">{c.name}</span>
                      <span className="text-[11px] sm:text-xs font-black font-mono text-white">{c.score}</span>
                    </div>
                    <div className="h-1.5 sm:h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.score * 10}%` }}
                        transition={{ delay: 0.7 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${c.color}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="mt-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-[#FF577F]/10 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-purple-400 mb-1">Вердикт</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                      Высокий коммерческий потенциал. Синтвейв-продакшн и запоминающийся хук делают трек идеальным для радио-ротации. 
                      Рекомендуется усилить низкие частоты в бридже и рассмотреть ремикс для клубного формата.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: TestTube, value: '1,200+', label: 'Треков проанализировано', color: 'text-purple-400' },
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

      {/* How It Works */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black mb-3 sm:mb-4">Как это работает?</h2>
            <p className="text-sm sm:text-lg text-gray-400">От загрузки до готового отчёта - всё просто</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {howItWorks.map((s, i) => (
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

      {/* Pricing */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">Выберите формат оценки</h2>
            <p className="text-sm sm:text-lg text-gray-400 max-w-2xl mx-auto">Оплата только после модерации и подтверждения заявки</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {plans.map((plan, i) => {
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

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-[#FF577F] to-purple-600" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            <div className="relative p-8 sm:p-12 text-center">
              <TestTube className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-white" />
              <h2 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4 text-white">Готов узнать потенциал?</h2>
              <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                1,200+ треков уже прошли через Promo.lab. 73% из них попали в ротацию.
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onTestTrack || onGetStarted}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-purple-600 rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3">
                <TestTube className="w-5 h-5" />
                Протестировать трек
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}