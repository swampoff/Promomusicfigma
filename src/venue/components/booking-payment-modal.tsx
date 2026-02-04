/**
 * BOOKING PAYMENT MODAL - Модалка для оплаты депозита и остатка
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, CreditCard, Loader2, CheckCircle, XCircle, 
  DollarSign, Shield, Info, AlertCircle 
} from 'lucide-react';
import * as bookingApi from '../api/booking-api';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { BookingRequest } from '../types/venue-types';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface BookingPaymentModalProps {
  booking: BookingRequest;
  paymentType: 'deposit' | 'final';
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingPaymentModal({ 
  booking, 
  paymentType, 
  onClose, 
  onSuccess 
}: BookingPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Mock payment method
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const amount = paymentType === 'deposit' 
    ? booking.depositAmount || 0
    : booking.finalAmount || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Получить токен пользователя
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Валидация карты (базовая)
      if (cardNumber.length < 16) {
        throw new Error('Неверный номер карты');
      }

      // Вызвать API для оплаты
      const paymentMethodId = `pm_mock_${Date.now()}`;
      
      if (paymentType === 'deposit') {
        await bookingApi.payDeposit(
          booking.id,
          { paymentMethodId },
          session.access_token
        );
      } else {
        await bookingApi.payFinal(
          booking.id,
          { paymentMethodId },
          session.access_token
        );
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Ошибка оплаты');
    } finally {
      setLoading(false);
    }
  };

  // Форматирование номера карты
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-green-500/30 shadow-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">Оплата успешна!</h3>
          <p className="text-slate-400 mb-1">
            {paymentType === 'deposit' ? 'Депозит' : 'Финальный платеж'} {formatPrice(amount)} оплачен
          </p>
          <p className="text-sm text-slate-500">
            Букинг обновлен. Перенаправление...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {paymentType === 'deposit' ? 'Оплата депозита' : 'Финальный платеж'}
          </h3>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Booking Info */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <h4 className="text-white font-medium mb-2">{booking.eventTitle}</h4>
          <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
            <span>{booking.performer?.displayName}</span>
            <span>{new Date(booking.eventDate).toLocaleDateString('ru-RU')}</span>
          </div>
          
          {/* Amount */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">
                {paymentType === 'deposit' ? 'Депозит (30%)' : 'Остаток (70%)'}:
              </span>
              <span className="text-2xl font-bold text-white">
                {formatPrice(amount)}
              </span>
            </div>
            {paymentType === 'deposit' && (
              <p className="text-xs text-slate-500">
                Полная стоимость: {formatPrice(booking.offeredPrice)}
              </p>
            )}
          </div>
        </div>

        {/* Info Alert */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
          <div className="flex gap-2">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              {paymentType === 'deposit' ? (
                <>
                  <p className="font-medium mb-1">Депозит гарантирует бронирование</p>
                  <p className="text-blue-400/80">
                    После оплаты дата будет забронирована. Остаток нужно оплатить за 24 часа до мероприятия.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1">Финальный платеж</p>
                  <p className="text-blue-400/80">
                    После оплаты букинг будет полностью подтвержден. Средства будут переведены артисту после мероприятия.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Номер карты
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Срок действия
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                value={cardExpiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                  }
                  setCardExpiry(value);
                }}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                CVC
              </label>
              <input
                type="text"
                placeholder="123"
                maxLength={3}
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
            <div className="flex gap-2">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 mb-6">
          <Shield className="w-4 h-4 text-green-400" />
          <p className="text-xs text-slate-400">
            Защищенное соединение. Данные вашей карты не сохраняются.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || !cardNumber || !cardExpiry || !cardCvc}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Обработка...
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                Оплатить {formatPrice(amount)}
              </>
            )}
          </button>
        </div>

        {/* Mock Notice */}
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              <strong>Демо-режим:</strong> Введите любой номер карты (16 цифр) для тестирования. 
              Реальная оплата не производится.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}