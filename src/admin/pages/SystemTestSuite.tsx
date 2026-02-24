/**
 * SYSTEM TEST SUITE - Полная проверка готовности системы к продакшену
 * Фаза 1: 115 GET-эндпоинтов (read-only проверка доступности)
 * Фаза 2: 10 CRUD-циклов (POST → GET → PUT → DELETE с cleanup)
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, CheckCircle, XCircle, Clock, AlertTriangle, RotateCcw,
  ChevronDown, ChevronRight, Server, Shield, Music, Radio,
  Users, CreditCard, Send, FileText, MapPin, BarChart3,
  MessageSquare, Zap, Globe, Database, Pause, Filter,
  RefreshCw, Layers, Trash2
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;
const hdrs: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };

// ─── Test status types ───
type TestStatus = 'idle' | 'running' | 'pass' | 'fail' | 'skip' | 'warn';
type TestPhase = 'read' | 'crud';

interface TestResult {
  id: string;
  name: string;
  method: string;
  path: string;
  status: TestStatus;
  ms: number;
  statusCode: number | null;
  error: string | null;
  phase: TestPhase;
}

interface TestGroup {
  id: string;
  label: string;
  icon: typeof Server;
  color: string;
  tests: TestDef[];
  phase: TestPhase;
}

interface TestDef {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  allowEmpty?: boolean;
  skip?: boolean;
  skipReason?: string;
}

// ─── CRUD Cycle definitions ───
interface CrudStep {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  pathFn: (ctx: CrudCtx) => string;
  bodyFn?: (ctx: CrudCtx) => Record<string, unknown>;
  headersFn?: (ctx: CrudCtx) => Record<string, string>;
  extractFn?: (data: any, ctx: CrudCtx) => void;
  isCleanup?: boolean; // if true, always run even if prev step failed
  allowEmpty?: boolean;
}

interface CrudCycleDef {
  id: string;
  label: string;
  icon: typeof Server;
  color: string;
  steps: CrudStep[];
}

// Context passed between CRUD steps
type CrudCtx = Record<string, any>;

// ───────────────────────────────────────────────────────
// PHASE 1: Read-only tests (115 endpoints)
// ───────────────────────────────────────────────────────
const READ_GROUPS: TestGroup[] = [
  {
    id: 'system', label: 'Система и инфраструктура', icon: Server, color: 'emerald', phase: 'read',
    tests: [
      { id: 'sys-1', name: 'Health Check', method: 'GET', path: '/health' },
      { id: 'sys-2', name: 'Миграции - статус', method: 'GET', path: '/migration/status' },
      { id: 'sys-3', name: 'Миграции - здоровье', method: 'GET', path: '/migration/health' },
      { id: 'sys-4', name: 'Хранилище - статус', method: 'GET', path: '/storage/status' },
      { id: 'sys-5', name: 'Хранилище - статистика', method: 'GET', path: '/storage/stats' },
      { id: 'sys-6', name: 'Хранилище - бакеты', method: 'GET', path: '/storage/buckets' },
      { id: 'sys-7', name: 'SSE - подключения', method: 'GET', path: '/api/sse/connections' },
    ],
  },
  {
    id: 'auth', label: 'Авторизация', icon: Shield, color: 'blue', phase: 'read',
    tests: [
      { id: 'auth-1', name: 'Профиль /me (без токена)', method: 'GET', path: '/auth/me', allowEmpty: true },
      { id: 'auth-2', name: 'Вход (пустой запрос - 400)', method: 'POST', path: '/auth/signin', body: { email: '', password: '' }, allowEmpty: true },
    ],
  },
  {
    id: 'settings', label: 'Настройки пользователей', icon: Users, color: 'violet', phase: 'read',
    tests: [
      { id: 'set-1', name: 'Профиль admin-1', method: 'GET', path: '/api/settings/user/admin-1' },
      { id: 'set-2', name: 'Сессии admin-1', method: 'GET', path: '/api/settings/user/admin-1/sessions' },
      { id: 'set-3', name: 'Способы оплаты', method: 'GET', path: '/api/settings/user/admin-1/payment-methods' },
      { id: 'set-4', name: 'Профиль artist-1', method: 'GET', path: '/api/settings/user/artist-1' },
    ],
  },
  {
    id: 'concerts', label: 'Концерты и билеты', icon: Music, color: 'pink', phase: 'read',
    tests: [
      { id: 'con-1', name: 'Список концертов', method: 'GET', path: '/api/concerts' },
      { id: 'con-2', name: 'Промо-концерты', method: 'GET', path: '/api/concerts/promoted' },
      { id: 'con-3', name: 'Тур-даты', method: 'GET', path: '/api/concerts/tour-dates', headers: { 'X-User-Id': 'artist-1' } },
      { id: 'tick-1', name: 'Тикетинг - провайдеры', method: 'GET', path: '/ticketing/providers' },
    ],
  },
  {
    id: 'notifications', label: 'Уведомления', icon: Send, color: 'amber', phase: 'read',
    tests: [
      { id: 'not-1', name: 'Уведомления admin-1', method: 'GET', path: '/notifications/user/admin-1' },
      { id: 'not-2', name: 'Настройки уведомлений', method: 'GET', path: '/notifications/settings/admin-1' },
      { id: 'not-3', name: 'Статистика уведомлений', method: 'GET', path: '/notifications/stats/admin-1' },
      { id: 'not-4', name: 'Кампании artist-1', method: 'GET', path: '/notifications/campaigns/artist-1' },
      { id: 'nmsg-1', name: 'Мессенджер admin-1', method: 'GET', path: '/notifications-messenger/user/admin-1' },
    ],
  },
  {
    id: 'subscriptions', label: 'Подписки', icon: CreditCard, color: 'teal', phase: 'read',
    tests: [
      { id: 'sub-1', name: 'Подписка admin-1', method: 'GET', path: '/subscriptions/admin-1', allowEmpty: true },
      { id: 'sub-2', name: 'Планы', method: 'GET', path: '/subscriptions/plans' },
      { id: 'sub-3', name: 'Лимиты admin-1', method: 'GET', path: '/subscriptions/admin-1/limits', allowEmpty: true },
      { id: 'sub-4', name: 'Текущий план', method: 'GET', path: '/subscriptions/admin-1/current', allowEmpty: true },
    ],
  },
  {
    id: 'payments', label: 'Платежи и финансы', icon: CreditCard, color: 'green', phase: 'read',
    tests: [
      { id: 'pay-1', name: 'Транзакции', method: 'GET', path: '/api/payments/transactions', headers: { 'X-User-Id': 'admin-1' } },
      { id: 'pay-2', name: 'Баланс', method: 'GET', path: '/api/payments/balance', headers: { 'X-User-Id': 'admin-1' } },
      { id: 'pay-3', name: 'Статистика платежей', method: 'GET', path: '/api/payments/stats', headers: { 'X-User-Id': 'admin-1' } },
      { id: 'pay-4', name: 'Админ - транзакции', method: 'GET', path: '/api/payments/admin/transactions' },
      { id: 'pay-5', name: 'Админ - статистика', method: 'GET', path: '/api/payments/admin/stats' },
      { id: 'pay-6', name: 'Бухгалтерия - отчёты', method: 'GET', path: '/api/payments/admin/accounting/reports' },
    ],
  },
  {
    id: 'promotion', label: 'Продвижение и питчинг', icon: Zap, color: 'orange', phase: 'read',
    tests: [
      { id: 'prm-1', name: 'Питчинг - все', method: 'GET', path: '/api/promotion/pitching' },
      { id: 'prm-2', name: 'Питчинг artist-1', method: 'GET', path: '/api/promotion/pitching/artist-1' },
      { id: 'prm-3', name: 'Production360 artist-1', method: 'GET', path: '/api/promotion/production360/artist-1' },
      { id: 'prm-4', name: 'Маркетинг artist-1', method: 'GET', path: '/api/promotion/marketing/artist-1' },
      { id: 'prm-5', name: 'Медиа artist-1', method: 'GET', path: '/api/promotion/media/artist-1' },
      { id: 'prm-6', name: 'Ивенты artist-1', method: 'GET', path: '/api/promotion/event/artist-1' },
      { id: 'pit-1', name: 'Плейлисты (питчинг)', method: 'GET', path: '/api/pitching/playlists' },
      { id: 'pit-2', name: 'Радиостанции (питчинг)', method: 'GET', path: '/api/pitching/radio-stations' },
    ],
  },
  {
    id: 'tracks', label: 'Треки и модерация', icon: Music, color: 'cyan', phase: 'read',
    tests: [
      { id: 'trk-1', name: 'Тест-треки (заявки)', method: 'GET', path: '/api/track-test/requests', headers: { 'X-User-Id': 'artist-1' } },
      { id: 'trk-2', name: 'Админ - заявки', method: 'GET', path: '/api/track-test/admin/requests' },
      { id: 'tmod-1', name: 'Треки на модерации', method: 'GET', path: '/api/track-moderation/pendingTracks' },
      { id: 'tmod-2', name: 'Жанры', method: 'GET', path: '/api/track-moderation/genres' },
      { id: 'tmod-3', name: 'Статистика загрузок', method: 'GET', path: '/api/track-moderation/uploadStats' },
      { id: 'tmod-4', name: 'Общая статистика', method: 'GET', path: '/api/track-moderation/stats' },
    ],
  },
  {
    id: 'content', label: 'Контент и публикации', icon: FileText, color: 'indigo', phase: 'read',
    tests: [
      { id: 'cnt-1', name: 'Заказы контента', method: 'GET', path: '/api/content-orders/orders', headers: { 'X-User-Id': 'admin-1' } },
      { id: 'cnt-2', name: 'Статистика заказов', method: 'GET', path: '/api/content-orders/stats', headers: { 'X-User-Id': 'admin-1' } },
      { id: 'pub-1', name: 'Публикации - все заказы', method: 'GET', path: '/api/publish/orders', headers: { 'X-User-Id': 'artist-1' } },
      { id: 'pub-2', name: 'Публикации - прайс', method: 'GET', path: '/api/publish/pricing' },
      { id: 'pub-3', name: 'Публикации - админ', method: 'GET', path: '/api/publish/admin/all' },
      { id: 'pub-4', name: 'Публикации - стат', method: 'GET', path: '/api/publish/admin/stats' },
    ],
  },
  {
    id: 'radio', label: 'Радио', icon: Radio, color: 'purple', phase: 'read',
    tests: [
      { id: 'rad-1', name: 'Рекламные слоты', method: 'GET', path: '/api/radio/ad-slots/list', headers: { 'X-User-Id': 'radio-1' } },
      { id: 'rad-2', name: 'Заявки артистов', method: 'GET', path: '/api/radio/artist-requests', headers: { 'X-User-Id': 'radio-1' } },
      { id: 'rad-3', name: 'Заявки площадок', method: 'GET', path: '/api/radio/venue-requests', headers: { 'X-User-Id': 'radio-1' } },
      { id: 'rad-4', name: 'Финансы - обзор', method: 'GET', path: '/api/radio/finance/overview', headers: { 'X-User-Id': 'radio-1' } },
      { id: 'rad-5', name: 'Уведомления радио', method: 'GET', path: '/api/radio/notifications', headers: { 'X-User-Id': 'radio-1' } },
      { id: 'rad-6', name: 'Аналитика радио', method: 'GET', path: '/api/radio/analytics', headers: { 'X-User-Id': 'radio-1' } },
      { id: 'rprf-1', name: 'Профиль радио', method: 'GET', path: '/api/radio-profile/profile/radio-1' },
    ],
  },
  {
    id: 'venue', label: 'Площадки', icon: MapPin, color: 'lime', phase: 'read',
    tests: [
      { id: 'ven-1', name: 'Профиль площадки', method: 'GET', path: '/api/venue/profile', headers: { 'X-User-Id': 'venue-1' } },
      { id: 'ven-2', name: 'Статистика площадки', method: 'GET', path: '/api/venue/stats', headers: { 'X-User-Id': 'venue-1' } },
      { id: 'ven-3', name: 'Аналитика - обзор', method: 'GET', path: '/api/venue/analytics/overview', headers: { 'X-User-Id': 'venue-1' } },
      { id: 'ven-4', name: 'Уведомления площадки', method: 'GET', path: '/api/venue/notifications', headers: { 'X-User-Id': 'venue-1' } },
      { id: 'ven-5', name: 'Плейлисты', method: 'GET', path: '/api/venue/playlists', headers: { 'X-User-Id': 'venue-1' } },
      { id: 'ven-6', name: 'Радио-каталог', method: 'GET', path: '/api/venue/radio-catalog', headers: { 'X-User-Id': 'venue-1' } },
      { id: 'ven-7', name: 'Радио-бренд', method: 'GET', path: '/api/venue/radio-brand', headers: { 'X-User-Id': 'venue-1' } },
    ],
  },
  {
    id: 'artist', label: 'Артисты', icon: Users, color: 'rose', phase: 'read',
    tests: [
      { id: 'art-1', name: 'Профиль артиста', method: 'GET', path: '/api/artist-profile/profile/artist-1' },
      { id: 'art-2', name: 'Статистика артиста', method: 'GET', path: '/api/artist-profile/profile/artist-1/stats' },
      { id: 'art-3', name: 'Популярные артисты', method: 'GET', path: '/api/artist-profile/popular' },
      { id: 'art-4', name: 'Треки артиста', method: 'GET', path: '/api/artist-profile/profile/artist-1/tracks' },
      { id: 'ana-1', name: 'Аналитика - обзор', method: 'GET', path: '/api/artist-analytics/overview/artist-1' },
      { id: 'ana-2', name: 'Аналитика - таймлайн', method: 'GET', path: '/api/artist-analytics/timeline/artist-1' },
    ],
  },
  {
    id: 'dj', label: 'Диджеи', icon: Music, color: 'sky', phase: 'read',
    tests: [
      { id: 'dj-1', name: 'DJ Маркетплейс - список', method: 'GET', path: '/api/dj-marketplace/djs' },
      { id: 'djs-1', name: 'DJ Студия - профиль', method: 'GET', path: '/api/dj-studio/profile', headers: { 'X-User-Id': 'dj-1' } },
      { id: 'djs-2', name: 'DJ Студия - ивенты', method: 'GET', path: '/api/dj-studio/events', headers: { 'X-User-Id': 'dj-1' } },
      { id: 'djs-3', name: 'DJ Студия - коллабы', method: 'GET', path: '/api/dj-studio/collaborations', headers: { 'X-User-Id': 'dj-1' } },
      { id: 'djs-4', name: 'DJ Студия - планы', method: 'GET', path: '/api/dj-studio/plans' },
    ],
  },
  {
    id: 'producer', label: 'Продюсеры', icon: Zap, color: 'fuchsia', phase: 'read',
    tests: [
      { id: 'prd-1', name: 'Настройки продюсера', method: 'GET', path: '/api/producer-studio/settings/producer-1' },
      { id: 'prd-2', name: 'Кастомные услуги', method: 'GET', path: '/api/producer-studio/services/custom/producer-1' },
      { id: 'prd-3', name: 'Календарь', method: 'GET', path: '/api/producer-studio/calendar/producer-1' },
    ],
  },
  {
    id: 'marketplace', label: 'Маркетплейс', icon: Globe, color: 'yellow', phase: 'read',
    tests: [
      { id: 'mkt-1', name: 'Биты', method: 'GET', path: '/api/marketplace/beats' },
      { id: 'mkt-2', name: 'Статистика битов', method: 'GET', path: '/api/marketplace/beats/stats' },
      { id: 'mkt-3', name: 'Услуги', method: 'GET', path: '/api/marketplace/services' },
      { id: 'mkt-4', name: 'Цифровые товары', method: 'GET', path: '/api/marketplace/digital-goods' },
    ],
  },
  {
    id: 'landing', label: 'Лендинг и публичные данные', icon: Globe, color: 'slate', phase: 'read',
    tests: [
      { id: 'lnd-1', name: 'Популярные артисты', method: 'GET', path: '/api/landing-data/popular-artists' },
      { id: 'lnd-2', name: 'Чарт недели', method: 'GET', path: '/api/landing-data/charts/weekly' },
      { id: 'lnd-3', name: 'Новые треки', method: 'GET', path: '/api/landing-data/tracks/new' },
      { id: 'lnd-4', name: 'Новости', method: 'GET', path: '/api/landing-data/news' },
      { id: 'lnd-5', name: 'Статистика платформы', method: 'GET', path: '/api/landing-data/stats' },
      { id: 'lnd-6', name: 'Жанры', method: 'GET', path: '/api/landing-data/genres' },
    ],
  },
  {
    id: 'interactive', label: 'Интерактивные сервисы', icon: MessageSquare, color: 'red', phase: 'read',
    tests: [
      { id: 'msg-1', name: 'Диалоги admin-1', method: 'GET', path: '/api/messaging/conversations/admin-1' },
      { id: 'msg-2', name: 'Непрочитанные admin-1', method: 'GET', path: '/api/messaging/unread/admin-1' },
      { id: 'msg-3', name: 'Правила чата', method: 'GET', path: '/api/messaging/rules' },
      { id: 'cht-1', name: 'Непрочитанные (чат)', method: 'GET', path: '/api/chat/unread/admin-1' },
      { id: 'col-1', name: 'Коллаборации artist-1', method: 'GET', path: '/api/collaboration/offers/artist/artist-1' },
      { id: 'col-2', name: 'Стат коллабораций', method: 'GET', path: '/api/collaboration/stats/artist-1' },
      { id: 'bkg-1', name: 'Список букингов', method: 'GET', path: '/api/booking/list', headers: { 'X-User-Id': 'artist-1' } },
    ],
  },
  {
    id: 'analytics', label: 'Аналитика и чарты', icon: BarChart3, color: 'emerald', phase: 'read',
    tests: [
      { id: 'chr-1', name: 'Источники чартов', method: 'GET', path: '/api/charts/sources' },
      { id: 'chr-2', name: 'Все чарты', method: 'GET', path: '/api/charts/all' },
      { id: 'chr-3', name: 'Статус агрегации', method: 'GET', path: '/api/charts/aggregation-status' },
      { id: 'ch-1', name: 'Здоровье контента', method: 'GET', path: '/api/content-health/health' },
    ],
  },
  {
    id: 'misc', label: 'Прочие сервисы', icon: Database, color: 'neutral', phase: 'read',
    tests: [
      { id: 'ban-1', name: 'Баннеры admin-1', method: 'GET', path: '/api/banners/user/admin-1' },
      { id: 'ban-2', name: 'Статистика баннеров', method: 'GET', path: '/api/banners/stats/admin-1' },
      { id: 'eml-1', name: 'Email подписки', method: 'GET', path: '/email/subscriptions/admin-1' },
      { id: 'eml-2', name: 'Email история', method: 'GET', path: '/email/history/admin-1' },
      { id: 'eml-3', name: 'Email шаблоны', method: 'GET', path: '/email/templates' },
      { id: 'tik-1', name: 'Тикеты admin-1', method: 'GET', path: '/tickets-system/user/admin-1' },
      { id: 'tik-2', name: 'Тикеты - админ', method: 'GET', path: '/tickets-system/admin/all' },
      { id: 'news-1', name: 'Новости - источники', method: 'GET', path: '/api/ai-agent/sources' },
      { id: 'news-2', name: 'Новости - стат', method: 'GET', path: '/api/ai-agent/stats' },
      { id: 'news-3', name: 'Новости - опубликованные', method: 'GET', path: '/api/ai-agent/published' },
      { id: 'guide-1', name: 'Гид - площадки', method: 'GET', path: '/public/guide/venues' },
      { id: 'guide-2', name: 'Гид - города', method: 'GET', path: '/public/guide/cities' },
      { id: 'og-1', name: 'OG-изображение', method: 'GET', path: '/api/og-image/' },
      { id: 'agt-1', name: 'Агенты - сессии', method: 'GET', path: '/api/agents/sessions' },
      { id: 'agt-2', name: 'Агенты - очередь', method: 'GET', path: '/api/agents/queue' },
      { id: 'elv-1', name: 'Голоса (синтез)', method: 'GET', path: '/api/elevenlabs/voices', allowEmpty: true },
    ],
  },
];

// ───────────────────────────────────────────────────────
// PHASE 2: CRUD Cycles (10 cycles, ~45 steps total)
// ───────────────────────────────────────────────────────
const TS = () => Date.now();

const CRUD_CYCLES: CrudCycleDef[] = [
  // 1. Тикеты поддержки: POST→GET→PUT→DELETE
  {
    id: 'crud_tickets', label: 'Тикеты поддержки', icon: MessageSquare, color: 'blue',
    steps: [
      {
        id: 'crud_tik_1', name: 'Создать тикет', method: 'POST',
        pathFn: () => '/tickets-system/create',
        bodyFn: () => ({
          user_id: 'admin-1', subject: `[TEST] Тикет ${TS()}`,
          description: 'Автоматический тест CRUD-цикла системного теста',
          category: 'technical', priority: 'low',
        }),
        extractFn: (data, ctx) => { ctx.ticketId = data?.data?.id; },
      },
      {
        id: 'crud_tik_2', name: 'Прочитать тикет', method: 'GET',
        pathFn: (ctx) => `/tickets-system/${ctx.ticketId}`,
      },
      {
        id: 'crud_tik_3', name: 'Обновить тикет', method: 'PUT',
        pathFn: (ctx) => `/tickets-system/${ctx.ticketId}`,
        bodyFn: () => ({ status: 'in_progress', tags: ['test', 'crud'] }),
      },
      {
        id: 'crud_tik_4', name: 'Удалить тикет', method: 'DELETE',
        pathFn: (ctx) => `/tickets-system/${ctx.ticketId}`,
        isCleanup: true,
      },
    ],
  },
  // 2. Маркетинговые кампании: POST→PATCH→DELETE
  {
    id: 'crud_marketing', label: 'Маркетинговые кампании', icon: Zap, color: 'orange',
    steps: [
      {
        id: 'crud_mkt_1', name: 'Создать кампанию', method: 'POST',
        pathFn: () => '/marketing-campaigns/campaigns',
        bodyFn: () => ({
          campaign_name: `[TEST] Кампания ${TS()}`, user_id: 'artist-1',
          artist_name: 'Тест Артист', description: 'CRUD-тест', channels: ['vk'],
        }),
        extractFn: (data, ctx) => { ctx.campaignId = data?.data?.id; },
      },
      {
        id: 'crud_mkt_2', name: 'Обновить кампанию', method: 'PATCH',
        pathFn: (ctx) => `/marketing-campaigns/campaigns/${ctx.campaignId}`,
        bodyFn: () => ({ description: 'Обновлено через CRUD-тест' }),
      },
      {
        id: 'crud_mkt_3', name: 'Проверить обновление', method: 'GET',
        pathFn: (ctx) => `/marketing-campaigns/campaigns/detail/${ctx.campaignId}`,
      },
      {
        id: 'crud_mkt_4', name: 'Удалить кампанию', method: 'DELETE',
        pathFn: (ctx) => `/marketing-campaigns/campaigns/${ctx.campaignId}`,
        isCleanup: true,
      },
    ],
  },
  // 3. Контент-заказы: POST→GET→PUT→DELETE
  {
    id: 'crud_content', label: 'Контент-заказы', icon: FileText, color: 'indigo',
    steps: [
      {
        id: 'crud_cnt_1', name: 'Создать заказ', method: 'POST',
        pathFn: () => '/api/content-orders/orders',
        bodyFn: () => ({
          venueId: 'venue-1', venueName: 'Тест Площадка', contentType: 'jingles',
          text: 'Автоматический тест CRUD-цикла системного теста проекта',
          style: 'energetic', duration: 30, voiceType: 'male', price: 1500,
        }),
        extractFn: (data, ctx) => { ctx.orderId = data?.order?.id; },
      },
      {
        id: 'crud_cnt_2', name: 'Прочитать заказ', method: 'GET',
        pathFn: (ctx) => `/api/content-orders/orders/${ctx.orderId}`,
      },
      {
        id: 'crud_cnt_3', name: 'Обновить заказ', method: 'PUT',
        pathFn: (ctx) => `/api/content-orders/orders/${ctx.orderId}`,
        bodyFn: () => ({ status: 'in_progress', notes: 'CRUD-тест прошёл' }),
        headersFn: () => ({ 'X-User-Id': 'admin-1' }),
      },
      {
        id: 'crud_cnt_4', name: 'Удалить заказ', method: 'DELETE',
        pathFn: (ctx) => `/api/content-orders/orders/${ctx.orderId}`,
        headersFn: () => ({ 'X-User-Id': 'admin-1' }),
        isCleanup: true,
      },
    ],
  },
  // 4. DJ Ивенты: POST→GET→PUT→DELETE
  {
    id: 'crud_dj_events', label: 'DJ Ивенты', icon: Music, color: 'sky',
    steps: [
      {
        id: 'crud_dje_1', name: 'Создать ивент', method: 'POST',
        pathFn: () => '/api/dj-studio/events',
        bodyFn: () => ({
          title: `[TEST] DJ Ивент ${TS()}`, type: 'club',
          venue: 'Тест Клуб', city: 'Москва', date: '2026-03-15',
          fee: 50000, status: 'confirmed',
        }),
        headersFn: () => ({ 'X-User-Id': 'dj-1' }),
        extractFn: (data, ctx) => { ctx.eventId = data?.data?.id; },
      },
      {
        id: 'crud_dje_2', name: 'Прочитать ивент', method: 'GET',
        pathFn: (ctx) => `/api/dj-studio/events/${ctx.eventId}`,
        headersFn: () => ({ 'X-User-Id': 'dj-1' }),
      },
      {
        id: 'crud_dje_3', name: 'Обновить ивент', method: 'PUT',
        pathFn: (ctx) => `/api/dj-studio/events/${ctx.eventId}`,
        bodyFn: () => ({ fee: 75000, notes: 'Обновлено CRUD-тестом' }),
        headersFn: () => ({ 'X-User-Id': 'dj-1' }),
      },
      {
        id: 'crud_dje_4', name: 'Удалить ивент', method: 'DELETE',
        pathFn: (ctx) => `/api/dj-studio/events/${ctx.eventId}`,
        headersFn: () => ({ 'X-User-Id': 'dj-1' }),
        isCleanup: true,
      },
    ],
  },
  // 5. Маркетплейс биты: POST→PUT→DELETE
  {
    id: 'crud_beats', label: 'Маркетплейс - биты', icon: Globe, color: 'yellow',
    steps: [
      {
        id: 'crud_bt_1', name: 'Создать бит', method: 'POST',
        pathFn: () => '/api/marketplace/beats',
        bodyFn: () => ({
          producerId: 'producer-1', producer: 'Тест Продюсер',
          title: `[TEST] Beat ${TS()}`, genre: 'Hip-Hop', bpm: 140, key: 'Am', price: 2500,
          tags: ['test', 'crud'], duration: '3:30',
        }),
        extractFn: (data, ctx) => { ctx.beatId = data?.data?.id; },
      },
      {
        id: 'crud_bt_2', name: 'Прочитать бит', method: 'GET',
        pathFn: (ctx) => `/api/marketplace/beats/${ctx.beatId}`,
      },
      {
        id: 'crud_bt_3', name: 'Обновить бит', method: 'PUT',
        pathFn: (ctx) => `/api/marketplace/beats/${ctx.beatId}`,
        bodyFn: () => ({ producerId: 'producer-1', price: 3500, title: '[TEST] Beat Updated' }),
      },
      {
        id: 'crud_bt_4', name: 'Удалить бит', method: 'DELETE',
        pathFn: (ctx) => `/api/marketplace/beats/${ctx.beatId}?producerId=producer-1`,
        isCleanup: true,
      },
    ],
  },
  // 6. Радио рекламные слоты: POST→PUT→DELETE
  {
    id: 'crud_radio_slots', label: 'Радио - рекламные слоты', icon: Radio, color: 'purple',
    steps: [
      {
        id: 'crud_rsl_1', name: 'Создать слот', method: 'POST',
        pathFn: () => '/api/radio/ad-slots/create',
        bodyFn: () => ({
          slotType: 'premium', timeSlot: '20:00-21:00', price: 15000,
          duration: 60, maxPerHour: 2, description: '[TEST] CRUD-тестовый слот',
        }),
        headersFn: () => ({ 'X-User-Id': 'radio-1' }),
        extractFn: (data, ctx) => { ctx.slotId = data?.adSlot?.id; },
      },
      {
        id: 'crud_rsl_2', name: 'Обновить слот', method: 'PUT',
        pathFn: (ctx) => `/api/radio/ad-slots/${ctx.slotId}`,
        bodyFn: () => ({ price: 20000, description: '[TEST] Обновлённый слот' }),
        headersFn: () => ({ 'X-User-Id': 'radio-1' }),
      },
      {
        id: 'crud_rsl_3', name: 'Удалить слот', method: 'DELETE',
        pathFn: (ctx) => `/api/radio/ad-slots/${ctx.slotId}`,
        headersFn: () => ({ 'X-User-Id': 'radio-1' }),
        isCleanup: true,
      },
    ],
  },
  // 7. Очередь агентов: POST→DELETE
  {
    id: 'crud_agents_queue', label: 'Очередь агентов', icon: Layers, color: 'violet',
    steps: [
      {
        id: 'crud_aq_1', name: 'Добавить задачу', method: 'POST',
        pathFn: () => '/api/agents/queue',
        bodyFn: () => ({ task: `[TEST] Задача CRUD-теста ${TS()}`, priority: 'low' }),
        extractFn: (data, ctx) => { ctx.queueItemId = data?.item?.id; },
      },
      {
        id: 'crud_aq_2', name: 'Проверить очередь', method: 'GET',
        pathFn: () => '/api/agents/queue',
      },
      {
        id: 'crud_aq_3', name: 'Удалить задачу', method: 'DELETE',
        pathFn: (ctx) => `/api/agents/queue/${ctx.queueItemId}`,
        isCleanup: true,
      },
    ],
  },
  // 8. Venue плейлисты: POST→PUT→DELETE
  {
    id: 'crud_venue_playlists', label: 'Площадки - плейлисты', icon: MapPin, color: 'lime',
    steps: [
      {
        id: 'crud_vpl_1', name: 'Создать плейлист', method: 'POST',
        pathFn: () => '/api/venue/playlists',
        bodyFn: () => ({
          title: `[TEST] Плейлист ${TS()}`, description: 'CRUD-тест',
          trackCount: 10, totalDuration: 2400, isPublic: false, status: 'draft',
        }),
        headersFn: () => ({ 'X-User-Id': 'venue-1' }),
        extractFn: (data, ctx) => { ctx.playlistId = data?.playlist?.id; },
      },
      {
        id: 'crud_vpl_2', name: 'Обновить плейлист', method: 'PUT',
        pathFn: (ctx) => `/api/venue/playlists/${ctx.playlistId}`,
        bodyFn: () => ({ title: '[TEST] Обновлённый плейлист', status: 'active' }),
        headersFn: () => ({ 'X-User-Id': 'venue-1' }),
      },
      {
        id: 'crud_vpl_3', name: 'Удалить плейлист', method: 'DELETE',
        pathFn: (ctx) => `/api/venue/playlists/${ctx.playlistId}`,
        headersFn: () => ({ 'X-User-Id': 'venue-1' }),
        isCleanup: true,
      },
    ],
  },
  // 9. Публикации: POST→GET→PUT→DELETE
  {
    id: 'crud_publish', label: 'Публикации (дистрибуция)', icon: FileText, color: 'teal',
    steps: [
      {
        id: 'crud_pub_1', name: 'Создать заказ', method: 'POST',
        pathFn: () => '/api/publish/orders',
        bodyFn: () => ({
          userId: 'artist-1', artistName: 'Тест Артист', trackTitle: `[TEST] Трек ${TS()}`,
          releaseType: 'single', platforms: ['vk_music', 'yandex'],
          genre: 'pop', releaseDate: '2026-04-01',
        }),
        headersFn: () => ({ 'X-User-Id': 'artist-1' }),
        extractFn: (data, ctx) => { ctx.publishId = data?.order?.id; },
      },
      {
        id: 'crud_pub_2', name: 'Прочитать заказ', method: 'GET',
        pathFn: (ctx) => `/api/publish/orders/${ctx.publishId}`,
        headersFn: () => ({ 'X-User-Id': 'artist-1' }),
      },
      {
        id: 'crud_pub_3', name: 'Обновить заказ', method: 'PUT',
        pathFn: (ctx) => `/api/publish/orders/${ctx.publishId}`,
        bodyFn: () => ({ trackTitle: '[TEST] Обновлённый трек', genre: 'rock' }),
        headersFn: () => ({ 'X-User-Id': 'artist-1' }),
      },
      {
        id: 'crud_pub_4', name: 'Удалить заказ', method: 'DELETE',
        pathFn: (ctx) => `/api/publish/orders/${ctx.publishId}`,
        headersFn: () => ({ 'X-User-Id': 'artist-1' }),
        isCleanup: true,
      },
    ],
  },
  // 10. Email подписки: GET→PUT (update cycle - нет delete)
  {
    id: 'crud_email', label: 'Email настройки (цикл обновления)', icon: Send, color: 'amber',
    steps: [
      {
        id: 'crud_eml_1', name: 'Прочитать настройки', method: 'GET',
        pathFn: () => '/email/subscriptions/admin-1',
        extractFn: (data, ctx) => { ctx.origEmail = data; },
      },
      {
        id: 'crud_eml_2', name: 'Обновить настройки', method: 'PUT',
        pathFn: () => '/email/subscriptions/admin-1',
        bodyFn: () => ({
          marketing: false, system: true, news: false, promotions: false,
        }),
      },
      {
        id: 'crud_eml_3', name: 'Восстановить настройки', method: 'PUT',
        pathFn: () => '/email/subscriptions/admin-1',
        bodyFn: (ctx) => ctx.origEmail?.subscriptions || { marketing: true, system: true, news: true, promotions: true },
        isCleanup: true,
      },
    ],
  },
];

// Build groups from CRUD cycles for unified rendering
const CRUD_GROUPS: TestGroup[] = CRUD_CYCLES.map(cycle => ({
  id: cycle.id,
  label: `CRUD: ${cycle.label}`,
  icon: cycle.icon,
  color: cycle.color,
  phase: 'crud' as TestPhase,
  tests: cycle.steps.map(s => ({
    id: s.id, name: s.name, method: s.method,
    path: typeof s.pathFn === 'function' ? s.pathFn({}) : '?',
  })),
}));

const ALL_GROUPS = [...READ_GROUPS, ...CRUD_GROUPS];
const TOTAL_READ = READ_GROUPS.reduce((s, g) => s + g.tests.length, 0);
const TOTAL_CRUD = CRUD_CYCLES.reduce((s, c) => s + c.steps.length, 0);
const TOTAL_TESTS = TOTAL_READ + TOTAL_CRUD;

// ─── Color utilities ───
function gcl(color: string, v: 'bg' | 'text' | 'border' | 'glow'): string {
  const m: Record<string, Record<string, string>> = {
    emerald:  { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
    blue:     { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
    violet:   { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30', glow: 'shadow-violet-500/20' },
    pink:     { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', glow: 'shadow-pink-500/20' },
    amber:    { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
    teal:     { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', glow: 'shadow-teal-500/20' },
    green:    { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', glow: 'shadow-green-500/20' },
    orange:   { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' },
    cyan:     { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
    indigo:   { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/20' },
    purple:   { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' },
    lime:     { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/30', glow: 'shadow-lime-500/20' },
    rose:     { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' },
    sky:      { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30', glow: 'shadow-sky-500/20' },
    fuchsia:  { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', glow: 'shadow-fuchsia-500/20' },
    yellow:   { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20' },
    slate:    { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', glow: 'shadow-slate-500/20' },
    red:      { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-red-500/20' },
    neutral:  { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', glow: 'shadow-gray-500/20' },
  };
  return m[color]?.[v] || m.neutral[v];
}

function StatusIcon({ status, className = 'w-4 h-4' }: { status: TestStatus; className?: string }) {
  switch (status) {
    case 'pass': return <CheckCircle className={`${className} text-emerald-400`} />;
    case 'fail': return <XCircle className={`${className} text-red-400`} />;
    case 'warn': return <AlertTriangle className={`${className} text-amber-400`} />;
    case 'skip': return <AlertTriangle className={`${className} text-gray-500`} />;
    case 'running': return <div className={`${className} border-2 border-blue-400 border-t-transparent rounded-full animate-spin`} />;
    default: return <Clock className={`${className} text-gray-600`} />;
  }
}

function MethodBadge({ method }: { method: string }) {
  const c: Record<string, string> = {
    GET: 'bg-emerald-500/20 text-emerald-400', POST: 'bg-blue-500/20 text-blue-400',
    PUT: 'bg-amber-500/20 text-amber-400', DELETE: 'bg-red-500/20 text-red-400',
    PATCH: 'bg-violet-500/20 text-violet-400',
  };
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${c[method] || 'bg-gray-500/20 text-gray-400'}`}>{method}</span>;
}

function PhaseBadge({ phase }: { phase: TestPhase }) {
  return phase === 'crud' ? (
    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-300 border border-orange-500/20">CRUD</span>
  ) : null;
}

// ─── Main component ───
export function SystemTestSuite() {
  const [results, setResults] = useState<Map<string, TestResult>>(new Map());
  const [running, setRunning] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<TestStatus | 'all'>('all');
  const [filterPhase, setFilterPhase] = useState<TestPhase | 'all'>('all');
  // We no longer use a shared AbortController.  Instead, each request gets
  // its own controller with a per-request timeout.  Stopping the suite just
  // sets `stoppingRef` – running requests finish naturally instead of being
  // hard-aborted (which would cause "connection closed" on the server).
  const stoppingRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const REQUEST_TIMEOUT = 15_000; // per-request timeout
  const BATCH_GAP_MS = 80;       // breathing room between batches

  // Counters
  const allResults = Array.from(results.values());
  const pass = allResults.filter(r => r.status === 'pass').length;
  const fail = allResults.filter(r => r.status === 'fail').length;
  const warn = allResults.filter(r => r.status === 'warn').length;
  const skip = allResults.filter(r => r.status === 'skip').length;
  const done = pass + fail + warn + skip;
  const progress = TOTAL_TESTS > 0 ? (done / TOTAL_TESTS) * 100 : 0;
  const score = done > 0 ? Math.round(((pass + warn * 0.5) / done) * 100) : 0;

  const crudPass = allResults.filter(r => r.phase === 'crud' && r.status === 'pass').length;
  const crudFail = allResults.filter(r => r.phase === 'crud' && r.status === 'fail').length;
  const crudTotal = allResults.filter(r => r.phase === 'crud').length;

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ─── Execute a single simple test (own AbortController with timeout) ───
  const runSingleTest = useCallback(async (test: TestDef, phase: TestPhase): Promise<TestResult> => {
    if (test.skip) {
      return { id: test.id, name: test.name, method: test.method, path: test.path, status: 'skip', ms: 0, statusCode: null, error: test.skipReason || 'Пропущен', phase };
    }
    if (stoppingRef.current) {
      return { id: test.id, name: test.name, method: test.method, path: test.path, status: 'skip', ms: 0, statusCode: null, error: 'Остановлен', phase };
    }
    // Each request gets its OWN AbortController with a timeout.
    // This avoids hard-aborting mid-response (which causes the Deno error).
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT);
    const t0 = performance.now();
    try {
      const url = `${BASE}${test.path}`;
      const fetchHeaders: Record<string, string> = { ...hdrs, ...test.headers };
      const opts: RequestInit = { method: test.method, headers: fetchHeaders, signal: ac.signal };
      if (test.body && test.method !== 'GET') opts.body = JSON.stringify(test.body);
      const res = await fetch(url, opts);
      const ms = Math.round(performance.now() - t0);
      // Always drain the body to cleanly close the connection
      if (res.ok) {
        try { await res.text(); } catch { /* drain */ }
        return { id: test.id, name: test.name, method: test.method, path: test.path, status: 'pass', ms, statusCode: res.status, error: null, phase };
      }
      if (test.allowEmpty && (res.status === 404 || res.status === 401)) {
        try { await res.text(); } catch { /* drain */ }
        return { id: test.id, name: test.name, method: test.method, path: test.path, status: 'warn', ms, statusCode: res.status, error: `${res.status} - допустимо`, phase };
      }
      let errMsg = `HTTP ${res.status}`;
      try { const b = await res.text(); errMsg = `${res.status}: ${b.slice(0, 200)}`; } catch { /* */ }
      if (res.status >= 500)
        return { id: test.id, name: test.name, method: test.method, path: test.path, status: 'fail', ms, statusCode: res.status, error: errMsg, phase };
      return { id: test.id, name: test.name, method: test.method, path: test.path, status: 'warn', ms, statusCode: res.status, error: errMsg, phase };
    } catch (err: unknown) {
      const ms = Math.round(performance.now() - t0);
      if (ac.signal.aborted) return { id: test.id, name: test.name, method: test.method, path: test.path, status: 'warn', ms, statusCode: null, error: 'Таймаут (15с)', phase };
      return { id: test.id, name: test.name, method: test.method, path: test.path, status: 'fail', ms, statusCode: null, error: String(err), phase };
    } finally {
      clearTimeout(timer);
    }
  }, []);

  // ─── Execute a CRUD cycle sequentially (per-step timeouts) ───
  const runCrudCycle = useCallback(async (
    cycle: CrudCycleDef,
    onStepResult: (r: TestResult) => void
  ) => {
    const ctx: CrudCtx = {};
    let chainBroken = false;

    for (let i = 0; i < cycle.steps.length; i++) {
      const step = cycle.steps[i];

      // If user clicked stop and this isn't a cleanup step, skip
      if (stoppingRef.current && !step.isCleanup) {
        onStepResult({ id: step.id, name: step.name, method: step.method, path: '?', status: 'skip', ms: 0, statusCode: null, error: 'Остановлен', phase: 'crud' });
        continue;
      }

      // If chain is broken and this is not a cleanup step, skip
      if (chainBroken && !step.isCleanup) {
        onStepResult({ id: step.id, name: step.name, method: step.method, path: '?', status: 'skip', ms: 0, statusCode: null, error: 'Пропущен (предыдущий шаг не прошёл)', phase: 'crud' });
        continue;
      }

      // Mark as running
      onStepResult({ id: step.id, name: step.name, method: step.method, path: '...', status: 'running', ms: 0, statusCode: null, error: null, phase: 'crud' });

      // Each step gets its own controller with timeout
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT);
      const t0 = performance.now();
      let resolvedPath = '?';
      try {
        resolvedPath = step.pathFn(ctx);
        const url = `${BASE}${resolvedPath}`;
        const extraHeaders = step.headersFn ? step.headersFn(ctx) : {};
        const fetchHeaders: Record<string, string> = { ...hdrs, ...extraHeaders };
        const opts: RequestInit = { method: step.method, headers: fetchHeaders, signal: ac.signal };
        if (step.bodyFn && step.method !== 'GET') {
          opts.body = JSON.stringify(step.bodyFn(ctx));
        }

        const res = await fetch(url, opts);
        const ms = Math.round(performance.now() - t0);

        if (res.ok) {
          let data: any = null;
          try { data = await res.json(); } catch { /* */ }
          if (step.extractFn && data) step.extractFn(data, ctx);
          onStepResult({ id: step.id, name: step.name, method: step.method, path: resolvedPath, status: 'pass', ms, statusCode: res.status, error: null, phase: 'crud' });
        } else {
          let errMsg = `HTTP ${res.status}`;
          try { const b = await res.text(); errMsg = `${res.status}: ${b.slice(0, 200)}`; } catch { /* */ }

          if (step.allowEmpty && (res.status === 404 || res.status === 401)) {
            onStepResult({ id: step.id, name: step.name, method: step.method, path: resolvedPath, status: 'warn', ms, statusCode: res.status, error: errMsg, phase: 'crud' });
          } else {
            onStepResult({ id: step.id, name: step.name, method: step.method, path: resolvedPath, status: 'fail', ms, statusCode: res.status, error: errMsg, phase: 'crud' });
            if (!step.isCleanup) chainBroken = true;
          }
        }
      } catch (err: unknown) {
        const ms = Math.round(performance.now() - t0);
        if (ac.signal.aborted) {
          onStepResult({ id: step.id, name: step.name, method: step.method, path: resolvedPath, status: 'warn', ms, statusCode: null, error: 'Таймаут (15с)', phase: 'crud' });
          if (!step.isCleanup) chainBroken = true;
        } else {
          onStepResult({ id: step.id, name: step.name, method: step.method, path: resolvedPath, status: 'fail', ms, statusCode: null, error: String(err), phase: 'crud' });
          if (!step.isCleanup) chainBroken = true;
        }
      } finally {
        clearTimeout(timer);
      }
    }
  }, []);

  // ─── Run all tests ───
  const runAllTests = useCallback(async () => {
    stoppingRef.current = false;
    setRunning(true);
    setResults(new Map());
    setElapsed(0);
    startTimeRef.current = performance.now();
    setExpandedGroups(new Set(ALL_GROUPS.map(g => g.id)));

    timerRef.current = setInterval(() => {
      setElapsed(Math.round((performance.now() - startTimeRef.current) / 1000));
    }, 500);

    // ── Phase 1: Read-only tests (parallel batches with breathing room) ──
    for (const group of READ_GROUPS) {
      if (stoppingRef.current) break;
      setResults(prev => {
        const next = new Map(prev);
        for (const t of group.tests) next.set(t.id, { id: t.id, name: t.name, method: t.method, path: t.path, status: 'running', ms: 0, statusCode: null, error: null, phase: 'read' });
        return next;
      });
      const batchSize = 4;
      for (let i = 0; i < group.tests.length; i += batchSize) {
        if (stoppingRef.current) break;
        const batch = group.tests.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(t => runSingleTest(t, 'read')));
        setResults(prev => { const next = new Map(prev); for (const r of batchResults) next.set(r.id, r); return next; });
        // Small gap between batches to prevent overwhelming the server
        if (i + batchSize < group.tests.length) {
          await new Promise(r => setTimeout(r, BATCH_GAP_MS));
        }
      }
    }

    // ── Phase 2: CRUD cycles (sequential within each cycle) ──
    for (const cycle of CRUD_CYCLES) {
      if (stoppingRef.current) break;
      setResults(prev => {
        const next = new Map(prev);
        for (const s of cycle.steps) next.set(s.id, { id: s.id, name: s.name, method: s.method, path: '...', status: 'running', ms: 0, statusCode: null, error: null, phase: 'crud' });
        return next;
      });

      await runCrudCycle(cycle, (r) => {
        setResults(prev => { const next = new Map(prev); next.set(r.id, r); return next; });
      });

      // Small gap between CRUD cycles
      if (!stoppingRef.current) {
        await new Promise(r => setTimeout(r, BATCH_GAP_MS));
      }
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setElapsed(Math.round((performance.now() - startTimeRef.current) / 1000));
    setRunning(false);
  }, [runSingleTest, runCrudCycle]);

  // Graceful stop: sets a flag so the next batch/step is skipped.
  // Running requests finish naturally — no hard abort.
  const stopTests = useCallback(() => {
    stoppingRef.current = true;
    // Timer and running state are cleaned up when runAllTests' loop exits
  }, []);
  const reset = useCallback(() => { setResults(new Map()); setElapsed(0); setExpandedGroups(new Set()); setFilterStatus('all'); setFilterPhase('all'); }, []);

  const scoreColor = score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : score >= 50 ? 'text-orange-400' : 'text-red-400';
  const scoreGlow = score >= 90 ? 'shadow-emerald-500/30' : score >= 70 ? 'shadow-amber-500/30' : score >= 50 ? 'shadow-orange-500/30' : 'shadow-red-500/30';
  const scoreBorder = score >= 90 ? 'border-emerald-500/40' : score >= 70 ? 'border-amber-500/40' : score >= 50 ? 'border-orange-500/40' : 'border-red-500/40';
  const scoreLabel = score >= 90 ? 'Готово к продакшену' : score >= 70 ? 'Требует внимания' : score >= 50 ? 'Есть проблемы' : 'Не готово';

  return (
    <div className="max-w-6xl mx-auto space-y-4 xs:space-y-5 sm:space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 xs:gap-4">
        <div>
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-lg xs:rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/30 border border-red-500/30 flex items-center justify-center">
              <Server className="w-4 h-4 xs:w-5 xs:h-5 text-red-400" />
            </div>
            <div>
              <div className="text-white font-bold text-base xs:text-lg sm:text-xl">Системный тест</div>
              <div className="text-gray-400 text-[10px] xs:text-xs">{TOTAL_READ} read + {TOTAL_CRUD} CRUD шагов = {TOTAL_TESTS} тестов</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!running ? (
            <div role="button" tabIndex={0} onClick={runAllTests} onKeyDown={(e) => { if (e.key === 'Enter') runAllTests(); }}
              className="flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 rounded-lg xs:rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-xs xs:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-500/25">
              <Play className="w-3.5 h-3.5 xs:w-4 xs:h-4" /> Запустить все
            </div>
          ) : (
            <div role="button" tabIndex={0} onClick={stopTests} onKeyDown={(e) => { if (e.key === 'Enter') stopTests(); }}
              className="flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 rounded-lg xs:rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold text-xs xs:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-red-500/25">
              <Pause className="w-3.5 h-3.5 xs:w-4 xs:h-4" /> Остановить
            </div>
          )}
          {done > 0 && !running && (
            <div role="button" tabIndex={0} onClick={reset} onKeyDown={(e) => { if (e.key === 'Enter') reset(); }}
              className="flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg xs:rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs xs:text-sm hover:bg-white/10 transition-all cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5 xs:w-4 xs:h-4" /> Сбросить
            </div>
          )}
        </div>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 xs:gap-3">
        <div className={`col-span-2 p-3 xs:p-4 rounded-xl xs:rounded-2xl backdrop-blur-md bg-white/5 border ${done > 0 ? scoreBorder : 'border-white/10'} ${done > 0 ? `shadow-lg ${scoreGlow}` : ''}`}>
          <div className="text-gray-400 text-[10px] xs:text-xs mb-1">Готовность</div>
          <div className={`font-black text-3xl xs:text-4xl sm:text-5xl leading-none ${done > 0 ? scoreColor : 'text-gray-600'}`}>
            {done > 0 ? `${score}%` : '-'}
          </div>
          {done > 0 && <div className={`text-[10px] xs:text-xs mt-1 ${scoreColor}`}>{scoreLabel}</div>}
        </div>
        <div className="p-3 xs:p-4 rounded-xl xs:rounded-2xl backdrop-blur-md bg-white/5 border border-white/10">
          <div className="text-gray-400 text-[10px] xs:text-xs mb-1">Прогресс</div>
          <div className="text-white font-bold text-lg xs:text-xl sm:text-2xl">{done}/{TOTAL_TESTS}</div>
          {running && <div className="text-blue-400 text-[10px] xs:text-xs">Выполняется...</div>}
        </div>
        <div className="p-3 xs:p-4 rounded-xl xs:rounded-2xl backdrop-blur-md bg-emerald-500/5 border border-emerald-500/20">
          <div className="text-emerald-400/60 text-[10px] xs:text-xs mb-1">Успешно</div>
          <div className="text-emerald-400 font-bold text-lg xs:text-xl sm:text-2xl">{pass}</div>
        </div>
        <div className="p-3 xs:p-4 rounded-xl xs:rounded-2xl backdrop-blur-md bg-red-500/5 border border-red-500/20">
          <div className="text-red-400/60 text-[10px] xs:text-xs mb-1">Ошибки</div>
          <div className="text-red-400 font-bold text-lg xs:text-xl sm:text-2xl">{fail}</div>
        </div>
        <div className="p-3 xs:p-4 rounded-xl xs:rounded-2xl backdrop-blur-md bg-amber-500/5 border border-amber-500/20">
          <div className="text-amber-400/60 text-[10px] xs:text-xs mb-1">Предупр.</div>
          <div className="text-amber-400 font-bold text-lg xs:text-xl sm:text-2xl">{warn}</div>
        </div>
        {/* CRUD-specific counter */}
        <div className="p-3 xs:p-4 rounded-xl xs:rounded-2xl backdrop-blur-md bg-gradient-to-br from-red-500/5 to-orange-500/5 border border-orange-500/20">
          <div className="text-orange-400/60 text-[10px] xs:text-xs mb-1">CRUD циклы</div>
          <div className="text-orange-400 font-bold text-lg xs:text-xl sm:text-2xl">
            {crudTotal > 0 ? `${crudPass}/${TOTAL_CRUD}` : '-'}
          </div>
          {crudFail > 0 && <div className="text-red-400 text-[10px]">{crudFail} ошибок</div>}
        </div>
      </div>

      {/* Progress bar */}
      {(running || done > 0) && (
        <div className="relative">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-500 text-xs">{Math.round(progress)}%</span>
            <span className="text-gray-500 text-xs">{elapsed}с</span>
          </div>
        </div>
      )}

      {/* Filters */}
      {done > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          {/* Phase filter */}
          {(['all', 'read', 'crud'] as const).map(f => (
            <div key={`ph-${f}`} role="button" tabIndex={0} onClick={() => setFilterPhase(f)}
              onKeyDown={(e) => { if (e.key === 'Enter') setFilterPhase(f); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${filterPhase === f ? 'bg-white/15 text-white border border-white/20' : 'bg-white/5 text-gray-500 hover:text-gray-300 border border-transparent'}`}>
              {f === 'all' ? 'Все фазы' : f === 'read' ? `Read (${TOTAL_READ})` : `CRUD (${TOTAL_CRUD})`}
            </div>
          ))}
          <div className="w-px h-4 bg-white/10" />
          {/* Status filter */}
          {(['all', 'pass', 'fail', 'warn', 'skip'] as const).map(f => (
            <div key={`st-${f}`} role="button" tabIndex={0} onClick={() => setFilterStatus(f)}
              onKeyDown={(e) => { if (e.key === 'Enter') setFilterStatus(f); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${filterStatus === f ? 'bg-white/15 text-white border border-white/20' : 'bg-white/5 text-gray-500 hover:text-gray-300 border border-transparent'}`}>
              {f === 'all' ? `Все (${done})` : f === 'pass' ? `${pass}` : f === 'fail' ? `${fail}` : f === 'warn' ? `${warn}` : `${skip}`}
            </div>
          ))}
        </div>
      )}

      {/* Phase 2 separator (only when we have results) */}
      {done > 0 && filterPhase !== 'read' && (
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-orange-500/20">
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-300 text-xs font-semibold">CRUD-циклы</span>
            <span className="text-gray-500 text-[10px]">POST → GET → PUT → DELETE с cleanup</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-orange-500/20 to-transparent" />
        </div>
      )}

      {/* Test groups */}
      <div className="space-y-2 xs:space-y-3">
        {ALL_GROUPS.map(group => {
          // Phase filter
          if (filterPhase !== 'all' && group.phase !== filterPhase) return null;

          const Icon = group.icon;
          const groupResults = group.tests.map(t => results.get(t.id)).filter(Boolean) as TestResult[];
          const gPass = groupResults.filter(r => r.status === 'pass').length;
          const gFail = groupResults.filter(r => r.status === 'fail').length;
          const gWarn = groupResults.filter(r => r.status === 'warn').length;
          const gDone = groupResults.filter(r => r.status !== 'running' && r.status !== 'idle').length;
          const gRunning = groupResults.some(r => r.status === 'running');
          const isExpanded = expandedGroups.has(group.id);

          const visibleTests = group.tests.filter(t => {
            if (filterStatus === 'all') return true;
            const r = results.get(t.id);
            return r?.status === filterStatus;
          });
          if (filterStatus !== 'all' && visibleTests.length === 0) return null;

          const gStatus: TestStatus = gRunning ? 'running' : gFail > 0 ? 'fail' : gWarn > 0 ? 'warn' : gDone === group.tests.length && gDone > 0 ? 'pass' : 'idle';

          return (
            <div key={group.id} className={`rounded-2xl backdrop-blur-md bg-white/[0.03] border ${gStatus === 'fail' ? 'border-red-500/30' : gStatus === 'pass' ? 'border-emerald-500/20' : 'border-white/10'} overflow-hidden`}>
              <div role="button" tabIndex={0} onClick={() => toggleGroup(group.id)} onKeyDown={(e) => { if (e.key === 'Enter') toggleGroup(group.id); }}
                className="flex items-center justify-between px-3 xs:px-4 py-2.5 xs:py-3 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 xs:gap-3">
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-500" />}
                  <div className={`w-7 h-7 xs:w-8 xs:h-8 rounded-lg ${gcl(group.color, 'bg')} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${gcl(group.color, 'text')}`} />
                  </div>
                  <div className="flex items-center gap-1.5 xs:gap-2">
                    <div>
                      <div className="text-white text-xs xs:text-sm font-medium">{group.label}</div>
                      <div className="text-gray-500 text-[10px] xs:text-xs">{group.tests.length} {group.phase === 'crud' ? 'шагов' : 'тестов'}</div>
                    </div>
                    <PhaseBadge phase={group.phase} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {gDone > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      {gPass > 0 && <span className="text-emerald-400">{gPass} ок</span>}
                      {gFail > 0 && <span className="text-red-400">{gFail} err</span>}
                      {gWarn > 0 && <span className="text-amber-400">{gWarn} wrn</span>}
                    </div>
                  )}
                  <StatusIcon status={gStatus} />
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="border-t border-white/5">
                      {/* CRUD chain visualization */}
                      {group.phase === 'crud' && (
                        <div className="px-4 py-1.5 bg-white/[0.02] border-b border-white/5 flex items-center gap-1 flex-wrap">
                          {group.tests.map((t, i) => {
                            const r = results.get(t.id);
                            const st = r?.status || 'idle';
                            const isCleanup = CRUD_CYCLES.find(c => c.id === group.id)?.steps[i]?.isCleanup;
                            return (
                              <div key={t.id} className="flex items-center gap-1">
                                <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  st === 'pass' ? 'bg-emerald-500/20 text-emerald-400' :
                                  st === 'fail' ? 'bg-red-500/20 text-red-400' :
                                  st === 'running' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                                  st === 'skip' ? 'bg-gray-500/10 text-gray-600' :
                                  st === 'warn' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-white/5 text-gray-600'
                                }`}>
                                  {isCleanup && <Trash2 className="w-2.5 h-2.5 inline mr-0.5" />}
                                  {t.method}
                                </div>
                                {i < group.tests.length - 1 && <span className="text-gray-600 text-[10px]">→</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {visibleTests.map(test => {
                        const r = results.get(test.id);
                        const status = r?.status || 'idle';
                        const realPath = r?.path || test.path;
                        return (
                          <div key={test.id} className={`flex items-center justify-between px-4 py-2 border-b border-white/[0.03] last:border-b-0 ${
                            status === 'fail' ? 'bg-red-500/5' : status === 'pass' ? 'bg-emerald-500/[0.02]' : ''}`}>
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <StatusIcon status={status} className="w-3.5 h-3.5 flex-shrink-0" />
                              <MethodBadge method={test.method} />
                              <span className="text-gray-300 text-xs truncate">{test.name}</span>
                              <span className="text-gray-600 text-[10px] font-mono truncate hidden sm:inline">{realPath}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                              {r?.ms !== undefined && r.ms > 0 && (
                                <span className={`text-[10px] font-mono ${r.ms > 2000 ? 'text-red-400' : r.ms > 800 ? 'text-amber-400' : 'text-gray-500'}`}>{r.ms}ms</span>
                              )}
                              {r?.statusCode && (
                                <span className={`text-[10px] font-mono ${r.statusCode >= 500 ? 'text-red-400' : r.statusCode >= 400 ? 'text-amber-400' : 'text-emerald-400/60'}`}>{r.statusCode}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {/* Error details */}
                      {visibleTests.filter(t => { const r = results.get(t.id); return r && (r.status === 'fail' || r.status === 'warn') && r.error; }).length > 0 && (
                        <div className="px-4 py-2 bg-red-500/5 border-t border-red-500/10">
                          {visibleTests.filter(t => { const r = results.get(t.id); return r && (r.status === 'fail' || r.status === 'warn') && r.error; }).map(t => {
                            const r = results.get(t.id)!;
                            return (
                              <div key={t.id} className="text-xs mb-1 last:mb-0">
                                <span className={r.status === 'fail' ? 'text-red-400' : 'text-amber-400'}>{t.name}:</span>
                                <span className="text-gray-500 ml-1 font-mono text-[10px]">{r.error?.slice(0, 150)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {done > 0 && !running && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`p-4 xs:p-5 sm:p-6 rounded-xl xs:rounded-2xl backdrop-blur-md border ${scoreBorder} ${score >= 90 ? 'bg-emerald-500/5' : score >= 70 ? 'bg-amber-500/5' : 'bg-red-500/5'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 xs:gap-4">
            <div>
              <div className={`font-bold text-sm xs:text-base sm:text-lg ${scoreColor}`}>{scoreLabel}</div>
              <div className="text-gray-400 text-xs xs:text-sm mt-1">
                {pass} из {TOTAL_TESTS} тестов пройдено за {elapsed}с - средняя латентность{' '}
                {Math.round(allResults.filter(r => r.ms > 0).reduce((s, r) => s + r.ms, 0) / Math.max(1, allResults.filter(r => r.ms > 0).length))}ms
              </div>
              {crudTotal > 0 && (
                <div className="text-gray-500 text-xs mt-1">
                  CRUD-циклы: {crudPass}/{TOTAL_CRUD} шагов пройдено, {crudFail} ошибок
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 font-medium">{pass}</span></div>
              <div className="flex items-center gap-1.5"><XCircle className="w-4 h-4 text-red-400" /><span className="text-red-400 font-medium">{fail}</span></div>
              <div className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /><span className="text-amber-400 font-medium">{warn}</span></div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
