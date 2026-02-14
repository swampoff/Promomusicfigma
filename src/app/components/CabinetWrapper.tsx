/**
 * CABINET WRAPPER - Wraps cabinet components with protection
 * Временно блокирует доступ к кабинетам
 */

import { ProtectedRoute } from './ProtectedRoute';

interface CabinetWrapperProps {
  children: React.ReactNode;
}

/**
 * Обертка для компонентов кабинетов
 * Применяет защиту от доступа
 */
export function CabinetWrapper({ children }: CabinetWrapperProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
