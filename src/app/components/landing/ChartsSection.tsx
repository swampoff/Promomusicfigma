import { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, TrendingDown, Music, Play, Heart, Share2, Crown, Flame, Star, Globe, Calendar, Filter, ArrowUp, ArrowDown, Minus, Eye, Headphones, Radio } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface ChartTrack {
  id: string;
  position: number;
  previousPosition: number;
  title: string;
  artist: string;
  plays?: number;
  likes?: number;
  trend: 'up' | 'down' | 'same' | 'new';
  trendValue: number;
}

interface ChartSource {
  id: string;
  name: string;
  logo: string;
  type: 'radio' | 'streaming';
  gradient: string;
  borderColor: string;
  tracks: ChartTrack[];
}

export function ChartsSection() {
  const [selectedChart, setSelectedChart] = useState<string>('russkoe');

  // Данные чартов от разных источников
  const chartSources: ChartSource[] = [
    {
      id: 'russkoe',
      name: 'Русское Радио',
      logo: '🇷🇺',
      type: 'radio',
      gradient: 'from-red-500/20 to-blue-500/20',
      borderColor: 'border-red-500/30',
      tracks: [
        { id: '1', position: 1, previousPosition: 2, title: 'Малиновый закат', artist: 'Нюша', trend: 'up', trendValue: 1 },
        { id: '2', position: 2, previousPosition: 1, title: 'Мало половин', artist: 'Макс Барских', trend: 'down', trendValue: 1 },
        { id: '3', position: 3, previousPosition: 5, title: 'Я буду', artist: 'Артур Пирожков', trend: 'up', trendValue: 2 },
        { id: '4', position: 4, previousPosition: 3, title: 'Пьяный туман', artist: 'Елена Темникова', trend: 'down', trendValue: 1 },
        { id: '5', position: 5, previousPosition: 0, title: 'Безответная любовь', artist: 'Zivert', trend: 'new', trendValue: 0 },
        { id: '6', position: 6, previousPosition: 4, title: 'Шампанское', artist: 'Мот', trend: 'down', trendValue: 2 },
        { id: '7', position: 7, previousPosition: 9, title: 'Ты моя', artist: 'Дима Билан', trend: 'up', trendValue: 2 },
        { id: '8', position: 8, previousPosition: 7, title: 'Мой мармеладный', artist: 'Катя Лель', trend: 'down', trendValue: 1 },
        { id: '9', position: 9, previousPosition: 6, title: 'До утра', artist: 'Баста', trend: 'down', trendValue: 3 },
        { id: '10', position: 10, previousPosition: 12, title: 'Лето', artist: 'Елка', trend: 'up', trendValue: 2 },
      ]
    },
    {
      id: 'nashe',
      name: 'Наше Радио',
      logo: '🎸',
      type: 'radio',
      gradient: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/30',
      tracks: [
        { id: '1', position: 1, previousPosition: 1, title: 'Группа крови', artist: 'Кино', trend: 'same', trendValue: 0 },
        { id: '2', position: 2, previousPosition: 3, title: 'Лето', artist: 'ДДТ', trend: 'up', trendValue: 1 },
        { id: '3', position: 3, previousPosition: 2, title: 'Звезда по имени Солнце', artist: 'Кино', trend: 'down', trendValue: 1 },
        { id: '4', position: 4, previousPosition: 6, title: 'Владивосток 2000', artist: 'Мумий Тролль', trend: 'up', trendValue: 2 },
        { id: '5', position: 5, previousPosition: 4, title: 'Хочу перемен', artist: 'Кино', trend: 'down', trendValue: 1 },
        { id: '6', position: 6, previousPosition: 0, title: 'Танцуй', artist: 'Земфира', trend: 'new', trendValue: 0 },
        { id: '7', position: 7, previousPosition: 5, title: 'Осень', artist: 'ДДТ', trend: 'down', trendValue: 2 },
        { id: '8', position: 8, previousPosition: 10, title: 'Экспонат', artist: 'Ленинград', trend: 'up', trendValue: 2 },
        { id: '9', position: 9, previousPosition: 7, title: 'На заре', artist: 'Альянс', trend: 'down', trendValue: 2 },
        { id: '10', position: 10, previousPosition: 8, title: 'Романс', artist: 'Сплин', trend: 'down', trendValue: 2 },
      ]
    },
    {
      id: 'maximum',
      name: 'Радио Максимум',
      logo: '🎵',
      type: 'radio',
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      tracks: [
        { id: '1', position: 1, previousPosition: 2, title: 'Believer', artist: 'Imagine Dragons', trend: 'up', trendValue: 1 },
        { id: '2', position: 2, previousPosition: 1, title: 'Thunderstruck', artist: 'AC/DC', trend: 'down', trendValue: 1 },
        { id: '3', position: 3, previousPosition: 4, title: 'Enter Sandman', artist: 'Metallica', trend: 'up', trendValue: 1 },
        { id: '4', position: 4, previousPosition: 3, title: 'Smells Like Teen Spirit', artist: 'Nirvana', trend: 'down', trendValue: 1 },
        { id: '5', position: 5, previousPosition: 0, title: 'Radioactive', artist: 'Imagine Dragons', trend: 'new', trendValue: 0 },
        { id: '6', position: 6, previousPosition: 7, title: 'The Pretender', artist: 'Foo Fighters', trend: 'up', trendValue: 1 },
        { id: '7', position: 7, previousPosition: 5, title: 'Enjoy the Silence', artist: 'Depeche Mode', trend: 'down', trendValue: 2 },
        { id: '8', position: 8, previousPosition: 6, title: 'Wonderwall', artist: 'Oasis', trend: 'down', trendValue: 2 },
        { id: '9', position: 9, previousPosition: 11, title: 'Boulevard of Broken Dreams', artist: 'Green Day', trend: 'up', trendValue: 2 },
        { id: '10', position: 10, previousPosition: 8, title: 'Seven Nation Army', artist: 'The White Stripes', trend: 'down', trendValue: 2 },
      ]
    },
    {
      id: 'dfm',
      name: 'DFM',
      logo: '🔊',
      type: 'radio',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30',
      tracks: [
        { id: '1', position: 1, previousPosition: 1, title: 'Blinding Lights', artist: 'The Weeknd', trend: 'same', trendValue: 0 },
        { id: '2', position: 2, previousPosition: 4, title: 'Levitating', artist: 'Dua Lipa', trend: 'up', trendValue: 2 },
        { id: '3', position: 3, previousPosition: 2, title: 'Starboy', artist: 'The Weeknd', trend: 'down', trendValue: 1 },
        { id: '4', position: 4, previousPosition: 0, title: 'Heat Waves', artist: 'Glass Animals', trend: 'new', trendValue: 0 },
        { id: '5', position: 5, previousPosition: 3, title: 'Save Your Tears', artist: 'The Weeknd', trend: 'down', trendValue: 2 },
        { id: '6', position: 6, previousPosition: 8, title: 'Flowers', artist: 'Miley Cyrus', trend: 'up', trendValue: 2 },
        { id: '7', position: 7, previousPosition: 5, title: 'As It Was', artist: 'Harry Styles', trend: 'down', trendValue: 2 },
        { id: '8', position: 8, previousPosition: 6, title: 'Unholy', artist: 'Sam Smith', trend: 'down', trendValue: 2 },
        { id: '9', position: 9, previousPosition: 12, title: 'Anti-Hero', artist: 'Taylor Swift', trend: 'up', trendValue: 3 },
        { id: '10', position: 10, previousPosition: 7, title: 'Kill Bill', artist: 'SZA', trend: 'down', trendValue: 3 },
      ]
    },
    {
      id: 'europa',
      name: 'Europa Plus',
      logo: '🌟',
      type: 'radio',
      gradient: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      tracks: [
        { id: '1', position: 1, previousPosition: 3, title: 'Calm Down', artist: 'Rema & Selena Gomez', trend: 'up', trendValue: 2 },
        { id: '2', position: 2, previousPosition: 1, title: 'Vampire', artist: 'Olivia Rodrigo', trend: 'down', trendValue: 1 },
        { id: '3', position: 3, previousPosition: 2, title: 'Cruel Summer', artist: 'Taylor Swift', trend: 'down', trendValue: 1 },
        { id: '4', position: 4, previousPosition: 0, title: 'Paint The Town Red', artist: 'Doja Cat', trend: 'new', trendValue: 0 },
        { id: '5', position: 5, previousPosition: 4, title: 'Snooze', artist: 'SZA', trend: 'down', trendValue: 1 },
        { id: '6', position: 6, previousPosition: 7, title: 'Greedy', artist: 'Tate McRae', trend: 'up', trendValue: 1 },
        { id: '7', position: 7, previousPosition: 5, title: 'Water', artist: 'Tyla', trend: 'down', trendValue: 2 },
        { id: '8', position: 8, previousPosition: 9, title: 'Houdini', artist: 'Dua Lipa', trend: 'up', trendValue: 1 },
        { id: '9', position: 9, previousPosition: 6, title: 'Yes, And?', artist: 'Ariana Grande', trend: 'down', trendValue: 3 },
        { id: '10', position: 10, previousPosition: 11, title: 'Fortnight', artist: 'Taylor Swift', trend: 'up', trendValue: 1 },
      ]
    },
    {
      id: 'yandex',
      name: 'Яндекс Музыка',
      logo: '🔴',
      type: 'streaming',
      gradient: 'from-red-600/20 to-yellow-600/20',
      borderColor: 'border-red-600/30',
      tracks: [
        { id: '1', position: 1, previousPosition: 1, title: 'Мокрые кроссы', artist: 'Тима Белорусских', plays: 45678900, likes: 1234567, trend: 'same', trendValue: 0 },
        { id: '2', position: 2, previousPosition: 3, title: 'Малиновая Лада', artist: 'Моргенштерн', plays: 43567800, likes: 1123456, trend: 'up', trendValue: 1 },
        { id: '3', position: 3, previousPosition: 2, title: 'Черная любовь', artist: 'Zivert', plays: 42456700, likes: 1012345, trend: 'down', trendValue: 1 },
        { id: '4', position: 4, previousPosition: 0, title: 'Лавандос', artist: 'Niletto', plays: 41345600, likes: 901234, trend: 'new', trendValue: 0 },
        { id: '5', position: 5, previousPosition: 4, title: 'Антидепрессанты', artist: 'GONE.Fludd', plays: 40234500, likes: 890123, trend: 'down', trendValue: 1 },
        { id: '6', position: 6, previousPosition: 8, title: 'Тает лёд', artist: 'Грибы', plays: 39123400, likes: 789012, trend: 'up', trendValue: 2 },
        { id: '7', position: 7, previousPosition: 5, title: 'Плачу на техно', artist: 'Cream Soda', plays: 38012300, likes: 678901, trend: 'down', trendValue: 2 },
        { id: '8', position: 8, previousPosition: 6, title: 'Intro', artist: 'Miyagi & Andy Panda', plays: 36901200, likes: 567890, trend: 'down', trendValue: 2 },
        { id: '9', position: 9, previousPosition: 11, title: 'Романс', artist: 'Макс Корж', plays: 35790100, likes: 456789, trend: 'up', trendValue: 2 },
        { id: '10', position: 10, previousPosition: 7, title: 'Под подошвой', artist: 'Скриптонит', plays: 34679000, likes: 345678, trend: 'down', trendValue: 3 },
      ]
    },
    {
      id: 'vk',
      name: 'VK Музыка',
      logo: '🎧',
      type: 'streaming',
      gradient: 'from-blue-600/20 to-indigo-600/20',
      borderColor: 'border-blue-600/30',
      tracks: [
        { id: '1', position: 1, previousPosition: 2, title: 'Бессоница', artist: 'JONY', plays: 52345600, likes: 1456789, trend: 'up', trendValue: 1 },
        { id: '2', position: 2, previousPosition: 1, title: 'Темнота', artist: 'HammAli & Navai', plays: 51234500, likes: 1345678, trend: 'down', trendValue: 1 },
        { id: '3', position: 3, previousPosition: 4, title: 'Я буду ебать', artist: 'Грибы', plays: 50123400, likes: 1234567, trend: 'up', trendValue: 1 },
        { id: '4', position: 4, previousPosition: 3, title: 'Малолетка', artist: 'CYGO', plays: 49012300, likes: 1123456, trend: 'down', trendValue: 1 },
        { id: '5', position: 5, previousPosition: 0, title: 'Карие глаза', artist: 'Artik & Asti', plays: 47901200, likes: 1012345, trend: 'new', trendValue: 0 },
        { id: '6', position: 6, previousPosition: 5, title: 'Таптал', artist: 'Miyagi & Andy Panda', plays: 46790100, likes: 901234, trend: 'down', trendValue: 1 },
        { id: '7', position: 7, previousPosition: 9, title: 'Патимейкер', artist: 'Тима Белорусских', plays: 45679000, likes: 890123, trend: 'up', trendValue: 2 },
        { id: '8', position: 8, previousPosition: 6, title: 'Пика', artist: 'Танцы', plays: 44567800, likes: 789012, trend: 'down', trendValue: 2 },
        { id: '9', position: 9, previousPosition: 7, title: 'Фантазер', artist: 'Polnalyubvi', plays: 43456700, likes: 678901, trend: 'down', trendValue: 2 },
        { id: '10', position: 10, previousPosition: 12, title: 'Дисконнект', artist: 'Скриптонит', plays: 42345600, likes: 567890, trend: 'up', trendValue: 2 },
      ]
    },
    {
      id: 'spotify',
      name: 'Spotify',
      logo: '💚',
      type: 'streaming',
      gradient: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      tracks: [
        { id: '1', position: 1, previousPosition: 1, title: 'Cruel Summer', artist: 'Taylor Swift', plays: 987654300, likes: 45678900, trend: 'same', trendValue: 0 },
        { id: '2', position: 2, previousPosition: 3, title: 'Paint The Town Red', artist: 'Doja Cat', plays: 976543200, likes: 44567800, trend: 'up', trendValue: 1 },
        { id: '3', position: 3, previousPosition: 2, title: 'Greedy', artist: 'Tate McRae', plays: 965432100, likes: 43456700, trend: 'down', trendValue: 1 },
        { id: '4', position: 4, previousPosition: 0, title: 'Stick Season', artist: 'Noah Kahan', plays: 954321000, likes: 42345600, trend: 'new', trendValue: 0 },
        { id: '5', position: 5, previousPosition: 4, title: 'Vampire', artist: 'Olivia Rodrigo', plays: 943209800, likes: 41234500, trend: 'down', trendValue: 1 },
        { id: '6', position: 6, previousPosition: 7, title: 'Is It Over Now?', artist: 'Taylor Swift', plays: 932098700, likes: 40123400, trend: 'up', trendValue: 1 },
        { id: '7', position: 7, previousPosition: 5, title: 'Snooze', artist: 'SZA', plays: 920987600, likes: 39012300, trend: 'down', trendValue: 2 },
        { id: '8', position: 8, previousPosition: 6, title: 'Lovin On Me', artist: 'Jack Harlow', plays: 909876500, likes: 37901200, trend: 'down', trendValue: 2 },
        { id: '9', position: 9, previousPosition: 11, title: 'What Was I Made For?', artist: 'Billie Eilish', plays: 898765400, likes: 36790100, trend: 'up', trendValue: 2 },
        { id: '10', position: 10, previousPosition: 8, title: 'Flowers', artist: 'Miley Cyrus', plays: 887654300, likes: 35679000, trend: 'down', trendValue: 2 },
      ]
    },
  ];

  const currentChart = chartSources.find(c => c.id === selectedChart) || chartSources[0];

  const getTrendIcon = (trend: ChartTrack['trend'], value: number) => {
    if (trend === 'new') return <Star className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" />;
    if (trend === 'up') return <ArrowUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-green-400" />;
    if (trend === 'down') return <ArrowDown className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-red-400" />;
    return <Minus className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-slate-500" />;
  };

  const getTrendColor = (trend: ChartTrack['trend']) => {
    if (trend === 'new') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (trend === 'up') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (trend === 'down') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const formatNumber = (num?: number) => {
    if (!num) return '';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Статистика
  const totalCharts = chartSources.length;
  const radioCharts = chartSources.filter(c => c.type === 'radio').length;
  const streamingCharts = chartSources.filter(c => c.type === 'streaming').length;
  const totalTracks = chartSources.reduce((acc, chart) => acc + chart.tracks.length, 0);

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-2 xs:mb-3 md:mb-4 text-display leading-tight">
          Музыкальные чарты
        </h1>
        <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed">
          ТОП-10 треков от радиостанций и стриминговых сервисов
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#FF577F]/10 to-purple-500/10 border border-[#FF577F]/20 rounded-xl xs:rounded-2xl lg:rounded-3xl p-3 xs:p-4 sm:p-5 lg:p-6"
        >
          <BarChart3 className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-[#FF577F] mb-1.5 xs:mb-2 sm:mb-3" />
          <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-mono mb-0.5 xs:mb-1">{totalCharts}</p>
          <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400">Чартов</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl xs:rounded-2xl lg:rounded-3xl p-3 xs:p-4 sm:p-5 lg:p-6"
        >
          <Radio className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-400 mb-1.5 xs:mb-2 sm:mb-3" />
          <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-mono mb-0.5 xs:mb-1">{radioCharts}</p>
          <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400">Радиостанций</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl xs:rounded-2xl lg:rounded-3xl p-3 xs:p-4 sm:p-5 lg:p-6"
        >
          <Headphones className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-green-400 mb-1.5 xs:mb-2 sm:mb-3" />
          <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-mono mb-0.5 xs:mb-1">{streamingCharts}</p>
          <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400">Стримингов</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl xs:rounded-2xl lg:rounded-3xl p-3 xs:p-4 sm:p-5 lg:p-6"
        >
          <Music className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-yellow-400 mb-1.5 xs:mb-2 sm:mb-3" />
          <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-mono mb-0.5 xs:mb-1">{totalTracks}</p>
          <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400">Всего треков</p>
        </motion.div>
      </div>

      {/* Chart Source Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 xs:gap-2.5 mb-3 xs:mb-4">
          <Filter className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-slate-400" />
          <span className="text-xs xs:text-sm sm:text-base font-bold text-slate-400">Выберите чарт:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-1.5 xs:gap-2 sm:gap-2.5">
          {chartSources.map((chart) => (
            <motion.button
              key={chart.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedChart(chart.id)}
              className={`flex flex-col items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-4 rounded-xl xs:rounded-2xl transition-all border ${
                selectedChart === chart.id
                  ? `bg-gradient-to-br ${chart.gradient} ${chart.borderColor} shadow-md`
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-xl xs:text-2xl sm:text-3xl">{chart.logo}</span>
              <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-center leading-tight">{chart.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* TOP 3 Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-2 xs:gap-3 sm:gap-4"
      >
        {currentChart.tracks.slice(0, 3).map((track, index) => (
          <motion.div
            key={track.id}
            whileHover={{ scale: 1.03, y: -5 }}
            className={`relative bg-gradient-to-br ${
              index === 0 ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' :
              index === 1 ? 'from-slate-400/20 to-slate-500/20 border-slate-400/30' :
              'from-amber-600/20 to-amber-700/20 border-amber-600/30'
            } border rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-5 cursor-pointer`}
          >
            <div className="absolute top-2 xs:top-3 right-2 xs:right-3">
              {index === 0 && <Crown className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-yellow-400" fill="currentColor" />}
              {index === 1 && <Crown className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-slate-400" fill="currentColor" />}
              {index === 2 && <Crown className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-amber-600" fill="currentColor" />}
            </div>
            <div className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black opacity-20 mb-2 xs:mb-3">#{index + 1}</div>
            <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-black mb-1 leading-tight">{track.title}</h3>
            <p className="text-xs xs:text-sm text-slate-400 mb-2 xs:mb-3">{track.artist}</p>
            {track.plays && (
              <div className="flex items-center gap-2 xs:gap-3 text-[10px] xs:text-xs">
                <span className="flex items-center gap-1">
                  <Play className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                  {formatNumber(track.plays)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                  {formatNumber(track.likes)}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Chart Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className={`bg-gradient-to-br ${currentChart.gradient} border ${currentChart.borderColor} rounded-xl xs:rounded-2xl lg:rounded-3xl overflow-hidden`}
      >
        {/* Chart Header */}
        <div className="bg-white/5 border-b border-white/10 p-3 xs:p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
            <span className="text-3xl xs:text-4xl sm:text-5xl">{currentChart.logo}</span>
            <div>
              <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black">{currentChart.name}</h2>
              <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400">
                {currentChart.type === 'radio' ? 'Радиостанция' : 'Стриминговый сервис'} • ТОП-10
              </p>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {currentChart.tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              className="grid grid-cols-12 gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4 lg:p-5 cursor-pointer items-center group"
            >
              {/* Position */}
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1 xs:gap-2">
                  {track.position <= 3 && (
                    <Crown className={`w-3 h-3 xs:w-4 xs:h-4 ${
                      track.position === 1 ? 'text-yellow-400' :
                      track.position === 2 ? 'text-slate-400' :
                      'text-amber-600'
                    }`} fill="currentColor" />
                  )}
                  <span className="text-sm xs:text-base sm:text-lg md:text-xl font-black font-mono">{track.position}</span>
                </div>
              </div>

              {/* Trend */}
              <div className="col-span-2 sm:col-span-1">
                <div className={`inline-flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full border ${getTrendColor(track.trend)}`}>
                  {getTrendIcon(track.trend, track.trendValue)}
                  {track.trendValue > 0 && <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold">{track.trendValue}</span>}
                </div>
              </div>

              {/* Track Info */}
              <div className="col-span-8 sm:col-span-6 md:col-span-7 lg:col-span-8">
                <h4 className="text-xs xs:text-sm sm:text-base md:text-lg font-bold mb-0.5 xs:mb-1 group-hover:text-[#FF577F] transition-colors leading-tight">
                  {track.title}
                </h4>
                <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400">{track.artist}</p>
              </div>

              {/* Stats - только для стриминговых сервисов на больших экранах */}
              {track.plays && (
                <div className="hidden md:flex col-span-3 lg:col-span-2 items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Play className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-mono font-bold">{formatNumber(track.plays)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-green-400" />
                    <span className="font-mono font-bold">{formatNumber(track.likes)}</span>
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-[#FF577F]/10 to-purple-500/10 border border-[#FF577F]/20 rounded-xl xs:rounded-2xl lg:rounded-3xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 cursor-pointer"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-2 xs:mb-2.5 sm:mb-3 justify-center md:justify-start">
              <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-[#FF577F]" />
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black">Попади в чарты</h3>
            </div>
            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-slate-400 leading-relaxed">
              Загрузи трек на платформу и получи шанс попасть в TOP-10 радиостанций
            </p>
          </div>
          <Button className="bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 py-3 xs:py-4 sm:py-5 md:py-6 lg:py-7 rounded-full text-xs xs:text-sm sm:text-base md:text-lg shadow-md shadow-[#FF577F]/10 whitespace-nowrap">
            Загрузить трек
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
