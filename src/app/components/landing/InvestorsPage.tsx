/**
 * INVESTORS PAGE - Запрос инвестиционной презентации
 * Конфиденциальная информация доступна только по запросу
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, Users, Globe, Shield, Zap,
  Music, Radio, Building2, ArrowRight,
  Target, Sparkles, Layers, Rocket,
  MapPin, Store, TestTube, Crown,
  Send, CheckCircle2, Lock, Briefcase,
  Mail, User, Building, MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface InvestorsPageProps {
  onGetStarted: () => void;
}

// ── Section wrapper with animation ──
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={`px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 ${className}`}
    >
      <div className="max-w-5xl mx-auto">{children}</div>
    </motion.section>
  );
}

function GlassCard({ children, className = '', hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] ${hover ? 'hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300' : ''} ${className}`}>
      {children}
    </div>
  );
}

const ECOSYSTEM = [
  {
    name: 'Promo.music',
    desc: 'Маркетинговая платформа для артистов - продвижение, аналитика, монетизация',
    icon: Music,
    color: 'from-[#FF577F] to-[#FF3366]',
  },
  {
    name: 'Promo.air',
    desc: 'Легальная музыка для бизнеса с умным программированием эфира',
    icon: Store,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Promo.guide',
    desc: 'Путеводитель по музыке заведений для слушателей',
    icon: MapPin,
    color: 'from-violet-500 to-indigo-500',
  },
  {
    name: 'Promo.lab',
    desc: 'Профессиональная экспертиза треков перед релизом',
    icon: TestTube,
    color: 'from-purple-500 to-pink-500',
  },
];

const HIGHLIGHTS = [
  {
    icon: Globe,
    title: 'Уникальная позиция на рынке',
    desc: 'Единственная платформа, объединяющая B2C и B2B сегменты музыкальной индустрии в одну экосистему.',
  },
  {
    icon: TrendingUp,
    title: 'Растущий рынок',
    desc: 'Music Tech переживает активный рост. Уход западных сервисов открыл уникальное окно возможностей.',
  },
  {
    icon: Layers,
    title: 'Сетевые эффекты',
    desc: 'Каждый новый участник экосистемы увеличивает ценность для всех остальных.',
  },
  {
    icon: Shield,
    title: 'Высокие барьеры входа',
    desc: 'Комплексная экосистема из четырёх продуктов, которую сложно воспроизвести.',
  },
  {
    icon: Crown,
    title: 'Множественные потоки дохода',
    desc: 'Диверсифицированная модель монетизации снижает риски.',
  },
  {
    icon: Rocket,
    title: 'Масштабируемость',
    desc: 'Облачная инфраструктура и SaaS-модель обеспечивают рост без пропорционального увеличения затрат.',
  },
];

const AUDIENCE_SEGMENTS = [
  { segment: 'Артисты и продюсеры', icon: Music, desc: 'Независимые музыканты, ищущие инструменты продвижения и монетизации' },
  { segment: 'Заведения HoReCa', icon: Building2, desc: 'Кафе, рестораны, бары - нуждаются в легальном музыкальном сопровождении' },
  { segment: 'Радиостанции и медиа', icon: Radio, desc: 'FM и интернет-радиостанции, подкастеры, музыкальные блогеры' },
];

export function InvestorsPage({ onGetStarted }: InvestorsPageProps) {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSending(true);

    try {
      const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;
      const response = await fetch(`${API_URL}/api/landing-data/investor-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Investor inquiry error:', result.error);
      }
    } catch (error) {
      console.error('Error sending investor inquiry:', error);
    }

    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════ */}
      {/* HERO - Запрос презентации */}
      {/* ═══════════════════════════════════════════ */}
      <Section>
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF577F]/10 border border-[#FF577F]/20 text-[#FF577F] text-xs font-bold mb-5">
              <Lock className="w-3.5 h-3.5" />
              Конфиденциальный документ
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
              Инвестиционное предложение{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF577F] to-[#FF3366]">
                Promo.music
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-6">
              Детальная презентация с бизнес-моделью, финансовыми прогнозами и условиями
              участия доступна по запросу. Заполните форму ниже, и мы свяжемся с вами.
            </p>
          </motion.div>

          {/* Confidentiality notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs text-slate-400"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Презентация содержит конфиденциальную коммерческую информацию и предоставляется под NDA
          </motion.div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-5 mb-10">
          <GlassCard className="p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF577F] to-[#FF3366] flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Миссия</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Создать самую удобную и эффективную платформу для продвижения музыки в России и СНГ,
              где каждый артист получает доступ к профессиональным инструментам маркетинга,
              аналитики и монетизации своего творчества.
            </p>
          </GlassCard>

          <GlassCard className="p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Видение</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Стать ведущей Music Tech экосистемой на русскоязычном рынке с полным
              покрытием всех сегментов музыкальной индустрии - от создания до монетизации контента.
            </p>
          </GlassCard>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════ */}
      {/* ЭКОСИСТЕМА (публичная информация) */}
      {/* ═══════════════════════════════════════════ */}
      <Section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF577F]/[0.015] to-transparent pointer-events-none" />
        <div className="relative">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-3">
              Четыре продукта,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF577F] to-[#FF3366]">
                единая экосистема
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Каждый продукт решает конкретную задачу и усиливает остальные через сетевые эффекты
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {ECOSYSTEM.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <GlassCard className="p-5 sm:p-6 h-full group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">{p.name}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════ */}
      {/* ЦЕЛЕВАЯ АУДИТОРИЯ */}
      {/* ═══════════════════════════════════════════ */}
      <Section>
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-3">
            Целевая{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF577F] to-[#FF3366]">
              аудитория
            </span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {AUDIENCE_SEGMENTS.map((ta, i) => (
            <motion.div
              key={ta.segment}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-5 sm:p-6 h-full group text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF577F]/20 to-[#FF3366]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ta.icon className="w-5 h-5 text-[#FF577F]" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mb-2">{ta.segment}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{ta.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════ */}
      {/* ПОЧЕМУ СТОИТ ИНВЕСТИРОВАТЬ */}
      {/* ═══════════════════════════════════════════ */}
      <Section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.015] to-transparent pointer-events-none" />
        <div className="relative">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF577F]/10 border border-[#FF577F]/20 text-[#FF577F] text-xs font-bold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Преимущества
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-3">
              Почему стоит{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF577F] to-[#FF3366]">
                инвестировать
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard className="p-5 sm:p-6 h-full group">
                  <h.icon className="w-6 h-6 text-[#FF577F] mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm sm:text-base font-bold text-white mb-2">{h.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{h.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════ */}
      {/* ЧТО ВКЛЮЧАЕТ ПРЕЗЕНТАЦИЯ */}
      {/* ═══════════════════════════════════════════ */}
      <Section>
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-3">
            Что включает{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF577F] to-[#FF3366]">
              презентация
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Полная инвестиционная презентация предоставляется после рассмотрения заявки
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[
            { title: 'Рыночный анализ', desc: 'Объём рынка, динамика роста, конкурентная среда', icon: TrendingUp },
            { title: 'Бизнес-модель', desc: 'Потоки монетизации, ценообразование, unit-экономика', icon: Target },
            { title: 'Финансовые прогнозы', desc: 'Выручка, расходы, прибыльность на 5 лет', icon: Briefcase },
            { title: 'Технологический стек', desc: 'Архитектура, масштабируемость, безопасность', icon: Zap },
            { title: 'Команда', desc: 'Опыт, компетенции, план расширения', icon: Users },
            { title: 'Условия инвестирования', desc: 'Раунд, оценка, доля, использование средств', icon: Crown },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard className="p-4 sm:p-5 group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FF577F]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-4 h-4 text-[#FF577F]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════ */}
      {/* ФОРМА ЗАПРОСА */}
      {/* ═══════════════════════════════════════════ */}
      <Section className="pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF577F] to-[#FF3366] opacity-[0.06]" />
          <div className="absolute inset-0 border border-[#FF577F]/20 rounded-2xl" />

          <div className="relative p-6 sm:p-10">
            {submitted ? (
              /* ── Success State ── */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                  Запрос отправлен
                </h3>
                <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto mb-6">
                  Спасибо за интерес к Promo.music. Мы свяжемся с вами в ближайшее время
                  для обсуждения условий и предоставления презентации.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Отправить ещё один запрос
                </motion.button>
              </motion.div>
            ) : (
              /* ── Request Form ── */
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF577F]/10 border border-[#FF577F]/30 text-[#FF577F] text-xs font-bold mb-4">
                    <Rocket className="w-3.5 h-3.5" />
                    Запросить презентацию
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                    Получите доступ к{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF577F] to-[#FF3366]">
                      полной презентации
                    </span>
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Заполните форму, и мы направим вам детальное инвестиционное предложение
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Имя и фамилия <span className="text-[#FF577F]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Иван Петров"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#FF577F]/40 focus:ring-1 focus:ring-[#FF577F]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Email <span className="text-[#FF577F]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ivan@company.ru"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#FF577F]/40 focus:ring-1 focus:ring-[#FF577F]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Компания / Фонд
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Название организации"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#FF577F]/40 focus:ring-1 focus:ring-[#FF577F]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Комментарий
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Расскажите о вашем интересе к проекту..."
                        rows={3}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#FF577F]/40 focus:ring-1 focus:ring-[#FF577F]/20 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={sending || !formData.name || !formData.email}
                    whileHover={{ scale: sending ? 1 : 1.02 }}
                    whileTap={{ scale: sending ? 1 : 0.98 }}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      sending || !formData.name || !formData.email
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white shadow-lg shadow-[#FF577F]/20 hover:shadow-[#FF577F]/30'
                    }`}
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Запросить презентацию
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                  Ваши данные защищены и не будут переданы третьим лицам
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Alternative contact */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-slate-500 mb-2">
            Или свяжитесь с нами напрямую:
          </p>
          <a
            href="mailto:invest@promo.music"
            className="inline-flex items-center gap-1.5 text-sm text-[#FF577F] hover:text-[#FF3366] font-semibold transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            invest@promo.music
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </Section>
    </div>
  );
}