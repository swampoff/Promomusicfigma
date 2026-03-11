/**
 * Fallback-данные для секции концертов на главной
 *
 * Используются только когда API не возвращает данные.
 *
 * Последнее обновление: 2026-03-10
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
    id: 'mock-1', title: 'Сандра Live', artist: 'Сандра', date: '2026-03-15', time: '20:00',
    venue: 'Adrenaline Stadium', city: 'Москва',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    ticketPriceFrom: '2000', ticketPriceTo: '6000', capacity: 8000, ticketsSold: 5200,
    source: 'promo_artist',
  },
  {
    id: 'mock-2', title: 'Лиана Live', artist: 'Лиана', date: '2026-03-22', time: '20:00',
    venue: 'А2 Green Concert', city: 'Санкт-Петербург',
    coverImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    ticketPriceFrom: '1500', ticketPriceTo: '4500', capacity: 4000, ticketsSold: 2800,
    source: 'promo_artist',
  },
  {
    id: 'mock-3', title: 'Дэн Live', artist: 'Дэн', date: '2026-04-05', time: '22:00',
    venue: 'MOSAIQUE Club', city: 'Казань',
    coverImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    ticketPriceFrom: '2500', ticketPriceTo: '7000', capacity: 1500, ticketsSold: 1100,
    source: 'promo_artist',
  },
  {
    id: 'mock-4', title: 'Максам Live', artist: 'Максам', date: '2026-04-12', time: '20:00',
    venue: 'Teleclub', city: 'Екатеринбург',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    ticketPriceFrom: '1500', ticketPriceTo: '5000', capacity: 2500, ticketsSold: 1600,
    source: 'promo_artist',
  },
  {
    id: 'mock-5', title: 'Стелла Live', artist: 'Стелла', date: '2026-04-20', time: '21:00',
    venue: 'Arena Hall', city: 'Краснодар',
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    ticketPriceFrom: '2000', ticketPriceTo: '5500', capacity: 3000, ticketsSold: 1900,
    source: 'promo_artist',
  },
  {
    id: 'mock-6', title: 'Тимур Live', artist: 'Тимур', date: '2026-05-01', time: '20:00',
    venue: 'Pravda Club', city: 'Новосибирск',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    ticketPriceFrom: '1800', ticketPriceTo: '4500', capacity: 1200, ticketsSold: 950,
    source: 'promo_artist',
  },
];
