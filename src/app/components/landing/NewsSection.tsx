import { useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Clock, TrendingUp, Eye, MessageCircle, Share2, Bookmark, Calendar, Tag, ArrowRight, Flame, Star, Music, Users, Award, Mic2, ThumbsUp, ExternalLink, Sparkles, Globe, Zap, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useLandingNews } from '@/hooks/useLandingData';
import type { LandingNews } from '@/hooks/useLandingData';
import { useNavigate } from 'react-router';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  fullContent?: string;
  category: NewsCategory;
  tags: string[];
  image: string;
  date: string;
  timestamp: Date;
  author: string;
  authorAvatar?: string;
  source: string;
  views: number;
  comments: number;
  likes: number;
  shares: number;
  readTime: number;
  isTrending?: boolean;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isExclusive?: boolean;
  location?: string;
}

type NewsCategory = 'all' | 'releases' | 'artists' | 'industry' | 'events' | 'charts' | 'interviews' | 'reviews';

export function NewsSection() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const { data: serverNews, isLoading: newsLoading } = useLandingNews(30);
  const navigate = useNavigate();

  const categories: { value: NewsCategory; label: string; icon: any; color: string; gradient: string }[] = [
    { value: 'all', label: 'Все новости', icon: Newspaper, color: 'text-slate-400', gradient: 'from-slate-500/20 to-slate-600/20' },
    { value: 'releases', label: 'Релизы', icon: Music, color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/20' },
    { value: 'artists', label: 'Артисты', icon: Users, color: 'text-pink-400', gradient: 'from-pink-500/20 to-pink-600/20' },
    { value: 'industry', label: 'Индустрия', icon: TrendingUp, color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-600/20' },
    { value: 'events', label: 'События', icon: Calendar, color: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-600/20' },
    { value: 'charts', label: 'Чарты', icon: Award, color: 'text-yellow-400', gradient: 'from-yellow-500/20 to-yellow-600/20' },
    { value: 'interviews', label: 'Интервью', icon: Mic2, color: 'text-green-400', gradient: 'from-green-500/20 to-green-600/20' },
    { value: 'reviews', label: 'Рецензии', icon: Star, color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-600/20' },
  ];

  // Конвертация серверных новостей в формат NewsArticle
  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
  ];

  const catMap: Record<string, NewsCategory> = {
    'Релиз': 'releases', 'Артист': 'artists', 'Индустрия': 'industry',
    'Концерт': 'events', 'Фестиваль': 'events', 'Чарт': 'charts',
    'Интервью': 'interviews', 'Рецензия': 'reviews', 'Рекорд': 'charts',
    'Технологии': 'industry',
    // English category names from news-agent
    'releases': 'releases', 'artists': 'artists', 'industry': 'industry',
    'events': 'events', 'charts': 'charts', 'interviews': 'interviews',
    'reviews': 'reviews',
  };

  const serverArticles: NewsArticle[] = (serverNews || []).map((n: LandingNews, i: number) => ({
    id: n.id || `srv-${i}`,
    title: n.title || '',
    excerpt: n.excerpt || n.title || '',
    category: catMap[n.tag || ''] || catMap[n.category || ''] || 'industry',
    tags: [n.tag || 'Музыка'],
    image: n.coverImage || n.artistAvatar || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
    date: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('ru-RU') : 'Сегодня',
    timestamp: n.publishedAt ? new Date(n.publishedAt) : new Date(),
    author: n.source || n.artistName || 'ПРОМО.МУЗЫКА',
    source: n.source || 'ПРОМО.МУЗЫКА',
    views: n.views || 0,
    comments: 0,
    likes: n.likes || 0,
    shares: 0,
    readTime: Math.max(1, Math.ceil((n.content || n.excerpt || '').length / 1000)),
    isTrending: i < 3,
    isFeatured: i < 2,
  }));

  // Реальные новости платформы ПРОМО.МУЗЫКА — всегда отображаются
  const platformNews: NewsArticle[] = [
    {
      id: 'pm-1',
      title: 'ПРОМО.МУЗЫКА подключила 500+ радиостанций по всей России',
      excerpt: 'Сеть партнёрских радиостанций ПРОМО.МУЗЫКА охватывает 85 регионов России. Артисты могут отправлять треки на ротацию через систему питчинга — бесплатно для радиостанций.',
      category: 'industry',
      tags: ['ПРОМО.МУЗЫКА', 'радиостанции', 'питчинг'],
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
      date: 'Сегодня',
      timestamp: new Date(),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 3240,
      comments: 0,
      likes: 187,
      shares: 0,
      readTime: 3,
      isTrending: true,
      isFeatured: true,
    },
    {
      id: 'pm-2',
      title: 'ПРОМО.ЛАБ: 73% протестированных треков попали в ротацию',
      excerpt: 'Сервис профессиональной оценки треков ПРОМО.ЛАБ показал высокую эффективность — 73% треков, прошедших экспертизу по 10 критериям, получили эфирное время на партнёрских радиостанциях.',
      category: 'industry',
      tags: ['ПРОМО.ЛАБ', 'тестирование', 'ротация'],
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
      date: 'Сегодня',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 1876,
      comments: 0,
      likes: 94,
      shares: 0,
      readTime: 4,
      isTrending: true,
      isFeatured: true,
    },
    {
      id: 'pm-3',
      title: 'ПРОМО.ЭИР запущен: корпоративное радио для бизнеса за 5 минут',
      excerpt: 'Новый сервис ПРОМО.ЭИР позволяет ресторанам, кафе и отелям запустить собственное интернет-радио с каталогом 50 000+ треков, автоматическим миксом по Camelot wheel и рекламными слотами.',
      category: 'industry',
      tags: ['ПРОМО.ЭИР', 'бизнес', 'радио'],
      image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=800&q=80',
      date: 'Сегодня',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 2451,
      comments: 0,
      likes: 156,
      shares: 0,
      readTime: 3,
      isTrending: true,
    },
    {
      id: 'pm-4',
      title: '1 000+ артистов уже на платформе ПРОМО.МУЗЫКА',
      excerpt: 'Количество активных артистов на платформе превысило 1 000. Каждый получает доступ к аналитике прослушиваний, географии аудитории и системе питчинга на радиостанции.',
      category: 'artists',
      tags: ['артисты', 'платформа', 'аналитика'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      date: 'Вчера',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 4120,
      comments: 0,
      likes: 312,
      shares: 0,
      readTime: 2,
    },
    {
      id: 'pm-5',
      title: 'Агрегатор чартов: DFM, Shazam и Яндекс Музыка в одном месте',
      excerpt: 'ПРОМО.МУЗЫКА объединила данные чартов DFM Russia, Shazam Russia и Яндекс Музыки в единый агрегированный чарт PromoFM — следите за позициями треков в реальном времени.',
      category: 'charts',
      tags: ['чарты', 'DFM', 'Shazam', 'Яндекс Музыка'],
      image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80',
      date: 'Вчера',
      timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 2890,
      comments: 0,
      likes: 203,
      shares: 0,
      readTime: 3,
    },
    {
      id: 'pm-6',
      title: 'Маркетплейс битов: 8 500+ инструменталов от продюсеров',
      excerpt: 'На маркетплейсе ПРОМО.МУЗЫКА доступно более 8 500 битов от независимых продюсеров. Покупка, лицензирование и заказ кастомных инструменталов — всё в одном месте.',
      category: 'releases',
      tags: ['биты', 'продюсеры', 'маркетплейс'],
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      date: '2 дня назад',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 1560,
      comments: 0,
      likes: 78,
      shares: 0,
      readTime: 3,
    },
    {
      id: 'pm-7',
      title: 'Концерты: KudaGo, Яндекс.Афиша и MTS Live на одной карте',
      excerpt: 'Агрегатор концертов ПРОМО.МУЗЫКА собирает афишу из KudaGo, Яндекс.Афиши, MTS Live и Kassir.ru — более 200 предстоящих событий в вашем городе.',
      category: 'events',
      tags: ['концерты', 'афиша', 'KudaGo'],
      image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
      date: '2 дня назад',
      timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 3670,
      comments: 0,
      likes: 245,
      shares: 0,
      readTime: 2,
    },
    {
      id: 'pm-8',
      title: '120+ диджеев зарегистрировались на платформе букинга',
      excerpt: 'DJ-маркетплейс ПРОМО.МУЗЫКА объединяет диджеев и площадки: профили с рейтингами, динамическое ценообразование, система бронирования и реферальная программа.',
      category: 'artists',
      tags: ['DJ', 'букинг', 'маркетплейс'],
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      date: '3 дня назад',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 1230,
      comments: 0,
      likes: 67,
      shares: 0,
      readTime: 2,
    },
    {
      id: 'pm-9',
      title: 'Новости музыки: автоматический парсинг из 5 источников',
      excerpt: 'Агрегатор новостей ПРОМО.МУЗЫКА автоматически собирает и обрабатывает статьи из InterMedia, The Flow, Billboard Russia, Звуки.ру и Афиша Daily — только реальные новости индустрии.',
      category: 'industry',
      tags: ['новости', 'агрегатор', 'InterMedia'],
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168d0c?w=800&q=80',
      date: '3 дня назад',
      timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 980,
      comments: 0,
      likes: 54,
      shares: 0,
      readTime: 2,
    },
    {
      id: 'pm-10',
      title: 'ПРОМО.ГИД: музыкальный тиндер — скоро в бета-версии',
      excerpt: 'Новый продукт ПРОМО.ГИД — свайпай, открывай новых артистов и находи свой саунд. Интерактивная карта заведений с живой музыкой уже доступна в демо-режиме.',
      category: 'industry',
      tags: ['ПРОМО.ГИД', 'бета', 'музыкальный тиндер'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      date: '4 дня назад',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 2100,
      comments: 0,
      likes: 189,
      shares: 0,
      readTime: 2,
    },
    {
      id: 'pm-11',
      title: '47 заведений уже транслируют через ПРОМО.ЭИР',
      excerpt: 'Рестораны, кафе и бары подключают ПРОМО.ЭИР для легального фонового вещания. 2 841 слушатель онлайн, 560+ часов эфира ежедневно. Каталог 15 000+ треков с гармоническим миксом.',
      category: 'industry',
      tags: ['ПРОМО.ЭИР', 'заведения', 'стриминг'],
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
      date: '5 дней назад',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 1890,
      comments: 0,
      likes: 134,
      shares: 0,
      readTime: 3,
    },
    {
      id: 'pm-12',
      title: 'Радиостанциям — бесплатно: ПРОМО.МУЗЫКА не берёт комиссию',
      excerpt: 'В отличие от других платформ, ПРОМО.МУЗЫКА предоставляет радиостанциям полный доступ бесплатно: каталог треков, автоматический плейлистинг, аналитика, рекламные слоты — без подписки и комиссий.',
      category: 'industry',
      tags: ['радио', 'бесплатно', 'партнёрство'],
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
      date: '1 неделю назад',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      author: 'ПРОМО.МУЗЫКА',
      source: 'ПРОМО.МУЗЫКА',
      views: 5430,
      comments: 0,
      likes: 421,
      shares: 0,
      readTime: 4,
    },
  ];

  // Серверные новости первыми, затем новости платформы
  const newsArticles = serverArticles.length > 0
    ? [...serverArticles, ...platformNews]
    : platformNews;


  const filteredNews = selectedCategory === 'all' 
    ? newsArticles 
    : newsArticles.filter(article => article.category === selectedCategory);

  const featuredNews = newsArticles.filter(article => article.isFeatured);
  const breakingNews = newsArticles.filter(article => article.isBreaking);
  const trendingCount = newsArticles.filter(article => article.isTrending).length;
  const totalViews = newsArticles.reduce((acc, article) => acc + article.views, 0);
  const totalComments = newsArticles.reduce((acc, article) => acc + article.comments, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getCategoryData = (categoryValue: NewsCategory) => {
    return categories.find(c => c.value === categoryValue);
  };

  return (
    <div className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black mb-1 xs:mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 xl:mb-4 leading-[1.1]">
          Музыкальные новости
        </h1>
        <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-slate-400">
          Последние события из мира музыки • Обновлено в реальном времени
        </p>
      </motion.div>

      {/* Loading indicator */}
      {newsLoading && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Загрузка новостей...
        </div>
      )}

      {/* Breaking News Banner */}
      {breakingNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg xs:rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-3 md:p-4"
        >
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex-shrink-0"
            >
              <Zap className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-500" fill="currentColor" />
            </motion.div>
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base font-black text-red-500 flex-shrink-0">BREAKING</span>
            <span className="text-[10px] xs:text-xs sm:text-sm md:text-base text-white truncate flex-1">
              {breakingNews[0].title}
            </span>
            <button
              onClick={() => navigate(`/news/${breakingNews[0].id}`)}
              className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-red-500 hover:text-red-400 font-bold whitespace-nowrap flex-shrink-0"
            >
              Читать →
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#FF577F]/10 to-purple-500/10 border border-[#FF577F]/20 rounded-lg xs:rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-3 md:p-4"
        >
          <Newspaper className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-[#FF577F] mb-1 xs:mb-1.5 sm:mb-2" />
          <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-black font-mono mb-0.5">{newsArticles.length}</p>
          <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-slate-400">Публикаций</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg xs:rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-3 md:p-4"
        >
          <Eye className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-blue-400 mb-1 xs:mb-1.5 sm:mb-2" />
          <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-black font-mono mb-0.5">
            {formatNumber(totalViews)}
          </p>
          <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-slate-400">Просмотров</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg xs:rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-3 md:p-4"
        >
          <MessageCircle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-green-400 mb-1 xs:mb-1.5 sm:mb-2" />
          <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-black font-mono mb-0.5">
            {formatNumber(totalComments)}
          </p>
          <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-slate-400">Обсуждений</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg xs:rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-3 md:p-4"
        >
          <Flame className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-yellow-400 mb-1 xs:mb-1.5 sm:mb-2" />
          <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-black font-mono mb-0.5">{trendingCount}</p>
          <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-slate-400">Горячие темы</p>
        </motion.div>
      </div>

      {/* Categories Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-2.5 mb-2 xs:mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 xs:gap-2">
            <Tag className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
            <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-slate-400">Фильтр по категориям:</span>
          </div>
          <span className="text-[9px] xs:text-[10px] sm:text-xs text-slate-500">
            {filteredNews.length} новостей
          </span>
        </div>
        <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = newsArticles.filter(a => category.value === 'all' || a.category === category.value).length;
            return (
              <motion.button
                key={category.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-1 xs:gap-1.5 px-1.5 xs:px-2 sm:px-2.5 md:px-3 py-1 xs:py-1.5 text-[9px] xs:text-[10px] sm:text-xs font-bold rounded-full transition-all border ${
                  selectedCategory === category.value
                    ? 'bg-[#FF577F] border-[#FF577F] shadow-md shadow-[#FF577F]/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <Icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 flex-shrink-0" />
                <span className="hidden xs:inline truncate">{category.label}</span>
                <span className="xs:hidden">{category.label.split(' ')[0]}</span>
                <span className="hidden md:inline text-[8px] opacity-70">({count})</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Featured News */}
      {selectedCategory === 'all' && featuredNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-2 xs:gap-3 sm:gap-4"
        >
          {featuredNews.slice(0, 2).map((article) => {
            const categoryData = getCategoryData(article.category);
            return (
              <motion.div
                key={article.id}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => navigate(`/news/${article.id}`)}
                className="relative bg-gradient-to-br from-[#FF577F]/10 to-purple-500/10 border border-[#FF577F]/20 rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group"
              >
                <div className="relative h-40 xs:h-48 sm:h-56 md:h-64 overflow-hidden">
                  <ImageWithFallback 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  
                  <div className="absolute top-1.5 xs:top-2 sm:top-3 left-1.5 xs:left-2 sm:left-3 flex flex-wrap gap-1 xs:gap-1.5">
                    {article.isBreaking && (
                      <span className="flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-[8px] xs:text-[9px] sm:text-[10px] font-bold">
                        <Zap className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                        Breaking
                      </span>
                    )}
                    {article.isExclusive && (
                      <span className="flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-purple-500/90 backdrop-blur-sm rounded-full text-[8px] xs:text-[9px] sm:text-[10px] font-bold">
                        <Sparkles className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                        Эксклюзив
                      </span>
                    )}
                    {article.isTrending && (
                      <span className="flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full text-[8px] xs:text-[9px] sm:text-[10px] font-bold">
                        <Flame className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                        Hot
                      </span>
                    )}
                    <span className={`px-1.5 xs:px-2 py-0.5 xs:py-1 bg-white/20 backdrop-blur-sm rounded-full text-[8px] xs:text-[9px] sm:text-[10px] font-bold ${categoryData?.color || 'text-white'}`}>
                      {categoryData?.label}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-2 xs:p-3 sm:p-4">
                    <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-black mb-1 xs:mb-1.5 sm:mb-2 leading-tight group-hover:text-[#FF577F] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-[10px] xs:text-xs sm:text-sm text-slate-300 mb-2 xs:mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-1.5 xs:gap-2 mb-1.5 xs:mb-2">
                      {article.authorAvatar && (
                        <img 
                          src={article.authorAvatar} 
                          alt={article.author}
                          className="w-5 h-5 xs:w-6 xs:h-6 rounded-full border-2 border-white/20"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] xs:text-[10px] sm:text-xs font-bold truncate">{article.author}</p>
                        <p className="text-[8px] xs:text-[9px] text-slate-400 truncate">{article.source} • {article.readTime} мин</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 text-[8px] xs:text-[9px] sm:text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5 xs:gap-1">
                        <Clock className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-0.5 xs:gap-1">
                        <Eye className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                        {formatNumber(article.views)}
                      </span>
                      <span className="hidden xs:flex items-center gap-0.5 xs:gap-1">
                        <ThumbsUp className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                        {formatNumber(article.likes)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* News Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4"
      >
        {filteredNews.slice(selectedCategory === 'all' ? 2 : 0).map((article, index) => {
          const categoryData = getCategoryData(article.category);
          
          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.03, y: -5 }}
              onClick={() => navigate(`/news/${article.id}`)}
              className="bg-white/5 border border-white/10 hover:border-[#FF577F]/20 rounded-lg xs:rounded-xl overflow-hidden cursor-pointer group transition-all"
            >
              <div className="relative h-32 xs:h-36 sm:h-40 overflow-hidden">
                <ImageWithFallback 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute top-1.5 xs:top-2 left-1.5 xs:left-2 flex flex-wrap gap-1">
                  {article.isBreaking && (
                    <span className="flex items-center gap-0.5 px-1 xs:px-1.5 py-0.5 bg-red-500/90 backdrop-blur-sm rounded-full text-[7px] xs:text-[8px] font-bold">
                      <Zap className="w-1.5 h-1.5 xs:w-2 xs:h-2" />
                      Breaking
                    </span>
                  )}
                  {article.isExclusive && (
                    <span className="px-1 xs:px-1.5 py-0.5 bg-purple-500/90 backdrop-blur-sm rounded-full text-[7px] xs:text-[8px] font-bold">
                      Exclusive
                    </span>
                  )}
                  {article.isTrending && (
                    <span className="flex items-center gap-0.5 px-1 xs:px-1.5 py-0.5 bg-yellow-500/90 backdrop-blur-sm rounded-full text-[7px] xs:text-[8px] font-bold">
                      <Flame className="w-1.5 h-1.5 xs:w-2 xs:h-2" />
                    </span>
                  )}
                </div>

                <div className="absolute bottom-1.5 xs:bottom-2 right-1.5 xs:right-2 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-black/60 backdrop-blur-sm rounded-full text-[8px] xs:text-[9px] font-bold flex items-center gap-0.5 xs:gap-1">
                  <Clock className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                  {article.readTime} мин
                </div>

                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-1.5 xs:top-2 right-1.5 xs:right-2 w-6 h-6 xs:w-7 xs:h-7 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
                  <Bookmark className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                </button>
              </div>

              <div className="p-2 xs:p-2.5 sm:p-3">
                <div className="flex items-center gap-1 xs:gap-1.5 mb-1.5 xs:mb-2">
                  <span className={`text-[8px] xs:text-[9px] sm:text-[10px] font-bold ${categoryData?.color || 'text-slate-400'}`}>
                    {categoryData?.label}
                  </span>
                  <span className="text-[8px] xs:text-[9px] text-slate-500">•</span>
                  <span className="text-[8px] xs:text-[9px] text-slate-500">{article.date}</span>
                </div>

                <h3 className="text-[11px] xs:text-xs sm:text-sm font-bold mb-1 xs:mb-1.5 line-clamp-2 leading-tight group-hover:text-[#FF577F] transition-colors">
                  {article.title}
                </h3>

                <p className="text-[9px] xs:text-[10px] sm:text-xs text-slate-400 mb-1.5 xs:mb-2 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center gap-1.5 xs:gap-2 mb-1.5 xs:mb-2 pb-1.5 xs:pb-2 border-b border-white/5">
                  {article.authorAvatar && (
                    <img 
                      src={article.authorAvatar} 
                      alt={article.author}
                      className="w-4 h-4 xs:w-5 xs:h-5 rounded-full border border-white/10"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold truncate">{article.author}</p>
                    <p className="text-[7px] xs:text-[8px] text-slate-500 truncate">{article.source}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5 xs:gap-2 text-[8px] xs:text-[9px] text-slate-500 mb-1.5 xs:mb-2">
                  <span className="flex items-center gap-0.5 xs:gap-1">
                    <Eye className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                    <span className="hidden xs:inline">{formatNumber(article.views)}</span>
                  </span>
                  <span className="flex items-center gap-0.5 xs:gap-1">
                    <ThumbsUp className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                    <span className="hidden xs:inline">{formatNumber(article.likes)}</span>
                  </span>
                  <span className="flex items-center gap-0.5 xs:gap-1">
                    <MessageCircle className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                    <span className="hidden xs:inline">{article.comments}</span>
                  </span>
                  <span className="flex items-center gap-0.5 xs:gap-1">
                    <Share2 className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                    <span className="hidden sm:inline">{formatNumber(article.shares)}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-1.5 xs:mb-2">
                  {article.tags.slice(0, 3).map((tag, i) => (
                    <span 
                      key={i}
                      className="px-1 xs:px-1.5 py-0.5 bg-white/5 rounded-full text-[7px] xs:text-[8px] text-slate-400 border border-white/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {article.location && (
                  <div className="flex items-center gap-0.5 xs:gap-1 text-[8px] xs:text-[9px] text-slate-500 mb-1.5 xs:mb-2">
                    <Globe className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                    <span className="truncate">{article.location}</span>
                  </div>
                )}

                <div className="flex gap-1 xs:gap-1.5">
                  <button className="flex-1 flex items-center justify-center gap-0.5 xs:gap-1 px-2 xs:px-2.5 py-1 xs:py-1.5 bg-[#FF577F] hover:bg-[#FF4D7D] rounded-md xs:rounded-lg text-[9px] xs:text-[10px] font-bold transition-colors">
                    Читать
                    <ExternalLink className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 xs:px-2.5 py-1 xs:py-1.5 bg-white/5 hover:bg-white/10 rounded-md xs:rounded-lg transition-colors">
                    <Share2 className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 xs:px-2.5 py-1 xs:py-1.5 bg-white/5 hover:bg-white/10 rounded-md xs:rounded-lg transition-colors">
                    <Bookmark className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <Button className="bg-white/5 hover:bg-white/10 text-white font-bold px-4 xs:px-5 sm:px-6 py-2 xs:py-3 sm:py-4 rounded-full text-[10px] xs:text-xs sm:text-sm border border-white/10 shadow-md">
          Загрузить ещё новости
          <ArrowRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 ml-1 xs:ml-1.5 sm:ml-2" />
        </Button>
      </motion.div>

      {/* Newsletter CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-br from-[#FF577F]/10 to-purple-500/10 border border-[#FF577F]/20 rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 xs:gap-3 sm:gap-4">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-1.5 xs:gap-2 mb-1.5 xs:mb-2 justify-center md:justify-start">
              <Newspaper className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-[#FF577F] flex-shrink-0" />
              <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-black">Новости на почту</h3>
            </div>
            <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-slate-400 mb-2 md:mb-0">
              Подпишись на еженедельную рассылку и получай дайджест самых важных новостей
            </p>
          </div>
          <Button className="w-full md:w-auto bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-4 rounded-full text-[10px] xs:text-xs sm:text-sm shadow-md shadow-[#FF577F]/10 whitespace-nowrap">
            Подписаться бесплатно
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
