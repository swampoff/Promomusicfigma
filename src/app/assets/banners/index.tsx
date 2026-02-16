/**
 * BANNERS INDEX - Центральный реестр всех баннеров
 *
 * Структура:
 *   assets/
 *     heroes/               - Figma-ассеты персонажей карусели (Сандра, Лиана, Дэн, Марк, Макс, Стелла)
 *     banners/
 *       types.tsx             - Тип BannerConfig
 *       product-banners.tsx   - Promo.air, Promo.lab, Promo.guide (Figma)
 *       content-banners.tsx   - Концерты, Чарты, Новости (Figma)
 *       artists-banners.tsx   - Для артистов (Figma), продюсеров, инженеров (Unsplash)
 *       partners-banners.tsx  - Для радио, ТВ, лейблов, СМИ, блогеров (Unsplash)
 *       company-banners.tsx   - Контакты, Карьера, Партнёры, Поддержка, Документация, Конфиденциальность, Условия (Unsplash)
 *       special-banners.tsx   - О нас, Маркетплейс (Figma) - используются напрямую в своих компонентах
 *       hero-banners.tsx      - Реэкспорт из heroes/ + привязка к баннерным конфигурациям
 *       index.tsx             - Этот файл
 */

export type { BannerConfig } from './types';

// ── Категориальные реестры ──
export { productBanners, promoAirImage, promoLabImage, promoGuideImage } from './product-banners';
export { contentBanners, concertsImage, chartsImage, newsImage, djCatalogImage } from './content-banners';
export { artistsBanners, forArtistsImage, forProducersImage, forEngineersImage } from './artists-banners';
export { partnersBanners, forBusinessImage, forTvImage, forLabelsImage, forMediaImage, forBloggersImage } from './partners-banners';
export { companyBanners, contactImage, careersImage, partnersImage, supportImage, docsImage, privacyImage, termsImage, pricingImage, faqImage, investorsImage } from './company-banners';
export { aboutImage, marketplaceImage } from './special-banners';

// ── Hero-карусель (персонажи с жёсткой привязкой к разделам) ──
export {
  heroSandraImage, heroLinaImage, heroDanImage,
  heroMarkImage, heroMaxImage, heroStellaImage,
  HERO_CHARACTER_MAP,
} from './hero-banners';

// ── Единый реестр для PageBanner (привязка path -> config) ──
import { productBanners } from './product-banners';
import { contentBanners } from './content-banners';
import { artistsBanners } from './artists-banners';
import { partnersBanners } from './partners-banners';
import { companyBanners } from './company-banners';
import type { BannerConfig } from './types';

export const ALL_BANNERS: Record<string, BannerConfig> = {
  ...contentBanners,
  ...productBanners,
  ...artistsBanners,
  ...partnersBanners,
  ...companyBanners,
};