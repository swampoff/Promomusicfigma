import config from '@/config/environment';
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

/**
 * Get all promoted concerts (public endpoint, no auth required)
 * Returns list of concerts that are currently promoted and approved
 */
export async function getPromotedConcerts(): Promise<PromotedConcert[]> {
  try {
    // Wait for server readiness before first fetch
    await waitForServer();
    
    const response = await fetch(
      `${config.functionsUrl}/api/concerts/promoted`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.warn(`API returned status ${response.status}`);
      return [];
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      console.log('No promoted concerts found');
      return [];
    }
    
    console.log(`Loaded ${result.data.length} promoted concerts from API`);
    return result.data;
    
  } catch (error) {
    console.error('Error fetching promoted concerts:', error);
    return [];
  }
}

/**
 * Get user's own concerts (requires authentication)
 */
export async function getUserConcerts(accessToken: string) {
  try {
    const response = await fetch(
      `${config.functionsUrl}/api/concerts/tour-dates`,
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
      `${config.functionsUrl}/api/concerts/tour-dates`,
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
      `${config.functionsUrl}/api/concerts/tour-dates/${concertId}/promote`,
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
