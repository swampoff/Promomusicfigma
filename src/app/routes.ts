/**
 * ROUTES - React Router v7 with fully nested routes.
 *
 * Public: /, /login, /about, /for-artists, /charts, /concerts, /contact, etc.
 * Cabinets with nested section routes rendered via <Outlet />:
 *   /admin, /radio, /artist, /dj, /venue, /producer
 */

import { createBrowserRouter, redirect } from 'react-router';
import RootLayout from './layouts/RootLayout';
import { LoadingScreen } from './layouts/RootLayout';
import { RouteErrorFallback } from './components/ErrorBoundary';
import PublicLayout from './layouts/PublicLayout';
import { publicRoutes } from './pages/public-routes';

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
      // ADMIN CABINET — nested routes
      // ══════════════════════════════════════════════
      {
        path: 'admin',
        Component: AdminApp,
        children: [
          { index: true, lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminDashboardPage })) },
          { path: 'dashboard', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminDashboardPage })) },
          { path: 'moderation', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminModerationPage })) },
          { path: 'publish', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminPublishPage })) },
          { path: 'ai_agent', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminAIAgentPage })) },
          { path: 'content_orders', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminContentOrdersPage })) },
          { path: 'pitching_distribution', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminPitchingPage })) },
          { path: 'track_test', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminTrackTestPage })) },
          { path: 'messages', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminMessagesPage })) },
          { path: 'users', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminUsersPage })) },
          { path: 'partners', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminPartnersPage })) },
          { path: 'marketplace', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminMarketplacePage })) },
          { path: 'finances', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminFinancesPage })) },
          { path: 'support', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminSupportPage })) },
          { path: 'settings', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminSettingsPage })) },
          { path: 'charts_management', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminChartsPage })) },
          { path: 'content_health', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminContentHealthPage })) },
          { path: '*', lazy: () => import('./pages/admin-pages').then((m) => ({ Component: m.AdminDashboardPage })) },
        ],
      },

      // ══════════════════════════════════════════════
      // RADIO CABINET — nested routes
      // ══════════════════════════════════════════════
      {
        path: 'radio',
        Component: RadioApp,
        children: [
          { index: true, lazy: () => import('./pages/radio-pages').then((m) => ({ Component: m.RadioArtistRequestsPage })) },
          { path: 'artist-requests', lazy: () => import('./pages/radio-pages').then((m) => ({ Component: m.RadioArtistRequestsPage })) },
          { path: 'venue-requests', lazy: () => import('./pages/radio-pages').then((m) => ({ Component: m.RadioVenueRequestsPage })) },
          { path: 'ad-slots', lazy: () => import('./pages/radio-pages').then((m) => ({ Component: m.RadioAdSlotsPage })) },
          { path: 'analytics', lazy: () => import('./pages/radio-pages').then((m) => ({ Component: m.RadioAnalyticsPage })) },
          { path: 'profile', lazy: () => import('./pages/radio-pages').then((m) => ({ Component: m.RadioProfilePage })) },
          { path: 'finance', lazy: () => import('./pages/radio-pages').then((m) => ({ Component: m.RadioFinancePage })) },
          { path: 'messages', lazy: () => import('./pages/radio-pages').then((m) => ({ Component: m.RadioMessagesPage })) },
          { path: 'notifications', lazy: () => import('./pages/radio-pages').then((m) => ({ Component: m.RadioNotificationsPage })) },
          { path: '*', lazy: () => import('./pages/radio-pages').then((m) => ({ Component: m.RadioArtistRequestsPage })) },
        ],
      },

      // ══════════════════════════════════════════════
      // ARTIST CABINET — nested routes
      // ══════════════════════════════════════════════
      {
        path: 'artist',
        Component: ArtistApp,
        children: [
          { index: true, lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistHomePage })) },
          { path: 'home', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistHomePage })) },
          { path: 'publish', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistPublishPage })) },
          { path: 'notifications', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistNotificationsPage })) },
          { path: 'messages', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistMessagesPage })) },
          { path: 'collaboration', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistCollaborationPage })) },
          { path: 'tracks', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistTracksPage })) },
          { path: 'video', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistVideoPage })) },
          { path: 'concerts', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistConcertsPage })) },
          { path: 'news', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistNewsPage })) },
          { path: 'track-test', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistTrackTestPage })) },
          { path: 'pitching', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistPitchingPage })) },
          { path: 'pricing', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistPricingPage })) },
          { path: 'analytics', loader: () => { sessionStorage.setItem('promo_settings_tab', 'analytics'); return redirect('/artist/settings'); } },
          { path: 'payments', loader: () => { sessionStorage.setItem('promo_settings_tab', 'finances'); return redirect('/artist/settings'); } },
          { path: 'support', loader: () => { sessionStorage.setItem('promo_settings_tab', 'support'); return redirect('/artist/settings'); } },
          { path: 'settings', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistSettingsPage })) },
          { path: '*', lazy: () => import('./pages/artist-pages').then((m) => ({ Component: m.ArtistHomePage })) },
        ],
      },

      // ══════════════════════════════════════════════
      // DJ CABINET — nested routes
      // ══════════════════════════════════════════════
      {
        path: 'dj',
        Component: DjApp,
        children: [
          { index: true, lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjHomePage })) },
          { path: 'home', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjHomePage })) },
          { path: 'profile', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjProfilePage })) },
          { path: 'mixes', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjMixesPage })) },
          { path: 'bookings', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjBookingsPage })) },
          { path: 'events', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjEventsPage })) },
          { path: 'promotion', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjPromotionPage })) },
          { path: 'collaborations', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjCollaborationsPage })) },
          { path: 'messages', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjMessagesPage })) },
          { path: 'analytics', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjAnalyticsPage })) },
          { path: 'finances', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjFinancesPage })) },
          { path: 'notifications', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjNotificationsPage })) },
          { path: 'support', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjSupportPage })) },
          { path: 'settings', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjSettingsPage })) },
          { path: 'subscription', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjSubscriptionPage })) },
          { path: 'track-test', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjTrackTestPage })) },
          { path: '*', lazy: () => import('./pages/dj-pages').then((m) => ({ Component: m.DjHomePage })) },
        ],
      },

      // ══════════════════════════════════════════════
      // VENUE CABINET — nested routes
      // ══════════════════════════════════════════════
      {
        path: 'venue',
        Component: VenueApp,
        children: [
          { index: true, lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueDashboardPage })) },
          { path: 'dashboard', lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueDashboardPage })) },
          { path: 'radio-brand', lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueRadioBrandPage })) },
          { path: 'booking', lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueBookingPage })) },
          { path: 'radio-integration', lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueRadioIntegrationPage })) },
          { path: 'subscription', lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueSubscriptionPage })) },
          { path: 'analytics', lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueAnalyticsPage })) },
          { path: 'messages', lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueMessagesPage })) },
          { path: 'profile', lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueProfilePage })) },
          { path: 'notifications', lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueNotificationsPage })) },
          { path: '*', lazy: () => import('./pages/venue-pages').then((m) => ({ Component: m.VenueDashboardPage })) },
        ],
      },

      // ══════════════════════════════════════════════
      // PRODUCER CABINET — nested routes
      // ══════════════════════════════════════════════
      {
        path: 'producer',
        Component: ProducerApp,
        children: [
          { index: true, lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerOverviewPage })) },
          { path: 'overview', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerOverviewPage })) },
          { path: 'services', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerServicesPage })) },
          { path: 'orders', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerOrdersPage })) },
          { path: 'portfolio', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerPortfolioPage })) },
          { path: 'analytics', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerAnalyticsPage })) },
          { path: 'messages', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerMessagesPage })) },
          { path: 'calendar', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerCalendarPage })) },
          { path: 'profile', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerProfilePage })) },
          { path: 'wallet', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerWalletPage })) },
          { path: 'collaboration', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerCollaborationPage })) },
          { path: 'ai', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerAIPage })) },
          { path: 'settings', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerSettingsPage })) },
          { path: 'track-test', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerTrackTestPage })) },
          { path: '*', lazy: () => import('./pages/producer-pages').then((m) => ({ Component: m.ProducerOverviewPage })) },
        ],
      },

      // ── 404 ──
      {
        path: '*',
        lazy: () => import('./pages/NotFoundPage').then((m) => ({ Component: m.default })),
      },
    ],
  },
]);