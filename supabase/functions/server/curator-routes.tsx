/**
 * CURATOR ROUTES — HTTP endpoints для агентов-кураторов
 */

import { Hono } from 'npm:hono@4';
import { requireAuth, requireAdmin } from './auth-middleware.tsx';
import { curatorReportsStore } from './db.tsx';
import {
  runCurator,
  runAllCurators,
  getLatestReports,
  CURATOR_ROLES,
} from './curator-agents.tsx';
import type { RoleId } from './curator-agents.tsx';

const curatorRoutes = new Hono();

const ADMIN_INTERNAL_KEY = Deno.env.get('VPS_INTERNAL_KEY') || '';

/** Admin auth: either JWT admin or X-Internal-Key header */
async function requireAdminOrKey(c: any, next: any) {
  const internalKey = c.req.header('X-Internal-Key');
  if (internalKey && ADMIN_INTERNAL_KEY && internalKey === ADMIN_INTERNAL_KEY) {
    return next();
  }
  return requireAuth(c, () => requireAdmin(c, next));
}

/**
 * POST /run — запустить всех кураторов
 */
curatorRoutes.post('/run', requireAdminOrKey, async (c) => {
  try {
    console.log('[curator] Starting all curators...');
    const result = await runAllCurators();
    return c.json({
      success: true,
      totalRoles: result.totalRoles,
      overallPassed: result.overallPassed,
      overallFailed: result.overallFailed,
      overallWarnings: result.overallWarnings,
      reports: result.reports.map(r => ({
        role: r.role,
        roleName: r.roleName,
        passed: r.passed,
        failed: r.failed,
        warnings: r.warnings,
        totalEndpoints: r.totalEndpoints,
        summary: r.summary,
      })),
    });
  } catch (error) {
    console.error('[curator] Run all error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * POST /run/:roleId — запустить куратора для конкретной роли
 */
curatorRoutes.post('/run/:roleId', requireAdminOrKey, async (c) => {
  try {
    const roleId = c.req.param('roleId') as RoleId;
    const role = CURATOR_ROLES.find(r => r.id === roleId);
    if (!role) {
      return c.json({ success: false, error: `Unknown role: ${roleId}` }, 404);
    }

    console.log(`[curator] Running curator for ${role.name}...`);
    const report = await runCurator(roleId);
    return c.json({ success: true, report });
  } catch (error) {
    console.error('[curator] Run error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /status — статус всех кураторов (последние отчёты)
 */
curatorRoutes.get('/status', async (c) => {
  try {
    const latest = await getLatestReports();
    const summary: Record<string, any> = {};

    for (const role of CURATOR_ROLES) {
      const report = latest[role.id];
      summary[role.id] = report
        ? {
            roleName: role.name,
            lastRun: report.completedAt,
            passed: report.passed,
            failed: report.failed,
            warnings: report.warnings,
            totalEndpoints: report.totalEndpoints,
            summary: report.summary,
          }
        : { roleName: role.name, lastRun: null, status: 'never_run' };
    }

    return c.json({ success: true, data: summary });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /report/:roleId — детальный отчёт по роли
 */
curatorRoutes.get('/report/:roleId', async (c) => {
  try {
    const roleId = c.req.param('roleId');
    const report = await curatorReportsStore.get(`latest:${roleId}`);
    if (!report) {
      return c.json({ success: false, error: 'Отчёт не найден. Запустите куратора.' }, 404);
    }
    return c.json({ success: true, report });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /roles — список ролей
 */
curatorRoutes.get('/roles', async (c) => {
  return c.json({
    success: true,
    data: CURATOR_ROLES.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
    })),
  });
});

/**
 * GET /history — все отчёты (последние 50)
 */
curatorRoutes.get('/history', async (c) => {
  try {
    const all = await curatorReportsStore.getAll();
    const reports = all
      .filter((r: any) => r.id && !r.id.startsWith('latest:'))
      .sort((a: any, b: any) => (b.completedAt || '').localeCompare(a.completedAt || ''))
      .slice(0, 50)
      .map((r: any) => ({
        id: r.id,
        role: r.role,
        roleName: r.roleName,
        completedAt: r.completedAt,
        passed: r.passed,
        failed: r.failed,
        warnings: r.warnings,
        totalEndpoints: r.totalEndpoints,
      }));

    return c.json({ success: true, data: reports });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default curatorRoutes;
