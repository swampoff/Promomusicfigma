/**
 * SSE ROUTES - Server-Sent Events для real-time уведомлений
 * 
 * Endpoints:
 * GET /stream/:userId - SSE-стрим уведомлений
 * POST /emit/:userId  - Отправить событие в стрим (внутренний вызов)
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Хранилище активных SSE-подключений (userId -> controller[])
const connections = new Map<string, Set<ReadableStreamDefaultController>>();

// Глобальный event bus для отправки событий
export function emitSSE(userId: string, event: { type: string; data: any }) {
  const userConns = connections.get(userId);
  if (!userConns || userConns.size === 0) return;
  
  const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
  
  const deadControllers: ReadableStreamDefaultController[] = [];
  for (const controller of userConns) {
    try {
      controller.enqueue(new TextEncoder().encode(payload));
    } catch {
      deadControllers.push(controller);
    }
  }
  
  // Очистка мёртвых подключений
  for (const dc of deadControllers) {
    userConns.delete(dc);
  }
  if (userConns.size === 0) connections.delete(userId);
}

// SSE Stream endpoint
app.get('/stream/:userId', (c) => {
  const userId = c.req.param('userId');
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let controllerRef: ReadableStreamDefaultController | null = null;
  
  const cleanup = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    if (controllerRef) {
      const userConns = connections.get(userId);
      if (userConns) {
        userConns.delete(controllerRef);
        if (userConns.size === 0) connections.delete(userId);
      }
      try { controllerRef.close(); } catch {}
      controllerRef = null;
    }
  };
  
  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
      
      // Регистрация подключения
      if (!connections.has(userId)) {
        connections.set(userId, new Set());
      }
      connections.get(userId)!.add(controller);
      
      // Heartbeat каждые 25 сек
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch {
          cleanup();
        }
      }, 25000);
      
      // Отправляем initial event
      try {
        const initPayload = `event: connected\ndata: ${JSON.stringify({ userId, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initPayload));
      } catch {
        cleanup();
      }
      
      // Cleanup при закрытии
      c.req.raw.signal.addEventListener('abort', () => {
        cleanup();
      });
    },
    cancel() {
      // Called when the client disconnects
      cleanup();
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});

// POST /emit/:userId - отправить событие программно
app.post('/emit/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const body = await c.req.json();
    emitSSE(userId, { type: body.type || 'notification', data: body.data || body });
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 400);
  }
});

// GET /connections - статистика активных подключений
app.get('/connections', (c) => {
  const stats: Record<string, number> = {};
  for (const [userId, conns] of connections) {
    stats[userId] = conns.size;
  }
  return c.json({ success: true, totalUsers: connections.size, connections: stats });
});

export default app;
export { connections };