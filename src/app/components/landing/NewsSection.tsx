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

  const serverArticles: NewsArticle[] = (serverNews || []).map((n: LandingNews, i: number) => {
    const catMap: Record<string, NewsCategory> = {
      'Релиз': 'releases', 'Артист': 'artists', 'Индустрия': 'industry',
      'Концерт': 'events', 'Фестиваль': 'events', 'Чарт': 'charts',
      'Интервью': 'interviews', 'Рецензия': 'reviews', 'Рекорд': 'charts',
      'Технологии': 'industry',
    };
    return {
      id: n.id || `srv-${i}`,
      title: n.title || '',
      excerpt: n.excerpt || n.title || '',
      category: catMap[n.tag || ''] || 'industry',
      tags: [n.tag || 'Музыка'],
      image: n.coverImage || n.artistAvatar || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
      date: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('ru-RU') : 'Сегодня',
      timestamp: n.publishedAt ? new Date(n.publishedAt) : new Date(),
      author: 'ПРОМО.МУЗЫКА',
      source: n.source || 'ПРОМО.МУЗЫКА',
      views: n.views || 0,
      comments: 0,
      likes: n.likes || 0,
      shares: 0,
      readTime: 3,
      isTrending: i < 3,
      isFeatured: i < 2,
    };
  });

  // Fallback-новости используются только если сервер не вернул данных
  const fallbackArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'Promo.Air — запуск радио-модуля платформы Promo.Music',
      excerpt: 'Promo.Music официально запустил модуль Promo.Air — инструмент для радиостанций с управлением слотами, аналитикой и питчингом треков от артистов.',
      category: 'industry',
      tags: ['Promo.Air', 'Promo.Music', 'радио', 'запуск'],
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
      date: '1 час назад',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      author: 'Команда Promo.Music',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Promo.Music',
      views: 18200,
      comments: 412,
      likes: 1500,
      shares: 620,
      readTime: 5,
      isTrending: true,
      isFeatured: true,
      isBreaking: true,
      location: 'Москва, Россия',
    },
    {
      id: '2',
      title: 'Promo.Lab — новая продюсерская лаборатория для создателей музыки',
      excerpt: 'Запущен модуль Promo.Lab — пространство для продюсеров и битмейкеров. Коллаборации, биржа битов и AI-помощник для сведения.',
      category: 'industry',
      tags: ['Promo.Lab', 'Promo.Music', 'продюсеры', 'запуск'],
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
      date: '3 часа назад',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      author: 'Команда Promo.Music',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Promo.Music',
      views: 14500,
      comments: 345,
      likes: 1200,
      shares: 480,
      readTime: 6,
      isTrending: true,
      isFeatured: true,
      isBreaking: true,
      location: 'Москва, Россия',
    },
    {
      id: '3',
      title: 'Promo.Music работает в тестовом режиме — полноценный старт уже скоро',
      excerpt: 'Платформа Promo.Music сейчас работает в режиме бета-тестирования. Полноценный запуск с открытой регистрацией запланирован на ближайшее время. Присоединяйтесь к ранним пользователям!',
      category: 'industry',
      tags: ['Promo.Music', 'бета', 'запуск', 'платформа'],
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      date: '5 часов назад',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      author: 'Команда Promo.Music',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Promo.Music',
      views: 21300,
      comments: 567,
      likes: 1800,
      shares: 750,
      readTime: 4,
      isTrending: true,
      isExclusive: true,
      location: 'Москва, Россия',
    },
    {
      id: '4',
      title: 'Toxi$ собрал аншлаг на VK Stadium в Москве',
      excerpt: 'Большой сольный концерт Toxi$ на VK Stadium прошёл при полном аншлаге. Артист представил треки из нового альбома.',
      category: 'events',
      tags: ['Toxi$', 'концерт', 'VK Stadium'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      date: '8 часов назад',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      author: 'Дмитрий Концертов',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      source: 'InterMedia',
      views: 15800,
      comments: 342,
      likes: 980,
      shares: 410,
      readTime: 4,
      isBreaking: true,
      location: 'Москва, Россия',
    },
    {
      id: '5',
      title: 'Полина Гагарина анонсировала шоу во Дворце спорта «Триумф»',
      excerpt: 'Концерт состоится 19 апреля 2026 года. Полина обещает грандиозную программу с новыми аранжировками и спецэффектами.',
      category: 'events',
      tags: ['Полина Гагарина', 'концерт', 'Москва'],
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      date: '12 часов назад',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      author: 'Анна Музыкина',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      source: 'Яндекс Афиша',
      views: 12400,
      comments: 267,
      likes: 800,
      shares: 340,
      readTime: 3,
      location: 'Москва, Россия',
    },
    {
      id: '6',
      title: 'Мари Краймбрери выступила в Краснодаре — репортаж',
      excerpt: 'Концерт в Баскет-Холле собрал тысячи поклонников. Певица исполнила хиты и представила новый материал из готовящегося альбома.',
      category: 'artists',
      tags: ['Мари Краймбрери', 'Краснодар', 'концерт'],
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
      date: '1 день назад',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      author: 'Виктория Репортаж',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
      source: 'МТС Live',
      views: 9800,
      comments: 198,
      likes: 650,
      shares: 210,
      readTime: 5,
      location: 'Краснодар, Россия',
    },
    {
      id: '7',
      title: 'Flo Rida выступит в Новосибирске и Краснодаре — весенний тур по России',
      excerpt: 'Американский рэпер Flo Rida приезжает в Россию с концертами. 11 марта — Краснодар (Баскет-Холл), 14 марта — Новосибирск (СК «Сибирь-Арена»).',
      category: 'events',
      tags: ['Flo Rida', 'тур', 'Россия'],
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
      date: '1 день назад',
      timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
      author: 'Александр Ивентов',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      source: 'Billboard Russia',
      views: 18900,
      comments: 456,
      likes: 1100,
      shares: 520,
      readTime: 4,
      isTrending: true,
      location: 'Москва, Россия',
    },
    {
      id: '8',
      title: 'XXVI Международный фестиваль «Триумф джаза» в Доме музыки',
      excerpt: 'В Москве прошёл заключительный день XXVI фестиваля «Триумф джаза». Зрители услышали мировых джазовых исполнителей.',
      category: 'events',
      tags: ['джаз', 'фестиваль', 'Дом музыки'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      date: '2 дня назад',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      author: 'Сергей Джазмен',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
      source: 'Афиша Daily',
      views: 7600,
      comments: 134,
      likes: 520,
      shares: 180,
      readTime: 6,
      location: 'Москва, Россия',
    },
    {
      id: '9',
      title: 'Григорий Лепс дал большой концерт в БКЗ «Октябрьский»',
      excerpt: 'Артист выступил с программой лучших хитов за всю карьеру. Зал на 4 тысячи мест был заполнен полностью.',
      category: 'artists',
      tags: ['Григорий Лепс', 'Санкт-Петербург', 'концерт'],
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
      date: '2 дня назад',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      author: 'Мария Хроникер',
      authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      source: 'InterMedia',
      views: 11200,
      comments: 289,
      likes: 740,
      shares: 280,
      readTime: 4,
      location: 'Санкт-Петербург, Россия',
    },
    {
      id: '10',
      title: 'Promo.Music: как работает система питчинга треков на радио',
      excerpt: 'Подробный разбор механики питчинга в Promo.Music — как артисты отправляют треки радиостанциям, получают обратную связь и попадают в ротацию.',
      category: 'industry',
      tags: ['Promo.Music', 'питчинг', 'радио', 'гайд'],
      image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80',
      date: '3 дня назад',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      author: 'Команда Promo.Music',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Promo.Music',
      views: 13200,
      comments: 267,
      likes: 890,
      shares: 350,
      readTime: 7,
      location: 'Москва, Россия',
    },
    {
      id: '11',
      title: 'Сергей Бобунец дал концерт с симфоническим оркестром в Екатеринбурге',
      excerpt: 'Лидер «Смысловых Галлюцинаций» выступил в МТС Live Холл с полным симфоническим составом. Новые аранжировки классических хитов.',
      category: 'artists',
      tags: ['Сергей Бобунец', 'Екатеринбург', 'симфонический'],
      image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
      date: '3 дня назад',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      author: 'Игорь Уральский',
      authorAvatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80',
      source: 'Звуки.ру',
      views: 8900,
      comments: 178,
      likes: 560,
      shares: 190,
      readTime: 5,
      location: 'Екатеринбург, Россия',
    },
    {
      id: '12',
      title: 'Артур Пирожков выступит в Казани 4 апреля',
      excerpt: 'Шоу пройдёт на площадке МВЦ «Казань Экспо». Артист обещает масштабное шоу с танцевальной программой и новыми хитами.',
      category: 'events',
      tags: ['Артур Пирожков', 'Казань', 'шоу'],
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      date: '4 дня назад',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      author: 'Светлана Афишакова',
      authorAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80',
      source: 'МТС Live',
      views: 10500,
      comments: 234,
      likes: 670,
      shares: 290,
      readTime: 3,
      location: 'Казань, Россия',
    },
    {
      id: '13',
      title: 'Metallica Show S&M Tribute с симфоническим оркестром — Екатеринбург',
      excerpt: 'Трибьют-шоу Metallica с полным симфоническим оркестром пройдёт 2 апреля в Киноконцертном театре «Космос».',
      category: 'events',
      tags: ['Metallica', 'трибьют', 'Екатеринбург'],
      image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
      date: '5 дней назад',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      author: 'Роберт Металл',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      source: 'Яндекс Афиша',
      views: 14300,
      comments: 398,
      likes: 920,
      shares: 410,
      readTime: 4,
      location: 'Екатеринбург, Россия',
    },
    {
      id: '14',
      title: 'ПНЕВМОСЛОН — два дня в Base St. Petersburg',
      excerpt: 'Группа ПНЕВМОСЛОН выступила с двухдневным концертом 13–14 марта в петербургском клубе Base. Билеты от 2300 до 10000 рублей.',
      category: 'artists',
      tags: ['ПНЕВМОСЛОН', 'Санкт-Петербург', 'клуб'],
      image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80',
      date: '5 дней назад',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      author: 'Андрей Клубный',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      source: 'The Flow',
      views: 7800,
      comments: 156,
      likes: 480,
      shares: 170,
      readTime: 4,
      location: 'Санкт-Петербург, Россия',
    },
    {
      id: '15',
      title: 'Пикник — концерты в БКЗ «Октябрьский» 3 и 4 апреля',
      excerpt: 'Легендарная группа «Пикник» выступит с двумя концертами в Санкт-Петербурге. Программа включает хиты разных лет и новые композиции.',
      category: 'events',
      tags: ['Пикник', 'Санкт-Петербург', 'рок'],
      image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80',
      date: '1 неделю назад',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      author: 'Михаил Рокер',
      authorAvatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80',
      source: 'Афиша',
      views: 11500,
      comments: 312,
      likes: 780,
      shares: 290,
      readTime: 4,
      location: 'Санкт-Петербург, Россия',
    },
    {
      id: '16',
      title: 'Promo.Music: AI-ассистент Promo.Guide помогает артистам с продвижением',
      excerpt: 'Встроенный AI-агент на базе нейросетей анализирует статистику артиста и даёт персональные рекомендации по продвижению музыки.',
      category: 'industry',
      tags: ['Promo.Music', 'AI', 'Promo.Guide'],
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      date: '1 неделю назад',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      author: 'Команда Promo.Music',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Promo.Music',
      views: 16700,
      comments: 423,
      likes: 1100,
      shares: 480,
      readTime: 6,
      location: 'Москва, Россия',
    },
    {
      id: '17',
      title: 'Элвин Грей выступит в Казани 17 апреля',
      excerpt: 'Татарский поп-исполнитель даст большой концерт на площадке МВЦ «Казань Экспо». Ожидается аншлаг.',
      category: 'events',
      tags: ['Элвин Грей', 'Казань', 'поп'],
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      date: '1 неделю назад',
      timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      author: 'Рустам Казанский',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
      source: 'МТС Live',
      views: 9200,
      comments: 267,
      likes: 620,
      shares: 230,
      readTime: 3,
      location: 'Казань, Россия',
    },
    {
      id: '18',
      title: 'Диана Арбенина. BLOODYMARY — концерт в Екатеринбурге',
      excerpt: 'Диана Арбенина выступила 6 марта во Дворце игровых видов спорта «Уралочка» с программой BLOODYMARY.',
      category: 'artists',
      tags: ['Диана Арбенина', 'Екатеринбург', 'рок'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      date: '1 неделю назад',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      author: 'Ольга Рокзвезда',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      source: 'Звуки.ру',
      views: 10800,
      comments: 298,
      likes: 710,
      shares: 260,
      readTime: 5,
      location: 'Екатеринбург, Россия',
    },
    {
      id: '19',
      title: 'Сергей Лазарев с шоу «Шоумен» приедет в Краснодар 14 апреля',
      excerpt: 'Концерт пройдёт в Баскет-Холле. Лазарев представит масштабную постановку с новыми технологиями и хореографией.',
      category: 'events',
      tags: ['Сергей Лазарев', 'Краснодар', 'шоу'],
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      date: '2 недели назад',
      timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      author: 'Елена Премьера',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
      source: 'МТС Live',
      views: 8400,
      comments: 189,
      likes: 540,
      shares: 195,
      readTime: 3,
      location: 'Краснодар, Россия',
    },
    {
      id: '20',
      title: 'Ани Лорак объявила весенний тур по России',
      excerpt: 'Певица выступит в Казани (20 апреля) и Екатеринбурге (23 апреля). Билеты уже в продаже от 2500 рублей.',
      category: 'events',
      tags: ['Ани Лорак', 'тур', 'Россия'],
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      date: '2 недели назад',
      timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      author: 'Дарья Афишная',
      authorAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&q=80',
      source: 'Яндекс Афиша',
      views: 12100,
      comments: 345,
      likes: 810,
      shares: 320,
      readTime: 3,
      location: 'Москва, Россия',
    },
    {
      id: '21',
      title: 'Promo.Music: модуль Promo.Venue для площадок уже в бете',
      excerpt: 'Площадки и клубы могут управлять бронированиями, расписанием и аналитикой через новый модуль платформы Promo.Music.',
      category: 'industry',
      tags: ['Promo.Music', 'Promo.Venue', 'площадки'],
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
      date: '2 недели назад',
      timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
      author: 'Команда Promo.Music',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Promo.Music',
      views: 9500,
      comments: 198,
      likes: 620,
      shares: 240,
      readTime: 5,
      isExclusive: true,
      location: 'Москва, Россия',
    },
    {
      id: '22',
      title: 'Стас Михайлов выступит в Екатеринбурге 26 апреля',
      excerpt: 'Концерт «Всё для тебя» пройдёт в МТС Live Холл. Артист представит программу из лучших хитов и новых песен.',
      category: 'events',
      tags: ['Стас Михайлов', 'Екатеринбург', 'концерт'],
      image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
      date: '2 недели назад',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      author: 'Алексей Эстрада',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      source: 'Яндекс Афиша',
      views: 7600,
      comments: 156,
      likes: 430,
      shares: 160,
      readTime: 3,
      location: 'Екатеринбург, Россия',
    },
    {
      id: '23',
      title: 'The Hatters — тур продолжается: Краснодар, 9 апреля',
      excerpt: 'Группа The Hatters выступит во Дворце спорта «Олимп» в Краснодаре в рамках всероссийского тура.',
      category: 'events',
      tags: ['The Hatters', 'Краснодар', 'тур'],
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
      date: '3 недели назад',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      author: 'Кирилл Панкрок',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      source: 'Афиша',
      views: 8900,
      comments: 234,
      likes: 560,
      shares: 210,
      readTime: 3,
      location: 'Краснодар, Россия',
    },
    {
      id: '24',
      title: 'Оркестр CAGMO: симфония «Король и шут» в Новосибирске',
      excerpt: 'Симфонический оркестр CAGMO исполнит программу по мотивам песен группы «Король и шут» 18 апреля в ДК Железнодорожников.',
      category: 'events',
      tags: ['CAGMO', 'Новосибирск', 'симфония'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      date: '3 недели назад',
      timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      author: 'Евгений Классик',
      authorAvatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80',
      source: 'Афиша Города',
      views: 6800,
      comments: 145,
      likes: 410,
      shares: 150,
      readTime: 4,
      location: 'Новосибирск, Россия',
    },
    {
      id: '25',
      title: 'Promo.Music открывает DJ-кабинет для диджеев',
      excerpt: 'Новый модуль позволяет диджеям управлять расписанием выступлений, находить площадки и вести аналитику ивентов.',
      category: 'industry',
      tags: ['Promo.Music', 'DJ', 'модуль'],
      image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80',
      date: '3 недели назад',
      timestamp: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      author: 'Команда Promo.Music',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Promo.Music',
      views: 11200,
      comments: 287,
      likes: 740,
      shares: 310,
      readTime: 5,
      location: 'Москва, Россия',
    },
    {
      id: '26',
      title: 'Гарик Сукачёв выступит в Екатеринбурге 10 апреля',
      excerpt: 'Концерт пройдёт в МТС Live Холл. Сукачёв исполнит программу из рок-хитов разных лет.',
      category: 'events',
      tags: ['Гарик Сукачёв', 'Екатеринбург', 'рок'],
      image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
      date: '3 недели назад',
      timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      author: 'Роберт Рокнролл',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      source: 'Яндекс Афиша',
      views: 7800,
      comments: 198,
      likes: 490,
      shares: 170,
      readTime: 3,
      location: 'Екатеринбург, Россия',
    },
    {
      id: '27',
      title: 'Uma2rman — весенний тур: Казань (22 апреля) и Екатеринбург (9 апреля)',
      excerpt: 'Группа Uma2rman объявила даты весеннего тура. Концерты пройдут на площадках МВЦ и МТС Live Холл.',
      category: 'events',
      tags: ['Uma2rman', 'тур', 'весна'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      date: '3 недели назад',
      timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
      author: 'Павел Турменеджер',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
      source: 'МТС Live',
      views: 8100,
      comments: 167,
      likes: 520,
      shares: 190,
      readTime: 3,
      location: 'Москва, Россия',
    },
    {
      id: '28',
      title: 'Promo.Music: система Promo Coins — внутренняя валюта для продвижения',
      excerpt: 'Artисты могут использовать Promo Coins для продвижения треков, концертов и новостей на платформе. Разбираем механику и тарифы.',
      category: 'industry',
      tags: ['Promo.Music', 'Promo Coins', 'монетизация'],
      image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=800&q=80',
      date: '4 недели назад',
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      author: 'Команда Promo.Music',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Promo.Music',
      views: 14200,
      comments: 356,
      likes: 920,
      shares: 380,
      readTime: 6,
      location: 'Москва, Россия',
    },
    {
      id: '29',
      title: 'Ваня Дмитриенко — большой концерт в Екатеринбурге 11 апреля',
      excerpt: 'Молодой поп-артист выступит в МТС Live Холл. Билеты от 3000 рублей уже в продаже.',
      category: 'events',
      tags: ['Ваня Дмитриенко', 'Екатеринбург', 'поп'],
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      date: '4 недели назад',
      timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      author: 'Катерина Мелодия',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      source: 'Яндекс Афиша',
      views: 9300,
      comments: 234,
      likes: 610,
      shares: 220,
      readTime: 3,
      location: 'Екатеринбург, Россия',
    },
    {
      id: '30',
      title: 'Promo.Music приглашает артистов в бета-тестирование',
      excerpt: 'Платформа ищет первых артистов, радиостанции и площадки для тестирования всех модулей перед полноценным запуском. Присоединяйтесь бесплатно!',
      category: 'industry',
      tags: ['Promo.Music', 'бета', 'приглашение'],
      image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80',
      date: '1 месяц назад',
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      author: 'Команда Promo.Music',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Promo.Music',
      views: 19800,
      comments: 567,
      likes: 1450,
      shares: 620,
      readTime: 4,
      isTrending: true,
      location: 'Москва, Россия',
    },
  ];

  // Серверные данные приоритетнее; fallback только если сервер не вернул данных
  const newsArticles = serverArticles.length > 0 ? serverArticles : fallbackArticles;

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
