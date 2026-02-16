/**
 * COMPANY BANNERS - Баннеры корпоративных страниц
 * Контакты, Карьера, Партнёры, Поддержка, Документация, Конфиденциальность, Условия, Тарифы, FAQ
 * Источник: Unsplash
 */

import type { BannerConfig } from './types';

// ── Изображения ──
export const contactImage = 'https://images.unsplash.com/photo-1581438395625-215c5c2c6f2e?w=1200&q=80';
export const careersImage = 'https://images.unsplash.com/photo-1758873268851-feebbfb1d037?w=1200&q=80';
export const partnersImage = 'https://images.unsplash.com/photo-1758599543152-a73184816eba?w=1200&q=80';
export const supportImage = 'https://images.unsplash.com/photo-1741770067276-a10e15ff5197?w=1200&q=80';
export const docsImage = 'https://images.unsplash.com/photo-1542395765-761de4ee9696?w=1200&q=80';
export const privacyImage = 'https://images.unsplash.com/photo-1767972464040-8bfee42d7bed?w=1200&q=80';
export const termsImage = 'https://images.unsplash.com/photo-1763729805496-b5dbf7f00c79?w=1200&q=80';
export const pricingImage = 'https://images.unsplash.com/photo-1659823300663-93084f1795d7?w=1200&q=80';
export const faqImage = 'https://images.unsplash.com/photo-1618218168350-6e7c81151b64?w=1200&q=80';
export const investorsImage = 'https://images.unsplash.com/photo-1769740029093-83f39268a6a7?w=1200&q=80';

// ── Привязка к маршрутам ──
export const companyBanners: Record<string, BannerConfig> = {
  '/contact': {
    image: contactImage,
    title: 'Свяжитесь',
    accent: 'с нами',
    description: 'Мы всегда на связи для ваших вопросов и предложений',
    gradient: 'from-[#FF577F]/80 via-black/60 to-transparent',
  },
  '/careers': {
    image: careersImage,
    title: 'Карьера',
    accent: 'в Promo.music',
    description: 'Присоединяйтесь к команде, которая меняет музыкальную индустрию',
    gradient: 'from-emerald-600/80 via-black/60 to-transparent',
  },
  '/partners': {
    image: partnersImage,
    title: 'Партнёрская',
    accent: 'программа',
    description: 'Зарабатывайте вместе с нами, продвигая музыкальную экосистему',
    gradient: 'from-amber-600/80 via-black/60 to-transparent',
  },
  '/support-info': {
    image: supportImage,
    title: 'Центр',
    accent: 'поддержки',
    description: 'Ответы на вопросы и помощь по всем продуктам экосистемы',
    gradient: 'from-blue-600/80 via-black/60 to-transparent',
  },
  '/docs': {
    image: docsImage,
    title: 'Документация',
    accent: 'платформы',
    description: 'Руководства, API и техническая документация',
    gradient: 'from-slate-600/80 via-black/60 to-transparent',
  },
  '/privacy': {
    image: privacyImage,
    title: 'Политика',
    accent: 'конфиденциальности',
    description: 'Как мы защищаем ваши персональные данные',
    gradient: 'from-indigo-600/80 via-black/60 to-transparent',
  },
  '/terms': {
    image: termsImage,
    title: 'Пользовательское',
    accent: 'соглашение',
    description: 'Правила использования платформы и сервисов',
    gradient: 'from-slate-500/80 via-black/60 to-transparent',
  },
  '/user-agreement': {
    image: termsImage,
    title: 'Пользовательское',
    accent: 'соглашение',
    description: 'Правила использования платформы и сервисов',
    gradient: 'from-slate-500/80 via-black/60 to-transparent',
  },
  '/pricing': {
    image: pricingImage,
    title: 'Тарифы',
    accent: 'и подписки',
    description: 'Выберите подходящий план для вашего творчества',
    gradient: 'from-[#FF577F]/80 via-black/60 to-transparent',
    cta: { label: 'Начать бесплатно', path: '/login' },
  },
  '/faq': {
    image: faqImage,
    title: 'Часто задаваемые',
    accent: 'вопросы',
    description: 'Ответы на популярные вопросы о платформе',
    gradient: 'from-teal-600/80 via-black/60 to-transparent',
  },
  '/investors': {
    image: investorsImage,
    title: 'Для',
    accent: 'инвесторов',
    description: 'Запросите конфиденциальную презентацию проекта Promo.music',
    gradient: 'from-[#FF577F]/80 via-black/60 to-transparent',
  },
};