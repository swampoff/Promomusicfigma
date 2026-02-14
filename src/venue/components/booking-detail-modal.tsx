/**
 * BOOKING DETAIL MODAL - Детальная информация о букинге
 * Полная детализация с адаптивным дизайном
 */

import { motion } from 'motion/react';
import { 
  X, Calendar, Clock, MapPin, DollarSign, Users, 
  Music, Building2, Phone, Mail, Star, Award,
  CheckCircle, AlertCircle, FileText, MessageCircle,
  Download, Share2, Printer, TrendingUp, Zap, Info
} from 'lucide-react';
import type { BookingRequest } from '../types/venue-types';

interface BookingDetailModalProps {
  booking: BookingRequest;
  onClose: () => void;
  onAction?: (action: string) => void;
}

export function BookingDetailModal({ booking, onClose, onAction }: BookingDetailModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Ожидает ответа', color: 'text-yellow-400', icon: AlertCircle },
      accepted: { label: 'Принято артистом', color: 'text-blue-400', icon: CheckCircle },
      deposit_paid: { label: 'Депозит оплачен', color: 'text-green-400', icon: CheckCircle },
      confirmed: { label: 'Подтверждено', color: 'text-emerald-400', icon: CheckCircle },
      completed: { label: 'Завершено', color: 'text-purple-400', icon: Award },
      rejected: { label: 'Отклонено', color: 'text-red-400', icon: X },
      cancelled: { label: 'Отменено', color: 'text-slate-400', icon: X },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo(booking.status);
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl my-8 rounded-2xl bg-[#0a0a14] border border-white/20 shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                <span className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {booking.eventTitle}
              </h2>
              <p className="text-slate-400">
                {formatDate(booking.eventDate)}
              </p>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-all">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Написать</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-all">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Договор</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-all">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Скачать</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-all">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Поделиться</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          
          {/* Artist Info */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-indigo-400" />
              Артист
            </h3>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-lg">{booking.performer?.displayName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-slate-300 text-sm">4.8 (127 отзывов)</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>+7 (999) 123-45-67</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>artist@example.com</span>
                </div>
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Детали мероприятия
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Дата</p>
                    <p className="text-white font-medium">{formatDate(booking.eventDate)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Время</p>
                    <p className="text-white font-medium">{booking.startTime} ({booking.durationHours}ч)</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Место</p>
                    <p className="text-white font-medium">{booking.venueAddress || 'Не указано'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Аудитория</p>
                    <p className="text-white font-medium">{booking.expectedAudience || 'Не указано'} чел.</p>
                  </div>
                </div>
              </div>
            </div>

            {booking.eventDescription && (
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm mb-1">Описание</p>
                <p className="text-white">{booking.eventDescription}</p>
              </div>
            )}
          </section>

          {/* Financial Details */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Финансы
            </h3>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
              <div className="space-y-3">
                {/* Total */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-slate-300">Общая стоимость</span>
                  <span className="text-2xl font-bold text-white">{formatPrice(booking.offeredPrice)}</span>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Артисту ({100 - (booking.platformCommission / booking.offeredPrice * 100).toFixed(0)}%)</span>
                    <span className="text-emerald-300 font-medium">{formatPrice(booking.performerFee || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Комиссия платформы (10%)</span>
                    <span className="text-slate-300 font-medium">{formatPrice(booking.platformCommission || 0)}</span>
                  </div>
                </div>

                {/* Payment Schedule */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${booking.depositAmount ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <span className="text-slate-300 text-sm">Депозит (30%)</span>
                    </div>
                    <span className="text-white font-medium">{formatPrice(booking.depositAmount || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${booking.status === 'confirmed' ? 'bg-green-400' : 'bg-slate-400'}`}></div>
                      <span className="text-slate-300 text-sm">Остаток (70%)</span>
                    </div>
                    <span className="text-white font-medium">{formatPrice((booking.offeredPrice - (booking.depositAmount || 0)))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${booking.depositAmount ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-500/10 border border-slate-500/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {booking.depositAmount ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm font-medium text-white">Депозит</span>
                </div>
                <p className="text-xs text-slate-400">
                  {booking.depositAmount ? 'Оплачен' : 'Ожидает оплаты'}
                </p>
              </div>

              <div className={`p-3 rounded-lg ${booking.status === 'confirmed' ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-500/10 border border-slate-500/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {booking.status === 'confirmed' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm font-medium text-white">Финальный платеж</span>
                </div>
                <p className="text-xs text-slate-400">
                  {booking.status === 'confirmed' ? 'Оплачен' : 'Ожидает оплаты'}
                </p>
              </div>
            </div>
          </section>

          {/* Technical Requirements */}
          {booking.technicalRequirements && Object.keys(booking.technicalRequirements).length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Технические требования
              </h3>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Pioneer DJ setup (CDJ-3000 x2, DJM-900NXS2)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Профессиональная звуковая система от 10kW</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Мониторы на сцене</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Освещение: базовый свет + smoke machine</span>
                  </li>
                </ul>
              </div>
            </section>
          )}

          {/* Timeline */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              История
            </h3>
            <div className="space-y-3">
              {booking.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Заявка создана</p>
                    <p className="text-slate-400 text-xs">{new Date(booking.createdAt).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
              )}
              {booking.acceptedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Артист принял заявку</p>
                    <p className="text-slate-400 text-xs">{new Date(booking.acceptedAt).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
              )}
              {booking.depositPaidAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Депозит оплачен</p>
                    <p className="text-slate-400 text-xs">{new Date(booking.depositPaidAt).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Info Box */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Важная информация</p>
                <p className="text-blue-300/80">
                  После оплаты депозита дата будет забронирована. Финальный платеж необходимо произвести за 24 часа до мероприятия.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row gap-3">
            {booking.status === 'accepted' && (
              <button
                onClick={() => onAction?.('pay-deposit')}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Оплатить депозит {formatPrice(booking.depositAmount || 0)}
              </button>
            )}
            {booking.status === 'deposit_paid' && (
              <button
                onClick={() => onAction?.('pay-final')}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium hover:from-emerald-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Оплатить остаток {formatPrice(booking.offeredPrice - (booking.depositAmount || 0))}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              Закрыть
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}