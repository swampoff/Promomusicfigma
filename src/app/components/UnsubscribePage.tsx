/**
 * UNSUBSCRIBE PAGE — Страница отписки от email рассылок
 * Доступна по /unsubscribe?email=...&campaign=...
 * Поддерживает RFC 8058 One-Click Unsubscribe
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { MailX, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const campaignId = searchParams.get('campaign') || '';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-unsubscribe on POST (RFC 8058 One-Click)
  useEffect(() => {
    if (searchParams.get('List-Unsubscribe') === 'One-Click' && email) {
      handleUnsubscribe();
    }
  }, []);

  const handleUnsubscribe = async () => {
    if (!email) {
      setErrorMsg('Email не указан');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/server/api/email-campaigns/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, campaign_id: campaignId }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Не удалось отписаться');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Ошибка сети. Попробуйте позже.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
            <MailX className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ПРОМО.МУЗЫКА</h1>
          <p className="text-gray-400 text-sm mt-1">Управление подпиской</p>
        </div>

        {status === 'idle' && (
          <div className="space-y-4">
            <p className="text-gray-300">
              Вы хотите отписаться от email рассылок?
            </p>
            {email && (
              <p className="text-sm text-gray-400">
                Email: <span className="text-white font-medium">{email}</span>
              </p>
            )}
            <button
              onClick={handleUnsubscribe}
              className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
            >
              Отписаться от рассылок
            </button>
            <a
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться на сайт
            </a>
          </div>
        )}

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 mx-auto text-purple-400 animate-spin" />
            <p className="text-gray-300">Обрабатываем запрос...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-400" />
            <h2 className="text-xl font-semibold text-white">Вы отписаны</h2>
            <p className="text-gray-300 text-sm">
              Вы больше не будете получать маркетинговые рассылки от ПРОМО.МУЗЫКА.
              Важные системные уведомления (безопасность, платежи) будут приходить по-прежнему.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 py-2 px-4 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              На главную
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-red-400" />
            <h2 className="text-xl font-semibold text-white">Ошибка</h2>
            <p className="text-gray-300 text-sm">{errorMsg}</p>
            <button
              onClick={handleUnsubscribe}
              className="py-2 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
