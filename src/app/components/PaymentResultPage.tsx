/**
 * PAYMENT RESULT PAGE — обрабатывает возврат пользователя после оплаты через шлюз.
 * Поллит статус платежа и отображает результат.
 * Маршрут: /payment/result
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { pollPaymentStatus } from '@/utils/api/checkout-api';

type PaymentResult = 'loading' | 'succeeded' | 'canceled' | 'error';

export default function PaymentResultPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentResult>('loading');
  const [details, setDetails] = useState<{ amount?: number; type?: string; gateway?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const orderId = sessionStorage.getItem('pending-payment-order');
    if (!orderId) {
      setStatus('error');
      setErrorMsg('Не найден идентификатор платежа');
      return;
    }

    pollPaymentStatus(orderId, 30, 2000)
      .then((result) => {
        setDetails({ amount: result.amount, type: result.type, gateway: result.gateway });
        if (result.status === 'succeeded') {
          setStatus('succeeded');
          sessionStorage.removeItem('pending-payment-order');
        } else if (result.status === 'canceled') {
          setStatus('canceled');
          sessionStorage.removeItem('pending-payment-order');
        } else {
          setStatus('error');
          setErrorMsg(`Неожиданный статус: ${result.status}`);
        }
      })
      .catch((err) => {
        console.error('Payment polling error:', err);
        setStatus('error');
        setErrorMsg('Не удалось получить статус платежа. Попробуйте обновить страницу.');
      });
  }, []);

  const goHome = () => navigate('/');
  const goBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-center"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Проверяем оплату...</h2>
            <p className="text-gray-400 text-sm">Пожалуйста, не закрывайте эту страницу</p>
          </>
        )}

        {status === 'succeeded' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Оплата прошла успешно!</h2>
            {details?.amount && (
              <p className="text-gray-400 text-sm mb-6">
                Сумма: {details.amount.toLocaleString('ru-RU')} ₽
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </button>
              <button
                onClick={goHome}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:from-emerald-600 hover:to-green-600 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                На главную
              </button>
            </div>
          </>
        )}

        {status === 'canceled' && (
          <>
            <XCircle className="w-20 h-20 text-orange-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Оплата отменена</h2>
            <p className="text-gray-400 text-sm mb-6">
              Платёж был отменён. Средства не списаны.
            </p>
            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </button>
              <button
                onClick={goHome}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                На главную
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Ошибка</h2>
            <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Обновить
              </button>
              <button
                onClick={goHome}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                На главную
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
