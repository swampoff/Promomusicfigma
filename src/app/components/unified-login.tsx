/**
 * LOGIN MODAL — модалка авторизации с 5 режимами
 * login | signup | verify_email | forgot_password | email_sent
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, ArrowLeft, Mail, Lock, Eye, EyeOff, User, ChevronDown, MailCheck, KeyRound, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// ── Modal Context ──
type ModalMode = 'login' | 'signup' | 'verify_email' | 'forgot_password' | 'email_sent';

interface LoginModalContextType {
  isOpen: boolean;
  open: (mode?: ModalMode) => void;
  close: () => void;
}

const LoginModalContext = createContext<LoginModalContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export const useLoginModal = () => useContext(LoginModalContext);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<ModalMode>('login');

  const open = (mode: ModalMode = 'login') => {
    setInitialMode(mode);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return (
    <LoginModalContext.Provider value={{ isOpen, open, close }}>
      {children}
      <LoginModal isOpen={isOpen} onClose={close} initialMode={initialMode} />
    </LoginModalContext.Provider>
  );
}

// ── Roles ──
const ROLES = [
  { id: 'artist', name: 'Артист', desc: 'Музыканты и творческие люди' },
  { id: 'dj', name: 'DJ', desc: 'Диджеи и продюсеры микстейпов' },
  { id: 'producer', name: 'Продюсер', desc: 'Музыкальные продюсеры' },
  { id: 'radio_station', name: 'Радиостанция', desc: 'Радиостанции и медиа' },
  { id: 'venue', name: 'Площадка', desc: 'Концертные площадки и клубы' },
] as const;

const PARTNER_ROLES = ['dj', 'radio_station', 'venue', 'producer'];

// ── Modal Component ──
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: ModalMode;
}

function LoginModal({ isOpen, onClose, initialMode = 'login' }: LoginModalProps) {
  const { signIn, signUp, requestPasswordReset, resendVerification } = useAuth();

  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('artist');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [isPartner, setIsPartner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      resetForm();
    }
  }, [isOpen, initialMode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setRole('artist'); setShowPw(false);
  };

  const switchMode = (m: ModalMode) => {
    resetForm();
    setMode(m);
  };

  // ── Handlers ──

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.success) {
      toast.success('Вход выполнен!');
      onClose();
    } else if (result.requiresVerification) {
      setSavedEmail(email);
      setMode('verify_email');
      toast.error('Email не подтверждён');
    } else {
      toast.error(result.error || 'Ошибка входа');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Пароль минимум 6 символов'); return; }
    setLoading(true);
    const result = await signUp(email, password, name, role as any);
    setLoading(false);
    if (result.success) {
      setSavedEmail(email);
      setIsPartner(PARTNER_ROLES.includes(role));
      switchMode('verify_email');
    } else {
      toast.error(result.error || 'Ошибка регистрации');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (result.success) {
      setSavedEmail(email);
      switchMode('email_sent');
    } else {
      toast.error(result.error || 'Ошибка');
    }
  };

  const handleResend = async () => {
    setLoading(true);
    const result = await resendVerification(savedEmail);
    setLoading(false);
    if (result.success) toast.success('Письмо отправлено повторно');
    else toast.error(result.error || 'Ошибка');
  };

  if (!isOpen) return null;

  // ── Gradient configs per mode ──
  const gradients: Record<ModalMode, string> = {
    login: 'from-cyan-500 to-blue-500',
    signup: 'from-purple-500 to-pink-500',
    verify_email: 'from-green-500 to-emerald-500',
    forgot_password: 'from-amber-500 to-orange-500',
    email_sent: 'from-indigo-500 to-blue-500',
  };

  const focusRing: Record<ModalMode, string> = {
    login: 'focus:ring-cyan-500',
    signup: 'focus:ring-purple-500',
    verify_email: 'focus:ring-green-500',
    forgot_password: 'focus:ring-amber-500',
    email_sent: 'focus:ring-indigo-500',
  };

  const ring = focusRing[mode];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d0d1a] border border-white/10 shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {/* ===== 1. LOGIN ===== */}
          {mode === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.15 }}>
              <div className={`bg-gradient-to-r ${gradients.login} p-7 text-center`}>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Music2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Вход в PROMO.MUSIC</h2>
              </div>
              <form onSubmit={handleLogin} className="p-6 space-y-4">
                <InputField icon={<Mail className="w-5 h-5" />} type="email" value={email} onChange={setEmail} placeholder="Email" ring={ring} required />
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-300">Пароль</label>
                    <button type="button" onClick={() => switchMode('forgot_password')} className="text-xs text-cyan-400 hover:text-cyan-300">Забыли?</button>
                  </div>
                  <PasswordField value={password} onChange={setPassword} show={showPw} toggle={() => setShowPw(!showPw)} ring={ring} />
                </div>
                <SubmitBtn loading={loading} gradient={gradients.login} text="Войти" loadingText="Вход..." />
                <p className="text-center text-sm text-gray-400">
                  Нет аккаунта?{' '}
                  <button type="button" onClick={() => switchMode('signup')} className="text-cyan-400 hover:text-cyan-300 font-medium">Зарегистрируйтесь</button>
                </p>
              </form>
            </motion.div>
          )}

          {/* ===== 2. SIGNUP ===== */}
          {mode === 'signup' && (
            <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
              <div className={`bg-gradient-to-r ${gradients.signup} p-7 text-center relative`}>
                <BackBtn onClick={() => switchMode('login')} />
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <User className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Регистрация</h2>
              </div>
              <form onSubmit={handleSignUp} className="p-6 space-y-4">
                <InputField icon={<User className="w-5 h-5" />} type="text" value={name} onChange={setName} placeholder="Ваше имя" ring={ring} required />
                <InputField icon={<Mail className="w-5 h-5" />} type="email" value={email} onChange={setEmail} placeholder="Email" ring={ring} required />
                <PasswordField value={password} onChange={setPassword} show={showPw} toggle={() => setShowPw(!showPw)} ring={ring} min={6} placeholder="Минимум 6 символов" />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Роль</label>
                  <div className="relative">
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer text-sm">
                      {ROLES.map((r) => <option key={r.id} value={r.id} className="bg-gray-900">{r.name} — {r.desc}</option>)}
                    </select>
                  </div>
                  {PARTNER_ROLES.includes(role) && <p className="text-xs text-amber-400/80 mt-1">Требуется одобрение администратора</p>}
                </div>
                <SubmitBtn loading={loading} gradient={gradients.signup} text="Зарегистрироваться" loadingText="Регистрация..." />
                <p className="text-center text-sm text-gray-400">
                  Уже есть аккаунт?{' '}
                  <button type="button" onClick={() => switchMode('login')} className="text-purple-400 hover:text-purple-300 font-medium">Войти</button>
                </p>
              </form>
            </motion.div>
          )}

          {/* ===== 3. VERIFY EMAIL ===== */}
          {mode === 'verify_email' && (
            <motion.div key="verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}>
              <div className={`bg-gradient-to-r ${gradients.verify_email} p-7 text-center`}>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MailCheck className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Подтвердите email</h2>
              </div>
              <div className="p-6 space-y-4 text-center">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Письмо отправлено на</p>
                  <p className="text-white font-medium">{savedEmail}</p>
                </div>
                <p className="text-gray-400 text-sm">Нажмите на ссылку в письме для активации аккаунта.</p>
                {isPartner && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-amber-300 text-sm">После подтверждения email заявка будет отправлена на модерацию.</p>
                  </div>
                )}
                <button onClick={handleResend} disabled={loading} className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-all disabled:opacity-50 text-sm">
                  {loading ? 'Отправка...' : 'Отправить повторно'}
                </button>
                <button onClick={() => switchMode('login')} className="text-sm text-green-400 hover:text-green-300 font-medium">
                  Перейти к входу
                </button>
              </div>
            </motion.div>
          )}

          {/* ===== 4. FORGOT PASSWORD ===== */}
          {mode === 'forgot_password' && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
              <div className={`bg-gradient-to-r ${gradients.forgot_password} p-7 text-center relative`}>
                <BackBtn onClick={() => switchMode('login')} />
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Сброс пароля</h2>
              </div>
              <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
                <InputField icon={<Mail className="w-5 h-5" />} type="email" value={email} onChange={setEmail} placeholder="Введите ваш email" ring={ring} required />
                <SubmitBtn loading={loading} gradient={gradients.forgot_password} text="Отправить ссылку" loadingText="Отправка..." />
                <p className="text-center">
                  <button type="button" onClick={() => switchMode('login')} className="text-sm text-amber-400 hover:text-amber-300 font-medium">Назад к входу</button>
                </p>
              </form>
            </motion.div>
          )}

          {/* ===== 5. EMAIL SENT (password reset) ===== */}
          {mode === 'email_sent' && (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}>
              <div className={`bg-gradient-to-r ${gradients.email_sent} p-7 text-center`}>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Send className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Письмо отправлено</h2>
              </div>
              <div className="p-6 space-y-4 text-center">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Ссылка для сброса пароля отправлена на</p>
                  <p className="text-white font-medium">{savedEmail}</p>
                </div>
                <p className="text-gray-400 text-sm">Проверьте входящие и папку «Спам». Ссылка действительна 1 час.</p>
                <button onClick={() => switchMode('login')} className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 text-white font-semibold rounded-lg shadow-lg transition-all text-sm">
                  Вернуться к входу
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Shared sub-components ──

function InputField({ icon, type, value, onChange, placeholder, ring, required, min }: {
  icon: React.ReactNode; type: string; value: string; onChange: (v: string) => void;
  placeholder: string; ring: string; required?: boolean; min?: number;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required} minLength={min}
        className={`w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${ring} focus:border-transparent text-sm`}
      />
    </div>
  );
}

function PasswordField({ value, onChange, show, toggle, ring, min, placeholder }: {
  value: string; onChange: (v: string) => void; show: boolean; toggle: () => void;
  ring: string; min?: number; placeholder?: string;
}) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '••••••••'} required minLength={min}
        className={`w-full pl-11 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${ring} focus:border-transparent text-sm`}
      />
      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

function SubmitBtn({ loading, gradient, text, loadingText }: { loading: boolean; gradient: string; text: string; loadingText: string }) {
  return (
    <button type="submit" disabled={loading} className={`w-full py-2.5 bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm`}>
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingText}
        </span>
      ) : text}
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="absolute top-5 left-5 p-1.5 hover:bg-white/10 rounded-lg transition-colors">
      <ArrowLeft className="w-5 h-5 text-white" />
    </button>
  );
}

// ── Route fallback (for /login URL) ──
export function UnifiedLogin() {
  const { open } = useLoginModal();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) open('login');
  }, [isAuthenticated, open]);

  // Check ?verified=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      toast.success('Email подтверждён! Теперь вы можете войти.');
      window.history.replaceState({}, '', '/login');
      open('login');
    }
  }, [open]);

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
      <p className="text-gray-500 text-sm">Загрузка...</p>
    </div>
  );
}
