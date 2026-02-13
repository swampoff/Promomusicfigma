/**
 * PUBLIC ARTIST PROFILE API
 * Загрузка полного профиля артиста для публичной страницы
 * In-memory кэш (60с TTL) + promise deduplication
 */

import { getCached, setCache, type CacheEntry } from './api-cache';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/artist-profile`;
const TIMEOUT_MS = 12_000;

export interface ArtistFullProfile {
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
  socials: {
    instagram: string;
    twitter: string;
    facebook: string;
    youtube: string;
    spotify: string;
    appleMusic: string;
  };
  careerStart: string;
  label: string;
  manager: string;
  bookingEmail: string;
  languages: string[];
  createdAt: string;
}

// ── Cache ───────────────────────────────────────────────

const cache = new Map<string, CacheEntry<ArtistFullProfile>>();
const inflight = new Map<string, Promise<ArtistFullProfile | null>>();

// ── Fetch ────────────────────────────────────────────────

async function fetchProfile(artistId: string): Promise<ArtistFullProfile | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE}/profile/${artistId}`, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[ArtistPublic] ${res.status} for ${artistId}`);
      return null;
    }

    const json = await res.json();
    if (json.success && json.data) {
      console.log(`[ArtistPublic] Loaded profile ${artistId}`);
      return json.data as ArtistFullProfile;
    }
    return null;
  } catch (err) {
    console.warn(`[ArtistPublic] Error loading ${artistId}:`, err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Public API ───────────────────────────────────────────

export async function getArtistProfile(artistId: string, force = false): Promise<ArtistFullProfile | null> {
  if (!force) {
    const cached = getCached(cache, artistId);
    if (cached) return cached;
  } else {
    cache.delete(artistId);
    inflight.delete(artistId);
  }

  if (!inflight.has(artistId)) {
    const p = fetchProfile(artistId).finally(() => inflight.delete(artistId));
    inflight.set(artistId, p);
  }

  const data = await inflight.get(artistId)!;
  if (data) setCache(cache, artistId, data);
  return data;
}

// ── Artist Tracks ────────────────────────────────────────

export interface ArtistTrack {
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

const tracksCache = new Map<string, CacheEntry<ArtistTrack[]>>();
const tracksInflight = new Map<string, Promise<ArtistTrack[]>>();

async function fetchTracks(artistId: string): Promise<ArtistTrack[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/profile/${artistId}/tracks`, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${publicAnonKey}`, Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      console.log(`[ArtistPublic] Loaded ${json.data.length} tracks for ${artistId}`);
      return json.data as ArtistTrack[];
    }
    return [];
  } catch (err) {
    console.warn(`[ArtistPublic] Tracks error for ${artistId}:`, err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function getArtistTracks(artistId: string, force = false): Promise<ArtistTrack[]> {
  const key = `tracks:${artistId}`;
  if (!force) {
    const cached = getCached(tracksCache, key);
    if (cached) return cached;
  } else {
    tracksCache.delete(key);
    tracksInflight.delete(key);
  }
  if (!tracksInflight.has(key)) {
    const p = fetchTracks(artistId).finally(() => tracksInflight.delete(key));
    tracksInflight.set(key, p);
  }
  const data = await tracksInflight.get(key)!;
  if (data.length > 0) setCache(tracksCache, key, data);
  return data;
}

// ── Similar Artists ──────────────────────────────────────

export interface SimilarArtist {
  id: string;
  name: string;
  genre: string;
  genres: string[];
  city: string;
  plays: number;
  followers: number;
  avatarUrl: string;
  isVerified: boolean;
  rating: number;
  matchScore: number;
}

const similarCache = new Map<string, CacheEntry<SimilarArtist[]>>();
const similarInflight = new Map<string, Promise<SimilarArtist[]>>();

async function fetchSimilar(artistId: string): Promise<SimilarArtist[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/profile/${artistId}/similar`, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${publicAnonKey}`, Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      console.log(`[ArtistPublic] Loaded ${json.data.length} similar for ${artistId}`);
      return json.data as SimilarArtist[];
    }
    return [];
  } catch (err) {
    console.warn(`[ArtistPublic] Similar error for ${artistId}:`, err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function getSimilarArtists(artistId: string, force = false): Promise<SimilarArtist[]> {
  const key = `similar:${artistId}`;
  if (!force) {
    const cached = getCached(similarCache, key);
    if (cached) return cached;
  } else {
    similarCache.delete(key);
    similarInflight.delete(key);
  }
  if (!similarInflight.has(key)) {
    const p = fetchSimilar(artistId).finally(() => similarInflight.delete(key));
    similarInflight.set(key, p);
  }
  const data = await similarInflight.get(key)!;
  if (data.length > 0) setCache(similarCache, key, data);
  return data;
}