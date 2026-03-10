# CLAUDE.md — Promo.Music

## Project Overview

Promo.Music is a marketing ecosystem for musicians. It features a dark glassmorphism UI, multi-role architecture (Artist, Admin, Radio, Venue, DJ, Producer), and a Supabase backend with Edge Functions.

## Quick Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build (output: /dist)
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking (tsc --noEmit)
```

Package manager: **pnpm** (with `--legacy-peer-deps` for installs due to peer conflicts).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.3, TypeScript 5.6 (strict), Vite 6.3 |
| Routing | React Router 7 (lazy loading, nested routes) |
| Styling | Tailwind CSS v4, Emotion (CSS-in-JS), custom CSS variables |
| UI Components | Radix UI primitives + shadcn/ui (~50 components in `src/app/components/ui/`) |
| Icons | Lucide React, MUI Icons |
| Animation | Motion (`motion/react`), Embla Carousel |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Backend | Supabase Edge Functions (Hono framework, Deno runtime) |
| Database | PostgreSQL (Supabase) + KV Store |
| Auth | Supabase Auth (JWT-based) |
| AI | Mistral API (Promo.Guide agent) |
| Deployment | Vercel (frontend) + Supabase (backend) |
| CI/CD | GitHub Actions (deploy.yml) |

## Architecture

### Entry Point Chain

```
index.html → src/main.tsx → src/app/AppWrapper.tsx → src/main-router.tsx → src/app/RootApp.tsx
                                                                                    │
                                                              Auth state + role routing
                                                                    │
                                              ┌─────────┬──────────┼──────────┬──────────┐
                                              │         │          │          │          │
                                          PublicApp  ArtistApp  AdminApp  RadioApp  VenueApp
```

### Multi-Role Cabinets

| Role | Entry Component | Location |
|------|----------------|----------|
| Public | `PublicApp.tsx` → `SunoLayoutLanding.tsx` | `src/app/` |
| Artist | `ArtistApp.tsx` | `src/app/` |
| Admin | `AdminApp.tsx` | `src/admin/` |
| Radio | `RadioApp.tsx` | `src/radio/` |
| Venue | `VenueApp.tsx` | `src/venue/` |
| DJ | `DjApp.tsx` | `src/dj/` |
| Producer | `ProducerApp.tsx` | `src/app/` |

### Key Directories

```
src/
├── app/                    # Main app shell, artist cabinet, public landing
│   ├── components/
│   │   ├── landing/        # 32+ landing page components (Suno.ai-style)
│   │   ├── ui/             # shadcn/ui component library (50+ components)
│   │   ├── *-page.tsx      # Page components (home, tracks, pitching, etc.)
│   │   └── ...
│   ├── pages/              # Promotion hub pages
│   ├── hooks/              # App-specific hooks
│   ├── layouts/            # RootLayout, sidebar, navigation
│   └── utils/              # App utilities
├── admin/                  # Admin panel (components/, pages/)
├── radio/                  # Radio station cabinet
├── venue/                  # Venue management cabinet
├── dj/                     # DJ panel
├── promo-guide/            # Promo.Guide social layer
├── contexts/               # AuthContext, DataContext, SubscriptionContext
├── hooks/                  # Shared hooks (useApi, useDebounce, useDashboardStats)
├── services/               # API adapters (concerts, performance history)
├── schemas/                # Zod validation schemas
├── types/                  # TypeScript types (database.ts)
├── styles/                 # Global CSS (fonts.css, theme.css, tailwind.css, index.css)
├── utils/                  # API helpers, supabase client, shared utilities
├── config/                 # Environment config
├── lib/                    # Library utilities (supabase.ts)
├── constants/              # App constants
└── assets/                 # Binary assets

supabase/functions/server/  # Backend Edge Functions (43 route files)
├── index.tsx               # Hono server entry point
├── kv_store.tsx            # KV Store utilities
├── supabase-client.tsx     # Database client
├── auth-routes.tsx         # Authentication endpoints
├── track-moderation-routes.tsx
├── pitching-routes.tsx
├── concerts-routes.tsx
├── payments-routes.tsx
├── radio-routes.tsx
├── venue-routes.tsx
├── booking-routes.tsx
├── ai-agent.ts             # Mistral AI integration
└── ...

database/                   # SQL schema reference (16 modules, 00-16)
```

## Important Rules

- **No demo/fake dates**: Never use fictional concert dates, event names, or placeholder data. Always use real, verifiable concerts from actual afisha sources (Яндекс Афиша, МТС Live, KudaGo, etc.). This applies to all fallback/mock data in the codebase.

## Code Conventions

### TypeScript

- **Strict mode** enabled: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Target: ES2020, module resolution: bundler, JSX: react-jsx
- Path alias: `@/*` maps to `./src/*`
- No linter or formatter configured — rely on TypeScript compiler for correctness

### React Patterns

- **Functional components** with hooks exclusively (no class components)
- **Context API** for state management (AuthContext, DataContext, SubscriptionContext)
- **Custom hooks** for data fetching (`useCurrentUser`, `useDashboardStats`, `useNotificationSSE`)
- **React Router v7** with lazy loading for route-level code splitting
- **React Hook Form + Zod** for all form handling and validation

### Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no PostCSS config needed)
- **Glassmorphism** pattern: `bg-white/5 backdrop-blur-xl border-white/8`
- **CSS custom properties** with oklch color model for theming
- Dark mode via `.dark` class
- **Brand colors**: Primary Pink `#FF577F`, Dark Blue `#3E4C5E`, Background `#000000`
- **Fonts**: Montserrat (headings), Inter (body), Golos Text (Russian UI), JetBrains Mono (code/numbers)
- **Breakpoints**: xs: 475px, sm: 640px, md: 768px, lg: 1024px, xl: 1280px

### API Pattern

All frontend API calls follow this pattern:

```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token || publicAnonKey;
const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-User-Id': userId,
    'Content-Type': 'application/json',
  },
});
```

- API base: `https://<projectId>.supabase.co/functions/v1/server/api`
- All backend routes prefixed with `/server/`
- Backend uses **Hono** framework on **Deno** runtime
- Data persistence via **KV Store** (`kv_store.tsx`)

### File Naming

- Components: PascalCase (`PremiumHeroBanner.tsx`, `GlassCard.tsx`)
- Pages: kebab-case (`home-page.tsx`, `tracks-page.tsx`)
- Routes: kebab-case with `-routes` suffix (`auth-routes.tsx`, `pitching-routes.tsx`)
- Schemas: kebab-case with `-schema` suffix (`concert-schema.ts`)
- Adapters: kebab-case with `-adapter` suffix (`concerts-api-adapter.ts`)

## Environment Variables

Frontend (prefixed with `VITE_`):
- `VITE_SUPABASE_PROJECT_ID` — Supabase project ID
- `VITE_SUPABASE_ANON_KEY` — Public anonymous key

Backend (server-side only):
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key
- `MISTRAL_API_KEY` — Mistral AI for Promo.Guide
- `ANTHROPIC_API_KEY` — Anthropic AI (backup)
- `ELEVENLABS_API_KEY` — ElevenLabs TTS

Never commit `.env`, `.env.local`, or `.env.production` files.

## Testing & Quality

- **No test framework** is currently configured (no Jest, Vitest, or Cypress)
- **No linter** is configured (no ESLint or Prettier)
- Use `npm run type-check` to verify TypeScript compilation
- Use `npm run build` to verify the production build succeeds

## Deployment

- **Frontend**: Vercel (region: `arn1`), auto-deploys on push to `main`
- **Backend**: Supabase Edge Functions, deployed via GitHub Actions
- **CI/CD**: `.github/workflows/deploy.yml` — two-job pipeline (Vercel + Supabase)
- SPA routing: all routes rewrite to `/index.html` (configured in `vercel.json`)
- Static assets cached with `max-age=31536000, immutable`

## Database

16 SQL modules in `/database/` define the schema:
- `00_extensions.sql` through `10_admin_settings_seed.sql` — Core system
- `11-15` — Radio station ecosystem (stations, functions, ad slots, ads, finance)
- `16_venue_profiles_module.sql` — Venue management

Setup order documented in `/database/SETUP_ORDER.md`.

Backend uses a **KV Store** pattern (`kv_store_84730125` table) for flexible key-value data persistence alongside traditional SQL tables.

## Key Business Domains

- **Pitching**: Artists submit tracks to radio stations with feedback loop
- **Financial System**: Promo Coins, transactions, subscription tiers (Free/Pro/Premium)
- **Content Moderation**: Multi-stage approval for tracks, videos, banners, concerts, news
- **Booking System**: Venue booking with payment integration
- **Banner Ads**: Self-serve ad placement with analytics
- **AI Agent**: Mistral-powered assistant (Promo.Guide)
- **Radio**: Ad slot management, artist requests, analytics
- **Track Testing**: A/B testing for track performance
