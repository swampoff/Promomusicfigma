/**
 * DEMO DATA SEED
 * Заполняет KV store демо-данными 12 артистов Promo.music при первом запуске
 * Идемпотентно - не перезаписывает существующие данные
 */

import * as kv from './kv-utils.tsx';

const SEED_FLAG_KEY = 'system:demo_seed_v8';

// 12 демо-артистов Promo.music
const DEMO_ARTISTS = [
  {
    id: 'artist-sandra',
    name: 'Сандра',
    slug: 'sandra',
    genre: 'Pop',
    city: 'Москва',
    bio: 'Поп-артистка с мощным вокалом и танцевальными хитами. Выпускница Гнесинки, участница шоу "Голос".',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=400&fit=crop',
    subscribers: 45200,
    monthlyListeners: 128000,
    totalPlays: 3540000,
    isVerified: true,
    socialLinks: { instagram: '@sandra_music', vk: 'sandra_music', telegram: '@sandra_promo' },
    accentColor: '#FF577F',
  },
  {
    id: 'artist-liana',
    name: 'Лиана',
    slug: 'liana',
    genre: 'R&B',
    city: 'Санкт-Петербург',
    bio: 'R&B вокалистка с уникальным тембром. Журналист и пресс-атташе музыкальных фестивалей.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop',
    subscribers: 32100,
    monthlyListeners: 89000,
    totalPlays: 2150000,
    isVerified: true,
    socialLinks: { instagram: '@liana_press', telegram: '@liana_rnb' },
    accentColor: '#f43f5e',
  },
  {
    id: 'artist-dan',
    name: 'Дэн',
    slug: 'dan',
    genre: 'Electronic',
    city: 'Казань',
    bio: 'DJ и продюсер электронной музыки. Резидент клуба MOSAIQUE, организатор фестиваля "Волны".',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&h=400&fit=crop',
    subscribers: 67800,
    monthlyListeners: 215000,
    totalPlays: 5890000,
    isVerified: true,
    socialLinks: { instagram: '@dj_dan_kazan', telegram: '@dan_electronic' },
    accentColor: '#3b82f6',
  },
  {
    id: 'artist-maxam',
    name: 'Максам',
    slug: 'maxam',
    genre: 'Hip-Hop',
    city: 'Новосибирск',
    bio: 'Продюсер и битмейкер. Работал с топовыми артистами СНГ, создатель лейбла MAXAM Records.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    subscribers: 91200,
    monthlyListeners: 342000,
    totalPlays: 12400000,
    isVerified: true,
    socialLinks: { instagram: '@maxam_producer', vk: 'maxam_records' },
    accentColor: '#06b6d4',
  },
  {
    id: 'artist-mark',
    name: 'Марк',
    slug: 'mark',
    genre: 'House',
    city: 'Екатеринбург',
    bio: 'DJ, маркетолог и амбассадор электронной сцены Урала. Организатор серии вечеринок NEON.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop',
    subscribers: 28500,
    monthlyListeners: 76000,
    totalPlays: 1870000,
    isVerified: true,
    socialLinks: { instagram: '@mark_neon_dj', telegram: '@mark_marketing' },
    accentColor: '#FF577F',
  },
  {
    id: 'artist-stella',
    name: 'Стелла',
    slug: 'stella',
    genre: 'Dance',
    city: 'Краснодар',
    bio: 'Радиоведущая и DJ. Ведёт шоу "Ночные Волны" на Radio Promo.air, лицо южной dance-сцены.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&h=400&fit=crop',
    subscribers: 53600,
    monthlyListeners: 167000,
    totalPlays: 4210000,
    isVerified: true,
    socialLinks: { instagram: '@stella_radio', telegram: '@stella_dj' },
    accentColor: '#a855f7',
  },
  {
    id: 'artist-nika',
    name: 'Ника',
    slug: 'nika',
    genre: 'Indie',
    city: 'Москва',
    bio: 'Инди-артистка, мультиинструменталистка. Пишет песни на русском и английском, играет на укулеле.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=400&fit=crop',
    subscribers: 18900,
    monthlyListeners: 52000,
    totalPlays: 890000,
    isVerified: false,
    socialLinks: { instagram: '@nika_indie' },
    accentColor: '#10b981',
  },
  {
    id: 'artist-roman',
    name: 'Роман',
    slug: 'roman',
    genre: 'Rock',
    city: 'Самара',
    bio: 'Рок-музыкант, вокалист группы "Мост". Гитарист, автор текстов, лидер самарского андеграунда.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&h=400&fit=crop',
    subscribers: 24300,
    monthlyListeners: 68000,
    totalPlays: 1450000,
    isVerified: true,
    socialLinks: { instagram: '@roman_rock', vk: 'most_band' },
    accentColor: '#ef4444',
  },
  {
    id: 'artist-alisa',
    name: 'Алиса',
    slug: 'alisa',
    genre: 'Jazz',
    city: 'Москва',
    bio: 'Джазовая вокалистка с академическим образованием. Выступает в лучших джаз-клубах столицы.',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=400&fit=crop',
    subscribers: 15700,
    monthlyListeners: 41000,
    totalPlays: 720000,
    isVerified: false,
    socialLinks: { instagram: '@alisa_jazz', telegram: '@alisa_jz' },
    accentColor: '#f59e0b',
  },
  {
    id: 'artist-timur',
    name: 'Тимур',
    slug: 'timur',
    genre: 'Trap',
    city: 'Уфа',
    bio: 'Трэп-артист нового поколения. 3 альбома, 50M+ стримов, коллаборации с топ-продюсерами.',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop',
    subscribers: 78400,
    monthlyListeners: 289000,
    totalPlays: 8920000,
    isVerified: true,
    socialLinks: { instagram: '@timur_trap', vk: 'timur_music' },
    accentColor: '#8b5cf6',
  },
  {
    id: 'artist-eva',
    name: 'Ева',
    slug: 'eva',
    genre: 'Techno',
    city: 'Калининград',
    bio: 'Техно-DJ и продюсер. Резидент берлинских клубов, организатор rave-серии "SIGNAL".',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&h=400&fit=crop',
    subscribers: 41200,
    monthlyListeners: 134000,
    totalPlays: 3670000,
    isVerified: true,
    socialLinks: { instagram: '@eva_techno', telegram: '@signal_rave' },
    accentColor: '#06b6d4',
  },
  {
    id: 'artist-artem',
    name: 'Артём',
    slug: 'artem',
    genre: 'Lo-Fi',
    city: 'Воронеж',
    bio: 'Lo-fi продюсер и звукорежиссёр. Создатель YouTube-канала "Chill Beats Russia" (200K+ подписчиков).',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=400&fit=crop',
    subscribers: 35600,
    monthlyListeners: 98000,
    totalPlays: 2340000,
    isVerified: false,
    socialLinks: { instagram: '@artem_lofi', youtube: '@chill_beats_ru' },
    accentColor: '#14b8a6',
  },
];

// Демо-треки для каждого артиста
function generateDemoTracks(artist: typeof DEMO_ARTISTS[0]): any[] {
  const trackTemplates: Record<string, string[]> = {
    'Pop': ['Огни города', 'Не отпускай', 'Танцуй со мной', 'Лето навсегда'],
    'R&B': ['Midnight Soul', 'Шёпот ветра', 'Без слов', 'Gravity'],
    'Electronic': ['Neon Dreams', 'Pulse', 'Digital Rain', 'Horizon'],
    'Hip-Hop': ['На бите', 'Flow State', 'Улицы говорят', 'Скайлайн'],
    'House': ['Feel the Groove', 'Sunset Drive', 'Deep Inside', 'Club Ritual'],
    'Dance': ['Ночные волны', 'Euphoria', 'Let It Go', 'Crystal'],
    'Indie': ['Бумажные крылья', 'Тихий океан', 'Акварель', 'Следы'],
    'Rock': ['Мост', 'Сталь и огонь', 'Рассвет', 'Дорога'],
    'Jazz': ['Blue Velvet Night', 'Swing Theory', 'Autumn Leaves Reimagined', 'Midnight in Moscow'],
    'Trap': ['FLEX', 'Dark Mode', 'Ice Cold', 'No Cap'],
    'Techno': ['Signal', 'Warehouse', 'Acid Trip', 'Machine Code'],
    'Lo-Fi': ['Rainy Afternoon', 'Study Session', 'Warm Coffee', 'Late Night Thoughts'],
  };

  const titles = trackTemplates[artist.genre] || ['Track 1', 'Track 2', 'Track 3', 'Track 4'];
  const durations = ['3:24', '4:12', '3:58', '2:45', '5:01', '3:33'];

  return titles.map((title, i) => ({
    id: `track-${artist.slug}-${i + 1}`,
    title,
    artist: artist.name,
    artistId: artist.id,
    genre: artist.genre,
    cover: artist.coverImage,
    duration: durations[i % durations.length],
    plays: Math.floor(Math.random() * 500000) + 10000,
    likes: Math.floor(Math.random() * 20000) + 500,
    downloads: Math.floor(Math.random() * 5000) + 100,
    status: 'approved',
    releaseDate: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 180) * 86400000).toISOString(),
  }));
}

// Демо-чарт TOP-20
function generateChart(allTracks: any[]): any[] {
  // Sort by plays and take top 20
  const sorted = [...allTracks].sort((a, b) => b.plays - a.plays).slice(0, 20);
  return sorted.map((track, i) => ({
    position: i + 1,
    previousPosition: Math.max(1, i + 1 + Math.floor((Math.random() - 0.5) * 6)),
    trackId: track.id,
    title: track.title,
    artist: track.artist,
    artistId: track.artistId,
    genre: track.genre,
    plays: track.plays,
    likes: track.likes,
    cover: track.cover,
    duration: track.duration,
    weeksOnChart: Math.floor(Math.random() * 12) + 1,
  }));
}

// Демо-новости
function generateNews(artists: typeof DEMO_ARTISTS): any[] {
  const templates = [
    { title: '{artist} выпустила новый сингл', tag: 'Релиз' },
    { title: '{artist} объявил о туре по городам России', tag: 'Концерты' },
    { title: 'Интервью с {artist}: о новом альбоме и планах', tag: 'Интервью' },
    { title: '{artist} стал амбассадором Promo.music', tag: 'Партнёрство' },
    { title: 'Клип {artist} набрал 1 миллион просмотров', tag: 'Видео' },
    { title: '{artist} выступит на фестивале "Promo Fest 2026"', tag: 'Фестивали' },
    { title: 'Коллаборация: {artist} записал совместный трек', tag: 'Коллаборации' },
    { title: '{artist} запускает собственный лейбл', tag: 'Бизнес' },
  ];

  return templates.slice(0, 6).map((tmpl, i) => {
    const artist = artists[i % artists.length];
    return {
      id: `news-${i + 1}`,
      title: tmpl.title.replace('{artist}', artist.name),
      tag: tmpl.tag,
      artistId: artist.id,
      artistName: artist.name,
      artistAvatar: artist.avatar,
      coverImage: artist.coverImage,
      excerpt: `Последние новости о ${artist.name} в мире музыки и шоу-бизнеса.`,
      content: `Подробная новость о ${artist.name}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      views: Math.floor(Math.random() * 10000) + 500,
      likes: Math.floor(Math.random() * 2000) + 50,
      publishedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
      status: 'published',
    };
  });
}

// Демо-концерты
function generateConcerts(artists: typeof DEMO_ARTISTS): any[] {
  const venues = [
    { name: 'Adrenaline Stadium', city: 'Москва', capacity: 8000 },
    { name: 'А2 Green Concert', city: 'Санкт-Петербург', capacity: 4000 },
    { name: 'MOSAIQUE Club', city: 'Казань', capacity: 1500 },
    { name: 'Teleclub', city: 'Екатеринбург', capacity: 2500 },
    { name: 'Pravda Club', city: 'Новосибирск', capacity: 1200 },
    { name: 'Arena Hall', city: 'Краснодар', capacity: 3000 },
  ];

  return venues.map((venue, i) => {
    const artist = artists[i % artists.length];
    const date = new Date(Date.now() + (i + 1) * 7 * 86400000);
    return {
      id: `concert-${i + 1}`,
      title: `${artist.name} Live`,
      artist: artist.name,
      artistId: artist.id,
      artistAvatar: artist.avatar,
      venue: venue.name,
      city: venue.city,
      date: date.toISOString().split('T')[0],
      time: '20:00',
      capacity: venue.capacity,
      ticketsSold: Math.floor(venue.capacity * (0.3 + Math.random() * 0.5)),
      ticketPriceFrom: String(1500 + i * 500),
      ticketPriceTo: String(5000 + i * 1000),
      status: 'approved',
      views: Math.floor(Math.random() * 5000) + 200,
      coverImage: artist.coverImage,
      description: `Концерт ${artist.name} в ${venue.city}. ${venue.name}, ${venue.capacity} мест.`,
      createdAt: new Date().toISOString(),
    };
  });
}

// Демо-баты
function generateBeats(): any[] {
  const BEAT_DATA = [
    { title: 'Midnight Flow', producer: 'Максам', producerId: 'artist-maxam', genre: 'Trap', bpm: 140, key: 'Am', tags: ['dark', 'melodic', 'trap'] },
    { title: 'Summer Vibes', producer: 'Сандра', producerId: 'artist-sandra', genre: 'Pop', bpm: 120, key: 'C', tags: ['upbeat', 'summer', 'pop'] },
    { title: 'Dark Energy', producer: 'Тимур', producerId: 'artist-timur', genre: 'Drill', bpm: 150, key: 'F#m', tags: ['drill', 'aggressive', 'dark'] },
    { title: 'Lo-Fi Dreams', producer: 'Артём', producerId: 'artist-artem', genre: 'Lo-Fi', bpm: 85, key: 'Dm', tags: ['chill', 'lofi', 'study'] },
    { title: 'Neon Pulse', producer: 'Дэн', producerId: 'artist-dan', genre: 'Electronic', bpm: 128, key: 'Gm', tags: ['synth', 'neon', 'electronic'] },
    { title: 'Club Ritual', producer: 'Марк', producerId: 'artist-mark', genre: 'House', bpm: 124, key: 'Eb', tags: ['house', 'club', 'dance'] },
    { title: 'Warehouse 303', producer: 'Ева', producerId: 'artist-eva', genre: 'Techno', bpm: 135, key: 'Cm', tags: ['techno', 'acid', 'warehouse'] },
    { title: 'Velvet Soul', producer: 'Алиса', producerId: 'artist-alisa', genre: 'Jazz', bpm: 95, key: 'Bb', tags: ['jazz', 'soul', 'smooth'] },
    { title: 'Мятеж', producer: 'Роман', producerId: 'artist-roman', genre: 'Rock', bpm: 145, key: 'Em', tags: ['rock', 'guitar', 'energy'] },
    { title: 'Акварель', producer: 'Ника', producerId: 'artist-nika', genre: 'Indie', bpm: 110, key: 'A', tags: ['indie', 'dreamy', 'soft'] },
    { title: 'Gravity', producer: 'Лиана', producerId: 'artist-liana', genre: 'R&B', bpm: 92, key: 'Fm', tags: ['rnb', 'slow', 'emotional'] },
    { title: 'Crystal', producer: 'Стелла', producerId: 'artist-stella', genre: 'Dance', bpm: 130, key: 'D', tags: ['dance', 'euphoria', 'bright'] },
    { title: 'Ice Cold', producer: 'Тимур', producerId: 'artist-timur', genre: 'Trap', bpm: 155, key: 'Bbm', tags: ['trap', 'hard', 'cold'] },
    { title: 'Sunset Drive', producer: 'Марк', producerId: 'artist-mark', genre: 'House', bpm: 122, key: 'Ab', tags: ['deep', 'sunset', 'house'] },
    { title: 'Binary Love', producer: 'Дэн', producerId: 'artist-dan', genre: 'Electronic', bpm: 132, key: 'F', tags: ['synth', 'love', 'electronic'] },
    { title: 'Rainy Afternoon', producer: 'Артём', producerId: 'artist-artem', genre: 'Lo-Fi', bpm: 80, key: 'G', tags: ['rain', 'lofi', 'ambient'] },
  ];

  const durations = ['2:45', '3:12', '3:38', '4:01', '2:58', '3:24', '3:50', '4:15'];
  const prices = [3000, 4000, 5000, 6000, 7500, 8000, 10000, 12000, 15000];

  return BEAT_DATA.map((b, i) => ({
    id: `beat-${i + 1}`,
    title: b.title,
    producer: b.producer,
    producerId: b.producerId,
    genre: b.genre,
    bpm: b.bpm,
    key: b.key,
    tags: b.tags,
    duration: durations[i % durations.length],
    price: prices[i % prices.length],
    plays: Math.floor(Math.random() * 25000) + 2000,
    purchases: Math.floor(Math.random() * 80) + 5,
    rating: +(4.3 + Math.random() * 0.7).toFixed(1),
    status: 'active',
    licenseTypes: {
      basic: prices[i % prices.length],
      premium: prices[i % prices.length] * 3,
      exclusive: prices[i % prices.length] * 10,
    },
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 120) * 86400000).toISOString(),
  }));
}

// Демо-сервисы продюсеров/звукоинженеров (расширенные)
function generateProducerServices(): any[] {
  return [
    {
      id: 'svc-1', type: 'mixing', title: 'Профессиональное сведение',
      description: 'Полный микс вашего трека: балансировка уровней, панорамирование, обработка каждой дорожки. Работаю в Pro Tools HD.',
      producer: 'Максам', producerId: 'artist-maxam', basePrice: 8000, minPrice: 5000, maxPrice: 15000,
      deliveryDays: 4, revisions: 3, rating: 4.9, orders: 47, status: 'active',
      includes: ['Балансировка уровней', 'EQ и компрессия каждой дорожки', 'Пространственная обработка', '3 бесплатные правки'],
      requirements: 'WAV/AIFF 24bit 48kHz, отдельные стемы без обработки, reference-трек',
      technicalSpecs: { inputFormats: ['WAV', 'AIFF'], outputFormats: ['WAV', 'MP3'], sampleRate: '48kHz', bitDepth: '24bit', deliveryMethod: 'Google Drive' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-2', type: 'mastering', title: 'Мастеринг для стримингов',
      description: 'Финальная обработка микса для Spotify, Apple Music и других платформ. Loudness-оптимизация под -14 LUFS.',
      producer: 'Дэн', producerId: 'artist-dan', basePrice: 5000, minPrice: 3000, maxPrice: 8000,
      deliveryDays: 2, revisions: 2, rating: 4.8, orders: 62, status: 'active',
      includes: ['Стерео-мастеринг', 'Loudness target -14 LUFS', 'Версии WAV + MP3', '2 бесплатные правки'],
      requirements: 'Стерео-микс WAV 24bit, headroom -3dB, без лимитера на мастер-шине',
      technicalSpecs: { inputFormats: ['WAV'], outputFormats: ['WAV', 'MP3', 'FLAC'], sampleRate: '44.1kHz / 48kHz', bitDepth: '24bit / 16bit', deliveryMethod: 'Yandex.Disk' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-3', type: 'arrangement', title: 'Аранжировка под ключ',
      description: 'Полноценная аранжировка из вашей идеи, голосовой записи или акустической демки. Живые инструменты и электроника.',
      producer: 'Алиса', producerId: 'artist-alisa', basePrice: 15000, minPrice: 10000, maxPrice: 30000,
      deliveryDays: 6, revisions: 3, rating: 5.0, orders: 23, status: 'active',
      includes: ['Полная аранжировка', 'До 20 дорожек', 'Живые клавишные', '3 правки'],
      requirements: 'Демо-запись (голос или MIDI), текст, reference-треки',
      technicalSpecs: { inputFormats: ['MP3', 'WAV', 'MIDI'], outputFormats: ['WAV стемы', 'Project file'], sampleRate: '48kHz', bitDepth: '24bit', deliveryMethod: 'Google Drive' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-4', type: 'vocal_recording', title: 'Запись вокала в студии',
      description: 'Профессиональная запись вокала на Neumann U87 через Neve предусилитель. Студия в центре Москвы.',
      producer: 'Лиана', producerId: 'artist-liana', basePrice: 3000, minPrice: 2000, maxPrice: 5000,
      deliveryDays: 1, revisions: 1, rating: 4.7, orders: 89, status: 'active',
      includes: ['2 часа студийного времени', 'Инженер записи', 'Базовая чистка дорожек', 'Отправка стемов'],
      requirements: 'Текст и минус в WAV, приходить с готовым материалом',
      technicalSpecs: { inputFormats: ['WAV минусовка'], outputFormats: ['WAV'], sampleRate: '48kHz', bitDepth: '24bit', deliveryMethod: 'На месте / email' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-5', type: 'ghost_production', title: 'Гост-продакшн (NDA)',
      description: 'Полный продакшн трека от идеи до мастера с передачей всех прав. Конфиденциальность гарантируется NDA.',
      producer: 'Максам', producerId: 'artist-maxam', basePrice: 25000, minPrice: 15000, maxPrice: 50000,
      deliveryDays: 10, revisions: 5, rating: 4.9, orders: 15, status: 'active',
      includes: ['Полный продакшн', 'Сведение и мастеринг', 'Передача всех прав', 'NDA', '5 правок'],
      requirements: 'Бриф с описанием жанра, настроения, reference-треки',
      technicalSpecs: { inputFormats: ['Бриф', 'Reference MP3'], outputFormats: ['WAV стемы', 'Project file', 'Master WAV'], sampleRate: '48kHz', bitDepth: '24bit', deliveryMethod: 'Google Drive (шифрование)' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-6', type: 'beatmaking', title: 'Кастомный бит на заказ',
      description: 'Уникальный бит под ваш стиль. Trap, Drill, Boom Bap, Lo-Fi - любой жанр хип-хопа.',
      producer: 'Тимур', producerId: 'artist-timur', basePrice: 10000, minPrice: 5000, maxPrice: 20000,
      deliveryDays: 5, revisions: 3, rating: 4.8, orders: 34, status: 'active',
      includes: ['Уникальный бит', 'Стемы (drums, melody, bass)', 'MP3 + WAV', '3 правки'],
      requirements: 'Описание стиля, BPM, reference-треки',
      technicalSpecs: { inputFormats: ['Reference MP3'], outputFormats: ['WAV', 'MP3', 'Stems'], sampleRate: '44.1kHz', bitDepth: '24bit', deliveryMethod: 'Email / Google Drive' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-7', type: 'sound_design', title: 'Саунд-дизайн для видео',
      description: 'Звуковые эффекты, атмосферы и Foley для видеоконтента. Кино, реклама, YouTube.',
      producer: 'Ева', producerId: 'artist-eva', basePrice: 12000, minPrice: 8000, maxPrice: 25000,
      deliveryDays: 7, revisions: 2, rating: 4.6, orders: 19, status: 'active',
      includes: ['SFX и атмосферы', 'Foley-эффекты', 'Синхронизация с видео', '2 правки'],
      requirements: 'Видео в формате MP4/MOV, тайм-коды, бриф по настроению',
      technicalSpecs: { inputFormats: ['MP4', 'MOV', 'ProRes'], outputFormats: ['WAV', 'AAF', 'OMF'], sampleRate: '48kHz', bitDepth: '24bit', deliveryMethod: 'Google Drive / Frame.io' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-8', type: 'consultation', title: 'Консультация по продакшну',
      description: 'Часовая онлайн-консультация по сведению, мастерингу, выбору оборудования или карьерным вопросам.',
      producer: 'Дэн', producerId: 'artist-dan', basePrice: 2000, minPrice: 1500, maxPrice: 3000,
      deliveryDays: 0, revisions: 0, rating: 5.0, orders: 112, status: 'active',
      includes: ['60 минут видеозвонка', 'Разбор ваших проектов', 'Рекомендации по плагинам', 'Запись встречи'],
      requirements: 'Подготовить вопросы и проект-файлы заранее',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-9', type: 'session_musician', title: 'Сессионная гитара (запись)',
      description: 'Запись партий электро- и акустической гитары. Fender, Gibson, Taylor - подберу звук под задачу.',
      producer: 'Артём', producerId: 'artist-artem', basePrice: 6000, minPrice: 4000, maxPrice: 12000,
      deliveryDays: 3, revisions: 2, rating: 4.8, orders: 28, status: 'active',
      includes: ['Запись 1 партии', 'До 3 вариантов исполнения', 'Чистые стемы', '2 правки'],
      requirements: 'Минус WAV 24bit, нотная запись или демо партии, описание стиля',
      technicalSpecs: { inputFormats: ['WAV', 'MIDI', 'PDF нот'], outputFormats: ['WAV', 'DI + обработка'], sampleRate: '48kHz', bitDepth: '24bit', deliveryMethod: 'Google Drive' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-10', type: 'mixing', title: 'Сведение вокала + мастеринг',
      description: 'Комплекс: профессиональное сведение вокальной партии с инструменталом и финальный мастеринг.',
      producer: 'Ника', producerId: 'artist-nika', basePrice: 10000, minPrice: 7000, maxPrice: 18000,
      deliveryDays: 5, revisions: 3, rating: 4.9, orders: 41, status: 'active',
      includes: ['Сведение вокала', 'Мастеринг', 'Тюнинг по запросу', 'WAV + MP3', '3 правки'],
      requirements: 'Вокал WAV 24bit без обработки, минус WAV, reference',
      technicalSpecs: { inputFormats: ['WAV'], outputFormats: ['WAV', 'MP3'], sampleRate: '48kHz', bitDepth: '24bit', deliveryMethod: 'Yandex.Disk' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-11', type: 'mixing', title: 'Сведение для кино и рекламы',
      description: 'Профессиональное сведение аудиодорожек для видеоконтента - кино, рекламные ролики, трейлеры.',
      producer: 'Ева', producerId: 'artist-eva', basePrice: 10000, minPrice: 7000, maxPrice: 20000,
      deliveryDays: 5, revisions: 2, rating: 4.7, orders: 12, status: 'active',
      includes: ['Сведение диалогов', 'Микс музыки и SFX', 'Финальный даунмикс', '2 правки'],
      requirements: 'Стемы в WAV 48kHz, видео для синхронизации',
      technicalSpecs: { inputFormats: ['WAV', 'AAF', 'OMF'], outputFormats: ['WAV', 'MP3', '5.1'], sampleRate: '48kHz', bitDepth: '24bit', deliveryMethod: 'Frame.io / Google Drive' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'svc-12', type: 'beatmaking', title: 'Авторские биты Hip-Hop / R&B',
      description: 'Кастомные биты в стилях Hip-Hop, Trap, R&B. Уникальный саунд с живыми элементами и аналоговыми синтезаторами.',
      producer: 'Максам', producerId: 'artist-maxam', basePrice: 10000, minPrice: 6000, maxPrice: 18000,
      deliveryDays: 4, revisions: 3, rating: 4.9, orders: 29, status: 'active',
      includes: ['Уникальный бит', 'Стемы (drums, melody, bass, FX)', 'WAV + MP3', '3 правки'],
      requirements: 'Описание настроения, BPM, reference-треки',
      technicalSpecs: { inputFormats: ['Reference MP3'], outputFormats: ['WAV', 'MP3', 'Stems'], sampleRate: '48kHz', bitDepth: '24bit', deliveryMethod: 'Google Drive' },
      createdAt: new Date().toISOString(),
    },
  ];
}

// Демо-портфолио (до/после) - расширенные
function generatePortfolio(): any[] {
  return [
    { id: 'pf-1', title: 'Сведение вокала R&B трека', artist: 'Лиана', type: 'Сведение', year: '2025', description: 'Баланс вокала с бэкингом, деэссер, компрессия, ревербератор.', producerId: 'artist-maxam', producerName: 'Максам', beforeAfterDescription: 'До: сухой вокал поверх минуса. После: объёмный микс с пространством.' },
    { id: 'pf-2', title: 'Мастеринг Trap альбома', artist: 'Тимур', type: 'Мастеринг', year: '2025', description: 'EQ, мультибэнд-компрессия, лимитирование до -14 LUFS.', producerId: 'artist-dan', producerName: 'Дэн', beforeAfterDescription: 'До: тихий микс с пустым низом. После: плотный, громкий мастер.' },
    { id: 'pf-3', title: 'Аранжировка поп-хита', artist: 'Сандра', type: 'Аранжировка', year: '2026', description: 'Из демо на телефон - в полноценную аранжировку с живыми струнными.', producerId: 'artist-alisa', producerName: 'Алиса', beforeAfterDescription: 'До: голосовая заметка в телефон. После: полноценный продакшн.' },
    { id: 'pf-4', title: 'Техно-ремикс клубного трека', artist: 'Ева', type: 'Ремикс', year: '2025', description: 'Переработка оригинала в техно-формат для клубного DJ-сета.', producerId: 'artist-eva', producerName: 'Ева', beforeAfterDescription: 'До: лёгкий deep house. После: тяжёлый peak-time техно.' },
    { id: 'pf-5', title: 'Lo-Fi обработка джазового стандарта', artist: 'Алиса', type: 'Саунд-дизайн', year: '2026', description: 'Виниловый шум, битовый хруст, тёплая сатурация.', producerId: 'artist-artem', producerName: 'Артём', beforeAfterDescription: 'До: чистая джазовая запись. После: ламповый lo-fi с характером.' },
    { id: 'pf-6', title: 'Мастеринг EP для Bandcamp', artist: 'Дэн', type: 'Мастеринг', year: '2026', description: 'Мастеринг 5 треков EP с единой громкостью и характером звучания.', producerId: 'artist-nika', producerName: 'Ника', beforeAfterDescription: 'До: разрозненные миксы разной громкости. После: цельный EP.' },
    { id: 'pf-7', title: 'Саунд-дизайн рекламного ролика', artist: 'Клиент NDA', type: 'Саунд-дизайн', year: '2025', description: 'Полная звуковая дорожка для 30-секундного ТВ-ролика: SFX, атмосферы, музыкальное сопровождение.', producerId: 'artist-eva', producerName: 'Ева', beforeAfterDescription: 'До: немое видео. После: полноценная звуковая картина.' },
  ];
}

// Демо-профили продюсеров/звукоинженеров
function generateProducerProfiles(): any[] {
  return [
    {
      id: 'producer-maxam', userId: 'artist-maxam', producerName: 'Максам',
      bio: 'Звукоинженер и продюсер с 8-летним стажем. Специализируюсь на сведении вокала для hip-hop и R&B. Работал с топ-артистами российской сцены.',
      bioShort: 'Сведение и продакшн - hip-hop, R&B',
      specializations: ['mixing', 'ghost_production', 'beatmaking'],
      genres: ['Hip-Hop', 'R&B', 'Trap'],
      city: 'Москва', country: 'Россия',
      averageRating: 4.9, reviewCount: 34, experienceYears: 8,
      languages: ['Русский', 'English'],
      certifications: ['Avid Pro Tools Certified'],
      softwareUsed: ['Pro Tools HD', 'Waves', 'FabFilter', 'Soundtoys', 'UAD'],
      hardwareUsed: ['Neumann U87', 'Neve 1073', 'SSL Bus Compressor', 'Focal Trio11'],
      notableClients: ['Сандра', 'Лиана', 'Тимур'],
      availability: 'available', deliveryTimeDays: 4, hourlyRate: 3000,
      workPhilosophy: 'Каждый трек уникален - подхожу индивидуально к каждому проекту.',
      responseTimeHours: 2, acceptsRushOrders: true, rushOrderSurchargePercent: 50,
      totalServices: 3, totalOrders: 62, totalEarnings: 890000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'producer-dan', userId: 'artist-dan', producerName: 'Дэн',
      bio: 'Мастеринг-инженер с фокусом на электронную музыку и поп. 6 лет опыта, более 500 отмастеренных треков.',
      bioShort: 'Мастеринг и консалтинг - электронная музыка',
      specializations: ['mastering', 'consultation'],
      genres: ['Electronic', 'Pop', 'Indie'],
      city: 'Санкт-Петербург', country: 'Россия',
      averageRating: 4.9, reviewCount: 48, experienceYears: 6,
      languages: ['Русский', 'English', 'Deutsch'],
      education: 'СПбГУ - звукорежиссура',
      certifications: ['iZotope Certified', 'Dolby Atmos Certified'],
      softwareUsed: ['WaveLab', 'iZotope Ozone', 'FabFilter Pro-L2', 'REFERENCE'],
      hardwareUsed: ['Hedd Type 20', 'Dangerous BAX EQ', 'Manley Massive Passive'],
      notableClients: ['Тимур', 'Ева', 'Артём'],
      availability: 'available', deliveryTimeDays: 2, hourlyRate: 2500,
      workPhilosophy: 'Мастеринг - это не просто громкость. Это финальный штрих, раскрывающий потенциал микса.',
      responseTimeHours: 1, acceptsRushOrders: true, rushOrderSurchargePercent: 40,
      totalServices: 2, totalOrders: 174, totalEarnings: 1250000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'producer-alisa', userId: 'artist-alisa', producerName: 'Алиса',
      bio: 'Аранжировщик и мульти-инструменталист. Превращаю демо-записи на телефон в полноценные аранжировки.',
      bioShort: 'Аранжировка - поп, инди, акустика',
      specializations: ['arrangement', 'session_musician'],
      genres: ['Pop', 'Indie', 'Acoustic'],
      city: 'Новосибирск', country: 'Россия',
      averageRating: 5.0, reviewCount: 19, experienceYears: 10,
      languages: ['Русский'],
      education: 'ГМПИ им. Ипполитова-Иванова',
      softwareUsed: ['Logic Pro X', 'Kontakt', 'Spitfire Audio', 'Arturia V Collection'],
      hardwareUsed: ['Nord Stage 3', 'Taylor 814ce', 'Apollo Twin'],
      availability: 'busy', deliveryTimeDays: 6, hourlyRate: 4000,
      workPhilosophy: 'Живые инструменты делают музыку настоящей.',
      responseTimeHours: 4, acceptsRushOrders: false,
      totalServices: 1, totalOrders: 23, totalEarnings: 460000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'producer-eva', userId: 'artist-eva', producerName: 'Ева',
      bio: 'Саунд-дизайнер для кино, рекламы и игр. Создаю звуковые миры с нуля - от SFX и Foley до музыкального оформления.',
      bioShort: 'Саунд-дизайн - кино, реклама, игры',
      specializations: ['sound_design', 'mixing'],
      genres: ['Cinematic', 'Ambient', 'Electronic'],
      city: 'Калининград', country: 'Россия',
      averageRating: 4.7, reviewCount: 15, experienceYears: 5,
      languages: ['Русский', 'English'],
      certifications: ['FMOD Certified'],
      softwareUsed: ['Reaper', 'Ableton Live', 'FMOD', 'Wwise', 'iZotope RX'],
      hardwareUsed: ['Sennheiser MKH 416', 'Sound Devices MixPre-6', 'Genelec 8040'],
      availability: 'available', deliveryTimeDays: 7, hourlyRate: 3500,
      workPhilosophy: 'Звук - это 50% впечатления. Мой саунд-дизайн заставляет зрителя чувствовать.',
      responseTimeHours: 3, acceptsRushOrders: true, rushOrderSurchargePercent: 60,
      totalServices: 2, totalOrders: 19, totalEarnings: 380000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'producer-nika', userId: 'artist-nika', producerName: 'Ника',
      bio: 'Вокальный продюсер и звукоинженер. Специализируюсь на записи, редактировании и сведении вокала.',
      bioShort: 'Вокальный продюсер - запись и сведение',
      specializations: ['mixing', 'vocal_recording'],
      genres: ['Pop', 'R&B', 'Soul'],
      city: 'Москва', country: 'Россия',
      averageRating: 4.9, reviewCount: 27, experienceYears: 7,
      languages: ['Русский', 'English'],
      softwareUsed: ['Logic Pro X', 'Melodyne', 'Waves', 'FabFilter'],
      hardwareUsed: ['Neumann TLM 103', 'Avalon VT-737sp', 'Yamaha HS8'],
      notableClients: ['Сандра', 'Лиана'],
      availability: 'available', deliveryTimeDays: 5, hourlyRate: 2800,
      workPhilosophy: 'Вокал - это главное в треке. Мой задача - чтобы голос звучал идеально.',
      responseTimeHours: 2, acceptsRushOrders: true, rushOrderSurchargePercent: 35,
      totalServices: 1, totalOrders: 41, totalEarnings: 520000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'producer-artem', userId: 'artist-artem', producerName: 'Артём',
      bio: 'Гитарист, сессионный музыкант и продюсер. 12 лет опыта концертной и студийной работы.',
      bioShort: 'Сессионный гитарист и продюсер',
      specializations: ['session_musician', 'arrangement', 'mixing'],
      genres: ['Rock', 'Blues', 'Jazz', 'Lo-Fi'],
      city: 'Екатеринбург', country: 'Россия',
      averageRating: 4.8, reviewCount: 22, experienceYears: 12,
      languages: ['Русский'],
      education: 'УГК им. Мусоргского',
      softwareUsed: ['Cubase', 'Guitar Rig', 'Amplitube', 'EZdrummer'],
      hardwareUsed: ['Fender Stratocaster', 'Gibson Les Paul', 'Taylor 314ce', 'Universal Audio Apollo x4'],
      availability: 'available', deliveryTimeDays: 3, hourlyRate: 2000,
      workPhilosophy: 'Настоящий звук гитары не заменить VST. Каждую ноту играю с душой.',
      responseTimeHours: 6, acceptsRushOrders: true, rushOrderSurchargePercent: 30,
      totalServices: 1, totalOrders: 28, totalEarnings: 210000,
      createdAt: new Date().toISOString(),
    },
  ];
}

// Демо-отзывы о продюсерах/инженерах
function generateProducerReviews(): any[] {
  return [
    { id: 'rev-1', producerId: 'producer-maxam', reviewerName: 'Лиана', serviceType: 'mixing', rating: 5, reviewText: 'Максам сделал невероятный микс - вокал звучит объёмно и тепло. Быстро, профессионально.', qualityScore: 5, communicationScore: 5, timelinessScore: 5, wouldRecommend: true, createdAt: '2025-11-15T10:00:00Z' },
    { id: 'rev-2', producerId: 'producer-maxam', reviewerName: 'Тимур', serviceType: 'ghost_production', rating: 5, reviewText: 'Заказывал гост-продакшн - результат превзошёл ожидания. NDA соблюдается строго.', qualityScore: 5, communicationScore: 5, timelinessScore: 4, wouldRecommend: true, createdAt: '2025-10-20T14:00:00Z' },
    { id: 'rev-3', producerId: 'producer-dan', reviewerName: 'Сандра', serviceType: 'mastering', rating: 5, reviewText: 'Дэн отмастерил сингл идеально - на Spotify звучит громко и чисто, без перекомпрессии.', qualityScore: 5, communicationScore: 5, timelinessScore: 5, wouldRecommend: true, createdAt: '2025-12-01T09:00:00Z' },
    { id: 'rev-4', producerId: 'producer-dan', reviewerName: 'Ева', serviceType: 'consultation', rating: 5, reviewText: 'Отличная консультация! Дэн подробно разобрал проект и дал конкретные советы по мастерингу.', qualityScore: 5, communicationScore: 5, timelinessScore: 5, wouldRecommend: true, createdAt: '2025-09-10T16:00:00Z' },
    { id: 'rev-5', producerId: 'producer-alisa', reviewerName: 'Сандра', serviceType: 'arrangement', rating: 5, reviewText: 'Алиса превратила простую мелодию в шедевр! Живые клавишные и струнные - красиво.', qualityScore: 5, communicationScore: 5, timelinessScore: 4, wouldRecommend: true, createdAt: '2026-01-05T11:00:00Z' },
    { id: 'rev-6', producerId: 'producer-eva', reviewerName: 'Клиент NDA', serviceType: 'sound_design', rating: 4, reviewText: 'Хороший саунд-дизайн для ролика. Немного затянулись со сроками, но результат стоил ожидания.', qualityScore: 5, communicationScore: 4, timelinessScore: 3, wouldRecommend: true, createdAt: '2025-08-22T13:00:00Z' },
    { id: 'rev-7', producerId: 'producer-nika', reviewerName: 'Лиана', serviceType: 'mixing', rating: 5, reviewText: 'Ника великолепно свела мой вокал! Каждый нюанс на месте. Обязательно закажу ещё.', qualityScore: 5, communicationScore: 5, timelinessScore: 5, wouldRecommend: true, createdAt: '2026-01-18T15:00:00Z' },
    { id: 'rev-8', producerId: 'producer-artem', reviewerName: 'Алиса', serviceType: 'session_musician', rating: 5, reviewText: 'Артём записал потрясающую гитарную партию. Прислал 3 варианта - все огонь!', qualityScore: 5, communicationScore: 4, timelinessScore: 5, wouldRecommend: true, createdAt: '2025-12-28T10:00:00Z' },
    { id: 'rev-9', producerId: 'producer-dan', reviewerName: 'Артём', serviceType: 'mastering', rating: 5, reviewText: 'Мастеринг EP у Дэна - лучшее решение. Все 5 треков звучат как единое целое.', qualityScore: 5, communicationScore: 5, timelinessScore: 5, wouldRecommend: true, createdAt: '2026-02-01T12:00:00Z' },
    { id: 'rev-10', producerId: 'producer-maxam', reviewerName: 'Дэн', serviceType: 'mixing', rating: 5, reviewText: 'Коллега, но обращаюсь к Максаму за сведением, когда нужен свежий взгляд. Всегда на высоте.', qualityScore: 5, communicationScore: 5, timelinessScore: 5, wouldRecommend: true, createdAt: '2025-07-14T08:00:00Z' },
  ];
}

// Демо-заказы продюсеров
function generateProducerOrders(): any[] {
  return [
    { id: 'ord-m1', producerId: 'producer-maxam', producerUserId: 'artist-maxam', client: 'Лиана', clientId: 'artist-liana', serviceType: 'mixing', serviceTitle: 'Сведение', price: 8000, status: 'in_progress', progress: 65, deadline: '2026-02-15', createdAt: '2026-02-01T10:00:00Z', notes: 'R&B трек, 24 дорожки' },
    { id: 'ord-m2', producerId: 'producer-maxam', producerUserId: 'artist-maxam', client: 'Тимур', clientId: 'artist-timur', serviceType: 'ghost_production', serviceTitle: 'Гост-продакшн', price: 25000, status: 'in_progress', progress: 30, deadline: '2026-02-20', createdAt: '2026-01-28T14:00:00Z', notes: 'Trap трек, NDA' },
    { id: 'ord-m3', producerId: 'producer-maxam', producerUserId: 'artist-maxam', client: 'Сандра', clientId: 'artist-sandra', serviceType: 'mixing', serviceTitle: 'Сведение', price: 10000, status: 'review', progress: 95, deadline: '2026-02-12', createdAt: '2026-01-20T09:00:00Z', notes: 'Поп-трек с вокалом' },
    { id: 'ord-m4', producerId: 'producer-maxam', producerUserId: 'artist-maxam', client: 'Дэн', clientId: 'artist-dan', serviceType: 'beatmaking', serviceTitle: 'Бит на заказ', price: 10000, status: 'in_progress', progress: 50, deadline: '2026-02-18', createdAt: '2026-02-03T11:00:00Z', notes: 'Electronic стиль' },
    { id: 'ord-m5', producerId: 'producer-maxam', producerUserId: 'artist-maxam', client: 'Ева', clientId: 'artist-eva', serviceType: 'mixing', serviceTitle: 'Сведение', price: 8000, status: 'completed', progress: 100, deadline: '2026-02-05', completedAt: '2026-02-04T16:00:00Z', createdAt: '2026-01-15T10:00:00Z', notes: 'Техно-трек' },
    { id: 'ord-m6', producerId: 'producer-maxam', producerUserId: 'artist-maxam', client: 'Алиса', clientId: 'artist-alisa', serviceType: 'beatmaking', serviceTitle: 'Бит на заказ', price: 12000, status: 'completed', progress: 100, deadline: '2026-02-01', completedAt: '2026-01-30T14:00:00Z', createdAt: '2026-01-10T08:00:00Z', notes: 'Jazz-hop бит' },
    { id: 'ord-d1', producerId: 'producer-dan', producerUserId: 'artist-dan', client: 'Тимур', clientId: 'artist-timur', serviceType: 'mastering', serviceTitle: 'Мастеринг', price: 5000, status: 'in_progress', progress: 70, deadline: '2026-02-14', createdAt: '2026-02-05T10:00:00Z', notes: 'Trap сингл' },
    { id: 'ord-d2', producerId: 'producer-dan', producerUserId: 'artist-dan', client: 'Артём', clientId: 'artist-artem', serviceType: 'mastering', serviceTitle: 'Мастеринг EP', price: 20000, status: 'in_progress', progress: 40, deadline: '2026-02-22', createdAt: '2026-02-01T12:00:00Z', notes: '5 треков Lo-Fi EP' },
    { id: 'ord-d3', producerId: 'producer-dan', producerUserId: 'artist-dan', client: 'Сандра', clientId: 'artist-sandra', serviceType: 'mastering', serviceTitle: 'Мастеринг', price: 5000, status: 'completed', progress: 100, deadline: '2026-02-03', completedAt: '2026-02-02T15:00:00Z', createdAt: '2026-01-25T09:00:00Z', notes: 'Поп-сингл' },
    { id: 'ord-d4', producerId: 'producer-dan', producerUserId: 'artist-dan', client: 'Ника', clientId: 'artist-nika', serviceType: 'consultation', serviceTitle: 'Консультация', price: 2000, status: 'completed', progress: 100, deadline: '2026-02-06', completedAt: '2026-02-06T18:00:00Z', createdAt: '2026-02-04T10:00:00Z', notes: 'Разбор проекта Ableton' },
    { id: 'ord-d5', producerId: 'producer-dan', producerUserId: 'artist-dan', client: 'Ева', clientId: 'artist-eva', serviceType: 'mastering', serviceTitle: 'Мастеринг', price: 5000, status: 'review', progress: 90, deadline: '2026-02-16', createdAt: '2026-02-08T11:00:00Z', notes: 'Techno сингл для Beatport' },
    { id: 'ord-e1', producerId: 'producer-eva', producerUserId: 'artist-eva', client: 'Клиент NDA', clientId: null, serviceType: 'sound_design', serviceTitle: 'Саунд-дизайн ролика', price: 15000, status: 'in_progress', progress: 55, deadline: '2026-02-25', createdAt: '2026-02-03T09:00:00Z', notes: '30-секундный ТВ-ролик' },
    { id: 'ord-e2', producerId: 'producer-eva', producerUserId: 'artist-eva', client: 'Марк', clientId: 'artist-mark', serviceType: 'mixing', serviceTitle: 'Сведение', price: 10000, status: 'in_progress', progress: 35, deadline: '2026-02-20', createdAt: '2026-02-07T14:00:00Z', notes: 'House трек' },
    { id: 'ord-e3', producerId: 'producer-eva', producerUserId: 'artist-eva', client: 'Стелла', clientId: 'artist-stella', serviceType: 'sound_design', serviceTitle: 'SFX для подкаста', price: 8000, status: 'completed', progress: 100, deadline: '2026-02-08', completedAt: '2026-02-07T17:00:00Z', createdAt: '2026-01-28T10:00:00Z', notes: 'Джинглы и переходы' },
    { id: 'ord-n1', producerId: 'producer-nika', producerUserId: 'artist-nika', client: 'Лиана', clientId: 'artist-liana', serviceType: 'mixing', serviceTitle: 'Сведение вокала', price: 10000, status: 'in_progress', progress: 80, deadline: '2026-02-13', createdAt: '2026-02-01T10:00:00Z', notes: 'R&B баллада' },
    { id: 'ord-n2', producerId: 'producer-nika', producerUserId: 'artist-nika', client: 'Сандра', clientId: 'artist-sandra', serviceType: 'mixing', serviceTitle: 'Сведение + мастеринг', price: 15000, status: 'review', progress: 95, deadline: '2026-02-14', createdAt: '2026-01-28T12:00:00Z', notes: 'Поп-сингл, 3 версии' },
    { id: 'ord-n3', producerId: 'producer-nika', producerUserId: 'artist-nika', client: 'Алиса', clientId: 'artist-alisa', serviceType: 'mixing', serviceTitle: 'Сведение', price: 10000, status: 'completed', progress: 100, deadline: '2026-02-05', completedAt: '2026-02-04T14:00:00Z', createdAt: '2026-01-20T09:00:00Z', notes: 'Джазовый вокал' },
    { id: 'ord-a1', producerId: 'producer-artem', producerUserId: 'artist-artem', client: 'Алиса', clientId: 'artist-alisa', serviceType: 'session_musician', serviceTitle: 'Гитарная партия', price: 6000, status: 'in_progress', progress: 60, deadline: '2026-02-17', createdAt: '2026-02-05T10:00:00Z', notes: 'Акустическая гитара' },
    { id: 'ord-a2', producerId: 'producer-artem', producerUserId: 'artist-artem', client: 'Роман', clientId: 'artist-roman', serviceType: 'session_musician', serviceTitle: 'Бас-гитара', price: 6000, status: 'completed', progress: 100, deadline: '2026-02-07', completedAt: '2026-02-06T16:00:00Z', createdAt: '2026-01-30T11:00:00Z', notes: 'Рок-трек, 2 партии' },
    { id: 'ord-a3', producerId: 'producer-artem', producerUserId: 'artist-artem', client: 'Ника', clientId: 'artist-nika', serviceType: 'session_musician', serviceTitle: 'Электрогитара', price: 8000, status: 'in_progress', progress: 25, deadline: '2026-02-22', createdAt: '2026-02-09T13:00:00Z', notes: 'Инди-поп' },
    { id: 'ord-al1', producerId: 'producer-alisa', producerUserId: 'artist-alisa', client: 'Сандра', clientId: 'artist-sandra', serviceType: 'arrangement', serviceTitle: 'Аранжировка', price: 18000, status: 'in_progress', progress: 45, deadline: '2026-02-28', createdAt: '2026-02-03T10:00:00Z', notes: 'Поп-баллада с оркестром' },
    { id: 'ord-al2', producerId: 'producer-alisa', producerUserId: 'artist-alisa', client: 'Ника', clientId: 'artist-nika', serviceType: 'arrangement', serviceTitle: 'Аранжировка', price: 15000, status: 'completed', progress: 100, deadline: '2026-02-05', completedAt: '2026-02-04T11:00:00Z', createdAt: '2026-01-18T09:00:00Z', notes: 'Инди-фолк' },
    // Тестовые заказы с дополнительными статусами (pending, revision, cancelled)
    { id: 'ord-m7', producerId: 'producer-maxam', producerUserId: 'artist-maxam', client: 'Роман', clientId: 'artist-roman', serviceType: 'mixing', serviceTitle: 'Сведение', price: 8000, status: 'pending', progress: 0, deadline: '2026-02-28', createdAt: '2026-02-10T09:00:00Z', notes: 'Рок-трек, ожидает материалы' },
    { id: 'ord-d6', producerId: 'producer-dan', producerUserId: 'artist-dan', client: 'Марк', clientId: 'artist-mark', serviceType: 'mastering', serviceTitle: 'Мастеринг', price: 5000, status: 'revision', progress: 75, deadline: '2026-02-18', createdAt: '2026-02-06T10:00:00Z', notes: 'House-трек, нужны правки по низам' },
    { id: 'ord-e4', producerId: 'producer-eva', producerUserId: 'artist-eva', client: 'Тимур', clientId: 'artist-timur', serviceType: 'sound_design', serviceTitle: 'Саунд-дизайн', price: 12000, status: 'cancelled', progress: 10, deadline: '2026-02-15', createdAt: '2026-02-02T11:00:00Z', notes: 'Отменён клиентом' },
    { id: 'ord-n4', producerId: 'producer-nika', producerUserId: 'artist-nika', client: 'Роман', clientId: 'artist-roman', serviceType: 'mixing', serviceTitle: 'Сведение вокала', price: 8000, status: 'pending', progress: 0, deadline: '2026-02-25', createdAt: '2026-02-09T14:00:00Z', notes: 'Ожидание подтверждения' },
    { id: 'ord-a4', producerId: 'producer-artem', producerUserId: 'artist-artem', client: 'Дэн', clientId: 'artist-dan', serviceType: 'session_musician', serviceTitle: 'Гитарная партия', price: 8000, status: 'revision', progress: 60, deadline: '2026-02-20', createdAt: '2026-02-07T09:00:00Z', notes: 'Нужно перезаписать бридж' },
    { id: 'ord-al3', producerId: 'producer-alisa', producerUserId: 'artist-alisa', client: 'Лиана', clientId: 'artist-liana', serviceType: 'arrangement', serviceTitle: 'Аранжировка', price: 20000, status: 'pending', progress: 0, deadline: '2026-03-05', createdAt: '2026-02-10T10:00:00Z', notes: 'R&B баллада, ожидание деталей' },
  ];
}

// Демо-данные кошелька продюсеров
function generateProducerWallets(): any[] {
  return [
    { producerId: 'producer-maxam', balance: 45000, pendingPayout: 45000, totalEarned: 890000, monthlyEarnings: 128000, commissionRate: 10, lastPayout: { amount: 85000, date: '2026-01-28', method: 'Банковская карта *4521' }, payoutMethods: [{ id: 'pm-1', type: 'card', label: 'Карта *4521', isDefault: true }], transactions: [
      { id: 'tx-m1', type: 'income', amount: 8000, description: 'Сведение - Лиана', orderId: 'ord-m1', date: '2026-02-08', status: 'confirmed' },
      { id: 'tx-m2', type: 'income', amount: 25000, description: 'Гост-продакшн - Тимур', orderId: 'ord-m2', date: '2026-02-05', status: 'pending' },
      { id: 'tx-m3', type: 'commission', amount: -3300, description: 'Комиссия платформы 10%', date: '2026-02-05', status: 'confirmed' },
      { id: 'tx-m4', type: 'payout', amount: -85000, description: 'Вывод на карту *4521', date: '2026-01-28', status: 'completed' },
      { id: 'tx-m5', type: 'income', amount: 10000, description: 'Бит на заказ - Алиса', orderId: 'ord-m6', date: '2026-01-25', status: 'confirmed' },
      { id: 'tx-m6', type: 'income', amount: 12000, description: 'Бит на заказ - Ева', orderId: 'ord-m5', date: '2026-01-20', status: 'confirmed' },
      { id: 'tx-m7', type: 'commission', amount: -2200, description: 'Комиссия платформы 10%', date: '2026-01-20', status: 'confirmed' },
      { id: 'tx-m8', type: 'income', amount: 8000, description: 'Сведение - Сандра', orderId: 'ord-m3', date: '2026-01-15', status: 'confirmed' },
    ], updatedAt: new Date().toISOString() },
    { producerId: 'producer-dan', balance: 62000, pendingPayout: 62000, totalEarned: 1250000, monthlyEarnings: 95000, commissionRate: 10, lastPayout: { amount: 120000, date: '2026-01-25', method: 'Банковская карта *3344' }, payoutMethods: [{ id: 'pm-3', type: 'card', label: 'Карта *3344', isDefault: true }], transactions: [
      { id: 'tx-d1', type: 'income', amount: 5000, description: 'Мастеринг - Тимур', orderId: 'ord-d1', date: '2026-02-09', status: 'pending' },
      { id: 'tx-d2', type: 'income', amount: 20000, description: 'Мастеринг EP - Артём', orderId: 'ord-d2', date: '2026-02-06', status: 'pending' },
      { id: 'tx-d3', type: 'income', amount: 5000, description: 'Мастеринг - Сандра', orderId: 'ord-d3', date: '2026-02-02', status: 'confirmed' },
      { id: 'tx-d4', type: 'income', amount: 2000, description: 'Консультация - Ника', orderId: 'ord-d4', date: '2026-02-06', status: 'confirmed' },
      { id: 'tx-d5', type: 'commission', amount: -3200, description: 'Комиссия платформы 10%', date: '2026-02-06', status: 'confirmed' },
      { id: 'tx-d6', type: 'payout', amount: -120000, description: 'Вывод на карту *3344', date: '2026-01-25', status: 'completed' },
    ], updatedAt: new Date().toISOString() },
    { producerId: 'producer-eva', balance: 18000, pendingPayout: 18000, totalEarned: 380000, monthlyEarnings: 48000, commissionRate: 10, lastPayout: { amount: 40000, date: '2026-01-20', method: 'Банковская карта *5567' }, payoutMethods: [{ id: 'pm-4', type: 'card', label: 'Карта *5567', isDefault: true }], transactions: [
      { id: 'tx-e1', type: 'income', amount: 15000, description: 'Саунд-дизайн ролика - NDA', orderId: 'ord-e1', date: '2026-02-07', status: 'pending' },
      { id: 'tx-e2', type: 'income', amount: 10000, description: 'Сведение - Марк', orderId: 'ord-e2', date: '2026-02-07', status: 'pending' },
      { id: 'tx-e3', type: 'income', amount: 8000, description: 'SFX - Стелла', orderId: 'ord-e3', date: '2026-02-07', status: 'confirmed' },
      { id: 'tx-e4', type: 'commission', amount: -800, description: 'Комиссия платформы 10%', date: '2026-02-07', status: 'confirmed' },
      { id: 'tx-e5', type: 'payout', amount: -40000, description: 'Вывод на карту *5567', date: '2026-01-20', status: 'completed' },
    ], updatedAt: new Date().toISOString() },
    { producerId: 'producer-nika', balance: 28000, pendingPayout: 28000, totalEarned: 520000, monthlyEarnings: 65000, commissionRate: 10, lastPayout: { amount: 55000, date: '2026-01-22', method: 'Банковская карта *8812' }, payoutMethods: [{ id: 'pm-5', type: 'card', label: 'Карта *8812', isDefault: true }], transactions: [
      { id: 'tx-n1', type: 'income', amount: 10000, description: 'Сведение вокала - Лиана', orderId: 'ord-n1', date: '2026-02-05', status: 'pending' },
      { id: 'tx-n2', type: 'income', amount: 15000, description: 'Сведение + мастеринг - Сандра', orderId: 'ord-n2', date: '2026-02-03', status: 'pending' },
      { id: 'tx-n3', type: 'income', amount: 10000, description: 'Сведение - Алиса', orderId: 'ord-n3', date: '2026-02-04', status: 'confirmed' },
      { id: 'tx-n4', type: 'commission', amount: -1000, description: 'Комиссия платформы 10%', date: '2026-02-04', status: 'confirmed' },
      { id: 'tx-n5', type: 'payout', amount: -55000, description: 'Вывод на карту *8812', date: '2026-01-22', status: 'completed' },
    ], updatedAt: new Date().toISOString() },
    { producerId: 'producer-artem', balance: 12000, pendingPayout: 12000, totalEarned: 210000, monthlyEarnings: 32000, commissionRate: 10, lastPayout: { amount: 25000, date: '2026-01-18', method: 'Банковская карта *2290' }, payoutMethods: [{ id: 'pm-6', type: 'card', label: 'Карта *2290', isDefault: true }], transactions: [
      { id: 'tx-a1', type: 'income', amount: 6000, description: 'Гитарная партия - Алиса', orderId: 'ord-a1', date: '2026-02-08', status: 'pending' },
      { id: 'tx-a2', type: 'income', amount: 6000, description: 'Бас-гитара - Роман', orderId: 'ord-a2', date: '2026-02-06', status: 'confirmed' },
      { id: 'tx-a3', type: 'commission', amount: -600, description: 'Комиссия платформы 10%', date: '2026-02-06', status: 'confirmed' },
      { id: 'tx-a4', type: 'payout', amount: -25000, description: 'Вывод на карту *2290', date: '2026-01-18', status: 'completed' },
    ], updatedAt: new Date().toISOString() },
    { producerId: 'producer-alisa', balance: 22000, pendingPayout: 22000, totalEarned: 460000, monthlyEarnings: 42000, commissionRate: 10, lastPayout: { amount: 35000, date: '2026-01-15', method: 'Банковская карта *6643' }, payoutMethods: [{ id: 'pm-7', type: 'card', label: 'Карта *6643', isDefault: true }], transactions: [
      { id: 'tx-al1', type: 'income', amount: 18000, description: 'Аранжировка - Сандра', orderId: 'ord-al1', date: '2026-02-06', status: 'pending' },
      { id: 'tx-al2', type: 'income', amount: 15000, description: 'Аранжировка - Ника', orderId: 'ord-al2', date: '2026-02-04', status: 'confirmed' },
      { id: 'tx-al3', type: 'commission', amount: -1500, description: 'Комиссия платформы 10%', date: '2026-02-04', status: 'confirmed' },
      { id: 'tx-al4', type: 'payout', amount: -35000, description: 'Вывод на карту *6643', date: '2026-01-15', status: 'completed' },
    ], updatedAt: new Date().toISOString() },
  ];
}

/**
 * Основная функция сидирования
 */
export async function seedDemoData(): Promise<{ seeded: boolean; message: string }> {
  try {
    // Check if already seeded
    const seedFlag = await kv.get(SEED_FLAG_KEY);
    if (seedFlag) {
      return { seeded: false, message: 'Demo data already seeded' };
    }

    console.log('🌱 Seeding demo data...');

    // 1. Seed artists
    const artistKeys: string[] = [];
    const artistValues: string[] = [];

    for (const artist of DEMO_ARTISTS) {
      artistKeys.push(`artist:${artist.id}`);
      artistValues.push(JSON.stringify({
        ...artist,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Also index by slug for public profile lookup
      artistKeys.push(`artist_slug:${artist.slug}`);
      artistValues.push(artist.id);
    }

    await kv.mset(artistKeys, artistValues);
    console.log(`  ✅ ${DEMO_ARTISTS.length} artists seeded`);

    // 2. Seed tracks
    const allTracks: any[] = [];
    const trackKeys: string[] = [];
    const trackValues: string[] = [];

    for (const artist of DEMO_ARTISTS) {
      const tracks = generateDemoTracks(artist);
      allTracks.push(...tracks);

      for (const track of tracks) {
        trackKeys.push(`track:public:${track.id}`);
        trackValues.push(JSON.stringify(track));
      }
    }

    await kv.mset(trackKeys, trackValues);
    console.log(`  ✅ ${allTracks.length} tracks seeded`);

    // 3. Seed chart
    const chart = generateChart(allTracks);
    await kv.set('chart:weekly:top20', JSON.stringify({
      id: 'weekly-top20',
      title: 'Чарт Promo.music - TOP 20',
      period: 'weekly',
      updatedAt: new Date().toISOString(),
      entries: chart,
    }));
    console.log('  ✅ Weekly chart seeded');

    // 4. Seed news
    const news = generateNews(DEMO_ARTISTS);
    const newsKeys: string[] = [];
    const newsValues: string[] = [];

    for (const item of news) {
      newsKeys.push(`news:public:${item.id}`);
      newsValues.push(JSON.stringify(item));
    }

    await kv.mset(newsKeys, newsValues);
    console.log(`  ✅ ${news.length} news items seeded`);

    // 5. Seed concerts
    const concerts = generateConcerts(DEMO_ARTISTS);
    const concertKeys: string[] = [];
    const concertValues: string[] = [];

    for (const concert of concerts) {
      concertKeys.push(`concert:public:${concert.id}`);
      concertValues.push(JSON.stringify(concert));
    }

    await kv.mset(concertKeys, concertValues);
    console.log(`  ✅ ${concerts.length} concerts seeded`);

    // 6. Seed popular artists list (sorted by monthly listeners)
    const popularArtists = [...DEMO_ARTISTS]
      .sort((a, b) => b.monthlyListeners - a.monthlyListeners)
      .map((a, i) => ({
        position: i + 1,
        artistId: a.id,
        name: a.name,
        genre: a.genre,
        avatar: a.avatar,
        monthlyListeners: a.monthlyListeners,
        isVerified: a.isVerified,
      }));

    await kv.set('artists:popular', JSON.stringify(popularArtists));
    console.log('  ✅ Popular artists list seeded');

    // 7. Seed genre stats
    const genreCounts: Record<string, number> = {};
    for (const artist of DEMO_ARTISTS) {
      genreCounts[artist.genre] = (genreCounts[artist.genre] || 0) + 1;
    }
    await kv.set('stats:genres', JSON.stringify(genreCounts));

    // 8. Seed beats marketplace
    const beats = generateBeats();
    const beatKeys: string[] = [];
    const beatValues: string[] = [];
    for (const beat of beats) {
      beatKeys.push(`beat:public:${beat.id}`);
      beatValues.push(JSON.stringify(beat));
    }
    await kv.mset(beatKeys, beatValues);
    console.log(`  ✅ ${beats.length} beats seeded`);

    // 9. Seed producer services
    const prodServices = generateProducerServices();
    const svcKeys: string[] = [];
    const svcValues: string[] = [];
    for (const svc of prodServices) {
      svcKeys.push(`producer_service:public:${svc.id}`);
      svcValues.push(JSON.stringify(svc));
    }
    await kv.mset(svcKeys, svcValues);
    console.log(`  ✅ ${prodServices.length} producer services seeded`);

    // 10. Seed portfolio before/after items
    const portfolioItems = generatePortfolio();
    await kv.set('portfolio:public:all', JSON.stringify(portfolioItems));
    console.log(`  ✅ ${portfolioItems.length} portfolio items seeded`);

    // 11. Seed producer/engineer profiles
    const producerProfiles = generateProducerProfiles();
    const profileKeys: string[] = [];
    const profileValues: string[] = [];
    for (const profile of producerProfiles) {
      profileKeys.push(`producer_profile:${profile.id}`);
      profileValues.push(JSON.stringify(profile));
    }
    await kv.mset(profileKeys, profileValues);
    console.log(`  ✅ ${producerProfiles.length} producer profiles seeded`);

    // 12. Seed producer reviews
    const reviews = generateProducerReviews();
    const reviewKeys: string[] = [];
    const reviewValues: string[] = [];
    for (const review of reviews) {
      reviewKeys.push(`producer_review:${review.producerId}:${review.id}`);
      reviewValues.push(JSON.stringify(review));
    }
    await kv.mset(reviewKeys, reviewValues);
    console.log(`  ✅ ${reviews.length} producer reviews seeded`);

    // 13. Seed producer orders
    const orders = generateProducerOrders();
    const orderKeys: string[] = [];
    const orderValues: string[] = [];
    for (const order of orders) {
      orderKeys.push(`producer_order:${order.producerId}:${order.id}`);
      orderValues.push(JSON.stringify(order));
    }
    await kv.mset(orderKeys, orderValues);
    console.log(`  ✅ ${orders.length} producer orders seeded`);

    // 14. Seed producer wallets
    const wallets = generateProducerWallets();
    const walletKeys: string[] = [];
    const walletValues: string[] = [];
    for (const wallet of wallets) {
      walletKeys.push(`producer_wallet:${wallet.producerId}`);
      walletValues.push(JSON.stringify(wallet));
    }
    await kv.mset(walletKeys, walletValues);
    console.log(`  ✅ ${wallets.length} producer wallets seeded`);

    // 15. Set platform stats (updated with beats, profiles)
    await kv.set('stats:platform', JSON.stringify({
      totalArtists: DEMO_ARTISTS.length,
      totalTracks: allTracks.length,
      totalPlays: DEMO_ARTISTS.reduce((sum, a) => sum + a.totalPlays, 0),
      totalSubscribers: DEMO_ARTISTS.reduce((sum, a) => sum + a.subscribers, 0),
      totalBeats: beats.length,
      totalProducers: producerProfiles.length,
      totalServices: prodServices.length,
      updatedAt: new Date().toISOString(),
    }));

    // Mark as seeded
    await kv.set(SEED_FLAG_KEY, JSON.stringify({
      version: 8,
      seededAt: new Date().toISOString(),
      artistCount: DEMO_ARTISTS.length,
      trackCount: allTracks.length,
    }));

    console.log('🌱 Demo data seeding complete!');
    return { seeded: true, message: `Seeded ${DEMO_ARTISTS.length} artists, ${allTracks.length} tracks, ${news.length} news, ${concerts.length} concerts` };

  } catch (error) {
    console.error('❌ Demo data seeding error:', error);
    return { seeded: false, message: `Seed error: ${error}` };
  }
}

/**
 * Принудительный ресид (сбрасывает флаг и засевает заново)
 */
export async function reseedDemoData(): Promise<{ seeded: boolean; message: string }> {
  await kv.del(SEED_FLAG_KEY);
  return seedDemoData();
}