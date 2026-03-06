/**
 * VERIFY EMAIL PAGE
 * Handles Supabase email confirmation redirect.
 * Supabase sends users here after clicking the confirmation link.
 * The SDK automatically processes the token in the URL hash.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/utils/supabase/client';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Wait briefly for Supabase SDK to process URL hash tokens
        await new Promise((res) => setTimeout(res, 800));

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);
          setStatus('error');
          return;
        }

        if (session?.user) {
          setStatus('success');
          // Redirect to artist cabinet after 2.5s
          setTimeout(() => navigate('/artist'), 2500);
        } else {
          // No session — might be an expired link
          setError('Ссылка устарела или уже была использована. Войдите и запросите новое письмо.');
          setStatus('error');
        }
      } catch {
        setError('Ошибка проверки. Попробуйте войти вручную.');
        setStatus('error');
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-cyan-400 animate-spin" />
            <h2 className="text-xl font-semibold text-white mb-2">Проверка email...</h2>
            <p className="text-white/50 text-sm">Подождите немного</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <h2 className="text-xl font-semibold text-white mb-2">Email подтверждён!</h2>
            <p className="text-white/50 text-sm">Переходим в ваш кабинет...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold text-white mb-3">Не удалось подтвердить</h2>
            <p className="text-white/50 text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-colors"
            >
              Войти
            </button>
          </>
        )}
      </div>
    </div>
  );
}
