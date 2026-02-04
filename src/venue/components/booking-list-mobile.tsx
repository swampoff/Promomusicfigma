/**
 * BOOKING LIST MOBILE - Адаптивный список букингов для мобильных
 * Оптимизирован для touch-устройств
 */

import { motion } from 'motion/react';
import { 
  Calendar, Clock, DollarSign, User, ChevronRight,
  CheckCircle, AlertCircle, XCircle, MapPin
} from 'lucide-react';
import type { BookingRequest } from '../types/venue-types';

interface BookingListMobileProps {
  bookings: BookingRequest[];
  onSelect: (booking: BookingRequest) => void;
}

export function BookingListMobile({ bookings, onSelect }: BookingListMobileProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      accepted: 'bg-blue-500',
      deposit_paid: 'bg-green-500',
      confirmed: 'bg-emerald-500',
      completed: 'bg-purple-500',
      rejected: 'bg-red-500',
      cancelled: 'bg-slate-500',
    };
    return colors[status] || 'bg-slate-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      accepted: 'Принято',
      deposit_paid: 'Депозит',
      confirmed: 'Готово',
      completed: 'Завершено',
      rejected: 'Отклонено',
      cancelled: 'Отменено',
    };
    return labels[status] || status;
  };

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Calendar className="w-10 h-10 text-slate-400" />
        </div>
        <p className="text-slate-400 text-center">Нет букингов</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking, index) => (
        <motion.button
          key={booking.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(booking)}
          className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate mb-1">
                {booking.eventTitle}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{booking.performer?.displayName}</span>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-slate-300 truncate">{formatDate(booking.eventDate)}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-slate-300">{booking.startTime}</span>
            </div>

            {/* Location */}
            {booking.venueCity && (
              <div className="flex items-center gap-2 text-sm col-span-2">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-slate-300 truncate">{booking.venueCity}</span>
              </div>
            )}
          </div>

          {/* Price Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-sm text-slate-400">Стоимость</span>
            <span className="text-lg font-bold text-white">
              {formatPrice(booking.offeredPrice)}
            </span>
          </div>

          {/* Payment Progress */}
          {(booking.status === 'accepted' || booking.status === 'deposit_paid') && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Прогресс оплаты</span>
                <span>
                  {booking.status === 'accepted' ? '0%' : '30%'}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: booking.status === 'accepted' ? '0%' : '30%' }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                />
              </div>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
