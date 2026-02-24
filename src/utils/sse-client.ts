/**
 * SSE CLIENT - fetch-based EventSource для real-time уведомлений
 *
 * Нативный EventSource НЕ поддерживает кастомные заголовки (Authorization),
 * а Supabase Edge Functions требуют Bearer-токен. Поэтому используем
 * fetch + ReadableStream для ручного парсинга SSE-потока.
 *
 * Автоматический реконнект с exponential backoff.
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';

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
  let abortController: AbortController | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_DELAY = 60000;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const handlers = new Map<string, Set<SSEHandler>>();
  let connected = false;
  let intentionalDisconnect = false;
  let gavUp = false;

  function connect() {
    // Если уже отказались от подключения - не пытаемся снова автоматически
    if (gavUp) return;
    
    // Очищаем предыдущее соединение
    if (abortController) {
      abortController.abort();
      abortController = null;
    }

    intentionalDisconnect = false;
    abortController = new AbortController();
    const url = `${SSE_BASE}/stream/${encodeURIComponent(userId)}`;

    startFetchStream(url, abortController.signal);
  }

  async function startFetchStream(url: string, signal: AbortSignal) {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Accept': 'text/event-stream',
        },
        signal,
      });

      if (!response.ok) {
        await response.text().catch(() => '');
        console.warn(`[SSE] HTTP ${response.status} for ${userId}`);
        connected = false;
        emit('disconnected', { reason: `http_${response.status}`, attempts: reconnectAttempts });
        if (!intentionalDisconnect) scheduleReconnect();
        return;
      }

      if (!response.body) {
        console.warn('[SSE] No response body');
        connected = false;
        emit('disconnected', { reason: 'no_body', attempts: reconnectAttempts });
        if (!intentionalDisconnect) scheduleReconnect();
        return;
      }

      // Соединение установлено
      connected = true;
      reconnectAttempts = 0;
      gavUp = false;
      emit('connected', { userId, timestamp: new Date().toISOString(), source: 'fetch' });

      // Читаем SSE-поток
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Парсим SSE-события из буфера
        const events = parseSSEBuffer(buffer);
        buffer = events.remaining;

        for (const evt of events.parsed) {
          if (evt.type === 'heartbeat') continue;

          // Пытаемся распарсить data как JSON
          let data: any;
          try {
            data = JSON.parse(evt.data);
          } catch {
            data = evt.data;
          }

          // Emit именованное событие
          if (evt.event) {
            emit(evt.event, data);
          } else {
            emit('message', data);
          }
        }
      }

      // Стрим завершился
      connected = false;
      emit('disconnected', { reason: 'stream_ended', attempts: reconnectAttempts });
      if (!intentionalDisconnect) scheduleReconnect();

    } catch (err: any) {
      if (signal.aborted || intentionalDisconnect) return;
      connected = false;
      // Suppress verbose errors - only warn on first attempt
      if (reconnectAttempts === 0) {
        console.warn(`[SSE] Connection failed for ${userId}, will retry`);
      }
      emit('disconnected', { reason: 'connection_error', attempts: reconnectAttempts });
      scheduleReconnect();
    }
  }

  /**
   * Парсер SSE-формата:
   * - `event: <name>` → имя события
   * - `data: <json>`  → данные
   * - `: comment`     → heartbeat/комментарий
   * - пустая строка   → разделитель событий
   */
  function parseSSEBuffer(buffer: string): { parsed: Array<{ event?: string; data: string; type?: string }>; remaining: string } {
    const parsed: Array<{ event?: string; data: string; type?: string }> = [];

    // Разбиваем по двойному переводу строки
    const blocks = buffer.split('\n\n');
    const remaining = blocks.pop() || '';

    for (const block of blocks) {
      if (!block.trim()) continue;

      let eventName: string | undefined;
      const dataLines: string[] = [];
      let isHeartbeat = false;

      const lines = block.split('\n');
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventName = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          dataLines.push(line.slice(6));
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5));
        } else if (line.startsWith(':')) {
          isHeartbeat = true;
        }
      }

      if (isHeartbeat && dataLines.length === 0) {
        parsed.push({ type: 'heartbeat', data: '' });
        continue;
      }

      if (dataLines.length > 0) {
        parsed.push({
          event: eventName,
          data: dataLines.join('\n'),
        });
      }
    }

    return { parsed, remaining };
  }

  function disconnect() {
    intentionalDisconnect = true;
    gavUp = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    connected = false;
  }

  function scheduleReconnect() {
    if (reconnectTimer || intentionalDisconnect) return;
    
    // Give up after max attempts - stop flooding the network
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      gavUp = true;
      console.warn(`[SSE] Gave up reconnecting for ${userId} after ${MAX_RECONNECT_ATTEMPTS} attempts`);
      emit('gave_up', { userId, attempts: reconnectAttempts });
      return;
    }
    
    const delay = Math.min(2000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
    reconnectAttempts++;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  }

  function emit(event: string, data: any) {
    const eventHandlers = handlers.get(event);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        try {
          handler(data);
        } catch (err) {
          console.error(`[SSE] Handler error for "${event}":`, err);
        }
      }
    }
    // Wildcard подписчики
    const anyHandlers = handlers.get('*');
    if (anyHandlers) {
      for (const handler of anyHandlers) {
        try {
          handler({ event, data });
        } catch {}
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