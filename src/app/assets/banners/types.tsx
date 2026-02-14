/**
 * BANNER TYPES - Типы конфигурации баннеров
 */

export interface BannerConfig {
  /** URL или figma:asset импорт изображения */
  image: string;
  /** Заголовок (первая часть) */
  title: string;
  /** Акцентная часть заголовка (градиентный текст) */
  accent: string;
  /** Описание под заголовком */
  description: string;
  /** CSS-класс градиента для оверлея */
  gradient: string;
  /** CTA-кнопка (опционально) */
  cta?: { label: string; path: string };
  /** Режим полного изображения без оверлеев */
  fullImage?: boolean;
  /** Позиционирование object-position для object-cover (по умолчанию 'center') */
  objectPosition?: string;
}