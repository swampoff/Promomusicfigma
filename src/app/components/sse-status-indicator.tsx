/**
 * SSE STATUS INDICATOR - Точка состояния SSE-соединения
 * Используется в sidebar всех кабинетов для визуализации real-time подключения
 * 
 * Состояния:
 * - Подключено: цветная точка с пульсацией
 * - Отключено (ожидание): серая точка (нейтральное, без тревоги)
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
    <div className={`flex items-center gap-1.5 ${className}`} title={isConnected ? 'Уведомления в реальном времени' : 'Подключение...'}>
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-500 ${
            isConnected ? connectedColor : 'bg-gray-500'
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
          isConnected ? labelConnectedColor : 'text-gray-500'
        }`}>
          {isConnected ? 'Live' : '—'}
        </span>
      )}
    </div>
  );
}