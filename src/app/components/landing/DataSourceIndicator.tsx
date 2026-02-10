/**
 * DATA SOURCE INDICATOR
 * Показывает индикатор источника данных: API (Supabase KV) или mock
 */

import { AlertCircle, Database, Cloud, Wifi, WifiOff } from 'lucide-react';

type DataSource = 'api' | 'mock' | 'loading' | 'error';

interface DataSourceIndicatorProps {
  source: DataSource;
  className?: string;
  compact?: boolean;
}

export function DataSourceIndicator({ source, className = '', compact = false }: DataSourceIndicatorProps) {
  if (source === 'api' && compact) return null;

  const config: Record<DataSource, { icon: typeof Database; label: string; bgClass: string; textClass: string; borderClass: string }> = {
    api: {
      icon: Cloud,
      label: 'Supabase KV',
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-300',
      borderClass: 'border-emerald-500/30',
    },
    mock: {
      icon: AlertCircle,
      label: 'Demo - mock данные',
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-300',
      borderClass: 'border-yellow-500/30',
    },
    loading: {
      icon: Wifi,
      label: 'Загрузка...',
      bgClass: 'bg-blue-500/10',
      textClass: 'text-blue-300',
      borderClass: 'border-blue-500/30',
    },
    error: {
      icon: WifiOff,
      label: 'Ошибка загрузки',
      bgClass: 'bg-red-500/10',
      textClass: 'text-red-300',
      borderClass: 'border-red-500/30',
    },
  };

  const { icon: Icon, label, bgClass, textClass, borderClass } = config[source];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${bgClass} border ${borderClass} ${textClass} text-[10px] xs:text-xs ${className}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}

// Legacy compatibility
export function DataSourceIndicatorLegacy({ useMockData, className = '' }: { useMockData: boolean; className?: string }) {
  return <DataSourceIndicator source={useMockData ? 'mock' : 'api'} className={className} />;
}
