/**
 * PROTECT ROUTE — Универсальный guard для кабинетов
 * Проверяет авторизацию и роль пользователя.
 * Если не авторизован или роль не совпадает — редирект на главную.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectRouteProps {
  requiredRole: string;
  children: React.ReactNode;
}

export function ProtectRoute({ requiredRole, children }: ProtectRouteProps) {
  const { userRole, isAuthenticated, isDemoMode, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || isDemoMode || userRole !== requiredRole)) {
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, isDemoMode, userRole, requiredRole, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF577F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || isDemoMode || userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
