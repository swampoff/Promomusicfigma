/**
 * UNIFIED LOGIN - Вход, регистрация, восстановление пароля
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, ArrowLeft, Mail, Lock, Eye, EyeOff, User, ChevronDown, MailCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type Screen = 'login' | 'signup' | 'reset' | 'verify';

const ROLES = [
  { id: 'artist', name: 'Артист', description: 'Музыканты и творческие люди' },
  { id: 'dj', name: 'DJ', description: 'Диджеи и продюсеры микстейпов' },
  { id: 'producer', name: 'Продюсер', description: 'Музыкальные продюсеры' },
  { id: 'radio_station', name: 'Радиостанция', description: 'Радиостанции и медиа' },
  { id: 'venue', name: 'Площадка', description: 'Концертные площадки и клубы' },
] as const;

const PARTNER_ROLES = ['dj', 'radio_station', 'venue', 'producer'];

export function UnifiedLogin() {
  const { signIn, signUp, requestPasswordReset, resendVerification, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('artist');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [isPartner, setIsPartner] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const savedRole = localStorage.getItem('userRole') || 'artist';
      const roleRoutes: Record<string, string> = {
        artist: '/artist',
        dj: '/dj',
        admin: '/ctrl-pm7k2f',
        radio_station: '/radio',
        venue: '/venue',
        producer: '/producer',
      };
      navigate(roleRoutes[savedRole] || '/artist', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check ?verified=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      toast.success('Email подтверждён! Теперь вы можете войти.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setRole('artist');
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Вход выполнен!');
      // Navigation happens via useEffect when isAuthenticated changes
    } else {
      toast.error(result.error || 'Неверный email или пароль');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Пароль должен быть минимум 6 символов');
      return;
    }
    setLoading(true);
    const result = await signUp(email, password, name, role as any);
    setLoading(false);

    if (result.success) {
      setVerifyEmail(email);
      setIsPartner(PARTNER_ROLES.includes(role));
      setScreen('verify');
      resetForm();
    } else {
      toast.error(result.error || 'Ошибка регистрации');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      toast.success('Ссылка для сброса пароля отправлена на ' + email);
    } else {
      toast.error(result.error || 'Ошибка отправки');
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    const result = await resendVerification(verifyEmail);
    setLoading(false);

    if (result.success) {
      toast.success('Письмо отправлено повторно');
    } else {
      toast.error(result.error || 'Ошибка отправки');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* ===== LOGIN SCREEN ===== */}
          {screen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Music2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">PROMO.MUSIC</h2>
                  <p className="text-white/80 text-sm mt-1">Войдите в свой аккаунт</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="p-8 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-300">Пароль</label>
                      <button
                        type="button"
                        onClick={() => { setScreen('reset'); resetForm(); }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Забыли пароль?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Вход...
                      </div>
                    ) : 'Войти'}
                  </button>

                  <p className="text-center text-sm text-gray-400 pt-2">
                    Нет аккаунта?{' '}
                    <button
                      type="button"
                      onClick={() => { setScreen('signup'); resetForm(); }}
                      className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                      Зарегистрируйтесь
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {/* ===== SIGNUP SCREEN ===== */}
          {screen === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-center relative">
                  <button
                    onClick={() => { setScreen('login'); resetForm(); }}
                    className="absolute top-6 left-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Регистрация</h2>
                  <p className="text-white/80 text-sm mt-1">Создайте аккаунт на платформе</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSignUp} className="p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Имя</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ваше имя"
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Пароль</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Минимум 6 символов"
                        className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Роль</label>
                    <div className="relative">
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        {ROLES.map((r) => (
                          <option key={r.id} value={r.id} className="bg-gray-900 text-white">
                            {r.name} — {r.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    {PARTNER_ROLES.includes(role) && (
                      <p className="text-xs text-amber-400/80 mt-1.5">
                        Для этой роли потребуется одобрение администратора
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Регистрация...
                      </div>
                    ) : 'Зарегистрироваться'}
                  </button>

                  <p className="text-center text-sm text-gray-400 pt-1">
                    Уже есть аккаунт?{' '}
                    <button
                      type="button"
                      onClick={() => { setScreen('login'); resetForm(); }}
                      className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    >
                      Войти
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {/* ===== RESET PASSWORD SCREEN ===== */}
          {screen === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-center relative">
                  <button
                    onClick={() => { setScreen('login'); resetForm(); }}
                    className="absolute top-6 left-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Сброс пароля</h2>
                  <p className="text-white/80 text-sm mt-1">Мы отправим ссылку на email</p>
                </div>

                <form onSubmit={handleResetPassword} className="p-8 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Отправка...
                      </div>
                    ) : 'Отправить ссылку'}
                  </button>

                  <p className="text-center text-sm text-gray-400">
                    <button
                      type="button"
                      onClick={() => { setScreen('login'); resetForm(); }}
                      className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                    >
                      Назад к входу
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {/* ===== VERIFY EMAIL SCREEN ===== */}
          {screen === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MailCheck className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Проверьте почту</h2>
                  <p className="text-white/80 text-sm mt-1">Мы отправили письмо с подтверждением</p>
                </div>

                <div className="p-8 space-y-5 text-center">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-300 text-sm">Письмо отправлено на</p>
                    <p className="text-white font-medium mt-1">{verifyEmail}</p>
                  </div>

                  <p className="text-gray-400 text-sm">
                    Нажмите на ссылку в письме, чтобы подтвердить email и активировать аккаунт.
                  </p>

                  {isPartner && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <p className="text-amber-300 text-sm">
                        После подтверждения email ваша заявка будет отправлена на модерацию. Мы уведомим вас по email после одобрения.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Отправка...' : 'Отправить письмо повторно'}
                  </button>

                  <button
                    onClick={() => { setScreen('login'); setVerifyEmail(''); }}
                    className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors"
                  >
                    Перейти к входу
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          &copy; 2026 PROMO.MUSIC
        </p>
      </div>
    </div>
  );
}
