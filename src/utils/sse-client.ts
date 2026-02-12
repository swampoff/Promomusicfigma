/**
 * SSE CLIENT - EventSource для real-time уведомлений
 * Заменяет polling, автоматически реконнектится
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const SSE_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/sse`;

type SSEHandler = (data: any) => void;

interface SSEClient {
  connect: () => void;
  disconnect: () => void;
  on: (event: string, handler: SSEHandler) => void;
  off: (event: string, handler: SSEHandler) => void;
  isConnected: () => boolean;
}

export function createSSEClient(userId: string): SSEClient {
  let eventSource: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_DELAY = 30000;
  const handlers = new Map<string, Set<SSEHandler>>();
  let connected = false;

  function connect() {
    if (eventSource) {
      eventSource.close();
    }

    const url = `${SSE_BASE}/stream/${encodeURIComponent(userId)}`;
    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      connected = true;
      reconnectAttempts = 0;
      console.log(`[SSE] Connected for user ${userId}`);
    };

    eventSource.onerror = () => {
      connected = false;
      emit('disconnected', { reason: 'connection_error', attempts: reconnectAttempts });
      eventSource?.close();
      eventSource = null;
      scheduleReconnect();
    };

    // Общий message handler
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        emit('message', data);
      } catch {}
    };

    // Именованные события
    const eventTypes = [
      'connected', 'notification', 'collab_offer', 'collab_response',
      'collab_message', 'chat_message', 'status_change',
    ];

    for (const type of eventTypes) {
      eventSource.addEventListener(type, (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          emit(type, data);
        } catch {}
      });
    }
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    connected = false;
    console.log(`[SSE] Disconnected for user ${userId}`);
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
    reconnectAttempts++;
    console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  }

  function emit(event: string, data: any) {
    const eventHandlers = handlers.get(event);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        try { handler(data); } catch (err) {
          console.error(`[SSE] Handler error for event "${event}":`, err);
        }
      }
    }
    // Также эмитим в 'any' для универсальных подписчиков
    const anyHandlers = handlers.get('*');
    if (anyHandlers) {
      for (const handler of anyHandlers) {
        try { handler({ event, data }); } catch {}
      }
    }
  }

  function on(event: string, handler: SSEHandler) {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
  }

  function off(event: string, handler: SSEHandler) {
    handlers.get(event)?.delete(handler);
  }

  return { connect, disconnect, on, off, isConnected: () => connected };
}