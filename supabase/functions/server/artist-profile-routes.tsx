/**
 * ARTIST PROFILE ROUTES
 * Получение и обновление профиля артиста
 * Источники данных: таблица artists (SQL) + KV store (genres, rating, meta)
 */

import { Hono } from 'npm:hono@4';
import { getSupabaseClient } from './supabase-client.tsx';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ── Типы ──────────────────────────────────────────────────

interface ArtistSocials {
  instagram: string;
  twitter: string;
  facebook: string;
  youtube: string;
  spotify: string;
  appleMusic: string;
}

interface ArtistProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  location: string;
  city: string;
  country: string;
  website: string;
  phone: string;
  genres: string[];
  rating: number;
  totalPlays: number;
  totalFollowers: number;
  totalConcerts: number;
  totalTracks: number;
  coinsBalance: number;
  isVerified: boolean;
  socials: ArtistSocials;
  careerStart: string;
  label: string;
  manager: string;
  bookingEmail: string;
  languages: string[];
  createdAt: string;
}

// Допустимые поля для обновления через PUT
const ALLOWED_UPDATE_FIELDS = new Set([
  'fullName', 'bio', 'avatarUrl', 'location', 'city', 'country',
  'website', 'phone', 'genres', 'label', 'manager', 'bookingEmail',
  'careerStart', 'languages', 'username', 'email', 'socials',
]);

// ── Helpers ───────────────────────────────────────────────

/** KV ключ для профиля */
function kvKey(artistId: string): string {
  return `artist_profile:${artistId}`;
}

/** Безопасный парсинг KV-значения */
function parseKvProfile(raw: unknown): ArtistProfile | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed as ArtistProfile;
      return null;
    } catch {
      return null;
    }
  }
  if (typeof raw === 'object') return raw as ArtistProfile;
  return null;
}

/** Загрузить профиль из KV */
async function loadFromKv(artistId: string): Promise<ArtistProfile | null> {
  const raw = await kv.get(kvKey(artistId));
  return parseKvProfile(raw);
}

/** Сохранить профиль в KV */
async function saveToKv(artistId: string, profile: ArtistProfile): Promise<void> {
  await kv.set(kvKey(artistId), profile);
}

/** Фильтрация обновлений по белому списку полей */
function sanitizeUpdates(updates: Record<string, unknown>): Partial<ArtistProfile> {
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(updates)) {
    if (ALLOWED_UPDATE_FIELDS.has(key)) {
      clean[key] = updates[key];
    }
  }
  return clean as Partial<ArtistProfile>;
}

/** Мерж SQL-записи с демо-профилем */
function mergeSqlWithDemo(sqlArtist: Record<string, unknown>, demoProfile: ArtistProfile): ArtistProfile {
  return {
    ...demoProfile,
    fullName: (sqlArtist.full_name as string) || demoProfile.fullName,
    bio: (sqlArtist.bio as string) || demoProfile.bio,
    avatarUrl: (sqlArtist.avatar_url as string) || demoProfile.avatarUrl,
    location: (sqlArtist.location as string) || demoProfile.location,
    website: (sqlArtist.website as string) || demoProfile.website,
    phone: (sqlArtist.phone as string) || demoProfile.phone,
    totalPlays: (sqlArtist.total_plays as number) || demoProfile.totalPlays,
    totalFollowers: (sqlArtist.total_followers as number) || demoProfile.totalFollowers,
    totalConcerts: (sqlArtist.total_concerts as number) || demoProfile.totalConcerts,
    coinsBalance: (sqlArtist.coins_balance as number) || demoProfile.coinsBalance,
    isVerified: sqlArtist.is_verified != null ? Boolean(sqlArtist.is_verified) : demoProfile.isVerified,
    socials: {
      instagram: (sqlArtist.instagram as string) || demoProfile.socials.instagram,
      twitter: (sqlArtist.twitter as string) || demoProfile.socials.twitter,
      facebook: (sqlArtist.facebook as string) || demoProfile.socials.facebook,
      youtube: (sqlArtist.youtube as string) || demoProfile.socials.youtube,
      spotify: (sqlArtist.spotify as string) || demoProfile.socials.spotify,
      appleMusic: (sqlArtist.apple_music as string) || demoProfile.socials.appleMusic,
    },
    createdAt: (sqlArtist.created_at as string) || demoProfile.createdAt,
  };
}

// ── Демо-профили ──────────────────────────────────────────

const EMPTY_SOCIALS: ArtistSocials = {
  instagram: '', twitter: '', facebook: '',
  youtube: '', spotify: '', appleMusic: '',
};

function makeProfile(overrides: Partial<ArtistProfile> & { id: string; email: string; fullName: string }): ArtistProfile {
  return {
    username: '',
    bio: '',
    avatarUrl: '',
    location: '',
    city: '',
    country: 'Россия',
    website: '',
    phone: '',
    genres: [],
    rating: 0,
    totalPlays: 0,
    totalFollowers: 0,
    totalConcerts: 0,
    totalTracks: 0,
    coinsBalance: 0,
    isVerified: false,
    socials: { ...EMPTY_SOCIALS },
    careerStart: '',
    label: '',
    manager: '',
    bookingEmail: '',
    languages: ['Русский'],
    createdAt: '',
    ...overrides,
    socials: { ...EMPTY_SOCIALS, ...overrides.socials },
  };
}

const DEMO_ARTIST_PROFILES: Record<string, ArtistProfile> = {
  'artist-1': makeProfile({
    id: 'artist-1',
    email: 'ivanov@promo.fm',
    username: 'aleksandr_ivanov',
    fullName: 'Александр Иванов',
    avatarUrl: 'https://images.unsplash.com/photo-1649968399156-47b95b9472d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Поп и R&B артист из Москвы. Создаю музыку, которая заставляет чувствовать.',
    location: 'Москва, Россия',
    city: 'Москва',
    website: 'https://ivanov-music.ru',
    phone: '+7 (495) 111-22-33',
    genres: ['Pop', 'R&B'],
    rating: 4.8,
    totalPlays: 245000,
    totalFollowers: 12500,
    totalConcerts: 34,
    totalTracks: 34,
    coinsBalance: 1250,
    isVerified: true,
    socials: {
      instagram: '@aleksandr_ivanov', twitter: '@aivanov_music',
      facebook: 'AleksandrIvanovMusic', youtube: '@AleksandrIvanovOfficial',
      spotify: 'aleksandr-ivanov', appleMusic: 'aleksandr-ivanov',
    },
    careerStart: '2018',
    label: 'Independent Artist',
    bookingEmail: 'booking@ivanov-music.ru',
    languages: ['Русский', 'English'],
    createdAt: '2024-03-15T10:00:00Z',
  }),
  'artist-2': makeProfile({
    id: 'artist-2',
    email: 'star@promo.fm',
    username: 'maria_star',
    fullName: 'Мария Звёздная',
    avatarUrl: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Indie и Folk артистка из Санкт-Петербурга. Пишу песни о любви, природе и внутренних мирах.',
    location: 'Санкт-Петербург, Россия',
    city: 'Санкт-Петербург',
    website: 'https://mariastar.ru',
    phone: '+7 (812) 333-44-55',
    genres: ['Indie', 'Folk'],
    rating: 4.9,
    totalPlays: 189000,
    totalFollowers: 8700,
    totalConcerts: 21,
    totalTracks: 21,
    coinsBalance: 980,
    isVerified: true,
    socials: {
      instagram: '@maria_star_music', twitter: '@mstarmusic',
      facebook: 'MariaStarMusic', youtube: '@MariaStarOfficial',
      spotify: 'maria-star', appleMusic: 'maria-star',
    },
    careerStart: '2019',
    label: 'Star Records',
    manager: 'Иван Петров',
    bookingEmail: 'booking@mariastar.ru',
    languages: ['Русский', 'English', 'Français'],
    createdAt: '2024-05-20T14:00:00Z',
  }),
  'artist-3': makeProfile({
    id: 'artist-3',
    email: 'gromov@promo.fm',
    username: 'daniil_gromov',
    fullName: 'Даниил Громов',
    avatarUrl: 'https://images.unsplash.com/photo-1762160766901-b31387401420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Rock и Alternative из Казани. Гитара, мощный вокал и тексты о свободе.',
    location: 'Казань, Россия',
    city: 'Казань',
    website: 'https://gromovrock.ru',
    phone: '+7 (843) 555-66-77',
    genres: ['Rock', 'Alternative'],
    rating: 4.6,
    totalPlays: 156000,
    totalFollowers: 6200,
    totalConcerts: 58,
    totalTracks: 18,
    coinsBalance: 750,
    socials: {
      instagram: '@daniil_gromov', twitter: '@gromov_rock',
      facebook: 'DaniilGromovRock', youtube: '@GromovRock',
      spotify: 'daniil-gromov', appleMusic: 'daniil-gromov',
    },
    careerStart: '2016',
    label: 'Grom Records',
    manager: 'Алексей Козлов',
    bookingEmail: 'booking@gromovrock.ru',
    createdAt: '2024-01-10T08:00:00Z',
  }),
  'artist-4': makeProfile({
    id: 'artist-4',
    email: 'nova@promo.fm',
    username: 'alisa_nova',
    fullName: 'Алиса Нова',
    avatarUrl: 'https://images.unsplash.com/photo-1576190327176-9d5f672225c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Electronic и Synth-pop из Москвы. Синтезаторы, драм-машины и голос будущего.',
    location: 'Москва, Россия',
    city: 'Москва',
    website: 'https://alisanova.music',
    phone: '+7 (495) 888-99-00',
    genres: ['Electronic', 'Synth-pop'],
    rating: 5.0,
    totalPlays: 412000,
    totalFollowers: 28900,
    totalConcerts: 45,
    totalTracks: 45,
    coinsBalance: 3200,
    isVerified: true,
    socials: {
      instagram: '@alisa_nova_music', twitter: '@alisanova',
      facebook: 'AlisaNovaMusic', youtube: '@AlisaNovaOfficial',
      spotify: 'alisa-nova', appleMusic: 'alisa-nova',
    },
    careerStart: '2020',
    label: 'Nova Sounds',
    manager: 'Екатерина Смирнова',
    bookingEmail: 'booking@alisanova.music',
    languages: ['Русский', 'English', 'Deutsch'],
    createdAt: '2024-07-01T12:00:00Z',
  }),
  'artist-5': makeProfile({
    id: 'artist-5',
    email: 'volkov@promo.fm',
    username: 'nikita_volkov',
    fullName: 'Никита Волков',
    avatarUrl: 'https://images.unsplash.com/photo-1738999631988-4eb7205e91e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Hip-Hop и Trap из Екатеринбурга. Уральский бит, честные тексты.',
    location: 'Екатеринбург, Россия',
    city: 'Екатеринбург',
    website: 'https://volkov-music.ru',
    genres: ['Hip-Hop', 'Trap'],
    rating: 4.7,
    totalPlays: 320000,
    totalFollowers: 18500,
    totalConcerts: 62,
    totalTracks: 41,
    coinsBalance: 2100,
    isVerified: true,
    socials: { instagram: '@nikita_volkov', youtube: '@VolkovBeats' },
    careerStart: '2019',
    label: 'Wolf Pack Records',
    bookingEmail: 'booking@volkov-music.ru',
    createdAt: '2024-02-14T09:00:00Z',
  }),
  'artist-6': makeProfile({
    id: 'artist-6',
    email: 'luna@promo.fm',
    username: 'eva_luna',
    fullName: 'Ева Луна',
    avatarUrl: 'https://images.unsplash.com/photo-1763539817785-cc351352b3f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Dream Pop и Shoegaze из Новосибирска. Эфирные мелодии и космические текстуры.',
    location: 'Новосибирск, Россия',
    city: 'Новосибирск',
    genres: ['Dream Pop', 'Shoegaze'],
    rating: 4.5,
    totalPlays: 134000,
    totalFollowers: 5400,
    totalConcerts: 16,
    totalTracks: 14,
    coinsBalance: 620,
    isVerified: true,
    socials: { instagram: '@eva_luna_music', spotify: 'eva-luna' },
    careerStart: '2021',
    label: 'Lunar Sounds',
    createdAt: '2024-04-05T11:00:00Z',
  }),
  'artist-7': makeProfile({
    id: 'artist-7',
    email: 'tsar@promo.fm',
    username: 'maxim_tsar',
    fullName: 'Максим Царёв',
    avatarUrl: 'https://images.unsplash.com/photo-1752176293271-d39e5dbc6f1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Jazz и Neo-Soul из Ростова-на-Дону. Живые инструменты, импровизация, душа.',
    location: 'Ростов-на-Дону, Россия',
    city: 'Ростов-на-Дону',
    genres: ['Jazz', 'Neo-Soul'],
    rating: 4.9,
    totalPlays: 98000,
    totalFollowers: 4100,
    totalConcerts: 88,
    totalTracks: 27,
    coinsBalance: 540,
    socials: { instagram: '@maxim_tsar', youtube: '@TsarevJazz' },
    careerStart: '2015',
    label: 'Tsar Music',
    bookingEmail: 'booking@tsar-jazz.ru',
    createdAt: '2024-06-10T15:00:00Z',
  }),
  'artist-8': makeProfile({
    id: 'artist-8',
    email: 'kira@promo.fm',
    username: 'kira_flame',
    fullName: 'Кира Пламенева',
    avatarUrl: 'https://images.unsplash.com/photo-1761431246385-abb584084ce1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Techno и House из Москвы. Клубная электроника нового поколения.',
    location: 'Москва, Россия',
    city: 'Москва',
    genres: ['Techno', 'House'],
    rating: 4.4,
    totalPlays: 275000,
    totalFollowers: 15200,
    totalConcerts: 94,
    totalTracks: 38,
    coinsBalance: 1890,
    isVerified: true,
    socials: { instagram: '@kira_flame', youtube: '@KiraFlame' },
    careerStart: '2017',
    label: 'Flame Records',
    bookingEmail: 'booking@kiraflame.ru',
    createdAt: '2024-01-25T18:00:00Z',
  }),
  'artist-9': makeProfile({
    id: 'artist-9',
    email: 'nord@promo.fm',
    username: 'artem_nord',
    fullName: 'Артём Северный',
    avatarUrl: 'https://images.unsplash.com/photo-1546595524-63e5598501fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Ambient и Post-Rock из Мурманска. Звуки севера, бескрайние просторы.',
    location: 'Мурманск, Россия',
    city: 'Мурманск',
    genres: ['Ambient', 'Post-Rock'],
    rating: 4.3,
    totalPlays: 67000,
    totalFollowers: 3200,
    totalConcerts: 12,
    totalTracks: 22,
    coinsBalance: 380,
    socials: { instagram: '@artem_nord', spotify: 'artem-nord' },
    careerStart: '2020',
    createdAt: '2024-08-01T10:00:00Z',
  }),
  'artist-10': makeProfile({
    id: 'artist-10',
    email: 'diana@promo.fm',
    username: 'diana_storm',
    fullName: 'Диана Шторм',
    avatarUrl: 'https://images.unsplash.com/photo-1746136901368-76a1921bb392?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Pop-Rock и Punk из Краснодара. Энергия, драйв и бунтарский дух.',
    location: 'Краснодар, Россия',
    city: 'Краснодар',
    genres: ['Pop-Rock', 'Punk'],
    rating: 4.6,
    totalPlays: 198000,
    totalFollowers: 9800,
    totalConcerts: 73,
    totalTracks: 29,
    coinsBalance: 1100,
    isVerified: true,
    socials: { instagram: '@diana_storm', youtube: '@DianaStorm' },
    careerStart: '2018',
    label: 'Storm Records',
    bookingEmail: 'booking@dianastorm.ru',
    createdAt: '2024-03-20T14:00:00Z',
  }),
  'artist-11': makeProfile({
    id: 'artist-11',
    email: 'pixel@promo.fm',
    username: 'igor_pixel',
    fullName: 'Игорь Пиксель',
    avatarUrl: 'https://images.unsplash.com/photo-1722945220326-d1a1d0115f44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'Lo-Fi и Chillhop из Нижнего Новгорода. Битмейкер, продюсер, мечтатель.',
    location: 'Нижний Новгород, Россия',
    city: 'Н. Новгород',
    genres: ['Lo-Fi', 'Chillhop'],
    rating: 4.2,
    totalPlays: 142000,
    totalFollowers: 7300,
    totalConcerts: 8,
    totalTracks: 56,
    coinsBalance: 870,
    socials: { instagram: '@igor_pixel', spotify: 'igor-pixel' },
    careerStart: '2021',
    createdAt: '2024-05-15T16:00:00Z',
  }),
  'artist-12': makeProfile({
    id: 'artist-12',
    email: 'velvet@promo.fm',
    username: 'sofia_velvet',
    fullName: 'София Вельвет',
    avatarUrl: 'https://images.unsplash.com/photo-1712863132626-60bb701a6f4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    bio: 'R&B и Soul из Самары. Бархатный голос, глубокие тексты о любви и жизни.',
    location: 'Самара, Россия',
    city: 'Самара',
    genres: ['R&B', 'Soul'],
    rating: 4.8,
    totalPlays: 215000,
    totalFollowers: 11400,
    totalConcerts: 31,
    totalTracks: 25,
    coinsBalance: 1450,
    isVerified: true,
    socials: { instagram: '@sofia_velvet', youtube: '@SofiaVelvet' },
    careerStart: '2019',
    label: 'Velvet Records',
    bookingEmail: 'booking@sofiavelvet.ru',
    createdAt: '2024-04-28T13:00:00Z',
  }),
};

// ── Демо-треки для каждого артиста ────────────────────────

interface ArtistTrack {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  duration: string;
  plays: number;
  likes: number;
  genre: string;
  releaseDate: string;
  isExplicit: boolean;
}

/** Набор названий треков по жанрам */
const GENRE_TRACK_TITLES: Record<string, string[]> = {
  'Pop': ['Новый рассвет', 'Танцуй со мной', 'Без тебя', 'Огни большого города', 'Мечтай', 'Навсегда', 'Между нами', 'Весна придёт', 'Ты и я', 'Всё будет хорошо'],
  'R&B': ['Бархатная ночь', 'Дотронься', 'Тишина', 'Сладкий яд', 'В темноте', 'Осколки', 'Чувствую тебя', 'Шёпот', 'Пульс', 'Без слов'],
  'Rock': ['Стена огня', 'Мятеж', 'Электрический шторм', 'Дорога без конца', 'Рёв', 'Пламя внутри', 'Последний бой', 'Свобода', 'Гром', 'Против ветра'],
  'Alternative': ['Серый океан', 'Между строк', 'Разрыв', 'Инерция', 'Карусель', 'Тонкий лёд', 'Параллели', 'Антигравитация', 'Шум', 'Выдохни'],
  'Indie': ['Дождливый понедельник', 'Маленькие радости', 'Акварель', 'Уютный вечер', 'Старые фото', 'Облака', 'Велосипед', 'Книжная полка', 'Луч света', 'Простота'],
  'Folk': ['Берёзовая роща', 'Песня ветра', 'Река времени', 'Старый дом', 'Полевые цветы', 'Бабушкина колыбельная', 'Журавли', 'Тропинка', 'Костёр', 'Заря'],
  'Electronic': ['Цифровой сон', 'Neon Pulse', 'Синтез', 'Машина времени', 'Сигнал', 'Плазма', 'Binary Love', 'Глитч', 'Алгоритм', 'Частота'],
  'Synth-pop': ['Ретро-будущее', 'Неон навсегда', 'Танцпол 2099', 'Дискотека снов', 'Голограмма', 'VHS Memories', 'Волна', 'Sunset Drive', 'Chrome Heart', 'После полуночи'],
  'Hip-Hop': ['Улица зовёт', 'Бетонные джунгли', 'На вершине', 'Мой район', 'Флоу', 'Реальность', 'Гравитация', 'Без фильтров', 'Чёрное золото', 'Путь наверх'],
  'Trap': ['Басы качают', 'Ночной рейд', 'Капкан', 'Тёмный бит', 'Дым', 'Без тормозов', 'Хищник', 'Лабиринт', 'Магнит', 'Ультрабас'],
  'Dream Pop': ['Облачный замок', 'Полёт во сне', 'Невесомость', 'Эхо звёзд', 'Туманный берег', 'Лунная пыль', 'Зефир', 'Тихий космос', 'Стеклянный океан', 'Рассвет в тумане'],
  'Shoegaze': ['Стена звука', 'Размытые грани', 'Глубина', 'Пелена', 'Потерянный рай', 'Белый шум', 'Спираль', 'Медленный водоворот', 'Статика', 'Бесконечность'],
  'Jazz': ['Midnight Blues', 'Импровизация №5', 'Бархатный вечер', 'Свинг в парке', 'Дождь в Нью-Йорке', 'Саксофон и луна', 'Cool Breeze', 'Сладкий ритм', 'Нота души', 'Jam Session'],
  'Neo-Soul': ['Тёплый свет', 'Groove внутри', 'Душа поёт', 'Воскресный блюз', 'Мягкий бит', 'Гармония', 'Вдохновение', 'Медовый голос', 'Закат и ритм', 'Истина'],
  'Techno': ['Бункер 303', 'Индустриальный рассвет', 'Пульс клуба', 'Dark Matter', 'Стробоскоп', 'Механика', 'Железный ритм', 'Подземелье', 'Гипноз', 'Overload'],
  'House': ['Крыша мира', 'Танцуй до утра', 'Deep Inside', 'Солнце встаёт', 'Groove Nation', 'Feel The Beat', 'Горизонт', 'Тропический вайб', 'Клубная лихорадка', 'Euphoria'],
  'Ambient': ['Северное сияние', 'Тишина леса', 'Дыхание океана', 'Космическая пустота', 'Первый снег', 'Утренний туман', 'Звуки тундры', 'Бесконечная даль', 'Ледяные кристаллы', 'Покой'],
  'Post-Rock': ['Горизонт событий', 'Лавина', 'Тектонический сдвиг', 'Ожидание', 'Свет после тьмы', 'Эпицентр', 'Медленный взрыв', 'Тишина перед бурей', 'Прибой', 'Рассветная стена'],
  'Pop-Rock': ['Электрическое сердце', 'Битая карта', 'Прямой эфир', 'Высота', 'Асфальт и звёзды', 'Выше неба', 'Радио дождь', 'Драйв', 'Полный газ', 'Рок-н-ролл навсегда'],
  'Punk': ['Анархия весна', 'Бунт изнутри', 'Разбитые стёкла', 'Три аккорда', 'Подвал', 'Крик', 'Противостояние', 'Нет правил', 'Сырой звук', 'Мы против'],
  'Lo-Fi': ['Ленивое утро', 'Чашка кофе', 'Дождь за окном', 'Тёплый ламповый', 'Виниловый шум', 'Мягкий фокус', 'Ностальгия', 'Закат на крыше', 'Медленный день', 'Спокойствие'],
  'Chillhop': ['Весенний бриз', 'Городские огни', 'Вечерняя прогулка', 'Солнечный бит', 'Парк аттракционов', 'Мятный чай', 'Облачный день', 'Бумбокс', 'Хороший вайб', 'Оранжевый закат'],
  'Soul': ['Исповедь', 'Глубокое чувство', 'Огонь внутри', 'Сила любви', 'Невыразимое', 'Золотой час', 'Родная земля', 'Голос сердца', 'Истинная страсть', 'Благодарность'],
};

const FALLBACK_TITLES = ['Трек №1', 'Трек №2', 'Трек №3', 'Трек №4', 'Трек №5', 'Трек №6', 'Трек №7', 'Трек №8'];

function generateTracksForArtist(profile: ArtistProfile): ArtistTrack[] {
  const count = Math.min(profile.totalTracks || 6, 10);
  const mainGenre = (profile.genres && profile.genres[0]) || 'Pop';
  const secondaryGenre = profile.genres?.[1];
  const mainTitles = GENRE_TRACK_TITLES[mainGenre] || FALLBACK_TITLES;
  const secondaryTitles = secondaryGenre ? (GENRE_TRACK_TITLES[secondaryGenre] || []) : [];
  const seed = profile.id.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);

  return Array.from({ length: count }, (_, i) => {
    const s = (seed * (i + 1) * 7) % 100;
    // Alternate between main/secondary genre titles
    const useSecondary = secondaryTitles.length > 0 && i % 3 === 2;
    const titlePool = useSecondary ? secondaryTitles : mainTitles;
    const title = titlePool[i % titlePool.length];
    const genre = useSecondary ? (secondaryGenre || mainGenre) : mainGenre;
    const basePlays = profile.totalPlays || 100000;
    const plays = Math.floor(basePlays / count * (1 - i * 0.06));

    return {
      id: `${profile.id}-track-${i}`,
      title,
      artist: profile.fullName,
      artistId: profile.id,
      duration: `${2 + (s % 3)}:${String(10 + (s % 50)).padStart(2, '0')}`,
      plays,
      likes: Math.floor(plays * (0.03 + (s % 5) * 0.01)),
      genre,
      releaseDate: `${2024 - Math.floor(i / 3)}-${String(1 + (s % 12)).padStart(2, '0')}-${String(1 + (s % 28)).padStart(2, '0')}`,
      isExplicit: s % 7 === 0,
    };
  });
}

// ── Routes ────────────────────────────────────────────────

/**
 * GET /profile/:artistId
 * Трёхуровневый фоллбэк: KV → SQL+demo → demo
 */
app.get('/profile/:artistId', async (c) => {
  const artistId = c.req.param('artistId');
  console.log(`[ArtistProfile] GET ${artistId}`);

  try {
    // 1. KV cache
    const kvProfile = await loadFromKv(artistId);
    if (kvProfile) {
      // Patch: merge missing avatarUrl from demo if KV has stale data
      const demoProfile = DEMO_ARTIST_PROFILES[artistId];
      if (!kvProfile.avatarUrl && demoProfile?.avatarUrl) {
        kvProfile.avatarUrl = demoProfile.avatarUrl;
        saveToKv(artistId, kvProfile).catch(() => {}); // best-effort update
      }
      return c.json({ success: true, source: 'kv', data: kvProfile });
    }

    // 2. SQL + demo merge
    const demoProfile = DEMO_ARTIST_PROFILES[artistId];
    if (demoProfile) {
      try {
        const supabase = getSupabaseClient();
        const { data: sqlArtist, error } = await supabase
          .from('artists')
          .select('*')
          .eq('email', demoProfile.email)
          .maybeSingle();

        if (sqlArtist && !error) {
          const merged = mergeSqlWithDemo(sqlArtist, demoProfile);
          await saveToKv(artistId, merged);
          return c.json({ success: true, source: 'sql+demo', data: merged });
        }
      } catch (sqlErr) {
        console.log(`[ArtistProfile] SQL not available: ${sqlErr}`);
      }

      // 3. Pure demo fallback
      await saveToKv(artistId, demoProfile);
      return c.json({ success: true, source: 'demo', data: demoProfile });
    }

    return c.json({ success: false, error: `Artist not found: ${artistId}` }, 404);

  } catch (error) {
    console.error(`[ArtistProfile] GET error: ${error}`);
    const fallback = DEMO_ARTIST_PROFILES[artistId];
    if (fallback) {
      return c.json({ success: true, source: 'demo-fallback', data: fallback });
    }
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * PUT /profile/:artistId
 * Обновить профиль с валидацией полей
 */
app.put('/profile/:artistId', async (c) => {
  const artistId = c.req.param('artistId');
  console.log(`[ArtistProfile] PUT ${artistId}`);

  try {
    const rawUpdates = await c.req.json();
    const updates = sanitizeUpdates(rawUpdates);

    if (Object.keys(updates).length === 0) {
      return c.json({ success: false, error: 'No valid fields to update' }, 400);
    }

    // Получаем текущий профиль
    const currentProfile = (await loadFromKv(artistId)) || DEMO_ARTIST_PROFILES[artistId] || null;
    if (!currentProfile) {
      return c.json({ success: false, error: 'Profile not found' }, 404);
    }

    // Мержим с глубоким слиянием socials
    const updatedProfile: ArtistProfile = {
      ...currentProfile,
      ...updates,
      socials: {
        ...currentProfile.socials,
        ...(updates.socials || {}),
      },
    };

    // Сохраняем в KV
    await saveToKv(artistId, updatedProfile);

    // Best-effort SQL update
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('artists')
        .update({
          full_name: updatedProfile.fullName,
          bio: updatedProfile.bio,
          avatar_url: updatedProfile.avatarUrl,
          location: updatedProfile.location,
          website: updatedProfile.website,
          phone: updatedProfile.phone,
          instagram: updatedProfile.socials.instagram,
          twitter: updatedProfile.socials.twitter,
          facebook: updatedProfile.socials.facebook,
          youtube: updatedProfile.socials.youtube,
          spotify: updatedProfile.socials.spotify,
          apple_music: updatedProfile.socials.appleMusic,
          updated_at: new Date().toISOString(),
        })
        .eq('email', currentProfile.email);
    } catch {
      console.log('[ArtistProfile] SQL update skipped (table may not exist)');
    }

    console.log(`[ArtistProfile] Updated: ${artistId}`);
    return c.json({ success: true, data: updatedProfile });

  } catch (error) {
    console.error(`[ArtistProfile] PUT error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /profile/:artistId/stats
 * Лёгкий endpoint только для статистики
 */
app.get('/profile/:artistId/stats', async (c) => {
  const artistId = c.req.param('artistId');

  try {
    // 1. SQL
    const demoProfile = DEMO_ARTIST_PROFILES[artistId];
    if (demoProfile) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('artists')
          .select('total_plays, total_followers, total_concerts, coins_balance')
          .eq('email', demoProfile.email)
          .maybeSingle();

        if (data && !error) {
          return c.json({
            success: true,
            source: 'sql',
            data: {
              totalPlays: data.total_plays ?? 0,
              totalFollowers: data.total_followers ?? 0,
              totalConcerts: data.total_concerts ?? 0,
              coinsBalance: data.coins_balance ?? 0,
            },
          });
        }
      } catch {
        // SQL not available
      }
    }

    // 2. KV / demo fallback
    const profile = (await loadFromKv(artistId)) || demoProfile;
    if (profile) {
      return c.json({
        success: true,
        source: 'kv',
        data: {
          totalPlays: profile.totalPlays ?? 0,
          totalFollowers: profile.totalFollowers ?? 0,
          totalConcerts: profile.totalConcerts ?? 0,
          coinsBalance: profile.coinsBalance ?? 0,
        },
      });
    }

    return c.json({ success: false, error: 'Stats not found' }, 404);
  } catch (error) {
    console.error(`[ArtistProfile] Stats error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /popular
 * Публичный endpoint — возвращает популярных артистов для лендинга
 * Источники: KV (artist_profile:*) + демо-профили
 * Сортировка по totalPlays desc, лимит 12
 */
app.get('/popular', async (c) => {
  console.log('[ArtistProfile] GET /popular');

  try {
    // 1. Загрузить все профили из KV store
    // kv.getByPrefix возвращает массив значений (не {key, value})
    const kvValues = await kv.getByPrefix('artist_profile:');
    const kvProfiles: ArtistProfile[] = [];

    for (const rawValue of kvValues) {
      const parsed = parseKvProfile(rawValue);
      if (parsed && parsed.id && parsed.fullName) {
        kvProfiles.push(parsed);
      }
    }

    // 2. Мержим с демо-профилями (KV имеет приоритет)
    const profileMap = new Map<string, ArtistProfile>();

    // Сначала демо
    for (const [id, profile] of Object.entries(DEMO_ARTIST_PROFILES)) {
      profileMap.set(id, profile);
    }

    // KV перезаписывает демо (более актуальные данные)
    for (const profile of kvProfiles) {
      // Patch stale KV entries missing avatarUrl
      const demo = DEMO_ARTIST_PROFILES[profile.id];
      if (!profile.avatarUrl && demo?.avatarUrl) {
        profile.avatarUrl = demo.avatarUrl;
      }
      profileMap.set(profile.id, profile);
    }

    // 3. Формируем массив, сортируем по totalPlays desc
    const allProfiles = Array.from(profileMap.values())
      .sort((a, b) => (b.totalPlays || 0) - (a.totalPlays || 0))
      .slice(0, 12)
      .map(p => ({
        id: p.id,
        name: p.fullName,
        genre: (p.genres && p.genres[0]) || 'Music',
        genres: p.genres || [],
        city: p.city || '',
        listeners: p.totalFollowers || 0,
        plays: p.totalPlays || 0,
        tracks: p.totalTracks || 0,
        rating: p.rating || 0,
        avatarUrl: p.avatarUrl || '',
        isVerified: p.isVerified || false,
      }));

    console.log(`[ArtistProfile] Popular: ${allProfiles.length} artists`);
    return c.json({ success: true, data: allProfiles });

  } catch (error) {
    console.error(`[ArtistProfile] Popular error: ${error}`);

    // Фоллбэк: вернуть демо-профили
    const fallback = Object.values(DEMO_ARTIST_PROFILES)
      .sort((a, b) => (b.totalPlays || 0) - (a.totalPlays || 0))
      .slice(0, 12)
      .map(p => ({
        id: p.id,
        name: p.fullName,
        genre: (p.genres && p.genres[0]) || 'Music',
        genres: p.genres || [],
        city: p.city || '',
        listeners: p.totalFollowers || 0,
        plays: p.totalPlays || 0,
        tracks: p.totalTracks || 0,
        rating: p.rating || 0,
        avatarUrl: p.avatarUrl || '',
        isVerified: p.isVerified || false,
      }));

    return c.json({ success: true, source: 'demo-fallback', data: fallback });
  }
});

/**
 * GET /profile/:artistId/tracks
 * Возвращает треки артиста (демо, жанрово-тематические)
 */
app.get('/profile/:artistId/tracks', async (c) => {
  const artistId = c.req.param('artistId');
  console.log(`[ArtistProfile] GET /profile/${artistId}/tracks`);

  try {
    const profile = (await loadFromKv(artistId)) || DEMO_ARTIST_PROFILES[artistId];
    if (!profile) {
      return c.json({ success: false, error: `Artist not found: ${artistId}` }, 404);
    }

    const tracks = generateTracksForArtist(profile);
    return c.json({ success: true, data: tracks });
  } catch (error) {
    console.error(`[ArtistProfile] Tracks error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /profile/:artistId/similar
 * Возвращает похожих артистов по жанрам
 * Score = кол-во совпадающих жанров × log(totalPlays)
 */
app.get('/profile/:artistId/similar', async (c) => {
  const artistId = c.req.param('artistId');
  console.log(`[ArtistProfile] GET /profile/${artistId}/similar`);

  try {
    const profile = (await loadFromKv(artistId)) || DEMO_ARTIST_PROFILES[artistId];
    if (!profile) {
      return c.json({ success: false, error: `Artist not found: ${artistId}` }, 404);
    }

    const myGenres = new Set((profile.genres || []).map((g: string) => g.toLowerCase()));

    // Collect all other artists
    const allProfiles = new Map<string, ArtistProfile>();
    for (const [id, p] of Object.entries(DEMO_ARTIST_PROFILES)) {
      if (id !== artistId) allProfiles.set(id, p);
    }

    // Try KV profiles too
    try {
      const kvValues = await kv.getByPrefix('artist_profile:');
      for (const rawValue of kvValues) {
        const parsed = parseKvProfile(rawValue);
        if (parsed && parsed.id && parsed.id !== artistId) {
          allProfiles.set(parsed.id, parsed);
        }
      }
    } catch {
      // KV not available, continue with demo
    }

    // Score each artist by genre overlap
    const scored = Array.from(allProfiles.values())
      .map(p => {
        const theirGenres = (p.genres || []).map((g: string) => g.toLowerCase());
        const overlap = theirGenres.filter((g: string) => myGenres.has(g)).length;
        // Also consider genre "proximity" — genres in same family
        const genreFamilies: Record<string, string[]> = {
          'electronic': ['electronic', 'synth-pop', 'techno', 'house', 'ambient', 'dream pop'],
          'rock': ['rock', 'alternative', 'post-rock', 'pop-rock', 'punk', 'shoegaze'],
          'urban': ['hip-hop', 'trap', 'r&b', 'soul', 'neo-soul'],
          'acoustic': ['folk', 'indie', 'jazz'],
          'chill': ['lo-fi', 'chillhop', 'ambient', 'dream pop'],
        };
        let familyScore = 0;
        for (const family of Object.values(genreFamilies)) {
          const myInFamily = [...myGenres].some(g => family.includes(g));
          const theirInFamily = theirGenres.some((g: string) => family.includes(g));
          if (myInFamily && theirInFamily) familyScore += 0.5;
        }

        const totalScore = overlap * 2 + familyScore + Math.log10(Math.max(p.totalPlays || 1, 1)) * 0.1;
        return { profile: p, score: totalScore, overlap };
      })
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const similar = scored.map(s => ({
      id: s.profile.id,
      name: s.profile.fullName,
      genre: (s.profile.genres && s.profile.genres[0]) || 'Music',
      genres: s.profile.genres || [],
      city: s.profile.city || '',
      plays: s.profile.totalPlays || 0,
      followers: s.profile.totalFollowers || 0,
      avatarUrl: s.profile.avatarUrl || '',
      isVerified: s.profile.isVerified || false,
      rating: s.profile.rating || 0,
      matchScore: Math.round(s.score * 10) / 10,
    }));

    console.log(`[ArtistProfile] Similar for ${artistId}: ${similar.length} results`);
    return c.json({ success: true, data: similar });
  } catch (error) {
    console.error(`[ArtistProfile] Similar error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default app;