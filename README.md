# Promo.Music

Marketing ecosystem for musicians. Dark glassmorphism UI, multi-role architecture, Supabase backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS v4, Vite 6 |
| Animation | Motion (motion/react) |
| UI Components | Radix UI, shadcn/ui, Recharts, lucide-react |
| Backend | Supabase Edge Functions (Hono), Deno |
| Database | PostgreSQL (Supabase), KV Store |
| AI | Mistral API (Promo.Guide AI-agent) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |

## Architecture

```
main.tsx → AppWrapper → MainRouter → RootApp
                              │
                    ┌─────────┼──────────┐
                    │         │          │
               PublicApp   Login    Dashboard
              (Landing)     Form    (by role)
                                       │
                          ┌────┬───────┼────────┐
                          │    │       │        │
                       Artist Admin  Radio   Venue
```

### Entry Chain

```
src/main.tsx          → Bootstrap, CSS imports
src/app/AppWrapper.tsx → MainRouter wrapper
src/main-router.tsx   → BrowserRouter, /feedback/:token + /*
src/app/RootApp.tsx   → Auth state, role routing
```

### Roles & Cabinets

| Role | Entry Component | Description |
|------|----------------|-------------|
| Public | `PublicApp.tsx` → `SunoLayoutLanding.tsx` | Landing page (Suno.ai layout) |
| Artist | `ArtistApp.tsx` | Tracks, video, pitching, concerts, analytics, finances |
| Admin | `AdminApp.tsx` | Moderation, users, finances, AI dashboard |
| Radio | `RadioApp.tsx` | Ad slots, artist requests, analytics, notifications |
| Venue | `VenueApp.tsx` | Bookings, music, radio brand, player |

## Project Structure

```
/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── main-router.tsx             # Root router
│   ├── app/
│   │   ├── App.tsx                 # Figma Make entry
│   │   ├── AppWrapper.tsx          # Provider wrapper
│   │   ├── RootApp.tsx             # Auth + role routing
│   │   ├── PublicApp.tsx           # Public landing
│   │   ├── ArtistApp.tsx           # Artist cabinet
│   │   ├── components/
│   │   │   ├── landing/            # 32 landing components
│   │   │   │   ├── SunoLayoutLanding.tsx  # Main landing (Suno.ai style)
│   │   │   │   ├── PremiumHeroBanner.tsx  # Hero carousel
│   │   │   │   ├── PremiumTrackCards.tsx   # Track cards
│   │   │   │   ├── PremiumWidgets.tsx      # Sidebar widgets
│   │   │   │   ├── GlassCard.tsx           # Glassmorphism primitives
│   │   │   │   ├── For*.tsx               # Audience pages (Artists, DJs, Producers, Engineers, Business)
│   │   │   │   └── ...
│   │   │   ├── ui/                 # shadcn/ui components (50+)
│   │   │   ├── home-page.tsx
│   │   │   ├── tracks-page.tsx
│   │   │   ├── pitching-page.tsx
│   │   │   ├── concerts-page.tsx
│   │   │   ├── finances-page.tsx
│   │   │   ├── analytics-page.tsx
│   │   │   ├── settings-page.tsx
│   │   │   └── ...
│   │   ├── pages/                  # Promotion hub pages
│   │   └── data/                   # Static data
│   ├── admin/                      # Admin panel
│   │   ├── AdminApp.tsx
│   │   ├── components/             # AI dashboard, chat, moderation
│   │   └── pages/                  # 17 admin pages
│   ├── radio/                      # Radio station cabinet
│   │   ├── RadioApp.tsx
│   │   └── components/             # Ad slots, finance, notifications
│   ├── venue/                      # Venue cabinet
│   │   ├── VenueApp.tsx
│   │   ├── components/             # Bookings, player, radio brand
│   │   ├── api/
│   │   ├── contexts/
│   │   └── types/
│   ├── promo-guide/                # Promo.Guide social layer
│   ├── contexts/                   # AuthContext, DataContext, SubscriptionContext
│   ├── hooks/                      # useApi, useDebounce, useDashboardStats
│   ├── services/                   # API adapters (concerts, performance)
│   ├── styles/
│   │   ├── fonts.css               # Montserrat, Inter, Golos Text
│   │   ├── theme.css               # Brand tokens (#FF577F, #3E4C5E)
│   │   ├── tailwind.css            # Tailwind v4 base
│   │   └── index.css               # Global styles
│   └── utils/                      # API helpers, validation, SEO
│
├── supabase/functions/server/      # Backend (43 files)
│   ├── index.tsx                   # Hono server entry
│   ├── kv_store.tsx                # KV table utilities (protected)
│   ├── supabase-client.tsx         # DB client
│   ├── ai-agent.ts                 # Mistral AI integration
│   ├── auth-routes.tsx             # Authentication
│   ├── payments-routes.tsx         # Payment processing
│   ├── pitching-routes.tsx         # Track pitching
│   ├── concerts-routes.tsx         # Concert management
│   ├── banner-routes.tsx           # Banner ads
│   ├── radio-routes.tsx            # Radio station API
│   ├── venue-routes.tsx            # Venue API
│   ├── booking-routes.tsx          # Booking system
│   ├── subscriptions-routes.tsx    # Subscription tiers
│   ├── storage-routes.tsx          # File storage
│   ├── elevenlabs-integration.tsx  # ElevenLabs TTS
│   └── ...
│
├── supabase/migrations/            # SQL migrations (20 files)
│
├── database/                       # SQL schema reference (16 modules)
│   ├── 00_extensions.sql
│   ├── 01_users_module.sql
│   ├── 02_pitching_module.sql
│   ├── 03_finance_module.sql
│   ├── 04_partners_support_modules.sql
│   ├── 05_analytics_marketing_system.sql
│   ├── 06_functions_triggers.sql
│   ├── 07_views_rls.sql
│   ├── 08_optimization_indexes.sql
│   ├── 09_admin_settings.sql
│   ├── 10_admin_settings_seed.sql
│   ├── 11_radio_stations_module.sql
│   ├── 12_radio_functions_views.sql
│   ├── 13_radio_ad_slots_module.sql
│   ├── 14_radio_advertisement_system.sql
│   ├── 15_radio_financial_system.sql
│   └── 16_venue_profiles_module.sql
│
└── public/                         # Static assets, SEO files
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary Pink | `#FF577F` | Accents, CTA buttons, highlights |
| Dark Blue | `#3E4C5E` | Backgrounds, cards |
| Background | `#000000` | Page background |
| Glassmorphism | `bg-white/5 backdrop-blur-xl` | Cards, panels |

**Fonts:** Montserrat (headings), Inter (body), Golos Text (UI labels)

## Navigation

### Desktop
Sidebar with expandable sections:
- **Home** / Tracks / Video / Concerts / News
- **Artists** (submenu: DJs, Sound Producers, Sound Engineers)
- **Business** (submenu: Radio Stations, Venues)
- Analytics / Finances / Settings

### Mobile
Burger menu with ChevronDown dropdowns, Motion animations, auto-expand on active subsection.

**Breakpoints:** xs: 475px, sm: 640px, md: 768px, lg: 1024px, xl: 1280px

## Server Routes

All routes prefixed with `/server/`:

| Route Group | File | Endpoints |
|------------|------|-----------|
| Auth | auth-routes.tsx | signup, login, session |
| Tracks | track-moderation-routes.tsx | CRUD, moderation |
| Pitching | pitching-routes.tsx | submit, review, feedback |
| Concerts | concerts-routes.tsx | create, list, moderate |
| Payments | payments-routes.tsx | process, history |
| Banners | banner-routes.tsx | submit, manage, analytics |
| Radio | radio-routes.tsx | stations, playlists, requests |
| Venue | venue-routes.tsx | profiles, settings |
| Bookings | booking-routes.tsx | create, manage, pay |
| Subscriptions | subscriptions-routes.tsx | plans, activate |
| Storage | storage-routes.tsx | upload, signed URLs |
| AI Agent | ai-agent.ts | Mistral chat, recommendations |
| Notifications | notifications-routes.tsx | send, list, read |
| Settings | settings-routes.tsx | user preferences |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key (frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `MISTRAL_API_KEY` | Mistral AI for Promo.Guide agent |
| `ANTHROPIC_API_KEY` | Anthropic AI (backup) |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS integration |

## Key Business Features

- **Pitching System** -- Artists submit tracks to radio stations with feedback loop
- **Financial System** -- Promo Coins, transactions, subscription tiers (Free/Pro/Premium)
- **Content Moderation** -- Multi-stage approval for tracks, videos, banners, concerts, news
- **Partner Program** -- Referral system with commission tracking
- **Banner Ads** -- Self-serve ad placement with analytics
- **Booking System** -- Venue booking with payment integration
- **AI Agent** -- Mistral-powered assistant for platform guidance
- **Track Testing** -- A/B testing for track performance

## Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                              │
│                                                                         │
│  PublicApp        ArtistApp        AdminApp      RadioApp     VenueApp  │
│  (Landing)        (Cabinet)        (Panel)       (Cabinet)    (Cabinet) │
│      │                │                │             │            │     │
│      └────────────────┴────────────────┴─────────────┴────────────┘     │
│                                    │                                    │
│                        fetch() + Authorization                          │
│                     Bearer ${publicAnonKey | accessToken}               │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (Hono + Deno)                      │
│              /server/*                                     │
│                                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │    Auth      │  │   Content    │  │   Business   │  │   Platform  │ │
│  │             │  │              │  │              │  │             │ │
│  │ /auth       │  │ /api/track-  │  │ /api/payments│  │ /storage    │ │
│  │  signup     │  │  moderation  │  │ /api/booking │  │ /email      │ │
│  │  login      │  │ /api/track-  │  │ /subscript-  │  │ /notifica-  │ │
│  │  session    │  │  test        │  │  ions        │  │  tions      │ │
│  │             │  │ /api/pitching│  │ /api/banners │  │ /tickets-   │ │
│  │             │  │ /api/concerts│  │ /api/promo-  │  │  system     │ │
│  │             │  │ /api/radio   │  │  tion        │  │ /api/ai-    │ │
│  │             │  │ /api/venue   │  │ /marketing-  │  │  agent      │ │
│  │             │  │ /api/content-│  │  campaigns   │  │ /api/       │ │
│  │             │  │  orders      │  │              │  │  settings   │ │
│  └─────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                    │                                    │
│                         ┌──────────┼──────────┐                        │
│                         ▼          ▼          ▼                        │
│                   ┌──────────┐ ┌────────┐ ┌────────┐                  │
│                   │PostgreSQL│ │Supabase│ │External│                  │
│                   │  (SQL)   │ │Storage │ │  APIs  │                  │
│                   │16 tables │ │ Buckets│ │Mistral │                  │
│                   │+ KV Store│ │        │ │11Labs  │                  │
│                   └──────────┘ └────────┘ └────────┘                  │
└──────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints Map

All endpoints are under `https://<project>.supabase.co/functions/v1/server/`:

### Auth & Users
```
POST /auth/signup              → Register new user
POST /auth/login               → Sign in (returns access_token)
GET  /auth/session             → Check active session
GET  /api/settings             → User preferences
PUT  /api/settings             → Update preferences
```

### Content Management (Artist)
```
GET    /api/track-moderation   → List tracks for moderation
POST   /api/track-moderation   → Submit track
PUT    /api/track-moderation   → Approve/reject track
GET    /api/track-test         → A/B test results
POST   /api/track-test         → Create track test
POST   /api/pitching           → Submit pitching request
GET    /api/pitching           → List pitching requests
PUT    /api/pitching           → Update pitching status (feedback)
GET    /api/concerts           → List concerts
POST   /api/concerts           → Create concert
PUT    /api/concerts           → Update concert
```

### Business & Payments
```
POST   /api/payments           → Process payment
GET    /api/payments           → Payment history
GET    /subscriptions          → Available plans
POST   /subscriptions          → Activate/change plan
POST   /api/booking            → Create booking
GET    /api/booking            → List bookings
PUT    /api/booking            → Update booking status
POST   /api/banners            → Submit banner ad
GET    /api/banners            → List banners
PUT    /api/banners            → Manage banner (approve/reject)
GET    /api/promotion          → Promotion campaigns
POST   /api/promotion          → Create promotion
GET    /marketing-campaigns    → Campaign analytics
POST   /marketing-campaigns    → Create campaign
```

### Radio & Venue
```
GET    /api/radio              → Radio station data (analytics, slots, finance)
POST   /api/radio              → Update radio settings
GET    /api/venue              → Venue profile & analytics
POST   /api/venue              → Update venue profile
POST   /api/content-orders     → Order jingle/ad/announcement
GET    /api/content-orders     → List content orders
POST   /api/elevenlabs         → Generate TTS audio (ElevenLabs)
```

### Platform Services
```
GET    /health                 → Server health check
POST   /storage                → Upload file
GET    /storage                → Get signed URL
POST   /email                  → Send email
GET    /notifications          → List notifications
POST   /notifications          → Send notification
PUT    /notifications          → Mark as read
POST   /notifications-messenger → Messenger messages
GET    /tickets-system         → Support tickets
POST   /tickets-system         → Create ticket
POST   /api/ai-agent           → AI chat (Mistral)
GET    /migration              → DB migration status
```

### Public (no auth required)
```
GET    /promo-guide/*          → Promo.Guide public content
GET    /radio-player/*         → Radio player API for venues
```

## Database Schema (16 SQL Modules)

```
┌─────────────────────────────────────────────────────────────────┐
│                       PostgreSQL (Supabase)                     │
│                                                                 │
│  CORE                          RADIO                            │
│  ┌──────────────────────┐     ┌──────────────────────┐         │
│  │ 00 Extensions        │     │ 11 Radio Stations    │         │
│  │ 01 Users             │     │ 12 Radio Functions   │         │
│  │ 02 Pitching          │     │ 13 Ad Slots          │         │
│  │ 03 Finance           │     │ 14 Advertisement     │         │
│  │ 04 Partners/Support  │     │ 15 Radio Finance     │         │
│  │ 05 Analytics/Mktg    │     └──────────────────────┘         │
│  └──────────────────────┘                                       │
│                                VENUE                            │
│  INFRASTRUCTURE                ┌──────────────────────┐         │
│  ┌──────────────────────┐     │ 16 Venue Profiles    │         │
│  │ 06 Functions/Triggers│     └──────────────────────┘         │
│  │ 07 Views/RLS         │                                       │
│  │ 08 Indexes           │     KV STORE                          │
│  │ 09 Admin Settings    │     ┌──────────────────────┐         │
│  │ 10 Settings Seed     │     │ kv_store_84730125    │         │
│  └──────────────────────┘     │ (key → value JSON)   │         │
│                                └──────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Pitching Flow (Example Business Process)

```
Artist                    Server                   Radio Station
  │                         │                           │
  │  POST /api/pitching     │                           │
  │  {track, target_radio}  │                           │
  │────────────────────────▶│                           │
  │                         │  Store in pitching table  │
  │                         │──────────┐                │
  │                         │◀─────────┘                │
  │                         │                           │
  │                         │  Notification             │
  │                         │──────────────────────────▶│
  │                         │                           │
  │                         │  PUT /api/pitching        │
  │                         │  {status, feedback}       │
  │                         │◀──────────────────────────│
  │                         │                           │
  │  GET /api/pitching      │                           │
  │  (status: approved +    │                           │
  │   feedback text)        │                           │
  │◀────────────────────────│                           │
  │                         │                           │
  │  Track goes to radio    │                           │
  │  playlist rotation      │                           │
```

---

*Built with Figma Make. Last updated: February 2026.*