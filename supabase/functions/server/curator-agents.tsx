/**
 * CURATOR AGENTS — автономные агенты-кураторы для каждой роли
 * Тестируют API кабинетов: Artist, Producer, Radio, DJ, Venue, Engineer
 */

import { curatorReportsStore } from './db.tsx';
import { getSupabaseClient } from './supabase-client.tsx';

// ─── Types ──────────────────────────────────────────────

export type RoleId = 'artist' | 'producer' | 'radio' | 'dj' | 'venue' | 'engineer';

interface EndpointTest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  body?: Record<string, any>;
  /** If true, requires a real userId param — skip if no test user */
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
  results: TestResult[];
  summary: string;
}

// ─── Configuration ──────────────────────────────────────

const BASE_URL = Deno.env.get('SUPABASE_URL') || 'https://qzpmiiqfwkcnrhvubdgt.supabase.co';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const INTERNAL_KEY = Deno.env.get('VPS_INTERNAL_KEY') || '';

/** Test user ID placeholder — replaced with real ID from profile lookup */
const PLACEHOLDER_USER = '00000000-0000-0000-0000-000000000000';

const CURATOR_EMAIL = 'curator@promofm.org';
const CURATOR_PASSWORD = 'CuratorBot2024!Secure';

/** Get or create a test user and return a valid JWT */
async function getCuratorJWT(): Promise<{ jwt: string; userId: string } | null> {
  try {
    const supabase = getSupabaseClient();

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: CURATOR_EMAIL,
      password: CURATOR_PASSWORD,
    });

    if (signInData?.session) {
      return {
        jwt: signInData.session.access_token,
        userId: signInData.user!.id,
      };
    }

    // If sign-in fails, create the user via admin API
    console.log('[curator] Creating test curator user...');
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: CURATOR_EMAIL,
      password: CURATOR_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'admin', displayName: 'Curator Bot' },
    });

    if (createError) {
      console.log('[curator] Failed to create user:', createError.message);
      return null;
    }

    // Sign in with newly created user
    const { data: newSignIn } = await supabase.auth.signInWithPassword({
      email: CURATOR_EMAIL,
      password: CURATOR_PASSWORD,
    });

    if (newSignIn?.session) {
      return {
        jwt: newSignIn.session.access_token,
        userId: newSignIn.user!.id,
      };
    }

    return null;
  } catch (error) {
    console.log('[curator] JWT error:', error);
    return null;
  }
}

export const CURATOR_ROLES: { id: RoleId; name: string; description: string }[] = [
  { id: 'artist', name: 'Артист', description: 'Профиль, треки, аналитика, питчинг, публикации' },
  { id: 'producer', name: 'Продюсер', description: 'Студия, беседы, услуги, портфолио, кошелёк, AI, календарь' },
  { id: 'radio', name: 'Радио', description: 'Рекламные слоты, заявки, финансы, аналитика' },
  { id: 'dj', name: 'Диджей', description: 'Профиль, события, коллаборации, подписки' },
  { id: 'venue', name: 'Площадка', description: 'Профиль, аналитика, плейлисты, радио-кампании, бронирования' },
  { id: 'engineer', name: 'Инженер', description: 'Пока нет выделенных эндпоинтов — проверяет общие' },
];

// ─── Endpoint definitions per role ──────────────────────

function getEndpointsForRole(role: RoleId, userId: string): EndpointTest[] {
  switch (role) {
    case 'artist':
      return [
        { method: 'GET', path: `/server/api/artist-profile/popular`, description: 'Популярные артисты' },
        { method: 'GET', path: `/server/api/artist-profile/profile/${userId}`, description: 'Профиль артиста', needsUserId: true },
        { method: 'GET', path: `/server/api/artist-profile/profile/${userId}/stats`, description: 'Статистика артиста', needsUserId: true },
        { method: 'GET', path: `/server/api/artist-profile/profile/${userId}/tracks`, description: 'Треки артиста', needsUserId: true },
        { method: 'GET', path: `/server/api/artist-analytics/overview/${userId}`, description: 'Аналитика: обзор', needsUserId: true },
        { method: 'GET', path: `/server/api/artist-analytics/timeline/${userId}`, description: 'Аналитика: таймлайн', needsUserId: true },
        { method: 'GET', path: `/server/api/artist-analytics/tracks/${userId}`, description: 'Аналитика: треки', needsUserId: true },
        { method: 'GET', path: `/server/api/tracks/`, description: 'Список треков' },
        { method: 'GET', path: `/server/api/pitching/opportunities`, description: 'Питчинг: возможности' },
      ];

    case 'producer':
      return [
        { method: 'GET', path: `/server/api/producer-studio/conversations/${userId}`, description: 'Беседы продюсера', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/settings/${userId}`, description: 'Настройки студии', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/services/custom/${userId}`, description: 'Услуги продюсера', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/profile/edits/${userId}`, description: 'Профиль продюсера', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/wallet/withdrawals/${userId}`, description: 'Выводы средств', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/ai/history/${userId}`, description: 'AI история', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/calendar/${userId}`, description: 'Календарь продюсера', needsUserId: true },
        { method: 'GET', path: `/server/api/producer-studio/calendar/${userId}/month`, description: 'Календарь: месяц', needsUserId: true },
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
        { method: 'GET', path: `/server/api/radio-profile/profile`, description: 'Профиль радио' },
      ];

    case 'dj':
      return [
        { method: 'GET', path: `/server/api/dj-studio/profile`, description: 'Профиль DJ' },
        { method: 'GET', path: `/server/api/dj-studio/events`, description: 'События DJ' },
        { method: 'GET', path: `/server/api/dj-studio/collaborations`, description: 'Коллаборации' },
        { method: 'GET', path: `/server/api/dj-studio/notifications`, description: 'Уведомления DJ' },
        { method: 'GET', path: `/server/api/dj-studio/plans`, description: 'Тарифные планы' },
        { method: 'GET', path: `/server/api/dj-marketplace/`, description: 'DJ маркетплейс' },
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
        { method: 'GET', path: `/server/api/landing-data/popular-artists`, description: 'Популярные артисты (лендинг)' },
        { method: 'GET', path: `/server/api/landing-data/charts/weekly`, description: 'Чарты недели' },
        { method: 'GET', path: `/server/api/landing-data/news`, description: 'Новости' },
        { method: 'GET', path: `/server/api/landing-data/concerts`, description: 'Концерты' },
        { method: 'GET', path: `/server/api/landing-data/stats`, description: 'Статистика платформы' },
        { method: 'GET', path: `/server/api/charts/sources`, description: 'Источники чартов' },
        { method: 'GET', path: `/server/api/news-agent/status`, description: 'Статус агента новостей' },
        { method: 'GET', path: `/server/api/concert-agent/status`, description: 'Статус агента концертов' },
        { method: 'GET', path: `/server/api/content-health/check`, description: 'Здоровье контента' },
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
    const timeout = setTimeout(() => controller.abort(), 20000);

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${userJwt || SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'X-Internal-Key': INTERNAL_KEY,
    };

    const options: RequestInit = {
      method: test.method,
      headers,
      signal: controller.signal,
    };

    if (test.body && (test.method === 'POST' || test.method === 'PUT')) {
      options.body = JSON.stringify(test.body);
    }

    const resp = await fetch(url, options);
    clearTimeout(timeout);

    const responseTime = Date.now() - start;
    let body: any = null;
    let snippet = '';

    try {
      body = await resp.json();
      snippet = JSON.stringify(body).slice(0, 200);
    } catch {
      const text = await resp.text().catch(() => '');
      snippet = text.slice(0, 200);
    }

    const hasData = body?.success === true && (
      body?.data !== undefined ||
      body?.results !== undefined ||
      body?.session !== undefined ||
      body?.profile !== undefined ||
      body?.tracks !== undefined ||
      body?.status === 'ok'
    );

    let dataCount: number | undefined;
    if (Array.isArray(body?.data)) dataCount = body.data.length;
    else if (Array.isArray(body?.results)) dataCount = body.results.length;
    else if (Array.isArray(body?.tracks)) dataCount = body.tracks.length;

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
  console.log(`[curator:${role}] Starting audit of ${roleConfig.name}...`);

  // Get a real user JWT for authenticated endpoints
  const curatorAuth = await getCuratorJWT();
  const userJwt = curatorAuth?.jwt;
  let testUserId = curatorAuth?.userId || PLACEHOLDER_USER;

  if (userJwt) {
    console.log(`[curator:${role}] Got curator JWT for user ${testUserId}`);
  } else {
    console.log(`[curator:${role}] No JWT available, auth endpoints will fail`);
  }

  // For artist-specific endpoints, try to find a real artist profile
  if (role === 'artist' || role === 'producer') {
    try {
      const resp = await fetch(`${BASE_URL}/functions/v1/server/api/artist-profile/popular`, {
        headers: {
          'Authorization': `Bearer ${userJwt || SERVICE_KEY}`,
          'X-Internal-Key': INTERNAL_KEY,
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        const artists = data?.data || data?.artists || [];
        if (artists.length > 0) {
          testUserId = artists[0].id || artists[0].userId || testUserId;
        }
      }
    } catch { /* ignore */ }
  }

  const endpoints = getEndpointsForRole(role, testUserId);
  const results: TestResult[] = [];

  for (const test of endpoints) {
    // Skip user-specific endpoints if we don't have a real user
    if (test.needsUserId && testUserId === PLACEHOLDER_USER) {
      results.push({
        endpoint: test.path,
        method: test.method,
        description: test.description,
        status: 0,
        ok: false,
        responseTime: 0,
        hasData: false,
        error: 'Нет тестового пользователя — пропущено',
      });
      continue;
    }

    const result = await testEndpoint(test, userJwt);
    results.push(result);
    console.log(`[curator:${role}] ${result.ok ? '✓' : '✗'} ${test.method} ${test.path} → ${result.status} (${result.responseTime}ms)`);

    // Small delay between requests
    await new Promise(r => setTimeout(r, 300));
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok && r.status !== 0).length;
  const warnings = results.filter(r => r.ok && !r.hasData).length;
  const skipped = results.filter(r => r.status === 0).length;

  const completedAt = new Date().toISOString();

  // Generate summary
  const lines: string[] = [];
  lines.push(`${roleConfig.name}: ${passed}/${endpoints.length} endpoints OK`);
  if (failed > 0) lines.push(`${failed} ошибок`);
  if (warnings > 0) lines.push(`${warnings} пустых ответов`);
  if (skipped > 0) lines.push(`${skipped} пропущено`);

  const failedEndpoints = results.filter(r => !r.ok && r.status !== 0);
  if (failedEndpoints.length > 0) {
    lines.push('Ошибки:');
    for (const f of failedEndpoints) {
      lines.push(`  - ${f.method} ${f.endpoint}: HTTP ${f.status}`);
    }
  }

  const emptyEndpoints = results.filter(r => r.ok && !r.hasData);
  if (emptyEndpoints.length > 0) {
    lines.push('Пустые данные:');
    for (const e of emptyEndpoints) {
      lines.push(`  - ${e.method} ${e.endpoint}`);
    }
  }

  const report: CuratorReport = {
    id: `curator-${role}-${Date.now()}`,
    role,
    roleName: roleConfig.name,
    startedAt,
    completedAt,
    totalEndpoints: endpoints.length,
    passed,
    failed,
    warnings,
    results,
    summary: lines.join('\n'),
  };

  // Save report
  await curatorReportsStore.set(report.id, report);

  // Also save latest report for quick access
  await curatorReportsStore.set(`latest:${role}`, report);

  console.log(`[curator:${role}] Complete: ${passed}/${endpoints.length} passed, ${failed} failed, ${warnings} warnings`);

  return report;
}

export async function runAllCurators(): Promise<{
  totalRoles: number;
  reports: CuratorReport[];
  overallPassed: number;
  overallFailed: number;
  overallWarnings: number;
}> {
  const reports: CuratorReport[] = [];

  for (const role of CURATOR_ROLES) {
    try {
      const report = await runCurator(role.id);
      reports.push(report);
    } catch (error) {
      console.error(`[curator:${role.id}] Fatal error:`, error);
      reports.push({
        id: `curator-${role.id}-${Date.now()}`,
        role: role.id,
        roleName: role.name,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        totalEndpoints: 0,
        passed: 0,
        failed: 1,
        warnings: 0,
        results: [],
        summary: `Fatal error: ${String(error)}`,
      });
    }

    // Delay between roles
    await new Promise(r => setTimeout(r, 1000));
  }

  return {
    totalRoles: CURATOR_ROLES.length,
    reports,
    overallPassed: reports.reduce((s, r) => s + r.passed, 0),
    overallFailed: reports.reduce((s, r) => s + r.failed, 0),
    overallWarnings: reports.reduce((s, r) => s + r.warnings, 0),
  };
}

export async function getLatestReports(): Promise<Record<string, CuratorReport | null>> {
  const result: Record<string, CuratorReport | null> = {};
  for (const role of CURATOR_ROLES) {
    result[role.id] = await curatorReportsStore.get(`latest:${role.id}`) as CuratorReport | null;
  }
  return result;
}
