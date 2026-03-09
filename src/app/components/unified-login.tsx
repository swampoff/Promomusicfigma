/**
 * LOGIN MODAL — модалка авторизации с 5 режимами
 * login | signup | verify_email | forgot_password | email_sent
 * 
 * Exports:
 * - LoginModalProvider — wrap in RootLayout
 * - useLoginModal — hook to open/close from anywhere
 * - UnifiedLogin — route fallback for /login (renders inline form)
 */

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, ArrowLeft, Mail, Lock, Eye, EyeOff, User, ChevronDown, MailCheck, KeyRound, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router';

// ── Types ──
type ModalMode = 'login' | 'signup' | 'verify_email' | 'forgot_password' | 'email_sent';

// ── Modal Context ──
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
  const [mode, setMode] = useState<ModalMode>('login');

  const open = useCallback((m: ModalMode = 'login') => {
    setMode(m);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <LoginModalContext.Provider value={{ isOpen, open, close }}>
      {children}
      {isOpen && <LoginModalOverlay initialMode={mode} onClose={close} />}
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

// ── Login Form Logic (shared between modal and page) ──
function LoginFormContent({ initialMode = 'login', onSuccess }: { initialMode?: ModalMode; onSuccess?: () => void }) {
  const { signIn, signUp, requestPasswordReset, resendVerification, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('artist');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [isPartner, setIsPartner] = useState(false);

  // Redirect on auth
  useEffect(() => {
    if (isAuthenticated) {
      if (onSuccess) onSuccess();
      else {
        const r = localStorage.getItem('userRole') || 'artist';
        const routes: Record<string, string> = { artist: '/artist', dj: '/dj', admin: '/ctrl-pm7k2f', radio_station: '/radio', venue: '/venue', producer: '/producer' };
        navigate(routes[r] || '/artist', { replace: true });
      }
    }
  }, [isAuthenticated]);

  const reset = () => { setEmail(''); setPassword(''); setName(''); setRole('artist'); setShowPw(false); };
  const go = (m: ModalMode) => { reset(); setMode(m); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await signIn(email, password);
    setLoading(false);
    if (r.success) {
      toast.success('Вход выполнен!');
    } else if (r.requiresVerification) {
      setSavedEmail(email);
      setMode('verify_email');
      toast.error('Email не подтверждён');
    } else {
      toast.error(r.error || 'Ошибка входа');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Пароль минимум 6 символов'); return; }
    setLoading(true);
    const r = await signUp(email, password, name, role as any);
    setLoading(false);
    if (r.success) {
      setSavedEmail(email);
      setIsPartner(PARTNER_ROLES.includes(role));
      go('verify_email');
    } else {
      toast.error(r.error || 'Ошибка регистрации');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await requestPasswordReset(email);
    setLoading(false);
    if (r.success) { setSavedEmail(email); go('email_sent'); }
    else toast.error(r.error || 'Ошибка');
  };

  const handleResend = async () => {
    setLoading(true);
    const r = await resendVerification(savedEmail);
    setLoading(false);
    r.success ? toast.success('Письмо отправлено') : toast.error(r.error || 'Ошибка');
  };

  const grad: Record<ModalMode, string> = {
    login: 'from-cyan-500 to-blue-500',
    signup: 'from-purple-500 to-pink-500',
    verify_email: 'from-green-500 to-emerald-500',
    forgot_password: 'from-amber-500 to-orange-500',
    email_sent: 'from-indigo-500 to-blue-500',
  };
  const ring: Record<ModalMode, string> = {
    login: 'focus:ring-cyan-500',
    signup: 'focus:ring-purple-500',
    verify_email: 'focus:ring-green-500',
    forgot_password: 'focus:ring-amber-500',
    email_sent: 'focus:ring-indigo-500',
  };
  const r = ring[mode];

  return (
    <AnimatePresence mode="wait">
      {/* 1. LOGIN */}
      {mode === 'login' && (
        <Slide key="login" dir={-1}>
          <Header gradient={grad.login} icon={<Music2 className="w-7 h-7 text-white" />} title="Вход в PROMO.MUSIC" />
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <Inp icon={<Mail />} type="email" val={email} set={setEmail} ph="Email" r={r} req />
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-300">Пароль</label>
                <button type="button" onClick={() => go('forgot_password')} className="text-xs text-cyan-400 hover:text-cyan-300">Забыли?</button>
              </div>
              <Pw val={password} set={setPassword} show={showPw} toggle={() => setShowPw(!showPw)} r={r} />
            </div>
            <Btn loading={loading} grad={grad.login} text="Войти" lt="Вход..." />
            <p className="text-center text-sm text-gray-400">Нет аккаунта?{' '}<button type="button" onClick={() => go('signup')} className="text-cyan-400 hover:text-cyan-300 font-medium">Зарегистрируйтесь</button></p>
          </form>
        </Slide>
      )}

      {/* 2. SIGNUP */}
      {mode === 'signup' && (
        <Slide key="signup" dir={1}>
          <Header gradient={grad.signup} icon={<User className="w-7 h-7 text-white" />} title="Регистрация" back={() => go('login')} />
          <form onSubmit={handleSignUp} className="p-6 space-y-4">
            <Inp icon={<User />} type="text" val={name} set={setName} ph="Ваше имя" r={r} req />
            <Inp icon={<Mail />} type="email" val={email} set={setEmail} ph="Email" r={r} req />
            <Pw val={password} set={setPassword} show={showPw} toggle={() => setShowPw(!showPw)} r={r} min={6} ph="Минимум 6 символов" />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Роль</label>
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer text-sm">
                  {ROLES.map((ro) => <option key={ro.id} value={ro.id} className="bg-gray-900">{ro.name} — {ro.desc}</option>)}
                </select>
              </div>
              {PARTNER_ROLES.includes(role) && <p className="text-xs text-amber-400/80 mt-1">Требуется одобрение администратора</p>}
            </div>
            <Btn loading={loading} grad={grad.signup} text="Зарегистрироваться" lt="Регистрация..." />
            <p className="text-center text-sm text-gray-400">Уже есть аккаунт?{' '}<button type="button" onClick={() => go('login')} className="text-purple-400 hover:text-purple-300 font-medium">Войти</button></p>
          </form>
        </Slide>
      )}

      {/* 3. VERIFY EMAIL */}
      {mode === 'verify_email' && (
        <Slide key="verify" dir={0}>
          <Header gradient={grad.verify_email} icon={<MailCheck className="w-7 h-7 text-white" />} title="Подтвердите email" />
          <div className="p-6 space-y-4 text-center">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Письмо отправлено на</p>
              <p className="text-white font-medium">{savedEmail}</p>
            </div>
            <p className="text-gray-400 text-sm">Нажмите на ссылку в письме для активации аккаунта.</p>
            {isPartner && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-300 text-sm">После подтверждения заявка будет отправлена на модерацию.</p>
              </div>
            )}
            <button onClick={handleResend} disabled={loading} className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-all disabled:opacity-50 text-sm">
              {loading ? 'Отправка...' : 'Отправить повторно'}
            </button>
            <button onClick={() => go('login')} className="text-sm text-green-400 hover:text-green-300 font-medium">Перейти к входу</button>
          </div>
        </Slide>
      )}

      {/* 4. FORGOT PASSWORD */}
      {mode === 'forgot_password' && (
        <Slide key="forgot" dir={1}>
          <Header gradient={grad.forgot_password} icon={<KeyRound className="w-7 h-7 text-white" />} title="Сброс пароля" back={() => go('login')} />
          <form onSubmit={handleForgot} className="p-6 space-y-4">
            <Inp icon={<Mail />} type="email" val={email} set={setEmail} ph="Введите ваш email" r={r} req />
            <Btn loading={loading} grad={grad.forgot_password} text="Отправить ссылку" lt="Отправка..." />
            <p className="text-center"><button type="button" onClick={() => go('login')} className="text-sm text-amber-400 hover:text-amber-300 font-medium">Назад к входу</button></p>
          </form>
        </Slide>
      )}

      {/* 5. EMAIL SENT */}
      {mode === 'email_sent' && (
        <Slide key="sent" dir={0}>
          <Header gradient={grad.email_sent} icon={<Send className="w-7 h-7 text-white" />} title="Письмо отправлено" />
          <div className="p-6 space-y-4 text-center">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Ссылка для сброса пароля отправлена на</p>
              <p className="text-white font-medium">{savedEmail}</p>
            </div>
            <p className="text-gray-400 text-sm">Проверьте входящие и папку «Спам». Ссылка действительна 1 час.</p>
            <button onClick={() => go('login')} className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 text-white font-semibold rounded-lg shadow-lg transition-all text-sm">
              Вернуться к входу
            </button>
          </div>
        </Slide>
      )}
    </AnimatePresence>
  );
}

// ── Modal Overlay (opened via useLoginModal) ──
function LoginModalOverlay({ initialMode, onClose }: { initialMode: ModalMode; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d0d1a] border border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <LoginFormContent initialMode={initialMode} onSuccess={onClose} />
      </motion.div>
    </div>
  );
}

// ── Route Component for /login (full-page, no overlay) ──
export function UnifiedLogin() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      toast.success('Email подтверждён! Теперь вы можете войти.');
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d0d1a]/80 border border-white/10 shadow-2xl overflow-hidden">
        <LoginFormContent />
      </div>
    </div>
  );
}

// ── Tiny sub-components ──
function Slide({ children, dir, ...props }: { children: ReactNode; dir: number } & Record<string, any>) {
  return <motion.div initial={{ opacity: 0, x: dir * 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -dir * 20 }} transition={{ duration: 0.15 }} {...props}>{children}</motion.div>;
}

function Header({ gradient, icon, title, back }: { gradient: string; icon: ReactNode; title: string; back?: () => void }) {
  return (
    <div className={`bg-gradient-to-r ${gradient} p-7 text-center relative`}>
      {back && <button onClick={back} className="absolute top-5 left-5 p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-white" /></button>}
      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">{icon}</div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
  );
}

function Inp({ icon, type, val, set, ph, r, req, min }: { icon: ReactNode; type: string; val: string; set: (v: string) => void; ph: string; r: string; req?: boolean; min?: number }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5">{icon}</span>
      <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} required={req} minLength={min}
        className={`w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${r} focus:border-transparent text-sm`} />
    </div>
  );
}

function Pw({ val, set, show, toggle, r, min, ph }: { val: string; set: (v: string) => void; show: boolean; toggle: () => void; r: string; min?: number; ph?: string }) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input type={show ? 'text' : 'password'} value={val} onChange={(e) => set(e.target.value)} placeholder={ph || '••••••••'} required minLength={min}
        className={`w-full pl-11 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${r} focus:border-transparent text-sm`} />
      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

function Btn({ loading, grad, text, lt }: { loading: boolean; grad: string; text: string; lt: string }) {
  return (
    <button type="submit" disabled={loading} className={`w-full py-2.5 bg-gradient-to-r ${grad} hover:opacity-90 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm`}>
      {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{lt}</span> : text}
    </button>
  );
}
