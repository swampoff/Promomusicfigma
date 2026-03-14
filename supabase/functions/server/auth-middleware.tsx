/**
 * AUTH MIDDLEWARE — JWT verification for API routes
 * Uses jsonwebtoken (NOT Supabase) to verify tokens.
 * Use requireAuth() to protect endpoints.
 * Use requireAdmin() for admin-only endpoints.
 */
import { Context, Next } from 'npm:hono@4';
import jwt from 'npm:jsonwebtoken';

const JWT_SECRET = Deno.env.get('JWT_SECRET') || '';

/**
 * Extract and verify user from Authorization header.
 * Sets c.set('userId', ...) and c.set('userRole', ...) on success.
 */
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader?.replace('Bearer ', '');

  if (!accessToken) {
    return c.json({ success: false, error: 'Authorization required' }, 401);
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as { sub: string; email: string; role: string };

    // Set user info on context for downstream handlers
    c.set('userId', decoded.sub);
    c.set('userEmail', decoded.email || '');
    c.set('userRole', decoded.role || 'artist');

    await next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
}

/**
 * Require admin role (must be used AFTER requireAuth).
 */
export async function requireAdmin(c: Context, next: Next) {
  const role = c.get('userRole');
  if (role !== 'admin') {
    return c.json({ success: false, error: 'Admin access required' }, 403);
  }
  await next();
}

/**
 * Verify the authenticated user matches the resource owner.
 * Pass the param name that contains the owner ID.
 */
export function requireOwner(paramName: string) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId');
    const resourceOwnerId = c.req.param(paramName);
    if (resourceOwnerId && resourceOwnerId !== userId) {
      return c.json({ success: false, error: 'Access denied: not resource owner' }, 403);
    }
    await next();
  };
}
