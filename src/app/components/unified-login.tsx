/**
 * UNIFIED LOGIN - Единое окно входа с выбором роли
 * DJ, Артист и Радиостанция имеют уникальный 3-шаговый flow: выбор роли → выбор профиля → пароль
 * Админ - простой login-form
 * МАКСИМАЛЬНО АДАПТИВНЫЙ - xs (475px), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px+)
 * Интеграция с Supabase Auth через AuthContext + демо-режим с fallback
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, Shield, Radio, ArrowLeft, Mail, Lock, Eye, EyeOff, Check, Disc3, MapPin, Star, ChevronRight, Headphones, Mic2, Signal, Wifi, UserPlus, User, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import { PromoLogo } from '@/app/components/promo-logo';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router';

type Role = 'artist' | 'admin' | 'radio_station' | 'dj' | 'producer' | 'venue' | null;

const ROLE_TO_PATH: Record<string, string> = {
  artist: '/artist',
  admin: '/admin',
  radio_station: '/radio',
  dj: '/dj',
  producer: '/producer',
  venue: '/venue',
};

const ARTIST_ACCOUNTS = [
  { id: 'artist-1', email: 'ivanov@promo.fm', password: 'artist123', name: 'Александр Иванов', city: 'Москва', genres: ['Pop', 'R&B'], rating: 4.8, tracks: 34, color: 'from-cyan-500 to-blue-600' },
  { id: 'artist-2', email: 'star@promo.fm', password: 'artist123', name: 'Мария Звёздная', city: 'Санкт-Петербург', genres: ['Indie', 'Folk'], rating: 4.9, tracks: 21, color: 'from-sky-500 to-cyan-600' },
  { id: 'artist-3', email: 'gromov@promo.fm', password: 'artist123', name: 'Даниил Громов', city: 'Казань', genres: ['Rock', 'Alternative'], rating: 4.6, tracks: 18, color: 'from-blue-500 to-indigo-600' },
  { id: 'artist-4', email: 'nova@promo.fm', password: 'artist123', name: 'Алиса Нова', city: 'Москва', genres: ['Electronic', 'Synth-pop'], rating: 5.0, tracks: 45, color: 'from-teal-500 to-blue-600' },
];

const DJ_ACCOUNTS = [
  { id: 'dj-1', email: 'pulse@promo.fm', password: 'dj123', name: 'DJ Pulse', city: 'Москва', genres: ['House', 'Techno'], rating: 4.9, gigs: 47, color: 'from-purple-500 to-violet-600' },
  { id: 'dj-2', email: 'stella@promo.fm', password: 'dj123', name: 'DJ Stella', city: 'Санкт-Петербург', genres: ['Pop', 'Open Format'], rating: 5.0, gigs: 82, color: 'from-fuchsia-500 to-purple-600' },
  { id: 'dj-3', email: 'nexus@promo.fm', password: 'dj123', name: 'DJ Nexus', city: 'Казань', genres: ['Techno', 'Trance'], rating: 4.7, gigs: 23, color: 'from-violet-500 to-indigo-600' },
  { id: 'dj-4', email: 'aurora@promo.fm', password: 'dj123', name: 'DJ Aurora', city: 'Москва', genres: ['Trance', 'EDM'], rating: 4.9, gigs: 61, color: 'from-purple-600 to-pink-500' },
];

const RADIO_ACCOUNTS = [
  { id: 'radio-1', email: 'promofm@promo.fm', password: 'radio123', name: 'PROMO.FM', city: 'Москва', frequency: 'FM 100.5', formats: ['Pop', 'Hits'], listeners: '1.2M', status: 'Online', color: 'from-indigo-500 to-purple-600' },
  { id: 'radio-2', email: 'soundwave@promo.fm', password: 'radio123', name: 'Sound Wave', city: 'Санкт-Петербург', frequency: 'FM 95.3', formats: ['Electronic', 'Dance'], listeners: '680K', status: 'Online', color: 'from-blue-500 to-indigo-600' },
  { id: 'radio-3', email: 'retrogold@promo.fm', password: 'radio123', name: 'Retro Gold', city: 'Казань', frequency: 'FM 88.7', formats: ['Retro', 'Classics'], listeners: '430K', status: 'Online', color: 'from-amber-500 to-orange-600' },
  { id: 'radio-4', email: 'nightvibes@promo.fm', password: 'radio123', name: 'Night Vibes', city: 'Москва', frequency: 'FM 103.2', formats: ['R&B', 'Hip-Hop'], listeners: '920K', status: 'Online', color: 'from-violet-500 to-purple-600' },
];

const PRODUCER_ACCOUNTS = [
  { id: 'prod-1', kvProfileId: 'producer-maxam', kvUserId: 'artist-maxam', email: 'maxam@promo.fm', password: 'producer123', name: 'Максам', city: 'Москва', specializations: ['Сведение', 'Продакшн'], rating: 4.9, orders: 62, color: 'from-teal-500 to-emerald-600' },
  { id: 'prod-2', kvProfileId: 'producer-dan', kvUserId: 'artist-dan', email: 'dan@promo.fm', password: 'producer123', name: 'Дэн', city: 'Санкт-Петербург', specializations: ['Мастеринг', 'Консалтинг'], rating: 4.9, orders: 174, color: 'from-emerald-500 to-teal-600' },
  { id: 'prod-3', kvProfileId: 'producer-eva', kvUserId: 'artist-eva', email: 'eva@promo.fm', password: 'producer123', name: 'Ева', city: 'Калининград', specializations: ['Саунд-дизайн', 'Сведение'], rating: 4.7, orders: 19, color: 'from-cyan-500 to-teal-600' },
  { id: 'prod-4', kvProfileId: 'producer-nika', kvUserId: 'artist-nika', email: 'nika@promo.fm', password: 'producer123', name: 'Ника', city: 'Москва', specializations: ['Вокал', 'Сведение'], rating: 4.9, orders: 41, color: 'from-teal-600 to-green-500' },
  { id: 'prod-5', kvProfileId: 'producer-alisa', kvUserId: 'artist-alisa', email: 'alisa@promo.fm', password: 'producer123', name: 'Алиса', city: 'Новосибирск', specializations: ['Аранжировка', 'Клавишные'], rating: 5.0, orders: 23, color: 'from-amber-500 to-teal-600' },
  { id: 'prod-6', kvProfileId: 'producer-artem', kvUserId: 'artist-artem', email: 'artem@promo.fm', password: 'producer123', name: 'Артём', city: 'Екатеринбург', specializations: ['Сессия', 'Гитара'], rating: 4.8, orders: 28, color: 'from-indigo-500 to-teal-600' },
];

const VENUE_ACCOUNTS = [
  { id: 'venue-1', email: 'bardecor@promo.fm', password: 'venue123', name: 'Bar Decor', city: 'Москва', type: 'Бар', capacity: '120', color: 'from-amber-500 to-orange-600' },
  { id: 'venue-2', email: 'lounge21@promo.fm', password: 'venue123', name: 'Lounge 21', city: 'Санкт-Петербург', type: 'Лаунж-бар', capacity: '80', color: 'from-rose-500 to-pink-600' },
  { id: 'venue-3', email: 'skyrooftop@promo.fm', password: 'venue123', name: 'Sky Rooftop', city: 'Казань', type: 'Ресторан', capacity: '200', color: 'from-orange-500 to-amber-600' },
];

interface UnifiedLoginProps {
  onLoginSuccess?: (role: 'artist' | 'admin' | 'radio_station' | 'dj' | 'producer' | 'venue') => void;
  onBackToHome?: () => void;
}

export function UnifiedLogin({ onLoginSuccess: onLoginSuccessProp, onBackToHome: onBackToHomeProp }: UnifiedLoginProps) {
  const navigate = useNavigate();
  const onLoginSuccess = onLoginSuccessProp || ((role: 'artist' | 'admin' | 'radio_station' | 'dj' | 'producer' | 'venue') => {
    navigate(ROLE_TO_PATH[role] || '/artist');
  });
  const onBackToHome = onBackToHomeProp || (() => navigate('/'));
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDjAccount, setSelectedDjAccount] = useState<typeof DJ_ACCOUNTS[0] | null>(null);
  const [selectedArtistAccount, setSelectedArtistAccount] = useState<typeof ARTIST_ACCOUNTS[0] | null>(null);
  const [selectedRadioAccount, setSelectedRadioAccount] = useState<typeof RADIO_ACCOUNTS[0] | null>(null);
  const [selectedProducerAccount, setSelectedProducerAccount] = useState<typeof PRODUCER_ACCOUNTS[0] | null>(null);
  const [selectedVenueAccount, setSelectedVenueAccount] = useState<typeof VENUE_ACCOUNTS[0] | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerRole, setRegisterRole] = useState<'artist' | 'dj' | 'radio_station' | 'producer' | 'venue'>('artist');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const auth = useAuth();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setSelectedDjAccount(null);
    setSelectedArtistAccount(null);
    setSelectedRadioAccount(null);
    setSelectedProducerAccount(null);
    setSelectedVenueAccount(null);
    if (role === 'admin') {
      setEmail('admin@promo.fm');
      setPassword('admin123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleDjSelect = (dj: typeof DJ_ACCOUNTS[0]) => {
    setSelectedDjAccount(dj);
    setEmail(dj.email);
    setPassword(dj.password);
  };

  const handleArtistSelect = (artist: typeof ARTIST_ACCOUNTS[0]) => {
    setSelectedArtistAccount(artist);
    setEmail(artist.email);
    setPassword(artist.password);
  };

  const handleRadioSelect = (radio: typeof RADIO_ACCOUNTS[0]) => {
    setSelectedRadioAccount(radio);
    setEmail(radio.email);
    setPassword(radio.password);
  };

  const handleProducerSelect = (prod: typeof PRODUCER_ACCOUNTS[0]) => {
    setSelectedProducerAccount(prod);
    setEmail(prod.email);
    setPassword(prod.password);
  };

  const handleVenueSelect = (venue: typeof VENUE_ACCOUNTS[0]) => {
    setSelectedVenueAccount(venue);
    setEmail(venue.email);
    setPassword(venue.password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error('Необходимо принять соглашения и дать согласие на обработку данных');
      return;
    }
    if (registerPassword !== registerConfirm) {
      toast.error('Пароли не совпадают');
      return;
    }
    if (registerPassword.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }
    setRegisterLoading(true);
    try {
      const role = registerRole === 'radio_station' ? 'radio' : registerRole;
      const result = await auth.signUp(registerEmail, registerPassword, registerName, role as any);
      if (result.success) {
        toast.success(`Регистрация успешна: ${registerName}`);
        localStorage.setItem('userRole', registerRole);
        localStorage.setItem('userName', registerName);
        localStorage.setItem('isAuthenticated', 'true');
        onLoginSuccess(registerRole);
      } else {
        toast.error(result.error || 'Ошибка регистрации');
      }
    } catch (err: any) {
      toast.error(`Ошибка: ${err.message}`);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Сначала проверяем демо-аккаунты (без обращения к Supabase)
    const validCredentials = 
      (selectedRole === 'artist' && ARTIST_ACCOUNTS.some(a => a.email === email && a.password === password)) ||
      (selectedRole === 'admin' && email === 'admin@promo.fm' && password === 'admin123') ||
      (selectedRole === 'radio_station' && RADIO_ACCOUNTS.some(r => r.email === email && r.password === password)) ||
      (selectedRole === 'dj' && DJ_ACCOUNTS.some(d => d.email === email && d.password === password)) ||
      (selectedRole === 'producer' && PRODUCER_ACCOUNTS.some(p => p.email === email && p.password === password)) ||
      (selectedRole === 'venue' && VENUE_ACCOUNTS.some(v => v.email === email && v.password === password));

    if (validCredentials) {
      setTimeout(() => {
        let userId = 'artist_001';
        let userName = 'Артист';

        if (selectedRole === 'admin') {
          userId = 'admin_001';
          userName = 'Администратор';
        } else if (selectedRole === 'radio_station') {
          const radioAcc = RADIO_ACCOUNTS.find(r => r.email === email);
          userId = radioAcc?.id || 'radio-1';
          userName = radioAcc?.name || 'Радио';
          localStorage.setItem('radioProfileId', userId);
          localStorage.setItem('radioName', userName);
          localStorage.setItem('radioCity', radioAcc?.city || '');
          localStorage.setItem('radioFrequency', radioAcc?.frequency || '');
          localStorage.setItem('radioFormats', JSON.stringify(radioAcc?.formats || []));
          localStorage.setItem('radioListeners', radioAcc?.listeners || '');
          localStorage.setItem('radioStatus', radioAcc?.status || 'Online');
        } else if (selectedRole === 'dj') {
          const djAcc = DJ_ACCOUNTS.find(dj => dj.email === email);
          userId = djAcc?.id || 'dj-1';
          userName = djAcc?.name || 'DJ';
          localStorage.setItem('djProfileId', userId);
          localStorage.setItem('djName', userName);
          localStorage.setItem('djCity', djAcc?.city || '');
          localStorage.setItem('djGenres', JSON.stringify(djAcc?.genres || []));
        } else if (selectedRole === 'producer') {
          const prodAcc = PRODUCER_ACCOUNTS.find(p => p.email === email);
          userId = prodAcc?.id || 'prod-1';
          userName = prodAcc?.name || 'Продюсер';
          localStorage.setItem('producerProfileId', prodAcc?.kvProfileId || 'producer-maxam');
          localStorage.setItem('producerUserId', prodAcc?.kvUserId || 'artist-maxam');
          localStorage.setItem('producerName', userName);
          localStorage.setItem('producerCity', prodAcc?.city || '');
          localStorage.setItem('producerSpecializations', JSON.stringify(prodAcc?.specializations || []));
        } else if (selectedRole === 'venue') {
          const venueAcc = VENUE_ACCOUNTS.find(v => v.email === email);
          userId = venueAcc?.id || 'venue-1';
          userName = venueAcc?.name || 'Заведение';
          localStorage.setItem('venueProfileId', userId);
          localStorage.setItem('venueName', userName);
          localStorage.setItem('venueCity', venueAcc?.city || '');
          localStorage.setItem('venueType', venueAcc?.type || '');
          localStorage.setItem('venueCapacity', venueAcc?.capacity || '');
        } else if (selectedRole === 'artist') {
          const artistAcc = ARTIST_ACCOUNTS.find(a => a.email === email);
          userId = artistAcc?.id || 'artist-1';
          userName = artistAcc?.name || 'Артист';
          localStorage.setItem('artistProfileId', userId);
          localStorage.setItem('artistName', userName);
          localStorage.setItem('artistCity', artistAcc?.city || '');
          localStorage.setItem('artistGenres', JSON.stringify(artistAcc?.genres || []));
        }
        
        // Ставим демо-режим в auth context
        auth.setDemoMode();
        toast.success(`Демо-вход: ${userName}`);
        
        localStorage.setItem('userRole', selectedRole!);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
        localStorage.setItem('isAuthenticated', 'true');
        
        onLoginSuccess(selectedRole!);
        setLoading(false);
      }, 800);
      return;
    }

    // 2. Не демо-аккаунт - пробуем реальную авторизацию через Supabase
    try {
      const realResult = await auth.signIn(email, password);
      if (realResult.success) {
        toast.success(`Вход: ${auth.userEmail || email}`);
        localStorage.setItem('userRole', selectedRole!);
        localStorage.setItem('isAuthenticated', 'true');
        setLoading(false);
        onLoginSuccess(selectedRole!);
        return;
      }
      toast.error(realResult.error || 'Неверный email или пароль');
    } catch (err) {
      toast.error('Ошибка сети при входе');
    }
    setLoading(false);
  };

  const roles = [
    {
      id: 'artist' as const,
      name: 'Кабинет артиста',
      description: 'Для музыкантов и творческих людей',
      icon: Music2,
      color: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/50',
      hoverBorder: 'hover:border-cyan-400',
      features: ['Управление треками', 'Аналитика стримов', 'Донаты и подписки', 'Продвижение'],
    },
    {
      id: 'dj' as const,
      name: 'Кабинет DJ',
      description: 'Букинги, миксы, заработок',
      icon: Disc3,
      color: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-500/20 to-violet-600/20',
      borderColor: 'border-purple-500/50',
      hoverBorder: 'hover:border-purple-400',
      features: ['Букинги без посредников', 'Миксы и портфолио', 'Финансы и вывод', 'DJ Marketplace'],
    },
    {
      id: 'radio_station' as const,
      name: 'Радиостанция',
      description: 'Для радиостанций и медиа',
      icon: Radio,
      color: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-500/20 to-purple-500/20',
      borderColor: 'border-indigo-500/50',
      hoverBorder: 'hover:border-indigo-400',
      features: ['Заявки артистов', 'Рекламные слоты', 'Ротация треков', 'Доход 15%'],
    },
    {
      id: 'producer' as const,
      name: 'Продюсер / Инженер',
      description: 'Услуги, портфолио, заказы',
      icon: Sliders,
      color: 'from-teal-500 to-emerald-500',
      bgGradient: 'from-teal-500/20 to-emerald-500/20',
      borderColor: 'border-teal-500/50',
      hoverBorder: 'hover:border-teal-400',
      features: ['Маркетплейс услуг', 'Портфолио до/после', 'Заказы и финансы', 'Публичный профиль'],
    },
    {
      id: 'venue' as const,
      name: 'Заведение',
      description: 'Музыка, букинг, радио',
      icon: MapPin,
      color: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/50',
      hoverBorder: 'hover:border-amber-400',
      features: ['Музыкальное оформление', 'Букинг артистов/DJ', 'Радио-интеграция', 'Аналитика'],
    },
    {
      id: 'admin' as const,
      name: 'Администратор',
      description: 'CRM и модерация платформы',
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/50',
      hoverBorder: 'hover:border-purple-400',
      features: ['Управление пользователями', 'Модерация контента', 'Финансы', 'Аналитика'],
    },
  ];

  const goBack = () => {
    if (selectedDjAccount) {
      setSelectedDjAccount(null);
      setEmail('');
      setPassword('');
    } else if (selectedArtistAccount) {
      setSelectedArtistAccount(null);
      setEmail('');
      setPassword('');
    } else if (selectedRadioAccount) {
      setSelectedRadioAccount(null);
      setEmail('');
      setPassword('');
    } else if (selectedProducerAccount) {
      setSelectedProducerAccount(null);
      setEmail('');
      setPassword('');
    } else if (selectedVenueAccount) {
      setSelectedVenueAccount(null);
      setEmail('');
      setPassword('');
    } else {
      setSelectedRole(null);
      setEmail('');
      setPassword('');
    }
  };

  const djStage = selectedRole === 'dj' ? (selectedDjAccount ? 'dj-password' : 'dj-picker') : null;
  const artistStage = selectedRole === 'artist' ? (selectedArtistAccount ? 'artist-password' : 'artist-picker') : null;
  const radioStage = selectedRole === 'radio_station' ? (selectedRadioAccount ? 'radio-password' : 'radio-picker') : null;
  const producerStage = selectedRole === 'producer' ? (selectedProducerAccount ? 'producer-password' : 'producer-picker') : null;
  const venueStage = selectedRole === 'venue' ? (selectedVenueAccount ? 'venue-password' : 'venue-picker') : null;
  const currentScreen = isRegistering ? 'register' : (!selectedRole ? 'roles' : (djStage || artistStage || radioStage || producerStage || venueStage || 'login-form'));

  /* ─── Reusable back-button ─── */
  const BackBtn = ({ label, hoverColor }: { label: string; hoverColor: string }) => (
    <button
      onClick={goBack}
      className={`flex items-center gap-1 xs:gap-1.5 text-[11px] xs:text-xs sm:text-sm text-gray-500 ${hoverColor} transition-colors mb-4 xs:mb-5 sm:mb-6`}
    >
      <ArrowLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" /> {label}
    </button>
  );

  /* ─── Reusable profile-picker header ─── */
  const PickerHeader = ({
    icon: Icon,
    gradient,
    shadowColor,
    roleName,
    roleColor,
    subtitle,
  }: {
    icon: React.ElementType;
    gradient: string;
    shadowColor: string;
    roleName: string;
    roleColor: string;
    subtitle: string;
  }) => (
    <div className="text-center mb-5 xs:mb-6 sm:mb-8">
      <div className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl xs:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 xs:mb-4 shadow-xl ${shadowColor}`}>
        <Icon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
      </div>
      <h2
        className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-white mb-0.5 xs:mb-1"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        Войти как{' '}
        <span className={`bg-gradient-to-r ${roleColor} bg-clip-text text-transparent`}>
          {roleName}
        </span>
      </h2>
      <p
        className="text-[11px] xs:text-xs sm:text-sm md:text-base text-gray-500"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {subtitle}
      </p>
    </div>
  );

  /* ─── Reusable password-screen shell ─── */
  const PasswordShell = ({
    headerGradient,
    borderColor,
    icon: Icon,
    name,
    infoBadges,
    genreBadges,
    formAccentBg,
    formAccentBorder,
    formAccentText,
    formFocusRing,
    submitGradient,
    submitShadow,
    demoPassword,
    demoAccentColor,
    submitLabel,
  }: {
    headerGradient: string;
    borderColor: string;
    icon: React.ElementType;
    name: string;
    infoBadges: React.ReactNode;
    genreBadges: React.ReactNode;
    formAccentBg: string;
    formAccentBorder: string;
    formAccentText: string;
    formFocusRing: string;
    submitGradient: string;
    submitShadow: string;
    demoPassword: string;
    demoAccentColor: string;
    submitLabel: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-[calc(100vw-24px)] xs:max-w-[420px] sm:max-w-md md:max-w-lg mx-auto relative z-10"
    >
      <div className={`bg-white/5 backdrop-blur-xl rounded-xl xs:rounded-2xl sm:rounded-3xl border ${borderColor} overflow-hidden shadow-2xl`}>
        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${headerGradient} p-5 xs:p-6 sm:p-7 md:p-8 relative`}>
          <button
            onClick={goBack}
            className="absolute top-3 xs:top-4 sm:top-5 left-3 xs:left-4 sm:left-5 p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-white" />
          </button>
          <div className="text-center pt-2 xs:pt-0">
            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-xl rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-2.5 xs:mb-3">
              <Icon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2
              className="text-base xs:text-lg sm:text-xl md:text-2xl font-black text-white mb-0.5"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {name}
            </h2>
            <div className="flex items-center justify-center gap-1.5 xs:gap-2 text-white/70 text-[10px] xs:text-[11px] sm:text-xs flex-wrap">
              {infoBadges}
            </div>
            <div className="flex items-center justify-center gap-1 xs:gap-1.5 mt-2 flex-wrap">
              {genreBadges}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-4 xs:p-5 sm:p-6 md:p-8 space-y-4 xs:space-y-5">
          <div>
            <label
              className="block text-[11px] xs:text-xs sm:text-sm font-semibold text-white mb-1 xs:mb-1.5"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 xs:w-4 xs:h-4 ${formAccentText}`} />
              <input
                type="email"
                value={email}
                readOnly
                className={`w-full pl-8 xs:pl-10 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3 ${formAccentBg} border ${formAccentBorder} rounded-lg text-xs xs:text-sm sm:text-base ${formAccentText} cursor-default focus:outline-none`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>
          <div>
            <label
              className="block text-[11px] xs:text-xs sm:text-sm font-semibold text-white mb-1 xs:mb-1.5"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-8 xs:pl-10 pr-8 xs:pr-10 py-2 xs:py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-xs xs:text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${formFocusRing} focus:border-transparent transition-all`}
                style={{ fontFamily: 'Inter, sans-serif' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 xs:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                ) : (
                  <Eye className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 xs:py-2.5 sm:py-3 bg-gradient-to-r ${submitGradient} hover:opacity-90 text-white text-xs xs:text-sm sm:text-base font-bold rounded-lg shadow-lg ${submitShadow} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 xs:w-4 xs:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-xs xs:text-sm">Вход...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center gap-1.5 xs:gap-2">
                <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                <span className="truncate">{submitLabel}</span>
              </span>
            )}
          </button>
          <div className="pt-3 xs:pt-4 border-t border-white/10">
            <div className={`${formAccentBg} rounded-lg p-2 xs:p-2.5 border ${formAccentBorder}`}>
              <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 text-center">
                Демо-пароль: <span className={`${demoAccentColor} font-bold`}>{demoPassword}</span>
              </p>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#0A0E1A] via-[#1A1F35] to-[#0A0E1A] flex items-center justify-center p-3 xs:p-4 sm:p-6 md:p-8">
      {/* Role-specific background glows */}
      {selectedRole === 'dj' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[200px] xs:w-[250px] sm:w-[300px] h-[200px] xs:h-[250px] sm:h-[300px] bg-purple-600/10 rounded-full" style={{ filter: 'blur(100px)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-[180px] xs:w-[220px] sm:w-[250px] h-[180px] xs:h-[220px] sm:h-[250px] bg-violet-500/10 rounded-full" style={{ filter: 'blur(80px)' }} />
          <div className="absolute top-1/2 left-1/2 w-[150px] xs:w-[180px] sm:w-[200px] h-[150px] xs:h-[180px] sm:h-[200px] bg-fuchsia-500/8 rounded-full" style={{ filter: 'blur(70px)' }} />
        </div>
      )}
      {selectedRole === 'artist' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[200px] xs:w-[250px] sm:w-[300px] h-[200px] xs:h-[250px] sm:h-[300px] bg-cyan-600/10 rounded-full" style={{ filter: 'blur(100px)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-[180px] xs:w-[220px] sm:w-[250px] h-[180px] xs:h-[220px] sm:h-[250px] bg-blue-500/10 rounded-full" style={{ filter: 'blur(80px)' }} />
          <div className="absolute top-1/2 left-1/2 w-[150px] xs:w-[180px] sm:w-[200px] h-[150px] xs:h-[180px] sm:h-[200px] bg-sky-500/8 rounded-full" style={{ filter: 'blur(70px)' }} />
        </div>
      )}
      {selectedRole === 'radio_station' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[200px] xs:w-[250px] sm:w-[300px] h-[200px] xs:h-[250px] sm:h-[300px] bg-indigo-600/10 rounded-full" style={{ filter: 'blur(100px)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-[180px] xs:w-[220px] sm:w-[250px] h-[180px] xs:h-[220px] sm:h-[250px] bg-purple-500/10 rounded-full" style={{ filter: 'blur(80px)' }} />
          <div className="absolute top-1/2 right-1/3 w-[150px] xs:w-[180px] sm:w-[200px] h-[150px] xs:h-[180px] sm:h-[200px] bg-indigo-400/8 rounded-full" style={{ filter: 'blur(70px)' }} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════
            SCREEN 1: ROLE SELECTION
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'roles' && (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-[calc(100vw-24px)] xs:max-w-[440px] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl"
          >
            {/* Header */}
            <div className="text-center mb-5 xs:mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="flex justify-center mb-2.5 xs:mb-3 sm:mb-4 md:mb-6"
              >
                <PromoLogo
                  size="xl"
                  animated={false}
                  glowColor="#FF577F"
                  onClick={onBackToHome}
                  subtitle="MUSIC"
                  subtitleColor="text-white/60"
                  promoFontFamily="Montserrat, sans-serif"
                  subtitleFontFamily="Golos Text, sans-serif"
                  customClasses={{
                    logo: 'h-10 xs:h-14 sm:h-18 md:h-22 lg:h-28 xl:h-32 w-auto',
                    promo: 'text-[24px] xs:text-[32px] sm:text-[44px] md:text-[56px] lg:text-[68px] xl:text-[76px]',
                    subtitle: 'text-[8px] xs:text-[11px] sm:text-[14px] md:text-[17px] lg:text-[19px]',
                    gap: 'gap-2 xs:gap-3 sm:gap-4 md:gap-5',
                  }}
                />
              </motion.div>
              <p
                className="text-gray-400 text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl px-2 xs:px-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Выберите способ входа в систему
              </p>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-5 xl:gap-6">
              {roles.map((role, index) => {
                const Icon = role.icon;
                return (
                  <motion.button
                    key={role.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`relative p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 rounded-lg xs:rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 xs:border-2 ${role.borderColor} ${role.hoverBorder} transition-all duration-300 group overflow-hidden`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative z-10">
                      <div
                        className={`w-9 h-9 xs:w-11 xs:h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-lg xs:rounded-xl sm:rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-2 xs:mb-3 sm:mb-4 md:mb-5 lg:mb-7 shadow-2xl group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-4.5 h-4.5 xs:w-5.5 xs:h-5.5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-white" />
                      </div>
                      <h2
                        className="text-[11px] xs:text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-black tracking-tight text-white mb-0.5 xs:mb-1 sm:mb-1.5 md:mb-2 lg:mb-3 text-left leading-tight"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {role.name}
                      </h2>
                      <p
                        className="text-gray-400 text-[9px] xs:text-[11px] sm:text-xs md:text-sm lg:text-base mb-2 xs:mb-3 sm:mb-4 md:mb-5 lg:mb-7 text-left leading-snug"
                        style={{ fontFamily: 'Golos Text, sans-serif' }}
                      >
                        {role.description}
                      </p>
                      <div className="space-y-1 xs:space-y-1.5 sm:space-y-2 md:space-y-2.5">
                        {role.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5 text-left">
                            <Check className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-green-400 flex-shrink-0" />
                            <span
                              className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-300 font-medium leading-tight"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 xs:mt-3 sm:mt-4 md:mt-5 lg:mt-8 flex items-center justify-end text-white/60 group-hover:text-white transition-colors">
                        <span
                          className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base font-bold mr-1 xs:mr-1.5 sm:mr-2 uppercase tracking-wide"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          Войти
                        </span>
                        <ChevronRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Register button */}
            <div className="text-center mt-4 xs:mt-5 sm:mt-6 md:mt-8">
              <button
                onClick={() => setIsRegistering(true)}
                className="inline-flex items-center gap-1.5 xs:gap-2 text-[10px] xs:text-xs sm:text-sm text-gray-400 hover:text-[#FF577F] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <UserPlus className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                Нет аккаунта? Зарегистрироваться
              </button>
            </div>

            <p
              className="text-center text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-gray-500 mt-3 xs:mt-4 sm:mt-6 md:mt-8 px-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              &copy; 2026 Promo.music &bull; Маркетинговая экосистема для музыкантов
            </p>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN: REGISTRATION
        ═══════════════════════════════════════════════ */}
        {isRegistering && (
          <motion.div
            key="registration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-[calc(100vw-24px)] xs:max-w-[440px] sm:max-w-md md:max-w-lg mx-auto relative z-10"
          >
            <button
              onClick={() => setIsRegistering(false)}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-[#FF577F] transition-colors mb-4 xs:mb-5 sm:mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Назад к входу
            </button>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl xs:rounded-2xl sm:rounded-3xl border border-[#FF577F]/20 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#FF577F] to-purple-500 p-5 xs:p-6 sm:p-7 md:p-8 text-center">
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-xl rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-2.5 xs:mb-3">
                  <UserPlus className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-black text-white mb-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Создать аккаунт
                </h2>
                <p className="text-[11px] xs:text-xs sm:text-sm text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Присоединяйтесь к экосистеме
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleRegister} className="p-4 xs:p-5 sm:p-6 md:p-8 space-y-3 xs:space-y-4">
                <div>
                  <label className="block text-[11px] xs:text-xs sm:text-sm font-semibold text-white mb-1 xs:mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Имя
                  </label>
                  <div className="relative">
                    <User className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400" />
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Ваше имя"
                      className="w-full pl-8 xs:pl-10 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-xs xs:text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF577F] focus:border-transparent transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] xs:text-xs sm:text-sm font-semibold text-white mb-1 xs:mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Роль
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 xs:gap-2">
                    {([
                      { id: 'artist' as const, label: 'Артист', icon: Music2, color: 'from-cyan-500 to-blue-500' },
                      { id: 'dj' as const, label: 'DJ', icon: Disc3, color: 'from-purple-500 to-violet-600' },
                      { id: 'radio_station' as const, label: 'Радио', icon: Radio, color: 'from-indigo-500 to-purple-500' },
                    ] as const).map((r) => {
                      const RIcon = r.icon;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRegisterRole(r.id)}
                          className={`flex flex-col items-center gap-1 py-2 xs:py-2.5 rounded-lg border transition-all ${
                            registerRole === r.id
                              ? `bg-gradient-to-br ${r.color} border-white/30 shadow-lg`
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <RIcon className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                          <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-white">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] xs:text-xs sm:text-sm font-semibold text-white mb-1 xs:mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-8 xs:pl-10 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-xs xs:text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF577F] focus:border-transparent transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] xs:text-xs sm:text-sm font-semibold text-white mb-1 xs:mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Минимум 6 символов"
                      className="w-full pl-8 xs:pl-10 pr-8 xs:pr-10 py-2 xs:py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-xs xs:text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF577F] focus:border-transparent transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 xs:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5 xs:w-4 xs:h-4" /> : <Eye className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] xs:text-xs sm:text-sm font-semibold text-white mb-1 xs:mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Подтверждение пароля
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400" />
                    <input
                      type="password"
                      value={registerConfirm}
                      onChange={(e) => setRegisterConfirm(e.target.value)}
                      placeholder="Повторите пароль"
                      className="w-full pl-8 xs:pl-10 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-xs xs:text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF577F] focus:border-transparent transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
                    />
                  </div>
                </div>

                {registerPassword && registerConfirm && registerPassword !== registerConfirm && (
                  <p className="text-red-400 text-[10px] xs:text-xs">Пароли не совпадают</p>
                )}

                {/* Agreement checkbox */}
                <label className="flex items-start gap-2.5 xs:gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-4 h-4 xs:w-[18px] xs:h-[18px] rounded border-2 transition-all flex items-center justify-center ${
                      agreedToTerms
                        ? 'bg-[#FF577F] border-[#FF577F]'
                        : 'border-white/20 bg-white/5 group-hover:border-white/40'
                    }`}>
                      {agreedToTerms && (
                        <Check className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] xs:text-[11px] sm:text-xs text-slate-400 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Я принимаю{' '}
                    <a href="/user-agreement" target="_blank" rel="noopener noreferrer" className="text-[#FF577F] hover:text-[#FF6B8F] underline underline-offset-2 transition-colors">
                      Пользовательское соглашение
                    </a>
                    ,{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FF577F] hover:text-[#FF6B8F] underline underline-offset-2 transition-colors">
                      Политику конфиденциальности
                    </a>
                    {' '}и даю{' '}
                    <a href="/consent" target="_blank" rel="noopener noreferrer" className="text-[#FF577F] hover:text-[#FF6B8F] underline underline-offset-2 transition-colors">
                      Согласие на обработку персональных данных
                    </a>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={registerLoading || registerPassword !== registerConfirm || !agreedToTerms}
                  className="w-full py-2.5 xs:py-3 sm:py-3.5 bg-gradient-to-r from-[#FF577F] to-purple-500 hover:opacity-90 text-white text-xs xs:text-sm sm:text-base font-bold rounded-lg shadow-lg shadow-[#FF577F]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {registerLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 xs:w-4 xs:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs xs:text-sm">Регистрация...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5 xs:gap-2">
                      <UserPlus className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                      Зарегистрироваться
                    </span>
                  )}
                </button>

                <div className="pt-3 border-t border-white/10 text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-[10px] xs:text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Уже есть аккаунт? <span className="text-[#FF577F] font-bold">Войти</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 2a: DJ PROFILE PICKER
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'dj-picker' && (
          <motion.div
            key="dj-picker"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-[calc(100vw-24px)] xs:max-w-[440px] sm:max-w-lg md:max-w-2xl lg:max-w-3xl relative z-10"
          >
            <BackBtn label="Назад к ролям" hoverColor="hover:text-purple-400" />
            <PickerHeader
              icon={Disc3}
              gradient="from-purple-500 to-violet-600"
              shadowColor="shadow-purple-500/20"
              roleName="DJ"
              roleColor="from-purple-400 to-violet-400"
              subtitle="Выберите ваш DJ-профиль"
            />

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
              {DJ_ACCOUNTS.map((dj, i) => (
                <motion.button
                  key={dj.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDjSelect(dj)}
                  className="relative p-3 xs:p-3.5 sm:p-4 md:p-5 rounded-lg xs:rounded-xl backdrop-blur-xl bg-white/5 border border-purple-500/20 xs:border-2 xs:border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 text-left group overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${dj.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-2 xs:mb-2.5">
                      <div className={`w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br ${dj.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <Disc3 className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 xs:gap-1.5">
                          <h3 className="text-xs xs:text-sm sm:text-base font-black text-white truncate">{dj.name}</h3>
                          <div className="flex items-center gap-0.5 text-[9px] xs:text-[10px] sm:text-xs text-yellow-400 flex-shrink-0">
                            <Star className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 fill-current" />
                            {dj.rating}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                          <MapPin className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
                          {dj.city}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-500/40 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                      {dj.genres.map(g => (
                        <span key={g} className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[7px] xs:text-[8px] sm:text-[9px] font-bold text-purple-300">{g}</span>
                      ))}
                      <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-gray-600 ml-auto">{dj.gigs} букингов</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <p className="text-center text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mt-3 xs:mt-4">
              Пароль для всех демо-аккаунтов: <span className="text-purple-400 font-bold">dj123</span>
            </p>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 2b: DJ PASSWORD
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'dj-password' && selectedDjAccount && (
          <PasswordShell
            key="dj-password"
            headerGradient={selectedDjAccount.color}
            borderColor="border-purple-500/20"
            icon={Disc3}
            name={selectedDjAccount.name}
            infoBadges={
              <>
                <span className="flex items-center gap-0.5 xs:gap-1"><MapPin className="w-2.5 h-2.5 xs:w-3 xs:h-3" />{selectedDjAccount.city}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-0.5 xs:gap-1"><Star className="w-2.5 h-2.5 xs:w-3 xs:h-3 fill-yellow-300 text-yellow-300" />{selectedDjAccount.rating}</span>
                <span>&bull;</span>
                <span>{selectedDjAccount.gigs} букингов</span>
              </>
            }
            genreBadges={
              selectedDjAccount.genres.map(g => (
                <span key={g} className="px-1.5 xs:px-2 py-0.5 bg-white/15 rounded-full text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-white">{g}</span>
              ))
            }
            formAccentBg="bg-purple-500/5"
            formAccentBorder="border-purple-500/20"
            formAccentText="text-purple-300"
            formFocusRing="focus:ring-purple-500"
            submitGradient={selectedDjAccount.color}
            submitShadow="shadow-purple-500/20 hover:shadow-purple-500/40"
            demoPassword="dj123"
            demoAccentColor="text-purple-400"
            submitLabel={`Войти как ${selectedDjAccount.name}`}
          />
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 2a: ARTIST PROFILE PICKER
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'artist-picker' && (
          <motion.div
            key="artist-picker"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-[calc(100vw-24px)] xs:max-w-[440px] sm:max-w-lg md:max-w-2xl lg:max-w-3xl relative z-10"
          >
            <BackBtn label="Назад к ролям" hoverColor="hover:text-cyan-400" />
            <PickerHeader
              icon={Mic2}
              gradient="from-cyan-500 to-blue-600"
              shadowColor="shadow-cyan-500/20"
              roleName="Артист"
              roleColor="from-cyan-400 to-blue-400"
              subtitle="Выберите ваш профиль"
            />

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
              {ARTIST_ACCOUNTS.map((artist, i) => (
                <motion.button
                  key={artist.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleArtistSelect(artist)}
                  className="relative p-3 xs:p-3.5 sm:p-4 md:p-5 rounded-lg xs:rounded-xl backdrop-blur-xl bg-white/5 border border-cyan-500/20 xs:border-2 xs:border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 text-left group overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${artist.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-2 xs:mb-2.5">
                      <div className={`w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br ${artist.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <Music2 className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 xs:gap-1.5">
                          <h3 className="text-xs xs:text-sm sm:text-base font-black text-white truncate">{artist.name}</h3>
                          <div className="flex items-center gap-0.5 text-[9px] xs:text-[10px] sm:text-xs text-yellow-400 flex-shrink-0">
                            <Star className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 fill-current" />
                            {artist.rating}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                          <MapPin className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
                          {artist.city}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-cyan-500/40 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                      {artist.genres.map(g => (
                        <span key={g} className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[7px] xs:text-[8px] sm:text-[9px] font-bold text-cyan-300">{g}</span>
                      ))}
                      <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-gray-600 ml-auto">{artist.tracks} треков</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <p className="text-center text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mt-3 xs:mt-4">
              Пароль для всех демо-аккаунтов: <span className="text-cyan-400 font-bold">artist123</span>
            </p>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 2b: ARTIST PASSWORD
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'artist-password' && selectedArtistAccount && (
          <PasswordShell
            key="artist-password"
            headerGradient={selectedArtistAccount.color}
            borderColor="border-cyan-500/20"
            icon={Music2}
            name={selectedArtistAccount.name}
            infoBadges={
              <>
                <span className="flex items-center gap-0.5 xs:gap-1"><MapPin className="w-2.5 h-2.5 xs:w-3 xs:h-3" />{selectedArtistAccount.city}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-0.5 xs:gap-1"><Star className="w-2.5 h-2.5 xs:w-3 xs:h-3 fill-yellow-300 text-yellow-300" />{selectedArtistAccount.rating}</span>
                <span>&bull;</span>
                <span>{selectedArtistAccount.tracks} треков</span>
              </>
            }
            genreBadges={
              selectedArtistAccount.genres.map(g => (
                <span key={g} className="px-1.5 xs:px-2 py-0.5 bg-white/15 rounded-full text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-white">{g}</span>
              ))
            }
            formAccentBg="bg-cyan-500/5"
            formAccentBorder="border-cyan-500/20"
            formAccentText="text-cyan-300"
            formFocusRing="focus:ring-cyan-500"
            submitGradient={selectedArtistAccount.color}
            submitShadow="shadow-cyan-500/20 hover:shadow-cyan-500/40"
            demoPassword="artist123"
            demoAccentColor="text-cyan-400"
            submitLabel={`Войти как ${selectedArtistAccount.name}`}
          />
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 2a: RADIO STATION PICKER
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'radio-picker' && (
          <motion.div
            key="radio-picker"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-[calc(100vw-24px)] xs:max-w-[440px] sm:max-w-lg md:max-w-2xl lg:max-w-3xl relative z-10"
          >
            <BackBtn label="Назад к ролям" hoverColor="hover:text-indigo-400" />
            <PickerHeader
              icon={Radio}
              gradient="from-indigo-500 to-purple-600"
              shadowColor="shadow-indigo-500/20"
              roleName="Радиостанция"
              roleColor="from-indigo-400 to-purple-400"
              subtitle="Выберите вашу радиостанцию"
            />

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
              {RADIO_ACCOUNTS.map((radio, i) => (
                <motion.button
                  key={radio.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRadioSelect(radio)}
                  className="relative p-3 xs:p-3.5 sm:p-4 md:p-5 rounded-lg xs:rounded-xl backdrop-blur-xl bg-white/5 border border-indigo-500/20 xs:border-2 xs:border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-300 text-left group overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${radio.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-2 xs:mb-2.5">
                      <div className={`w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br ${radio.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <Signal className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 xs:gap-1.5">
                          <h3 className="text-xs xs:text-sm sm:text-base font-black text-white truncate">{radio.name}</h3>
                          <div className="flex items-center gap-0.5 xs:gap-1 flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-green-400 font-bold">{radio.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                          <MapPin className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
                          <span className="truncate">{radio.city} &bull; {radio.frequency}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-indigo-500/40 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                      {radio.formats.map(f => (
                        <span key={f} className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[7px] xs:text-[8px] sm:text-[9px] font-bold text-indigo-300">{f}</span>
                      ))}
                      <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-gray-600 ml-auto flex items-center gap-0.5 xs:gap-1">
                        <Wifi className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                        {radio.listeners}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <p className="text-center text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mt-3 xs:mt-4">
              Пароль для всех демо-аккаунтов: <span className="text-indigo-400 font-bold">radio123</span>
            </p>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 2b: RADIO PASSWORD
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'radio-password' && selectedRadioAccount && (
          <PasswordShell
            key="radio-password"
            headerGradient={selectedRadioAccount.color}
            borderColor="border-indigo-500/20"
            icon={Radio}
            name={selectedRadioAccount.name}
            infoBadges={
              <>
                <span className="flex items-center gap-0.5 xs:gap-1"><MapPin className="w-2.5 h-2.5 xs:w-3 xs:h-3" />{selectedRadioAccount.city}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-0.5 xs:gap-1"><Signal className="w-2.5 h-2.5 xs:w-3 xs:h-3" />{selectedRadioAccount.frequency}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-0.5 xs:gap-1"><Wifi className="w-2.5 h-2.5 xs:w-3 xs:h-3" />{selectedRadioAccount.listeners}</span>
              </>
            }
            genreBadges={
              <>
                {selectedRadioAccount.formats.map(f => (
                  <span key={f} className="px-1.5 xs:px-2 py-0.5 bg-white/15 rounded-full text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-white">{f}</span>
                ))}
                <span className="px-1.5 xs:px-2 py-0.5 bg-green-400/20 rounded-full text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-green-300 flex items-center gap-0.5 xs:gap-1">
                  <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {selectedRadioAccount.status}
                </span>
              </>
            }
            formAccentBg="bg-indigo-500/5"
            formAccentBorder="border-indigo-500/20"
            formAccentText="text-indigo-300"
            formFocusRing="focus:ring-indigo-500"
            submitGradient={selectedRadioAccount.color}
            submitShadow="shadow-indigo-500/20 hover:shadow-indigo-500/40"
            demoPassword="radio123"
            demoAccentColor="text-indigo-400"
            submitLabel={`Войти как ${selectedRadioAccount.name}`}
          />
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 2c: PRODUCER / ENGINEER PICKER
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'producer-picker' && (
          <motion.div
            key="producer-picker"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-[calc(100vw-24px)] xs:max-w-[440px] sm:max-w-lg md:max-w-2xl lg:max-w-3xl relative z-10"
          >
            <BackBtn label="Назад к ролям" hoverColor="hover:text-teal-400" />
            <PickerHeader
              icon={Sliders}
              gradient="from-teal-500 to-emerald-600"
              shadowColor="shadow-teal-500/20"
              roleName="Продюсер"
              roleColor="from-teal-400 to-emerald-400"
              subtitle="Выберите профиль"
            />

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
              {PRODUCER_ACCOUNTS.map((prod, i) => (
                <motion.button
                  key={prod.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleProducerSelect(prod)}
                  className="relative p-3 xs:p-3.5 sm:p-4 md:p-5 rounded-lg xs:rounded-xl backdrop-blur-xl bg-white/5 border border-teal-500/20 xs:border-2 xs:border-teal-500/30 hover:border-teal-400/60 transition-all duration-300 text-left group overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${prod.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-2 xs:mb-2.5">
                      <div className={`w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br ${prod.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <Sliders className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs xs:text-sm sm:text-base font-black text-white truncate">{prod.name}</h3>
                        <div className="flex items-center gap-1 text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                          <MapPin className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
                          <span className="truncate">{prod.city}</span>
                          <span>&bull;</span>
                          <Star className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 text-yellow-400" />
                          <span>{prod.rating}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-teal-500/40 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                      {prod.specializations.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded text-[7px] xs:text-[8px] sm:text-[9px] font-bold text-teal-300">{s}</span>
                      ))}
                      <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-gray-600 ml-auto">{prod.orders} заказов</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <p className="text-center text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mt-3 xs:mt-4">
              Пароль для всех демо-аккаунтов: <span className="text-teal-400 font-bold">producer123</span>
            </p>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 2d: PRODUCER PASSWORD
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'producer-password' && selectedProducerAccount && (
          <PasswordShell
            key="producer-password"
            headerGradient={selectedProducerAccount.color}
            borderColor="border-teal-500/20"
            icon={Sliders}
            name={selectedProducerAccount.name}
            infoBadges={
              <>
                <span className="flex items-center gap-0.5 xs:gap-1"><MapPin className="w-2.5 h-2.5 xs:w-3 xs:h-3" />{selectedProducerAccount.city}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-0.5 xs:gap-1"><Star className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-yellow-400" />{selectedProducerAccount.rating}</span>
                <span>&bull;</span>
                <span>{selectedProducerAccount.orders} заказов</span>
              </>
            }
            genreBadges={
              <>
                {selectedProducerAccount.specializations.map(s => (
                  <span key={s} className="px-1.5 xs:px-2 py-0.5 bg-white/15 rounded-full text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-white">{s}</span>
                ))}
              </>
            }
            formAccentBg="bg-teal-500/5"
            formAccentBorder="border-teal-500/20"
            formAccentText="text-teal-300"
            formFocusRing="focus:ring-teal-500"
            submitGradient={selectedProducerAccount.color}
            submitShadow="shadow-teal-500/20 hover:shadow-teal-500/40"
            demoPassword="producer123"
            demoAccentColor="text-teal-400"
            submitLabel={`Войти как ${selectedProducerAccount.name}`}
          />
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 2e: VENUE PICKER
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'venue-picker' && (
          <motion.div
            key="venue-picker"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-[calc(100vw-24px)] xs:max-w-[440px] sm:max-w-lg md:max-w-2xl lg:max-w-3xl relative z-10"
          >
            <BackBtn label="Назад к ролям" hoverColor="hover:text-amber-400" />
            <PickerHeader
              icon={MapPin}
              gradient="from-amber-500 to-orange-600"
              shadowColor="shadow-amber-500/20"
              roleName="Заведение"
              roleColor="from-amber-400 to-orange-400"
              subtitle="Выберите заведение"
            />

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
              {VENUE_ACCOUNTS.map((venue, i) => (
                <motion.button
                  key={venue.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleVenueSelect(venue)}
                  className="relative p-3 xs:p-3.5 sm:p-4 md:p-5 rounded-lg xs:rounded-xl backdrop-blur-xl bg-white/5 border border-amber-500/20 xs:border-2 xs:border-amber-500/30 hover:border-amber-400/60 transition-all duration-300 text-left group overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${venue.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-2 xs:mb-2.5">
                      <div className={`w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br ${venue.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <MapPin className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs xs:text-sm sm:text-base font-black text-white truncate">{venue.name}</h3>
                        <div className="flex items-center gap-1 text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                          <MapPin className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
                          <span className="truncate">{venue.city}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-amber-500/40 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[7px] xs:text-[8px] sm:text-[9px] font-bold text-amber-300">{venue.type}</span>
                      <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-gray-600 ml-auto">до {venue.capacity} чел.</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <p className="text-center text-[9px] xs:text-[10px] sm:text-xs text-gray-600 mt-3 xs:mt-4">
              Пароль для всех демо-аккаунтов: <span className="text-amber-400 font-bold">venue123</span>
            </p>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 2f: VENUE PASSWORD
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'venue-password' && selectedVenueAccount && (
          <PasswordShell
            key="venue-password"
            headerGradient={selectedVenueAccount.color}
            borderColor="border-amber-500/20"
            icon={MapPin}
            name={selectedVenueAccount.name}
            infoBadges={
              <>
                <span className="flex items-center gap-0.5 xs:gap-1"><MapPin className="w-2.5 h-2.5 xs:w-3 xs:h-3" />{selectedVenueAccount.city}</span>
                <span>&bull;</span>
                <span>{selectedVenueAccount.type}</span>
                <span>&bull;</span>
                <span>до {selectedVenueAccount.capacity} чел.</span>
              </>
            }
            genreBadges={<></>}
            formAccentBg="bg-amber-500/5"
            formAccentBorder="border-amber-500/20"
            formAccentText="text-amber-300"
            formFocusRing="focus:ring-amber-500"
            submitGradient={selectedVenueAccount.color}
            submitShadow="shadow-amber-500/20 hover:shadow-amber-500/40"
            demoPassword="venue123"
            demoAccentColor="text-amber-400"
            submitLabel={`Войти как ${selectedVenueAccount.name}`}
          />
        )}

        {/* ═══════════════════════════════════════════════
            SCREEN 3: ADMIN LOGIN FORM
        ═══════════════════════════════════════════════ */}
        {currentScreen === 'login-form' && (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-[calc(100vw-24px)] xs:max-w-[420px] sm:max-w-md md:max-w-lg mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-xl xs:rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className={`bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color} p-5 xs:p-6 sm:p-7 md:p-8 text-center relative`}>
                <button
                  onClick={goBack}
                  className="absolute top-3 xs:top-4 sm:top-5 left-3 xs:left-4 sm:left-5 p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-white" />
                </button>
                <div className="w-11 h-11 xs:w-13 xs:h-13 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-xl rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-2.5 xs:mb-3 sm:mb-4">
                  <Shield className="w-5.5 h-5.5 xs:w-6.5 xs:h-6.5 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2
                  className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Вход для администратора
                </h2>
                <p
                  className="text-white/80 text-[10px] xs:text-xs sm:text-sm mt-1 xs:mt-1.5 sm:mt-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Управление платформой
                </p>
              </div>

              <form onSubmit={handleLogin} className="p-4 xs:p-5 sm:p-6 md:p-8 space-y-4 xs:space-y-5 sm:space-y-6">
                <div>
                  <label
                    className="block text-[11px] xs:text-xs sm:text-sm font-semibold text-white mb-1 xs:mb-1.5 sm:mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@promo.fm"
                      className="w-full pl-8 xs:pl-10 sm:pl-11 pr-3 xs:pr-4 py-2 xs:py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-xs xs:text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-[11px] xs:text-xs sm:text-sm font-semibold text-white mb-1 xs:mb-1.5 sm:mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-8 xs:pl-10 sm:pl-11 pr-8 xs:pr-10 sm:pr-11 py-2 xs:py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-xs xs:text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 xs:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 xs:py-2.5 sm:py-3 bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color} hover:opacity-90 text-white text-xs xs:text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs xs:text-sm">Вход...</span>
                    </div>
                  ) : (
                    'Войти'
                  )}
                </button>

                <div className="pt-4 xs:pt-5 sm:pt-6 border-t border-white/10">
                  <p
                    className="text-[10px] xs:text-xs sm:text-sm text-gray-400 text-center mb-1.5 xs:mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Демо-доступ:
                  </p>
                  <div className="bg-white/5 rounded-lg p-2 xs:p-2.5 sm:p-3 space-y-0.5 xs:space-y-1">
                    <p className="text-[10px] xs:text-xs sm:text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="font-semibold">Email:</span> admin@promo.fm
                    </p>
                    <p className="text-[10px] xs:text-xs sm:text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="font-semibold">Пароль:</span> admin123
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}