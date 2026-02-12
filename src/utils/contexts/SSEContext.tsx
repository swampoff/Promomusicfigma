/**
 * SSE CONTEXT - Single SSE connection shared across the entire app
 *
 * Provides:
 * - Single EventSource per userId (no duplicate connections)
 * - Connection state (connected/disconnected)
 * - Event subscription (on/off) with internal registry (survives reconnects)
 * - Reconnection toast with debounce (prevents spam on unstable networks)
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { createSSEClient } from '@/utils/sse-client';
import { toast } from 'sonner';

type SSEHandler = (data: any) => void;

interface SSEContextValue {
  /** Whether the SSE connection is currently active */
  sseConnected: boolean;
  /** Subscribe to an SSE event (persisted across reconnections) */
  on: (event: string, handler: SSEHandler) => void;
  /** Unsubscribe from an SSE event */
  off: (event: string, handler: SSEHandler) => void;
}

const SSEContext = createContext<SSEContextValue | null>(null);

// ── Debounce constants ──
const DISCONNECT_TOAST_DEBOUNCE = 5000;
const RECONNECT_TOAST_DEBOUNCE = 3000;

interface SSEProviderProps {
  userId: string;
  enabled?: boolean;
  children: ReactNode;
}

export function SSEProvider({ userId, enabled = true, children }: SSEProviderProps) {
  const [sseConnected, setSseConnected] = useState(false);
  const sseRef = useRef<ReturnType<typeof createSSEClient> | null>(null);
  const wasEverConnectedRef = useRef(false);
  const isReconnectingRef = useRef(false);
  const lastDisconnectToastRef = useRef(0);
  const lastReconnectToastRef = useRef(0);

  // ── Handler registry: survives SSE client recreation ──
  const handlersRef = useRef<Map<string, Set<SSEHandler>>>(new Map());

  // Apply all registered handlers to the current SSE client
  const applyHandlers = useCallback((sse: ReturnType<typeof createSSEClient>) => {
    for (const [event, handlers] of handlersRef.current.entries()) {
      for (const handler of handlers) {
        sse.on(event, handler);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled || !userId) return;

    const sse = createSSEClient(userId);
    sseRef.current = sse;

    sse.on('connected', () => {
      const wasDisconnected = isReconnectingRef.current;
      setSseConnected(true);
      isReconnectingRef.current = false;

      if (wasEverConnectedRef.current && wasDisconnected) {
        const now = Date.now();
        if (now - lastReconnectToastRef.current > RECONNECT_TOAST_DEBOUNCE) {
          lastReconnectToastRef.current = now;
          toast.success('Соединение восстановлено', {
            description: 'Real-time уведомления снова активны',
            duration: 3000,
          });
        }
      }

      wasEverConnectedRef.current = true;
    });

    sse.on('disconnected', () => {
      setSseConnected(false);
      isReconnectingRef.current = true;

      if (wasEverConnectedRef.current) {
        const now = Date.now();
        if (now - lastDisconnectToastRef.current > DISCONNECT_TOAST_DEBOUNCE) {
          lastDisconnectToastRef.current = now;
          toast.error('Соединение потеряно', {
            description: 'Переподключение...',
            duration: 4000,
          });
        }
      }
    });

    // Apply all pre-registered handlers to the new SSE client
    applyHandlers(sse);

    sse.connect();

    return () => {
      sse.disconnect();
      sseRef.current = null;
      setSseConnected(false);
    };
  }, [userId, enabled, applyHandlers]);

  const on = useCallback((event: string, handler: SSEHandler) => {
    // Register in our persistent registry
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);
    // Also register on current SSE client (if exists)
    sseRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event: string, handler: SSEHandler) => {
    // Remove from registry
    handlersRef.current.get(event)?.delete(handler);
    // Also remove from current SSE client
    sseRef.current?.off(event, handler);
  }, []);

  return (
    <SSEContext.Provider value={{ sseConnected, on, off }}>
      {children}
    </SSEContext.Provider>
  );
}

/**
 * Hook to access the SSE connection from the context.
 * Must be used within an SSEProvider.
 * Returns null if no provider is found (graceful degradation).
 */
export function useSSEContext(): SSEContextValue | null {
  return useContext(SSEContext);
}
