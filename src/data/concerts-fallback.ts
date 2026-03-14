/**
 * Fallback-данные для секции концертов на главной
 *
 * Используются только когда API не возвращает данные.
 *
 * Последнее обновление: 2026-03-14
 */

export interface FallbackConcert {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  coverImage?: string;
  ticketPriceFrom?: string;
  ticketPriceTo?: string;
  capacity?: number;
  ticketsSold?: number;
  source: string;
}

export const fallbackConcerts: FallbackConcert[] = [
  {
    id: 'mock-1', title: 'Весенний тур', artist: 'Полина Гагарина', date: '2026-03-22', time: '19:00',
    venue: 'Crocus City Hall', city: 'Москва',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    ticketPriceFrom: '2500', ticketPriceTo: '8000', capacity: 7500, ticketsSold: 5800,
    source: 'promo_artist',
  },
  {
    id: 'mock-2', title: 'Акустика', artist: 'Дима Билан', date: '2026-03-29', time: '20:00',
    venue: 'А2 Green Concert', city: 'Санкт-Петербург',
    coverImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    ticketPriceFrom: '2000', ticketPriceTo: '6000', capacity: 4000, ticketsSold: 3100,
    source: 'promo_artist',
  },
  {
    id: 'mock-3', title: 'Большой сольник', artist: 'Miyagi & Andy Panda', date: '2026-04-05', time: '21:00',
    venue: 'Adrenaline Stadium', city: 'Москва',
    coverImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    ticketPriceFrom: '3000', ticketPriceTo: '9000', capacity: 8000, ticketsSold: 6200,
    source: 'promo_artist',
  },
  {
    id: 'mock-4', title: 'Ночной сет', artist: 'Скриптонит', date: '2026-04-12', time: '22:00',
    venue: 'Teleclub', city: 'Екатеринбург',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    ticketPriceFrom: '2000', ticketPriceTo: '5500', capacity: 2500, ticketsSold: 2100,
    source: 'promo_artist',
  },
  {
    id: 'mock-5', title: 'Фестиваль Live', artist: 'Баста', date: '2026-04-26', time: '18:00',
    venue: 'Arena Hall', city: 'Краснодар',
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    ticketPriceFrom: '2500', ticketPriceTo: '7000', capacity: 5000, ticketsSold: 3400,
    source: 'promo_artist',
  },
  {
    id: 'mock-6', title: 'Электро-вечер', artist: 'Монеточка', date: '2026-05-10', time: '20:00',
    venue: 'Pravda Club', city: 'Новосибирск',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    ticketPriceFrom: '1500', ticketPriceTo: '4000', capacity: 1200, ticketsSold: 850,
    source: 'promo_artist',
  },
];
