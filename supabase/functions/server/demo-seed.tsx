/**
 * DEMO DATA SEED
 * Заполняет KV store демо-данными 12 артистов Promo.music при первом запуске
 * Идемпотентно - не перезаписывает существующие данные
 */

import * as kv from './kv-utils.tsx';

const SEED_FLAG_KEY = 'system:demo_seed_v4';

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

// Демо-сервисы продюсеров
function generateProducerServices(): any[] {
  return [
    { id: 'svc-1', type: 'mixing', title: 'Профессиональное сведение', producer: 'Максам', producerId: 'artist-maxam', basePrice: 8000, deliveryDays: 4, revisions: 3, rating: 4.9, orders: 47, status: 'active', createdAt: new Date().toISOString() },
    { id: 'svc-2', type: 'mastering', title: 'Мастеринг для стримингов', producer: 'Дэн', producerId: 'artist-dan', basePrice: 5000, deliveryDays: 2, revisions: 2, rating: 4.8, orders: 62, status: 'active', createdAt: new Date().toISOString() },
    { id: 'svc-3', type: 'arrangement', title: 'Аранжировка под ключ', producer: 'Алиса', producerId: 'artist-alisa', basePrice: 15000, deliveryDays: 6, revisions: 3, rating: 5.0, orders: 23, status: 'active', createdAt: new Date().toISOString() },
    { id: 'svc-4', type: 'vocal_recording', title: 'Запись вокала в студии', producer: 'Лиана', producerId: 'artist-liana', basePrice: 3000, deliveryDays: 1, revisions: 1, rating: 4.7, orders: 89, status: 'active', createdAt: new Date().toISOString() },
    { id: 'svc-5', type: 'ghost_production', title: 'Гост-продакшн (NDA)', producer: 'Максам', producerId: 'artist-maxam', basePrice: 25000, deliveryDays: 10, revisions: 5, rating: 4.9, orders: 15, status: 'active', createdAt: new Date().toISOString() },
    { id: 'svc-6', type: 'beatmaking', title: 'Кастомный бит на заказ', producer: 'Тимур', producerId: 'artist-timur', basePrice: 10000, deliveryDays: 5, revisions: 3, rating: 4.8, orders: 34, status: 'active', createdAt: new Date().toISOString() },
    { id: 'svc-7', type: 'sound_design', title: 'Саунд-дизайн для видео', producer: 'Ева', producerId: 'artist-eva', basePrice: 12000, deliveryDays: 7, revisions: 2, rating: 4.6, orders: 19, status: 'active', createdAt: new Date().toISOString() },
    { id: 'svc-8', type: 'consultation', title: 'Консультация по продакшну', producer: 'Дэн', producerId: 'artist-dan', basePrice: 2000, deliveryDays: 0, revisions: 0, rating: 5.0, orders: 112, status: 'active', createdAt: new Date().toISOString() },
  ];
}

// Демо-портфолио (до/после)
function generatePortfolio(): any[] {
  return [
    { id: 'pf-1', title: 'Сведение вокала R&B трека', artist: 'Лиана', type: 'Сведение', year: '2025', description: 'Баланс вокала с бэкингом, деэссер, компрессия, ревербератор.', producerId: 'artist-maxam' },
    { id: 'pf-2', title: 'Мастеринг Trap альбома', artist: 'Тимур', type: 'Мастеринг', year: '2025', description: 'EQ, мультибэнд-компрессия, лимитирование до -14 LUFS.', producerId: 'artist-dan' },
    { id: 'pf-3', title: 'Аранжировка поп-хита', artist: 'Сандра', type: 'Аранжировка', year: '2026', description: 'Из демо на телефон - в полноценную аранжировку с живыми струнными.', producerId: 'artist-alisa' },
    { id: 'pf-4', title: 'Техно-ремикс клубного трека', artist: 'Ева', type: 'Ремикс', year: '2025', description: 'Переработка оригинала в техно-формат для клубного DJ-сета.', producerId: 'artist-eva' },
    { id: 'pf-5', title: 'Lo-Fi обработка джазового стандарта', artist: 'Алиса', type: 'Саунд-дизайн', year: '2026', description: 'Виниловый шум, битовый хруст, тёплая сатурация.', producerId: 'artist-artem' },
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

    // 11. Set platform stats (updated with beats)
    await kv.set('stats:platform', JSON.stringify({
      totalArtists: DEMO_ARTISTS.length,
      totalTracks: allTracks.length,
      totalPlays: DEMO_ARTISTS.reduce((sum, a) => sum + a.totalPlays, 0),
      totalSubscribers: DEMO_ARTISTS.reduce((sum, a) => sum + a.subscribers, 0),
      totalBeats: beats.length,
      updatedAt: new Date().toISOString(),
    }));

    // Mark as seeded
    await kv.set(SEED_FLAG_KEY, JSON.stringify({
      version: 4,
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