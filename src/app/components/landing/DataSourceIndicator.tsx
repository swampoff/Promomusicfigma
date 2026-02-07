/**
 * DATA SOURCE INDICATOR
 * Показывает индикатор, если используются mock данные
 */

import { AlertCircle, Database } from 'lucide-react';

interface DataSourceIndicatorProps {
  useMockData: boolean;
  className?: string;
}

export function DataSourceIndicator({ useMockData, className = '' }: DataSourceIndicatorProps) {
  if (!useMockData) return null;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs ${className}`}>
      <AlertCircle className="w-3 h-3" />
      <span>Demo режим - mock данные</span>
    </div>
  );
}
