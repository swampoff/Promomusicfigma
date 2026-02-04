/**
 * ARTIST BOOKINGS SECTION - Букинги в кабинете артиста
 * Входящие заявки, управление календарем, статистика заработка
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Clock, DollarSign, MapPin, Users, Star,
  CheckCircle, XCircle, AlertCircle, TrendingUp, Award,
  Music, Building2, Phone, Mail, MessageCircle, ChevronRight,
  Download, Filter, Search, MoreVertical, X, Info, Zap
} from 'lucide-react';
import type { BookingRequest, BookingStatus } from '../types/venue-types';

type Tab = 'incoming' | 'active' | 'history' | 'earnings' | 'calendar';

export function ArtistBookingsSection() {
  const [activeTab, setActiveTab] = useState<Tab>('incoming');
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // Mock данные входящих заявок
  const [incomingBookings] = useState<BookingRequest[]>([
    {
      id: 'booking1',
      requesterId: 'venue1',
      performerId: 'artist1',
      eventType: 'dj_set',
      eventTitle: 'Friday Night Party',
      eventDescription: 'Пятничная вечеринка в главном зале с deep house и techno',
      eventDate: '2026-02-14',
      startTime: '22:00',
      durationHours: 4,
      venueAddress: 'Москва, ул. Тверская, 15',
      expectedAudience: 150,
      offeredPrice: 60000,
      performerFee: 54000,
      platformCommission: 6000,
      status: 'pending',
      depositAmount: 18000,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      requester: {
        id: 'venue1',
        userId: 'user1',
        venueName: 'Sunset Lounge Bar',
        venueType: 'Бар',
        address: 'Москва, ул. Тверская, 15',
        city: 'Москва',
        capacity: 200,
        rating: 4.7,
        totalEvents: 45,
        createdAt: new Date().toISOString(),
      }
    },
    {
      id: 'booking2',
      requesterId: 'venue2',
      performerId: 'artist1',
      eventType: 'corporate',
      eventTitle: 'Corporate Event DJ Set',
      eventDescription: 'Корпоративное мероприятие для IT компании, 100 человек',
      eventDate: '2026-02-21',
      startTime: '19:00',
      durationHours: 3,
      venueAddress: 'Москва, Пресненская наб., 12',
      expectedAudience: 100,
      offeredPrice: 45000,
      performerFee: 40500,
      platformCommission: 4500,
      status: 'pending',
      depositAmount: 13500,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      requester: {
        id: 'venue2',
        userId: 'user2',
        venueName: 'Tech Corp',
        venueType: 'Корпоративное',
        address: 'Москва, Пресненская наб., 12',
        city: 'Москва',
        capacity: 150,
        createdAt: new Date().toISOString(),
      }
    },
    {
      id: 'booking3',
      requesterId: 'venue3',
      performerId: 'artist1',
      eventType: 'wedding',
      eventTitle: 'Wedding Reception',
      eventDescription: 'Свадебная вечеринка, разножанровая музыка',
      eventDate: '2026-03-07',
      startTime: '18:00',
      durationHours: 5,
      venueAddress: 'Москва, ул. Арбат, 25',
      expectedAudience: 80,
      offeredPrice: 75000,
      performerFee: 67500,
      platformCommission: 7500,
      status: 'pending',
      depositAmount: 22500,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      requester: {
        id: 'venue3',
        userId: 'user3',
        venueName: 'Elegant Hall',
        venueType: 'Банкетный зал',
        address: 'Москва, ул. Арбат, 25',
        city: 'Москва',
        capacity: 120,
        rating: 5.0,
        totalEvents: 28,
        createdAt: new Date().toISOString(),
      }
    },
  ]);

  // Mock активных букингов
  const [activeBookings] = useState<BookingRequest[]>([
    {
      id: 'booking4',
      requesterId: 'venue4',
      performerId: 'artist1',
      eventType: 'dj_set',
      eventTitle: 'Saturday Night Live',
      eventDescription: 'House & Techno вечеринка',
      eventDate: '2026-02-28',
      startTime: '23:00',
      durationHours: 4,
      venueAddress: 'СПб, Невский пр., 80',
      expectedAudience: 200,
      offeredPrice: 60000,
      performerFee: 54000,
      platformCommission: 6000,
      status: 'deposit_paid',
      depositAmount: 18000,
      depositPaidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      requester: {
        id: 'venue4',
        userId: 'user4',
        venueName: 'Underground Club',
        venueType: 'Клуб',
        address: 'СПб, Невский пр., 80',
        city: 'Санкт-Петербург',
        capacity: 300,
        rating: 4.8,
        totalEvents: 120,
        createdAt: new Date().toISOString(),
      }
    },
  ]);

  const stats = {
    incoming: incomingBookings.length,
    active: activeBookings.length,
    monthEarnings: 175500,
    avgBooking: 58500,
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Букинги 🎤
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Управляйте заявками на выступления и календарем
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={AlertCircle}
          label="Входящие"
          value={stats.incoming}
          color="amber"
          badge="new"
        />
        <StatCard
          icon={CheckCircle}
          label="Активные"
          value={stats.active}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label="За месяц"
          value={`${(stats.monthEarnings / 1000).toFixed(0)}K`}
          color="indigo"
          suffix="₽"
        />
        <StatCard
          icon={TrendingUp}
          label="Средний чек"
          value={`${(stats.avgBooking / 1000).toFixed(0)}K`}
          color="purple"
          suffix="₽"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton
          active={activeTab === 'incoming'}
          onClick={() => setActiveTab('incoming')}
          icon={AlertCircle}
          label="Входящие"
          badge={stats.incoming}
        />
        <TabButton
          active={activeTab === 'active'}
          onClick={() => setActiveTab('active')}
          icon={CheckCircle}
          label="Активные"
          badge={stats.active}
        />
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          icon={Calendar}
          label="История"
        />
        <TabButton
          active={activeTab === 'earnings'}
          onClick={() => setActiveTab('earnings')}
          icon={DollarSign}
          label="Заработок"
        />
        <TabButton
          active={activeTab === 'calendar'}
          onClick={() => setActiveTab('calendar')}
          icon={Calendar}
          label="Календарь"
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'incoming' && (
          <motion.div
            key="incoming"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {incomingBookings.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="Нет входящих заявок"
                description="Новые заявки на букинг появятся здесь"
              />
            ) : (
              incomingBookings.map(booking => (
                <IncomingBookingCard
                  key={booking.id}
                  booking={booking}
                  onAccept={() => {
                    setSelectedBooking(booking);
                    setShowActionModal(true);
                  }}
                  onReject={() => {
                    setSelectedBooking(booking);
                    setShowActionModal(true);
                  }}
                  onViewDetails={() => setSelectedBooking(booking)}
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {activeBookings.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="Нет активных букингов"
                description="Подтвержденные букинги появятся здесь"
              />
            ) : (
              activeBookings.map(booking => (
                <ActiveBookingCard
                  key={booking.id}
                  booking={booking}
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <EmptyState
              icon={Calendar}
              title="История букингов"
              description="Завершенные мероприятия (в разработке)"
            />
          </motion.div>
        )}

        {activeTab === 'earnings' && (
          <motion.div
            key="earnings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <EarningsView />
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <CalendarView bookings={[...incomingBookings, ...activeBookings]} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && selectedBooking && (
          <BookingActionModal
            booking={selectedBooking}
            onClose={() => {
              setShowActionModal(false);
              setSelectedBooking(null);
            }}
            onAccept={(booking) => {
              console.log('Accept booking:', booking.id);
              setShowActionModal(false);
            }}
            onReject={(booking, reason) => {
              console.log('Reject booking:', booking.id, reason);
              setShowActionModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'amber' | 'green' | 'indigo' | 'purple';
  badge?: string;
  suffix?: string;
}

function StatCard({ icon: Icon, label, value, color, badge, suffix }: StatCardProps) {
  const colorClasses = {
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/30 text-amber-400',
    green: 'from-green-500/10 to-green-600/5 border-green-500/30 text-green-400',
    indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/30 text-indigo-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <Icon className="w-5 h-5" />
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
            {badge}
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
        {value}{suffix}
      </p>
      <p className="text-xs sm:text-sm">{label}</p>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

function TabButton({ active, onClick, icon: Icon, label, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

interface IncomingBookingCardProps {
  booking: BookingRequest;
  onAccept: () => void;
  onReject: () => void;
  onViewDetails: () => void;
}

function IncomingBookingCard({ booking, onAccept, onReject, onViewDetails }: IncomingBookingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      dj_set: 'DJ Set',
      concert: 'Концерт',
      live: 'Live выступление',
      corporate: 'Корпоратив',
      wedding: 'Свадьба',
      private: 'Частное мероприятие',
    };
    return labels[type] || type;
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'только что';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}м назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}ч назад`;
    const days = Math.floor(hours / 24);
    return `${days}д назад`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">{booking.eventTitle}</h3>
            <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
              Новая заявка
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-3">{booking.eventDescription}</p>
          
          {/* Venue Info */}
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-white font-medium">{booking.requester?.venueName}</span>
            {booking.requester?.rating && (
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs">{booking.requester.rating}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">
            {timeAgo(booking.createdAt)}
          </p>
          <span className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs">
            {getEventTypeLabel(booking.eventType)}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 rounded-xl bg-white/5">
        <div>
          <p className="text-xs text-slate-500 mb-1">Дата</p>
          <p className="text-white font-medium text-sm">{formatDate(booking.eventDate)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Время</p>
          <p className="text-white font-medium text-sm">
            {booking.startTime} ({booking.durationHours}ч)
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Гостей</p>
          <p className="text-white font-medium text-sm">{booking.expectedAudience}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Локация</p>
          <p className="text-white font-medium text-sm truncate">{booking.requester?.city}</p>
        </div>
      </div>

      {/* Financial Info */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">Ваш гонорар:</span>
          <span className="text-2xl font-bold text-green-400">{formatPrice(booking.performerFee)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Депозит (30%):</span>
          <span>{formatPrice(booking.depositAmount || 0)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Полная стоимость:</span>
          <span>{formatPrice(booking.offeredPrice)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onReject}
          className="flex-1 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all font-medium"
        >
          <XCircle className="w-5 h-5 inline mr-2" />
          Отклонить
        </button>
        <button
          onClick={onAccept}
          className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-lg"
        >
          <CheckCircle className="w-5 h-5 inline mr-2" />
          Принять
        </button>
      </div>

      {/* Quick Contact */}
      <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
        <button className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-sm">
          <MessageCircle className="w-4 h-4 inline mr-1" />
          Написать
        </button>
        <button 
          onClick={onViewDetails}
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-sm"
        >
          <Info className="w-4 h-4 inline mr-1" />
          Подробнее
        </button>
      </div>
    </motion.div>
  );
}

interface ActiveBookingCardProps {
  booking: BookingRequest;
}

function ActiveBookingCard({ booking }: ActiveBookingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const daysUntil = Math.ceil((new Date(booking.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{booking.eventTitle}</h3>
          <p className="text-slate-400 text-sm">{booking.requester?.venueName}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm font-semibold">
          Подтверждено
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {new Date(booking.eventDate).toLocaleDateString('ru-RU')}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {booking.startTime}
        </span>
        {daysUntil > 0 && (
          <span className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            Через {daysUntil} дн.
          </span>
        )}
      </div>

      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Гонорар:</span>
          <span className="text-xl font-bold text-green-400">{formatPrice(booking.performerFee)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function EarningsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
          <Award className="w-10 h-10 text-green-400 mb-3" />
          <p className="text-3xl font-bold text-white mb-1">175,500₽</p>
          <p className="text-slate-400 text-sm">Заработано в этом месяце</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20">
          <TrendingUp className="w-10 h-10 text-indigo-400 mb-3" />
          <p className="text-3xl font-bold text-white mb-1">+23%</p>
          <p className="text-slate-400 text-sm">Рост по сравнению с прошлым</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20">
          <CheckCircle className="w-10 h-10 text-purple-400 mb-3" />
          <p className="text-3xl font-bold text-white mb-1">12</p>
          <p className="text-slate-400 text-sm">Завершенных мероприятий</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">График заработка</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {[40, 60, 45, 80, 55, 70, 90].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-purple-600"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-slate-500">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ bookings }: { bookings: BookingRequest[] }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Февраль 2026</h3>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
            <ChevronRight className="w-5 h-5 text-white rotate-180" />
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {bookings.map(booking => (
          <div key={booking.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-1">{booking.eventTitle}</p>
                <p className="text-sm text-slate-400">
                  {new Date(booking.eventDate).toLocaleDateString('ru-RU')} • {booking.requester?.venueName}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                booking.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                booking.status === 'deposit_paid' ? 'bg-green-500/20 text-green-300' :
                'bg-indigo-500/20 text-indigo-300'
              }`}>
                {booking.status === 'pending' ? 'Ожидает' : 
                 booking.status === 'deposit_paid' ? 'Подтверждено' : booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="py-12 text-center">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Нет запланированных мероприятий</p>
        </div>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <Icon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

// Modal для принятия/отклонения заявки
function BookingActionModal({ booking, onClose, onAccept, onReject }: any) {
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {action === 'accept' ? 'Принять заявку' : action === 'reject' ? 'Отклонить заявку' : 'Действие'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-white font-semibold mb-2">{booking.eventTitle}</h4>
          <p className="text-slate-400 text-sm mb-4">{booking.requester?.venueName}</p>
          
          <div className="p-4 rounded-xl bg-white/5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Дата:</span>
              <span className="text-white">{new Date(booking.eventDate).toLocaleDateString('ru-RU')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Время:</span>
              <span className="text-white">{booking.startTime} ({booking.durationHours}ч)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ваш гонорар:</span>
              <span className="text-green-400 font-bold">
                {booking.performerFee.toLocaleString()}₽
              </span>
            </div>
          </div>
        </div>

        {action === 'reject' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Причина отклонения (опционально)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Укажите причину..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-red-500/50 transition-all outline-none resize-none"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3">
          {!action ? (
            <>
              <button
                onClick={() => setAction('reject')}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all font-medium"
              >
                Отклонить
              </button>
              <button
                onClick={() => setAction('accept')}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
              >
                Принять
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setAction(null)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Назад
              </button>
              <button
                onClick={() => {
                  if (action === 'accept') {
                    onAccept(booking);
                  } else {
                    onReject(booking, rejectionReason);
                  }
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  action === 'accept'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Подтвердить
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
