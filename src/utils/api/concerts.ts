/**
 * CONCERTS API - Frontend integration with backend
 * Handles all concert-related API calls
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { waitForServer } from './server-warmup';

export interface PromotedConcert {
  id: number;
  title: string;
  date: string;           // ISO date format: '2026-07-15'
  time: string;           // Time format: '18:00'
  city: string;
  venue: string;
  type: string;           // 'Фестиваль', 'Акустический сет', 'DJ сет'
  description: string;
  banner: string;         // Image URL
  ticketPriceFrom: string;
  ticketPriceTo: string;
  ticketLink: string;
  views: number;
  clicks: number;
}

// Demo data fallback (используется если API недоступен)
const DEMO_CONCERTS: PromotedConcert[] = [
  {
    id: 1,
    title: 'Summer Music Fest 2026',
    date: '2026-07-15',
    time: '18:00',
    city: 'Москва',
    venue: 'Olympic Stadium',
    type: 'Фестиваль',
    description: 'Грандиозный летний фестиваль с участием топовых артистов',
    banner: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    ticketPriceFrom: '2000',
    ticketPriceTo: '8000',
    ticketLink: 'https://promo.music/tickets/summer-fest',
    views: 15400,
    clicks: 850,
  },
  {
    id: 2,
    title: 'Акустический вечер',
    date: '2026-07-22',
    time: '20:00',
    city: 'Санкт-Петербург',
    venue: 'A2 Green Concert',
    type: 'Акустический сет',
    description: 'Интимная атмосфера живой акустики',
    banner: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    ticketPriceFrom: '1500',
    ticketPriceTo: '5000',
    ticketLink: 'https://promo.music/tickets/acoustic',
    views: 8200,
    clicks: 420,
  },
  {
    id: 3,
    title: 'Electronic Paradise',
    date: '2026-08-05',
    time: '22:00',
    city: 'Москва',
    venue: 'Adrenaline Stadium',
    type: 'DJ сет',
    description: 'Лучшие электронные битыозвученные на мощной системе',
    banner: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    ticketPriceFrom: '3000',
    ticketPriceTo: '12000',
    ticketLink: 'https://promo.music/tickets/electronic',
    views: 12300,
    clicks: 670,
  },
];

/**
 * Get all promoted concerts (public endpoint, no auth required)
 * Returns list of concerts that are currently promoted and approved
 */
export async function getPromotedConcerts(): Promise<PromotedConcert[]> {
  try {
    // Wait for server readiness before first fetch
    await waitForServer();
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/server/api/concerts/promoted`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.warn(`API returned status ${response.status}, using demo data`);
      return DEMO_CONCERTS;
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      console.log('No promoted concerts found, using demo data');
      return DEMO_CONCERTS;
    }
    
    console.log(`Loaded ${result.data.length} promoted concerts from API`);
    return result.data;
    
  } catch (error) {
    console.error('Error fetching promoted concerts:', error);
    console.log('Falling back to demo data');
    return DEMO_CONCERTS;
  }
}

/**
 * Get user's own concerts (requires authentication)
 */
export async function getUserConcerts(accessToken: string) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/server/api/concerts/tour-dates`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user concerts: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data || [];
    
  } catch (error) {
    console.error('Error fetching user concerts:', error);
    throw error;
  }
}

/**
 * Create new concert (requires authentication)
 */
export async function createConcert(accessToken: string, concertData: any) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/server/api/concerts/tour-dates`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(concertData),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to create concert: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
    
  } catch (error) {
    console.error('Error creating concert:', error);
    throw error;
  }
}

/**
 * Promote concert (requires authentication and coins payment)
 */
export async function promoteConcert(
  accessToken: string, 
  concertId: number, 
  days: number = 7
) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/server/api/concerts/tour-dates/${concertId}/promote`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to promote concert: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
    
  } catch (error) {
    console.error('Error promoting concert:', error);
    throw error;
  }
}