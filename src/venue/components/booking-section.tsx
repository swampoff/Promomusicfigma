/**
 * BOOKING SECTION - Букинг артистов и DJ для заведения
 * Enterprise-система поиска, бронирования и управления букингами
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, Star, MapPin, Clock, DollarSign, Calendar,
  User, Music, TrendingUp, CheckCircle, XCircle, AlertCircle,
  CreditCard, X, ChevronRight, MessageCircle, Phone, Mail,
  Award, Users, Zap, Shield, Info, Send, ExternalLink, Loader2
} from 'lucide-react';
import type { 
  ArtistProfile, 
  BookingRequest, 
  BookingStatus,
  BookingEventType 
} from '../types/venue-types';
import * as bookingApi from '../api/booking-api';
import { fetchVenueBookings } from '@/utils/api/venue-cabinet';
import { getSupabaseClient } from '@/utils/supabase/client';
import { BookingPaymentModal } from './booking-payment-modal';
import { BookingDetailModal } from './booking-detail-modal';

const supabase = getSupabaseClient();

type Tab = 'find' | 'my-bookings' | 'calendar';
type BookingFilter = 'all' | 'pending' | 'confirmed' | 'completed';

export function BookingSection() {
  const [activeTab, setActiveTab] = useState<Tab>('find');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'deposit' | 'final'>('deposit');
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Mock данные артистов (поиск артистов - без API эндпоинта)
  const [artists] = useState<ArtistProfile[]>([
    {
      id: 'artist1',
      userId: 'user1',
      displayName: 'DJ Max',
      artistName: 'DJ Max',
      bio: 'Профессиональный DJ с 10+ летним опытом. Специализируюсь на House, Techno и Progressive.',
      genres: ['House', 'Techno', 'Progressive'],
      avatar: null,
      coverImage: null,
      hourlyRate: 15000,
      minimumBookingHours: 3,
      rating: 4.8,
      totalBookings: 127,
      yearsExperience: 10,
      location: 'Москва',
      socialLinks: {
        instagram: '@djmax',
        spotify: 'djmax',
        soundcloud: 'djmax'
      },
      technicalRider: {
        equipment: ['CDJ-3000 x2', 'DJM-900NXS2', 'Monitors'],
        soundSystem: 'Профессиональная звуковая система от 10kW',
        lighting: 'Базовый свет',
        other: 'Smoke machine желательно'
      },
      availability: {
        friday: true,
        saturday: true,
        sunday: true
      },
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'artist2',
      userId: 'user2',
      displayName: 'Anna Deep',
      artistName: 'Anna Deep',
      bio: 'Мелодичный Deep House и эмоциональный Electronica. Создаю атмосферу для незабываемых вечеров.',
      genres: ['Deep House', 'Melodic Techno', 'Electronica'],
      avatar: null,
      coverImage: null,
      hourlyRate: 12000,
      minimumBookingHours: 4,
      rating: 4.9,
      totalBookings: 85,
      yearsExperience: 7,
      location: 'Санкт-Петербург',
      socialLinks: {
        instagram: '@annadeep',
        spotify: 'annadeep'
      },
      technicalRider: {
        equipment: ['Pioneer setup', 'Laptop stand'],
        soundSystem: 'Качественная акустика',
        lighting: 'Цветной свет приветствуется'
      },
      availability: {
        thursday: true,
        friday: true,
        saturday: true
      },
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'artist3',
      userId: 'user3',
      displayName: 'The Beat Brothers',
      artistName: 'The Beat Brothers',
      bio: 'Live band с 5 музыкантами. Covers + Original. Funk, Soul, Pop, Rock.',
      genres: ['Live Band', 'Funk', 'Soul', 'Pop', 'Rock'],
      avatar: null,
      coverImage: null,
      hourlyRate: 35000,
      minimumBookingHours: 2,
      rating: 5.0,
      totalBookings: 64,
      yearsExperience: 12,
      location: 'Москва',
      socialLinks: {
        instagram: '@beatbrothers',
        youtube: 'beatbrothers'
      },
      technicalRider: {
        equipment: ['Full backline', 'Drums', 'Keys', 'Guitar', 'Bass', 'Vocals'],
        soundSystem: 'Профессиональный PA system',
        lighting: 'Stage lighting обязательно',
        other: 'Sound engineer required'
      },
      availability: {
        friday: true,
        saturday: true
      },
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'artist4',
      userId: 'user4',
      displayName: 'Elena Voice',
      artistName: 'Elena Voice',
      bio: 'Вокалистка с джазовым и soul репертуаром. Акустические сеты и live band.',
      genres: ['Jazz', 'Soul', 'Blues', 'Acoustic'],
      avatar: null,
      coverImage: null,
      hourlyRate: 20000,
      minimumBookingHours: 2,
      rating: 4.95,
      totalBookings: 92,
      yearsExperience: 15,
      location: 'Москва',
      socialLinks: {
        instagram: '@elenavoice',
        youtube: 'elenavoice',
        spotify: 'elenavoice'
      },
      technicalRider: {
        equipment: ['Vocal mic (SM58)', 'Monitor'],
        soundSystem: 'Качественная акустика',
        lighting: 'Мягкий свет',
        other: 'Piano желательно'
      },
      availability: {
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true
      },
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'artist5',
      userId: 'user5',
      displayName: 'Techno Dmitry',
      artistName: 'Techno Dmitry',
      bio: 'Hard Techno и Industrial звучание. Энергичные сеты для клубов.',
      genres: ['Techno', 'Hard Techno', 'Industrial'],
      avatar: null,
      coverImage: null,
      hourlyRate: 18000,
      minimumBookingHours: 4,
      rating: 4.7,
      totalBookings: 156,
      yearsExperience: 8,
      location: 'Москва',
      socialLinks: {
        instagram: '@technodmitry',
        soundcloud: 'technodmitry'
      },
      technicalRider: {
        equipment: ['CDJ-3000 x2', 'DJM-V10', 'Monitors'],
        soundSystem: 'Мощная звуковая система 15kW+',
        lighting: 'Активный свет, laser',
        other: 'Smoke machine обязательно'
      },
      availability: {
        friday: true,
        saturday: true
      },
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ]);

  // Букинги - загрузка из API с fallback на моки
  const [bookings, setBookings] = useState<BookingRequest[]>([
    {
      id: 'booking1',
      requesterId: 'venue1',
      performerId: 'artist1',
      eventType: 'dj_set',
      eventTitle: 'Friday Night Party',
      eventDescription: 'Пятничная вечеринка в главном зале',
      eventDate: '2026-02-14',
      startTime: '22:00',
      durationHours: 4,
      venueAddress: 'ул. Тверская, 15',
      expectedAudience: 150,
      offeredPrice: 60000,
      performerFee: 54000,
      platformCommission: 6000,
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      performer: artists[0],
    },
    {
      id: 'booking2',
      requesterId: 'venue1',
      performerId: 'artist2',
      eventType: 'dj_set',
      eventTitle: 'Sunset Session',
      eventDescription: 'Вечерний DJ set на террасе',
      eventDate: '2026-02-20',
      startTime: '19:00',
      durationHours: 5,
      venueAddress: 'ул. Тверская, 15',
      expectedAudience: 100,
      offeredPrice: 60000,
      performerFee: 54000,
      platformCommission: 6000,
      status: 'deposit_paid',
      depositAmount: 18000,
      depositPaidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      performer: artists[1],
    },
  ]);

  // Load bookings from API
  useEffect(() => {
    setLoadingBookings(true);
    fetchVenueBookings().then((data) => {
      if (data && data.length > 0) {
        const mapped: BookingRequest[] = data.map((b) => ({
          id: b.id,
          requesterId: b.requesterId,
          performerId: b.performerId,
          eventType: (b.eventType || 'dj_set') as BookingEventType,
          eventTitle: b.eventTitle,
          eventDescription: b.eventDescription,
          eventDate: b.eventDate,
          startTime: b.startTime,
          durationHours: b.durationHours,
          venueAddress: b.venueName || '',
          venueCity: b.venueCity,
          expectedAudience: 0,
          offeredPrice: b.offeredPrice,
          performerFee: b.finalAmount || b.offeredPrice * 0.9,
          platformCommission: b.offeredPrice * 0.1,
          status: b.status as BookingStatus,
          depositAmount: b.depositAmount,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
          performer: b.performer ? {
            id: b.performer.id,
            userId: b.performer.id,
            displayName: b.performer.displayName,
            artistName: b.performer.displayName,
            bio: '',
            genres: [],
            avatar: b.performer.avatarUrl || null,
            coverImage: null,
            hourlyRate: 0,
            minimumBookingHours: 0,
            rating: 0,
            totalBookings: 0,
            yearsExperience: 0,
            location: '',
            socialLinks: {},
            createdAt: b.createdAt,
          } : undefined,
        }));
        setBookings(mapped);
      }
    }).catch(console.error).finally(() => setLoadingBookings(false));
  }, []);

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = selectedGenre === 'all' || artist.genres.includes(selectedGenre);
    const matchesPrice = artist.hourlyRate >= priceRange[0] && artist.hourlyRate <= priceRange[1];
    return matchesSearch && matchesGenre && matchesPrice;
  });

  const filteredBookings = bookings.filter(booking => {
    if (bookingFilter === 'all') return true;
    if (bookingFilter === 'pending') return booking.status === 'pending' || booking.status === 'accepted';
    if (bookingFilter === 'confirmed') return booking.status === 'deposit_paid' || booking.status === 'confirmed';
    if (bookingFilter === 'completed') return booking.status === 'completed';
    return true;
  });

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending' || b.status === 'accepted').length,
    confirmed: bookings.filter(b => b.status === 'deposit_paid' || b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Букинг артистов 🎤
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Найдите и забронируйте лучших артистов для вашего заведения
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton
          active={activeTab === 'find'}
          onClick={() => setActiveTab('find')}
          icon={Search}
          label="Поиск артистов"
        />
        <TabButton
          active={activeTab === 'my-bookings'}
          onClick={() => setActiveTab('my-bookings')}
          icon={Calendar}
          label="Мои букинги"
          badge={bookingStats.pending}
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
        {activeTab === 'find' && (
          <motion.div
            key="find"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Поиск по имени или жанру..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
                />
              </div>

              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
              >
                <option value="all">Все жанры</option>
                <option value="House">House</option>
                <option value="Techno">Techno</option>
                <option value="Deep House">Deep House</option>
                <option value="Live Band">Live Band</option>
                <option value="Jazz">Jazz</option>
              </select>
            </div>

            {/* Artists Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredArtists.map(artist => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onClick={() => setSelectedArtist(artist)}
                />
              ))}
            </div>

            {filteredArtists.length === 0 && (
              <div className="py-12 text-center">
                <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Артисты не найдены</h3>
                <p className="text-slate-400">Попробуйте изменить фильтры поиска</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'my-bookings' && (
          <motion.div
            key="my-bookings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Всего"
                value={bookingStats.total}
                color="blue"
                onClick={() => setBookingFilter('all')}
                active={bookingFilter === 'all'}
              />
              <StatCard
                label="Ожидают"
                value={bookingStats.pending}
                color="amber"
                onClick={() => setBookingFilter('pending')}
                active={bookingFilter === 'pending'}
              />
              <StatCard
                label="Подтверждены"
                value={bookingStats.confirmed}
                color="green"
                onClick={() => setBookingFilter('confirmed')}
                active={bookingFilter === 'confirmed'}
              />
              <StatCard
                label="Завершены"
                value={bookingStats.completed}
                color="purple"
                onClick={() => setBookingFilter('completed')}
                active={bookingFilter === 'completed'}
              />
            </div>

            {/* Bookings List */}
            <div className="space-y-3">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={() => setSelectedBooking(booking)}
                  onPayDeposit={() => {
                    setSelectedBooking(booking);
                    setPaymentType('deposit');
                    setShowPaymentModal(true);
                  }}
                  onPayFinal={() => {
                    setSelectedBooking(booking);
                    setPaymentType('final');
                    setShowPaymentModal(true);
                  }}
                />
              ))}
            </div>

            {filteredBookings.length === 0 && (
              <div className="py-12 text-center">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Нет букингов</h3>
                <p className="text-slate-400 mb-6">
                  {bookingFilter === 'all' 
                    ? 'Начните с поиска артистов'
                    : 'Нет букингов с выбранным статусом'}
                </p>
                {bookingFilter === 'all' && (
                  <button
                    onClick={() => setActiveTab('find')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
                  >
                    Найти артистов
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <CalendarView bookings={bookings} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Artist Profile Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <ArtistProfileModal
            artist={selectedArtist}
            onClose={() => setSelectedArtist(null)}
            onBook={() => {
              setShowBookingModal(true);
              setSelectedArtist(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Booking Request Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <BookingRequestModal
            artist={selectedArtist}
            onClose={() => setShowBookingModal(false)}
            onSubmit={(data) => {
              console.log('Booking request:', data);
              setShowBookingModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && !showPaymentModal && (
          <BookingDetailModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onAction={(action) => {
              if (action === 'pay-deposit') {
                setPaymentType('deposit');
                setShowPaymentModal(true);
              } else if (action === 'pay-final') {
                setPaymentType('final');
                setShowPaymentModal(true);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Booking Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <BookingPaymentModal
            booking={selectedBooking}
            onClose={() => setShowPaymentModal(false)}
            paymentType={paymentType}
            onPayment={() => {
              console.log('Payment made for booking:', selectedBooking);
              setShowPaymentModal(false);
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

interface ArtistCardProps {
  artist: ArtistProfile;
  onClick: () => void;
}

function ArtistCard({ artist, onClick }: ArtistCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          {artist.avatar ? (
            <img src={artist.avatar} alt={artist.displayName} className="w-full h-full rounded-xl object-cover" />
          ) : (
            <User className="w-10 h-10 text-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold truncate">{artist.displayName}</h3>
                {artist.verifiedAt && (
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" title="Verified" />
                )}
              </div>
              <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                {artist.bio}
              </p>
            </div>

            {artist.rating && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 flex-shrink-0">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-semibold">{artist.rating}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-3">
            {artist.genres.slice(0, 3).map(genre => (
              <span key={genre} className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">
                {genre}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {artist.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {artist.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {formatPrice(artist.hourlyRate)}/час
            </span>
            {artist.totalBookings && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {artist.totalBookings} букингов
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: 'blue' | 'amber' | 'green' | 'purple';
  onClick: () => void;
  active: boolean;
}

function StatCard({ label, value, color, onClick, active }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-400',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/30 text-amber-400',
    green: 'from-green-500/10 to-green-600/5 border-green-500/30 text-green-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/30 text-purple-400',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-xl bg-gradient-to-br border transition-all ${colorClasses[color]} ${
        active ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''
      }`}
    >
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm">{label}</p>
    </motion.button>
  );
}

interface BookingCardProps {
  booking: BookingRequest;
  onViewDetails?: () => void;
  onPayDeposit?: () => void;
  onPayFinal?: () => void;
}

function BookingCard({ booking, onViewDetails, onPayDeposit, onPayFinal }: BookingCardProps) {
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/20 text-amber-300';
      case 'accepted': return 'bg-blue-500/20 text-blue-300';
      case 'deposit_paid': return 'bg-indigo-500/20 text-indigo-300';
      case 'confirmed': return 'bg-green-500/20 text-green-300';
      case 'completed': return 'bg-purple-500/20 text-purple-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      case 'cancelled': return 'bg-slate-500/20 text-slate-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'Ожидает ответа';
      case 'accepted': return 'Принято';
      case 'deposit_paid': return 'Депозит оплачен';
      case 'confirmed': return 'Подтверждено';
      case 'completed': return 'Завершено';
      case 'rejected': return 'Отклонено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Artist Avatar */}
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-white font-medium mb-1">{booking.eventTitle}</h3>
              <p className="text-slate-400 text-sm mb-1">
                {booking.performer?.displayName || 'Artist'}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(booking.eventDate).toLocaleDateString('ru-RU')}
            </span>
            {booking.startTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {booking.startTime}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {booking.durationHours}ч
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {formatPrice(booking.offeredPrice)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {booking.status === 'pending' && (
              <button className="text-sm text-slate-400 hover:text-white transition-all">
                Отменить
              </button>
            )}
            {booking.status === 'accepted' && onPayDeposit && (
              <button 
                onClick={onPayDeposit}
                className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm transition-all"
              >
                Оплатить депозит
              </button>
            )}
            {booking.status === 'deposit_paid' && onPayFinal && (
              <button 
                onClick={onPayFinal}
                className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm transition-all"
              >
                Оплатить остаток
              </button>
            )}
            {onViewDetails && (
              <button 
                onClick={onViewDetails}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
              >
                Подробнее
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface CalendarViewProps {
  bookings: BookingRequest[];
}

function CalendarView({ bookings }: CalendarViewProps) {
  return (
    <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
      <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Календарь</h3>
      <p className="text-slate-400 mb-6">Визуальный календарь букингов (в разработке)</p>
      <div className="space-y-2">
        {bookings.map(booking => (
          <div key={booking.id} className="p-3 rounded-lg bg-white/5 border border-white/10 text-left">
            <p className="text-white font-medium">{booking.eventTitle}</p>
            <p className="text-sm text-slate-400">
              {new Date(booking.eventDate).toLocaleDateString('ru-RU')} • {booking.performer?.displayName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Artist Profile Modal будет создан в следующем файле
function ArtistProfileModal({ artist, onClose, onBook }: any) {
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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{artist.displayName}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <p className="text-slate-300">{artist.bio}</p>
          
          <div>
            <h4 className="text-white font-medium mb-2">Жанры</h4>
            <div className="flex flex-wrap gap-2">
              {artist.genres.map((genre: string) => (
                <span key={genre} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-1">Ставка</h4>
              <p className="text-slate-300">{artist.hourlyRate.toLocaleString()} ₽/час</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Мин. время</h4>
              <p className="text-slate-300">{artist.minimumBookingHours} часа</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Опыт</h4>
              <p className="text-slate-300">{artist.yearsExperience} лет</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Букингов</h4>
              <p className="text-slate-300">{artist.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            Закрыть
          </button>
          <button
            onClick={onBook}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            Отправить заявку
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Booking Request Modal будет создан отдельно
function BookingRequestModal({ artist, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDate: '',
    startTime: '',
    durationHours: 4,
    expectedAudience: 100,
  });

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
        <h3 className="text-2xl font-bold text-white mb-6">Создать заявку</h3>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Название мероприятия"
            value={formData.eventTitle}
            onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
          />
          
          <input
            type="date"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
          />

          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            Отправить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}