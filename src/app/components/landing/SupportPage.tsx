/**
 * SUPPORT PAGE - Страница поддержки
 * Помощь, FAQ, контакты поддержки
 */

import { motion } from 'motion/react';
import { MessageSquare, Mail, Phone, Clock, Search, HelpCircle, Book, Video, Zap, CheckCircle2, Send, Music, Radio, Store } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';

interface SupportPageProps {
  onGetStarted: () => void;
}

export function SupportPage({ onGetStarted }: SupportPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      icon: Music,
      title: 'Для артистов',
      questions: [
        {
          q: 'Как загрузить свой трек?',
          a: 'Войдите в кабинет артиста, перейдите в раздел "Мои треки" и нажмите "Загрузить трек". Поддерживаются форматы MP3, WAV, FLAC.'
        },
        {
          q: 'Сколько стоит тест трека?',
          a: 'Тест трека стоит от 490 до 1 990 ₽ в зависимости от выбранного пакета. Базовый тест включает 100 респондентов.'
        },
        {
          q: 'Как долго длится тестирование?',
          a: 'Стандартное тестирование занимает 3-5 рабочих дней. Экспресс-тест доступен за 24 часа на расширенных тарифах.'
        },
        {
          q: 'Можно ли получить возврат средств?',
          a: 'Да, мы возвращаем 100% средств в течение 7 дней, если вы не удовлетворены результатом тестирования.'
        }
      ]
    },
    {
      icon: Radio,
      title: 'Для радиостанций',
      questions: [
        {
          q: 'Платформа действительно бесплатна?',
          a: 'Да! Все функции для радиостанций абсолютно бесплатны навсегда. Нет скрытых платежей или комиссий.'
        },
        {
          q: 'Как интегрировать с нашей системой?',
          a: 'Мы предоставляем REST API и WebSocket для интеграции. Документация доступна в разделе "API для разработчиков".'
        },
        {
          q: 'Какие форматы треков поддерживаются?',
          a: 'Мы принимаем MP3 (320kbps), WAV (44.1kHz), FLAC. Все треки автоматически конвертируются в нужный формат.'
        }
      ]
    },
    {
      icon: Store,
      title: 'Для заведений',
      questions: [
        {
          q: 'Как подключить ПРОМО.ЭИР?',
          a: 'Оставьте заявку, наш менеджер свяжется с вами в течение 24 часов для настройки и подключения.'
        },
        {
          q: 'Можно ли отключить внешнюю рекламу?',
          a: 'Да! В музыке для заведений нет внешней рекламы. Только ваш контент и музыка.'
        },
        {
          q: 'Сколько плейлистов можно создать?',
          a: 'На тарифах Сеть и Enterprise - неограниченное количество. На тарифе Старт - до 5 плейлистов.'
        }
      ]
    }
  ];

  const supportChannels = [
    {
      icon: MessageSquare,
      title: 'Чат поддержки',
      description: 'Онлайн-чат с оператором',
      availability: '24/7',
      color: 'from-blue-500 to-cyan-500',
      action: 'Открыть чат'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'support@promo.music',  // email остаётся латиницей
      availability: 'Ответ в течение 4 часов',
      color: 'from-purple-500 to-pink-500',
      action: 'Написать письмо'
    },
    {
      icon: Phone,
      title: 'Телефон',
      description: '+7 (800) 550-23-45',
      availability: 'Пн-Пт 9:00-18:00 МСК',
      color: 'from-green-500 to-emerald-500',
      action: 'Позвонить'
    }
  ];

  const resources = [
    {
      icon: Book,
      title: 'База знаний',
      description: 'Полная документация и гайды',
      count: '150+ статей'
    },
    {
      icon: Video,
      title: 'Видеоуроки',
      description: 'Пошаговые инструкции',
      count: '25+ видео'
    },
    {
      icon: Zap,
      title: 'Быстрый старт',
      description: 'Начните за 5 минут',
      count: '3 шага'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white pb-12 sm:pb-16 md:pb-20">
      
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
              <HelpCircle className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-bold">Центр поддержки</span>
            </div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-6 leading-[1.1]">
              Как мы можем <span className="bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] bg-clip-text text-transparent">помочь?</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Найдите ответы на вопросы или свяжитесь с нашей командой поддержки
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по базе знаний..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-14 text-base focus:outline-none focus:border-[#FF577F]/50 transition-all"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* SUPPORT CHANNELS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Свяжитесь с нами
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Выберите удобный способ связи
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {supportChannels.map((channel, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${channel.color} flex items-center justify-center mb-4`}>
                <channel.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{channel.title}</h3>
              <p className="text-sm text-slate-300 mb-1">{channel.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[#FF577F]" />
                <span className="text-xs text-slate-400">{channel.availability}</span>
              </div>
              <Button className="w-full bg-white/10 hover:bg-white/20">
                {channel.action}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Часто задаваемые вопросы
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Ответы на самые популярные вопросы
          </p>
        </motion.div>

        <div className="space-y-8">
          {faqCategories.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * catIdx }}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#FF577F]">{category.title}</span>
              </h3>
              <div className="space-y-4">
                {category.questions.map((item, qIdx) => (
                  <div
                    key={qIdx}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-[#FF577F]/30 transition-all"
                  >
                    <h4 className="text-lg font-bold mb-2 flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-[#FF577F] flex-shrink-0 mt-0.5" />
                      {item.q}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed pl-7">{item.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RESOURCES */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {resources.map((resource, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-[#FF577F]/20 flex items-center justify-center mx-auto mb-4">
                <resource.icon className="w-8 h-8 text-[#FF577F]" />
              </div>
              <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
              <p className="text-sm text-slate-400 mb-3">{resource.description}</p>
              <div className="text-2xl font-black text-[#FF577F]">{resource.count}</div>
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
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Не нашли ответ?
          </h3>
          <p className="text-slate-300 mb-6">
            Напишите нам, и мы поможем решить вашу проблему
          </p>
          <Button className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full">
            <Send className="w-5 h-5 mr-2" />
            Связаться с поддержкой
          </Button>
        </motion.div>
      </div>

    </div>
  );
}