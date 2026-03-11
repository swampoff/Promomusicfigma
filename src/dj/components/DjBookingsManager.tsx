/**
 * DJ BOOKINGS MANAGER - Управление букингами диджея
 * Входящие заявки, активные букинги, история, календарь доступности
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Clock, MapPin, DollarSign, User, Phone, Mail,
  Check, X, MessageSquare, Star, ChevronRight, Filter,
  AlertCircle, CheckCircle2, Music, Headphones, ArrowRight
} from 'lucide-react';

type BookingTab = 'incoming' | 'active' | 'history' | 'calendar';

interface Booking {
  id: string;
  bookerName: string;
  bookerPhone: string;
  bookerEmail: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  duration: number;
  venue: string;
  city: string;
  genres: string[];
  specialRequests: string;
  basePrice: number;
  addonsTotal: number;
  totalAmount: number;
  depositAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export function DjBookingsManager() {
  const [activeTab, setActiveTab] = useState<BookingTab>('incoming');


  const incomingBookings: Booking[] = [
    {
      id: '1',
      bookerName: 'Mutabor Club',
      bookerPhone: '+7 (495) 640-24-36',
      bookerEmail: 'booking@mutaborclub.com',
      eventName: 'Techno Résidence @ Mutabor',
      eventType: 'Клубная резиденция',
      eventDate: '14 мар 2026',
      eventTime: '23:00 - 06:00',
      duration: 7,
      venue: 'Mutabor',
      city: 'Москва',
      genres: ['Techno', 'Industrial Techno', 'Acid'],
      specialRequests: 'Два слота: warm-up 23:00–01:00 и main set 03:00–06:00. Нужен доступ к Pioneer CDJ-3000 и микшеру DJM-V10.',
      basePrice: 50000,
      addonsTotal: 15000,
      totalAmount: 65000,
      depositAmount: 19500,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '3 часа назад',
    },
    {
      id: '2',
      bookerName: 'Севкабель Порт',
      bookerPhone: '+7 (812) 458-50-31',
      bookerEmail: 'events@sevcable.com',
      eventName: 'Awakening Festival',
      eventType: 'Фестиваль',
      eventDate: '18 апр 2026',
      eventTime: '14:00 - 22:00',
      duration: 3,
      venue: 'Севкабель Порт',
      city: 'Санкт-Петербург',
      genres: ['Melodic Techno', 'Progressive House', 'Trance'],
      specialRequests: 'Сет на открытой сцене с 17:00 до 20:00. Трансфер из Москвы и проживание в отеле. Backstage pass на +2.',
      basePrice: 120000,
      addonsTotal: 30000,
      totalAmount: 150000,
      depositAmount: 45000,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '1 день назад',
    },
  ];

  const activeBookings: Booking[] = [
    {
      id: '3',
      bookerName: 'Gazgolder Club',
      bookerPhone: '+7 (495) 220-07-07',
      bookerEmail: 'booking@gazgolder.com',
      eventName: 'Deep Sessions @ Gazgolder',
      eventType: 'Клубная вечеринка',
      eventDate: '21 мар 2026',
      eventTime: '23:30 - 06:00',
      duration: 6,
      venue: 'Gazgolder',
      city: 'Москва',
      genres: ['Deep House', 'Afro House', 'Melodic House'],
      specialRequests: 'Основной сет с 01:00. Собственный звукоинженер.',
      basePrice: 65000,
      addonsTotal: 15000,
      totalAmount: 80000,
      depositAmount: 24000,
      status: 'confirmed',
      paymentStatus: 'deposit_paid',
      createdAt: '4 дня назад',
    },
    {
      id: '5',
      bookerName: 'Blank Club',
      bookerPhone: '+7 (495) 600-14-14',
      bookerEmail: 'events@blankclub.ru',
      eventName: 'Warehouse Rave @ Blank',
      eventType: 'Рейв',
      eventDate: '4 апр 2026',
      eventTime: '23:59 - 08:00',
      duration: 8,
      venue: 'Blank',
      city: 'Москва',
      genres: ['Hard Techno', 'Rave', 'Breakbeat'],
      specialRequests: 'Closing set 05:00–08:00. Нужен Traktor D2 + собственный ноутбук.',
      basePrice: 45000,
      addonsTotal: 10000,
      totalAmount: 55000,
      depositAmount: 16500,
      status: 'confirmed',
      paymentStatus: 'deposit_paid',
      createdAt: '1 неделю назад',
    },
  ];

  const historyBookings: Booking[] = [
    {
      id: '6',
      bookerName: 'Propaganda Club',
      bookerPhone: '+7 (495) 624-57-32',
      bookerEmail: 'dj@propagandamoscow.com',
      eventName: 'Ночь электроники @ Propaganda',
      eventType: 'Клубная вечеринка',
      eventDate: '7 мар 2026',
      eventTime: '23:00 - 05:00',
      duration: 6,
      venue: 'Propaganda',
      city: 'Москва',
      genres: ['House', 'Disco', 'Tech House'],
      specialRequests: '',
      basePrice: 35000,
      addonsTotal: 10000,
      totalAmount: 45000,
      depositAmount: 13500,
      status: 'completed',
      paymentStatus: 'fully_paid',
      createdAt: '3 дня назад',
    },
    {
      id: '7',
      bookerName: 'Griboedov Club',
      bookerPhone: '+7 (812) 764-43-55',
      bookerEmail: 'booking@griboedovclub.ru',
      eventName: 'Bassline Showcase @ Griboedov',
      eventType: 'Клубный шоукейс',
      eventDate: '28 фев 2026',
      eventTime: '23:00 - 05:00',
      duration: 6,
      venue: 'Griboedov',
      city: 'Санкт-Петербург',
      genres: ['Drum & Bass', 'Jungle', 'Breakbeat'],
      specialRequests: '',
      basePrice: 28000,
      addonsTotal: 7000,
      totalAmount: 35000,
      depositAmount: 10500,
      status: 'completed',
      paymentStatus: 'fully_paid',
      createdAt: '2 недели назад',
    },
    {
      id: '8',
      bookerName: 'Mutabor Club',
      bookerPhone: '+7 (495) 640-24-36',
      bookerEmail: 'booking@mutaborclub.com',
      eventName: 'Новогодний рейв @ Mutabor',
      eventType: 'Праздник',
      eventDate: '1 янв 2026',
      eventTime: '02:00 - 10:00',
      duration: 8,
      venue: 'Mutabor',
      city: 'Москва',
      genres: ['Techno', 'Acid Techno', 'Industrial'],
      specialRequests: '',
      basePrice: 70000,
      addonsTotal: 20000,
      totalAmount: 90000,
      depositAmount: 27000,
      status: 'completed',
      paymentStatus: 'fully_paid',
      createdAt: '2 месяца назад',
    },
    {
      id: '9',
      bookerName: 'Powerhouse Moscow',
      bookerPhone: '+7 (495) 989-10-22',
      bookerEmail: 'events@powerhouse.moscow',
      eventName: 'Kasual Grooves @ Powerhouse',
      eventType: 'Клубная вечеринка',
      eventDate: '14 фев 2026',
      eventTime: '22:00 - 04:00',
      duration: 6,
      venue: 'Powerhouse',
      city: 'Москва',
      genres: ['Minimal', 'Micro House', 'Deep Tech'],
      specialRequests: '',
      basePrice: 40000,
      addonsTotal: 10000,
      totalAmount: 50000,
      depositAmount: 15000,
      status: 'completed',
      paymentStatus: 'fully_paid',
      createdAt: '3 недели назад',
    },
  ];

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Ожидает ответа' },
    accepted: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Принят' },
    deposit_paid: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Депозит оплачен' },
    confirmed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Подтверждён' },
    completed: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Завершён' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Отменён' },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Отклонён' },
  };

  const tabs = [
    { id: 'incoming' as BookingTab, label: 'Входящие', count: incomingBookings.length },
    { id: 'active' as BookingTab, label: 'Активные', count: activeBookings.length },
    { id: 'history' as BookingTab, label: 'История', count: historyBookings.length },
    { id: 'calendar' as BookingTab, label: 'Календарь', count: 0 },
  ];

  const currentBookings = activeTab === 'incoming' ? incomingBookings : activeTab === 'active' ? activeBookings : historyBookings;

  // Calendar availability — March 2026
  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const booked = [7, 14, 21, 22, 28].includes(day);
    const blocked = [8, 9, 15, 16].includes(day);
    return { day, booked, blocked, available: !booked && !blocked };
  });

  return (
    <div className="space-y-3 xs:space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-lg xs:text-xl lg:text-2xl xl:text-3xl font-black text-white flex items-center gap-1.5 xs:gap-2">
          <Calendar className="w-4 h-4 xs:w-5 xs:h-5 lg:w-6 lg:h-6 text-cyan-400" />
          Управление букингами
        </h1>
        <p className="text-[10px] xs:text-xs lg:text-sm text-gray-400 mt-1">Входящие заявки, активные букинги и история выступлений</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1.5 xs:gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg xs:rounded-xl text-[10px] xs:text-xs lg:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      {activeTab === 'calendar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-lg xs:rounded-xl lg:rounded-2xl p-3 xs:p-4 lg:p-6 border border-white/10"
        >
          <h3 className="text-sm xs:text-base lg:text-lg font-bold text-white mb-3 xs:mb-4">Март 2026</h3>
          <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-3 xs:mb-4">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div key={day} className="text-center text-[10px] lg:text-xs font-bold text-gray-500 py-1">{day}</div>
            ))}
            {/* Empty days for offset (Feb 2026 starts on Sunday) */}
            {Array.from({ length: 6 }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {calendarDays.map(({ day, booked, blocked, available }) => (
              <button
                key={day}
                className={`aspect-square rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold transition-all ${
                  booked
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : blocked
                    ? 'bg-red-500/10 text-red-400/50 border border-red-500/10'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] lg:text-xs">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500/30" />
              <span className="text-gray-400">Забронировано</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
              <span className="text-gray-400">Свободно</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500/10 border border-red-500/10" />
              <span className="text-gray-400">Заблокировано</span>
            </span>
          </div>
        </motion.div>
      )}

      {/* Bookings List */}
      {activeTab !== 'calendar' && (
        <div className="space-y-3 lg:space-y-4">
          {currentBookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.pending;
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/10 hover:bg-white/[0.08] transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3 lg:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm lg:text-base font-bold text-white">{booking.eventName}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] lg:text-xs text-gray-400 flex items-center gap-1">
                        <Music className="w-3 h-3" /> {booking.eventType}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">{booking.createdAt}</span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-3 mb-3 lg:mb-4">
                  <div className="bg-white/5 rounded-lg p-2 lg:p-3">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-0.5"><Calendar className="w-2.5 h-2.5" /> Дата</span>
                    <p className="text-xs lg:text-sm text-white font-medium">{booking.eventDate}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 lg:p-3">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-0.5"><Clock className="w-2.5 h-2.5" /> Время</span>
                    <p className="text-xs lg:text-sm text-white font-medium">{booking.eventTime}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 lg:p-3">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-0.5"><MapPin className="w-2.5 h-2.5" /> Место</span>
                    <p className="text-xs lg:text-sm text-white font-medium truncate">{booking.venue}, {booking.city}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 lg:p-3">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-0.5"><Headphones className="w-2.5 h-2.5" /> Часов</span>
                    <p className="text-xs lg:text-sm text-white font-medium">{booking.duration}ч</p>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {booking.genres.map((genre) => (
                    <span key={genre} className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] font-bold text-cyan-300">
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3 mb-3 lg:mb-4">
                    <p className="text-[10px] font-bold text-yellow-400 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Пожелания клиента
                    </p>
                    <p className="text-[10px] lg:text-xs text-gray-300">{booking.specialRequests}</p>
                  </div>
                )}

                {/* Client Info + Pricing */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 pt-3 border-t border-white/5">
                  {/* Client */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium">{booking.bookerName}</p>
                      <p className="text-[10px] text-gray-500">{booking.bookerEmail}</p>
                    </div>
                  </div>
                  {/* Pricing + Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="text-right flex-1 sm:flex-none">
                      <p className="text-[10px] text-gray-500">Итого</p>
                      <p className="text-base lg:text-lg font-black text-white">{booking.totalAmount.toLocaleString()} ₽</p>
                      {booking.addonsTotal > 0 && (
                        <p className="text-[10px] text-gray-500">
                          база {booking.basePrice.toLocaleString()} + доп. {booking.addonsTotal.toLocaleString()}
                        </p>
                      )}
                    </div>
                    {booking.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2.5 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-colors"
                          title="Принять"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2.5 bg-red-500/20 rounded-xl hover:bg-red-500/30 transition-colors"
                          title="Отклонить"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2.5 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-colors"
                          title="Написать"
                        >
                          <MessageSquare className="w-4 h-4 text-blue-400" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {currentBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Нет букингов в этой категории</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}