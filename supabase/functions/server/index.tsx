import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv-utils.tsx"; // Use kv-utils with retry logic
import routes from "./routes.tsx";
import authRoutes from "./auth-routes.tsx";
import concertsRoutes from "./concerts-routes.tsx";
import notificationsRoutes from "./notifications-routes.tsx";
import ticketingRoutes from "./ticketing-routes.tsx";
import storageRoutes from "./storage-routes.tsx";
import migrationRoutes from "./migration-routes.tsx";
import marketingCampaignsRoutes from "./marketing-campaigns-routes.tsx";
import subscriptionsRoutes from "./subscriptions-routes.tsx";
import promotionRoutes from "./promotion-routes-sql.tsx"; // Использует SQL таблицы
import bannerRoutes from "./banner-routes.tsx"; // Баннерная реклама
import notificationsMessengerRoutes from "./notifications-messenger-routes.tsx"; // Уведомления и мессенджер
import emailRoutes from "./email-routes.tsx"; // Email система
import ticketsSystemRoutes from "./tickets-system-routes.tsx"; // Система тикетов
import paymentsRoutes from "./payments-routes.tsx"; // Система платежей
import settingsRoutes from "./settings-routes.tsx"; // Настройки пользователя
import trackTestRoutes from "./track-test-routes.tsx"; // Тестирование треков
import trackModerationRoutes from "./track-moderation-routes.tsx"; // Модерация треков
import pitchingRoutes from "./pitching-routes.tsx"; // Питчинг и радио
import bookingRoutes from "./booking-routes.tsx"; // Система букинга артистов
import contentOrdersRoutes from "./content-orders-routes.tsx"; // Заказ контента (джинглы/реклама/анонсы)
import elevenlabsRoutes from "./elevenlabs-integration.tsx"; // ElevenLabs TTS генерация
import radioRoutes from "./radio-routes.tsx"; // Радиостанции (аналитика, финансы, слоты)
import venueRoutes from "./venue-routes.tsx"; // Заведения (аналитика, профиль)
import promoGuideRoutes from "./promo-guide-routes.tsx"; // Promo.Guide публичные endpoints
import radioPlayerApi from "./radio-player-api.ts"; // API для подключения плееров заведений
import aiAgent from "./ai-agent.ts"; // AI-агент (Mistral + Claude) для чартов и новостей
import djMarketplaceRoutes from "./dj-marketplace-routes.tsx"; // DJ Marketplace
import artistProfileRoutes from "./artist-profile-routes.tsx"; // Профиль артиста
import radioProfileRoutes from "./radio-profile-routes.tsx"; // Профиль радиостанции
import landingDataRoutes from "./landing-data-routes.tsx"; // Публичные данные лендинга

import { initializeStorage } from "./storage-setup.tsx";
import { initializeDatabase } from "./db-init.tsx"; // SQL инициализация
import { seedDemoData } from "./demo-seed.tsx"; // Демо-данные для лендинга

const app = new Hono();

// Initialize Database and Storage on server start
console.log('🚀 Starting Promo.Music Server...');

// 1. Initialize SQL tables
initializeDatabase().then(result => {
  if (result) {
    console.log('✅ Database tables initialized successfully');
  }
}).catch(error => {
  console.error('❌ Database initialization error:', error);
});

// 2. Initialize Storage
initializeStorage().then(result => {
  if (result.success) {
    console.log('✅ Storage initialized successfully');
    if (result.bucketsCreated.length > 0) {
      console.log('📦 Buckets created:', result.bucketsCreated.join(', '));
    } else {
      console.log('📦 Storage ready (buckets exist or deferred)');
    }
  } else {
    // Only show errors if there are actual errors (not just "already exists")
    if (result.errors.length > 0) {
      console.warn('⚠️ Storage initialization had issues:', result.errors);
      console.warn('⚠️ Storage will be initialized on first use');
    } else {
      console.log('✅ Storage initialized (all buckets already exist)');
    }
  }
}).catch(error => {
  console.warn('⚠️ Storage initialization deferred:', error?.message || 'Unknown error');
  console.log('💡 Storage will be lazily initialized on first use');
});

// 3. Seed demo data (idempotent - only runs once)
seedDemoData().then(result => {
  if (result.seeded) {
    console.log(`🌱 ${result.message}`);
  } else {
    console.log(`📦 ${result.message}`);
  }
}).catch(error => {
  console.warn('⚠️ Demo seed deferred:', error?.message || 'Unknown error');
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
    // Quick KV check
    const seedStatus = await kv.get('system:demo_seed_v4');
    const platformStats = await kv.get('stats:platform');

    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "2.1.0",
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

// Mount all API routes
app.route("/make-server-84730125/api", routes);

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

// Mount promo guide PUBLIC routes (БЕЗ /api - это публичные endpoints!)
app.route("/make-server-84730125", promoGuideRoutes);

// Mount radio player API (для подключения плееров заведений)
app.route("/make-server-84730125", radioPlayerApi);

// Mount AI agent (для чартов и новостей)
app.route("/make-server-84730125/api/ai-agent", aiAgent);

// Mount DJ Marketplace
app.route("/make-server-84730125/api/dj-marketplace", djMarketplaceRoutes);

// Mount Artist Profile
app.route("/make-server-84730125/api/artist-profile", artistProfileRoutes);

// Mount Radio Profile
app.route("/make-server-84730125/api/radio-profile", radioProfileRoutes);

// Mount Landing Data
app.route("/make-server-84730125/api/landing-data", landingDataRoutes);

// 404 handler
app.notFound((c) => {
  const path = c.req.path;
  const method = c.req.method;
  console.warn(`⚠️ Route not found: ${method} ${path}`);
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

Deno.serve(app.fetch);