/**
 * DEMO DATA SEED
 * Заполняет KV store демо-данными 12 артистов Promo.music при первом запуске
 * Идемпотентно - не перезаписывает существующие данные
 */

import * as kv from './kv_store.tsx';

const SEED_FLAG_KEY = 'system:demo_seed_v19';

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

// Демо-заказы маркетплейса (разные статусы для демонстрации lifecycle)
function generateMarketplaceOrders(): any[] {
  const now = Date.now();
  const day = 86400000;

  return [
    {
      id: 'sord-demo-1',
      serviceId: 'svc-1',
      serviceTitle: 'Профессиональное сведение',
      serviceType: 'mixing',
      producerId: 'artist-maxam',
      producerName: 'Максам',
      clientId: 'demo-user',
      clientName: 'Демо Пользователь',
      message: 'Нужно свести вокальный трек с минусом, reference - The Weeknd "Blinding Lights"',
      urgency: 'normal',
      price: 8000,
      commission: 800,
      producerPayout: 7200,
      status: 'in_progress',
      progress: 65,
      deliveryDays: 4,
      deadline: new Date(now + 2 * day).toISOString(),
      createdAt: new Date(now - 5 * day).toISOString(),
    },
    {
      id: 'sord-demo-2',
      serviceId: 'svc-2',
      serviceTitle: 'Мастеринг для стримингов',
      serviceType: 'mastering',
      producerId: 'artist-dan',
      producerName: 'Дэн',
      clientId: 'demo-user',
      clientName: 'Демо Пользователь',
      message: 'Мастеринг EP из 4 треков для Spotify и Apple Music',
      urgency: 'fast',
      price: 7500,
      commission: 750,
      producerPayout: 6750,
      status: 'pending',
      progress: 0,
      deliveryDays: 2,
      deadline: null,
      createdAt: new Date(now - 1 * day).toISOString(),
    },
    {
      id: 'sord-demo-3',
      serviceId: 'svc-3',
      serviceTitle: 'Аранжировка под ключ',
      serviceType: 'arrangement',
      producerId: 'artist-alisa',
      producerName: 'Алиса',
      clientId: 'demo-user',
      clientName: 'Демо Пользователь',
      message: 'Аранжировка из голосовой заметки, хочу поп-рок звучание',
      urgency: 'normal',
      price: 15000,
      commission: 1500,
      producerPayout: 13500,
      status: 'completed',
      progress: 100,
      deliveryDays: 6,
      deadline: new Date(now - 1 * day).toISOString(),
      completedAt: new Date(now - 2 * day).toISOString(),
      createdAt: new Date(now - 10 * day).toISOString(),
    },
    {
      id: 'sord-demo-4',
      serviceId: 'svc-6',
      serviceTitle: 'Кастомный бит на заказ',
      serviceType: 'beatmaking',
      producerId: 'artist-timur',
      producerName: 'Тимур',
      clientId: 'demo-user',
      clientName: 'Демо Пользователь',
      message: 'Trap бит 140 BPM, dark vibes, reference - Travis Scott',
      urgency: 'normal',
      price: 10000,
      commission: 1000,
      producerPayout: 9000,
      status: 'revision',
      progress: 80,
      deliveryDays: 5,
      deadline: new Date(now + 1 * day).toISOString(),
      createdAt: new Date(now - 7 * day).toISOString(),
    },
    {
      id: 'sord-demo-5',
      serviceId: 'svc-8',
      serviceTitle: 'Консультация по продакшну',
      serviceType: 'consultation',
      producerId: 'artist-dan',
      producerName: 'Дэн',
      clientId: 'demo-user',
      clientName: 'Демо Пользователь',
      message: 'Хочу обсудить выбор мониторов и акустическую обработку комнаты',
      urgency: 'urgent',
      price: 4000,
      commission: 400,
      producerPayout: 3600,
      status: 'accepted',
      progress: 0,
      deliveryDays: 0,
      deadline: new Date(now + 1 * day).toISOString(),
      createdAt: new Date(now - 2 * day).toISOString(),
    },
  ];
}

// Демо-цифровые товары маркетплейса
function generateDigitalGoods(): any[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'dg-sp-1',
      title: 'Lo-Fi Essentials Vol.2',
      producer: 'Максам',
      producerId: 'artist-maxam',
      category: 'sample_pack',
      description: 'Коллекция из 150+ lo-fi сэмплов: пластиночный шум, приглушённые перкуссии, тёплые клавиши и атмосферные текстуры.',
      price: 1200,
      tags: ['lo-fi', 'chill', 'vinyl', 'ambient'],
      fileSize: '320 MB',
      format: 'WAV 24bit',
      rating: 4.7,
      sales: 84,
      views: 1240,
      status: 'active',
      createdAt: now,
    },
    {
      id: 'dg-pr-1',
      title: 'Analog Warmth - Serum Presets',
      producer: 'Дэн',
      producerId: 'artist-dan',
      category: 'preset',
      description: '64 пресета для Serum с аналоговым характером: плотные басы, текстурные пэды и цепляющие лиды.',
      price: 900,
      tags: ['serum', 'synth', 'analog', 'bass'],
      fileSize: '45 MB',
      format: 'FXP',
      rating: 4.5,
      sales: 123,
      views: 2100,
      status: 'active',
      createdAt: now,
    },
    {
      id: 'dg-dk-1',
      title: 'Trap Weapons - Drum Kit',
      producer: 'Тимур',
      producerId: 'artist-timur',
      category: 'drum_kit',
      description: '200 ударных сэмплов: 808, хэты, снейры и перкуссия. Обработаны и готовы к использованию.',
      price: 700,
      tags: ['trap', '808', 'drums', 'hats'],
      fileSize: '180 MB',
      format: 'WAV',
      rating: 4.8,
      sales: 256,
      views: 3400,
      status: 'active',
      createdAt: now,
    },
    {
      id: 'dg-tpl-1',
      title: 'Pop Hit - Ableton Template',
      producer: 'Алиса',
      producerId: 'artist-alisa',
      category: 'template',
      description: 'Полный проект Ableton Live 11 в стиле современного попа. Включает аранжировку, микс и маршрутизацию.',
      price: 2500,
      tags: ['ableton', 'pop', 'template', 'mix'],
      fileSize: '650 MB',
      format: 'ALS',
      rating: 4.3,
      sales: 45,
      views: 890,
      status: 'active',
      createdAt: now,
    },
    {
      id: 'dg-tut-1',
      title: 'Вокальный микс от А до Я',
      producer: 'Максам',
      producerId: 'artist-maxam',
      category: 'tutorial',
      description: 'Видеокурс из 12 уроков: от записи вокала до финального микса. Практические примеры, пресеты и шаблоны.',
      price: 3500,
      tags: ['вокал', 'микс', 'обучение', 'видео'],
      fileSize: '4.2 GB',
      format: 'MP4 + PDF',
      rating: 4.9,
      sales: 67,
      views: 1560,
      status: 'active',
      createdAt: now,
    },
    {
      id: 'dg-lp-1',
      title: 'Organic Textures - Loop Pack',
      producer: 'Дэн',
      producerId: 'artist-dan',
      category: 'loop',
      description: '80 органических лупов: гитарные текстуры, фортепианные пассажи, струнные арпеджио. Все в тональности.',
      price: 800,
      tags: ['loops', 'guitar', 'piano', 'organic'],
      fileSize: '240 MB',
      format: 'WAV 48kHz',
      rating: 4.4,
      sales: 98,
      views: 1780,
      status: 'active',
      createdAt: now,
    },
    {
      id: 'dg-sp-2',
      title: 'R&B Vocal Chops',
      producer: 'Сандра',
      producerId: 'artist-sandra',
      category: 'sample_pack',
      description: '100 вокальных чопов в стиле R&B: фразы, адлибы, гармонии. Обработаны с ревером и задержками.',
      price: 1500,
      tags: ['rnb', 'vocal', 'chops', 'soul'],
      fileSize: '280 MB',
      format: 'WAV',
      rating: 4.6,
      sales: 72,
      views: 1120,
      status: 'active',
      createdAt: now,
    },
    {
      id: 'dg-pr-2',
      title: 'Vintage Keys - Kontakt Library',
      producer: 'Тимур',
      producerId: 'artist-timur',
      category: 'preset',
      description: 'Библиотека Kontakt с 24 сэмплированными клавишными: Rhodes, Wurlitzer, Clavinet и классические синтезаторы.',
      price: 4200,
      tags: ['kontakt', 'keys', 'vintage', 'rhodes'],
      fileSize: '1.8 GB',
      format: 'NKI',
      rating: 4.7,
      sales: 34,
      views: 670,
      status: 'active',
      createdAt: now,
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

// =====================================================
// VENUE CABINET PROFILES (for demo venue accounts)
// =====================================================
function generateVenueProfiles(): any[] {
  return [
    {
      id: 'venue-1', userId: 'venue-1', venueName: 'Bar Decor',
      description: 'Атмосферный бар с живой музыкой и авторскими коктейлями. Каждый вечер - джазовые и соул-сеты от лучших артистов города.',
      venueType: 'bar', address: 'ул. Мясницкая, 24/7', city: 'Москва', country: 'Россия',
      capacity: 120, genres: ['Jazz', 'Soul', 'Funk'],
      logoUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=400&fit=crop',
      socialLinks: { instagram: '@bardecor_msk', vk: 'bardecor' },
      workingHours: 'Пн-Чт 18:00-02:00, Пт-Сб 18:00-04:00, Вс выходной',
      status: 'active', verified: true,
      subscriptionStatus: 'active', subscriptionPlan: 'business',
      subscriptionStartDate: '2025-09-01', subscriptionEndDate: '2026-09-01',
      createdAt: '2025-08-15T10:00:00Z', updatedAt: new Date().toISOString(),
    },
    {
      id: 'venue-2', userId: 'venue-2', venueName: 'Lounge 21',
      description: 'Лаунж-бар с панорамным видом на Неву и DJ-сетами каждый вечер. Премиум-атмосфера и коктейльная карта.',
      venueType: 'lounge', address: 'Невский пр., 21', city: 'Санкт-Петербург', country: 'Россия',
      capacity: 80, genres: ['Lounge', 'Deep House', 'Chill'],
      logoUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&h=400&fit=crop',
      socialLinks: { instagram: '@lounge21_spb', website: 'https://lounge21.ru' },
      workingHours: 'Ежедневно 17:00-03:00',
      status: 'active', verified: true,
      subscriptionStatus: 'active', subscriptionPlan: 'enterprise',
      subscriptionStartDate: '2025-06-01', subscriptionEndDate: '2026-06-01',
      createdAt: '2025-05-20T10:00:00Z', updatedAt: new Date().toISOString(),
    },
    {
      id: 'venue-3', userId: 'venue-3', venueName: 'Sky Rooftop',
      description: 'Руфтоп-ресторан с видом на город. Живая музыка, DJ-сеты и гастрономический опыт на высоте.',
      venueType: 'restaurant', address: 'ул. Пушкина, 12', city: 'Казань', country: 'Россия',
      capacity: 200, genres: ['House', 'Pop', 'Lounge'],
      logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop',
      socialLinks: { instagram: '@skyrooftop_kzn' },
      workingHours: 'Ежедневно 12:00-00:00',
      status: 'active', verified: true,
      subscriptionStatus: 'active', subscriptionPlan: 'start',
      subscriptionStartDate: '2025-12-01', subscriptionEndDate: '2026-12-01',
      createdAt: '2025-11-10T10:00:00Z', updatedAt: new Date().toISOString(),
    },
  ];
}

// Venue analytics demo data
function generateVenueAnalytics(): any[] {
  return [
    {
      venueId: 'venue-1',
      totalPlaylists: 8, totalTracks: 342, totalPlaytime: 18240,
      averageRating: 4.7, totalReviews: 23, connectedRadios: 2,
      totalImpressions: 45200, uniqueListeners: 12800, reachGrowth: 28.5,
      monthlySpending: 35000, spendingGrowth: -5.2,
      avgROI: 185.3, conversionRate: 12.4, engagementRate: 82.3,
    },
    {
      venueId: 'venue-2',
      totalPlaylists: 12, totalTracks: 520, totalPlaytime: 31200,
      averageRating: 4.9, totalReviews: 41, connectedRadios: 3,
      totalImpressions: 89500, uniqueListeners: 28400, reachGrowth: 42.1,
      monthlySpending: 78000, spendingGrowth: 12.8,
      avgROI: 245.7, conversionRate: 18.2, engagementRate: 91.0,
    },
    {
      venueId: 'venue-3',
      totalPlaylists: 5, totalTracks: 180, totalPlaytime: 9600,
      averageRating: 4.5, totalReviews: 12, connectedRadios: 1,
      totalImpressions: 21300, uniqueListeners: 6500, reachGrowth: 15.8,
      monthlySpending: 18000, spendingGrowth: -2.1,
      avgROI: 120.4, conversionRate: 8.6, engagementRate: 74.5,
    },
  ];
}

// Venue ad campaigns
function generateVenueCampaigns(): Record<string, any[]> {
  return {
    'venue-1': [
      { id: 'vc-1', name: 'Джазовые вечера - Февраль', radioStation: 'PROMO.FM', status: 'active', totalSpent: 15000, impressions: 18500, startDate: '2026-02-01', endDate: '2026-02-28', createdAt: '2026-01-28T10:00:00Z' },
      { id: 'vc-2', name: 'Пятничный хэппи-ауэр', radioStation: 'Sound Wave', status: 'completed', totalSpent: 8000, impressions: 12300, startDate: '2026-01-15', endDate: '2026-01-31', createdAt: '2026-01-10T10:00:00Z' },
      { id: 'vc-3', name: 'Новогодняя ночь', radioStation: 'Night Vibes', status: 'completed', totalSpent: 25000, impressions: 45000, startDate: '2025-12-20', endDate: '2026-01-02', createdAt: '2025-12-15T10:00:00Z' },
    ],
    'venue-2': [
      { id: 'vc-4', name: 'Deep House Weekend', radioStation: 'Sound Wave', status: 'active', totalSpent: 32000, impressions: 42000, startDate: '2026-02-01', endDate: '2026-03-01', createdAt: '2026-01-25T10:00:00Z' },
      { id: 'vc-5', name: 'Valentine Special', radioStation: 'PROMO.FM', status: 'active', totalSpent: 18000, impressions: 28500, startDate: '2026-02-08', endDate: '2026-02-15', createdAt: '2026-02-01T10:00:00Z' },
      { id: 'vc-6', name: 'Winter Lounge', radioStation: 'Night Vibes', status: 'completed', totalSpent: 28000, impressions: 38000, startDate: '2025-12-01', endDate: '2026-01-31', createdAt: '2025-11-25T10:00:00Z' },
    ],
    'venue-3': [
      { id: 'vc-7', name: 'Sky Party Launch', radioStation: 'Retro Gold', status: 'active', totalSpent: 12000, impressions: 15800, startDate: '2026-02-01', endDate: '2026-02-28', createdAt: '2026-01-28T10:00:00Z' },
      { id: 'vc-8', name: 'Sunset Sessions', radioStation: 'PROMO.FM', status: 'completed', totalSpent: 6000, impressions: 9200, startDate: '2026-01-10', endDate: '2026-01-25', createdAt: '2026-01-08T10:00:00Z' },
    ],
  };
}

// Venue spending history (daily data)
function generateVenueSpending(venueId: string): any[] {
  const result: any[] = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    result.push({
      date: date.toLocaleDateString('ru-RU'),
      amount: Math.round((500 + Math.random() * 3000) * 100) / 100,
    });
  }
  return result;
}

// =====================================================
// RADIO STATION PROFILES (for demo radio accounts)
// =====================================================
function generateRadioStations(): any[] {
  return [
    {
      id: 'station-1', userId: 'radio-1', stationName: 'PROMO.FM',
      description: 'Главное промо-радио России. Хиты, новинки и эксклюзивные премьеры каждый день.',
      frequency: 'FM 100.5', city: 'Москва', country: 'Россия',
      formats: ['Pop', 'Hits'], audienceSize: 1200000,
      logoUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop',
      streamUrl: 'https://stream.promofm.ru/live', isOnline: true,
      socialLinks: { instagram: '@promofm', vk: 'promofm', telegram: '@promofm_news' },
      createdAt: '2024-01-01T10:00:00Z', updatedAt: new Date().toISOString(),
    },
    {
      id: 'station-2', userId: 'radio-2', stationName: 'Sound Wave',
      description: 'Электронная музыка 24/7. Dance, House, Techno - лучшие DJ-сеты и миксы.',
      frequency: 'FM 95.3', city: 'Санкт-Петербург', country: 'Россия',
      formats: ['Electronic', 'Dance'], audienceSize: 680000,
      logoUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
      streamUrl: 'https://stream.soundwave.ru/live', isOnline: true,
      socialLinks: { instagram: '@soundwave_spb', telegram: '@soundwave_radio' },
      createdAt: '2024-03-15T10:00:00Z', updatedAt: new Date().toISOString(),
    },
    {
      id: 'station-3', userId: 'radio-3', stationName: 'Retro Gold',
      description: 'Золотые хиты прошлых десятилетий. Лучшая музыка 80-х, 90-х и 2000-х.',
      frequency: 'FM 88.7', city: 'Казань', country: 'Россия',
      formats: ['Retro', 'Classics'], audienceSize: 430000,
      logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop',
      streamUrl: 'https://stream.retrogold.ru/live', isOnline: true,
      socialLinks: { vk: 'retrogold_kzn' },
      createdAt: '2024-06-01T10:00:00Z', updatedAt: new Date().toISOString(),
    },
    {
      id: 'station-4', userId: 'radio-4', stationName: 'Night Vibes',
      description: 'Ночное радио для ценителей R&B, Hip-Hop и Urban. Эксклюзивные премьеры до 3 утра.',
      frequency: 'FM 103.2', city: 'Москва', country: 'Россия',
      formats: ['R&B', 'Hip-Hop'], audienceSize: 920000,
      logoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop',
      streamUrl: 'https://stream.nightvibes.ru/live', isOnline: true,
      socialLinks: { instagram: '@nightvibes_msk', telegram: '@nightvibes' },
      createdAt: '2024-02-10T10:00:00Z', updatedAt: new Date().toISOString(),
    },
  ];
}

// Radio ad slots
function generateRadioAdSlots(): Record<string, any[]> {
  const slots: Record<string, any[]> = {};
  const stations = ['station-1', 'station-2', 'station-3', 'station-4'];
  const timeSlots = ['06:00-10:00', '10:00-14:00', '14:00-18:00', '18:00-22:00', '22:00-02:00'];
  const slotTypes = ['premium', 'standard', 'economy'];

  stations.forEach(stationId => {
    slots[stationId] = timeSlots.map((ts, i) => ({
      id: `slot-${stationId}-${i + 1}`,
      stationId,
      slotType: slotTypes[i % slotTypes.length],
      timeSlot: ts,
      price: [5000, 3000, 2000, 4000, 1500][i],
      duration: 30,
      maxPerHour: [3, 4, 5, 3, 6][i],
      description: `Рекламный слот ${ts}`,
      status: 'available',
      createdAt: '2025-12-01T10:00:00Z',
      updatedAt: new Date().toISOString(),
    }));
  });

  return slots;
}

// Radio artist requests
function generateRadioArtistRequests(): Record<string, any[]> {
  const artists = DEMO_ARTISTS.slice(0, 8);
  const result: Record<string, any[]> = {};
  const stations = ['station-1', 'station-2', 'station-3', 'station-4'];

  stations.forEach(stationId => {
    result[stationId] = artists.slice(0, 3 + Math.floor(Math.random() * 3)).map((a, i) => ({
      id: `req-${stationId}-${i + 1}`,
      artistId: a.id,
      artistName: a.name,
      artistAvatar: a.avatar,
      genre: a.genre,
      trackTitle: `${a.name} - Новый сингл`,
      trackId: `track-${a.slug}-1`,
      message: `Здравствуйте! Прошу рассмотреть мой трек для ротации на вашей станции. Жанр: ${a.genre}.`,
      status: ['pending', 'pending', 'accepted', 'rejected'][i % 4],
      respondedAt: i >= 2 ? new Date(Date.now() - i * 86400000).toISOString() : null,
      createdAt: new Date(Date.now() - (i + 1) * 2 * 86400000).toISOString(),
    }));
  });

  return result;
}

// Radio finance data
function generateRadioFinance(): Record<string, any> {
  const result: Record<string, any> = {};
  const stations = [
    { id: 'station-1', total: 2850000, monthly: 285000 },
    { id: 'station-2', total: 1420000, monthly: 142000 },
    { id: 'station-3', total: 680000, monthly: 68000 },
    { id: 'station-4', total: 1950000, monthly: 195000 },
  ];

  stations.forEach(s => {
    result[s.id] = {
      totalRevenue: s.total,
      monthlyRevenue: s.monthly,
      adRevenue: Math.round(s.monthly * 0.65),
      subscriptionRevenue: Math.round(s.monthly * 0.35),
      pendingPayments: Math.round(s.monthly * 0.12),
      growth: +(5 + Math.random() * 20).toFixed(1),
    };
  });

  return result;
}

// Radio transactions
function generateRadioTransactions(): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  const stations = ['station-1', 'station-2', 'station-3', 'station-4'];
  const types = ['ad_payment', 'subscription', 'payout', 'commission'];
  const venueNames = ['Bar Decor', 'Lounge 21', 'Sky Rooftop', 'NEON Club', 'Vinyl Cafe'];

  stations.forEach(stationId => {
    result[stationId] = Array.from({ length: 12 }, (_, i) => {
      const type = types[i % types.length];
      const amount = type === 'payout' ? -(10000 + Math.random() * 50000) : (2000 + Math.random() * 15000);
      return {
        id: `tx-${stationId}-${i + 1}`,
        type,
        amount: Math.round(amount),
        description: type === 'ad_payment'
          ? `Оплата рекламы - ${venueNames[i % venueNames.length]}`
          : type === 'subscription'
          ? 'Подписка Premium'
          : type === 'payout'
          ? 'Вывод средств'
          : 'Комиссия платформы 10%',
        status: i < 2 ? 'pending' : 'completed',
        date: new Date(Date.now() - i * 3 * 86400000).toISOString(),
      };
    });
  });

  return result;
}

// Radio notifications
function generateRadioNotifications(): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  const stations = ['station-1', 'station-2', 'station-3', 'station-4'];
  const templates = [
    { type: 'artist_request', title: 'Новая заявка на ротацию', message: 'Артист {name} отправил трек на рассмотрение' },
    { type: 'payment_received', title: 'Получена оплата', message: 'Оплата рекламного слота: {amount} руб.' },
    { type: 'campaign_started', title: 'Кампания запущена', message: 'Рекламная кампания "{name}" начала трансляцию' },
    { type: 'slot_booked', title: 'Слот забронирован', message: 'Рекламный слот {time} забронирован заведением {venue}' },
    { type: 'system', title: 'Обновление платформы', message: 'Доступна новая версия аналитики Promo.air' },
    { type: 'artist_request', title: 'Трек одобрен автоматически', message: 'Трек "{track}" прошел автоматическую модерацию' },
  ];

  stations.forEach(stationId => {
    result[stationId] = templates.map((t, i) => ({
      id: `rn-${stationId}-${i + 1}`,
      type: t.type,
      title: t.title,
      message: t.message
        .replace('{name}', DEMO_ARTISTS[i % DEMO_ARTISTS.length].name)
        .replace('{amount}', String(3000 + i * 2000))
        .replace('{time}', '14:00-18:00')
        .replace('{venue}', ['Bar Decor', 'Lounge 21', 'Sky Rooftop'][i % 3])
        .replace('{track}', 'Новый хит'),
      read: i >= 3,
      priority: i < 2 ? 'high' : 'normal',
      createdAt: new Date(Date.now() - i * 4 * 3600000).toISOString(),
    }));
  });

  return result;
}

// Radio venue requests (ad requests from venues)
function generateRadioVenueRequests(): Record<string, any[]> {
  return {
    'station-1': [
      {
        id: 'vreq-s1-1', venueId: 'venue-1', venueName: 'Bar Decor', venueType: 'bar',
        venueCity: 'Москва', venuePhone: '+7 (495) 123-45-67', venueRating: 4.7,
        packageId: 'pkg-s1-1', packageType: '15sec', duration: 15,
        audioUrl: 'https://example.com/ads/bar-decor-promo.mp3', audioFileName: 'bar-decor-promo.mp3', audioDuration: 14.8,
        timeSlots: ['evening', 'prime_time'], playsPerDay: 10, durationDays: 7,
        startDate: '2026-02-05', endDate: '2026-02-11',
        totalPrice: 15000, stationPayout: 12750, platformFee: 2250,
        totalPlays: 70, targetPlays: 70, completedPlays: 35, impressions: 105000,
        status: 'in_progress', submittedAt: '2026-02-01T10:30:00Z', approvedAt: '2026-02-01T14:00:00Z',
      },
      {
        id: 'vreq-s1-2', venueId: 'venue-2', venueName: 'Lounge 21', venueType: 'lounge',
        venueCity: 'Санкт-Петербург', venuePhone: '+7 (812) 987-65-43', venueRating: 4.9,
        packageId: 'pkg-s1-2', packageType: '30sec', duration: 30,
        audioUrl: 'https://example.com/ads/lounge21-ad.mp3', audioFileName: 'lounge21-ad.mp3', audioDuration: 29.5,
        timeSlots: ['night', 'prime_time'], playsPerDay: 5, durationDays: 7,
        startDate: '2026-02-10', endDate: '2026-02-16',
        totalPrice: 35000, stationPayout: 29750, platformFee: 5250,
        totalPlays: 35, targetPlays: 35, completedPlays: 0, impressions: 0,
        status: 'pending', submittedAt: '2026-02-08T09:15:00Z',
      },
      {
        id: 'vreq-s1-3', venueId: 'venue-3', venueName: 'Sky Rooftop', venueType: 'restaurant',
        venueCity: 'Казань', venueRating: 4.5,
        packageId: 'pkg-s1-3', packageType: '10sec', duration: 10,
        audioUrl: 'https://example.com/ads/sky-rooftop.mp3', audioFileName: 'sky-rooftop-ad.mp3', audioDuration: 9.8,
        timeSlots: ['day', 'evening'], playsPerDay: 12, durationDays: 14,
        startDate: '2026-02-01', endDate: '2026-02-14',
        totalPrice: 8000, stationPayout: 6800, platformFee: 1200,
        totalPlays: 168, targetPlays: 168, completedPlays: 168, impressions: 252000,
        status: 'completed', submittedAt: '2026-01-25T11:00:00Z', approvedAt: '2026-01-25T15:30:00Z', completedAt: '2026-02-14T23:59:00Z',
      },
    ],
    'station-2': [
      {
        id: 'vreq-s2-1', venueId: 'venue-2', venueName: 'Lounge 21', venueType: 'lounge',
        venueCity: 'Санкт-Петербург', venuePhone: '+7 (812) 987-65-43', venueRating: 4.9,
        packageId: 'pkg-s2-1', packageType: '15sec', duration: 15,
        audioUrl: 'https://example.com/ads/lounge21-deep.mp3', audioFileName: 'lounge21-deep-house.mp3', audioDuration: 14.5,
        timeSlots: ['evening', 'night'], playsPerDay: 8, durationDays: 14,
        startDate: '2026-02-01', endDate: '2026-02-14',
        totalPrice: 22000, stationPayout: 18700, platformFee: 3300,
        totalPlays: 112, targetPlays: 112, completedPlays: 56, impressions: 84000,
        status: 'in_progress', submittedAt: '2026-01-28T14:00:00Z', approvedAt: '2026-01-29T10:00:00Z',
      },
      {
        id: 'vreq-s2-2', venueId: 'venue-1', venueName: 'Bar Decor', venueType: 'bar',
        venueCity: 'Москва', venuePhone: '+7 (495) 123-45-67', venueRating: 4.7,
        packageId: 'pkg-s2-2', packageType: '15sec', duration: 15,
        audioUrl: 'https://example.com/ads/bar-decor-electronic.mp3', audioFileName: 'bar-decor-electronic.mp3', audioDuration: 14.2,
        timeSlots: ['morning', 'day'], playsPerDay: 6, durationDays: 7,
        startDate: '2026-02-15', endDate: '2026-02-21',
        totalPrice: 10500, stationPayout: 8925, platformFee: 1575,
        totalPlays: 42, targetPlays: 42, completedPlays: 0, impressions: 0,
        status: 'pending', submittedAt: '2026-02-07T16:45:00Z',
      },
    ],
    'station-3': [
      {
        id: 'vreq-s3-1', venueId: 'venue-3', venueName: 'Sky Rooftop', venueType: 'restaurant',
        venueCity: 'Казань', venueRating: 4.5,
        packageId: 'pkg-s3-1', packageType: '30sec', duration: 30,
        audioUrl: 'https://example.com/ads/sky-retro.mp3', audioFileName: 'sky-rooftop-retro.mp3', audioDuration: 28.9,
        timeSlots: ['day', 'evening'], playsPerDay: 4, durationDays: 30,
        startDate: '2026-02-01', endDate: '2026-03-02',
        totalPrice: 18000, stationPayout: 15300, platformFee: 2700,
        totalPlays: 120, targetPlays: 120, completedPlays: 24, impressions: 36000,
        status: 'in_progress', submittedAt: '2026-01-20T12:00:00Z', approvedAt: '2026-01-21T09:00:00Z',
      },
    ],
    'station-4': [
      {
        id: 'vreq-s4-1', venueId: 'venue-1', venueName: 'Bar Decor', venueType: 'bar',
        venueCity: 'Москва', venuePhone: '+7 (495) 123-45-67', venueRating: 4.7,
        packageId: 'pkg-s4-1', packageType: '15sec', duration: 15,
        audioUrl: 'https://example.com/ads/bar-decor-night.mp3', audioFileName: 'bar-decor-night-vibes.mp3', audioDuration: 14.6,
        timeSlots: ['night', 'prime_time'], playsPerDay: 10, durationDays: 7,
        startDate: '2026-02-08', endDate: '2026-02-14',
        totalPrice: 20000, stationPayout: 17000, platformFee: 3000,
        totalPlays: 70, targetPlays: 70, completedPlays: 70, impressions: 140000,
        status: 'completed', submittedAt: '2026-01-30T13:20:00Z', approvedAt: '2026-01-31T10:00:00Z', completedAt: '2026-02-14T23:59:00Z',
      },
      {
        id: 'vreq-s4-2', venueId: 'venue-2', venueName: 'Lounge 21', venueType: 'lounge',
        venueCity: 'Санкт-Петербург', venueRating: 4.9,
        packageId: 'pkg-s4-2', packageType: '10sec', duration: 10,
        audioUrl: 'https://example.com/ads/lounge21-night.mp3', audioFileName: 'lounge21-night-vibes.mp3', audioDuration: 9.5,
        timeSlots: ['evening', 'night'], playsPerDay: 8, durationDays: 7,
        startDate: '2026-02-20', endDate: '2026-02-26',
        totalPrice: 12000, stationPayout: 10200, platformFee: 1800,
        totalPlays: 56, targetPlays: 56, completedPlays: 0, impressions: 0,
        status: 'approved', submittedAt: '2026-02-10T11:00:00Z', approvedAt: '2026-02-10T16:30:00Z',
      },
    ],
  };
}

// Demo bookings between venues and artists
function generateDemoBookings(): any[] {
  return [
    {
      id: 'booking-demo-1', requesterId: 'venue-1', requesterType: 'venue', performerId: 'artist-alisa', performerType: 'artist',
      eventType: 'live', eventTitle: 'Jazz Night - Алиса', eventDescription: 'Джазовый вечер с живым выступлением',
      eventDate: '2026-02-21', startTime: '20:00', durationHours: 3,
      venueName: 'Bar Decor', venueAddress: 'ул. Мясницкая, 24/7', venueCity: 'Москва',
      offeredPrice: 15000, performerFee: 13500, platformCommission: 1500, depositAmount: 4500, finalAmount: 10500,
      status: 'deposit_paid', depositPaidAt: '2026-02-05T14:00:00Z',
      performer: { id: 'artist-alisa', displayName: 'Алиса', avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop' },
      requester: { id: 'venue-1', displayName: 'Bar Decor' },
      createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-05T14:00:00Z',
    },
    {
      id: 'booking-demo-2', requesterId: 'venue-2', requesterType: 'venue', performerId: 'artist-dan', performerType: 'artist',
      eventType: 'dj_set', eventTitle: 'Deep House Friday - Дэн', eventDescription: 'DJ-сет в лаунже',
      eventDate: '2026-02-28', startTime: '22:00', durationHours: 4,
      venueName: 'Lounge 21', venueAddress: 'Невский пр., 21', venueCity: 'Санкт-Петербург',
      offeredPrice: 20000, performerFee: 18000, platformCommission: 2000, depositAmount: 6000, finalAmount: 14000,
      status: 'accepted', acceptedAt: '2026-02-08T12:00:00Z',
      performer: { id: 'artist-dan', displayName: 'Дэн', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
      requester: { id: 'venue-2', displayName: 'Lounge 21' },
      createdAt: '2026-02-06T10:00:00Z', updatedAt: '2026-02-08T12:00:00Z',
    },
    {
      id: 'booking-demo-3', requesterId: 'venue-1', requesterType: 'venue', performerId: 'artist-sandra', performerType: 'artist',
      eventType: 'concert', eventTitle: 'Сандра - Огни города', eventDescription: 'Концерт-презентация нового сингла',
      eventDate: '2026-03-08', startTime: '21:00', durationHours: 2,
      venueName: 'Bar Decor', venueAddress: 'ул. Мясницкая, 24/7', venueCity: 'Москва',
      offeredPrice: 25000, performerFee: 22500, platformCommission: 2500, depositAmount: 7500, finalAmount: 17500,
      status: 'pending',
      performer: { id: 'artist-sandra', displayName: 'Сандра', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
      requester: { id: 'venue-1', displayName: 'Bar Decor' },
      createdAt: '2026-02-09T10:00:00Z', updatedAt: '2026-02-09T10:00:00Z',
    },
    {
      id: 'booking-demo-4', requesterId: 'venue-3', requesterType: 'venue', performerId: 'artist-mark', performerType: 'artist',
      eventType: 'dj_set', eventTitle: 'Rooftop Sunset - Марк', eventDescription: 'DJ-сет на крыше',
      eventDate: '2026-02-22', startTime: '18:00', durationHours: 5,
      venueName: 'Sky Rooftop', venueAddress: 'ул. Пушкина, 12', venueCity: 'Казань',
      offeredPrice: 20000, performerFee: 18000, platformCommission: 2000, depositAmount: 6000, finalAmount: 14000,
      status: 'confirmed', depositPaidAt: '2026-02-04T10:00:00Z', fullPaymentAt: '2026-02-10T14:00:00Z',
      performer: { id: 'artist-mark', displayName: 'Марк', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
      requester: { id: 'venue-3', displayName: 'Sky Rooftop' },
      createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-10T14:00:00Z',
    },
    {
      id: 'booking-demo-5', requesterId: 'venue-2', requesterType: 'venue', performerId: 'artist-stella', performerType: 'artist',
      eventType: 'dj_set', eventTitle: 'Ночные Волны Live - Стелла', eventDescription: 'Прямой эфир шоу из лаунж-бара',
      eventDate: '2026-03-01', startTime: '23:00', durationHours: 3,
      venueName: 'Lounge 21', venueAddress: 'Невский пр., 21', venueCity: 'Санкт-Петербург',
      offeredPrice: 18000, performerFee: 16200, platformCommission: 1800, depositAmount: 5400, finalAmount: 12600,
      status: 'pending',
      performer: { id: 'artist-stella', displayName: 'Стелла', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
      requester: { id: 'venue-2', displayName: 'Lounge 21' },
      createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-10T10:00:00Z',
    },
    {
      id: 'booking-demo-6', requesterId: 'venue-1', requesterType: 'venue', performerId: 'artist-liana', performerType: 'artist',
      eventType: 'live', eventTitle: 'R&B Night - Лиана', eventDescription: 'Вечер R&B с живым вокалом',
      eventDate: '2026-01-25', startTime: '21:00', durationHours: 2,
      venueName: 'Bar Decor', venueAddress: 'ул. Мясницкая, 24/7', venueCity: 'Москва',
      offeredPrice: 12000, performerFee: 10800, platformCommission: 1200, depositAmount: 3600, finalAmount: 8400,
      status: 'completed', completedAt: '2026-01-26T02:00:00Z',
      performer: { id: 'artist-liana', displayName: 'Лиана', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
      requester: { id: 'venue-1', displayName: 'Bar Decor' },
      createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-01-26T02:00:00Z',
    },
  ];
}

// =====================================================
// ACCOUNTING DATA (admin cabinet)
// =====================================================

function generateAccountingData() {
  const reports = [
    {
      id: 1, type: 'vat', period: '2026-Q1', taxPeriod: 'quarter', status: 'accepted',
      amount: 5840000, taxAmount: 1051200, deadline: '2026-04-25',
      createdAt: '2026-04-15T10:30:00', sentAt: '2026-04-20T14:20:00', acceptedAt: '2026-04-22T09:15:00',
      fileName: 'VAT_Q1_2026.xml', inn: '7701234567', kpp: '770101001', oktmo: '45000000',
    },
    {
      id: 2, type: 'profit', period: '2026-01', taxPeriod: 'month', status: 'sent',
      amount: 2450000, taxAmount: 490000, deadline: '2026-02-28',
      createdAt: '2026-02-20T11:00:00', sentAt: '2026-02-25T16:45:00',
      fileName: 'PROFIT_JAN_2026.xml', inn: '7701234567', kpp: '770101001', oktmo: '45000000',
    },
    {
      id: 3, type: 'usn', period: '2025', taxPeriod: 'year', status: 'ready',
      amount: 18650000, taxAmount: 1119000, deadline: '2026-03-31',
      createdAt: '2026-03-10T09:00:00',
      fileName: 'USN_2025.xml', inn: '7701234567', kpp: '770101001', oktmo: '45000000',
    },
    {
      id: 4, type: 'insurance', period: '2026-01', taxPeriod: 'month', status: 'draft',
      amount: 850000, taxAmount: 255000, deadline: '2026-02-15',
      createdAt: '2026-02-05T14:30:00', inn: '7701234567', kpp: '770101001', oktmo: '45000000',
    },
    {
      id: 5, type: 'salary', period: '2026-01', taxPeriod: 'month', status: 'accepted',
      amount: 1250000, taxAmount: 162500, deadline: '2026-02-05',
      createdAt: '2026-01-31T16:00:00', sentAt: '2026-02-03T10:30:00', acceptedAt: '2026-02-04T15:20:00',
      fileName: 'SALARY_JAN_2026.xml', inn: '7701234567', kpp: '770101001', oktmo: '45000000',
    },
    {
      id: 6, type: 'vat', period: '2026-02', taxPeriod: 'month', status: 'rejected',
      amount: 1980000, taxAmount: 356400, deadline: '2026-03-25',
      createdAt: '2026-03-15T11:20:00', sentAt: '2026-03-20T13:45:00',
      fileName: 'VAT_FEB_2026.xml', inn: '7701234567', kpp: '770101001', oktmo: '45000000',
    },
  ];

  const documents = [
    {
      id: 1, type: 'invoice', number: 'СЧ-00245', date: '2026-02-01',
      counterparty: 'ООО "МузТех"', counterpartyINN: '7704567890',
      amount: 125000, vatAmount: 22500, vatRate: 18, status: 'paid',
      description: 'Подписка Premium - 245 пользователей',
      paymentDeadline: '2026-02-15', paidAt: '2026-02-10',
      attachments: ['invoice_245.pdf', 'act_245.pdf'],
    },
    {
      id: 2, type: 'act', number: 'АКТ-00123', date: '2026-01-31',
      counterparty: 'ИП Волков А.С.', counterpartyINN: '771234567890',
      amount: 65000, vatAmount: 11700, vatRate: 18, status: 'issued',
      description: 'Продвижение треков - январь 2026',
      paymentDeadline: '2026-02-14', attachments: ['act_123.pdf'],
    },
    {
      id: 3, type: 'receipt', number: 'КВ-00456', date: '2026-01-30',
      counterparty: 'АО "Русское Радио"', counterpartyINN: '7705123456',
      amount: 42000, vatAmount: 7560, vatRate: 18, status: 'paid',
      description: 'Партнерская программа - январь',
      paidAt: '2026-01-30', attachments: ['receipt_456.pdf'],
    },
    {
      id: 4, type: 'invoice', number: 'СЧ-00246', date: '2026-01-29',
      counterparty: 'ООО "Продакшн Студия"', counterpartyINN: '7706789012',
      amount: 180000, vatAmount: 32400, vatRate: 18, status: 'issued',
      description: 'Production 360 - Full Package',
      paymentDeadline: '2026-02-12', attachments: ['invoice_246.pdf'],
    },
    {
      id: 5, type: 'waybill', number: 'ТТН-00089', date: '2026-01-28',
      counterparty: 'ООО "Серверные решения"', counterpartyINN: '7707654321',
      amount: 45000, vatAmount: 8100, vatRate: 18, status: 'paid',
      description: 'Серверное оборудование',
      paidAt: '2026-01-28', attachments: ['waybill_089.pdf'],
    },
  ];

  const ledger = [
    { id: 1, date: '2026-02-01', documentNumber: 'СЧ-00245', counterparty: 'ООО "МузТех"', operation: 'Поступление от покупателя', debit: '51', credit: '62.01', amount: 125000, description: 'Оплата по счету СЧ-00245' },
    { id: 2, date: '2026-01-31', documentNumber: 'АКТ-00123', counterparty: 'ИП Волков А.С.', operation: 'Оказание услуг', debit: '62.01', credit: '90.01', amount: 65000, description: 'Выручка от оказания услуг' },
    { id: 3, date: '2026-01-31', documentNumber: 'АКТ-00123', counterparty: 'ИП Волков А.С.', operation: 'Начисление НДС', debit: '90.03', credit: '68.02', amount: 11700, description: 'НДС с выручки' },
    { id: 4, date: '2026-01-30', documentNumber: 'КВ-00456', counterparty: 'АО "Русское Радио"', operation: 'Поступление от покупателя', debit: '51', credit: '62.01', amount: 42000, description: 'Оплата партнерских услуг' },
    { id: 5, date: '2026-01-28', documentNumber: 'ТТН-00089', counterparty: 'ООО "Серверные решения"', operation: 'Оплата поставщику', debit: '60.01', credit: '51', amount: 45000, description: 'Оплата за серверное оборудование' },
    { id: 6, date: '2026-02-05', documentNumber: 'ЗП-00001', counterparty: 'Сотрудники', operation: 'Начисление зарплаты', debit: '44', credit: '70', amount: 850000, description: 'Зарплата за январь 2026' },
    { id: 7, date: '2026-02-05', documentNumber: 'ЗП-00001', counterparty: 'ФНС', operation: 'Удержание НДФЛ', debit: '70', credit: '68.01', amount: 110500, description: 'НДФЛ за январь 2026' },
  ];

  const counterparties = [
    {
      id: 1, name: 'ООО "МузТех"', inn: '7704567890', kpp: '770401001', ogrn: '1147746123456',
      address: '125167, г. Москва, ул. Примерная, д. 12', phone: '+7 (495) 123-45-67',
      email: 'info@muztech.ru', director: 'Петров Иван Сергеевич',
      accountant: 'Смирнова Мария Александровна', bankName: 'ПАО "Сбербанк"',
      bik: '044525225', accountNumber: '40702810400000123456', corrAccountNumber: '30101810400000000225',
      type: 'customer', totalReceived: 2450000, totalPaid: 0, balance: 125000,
      contractsCount: 5, lastActivityDate: '2026-02-01', status: 'active',
    },
    {
      id: 2, name: 'ИП Волков Алексей Сергеевич', inn: '771234567890', ogrn: '315774600012345',
      address: '115211, г. Москва, ул. Каширское ш., д. 45', phone: '+7 (916) 234-56-78',
      email: 'volkov@example.com', director: 'Волков Алексей Сергеевич',
      bankName: 'ПАО "Альфа-Банк"', bik: '044525593',
      accountNumber: '40802810100000234567', corrAccountNumber: '30101810200000000593',
      type: 'customer', totalReceived: 890000, totalPaid: 0, balance: 65000,
      contractsCount: 12, lastActivityDate: '2026-01-31', status: 'active',
    },
    {
      id: 3, name: 'АО "Русское Радио"', inn: '7705123456', kpp: '770501001', ogrn: '1037700123456',
      address: '119021, г. Москва, ул. Тимура Фрунзе, д. 11', phone: '+7 (495) 789-01-23',
      email: 'partners@rusradio.ru', director: 'Соколов Дмитрий Владимирович',
      accountant: 'Новикова Елена Петровна', bankName: 'ПАО "ВТБ"',
      bik: '044525187', accountNumber: '40702810300000345678', corrAccountNumber: '30101810700000000187',
      type: 'partner', totalReceived: 520000, totalPaid: 180000, balance: 42000,
      contractsCount: 3, lastActivityDate: '2026-01-30', status: 'active',
    },
    {
      id: 4, name: 'ООО "Серверные решения"', inn: '7707654321', kpp: '770701001', ogrn: '1157746654321',
      address: '121151, г. Москва, наб. Тараса Шевченко, д. 23А', phone: '+7 (495) 456-78-90',
      email: 'sales@servers.ru', director: 'Козлов Максим Андреевич',
      accountant: 'Морозова Ольга Викторовна', bankName: 'ПАО "Сбербанк"',
      bik: '044525225', accountNumber: '40702810500000456789', corrAccountNumber: '30101810400000000225',
      type: 'supplier', totalReceived: 0, totalPaid: 1250000, balance: -45000,
      contractsCount: 8, lastActivityDate: '2026-01-28', status: 'active',
    },
    {
      id: 5, name: 'ООО "Продакшн Студия"', inn: '7706789012', kpp: '770601001', ogrn: '1167746789012',
      address: '109544, г. Москва, ул. Рабочая, д. 84', phone: '+7 (499) 567-89-01',
      email: 'studio@production360.ru', director: 'Белов Сергей Николаевич',
      bankName: 'АО "Тинькофф Банк"', bik: '044525974',
      accountNumber: '40702810600000567890', corrAccountNumber: '30101810145250000974',
      type: 'customer', totalReceived: 1850000, totalPaid: 0, balance: 180000,
      contractsCount: 7, lastActivityDate: '2026-01-29', status: 'active',
    },
  ];

  const calendar = [
    { id: 1, title: 'НДС за 1 квартал 2026', description: 'Декларация по НДС', date: '2026-04-25', type: 'vat', completed: true, amount: 1051200 },
    { id: 2, title: 'Налог на прибыль за январь', description: 'Авансовый платеж', date: '2026-02-28', type: 'profit', completed: false, amount: 490000 },
    { id: 3, title: 'Страховые взносы', description: 'За январь 2026', date: '2026-02-15', type: 'insurance', completed: false, amount: 255000 },
    { id: 4, title: 'НДФЛ', description: 'Зарплата за январь', date: '2026-02-05', type: 'salary', completed: true, amount: 162500 },
    { id: 5, title: 'УСН за 2025 год', description: 'Годовая декларация', date: '2026-03-31', type: 'usn', completed: false, amount: 1119000 },
    { id: 6, title: 'НДС за 2 квартал 2026', description: 'Декларация по НДС', date: '2026-07-25', type: 'vat', completed: false, amount: 980000 },
    { id: 7, title: 'Страховые взносы', description: 'За февраль 2026', date: '2026-03-15', type: 'insurance', completed: false, amount: 268000 },
  ];

  return { reports, documents, ledger, counterparties, calendar };
}

// =====================================================
// VENUE PLAYLISTS, RADIO BRAND, RADIO CATALOG
// =====================================================

function generateVenuePlaylists(): any[] {
  return [
    {
      id: 'pl1', venueId: 'venue1', ownerId: 'user1', title: 'Вечерний джаз',
      description: 'Расслабляющая джазовая музыка для вечерних часов',
      coverImageUrl: null, trackCount: 45, totalDuration: 10800,
      isPublic: true, status: 'active',
      contentItems: [
        { id: 'track1', trackId: 't1', title: 'Smooth Jazz Evening', artist: 'Marcus Miller', duration: 245, coverUrl: null, addedAt: '2026-01-15T10:00:00' },
        { id: 'track2', trackId: 't2', title: 'Blue Note Sunset', artist: 'Pat Metheny', duration: 312, coverUrl: null, addedAt: '2026-01-15T10:05:00' },
      ],
      createdAt: '2026-01-10T09:00:00', updatedAt: '2026-02-01T12:00:00',
    },
    {
      id: 'pl2', venueId: 'venue1', ownerId: 'user1', title: 'Утренний чилл',
      description: 'Легкая фоновая музыка для утренних часов',
      coverImageUrl: null, trackCount: 32, totalDuration: 7680,
      isPublic: true, status: 'active', contentItems: [],
      createdAt: '2026-01-12T09:00:00', updatedAt: '2026-01-28T14:00:00',
    },
    {
      id: 'pl3', venueId: 'venue1', ownerId: 'user1', title: 'Weekend Vibes',
      description: 'Энергичная музыка для выходных',
      coverImageUrl: null, trackCount: 58, totalDuration: 13920,
      isPublic: false, status: 'draft', contentItems: [],
      createdAt: '2026-01-20T11:00:00', updatedAt: '2026-01-25T16:00:00',
    },
    {
      id: 'pl4', venueId: 'venue1', ownerId: 'user1', title: 'Lunch Time',
      description: 'Приятная музыка для обеда',
      coverImageUrl: null, trackCount: 40, totalDuration: 9600,
      isPublic: true, status: 'active', contentItems: [],
      createdAt: '2026-01-14T10:00:00', updatedAt: '2026-02-03T09:00:00',
    },
  ];
}

function generateVenueRadioBrand(): any {
  return {
    isEnabled: true, isPlaying: false, volume: 0.7, isMuted: false,
    currentTrack: {
      title: 'Summer Vibes', artist: 'DJ Kool', type: 'track',
      duration: 261, currentTime: 0,
    },
    settings: {
      quietMode: { enabled: false, startTime: '00:00', endTime: '07:00', days: 'all' },
      autoInsert: { jingleFrequency: 15, adFrequency: 10, announcementFrequency: 20 },
    },
    schedule: [
      { id: 's1', playlistId: 'pl2', time: '08:00', days: ['mon', 'tue', 'wed', 'thu', 'fri'], label: 'Утренний чилл' },
      { id: 's2', playlistId: 'pl4', time: '12:00', days: ['mon', 'tue', 'wed', 'thu', 'fri'], label: 'Lunch Time' },
      { id: 's3', playlistId: 'pl1', time: '18:00', days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], label: 'Вечерний джаз' },
      { id: 's4', playlistId: 'pl3', time: '20:00', days: ['sat', 'sun'], label: 'Weekend Vibes' },
    ],
    content: [
      { id: 'c1', type: 'jingle', title: 'Приветственный джингл', duration: 8, plays: 1240, status: 'active' },
      { id: 'c2', type: 'announcement', title: 'Happy Hour 17:00-19:00', duration: 15, plays: 890, status: 'active' },
      { id: 'c3', type: 'ad', title: 'Акция выходного дня', duration: 20, plays: 320, status: 'draft' },
    ],
    analytics: {
      totalPlaytime: 4850, tracksPlayed: 1240, avgListeners: 45,
      peakListeners: 120, topGenres: [
        { genre: 'Jazz', percentage: 35 },
        { genre: 'Lounge', percentage: 28 },
        { genre: 'Ambient', percentage: 22 },
        { genre: 'Pop', percentage: 15 },
      ],
    },
    updatedAt: '2026-02-10T12:00:00',
  };
}

function generateRadioCatalog(): any[] {
  return [
    {
      id: 'station1', stationName: 'Hit FM', slug: 'hit-fm', type: 'fm',
      primaryGenre: 'Pop', country: 'RU', city: 'Москва', frequency: '107.4 FM',
      listenersCount: 85000, monthlyListeners: 2500000, audienceSize: 'very_large',
      rating: 4.8, verified: true,
      description: 'Топовые хиты и новинки поп-музыки. Аудитория 18-35 лет.',
      broadcastUrl: 'https://stream.hit.fm/moscow',
      adPackages: [
        { id: 'pkg1', type: 'slot_15sec', duration: 15, price: 15000, currency: 'RUB', timeSlots: ['morning', 'day', 'evening'], playsPerDay: 10, durationDays: 7, description: 'Стандартный пакет на неделю', features: ['10 выходов в день', 'Все время суток', 'Гарантированный прайм-тайм'] },
        { id: 'pkg2', type: 'slot_30sec', duration: 30, price: 35000, currency: 'RUB', timeSlots: ['prime_time'], playsPerDay: 5, durationDays: 7, description: 'Premium пакет в прайм-тайм', features: ['5 выходов в прайм', 'Пиковая аудитория', 'Отчет по статистике'] },
      ],
    },
    {
      id: 'station2', stationName: 'Electronic Waves', slug: 'electronic-waves', type: 'online',
      primaryGenre: 'Electronic', country: 'RU', city: 'Санкт-Петербург',
      listenersCount: 12000, monthlyListeners: 350000, audienceSize: 'large',
      rating: 4.6, verified: true,
      description: 'Электронная музыка 24/7. Молодая аудитория клубной сцены.',
      broadcastUrl: 'https://stream.electronicwaves.fm',
      adPackages: [
        { id: 'pkg3', type: 'slot_10sec', duration: 10, price: 5000, currency: 'RUB', timeSlots: ['evening', 'night'], playsPerDay: 15, durationDays: 7, description: 'Вечерний пакет для клубов', features: ['15 выходов в день', 'Вечер и ночь', 'Клубная аудитория'] },
      ],
    },
    {
      id: 'station3', stationName: 'Jazz Cafe Radio', slug: 'jazz-cafe', type: 'online',
      primaryGenre: 'Jazz', country: 'RU', city: 'Москва',
      listenersCount: 5000, monthlyListeners: 150000, audienceSize: 'medium',
      rating: 4.9, verified: false,
      description: 'Уютный джаз для кафе и ресторанов. Премиальная аудитория.',
      broadcastUrl: 'https://stream.jazzcafe.fm',
      adPackages: [
        { id: 'pkg4', type: 'slot_15sec', duration: 15, price: 8000, currency: 'RUB', timeSlots: ['day', 'evening'], playsPerDay: 8, durationDays: 14, description: 'Дневной пакет на 2 недели', features: ['8 выходов в день', 'День и вечер', 'Премиум аудитория'] },
      ],
    },
    {
      id: 'station4', stationName: 'Rock Power 103', slug: 'rock-power', type: 'fm',
      primaryGenre: 'Rock', country: 'RU', city: 'Екатеринбург', frequency: '103.1 FM',
      listenersCount: 45000, monthlyListeners: 1300000, audienceSize: 'large',
      rating: 4.7, verified: true,
      description: 'Классический и альтернативный рок. Мужская аудитория 25-45 лет.',
      broadcastUrl: 'https://stream.rockpower.fm',
      adPackages: [
        { id: 'pkg5', type: 'slot_30sec', duration: 30, price: 25000, currency: 'RUB', timeSlots: ['morning', 'evening'], playsPerDay: 6, durationDays: 7, description: 'Утро + вечер', features: ['6 выходов в день', 'Drive time', 'Широкий охват'] },
      ],
    },
  ];
}

function generateVenueAdCampaigns(): any[] {
  return [
    {
      id: 'camp1', stationId: 'station1', stationName: 'Hit FM', packageType: 'slot_15sec',
      status: 'active', audioUrl: 'https://example.com/ad1.mp3',
      startDate: '2026-02-01', endDate: '2026-02-07',
      totalPlays: 42, targetPlays: 70, budget: 15000, spent: 9000,
      impressions: 126000, ctr: 0.8, timeSlots: ['morning', 'day', 'evening'],
      createdAt: '2026-01-28T10:00:00',
    },
    {
      id: 'camp2', stationId: 'station2', stationName: 'Electronic Waves', packageType: 'slot_10sec',
      status: 'completed', audioUrl: 'https://example.com/ad2.mp3',
      startDate: '2026-01-15', endDate: '2026-01-21',
      totalPlays: 105, targetPlays: 105, budget: 5000, spent: 5000,
      impressions: 180000, ctr: 1.2, timeSlots: ['evening', 'night'],
      createdAt: '2026-01-10T14:00:00',
    },
  ];
}

// Venue guide данные для Promo.Guide
function generateGuideVenues(): any[] {
  return [
    {
      id: 'guide-venue-1', name: 'Bar Decor', type: 'bar', address: 'ул. Мясницкая, 24/7',
      city: 'Москва', lat: 55.7628, lng: 37.6358, rating: 4.7, capacity: 120,
      genres: ['Jazz', 'Soul', 'Funk'], isOpen: true, openUntil: '02:00',
      verified: true, premium: true, phone: '+7 (495) 123-45-67',
      description: 'Атмосферный бар с живой музыкой и авторскими коктейлями',
      nowPlaying: { track: 'So What', artist: 'Miles Davis', genre: 'Jazz', startedAt: new Date(Date.now() - 600000).toISOString(), source: 'playlist', sourceName: 'Evening Jazz' },
    },
    {
      id: 'guide-venue-2', name: 'Lounge 21', type: 'lounge', address: 'Невский пр., 21',
      city: 'Санкт-Петербург', lat: 59.9356, lng: 30.3232, rating: 4.9, capacity: 80,
      genres: ['Lounge', 'Deep House', 'Chill'], isOpen: true, openUntil: '03:00',
      verified: true, premium: true, phone: '+7 (812) 987-65-43',
      description: 'Лаунж-бар с панорамным видом и DJ-сетами каждый вечер',
      nowPlaying: { track: 'Strobe', artist: 'Deadmau5', genre: 'Deep House', startedAt: new Date(Date.now() - 120000).toISOString(), source: 'radio', sourceName: 'Deep FM' },
    },
    {
      id: 'guide-venue-3', name: 'Sky Rooftop', type: 'club', address: 'Пресненская наб., 12',
      city: 'Москва', lat: 55.7489, lng: 37.5355, rating: 4.8, capacity: 200,
      genres: ['House', 'Techno', 'EDM'], isOpen: true, openUntil: '06:00',
      verified: true, premium: true, phone: '+7 (495) 555-77-88',
      description: 'Руфтоп-клуб с резидентами и международными гостями',
      nowPlaying: { track: 'One More Time', artist: 'Daft Punk', genre: 'House', startedAt: new Date(Date.now() - 300000).toISOString(), source: 'artist', sourceName: 'DJ Aurora' },
    },
    {
      id: 'guide-venue-4', name: 'Vinyl Cafe', type: 'cafe', address: 'ул. Покровка, 31',
      city: 'Москва', lat: 55.7590, lng: 37.6519, rating: 4.5, capacity: 40,
      genres: ['Indie', 'Folk', 'Acoustic'], isOpen: true, openUntil: '23:00',
      verified: true, premium: false, phone: '+7 (495) 333-22-11',
      description: 'Уютное кафе с виниловой коллекцией и live-акустикой по вечерам',
      nowPlaying: { track: 'Skinny Love', artist: 'Bon Iver', genre: 'Indie', startedAt: new Date(Date.now() - 180000).toISOString(), source: 'playlist', sourceName: 'Indie Evening' },
    },
    {
      id: 'guide-venue-5', name: 'NEON Club', type: 'club', address: 'ул. Рубинштейна, 15',
      city: 'Санкт-Петербург', lat: 59.9292, lng: 30.3460, rating: 4.6, capacity: 350,
      genres: ['Techno', 'Trance', 'Drum & Bass'], isOpen: true, openUntil: '06:00',
      verified: true, premium: true, phone: '+7 (812) 444-55-66',
      description: 'Главный техно-клуб Петербурга. Три зала, funktion-one',
      nowPlaying: { track: 'Acid Phase', artist: 'DJ Pierre', genre: 'Techno', startedAt: new Date(Date.now() - 45000).toISOString(), source: 'artist', sourceName: 'DJ Phantom' },
    },
    {
      id: 'guide-venue-6', name: 'Whiskey Room', type: 'bar', address: 'ул. Баумана, 42',
      city: 'Казань', lat: 55.7890, lng: 49.1156, rating: 4.4, capacity: 60,
      genres: ['Blues', 'Rock', 'R&B'], isOpen: true, openUntil: '01:00',
      verified: false, premium: false,
      description: 'Виски-бар с блюзовыми вечерами и дегустациями',
      nowPlaying: null,
    },
    {
      id: 'guide-venue-7', name: 'Garage Bar', type: 'bar', address: 'ул. Ленина, 88',
      city: 'Екатеринбург', lat: 56.8389, lng: 60.5975, rating: 4.3, capacity: 90,
      genres: ['Rock', 'Alternative', 'Punk'], isOpen: false, openUntil: '02:00',
      verified: true, premium: false,
      description: 'Рок-бар с живыми выступлениями и крафтовым пивом',
      nowPlaying: null,
    },
    {
      id: 'guide-venue-8', name: 'Sunset Terrace', type: 'lounge', address: 'ул. Тверская, 15',
      city: 'Москва', lat: 55.7642, lng: 37.6068, rating: 4.8, capacity: 100,
      genres: ['Jazz', 'Soul', 'Lounge'], isOpen: true, openUntil: '00:00',
      verified: true, premium: true, phone: '+7 (495) 777-88-99',
      description: 'Терраса с видом на Тверскую. Вечерний джаз и авторская кухня',
      nowPlaying: { track: 'Take Five', artist: 'Dave Brubeck', genre: 'Jazz', startedAt: new Date(Date.now() - 90000).toISOString(), source: 'playlist', sourceName: 'Jazz Classics' },
    },
  ];
}

// =====================================================
// RADIO ANALYTICS (detailed data for analytics dashboard)
// =====================================================

function generateRadioAnalyticsData(): Record<string, any> {
  const result: Record<string, any> = {};
  const stations = [
    { id: 'station-1', name: 'PROMO.FM', listeners: 1200000 },
    { id: 'station-2', name: 'Sound Wave', listeners: 680000 },
    { id: 'station-3', name: 'Retro Gold', listeners: 430000 },
    { id: 'station-4', name: 'Night Vibes', listeners: 920000 },
  ];

  const months = ['Авг', 'Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев'];

  stations.forEach(s => {
    const base = s.listeners;
    result[s.id] = {
      overview: {
        totalListeners: base,
        monthlyListeners: Math.round(base * 0.65),
        avgSessionDuration: 18 + Math.floor(Math.random() * 25),
        peakListeners: Math.round(base * 0.08),
        totalPlays: Math.round(base * 12.5),
        uniqueTracks: 320 + Math.floor(Math.random() * 500),
        avgRating: +(4.2 + Math.random() * 0.7).toFixed(1),
        engagementRate: +(12 + Math.random() * 18).toFixed(1),
      },
      listenersChart: months.map((m, i) => ({
        month: m,
        listeners: Math.round(base * (0.6 + i * 0.06 + Math.random() * 0.05)),
        unique: Math.round(base * (0.3 + i * 0.04 + Math.random() * 0.03)),
      })),
      revenueChart: months.map((m, i) => ({
        month: m,
        adRevenue: Math.round(15000 + i * 8000 + Math.random() * 12000),
        subscriptions: Math.round(5000 + i * 3000 + Math.random() * 5000),
        sponsorship: Math.round(i > 3 ? 10000 + Math.random() * 20000 : 0),
      })),
      topTracks: [
        { title: 'Summer Anthem', artist: 'Сандра', plays: 45200, duration: 228, genre: 'Pop' },
        { title: 'Night Drive', artist: 'Дэн', plays: 38900, duration: 312, genre: 'Electronic' },
        { title: 'Soulful Eyes', artist: 'Лиана', plays: 34100, duration: 265, genre: 'R&B' },
        { title: 'City Lights', artist: 'Алиса', plays: 31500, duration: 245, genre: 'Jazz' },
        { title: 'Deeper', artist: 'Марк', plays: 28700, duration: 350, genre: 'House' },
        { title: 'Echoes', artist: 'Стелла', plays: 26400, duration: 198, genre: 'Indie' },
        { title: 'Reflections', artist: 'Костя', plays: 24100, duration: 275, genre: 'Rock' },
        { title: 'Morning Dew', artist: 'Анна', plays: 21800, duration: 210, genre: 'Folk' },
      ],
      genreDistribution: [
        { genre: 'Pop', percentage: 28, color: '#FF577F' },
        { genre: 'Electronic', percentage: 22, color: '#3b82f6' },
        { genre: 'R&B', percentage: 15, color: '#f43f5e' },
        { genre: 'Rock', percentage: 12, color: '#8b5cf6' },
        { genre: 'Hip-Hop', percentage: 10, color: '#f59e0b' },
        { genre: 'Jazz', percentage: 8, color: '#10b981' },
        { genre: 'Other', percentage: 5, color: '#6b7280' },
      ],
      peakHours: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        listeners: Math.round(
          h >= 7 && h <= 10 ? base * 0.04 + Math.random() * base * 0.02
          : h >= 17 && h <= 22 ? base * 0.06 + Math.random() * base * 0.03
          : h >= 23 || h <= 5 ? base * 0.01 + Math.random() * base * 0.005
          : base * 0.02 + Math.random() * base * 0.01
        ),
      })),
      geography: [
        { city: 'Москва', listeners: Math.round(base * 0.35), percentage: 35 },
        { city: 'Санкт-Петербург', listeners: Math.round(base * 0.18), percentage: 18 },
        { city: 'Казань', listeners: Math.round(base * 0.08), percentage: 8 },
        { city: 'Екатеринбург', listeners: Math.round(base * 0.06), percentage: 6 },
        { city: 'Новосибирск', listeners: Math.round(base * 0.05), percentage: 5 },
        { city: 'Другие', listeners: Math.round(base * 0.28), percentage: 28 },
      ],
      devices: [
        { device: 'Смартфон', percentage: 62 },
        { device: 'Десктоп', percentage: 22 },
        { device: 'Smart TV', percentage: 9 },
        { device: 'Умная колонка', percentage: 7 },
      ],
      generatedAt: new Date().toISOString(),
    };
  });

  return result;
}

// =====================================================
// PUBLISH ORDERS (demo publication orders for artist cabinet)
// =====================================================

function generatePublishOrders(): any[] {
  return [
    {
      id: 'pub_demo_1',
      userId: 'demo-artist',
      type: 'video',
      status: 'published',
      title: 'Midnight Dreams - Official Music Video',
      description: 'Официальный клип на трек Midnight Dreams. Режиссер: А. Петров',
      videoUrl: 'https://www.youtube.com/watch?v=example1',
      videoSource: 'link',
      videoCategory: 'Музыкальный клип',
      tags: ['клип', 'pop', '2026', 'premiere'],
      plan: 'standard',
      price: 990,
      currency: 'RUB',
      paidAt: '2026-01-20T16:00:00Z',
      paymentMethod: 'card',
      moderatedAt: '2026-01-19T14:30:00Z',
      publishedAt: '2026-01-20T18:00:00Z',
      createdAt: '2026-01-18T10:00:00Z',
      updatedAt: '2026-01-20T18:00:00Z',
    },
    {
      id: 'pub_demo_2',
      userId: 'demo-artist',
      type: 'concert',
      status: 'pending_payment',
      title: 'Весенний концерт в Москве',
      description: 'Большой сольный концерт с презентацией нового альбома',
      eventDate: '2026-03-15',
      eventTime: '20:00',
      city: 'Москва',
      venueName: 'Adrenaline Stadium',
      venueAddress: 'Ленинградский пр-т, 80к17',
      ticketPriceMin: 1500,
      ticketPriceMax: 5000,
      genre: 'Pop',
      plan: 'premium',
      price: 4990,
      currency: 'RUB',
      moderatedAt: '2026-02-10T12:00:00Z',
      moderatorComment: 'Контент соответствует правилам. Одобрено.',
      createdAt: '2026-02-08T09:00:00Z',
      updatedAt: '2026-02-10T12:00:00Z',
    },
    {
      id: 'pub_demo_3',
      userId: 'demo-artist',
      type: 'video',
      status: 'pending_review',
      title: 'Electric Soul - Lyric Video',
      description: 'Лирик-видео для трека Electric Soul с анимированным текстом',
      videoUrl: 'https://www.youtube.com/watch?v=example2',
      videoSource: 'link',
      videoCategory: 'Лирик-видео',
      tags: ['lyric', 'pop', 'animation'],
      plan: 'free',
      price: 0,
      currency: 'RUB',
      createdAt: '2026-02-11T15:00:00Z',
      updatedAt: '2026-02-11T15:30:00Z',
    },
    {
      id: 'pub_demo_4',
      userId: 'demo-artist',
      type: 'concert',
      status: 'published',
      title: 'Акустический вечер',
      description: 'Камерный акустический концерт для 50 гостей',
      eventDate: '2026-02-14',
      eventTime: '19:00',
      city: 'Санкт-Петербург',
      venueName: 'JFC Jazz Club',
      venueAddress: 'ул. Шпалерная, 33',
      ticketPriceMin: 2000,
      ticketPriceMax: 3500,
      genre: 'Acoustic',
      plan: 'standard',
      price: 1490,
      currency: 'RUB',
      paidAt: '2026-02-02T10:00:00Z',
      paymentMethod: 'sbp',
      moderatedAt: '2026-02-01T16:00:00Z',
      publishedAt: '2026-02-02T12:00:00Z',
      createdAt: '2026-01-30T11:00:00Z',
      updatedAt: '2026-02-02T12:00:00Z',
    },
  ];
}

/**
 * Основная функция сидирования
 */
export async function seedDemoData(): Promise<{ seeded: boolean; message: string }> {
  try {
    // Check if already seeded (with retry for cold-start connection issues)
    let seedFlag: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        seedFlag = await kv.get(SEED_FLAG_KEY);
        break;
      } catch (e: any) {
        const msg = String(e?.message || e);
        if (attempt < 2 && (msg.includes('connection') || msg.includes('sending request') || msg.includes('SendRequest') || msg.includes('client error'))) {
          console.warn(`Seed flag check attempt ${attempt + 1}/3 failed (${msg.slice(0, 80)}), retrying...`);
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        throw e;
      }
    }
    if (seedFlag) {
      return { seeded: false, message: 'Demo data already seeded' };
    }

    console.log('🌱 Seeding demo data...');

    // 1. Seed artists
    const artistKeys: string[] = [];
    const artistValues: any[] = [];

    for (const artist of DEMO_ARTISTS) {
      artistKeys.push(`artist:${artist.id}`);
      artistValues.push({
        ...artist,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Also index by slug for public profile lookup
      artistKeys.push(`artist_slug:${artist.slug}`);
      artistValues.push(artist.id);
    }

    await kv.mset(artistKeys, artistValues);
    console.log(`  ✅ ${DEMO_ARTISTS.length} artists seeded`);

    // 2. Seed tracks
    const allTracks: any[] = [];
    const trackKeys: string[] = [];
    const trackValues: any[] = [];

    for (const artist of DEMO_ARTISTS) {
      const tracks = generateDemoTracks(artist);
      allTracks.push(...tracks);

      for (const track of tracks) {
        trackKeys.push(`track:public:${track.id}`);
        trackValues.push(track);
      }
    }

    await kv.mset(trackKeys, trackValues);
    console.log(`  ✅ ${allTracks.length} tracks seeded`);

    // 3. Seed chart
    const chart = generateChart(allTracks);
    await kv.set('chart:weekly:top20', {
      id: 'weekly-top20',
      title: 'Чарт Promo.music - TOP 20',
      period: 'weekly',
      updatedAt: new Date().toISOString(),
      entries: chart,
    });
    console.log('  ✅ Weekly chart seeded');

    // 4. Seed news
    const news = generateNews(DEMO_ARTISTS);
    const newsKeys: string[] = [];
    const newsValues: any[] = [];

    for (const item of news) {
      newsKeys.push(`news:public:${item.id}`);
      newsValues.push(item);
    }

    await kv.mset(newsKeys, newsValues);
    console.log(`  ✅ ${news.length} news items seeded`);

    // 5. Seed concerts
    const concerts = generateConcerts(DEMO_ARTISTS);
    const concertKeys: string[] = [];
    const concertValues: any[] = [];

    for (const concert of concerts) {
      concertKeys.push(`concert:public:${concert.id}`);
      concertValues.push(concert);
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

    await kv.set('artists:popular', popularArtists);
    console.log('  ✅ Popular artists list seeded');

    // 7. Seed genre stats
    const genreCounts: Record<string, number> = {};
    for (const artist of DEMO_ARTISTS) {
      genreCounts[artist.genre] = (genreCounts[artist.genre] || 0) + 1;
    }
    await kv.set('stats:genres', genreCounts);

    // 8. Seed beats marketplace
    const beats = generateBeats();
    const beatKeys: string[] = [];
    const beatValues: any[] = [];
    for (const beat of beats) {
      beatKeys.push(`beat:public:${beat.id}`);
      beatValues.push(beat);
    }
    await kv.mset(beatKeys, beatValues);
    console.log(`  ✅ ${beats.length} beats seeded`);

    // 9. Seed producer services
    const prodServices = generateProducerServices();
    const svcKeys: string[] = [];
    const svcValues: any[] = [];
    for (const svc of prodServices) {
      svcKeys.push(`producer_service:public:${svc.id}`);
      svcValues.push(svc);
    }
    await kv.mset(svcKeys, svcValues);
    console.log(`  ✅ ${prodServices.length} producer services seeded`);

    // 10. Seed portfolio before/after items
    const portfolioItems = generatePortfolio();
    await kv.set('portfolio:public:all', portfolioItems);
    console.log(`  ✅ ${portfolioItems.length} portfolio items seeded`);

    // 11. Seed producer/engineer profiles
    const producerProfiles = generateProducerProfiles();
    const profileKeys: string[] = [];
    const profileValues: any[] = [];
    for (const profile of producerProfiles) {
      profileKeys.push(`producer_profile:${profile.id}`);
      profileValues.push(profile);
    }
    await kv.mset(profileKeys, profileValues);
    console.log(`  ✅ ${producerProfiles.length} producer profiles seeded`);

    // 12. Seed producer reviews
    const reviews = generateProducerReviews();
    const reviewKeys: string[] = [];
    const reviewValues: any[] = [];
    for (const review of reviews) {
      reviewKeys.push(`producer_review:${review.producerId}:${review.id}`);
      reviewValues.push(review);
    }
    await kv.mset(reviewKeys, reviewValues);
    console.log(`  ✅ ${reviews.length} producer reviews seeded`);

    // 13. Seed producer orders
    const orders = generateProducerOrders();
    const orderKeys: string[] = [];
    const orderValues: any[] = [];
    for (const order of orders) {
      orderKeys.push(`producer_order:${order.producerId}:${order.id}`);
      orderValues.push(order);
    }
    await kv.mset(orderKeys, orderValues);
    console.log(`  ✅ ${orders.length} producer orders seeded`);

    // 14. Seed producer wallets
    const wallets = generateProducerWallets();
    const walletKeys: string[] = [];
    const walletValues: any[] = [];
    for (const wallet of wallets) {
      walletKeys.push(`producer_wallet:${wallet.producerId}`);
      walletValues.push(wallet);
    }
    await kv.mset(walletKeys, walletValues);
    console.log(`  ✅ ${wallets.length} producer wallets seeded`);

    // 15. Set platform stats (updated with beats, profiles)
    await kv.set('stats:platform', {
      totalArtists: DEMO_ARTISTS.length,
      totalTracks: allTracks.length,
      totalPlays: DEMO_ARTISTS.reduce((sum, a) => sum + a.totalPlays, 0),
      totalSubscribers: DEMO_ARTISTS.reduce((sum, a) => sum + a.subscribers, 0),
      totalBeats: beats.length,
      totalProducers: producerProfiles.length,
      totalServices: prodServices.length,
      updatedAt: new Date().toISOString(),
    });

    // 15.5. Seed marketplace service orders (demo lifecycle data)
    const marketplaceOrders = generateMarketplaceOrders();
    const moKeys: string[] = [];
    const moValues: any[] = [];
    const clientIndex: string[] = [];
    const producerIndices: Record<string, string[]> = {};
    for (const mo of marketplaceOrders) {
      moKeys.push(`service_order:${mo.id}`);
      moValues.push(mo);
      clientIndex.push(mo.id);
      if (!producerIndices[mo.producerId]) producerIndices[mo.producerId] = [];
      producerIndices[mo.producerId].push(mo.id);
    }
    await kv.mset(moKeys, moValues);
    await kv.set('service_orders_by_client:demo-user', clientIndex);
    for (const [pid, ids] of Object.entries(producerIndices)) {
      const existingRaw = await kv.get(`service_orders_by_producer:${pid}`);
      const existing: string[] = existingRaw || [];
      await kv.set(`service_orders_by_producer:${pid}`, [...ids, ...existing]);
    }
    console.log(`  ✅ ${marketplaceOrders.length} marketplace orders seeded`);

    // 15.6. Seed digital goods
    const digitalGoods = generateDigitalGoods();
    const dgKeys: string[] = [];
    const dgValues: any[] = [];
    for (const dg of digitalGoods) {
      dgKeys.push(`digital_good:public:${dg.id}`);
      dgValues.push(dg);
    }
    await kv.mset(dgKeys, dgValues);
    console.log(`  ✅ ${digitalGoods.length} digital goods seeded`);

    // 15.7. Seed demo contracts for marketplace orders
    const demoContract = {
      id: 'ctr-demo-1',
      orderId: 'sord-demo-1',
      serviceTitle: 'Профессиональное сведение',
      producerId: 'artist-maxam',
      producerName: 'Максам',
      clientId: 'demo-user',
      clientName: 'Демо Пользователь',
      totalAmount: 8000,
      paidAmount: 3000,
      status: 'active',
      milestones: [
        {
          id: 'ms-demo-1',
          index: 0,
          title: 'Черновой микс',
          description: 'Баланс уровней, панорама, базовая обработка',
          amount: 3000,
          dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          status: 'approved',
          paidAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
          id: 'ms-demo-2',
          index: 1,
          title: 'Обработка вокала',
          description: 'Тюнинг, компрессия, эффекты, автоматизация',
          amount: 3000,
          dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
          status: 'submitted',
          paidAt: null,
          completedAt: null,
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
          id: 'ms-demo-3',
          index: 2,
          title: 'Финальный микс',
          description: 'Финальная полировка, проверка на мониторах и наушниках',
          amount: 2000,
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
          status: 'pending',
          paidAt: null,
          completedAt: null,
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    };
    await kv.set('contract:sord-demo-1', demoContract);
    console.log('  ✅ 1 demo contract seeded (3 milestones)');

    // 16. Seed venue guide data for Promo.Guide
    const guideVenues = generateGuideVenues();
    const guideKeys: string[] = [];
    const guideValues: any[] = [];
    const guideVenueIds: string[] = [];
    for (const gv of guideVenues) {
      guideKeys.push(`guide:venue:${gv.id}`);
      guideValues.push(gv);
      guideVenueIds.push(gv.id);
    }
    guideKeys.push('guide:venue_ids');
    guideValues.push(guideVenueIds);
    await kv.mset(guideKeys, guideValues);
    console.log(`  guide: ${guideVenues.length} venues seeded for Promo.Guide`);

    // 17. Seed venue profiles for Venue cabinet
    const venueProfiles = generateVenueProfiles();
    const vpKeys: string[] = [];
    const vpValues: any[] = [];
    for (const vp of venueProfiles) {
      vpKeys.push(`venue_profile:${vp.userId}`);
      vpValues.push(vp);
    }
    await kv.mset(vpKeys, vpValues);
    console.log(`  venue: ${venueProfiles.length} venue profiles seeded`);

    // 18. Seed venue analytics and campaigns
    const venueAnalytics = generateVenueAnalytics();
    const venueCampaigns = generateVenueCampaigns();
    const vaKeys: string[] = [];
    const vaValues: any[] = [];
    for (const va of venueAnalytics) {
      vaKeys.push(`venue_analytics:${va.venueId}`);
      vaValues.push(va);
      // Campaigns
      const campaigns = venueCampaigns[va.venueId] || [];
      vaKeys.push(`venue_campaigns:${va.venueId}`);
      vaValues.push(campaigns);
      // Spending
      const spending = generateVenueSpending(va.venueId);
      vaKeys.push(`venue_spending:${va.venueId}`);
      vaValues.push(spending);
    }
    await kv.mset(vaKeys, vaValues);
    console.log('  venue: analytics, campaigns, spending seeded');

    // 19. Seed radio stations
    const radioStations = generateRadioStations();
    const rsKeys: string[] = [];
    const rsValues: any[] = [];
    for (const rs of radioStations) {
      rsKeys.push(`radio_station:${rs.userId}`);
      rsValues.push(rs);
    }
    await kv.mset(rsKeys, rsValues);
    console.log(`  radio: ${radioStations.length} radio stations seeded`);

    // 20. Seed radio ad slots, artist requests, venue requests, finance, transactions, notifications
    const radioAdSlots = generateRadioAdSlots();
    const radioArtistRequests = generateRadioArtistRequests();
    const radioVenueRequests = generateRadioVenueRequests();
    const radioFinance = generateRadioFinance();
    const radioTransactions = generateRadioTransactions();
    const radioNotifications = generateRadioNotifications();
    const radioKeys: string[] = [];
    const radioValues: any[] = [];
    for (const rs of radioStations) {
      // Ad slots
      const slots = radioAdSlots[rs.id] || [];
      const slotIds: string[] = [];
      for (const slot of slots) {
        radioKeys.push(`radio_ad_slot:${rs.id}:${slot.id}`);
        radioValues.push(slot);
        slotIds.push(slot.id);
      }
      radioKeys.push(`radio_ad_slots_index:${rs.id}`);
      radioValues.push(slotIds);
      // Artist requests
      radioKeys.push(`radio_artist_requests:${rs.id}`);
      radioValues.push(radioArtistRequests[rs.id] || []);
      // Venue requests
      radioKeys.push(`radio_venue_requests:${rs.id}`);
      radioValues.push(radioVenueRequests[rs.id] || []);
      // Finance
      radioKeys.push(`radio_finance:${rs.id}`);
      radioValues.push(radioFinance[rs.id] || {});
      // Transactions
      radioKeys.push(`radio_transactions:${rs.id}`);
      radioValues.push(radioTransactions[rs.id] || []);
      // Notifications
      radioKeys.push(`radio_notifications:${rs.id}`);
      radioValues.push(radioNotifications[rs.id] || []);
    }
    await kv.mset(radioKeys, radioValues);
    console.log('  radio: ad slots, artist requests, venue requests, finance, transactions, notifications seeded');

    // 21. Seed demo bookings
    const demoBookings = generateDemoBookings();
    const bKeys: string[] = [];
    const bValues: any[] = [];
    const bookingsByUser: Record<string, string[]> = {};
    for (const b of demoBookings) {
      bKeys.push(`booking:${b.id}`);
      bValues.push(b);
      // Index for requester
      if (!bookingsByUser[b.requesterId]) bookingsByUser[b.requesterId] = [];
      bookingsByUser[b.requesterId].push(b.id);
      // Index for performer
      if (!bookingsByUser[b.performerId]) bookingsByUser[b.performerId] = [];
      bookingsByUser[b.performerId].push(b.id);
    }
    for (const [userId, ids] of Object.entries(bookingsByUser)) {
      bKeys.push(`bookings_by_user:${userId}`);
      bValues.push(ids);
    }
    await kv.mset(bKeys, bValues);
    console.log(`  booking: ${demoBookings.length} demo bookings seeded`);

    // 22. Seed accounting data (admin cabinet)
    const acctData = generateAccountingData();
    await kv.mset(
      [
        'accounting:reports',
        'accounting:documents',
        'accounting:ledger',
        'accounting:counterparties',
        'accounting:calendar',
      ],
      [
        acctData.reports,
        acctData.documents,
        acctData.ledger,
        acctData.counterparties,
        acctData.calendar,
      ]
    );
    console.log('  accounting: reports, documents, ledger, counterparties, calendar seeded');

    // 23. Seed venue playlists + radio brand + radio catalog
    const venuePlaylists = generateVenuePlaylists();
    const venueRadioBrand = generateVenueRadioBrand();
    const radioCatalog = generateRadioCatalog();
    const venueAdCampaigns = generateVenueAdCampaigns();
    const vmKeys: string[] = [];
    const vmValues: any[] = [];
    for (const vp of venueProfiles) {
      vmKeys.push(`venue_playlists:${vp.id}`);
      vmValues.push(venuePlaylists);
      vmKeys.push(`venue_radio_brand:${vp.id}`);
      vmValues.push(venueRadioBrand);
      vmKeys.push(`venue_ad_campaigns:${vp.id}`);
      vmValues.push(venueAdCampaigns);
    }
    vmKeys.push('venue_radio_catalog');
    vmValues.push(radioCatalog);
    await kv.mset(vmKeys, vmValues);
    console.log('  venue: playlists, radio brand, radio catalog, ad campaigns seeded');

    // 24. Seed radio analytics (detailed data for analytics dashboard)
    const radioAnalytics = generateRadioAnalyticsData();
    const raKeys: string[] = [];
    const raValues: any[] = [];
    for (const rs of radioStations) {
      const analytics = radioAnalytics[rs.id];
      if (analytics) {
        raKeys.push(`radio_analytics:${rs.id}`);
        raValues.push(analytics);
      }
    }
    await kv.mset(raKeys, raValues);
    console.log(`  radio: ${raKeys.length} radio analytics datasets seeded`);

    // 25. Seed publish orders (demo publication orders for artist cabinet)
    const publishOrders = generatePublishOrders();
    const poKeys: string[] = [];
    const poValues: any[] = [];
    const publishOrderIds: string[] = [];
    for (const order of publishOrders) {
      poKeys.push(`publish_order:${order.id}`);
      poValues.push(order);
      publishOrderIds.push(order.id);
    }
    poKeys.push(`publish_orders_by_user:demo-artist`);
    poValues.push(publishOrderIds);
    await kv.mset(poKeys, poValues);
    console.log(`  publish: ${publishOrders.length} demo publish orders seeded`);

    // 26. Seed demo collaboration offers (producer -> artist)
    const collabOffers = [
      {
        id: 'offer-demo-1', producerId: 'producer-maxam', producerName: 'Максам',
        artistId: 'artist-sandra', artistName: 'Сандра', type: 'beat',
        title: 'Trap Beat "Neon Lights" 140 BPM',
        description: 'Тёмный трэп-бит с мелодичными клавишами и тяжёлым 808. Идеален дл�� вокала с автотюном.',
        price: 15000, currency: 'RUB', bpm: 140, key: 'Am', genre: 'Trap',
        tags: ['trap', 'dark', 'melodic'], status: 'pending',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: 'offer-demo-2', producerId: 'producer-maxam', producerName: 'Максам',
        artistId: 'artist-liana', artistName: 'Лиана', type: 'mixing',
        title: 'Сведение R&B-альбома (8 треков)',
        description: 'Профессиональное сведение полного R&B-альбома. 2 раунда правок.',
        price: 48000, currency: 'RUB', genre: 'R&B', status: 'accepted',
        createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: 'offer-demo-3', producerId: 'producer-maxam', producerName: 'Максам',
        artistId: 'artist-timur', artistName: 'Тимур', type: 'collab_track',
        title: 'Совместный трек для EP',
        description: 'Совместный трек для нового EP. Продакшн на мне, твой вокал.',
        genre: 'Trap', status: 'discussion',
        createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        artistComment: 'Интересно! Давай обсудим детали',
      },
    ];
    const collabByArtist: Record<string, any[]> = {};
    for (const offer of collabOffers) {
      if (!collabByArtist[(offer as any).artistId]) collabByArtist[(offer as any).artistId] = [];
      collabByArtist[(offer as any).artistId].push(offer);
    }
    const collabKeys: string[] = [];
    const collabValues: any[] = [];
    for (const [aId, offs] of Object.entries(collabByArtist)) {
      collabKeys.push(`collab_offers:${aId}`);
      collabValues.push(offs);
    }
    collabKeys.push(`collab_offers_by:producer-maxam`);
    collabValues.push(collabOffers);
    collabKeys.push(`collab_chat:offer-demo-3`);
    collabValues.push([
      { id: 'cmsg-1', offerId: 'offer-demo-3', senderId: 'artist-timur', senderName: 'Тимур', senderRole: 'artist', text: 'Интересно! Какой стиль бита планируешь?', createdAt: new Date(Date.now() - 48 * 3600000).toISOString() },
      { id: 'cmsg-2', offerId: 'offer-demo-3', senderId: 'producer-maxam', senderName: 'Максам', senderRole: 'producer', text: 'Мелодичный трэп, 145 BPM, в стиле твоего "FLEX". Могу скинуть демо.', createdAt: new Date(Date.now() - 47 * 3600000).toISOString() },
      { id: 'cmsg-3', offerId: 'offer-demo-3', senderId: 'artist-timur', senderName: 'Тимур', senderRole: 'artist', text: 'Звучит огонь! Скидывай, послушаю.', createdAt: new Date(Date.now() - 46 * 3600000).toISOString() },
    ]);
    await kv.mset(collabKeys, collabValues);
    console.log(`  collab: ${collabOffers.length} demo offers, 1 chat thread seeded`);

    // 27. Seed unified DM conversations (for MessagesContext sync)
    const now = new Date();
    const dmKeys: string[] = [];
    const dmValues: any[] = [];

    // DM conversations for demo-artist
    const demoArtistDmConvs = [
      {
        id: 'demo-artist::producer-maxam',
        participants: [
          { userId: 'demo-artist', userName: 'Артист', role: 'artist' },
          { userId: 'producer-maxam', userName: 'Максам', role: 'producer', avatar: 'M' },
        ],
        source: 'collab',
        collabOfferId: 'offer-demo-1',
        lastMessage: 'Давай обсудим бит подробнее',
        lastMessageAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
        createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      },
      {
        id: 'demo-artist::producer-dan',
        participants: [
          { userId: 'demo-artist', userName: 'Артист', role: 'artist' },
          { userId: 'producer-dan', userName: 'Дэн', role: 'producer', avatar: 'Д' },
        ],
        source: 'collab',
        lastMessage: 'Мастеринг готов, проверяй',
        lastMessageAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
        createdAt: new Date(now.getTime() - 72 * 3600000).toISOString(),
      },
      {
        id: 'admin-1::demo-artist',
        participants: [
          { userId: 'demo-artist', userName: 'Артист', role: 'artist' },
          { userId: 'admin-1', userName: 'Поддержка promo.music', role: 'admin', avatar: '?' },
        ],
        source: 'support',
        lastMessage: 'Рады помочь! Обращайтесь.',
        lastMessageAt: new Date(now.getTime() - 120 * 3600000).toISOString(),
        createdAt: new Date(now.getTime() - 168 * 3600000).toISOString(),
      },
    ];

    const demoArtistConvIds = demoArtistDmConvs.map(c => c.id);
    dmKeys.push(`dm:convlist:demo-artist`);
    dmValues.push(demoArtistConvIds);

    for (const conv of demoArtistDmConvs) {
      dmKeys.push(`dm:conv:${conv.id}`);
      dmValues.push(conv);
    }

    // DM messages for demo-artist <-> producer-maxam
    dmKeys.push(`dm:messages:demo-artist::producer-maxam`);
    dmValues.push([
      { id: 'dm-m1', conversationId: 'demo-artist::producer-maxam', senderId: 'producer-maxam', senderName: 'Максам', senderRole: 'producer', text: 'Привет! Слышал твои треки, хочу предложить бит', createdAt: new Date(now.getTime() - 6 * 3600000).toISOString() },
      { id: 'dm-m2', conversationId: 'demo-artist::producer-maxam', senderId: 'demo-artist', senderName: 'Артист', senderRole: 'artist', text: 'Привет! Интересно, скинь превью', createdAt: new Date(now.getTime() - 5 * 3600000).toISOString() },
      { id: 'dm-m3', conversationId: 'demo-artist::producer-maxam', senderId: 'producer-maxam', senderName: 'Максам', senderRole: 'producer', text: 'Давай обсудим бит подробнее', createdAt: new Date(now.getTime() - 2 * 3600000).toISOString() },
    ]);

    // DM messages for demo-artist <-> producer-dan
    dmKeys.push(`dm:messages:demo-artist::producer-dan`);
    dmValues.push([
      { id: 'dm-d1', conversationId: 'demo-artist::producer-dan', senderId: 'producer-dan', senderName: 'Дэн', senderRole: 'producer', text: 'Привет! Закончил мастеринг', createdAt: new Date(now.getTime() - 48 * 3600000).toISOString() },
      { id: 'dm-d2', conversationId: 'demo-artist::producer-dan', senderId: 'demo-artist', senderName: 'Артист', senderRole: 'artist', text: 'Супер, как быстро!', createdAt: new Date(now.getTime() - 47 * 3600000).toISOString() },
      { id: 'dm-d3', conversationId: 'demo-artist::producer-dan', senderId: 'producer-dan', senderName: 'Дэн', senderRole: 'producer', text: 'Мастеринг готов, проверяй', createdAt: new Date(now.getTime() - 24 * 3600000).toISOString() },
    ]);

    // DM messages for support
    dmKeys.push(`dm:messages:admin-1::demo-artist`);
    dmValues.push([
      { id: 'dm-s1', conversationId: 'admin-1::demo-artist', senderId: 'admin-1', senderName: 'Поддержка promo.music', senderRole: 'admin', text: 'Добро пожаловать в promo.music! Если возникнут вопросы - пишите', createdAt: new Date(now.getTime() - 168 * 3600000).toISOString() },
      { id: 'dm-s2', conversationId: 'admin-1::demo-artist', senderId: 'demo-artist', senderName: 'Артист', senderRole: 'artist', text: 'Спасибо! Пока всё понятно', createdAt: new Date(now.getTime() - 167 * 3600000).toISOString() },
      { id: 'dm-s3', conversationId: 'admin-1::demo-artist', senderId: 'admin-1', senderName: 'Поддержка promo.music', senderRole: 'admin', text: 'Рады помочь! Обращайтесь.', createdAt: new Date(now.getTime() - 120 * 3600000).toISOString() },
    ]);

    // Unread for demo-artist (1 from Максам)
    dmKeys.push(`dm:unread:demo-artist`);
    dmValues.push({ 'demo-artist::producer-maxam': 1 });

    // Also add convlists for the other participants
    dmKeys.push(`dm:convlist:producer-maxam`);
    dmValues.push(['demo-artist::producer-maxam']);
    dmKeys.push(`dm:convlist:producer-dan`);
    dmValues.push(['demo-artist::producer-dan']);
    dmKeys.push(`dm:convlist:admin-1`);
    dmValues.push(['admin-1::demo-artist']);

    // DM between venue-1 and radio-1 (allowed by rules)
    const venueRadioConv = {
      id: 'radio-1::venue-1',
      participants: [
        { userId: 'venue-1', userName: 'Бар \"Мелодия\"', role: 'venue' },
        { userId: 'radio-1', userName: 'Promo.air FM', role: 'radio' },
      ],
      source: 'direct',
      lastMessage: 'Готовим рекламный блок на следующую неделю',
      lastMessageAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
      createdAt: new Date(now.getTime() - 96 * 3600000).toISOString(),
    };
    dmKeys.push(`dm:conv:${venueRadioConv.id}`);
    dmValues.push(venueRadioConv);
    dmKeys.push(`dm:messages:${venueRadioConv.id}`);
    dmValues.push([
      { id: 'dm-vr1', conversationId: venueRadioConv.id, senderId: 'venue-1', senderName: 'Бар \"Мелодия\"', senderRole: 'venue', text: 'Привет! Хотим разместить рекламу на вашей волне', createdAt: new Date(now.getTime() - 96 * 3600000).toISOString() },
      { id: 'dm-vr2', conversationId: venueRadioConv.id, senderId: 'radio-1', senderName: 'Promo.air FM', senderRole: 'radio', text: 'Здравствуйте! С удовольствием обсудим', createdAt: new Date(now.getTime() - 95 * 3600000).toISOString() },
      { id: 'dm-vr3', conversationId: venueRadioConv.id, senderId: 'radio-1', senderName: 'Promo.air FM', senderRole: 'radio', text: 'Готовим рекламный блок на следующую неделю', createdAt: new Date(now.getTime() - 12 * 3600000).toISOString() },
    ]);
    // Add to existing convlists
    const existingVenue1List = ['radio-1::venue-1'];
    const existingRadio1List = ['radio-1::venue-1'];
    dmKeys.push(`dm:convlist:venue-1`);
    dmValues.push(existingVenue1List);
    dmKeys.push(`dm:convlist:radio-1`);
    dmValues.push(existingRadio1List);

    await kv.mset(dmKeys, dmValues);
    console.log(`  dm: ${demoArtistDmConvs.length + 1} DM conversations seeded (artist, venue, radio)`);

    // 28. Seed track test data
    const ttNow = new Date();
    const ttKeys: string[] = [];
    const ttValues: any[] = [];

    // -- Completed request (for artist-sandra, 3 experts, full analysis) --
    const ttReq1 = {
      id: 'tt-seed-1',
      user_id: 'artist-sandra',
      track_id: 'track-sandra-1',
      track_title: 'Танцуй со мной',
      artist_name: 'Сандра',
      genre: 'Pop',
      status: 'completed',
      payment_status: 'completed',
      payment_amount: 1000,
      payment_transaction_id: 'TXN_SEED_1',
      required_expert_count: 3,
      completed_reviews_count: 3,
      assigned_experts: ['dj-1', 'producer-maxam', 'engineer-1'],
      average_rating: 7.7,
      category_averages: { mixing_mastering: 8.0, arrangement: 7.3, originality: 7.0, commercial_potential: 8.3 },
      consolidated_feedback: '🎵 **Сведение и мастеринг:** Эксперты отметили высокое качество звучания и профессиональный баланс частот.\n\n🎯 **Аранжировка:** Интересные идеи, есть возможности для улучшения структуры.\n\n🏆 **Оригинальность:** Приятное звучание с элементами оригинальности.\n\n📈 **Коммерческий потенциал:** Высокий потенциал успеха на рынке.',
      consolidated_recommendations: '📝 **Рекомендации экспертов:**\n\n1. Добавить больше динамики в припев\n2. Рассмотреть вариант с бридж-секцией\n3. Микс хорош, но верхние частоты можно смягчить',
      final_analysis: '🎵 **Сведение и мастеринг:** Эксперты отметили высокое качество звучания.\n\n📝 **Рекомендации экспертов:**\n\n1. Добавить больше динамики в припев\n2. Рассмотреть вариант с бридж-секцией\n3. Микс хорош, но верхние частоты можно смягчить',
      admin_approval_status: 'approved',
      feedback_sent_date: new Date(ttNow.getTime() - 24 * 3600000).toISOString(),
      created_at: new Date(ttNow.getTime() - 7 * 86400000).toISOString(),
      updated_at: new Date(ttNow.getTime() - 24 * 3600000).toISOString(),
      completed_at: new Date(ttNow.getTime() - 24 * 3600000).toISOString(),
    };
    ttKeys.push(`track_test:requests:${ttReq1.id}`);
    ttValues.push(ttReq1);

    // Expert reviews for completed request
    const ttReviews1 = [
      {
        id: 'ttr-seed-1a', request_id: 'tt-seed-1', expert_email: 'dj-1', expert_name: 'DJ Demo', expert_role: 'dj',
        status: 'completed', mixing_mastering_score: 8, arrangement_score: 7, originality_score: 7, commercial_potential_score: 9, overall_score: 8,
        mixing_mastering_feedback: '', arrangement_feedback: '', originality_feedback: '', commercial_potential_feedback: '',
        general_feedback: 'Отличный поп-трек с цепляющим припевом. Хорошо звучит на клубной системе.',
        recommendations: 'Добавить больше динамики в припев',
        audio_notes: [{ id: 'an-1', timestamp: '0:32', comment: 'Переход в припев немного резкий', category: 'arrangement' }],
        reward_points: 50, reward_paid: true,
        created_at: new Date(ttNow.getTime() - 5 * 86400000).toISOString(),
        completed_at: new Date(ttNow.getTime() - 4 * 86400000).toISOString(),
      },
      {
        id: 'ttr-seed-1b', request_id: 'tt-seed-1', expert_email: 'producer-maxam', expert_name: 'Максам', expert_role: 'producer',
        status: 'completed', mixing_mastering_score: 8, arrangement_score: 8, originality_score: 7, commercial_potential_score: 8, overall_score: 8,
        mixing_mastering_feedback: '', arrangement_feedback: '', originality_feedback: '', commercial_potential_feedback: '',
        general_feedback: 'Профессиональное звучание. Вокал сидит хорошо в миксе. Потенциал для ротации на радио.',
        recommendations: 'Рассмотреть вариант с бридж-секцией',
        audio_notes: [], reward_points: 50, reward_paid: true,
        created_at: new Date(ttNow.getTime() - 5 * 86400000).toISOString(),
        completed_at: new Date(ttNow.getTime() - 3 * 86400000).toISOString(),
      },
      {
        id: 'ttr-seed-1c', request_id: 'tt-seed-1', expert_email: 'engineer-1', expert_name: 'Звукоинженер', expert_role: 'engineer',
        status: 'completed', mixing_mastering_score: 8, arrangement_score: 7, originality_score: 7, commercial_potential_score: 8, overall_score: 7,
        mixing_mastering_feedback: '', arrangement_feedback: '', originality_feedback: '', commercial_potential_feedback: '',
        general_feedback: 'Чистый микс, хороший баланс. Низ плотный, но не перегружен.',
        recommendations: 'Микс хорош, но верхние частоты можно смягчить',
        audio_notes: [
          { id: 'an-2', timestamp: '1:15', comment: 'Сибилянты вокала чуть выпирают', category: 'mixing' },
          { id: 'an-3', timestamp: '2:40', comment: 'Ревер на бэках немного мутит', category: 'mixing' },
        ],
        reward_points: 50, reward_paid: true,
        created_at: new Date(ttNow.getTime() - 5 * 86400000).toISOString(),
        completed_at: new Date(ttNow.getTime() - 2 * 86400000).toISOString(),
      },
    ];
    const ttReview1Ids: string[] = [];
    for (const rev of ttReviews1) {
      ttKeys.push(`track_test:reviews:${rev.id}`);
      ttValues.push(rev);
      ttReview1Ids.push(rev.id);
    }
    ttKeys.push(`track_test:request:tt-seed-1:reviews`);
    ttValues.push(ttReview1Ids);

    // -- Experts assigned request (for artist-liana, 2 of 5 assigned, reviews in progress) --
    const ttReq2 = {
      id: 'tt-seed-2',
      user_id: 'artist-liana',
      track_id: 'track-liana-1',
      track_title: 'Ночной бриз',
      artist_name: 'Лиана',
      genre: 'R&B',
      status: 'experts_assigned',
      payment_status: 'completed',
      payment_amount: 1000,
      payment_transaction_id: 'TXN_SEED_2',
      required_expert_count: 5,
      completed_reviews_count: 0,
      assigned_experts: ['dj-1', 'producer-maxam'],
      created_at: new Date(ttNow.getTime() - 3 * 86400000).toISOString(),
      updated_at: new Date(ttNow.getTime() - 12 * 3600000).toISOString(),
    };
    ttKeys.push(`track_test:requests:${ttReq2.id}`);
    ttValues.push(ttReq2);

    // Reviews for tt-seed-2 (assigned, not yet completed)
    const ttReviews2 = [
      {
        id: 'ttr-seed-2a', request_id: 'tt-seed-2', expert_email: 'dj-1', expert_name: 'DJ Demo', expert_role: 'dj',
        status: 'assigned', mixing_mastering_score: 0, arrangement_score: 0, originality_score: 0, commercial_potential_score: 0, overall_score: 0,
        mixing_mastering_feedback: '', arrangement_feedback: '', originality_feedback: '', commercial_potential_feedback: '',
        general_feedback: '', recommendations: '', audio_notes: [],
        reward_points: 0, reward_paid: false,
        created_at: new Date(ttNow.getTime() - 12 * 3600000).toISOString(),
      },
      {
        id: 'ttr-seed-2b', request_id: 'tt-seed-2', expert_email: 'producer-maxam', expert_name: 'Максам', expert_role: 'producer',
        status: 'assigned', mixing_mastering_score: 0, arrangement_score: 0, originality_score: 0, commercial_potential_score: 0, overall_score: 0,
        mixing_mastering_feedback: '', arrangement_feedback: '', originality_feedback: '', commercial_potential_feedback: '',
        general_feedback: '', recommendations: '', audio_notes: [],
        reward_points: 0, reward_paid: false,
        created_at: new Date(ttNow.getTime() - 12 * 3600000).toISOString(),
      },
    ];
    const ttReview2Ids: string[] = [];
    for (const rev of ttReviews2) {
      ttKeys.push(`track_test:reviews:${rev.id}`);
      ttValues.push(rev);
      ttReview2Ids.push(rev.id);
    }
    ttKeys.push(`track_test:request:tt-seed-2:reviews`);
    ttValues.push(ttReview2Ids);

    // -- Pending expert assignment (for demo-artist, moderated) --
    const ttReq3 = {
      id: 'tt-seed-3',
      user_id: 'demo-artist',
      track_id: 'track-demo-1',
      track_title: 'Городские огни',
      artist_name: 'Артист',
      genre: 'Electronic',
      status: 'pending_expert_assignment',
      payment_status: 'completed',
      payment_amount: 1000,
      payment_transaction_id: 'TXN_SEED_3',
      required_expert_count: 5,
      completed_reviews_count: 0,
      assigned_experts: [] as string[],
      created_at: new Date(ttNow.getTime() - 1 * 86400000).toISOString(),
      updated_at: new Date(ttNow.getTime() - 6 * 3600000).toISOString(),
    };
    ttKeys.push(`track_test:requests:${ttReq3.id}`);
    ttValues.push(ttReq3);

    // -- Pending payment (for demo-artist, fresh) --
    const ttReq4 = {
      id: 'tt-seed-4',
      user_id: 'demo-artist',
      track_id: 'track-demo-2',
      track_title: 'Рассвет',
      artist_name: 'Артист',
      genre: 'Lo-Fi',
      status: 'pending_payment',
      payment_status: 'pending',
      payment_amount: 1000,
      required_expert_count: 5,
      completed_reviews_count: 0,
      assigned_experts: [] as string[],
      created_at: new Date(ttNow.getTime() - 2 * 3600000).toISOString(),
      updated_at: new Date(ttNow.getTime() - 2 * 3600000).toISOString(),
    };
    ttKeys.push(`track_test:requests:${ttReq4.id}`);
    ttValues.push(ttReq4);

    // All requests index
    const ttAllIds = ['tt-seed-1', 'tt-seed-2', 'tt-seed-3', 'tt-seed-4'];
    ttKeys.push('track_test:all_requests');
    ttValues.push(ttAllIds);

    // User-specific request indices
    ttKeys.push('track_test:user:artist-sandra:requests');
    ttValues.push(['tt-seed-1']);
    ttKeys.push('track_test:user:artist-liana:requests');
    ttValues.push(['tt-seed-2']);
    ttKeys.push('track_test:user:demo-artist:requests');
    ttValues.push(['tt-seed-3', 'tt-seed-4']);

    // Expert stats
    ttKeys.push('track_test:expert_stats:dj-1');
    ttValues.push({
      expert_id: 'dj-1', total_assigned: 2, total_completed: 1, total_coins: 50, rating_bonus: 0.05,
    });
    ttKeys.push('track_test:expert_stats:producer-maxam');
    ttValues.push({
      expert_id: 'producer-maxam', total_assigned: 2, total_completed: 1, total_coins: 50, rating_bonus: 0.05,
    });
    ttKeys.push('track_test:expert_stats:engineer-1');
    ttValues.push({
      expert_id: 'engineer-1', total_assigned: 1, total_completed: 1, total_coins: 50, rating_bonus: 0.05,
    });

    // Registered experts for SSE
    ttKeys.push('track_test:registered_experts');
    ttValues.push(['dj-1', 'producer-maxam', 'engineer-1']);

    await kv.mset(ttKeys, ttValues);
    console.log(`  track-test: ${ttAllIds.length} requests, ${ttReviews1.length + ttReviews2.length} reviews, 3 expert stats seeded`);

    // Mark as seeded
    // ============================
    // ARTIST SUBSCRIPTIONS (v19 - credit model)
    // ============================
    const artistSubscriptions = [
      {
        key: 'subscription:demo-user-123',
        data: {
          user_id: 'demo-user-123',
          tier: 'pro',
          tierName: 'Про',
          price: 39990,
          interval: 'month',
          expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          credits_remaining: 2,
          credits_per_month: 3,
          extra_mailing_price: 4000,
          discounts: { pitching: 0.10, marketing: 0.15, track_test: 0.10, banners: 0.10 },
          donation_fee: 0.05,
          coins_bonus: 0.15,
          created_at: '2025-12-01T10:00:00Z',
          updated_at: new Date().toISOString(),
        },
      },
      {
        key: 'subscription:artist-sandra',
        data: {
          user_id: 'artist-sandra',
          tier: 'start',
          tierName: 'Старт',
          price: 8990,
          interval: 'month',
          expires_at: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          credits_remaining: 1,
          credits_per_month: 1,
          extra_mailing_price: 5000,
          discounts: { pitching: 0.05, marketing: 0.05, track_test: 0, banners: 0.05 },
          donation_fee: 0.07,
          coins_bonus: 0.05,
          created_at: '2025-11-15T10:00:00Z',
          updated_at: new Date().toISOString(),
        },
      },
      {
        key: 'subscription:artist-dan',
        data: {
          user_id: 'artist-dan',
          tier: 'pro',
          tierName: 'Про',
          price: 399900,
          interval: 'year',
          expires_at: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          credits_remaining: 1,
          credits_per_month: 3,
          extra_mailing_price: 4000,
          discounts: { pitching: 0.10, marketing: 0.15, track_test: 0.10, banners: 0.10 },
          donation_fee: 0.05,
          coins_bonus: 0.15,
          created_at: '2025-06-01T10:00:00Z',
          updated_at: new Date().toISOString(),
        },
      },
      {
        key: 'subscription:artist-maxam',
        data: {
          user_id: 'artist-maxam',
          tier: 'elite',
          tierName: 'Бизнес',
          price: 1499900,
          interval: 'year',
          expires_at: new Date(Date.now() + 310 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          credits_remaining: 7,
          credits_per_month: 10,
          extra_mailing_price: 3000,
          discounts: { pitching: 0.15, marketing: 0.25, track_test: 0.20, banners: 0.15 },
          donation_fee: 0.03,
          coins_bonus: 0.25,
          created_at: '2025-04-01T10:00:00Z',
          updated_at: new Date().toISOString(),
        },
      },
      {
        key: 'subscription:artist-timur',
        data: {
          user_id: 'artist-timur',
          tier: 'start',
          tierName: 'Старт',
          price: 89900,
          interval: 'year',
          expires_at: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          credits_remaining: 0,
          credits_per_month: 1,
          extra_mailing_price: 5000,
          discounts: { pitching: 0.05, marketing: 0.05, track_test: 0, banners: 0.05 },
          donation_fee: 0.07,
          coins_bonus: 0.05,
          created_at: '2025-08-01T10:00:00Z',
          updated_at: new Date().toISOString(),
        },
      },
    ];

    const subKeys = artistSubscriptions.map(s => s.key);
    const subValues = artistSubscriptions.map(s => s.data);
    await kv.mset(subKeys, subValues);
    console.log(`  artist-subscriptions: ${artistSubscriptions.length} subscriptions seeded (pro: demo-user, start: sandra+timur, pro: dan, elite: maxam)`);

    // ============================
    // DJ SUBSCRIPTIONS
    // ============================
    const djSubscriptions = [
      {
        key: 'dj:subscription:dj-1',
        data: {
          djId: 'dj-1',
          planId: 'pro',
          planName: 'Pro',
          status: 'active',
          price: 1990,
          currency: 'RUB',
          interval: 'month',
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          limits: { mixes: -1, bookingsPerMonth: -1, dynamicPricing: true, promoAir: true, priority: true, referrals: true },
          updatedAt: new Date().toISOString(),
        },
      },
    ];

    const djSubKeys = djSubscriptions.map(s => s.key);
    const djSubValues = djSubscriptions.map(s => s.data);
    await kv.mset(djSubKeys, djSubValues);
    console.log(`  dj-subscriptions: ${djSubscriptions.length} DJ subscriptions seeded`);

    // Mark as seeded
    await kv.set(SEED_FLAG_KEY, {
      version: 19,
      seededAt: new Date().toISOString(),
      artistCount: DEMO_ARTISTS.length,
      trackCount: allTracks.length,
      guideVenueCount: guideVenues.length,
      venueProfileCount: venueProfiles.length,
      radioStationCount: radioStations.length,
      bookingCount: demoBookings.length,
      publishOrderCount: publishOrders.length,
      collabOfferCount: collabOffers.length,
      dmConversationCount: demoArtistDmConvs.length + 1,
      trackTestRequestCount: ttAllIds.length,
      trackTestReviewCount: ttReviews1.length + ttReviews2.length,
      artistSubscriptionCount: artistSubscriptions.length,
      djSubscriptionCount: djSubscriptions.length,
    });

    console.log('Demo data seeding complete (v19)!');
    return { seeded: true, message: `Seeded ${DEMO_ARTISTS.length} artists, ${allTracks.length} tracks, ${venueProfiles.length} venues, ${radioStations.length} radio stations, ${demoBookings.length} bookings, ${publishOrders.length} publish orders, ${collabOffers.length} collab offers, ${artistSubscriptions.length} subscriptions` };

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