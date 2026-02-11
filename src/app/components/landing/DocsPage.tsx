/**
 * DOCS PAGE - Страница документации
 * Техническая документация для разработчиков
 */

import { motion } from 'motion/react';
import { Book, Code, Zap, Shield, Globe, Database, Terminal, FileCode, Layers, Box, Key, Lock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function DocsPage() {
  const sections = [
    {
      icon: Zap,
      title: 'Быстрый старт',
      description: 'Начните интеграцию за 5 минут',
      topics: ['Регистрация', 'Получение API ключа', 'Первый запрос', 'Примеры кода'],
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Полная документация API endpoints',
      topics: ['Authentication', 'Tracks API', 'Radio Stations API', 'Analytics API'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Database,
      title: 'Схема данных',
      description: 'Структура базы данных и модели',
      topics: ['Треки', 'Пользователи', 'Радиостанции', 'Аналитика'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Безопасность',
      description: 'Аутентификация и авторизация',
      topics: ['OAuth 2.0', 'JWT токены', 'Rate Limiting', 'CORS политика'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Terminal,
      title: 'SDK и библиотеки',
      description: 'Официальные SDK для разных языков',
      topics: ['JavaScript/TypeScript', 'Python', 'PHP', 'Ruby'],
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Globe,
      title: 'Webhooks',
      description: 'Получайте уведомления о событиях',
      topics: ['Настройка webhooks', 'События', 'Retry логика', 'Безопасность'],
      color: 'from-indigo-500 to-violet-500'
    }
  ];

  const codeExample = `// Promo.music API - Быстрый старт
import PromoMusic from '@promo-music/sdk';

const client = new PromoMusic({
  apiKey: 'your_api_key_here'
});

// Загрузить трек
const track = await client.tracks.upload({
  file: trackFile,
  title: 'My New Song',
  artist: 'Artist Name',
  genre: 'Electronic'
});

// Получить аналитику
const analytics = await client.analytics.getTrackStats(
  track.id
);

console.log(analytics);`;

  return (
    <div className="min-h-screen bg-black text-white pb-12 sm:pb-16 md:pb-20">
      
      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden border-b border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF577F]/10 via-transparent to-[#3E4C5E]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,87,127,0.15),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-[#FF577F]/20">
              <Book className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-bold">Developer Documentation</span>
            </div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-6 leading-[1.1]">
              Документация <span className="bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] bg-clip-text text-transparent">API</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Полное руководство по интеграции с Promo.music API для разработчиков
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full">
                <Zap className="w-5 h-5 mr-2" />
                Быстрый старт
              </Button>
              <Button variant="outline" className="border-2 border-white/20 hover:bg-white/10 font-bold px-8 py-6 rounded-full">
                <Key className="w-5 h-5 mr-2" />
                Получить API ключ
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* CODE EXAMPLE */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 text-sm text-slate-400">quick-start.js</span>
          </div>
          <pre className="p-6 overflow-x-auto">
            <code className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre">
              {codeExample}
            </code>
          </pre>
        </motion.div>
      </div>

      {/* DOCUMENTATION SECTIONS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Разделы документации
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Всё необходимое для успешной интеграции
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all cursor-pointer group"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <section.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{section.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{section.description}</p>
              <ul className="space-y-2">
                {section.topics.map((topic, topicIdx) => (
                  <li key={topicIdx} className="text-xs text-slate-500 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#FF577F]"></div>
                    {topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* API STATS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'API Endpoints', value: '50+', icon: FileCode },
            { label: 'Uptime', value: '99.9%', icon: Zap },
            { label: 'Request/sec', value: '10K+', icon: Layers },
            { label: 'Developers', value: '500+', icon: Code }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-[#FF577F]" />
              <div className="text-3xl font-black mb-1">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
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
          <Lock className="w-12 h-12 mx-auto mb-4 text-[#FF577F]" />
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Готовы начать разработку?
          </h3>
          <p className="text-slate-300 mb-6">
            Получите API ключ и начните интеграцию прямо сейчас
          </p>
          <Button className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full">
            <Key className="w-5 h-5 mr-2" />
            Получить API ключ
          </Button>
        </motion.div>
      </div>

    </div>
  );
}