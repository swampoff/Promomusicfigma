/**
 * VENUE TYPES - TypeScript типы для кабинета заведения
 * Полная типизация всех сущностей согласно SQL структуре
 */

// =====================================================
// VENUE PROFILE
// =====================================================

export type VenueType = 
  | 'restaurant'
  | 'bar'
  | 'cafe'
  | 'club'
  | 'lounge'
  | 'hotel'
  | 'spa'
  | 'gym'
  | 'shop'
  | 'other';

export type VenueStatus = 
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'active';

export type SubscriptionStatus = 
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'expired'
  | 'trial';

export type SubscriptionPlan = 
  | 'start'
  | 'business'
  | 'network'
  | 'enterprise';

export interface VenueProfile {
  id: string;
  userId: string;
  venueName: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  venueType: VenueType;
  capacity: number | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  genres: string[];
  socialLinks: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    vk?: string;
  };
  website: string | null;
  workingHours: string | null;
  status: VenueStatus;
  verified: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// VENUE STATUS (Current playback state)
// =====================================================

export interface VenuePlaybackStatus {
  venueId: string;
  isOnline: boolean;
  isPlaying: boolean;
  currentPlaylistId: string | null;
  currentTrackId: string | null;
  currentTrackTitle: string | null;
  currentTrackArtist: string | null;
  currentTrackStartedAt: string | null;
  lastHeartbeat: string;
  updatedAt: string;
}

// =====================================================
// PLAYLISTS
// =====================================================

export type PlaylistStatus = 
  | 'draft'
  | 'active'
  | 'archived';

export interface PlaylistTrack {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string | null;
  addedAt: string;
}

export interface Playlist {
  id: string;
  venueId: string;
  ownerId: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  contentItems: PlaylistTrack[];
  trackCount: number;
  totalDuration: number;
  isPublic: boolean;
  status: PlaylistStatus;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// SUBSCRIPTION PLANS
// =====================================================

export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  zones: number | 'unlimited';
  features: {
    maxPlaylists: number | 'unlimited';
    maxTracks: number | 'unlimited';
    libraryAccess: 'basic' | 'full' | 'premium';
    analytics: boolean;
    scheduling: boolean;
    multiLocation: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    sla?: boolean;
    dedicatedApp?: boolean;
    concierge?: boolean;
  };
  popular?: boolean;
}

// =====================================================
// BOOKING SYSTEM
// =====================================================

export type BookingEventType = 'concert' | 'dj_set' | 'live' | 'corporate';

export type BookingStatus = 
  | 'pending'       // Ожидает ответа артиста
  | 'accepted'      // Артист принял
  | 'rejected'      // Артист отклонил
  | 'confirmed'     // Оплачено полностью
  | 'deposit_paid'  // Оплачен депозит
  | 'completed'     // Мероприятие завершено
  | 'cancelled';    // Отменено

export type PaymentType = 'deposit' | 'final' | 'refund' | 'payout';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export interface BookingRequest {
  id: string;
  requesterId: string;
  performerId: string;
  eventType: BookingEventType;
  eventTitle: string;
  eventDescription?: string;
  eventDate: string; // ISO date
  startTime?: string; // HH:MM format
  durationHours: number;
  venueAddress?: string;
  expectedAudience?: number;
  offeredPrice: number;
  performerFee: number;
  platformCommission: number;
  technicalRequirements?: Record<string, any>;
  status: BookingStatus;
  depositAmount?: number;
  depositPaidAt?: string;
  fullPaymentAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  performer?: ArtistProfile;
  requester?: VenueProfile;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  displayName: string;
  artistName?: string;
  bio?: string;
  genres: string[];
  avatar?: string;
  coverImage?: string;
  hourlyRate: number;
  minimumBookingHours: number;
  rating?: number;
  totalBookings?: number;
  yearsExperience?: number;
  location?: string;
  socialLinks?: {
    instagram?: string;
    spotify?: string;
    soundcloud?: string;
    youtube?: string;
  };
  technicalRider?: {
    equipment?: string[];
    soundSystem?: string;
    lighting?: string;
    other?: string;
  };
  availability?: {
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday?: boolean;
    sunday?: boolean;
  };
  verifiedAt?: string;
  createdAt: string;
}

export interface BookingCalendar {
  id: string;
  performerId: string;
  date: string;
  isAvailable: boolean;
  bookingId?: string;
  blockedReason?: string;
  createdAt: string;
}

export interface BookingPayment {
  id: string;
  bookingId: string;
  payerId: string;
  recipientId: string;
  amount: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  gatewayPaymentId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  processedAt?: string;
}

export interface VenueProfile {
  id: string;
  userId: string;
  venueName: string;
  venueType?: string;
  address?: string;
  city?: string;
  capacity?: number;
  description?: string;
  avatar?: string;
  coverImage?: string;
  rating?: number;
  totalEvents?: number;
  subscriptionPlan?: SubscriptionPlan;
  createdAt: string;
}

// =====================================================
// ANALYTICS
// =====================================================

export interface VenueAnalytics {
  venueId: string;
  period: string; // '2024-02' for month, '2024-W05' for week
  
  // Воспроизведение
  totalPlaytime: number; // minutes
  totalTracks: number;
  uniqueTracks: number;
  
  // Посещаемость (если есть интеграция)
  estimatedVisitors: number | null;
  avgSessionDuration: number | null;
  
  // Популярные треки
  topTracks: Array<{
    trackId: string;
    title: string;
    artist: string;
    playCount: number;
  }>;
  
  // Популярные жанры
  topGenres: Array<{
    genre: string;
    playCount: number;
    percentage: number;
  }>;
}

// =====================================================
// CONTENT MODERATION
// =====================================================

export type ContentType = 
  | 'jingle'
  | 'announcement'
  | 'ad';

export type ContentStatus = 
  | 'pending_review'
  | 'approved'
  | 'rejected';

export interface VenueContent {
  id: string;
  venueId: string;
  contentType: ContentType;
  title: string;
  description: string | null;
  fileUrl: string;
  duration: number;
  status: ContentStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// REVIEWS & RATINGS
// =====================================================

export interface VenueArtistReview {
  id: string;
  venueId: string;
  artistId: string;
  artistName: string;
  artistAvatar: string | null;
  rating: number; // 1-5
  comment: string | null;
  reviewType: 'venue_to_artist' | 'artist_to_venue';
  eventDate: string | null;
  createdAt: string;
}

// =====================================================
// NOTIFICATIONS
// =====================================================

export type VenueNotificationType = 
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'track_received'
  | 'subscription_expiring'
  | 'subscription_renewed'
  | 'subscription_expired'
  | 'content_approved'
  | 'content_rejected'
  | 'system_announcement'
  | 'platform_update';

export type NotificationPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export interface VenueNotification {
  id: string;
  venueId: string;
  notificationType: VenueNotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

// =====================================================
// STATISTICS
// =====================================================

export interface VenueStats {
  totalPlaylists: number;
  totalTracks: number;
  totalPlaytime: number; // minutes
  activeBookings: number;
  completedBookings: number;
  averageRating: number | null;
  totalReviews: number;
  connectedRadios: number;
}

// =====================================================
// SETTINGS
// =====================================================

export interface VenueSettings {
  venueId: string;
  
  // Музыкальные настройки
  autoPlay: boolean;
  crossfade: boolean;
  crossfadeDuration: number;
  volumeLevel: number;
  
  // Уведомления
  emailNotifications: boolean;
  pushNotifications: boolean;
  bookingNotifications: boolean;
  trackNotifications: boolean;
  
  // Интеграция
  allowRadioDistribution: boolean;
  autoAcceptRadioTracks: boolean;
  
  // Приватность
  showInDirectory: boolean;
  allowPublicPlaylists: boolean;
  
  updatedAt: string;
}