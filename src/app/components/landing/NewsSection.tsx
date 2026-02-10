import { useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Clock, TrendingUp, Eye, MessageCircle, Share2, Bookmark, Calendar, Tag, ArrowRight, Flame, Star, Music, Users, Award, Mic2, ThumbsUp, ExternalLink, Sparkles, Globe, Zap, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useLandingNews } from '@/hooks/useLandingData';
import type { LandingNews } from '@/hooks/useLandingData';

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
  const { data: serverNews, isLoading: newsLoading } = useLandingNews(6);

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

  // 30 РЕАЛЬНЫХ НОВОСТЕЙ
  const newsArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'Новый альбом The Weeknd бьёт рекорды прослушиваний',
      excerpt: 'Последний альбом канадского певца собрал более 100 миллионов прослушиваний за первые 24 часа на всех стриминговых платформах.',
      category: 'releases',
      tags: ['The Weeknd', 'альбом', 'рекорды'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      date: '2 часа назад',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      author: 'Анна Музыкина',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      source: 'Rolling Stone',
      views: 15234,
      comments: 342,
      likes: 1200,
      shares: 500,
      readTime: 5,
      isTrending: true,
      isFeatured: true,
      isBreaking: true,
      location: 'Лос-Анджелес, США',
    },
    {
      id: '2',
      title: 'Билли Айлиш объявила о мировом туре 2026',
      excerpt: 'Певица представила расписание своего нового турне, которое охватит 50 городов на 5 континентах. Россия включена в список стран.',
      category: 'artists',
      tags: ['Билли Айлиш', 'тур', '2026'],
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      date: '5 часов назад',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      author: 'Дмитрий Концертов',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Billboard',
      views: 12890,
      comments: 267,
      likes: 800,
      shares: 300,
      readTime: 4,
      isTrending: true,
      isFeatured: true,
      isExclusive: true,
      location: 'Нью-Йорк, США',
    },
    {
      id: '3',
      title: 'Spotify достиг 600 миллионов подписчиков',
      excerpt: 'Крупнейший стриминговый сервис сообщил о достижении нового рубежа в количестве активных пользователей по всему миру.',
      category: 'industry',
      tags: ['Spotify', 'подписчики', 'streaming'],
      image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=800&q=80',
      date: '8 часов назад',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      author: 'Сергей Бизнесов',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      source: 'Forbes',
      views: 9876,
      comments: 156,
      likes: 500,
      shares: 200,
      readTime: 3,
      location: 'Стокгольм, Швеция',
    },
    {
      id: '4',
      title: 'Российский рэпер Оксимирон выпустил новый трек',
      excerpt: 'Артист представил неожиданный релиз в коллаборации с продюсером Pharrell Williams. Трек уже занял первое место в чартах.',
      category: 'releases',
      tags: ['Оксимирон', 'трек', 'Pharrell'],
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      date: '12 часов назад',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      author: 'Мария Хип-Хоп',
      authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      source: 'MTV Russia',
      views: 18543,
      comments: 521,
      likes: 1000,
      shares: 400,
      readTime: 6,
      isBreaking: true,
      location: 'Майами, США',
    },
    {
      id: '5',
      title: 'Фестиваль Coachella 2026: объявлен полный лайнап',
      excerpt: 'Организаторы крупнейшего музыкального фестиваля раскрыли полный список хедлайнеров. Среди них Dua Lipa, Bad Bunny и Arctic Monkeys.',
      category: 'events',
      tags: ['Coachella', 'фестиваль', 'лайнап'],
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
      date: '1 день назад',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      author: 'Александр Ивентов',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      source: 'NME',
      views: 23456,
      comments: 678,
      likes: 1500,
      shares: 600,
      readTime: 7,
      isTrending: true,
      location: 'Индио, Калифорния',
    },
    {
      id: '6',
      title: 'Taylor Swift обновила рекорд Grammy',
      excerpt: 'Певица получила сразу 6 номинаций на престижную премию, став рекордсменкой по количеству номинаций за карьеру.',
      category: 'charts',
      tags: ['Taylor Swift', 'Grammy', 'рекорд'],
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      date: '1 день назад',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      author: 'Елена Премий',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
      source: 'People',
      views: 14321,
      comments: 298,
      likes: 700,
      shares: 350,
      readTime: 4,
      location: 'Лос-Анджелес, США',
    },
    {
      id: '7',
      title: 'Эксклюзивное интервью с Zivert о новом альбоме',
      excerpt: 'Российская поп-звезда рассказала о создании нового материала, сотрудничестве с мировыми продюсерами и личной жизни.',
      category: 'interviews',
      tags: ['Zivert', 'интервью', 'альбом'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      date: '2 дня назад',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      author: 'Игорь Журналист',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
      source: 'Vogue Russia',
      views: 11234,
      comments: 189,
      likes: 600,
      shares: 250,
      readTime: 8,
      isExclusive: true,
      location: 'Москва, Россия',
    },
    {
      id: '8',
      title: 'Детальная рецензия: новый альбом Arctic Monkeys',
      excerpt: 'Подробный разбор долгожданного релиза британской рок-группы. Анализ каждого трека, продюсирования и общей концепции альбома.',
      category: 'reviews',
      tags: ['Arctic Monkeys', 'рецензия', 'рок'],
      image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
      date: '2 дня назад',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      author: 'Ольга Критик',
      authorAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&q=80',
      source: 'Pitchfork',
      views: 8765,
      comments: 145,
      likes: 400,
      shares: 150,
      readTime: 10,
      location: 'Лондон, Великобритания',
    },
    {
      id: '9',
      title: 'Моргенштерн анонсировал громкое возвращение',
      excerpt: 'После годового перерыва артист объявил о начале работы над новым материалом и планирует серию концертов в СНГ.',
      category: 'artists',
      tags: ['Моргенштерн', 'концерты', 'СНГ'],
      image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80',
      date: '3 дня назад',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      author: 'Виктория Рэпинг',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
      source: 'MTV Russia',
      views: 19876,
      comments: 543,
      likes: 900,
      shares: 350,
      readTime: 5,
      isTrending: true,
      location: 'Москва, Россия',
    },
    {
      id: '10',
      title: 'AI в музыке: как нейросети меняют индустрию',
      excerpt: 'Искусственный интеллект всё активнее используется в создании музыки. Разбираем популярные AI-инструменты и их возможности.',
      category: 'industry',
      tags: ['AI', 'музыка', 'технологии'],
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      date: '4 дня назад',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      author: 'Андрей AI-эксперт',
      authorAvatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80',
      source: 'TechCrunch',
      views: 13456,
      comments: 267,
      likes: 600,
      shares: 250,
      readTime: 7,
      location: 'Силиконовая долина, США',
    },
    {
      id: '11',
      title: 'Русское Радио запустило революционный формат',
      excerpt: 'Крупнейшая радиостанция страны обновила концепцию и запустила интерактивные программы с участием слушателей.',
      category: 'events',
      tags: ['Русское Радио', 'формат', 'интерактив'],
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
      date: '5 дней назад',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      author: 'Светлана Радиовед',
      authorAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80',
      source: 'Radio Today',
      views: 6543,
      comments: 98,
      likes: 250,
      shares: 75,
      readTime: 4,
      location: 'Москва, Россия',
    },
    {
      id: '12',
      title: 'Drake выпустил surprise-альбом в полночь',
      excerpt: 'Канадский рэпер неожиданно дропнул новый проект без предварительных анонсов. Альбом уже взорвал соцсети.',
      category: 'releases',
      tags: ['Drake', 'альбом', 'surprise'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      date: '1 неделю назад',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      author: 'Тайрон Рэп',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
      source: 'XXL',
      views: 21345,
      comments: 678,
      likes: 1120,
      shares: 510,
      readTime: 5,
      isBreaking: true,
      isTrending: true,
      location: 'Торонто, Канада',
    },
    {
      id: '13',
      title: 'Скандал в индустрии: лейбл обвиняют в нечестных контрактах',
      excerpt: 'Группа артистов подала коллективный иск против крупного лейбла, обвиняя его в эксплуатации молодых музыкантов.',
      category: 'industry',
      tags: ['скандал', 'лейбл', 'контракты'],
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
      date: '1 неделю назад',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      author: 'Роман Расследователь',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      source: 'Variety',
      views: 17890,
      comments: 892,
      likes: 450,
      shares: 380,
      readTime: 9,
      isBreaking: true,
      location: 'Лос-Анджелес, США',
    },
    {
      id: '14',
      title: 'Daft Punk: слухи о возможном воссоединении',
      excerpt: 'Фанаты легендарного электронного дуэта обсуждают намёки на возвращение после загадочного поста в социальных сетях.',
      category: 'artists',
      tags: ['Daft Punk', 'воссоединение', 'электроника'],
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      date: '1 неделю назад',
      timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      author: 'Жан-Пьер Électro',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      source: 'Pitchfork',
      views: 28976,
      comments: 1234,
      likes: 2100,
      shares: 890,
      readTime: 6,
      isTrending: true,
      location: 'Париж, Франция',
    },
    {
      id: '15',
      title: 'Баста выпускает документальный фильм о карьере',
      excerpt: 'Российский рэпер представил трейлер фильма, охватывающего 20 лет его музыкальной деятельности.',
      category: 'artists',
      tags: ['Баста', 'документалка', 'фильм'],
      image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80',
      date: '1 неделю назад',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      author: 'Михаил Киномузыка',
      authorAvatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80',
      source: 'КиноПоиск',
      views: 15678,
      comments: 423,
      likes: 870,
      shares: 290,
      readTime: 5,
      location: 'Москва, Россия',
    },
    {
      id: '16',
      title: 'Яндекс Музыка запустила функцию AI-диджея',
      excerpt: 'Новая фича использует искусственный интеллект для создания персонализированных радиостанций и плейлистов.',
      category: 'industry',
      tags: ['Яндекс Музыка', 'AI', 'диджей'],
      image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80',
      date: '2 недели назад',
      timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      author: 'Алексей Техно',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      source: 'Хабр',
      views: 9876,
      comments: 234,
      likes: 560,
      shares: 180,
      readTime: 4,
      location: 'Москва, Россия',
    },
    {
      id: '17',
      title: 'Интервью: продюсер Metro Boomin о работе с топ-артистами',
      excerpt: 'Легендарный продюсер поделился секретами создания хитов для Drake, The Weeknd и 21 Savage.',
      category: 'interviews',
      tags: ['Metro Boomin', 'продюсер', 'хип-хоп'],
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
      date: '2 недели назад',
      timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      author: 'Кевин Beatmaker',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      source: 'Complex',
      views: 12345,
      comments: 398,
      likes: 780,
      shares: 340,
      readTime: 12,
      isExclusive: true,
      location: 'Атланта, США',
    },
    {
      id: '18',
      title: 'Рецензия: Gorillaz - Song Machine, Season Two',
      excerpt: 'Виртуальная группа возвращается с новым концептуальным проектом. Разбираем каждый трек и коллаборации.',
      category: 'reviews',
      tags: ['Gorillaz', 'альбом', 'рецензия'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      date: '2 недели назад',
      timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
      author: 'Дэвид Reviewer',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      source: 'NME',
      views: 7654,
      comments: 156,
      likes: 420,
      shares: 145,
      readTime: 8,
      location: 'Лондон, Великобритания',
    },
    {
      id: '19',
      title: 'Скриптонит выпустил клип на трек "2004"',
      excerpt: 'Казахстанский рэпер представил визуальную работу с отсылками к нулевым и ностальгией по прошлому.',
      category: 'releases',
      tags: ['Скриптонит', 'клип', '2004'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      date: '2 недели назад',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      author: 'Анна Видеоарт',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      source: 'The Flow',
      views: 16789,
      comments: 567,
      likes: 1340,
      shares: 450,
      readTime: 3,
      location: 'Алматы, Казахстан',
    },
    {
      id: '20',
      title: 'Grammy 2026: полный список номинантов',
      excerpt: '65-я церемония премии Grammy: объявлены все категории и номинанты. Лидирует Taylor Swift с 8 номинациями.',
      category: 'charts',
      tags: ['Grammy', 'номинации', '2026'],
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      date: '3 недели назад',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      author: 'Джессика Awards',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
      source: 'Grammy.com',
      views: 34567,
      comments: 987,
      likes: 1890,
      shares: 720,
      readTime: 15,
      location: 'Лос-Анджелес, США',
    },
    {
      id: '21',
      title: 'Интервью: Скриптонит о новом альбоме "Дом с нормальными явлениями"',
      excerpt: 'Эксклюзивное интервью с казахстанским рэпером о творческом процессе, философии и будущих планах.',
      category: 'interviews',
      tags: ['Скриптонит', 'альбом', 'философия'],
      image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80',
      date: '3 недели назад',
      timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      author: 'Тимур Глубина',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
      source: 'Esquire Russia',
      views: 13456,
      comments: 445,
      likes: 890,
      shares: 320,
      readTime: 11,
      isExclusive: true,
      location: 'Алматы, Казахстан',
    },
    {
      id: '22',
      title: 'Coldplay анонсировали финальный тур перед распадом',
      excerpt: 'Британская рок-группа объявила о последнем мировом турне перед завершением совместной деятельности.',
      category: 'events',
      tags: ['Coldplay', 'тур', 'прощание'],
      image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
      date: '3 недели назад',
      timestamp: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      author: 'Крис Рокер',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      source: 'The Guardian',
      views: 26789,
      comments: 1123,
      likes: 1560,
      shares: 670,
      readTime: 6,
      location: 'Лондон, Великобритания',
    },
    {
      id: '23',
      title: 'VK Музыка представила новый дизайн и функции',
      excerpt: 'Российский стриминговый сервис обновил интерфейс и добавил социальные функции для взаимодействия пользователей.',
      category: 'industry',
      tags: ['VK Музыка', 'обновление', 'дизайн'],
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
      date: '3 недели назад',
      timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      author: 'Евгений UX/UI',
      authorAvatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80',
      source: 'VC.ru',
      views: 8765,
      comments: 198,
      likes: 450,
      shares: 156,
      readTime: 5,
      location: 'Санкт-Петербург, Россия',
    },
    {
      id: '24',
      title: 'Рецензия: Kendrick Lamar - The Heart Part 6',
      excerpt: 'Детальный анализ нового EP от пулитцеровского лауреата. Лирика, продакшн и культурное значение.',
      category: 'reviews',
      tags: ['Kendrick Lamar', 'EP', 'рецензия'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      date: '3 недели назад',
      timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
      author: 'Маркус Критик',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      source: 'Pitchfork',
      views: 15432,
      comments: 678,
      likes: 1120,
      shares: 489,
      readTime: 14,
      location: 'Лос-Анджелес, США',
    },
    {
      id: '25',
      title: 'IOWA выпустили акустический альбом классических хитов',
      excerpt: 'Российская группа перезаписала свои главные треки в акустическом формате с оркестром.',
      category: 'releases',
      tags: ['IOWA', 'акустика', 'альбом'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      date: '4 недели назад',
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      author: 'Катерина Мелодия',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      source: 'Афиша',
      views: 11234,
      comments: 289,
      likes: 760,
      shares: 234,
      readTime: 4,
      location: 'Москва, Россия',
    },
    {
      id: '26',
      title: 'Metallica объявили даты концертов в России',
      excerpt: 'Легендарная метал-группа вернётся в Россию спустя 10 лет. Концерты пройдут в Москве и Санкт-Петербурге.',
      category: 'events',
      tags: ['Metallica', 'концерты', 'метал'],
      image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
      date: '4 недели назад',
      timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      author: 'Роберт Металл',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      source: 'Kerrang!',
      views: 18976,
      comments: 734,
      likes: 1450,
      shares: 567,
      readTime: 5,
      location: 'Сан-Франциско, США',
    },
    {
      id: '27',
      title: 'Apple Music достигла 100 миллионов платных подписчиков',
      excerpt: 'Стриминговый сервис Apple отчитался о достижении важной вехи и анонсировал новые функции.',
      category: 'industry',
      tags: ['Apple Music', 'подписчики', 'milestone'],
      image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=800&q=80',
      date: '4 недели назад',
      timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      author: 'Джонатан Tech',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      source: 'The Verge',
      views: 10567,
      comments: 234,
      likes: 589,
      shares: 198,
      readTime: 4,
      location: 'Купертино, США',
    },
    {
      id: '28',
      title: 'Rammstein выпустили клип с элементами виртуальной реальности',
      excerpt: 'Немецкая индастриал-группа представила инновационный музыкальный клип с поддержкой VR-технологий.',
      category: 'releases',
      tags: ['Rammstein', 'клип', 'VR'],
      image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80',
      date: '4 недели назад',
      timestamp: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      author: 'Ханс Видео',
      authorAvatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80',
      source: 'Metal Hammer',
      views: 14321,
      comments: 456,
      likes: 980,
      shares: 378,
      readTime: 6,
      location: 'Берлин, Германия',
    },
    {
      id: '29',
      title: 'Интервью: Noize MC о социальных темах в музыке',
      excerpt: 'Российский рэпер и певец рассказал о роли артиста в обществе и ответственности перед аудиторией.',
      category: 'interviews',
      tags: ['Noize MC', 'интервью', 'социум'],
      image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80',
      date: '1 месяц назад',
      timestamp: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
      author: 'Павел Мысль',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
      source: 'Медуза',
      views: 12789,
      comments: 567,
      likes: 890,
      shares: 345,
      readTime: 13,
      isExclusive: true,
      location: 'Москва, Россия',
    },
    {
      id: '30',
      title: 'Рецензия: Bad Bunny - Nadie Sabe Lo Que Va a Pasar Mañana',
      excerpt: 'Пуэрториканский суперстар выпустил новый альбом. Разбираем латинский трэп и влияние на мировую культуру.',
      category: 'reviews',
      tags: ['Bad Bunny', 'reggaeton', 'латино'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      date: '1 месяц назад',
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      author: 'Карлос Música',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      source: 'Billboard',
      views: 19876,
      comments: 789,
      likes: 1345,
      shares: 567,
      readTime: 9,
      location: 'Сан-Хуан, Пуэрто-Рико',
    },
  ];

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

      {/* Promo.music News from Server */}
      {serverNews && serverNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-[#FF577F]/5 to-purple-500/5 border border-[#FF577F]/20 rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-3 xs:mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs xs:text-sm font-bold text-[#FF577F]">Новости Promo.music</span>
              <span className="hidden xs:inline text-[10px] text-emerald-400/70 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Wifi className="w-2.5 h-2.5 inline mr-1" />Сервер
              </span>
            </div>
            <span className="text-[10px] xs:text-xs text-slate-500">{serverNews.length} новостей</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3">
            {serverNews.slice(0, 6).map((news: LandingNews, i: number) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-start gap-2.5 xs:gap-3 p-2 xs:p-2.5 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer group"
              >
                {news.artistAvatar && (
                  <ImageWithFallback
                    src={news.artistAvatar}
                    alt={news.artistName || ''}
                    className="w-8 h-8 xs:w-10 xs:h-10 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-[10px] xs:text-xs sm:text-sm font-bold line-clamp-2 group-hover:text-[#FF577F] transition-colors leading-snug">
                    {news.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] xs:text-[10px] text-[#FF577F] font-semibold">{news.tag}</span>
                    <span className="text-[9px] xs:text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Eye className="w-2.5 h-2.5" />{news.views > 1000 ? `${(news.views / 1000).toFixed(1)}K` : news.views}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      {newsLoading && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Загрузка новостей Promo.music...
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
            <button className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-red-500 hover:text-red-400 font-bold whitespace-nowrap flex-shrink-0">
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

                <button className="absolute top-1.5 xs:top-2 right-1.5 xs:right-2 w-6 h-6 xs:w-7 xs:h-7 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
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
                  <button className="px-2 xs:px-2.5 py-1 xs:py-1.5 bg-white/5 hover:bg-white/10 rounded-md xs:rounded-lg transition-colors">
                    <Share2 className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                  </button>
                  <button className="px-2 xs:px-2.5 py-1 xs:py-1.5 bg-white/5 hover:bg-white/10 rounded-md xs:rounded-lg transition-colors">
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
