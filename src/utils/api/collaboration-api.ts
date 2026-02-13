/**
 * COLLABORATION API - Producer-Artist collaboration client
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/collaboration`;

const headers = () => ({
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
});

export interface CollabOffer {
  id: string;
  producerId: string;
  producerName: string;
  producerAvatar?: string;
  artistId: string;
  artistName: string;
  type: 'beat' | 'mixing' | 'mastering' | 'arrangement' | 'ghost_production' | 'collab_track';
  title: string;
  description: string;
  price?: number;
  currency: string;
  audioPreviewUrl?: string;
  bpm?: number;
  key?: string;
  genre?: string;
  tags?: string[];
  status: 'pending' | 'accepted' | 'declined' | 'discussion' | 'completed' | 'cancelled';
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
  artistComment?: string;
}

export interface CollabMessage {
  id: string;
  offerId: string;
  senderId: string;
  senderName: string;
  senderRole: 'producer' | 'artist';
  text: string;
  attachment?: { type: string; name: string; url?: string };
  createdAt: string;
}

export interface CollabStats {
  totalReceived: number;
  totalSent: number;
  pending: number;
  accepted: number;
  declined: number;
  inDiscussion: number;
  completed: number;
}

async function apiCall<T>(method: string, path: string, body?: any): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const opts: RequestInit = { method, headers: headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `HTTP ${res.status}` };
    }
    return { success: true, data: json };
  } catch (err) {
    console.error(`Collaboration API error [${path}]:`, err);
    return { success: false, error: String(err) };
  }
}

// Offers
export const createOffer = (data: {
  producerId: string; producerName: string; producerAvatar?: string;
  artistId: string; artistName: string;
  type: string; title: string; description?: string;
  price?: number; bpm?: number; key?: string; genre?: string; tags?: string[];
  audioPreviewUrl?: string; deadline?: string;
}) => apiCall<{ offer: CollabOffer }>('POST', '/offers', data);

export const fetchArtistOffers = async (artistId: string): Promise<CollabOffer[]> => {
  const res = await apiCall<any>('GET', `/offers/artist/${artistId}`);
  return (res.data as any)?.offers || [];
};

export const fetchProducerOffers = async (producerId: string): Promise<CollabOffer[]> => {
  const res = await apiCall<any>('GET', `/offers/producer/${producerId}`);
  return (res.data as any)?.offers || [];
};

export const respondToOffer = (offerId: string, data: {
  artistId: string; status: 'accepted' | 'declined' | 'discussion'; comment?: string;
}) => apiCall<{ offer: CollabOffer }>('PUT', `/offers/${offerId}/respond`, data);

// Chat
export const fetchCollabChat = async (offerId: string): Promise<CollabMessage[]> => {
  const res = await apiCall<any>('GET', `/chat/${offerId}`);
  return (res.data as any)?.messages || [];
};

export const sendCollabMessage = (offerId: string, data: {
  senderId: string; senderName: string; senderRole: 'producer' | 'artist';
  text: string; attachment?: { type: string; name: string };
}) => apiCall<{ message: CollabMessage }>('POST', `/chat/${offerId}`, data);

// Stats
export const fetchCollabStats = async (userId: string): Promise<CollabStats | null> => {
  const res = await apiCall<any>('GET', `/stats/${userId}`);
  return (res.data as any)?.stats || null;
};