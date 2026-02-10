/**
 * PARTNERS PAGE - Партнерская программа
 * Условия сотрудничества и преимущества для партнеров
 */

import { motion } from 'motion/react';
import { Handshake, DollarSign, TrendingUp, Users, Award, Gift, Zap, BarChart3, Target, Sparkles, CheckCircle2, Radio, Music, Building2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function PartnersPage() {
  const partnerTypes = [
    {
      icon: Radio,
      title: 'Радиостанции',
      description: 'Доступ к новым артистам',
      earnings: 'Бесплатный доступ + приоритет',
      benefits: [
        'Бесплатное использование всех функций',
        'Приоритет в размещении треков',
        'Доступ к базе 10,000+ артистов',
        'Персональный менеджер'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Music,
      title: 'Музыкальные лейблы',
      description: 'Поиск талантов и промо',
      earnings: '15% с каждой покупки',
      benefits: [
        'Доступ к аналитике всех артистов',
        'Ранний доступ к новым трекам',
        'Специальные условия для артистов',
        'Брендированная страница лейбла'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Building2,
      title: 'Заведения',
      description: 'Качественная музыка для бизнеса',
      earnings: '20% с рефералов',
      benefits: [
        'Скидка 20% на все тарифы',
        'Бесплатная настройка и обучение',
        'Приоритетная техподдержка',
        'Реферальная программа'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Инфлюенсеры',
      description: 'Продвигайте и зарабатывайте',
      earnings: 'До 30% комиссии',
      benefits: [
        '30% с каждого приведенного клиента',
        'Персональный реферальный код',
        'Эксклюзивные промо материалы',
        'Еженедельные выплаты'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'Высокие комиссии',
      value: 'До 30%',
      description: 'За каждого приведенного клиента'
    },
    {
      icon: TrendingUp,
      title: 'Пассивный доход',
      value: 'Пожизненный',
      description: 'Получайте % пока клиент с нами'
    },
    {
      icon: Target,
      title: 'Легкая конверсия',
      value: '12%',
      description: 'Средняя конверсия в платящих'
    },
    {
      icon: BarChart3,
      title: 'Прозрачная аналитика',
      value: 'Real-time',
      description: 'Отслеживайте все показатели'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Регистрация',
      description: 'Заполните форму партнерской программы',
      icon: Users
    },
    {
      number: '2',
      title: 'Получите ссылку',
      description: 'Уникальный реферальный код и материалы',
      icon: Gift
    },
    {
      number: '3',
      title: 'Продвигайте',
      description: 'Делитесь с аудиторией любым способом',
      icon: Sparkles
    },
    {
      number: '4',
      title: 'Зарабатывайте',
      description: 'Получайте комиссию каждую неделю',
      icon: DollarSign
    }
  ];

  const stats = [
    { label: 'Активных партнеров', value: '500+' },
    { label: 'Выплачено партнерам', value: '$2M+' },
    { label: 'Средний доход/мес', value: '$1,200' },
    { label: 'Лучший результат', value: '$15K' }
  ];

  const testimonials = [
    {
      name: 'Александр Петров',
      role: 'Музыкальный блогер',
      avatar: '🎵',
      text: 'За 6 месяцев заработал $18,000! Promo.music - отличный продукт, который легко продавать.',
      earnings: '$18K'
    },
    {
      name: 'Radio Mix FM',
      role: 'Радиостанция',
      avatar: '📻',
      text: 'Получаем лучшие треки раньше всех и бесплатно. Артисты довольны, мы довольны!',
      earnings: 'Бесплатно'
    },
    {
      name: 'Sound Label',
      role: 'Инди-лейбл',
      avatar: '🎼',
      text: 'Нашли 3 талантливых артистов через платформу. Теперь наши постоянные партнеры.',
      earnings: '$8K/мес'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-12 sm:pb-16 md:pb-20">
      
      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden border-b border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF577F]/10 via-transparent to-[#3E4C5E]/10" />
        
        <div className="relative max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-[#FF577F]/20">
              <Handshake className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-bold">Партнерская программа</span>
            </div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-6 leading-[1.1]">
              Зарабатывайте <span className="bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] bg-clip-text text-transparent">вместе с нами</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Получайте до 30% комиссии за каждого приведенного клиента пожизненно
            </p>

            <Button className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full text-base sm:text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Стать партнером
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
            >
              <div className="text-3xl sm:text-4xl font-black text-[#FF577F] mb-2">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PARTNER TYPES */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Типы партнерства
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Выберите подходящую программу для вас
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {partnerTypes.map((type, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-[#FF577F]/30 transition-all"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                <type.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">{type.title}</h3>
              <p className="text-sm text-slate-400 mb-2">{type.description}</p>
              <div className="inline-block px-3 py-1 bg-[#FF577F]/20 rounded-full text-sm font-bold text-[#FF577F] mb-4">
                {type.earnings}
              </div>
              <ul className="space-y-2">
                {type.benefits.map((benefit, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#FF577F] flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BENEFITS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#FF577F]/20 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-7 h-7 text-[#FF577F]" />
              </div>
              <h3 className="text-lg font-bold mb-1">{benefit.title}</h3>
              <div className="text-3xl font-black text-[#FF577F] mb-2">{benefit.value}</div>
              <p className="text-xs text-slate-400">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Как это работает?
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            4 простых шага до первого дохода
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * idx }}
              className="relative"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF577F] to-[#FF6B8F] flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                  {step.number}
                </div>
                <step.icon className="w-8 h-8 text-[#FF577F] mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[#FF577F] to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Истории успеха
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Реальные результаты наших партнеров
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4 italic">"{testimonial.text}"</p>
              <div className="inline-block px-3 py-1 bg-[#FF577F]/20 rounded-full text-sm font-bold text-[#FF577F]">
                Заработок: {testimonial.earnings}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 rounded-2xl p-8 border border-[#FF577F]/30 text-center"
        >
          <Award className="w-12 h-12 mx-auto mb-4 text-[#FF577F]" />
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Готовы начать зарабатывать?
          </h3>
          <p className="text-slate-300 mb-6">
            Присоединяйтесь к 500+ успешным партнерам уже сегодня
          </p>
          <Button className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full">
            <Handshake className="w-5 h-5 mr-2" />
            Подать заявку на партнерство
          </Button>
        </motion.div>
      </div>

    </div>
  );
}