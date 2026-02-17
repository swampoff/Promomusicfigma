/**
 * DEMO DATA SEED (compact v19)
 * Заполняет KV store демо-данными ПРОМО.МУЗЫКА при первом запуске
 * Идемпотентно - не перезаписывает существующие данные
 */

import * as kv from './kv_store.tsx';

const SEED_FLAG_KEY = 'system:demo_seed_v19';
const D = 86400000; // 1 day in ms
const H = 3600000;  // 1 hour in ms
const now = () => new Date().toISOString();
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const future = (ms: number) => new Date(Date.now() + ms).toISOString();
const rnd = (max: number, min = 0) => Math.floor(Math.random() * (max - min)) + min;

// ── 12 демо-артистов ──
const A = [
  { id: 'artist-sandra', name: 'Сандра', slug: 'sandra', genre: 'Pop', city: 'Москва', subs: 45200, ml: 128000, tp: 3540000, v: true, color: '#FF577F' },
  { id: 'artist-liana', name: 'Лиана', slug: 'liana', genre: 'R&B', city: 'Санкт-Петербург', subs: 32100, ml: 89000, tp: 2150000, v: true, color: '#f43f5e' },
  { id: 'artist-dan', name: 'Дэн', slug: 'dan', genre: 'Electronic', city: 'Казань', subs: 67800, ml: 215000, tp: 5890000, v: true, color: '#3b82f6' },
  { id: 'artist-maxam', name: 'Максам', slug: 'maxam', genre: 'Hip-Hop', city: 'Новосибирск', subs: 91200, ml: 342000, tp: 12400000, v: true, color: '#06b6d4' },
  { id: 'artist-mark', name: 'Марк', slug: 'mark', genre: 'House', city: 'Екатеринбург', subs: 28500, ml: 76000, tp: 1870000, v: true, color: '#FF577F' },
  { id: 'artist-stella', name: 'Стелла', slug: 'stella', genre: 'Dance', city: 'Краснодар', subs: 53600, ml: 167000, tp: 4210000, v: true, color: '#a855f7' },
  { id: 'artist-nika', name: 'Ника', slug: 'nika', genre: 'Indie', city: 'Москва', subs: 18900, ml: 52000, tp: 890000, v: false, color: '#10b981' },
  { id: 'artist-roman', name: 'Роман', slug: 'roman', genre: 'Rock', city: 'Самара', subs: 24300, ml: 68000, tp: 1450000, v: true, color: '#ef4444' },
  { id: 'artist-alisa', name: 'Алиса', slug: 'alisa', genre: 'Jazz', city: 'Москва', subs: 15700, ml: 41000, tp: 720000, v: false, color: '#f59e0b' },
  { id: 'artist-timur', name: 'Тимур', slug: 'timur', genre: 'Trap', city: 'Уфа', subs: 78400, ml: 289000, tp: 8920000, v: true, color: '#8b5cf6' },
  { id: 'artist-eva', name: 'Ева', slug: 'eva', genre: 'Techno', city: 'Калининград', subs: 41200, ml: 134000, tp: 3670000, v: true, color: '#06b6d4' },
  { id: 'artist-artem', name: 'Артём', slug: 'artem', genre: 'Lo-Fi', city: 'Воронеж', subs: 35600, ml: 98000, tp: 2340000, v: false, color: '#14b8a6' },
];

const AVATARS = [
  '1494790108377-be9c29b29330', '1534528741775-53994a69daeb', '1507003211169-0a1dd7228f2d',
  '1500648767791-00dcc994a43e', '1472099645785-5658abf4ff4e', '1438761681033-6461ffad8d80',
  '1544005313-94ddf0286df2', '1506794778202-cad84cf45f1d', '1531746020798-e6953c6e8e04',
  '1492562080023-ab3db95bfbce', '1487412720507-e7ab37603c6f', '1463453091185-61582044d556',
];
const COVERS = [
  '1511671782779-c97d3d27a1d4', '1514525253161-7a46d19cd819', '1571266028243-e4733b0f0bb0',
  '1493225457124-a3eb161ffa5f', '1470225620780-dba8ba36b745', '1501612780327-45045538702b',
  '1510915361894-db8b60106cb1', '1498038432885-c6f3f1b912ee', '1415201364774-f6f0bb35f28f',
  '1459749411175-04bf5292ceea', '1574169208507-84376144848b', '1508700115892-45ecd05ae2ad',
];

function fullArtist(a: typeof A[0], i: number) {
  return {
    ...a, id: a.id, subscribers: a.subs, monthlyListeners: a.ml, totalPlays: a.tp, isVerified: a.v, accentColor: a.color,
    bio: `${a.genre}-артист из г. ${a.city}. Активный участник музыкальной сцены ПРОМО.МУЗЫКА.`,
    avatar: `https://images.unsplash.com/photo-${AVATARS[i]}?w=200&h=200&fit=crop`,
    coverImage: `https://images.unsplash.com/photo-${COVERS[i]}?w=800&h=400&fit=crop`,
    socialLinks: { instagram: `@${a.slug}_music`, telegram: `@${a.slug}_promo` },
  };
}

// ── Генераторы данных (компактные) ──

const TRACK_NAMES: Record<string, string[]> = {
  Pop: ['Огни города', 'Не отпускай', 'Танцуй со мной', 'Лето навсегда'],
  'R&B': ['Midnight Soul', 'Шёпот ветра', 'Без слов', 'Gravity'],
  Electronic: ['Neon Dreams', 'Pulse', 'Digital Rain', 'Horizon'],
  'Hip-Hop': ['На бите', 'Flow State', 'Улицы говорят', 'Скайлайн'],
  House: ['Feel the Groove', 'Sunset Drive', 'Deep Inside', 'Club Ritual'],
  Dance: ['Ночные волны', 'Euphoria', 'Let It Go', 'Crystal'],
  Indie: ['Бумажные крылья', 'Тихий океан', 'Акварель', 'Следы'],
  Rock: ['Мост', 'Сталь и огонь', 'Рассвет', 'Дорога'],
  Jazz: ['Blue Velvet Night', 'Swing Theory', 'Autumn Leaves Reimagined', 'Midnight in Moscow'],
  Trap: ['FLEX', 'Dark Mode', 'Ice Cold', 'No Cap'],
  Techno: ['Signal', 'Warehouse', 'Acid Trip', 'Machine Code'],
  'Lo-Fi': ['Rainy Afternoon', 'Study Session', 'Warm Coffee', 'Late Night Thoughts'],
};

function genTracks(a: ReturnType<typeof fullArtist>) {
  const titles = TRACK_NAMES[a.genre] || ['Track 1', 'Track 2', 'Track 3', 'Track 4'];
  return titles.map((title, i) => ({
    id: `track-${a.slug}-${i + 1}`, title, artist: a.name, artistId: a.id, genre: a.genre,
    cover: a.coverImage, duration: ['3:24', '4:12', '3:58', '2:45'][i],
    plays: rnd(500000, 10000), likes: rnd(20000, 500), downloads: rnd(5000, 100),
    status: 'approved', releaseDate: `2025-${String(rnd(12, 1)).padStart(2, '0')}-${String(rnd(28, 1)).padStart(2, '0')}`,
    createdAt: ago(rnd(180) * D),
  }));
}

function genBeats() {
  const B = [
    ['Midnight Flow', 'artist-maxam', 'Максам', 'Trap', 140, 'Am'], ['Summer Vibes', 'artist-sandra', 'Сандра', 'Pop', 120, 'C'],
    ['Dark Energy', 'artist-timur', 'Тимур', 'Drill', 150, 'F#m'], ['Lo-Fi Dreams', 'artist-artem', 'Артём', 'Lo-Fi', 85, 'Dm'],
    ['Neon Pulse', 'artist-dan', 'Дэн', 'Electronic', 128, 'Gm'], ['Club Ritual', 'artist-mark', 'Марк', 'House', 124, 'Eb'],
    ['Warehouse 303', 'artist-eva', 'Ева', 'Techno', 135, 'Cm'], ['Velvet Soul', 'artist-alisa', 'Алиса', 'Jazz', 95, 'Bb'],
    ['Мятеж', 'artist-roman', 'Роман', 'Rock', 145, 'Em'], ['Акварель', 'artist-nika', 'Ника', 'Indie', 110, 'A'],
    ['Gravity', 'artist-liana', 'Лиана', 'R&B', 92, 'Fm'], ['Crystal', 'artist-stella', 'Стелла', 'Dance', 130, 'D'],
    ['Ice Cold', 'artist-timur', 'Тимур', 'Trap', 155, 'Bbm'], ['Sunset Drive', 'artist-mark', 'Марк', 'House', 122, 'Ab'],
    ['Binary Love', 'artist-dan', 'Дэн', 'Electronic', 132, 'F'], ['Rainy Afternoon', 'artist-artem', 'Артём', 'Lo-Fi', 80, 'G'],
  ];
  const prices = [3000, 4000, 5000, 6000, 7500, 8000, 10000, 12000, 15000];
  return B.map(([title, pid, producer, genre, bpm, key], i) => ({
    id: `beat-${i + 1}`, title, producer, producerId: pid, genre, bpm, key,
    tags: [genre.toLowerCase()], duration: ['2:45', '3:12', '3:38', '4:01'][i % 4],
    price: prices[i % prices.length], plays: rnd(25000, 2000), purchases: rnd(80, 5),
    rating: +(4.3 + Math.random() * 0.7).toFixed(1), status: 'active',
    licenseTypes: { basic: prices[i % prices.length], premium: prices[i % prices.length] * 3, exclusive: prices[i % prices.length] * 10 },
    createdAt: ago(rnd(120) * D),
  }));
}

function genServices() {
  const S = [
    ['svc-1', 'mixing', 'Профессиональное сведение', 'artist-maxam', 'Максам', 8000, 4, 3, 4.9, 47],
    ['svc-2', 'mastering', 'Мастеринг для стримингов', 'artist-dan', 'Дэн', 5000, 2, 2, 4.8, 62],
    ['svc-3', 'arrangement', 'Аранжировка под ключ', 'artist-alisa', 'Алиса', 15000, 6, 3, 5.0, 23],
    ['svc-4', 'vocal_recording', 'Запись вокала в студии', 'artist-liana', 'Лиана', 3000, 1, 1, 4.7, 89],
    ['svc-5', 'ghost_production', 'Гост-продакшн (NDA)', 'artist-maxam', 'Максам', 25000, 10, 5, 4.9, 15],
    ['svc-6', 'beatmaking', 'Кастомный бит на заказ', 'artist-timur', 'Тимур', 10000, 5, 3, 4.8, 34],
    ['svc-7', 'sound_design', 'Саунд-дизайн для видео', 'artist-eva', 'Ева', 12000, 7, 2, 4.6, 19],
    ['svc-8', 'consultation', 'Консультация по продакшну', 'artist-dan', 'Дэн', 2000, 0, 0, 5.0, 112],
    ['svc-9', 'session_musician', 'Сессионная гитара', 'artist-artem', 'Артём', 6000, 3, 2, 4.8, 28],
    ['svc-10', 'mixing', 'Сведение вокала + мастеринг', 'artist-nika', 'Ника', 10000, 5, 3, 4.9, 41],
    ['svc-11', 'mixing', 'Сведение для кино и рекламы', 'artist-eva', 'Ева', 10000, 5, 2, 4.7, 12],
    ['svc-12', 'beatmaking', 'Авторские биты Hip-Hop / R&B', 'artist-maxam', 'Максам', 10000, 4, 3, 4.9, 29],
  ];
  return S.map(([id, type, title, pid, producer, price, days, revs, rating, orders]) => ({
    id, type, title, producerId: pid, producer, basePrice: price, minPrice: Math.round((price as number) * 0.6),
    maxPrice: (price as number) * 2, deliveryDays: days, revisions: revs, rating, orders, status: 'active',
    description: `Профессиональная услуга: ${title}`,
    includes: ['Полный пакет', `${revs} правки`, 'WAV + MP3'],
    requirements: 'WAV 24bit 48kHz, reference-трек',
    createdAt: now(),
  }));
}

function genDigitalGoods() {
  const G = [
    ['dg-sp-1', 'Lo-Fi Essentials Vol.2', 'artist-maxam', 'Максам', 'sample_pack', 1200, 4.7, 84],
    ['dg-pr-1', 'Analog Warmth - Serum Presets', 'artist-dan', 'Дэн', 'preset', 900, 4.5, 123],
    ['dg-dk-1', 'Trap Weapons - Drum Kit', 'artist-timur', 'Тимур', 'drum_kit', 700, 4.8, 256],
    ['dg-tpl-1', 'Pop Hit - Ableton Template', 'artist-alisa', 'Алиса', 'template', 2500, 4.3, 45],
    ['dg-tut-1', 'Вокальный микс от А до Я', 'artist-maxam', 'Максам', 'tutorial', 3500, 4.9, 67],
    ['dg-lp-1', 'Organic Textures - Loop Pack', 'artist-dan', 'Дэн', 'loop', 800, 4.4, 98],
    ['dg-sp-2', 'R&B Vocal Chops', 'artist-sandra', 'Сандра', 'sample_pack', 1500, 4.6, 72],
    ['dg-pr-2', 'Vintage Keys - Kontakt Library', 'artist-timur', 'Тимур', 'preset', 4200, 4.7, 34],
  ];
  return G.map(([id, title, pid, producer, cat, price, rating, sales]) => ({
    id, title, producerId: pid, producer, category: cat, price, rating, sales,
    description: `${title} - профессиональный набор для продакшна`,
    tags: [String(cat)], fileSize: '320 MB', format: 'WAV', views: rnd(3000, 500),
    status: 'active', createdAt: now(),
  }));
}

function genProducerProfiles() {
  const P = [
    ['producer-maxam', 'artist-maxam', 'Максам', ['mixing', 'ghost_production', 'beatmaking'], ['Hip-Hop', 'R&B', 'Trap'], 'Москва', 4.9, 34, 8, 3000, 890000],
    ['producer-dan', 'artist-dan', 'Дэн', ['mastering', 'consultation'], ['Electronic', 'Pop', 'Indie'], 'Санкт-Петербург', 4.9, 48, 6, 2500, 1250000],
    ['producer-alisa', 'artist-alisa', 'Алиса', ['arrangement', 'session_musician'], ['Pop', 'Indie', 'Acoustic'], 'Новосибирск', 5.0, 19, 10, 4000, 460000],
    ['producer-eva', 'artist-eva', 'Ева', ['sound_design', 'mixing'], ['Cinematic', 'Ambient', 'Electronic'], 'Калининград', 4.7, 15, 5, 3500, 380000],
    ['producer-nika', 'artist-nika', 'Ника', ['mixing', 'vocal_recording'], ['Pop', 'R&B', 'Soul'], 'Москва', 4.9, 27, 7, 2800, 520000],
    ['producer-artem', 'artist-artem', 'Артём', ['session_musician', 'arrangement', 'mixing'], ['Rock', 'Blues', 'Jazz', 'Lo-Fi'], 'Екатеринбург', 4.8, 22, 12, 2000, 210000],
  ];
  return P.map(([id, uid, name, specs, genres, city, rating, reviews, exp, rate, earnings]) => ({
    id, userId: uid, producerName: name, specializations: specs, genres, city, country: 'Россия',
    averageRating: rating, reviewCount: reviews, experienceYears: exp, hourlyRate: rate, totalEarnings: earnings,
    bio: `Профессиональный звукоинженер/продюсер из ${city}. ${exp} лет опыта.`,
    bioShort: `${(specs as string[])[0]} - ${(genres as string[]).join(', ')}`,
    languages: ['Русский', 'English'], availability: 'available',
    softwareUsed: ['Pro Tools', 'Logic Pro X'], hardwareUsed: ['Neumann U87'],
    responseTimeHours: 2, acceptsRushOrders: true, rushOrderSurchargePercent: 40,
    totalServices: (specs as string[]).length, totalOrders: reviews, createdAt: now(),
  }));
}

function genProducerReviews() {
  const R = [
    ['rev-1', 'producer-maxam', 'Лиана', 'mixing', 5, 'Невероятный микс - вокал звучит объёмно и тепло.'],
    ['rev-2', 'producer-maxam', 'Тимур', 'ghost_production', 5, 'Результат превзошёл ожидания. NDA строго.'],
    ['rev-3', 'producer-dan', 'Сандра', 'mastering', 5, 'На Spotify звучит громко и чисто.'],
    ['rev-4', 'producer-dan', 'Ева', 'consultation', 5, 'Подробно разобрал проект и дал советы.'],
    ['rev-5', 'producer-alisa', 'Сандра', 'arrangement', 5, 'Превратила мелодию в шедевр!'],
    ['rev-6', 'producer-eva', 'Клиент NDA', 'sound_design', 4, 'Хороший результат, стоил ожидания.'],
    ['rev-7', 'producer-nika', 'Лиана', 'mixing', 5, 'Великолепно свела вокал!'],
    ['rev-8', 'producer-artem', 'Алиса', 'session_musician', 5, 'Потрясающая гитарная партия!'],
    ['rev-9', 'producer-dan', 'Артём', 'mastering', 5, 'Все 5 треков как единое целое.'],
    ['rev-10', 'producer-maxam', 'Дэн', 'mixing', 5, 'Всегда на высоте.'],
  ];
  return R.map(([id, pid, name, stype, rating, text], i) => ({
    id, producerId: pid, reviewerName: name, serviceType: stype, rating,
    reviewText: text, qualityScore: 5, communicationScore: 5, timelinessScore: rating === 4 ? 3 : 5,
    wouldRecommend: true, createdAt: ago((i + 1) * 15 * D),
  }));
}

function genProducerOrders() {
  const O = [
    ['ord-m1', 'producer-maxam', 'Лиана', 'artist-liana', 'mixing', 8000, 'in_progress', 65],
    ['ord-m2', 'producer-maxam', 'Тимур', 'artist-timur', 'ghost_production', 25000, 'in_progress', 30],
    ['ord-m3', 'producer-maxam', 'Сандра', 'artist-sandra', 'mixing', 10000, 'review', 95],
    ['ord-d1', 'producer-dan', 'Тимур', 'artist-timur', 'mastering', 5000, 'in_progress', 70],
    ['ord-d2', 'producer-dan', 'Артём', 'artist-artem', 'mastering', 20000, 'in_progress', 40],
    ['ord-d3', 'producer-dan', 'Сандра', 'artist-sandra', 'mastering', 5000, 'completed', 100],
    ['ord-e1', 'producer-eva', 'Клиент NDA', null, 'sound_design', 15000, 'in_progress', 55],
    ['ord-n1', 'producer-nika', 'Лиана', 'artist-liana', 'mixing', 10000, 'in_progress', 80],
    ['ord-a1', 'producer-artem', 'Алиса', 'artist-alisa', 'session_musician', 6000, 'in_progress', 60],
    ['ord-al1', 'producer-alisa', 'Сандра', 'artist-sandra', 'arrangement', 18000, 'in_progress', 45],
    ['ord-m7', 'producer-maxam', 'Роман', 'artist-roman', 'mixing', 8000, 'pending', 0],
    ['ord-d6', 'producer-dan', 'Марк', 'artist-mark', 'mastering', 5000, 'revision', 75],
    ['ord-e4', 'producer-eva', 'Тимур', 'artist-timur', 'sound_design', 12000, 'cancelled', 10],
  ];
  return O.map(([id, pid, client, cid, stype, price, status, progress], i) => ({
    id, producerId: pid, producerUserId: (pid as string).replace('producer-', 'artist-'),
    client, clientId: cid, serviceType: stype, serviceTitle: String(stype).replace(/_/g, ' '),
    price, status, progress, deadline: future((5 + i) * D), createdAt: ago((10 - i) * D),
  }));
}

function genProducerWallets() {
  const W: [string, number, number, number][] = [
    ['producer-maxam', 45000, 890000, 128000],
    ['producer-dan', 62000, 1250000, 95000],
    ['producer-eva', 18000, 380000, 48000],
    ['producer-nika', 28000, 520000, 65000],
    ['producer-artem', 12000, 210000, 32000],
    ['producer-alisa', 22000, 460000, 42000],
  ];
  return W.map(([pid, balance, total, monthly]) => ({
    producerId: pid, balance, pendingPayout: balance, totalEarned: total, monthlyEarnings: monthly,
    commissionRate: 10, payoutMethods: [{ id: `pm-${pid}`, type: 'card', label: 'Карта *' + rnd(9999, 1000), isDefault: true }],
    transactions: [
      { id: `tx-${pid}-1`, type: 'income', amount: Math.round(monthly * 0.3), description: 'Доход', date: ago(2 * D), status: 'confirmed' },
      { id: `tx-${pid}-2`, type: 'commission', amount: -Math.round(monthly * 0.03), description: 'Комиссия 10%', date: ago(2 * D), status: 'confirmed' },
      { id: `tx-${pid}-3`, type: 'payout', amount: -Math.round(monthly * 0.8), description: 'Вывод на карту', date: ago(15 * D), status: 'completed' },
    ],
    updatedAt: now(),
  }));
}

function genMarketplaceOrders() {
  const MO: [string, string, string, string, string, string, number, string, number][] = [
    ['sord-demo-1', 'svc-1', 'Профессиональное сведение', 'mixing', 'artist-maxam', 'Максам', 8000, 'in_progress', 65],
    ['sord-demo-2', 'svc-2', 'Мастеринг для стримингов', 'mastering', 'artist-dan', 'Дэн', 7500, 'pending', 0],
    ['sord-demo-3', 'svc-3', 'Аранжировка под ключ', 'arrangement', 'artist-alisa', 'Алиса', 15000, 'completed', 100],
    ['sord-demo-4', 'svc-6', 'Кастомный бит на заказ', 'beatmaking', 'artist-timur', 'Тимур', 10000, 'revision', 80],
    ['sord-demo-5', 'svc-8', 'Консультация по продакшну', 'consultation', 'artist-dan', 'Дэн', 4000, 'accepted', 0],
  ];
  return MO.map(([id, svcId, title, stype, pid, pname, price, status, progress], i) => ({
    id, serviceId: svcId, serviceTitle: title, serviceType: stype,
    producerId: pid, producerName: pname, clientId: 'demo-user', clientName: 'Демо Пользователь',
    message: `Заказ: ${title}`, urgency: ['normal', 'fast', 'normal', 'normal', 'urgent'][i],
    price, commission: Math.round(price * 0.1), producerPayout: Math.round(price * 0.9),
    status, progress, deliveryDays: [4, 2, 6, 5, 0][i],
    deadline: status === 'completed' ? ago(D) : future(3 * D), createdAt: ago((6 - i) * D),
  }));
}

function genPortfolio() {
  return [
    { id: 'pf-1', title: 'Сведение вокала R&B', type: 'Сведение', producerId: 'artist-maxam', producerName: 'Максам', year: '2025' },
    { id: 'pf-2', title: 'Мастеринг Trap альбома', type: 'Мастеринг', producerId: 'artist-dan', producerName: 'Дэн', year: '2025' },
    { id: 'pf-3', title: 'Аранжировка поп-хита', type: 'Аранжировка', producerId: 'artist-alisa', producerName: 'Алиса', year: '2026' },
    { id: 'pf-4', title: 'Техно-ремикс клубного трека', type: 'Ремикс', producerId: 'artist-eva', producerName: 'Ева', year: '2025' },
    { id: 'pf-5', title: 'Lo-Fi обработка джазового стандарта', type: 'Саунд-дизайн', producerId: 'artist-artem', producerName: 'Артём', year: '2026' },
  ];
}

function genVenueProfiles() {
  const V: [string, string, string, string, number, string[], string, string][] = [
    ['venue-1', 'Bar Decor', 'bar', 'ул. Мясницкая, 24/7', 120, ['Jazz', 'Soul', 'Funk'], 'Москва', 'business'],
    ['venue-2', 'Lounge 21', 'lounge', 'Невский пр., 21', 80, ['Lounge', 'Deep House'], 'Санкт-Петербург', 'enterprise'],
    ['venue-3', 'Sky Rooftop', 'restaurant', 'ул. Пушкина, 12', 200, ['House', 'Pop'], 'Казань', 'start'],
  ];
  return V.map(([id, name, vtype, addr, cap, genres, city, plan]) => ({
    id, userId: id, venueName: name, venueType: vtype, address: addr, city, country: 'Россия',
    capacity: cap, genres, description: `${name} - ${vtype} с живой музыкой в ${city}`,
    logoUrl: `https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop`,
    coverImageUrl: `https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=400&fit=crop`,
    status: 'active', verified: true, subscriptionStatus: 'active', subscriptionPlan: plan,
    subscriptionStartDate: '2025-09-01', subscriptionEndDate: '2026-09-01',
    createdAt: '2025-08-15T10:00:00Z', updatedAt: now(),
  }));
}

function genVenueAnalytics() {
  return [
    { venueId: 'venue-1', totalPlaylists: 8, totalTracks: 342, averageRating: 4.7, totalImpressions: 45200, monthlySpending: 35000, avgROI: 185.3, engagementRate: 82.3 },
    { venueId: 'venue-2', totalPlaylists: 12, totalTracks: 520, averageRating: 4.9, totalImpressions: 89500, monthlySpending: 78000, avgROI: 245.7, engagementRate: 91.0 },
    { venueId: 'venue-3', totalPlaylists: 5, totalTracks: 180, averageRating: 4.5, totalImpressions: 21300, monthlySpending: 18000, avgROI: 120.4, engagementRate: 74.5 },
  ];
}

function genRadioStations() {
  const RS: [string, string, string, string, string, string[], number][] = [
    ['station-1', 'radio-1', 'ПРОМО.МУЗЫКА FM', 'FM 100.5', 'Москва', ['Pop', 'Hits'], 1200000],
    ['station-2', 'radio-2', 'Sound Wave', 'FM 95.3', 'Санкт-Петербург', ['Electronic', 'Dance'], 680000],
    ['station-3', 'radio-3', 'Retro Gold', 'FM 88.7', 'Казань', ['Retro', 'Classics'], 430000],
    ['station-4', 'radio-4', 'Night Vibes', 'FM 103.2', 'Москва', ['R&B', 'Hip-Hop'], 920000],
  ];
  return RS.map(([id, uid, name, freq, city, formats, audience]) => ({
    id, userId: uid, stationName: name, frequency: freq, city, country: 'Россия', formats, audienceSize: audience,
    description: `${name} - ${formats.join(', ')} радио из ${city}`,
    logoUrl: `https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop`,
    streamUrl: `https://stream.${String(name).toLowerCase().replace(/\s/g, '')}.ru/live`, isOnline: true,
    createdAt: '2024-01-01T10:00:00Z', updatedAt: now(),
  }));
}

function genRadioAdSlots(stations: any[]) {
  const slots: Record<string, any[]> = {};
  const timeSlots = ['06:00-10:00', '10:00-14:00', '14:00-18:00', '18:00-22:00', '22:00-02:00'];
  stations.forEach(s => {
    slots[s.id] = timeSlots.map((ts, i) => ({
      id: `slot-${s.id}-${i + 1}`, stationId: s.id, timeSlot: ts,
      price: [5000, 3000, 2000, 4000, 1500][i], duration: 30, status: 'available',
      createdAt: '2025-12-01T10:00:00Z', updatedAt: now(),
    }));
  });
  return slots;
}

function genRadioArtistRequests(stations: any[]) {
  const result: Record<string, any[]> = {};
  stations.forEach(s => {
    result[s.id] = A.slice(0, 4).map((a, i) => ({
      id: `req-${s.id}-${i + 1}`, artistId: a.id, artistName: a.name, genre: a.genre,
      trackTitle: `${a.name} - Новый сингл`, status: ['pending', 'pending', 'accepted', 'rejected'][i],
      message: `Прошу рассмотреть мой трек. Жанр: ${a.genre}.`, createdAt: ago((i + 1) * 2 * D),
    }));
  });
  return result;
}

function genRadioVenueRequests(stations: any[]) {
  const venues = [{ id: 'venue-1', name: 'Bar Decor' }, { id: 'venue-2', name: 'Lounge 21' }, { id: 'venue-3', name: 'Sky Rooftop' }];
  const result: Record<string, any[]> = {};
  stations.forEach(s => {
    result[s.id] = venues.slice(0, 2).map((v, i) => ({
      id: `vreq-${s.id}-${i + 1}`, venueId: v.id, venueName: v.name,
      packageType: ['15sec', '30sec'][i], duration: [15, 30][i],
      totalPrice: [15000, 35000][i], stationPayout: [12750, 29750][i], platformFee: [2250, 5250][i],
      totalPlays: [70, 35][i], completedPlays: [35, 0][i], impressions: [105000, 0][i],
      status: ['in_progress', 'pending'][i], submittedAt: ago(7 * D),
    }));
  });
  return result;
}

function genRadioFinance(stations: any[]) {
  const result: Record<string, any> = {};
  const bases = [285000, 142000, 68000, 195000];
  stations.forEach((s, i) => {
    result[s.id] = {
      totalRevenue: bases[i] * 10, monthlyRevenue: bases[i],
      adRevenue: Math.round(bases[i] * 0.65), subscriptionRevenue: Math.round(bases[i] * 0.35),
      pendingPayments: Math.round(bases[i] * 0.12), growth: +(5 + Math.random() * 20).toFixed(1),
    };
  });
  return result;
}

function genBookings() {
  const B: [string, string, string, string, string, string, string, string, number, string][] = [
    ['booking-demo-1', 'venue-1', 'artist-alisa', 'live', 'Jazz Night - Алиса', 'Bar Decor', 'Москва', '2026-02-21', 15000, 'deposit_paid'],
    ['booking-demo-2', 'venue-2', 'artist-dan', 'dj_set', 'Deep House Friday - Дэн', 'Lounge 21', 'Санкт-Петербург', '2026-02-28', 20000, 'accepted'],
    ['booking-demo-3', 'venue-1', 'artist-sandra', 'concert', 'Сандра - Огни города', 'Bar Decor', 'Москва', '2026-03-08', 25000, 'pending'],
    ['booking-demo-4', 'venue-3', 'artist-mark', 'dj_set', 'Rooftop Sunset - Марк', 'Sky Rooftop', 'Казань', '2026-02-22', 20000, 'confirmed'],
    ['booking-demo-5', 'venue-2', 'artist-stella', 'dj_set', 'Ночные Волны Live - Стелла', 'Lounge 21', 'Санкт-Петербург', '2026-03-01', 18000, 'pending'],
    ['booking-demo-6', 'venue-1', 'artist-liana', 'live', 'R&B Night - Лиана', 'Bar Decor', 'Москва', '2026-01-25', 12000, 'completed'],
  ];
  return B.map(([id, reqId, perfId, etype, title, venue, city, date, price, status]) => ({
    id, requesterId: reqId, requesterType: 'venue', performerId: perfId, performerType: 'artist',
    eventType: etype, eventTitle: title, venueName: venue, venueCity: city, eventDate: date,
    offeredPrice: price, performerFee: Math.round((price as number) * 0.9),
    platformCommission: Math.round((price as number) * 0.1), status,
    performer: { id: perfId, displayName: title.split(' - ').pop() || '' },
    requester: { id: reqId, displayName: venue },
    createdAt: ago(10 * D), updatedAt: ago(2 * D),
  }));
}

function genAccountingData() {
  return {
    reports: [
      { id: 1, type: 'vat', period: '2026-Q1', status: 'accepted', amount: 5840000, taxAmount: 1051200, deadline: '2026-04-25' },
      { id: 2, type: 'profit', period: '2026-01', status: 'sent', amount: 2450000, taxAmount: 490000, deadline: '2026-02-28' },
      { id: 3, type: 'usn', period: '2025', status: 'ready', amount: 18650000, taxAmount: 1119000, deadline: '2026-03-31' },
    ],
    documents: [
      { id: 1, type: 'invoice', number: 'СЧ-00245', date: '2026-02-01', counterparty: 'ООО "МузТех"', amount: 125000, status: 'paid' },
      { id: 2, type: 'act', number: 'АКТ-00123', date: '2026-01-31', counterparty: 'ИП Волков А.С.', amount: 65000, status: 'issued' },
      { id: 3, type: 'receipt', number: 'КВ-00456', date: '2026-01-30', counterparty: 'АО "Русское Радио"', amount: 42000, status: 'paid' },
    ],
    ledger: [
      { id: 1, date: '2026-02-01', documentNumber: 'СЧ-00245', counterparty: 'ООО "МузТех"', debit: '51', credit: '62.01', amount: 125000, description: 'Оплата по счету' },
      { id: 2, date: '2026-01-31', documentNumber: 'АКТ-00123', counterparty: 'ИП Волков А.С.', debit: '62.01', credit: '90.01', amount: 65000, description: 'Выручка от услуг' },
    ],
    counterparties: [
      { id: 1, name: 'ООО "МузТех"', inn: '7704567890', type: 'customer', totalReceived: 2450000, balance: 125000, status: 'active' },
      { id: 2, name: 'ИП Волков А.С.', inn: '771234567890', type: 'customer', totalReceived: 890000, balance: 65000, status: 'active' },
    ],
    calendar: [
      { id: 1, title: 'НДС за 1 квартал 2026', date: '2026-04-25', type: 'vat', completed: true, amount: 1051200 },
      { id: 2, title: 'Налог на прибыль за январь', date: '2026-02-28', type: 'profit', completed: false, amount: 490000 },
      { id: 3, title: 'Страховые взносы', date: '2026-02-15', type: 'insurance', completed: false, amount: 255000 },
    ],
  };
}

function genGuideVenues() {
  const G: [string, string, string, string, string, number, number, number, string[], boolean][] = [
    ['guide-venue-1', 'Bar Decor', 'bar', 'ул. Мясницкая, 24/7', 'Москва', 55.7628, 37.6358, 4.7, ['Jazz', 'Soul'], true],
    ['guide-venue-2', 'Lounge 21', 'lounge', 'Невский пр., 21', 'Санкт-Петербург', 59.9356, 30.3232, 4.9, ['Lounge', 'Deep House'], true],
    ['guide-venue-3', 'Sky Rooftop', 'club', 'Пресненская наб., 12', 'Москва', 55.7489, 37.5355, 4.8, ['House', 'Techno'], true],
    ['guide-venue-4', 'Vinyl Cafe', 'cafe', 'ул. Покровка, 31', 'Москва', 55.7590, 37.6519, 4.5, ['Indie', 'Folk'], true],
    ['guide-venue-5', 'NEON Club', 'club', 'ул. Рубинштейна, 15', 'Санкт-Петербург', 59.9292, 30.3460, 4.6, ['Techno', 'Trance'], true],
    ['guide-venue-6', 'Whiskey Room', 'bar', 'ул. Баумана, 42', 'Казань', 55.7890, 49.1156, 4.4, ['Blues', 'Rock'], false],
    ['guide-venue-7', 'Garage Bar', 'bar', 'ул. Ленина, 88', 'Екатеринбург', 56.8389, 60.5975, 4.3, ['Rock', 'Alternative'], false],
    ['guide-venue-8', 'Sunset Terrace', 'lounge', 'ул. Тверская, 15', 'Москва', 55.7642, 37.6068, 4.8, ['Jazz', 'Lounge'], true],
  ];
  return G.map(([id, name, type, addr, city, lat, lng, rating, genres, isOpen]) => ({
    id, name, type, address: addr, city, lat, lng, rating, capacity: rnd(300, 40),
    genres, isOpen, verified: true, premium: isOpen,
    description: `${name} - ${type} в ${city}`,
  }));
}

function genRadioAnalytics(stations: any[]) {
  const months = ['Авг', 'Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев'];
  const result: Record<string, any> = {};
  stations.forEach(s => {
    const base = s.audienceSize;
    result[s.id] = {
      overview: {
        totalListeners: base, monthlyListeners: Math.round(base * 0.65),
        avgSessionDuration: 18 + rnd(25), peakListeners: Math.round(base * 0.08),
        totalPlays: Math.round(base * 12.5), uniqueTracks: 320 + rnd(500),
        avgRating: +(4.2 + Math.random() * 0.7).toFixed(1), engagementRate: +(12 + Math.random() * 18).toFixed(1),
      },
      listenersChart: months.map((m, i) => ({ month: m, listeners: Math.round(base * (0.6 + i * 0.06)), unique: Math.round(base * (0.3 + i * 0.04)) })),
      revenueChart: months.map((m, i) => ({ month: m, adRevenue: 15000 + i * 8000, subscriptions: 5000 + i * 3000 })),
      genreDistribution: [
        { genre: 'Pop', percentage: 28 }, { genre: 'Electronic', percentage: 22 },
        { genre: 'R&B', percentage: 15 }, { genre: 'Rock', percentage: 12 },
      ],
      generatedAt: now(),
    };
  });
  return result;
}

function genPublishOrders() {
  return [
    { id: 'pub_demo_1', userId: 'demo-artist', type: 'video', status: 'published', title: 'Midnight Dreams - Official Music Video', plan: 'standard', price: 990, publishedAt: '2026-01-20T18:00:00Z', createdAt: '2026-01-18T10:00:00Z' },
    { id: 'pub_demo_2', userId: 'demo-artist', type: 'concert', status: 'pending_payment', title: 'Весенний концерт в Москве', plan: 'premium', price: 4990, createdAt: '2026-02-08T09:00:00Z' },
    { id: 'pub_demo_3', userId: 'demo-artist', type: 'video', status: 'pending_review', title: 'Electric Soul - Lyric Video', plan: 'free', price: 0, createdAt: '2026-02-11T15:00:00Z' },
    { id: 'pub_demo_4', userId: 'demo-artist', type: 'concert', status: 'published', title: 'Акустический вечер', plan: 'standard', price: 1490, publishedAt: '2026-02-02T12:00:00Z', createdAt: '2026-01-30T11:00:00Z' },
  ];
}

function genVenuePlaylists() {
  return [
    { id: 'pl1', venueId: 'venue1', title: 'Вечерний джаз', trackCount: 45, totalDuration: 10800, isPublic: true, status: 'active', contentItems: [] },
    { id: 'pl2', venueId: 'venue1', title: 'Утренний чилл', trackCount: 32, totalDuration: 7680, isPublic: true, status: 'active', contentItems: [] },
    { id: 'pl3', venueId: 'venue1', title: 'Weekend Vibes', trackCount: 58, totalDuration: 13920, isPublic: false, status: 'draft', contentItems: [] },
  ];
}

function genRadioCatalog() {
  return [
    { id: 'station1', stationName: 'Hit FM', primaryGenre: 'Pop', city: 'Москва', listenersCount: 85000, rating: 4.8, verified: true,
      adPackages: [{ id: 'pkg1', type: 'slot_15sec', duration: 15, price: 15000, playsPerDay: 10, durationDays: 7 }] },
    { id: 'station2', stationName: 'Electronic Waves', primaryGenre: 'Electronic', city: 'Санкт-Петербург', listenersCount: 12000, rating: 4.6, verified: true,
      adPackages: [{ id: 'pkg3', type: 'slot_10sec', duration: 10, price: 5000, playsPerDay: 15, durationDays: 7 }] },
    { id: 'station3', stationName: 'Jazz Cafe Radio', primaryGenre: 'Jazz', city: 'Москва', listenersCount: 5000, rating: 4.9, verified: false,
      adPackages: [{ id: 'pkg4', type: 'slot_15sec', duration: 15, price: 8000, playsPerDay: 8, durationDays: 14 }] },
  ];
}

function genTrackTestData() {
  const t = Date.now();
  const req1 = {
    id: 'tt-seed-1', user_id: 'artist-sandra', track_title: 'Танцуй со мной', artist_name: 'Сандра', genre: 'Pop',
    status: 'completed', payment_status: 'completed', payment_amount: 1000, required_expert_count: 3, completed_reviews_count: 3,
    assigned_experts: ['dj-1', 'producer-maxam', 'engineer-1'], average_rating: 7.7,
    category_averages: { mixing_mastering: 8.0, arrangement: 7.3, originality: 7.0, commercial_potential: 8.3 },
    consolidated_feedback: 'Эксперты отметили высокое качество звучания и профессиональный баланс.',
    admin_approval_status: 'approved', created_at: new Date(t - 7 * D).toISOString(), completed_at: new Date(t - D).toISOString(),
  };
  const reviews1 = ['dj-1', 'producer-maxam', 'engineer-1'].map((expert, i) => ({
    id: `ttr-seed-1${String.fromCharCode(97 + i)}`, request_id: 'tt-seed-1', expert_email: expert,
    expert_name: ['DJ Demo', 'Максам', 'Звукоинженер'][i], expert_role: ['dj', 'producer', 'engineer'][i],
    status: 'completed', mixing_mastering_score: 8, arrangement_score: 7 + (i === 1 ? 1 : 0),
    originality_score: 7, commercial_potential_score: 8 + (i === 0 ? 1 : 0), overall_score: 8 - (i === 2 ? 1 : 0),
    general_feedback: 'Хороший трек с потенциалом.', recommendations: 'Добавить динамику в припев',
    audio_notes: [], reward_points: 50, reward_paid: true,
    created_at: new Date(t - 5 * D).toISOString(), completed_at: new Date(t - (4 - i) * D).toISOString(),
  }));
  const req2 = {
    id: 'tt-seed-2', user_id: 'artist-liana', track_title: 'Ночной бриз', artist_name: 'Лиана', genre: 'R&B',
    status: 'experts_assigned', payment_status: 'completed', payment_amount: 1000, required_expert_count: 5,
    completed_reviews_count: 0, assigned_experts: ['dj-1', 'producer-maxam'],
    created_at: new Date(t - 3 * D).toISOString(),
  };
  const reviews2 = ['dj-1', 'producer-maxam'].map((expert, i) => ({
    id: `ttr-seed-2${String.fromCharCode(97 + i)}`, request_id: 'tt-seed-2', expert_email: expert,
    expert_name: ['DJ Demo', 'Максам'][i], expert_role: ['dj', 'producer'][i],
    status: 'assigned', mixing_mastering_score: 0, arrangement_score: 0, originality_score: 0,
    commercial_potential_score: 0, overall_score: 0, general_feedback: '', recommendations: '',
    audio_notes: [], reward_points: 0, reward_paid: false, created_at: new Date(t - 12 * H).toISOString(),
  }));
  const req3 = {
    id: 'tt-seed-3', user_id: 'demo-artist', track_title: 'Городские огни', artist_name: 'Артист', genre: 'Electronic',
    status: 'pending_expert_assignment', payment_status: 'completed', payment_amount: 1000,
    required_expert_count: 5, completed_reviews_count: 0, assigned_experts: [],
    created_at: new Date(t - D).toISOString(),
  };
  const req4 = {
    id: 'tt-seed-4', user_id: 'demo-artist', track_title: 'Рассвет', artist_name: 'Артист', genre: 'Lo-Fi',
    status: 'pending_payment', payment_status: 'pending', payment_amount: 1000,
    required_expert_count: 5, completed_reviews_count: 0, assigned_experts: [],
    created_at: new Date(t - 2 * H).toISOString(),
  };
  return { requests: [req1, req2, req3, req4], reviews: [...reviews1, ...reviews2] };
}

// ══════════════════════════════════════════
// MAIN SEED FUNCTION
// ══════════════════════════════════════════

export async function seedDemoData(): Promise<{ seeded: boolean; message: string }> {
  try {
    let seedFlag: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try { seedFlag = await kv.get(SEED_FLAG_KEY); break; }
      catch (e: any) {
        const msg = String(e?.message || e);
        if (attempt < 2 && (msg.includes('connection') || msg.includes('sending request') || msg.includes('SendRequest') || msg.includes('client error'))) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1))); continue;
        }
        throw e;
      }
    }
    if (seedFlag) return { seeded: false, message: 'Demo data already seeded' };

    console.log('Seeding demo data...');
    const artists = A.map((a, i) => fullArtist(a, i));

    // 1. Artists
    const aKeys: string[] = [], aVals: any[] = [];
    for (const a of artists) {
      aKeys.push(`artist:${a.id}`, `artist_slug:${a.slug}`);
      aVals.push({ ...a, createdAt: now(), updatedAt: now() }, a.id);
    }
    await kv.mset(aKeys, aVals);

    // 2. Tracks
    const allTracks: any[] = [];
    const tKeys: string[] = [], tVals: any[] = [];
    for (const a of artists) {
      const tracks = genTracks(a);
      allTracks.push(...tracks);
      for (const t of tracks) { tKeys.push(`track:public:${t.id}`); tVals.push(t); }
    }
    await kv.mset(tKeys, tVals);

    // 3. Chart
    const chart = [...allTracks].sort((a, b) => b.plays - a.plays).slice(0, 20).map((t, i) => ({
      position: i + 1, previousPosition: Math.max(1, i + 1 + rnd(6, -3)),
      trackId: t.id, title: t.title, artist: t.artist, artistId: t.artistId, genre: t.genre,
      plays: t.plays, likes: t.likes, cover: t.cover, duration: t.duration, weeksOnChart: rnd(12, 1),
    }));
    await kv.set('chart:weekly:top20', { id: 'weekly-top20', title: 'Чарт ПРОМО.МУЗЫКА - TOP 20', period: 'weekly', updatedAt: now(), entries: chart });

    // 4. News
    const newsTmpl = ['выпустил новый сингл', 'объявил о туре', 'стал амбассадором ПРОМО.МУЗЫКА', 'выступит на фестивале', 'набрал 1M просмотров', 'запускает лейбл'];
    const nKeys: string[] = [], nVals: any[] = [];
    newsTmpl.forEach((tmpl, i) => {
      const a = artists[i % artists.length];
      const id = `news-${i + 1}`;
      nKeys.push(`news:public:${id}`);
      nVals.push({ id, title: `${a.name} ${tmpl}`, artistId: a.id, artistName: a.name, artistAvatar: a.avatar,
        coverImage: a.coverImage, excerpt: `Последние новости о ${a.name}.`, views: rnd(10000, 500),
        likes: rnd(2000, 50), publishedAt: ago(i * 2 * D), status: 'published' });
    });
    await kv.mset(nKeys, nVals);

    // 5. Concerts
    const venues = [['Adrenaline Stadium', 'Москва', 8000], ['А2 Green Concert', 'Санкт-Петербург', 4000], ['MOSAIQUE Club', 'Казань', 1500],
      ['Teleclub', 'Екатеринбург', 2500], ['Pravda Club', 'Новосибирск', 1200], ['Arena Hall', 'Краснодар', 3000]];
    const cKeys: string[] = [], cVals: any[] = [];
    venues.forEach(([vname, city, cap], i) => {
      const a = artists[i % artists.length]; const id = `concert-${i + 1}`;
      cKeys.push(`concert:public:${id}`);
      cVals.push({ id, title: `${a.name} Live`, artist: a.name, artistId: a.id, venue: vname, city, date: future((i + 1) * 7 * D).split('T')[0],
        time: '20:00', capacity: cap, ticketsSold: Math.floor((cap as number) * (0.3 + Math.random() * 0.5)),
        ticketPriceFrom: String(1500 + i * 500), ticketPriceTo: String(5000 + i * 1000), status: 'approved', views: rnd(5000, 200), coverImage: a.coverImage });
    });
    await kv.mset(cKeys, cVals);

    // 6. Popular artists + genre stats
    const popularArtists = [...artists].sort((a, b) => b.monthlyListeners - a.monthlyListeners)
      .map((a, i) => ({ position: i + 1, artistId: a.id, name: a.name, genre: a.genre, avatar: a.avatar, monthlyListeners: a.monthlyListeners, isVerified: a.isVerified }));
    await kv.set('artists:popular', popularArtists);
    const genreCounts: Record<string, number> = {};
    for (const a of artists) genreCounts[a.genre] = (genreCounts[a.genre] || 0) + 1;
    await kv.set('stats:genres', genreCounts);

    // 7. Beats
    const beats = genBeats();
    await kv.mset(beats.map(b => `beat:public:${b.id}`), beats);

    // 8. Producer services
    const services = genServices();
    await kv.mset(services.map(s => `producer_service:public:${s.id}`), services);

    // 9. Portfolio
    await kv.set('portfolio:public:all', genPortfolio());

    // 10. Producer profiles, reviews, orders, wallets
    const profiles = genProducerProfiles();
    await kv.mset(profiles.map(p => `producer_profile:${p.id}`), profiles);
    const reviews = genProducerReviews();
    await kv.mset(reviews.map(r => `producer_review:${r.producerId}:${r.id}`), reviews);
    const orders = genProducerOrders();
    await kv.mset(orders.map(o => `producer_order:${o.producerId}:${o.id}`), orders);
    const wallets = genProducerWallets();
    await kv.mset(wallets.map(w => `producer_wallet:${w.producerId}`), wallets);

    // 11. Platform stats
    await kv.set('stats:platform', { totalArtists: artists.length, totalTracks: allTracks.length, totalPlays: artists.reduce((s, a) => s + a.totalPlays, 0),
      totalSubscribers: artists.reduce((s, a) => s + a.subscribers, 0), totalBeats: beats.length, totalProducers: profiles.length,
      totalServices: services.length, updatedAt: now() });

    // 12. Marketplace orders
    const mOrders = genMarketplaceOrders();
    await kv.mset(mOrders.map(o => `service_order:${o.id}`), mOrders);
    await kv.set('service_orders_by_client:demo-user', mOrders.map(o => o.id));

    // 13. Digital goods
    const dGoods = genDigitalGoods();
    await kv.mset(dGoods.map(g => `digital_good:public:${g.id}`), dGoods);

    // 14. Demo contract
    await kv.set('contract:sord-demo-1', {
      id: 'ctr-demo-1', orderId: 'sord-demo-1', serviceTitle: 'Профессиональное сведение',
      producerId: 'artist-maxam', producerName: 'Максам', clientId: 'demo-user', clientName: 'Демо Пользователь',
      totalAmount: 8000, paidAmount: 3000, status: 'active',
      milestones: [
        { id: 'ms-1', index: 0, title: 'Черновой микс', amount: 3000, status: 'approved', dueDate: ago(2 * D) },
        { id: 'ms-2', index: 1, title: 'Обработка вокала', amount: 3000, status: 'submitted', dueDate: future(D) },
        { id: 'ms-3', index: 2, title: 'Финальный микс', amount: 2000, status: 'pending', dueDate: future(3 * D) },
      ],
      createdAt: ago(5 * D),
    });

    // 15. Guide venues
    const guideVenues = genGuideVenues();
    const gKeys = guideVenues.map(v => `guide:venue:${v.id}`);
    gKeys.push('guide:venue_ids');
    await kv.mset(gKeys, [...guideVenues, guideVenues.map(v => v.id)]);

    // 16. Venue profiles + analytics + campaigns
    const vProfiles = genVenueProfiles();
    await kv.mset(vProfiles.map(v => `venue_profile:${v.userId}`), vProfiles);
    const vAnalytics = genVenueAnalytics();
    const vaKeys: string[] = [], vaVals: any[] = [];
    for (const va of vAnalytics) {
      vaKeys.push(`venue_analytics:${va.venueId}`, `venue_campaigns:${va.venueId}`, `venue_spending:${va.venueId}`);
      vaVals.push(va, [], Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.now() - i * D).toLocaleDateString('ru-RU'), amount: rnd(3000, 500) })));
    }
    await kv.mset(vaKeys, vaVals);

    // 17. Radio stations + related data
    const radioStations = genRadioStations();
    await kv.mset(radioStations.map(s => `radio_station:${s.userId}`), radioStations);
    const rSlots = genRadioAdSlots(radioStations);
    const rArtReq = genRadioArtistRequests(radioStations);
    const rVenReq = genRadioVenueRequests(radioStations);
    const rFinance = genRadioFinance(radioStations);
    const rKeys: string[] = [], rVals: any[] = [];
    for (const rs of radioStations) {
      const slots = rSlots[rs.id] || [];
      for (const s of slots) { rKeys.push(`radio_ad_slot:${rs.id}:${s.id}`); rVals.push(s); }
      rKeys.push(`radio_ad_slots_index:${rs.id}`, `radio_artist_requests:${rs.id}`, `radio_venue_requests:${rs.id}`,
        `radio_finance:${rs.id}`, `radio_transactions:${rs.id}`, `radio_notifications:${rs.id}`);
      rVals.push(slots.map(s => s.id), rArtReq[rs.id] || [], rVenReq[rs.id] || [], rFinance[rs.id] || {}, [], []);
    }
    await kv.mset(rKeys, rVals);

    // 18. Bookings
    const bookings = genBookings();
    const bKeys: string[] = [], bVals: any[] = [];
    const bookingsByUser: Record<string, string[]> = {};
    for (const b of bookings) {
      bKeys.push(`booking:${b.id}`); bVals.push(b);
      (bookingsByUser[b.requesterId] ??= []).push(b.id);
      (bookingsByUser[b.performerId] ??= []).push(b.id);
    }
    for (const [uid, ids] of Object.entries(bookingsByUser)) { bKeys.push(`bookings_by_user:${uid}`); bVals.push(ids); }
    await kv.mset(bKeys, bVals);

    // 19. Accounting
    const acct = genAccountingData();
    await kv.mset(['accounting:reports', 'accounting:documents', 'accounting:ledger', 'accounting:counterparties', 'accounting:calendar'],
      [acct.reports, acct.documents, acct.ledger, acct.counterparties, acct.calendar]);

    // 20. Venue playlists + radio brand + catalog
    const playlists = genVenuePlaylists();
    const catalog = genRadioCatalog();
    const vmKeys: string[] = [], vmVals: any[] = [];
    for (const vp of vProfiles) {
      vmKeys.push(`venue_playlists:${vp.id}`, `venue_radio_brand:${vp.id}`, `venue_ad_campaigns:${vp.id}`);
      vmVals.push(playlists, { isEnabled: true, isPlaying: false, volume: 0.7 }, []);
    }
    vmKeys.push('venue_radio_catalog'); vmVals.push(catalog);
    await kv.mset(vmKeys, vmVals);

    // 21. Radio analytics
    const rAnalytics = genRadioAnalytics(radioStations);
    const raKeys: string[] = [], raVals: any[] = [];
    for (const rs of radioStations) { if (rAnalytics[rs.id]) { raKeys.push(`radio_analytics:${rs.id}`); raVals.push(rAnalytics[rs.id]); } }
    await kv.mset(raKeys, raVals);

    // 22. Publish orders
    const pubOrders = genPublishOrders();
    await kv.mset([...pubOrders.map(o => `publish_order:${o.id}`), 'publish_orders_by_user:demo-artist'],
      [...pubOrders, pubOrders.map(o => o.id)]);

    // 23. Collab offers
    const collabOffers = [
      { id: 'offer-demo-1', producerId: 'producer-maxam', producerName: 'Максам', artistId: 'artist-sandra', artistName: 'Сандра', type: 'beat', title: 'Trap Beat 140 BPM', price: 15000, status: 'pending', createdAt: ago(2 * H) },
      { id: 'offer-demo-2', producerId: 'producer-maxam', producerName: 'Максам', artistId: 'artist-liana', artistName: 'Лиана', type: 'mixing', title: 'Сведение R&B-альбома', price: 48000, status: 'accepted', createdAt: ago(48 * H) },
      { id: 'offer-demo-3', producerId: 'producer-maxam', producerName: 'Максам', artistId: 'artist-timur', artistName: 'Тимур', type: 'collab_track', title: 'Совместный трек для EP', status: 'discussion', createdAt: ago(72 * H) },
    ];
    await kv.mset([`collab_offers:artist-sandra`, `collab_offers:artist-liana`, `collab_offers:artist-timur`, `collab_offers_by:producer-maxam`],
      [[collabOffers[0]], [collabOffers[1]], [collabOffers[2]], collabOffers]);

    // 24. DM conversations
    const dmKeys: string[] = [], dmVals: any[] = [];
    const dmConvs = [
      { id: 'demo-artist::producer-maxam', p: [{ userId: 'demo-artist', userName: 'Артист', role: 'artist' }, { userId: 'producer-maxam', userName: 'Максам', role: 'producer' }], lastMessage: 'Давай обсудим бит подробнее', lastMessageAt: ago(2 * H) },
      { id: 'demo-artist::producer-dan', p: [{ userId: 'demo-artist', userName: 'Артист', role: 'artist' }, { userId: 'producer-dan', userName: 'Дэн', role: 'producer' }], lastMessage: 'Мастеринг готов, проверяй', lastMessageAt: ago(24 * H) },
      { id: 'admin-1::demo-artist', p: [{ userId: 'demo-artist', userName: 'Артист', role: 'artist' }, { userId: 'admin-1', userName: 'Поддержка ПРОМО.МУЗЫКА', role: 'admin' }], lastMessage: 'Рады помочь!', lastMessageAt: ago(120 * H) },
    ];
    dmKeys.push('dm:convlist:demo-artist'); dmVals.push(dmConvs.map(c => c.id));
    for (const c of dmConvs) { dmKeys.push(`dm:conv:${c.id}`); dmVals.push({ ...c, participants: c.p, source: 'direct', createdAt: ago(168 * H) }); }
    dmKeys.push('dm:messages:demo-artist::producer-maxam'); dmVals.push([
      { id: 'dm-m1', conversationId: 'demo-artist::producer-maxam', senderId: 'producer-maxam', senderName: 'Максам', text: 'Привет! Хочу предложить бит', createdAt: ago(6 * H) },
      { id: 'dm-m2', conversationId: 'demo-artist::producer-maxam', senderId: 'demo-artist', senderName: 'Артист', text: 'Интересно, скинь превью', createdAt: ago(5 * H) },
      { id: 'dm-m3', conversationId: 'demo-artist::producer-maxam', senderId: 'producer-maxam', senderName: 'Максам', text: 'Давай обсудим бит подробнее', createdAt: ago(2 * H) },
    ]);
    dmKeys.push('dm:unread:demo-artist'); dmVals.push({ 'demo-artist::producer-maxam': 1 });
    dmKeys.push('dm:convlist:producer-maxam', 'dm:convlist:producer-dan', 'dm:convlist:admin-1');
    dmVals.push(['demo-artist::producer-maxam'], ['demo-artist::producer-dan'], ['admin-1::demo-artist']);
    await kv.mset(dmKeys, dmVals);

    // 25. Track test data
    const ttData = genTrackTestData();
    const ttKeys: string[] = [], ttVals: any[] = [];
    for (const req of ttData.requests) { ttKeys.push(`track_test:requests:${req.id}`); ttVals.push(req); }
    for (const rev of ttData.reviews) { ttKeys.push(`track_test:reviews:${rev.id}`); ttVals.push(rev); }
    const ttIds = ttData.requests.map(r => r.id);
    ttKeys.push('track_test:all_requests'); ttVals.push(ttIds);
    ttKeys.push('track_test:request:tt-seed-1:reviews'); ttVals.push(ttData.reviews.filter(r => r.request_id === 'tt-seed-1').map(r => r.id));
    ttKeys.push('track_test:request:tt-seed-2:reviews'); ttVals.push(ttData.reviews.filter(r => r.request_id === 'tt-seed-2').map(r => r.id));
    ttKeys.push('track_test:user:artist-sandra:requests'); ttVals.push(['tt-seed-1']);
    ttKeys.push('track_test:user:artist-liana:requests'); ttVals.push(['tt-seed-2']);
    ttKeys.push('track_test:user:demo-artist:requests'); ttVals.push(['tt-seed-3', 'tt-seed-4']);
    ttKeys.push('track_test:registered_experts'); ttVals.push(['dj-1', 'producer-maxam', 'engineer-1']);
    for (const exp of ['dj-1', 'producer-maxam', 'engineer-1']) {
      ttKeys.push(`track_test:expert_stats:${exp}`);
      ttVals.push({ expert_id: exp, total_assigned: exp === 'engineer-1' ? 1 : 2, total_completed: 1, total_coins: 50, rating_bonus: 0.05 });
    }
    await kv.mset(ttKeys, ttVals);

    // 26. Subscriptions
    const subs = [
      ['subscription:demo-user-123', 'pro', 39990, 'month', 25, 2, 3],
      ['subscription:artist-sandra', 'start', 8990, 'month', 18, 1, 1],
      ['subscription:artist-dan', 'pro', 399900, 'year', 280, 1, 3],
      ['subscription:artist-maxam', 'elite', 1499900, 'year', 310, 7, 10],
      ['subscription:artist-timur', 'start', 89900, 'year', 200, 0, 1],
    ];
    const sKeys = subs.map(s => s[0] as string);
    const sVals = subs.map(([_, tier, price, interval, expDays, creditsRem, creditsPM]) => ({
      tier, tierName: tier === 'elite' ? 'Бизнес' : tier === 'pro' ? 'Про' : 'Старт',
      price, interval, status: 'active',
      expires_at: future((expDays as number) * D), credits_remaining: creditsRem, credits_per_month: creditsPM,
      created_at: ago(180 * D), updated_at: now(),
    }));
    await kv.mset(sKeys, sVals);

    // DJ subscription
    await kv.set('dj:subscription:dj-1', {
      djId: 'dj-1', planId: 'pro', planName: 'Pro', status: 'active', price: 1990, currency: 'RUB', interval: 'month',
      startDate: ago(15 * D), endDate: future(15 * D),
      limits: { mixes: -1, bookingsPerMonth: -1, dynamicPricing: true, promoAir: true, priority: true, referrals: true },
      updatedAt: now(),
    });

    // Mark as seeded
    await kv.set(SEED_FLAG_KEY, {
      version: 19, seededAt: now(), artistCount: artists.length, trackCount: allTracks.length,
      guideVenueCount: guideVenues.length, venueProfileCount: vProfiles.length,
      radioStationCount: radioStations.length, bookingCount: bookings.length,
    });

    console.log('Demo data seeding complete (v19)!');
    return { seeded: true, message: `Seeded ${artists.length} artists, ${allTracks.length} tracks, ${vProfiles.length} venues, ${radioStations.length} radio` };
  } catch (error) {
    console.error('Demo data seeding error:', error);
    return { seeded: false, message: `Seed error: ${error}` };
  }
}

export async function reseedDemoData(): Promise<{ seeded: boolean; message: string }> {
  await kv.del(SEED_FLAG_KEY);
  return seedDemoData();
}
