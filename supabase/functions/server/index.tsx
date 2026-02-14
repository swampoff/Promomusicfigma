import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import authRoutes from "./auth-routes.tsx";
import concertsRoutes from "./concerts-routes.tsx";
import notificationsRoutes from "./notifications-routes.tsx";
import ticketingRoutes from "./ticketing-routes.tsx";
import storageRoutes from "./storage-routes.tsx";
import migrationRoutes from "./migration-routes.tsx";
import marketingCampaignsRoutes from "./marketing-campaigns-routes.tsx";
import subscriptionsRoutes from "./subscriptions-routes.tsx";
import promotionRoutes from "./promotion-routes-sql.tsx";
import bannerRoutes from "./banner-routes.tsx";
import notificationsMessengerRoutes from "./notifications-messenger-routes.tsx";
import emailRoutes from "./email-routes.tsx";
import ticketsSystemRoutes from "./tickets-system-routes.tsx";
import paymentsRoutes from "./payments-routes.tsx";
import settingsRoutes from "./settings-routes.tsx";
import trackTestRoutes from "./track-test-routes.tsx";
import trackModerationRoutes from "./track-moderation-routes.tsx";
import pitchingRoutes from "./pitching-routes.tsx";
import bookingRoutes from "./booking-routes.tsx";
import contentOrdersRoutes from "./content-orders-routes.tsx";
import elevenlabsRoutes from "./elevenlabs-integration.tsx";
import radioRoutes from "./radio-routes.tsx";
import venueRoutes from "./venue-routes.tsx";
import promoGuideRoutes from "./promo-guide-routes.tsx";
import aiAgent from "./ai-agent.ts";
import djMarketplaceRoutes from "./dj-marketplace-routes.tsx";
import artistProfileRoutes from "./artist-profile-routes.tsx";
import radioProfileRoutes from "./radio-profile-routes.tsx";
import landingDataRoutes from "./landing-data-routes.tsx";
import producerStudioRoutes from "./producer-studio-routes.tsx";
import djStudioRoutes from "./dj-studio-routes.tsx";
import publishRoutes from "./publish-routes.tsx";
import sseRoutes from "./sse-routes.tsx";
import collaborationRoutes from "./collaboration-routes.tsx";
import chatRoutes from "./chat-routes.tsx";
import artistAnalyticsRoutes from "./artist-analytics-routes.tsx";
import ogImageRoutes from "./og-image-routes.tsx";
import artistDataRoutes from "./artist-data-routes.tsx";
import messagingRoutes from "./messaging-routes.tsx";

import { initializeStorage } from "./storage-setup.tsx";
import { seedDemoData } from "./demo-seed.tsx";

const app = new Hono();

// Initialize Storage and Demo Data on server start
console.log('Starting Promo.music Server...');

// 1. Initialize Storage
initializeStorage().then(result => {
  if (result.success) {
    console.log('Storage initialized successfully');
    if (result.bucketsCreated.length > 0) {
      console.log('Buckets created:', result.bucketsCreated.join(', '));
    } else {
      console.log('Storage ready (buckets exist or deferred)');
    }
  } else {
    if (result.errors.length > 0) {
      console.warn('Storage initialization had issues:', result.errors);
    } else {
      console.log('Storage initialized (all buckets already exist)');
    }
  }
}).catch(error => {
  console.warn('Storage initialization deferred:', error?.message || 'Unknown error');
});

// 2. Seed demo data (idempotent - only runs once per seed version)
seedDemoData().then(result => {
  if (result.seeded) {
    console.log(`Seed: ${result.message}`);
  } else {
    console.log(`Seed: ${result.message}`);
  }
}).catch(error => {
  console.warn('Demo seed deferred:', error?.message || 'Unknown error');
});

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Id"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-84730125/health", async (c) => {
  try {
    const seedStatus = await kv.get('system:demo_seed_v15');
    const platformStats = await kv.get('stats:platform');

    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "2.3.0",
      services: {
        kv: seedStatus ? 'connected' : 'empty',
        demoData: seedStatus ? 'seeded' : 'pending',
        platformStats: platformStats ? 'available' : 'unavailable',
      },
    });
  } catch (error) {
    return c.json({
      status: "degraded",
      timestamp: new Date().toISOString(),
      error: String(error),
    });
  }
});

// Mount auth routes
app.route("/make-server-84730125/auth", authRoutes);

// Mount concerts routes
app.route("/make-server-84730125/api/concerts", concertsRoutes);

// Mount notifications routes
app.route("/make-server-84730125/notifications", notificationsRoutes);

// Mount ticketing routes
app.route("/make-server-84730125/ticketing", ticketingRoutes);

// Mount storage routes
app.route("/make-server-84730125/storage", storageRoutes);

// Mount migration routes
app.route("/make-server-84730125/migration", migrationRoutes);

// Mount marketing campaigns routes
app.route("/make-server-84730125/marketing-campaigns", marketingCampaignsRoutes);

// Mount subscriptions routes
app.route("/make-server-84730125/subscriptions", subscriptionsRoutes);

// Mount promotion routes
app.route("/make-server-84730125/api/promotion", promotionRoutes);

// Mount banner routes
app.route("/make-server-84730125/api/banners", bannerRoutes);

// Mount notifications & messenger routes
app.route("/make-server-84730125/notifications-messenger", notificationsMessengerRoutes);

// Mount email routes
app.route("/make-server-84730125/email", emailRoutes);

// Mount tickets system routes
app.route("/make-server-84730125/tickets-system", ticketsSystemRoutes);

// Mount payments routes
app.route("/make-server-84730125/api/payments", paymentsRoutes);

// Mount settings routes
app.route("/make-server-84730125/api/settings", settingsRoutes);

// Mount track test routes
app.route("/make-server-84730125/api/track-test", trackTestRoutes);

// Mount track moderation routes
app.route("/make-server-84730125/api/track-moderation", trackModerationRoutes);

// Mount pitching routes
app.route("/make-server-84730125/api/pitching", pitchingRoutes);

// Mount booking routes
app.route("/make-server-84730125/api/booking", bookingRoutes);

// Mount content orders routes
app.route("/make-server-84730125/api/content-orders", contentOrdersRoutes);

// Mount elevenlabs routes
app.route("/make-server-84730125/api/elevenlabs", elevenlabsRoutes);

// Mount radio routes
app.route("/make-server-84730125/api/radio", radioRoutes);

// Mount venue routes
app.route("/make-server-84730125/api/venue", venueRoutes);

// Mount promo guide PUBLIC routes
app.route("/make-server-84730125", promoGuideRoutes);

// Mount AI agent
app.route("/make-server-84730125/api/ai-agent", aiAgent);

// Mount DJ Marketplace
app.route("/make-server-84730125/api/dj-marketplace", djMarketplaceRoutes);

// Mount Artist Profile
app.route("/make-server-84730125/api/artist-profile", artistProfileRoutes);

// Mount Radio Profile
app.route("/make-server-84730125/api/radio-profile", radioProfileRoutes);

// Mount Landing Data
app.route("/make-server-84730125/api/landing-data", landingDataRoutes);

// Mount Producer Studio
app.route("/make-server-84730125/api/producer-studio", producerStudioRoutes);

// Mount DJ Studio
app.route("/make-server-84730125/api/dj-studio", djStudioRoutes);

// Mount Publish Routes
app.route("/make-server-84730125/api/publish", publishRoutes);

// Mount SSE Routes
app.route("/make-server-84730125/api/sse", sseRoutes);

// Mount Collaboration Routes
app.route("/make-server-84730125/api/collaboration", collaborationRoutes);

// Mount Chat Routes
app.route("/make-server-84730125/api/chat", chatRoutes);

// Mount Artist Analytics Routes
app.route("/make-server-84730125/api/artist-analytics", artistAnalyticsRoutes);

// Mount OG Image Routes
app.route("/make-server-84730125/api/og-image", ogImageRoutes);

// Mount Messaging Routes (before catch-all /api)
app.route("/make-server-84730125/api/messaging", messagingRoutes);

// Mount Artist Data Routes (catch-all /api - must be last)
app.route("/make-server-84730125/api", artistDataRoutes);

// 404 handler
app.notFound((c) => {
  const path = c.req.path;
  const method = c.req.method;
  console.warn(`Route not found: ${method} ${path}`);
  return c.json({ 
    success: false, 
    error: "Route not found",
    path,
    method,
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ 
    success: false, 
    error: err.message || "Internal server error" 
  }, 500);
});

Deno.serve({
  onError(error) {
    // Suppress "connection closed" errors from SSE disconnects
    const msg = String(error);
    if (msg.includes('connection closed') || msg.includes('connection reset')) {
      return new Response(null, { status: 499 });
    }
    console.error('Deno.serve unhandled error:', msg);
    return new Response('Internal Server Error', { status: 500 });
  },
}, async (req, info) => {
  try {
    return await app.fetch(req, info);
  } catch (err) {
    const msg = String(err);
    if (msg.includes('connection closed') || msg.includes('connection reset')) {
      return new Response(null, { status: 499 });
    }
    console.error('Unhandled fetch error:', msg);
    return new Response('Internal Server Error', { status: 500 });
  }
});