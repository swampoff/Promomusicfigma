/**
 * SSE STATUS INDICATOR - Зелёная/красная точка состояния SSE-соединения
 * Используется в sidebar всех кабинетов для визуализации real-time подключения
 */

import { useSSEContext } from '@/utils/contexts/SSEContext';

interface SSEStatusIndicatorProps {
  /** Цвет точки в подключённом состоянии */
  connectedColor?: string;
  /** Показывать текстовую метку */
  showLabel?: boolean;
  /** Цвет текстовой метки в подключённом состоянии (по умолчанию text-emerald-400) */
  labelConnectedColor?: string;
  /** Дополнительные классы обёртки */
  className?: string;
}

export function SSEStatusIndicator({
  connectedColor = 'bg-emerald-400',
  showLabel = false,
  labelConnectedColor = 'text-emerald-400',
  className = '',
}: SSEStatusIndicatorProps) {
  const sseCtx = useSSEContext();
  const isConnected = sseCtx?.sseConnected ?? false;

  return (
    <div className={`flex items-center gap-1.5 ${className}`} title={isConnected ? 'Real-time подключено' : 'Real-time отключено'}>
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-500 ${
            isConnected ? connectedColor : 'bg-red-400'
          }`}
        />
        {isConnected && (
          <div
            className={`absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40 ${connectedColor}`}
          />
        )}
      </div>
      {showLabel && (
        <span className={`text-[10px] font-medium transition-colors duration-300 ${
          isConnected ? labelConnectedColor : 'text-red-400'
        }`}>
          {isConnected ? 'Live' : 'Offline'}
        </span>
      )}
    </div>
  );
}