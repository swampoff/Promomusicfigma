/**
 * CAREERS PAGE - Страница карьеры
 * Вакансии и возможности работы в команде
 */

import { motion } from 'motion/react';
import { Briefcase, MapPin, Clock, DollarSign, Users, Heart, Zap, TrendingUp, Code, Music, Palette, BarChart3, Headphones, Globe } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function CareersPage() {
  const openPositions = [
    {
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'San Francisco, CA / Remote',
      type: 'Full-time',
      salary: '$120k - $180k',
      icon: Code,
      description: 'Разработка и поддержка платформы на React, Node.js, Supabase'
    },
    {
      title: 'Music Industry Partnership Manager',
      department: 'Business Development',
      location: 'Los Angeles, CA / Hybrid',
      type: 'Full-time',
      salary: '$90k - $130k',
      icon: Music,
      description: 'Развитие партнерств с радиостанциями, лейблами и артистами'
    },
    {
      title: 'Product Designer (UI/UX)',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      salary: '$100k - $150k',
      icon: Palette,
      description: 'Создание интерфейсов для артистов, радиостанций и заведений'
    },
    {
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'San Francisco, CA / Remote',
      type: 'Full-time',
      salary: '$80k - $120k',
      icon: BarChart3,
      description: 'Анализ данных тестирования треков и создание отчетов'
    },
    {
      title: 'Content Moderator',
      department: 'Operations',
      location: 'Remote',
      type: 'Full-time',
      salary: '$45k - $65k',
      icon: Headphones,
      description: 'Модерация загружаемого контента и поддержка артистов'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'New York, NY / Hybrid',
      type: 'Full-time',
      salary: '$85k - $125k',
      icon: TrendingUp,
      description: 'Стратегия продвижения платформы и привлечения пользователей'
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'Конкурентная зарплата',
      description: 'Рыночные ставки + бонусы и опционы'
    },
    {
      icon: Heart,
      title: 'Медицинская страховка',
      description: 'Полное покрытие для вас и семьи'
    },
    {
      icon: Globe,
      title: 'Удаленная работа',
      description: 'Работайте откуда угодно или из офиса'
    },
    {
      icon: Clock,
      title: 'Гибкий график',
      description: 'Выбирайте удобное время работы'
    },
    {
      icon: TrendingUp,
      title: 'Карьерный рост',
      description: 'Быстрый рост и развитие навыков'
    },
    {
      icon: Users,
      title: 'Крутая команда',
      description: 'Профессионалы из Spotify, Apple Music'
    },
    {
      icon: Music,
      title: 'Музыкальная индустрия',
      description: 'Работа на стыке технологий и музыки'
    },
    {
      icon: Zap,
      title: 'Стартап культура',
      description: 'Быстрые решения, прямая коммуникация'
    }
  ];

  const values = [
    {
      icon: Zap,
      title: 'Инновации',
      description: 'Мы создаем то, чего еще не было в музыкальной индустрии'
    },
    {
      icon: Users,
      title: 'Команда',
      description: 'Мы ценим каждого члена команды и его вклад'
    },
    {
      icon: Heart,
      title: 'Качество',
      description: 'Мы делаем продукт, которым гордимся'
    },
    {
      icon: TrendingUp,
      title: 'Рост',
      description: 'Мы постоянно учимся и развиваемся'
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
              <Briefcase className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-bold">Мы растем и нанимаем</span>
            </div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-6 leading-[1.1]">
              Присоединяйтесь к <span className="bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] bg-clip-text text-transparent">команде</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Строим будущее музыкальной индустрии вместе
            </p>

            <div className="flex items-center justify-center gap-6 sm:gap-12 text-sm sm:text-base">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#FF577F]">50+</div>
                <div className="text-slate-400">Сотрудников</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#FF577F]">6</div>
                <div className="text-slate-400">Открытых вакансий</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#FF577F]">3</div>
                <div className="text-slate-400">Офиса</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* VALUES */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Наши ценности
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Что делает нас особенными
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#FF577F]/20 flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-7 h-7 text-[#FF577F]" />
              </div>
              <h3 className="text-lg font-bold mb-2">{value.title}</h3>
              <p className="text-sm text-slate-400">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* OPEN POSITIONS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Открытые вакансии
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Найдите свою идеальную позицию
          </p>
        </motion.div>

        <div className="space-y-6">
          {openPositions.map((position, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 flex items-center justify-center flex-shrink-0">
                    <position.icon className="w-7 h-7 text-[#FF577F]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{position.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{position.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {position.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {position.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {position.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {position.salary}
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-6 py-3 rounded-xl whitespace-nowrap">
                  Подать заявку
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BENEFITS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Почему Promo.music?
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Преимущества работы с нами
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <benefit.icon className="w-10 h-10 text-[#FF577F] mb-4" />
              <h3 className="text-base font-bold mb-2">{benefit.title}</h3>
              <p className="text-sm text-slate-400">{benefit.description}</p>
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
          <Users className="w-12 h-12 mx-auto mb-4 text-[#FF577F]" />
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Не нашли подходящую вакансию?
          </h3>
          <p className="text-slate-300 mb-6">
            Отправьте свое резюме на jobs@promo.music, и мы свяжемся с вами
          </p>
          <Button className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full">
            Отправить резюме
          </Button>
        </motion.div>
      </div>

    </div>
  );
}