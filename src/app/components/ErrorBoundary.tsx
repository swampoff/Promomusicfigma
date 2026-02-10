import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    this.props.onError?.(error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative max-w-2xl w-full animate-[fadeInUp_0.5s_ease-out_forwards]">
            <style>{`
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-red-500/30 shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-400/30 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>

              <h1 className="text-3xl font-bold text-white text-center mb-4">
                Что-то пошло не так
              </h1>

              <p className="text-gray-300 text-center mb-8">
                Произошла непредвиденная ошибка. Мы уже получили уведомление и работаем над исправлением.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6">
                  <details className="cursor-pointer">
                    <summary className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors mb-3">
                      <Bug className="w-4 h-4" />
                      <span className="font-semibold">Детали ошибки (для разработчиков)</span>
                    </summary>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 overflow-auto max-h-60">
                      <div className="mb-3">
                        <p className="text-red-400 font-semibold text-sm mb-1">Error:</p>
                        <p className="text-gray-300 text-xs font-mono">{this.state.error.toString()}</p>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <p className="text-orange-400 font-semibold text-sm mb-1">Component Stack:</p>
                          <pre className="text-gray-400 text-xs font-mono whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Попробовать снова
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Перезагрузить
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  На главную
                </button>
              </div>

              <p className="text-gray-500 text-sm text-center mt-6">
                Если проблема повторяется, свяжитесь с поддержкой.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">Что делать?</h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>Попробуйте обновить страницу</li>
                    <li>Очистите кеш браузера (Ctrl+Shift+Delete)</li>
                    <li>Попробуйте войти заново</li>
                    <li>Проверьте подключение к интернету</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function SectionErrorBoundary({ 
  children, 
  sectionName = 'раздел' 
}: { 
  children: ReactNode; 
  sectionName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-red-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">
                Ошибка загрузки: {sectionName}
              </h3>
              <p className="text-gray-300 mb-4">
                Не удалось загрузить {sectionName}. Попробуйте обновить страницу.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 transition-all font-semibold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Обновить
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
