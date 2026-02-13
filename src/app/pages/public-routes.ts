/**
 * PUBLIC ROUTES - Extracted to separate file so Figma Make page selector
 * only detects the 7 key pages (login + 6 cabinets) from routes.ts
 */

import type { RouteObject } from 'react-router';

export const publicRoutes: RouteObject[] = [
  { path: 'about', lazy: () => import('./public-pages').then((m) => ({ Component: m.AboutRoute })) },
  { path: 'for-artists', lazy: () => import('./public-pages').then((m) => ({ Component: m.ForArtistsRoute })) },
  { path: 'for-djs', lazy: () => import('./public-pages').then((m) => ({ Component: m.ForDJsRoute })) },
  { path: 'for-producers', lazy: () => import('./public-pages').then((m) => ({ Component: m.ForProducersRoute })) },
  { path: 'for-engineers', lazy: () => import('./public-pages').then((m) => ({ Component: m.ForEngineersRoute })) },
  { path: 'for-business', lazy: () => import('./public-pages').then((m) => ({ Component: m.ForBusinessRoute })) },
  { path: 'for-tv', lazy: () => import('./public-pages').then((m) => ({ Component: m.ForTVRoute })) },
  { path: 'for-labels', lazy: () => import('./public-pages').then((m) => ({ Component: m.ForLabelsRoute })) },
  { path: 'for-media', lazy: () => import('./public-pages').then((m) => ({ Component: m.ForMediaRoute })) },
  { path: 'for-bloggers', lazy: () => import('./public-pages').then((m) => ({ Component: m.ForBloggersRoute })) },
  { path: 'promo-air', lazy: () => import('./public-pages').then((m) => ({ Component: m.PromoAirRoute })) },
  { path: 'promo-lab', lazy: () => import('./public-pages').then((m) => ({ Component: m.PromoLabRoute })) },
  { path: 'promo-guide', lazy: () => import('./public-pages').then((m) => ({ Component: m.PromoGuideRoute })) },
  { path: 'charts', lazy: () => import('./public-pages').then((m) => ({ Component: m.ChartsRoute })) },
  { path: 'concerts', lazy: () => import('./public-pages').then((m) => ({ Component: m.ConcertsRoute })) },
  { path: 'news', lazy: () => import('./public-pages').then((m) => ({ Component: m.NewsRoute })) },
  { path: 'marketplace', lazy: () => import('./public-pages').then((m) => ({ Component: m.MarketplaceRoute })) },
  { path: 'profile/:id', lazy: () => import('./public-pages').then((m) => ({ Component: m.ArtistProfileRoute })) },
  { path: 'contact', lazy: () => import('./public-pages').then((m) => ({ Component: m.ContactRoute })) },
  { path: 'privacy', lazy: () => import('./public-pages').then((m) => ({ Component: m.PrivacyRoute })) },
  { path: 'terms', lazy: () => import('./public-pages').then((m) => ({ Component: m.TermsRoute })) },
  { path: 'docs', lazy: () => import('./public-pages').then((m) => ({ Component: m.DocsRoute })) },
  { path: 'careers', lazy: () => import('./public-pages').then((m) => ({ Component: m.CareersRoute })) },
  { path: 'partners', lazy: () => import('./public-pages').then((m) => ({ Component: m.PartnersRoute })) },
  { path: 'support-info', lazy: () => import('./public-pages').then((m) => ({ Component: m.SupportInfoRoute })) },
];