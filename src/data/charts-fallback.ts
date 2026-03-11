/**
 * Fallback-данные для чартов радиостанций и стриминговых платформ
 *
 * Используются только когда API не возвращает данные.
 * Обновляются по мере необходимости.
 *
 * Последнее обновление: 2026-03-10
 */

export interface FallbackChartTrack {
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

export interface FallbackChartSource {
  id: string;
  name: string;
  logo: string;
  type: 'radio' | 'streaming';
  gradient: string;
  borderColor: string;
  tracks: FallbackChartTrack[];
}

export const promoFallbackTracks: FallbackChartTrack[] = [
  { id: 'pm-1', position: 1, previousPosition: 2, title: 'Огни города', artist: 'Сандра', plays: 354000, likes: 12400, trend: 'up', trendValue: 1 },
  { id: 'pm-2', position: 2, previousPosition: 1, title: 'FLEX', artist: 'Тимур', plays: 312000, likes: 10800, trend: 'down', trendValue: 1 },
  { id: 'pm-3', position: 3, previousPosition: 5, title: 'Neon Dreams', artist: 'Дэн', plays: 298000, likes: 9900, trend: 'up', trendValue: 2 },
  { id: 'pm-4', position: 4, previousPosition: 3, title: 'Ночные волны', artist: 'Стелла', plays: 267000, likes: 8700, trend: 'down', trendValue: 1 },
  { id: 'pm-5', position: 5, previousPosition: 7, title: 'На бите', artist: 'Максам', plays: 245000, likes: 7800, trend: 'up', trendValue: 2 },
  { id: 'pm-6', position: 6, previousPosition: 4, title: 'Midnight Soul', artist: 'Лиана', plays: 215000, likes: 7200, trend: 'down', trendValue: 2 },
  { id: 'pm-7', position: 7, previousPosition: 8, title: 'Feel the Groove', artist: 'Марк', plays: 187000, likes: 6400, trend: 'up', trendValue: 1 },
  { id: 'pm-8', position: 8, previousPosition: 6, title: 'Signal', artist: 'Ева', plays: 167000, likes: 5800, trend: 'down', trendValue: 2 },
  { id: 'pm-9', position: 9, previousPosition: 10, title: 'Мост', artist: 'Роман', plays: 145000, likes: 4900, trend: 'up', trendValue: 1 },
  { id: 'pm-10', position: 10, previousPosition: 9, title: 'Rainy Afternoon', artist: 'Артём', plays: 134000, likes: 4300, trend: 'down', trendValue: 1 },
];

export const fallbackChartSources: Omit<FallbackChartSource, 'tracks'>[] = [
  {
    id: 'russkoe',
    name: 'Русское Радио',
    logo: '🇷🇺',
    type: 'radio',
    gradient: 'from-red-500/20 to-blue-500/20',
    borderColor: 'border-red-500/30',
  },
  {
    id: 'nashe',
    name: 'Наше Радио',
    logo: '🎸',
    type: 'radio',
    gradient: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/30',
  },
  {
    id: 'dfm',
    name: 'DFM',
    logo: '🔊',
    type: 'radio',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
  },
  {
    id: 'europa',
    name: 'Europa Plus',
    logo: '🌟',
    type: 'radio',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-yellow-500/30',
  },
  {
    id: 'yandex',
    name: 'Яндекс Музыка',
    logo: '🔴',
    type: 'streaming',
    gradient: 'from-red-600/20 to-yellow-600/20',
    borderColor: 'border-red-600/30',
  },
  {
    id: 'shazam',
    name: 'Shazam Россия',
    logo: '🎤',
    type: 'streaming',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
  },
];

export const fallbackChartTracks: Record<string, FallbackChartTrack[]> = {
  russkoe: [
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
  ],
  nashe: [
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
  ],
  dfm: [
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
  ],
  europa: [
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
  ],
  yandex: [
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
  ],
  shazam: [
    { id: '1', position: 1, previousPosition: 2, title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', plays: 89000000, trend: 'up', trendValue: 1 },
    { id: '2', position: 2, previousPosition: 1, title: 'APT.', artist: 'ROSÉ & Bruno Mars', plays: 85000000, trend: 'down', trendValue: 1 },
    { id: '3', position: 3, previousPosition: 5, title: 'Тону', artist: 'HOLLYFLAME', plays: 78000000, trend: 'up', trendValue: 2 },
    { id: '4', position: 4, previousPosition: 3, title: 'BIRDS OF A FEATHER', artist: 'Billie Eilish', plays: 72000000, trend: 'down', trendValue: 1 },
    { id: '5', position: 5, previousPosition: 0, title: 'Люби меня', artist: 'ANNA ASTI', plays: 65000000, trend: 'new', trendValue: 0 },
    { id: '6', position: 6, previousPosition: 4, title: 'Сияй', artist: 'MACAN', plays: 60000000, trend: 'down', trendValue: 2 },
    { id: '7', position: 7, previousPosition: 9, title: 'Последний танец', artist: 'KESHI', plays: 55000000, trend: 'up', trendValue: 2 },
    { id: '8', position: 8, previousPosition: 7, title: "That's So True", artist: 'Gracie Abrams', plays: 50000000, trend: 'down', trendValue: 1 },
    { id: '9', position: 9, previousPosition: 6, title: 'Luther', artist: 'Kendrick Lamar', plays: 45000000, trend: 'down', trendValue: 3 },
    { id: '10', position: 10, previousPosition: 12, title: 'Toxic', artist: 'BoyWithUke', plays: 40000000, trend: 'up', trendValue: 2 },
  ],
};
