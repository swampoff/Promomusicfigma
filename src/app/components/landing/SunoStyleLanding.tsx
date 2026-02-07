/**
 * SUNO STYLE LANDING - Минималистичный дизайн в стиле Suno.ai
 * Фокус на контенте, крупные элементы, чистый UI
 */

import { useState } from 'react';
import { Play, Sparkles, TrendingUp, Radio, Music2, ChevronRight, Music, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/app/components/ui/button';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  cover?: string;
}

interface SunoStyleLandingProps {
  onLogin: () => void;
}

export function SunoStyleLanding({ onLogin }: SunoStyleLandingProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Mock данные в стиле Suno
  const genres = [
    { id: 'all', label: 'Все', icon: '🎵' },
    { id: 'pop', label: 'Pop', icon: '✨' },
    { id: 'rock', label: 'Rock', icon: '🎸' },
    { id: 'electronic', label: 'Electronic', icon: '🎹' },
    { id: 'hip-hop', label: 'Hip-Hop', icon: '🎤' },
  ];

  const tracks: Track[] = [
    { id: '1', title: 'Летний вайб', artist: 'AI Artist', genre: 'pop' },
    { id: '2', title: 'Ночной драйв', artist: 'Neural Beats', genre: 'electronic' },
    { id: '3', title: 'Городские ритмы', artist: 'Flow Master', genre: 'hip-hop' },
    { id: '4', title: 'Рок-баллада', artist: 'Rock AI', genre: 'rock' },
    { id: '5', title: 'Танцевальный хит', artist: 'Beat Generator', genre: 'electronic' },
    { id: '6', title: 'Поп-мелодия', artist: 'Melody AI', genre: 'pop' },
    { id: '7', title: 'Электро-волна', artist: 'Synth Master', genre: 'electronic' },
    { id: '8', title: 'Хип-хоп флоу', artist: 'Rap Bot', genre: 'hip-hop' },
  ];

  const filteredTracks = selectedGenre === 'all' 
    ? tracks 
    : tracks.filter(t => t.genre === selectedGenre);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Header - Suno Style */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white hidden sm:block">
              Promo.Music
            </span>
          </motion.div>

          {/* Navigation - простая */}
          <nav className="hidden md:flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-white/10"
            >
              Главная
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5"
            >
              О платформе
            </motion.button>
          </nav>

          {/* Login Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onLogin}
              className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white border-0 px-6 sm:px-8 py-2 sm:py-2.5 font-bold rounded-full shadow-lg shadow-orange-500/30"
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Войти</span>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section - Suno Style */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden pt-16 sm:pt-20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-purple-600/20 to-pink-600/20" />
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-slate-300">Музыкальная платформа для артистов</span>
            </motion.div>

            {/* Main Heading - Крупный, как в Suno */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-[0.9]"
            >
              <span className="block mb-2">Создавай.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500">
                Продвигай.
              </span>
              <span className="block">Зарабатывай.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl sm:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Продвигай треки на радиостанциях. Анализируй эфиры. Получай выплаты.
            </motion.p>

            {/* CTA Buttons - Большие, как в Suno */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="group bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white border-0 px-12 py-8 text-lg font-bold rounded-full shadow-2xl shadow-orange-500/30"
              >
                Начать бесплатно
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                onClick={onLogin}
                size="lg"
                variant="outline"
                className="bg-white/5 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white/10 px-12 py-8 text-lg font-semibold rounded-full"
              >
                Войти
              </Button>
            </motion.div>

            {/* Stats - Минималистичные */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-20 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-orange-500" />
                <span>4 радиостанции</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pink-500" />
                <span>1000+ треков в ротации</span>
              </div>
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4 text-purple-500" />
                <span>24/7 мониторинг</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-white/40 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Tracks Section - Suno Style Grid */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              Популярные треки
            </h2>
            <p className="text-lg text-slate-400">
              Слушай то, что создают другие артисты
            </p>
          </motion.div>

          {/* Genre Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {genres.map((genre) => (
              <motion.button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  selectedGenre === genre.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                <span className="mr-2">{genre.icon}</span>
                {genre.label}
              </motion.button>
            ))}
          </div>

          {/* Tracks Grid - Простые карточки как в Suno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTracks.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Минимализм */}
      <section className="relative py-20 px-4 sm:px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              Всё что нужно артисту
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Простые инструменты для продвижения твоей музыки
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="📻"
              title="Радиоротация"
              description="Размещай треки в эфире ведущих радиостанций России"
              delay={0}
            />
            <FeatureCard
              icon="📊"
              title="Аналитика"
              description="Отслеживай выходы в эфир и статистику прослушиваний"
              delay={0.1}
            />
            <FeatureCard
              icon="💰"
              title="Монетизация"
              description="Получай выплаты за каждый выход трека в эфир"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6">
              Начни прямо сейчас
            </h2>
            <p className="text-xl text-slate-400 mb-12">
              Присоединяйся к сотням артистов, которые уже продвигают свою музыку
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white border-0 px-12 py-8 text-lg font-bold rounded-full shadow-2xl shadow-orange-500/30"
            >
              Создать аккаунт бесплатно
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal Suno Style */}
      <footer className="relative border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Main Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Platforms */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm">Платформы</h3>
              <ul className="space-y-2">
                {['Promo.Air', 'Promo.Music', 'Promo.Guide'].map((item) => (
                  <li key={item}>
                    <button className="text-sm text-slate-500 hover:text-white transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm">Продукт</h3>
              <ul className="space-y-2">
                {['Функции', 'Тарифы', 'API'].map((item) => (
                  <li key={item}>
                    <button className="text-sm text-slate-500 hover:text-white transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm">Компания</h3>
              <ul className="space-y-2">
                {['О нас', 'Блог', 'Карьера'].map((item) => (
                  <li key={item}>
                    <button className="text-sm text-slate-500 hover:text-white transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm">Поддержка</h3>
              <ul className="space-y-2">
                {['Помощь', 'Документация', 'Контакты'].map((item) => (
                  <li key={item}>
                    <button className="text-sm text-slate-500 hover:text-white transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Promo.Music</span>
            </div>
            
            {/* Copyright */}
            <div className="text-sm text-slate-500">
              © 2026 Promo.Music. Все права защищены.
            </div>
            
            {/* Social */}
            <div className="flex items-center gap-4">
              {['Twitter', 'Instagram', 'Telegram'].map((social) => (
                <button
                  key={social}
                  className="text-sm text-slate-500 hover:text-white transition-colors"
                >
                  {social}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Track Card Component - Простая карточка в стиле Suno
function TrackCard({ track, index }: { track: Track; index: number }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 cursor-pointer"
      onClick={() => setIsPlaying(!isPlaying)}
    >
      {/* Cover / Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-500/20" />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Play Button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </motion.button>
        </div>

        {/* Track Info */}
        <div>
          <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
            {track.title}
          </h3>
          <p className="text-slate-400 text-sm">
            {track.artist}
          </p>
        </div>
      </div>

      {/* Hover Border */}
      <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-2xl transition-colors" />
    </motion.div>
  );
}

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  delay 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}