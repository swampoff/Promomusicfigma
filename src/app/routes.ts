/**
 * ROUTES - React Router v7 with fully nested routes.
 *
 * Public: /, /login, /about, /for-artists, /charts, /concerts, /contact, etc.
 * Cabinets with nested section routes rendered via <Outlet />:
 *   /admin, /radio, /artist, /dj, /venue, /producer
 */

import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import { LoadingScreen } from './layouts/RootLayout';
import { RouteErrorFallback } from './components/ErrorBoundary';
import PublicLayout from './layouts/PublicLayout';
import { publicRoutes } from './pages/public-routes';

// ── Cabinet Protection ──
import { CabinetUnavailable } from './components/cabinet-unavailable';

// ── Eager imports for Figma Make page selector detection ──
import { UnifiedLogin } from './components/unified-login';
import { AdminApp } from '../admin/AdminApp';
import RadioApp from '../radio/RadioApp';
import ArtistApp from './ArtistApp';
import DjApp from '../dj/DjApp';
import VenueApp from '../venue/VenueApp';
import ProducerApp from './ProducerApp';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    HydrateFallback: LoadingScreen,
    ErrorBoundary: RouteErrorFallback,
    children: [
      // ── Landing ──
      {
        index: true,
        lazy: () => import('./PublicApp').then((m) => ({ Component: m.PublicLanding })),
      },

      // ── Login ──
      {
        path: 'login',
        Component: UnifiedLogin,
      },

      // ══════════════════════════════════════════════
      // PUBLIC PAGES — wrapped in PublicLayout (lazy)
      // ══════════════════════════════════════════════
      {
        Component: PublicLayout,
        children: publicRoutes,
      },

      // ══════════════════════════════════════════════
      // ADMIN CABINET — TEMPORARILY BLOCKED
      // ══════════════════════════════════════════════
      {
        path: 'admin/*',
        Component: CabinetUnavailable,
      },

      // ══════════════════════════════════════════════
      // RADIO CABINET — TEMPORARILY BLOCKED
      // ══════════════════════════════════════════════
      {
        path: 'radio/*',
        Component: CabinetUnavailable,
      },

      // ══════════════════════════════════════════════
      // ARTIST CABINET — TEMPORARILY BLOCKED
      // ══════════════════════════════════════════════
      {
        path: 'artist/*',
        Component: CabinetUnavailable,
      },

      // ══════════════════════════════════════════════
      // DJ CABINET — TEMPORARILY BLOCKED
      // ══════════════════════════════════════════════
      {
        path: 'dj/*',
        Component: CabinetUnavailable,
      },

      // ══════════════════════════════════════════════
      // VENUE CABINET — TEMPORARILY BLOCKED
      // ══════════════════════════════════════════════
      {
        path: 'venue/*',
        Component: CabinetUnavailable,
      },

      // ══════════════════════════════════════════════
      // PRODUCER CABINET — TEMPORARILY BLOCKED
      // ══════════════════════════════════════════════
      {
        path: 'producer/*',
        Component: CabinetUnavailable,
      },

      // ── 404 ──
      {
        path: '*',
        lazy: () => import('./pages/NotFoundPage').then((m) => ({ Component: m.default })),
      },
    ],
  },
]);