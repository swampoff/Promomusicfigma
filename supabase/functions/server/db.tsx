/**
 * DB.TSX — Data Access Layer
 * Прямые SQL-запросы через Supabase вместо KV store.
 * Каждая функция возвращает типизированные данные.
 */

import { getSupabaseClient } from './supabase-client.tsx';

const db = () => getSupabaseClient();

// ─── Helpers ───

function throwIfError(result: { error: any; data: any }, context: string) {
  if (result.error) {
    console.error(`[db] ${context}:`, result.error);
    throw new Error(result.error.message || `DB error in ${context}`);
  }
  return result.data;
}

// ─── Profiles ───

export async function getProfile(userId: string) {
  const { data, error } = await db()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) console.error('[db] getProfile:', error);
  return data;
}

export async function upsertProfile(userId: string, profile: Record<string, any>) {
  const row = { id: userId, ...profile, updated_at: new Date().toISOString() };
  const { data, error } = await db()
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) console.error('[db] upsertProfile:', error);
  return data;
}

// ─── Tracks ───

export async function getTracksByUser(userId: string) {
  const { data, error } = await db()
    .from('tracks_kv')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getTracksByUser:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function getTrack(userId: string, trackId: string) {
  const { data, error } = await db()
    .from('tracks_kv')
    .select('*')
    .eq('id', `${userId}:${trackId}`)
    .maybeSingle();
  if (error) console.error('[db] getTrack:', error);
  return data ? (data.data || data) : null;
}

export async function upsertTrack(userId: string, trackId: string, track: Record<string, any>) {
  const row = {
    id: `${userId}:${trackId}`,
    user_id: userId,
    data: track,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await db()
    .from('tracks_kv')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) console.error('[db] upsertTrack:', error);
  return data?.data || data;
}

export async function deleteTrack(userId: string, trackId: string) {
  const { error } = await db()
    .from('tracks_kv')
    .delete()
    .eq('id', `${userId}:${trackId}`);
  if (error) console.error('[db] deleteTrack:', error);
}

// ─── Videos ───

export async function getVideosByUser(userId: string) {
  const { data, error } = await db()
    .from('videos_kv')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getVideosByUser:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function upsertVideo(userId: string, videoId: string, video: Record<string, any>) {
  const row = {
    id: `${userId}:${videoId}`,
    user_id: userId,
    data: video,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('videos_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertVideo:', error);
}

// ─── News ───

export async function getNewsByUser(userId: string) {
  const { data, error } = await db()
    .from('news_kv')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getNewsByUser:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function upsertNews(userId: string, newsId: string, news: Record<string, any>) {
  const row = {
    id: `${userId}:${newsId}`,
    user_id: userId,
    data: news,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('news_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertNews:', error);
}

// ─── Concerts ───

export async function getConcertsByUser(userId: string) {
  const { data, error } = await db()
    .from('concerts_kv')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getConcertsByUser:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function getAllConcerts() {
  const { data, error } = await db()
    .from('concerts_kv')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getAllConcerts:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function getConcert(concertId: string) {
  // concerts_kv stores id as "userId:concertId"
  const { data, error } = await db()
    .from('concerts_kv')
    .select('*')
    .like('id', `%:${concertId}`)
    .maybeSingle();
  if (error) console.error('[db] getConcert:', error);
  return data ? (data.data || data) : null;
}

export async function upsertConcert(userId: string, concertId: string, concert: Record<string, any>) {
  const row = {
    id: `${userId}:${concertId}`,
    user_id: userId,
    data: concert,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('concerts_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertConcert:', error);
}

export async function deleteConcert(userId: string, concertId: string) {
  const { error } = await db()
    .from('concerts_kv')
    .delete()
    .eq('id', `${userId}:${concertId}`);
  if (error) console.error('[db] deleteConcert:', error);
}

// ─── Donations ───

export async function getDonationsByArtist(artistId: string) {
  const { data, error } = await db()
    .from('donations_kv')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getDonationsByArtist:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function createDonation(artistId: string, donationId: string, donation: Record<string, any>) {
  const row = {
    id: `${artistId}:${donationId}`,
    artist_id: artistId,
    data: donation,
  };
  const { error } = await db()
    .from('donations_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] createDonation:', error);
}

// ─── Coins ───

export async function getCoinBalance(userId: string) {
  const { data, error } = await db()
    .from('coin_balances')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) console.error('[db] getCoinBalance:', error);
  return data ? { balance: data.balance, userId } : null;
}

export async function setCoinBalance(userId: string, balance: number) {
  const { error } = await db()
    .from('coin_balances')
    .upsert({ user_id: userId, balance, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) console.error('[db] setCoinBalance:', error);
}

export async function getCoinTransactions(userId: string) {
  const { data, error } = await db()
    .from('coin_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getCoinTransactions:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function createCoinTransaction(userId: string, txId: string, tx: Record<string, any>) {
  const row = {
    id: txId,
    user_id: userId,
    data: tx,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('coin_transactions')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] createCoinTransaction:', error);
}

// ─── Payment Sessions ───

export async function getPaymentSession(orderId: string) {
  const { data, error } = await db()
    .from('payment_sessions')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();
  if (error) console.error('[db] getPaymentSession:', error);
  return data ? (data.data || data) : null;
}

export async function upsertPaymentSession(orderId: string, session: Record<string, any>) {
  const row = {
    order_id: orderId,
    data: session,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('payment_sessions')
    .upsert(row, { onConflict: 'order_id' });
  if (error) console.error('[db] upsertPaymentSession:', error);
}

// ─── Subscriptions ───

export async function getSubscription(userId: string) {
  const { data, error } = await db()
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) console.error('[db] getSubscription:', error);
  return data ? (data.data || data) : null;
}

export async function upsertSubscription(userId: string, sub: Record<string, any>) {
  const row = {
    user_id: userId,
    data: sub,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('subscriptions')
    .upsert(row, { onConflict: 'user_id' });
  if (error) console.error('[db] upsertSubscription:', error);
}

// ─── Notifications ───

export async function getNotificationsByUser(userId: string) {
  const { data, error } = await db()
    .from('notifications_kv')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getNotificationsByUser:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function getNotification(userId: string, notifId: string) {
  const { data, error } = await db()
    .from('notifications_kv')
    .select('*')
    .eq('id', `${userId}:${notifId}`)
    .maybeSingle();
  if (error) console.error('[db] getNotification:', error);
  return data ? (data.data || data) : null;
}

export async function upsertNotification(userId: string, notifId: string, notif: Record<string, any>) {
  const row = {
    id: `${userId}:${notifId}`,
    user_id: userId,
    data: notif,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('notifications_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertNotification:', error);
}

export async function deleteNotification(userId: string, notifId: string) {
  const { error } = await db()
    .from('notifications_kv')
    .delete()
    .eq('id', `${userId}:${notifId}`);
  if (error) console.error('[db] deleteNotification:', error);
}

// ─── Notification Settings ───

export async function getNotificationSettings(userId: string) {
  const { data, error } = await db()
    .from('notification_settings')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) console.error('[db] getNotificationSettings:', error);
  return data ? (data.data || data) : null;
}

export async function upsertNotificationSettings(userId: string, settings: Record<string, any>) {
  const row = {
    id: userId,
    data: settings,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('notification_settings')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertNotificationSettings:', error);
}

// ─── User Settings ───

export async function getUserSettings(userId: string) {
  const { data, error } = await db()
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) console.error('[db] getUserSettings:', error);
  return data ? (data.settings || data.data || data) : null;
}

export async function upsertUserSettings(userId: string, settings: Record<string, any>) {
  const row = {
    user_id: userId,
    settings,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('user_settings')
    .upsert(row, { onConflict: 'user_id' });
  if (error) console.error('[db] upsertUserSettings:', error);
}

// ─── Analytics ───

export async function getTrackAnalytics(trackId: string) {
  const { data, error } = await db()
    .from('track_analytics')
    .select('*')
    .eq('id', trackId)
    .maybeSingle();
  if (error) console.error('[db] getTrackAnalytics:', error);
  return data ? (data.data || data) : null;
}

export async function upsertTrackAnalytics(trackId: string, analytics: Record<string, any>) {
  const row = {
    id: trackId,
    data: analytics,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('track_analytics')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertTrackAnalytics:', error);
}

// ─── Artist Profiles ───

export async function getArtistProfile(artistId: string) {
  const { data, error } = await db()
    .from('artist_profiles_kv')
    .select('*')
    .eq('id', artistId)
    .maybeSingle();
  if (error) console.error('[db] getArtistProfile:', error);
  return data ? (data.data || data) : null;
}

export async function upsertArtistProfile(artistId: string, profile: Record<string, any>) {
  const row = {
    id: artistId,
    data: profile,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('artist_profiles_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertArtistProfile:', error);
}

export async function getAllArtistProfiles() {
  const { data, error } = await db()
    .from('artist_profiles_kv')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getAllArtistProfiles:', error);
  return (data || []).map((r: any) => r.data || r);
}

// ─── Marketplace / Beats ───

export async function getBeats(filters?: { genre?: string; producerId?: string }) {
  let q = db().from('beats').select('*').order('created_at', { ascending: false });
  if (filters?.genre) q = q.eq('genre', filters.genre);
  if (filters?.producerId) q = q.eq('producer_id', filters.producerId);
  const { data, error } = await q;
  if (error) console.error('[db] getBeats:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function getBeat(beatId: string) {
  const { data, error } = await db()
    .from('beats')
    .select('*')
    .eq('id', beatId)
    .maybeSingle();
  if (error) console.error('[db] getBeat:', error);
  return data ? (data.data || data) : null;
}

export async function upsertBeat(beatId: string, beat: Record<string, any>) {
  const row = {
    id: beatId,
    data: beat,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('beats')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertBeat:', error);
}

export async function deleteBeat(beatId: string) {
  const { error } = await db()
    .from('beats')
    .delete()
    .eq('id', beatId);
  if (error) console.error('[db] deleteBeat:', error);
}

// ─── Bookings ───

export async function getBookingsByUser(userId: string) {
  const { data, error } = await db()
    .from('bookings')
    .select('*')
    .or(`performer_id.eq.${userId},requester_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getBookingsByUser:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function getBooking(bookingId: string) {
  const { data, error } = await db()
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle();
  if (error) console.error('[db] getBooking:', error);
  return data ? (data.data || data) : null;
}

export async function upsertBooking(bookingId: string, booking: Record<string, any>) {
  const row = {
    id: bookingId,
    data: booking,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('bookings')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertBooking:', error);
}

// ─── Messaging ───

export async function getConversationsByUser(userId: string) {
  const { data, error } = await db()
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('last_message_at', { ascending: false });
  if (error) console.error('[db] getConversationsByUser:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function getMessages(conversationId: string) {
  const { data, error } = await db()
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) console.error('[db] getMessages:', error);
  return (data || []).map((r: any) => r.data || r);
}

// ─── Support Tickets ───

export async function getTicketsByUser(userId: string) {
  const { data, error } = await db()
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getTicketsByUser:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function upsertTicket(ticketId: string, ticket: Record<string, any>) {
  const row = {
    id: ticketId,
    data: ticket,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('support_tickets')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertTicket:', error);
}

// ─── Marketing Campaigns ───

export async function getCampaignsByUser(userId: string) {
  const { data, error } = await db()
    .from('marketing_campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getCampaignsByUser:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function upsertCampaign(campaignId: string, campaign: Record<string, any>) {
  const row = {
    id: campaignId,
    data: campaign,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('marketing_campaigns')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertCampaign:', error);
}

// ─── Banner Ads ───

export async function getBannersByUser(userId: string) {
  const { data, error } = await db()
    .from('banner_ads_kv')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getBannersByUser:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function upsertBanner(bannerId: string, userId: string, banner: Record<string, any>) {
  const row = {
    id: bannerId,
    user_id: userId,
    data: banner,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('banner_ads_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertBanner:', error);
}

// ─── Platform Stats ───

export async function getPlatformStats() {
  const { data, error } = await db()
    .from('platform_stats')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) console.error('[db] getPlatformStats:', error);
  return data ? (data.stats || data.data || data) : null;
}

export async function upsertPlatformStats(stats: Record<string, any>) {
  const row = {
    id: 1,
    stats,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('platform_stats')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertPlatformStats:', error);
}

// ─── Agent Sessions ───

export async function getAgentSessions() {
  const { data, error } = await db()
    .from('agent_sessions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getAgentSessions:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function getAgentSession(sessionId: string) {
  const { data, error } = await db()
    .from('agent_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  if (error) console.error('[db] getAgentSession:', error);
  return data ? (data.data || data) : null;
}

export async function upsertAgentSession(sessionId: string, session: Record<string, any>) {
  const row = {
    id: sessionId,
    data: session,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('agent_sessions')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertAgentSession:', error);
}

// ─── Charts ───

export async function getChartsSources() {
  const { data, error } = await db()
    .from('chart_sources')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getChartsSources:', error);
  return (data || []).map((r: any) => r.data || r);
}

// ─── DJ Profiles ───

export async function getDjProfiles() {
  const { data, error } = await db()
    .from('dj_profiles_kv')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getDjProfiles:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function getDjProfile(djId: string) {
  const { data, error } = await db()
    .from('dj_profiles_kv')
    .select('*')
    .eq('id', djId)
    .maybeSingle();
  if (error) console.error('[db] getDjProfile:', error);
  return data ? (data.data || data) : null;
}

export async function upsertDjProfile(djId: string, profile: Record<string, any>) {
  const row = {
    id: djId,
    data: profile,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('dj_profiles_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertDjProfile:', error);
}

// ─── Venue Profiles ───

export async function getVenueProfile(userId: string) {
  const { data, error } = await db()
    .from('venue_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) console.error('[db] getVenueProfile:', error);
  return data ? (data.data || data) : null;
}

export async function upsertVenueProfile(userId: string, profile: Record<string, any>) {
  const row = {
    id: userId,
    user_id: userId,
    data: profile,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('venue_profiles')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertVenueProfile:', error);
}

// ─── Radio Profiles ───

export async function getRadioProfile(userId: string) {
  const { data, error } = await db()
    .from('radio_profiles_kv')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) console.error('[db] getRadioProfile:', error);
  return data ? (data.data || data) : null;
}

export async function upsertRadioProfile(userId: string, profile: Record<string, any>) {
  const row = {
    id: userId,
    user_id: userId,
    data: profile,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('radio_profiles_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertRadioProfile:', error);
}

// ─── Producer Profiles ───

export async function getProducerProfile(userId: string) {
  const { data, error } = await db()
    .from('producer_profiles_kv')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) console.error('[db] getProducerProfile:', error);
  return data ? (data.data || data) : null;
}

export async function upsertProducerProfile(userId: string, profile: Record<string, any>) {
  const row = {
    id: userId,
    user_id: userId,
    data: profile,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('producer_profiles_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertProducerProfile:', error);
}

// ─── Collaboration ───

export async function getCollabOffers(userId: string, role: 'artist' | 'producer') {
  const column = role === 'artist' ? 'artist_id' : 'producer_id';
  const { data, error } = await db()
    .from('collab_offers')
    .select('*')
    .eq(column, userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getCollabOffers:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function upsertCollabOffer(offerId: string, offer: Record<string, any>) {
  const row = {
    id: offerId,
    data: offer,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('collab_offers')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertCollabOffer:', error);
}

// ─── Content Orders ───

export async function getContentOrders(filters?: { userId?: string; venueId?: string }) {
  let q = db().from('content_orders').select('*').order('created_at', { ascending: false });
  if (filters?.userId) q = q.eq('user_id', filters.userId);
  if (filters?.venueId) q = q.eq('venue_id', filters.venueId);
  const { data, error } = await q;
  if (error) console.error('[db] getContentOrders:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function upsertContentOrder(orderId: string, order: Record<string, any>) {
  const row = {
    id: orderId,
    data: order,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('content_orders')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertContentOrder:', error);
}

// ─── Email Campaigns (notifications) ───

export async function getEmailCampaigns(artistId: string) {
  const { data, error } = await db()
    .from('email_campaigns')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getEmailCampaigns:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function upsertEmailCampaign(campaignId: string, campaign: Record<string, any>) {
  const row = {
    id: campaignId,
    data: campaign,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('email_campaigns')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertEmailCampaign:', error);
}

// ─── Auth Tokens ───

export async function getAuthToken(key: string) {
  const { data, error } = await db()
    .from('auth_tokens_kv')
    .select('*')
    .eq('id', key)
    .maybeSingle();
  if (error) console.error('[db] getAuthToken:', error);
  return data ? (data.data || data) : null;
}

export async function setAuthToken(key: string, token: Record<string, any>) {
  const row = {
    id: key,
    data: token,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('auth_tokens_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] setAuthToken:', error);
}

export async function deleteAuthToken(key: string) {
  const { error } = await db()
    .from('auth_tokens_kv')
    .delete()
    .eq('id', key);
  if (error) console.error('[db] deleteAuthToken:', error);
}

// ─── Sessions (active logins) ───

export async function getUserSessions(userId: string) {
  const { data, error } = await db()
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getUserSessions:', error);
  return (data || []).map((r: any) => r.data || r);
}

// ─── Payment Methods ───

export async function getPaymentMethods(userId: string) {
  const { data, error } = await db()
    .from('payment_methods_kv')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] getPaymentMethods:', error);
  return (data || []).map((r: any) => r.data || r);
}

export async function upsertPaymentMethod(methodId: string, userId: string, method: Record<string, any>) {
  const row = {
    id: methodId,
    user_id: userId,
    data: method,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db()
    .from('payment_methods_kv')
    .upsert(row, { onConflict: 'id' });
  if (error) console.error('[db] upsertPaymentMethod:', error);
}

export async function deletePaymentMethod(methodId: string) {
  const { error } = await db()
    .from('payment_methods_kv')
    .delete()
    .eq('id', methodId);
  if (error) console.error('[db] deletePaymentMethod:', error);
}

// ─── KV Smart Adapter (re-export from kv_store.tsx) ───
// These delegate to the smart KV adapter which routes keys to proper SQL tables.
// Used by route files that haven't been fully migrated to typed db functions yet.

import {
  get as _kvGet,
  set as _kvSet,
  del as _kvDel,
  getByPrefix as _kvGetByPrefix,
  getByPrefixWithKeys as _kvGetByPrefixWithKeys,
  mget as _kvMget,
  mset as _kvMset,
  mdel as _kvMdel,
} from './kv_store.tsx';

export const kvGet = _kvGet;
export const kvSet = _kvSet;
export const kvDel = _kvDel;
export const kvGetByPrefix = _kvGetByPrefix;
export const kvGetByPrefixWithKeys = _kvGetByPrefixWithKeys;
export const kvMget = _kvMget;
export const kvMset = _kvMset;
export const kvMdel = _kvMdel;
