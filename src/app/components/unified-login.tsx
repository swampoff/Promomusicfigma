/**
 * UNIFIED LOGIN — Email + VK OAuth
 * Единая точка входа для всех кабинетов ПРОМО.МУЗЫКА
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { PromoLogo } from '@/app/components/promo-logo';

const API = `https://${projectId}.supabase.co/functions/v1/server`;

// Role → cabinet path
const ROLE_PATHS: Record<string, string> = {
  artist:        '/artist/home',
  dj:            '/dj/home',
  radio_station: '/radio/artist-requests',
  venue:         '/venue/dashboard',
  producer:      '/producer/overview',
  admin:         '/ctrl-pm7k2f/dashboard',
};

const ROLES = [
  { value: 'artist',        label: 'Артист' },
  { value: 'dj',            label: 'DJ' },
  { value: 'radio_station', label: 'Радиостанция' },
  { value: 'venue',         label: 'Заведение' },
  { value: 'producer',      label: 'Продюсер' },
];

interface UnifiedLoginProps {
  onLoginSuccess?: () => void;
  onBackToHome?: () => void;
}

export function UnifiedLogin({ onLoginSuccess, onBackToHome }: UnifiedLoginProps) {
  const navigate   = useNavigate();
  const [mode, setMode]                 = useState<'login' | 'register'>('login');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [name, setName]                 = useState('');
  const [role, setRole]                 = useState('artist');
  const [showPass, setShowPass]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [vkLoading, setVkLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [info, setInfo]                 = useState('');

  // ── Redirect helper ─────────────────────────────────────────────
  const redirectByToken = async (token: string) => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        const path = ROLE_PATHS[data?.role || 'artist'] ?? '/artist/home';
        onLoginSuccess?.();
        navigate(path);
      } else {
        navigate('/artist/home');
      }
    } catch {
      navigate('/artist/home');
    }
  };

  // ── Handle VK OAuth callback ─────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await redirectByToken(session.access_token);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Email login ──────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;
      await redirectByToken(data.session.access_token);
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  // ── Email register ───────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      // 1. Create user via backend (auto-confirms email, creates KV profile)
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка регистрации');

      // 2. Sign in immediately (user is auto-confirmed)
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setInfo('Аккаунт создан! Войдите используя email и пароль.');
        setMode('login');
        return;
      }
      await redirectByToken(data.session.access_token);
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  // ── VK OAuth ─────────────────────────────────────────────────────
  const handleVK = async () => {
    setVkLoading(true);
    setError('');
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: 'vk' as any,
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (oauthErr) {
      setError('ВКонтакте: ' + oauthErr.message);
      setVkLoading(false);
    }
    // If no error — browser redirects, vkLoading stays true intentionally
  };

  const clearState = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setInfo('');
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 py-12">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-60 -right-60 w-[600px] h-[600px] bg-[#FF577F] opacity-[0.035] rounded-full blur-3xl" />
        <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] bg-[#22d3ee] opacity-[0.035] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Back */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <PromoLogo size="lg" />
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-7 sm:p-8">

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => clearState(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          {/* VK OAuth */}
          <button
            onClick={handleVK}
            disabled={vkLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#0077FF] hover:bg-[#005FCC] text-white font-semibold text-sm transition-all mb-5 disabled:opacity-60"
          >
            {vkLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.65h-1.87c-.71 0-.93-.57-2.2-1.85-.71-.73-1.02-.83-1.2-.83-.24 0-.31.07-.31.41v1.68c0 .3-.09.47-.88.47-1.29 0-2.73-.78-3.73-2.23C6.9 11.47 6.38 9.56 6.38 9.2c0-.18.07-.35.41-.35h1.87c.31 0 .42.14.54.47.59 1.73 1.59 3.24 2 3.24.15 0 .22-.07.22-.47V10.1c-.05-.82-.48-.89-.48-1.18 0-.14.11-.28.3-.28h2.94c.25 0 .34.14.34.44v2.35c0 .25.11.34.18.34.15 0 .28-.09.57-.38 1.45-1.62 2.02-2.95 2.02-2.95.11-.22.31-.42.62-.42h1.87c.56 0 .68.29.56.62-.23.74-1.55 2.56-1.55 2.56-.12.19-.16.28 0 .5.11.16.48.49.73.79.67.75 1.18 1.38 1.31 1.81.14.41-.08.62-.5.62z"/>
              </svg>
            )}
            Войти через ВКонтакте
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-slate-500">или через email</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">

            {/* Name (register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Имя</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ваше имя"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#FF577F]/40 focus:ring-1 focus:ring-[#FF577F]/20 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#FF577F]/40 focus:ring-1 focus:ring-[#FF577F]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#FF577F]/40 focus:ring-1 focus:ring-[#FF577F]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role picker (register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Я — </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                          role === r.value
                            ? 'border-[#FF577F]/60 bg-[#FF577F]/10 text-[#FF577F]'
                            : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error / Info */}
            <AnimatePresence>
              {error && (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}
              {info && (
                <motion.p
                  key="info"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
                >
                  {info}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#FF577F]/20 hover:shadow-[#FF577F]/30 transition-all"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
