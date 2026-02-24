import { 
  Bell, Lock, CreditCard, Globe, Moon, Sun, Eye, EyeOff, Shield, 
  Smartphone, Monitor, Download, Trash2, Check, X, Mail, Phone, 
  Camera, Edit2, Key, AlertCircle, Info, Crown, Zap, Palette, 
  User, LogOut, ChevronRight, Plus, Save, Settings as SettingsIcon, 
  BarChart3, ChevronDown, Music2, Link as LinkIcon, Headphones, 
  Heart, Share2, TrendingUp, RotateCcw, Wallet, Users,
  Search, Calendar, Image, Award, Briefcase, Languages, 
  CheckCircle2, MapPin, ExternalLink, Copy, RefreshCw, FileKey,
  ShieldCheck, ShieldAlert, Clock, MapPinned, Code2, Terminal,
  Volume2, Vibrate, BellRing, MessageSquare, ThumbsUp, Repeat2,
  ListMusic, UserPlus, FileText, BellOff, Filter, Inbox,
  Building2, Receipt, FileDown, Coins, BadgeCheck,
  CreditCardIcon, Banknote, QrCode, ShoppingCart, Upload, HelpCircle, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { settingsAPI } from '@/app/utils/settings-api';
import { getArtistProfile, updateArtistProfile, invalidateProfileCache } from '@/utils/api/artist-profile';
import { invalidatePopularCache } from '@/utils/api/popular-artists';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import {
  getNotificationTypePrefs,
  setNotificationTypePrefs,
  type NotificationTypePrefs,
} from '@/utils/hooks/useNotificationSSE';

// Section components embedded as settings tabs
import { AnalyticsPage } from '@/app/components/analytics-page';
import { FinancesPage } from '@/app/components/finances-page';
import { SupportPage } from '@/app/components/support-page';

type TabType = 'profile' | 'security' | 'notifications' | 'privacy' | 'payment' | 'subscription' | 'advanced' | 'analytics' | 'finances' | 'support';

interface PaymentMethod {
  id: number;
  type: 'visa' | 'mastercard' | 'mir' | 'yoomoney';
  last4: string;
  expires: string;
  isDefault: boolean;
}

interface Session {
  id: number;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  username: string;
  connected: boolean;
  followers?: number;
}

interface StreamingPlatform {
  id: string;
  name: string;
  connected: boolean;
  profileUrl?: string;
  streams?: number;
  revenue?: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  color?: string;
}

interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  trialEnd?: string;
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoiceUrl?: string;
  category: 'subscription' | 'donation' | 'promotion' | 'coins' | 'pitching' | 'other';
  paymentMethod?: {
    type: 'visa' | 'mastercard' | 'mir' | 'yoomoney' | 'sbp';
    last4: string;
  };
  transactionId?: string;
  tax?: number;
  fee?: number;
  details?: {
    planName?: string;
    period?: string;
    recipient?: string;
    campaignName?: string;
    coinsAmount?: number;
  };
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Check if global search requested a specific tab
    const requested = sessionStorage.getItem('promo_settings_tab');
    if (requested) {
      sessionStorage.removeItem('promo_settings_tab');
      const validTabs: TabType[] = ['profile', 'security', 'notifications', 'privacy', 'payment', 'subscription', 'advanced', 'analytics', 'finances', 'support'];
      if (validTabs.includes(requested as TabType)) return requested as TabType;
    }
    return 'profile';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check sessionStorage on visibility (handles re-navigation to settings via global search)
  useEffect(() => {
    const handleFocus = () => {
      const requested = sessionStorage.getItem('promo_settings_tab');
      if (requested) {
        sessionStorage.removeItem('promo_settings_tab');
        const validTabs: TabType[] = ['profile', 'security', 'notifications', 'privacy', 'payment', 'subscription', 'advanced', 'analytics', 'finances', 'support'];
        if (validTabs.includes(requested as TabType)) {
          setActiveTab(requested as TabType);
        }
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  // Dropdown states
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  
  // Profile states - начальные значения из localStorage, обогащаются из API
  const [displayName, setDisplayName] = useState(localStorage.getItem('artistName') || 'Артист');
  const [profileStage, setProfileStage] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [bio, setBio] = useState('');
  const [profileGenres, setProfileGenres] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('artistGenres') || '[]'); } catch { return []; }
  });
  const [location, setLocation] = useState(localStorage.getItem('artistCity') ? `${localStorage.getItem('artistCity')}, Россия` : '');
  const [website, setWebsite] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400');
  const [profileCover, setProfileCover] = useState('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200');
  const [profileVerified, setProfileVerified] = useState(false);
  const [profileLabel, setProfileLabel] = useState('');
  const [profileManager, setProfileManager] = useState('');
  const [profileBooking, setProfileBooking] = useState('');
  const [profileCareerStart, setProfileCareerStart] = useState('');
  const [profileLanguages, setProfileLanguages] = useState(['Русский']);
  
  // Social links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: 'Instagram', url: 'https://instagram.com/alexandr_music', username: '@alexandr_music', connected: true, followers: 12500 },
    { platform: 'YouTube', url: 'https://youtube.com/@alexandrmusic', username: '@alexandrmusic', connected: true, followers: 8300 },
    { platform: 'TikTok', url: '', username: '', connected: false },
    { platform: 'VK', url: 'https://vk.com/alexandr_music', username: 'alexandr_music', connected: true, followers: 5200 },
  ]);

  // Streaming platforms
  const [streamingPlatforms, setStreamingPlatforms] = useState<StreamingPlatform[]>([
    { id: 'spotify', name: 'Spotify', connected: true, streams: 125000, revenue: 350 },
    { id: 'apple', name: 'Apple Music', connected: true, streams: 85000, revenue: 280 },
    { id: 'yandex', name: 'Яндекс.Музыка', connected: true, streams: 95000, revenue: 420 },
    { id: 'youtube_music', name: 'YouTube Music', connected: false },
    { id: 'soundcloud', name: 'SoundCloud', connected: false },
  ]);
  
  // Notifications states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifyNewDonations, setNotifyNewDonations] = useState(true);
  const [notifyNewMessages, setNotifyNewMessages] = useState(true);
  const [notifyNewComments, setNotifyNewComments] = useState(true);
  const [notifyAnalytics, setNotifyAnalytics] = useState(true);
  const [notifyNewFollowers, setNotifyNewFollowers] = useState(true);
  const [notifyStreamMilestones, setNotifyStreamMilestones] = useState(true);
  const [notifyMarketingCampaigns, setNotifyMarketingCampaigns] = useState(true);
  const [notifySubscriptionExpiry, setNotifySubscriptionExpiry] = useState(true);
  
  // Advanced notification states
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    push: true,
    sms: false,
    inApp: true
  });
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [notificationSound, setNotificationSound] = useState('default');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState<'instant' | 'hourly' | 'daily'>('instant');
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [notificationPriority, setNotificationPriority] = useState<'all' | 'important' | 'critical'>('all');
  const [notifyReplies, setNotifyReplies] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyShares, setNotifyShares] = useState(true);
  const [notifyPlaylistAdds, setNotifyPlaylistAdds] = useState(true);
  const [notifyCollaborationRequests, setNotifyCollaborationRequests] = useState(true);
  const [notifyRoyaltyPayments, setNotifyRoyaltyPayments] = useState(true);
  const [notifySystemUpdates, setNotifySystemUpdates] = useState(false);

  // Per-type notification preferences (persisted in localStorage)
  const [typePrefs, setTypePrefs] = useState<NotificationTypePrefs>(getNotificationTypePrefs);
  const handleTypePrefChange = (key: keyof NotificationTypePrefs) => {
    const updated = setNotificationTypePrefs({ [key]: !typePrefs[key] });
    setTypePrefs(updated);
    toast.success('Настройки обновлены', { duration: 1500 });
  };
  
  // Privacy states
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'followers'>('public');
  const [allowMessages, setAllowMessages] = useState<'everyone' | 'followers' | 'none'>('everyone');
  const [showStats, setShowStats] = useState(true);
  const [showDonations, setShowDonations] = useState(true);
  const [allowSearch, setAllowSearch] = useState(true);
  const [showInRatings, setShowInRatings] = useState(true);
  const [allowTagging, setAllowTagging] = useState(true);
  
  // Appearance states
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [language, setLanguage] = useState('ru');
  const [fontSize, setFontSize] = useState(16);
  const [accentColor, setAccentColor] = useState('cyan');
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  
  // Analytics states
  const [trackPageViews, setTrackPageViews] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);
  const [trackListens, setTrackListens] = useState(true);
  const [trackDonations, setTrackDonations] = useState(true);
  const [shareDataWithPartners, setShareDataWithPartners] = useState(false);
  
  // Security states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodesGenerated, setBackupCodesGenerated] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('strong');
  const [lastPasswordChange, setLastPasswordChange] = useState('3 месяца назад');
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [suspiciousActivityAlerts, setSuspiciousActivityAlerts] = useState(true);
  const [deviceMemory, setDeviceMemory] = useState(true);
  const [apiAccessEnabled, setApiAccessEnabled] = useState(false);
  const [apiKeys, setApiKeys] = useState<Array<{id: string, name: string, key: string, created: string, lastUsed: string}>>([]);
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, device: 'Chrome на Windows', location: 'Москва, Россия', ip: '192.168.1.1', lastActive: 'Сейчас', current: true },
    { id: 2, device: 'Safari на iPhone 15', location: 'Санкт-Петербург, Россия', ip: '192.168.1.2', lastActive: '2 часа назад', current: false },
    { id: 3, device: 'Firefox на MacBook', location: 'Казань, Россия', ip: '192.168.1.3', lastActive: '1 день назад', current: false },
  ]);
  
  // Payment states
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 1, type: 'visa', last4: '4242', expires: '12/25', isDefault: true },
    { id: 2, type: 'mastercard', last4: '8888', expires: '06/26', isDefault: false },
    { id: 3, type: 'mir', last4: '1234', expires: '09/27', isDefault: false },
  ]);
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [saveCardsEnabled, setSaveCardsEnabled] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    country: 'Россия',
    city: 'Москва',
    address: 'ул. Тверская, д. 12',
    zip: '125009'
  });
  const [invoiceEmail, setInvoiceEmail] = useState('alexandr@music.com');
  const [taxId, setTaxId] = useState('');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentMethod | null>(null);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    type: 'visa'
  });
  
  // Subscription states
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending' | 'failed' | 'refunded'>('all');
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState<'all' | 'subscription' | 'donation' | 'promotion' | 'coins' | 'pitching' | 'other'>('all');
  const [paymentSearch, setPaymentSearch] = useState('');
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'profile' as TabType, label: 'Профиль', icon: User },
    { id: 'security' as TabType, label: 'Безопасность', icon: Shield },
    { id: 'notifications' as TabType, label: 'Уведомления', icon: Bell },
    { id: 'privacy' as TabType, label: 'Приватность', icon: Eye },
    { id: 'payment' as TabType, label: 'Оплата', icon: CreditCard },
    { id: 'subscription' as TabType, label: 'Подписка', icon: Crown },
    { id: 'analytics' as TabType, label: 'Аналитика', icon: TrendingUp },
    { id: 'finances' as TabType, label: 'Финансы', icon: Wallet },
    { id: 'support' as TabType, label: 'Поддержка', icon: HelpCircle },
    { id: 'advanced' as TabType, label: 'Дополнительно', icon: SettingsIcon },
  ];

  const genres = ['Electronic', 'Ambient', 'Techno', 'House', 'Trance', 'Drum & Bass', 'Dubstep', 'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Jazz', 'Classical'];
  
  const accentColors = [
    { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500' },
    { id: 'purple', name: 'Purple', bg: 'bg-purple-500' },
    { id: 'green', name: 'Green', bg: 'bg-green-500' },
    { id: 'orange', name: 'Orange', bg: 'bg-orange-500' },
    { id: 'pink', name: 'Pink', bg: 'bg-pink-500' },
  ];

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadSessions();
    loadPaymentMethods();
    loadSubscriptionData();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    
    // Флаг: были ли загружены данные из профиля артиста
    let profileLoaded = false;
    
    // 1. Загружаем полный профиль артиста из Supabase
    try {
      const artistProfile = await getArtistProfile();
      if (artistProfile) {
        profileLoaded = true;
        setDisplayName(artistProfile.fullName || '');
        setProfileStage(artistProfile.username || '');
        setProfileEmail(artistProfile.email || '');
        setProfilePhone(artistProfile.phone || '');
        setBio(artistProfile.bio || '');
        if (artistProfile.genres?.length) setProfileGenres(artistProfile.genres);
        if (artistProfile.location) setLocation(artistProfile.location);
        setWebsite(artistProfile.website || '');
        setProfileVerified(artistProfile.isVerified || false);
        setProfileLabel(artistProfile.label || '');
        setProfileManager(artistProfile.manager || '');
        setProfileBooking(artistProfile.bookingEmail || '');
        setProfileCareerStart(artistProfile.careerStart || '');
        if (artistProfile.languages?.length) setProfileLanguages(artistProfile.languages);
        if (artistProfile.avatarUrl) setProfileAvatar(artistProfile.avatarUrl);
        
        // Маппинг всех соцсетей из профиля (bidirectional)
        if (artistProfile.socials) {
          const socialMap: Record<string, { key: 'instagram' | 'youtube' | 'twitter' | 'facebook'; urlBase: string }> = {
            'Instagram': { key: 'instagram', urlBase: 'https://instagram.com/' },
            'YouTube':   { key: 'youtube',   urlBase: 'https://youtube.com/' },
            'Twitter':   { key: 'twitter',   urlBase: 'https://twitter.com/' },
            'Facebook':  { key: 'facebook',  urlBase: 'https://facebook.com/' },
          };
          
          setSocialLinks(prev => prev.map(link => {
            const mapping = socialMap[link.platform];
            if (mapping) {
              const val = artistProfile.socials[mapping.key];
              if (val) {
                const clean = val.replace(/^@/, '');
                return { ...link, username: val, url: `${mapping.urlBase}${clean}`, connected: true };
              }
            }
            return link;
          }));
        }
        
        console.log('[Settings] Artist profile loaded:', artistProfile.fullName);
      }
    } catch (err) {
      console.warn('[Settings] Artist profile API not available, using defaults');
    }

    // 2. Загружаем остальные настройки из KV (не перезаписываем если профиль загружен)
    const settings = await settingsAPI.getSettings();
    if (settings) {
      if (!profileLoaded) {
        if (settings.profile?.displayName) setDisplayName(settings.profile.displayName);
        if (settings.profile?.bio) setBio(settings.profile.bio);
        if (settings.profile?.location) setLocation(settings.profile.location);
        if (settings.profile?.website) setWebsite(settings.profile.website);
        if (settings.profile?.genres?.length) setProfileGenres(settings.profile.genres);
      }
      
      setTwoFactorEnabled(settings.security?.twoFactorEnabled || false);
      
      setPushNotifications(settings.notifications?.pushNotifications ?? true);
      setEmailNotifications(settings.notifications?.emailNotifications ?? true);
      setSmsNotifications(settings.notifications?.smsNotifications ?? false);
      setSoundEnabled(settings.notifications?.soundEnabled ?? true);
      setNotifyNewDonations(settings.notifications?.notifyNewDonations ?? true);
      setNotifyNewMessages(settings.notifications?.notifyNewMessages ?? true);
      setNotifyNewComments(settings.notifications?.notifyNewComments ?? true);
      setNotifyNewFollowers(settings.notifications?.notifyNewFollowers ?? true);
      setNotifyAnalytics(settings.notifications?.notifyAnalytics ?? true);
      setNotifyStreamMilestones(settings.notifications?.notifyStreamMilestones ?? true);
      setNotifyMarketingCampaigns(settings.notifications?.notifyMarketingCampaigns ?? false);
      setNotifySubscriptionExpiry(settings.notifications?.notifySubscriptionExpiry ?? true);
      
      setProfileVisibility(settings.privacy?.profileVisibility || 'public');
      setAllowMessages(settings.privacy?.allowMessages || 'everyone');
      setShowOnlineStatus(settings.privacy?.showOnlineStatus ?? true);
      setShowLastSeen(settings.privacy?.showLastSeen ?? true);
      setAllowTagging(settings.privacy?.allowTagging ?? true);
      
      setTrackPageViews(settings.analytics?.trackPageViews ?? true);
      setTrackClicks(settings.analytics?.trackClicks ?? true);
      setTrackListens(settings.analytics?.trackListens ?? true);
      setTrackDonations(settings.analytics?.trackDonations ?? true);
      setShareDataWithPartners(settings.analytics?.shareDataWithPartners ?? false);
      
      setTheme(settings.appearance?.theme || 'dark');
      setAccentColor(settings.appearance?.accentColor || 'cyan');
      setCompactMode(settings.appearance?.compactMode ?? false);
      setReducedMotion(settings.appearance?.reducedMotion ?? false);
      setLargeText(settings.appearance?.largeText ?? false);
      setHighContrast(settings.appearance?.highContrast ?? false);
      
      setLanguage(settings.advanced?.language || 'ru');
    }
    setIsLoading(false);
  };

  const loadSessions = async () => {
    const loadedSessions = await settingsAPI.getSessions();
    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
    }
  };

  const loadPaymentMethods = async () => {
    const methods = await settingsAPI.getPaymentMethods();
    if (methods.length > 0) {
      setPaymentMethods(methods);
    }
  };

  const loadSubscriptionData = async () => {
    const [subscription, plans] = await Promise.all([
      settingsAPI.getCurrentSubscription(),
      settingsAPI.getAvailablePlans(),
    ]);
    
    if (subscription) setCurrentSubscription(subscription);
    if (plans.length > 0) setAvailablePlans(plans);
    
    // Mock payment history (no backend integration)
    setPaymentHistory([
      {
        id: 'pay_' + Date.now(),
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 39990,
        currency: 'RUB',
        status: 'paid',
        description: 'Подписка Про - январь 2026',
        invoiceUrl: '#invoice_jan_2026',
        category: 'subscription',
        paymentMethod: {
          type: 'visa',
          last4: '4242',
        },
        transactionId: 'txn_1QwErTy234567890',
        tax: 0,
        fee: 74.5,
        details: {
          planName: 'Про',
          period: 'Январь 2026',
        },
      },
      {
        id: 'pay_' + (Date.now() - 1000),
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 5000,
        currency: 'RUB',
        status: 'paid',
        description: 'Пополнение баланса коинов',
        invoiceUrl: '#invoice_coins_jan',
        category: 'coins',
        paymentMethod: {
          type: 'sbp',
          last4: '0000',
        },
        transactionId: 'txn_2AbCdEf987654321',
        tax: 0,
        fee: 0,
        details: {
          coinsAmount: 5500,
        },
      },
      {
        id: 'pay_' + (Date.now() - 2000),
        date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 2500,
        currency: 'RUB',
        status: 'paid',
        description: 'Продвижение трека "Summer Vibes"',
        invoiceUrl: '#invoice_promo_jan',
        category: 'promotion',
        paymentMethod: {
          type: 'mastercard',
          last4: '8888',
        },
        transactionId: 'txn_3ZxYwVu123456789',
        tax: 0,
        fee: 125,
        details: {
          campaignName: 'VK Ads - Целевая аудитория',
        },
      },
      {
        id: 'pay_' + (Date.now() - 3000),
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 39990,
        currency: 'RUB',
        status: 'paid',
        description: 'Подписка Про - декабрь 2025',
        invoiceUrl: '#invoice_dec_2025',
        category: 'subscription',
        paymentMethod: {
          type: 'visa',
          last4: '4242',
        },
        transactionId: 'txn_4MnOpQr567890123',
        tax: 0,
        fee: 74.5,
        details: {
          planName: 'Про',
          period: 'Декабрь 2025',
        },
      },
      {
        id: 'pay_' + (Date.now() - 4000),
        date: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 1200,
        currency: 'RUB',
        status: 'paid',
        description: 'Питчинг в плейлист "Русский Рок"',
        invoiceUrl: '#invoice_pitch_dec',
        category: 'pitching',
        paymentMethod: {
          type: 'yoomoney',
          last4: '1234',
        },
        transactionId: 'txn_5GhIjKl234567890',
        tax: 0,
        fee: 60,
        details: {
          campaignName: 'Яндекс Музыка - ТОП плейлист',
        },
      },
      {
        id: 'pay_' + (Date.now() - 5000),
        date: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 500,
        currency: 'RUB',
        status: 'refunded',
        description: 'Возврат за неудачную кампанию',
        invoiceUrl: '#invoice_refund_nov',
        category: 'promotion',
        paymentMethod: {
          type: 'visa',
          last4: '4242',
        },
        transactionId: 'txn_6LmNoPq890123456',
        tax: 0,
        fee: -25,
        details: {
          campaignName: 'Instagram Ads - отменено',
        },
      },
      {
        id: 'pay_' + (Date.now() - 6000),
        date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 39990,
        currency: 'RUB',
        status: 'paid',
        description: 'Подписка Про - ноябрь 2025',
        invoiceUrl: '#invoice_nov_2025',
        category: 'subscription',
        paymentMethod: {
          type: 'visa',
          last4: '4242',
        },
        transactionId: 'txn_7QrStUv456789012',
        tax: 0,
        fee: 74.5,
        details: {
          planName: 'Про',
          period: 'Ноябрь 2025',
        },
      },
      {
        id: 'pay_' + (Date.now() - 7000),
        date: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 3500,
        currency: 'RUB',
        status: 'paid',
        description: 'Донат от фаната @musiclover2025',
        invoiceUrl: '#invoice_donation_oct',
        category: 'donation',
        paymentMethod: {
          type: 'sbp',
          last4: '0000',
        },
        transactionId: 'txn_8WxYzAb012345678',
        tax: 0,
        fee: 175,
        details: {
          recipient: 'Александр Иванов',
        },
      },
      {
        id: 'pay_' + (Date.now() - 8000),
        date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 890,
        currency: 'RUB',
        status: 'pending',
        description: 'Продвижение трека "Autumn Dreams"',
        category: 'promotion',
        paymentMethod: {
          type: 'mir',
          last4: '1234',
        },
        transactionId: 'txn_9CdEfGh678901234',
        tax: 0,
        fee: 44.5,
        details: {
          campaignName: 'TikTok Ads - в обработке',
        },
      },
      {
        id: 'pay_' + (Date.now() - 9000),
        date: new Date(Date.now() - 102 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 250,
        currency: 'RUB',
        status: 'failed',
        description: 'Ошибка оплаты продвижения',
        category: 'promotion',
        paymentMethod: {
          type: 'mastercard',
          last4: '8888',
        },
        transactionId: 'txn_0HiJkLm345678901',
        tax: 0,
        fee: 0,
        details: {
          campaignName: 'YouTube Ads - недостаточно средств',
        },
      },
    ]);
  };

  const handleChangePlan = async (planId: string) => {
    const success = await settingsAPI.changePlan(planId, billingInterval);
    if (success) {
      toast.success('План успешно изменён!');
      await loadSubscriptionData();
    } else {
      toast.error('Ошибка при смене плана');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Вы уверены, что хотите отменить подписку?')) return;
    
    const success = await settingsAPI.cancelSubscription();
    if (success) {
      toast.success('Подписка отменена');
      await loadSubscriptionData();
    } else {
      toast.error('Ошибка при отмене подписки');
    }
  };

  const saveAllSettings = useCallback(async (showToast = true) => {
    setIsSaving(true);
    const settings = {
      profile: { displayName, bio, location, website, genres: profileGenres },
      security: { twoFactorEnabled },
      notifications: {
        pushNotifications, emailNotifications, smsNotifications, soundEnabled,
        notifyNewDonations, notifyNewMessages, notifyNewComments, notifyNewFollowers,
        notifyAnalytics, notifyStreamMilestones, notifyMarketingCampaigns, notifySubscriptionExpiry,
      },
      privacy: { profileVisibility, allowMessages, showOnlineStatus, showLastSeen, allowTagging },
      analytics: { trackPageViews, trackClicks, trackListens, trackDonations, shareDataWithPartners },
      appearance: { theme, accentColor, compactMode, reducedMotion, largeText, highContrast },
      advanced: { language },
    };

    // 1. Сохраняем профиль артиста в Supabase через PUT endpoint
    const artistId = localStorage.getItem('artistProfileId');
    if (artistId) {
      try {
        const profileUpdates = {
          fullName: displayName,
          bio,
          // Сохраняем avatarUrl только если это реальный URL (не data: URI)
          avatarUrl: profileAvatar && !profileAvatar.startsWith('data:') ? profileAvatar : '',
          location,
          website,
          phone: profilePhone,
          genres: profileGenres,
          label: profileLabel,
          manager: profileManager,
          bookingEmail: profileBooking,
          careerStart: profileCareerStart,
          languages: profileLanguages,
          username: profileStage,
          email: profileEmail,
          socials: {
            instagram: socialLinks.find(l => l.platform === 'Instagram')?.username || '',
            twitter: socialLinks.find(l => l.platform === 'Twitter')?.username || '',
            facebook: socialLinks.find(l => l.platform === 'Facebook')?.username || '',
            youtube: socialLinks.find(l => l.platform === 'YouTube')?.username || '',
            spotify: streamingPlatforms.find(p => p.id === 'spotify')?.profileUrl || '',
            appleMusic: streamingPlatforms.find(p => p.id === 'apple')?.profileUrl || '',
          },
        };
        
        const updatedProfile = await updateArtistProfile(artistId, profileUpdates);
        if (updatedProfile) {
          // Инвалидируем кэш чтобы sidebar и dashboard получили свежие данные
          invalidateProfileCache(artistId);
          // Инвалидируем кэш популярных артистов на лендинге (аватар может измениться)
          invalidatePopularCache();
          console.log('[Settings] Profile saved to Supabase:', updatedProfile.fullName);
        }
      } catch (err) {
        console.error('Error saving artist profile to Supabase:', err);
      }
    }

    // 2. Сохраняем остальные настройки в KV
    const success = await settingsAPI.saveSettings(settings);
    if (success) {
      if (showToast) toast.success('Все настройки сохранены!');
    } else {
      if (showToast) toast.error('��шибка при сохранении настроек');
    }
    setIsSaving(false);
  }, [
    displayName, bio, location, website, profileGenres,
    profilePhone, profileLabel, profileManager, profileBooking,
    profileCareerStart, profileLanguages, profileStage, profileEmail,
    socialLinks, streamingPlatforms,
    twoFactorEnabled,
    pushNotifications, emailNotifications, smsNotifications, soundEnabled,
    notifyNewDonations, notifyNewMessages, notifyNewComments, notifyNewFollowers,
    notifyAnalytics, notifyStreamMilestones, notifyMarketingCampaigns, notifySubscriptionExpiry,
    profileVisibility, allowMessages, showOnlineStatus, showLastSeen, allowTagging,
    trackPageViews, trackClicks, trackListens, trackDonations, shareDataWithPartners,
    theme, accentColor, compactMode, reducedMotion, largeText, highContrast,
    language,
  ]);

  // Auto-save on settings change (debounced)
  useEffect(() => {
    if (isLoading) return; // Don't auto-save during initial load
    
    const timeoutId = setTimeout(() => {
      saveAllSettings(false); // Save without showing toast
    }, 2000); // Auto-save after 2 seconds of no changes

    return () => clearTimeout(timeoutId);
  }, [isLoading, saveAllSettings]);

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
        enabled ? 'bg-cyan-500' : 'bg-white/20'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${
          enabled ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );

  // Helper function to detect card type
  const detectCardType = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^2/.test(cleaned)) return 'mir';
    if (/^(50|5[6-9]|6)/.test(cleaned)) return 'maestro';
    return 'visa';
  };

  // Helper function to format card number
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  // Helper function to format expiry date
  const formatExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  // Helper function to validate card
  const validateCard = (): boolean => {
    if (cardForm.cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Введите корректный номер карты');
      return false;
    }
    if (cardForm.cardHolder.length < 3) {
      toast.error('Введите имя владельца карты');
      return false;
    }
    if (cardForm.expiryDate.length !== 5) {
      toast.error('Введите срок действия (MM/YY)');
      return false;
    }
    if (cardForm.cvv.length < 3) {
      toast.error('Введите CVV код');
      return false;
    }
    return true;
  };

  const SettingCard = ({ 
    title, 
    description, 
    action 
  }: { 
    title: string; 
    description: string; 
    action: React.ReactNode;
  }) => (
    <div className="p-3 sm:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold mb-1 text-sm sm:text-base">{title}</div>
        <div className="text-gray-400 text-xs sm:text-sm">{description}</div>
      </div>
      <div className="w-full sm:w-auto flex-shrink-0">
        {action}
      </div>
    </div>
  );

  const CustomDropdown = ({ 
    value, 
    options, 
    onChange, 
    isOpen, 
    setIsOpen 
  }: { 
    value: string; 
    options: { value: string; label: string; icon?: React.ReactNode }[]; 
    onChange: (value: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }) => {
    const selectedOption = options.find(opt => opt.value === value);
    
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 focus:outline-none focus:border-cyan-400/50 transition-all flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon}
            {selectedOption?.label}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <div className="contents">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 backdrop-blur-xl bg-[#0a0a14]/95 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-20"
              >
                <div className="py-1">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-2 ${
                        option.value === value ? 'bg-cyan-500/20 text-cyan-400' : 'text-white'
                      }`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                      {option.value === value && (
                        <Check className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen px-1.5 xs:px-2 sm:px-4 pb-20 sm:pb-4 pt-16 lg:pt-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3 xs:mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 xs:gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-0.5 xs:mb-1 sm:mb-2">
                Настройки
              </h1>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-gray-400">
                Управление аккаунтом и предпочтениями
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              {isSaving && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 animate-spin" />
                  Автосохранение...
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => saveAllSettings(true)}
                disabled={isSaving || isLoading}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Сохранить всё</span>
                <span className="sm:hidden">Сохранить</span>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 xs:gap-4 md:gap-6">
          {/* Sidebar - Horizontal scroll on mobile, vertical on desktop */}
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            {/* Mobile: horizontal scrollable tabs */}
            <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-2 px-2 pb-1">
              <div className="flex gap-2 w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 border border-white/10 text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            {/* Desktop: vertical sidebar */}
            <div className="hidden lg:block backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sticky top-4">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-left ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-base font-semibold flex-1">{tab.label}</span>
                      {activeTab === tab.id && (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <RotateCcw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Загрузка настроек...</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Cover Banner */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="relative h-36 sm:h-48 group">
                      <ImageWithFallback
                        src={profileCover}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <button
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                      >
                        <Image className="w-6 h-6 text-white" />
                        <span className="text-white font-semibold">Изменить обложку</span>
                      </button>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileCover(reader.result as string);
                              toast.success('Обложка обновлена!');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16 relative z-10">
                      <div className="relative group flex-shrink-0">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-[#0a0a14] bg-[#0a0a14]">
                          {profileAvatar ? (
                            <ImageWithFallback
                              src={profileAvatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-black text-3xl select-none">
                                {displayName ? displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Camera className="w-8 h-8 text-white" />
                        </button>
                        {profileVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1.5 ring-4 ring-gray-900">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !file.type.startsWith('image/')) return;

                          // Ограничение размера (2MB как в ARTIST_AVATARS bucket)
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error('Файл слишком большой. Максимум 2 МБ.');
                            return;
                          }

                          // Показываем превью локально сразу
                          const reader = new FileReader();
                          reader.onloadend = () => setProfileAvatar(reader.result as string);
                          reader.readAsDataURL(file);

                          // Загружаем в Supabase Storage
                          try {
                            toast.loading('Загрузка аватара...', { id: 'avatar-upload' });

                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('bucket', 'make-84730125-artist-avatars');
                            const artistId = localStorage.getItem('artistProfileId') || 'unknown';
                            formData.append('path', `avatars/${artistId}`);

                            const response = await fetch(
                              `https://${projectId}.supabase.co/functions/v1/server/storage/upload`,
                              {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${publicAnonKey}` },
                                body: formData,
                              }
                            );

                            const result = await response.json();

                            if (result.success && result.url) {
                              setProfileAvatar(result.url);
                              toast.success('Аватар загружен в облако!', { id: 'avatar-upload' });
                              console.log('[Settings] Avatar uploaded to Storage:', result.url);
                            } else {
                              toast.error(result.error || 'Ошибка загрузки аватара', { id: 'avatar-upload' });
                              console.error('[Settings] Avatar upload error:', result.error);
                            }
                          } catch (err) {
                            toast.error('Не удалось загрузить аватар', { id: 'avatar-upload' });
                            console.error('[Settings] Avatar upload network error:', err);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl sm:text-2xl font-bold text-white">{displayName}</h2>
                          {profileVerified && (
                            <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                          )}
                        </div>
                        <p className="text-gray-400 mb-2">@{profileStage}</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            26,100 подписчиков
                          </div>
                          <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold flex items-center gap-1">
                            <Music2 className="w-3 h-3" />
                            42 трека
                          </div>
                          <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            305K прослушиваний
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                      Основная информация
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Имя артиста <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Александр Иванов"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Сценическое имя <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                          <input
                            type="text"
                            value={profileStage}
                            onChange={(e) => setProfileStage(e.target.value)}
                            placeholder="alexandr_music"
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            placeholder="artist@promo.music"
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Телефон
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="+7 (999) 123-45-67"
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Местоположение
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Москва, Россия"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Личный сайт
                        </label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://alexandrmusic.com"
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Биография
                        </label>
                        <textarea
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Расскажите о себе и своём творчестве..."
                          maxLength={500}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 resize-none transition-all"
                        />
                        <p className="text-gray-500 text-xs mt-1 text-right">{bio.length}/500</p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      Профессиональная информация
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Лейбл / Издатель
                        </label>
                        <input
                          type="text"
                          value={profileLabel}
                          onChange={(e) => setProfileLabel(e.target.value)}
                          placeholder="Independent Artist"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Год начала карьеры
                        </label>
                        <input
                          type="text"
                          value={profileCareerStart}
                          onChange={(e) => setProfileCareerStart(e.target.value)}
                          placeholder="2018"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Менеджер
                        </label>
                        <input
                          type="text"
                          value={profileManager}
                          onChange={(e) => setProfileManager(e.target.value)}
                          placeholder="Имя менеджера"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">
                          Букинг Email
                        </label>
                        <input
                          type="email"
                          value={profileBooking}
                          onChange={(e) => setProfileBooking(e.target.value)}
                          placeholder="booking@alexandrmusic.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Genres & Languages */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {/* Genres */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                        Музыкальные жанры
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">Выберите до 5 жанров</p>
                      <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => {
                          const isSelected = profileGenres.includes(genre);
                          return (
                            <button
                              key={genre}
                              onClick={() =>
                                setProfileGenres((prev) =>
                                  prev.includes(genre)
                                    ? prev.filter((g) => g !== genre)
                                    : prev.length < 5 ? [...prev, genre] : prev
                                )
                              }
                              className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                                isSelected
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              } ${!isSelected && profileGenres.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {genre}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-gray-500 text-xs mt-3">
                        Выбрано: {profileGenres.length}/5
                      </p>
                    </div>

                    {/* Languages */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                        Языки
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">Языки, на которых вы поёте</p>
                      <div className="space-y-2">
                        {['Русский', 'English', 'Español', 'Français', 'Deutsch', 'Italiano'].map((lang) => {
                          const isSelected = profileLanguages.includes(lang);
                          return (
                            <button
                              key={lang}
                              onClick={() =>
                                setProfileLanguages((prev) =>
                                  prev.includes(lang)
                                    ? prev.filter((l) => l !== lang)
                                    : [...prev, lang]
                                )
                              }
                              className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all text-left flex items-center justify-between ${
                                isSelected
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              }`}
                            >
                              {lang}
                              {isSelected && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Social Networks */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                      Социальные сети
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {socialLinks.map((social) => {
                        const Icon = social.platform === 'Instagram' ? Camera :
                                    social.platform === 'YouTube' ? Music2 :
                                    social.platform === 'Facebook' ? Users :
                                    social.platform === 'TikTok' ? Music2 :
                                    social.platform === 'VK' ? Globe : Share2;
                        
                        return (
                          <div key={social.platform} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                social.platform === 'Instagram' ? 'bg-pink-500/20' :
                                social.platform === 'YouTube' ? 'bg-red-500/20' :
                                social.platform === 'TikTok' ? 'bg-cyan-500/20' :
                                social.platform === 'VK' ? 'bg-blue-500/20' :
                                'bg-purple-500/20'
                              }`}>
                                <Icon className={`w-5 h-5 ${
                                  social.platform === 'Instagram' ? 'text-pink-400' :
                                  social.platform === 'YouTube' ? 'text-red-400' :
                                  social.platform === 'TikTok' ? 'text-cyan-400' :
                                  social.platform === 'VK' ? 'text-blue-400' :
                                  'text-purple-400'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-semibold">{social.platform}</h4>
                                {social.connected && social.followers && (
                                  <p className="text-xs text-gray-400">{social.followers.toLocaleString()} подписчиков</p>
                                )}
                              </div>
                              {social.connected && (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              )}
                            </div>
                            <input
                              type="url"
                              value={social.url}
                              onChange={(e) => {
                                setSocialLinks((prev) =>
                                  prev.map((s) =>
                                    s.platform === social.platform
                                      ? { ...s, url: e.target.value, connected: !!e.target.value }
                                      : s
                                  )
                                );
                              }}
                              placeholder={`https://${social.platform.toLowerCase()}.com/username`}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        profileVerified ? 'bg-cyan-500/20' : 'bg-yellow-500/20'
                      }`}>
                        {profileVerified ? (
                          <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                          {profileVerified ? 'Профиль верифицирован' : 'Верификация профиля'}
                          {profileVerified && <Award className="w-5 h-5 text-cyan-400" />}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {profileVerified 
                            ? 'Ваш профиль подтверждён. Значок верификации виден всем пользователям.'
                            : 'Подтвердите свой профиль, чтобы получить значок верификации и повысить доверие аудитории.'
                          }
                        </p>
                        {!profileVerified && (
                          <button
                            onClick={() => {
                              setProfileVerified(true);
                              toast.success('Заявка на верификацию отправлена!');
                            }}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                          >
                            Подать заявку на верификацию
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => toast.success('Профиль успешно сохранён!')}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                    >
                      <Save className="w-5 h-5" />
                      Сохранить изменения
                    </button>
                    <button
                      onClick={() => {
                        toast.success('Изменения отменены');
                        loadSettings();
                      }}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                    >
                      Отменить
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Security Overview */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                      Обзор безопасности
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold">Надёжная</h4>
                            <p className="text-xs text-green-400">Защита активна</p>
                          </div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full" style={{width: '85%'}}></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Уровень защиты: 85%</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Key className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold">{passwordStrength === 'strong' ? 'Сильный' : passwordStrength === 'medium' ? 'Средний' : 'Слабый'}</h4>
                            <p className="text-xs text-gray-400">Пароль</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Изменён: {lastPasswordChange}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold">{sessions.length}</h4>
                            <p className="text-xs text-gray-400">Активных сессий</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">На {sessions.length} устройствах</p>
                      </div>
                    </div>
                  </div>

                  {/* Password Security */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      Пароль и аутентификация
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">Изменить пароль</h4>
                            <p className="text-gray-400 text-sm">Последнее изменение: {lastPasswordChange}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                                <div className={`h-full ${
                                  passwordStrength === 'strong' ? 'bg-green-500 w-full' :
                                  passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' :
                                  'bg-red-500 w-1/3'
                                }`}></div>
                              </div>
                              <span className={`text-xs font-semibold ${
                                passwordStrength === 'strong' ? 'text-green-400' :
                                passwordStrength === 'medium' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {passwordStrength === 'strong' ? 'Сильный' : passwordStrength === 'medium' ? 'Средний' : 'Слабый'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                          >
                            Изменить
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-semibold">Двухфакторная аутентификация (2FA)</h4>
                              {twoFactorEnabled && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              {twoFactorEnabled 
                                ? 'Дополнительный уровень защиты активен. При входе требуется код из приложения.'
                                : 'Защитите аккаунт дополнительным кодом подтверждения при входе.'
                              }
                            </p>
                            {twoFactorEnabled && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  <span className="text-gray-300">Authenticator app подключено</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  {backupCodesGenerated ? (
                                    <span className="contents">
                                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                                      <span className="text-gray-300">Резервные коды сгенерированы</span>
                                    </span>
                                  ) : (
                                    <span className="contents">
                                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                                      <button 
                                        onClick={() => {
                                          const codes = Array.from({length: 8}, () => 
                                            Math.random().toString(36).substring(2, 10).toUpperCase()
                                          );
                                          setBackupCodes(codes);
                                          setBackupCodesGenerated(true);
                                          toast.success('Резервные коды сгенерированы!');
                                        }}
                                        className="text-yellow-400 hover:text-yellow-300 underline"
                                      >
                                        Создать резервные коды
                                      </button>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <ToggleSwitch
                            enabled={twoFactorEnabled}
                            onChange={() => {
                              setTwoFactorEnabled(!twoFactorEnabled);
                              toast.success(twoFactorEnabled ? '2FA отключена' : '2FA включена');
                            }}
                          />
                        </div>
                      </div>

                      {/* Backup Codes */}
                      {twoFactorEnabled && backupCodesGenerated && backupCodes.length > 0 && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-2 mb-3">
                            <FileKey className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-semibold">Резервные коды восстановления</h4>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">
                            Сохраните эти коды в безопасном месте. Каждый код можно использовать только один раз.
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            {backupCodes.map((code, idx) => (
                              <div key={idx} className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 font-mono text-white text-sm text-center">
                                {code}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(backupCodes.join('\n'));
                                toast.success('Коды скопированы!');
                              }}
                              className="flex-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                            >
                              <Copy className="w-4 h-4" />
                              Копировать
                            </button>
                            <button
                              onClick={() => {
                                const text = backupCodes.join('\n');
                                const blob = new Blob([text], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'backup-codes.txt';
                                a.click();
                                toast.success('Коды загружены!');
                              }}
                              className="flex-1 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                            >
                              <Download className="w-4 h-4" />
                              Скачать
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                        Активные сессии
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                          {sessions.length}
                        </span>
                      </h3>
                      <button
                        onClick={async () => {
                          const nonCurrentSessions = sessions.filter(s => !s.current);
                          for (const session of nonCurrentSessions) {
                            await settingsAPI.terminateSession(session.id);
                          }
                          setSessions(prev => prev.filter(s => s.current));
                          toast.success('Все сессии завершены');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-all"
                      >
                        Завершить все
                      </button>
                    </div>
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div key={session.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                session.current ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30' : 'bg-white/10'
                              }`}>
                                <Monitor className={`w-6 h-6 ${session.current ? 'text-green-400' : 'text-white'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-white font-bold">{session.device}</span>
                                  {session.current && (
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                                      Текущая сессия
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                  <MapPinned className="w-4 h-4" />
                                  <span>{session.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>IP: {session.ip}</span>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{session.lastActive}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {!session.current && (
                              <button
                                onClick={async () => {
                                  const success = await settingsAPI.terminateSession(session.id);
                                  if (success) {
                                    setSessions(prev => prev.filter(s => s.id !== session.id));
                                    toast.success('Сессия завершена');
                                  } else {
                                    toast.error('Ошибка завершения сессии');
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold flex-shrink-0 transition-all"
                              >
                                Завершить
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Login History */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                      История входов
                    </h3>
                    <div className="space-y-2">
                      {[
                        { date: 'Сегодня, 14:23', location: 'Москва, Россия', ip: '192.168.1.1', device: 'Chrome на Windows', status: 'success' as const },
                        { date: 'Вчера, 09:15', location: 'Москва, Россия', ip: '192.168.1.1', device: 'Chrome на Windows', status: 'success' as const },
                        { date: '2 дня назад, 18:44', location: 'Санкт-Петербург, Россия', ip: '192.168.1.2', device: 'Safari на iPhone', status: 'success' as const },
                        { date: '3 дня назад, 22:11', location: 'Неизвестно, Китай', ip: '118.24.152.45', device: 'Chrome на Android', status: 'failed' as const },
                        { date: '5 дней назад, 11:30', location: 'Москва, Россия', ip: '192.168.1.1', device: 'Chrome на Windows', status: 'success' as const },
                      ].map((entry, index) => (
                        <div key={index} className={`p-3 rounded-lg border transition-all ${
                          entry.status === 'failed' 
                            ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                entry.status === 'failed' ? 'bg-red-500/20' : 'bg-green-500/20'
                              }`}>
                                {entry.status === 'failed' ? (
                                  <ShieldAlert className="w-5 h-5 text-red-400" />
                                ) : (
                                  <ShieldCheck className="w-5 h-5 text-green-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white font-semibold text-sm">{entry.date}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    entry.status === 'success' 
                                      ? 'bg-green-500/20 text-green-400' 
                                      : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {entry.status === 'success' ? 'Успешно' : 'Отклонено'}
                                  </span>
                                </div>
                                <div className="text-gray-400 text-xs">
                                  {entry.device} • {entry.location}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  IP: {entry.ip}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Preferences */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                      Уведомления безопасности
                    </h3>
                    <div className="space-y-3">
                      <SettingCard
                        title="Уведомления о входе"
                        description="Получать email при входе с нового устройства"
                        action={
                          <ToggleSwitch
                            enabled={loginAlerts}
                            onChange={() => setLoginAlerts(!loginAlerts)}
                          />
                        }
                      />
                      <SettingCard
                        title="Подозрительная активность"
                        description="Уведомлять о необычных действиях в аккаунте"
                        action={
                          <ToggleSwitch
                            enabled={suspiciousActivityAlerts}
                            onChange={() => setSuspiciousActivityAlerts(!suspiciousActivityAlerts)}
                          />
                        }
                      />
                      <SettingCard
                        title="Запоминать устройства"
                        description="Не запрашивать 2FA код на доверенных устройствах"
                        action={
                          <ToggleSwitch
                            enabled={deviceMemory}
                            onChange={() => setDeviceMemory(!deviceMemory)}
                          />
                        }
                      />
                    </div>
                  </div>

                  {/* API Access */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                        API доступ
                      </h3>
                      <ToggleSwitch
                        enabled={apiAccessEnabled}
                        onChange={() => setApiAccessEnabled(!apiAccessEnabled)}
                      />
                    </div>
                    {apiAccessEnabled ? (
                      <div className="space-y-3">
                        <p className="text-gray-400 text-sm">
                          API ключи позволяют сторонним приложениям взаимодействовать с вашим аккаунтом.
                        </p>
                        {apiKeys.length > 0 ? (
                          <div className="space-y-2">
                            {apiKeys.map((key) => (
                              <div key={key.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="text-white font-semibold mb-1">{key.name}</div>
                                    <div className="font-mono text-xs text-gray-400 mb-1">
                                      {key.key.substring(0, 20)}...
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Создан: {key.created} • Использован: {key.lastUsed}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setApiKeys(prev => prev.filter(k => k.id !== key.id));
                                      toast.success('API ключ удалён');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold"
                                  >
                                    Удалить
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <Terminal className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm mb-3">У вас пока нет API ключей</p>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const newKey = {
                              id: Math.random().toString(36).substring(7),
                              name: `API Key ${apiKeys.length + 1}`,
                              key: 'pk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                              created: 'только что',
                              lastUsed: 'не использовался'
                            };
                            setApiKeys(prev => [...prev, newKey]);
                            toast.success('API ключ создан!');
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Создать новый API ключ
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Включите API доступ, чтобы создавать ключи для интеграции с внешними сервисами.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Notification Channels */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <BellRing className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                      Каналы доставки уведомлений
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Email */}
                      <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                            </div>
                            <h4 className="text-white font-bold text-sm sm:text-base truncate">Email</h4>
                          </div>
                          <ToggleSwitch
                            enabled={notificationChannels.email}
                            onChange={() => setNotificationChannels(prev => ({ ...prev, email: !prev.email }))}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mb-2 pl-11 sm:pl-[52px]">alexandr@music.com</p>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          Получайте детальные уведомления на email с возможностью отписки
                        </p>
                      </div>

                      {/* Push */}
                      <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                            </div>
                            <h4 className="text-white font-bold text-sm sm:text-base truncate">Push</h4>
                          </div>
                          <ToggleSwitch
                            enabled={notificationChannels.push}
                            onChange={() => setNotificationChannels(prev => ({ ...prev, push: !prev.push }))}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mb-2 pl-11 sm:pl-[52px]">Браузер/приложение</p>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          Мгновенные уведомления прямо в браузере или мобильном приложении
                        </p>
                      </div>

                      {/* SMS */}
                      <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
                              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                            </div>
                            <h4 className="text-white font-bold text-sm sm:text-base truncate">SMS</h4>
                          </div>
                          <ToggleSwitch
                            enabled={notificationChannels.sms}
                            onChange={() => setNotificationChannels(prev => ({ ...prev, sms: !prev.sms }))}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mb-2 pl-11 sm:pl-[52px]">+7 (900) ***-**-23</p>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          Важные уведомления по SMS (донаты, безопасность)
                        </p>
                      </div>

                      {/* In-App */}
                      <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                              <Inbox className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                            </div>
                            <h4 className="text-white font-bold text-sm sm:text-base truncate">In-App</h4>
                          </div>
                          <ToggleSwitch
                            enabled={notificationChannels.inApp}
                            onChange={() => setNotificationChannels(prev => ({ ...prev, inApp: !prev.inApp }))}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mb-2 pl-11 sm:pl-[52px]">Внутри платформы</p>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          Уведомления внутри платформы в реальном времени
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                      Настройки уведомлений
                    </h3>
                    <div className="space-y-4">
                      {/* Frequency */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <label className="block text-white font-semibold mb-3">Частота уведомлений</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['instant', 'hourly', 'daily'] as const).map((freq) => (
                            <button
                              key={freq}
                              onClick={() => setNotificationFrequency(freq)}
                              className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                                notificationFrequency === freq
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                              }`}
                            >
                              {freq === 'instant' ? 'Мгновенно' : freq === 'hourly' ? 'Каждый час' : 'Раз в день'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Priority Filter */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <label className="block text-white font-semibold mb-3">Приоритет уведомлений</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['all', 'important', 'critical'] as const).map((priority) => (
                            <button
                              key={priority}
                              onClick={() => setNotificationPriority(priority)}
                              className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                                notificationPriority === priority
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                              }`}
                            >
                              {priority === 'all' ? 'Все' : priority === 'important' ? 'Важные' : 'Критичные'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sound Selection */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                          <Volume2 className="w-5 h-5 text-cyan-400" />
                          Звук уведомлений
                        </label>
                        <select
                          value={notificationSound}
                          onChange={(e) => setNotificationSound(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="default">По умолчанию</option>
                          <option value="classic">Классический</option>
                          <option value="modern">Современный</option>
                          <option value="gentle">Мягкий</option>
                          <option value="alert">Сигнал</option>
                          <option value="none">Без звука</option>
                        </select>
                      </div>

                      {/* Additional Options */}
                      <div className="space-y-3">
                        <SettingCard
                          title="Группировать уведомления"
                          description="Объединять похожие уведомления в одно"
                          action={
                            <ToggleSwitch
                              enabled={groupNotifications}
                              onChange={() => setGroupNotifications(!groupNotifications)}
                            />
                          }
                        />
                        <SettingCard
                          title="Вибрация"
                          description="Включить вибрацию при получении уведомлений"
                          action={
                            <ToggleSwitch
                              enabled={vibrationEnabled}
                              onChange={() => setVibrationEnabled(!vibrationEnabled)}
                            />
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quiet Hours */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <BellOff className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                        Тихие часы
                      </h3>
                      <ToggleSwitch
                        enabled={quietHoursEnabled}
                        onChange={() => setQuietHoursEnabled(!quietHoursEnabled)}
                      />
                    </div>
                    {quietHoursEnabled && (
                      <div className="space-y-4">
                        <p className="text-gray-400 text-sm">
                          Не получать уведомления в указанный период времени (кроме критичных)
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-white font-semibold mb-2 text-sm">Начало</label>
                            <input
                              type="time"
                              value={quietHoursStart}
                              onChange={(e) => setQuietHoursStart(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-white font-semibold mb-2 text-sm">Окончание</label>
                            <input
                              type="time"
                              value={quietHoursEnd}
                              onChange={(e) => setQuietHoursEnd(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <p className="text-purple-300 text-sm">
                            <Info className="w-4 h-4 inline mr-2" />
                            Тихие часы: с {quietHoursStart} до {quietHoursEnd}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Per-Type Notification Preferences */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                      Уведомления по типу
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">Включите или отключите уведомления для каждого типа событий</p>

                    {/* Публикации */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Публикации
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <SettingCard
                          title="Одобрение"
                          description="Контент одобрен модерацией"
                          action={<ToggleSwitch enabled={typePrefs.publish_approved} onChange={() => handleTypePrefChange('publish_approved')} />}
                        />
                        <SettingCard
                          title="Отклонение"
                          description="Контент отклонен"
                          action={<ToggleSwitch enabled={typePrefs.publish_rejected} onChange={() => handleTypePrefChange('publish_rejected')} />}
                        />
                        <SettingCard
                          title="Доработка"
                          description="Требуется исправление"
                          action={<ToggleSwitch enabled={typePrefs.publish_revision} onChange={() => handleTypePrefChange('publish_revision')} />}
                        />
                        <SettingCard
                          title="Опубликовано"
                          description="Контент опубликован"
                          action={<ToggleSwitch enabled={typePrefs.publish_published} onChange={() => handleTypePrefChange('publish_published')} />}
                        />
                      </div>
                    </div>

                    {/* Коллаборации */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Коллаборации
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <SettingCard
                          title="Предложения"
                          description="Новые предложения коллаборации"
                          action={<ToggleSwitch enabled={typePrefs.collab_offers} onChange={() => handleTypePrefChange('collab_offers')} />}
                        />
                        <SettingCard
                          title="Ответы"
                          description="Ответы на ваши предложения"
                          action={<ToggleSwitch enabled={typePrefs.collab_responses} onChange={() => handleTypePrefChange('collab_responses')} />}
                        />
                        <SettingCard
                          title="Сообщения"
                          description="Сообщения в коллаборациях"
                          action={<ToggleSwitch enabled={typePrefs.collab_messages} onChange={() => handleTypePrefChange('collab_messages')} />}
                        />
                      </div>
                    </div>

                    {/* Финансы */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Финансы
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <SettingCard
                          title="Платежи"
                          description="Поступления и списания"
                          action={<ToggleSwitch enabled={typePrefs.finance_payments} onChange={() => handleTypePrefChange('finance_payments')} />}
                        />
                        <SettingCard
                          title="Вывод средств"
                          description="Статус вывода денег"
                          action={<ToggleSwitch enabled={typePrefs.finance_withdrawals} onChange={() => handleTypePrefChange('finance_withdrawals')} />}
                        />
                      </div>
                    </div>

                    {/* Система */}
                    <div>
                      <h4 className="text-sm font-bold text-indigo-400 mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Система
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <SettingCard
                          title="Обновления"
                          description="Новые функции платформы"
                          action={<ToggleSwitch enabled={typePrefs.system_updates} onChange={() => handleTypePrefChange('system_updates')} />}
                        />
                        <SettingCard
                          title="Безопасность"
                          description="Входы и подозрительная активность"
                          action={<ToggleSwitch enabled={typePrefs.system_security} onChange={() => handleTypePrefChange('system_security')} />}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Activity Notifications */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                      Активность и взаимодействия
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <SettingCard
                        title="Новые донаты"
                        description="От подписчиков"
                        action={
                          <ToggleSwitch
                            enabled={notifyNewDonations}
                            onChange={() => setNotifyNewDonations(!notifyNewDonations)}
                          />
                        }
                      />
                      <SettingCard
                        title="Новые сообщения"
                        description="Личные сообщения"
                        action={
                          <ToggleSwitch
                            enabled={notifyNewMessages}
                            onChange={() => setNotifyNewMessages(!notifyNewMessages)}
                          />
                        }
                      />
                      <SettingCard
                        title="Комментарии"
                        description="К вашим трекам"
                        action={
                          <ToggleSwitch
                            enabled={notifyNewComments}
                            onChange={() => setNotifyNewComments(!notifyNewComments)}
                          />
                        }
                      />
                      <SettingCard
                        title="Новые подписчики"
                        description="Когда подписываются"
                        action={
                          <ToggleSwitch
                            enabled={notifyNewFollowers}
                            onChange={() => setNotifyNewFollowers(!notifyNewFollowers)}
                          />
                        }
                      />
                      <SettingCard
                        title="Ответы на комментарии"
                        description="Кто-то ответил вам"
                        action={
                          <ToggleSwitch
                            enabled={notifyReplies}
                            onChange={() => setNotifyReplies(!notifyReplies)}
                          />
                        }
                      />
                      <SettingCard
                        title="Упоминания"
                        description="Когда вас упомянули"
                        action={
                          <ToggleSwitch
                            enabled={notifyMentions}
                            onChange={() => setNotifyMentions(!notifyMentions)}
                          />
                        }
                      />
                      <SettingCard
                        title="Лайки"
                        description="На треки и комментарии"
                        action={
                          <ToggleSwitch
                            enabled={notifyLikes}
                            onChange={() => setNotifyLikes(!notifyLikes)}
                          />
                        }
                      />
                      <SettingCard
                        title="Репосты"
                        description="Когда делятся треками"
                        action={
                          <ToggleSwitch
                            enabled={notifyShares}
                            onChange={() => setNotifyShares(!notifyShares)}
                          />
                        }
                      />
                      <SettingCard
                        title="Добавления в плейлисты"
                        description="Ваши треки в чужих плейлистах"
                        action={
                          <ToggleSwitch
                            enabled={notifyPlaylistAdds}
                            onChange={() => setNotifyPlaylistAdds(!notifyPlaylistAdds)}
                          />
                        }
                      />
                      <SettingCard
                        title="Запросы на коллаборацию"
                        description="Приглашения от артистов"
                        action={
                          <ToggleSwitch
                            enabled={notifyCollaborationRequests}
                            onChange={() => setNotifyCollaborationRequests(!notifyCollaborationRequests)}
                          />
                        }
                      />
                    </div>
                  </div>

                  {/* Analytics & Earnings */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      Аналитика и доход
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SettingCard
                        title="Еженедельная аналитика"
                        description="Сводка статистики"
                        action={
                          <ToggleSwitch
                            enabled={notifyAnalytics}
                            onChange={() => setNotifyAnalytics(!notifyAnalytics)}
                          />
                        }
                      />
                      <SettingCard
                        title="Milestone прослушиваний"
                        description="1K, 10K, 100K и т.д."
                        action={
                          <ToggleSwitch
                            enabled={notifyStreamMilestones}
                            onChange={() => setNotifyStreamMilestones(!notifyStreamMilestones)}
                          />
                        }
                      />
                      <SettingCard
                        title="Маркетинговые кампании"
                        description="Статус промо"
                        action={
                          <ToggleSwitch
                            enabled={notifyMarketingCampaigns}
                            onChange={() => setNotifyMarketingCampaigns(!notifyMarketingCampaigns)}
                          />
                        }
                      />
                      <SettingCard
                        title="Роялти выплаты"
                        description="Начисления от стриминга"
                        action={
                          <ToggleSwitch
                            enabled={notifyRoyaltyPayments}
                            onChange={() => setNotifyRoyaltyPayments(!notifyRoyaltyPayments)}
                          />
                        }
                      />
                    </div>
                  </div>

                  {/* System Notifications */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                      Системные уведомления
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SettingCard
                        title="Истечение подписки"
                        description="Напоминания о продлении"
                        action={
                          <ToggleSwitch
                            enabled={notifySubscriptionExpiry}
                            onChange={() => setNotifySubscriptionExpiry(!notifySubscriptionExpiry)}
                          />
                        }
                      />
                      <SettingCard
                        title="Обновления платформы"
                        description="Новые функции и изменения"
                        action={
                          <ToggleSwitch
                            enabled={notifySystemUpdates}
                            onChange={() => setNotifySystemUpdates(!notifySystemUpdates)}
                          />
                        }
                      />
                    </div>
                  </div>

                  {/* Test Notification */}
                  <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Тестовое уведомление</h4>
                        <p className="text-gray-400 text-sm">Проверьте, как будут выглядеть уведомления</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        toast.success('🎵 Новый донат на 500₽ от @music_fan! "Спасибо за музыку!"', {
                          duration: 5000
                        });
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                    >
                      Отправить тестовое уведомление
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                      Приватность
                    </h3>
                    <div className="space-y-3">
                      {/* Visibility of Profile */}
                      <div className="p-3 sm:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10">
                        <label className="block text-white font-semibold mb-2">
                          Видимость профиля
                        </label>
                        <p className="text-gray-400 text-xs sm:text-sm mb-3">
                          Кто может видеть ваш профиль
                        </p>
                        <CustomDropdown
                          value={profileVisibility}
                          options={[
                            { value: 'public', label: 'Публичный - все могут видеть', icon: <Globe className="w-4 h-4 text-green-400" /> },
                            { value: 'followers', label: 'Только подписчики', icon: <Users className="w-4 h-4 text-blue-400" /> },
                            { value: 'private', label: 'Приватный - никто не видит', icon: <Lock className="w-4 h-4 text-red-400" /> },
                          ]}
                          onChange={(val) => {
                            setProfileVisibility(val as 'public' | 'private' | 'followers');
                            toast.success('Настройки приватности обновлены');
                          }}
                          isOpen={showVisibilityDropdown}
                          setIsOpen={setShowVisibilityDropdown}
                        />
                      </div>

                      {/* Allow Messages From */}
                      <div className="p-3 sm:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10">
                        <label className="block text-white font-semibold mb-2">
                          Кто может писать сообщения
                        </label>
                        <p className="text-gray-400 text-xs sm:text-sm mb-3">
                          Настройте кто может отправлять вам сообщения
                        </p>
                        <CustomDropdown
                          value={allowMessages}
                          options={[
                            { value: 'everyone', label: 'Все пользователи', icon: <Users className="w-4 h-4 text-green-400" /> },
                            { value: 'followers', label: 'Только подписчики', icon: <Heart className="w-4 h-4 text-blue-400" /> },
                            { value: 'none', label: 'Никто', icon: <X className="w-4 h-4 text-red-400" /> },
                          ]}
                          onChange={(val) => {
                            setAllowMessages(val as 'everyone' | 'followers' | 'none');
                            toast.success('Настройки сообщений обновлены');
                          }}
                          isOpen={showMessagesDropdown}
                          setIsOpen={setShowMessagesDropdown}
                        />
                      </div>

                      <SettingCard
                        title="Онлайн статус"
                        description="Показывать когда вы онлайн"
                        action={
                          <ToggleSwitch
                            enabled={showOnlineStatus}
                            onChange={() => setShowOnlineStatus(!showOnlineStatus)}
                          />
                        }
                      />
                      <SettingCard
                        title="Время последнего визита"
                        description="Показывать последнюю активность"
                        action={
                          <ToggleSwitch
                            enabled={showLastSeen}
                            onChange={() => setShowLastSeen(!showLastSeen)}
                          />
                        }
                      />
                      <SettingCard
                        title="Статистика профиля"
                        description="Показывать статистику прослушиваний"
                        action={
                          <ToggleSwitch
                            enabled={showStats}
                            onChange={() => setShowStats(!showStats)}
                          />
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Payment Methods */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                        Способы оплаты
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                          {paymentMethods.length}
                        </span>
                      </h3>
                      <button
                        onClick={() => setShowAddCardModal(true)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/20 transition-all w-full sm:w-auto justify-center sm:justify-start"
                      >
                        <Plus className="w-4 h-4" />
                        Добавить карту
                      </button>
                    </div>
                    
                    {paymentMethods.length > 0 ? (
                      <div className="space-y-3">
                        {paymentMethods.map((method) => {
                          const cardBrand = method.type.toLowerCase();
                          const brandColors = {
                            visa: 'from-blue-500 to-indigo-600',
                            mastercard: 'from-orange-500 to-red-600',
                            mir: 'from-green-500 to-emerald-600',
                            maestro: 'from-purple-500 to-pink-600'
                          };
                          
                          return (
                            <div key={method.id} className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                              onClick={() => {
                                setSelectedCard(method);
                                setShowEditCardModal(true);
                              }}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                  {/* Card Visual */}
                                  <div className={`w-14 h-10 sm:w-16 sm:h-11 rounded-lg bg-gradient-to-br ${brandColors[cardBrand as keyof typeof brandColors] || 'from-gray-500 to-gray-600'} flex items-center justify-center relative overflow-hidden shadow-lg group-hover:scale-105 transition-transform flex-shrink-0`}>
                                    <div className="absolute inset-0 bg-black/20"></div>
                                    <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" />
                                  </div>
                                  
                                  {/* Card Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="text-white font-bold text-base sm:text-lg">
                                        {method.type.toUpperCase()}
                                      </span>
                                      <span className="text-gray-400 font-mono text-sm">•••• {method.last4}</span>
                                      {method.isDefault && (
                                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1">
                                          <BadgeCheck className="w-3 h-3" />
                                          Основная
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                        <span>Истекает {method.expires}</span>
                                      </div>
                                      {method.isDefault && (
                                        <div className="flex items-center gap-1">
                                          <Zap className="w-3 h-3 text-green-400 flex-shrink-0" />
                                          <span className="text-green-400">Автоплатёж активен</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex gap-2 self-end sm:self-center flex-shrink-0 ml-auto sm:ml-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCard(method);
                                      setShowEditCardModal(true);
                                    }}
                                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-semibold transition-all flex items-center gap-1"
                                    title="Редактировать"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {!method.isDefault && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === method.id })));
                                        toast.success('Карта установлена как основная');
                                      }}
                                      className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold transition-all flex items-center gap-1"
                                    >
                                      <Star className="w-3.5 h-3.5 sm:hidden" />
                                      <span className="hidden sm:inline">Основная</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCard(method);
                                      setShowDeleteCardModal(true);
                                    }}
                                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-all"
                                    title="Удалить"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">У вас пока нет сохранённых способов оплаты</p>
                        <button
                          onClick={() => setShowAddCardModal(true)}
                          className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg hover:shadow-green-500/20 transition-all"
                        >
                          Добавить первую карту
                        </button>
                      </div>
                    )}

                    {/* Payment Options */}
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                      <SettingCard
                        title="Автоматическое списание"
                        description="Автоматически оплачивать подписку с основной карты"
                        action={
                          <ToggleSwitch
                            enabled={autoPayEnabled}
                            onChange={() => setAutoPayEnabled(!autoPayEnabled)}
                          />
                        }
                      />
                      <SettingCard
                        title="Сохранять карты"
                        description="Безопасно сохранять данные карт для быстрой оплаты"
                        action={
                          <ToggleSwitch
                            enabled={saveCardsEnabled}
                            onChange={() => setSaveCardsEnabled(!saveCardsEnabled)}
                          />
                        }
                      />
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                      Платёжный адрес
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-white font-semibold mb-2 text-sm">Страна</label>
                        <input
                          type="text"
                          value={billingAddress.country}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-semibold mb-2 text-sm">Город</label>
                        <input
                          type="text"
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-semibold mb-2 text-sm">Адрес</label>
                        <input
                          type="text"
                          value={billingAddress.address}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-semibold mb-2 text-sm">Индекс</label>
                        <input
                          type="text"
                          value={billingAddress.zip}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, zip: e.target.value }))}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => toast.success('Платёжный адрес сохранён!')}
                      className="mt-4 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/20 transition-all w-full sm:w-auto"
                    >
                      Сохранить адрес
                    </button>
                  </div>

                  {/* Invoicing */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      Счета и чеки
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white font-semibold mb-2 text-sm">Email для отправки счетов</label>
                        <input
                          type="email"
                          value={invoiceEmail}
                          onChange={(e) => setInvoiceEmail(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-semibold mb-2 text-sm">ИНН (опционально)</label>
                        <input
                          type="text"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="1234567890"
                        />
                        <p className="text-gray-400 text-xs mt-2">
                          Укажите ИНН для получения официальных счетов-фактур
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment History Stats */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                      Статистика платежей
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg sm:text-xl xl:text-2xl">₽4,280</h4>
                            <p className="text-xs text-green-400">Всего потрачено</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">За всё время</p>
                      </div>
                      
                      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg sm:text-xl xl:text-2xl">12</h4>
                            <p className="text-xs text-blue-400">Транзакций</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Успешных платежей</p>
                      </div>
                      
                      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 sm:col-span-2 xl:col-span-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg sm:text-xl xl:text-2xl">₽890</h4>
                            <p className="text-xs text-purple-400">В этом месяце</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Средний чек: ₽356</p>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Payment Methods */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                      Альтернативные способы оплаты
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { name: 'СБП', fullName: 'Система быстрых платежей', icon: <QrCode className="w-5 h-5 text-blue-400" />, available: true },
                        { name: 'ЮMoney', fullName: '', icon: <Wallet className="w-5 h-5 text-purple-400" />, available: true },
                        { name: 'QIWI Кошелёк', fullName: '', icon: <Wallet className="w-5 h-5 text-orange-400" />, available: false },
                        { name: 'Криптовалюта', fullName: '', icon: <Banknote className="w-5 h-5 text-green-400" />, available: false },
                      ].map((method, idx) => (
                        <div key={idx} className={`p-3 sm:p-4 rounded-xl border transition-all ${
                          method.available 
                            ? 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer' 
                            : 'bg-white/5 border-white/10 opacity-50'
                        }`}>
                          <div className="flex items-start gap-2.5 sm:gap-3">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              method.available ? 'bg-white/10' : 'bg-white/5'
                            }`}>
                              {method.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold text-sm leading-tight">{method.name}</h4>
                              {method.fullName && (
                                <p className="text-xs text-gray-400 leading-tight mt-0.5">{method.fullName}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-0.5">
                                {method.available ? 'Доступно' : 'Скоро'}
                              </p>
                              {method.available && (
                                <button
                                  onClick={() => toast.success('Способ оплаты будет добавлен')}
                                  className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs sm:text-sm font-semibold transition-all"
                                >
                                  Подключить
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-bold mb-2 text-sm sm:text-base">Безопасность платежей</h4>
                        <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>Все платежи защищены 3D Secure и PCI DSS</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>Данные карт хранятся в зашифрованном виде</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>Токенизация карт для максимальной безопасности</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>Мгновенные уведомления о каждой транзакции</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'subscription' && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 md:space-y-6"
                >
                  {/* Current Plan */}
                  {currentSubscription && (
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                        Текущий план
                      </h3>
                      <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${
                        currentSubscription.planId === 'pro' 
                          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/40' 
                          : currentSubscription.planId === 'start'
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/40'
                          : currentSubscription.planId === 'elite'
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40'
                          : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className={`w-6 h-6 sm:w-7 sm:h-7 ${
                                currentSubscription.planId === 'pro' ? 'text-purple-400' : 
                                currentSubscription.planId === 'elite' ? 'text-yellow-400' :
                                currentSubscription.planId === 'start' ? 'text-green-400' : 
                                'text-gray-400'
                              }`} />
                              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                                {currentSubscription.planName}
                              </span>
                              {currentSubscription.status === 'trial' && (
                                <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold">
                                  Пробный период
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm sm:text-base">
                              {currentSubscription.cancelAtPeriodEnd 
                                ? `Заканчивается ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                : `Активен до ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`
                              }
                            </p>
                          </div>
                          {currentSubscription.price > 0 && (
                            <div className="text-left sm:text-right">
                              <div className="text-2xl sm:text-3xl font-bold text-white">
                                ₽{currentSubscription.price.toLocaleString()}
                              </div>
                              <div className="text-gray-400 text-sm">
                                /{currentSubscription.interval === 'year' ? 'год' : 'месяц'}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Plan Features */}
                        {currentSubscription.planId !== 'spark' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {currentSubscription.planId === 'pro' ? (
                              <div className="contents">
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>3 рассылки/мес</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>Скидка 10-15% на услуги</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>Комиссия 5% на донаты</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>+15% бонус к коинам</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>Приоритетная поддержка</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>Доп. рассылка - 4 000 ₽</span>
                                </div>
                              </div>
                            ) : currentSubscription.planId === 'start' ? (
                              <div className="contents">
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>1 рассылка/мес</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>Скидка 5% на услуги</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>Комиссия 7% на донаты</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>Доп. рассылка - 5 000 ₽</span>
                                </div>
                              </div>
                            ) : currentSubscription.planId === 'elite' ? (
                              <div className="contents">
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>10 рассылок/мес</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>Скидка 15-25% на услуги</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>Комиссия 3% на донаты</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span>Персональный менеджер</span>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          {!currentSubscription.cancelAtPeriodEnd && currentSubscription.planId !== 'spark' && (
                            <div className="contents">
                              <button className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold text-sm sm:text-base shadow-lg">
                                Продлить
                              </button>
                              <button
                                onClick={handleCancelSubscription}
                                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base"
                              >
                                Отменить подписку
                              </button>
                            </div>
                          )}
                          {currentSubscription.cancelAtPeriodEnd && (
                            <button className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-sm sm:text-base shadow-lg">
                              Возобновить подписку
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing Interval Toggle */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-white">Доступные планы</h3>
                      <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
                        <button
                          onClick={() => setBillingInterval('month')}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                            billingInterval === 'month'
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Ежемесячно
                        </button>
                        <button
                          onClick={() => setBillingInterval('year')}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                            billingInterval === 'year'
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Ежегодно
                          <span className="ml-1 text-green-400">-17%</span>
                        </button>
                      </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                      {availablePlans.map((plan) => {
                        const isCurrent = currentSubscription?.planId === plan.id;
                        const price = billingInterval === 'year' && plan.price > 0 ? plan.price * 10 : plan.price;
                        
                        return (
                          <div
                            key={plan.id}
                            className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                              plan.popular
                                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/40 shadow-lg shadow-purple-500/10'
                                : plan.id === 'elite'
                                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                          >
                            {plan.popular && (
                              <div className="mb-3">
                                <span className="px-3 py-1 rounded-full bg-yellow-500 text-black text-xs font-bold">
                                  Популярный
                                </span>
                              </div>
                            )}
                            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">{plan.name}</h4>
                            <div className="mb-4">
                              {plan.price === 0 && plan.id === 'spark' ? (
                                <div className="text-xl sm:text-2xl font-bold text-gray-400">Бесплатно</div>
                              ) : (
                                <div className="contents">
                                  <div className="text-2xl sm:text-3xl font-bold text-white">
                                    {price === 0 ? 'Бесплатно' : `₽${price.toLocaleString()}`}
                                  </div>
                                  {price > 0 && (
                                    <div className="text-gray-400 text-xs sm:text-sm">
                                      /{billingInterval === 'year' ? 'год' : 'месяц'}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <ul className="space-y-2 mb-4 xl:min-h-[180px]">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            {isCurrent ? (
                              <button
                                disabled
                                className="w-full px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 text-gray-400 font-semibold text-sm sm:text-base cursor-not-allowed"
                              >
                                Текущий план
                              </button>
                            ) : (
                              <button
                                onClick={() => handleChangePlan(plan.id)}
                                className={`w-full px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base ${
                                  plan.popular
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black shadow-lg'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white'
                                }`}
                              >
                                {currentSubscription && currentSubscription.planId !== 'spark' && plan.price < currentSubscription.price
                                  ? 'Понизить'
                                  : 'Выбрать план'
                                }
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment History */}
                  {paymentHistory.length > 0 && (
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                      {/* Header with Stats */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                            История платежей
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm">
                            Всего операций: {paymentHistory.length} • Потрачено: ₽
                            {paymentHistory
                              .filter(p => p.status === 'paid' && p.category !== 'donation')
                              .reduce((sum, p) => sum + p.amount, 0)
                              .toLocaleString()}
                          </p>
                        </div>
                        <button className="px-3 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Экспорт
                        </button>
                      </div>

                      {/* Filters */}
                      <div className="space-y-3 mb-4">
                        {/* Search */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Поиск по платежам..."
                            value={paymentSearch}
                            onChange={(e) => setPaymentSearch(e.target.value)}
                            className="w-full px-4 py-2.5 pl-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500/50"
                          />
                          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>

                        {/* Filter Pills */}
                        <div className="space-y-2">
                          {/* Status Filter */}
                          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                            {(['all', 'paid', 'pending', 'failed', 'refunded'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => setPaymentFilter(status)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                                  paymentFilter === status
                                    ? 'bg-cyan-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                {status === 'all' ? 'Все' : 
                                 status === 'paid' ? 'Оплачено' : 
                                 status === 'pending' ? 'Ожидание' : 
                                 status === 'failed' ? 'Ошибка' : 'Возврат'}
                              </button>
                            ))}
                          </div>

                          {/* Category Filter */}
                          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                            {(['all', 'subscription', 'donation', 'promotion', 'coins', 'pitching'] as const).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setPaymentCategoryFilter(cat)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                                  paymentCategoryFilter === cat
                                    ? 'bg-purple-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                {cat === 'all' ? '🔍 Все' : 
                                 cat === 'subscription' ? '👑 Подписка' : 
                                 cat === 'donation' ? '💝 Донаты' : 
                                 cat === 'promotion' ? '📢 Реклама' : 
                                 cat === 'coins' ? '🪙 Коины' : '🎵 Питчинг'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Payment List */}
                      <div className="space-y-2">
                        {paymentHistory
                          .filter((p) => {
                            // Status filter
                            if (paymentFilter !== 'all' && p.status !== paymentFilter) return false;
                            // Category filter
                            if (paymentCategoryFilter !== 'all' && p.category !== paymentCategoryFilter) return false;
                            // Search filter
                            if (paymentSearch && !p.description.toLowerCase().includes(paymentSearch.toLowerCase()) && 
                                !p.transactionId?.toLowerCase().includes(paymentSearch.toLowerCase())) return false;
                            return true;
                          })
                          .map((payment) => {
                            const isExpanded = expandedPayment === payment.id;
                            
                            return (
                              <motion.div
                                key={payment.id}
                                layout
                                className="rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-colors"
                              >
                                {/* Main Payment Row */}
                                <button
                                  onClick={() => setExpandedPayment(isExpanded ? null : payment.id)}
                                  className="w-full p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left"
                                >
                                  <div className="flex-1 flex items-start gap-3">
                                    {/* Category Icon */}
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      payment.category === 'subscription' ? 'bg-yellow-500/20 text-yellow-400' :
                                      payment.category === 'donation' ? 'bg-pink-500/20 text-pink-400' :
                                      payment.category === 'promotion' ? 'bg-blue-500/20 text-blue-400' :
                                      payment.category === 'coins' ? 'bg-orange-500/20 text-orange-400' :
                                      payment.category === 'pitching' ? 'bg-purple-500/20 text-purple-400' :
                                      'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {payment.category === 'subscription' ? <Crown className="w-5 h-5" /> :
                                       payment.category === 'donation' ? <Heart className="w-5 h-5" /> :
                                       payment.category === 'promotion' ? <TrendingUp className="w-5 h-5" /> :
                                       payment.category === 'coins' ? <Zap className="w-5 h-5" /> :
                                       payment.category === 'pitching' ? <Music2 className="w-5 h-5" /> :
                                       <Banknote className="w-5 h-5" />}
                                    </div>

                                    {/* Payment Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-white font-semibold text-sm sm:text-base">
                                          {payment.description}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                          payment.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                          payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                          payment.status === 'refunded' ? 'bg-blue-500/20 text-blue-400' :
                                          'bg-red-500/20 text-red-400'
                                        }`}>
                                          {payment.status === 'paid' ? '✓ Оплачено' : 
                                           payment.status === 'pending' ? '⏳ Ожидание' :
                                           payment.status === 'refunded' ? '↩ Возврат' : '✗ Ошибка'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                          {new Date(payment.date).toLocaleDateString('ru-RU', { 
                                            day: 'numeric', 
                                            month: 'long', 
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                        </span>
                                        {payment.paymentMethod && (
                                          <span className="contents">
                                            <span>•</span>
                                            <CreditCard className="w-3 h-3" />
                                            <span className="uppercase">{payment.paymentMethod.type}</span>
                                            <span>••{payment.paymentMethod.last4}</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Amount & Arrow */}
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <div className={`text-lg sm:text-xl font-bold ${
                                        payment.status === 'refunded' ? 'text-blue-400' : 'text-white'
                                      }`}>
                                        {payment.status === 'refunded' ? '+' : ''}₽{payment.amount.toLocaleString()}
                                      </div>
                                      {payment.fee !== undefined && payment.fee !== 0 && (
                                        <div className="text-gray-400 text-xs">
                                          комиссия ₽{Math.abs(payment.fee).toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                                      isExpanded ? 'rotate-90' : ''
                                    }`} />
                                  </div>
                                </button>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="border-t border-white/10"
                                    >
                                      <div className="p-4 space-y-3 bg-white/5">
                                        {/* Transaction Details */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {payment.transactionId && (
                                            <div>
                                              <div className="text-gray-400 text-xs mb-1">ID транзакции</div>
                                              <div className="text-white text-sm font-mono">{payment.transactionId}</div>
                                            </div>
                                          )}
                                          <div>
                                            <div className="text-gray-400 text-xs mb-1">Категория</div>
                                            <div className="text-white text-sm">
                                              {payment.category === 'subscription' ? 'Подписка' :
                                               payment.category === 'donation' ? 'Донаты' :
                                               payment.category === 'promotion' ? 'Продвижение' :
                                               payment.category === 'coins' ? 'Покупка коинов' :
                                               payment.category === 'pitching' ? 'Питчинг' : 'Другое'}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Additional Details */}
                                        {payment.details && (
                                          <div className="space-y-2">
                                            {payment.details.planName && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm">План</span>
                                                <span className="text-white text-sm font-semibold">{payment.details.planName}</span>
                                              </div>
                                            )}
                                            {payment.details.period && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm">Период</span>
                                                <span className="text-white text-sm">{payment.details.period}</span>
                                              </div>
                                            )}
                                            {payment.details.campaignName && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm">Кампания</span>
                                                <span className="text-white text-sm">{payment.details.campaignName}</span>
                                              </div>
                                            )}
                                            {payment.details.recipient && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm">Получатель</span>
                                                <span className="text-white text-sm">{payment.details.recipient}</span>
                                              </div>
                                            )}
                                            {payment.details.coinsAmount && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm">Коинов получено</span>
                                                <span className="text-yellow-400 text-sm font-semibold">
                                                  🪙 {payment.details.coinsAmount.toLocaleString()}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Financial Breakdown */}
                                        <div className="pt-3 border-t border-white/10 space-y-2">
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Сумма</span>
                                            <span className="text-white">₽{payment.amount.toLocaleString()}</span>
                                          </div>
                                          {payment.fee !== undefined && payment.fee !== 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                              <span className="text-gray-400">Комиссия</span>
                                              <span className="text-gray-400">₽{Math.abs(payment.fee).toLocaleString()}</span>
                                            </div>
                                          )}
                                          {payment.tax !== undefined && payment.tax > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                              <span className="text-gray-400">НДС</span>
                                              <span className="text-gray-400">₽{payment.tax.toLocaleString()}</span>
                                            </div>
                                          )}
                                          <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-white/10">
                                            <span className="text-white">Итого списано</span>
                                            <span className="text-white">
                                              ₽{(payment.amount + (payment.fee || 0) + (payment.tax || 0)).toLocaleString()}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                          {payment.invoiceUrl && (
                                            <button className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold flex items-center justify-center gap-2">
                                              <Download className="w-4 h-4" />
                                              Скачать счёт
                                            </button>
                                          )}
                                          <button className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold flex items-center justify-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Отправить на email
                                            </button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}

                        {/* Empty State */}
                        {paymentHistory.filter((p) => {
                          if (paymentFilter !== 'all' && p.status !== paymentFilter) return false;
                          if (paymentCategoryFilter !== 'all' && p.category !== paymentCategoryFilter) return false;
                          if (paymentSearch && !p.description.toLowerCase().includes(paymentSearch.toLowerCase()) && 
                              !p.transactionId?.toLowerCase().includes(paymentSearch.toLowerCase())) return false;
                          return true;
                        }).length === 0 && (
                          <div className="text-center py-12">
                            <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Платежи не найдены</p>
                            <button
                              onClick={() => {
                                setPaymentFilter('all');
                                setPaymentCategoryFilter('all');
                                setPaymentSearch('');
                              }}
                              className="mt-3 text-cyan-400 text-sm hover:underline"
                            >
                              Сбросить фильтры
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AnalyticsPage />
                </motion.div>
              )}

              {activeTab === 'finances' && (
                <motion.div
                  key="finances"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <FinancesPage />
                </motion.div>
              )}

              {activeTab === 'support' && (
                <motion.div
                  key="support"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SupportPage />
                </motion.div>
              )}

              {activeTab === 'advanced' && (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Language */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                      Язык интерфейса
                    </h3>
                    <CustomDropdown
                      value={language}
                      options={[
                        { value: 'ru', label: 'Русский', icon: <span className="text-lg">🇷🇺</span> },
                        { value: 'en', label: 'English', icon: <span className="text-lg">🇬🇧</span> },
                        { value: 'uk', label: 'Українська', icon: <span className="text-lg">🇺🇦</span> },
                        { value: 'kz', label: 'Қазақша', icon: <span className="text-lg">🇰🇿</span> },
                      ]}
                      onChange={(val) => {
                        setLanguage(val);
                        toast.success('Язык изменён');
                      }}
                      isOpen={showLanguageDropdown}
                      setIsOpen={setShowLanguageDropdown}
                    />
                  </div>

                  {/* Data Export */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Download className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      Экспорт данных
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base mb-4">Скачайте копию ваших данных в формате JSON</p>
                    <button
                      onClick={() => toast.success('Экспорт запущен!')}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm sm:text-base flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <Download className="w-5 h-5" />
                      Экспортировать данные
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="backdrop-blur-xl bg-white/5 border border-red-500/30 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      Удаление аккаунта
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base mb-4">
                      Внимание! Это действие необратимо. Все ваши данные, треки и статистика будут удалены навсегда.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Вы уверены? Это действие нельзя отменить!')) {
                          toast.error('Аккаунт удалён');
                        }
                      }}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm sm:text-base flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <Trash2 className="w-5 h-5" />
                      Удалить аккаунт навсегда
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddCardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a14] border border-white/20 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  Добавить карту
                </h2>
                <button
                  onClick={() => setShowAddCardModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Card Preview */}
              <div className={`mb-6 p-6 rounded-xl bg-gradient-to-br shadow-2xl relative overflow-hidden ${
                cardForm.type === 'visa' ? 'from-blue-500 to-indigo-600' :
                cardForm.type === 'mastercard' ? 'from-orange-500 to-red-600' :
                cardForm.type === 'mir' ? 'from-green-500 to-emerald-600' :
                'from-purple-500 to-pink-600'
              }`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <CreditCard className="w-10 h-10 text-white/80" />
                    <span className="text-white/90 font-bold text-lg">{cardForm.type.toUpperCase()}</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-white/60 text-xs mb-1">Номер карты</p>
                    <p className="text-white font-mono text-lg tracking-wider">
                      {cardForm.cardNumber || '•••• •••• •••• ••••'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-white/60 text-xs mb-1">Владелец</p>
                      <p className="text-white font-semibold text-sm">
                        {cardForm.cardHolder || 'CARD HOLDER'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs mb-1">Срок</p>
                      <p className="text-white font-mono">
                        {cardForm.expiryDate || 'MM/YY'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Card Number */}
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Номер карты</label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardForm.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const formatted = formatCardNumber(value);
                      const type = detectCardType(value);
                      setCardForm(prev => ({ ...prev, cardNumber: formatted, type }));
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Card Holder */}
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Имя владельца</label>
                  <input
                    type="text"
                    value={cardForm.cardHolder}
                    onChange={(e) => setCardForm(prev => ({ ...prev, cardHolder: e.target.value.toUpperCase() }))}
                    placeholder="IVAN IVANOV"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Срок действия</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardForm.expiryDate}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value);
                        setCardForm(prev => ({ ...prev, expiryDate: formatted }));
                      }}
                      placeholder="12/25"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">CVV</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={cardForm.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setCardForm(prev => ({ ...prev, cvv: value }));
                      }}
                      placeholder="123"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddCardModal(false);
                      setCardForm({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '', type: 'visa' });
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (!validateCard()) return;
                      
                      const newId = paymentMethods.length > 0 ? Math.max(...paymentMethods.map(m => m.id)) + 1 : 1;
                      const last4 = cardForm.cardNumber.replace(/\s/g, '').slice(-4);
                      
                      setPaymentMethods(prev => [...prev, {
                        id: newId,
                        type: cardForm.type,
                        last4: last4,
                        expires: cardForm.expiryDate,
                        isDefault: paymentMethods.length === 0
                      }]);
                      
                      toast.success('Карта успешно добавлена!');
                      setShowAddCardModal(false);
                      setCardForm({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '', type: 'visa' });
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg hover:shadow-green-500/20 transition-all"
                  >
                    Добавить карту
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-cyan-300">
                    Ваши данные защищены 256-битным шифрованием и стандартом PCI DSS
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Card Modal */}
      <AnimatePresence>
        {showEditCardModal && selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditCardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a14] border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-6 h-6 text-blue-400" />
                  Редактировать карту
                </h2>
                <button
                  onClick={() => {
                    setShowEditCardModal(false);
                    setSelectedCard(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Текущая карта</p>
                  <p className="text-white font-bold font-mono text-lg">
                    {selectedCard.type.toUpperCase()} •••• {selectedCard.last4}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Истекает {selectedCard.expires}</p>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Новый срок действия</label>
                  <input
                    type="text"
                    maxLength={5}
                    defaultValue={selectedCard.expires}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      setSelectedCard(prev => prev ? { ...prev, expires: formatted } : null);
                    }}
                    placeholder="12/25"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Info className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-amber-300">
                    Для изменения других данных карты добавьте новую карту
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditCardModal(false);
                      setSelectedCard(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (selectedCard) {
                        setPaymentMethods(prev => prev.map(m => 
                          m.id === selectedCard.id ? selectedCard : m
                        ));
                        toast.success('Карта обновлена!');
                        setShowEditCardModal(false);
                        setSelectedCard(null);
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Card Confirmation Modal */}
      <AnimatePresence>
        {showDeleteCardModal && selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteCardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a14] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Удалить карту?
                </h2>
                <button
                  onClick={() => {
                    setShowDeleteCardModal(false);
                    setSelectedCard(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-white font-bold font-mono text-lg mb-2">
                    {selectedCard.type.toUpperCase()} •••• {selectedCard.last4}
                  </p>
                  <p className="text-gray-400 text-sm">Истекает {selectedCard.expires}</p>
                  {selectedCard.isDefault && (
                    <div className="mt-2 px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs inline-block">
                      Основная карта
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-300 text-sm">
                    Вы уверены, что хотите удалить эту карту? Это действие нельзя отменить.
                  </p>
                  {selectedCard.isDefault && (
                    <p className="text-amber-300 text-sm mt-2">
                      ⚠️ После удаления основной карты нужно будет выбрать другую.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteCardModal(false);
                      setSelectedCard(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (paymentMethods.length <= 1) {
                        toast.error('Должна остаться хотя бы одна карта');
                        return;
                      }
                      
                      setPaymentMethods(prev => prev.filter(m => m.id !== selectedCard.id));
                      toast.success('Карта удалена');
                      setShowDeleteCardModal(false);
                      setSelectedCard(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/20 transition-all"
                  >
                    Удалить карту
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  Изменить пароль
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">
                    Текущий пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Введите текущий пароль"
                      className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                    />
                    <button
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">
                    Новый пароль
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Минимум 8 символов"
                      className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className={`flex items-center gap-2 text-xs ${newPassword.length >= 8 ? 'text-green-400' : 'text-gray-400'}`}>
                        {newPassword.length >= 8 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Минимум 8 символов
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(newPassword) ? 'text-green-400' : 'text-gray-400'}`}>
                        {/[A-Z]/.test(newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Заглавная буква
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(newPassword) ? 'text-green-400' : 'text-gray-400'}`}>
                        {/[0-9]/.test(newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Цифра
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">
                    Подтвердите новый пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите новый пароль"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
                    />
                  </div>
                  {confirmPassword && (
                    <div className={`mt-2 flex items-center gap-2 text-xs ${
                      newPassword === confirmPassword ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {newPassword === confirmPassword ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {newPassword === confirmPassword ? 'Пароли совпадают' : 'Пароли не совпадают'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    if (newPassword === confirmPassword && newPassword.length >= 8) {
                      const success = await settingsAPI.changePassword(currentPassword, newPassword);
                      if (success) {
                        setShowPasswordModal(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        toast.success('Пароль успешно изменён!');
                      } else {
                        toast.error('Ошибка изменения пароля');
                      }
                    } else {
                      toast.error('Проверьте правильность ввода');
                    }
                  }}
                  disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Изменить пароль
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}