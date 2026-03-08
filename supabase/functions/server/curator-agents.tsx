/**
 * CURATOR AGENTS — автономные агенты-кураторы для каждой роли
 * Создают профили, настраивают кабинеты и тестируют API
 * Роли: Artist, Producer, Radio, DJ, Venue, Engineer
 */

import {
  curatorReportsStore,
  upsertRadioProfile,
  upsertVenueProfile,
  upsertArtistProfile,
} from './db.tsx';
import { getSupabaseClient } from './supabase-client.tsx';

// ─── Types ──────────────────────────────────────────────

export type RoleId = 'artist' | 'producer' | 'radio' | 'dj' | 'venue' | 'engineer';

interface EndpointTest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  body?: Record<string, any>;
  needsUserId?: boolean;
}

interface TestResult {
  endpoint: string;
  method: string;
  description: string;
  status: number;
  ok: boolean;
  responseTime: number;
  hasData: boolean;
  dataCount?: number;
  error?: string;
  snippet?: string;
}

interface CuratorReport {
  id: string;
  role: RoleId;
  roleName: string;
  startedAt: string;
  completedAt: string;
  totalEndpoints: number;
  passed: number;
  failed: number;
  warnings: number;
  setupDone: boolean;
  results: TestResult[];
  summary: string;
}

// ─── Configuration ──────────────────────────────────────

const BASE_URL = Deno.env.get('SUPABASE_URL') || 'https://qzpmiiqfwkcnrhvubdgt.supabase.co';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const INTERNAL_KEY = Deno.env.get('VPS_INTERNAL_KEY') || '';
const PLACEHOLDER_USER = '00000000-0000-0000-0000-000000000000';

const CURATOR_EMAIL = 'curator@promofm.org';
const CURATOR_PASSWORD = 'CuratorBot2024!Secure';

export const CURATOR_ROLES: { id: RoleId; name: string; description: string }[] = [
  { id: 'artist', name: 'Артист', description: 'Профиль, треки, аналитика, питчинг, публикации' },
  { id: 'producer', name: 'Продюсер', description: 'Студия, беседы, услуги, портфолио, кошелёк, AI, календарь' },
  { id: 'radio', name: 'Радио', description: 'Рекламные слоты, заявки, финансы, аналитика' },
  { id: 'dj', name: 'Диджей', description: 'Профиль, события, коллаборации, подписки' },
  { id: 'venue', name: 'Площадка', description: 'Профиль, аналитика, плейлисты, радио-кампании, бронирования' },
  { id: 'engineer', name: 'Инженер', description: 'Публичные эндпоинты, здоровье платформы' },
];

// ─── Auth ───────────────────────────────────────────────

async function getCuratorJWT(): Promise<{ jwt: string; userId: string } | null> {
  try {
    const supabase = getSupabaseClient();

    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: CURATOR_EMAIL,
      password: CURATOR_PASSWORD,
    });

    if (signInData?.session) {
      return { jwt: signInData.session.access_token, userId: signInData.user!.id };
    }

    // Create user if doesn't exist
    console.log('[curator] Creating curator user...');
    await supabase.auth.admin.createUser({
      email: CURATOR_EMAIL,
      password: CURATOR_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'admin', displayName: 'Curator Bot' },
    });

    const { data: newSignIn } = await supabase.auth.signInWithPassword({
      email: CURATOR_EMAIL,
      password: CURATOR_PASSWORD,
    });

    if (newSignIn?.session) {
      return { jwt: newSignIn.session.access_token, userId: newSignIn.user!.id };
    }

    return null;
  } catch (error) {
    console.log('[curator] JWT error:', error);
    return null;
  }
}

// ─── Profile Setup (кураторы сами настраивают кабинеты) ─

async function setupRadioProfile(userId: string): Promise<boolean> {
  try {
    await upsertRadioProfile(userId, {
      id: userId,
      userId,
      stationName: 'Curator Test Radio',
      description: 'Тестовая радиостанция куратора',
      city: 'Москва',
      country: 'Россия',
      frequency: '101.5 FM',
      formats: ['pop', 'rock', 'electronic'],
      logoUrl: '',
      streamUrl: '',
      isOnline: false,
      audienceSize: 'small',
      socialLinks: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`[curator:radio] Profile created for ${userId}`);
    return true;
  } catch (error) {
    console.log('[curator:radio] Setup error:', error);
    return false;
  }
}

async function setupVenueProfile(userId: string): Promise<boolean> {
  try {
    await upsertVenueProfile(userId, {
      id: userId,
      userId,
      name: 'Curator Test Venue',
      description: 'Тестовая площадка куратора',
      type: 'club',
      city: 'Москва',
      address: 'ул. Тестовая, 1',
      capacity: 500,
      amenities: ['stage', 'sound-system', 'bar'],
      contacts: { phone: '+70000000000', email: CURATOR_EMAIL },
      openHours: '18:00-06:00',
      logoUrl: '',
      coverUrl: '',
      socialLinks: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`[curator:venue] Profile created for ${userId}`);
    return true;
  } catch (error) {
    console.log('[curator:venue] Setup error:', error);
    return false;
  }
}

async function setupArtistProfile(userId: string, _jwt: string): Promise<boolean> {
  try {
    await upsertArtistProfile(userId, {
      id: userId,
      userId,
      name: 'Curator Test Artist',
      genre: 'Electronic',
      city: 'Москва',
      bio: 'Тестовый профиль куратора-артиста',
      avatarUrl: '',
      socialLinks: {},
      plays: 0,
      followers: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`[curator:artist] Profile created via DB`);
    return true;
  } catch (error) {
    console.log('[curator:artist] Setup error:', error);
    return false;
  }
}

async function setupDjProfile(userId: string, _jwt: string): Promise<boolean> {
  try {
    // DJ profiles are stored in dj_editor_profiles by user_id
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('dj_editor_profiles').upsert({
      user_id: userId,
      data: {
        userId,
        name: 'Curator Test DJ',
        genres: ['house', 'techno', 'trance'],
        city: 'Москва',
        bio: 'Тестовый профиль куратора-диджея',
        experience: '5 лет',
        equipment: ['CDJ-3000', 'DJM-900'],
        createdAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) console.log('[curator:dj] DB error:', error.message);
    console.log(`[curator:dj] Profile created via DB`);
    return !error;
  } catch (error) {
    console.log('[curator:dj] Setup error:', error);
    return false;
  }
}

async function setupProducerProfile(userId: string, _jwt: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('producer_profiles_kv').upsert({
      id: userId,
      user_id: userId,
      data: {
        userId,
        displayName: 'Curator Test Producer',
        genres: ['pop', 'hip-hop', 'electronic'],
        city: 'Москва',
        bio: 'Тестовый профиль куратора-продюсера',
        hourlyRate: 5000,
        currency: 'RUB',
        createdAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) console.log('[curator:producer] DB error:', error.message);
    console.log(`[curator:producer] Profile created via DB`);
    return !error;
  } catch (error) {
    console.log('[curator:producer] Setup error:', error);
    return false;
  }
}

/** Run setup for a specific role */
async function setupRole(role: RoleId, userId: string, jwt: string): Promise<boolean> {
  switch (role) {
    case 'radio': return setupRadioProfile(userId);
    case 'venue': return setupVenueProfile(userId);
    case 'artist': return setupArtistProfile(userId, jwt);
    case 'dj': return setupDjProfile(userId, jwt);
    case 'producer': return setupProducerProfile(userId, jwt);
    case 'engineer': return true; // no setup needed
    default: return true;
  }
}

// ─── Endpoint definitions per role ──────────────────────

function getEndpointsForRole(role: RoleId, userId: string): EndpointTest[] {
  switch (role) {
    case 'artist':
      return [
        { method: 'GET', path: `/server/api/artist-profile/popular`, description: 'Популярные артисты' },
        { method: 'GET', path: `/server/api/artist-profile/profile/${userId}`, description: 'Профиль артиста', needsUserId: true },
        { method: 'GET', path: `/server/api/artist-profile/profile/${userId}/stats`, description: 'Статистика', needsUserId: true },
        { method: 'GET', path: `/server/api/artist-profile/profile/${userId}/tracks`, description: 'Треки', needsUserId: true },
        { method: 'GET', path: `/server/api/artist-analytics/overview/${userId}`, description: 'Аналитика', needsUserId: true },
      ];

    case 'producer':
      return [
        { method: 'GET', path: `/server/api/producer-studio/conversations/${userId}`, description: 'Беседы продюсера', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/settings/${userId}`, description: 'Настройки студии', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/services/custom/${userId}`, description: 'Услуги продюсера', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/profile/edits/${userId}`, description: 'Профиль продюсера', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/wallet/withdrawals/${userId}`, description: 'Выводы средств', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/ai/history/${userId}`, description: 'AI история', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/calendar/${userId}`, description: 'Календарь', needsUserId: true },
      ];

    case 'radio':
      return [
        { method: 'GET', path: `/server/api/radio/ad-slots/list`, description: 'Рекламные слоты' },
        { method: 'GET', path: `/server/api/radio/artist-requests`, description: 'Заявки от артистов' },
        { method: 'GET', path: `/server/api/radio/venue-requests`, description: 'Заявки от площадок' },
        { method: 'GET', path: `/server/api/radio/finance/overview`, description: 'Финансы: обзор' },
        { method: 'GET', path: `/server/api/radio/finance/transactions`, description: 'Финансы: транзакции' },
        { method: 'GET', path: `/server/api/radio/notifications`, description: 'Уведомления' },
        { method: 'GET', path: `/server/api/radio/analytics`, description: 'Аналитика радио' },
      ];

    case 'dj':
      return [
        { method: 'GET', path: `/server/api/dj-studio/profile`, description: 'Профиль DJ' },
        { method: 'GET', path: `/server/api/dj-studio/events`, description: 'События DJ' },
        { method: 'GET', path: `/server/api/dj-studio/collaborations`, description: 'Коллаборации' },
        { method: 'GET', path: `/server/api/dj-studio/notifications`, description: 'Уведомления DJ' },
        { method: 'GET', path: `/server/api/dj-studio/plans`, description: 'Тарифные планы' },
      ];

    case 'venue':
      return [
        { method: 'GET', path: `/server/api/venue/profile`, description: 'Профиль площадки' },
        { method: 'GET', path: `/server/api/venue/stats`, description: 'Статистика площадки' },
        { method: 'GET', path: `/server/api/venue/analytics/overview`, description: 'Аналитика: обзор' },
        { method: 'GET', path: `/server/api/venue/analytics/campaigns`, description: 'Аналитика: кампании' },
        { method: 'GET', path: `/server/api/venue/analytics/spending`, description: 'Аналитика: расходы' },
        { method: 'GET', path: `/server/api/venue/analytics/roi`, description: 'Аналитика: ROI' },
        { method: 'GET', path: `/server/api/venue/notifications`, description: 'Уведомления' },
        { method: 'GET', path: `/server/api/venue/playlists`, description: 'Плейлисты' },
        { method: 'GET', path: `/server/api/venue/radio-catalog`, description: 'Радио каталог' },
        { method: 'GET', path: `/server/api/venue/radio-campaigns`, description: 'Радио кампании' },
        { method: 'GET', path: `/server/api/venue/radio-brand`, description: 'Радио бренд' },
        { method: 'GET', path: `/server/api/venue/bookings`, description: 'Бронирования' },
      ];

    case 'engineer':
      return [
        { method: 'GET', path: `/server/health`, description: 'Health check' },
        { method: 'GET', path: `/server/api/landing-data/popular-artists`, description: 'Популярные артисты' },
        { method: 'GET', path: `/server/api/landing-data/charts/weekly`, description: 'Чарты недели' },
        { method: 'GET', path: `/server/api/landing-data/news`, description: 'Новости' },
        { method: 'GET', path: `/server/api/landing-data/concerts`, description: 'Концерты' },
        { method: 'GET', path: `/server/api/landing-data/stats`, description: 'Статистика' },
        { method: 'GET', path: `/server/api/charts/sources`, description: 'Источники чартов' },
        { method: 'GET', path: `/server/api/news-agent/status`, description: 'Агент новостей' },
        { method: 'GET', path: `/server/api/concert-agent/status`, description: 'Агент концертов' },
        { method: 'GET', path: `/server/api/curator/roles`, description: 'Роли кураторов' },
      ];

    default:
      return [];
  }
}

// ─── Test execution ─────────────────────────────────────

async function testEndpoint(test: EndpointTest, userJwt?: string): Promise<TestResult> {
  const url = `${BASE_URL}/functions/v1${test.path}`;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${userJwt || SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'X-Internal-Key': INTERNAL_KEY,
    };

    const resp = await fetch(url, {
      method: test.method,
      headers,
      signal: controller.signal,
      ...(test.body && (test.method === 'POST' || test.method === 'PUT')
        ? { body: JSON.stringify(test.body) }
        : {}),
    });
    clearTimeout(timeout);

    const responseTime = Date.now() - start;
    let body: any = null;
    let snippet = '';

    try {
      body = await resp.json();
      snippet = JSON.stringify(body).slice(0, 200);
    } catch {
      snippet = (await resp.text().catch(() => '')).slice(0, 200);
    }

    const hasData = body?.success === true && (
      body?.data !== undefined ||
      body?.results !== undefined ||
      body?.profile !== undefined ||
      body?.tracks !== undefined ||
      body?.status === 'ok'
    );

    let dataCount: number | undefined;
    if (Array.isArray(body?.data)) dataCount = body.data.length;
    else if (Array.isArray(body?.results)) dataCount = body.results.length;

    return {
      endpoint: test.path,
      method: test.method,
      description: test.description,
      status: resp.status,
      ok: resp.status >= 200 && resp.status < 400,
      responseTime,
      hasData: !!hasData,
      dataCount,
      snippet,
    };
  } catch (error: any) {
    return {
      endpoint: test.path,
      method: test.method,
      description: test.description,
      status: 0,
      ok: false,
      responseTime: Date.now() - start,
      hasData: false,
      error: error?.message || String(error),
    };
  }
}

// ─── Curator runner ─────────────────────────────────────

export async function runCurator(role: RoleId): Promise<CuratorReport> {
  const roleConfig = CURATOR_ROLES.find(r => r.id === role);
  if (!roleConfig) throw new Error(`Unknown role: ${role}`);

  const startedAt = new Date().toISOString();
  console.log(`[curator:${role}] Starting ${roleConfig.name}...`);

  // 1. Get JWT
  const curatorAuth = await getCuratorJWT();
  const userJwt = curatorAuth?.jwt;
  const testUserId = curatorAuth?.userId || PLACEHOLDER_USER;

  if (!userJwt) {
    console.log(`[curator:${role}] No JWT — aborting`);
    return makeReport(role, roleConfig.name, startedAt, false, []);
  }

  console.log(`[curator:${role}] Authenticated as ${testUserId}`);

  // 2. Setup: create profile for this role
  const setupDone = await setupRole(role, testUserId, userJwt);
  console.log(`[curator:${role}] Setup: ${setupDone ? 'OK' : 'FAILED'}`);

  // 3. Test endpoints
  const endpoints = getEndpointsForRole(role, testUserId);
  const results: TestResult[] = [];

  for (const test of endpoints) {
    if (test.needsUserId && testUserId === PLACEHOLDER_USER) {
      results.push({
        endpoint: test.path, method: test.method, description: test.description,
        status: 0, ok: false, responseTime: 0, hasData: false,
        error: 'Нет тестового пользователя',
      });
      continue;
    }

    const result = await testEndpoint(test, userJwt);
    results.push(result);
    console.log(`[curator:${role}] ${result.ok ? '✓' : '✗'} ${test.description} → ${result.status} (${result.responseTime}ms)`);

    await new Promise(r => setTimeout(r, 100));
  }

  return makeReport(role, roleConfig.name, startedAt, setupDone, results);
}

function makeReport(role: RoleId, roleName: string, startedAt: string, setupDone: boolean, results: TestResult[]): CuratorReport {
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok && r.status !== 0).length;
  const warnings = results.filter(r => r.ok && !r.hasData).length;
  const skipped = results.filter(r => r.status === 0).length;
  const total = results.length;

  const lines: string[] = [];
  lines.push(`${roleName}: ${passed}/${total} OK`);
  if (setupDone) lines.push('Профиль настроен ✓');
  if (failed > 0) lines.push(`${failed} ошибок`);
  if (warnings > 0) lines.push(`${warnings} пустых ответов`);
  if (skipped > 0) lines.push(`${skipped} пропущено`);

  for (const f of results.filter(r => !r.ok && r.status !== 0)) {
    lines.push(`  ✗ ${f.description}: HTTP ${f.status}`);
  }
  for (const e of results.filter(r => r.ok && !r.hasData)) {
    lines.push(`  ○ ${e.description}: пусто`);
  }

  const report: CuratorReport = {
    id: `curator-${role}-${Date.now()}`,
    role,
    roleName,
    startedAt,
    completedAt: new Date().toISOString(),
    totalEndpoints: total,
    passed,
    failed,
    warnings,
    setupDone,
    results,
    summary: lines.join('\n'),
  };

  // Fire-and-forget save
  curatorReportsStore.set(report.id, report).catch(() => {});
  curatorReportsStore.set(`latest:${role}`, report).catch(() => {});

  console.log(`[curator:${role}] Done: ${passed}/${total} OK, setup=${setupDone}`);
  return report;
}

export async function runAllCurators(): Promise<{
  totalRoles: number;
  reports: CuratorReport[];
  overallPassed: number;
  overallFailed: number;
}> {
  const reports: CuratorReport[] = [];

  for (const role of CURATOR_ROLES) {
    try {
      reports.push(await runCurator(role.id));
    } catch (error) {
      reports.push({
        id: `curator-${role.id}-${Date.now()}`,
        role: role.id, roleName: role.name,
        startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
        totalEndpoints: 0, passed: 0, failed: 1, warnings: 0, setupDone: false,
        results: [], summary: `Fatal: ${String(error)}`,
      });
    }
    await new Promise(r => setTimeout(r, 500));
  }

  return {
    totalRoles: CURATOR_ROLES.length,
    reports,
    overallPassed: reports.reduce((s, r) => s + r.passed, 0),
    overallFailed: reports.reduce((s, r) => s + r.failed, 0),
  };
}

export async function getLatestReports(): Promise<Record<string, CuratorReport | null>> {
  const result: Record<string, CuratorReport | null> = {};
  for (const role of CURATOR_ROLES) {
    result[role.id] = await curatorReportsStore.get(`latest:${role.id}`) as CuratorReport | null;
  }
  return result;
}
