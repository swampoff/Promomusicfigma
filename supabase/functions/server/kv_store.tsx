/**
 * Smart KV → SQL Adapter
 *
 * Keeps the same kv.get/set/del/getByPrefix API but routes data
 * to proper normalized SQL tables instead of a single kv_store table.
 *
 * Each KV key prefix is mapped to a dedicated table.
 * Unmapped keys fall back to kv_store for backwards compatibility.
 */
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const client = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ─── Route definitions ───────────────────────────────────────
// Maps KV key patterns to {table, extractId, buildRow, extractValue}
// extractId: (key) => primary key value(s)
// buildRow: (key, value) => row object for upsert
// extractValue: (row) => the value to return from get()

interface Route {
  table: string;
  pk: string; // primary key column name
  extractId: (key: string) => string;
  buildRow: (key: string, value: any) => Record<string, any>;
  extractValue: (row: any) => any;
  // For getByPrefix — which column to filter on (if different from pk)
  prefixColumn?: string;
  prefixExtract?: (prefix: string) => string;
}

// Helper: split key by ':' and get part at index
const part = (key: string, idx: number) => key.split(':')[idx] || '';
const partsFrom = (key: string, idx: number) => key.split(':').slice(idx).join(':');

// Simple data-in-jsonb route
const jsonbRoute = (table: string, pk: string, keyToId: (k: string) => string): Route => ({
  table, pk,
  extractId: keyToId,
  buildRow: (key, value) => ({ [pk]: keyToId(key), data: value, updated_at: new Date().toISOString() }),
  extractValue: (row) => row.data,
});

// ─── All KV key → SQL table mappings ─────────────────────────

const routes: { pattern: RegExp; route: Route }[] = [
  // ── Profiles ──
  { pattern: /^profile:(.+)$/, route: jsonbRoute('profiles', 'user_id', k => part(k, 1)) },

  // ── Tracks ──
  { pattern: /^track:user:([^:]+):([^:]+)$/, route: {
    table: 'tracks_kv', pk: 'id',
    extractId: k => part(k, 3),
    buildRow: (k, v) => ({ id: part(k, 3), user_id: part(k, 2), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^track:user:([^:]+):$/, route: {
    table: 'tracks_kv', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'user_id',
    prefixExtract: p => p.replace('track:user:', '').replace(/:$/, ''),
  }},
  { pattern: /^track:public:/, route: {
    table: 'tracks_kv', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 2), data: v }),
    extractValue: r => r.data,
  }},

  // ── Track Analytics ──
  { pattern: /^analytics:track:(.+)$/, route: jsonbRoute('track_analytics', 'track_id', k => part(k, 2)) },

  // ── Videos ──
  { pattern: /^video:user:([^:]+):([^:]+)$/, route: {
    table: 'videos_kv', pk: 'id',
    extractId: k => part(k, 3),
    buildRow: (k, v) => ({ id: part(k, 3), user_id: part(k, 2), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^video:user:([^:]+):$/, route: {
    table: 'videos_kv', pk: 'id',
    extractId: k => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'user_id',
    prefixExtract: p => p.replace('video:user:', '').replace(/:$/, ''),
  }},

  // ── News ──
  { pattern: /^news:user:([^:]+):([^:]+)$/, route: {
    table: 'news_kv', pk: 'id',
    extractId: k => part(k, 3),
    buildRow: (k, v) => ({ id: part(k, 3), user_id: part(k, 2), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^news:user:([^:]+):$/, route: {
    table: 'news_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'user_id',
    prefixExtract: p => p.replace('news:user:', '').replace(/:$/, ''),
  }},
  { pattern: /^news:public:(.+)$/, route: {
    table: 'news_kv', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 2), data: v, status: 'published' }),
    extractValue: r => r.data,
  }},
  { pattern: /^news:public:$/, route: {
    table: 'news_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'status',
    prefixExtract: () => 'published',
  }},
  { pattern: /^news:(sources|last_run|articles:.+|pipeline:.+)/, route: jsonbRoute('news_pipeline', 'key', k => k) },

  // ── Concerts ──
  { pattern: /^concert:user:([^:]+):([^:]+)$/, route: {
    table: 'concerts_kv', pk: 'id',
    extractId: k => part(k, 3),
    buildRow: (k, v) => ({ id: part(k, 3), user_id: part(k, 2), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^concert:user:([^:]+):$/, route: {
    table: 'concerts_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'user_id',
    prefixExtract: p => p.replace('concert:user:', '').replace(/:$/, ''),
  }},
  { pattern: /^concert:promoted:(.+)$/, route: {
    table: 'concerts_kv', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 2), data: v, is_promoted: true }),
    extractValue: r => r.data,
  }},
  { pattern: /^concert:promoted:$/, route: {
    table: 'concerts_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'is_promoted',
    prefixExtract: () => 'true',
  }},
  { pattern: /^concert:public:$/, route: {
    table: 'concerts_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'is_promoted',
    prefixExtract: () => 'true',
  }},
  // catch-all for concert: prefix (used by ticketing)
  { pattern: /^concert:$/, route: {
    table: 'concerts_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},

  // ── Donations ──
  { pattern: /^donation:artist:([^:]+):([^:]+)$/, route: {
    table: 'donations_kv', pk: 'id',
    extractId: k => part(k, 3),
    buildRow: (k, v) => ({ id: part(k, 3), artist_id: part(k, 2), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^donation:artist:([^:]+):$/, route: {
    table: 'donations_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'artist_id',
    prefixExtract: p => p.replace('donation:artist:', '').replace(/:$/, ''),
  }},

  // ── Bookings ──
  { pattern: /^booking:([^:]+)$/, route: jsonbRoute('bookings', 'id', k => part(k, 1)) },
  { pattern: /^bookings_by_user:(.+)$/, route: jsonbRoute('bookings_by_user', 'user_id', k => part(k, 1)) },
  { pattern: /^booking_payment:(.+)$/, route: jsonbRoute('booking_payments', 'id', k => part(k, 1)) },
  { pattern: /^booking_calendar:([^:]+):(.+)$/, route: {
    table: 'booking_calendar', pk: 'performer_id',
    extractId: k => part(k, 1),
    buildRow: (k, v) => ({ performer_id: part(k, 1), event_date: part(k, 2), data: v }),
    extractValue: r => r.data,
  }},

  // ── Coins ──
  { pattern: /^coins:balance:(.+)$/, route: {
    table: 'coin_balances', pk: 'user_id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ user_id: part(k, 2), balance: v?.balance || 0, updated_at: new Date().toISOString() }),
    extractValue: r => ({ balance: Number(r.balance), userId: r.user_id }),
  }},
  { pattern: /^coins:tx:([^:]+):([^:]+)$/, route: {
    table: 'coin_transactions_kv', pk: 'id',
    extractId: k => part(k, 3),
    buildRow: (k, v) => ({ id: part(k, 3) || v?.id, user_id: part(k, 2), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^coins:tx:([^:]+):$/, route: {
    table: 'coin_transactions_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'user_id',
    prefixExtract: p => p.replace('coins:tx:', '').replace(/:$/, ''),
  }},

  // ── Payment Sessions ──
  { pattern: /^payments:session:(.+)$/, route: jsonbRoute('payment_sessions', 'order_id', k => part(k, 2)) },
  { pattern: /^payments:methods:([^:]+):([^:]+)$/, route: {
    table: 'payment_methods_kv', pk: 'id',
    extractId: k => part(k, 3),
    buildRow: (k, v) => ({ id: part(k, 3) || v?.id, user_id: part(k, 2), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^payments:methods:([^:]+):$/, route: {
    table: 'payment_methods_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'user_id',
    prefixExtract: p => p.replace('payments:methods:', '').replace(/:$/, ''),
  }},
  { pattern: /^payments:methods:([^:]+)$/, route: jsonbRoute('payment_methods', 'id', k => part(k, 2)) },
  { pattern: /^payments:webhooklog:(.+)$/, route: {
    table: 'payment_webhook_logs', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 2), order_id: part(k, 2), body: v?.body || v, received_at: new Date().toISOString() }),
    extractValue: r => r,
  }},
  { pattern: /^payments:transactions:(.+)$/, route: jsonbRoute('payment_transactions_kv', 'user_id', k => part(k, 2)) },
  { pattern: /^payments:transactions:$/, route: {
    table: 'payment_transactions_kv', pk: 'user_id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},
  { pattern: /^payments:balance:platform$/, route: jsonbRoute('payment_balances', 'user_id', () => 'platform') },
  { pattern: /^payments:balance:(.+)$/, route: {
    table: 'payment_balances', pk: 'user_id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ user_id: part(k, 2), available: v?.available || 0, pending: v?.pending || 0, total: v?.total || 0, updated_at: new Date().toISOString() }),
    extractValue: r => ({ available: Number(r.available), pending: Number(r.pending), total: Number(r.total) }),
  }},
  { pattern: /^payments:balance:$/, route: {
    table: 'payment_balances', pk: 'user_id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => ({ available: Number(r.available), pending: Number(r.pending), total: Number(r.total), userId: r.user_id }),
  }},
  { pattern: /^payments:withdrawals:(.+)$/, route: jsonbRoute('payment_withdrawals', 'user_id', k => part(k, 2)) },

  // ── Notifications ──
  { pattern: /^notification:([^:]+):([^:]+)$/, route: {
    table: 'notifications_kv', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 2) || v?.id, user_id: part(k, 1), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^notification:([^:]+):$/, route: {
    table: 'notifications_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'user_id',
    prefixExtract: p => p.replace('notification:', '').replace(/:$/, ''),
  }},
  { pattern: /^notification_settings:(.+)$/, route: jsonbRoute('notification_settings_kv', 'user_id', k => part(k, 1)) },

  // ── Cross-cabinet Notifications ──
  { pattern: /^ccn:unread:(.+)$/, route: {
    table: 'ccn_unread_counts', pk: 'user_id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ user_id: part(k, 2), count: typeof v === 'number' ? v : v?.count || 0 }),
    extractValue: r => r.count,
  }},
  { pattern: /^ccn:([^:]+):([^:]+)$/, route: {
    table: 'cross_cabinet_notifications', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 2), target_user_id: part(k, 1), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^ccn:([^:]+):$/, route: {
    table: 'cross_cabinet_notifications', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'target_user_id',
    prefixExtract: p => p.replace('ccn:', '').replace(/:$/, ''),
  }},

  // ── Campaigns ──
  { pattern: /^campaign:([^:]+):([^:]+)$/, route: {
    table: 'notification_campaigns', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 2), user_id: part(k, 1), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^campaign:([^:]+):$/, route: {
    table: 'notification_campaigns', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'user_id',
    prefixExtract: p => p.replace('campaign:', '').replace(/:$/, ''),
  }},

  // ── Agents ──
  { pattern: /^agents:sessions_index$/, route: jsonbRoute('agent_sessions_index', 'id', () => 'singleton') },
  { pattern: /^agents:session:(.+)$/, route: jsonbRoute('agent_sessions', 'id', k => part(k, 2)) },
  { pattern: /^agents:queue$/, route: jsonbRoute('agent_queue', 'id', () => 'singleton') },

  // ── Banner Ads ──
  { pattern: /^banner_ad_([^_]+)_(.+)$/, route: {
    table: 'banner_ads_kv', pk: 'id',
    extractId: k => { const m = k.match(/^banner_ad_([^_]+)_(.+)$/); return m ? m[2] : k; },
    buildRow: (k, v) => { const m = k.match(/^banner_ad_([^_]+)_(.+)$/); return { id: m?.[2] || k, user_id: m?.[1] || '', data: v }; },
    extractValue: r => r.data,
    prefixColumn: 'user_id',
    prefixExtract: p => { const m = p.match(/^banner_ad_([^_]+)_$/); return m ? m[1] : ''; },
  }},

  // ── Artist Profiles ──
  { pattern: /^artist_profile:(.+)$/, route: jsonbRoute('artist_profiles', 'id', k => part(k, 1)) },
  { pattern: /^artist_profile:$/, route: {
    table: 'artist_profiles', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},
  { pattern: /^artist:(.+)$/, route: jsonbRoute('artist_profiles', 'id', k => part(k, 1)) },
  { pattern: /^artist:artist-/, route: {
    table: 'artist_profiles', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},
  { pattern: /^artist_slug:(.+)$/, route: {
    table: 'artist_profiles', pk: 'slug',
    extractId: k => part(k, 1),
    buildRow: (k, v) => ({ slug: part(k, 1), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^artist_analytics:(.+)$/, route: jsonbRoute('artist_analytics_cache', 'artist_id', k => part(k, 1)) },
  { pattern: /^artist_tracks_stats:(.+)$/, route: jsonbRoute('artist_tracks_stats', 'artist_id', k => part(k, 1)) },
  { pattern: /^artists:popular$/, route: jsonbRoute('platform_stats', 'key', () => 'artists:popular') },

  // ── Beats / Marketplace ──
  { pattern: /^beat:public:([^:]+)$/, route: jsonbRoute('beats', 'id', k => part(k, 2)) },
  { pattern: /^beat:public:$/, route: {
    table: 'beats', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},
  { pattern: /^beat_favorites:(.+)$/, route: jsonbRoute('beat_favorites', 'user_id', k => part(k, 1)) },
  { pattern: /^beat_purchase:(.+)$/, route: jsonbRoute('beat_purchases', 'id', k => part(k, 1)) },
  { pattern: /^beat_purchases_by_user:(.+)$/, route: jsonbRoute('beat_purchases_by_user', 'user_id', k => part(k, 1)) },
  { pattern: /^beat_purchases_by_prod:(.+)$/, route: jsonbRoute('beat_purchases_by_producer', 'producer_id', k => part(k, 1)) },
  { pattern: /^beat_review:([^:]+):(.+)$/, route: {
    table: 'beat_reviews', pk: 'id',
    extractId: k => part(k, 1) + ':' + part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 1) + ':' + part(k, 2), beat_id: part(k, 1), user_id: part(k, 2), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^beat_reviews_index:(.+)$/, route: jsonbRoute('beat_reviews_index', 'beat_id', k => part(k, 1)) },
  { pattern: /^contract:(.+)$/, route: jsonbRoute('contracts', 'id', k => part(k, 1)) },
  { pattern: /^digital_good:public:(.+)$/, route: jsonbRoute('digital_goods', 'id', k => part(k, 2)) },
  { pattern: /^digital_good:public:$/, route: {
    table: 'digital_goods', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},
  { pattern: /^digital_purchase:(.+)$/, route: jsonbRoute('digital_purchases', 'id', k => part(k, 1)) },
  { pattern: /^digital_purchases_by_user:(.+)$/, route: jsonbRoute('digital_purchases_by_user', 'user_id', k => part(k, 1)) },
  { pattern: /^service_order:(.+)$/, route: jsonbRoute('service_orders', 'id', k => part(k, 1)) },
  { pattern: /^service_orders_by_client:(.+)$/, route: jsonbRoute('service_orders_by_client', 'client_id', k => part(k, 1)) },
  { pattern: /^service_orders_by_producer:(.+)$/, route: jsonbRoute('service_orders_by_producer', 'producer_id', k => part(k, 1)) },
  { pattern: /^producer_service:public:(.+)$/, route: jsonbRoute('producer_services', 'id', k => part(k, 2)) },
  { pattern: /^producer_service:public:$/, route: {
    table: 'producer_services', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},

  // ── Producer Studio ──
  { pattern: /^producer_profile:(.+)$/, route: jsonbRoute('producer_profiles_kv', 'id', k => part(k, 1)) },
  { pattern: /^producer_profile:$/, route: {
    table: 'producer_profiles_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},
  { pattern: /^producer-settings:(.+)$/, route: jsonbRoute('producer_settings', 'user_id', k => part(k, 1)) },
  { pattern: /^producer-profile-edit:(.+)$/, route: jsonbRoute('producer_profile_edit', 'user_id', k => part(k, 1)) },
  { pattern: /^producer-msgs:(.+)$/, route: jsonbRoute('producer_messages', 'user_id', k => part(k, 1)) },
  { pattern: /^producer-ai-last:(.+)$/, route: jsonbRoute('producer_ai_last', 'user_id', k => part(k, 1)) },
  { pattern: /^producer-convs:(.+)$/, route: jsonbRoute('producer_messages', 'user_id', k => part(k, 1)) },
  { pattern: /^producer-sessions:(.+)$/, route: jsonbRoute('producer_settings', 'user_id', k => part(k, 1)) },
  { pattern: /^producer-custom-services:(.+)$/, route: jsonbRoute('producer_settings', 'user_id', k => part(k, 1)) },
  { pattern: /^producer-withdrawals:(.+)$/, route: jsonbRoute('payment_withdrawals', 'user_id', k => part(k, 1)) },
  { pattern: /^producer_wallet:(.+)$/, route: jsonbRoute('payment_balances', 'user_id', k => part(k, 1)) },
  { pattern: /^producer_order:([^:]+):$/, route: {
    table: 'service_orders', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'producer_id',
    prefixExtract: p => p.replace('producer_order:', '').replace(/:$/, ''),
  }},
  { pattern: /^producer_review:([^:]+):$/, route: {
    table: 'beat_reviews', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},

  // ── DJ ──
  { pattern: /^dj:marketplace:seeded$/, route: jsonbRoute('dj_marketplace_index', 'id', () => 'seeded') },
  { pattern: /^dj:marketplace:index$/, route: jsonbRoute('dj_marketplace_index', 'id', () => 'singleton') },
  { pattern: /^dj:mixes:(.+)$/, route: jsonbRoute('dj_mixes', 'dj_id', k => part(k, 2)) },
  { pattern: /^dj:reviews:(.+)$/, route: jsonbRoute('dj_reviews', 'dj_id', k => part(k, 2)) },
  { pattern: /^dj:profile:(.+)$/, route: jsonbRoute('dj_profiles_kv', 'id', k => part(k, 2)) },
  { pattern: /^dj:calendar:(.+)$/, route: jsonbRoute('dj_calendar', 'dj_id', k => part(k, 2)) },
  { pattern: /^dj:booking:(.+)$/, route: jsonbRoute('dj_bookings', 'id', k => part(k, 2)) },
  { pattern: /^dj:bookings:(.+)$/, route: jsonbRoute('dj_bookings_by_dj', 'dj_id', k => part(k, 2)) },
  { pattern: /^dj:events:(.+)$/, route: jsonbRoute('dj_events', 'dj_id', k => part(k, 2)) },
  { pattern: /^dj:collaborations:(.+)$/, route: jsonbRoute('dj_collaborations', 'dj_id', k => part(k, 2)) },
  { pattern: /^dj:notifications:(.+)$/, route: jsonbRoute('dj_notifications_kv', 'dj_id', k => part(k, 2)) },
  { pattern: /^dj:subscription:(.+)$/, route: jsonbRoute('dj_subscriptions', 'dj_id', k => part(k, 2)) },
  { pattern: /^dj_profile:(.+)$/, route: jsonbRoute('dj_profiles_kv', 'id', k => part(k, 1)) },

  // ── Collaboration ──
  { pattern: /^collab_offers:(.+)$/, route: jsonbRoute('collab_offers_by_artist', 'artist_id', k => part(k, 1)) },
  { pattern: /^collab_offers:$/, route: {
    table: 'collab_offers_by_artist', pk: 'artist_id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},
  { pattern: /^collab_offers_by:(.+)$/, route: jsonbRoute('collab_offers_by_producer', 'producer_id', k => part(k, 1)) },
  { pattern: /^collab_chat:(.+)$/, route: jsonbRoute('collab_messages', 'id', k => part(k, 1)) },

  // ── Publish Orders ──
  { pattern: /^publish_order:([^:]+)$/, route: jsonbRoute('publish_orders', 'id', k => part(k, 1)) },
  { pattern: /^publish_order:$/, route: {
    table: 'publish_orders', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},
  { pattern: /^publish_chat:(.+)$/, route: jsonbRoute('publish_chats', 'order_id', k => part(k, 1)) },
  { pattern: /^publish_email_prefs:(.+)$/, route: jsonbRoute('publish_email_prefs', 'user_id', k => part(k, 1)) },
  { pattern: /^publish_email_log:([^:]+):$/, route: {
    table: 'publish_email_prefs', pk: 'user_id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},

  // ── Content Orders ──
  { pattern: /^content_order:(.+)$/, route: jsonbRoute('content_orders', 'id', k => part(k, 1)) },
  { pattern: /^content_orders:(.+)$/, route: jsonbRoute('content_orders_by_status', 'status', k => part(k, 1)) },
  { pattern: /^venue_orders:(.+)$/, route: jsonbRoute('venue_orders_index', 'venue_id', k => part(k, 1)) },

  // ── Charts ──
  { pattern: /^chart:source:(.+)$/, route: jsonbRoute('chart_sources', 'id', k => part(k, 2)) },
  { pattern: /^chart:aggregation:last$/, route: jsonbRoute('chart_aggregation', 'id', () => 'last') },
  { pattern: /^chart:weekly:top20$/, route: jsonbRoute('platform_stats', 'key', () => 'chart:weekly:top20') },

  // ── Radio ──
  { pattern: /^radio_station:(.+)$/, route: jsonbRoute('radio_profiles_kv', 'id', k => part(k, 1)) },
  { pattern: /^radio_station:$/, route: {
    table: 'radio_profiles_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
  }},
  { pattern: /^radio_ad_slot:([^:]+):(.+)$/, route: {
    table: 'radio_ad_slots', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 2), radio_id: part(k, 1), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^radio_ad_slots_index:(.+)$/, route: jsonbRoute('radio_ad_slot_index', 'radio_id', k => part(k, 1)) },
  { pattern: /^radio_analytics:(.+)$/, route: jsonbRoute('radio_analytics_kv', 'radio_id', k => part(k, 1)) },
  { pattern: /^radio_artist_requests:(.+)$/, route: jsonbRoute('radio_artist_requests', 'radio_id', k => part(k, 1)) },
  { pattern: /^radio_venue_requests:(.+)$/, route: jsonbRoute('radio_venue_requests', 'radio_id', k => part(k, 1)) },
  { pattern: /^radio_finance:(.+)$/, route: jsonbRoute('radio_finance', 'radio_id', k => part(k, 1)) },
  { pattern: /^radio_notifications:(.+)$/, route: jsonbRoute('radio_notifications_kv', 'radio_id', k => part(k, 1)) },
  { pattern: /^radio_transactions:(.+)$/, route: jsonbRoute('radio_transactions', 'radio_id', k => part(k, 1)) },

  // ── Venue ──
  { pattern: /^venue_profile:(.+)$/, route: jsonbRoute('venue_profiles', 'id', k => part(k, 1)) },
  { pattern: /^venue_playlists:(.+)$/, route: jsonbRoute('venue_playlists', 'venue_id', k => part(k, 1)) },
  { pattern: /^venue_ad_campaigns:(.+)$/, route: jsonbRoute('venue_ad_campaigns', 'venue_id', k => part(k, 1)) },
  { pattern: /^venue_analytics:(.+)$/, route: jsonbRoute('venue_analytics_kv', 'venue_id', k => part(k, 1)) },
  { pattern: /^venue_radio_brand:(.+)$/, route: jsonbRoute('venue_radio_brand', 'venue_id', k => part(k, 1)) },
  { pattern: /^venue_radio_catalog$/, route: jsonbRoute('platform_stats', 'key', () => 'venue_radio_catalog') },
  { pattern: /^venue_radio_compare:(.+)$/, route: jsonbRoute('platform_stats', 'key', k => k) },
  { pattern: /^venue_roi:(.+)$/, route: jsonbRoute('venue_analytics_kv', 'venue_id', k => part(k, 1)) },
  { pattern: /^venue_spending:(.+)$/, route: jsonbRoute('venue_analytics_kv', 'venue_id', k => part(k, 1)) },
  { pattern: /^venue_campaigns:(.+)$/, route: jsonbRoute('venue_ad_campaigns', 'venue_id', k => part(k, 1)) },

  // ── Ticketing ──
  { pattern: /^ticket_provider:([^:]+):(.+)$/, route: {
    table: 'ticket_providers_kv', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 2), concert_id: part(k, 1), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^ticket_provider:([^:]+):$/, route: {
    table: 'ticket_providers_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'concert_id',
    prefixExtract: p => p.replace('ticket_provider:', '').replace(/:$/, ''),
  }},
  { pattern: /^ticket_sale:([^:]+):(.+)$/, route: {
    table: 'ticket_sales_kv', pk: 'id',
    extractId: k => part(k, 2),
    buildRow: (k, v) => ({ id: part(k, 2), concert_id: part(k, 1), data: v }),
    extractValue: r => r.data,
  }},
  { pattern: /^ticket_sale:([^:]+):$/, route: {
    table: 'ticket_sales_kv', pk: 'id',
    extractId: () => '',
    buildRow: () => ({}),
    extractValue: r => r.data,
    prefixColumn: 'concert_id',
    prefixExtract: p => p.replace('ticket_sale:', '').replace(/:$/, ''),
  }},

  // ── Messaging / DM ──
  { pattern: /^dm:conv:(.+)$/, route: jsonbRoute('dm_conversations', 'id', k => part(k, 2)) },
  { pattern: /^dm:convlist:(.+)$/, route: jsonbRoute('dm_conv_list', 'user_id', k => part(k, 2)) },
  { pattern: /^dm:messages:(.+)$/, route: jsonbRoute('dm_messages', 'conv_id', k => part(k, 2)) },
  { pattern: /^dm:unread:(.+)$/, route: jsonbRoute('dm_unread_counts', 'user_id', k => part(k, 2)) },

  // ── Track Test ──
  { pattern: /^track_test:requests:(.+)$/, route: jsonbRoute('track_test_requests', 'id', k => part(k, 2)) },
  { pattern: /^track_test:user:([^:]+):requests$/, route: jsonbRoute('track_test_user_requests', 'user_id', k => part(k, 2)) },
  { pattern: /^track_test:all_requests$/, route: jsonbRoute('track_test_all_requests', 'id', () => 'singleton') },
  { pattern: /^track_test:registered_experts$/, route: jsonbRoute('track_test_experts', 'id', () => 'singleton') },
  { pattern: /^track_test:reviews:(.+)$/, route: jsonbRoute('track_test_reviews', 'request_id', k => part(k, 2)) },
  { pattern: /^track_test:request:([^:]+):reviews$/, route: jsonbRoute('track_test_request_reviews', 'request_id', k => part(k, 2)) },

  // ── Auth ──
  { pattern: /^email_verify:(.+)$/, route: jsonbRoute('email_verifications', 'token', k => part(k, 1)) },
  { pattern: /^password_reset:(.+)$/, route: jsonbRoute('password_resets', 'token', k => part(k, 1)) },

  // ── Settings ──
  { pattern: /^settings:(.+)$/, route: jsonbRoute('user_settings_kv', 'user_id', k => part(k, 1)) },

  // ── Stats ──
  { pattern: /^stats:platform$/, route: jsonbRoute('platform_stats', 'key', () => 'platform') },
  { pattern: /^stats:genres$/, route: jsonbRoute('platform_stats', 'key', () => 'genres') },

  // ── System ──
  { pattern: /^system:(.+)$/, route: {
    table: 'system_config', pk: 'key',
    extractId: k => k,
    buildRow: (k, v) => ({ key: k, value: v, updated_at: new Date().toISOString() }),
    extractValue: r => r.value,
  }},

  // ── Accounting ──
  { pattern: /^accounting:(.+)$/, route: jsonbRoute('accounting_data', 'key', k => k) },

  // ── Guide ──
  { pattern: /^guide:(.+)$/, route: jsonbRoute('promo_guide_data', 'key', k => k) },

  // ── Elevenlabs ──
  { pattern: /^elevenlabs:(.+)$/, route: jsonbRoute('elevenlabs_config', 'id', k => part(k, 1)) },

  // ── Platform Revenue ──
  { pattern: /^platform:revenue:log$/, route: jsonbRoute('platform_revenue_log', 'id', () => 'singleton') },

  // ── Portfolio ──
  { pattern: /^portfolio:(.+)$/, route: jsonbRoute('platform_stats', 'key', k => k) },
];

// ─── Route resolver ──────────────────────────────────────────

function findRoute(key: string): Route | null {
  for (const { pattern, route } of routes) {
    if (pattern.test(key)) return route;
  }
  return null;
}

// ─── Public API (same interface as before) ───────────────────

export const set = async (key: string, value: any): Promise<void> => {
  const route = findRoute(key);
  if (route) {
    const supabase = client();
    const row = route.buildRow(key, value);
    const { error } = await supabase.from(route.table).upsert(row);
    if (error) {
      console.warn(`[KV→SQL] set error for ${route.table}:`, error.message, '| key:', key);
      // Fallback to kv_store
      await fallbackSet(key, value);
    }
    return;
  }
  await fallbackSet(key, value);
};

export const get = async (key: string): Promise<any> => {
  const route = findRoute(key);
  if (route) {
    const supabase = client();
    const id = route.extractId(key);
    const { data, error } = await supabase
      .from(route.table)
      .select('*')
      .eq(route.pk, id)
      .maybeSingle();
    if (error) {
      console.warn(`[KV→SQL] get error for ${route.table}:`, error.message, '| key:', key);
      return fallbackGet(key);
    }
    return data ? route.extractValue(data) : null;
  }
  return fallbackGet(key);
};

export const del = async (key: string): Promise<void> => {
  const route = findRoute(key);
  if (route) {
    const supabase = client();
    const id = route.extractId(key);
    const { error } = await supabase.from(route.table).delete().eq(route.pk, id);
    if (error) {
      console.warn(`[KV→SQL] del error for ${route.table}:`, error.message, '| key:', key);
      await fallbackDel(key);
    }
    return;
  }
  await fallbackDel(key);
};

export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const route = findRoute(prefix);
  if (route) {
    const supabase = client();
    let query = supabase.from(route.table).select('*');

    if (route.prefixColumn && route.prefixExtract) {
      const filterValue = route.prefixExtract(prefix);
      if (filterValue === 'true') {
        query = query.eq(route.prefixColumn, true);
      } else if (filterValue) {
        query = query.eq(route.prefixColumn, filterValue);
      }
    }
    // If no specific filter, just get all from the table

    const { data, error } = await query;
    if (error) {
      console.warn(`[KV→SQL] getByPrefix error for ${route.table}:`, error.message, '| prefix:', prefix);
      return fallbackGetByPrefix(prefix);
    }
    return (data || []).map(row => route.extractValue(row));
  }
  return fallbackGetByPrefix(prefix);
};

export const getByPrefixWithKeys = async (prefix: string, limit?: number): Promise<{key: string, value: any}[]> => {
  // For this we need to reconstruct keys — use the SQL table approach
  const route = findRoute(prefix);
  if (route) {
    const supabase = client();
    let query = supabase.from(route.table).select('*');

    if (route.prefixColumn && route.prefixExtract) {
      const filterValue = route.prefixExtract(prefix);
      if (filterValue) {
        query = query.eq(route.prefixColumn, filterValue);
      }
    }
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.warn(`[KV→SQL] getByPrefixWithKeys error:`, error.message);
      return fallbackGetByPrefixWithKeys(prefix, limit);
    }
    return (data || []).map(row => ({
      key: prefix + (row[route.pk] || ''),
      value: route.extractValue(row),
    }));
  }
  return fallbackGetByPrefixWithKeys(prefix, limit);
};

export const mset = async (keys: string[], values: any[]): Promise<void> => {
  await Promise.all(keys.map((k, i) => set(k, values[i])));
};

export const mget = async (keys: string[]): Promise<any[]> => {
  return Promise.all(keys.map(k => get(k)));
};

export const mdel = async (keys: string[]): Promise<void> => {
  await Promise.all(keys.map(k => del(k)));
};

// ─── Fallback to kv_store table ──────────────────────────────

const fallbackSet = async (key: string, value: any): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store").upsert({ key, value });
  if (error) throw new Error(error.message);
};

const fallbackGet = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store").select("value").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.value;
};

const fallbackDel = async (key: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store").delete().eq("key", key);
  if (error) throw new Error(error.message);
};

const fallbackGetByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store").select("key, value").like("key", prefix + "%");
  if (error) throw new Error(error.message);
  return data?.map((d) => d.value) ?? [];
};

const fallbackGetByPrefixWithKeys = async (prefix: string, limit?: number): Promise<{key: string, value: any}[]> => {
  const supabase = client();
  let query = supabase.from("kv_store").select("key, value").like("key", prefix + "%");
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
};
