/**
 * UNIFIED LOGIN — Email + VK ID OAuth
 * Единая точка входа для всех кабинетов ПРОМО.МУЗЫКА
 * Поддерживает: email/пароль, VK ID OAuth, выбор роли для новых VK-пользователей
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, Loader2, Music, Mic2, Radio, Building2, Disc3 } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { projectId, publicAnonKey } from "@/utils/supabase/info";
import { PromoLogo } from "@/app/components/promo-logo";

const API = `https://${projectId}.supabase.co/functions/v1/server`;
const VK_CLIENT_ID = "54426299";

const ROLE_PATHS: Record<string, string> = {
  artist: "/artist/home",
  dj: "/dj/home",
  radio_station: "/radio/artist-requests",
  venue: "/venue/dashboard",
  producer: "/producer/overview",
  admin: "/ctrl-pm7k2f/dashboard",
};

const ROLES = [
  { value: "artist", label: "Артист", icon: Mic2, color: "from-pink-500 to-rose-500" },
  { value: "dj", label: "DJ", icon: Disc3, color: "from-violet-500 to-purple-500" },
  { value: "radio_station", label: "Радиостанция", icon: Radio, color: "from-cyan-500 to-blue-500" },
  { value: "venue", label: "Заведение", icon: Building2, color: "from-amber-500 to-orange-500" },
  { value: "producer", label: "Продюсер", icon: Music, color: "from-emerald-500 to-green-500" },
];

type Step = "auth" | "choose-role";

interface VKPendingUser {
  userId: string;
  email: string;
  name: string;
  avatar?: string | null;
  tokenHash?: string;
}

interface UnifiedLoginProps {
  onLoginSuccess?: () => void;
  onBackToHome?: () => void;
}

export function UnifiedLogin({ onLoginSuccess, onBackToHome }: UnifiedLoginProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("auth");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("artist");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vkLoading, setVkLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [vkPendingUser, setVkPendingUser] = useState<VKPendingUser | null>(null);

  // ── Redirect by role ──────────────────────────────────────────────────
  const redirectByToken = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        const path = ROLE_PATHS[data?.role || "artist"] ?? "/artist/home";
        onLoginSuccess?.();
        navigate(path);
      } else {
        navigate("/artist/home");
      }
    } catch {
      navigate("/artist/home");
    }
  }, [navigate, onLoginSuccess]);

  // ── Handle VK OAuth code from URL ─────────────────────────────────────
  useEffect(() => {
    const code = searchParams.get("code");
    const deviceId = searchParams.get("device_id");
    if (code) {
      handleVKCode(code);
      // Clean URL
      window.history.replaceState({}, "", "/login");
    }
  }, [searchParams]);

  // ── Supabase auth state listener (for OTP verify) ────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await redirectByToken(session.access_token);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [redirectByToken]);

  // ── Send VK code to backend ─────────────────────────────────────────
  const handleVKCode = async (code: string) => {
    setVkLoading(true);
    setError("");
    try {
      const codeVerifier = sessionStorage.getItem("vk_code_verifier") || undefined;
      const res = await fetch(`${API}/auth/vk-callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          code,
          redirect_uri: `${window.location.origin}/login`,
          code_verifier: codeVerifier,
          device_id: sessionStorage.getItem("vk_device_id") || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Ошибка VK авторизации");
      }

      if (json.newUser) {
        // New VK user — need to choose role
        setVkPendingUser({
          userId: json.data.user.id,
          email: json.data.email,
          name: json.data.user.name,
          avatar: json.data.user.avatar,
          tokenHash: json.data.token_hash,
        });
        setStep("choose-role");
      } else {
        // Existing user — verify OTP and redirect
        if (json.data.token_hash && json.data.email) {
          const { error: otpErr } = await supabase.auth.verifyOtp({
            token_hash: json.data.token_hash,
            type: "magiclink",
          });
          if (otpErr) {
            console.error("OTP verify error:", otpErr);
            setError("Ошибка верификации сессии. Попробуйте снова.");
          }
          // onAuthStateChange will catch SIGNED_IN and redirect
        }
      }
    } catch (err: any) {
      setError(err.message || "Ошибка VK OAuth");
    } finally {
      setVkLoading(false);
      sessionStorage.removeItem("vk_code_verifier");
    }
  };

  // ── Start VK OAuth ─────────────────────────────────────────────────
  const handleVK = async () => {
    setVkLoading(true);
    setError("");
    try {
      // Generate PKCE code_verifier
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const codeVerifier = Array.from(array, b => String.fromCharCode(b)).join("")
      const b64Verifier = btoa(codeVerifier).split("+").join("-").split("/").join("_").split("=").join("");
      sessionStorage.setItem("vk_code_verifier", b64Verifier);

      // Generate code_challenge (S256)
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(b64Verifier));
      const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
        .split("+").join("-").split("/").join("_").split("=").join("");

      const redirectUri = window.location.origin + "/login";
      const state = crypto.randomUUID();
      sessionStorage.setItem("vk_state", state);

      // Generate device_id for VK ID
      const deviceId = crypto.randomUUID();
      sessionStorage.setItem("vk_device_id", deviceId);

      const params = new URLSearchParams({
        client_id: VK_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "email",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        device_id: deviceId,
      });

      window.location.href = "https://id.vk.com/authorize?" + params.toString();
    } catch (err: any) {
      console.error("VK OAuth error:", err);
      setError("Не удалось начать авторизацию VK");
      setVkLoading(false);
    }
  };

  // ── Email login ───────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;
      await redirectByToken(data.session.access_token);
    } catch (err: any) {
      const msg = err.message || "Ошибка входа";
      if (msg.includes("Invalid login")) {
        setError("Неверный email или пароль");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Email register ────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Ошибка регистрации");

      // Auto sign-in
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setInfo("Аккаунт создан! Войдите используя email и пароль.");
        setMode("login");
        return;
      }
      await redirectByToken(data.session.access_token);
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  // ── Set role after VK OAuth ─────────────────────────────────────────
  const handleSetRole = async (selectedRole: string) => {
    if (!vkPendingUser) return;
    setLoading(true);
    setError("");
    try {
      // Set role via API
      const res = await fetch(`${API}/auth/set-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ userId: vkPendingUser.userId, role: selectedRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Ошибка установки роли");

      // Now verify OTP to create session
      if (vkPendingUser.tokenHash) {
        const { error: otpErr } = await supabase.auth.verifyOtp({
          token_hash: vkPendingUser.tokenHash,
          type: "magiclink",
        });
        if (otpErr) {
          console.error("OTP verify error:", otpErr);
          setError("Ошибка создания сессии. Попробуйте войти через VK ещё раз.");
          setStep("auth");
          return;
        }
        // onAuthStateChange will redirect
      } else {
        // Fallback: redirect manually
        const path = ROLE_PATHS[selectedRole] ?? "/artist/home";
        onLoginSuccess?.();
        navigate(path);
      }
    } catch (err: any) {
      setError(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const clearState = (newMode: "login" | "register") => {
    setMode(newMode);
    setError("");
    setInfo("");
  };

  // ── Render: Choose Role (after VK) ───────────────────────────────────
  if (step === "choose-role") {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex flex-col items-center justify-center px-4 py-12">
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-purple-600 opacity-[0.04] rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -left-40 w-[500px] h-[500px] bg-[#FF577F] opacity-[0.04] rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="flex justify-center mb-6">
            <PromoLogo size="lg" />
          </div>

          {vkPendingUser?.avatar && (
            <div className="flex justify-center mb-4">
              <img
                src={vkPendingUser.avatar}
                alt=""
                className="w-16 h-16 rounded-full border-2 border-white/10"
              />
            </div>
          )}

          <h2 className="text-center text-xl font-bold text-white mb-1">
            Привет, {vkPendingUser?.name || ""}!
          </h2>
          <p className="text-center text-sm text-slate-400 mb-8">
            Выберите вашу роль на платформе
          </p>

          <div className="grid grid-cols-1 gap-3">
            {ROLES.map(r => {
              const Icon = r.icon;
              return (
                <motion.button
                  key={r.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={() => handleSetRole(r.value)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] transition-all group disabled:opacity-50`}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-[15px] group-hover:text-white/90">
                    {r.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-4 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // ── Render: Auth Form ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a14] flex flex-col items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-purple-600 opacity-[0.04] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -left-40 w-[500px] h-[500px] bg-[#FF577F] opacity-[0.04] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600 opacity-[0.02] rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <PromoLogo size="xl" />
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-6 sm:p-8 shadow-2xl shadow-black/20">

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.04] rounded-2xl p-1 mb-7">
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => clearState(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  mode === m
                    ? "bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white shadow-lg shadow-[#FF577F]/20"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          {/* VK ID Button */}
          <button
            onClick={handleVK}
            disabled={vkLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-[#0077FF] hover:bg-[#0066DD] active:bg-[#0055CC] text-white font-medium text-[15px] transition-all disabled:opacity-60 mb-6"
          >
            {vkLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M14.72 19.42C8.73 19.42 5.37 15.42 5.22 8.58H8.16C8.27 13.58 10.37 15.58 12.07 16.02V8.58H14.83V12.72C16.51 12.54 18.27 10.62 18.87 8.58H21.63C21.17 11.12 19.27 13.04 17.93 13.82C19.27 14.46 21.43 16.12 22.27 19.42H19.23C18.57 17.22 16.87 15.58 14.83 15.36V19.42H14.72Z" fill="white"/>
              </svg>
            )}
            <span>Войти через VK ID</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-xs text-slate-600 font-medium">или через email</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Form */}
          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">

            {/* Name (register) */}
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Имя</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ваше имя"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#FF577F]/50 focus:ring-2 focus:ring-[#FF577F]/20 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#FF577F]/50 focus:ring-2 focus:ring-[#FF577F]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#FF577F]/50 focus:ring-2 focus:ring-[#FF577F]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role picker (register) */}
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Я —</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(r => {
                      const Icon = r.icon;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                            role === r.value
                              ? "border-[#FF577F]/60 bg-[#FF577F]/10 text-[#FF577F] shadow-lg shadow-[#FF577F]/10"
                              : "border-white/[0.08] bg-white/[0.02] text-slate-500 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px] font-bold">{r.label}</span>
                        </button>
                      );
                    })}
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
                  className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                >
                  {error}
                </motion.p>
              )}
              {info && (
                <motion.p
                  key="info"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5"
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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#FF577F]/25 hover:shadow-[#FF577F]/40 transition-all"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : mode === "login" ? "Войти" : "Создать аккаунт"}
            </motion.button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-[11px] text-slate-600 mt-5">
            {mode === "login"
              ? "Нет аккаунта? Нажмите «Регистрация» выше"
              : "Уже есть аккаунт? Нажмите «Войти» выше"
            }
          </p>
        </div>

        {/* Bottom text */}
        <p className="text-center text-[10px] text-slate-700 mt-6">
          Продолжая, вы соглашаетесь с{" "}
          <a href="/user-agreement" className="text-slate-500 hover:text-white underline transition-colors">условиями использования</a>
          {" "}и{" "}
          <a href="/privacy" className="text-slate-500 hover:text-white underline transition-colors">политикой конфиденциальности</a>
        </p>
      </motion.div>
    </div>
  );
}
