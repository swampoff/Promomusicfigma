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

export const fallbackConcerts: FallbackConcert[] = [];
