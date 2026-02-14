/**
 * PROTECTED ROUTE - Blocks access to cabinet routes
 * Временная защита всех кабинетов от доступа
 */

import { Navigate } from 'react-router';
import { CabinetUnavailable } from './cabinet-unavailable';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Компонент для защиты маршрутов кабинетов
 * На данный момент блокирует доступ ко всем кабинетам
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Временно блокируем доступ ко всем кабинетам
  // Показываем страницу "Кабинеты недоступны"
  return <CabinetUnavailable />;
}
