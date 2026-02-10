/**
 * TRACK SUBMIT MODAL — Glassmorphism Premium
 * 
 * БЕЗ регистрации. Оплата ТОЛЬКО после модерации.
 * Полностью в стиле promo.music: glassmorphism + brand palette
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Upload, Music, TestTube, TrendingUp, Rocket,
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle,
  User, Mail, Phone, FileAudio, Link2, MessageSquare,
  Zap, Info, Loader2, Sparkles, Check, Clock, Send
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { GenreIcon, GENRE_COLORS } from '@/app/components/genre-icon';

// ─── Types ───────────────────────────────────────────────────────
type ServiceType = 'test' | 'novelty' | 'promo';

interface TrackSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceType;
}

interface FormData {
  service: ServiceType | null;
  artistName: string;
  trackTitle: string;
  genre: string;
  email: string;
  phone: string;
  description: string;
  links: string;
  file: File | null;
  agreeTerms: boolean;
}

const GENRES = [
  'Pop', 'Rock', 'Electronic', 'Hip-Hop', 'R&B', 'Indie',
  'Jazz', 'Classical', 'Reggaeton', 'House', 'Techno', 'Trap',
  'Lo-Fi', 'Ambient', 'Afrobeat', 'Folk', 'Другой'
];

const SERVICES = [
  {
    id: 'test' as ServiceType,
    icon: TestTube,
    title: 'Тест трека',
    subtitle: 'Экспертная оценка',
    description: 'Профессиональный фидбек от продюсеров и A&R. Анализ по 10+ критериям и прогноз коммерческого потенциала.',
    gradient: 'from-purple-500 to-blue-500',
    glow: 'shadow-purple-500/20',
    borderColor: 'border-purple-500/20 hover:border-purple-400/40',
    bgColor: 'bg-purple-500/[0.06]',
    accentText: 'text-purple-400',
    note: 'Оплата после подтверждения эксперта',
    time: '24–72 часа',
  },
  {
    id: 'novelty' as ServiceType,
    icon: TrendingUp,
    title: 'Попасть в Новинки',
    subtitle: 'Ротация на платформе',
    description: 'Загрузи трек в раздел «Новинки» - прослушивания, лайки, добавления в плейлисты органически.',
    gradient: 'from-[#FF577F] to-orange-500',
    glow: 'shadow-[#FF577F]/20',
    borderColor: 'border-[#FF577F]/20 hover:border-[#FF577F]/40',
    bgColor: 'bg-[#FF577F]/[0.06]',
    accentText: 'text-[#FF577F]',
    note: 'Стоимость после модерации (до 24 ч)',
    time: 'до 24 часов',
  },
  {
    id: 'promo' as ServiceType,
    icon: Rocket,
    title: 'Полное продвижение',
    subtitle: 'Маркетинг + ротация',
    description: 'Питчинг на радиостанции, чарты, баннерная реклама, аналитика и персональный менеджер.',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/20',
    borderColor: 'border-amber-500/20 hover:border-amber-400/40',
    bgColor: 'bg-amber-500/[0.06]',
    accentText: 'text-amber-400',
    note: 'Индивидуальный расчёт после модерации',
    time: 'до 48 часов',
  },
];

// ─── Component ────────────────────────────────────────────────────
export function TrackSubmitModal({ isOpen, onClose, initialService }: TrackSubmitModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(initialService ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    service: initialService || null,
    artistName: '',
    trackTitle: '',
    genre: '',
    email: '',
    phone: '',
    description: '',
    links: '',
    file: null,
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Sync state when modal opens or initialService changes
  useEffect(() => {
    if (isOpen) {
      setStep(initialService ? 2 : 1);
      setForm({
        service: initialService || null,
        artistName: '',
        trackTitle: '',
        genre: '',
        email: '',
        phone: '',
        description: '',
        links: '',
        file: null,
        agreeTerms: false,
      });
      setErrors({});
    }
  }, [isOpen, initialService]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.artistName.trim()) newErrors.artistName = 'Укажите имя артиста';
    if (!form.trackTitle.trim()) newErrors.trackTitle = 'Укажите название трека';
    if (!form.genre) newErrors.genre = 'Выберите жанр';
    if (!form.email.trim()) {
      newErrors.email = 'Укажите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Некорректный email';
    }
    if (!form.file) newErrors.file = 'Загрузите аудиофайл';
    if (!form.agreeTerms) newErrors.agreeTerms = 'Необходимо согласие';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 50 МБ.');
      return;
    }
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/flac', 'audio/aac'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|aac)$/i)) {
      toast.error('Поддерживаются форматы: MP3, WAV, FLAC, AAC');
      return;
    }
    updateField('file', file);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep(3);
    toast.success('Трек отправлен на модерацию!');
  };

  const handleClose = () => {
    setStep(initialService ? 2 : 1);
    setForm({ service: initialService || null, artistName: '', trackTitle: '', genre: '', email: '', phone: '', description: '', links: '', file: null, agreeTerms: false });
    setErrors({});
    onClose();
  };

  const selectedService = SERVICES.find(s => s.id === form.service);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-[640px] max-h-[92vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50"
        >
          {/* Glow effects behind modal */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#FF577F]/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

          {/* Glass background */}
          <div className="absolute inset-0 bg-[#0a0d14]/95 backdrop-blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02]" />
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-white/[0.08]" />

          {/* Scrollable content */}
          <div className="relative z-10 max-h-[92vh] overflow-y-auto scrollbar-hide">
            {/* ━━━ Header ━━━ */}
            <div className="sticky top-0 z-20 px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between bg-[#0a0d14]/80 backdrop-blur-xl border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                {step === 2 && !initialService && (
                  <motion.button
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setStep(1)}
                    className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </motion.button>
                )}
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {step === 1 && 'Выберите услугу'}
                    {step === 2 && (selectedService?.title || 'Загрузка трека')}
                    {step === 3 && 'Готово!'}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    {step === 1 && 'Регистрация не требуется'}
                    {step === 2 && 'Заполните анкету и загрузите трек'}
                    {step === 3 && 'Трек отправлен на модерацию'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] flex items-center justify-center transition-all group"
              >
                <X className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* ━━━ Progress ━━━ */}
            <div className="px-5 sm:px-7 pt-4 sm:pt-5">
              <div className="flex items-center gap-1.5 mb-2">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: step >= s ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full rounded-full ${
                        step >= s ? 'bg-gradient-to-r from-[#FF577F] to-purple-500' : ''
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 mb-5 sm:mb-6 font-medium">
                <span className={step >= 1 ? 'text-slate-400' : ''}>Услуга</span>
                <span className={step >= 2 ? 'text-slate-400' : ''}>Анкета</span>
                <span className={step >= 3 ? 'text-slate-400' : ''}>Готово</span>
              </div>
            </div>

            {/* ━━━ Content ━━━ */}
            <div className="px-5 sm:px-7 pb-6 sm:pb-8">
              <AnimatePresence mode="wait">

                {/* ═══ STEP 1: Choose Service ═══ */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {SERVICES.map(service => {
                      const Icon = service.icon;
                      return (
                        <motion.button
                          key={service.id}
                          whileHover={{ scale: 1.005, y: -1 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => { updateField('service', service.id); setStep(2); }}
                          className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 group ${service.borderColor} ${service.bgColor} hover:shadow-lg ${service.glow}`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center flex-shrink-0 shadow-lg ${service.glow} group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-sm sm:text-[15px] font-black text-white">{service.title}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-semibold border border-white/[0.04]">
                                  {service.subtitle}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mb-2.5 leading-relaxed">{service.description}</p>
                              <div className="flex items-center gap-4 text-[10px]">
                                <span className={`flex items-center gap-1 ${service.accentText} font-semibold`}>
                                  <Clock className="w-3 h-3" />
                                  {service.time}
                                </span>
                                <span className="text-slate-600 flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  {service.note}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
                          </div>
                        </motion.button>
                      );
                    })}

                    {/* No registration note */}
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/[0.08]">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-emerald-300/70 leading-relaxed">
                        Регистрация не требуется. Результат модерации и счёт на оплату - на email.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ═══ STEP 2: Form ═══ */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Service badge */}
                    {selectedService && (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${selectedService.bgColor} border ${selectedService.borderColor.split(' ')[0]}`}>
                        <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${selectedService.gradient} flex items-center justify-center`}>
                          <selectedService.icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-white/80">{selectedService.title}</span>
                      </div>
                    )}

                    {/* File Upload */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-2 block tracking-wide uppercase">
                        Аудиофайл <span className="text-[#FF577F] normal-case">*</span>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".mp3,.wav,.flac,.aac,audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full p-5 sm:p-6 rounded-2xl border-2 border-dashed transition-all duration-300 text-center group ${
                          form.file
                            ? 'border-emerald-500/30 bg-emerald-500/[0.04] hover:border-emerald-400/40'
                            : errors.file
                            ? 'border-red-500/30 bg-red-500/[0.04]'
                            : 'border-white/[0.08] bg-white/[0.02] hover:border-[#FF577F]/30 hover:bg-[#FF577F]/[0.03]'
                        }`}
                      >
                        {form.file ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                              <FileAudio className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-emerald-400 truncate max-w-[280px]">{form.file.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {(form.file.size / 1024 / 1024).toFixed(1)} МБ - нажмите для замены
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3 group-hover:bg-[#FF577F]/10 group-hover:border-[#FF577F]/20 transition-all">
                              <Upload className="w-5 h-5 text-slate-500 group-hover:text-[#FF577F] transition-colors" />
                            </div>
                            <p className="text-sm font-bold text-white/80 mb-0.5">Нажмите для загрузки</p>
                            <p className="text-[11px] text-slate-600">MP3, WAV, FLAC, AAC - до 50 МБ</p>
                          </>
                        )}
                      </button>
                      {errors.file && (
                        <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{errors.file}
                        </p>
                      )}
                    </div>

                    {/* Artist & Track Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <InputField
                        label="Имя артиста"
                        required
                        icon={User}
                        value={form.artistName}
                        onChange={v => updateField('artistName', v)}
                        placeholder="DJ Shadow"
                        error={errors.artistName}
                      />
                      <InputField
                        label="Название трека"
                        required
                        icon={Music}
                        value={form.trackTitle}
                        onChange={v => updateField('trackTitle', v)}
                        placeholder="Midnight Dreams"
                        error={errors.trackTitle}
                      />
                    </div>

                    {/* Genre */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-2 block tracking-wide uppercase">
                        Жанр <span className="text-[#FF577F] normal-case">*</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {GENRES.map(g => {
                          const colors = GENRE_COLORS[g];
                          return (
                            <button
                              key={g}
                              onClick={() => updateField('genre', g)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 border ${
                                form.genre === g
                                  ? colors
                                    ? `${colors.bg} ${colors.border} ${colors.text} shadow-md ${colors.glow} scale-105`
                                    : 'bg-[#FF577F] text-white shadow-md shadow-[#FF577F]/25 border-[#FF577F]/40 scale-105'
                                  : 'bg-white/[0.04] text-slate-500 hover:bg-white/[0.08] hover:text-white border-white/[0.04]'
                              }`}
                            >
                              <GenreIcon genre={g} size={12} />
                              {g}
                            </button>
                          );
                        })}
                      </div>
                      {errors.genre && <p className="text-[11px] text-red-400 mt-1.5">{errors.genre}</p>}
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <InputField
                        label="Email"
                        required
                        icon={Mail}
                        type="email"
                        value={form.email}
                        onChange={v => updateField('email', v)}
                        placeholder="artist@email.com"
                        error={errors.email}
                      />
                      <InputField
                        label="Телефон"
                        optional
                        icon={Phone}
                        type="tel"
                        value={form.phone}
                        onChange={v => updateField('phone', v)}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>

                    {/* Links */}
                    <InputField
                      label="Ссылки"
                      optional
                      optionalLabel="Spotify, YouTube, SoundCloud"
                      icon={Link2}
                      value={form.links}
                      onChange={v => updateField('links', v)}
                      placeholder="https://open.spotify.com/artist/..."
                    />

                    {/* Description */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-2 block tracking-wide uppercase">
                        Комментарий <span className="text-slate-600 normal-case font-normal">(необязательно)</span>
                      </label>
                      <div className="relative group">
                        <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600 group-focus-within:text-[#FF577F]/60 transition-colors" />
                        <textarea
                          value={form.description}
                          onChange={e => updateField('description', e.target.value)}
                          placeholder="Расскажите о треке, целях, предпочтениях..."
                          rows={3}
                          className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-[#FF577F]/30 focus:bg-[#FF577F]/[0.02] transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Terms — Custom checkbox */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                      errors.agreeTerms
                        ? 'bg-red-500/[0.04] border border-red-500/15'
                        : 'bg-white/[0.015] hover:bg-white/[0.03] border border-transparent'
                    }`}>
                      <button
                        type="button"
                        onClick={() => updateField('agreeTerms', !form.agreeTerms)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                          form.agreeTerms
                            ? 'bg-[#FF577F] border-[#FF577F] shadow-md shadow-[#FF577F]/25'
                            : 'bg-white/[0.04] border border-white/[0.1] hover:border-white/20'
                        }`}
                      >
                        {form.agreeTerms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </button>
                      <span className="text-[11px] text-slate-500 leading-relaxed">
                        Я соглашаюсь с{' '}
                        <span className="text-[#FF577F]/70 hover:text-[#FF577F] cursor-pointer">условиями использования</span>
                        {' '}и{' '}
                        <span className="text-[#FF577F]/70 hover:text-[#FF577F] cursor-pointer">политикой конфиденциальности</span>.
                        Оплата производится <strong className="text-white/60">только после модерации</strong>.
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-[11px] text-red-400 -mt-3">{errors.agreeTerms}</p>}

                    {/* Payment Note */}
                    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/[0.08]">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <p className="text-[11px] text-amber-300/60 leading-relaxed">
                        <strong className="text-amber-300/80">Оплата после модерации.</strong> Стоимость и реквизиты будут отправлены на email после одобрения эксперта.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#FF577F] to-purple-500 hover:from-[#FF4D7D] hover:to-purple-600 text-white font-black rounded-2xl py-6 sm:py-7 text-[15px] shadow-xl shadow-[#FF577F]/15 disabled:opacity-50 border-0 tracking-tight"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Отправляем...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Отправить на модерацию
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* ═══ STEP 3: Success ═══ */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center py-6 sm:py-10"
                  >
                    {/* Success icon with glow */}
                    <div className="relative inline-block mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/25"
                      >
                        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl"
                      />
                    </div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight"
                    >
                      Трек отправлен!
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed"
                    >
                      <strong className="text-white">«{form.trackTitle}»</strong> принят на модерацию.
                      Результат и детали оплаты - на <strong className="text-[#FF577F]">{form.email}</strong>
                    </motion.p>

                    {/* Timeline */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-0 max-w-xs mx-auto text-left mb-8"
                    >
                      {[
                        { icon: CheckCircle2, text: 'Трек загружен и принят', done: true, color: 'emerald' },
                        { icon: TestTube, text: 'Модерация экспертами', done: false, color: 'purple' },
                        { icon: Mail, text: 'Результат + счёт на email', done: false, color: 'blue' },
                        { icon: Sparkles, text: 'Оплата и публикация', done: false, color: 'pink' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 relative">
                          {/* Vertical line */}
                          {i < 3 && (
                            <div className="absolute left-[15px] top-8 w-px h-5 bg-gradient-to-b from-white/[0.08] to-transparent" />
                          )}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            item.done
                              ? 'bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10'
                              : 'bg-white/[0.04] text-slate-600 border border-white/[0.04]'
                          }`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span className={`text-sm pt-1.5 ${item.done ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleClose}
                        className="bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold px-8 py-4 rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all"
                      >
                        Закрыть
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Reusable Input Field ─────────────────────────────────────────
function InputField({
  label,
  required,
  optional,
  optionalLabel,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  optionalLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-300 mb-2 block tracking-wide uppercase">
        {label}{' '}
        {required && <span className="text-[#FF577F] normal-case">*</span>}
        {optional && <span className="text-slate-600 normal-case font-normal">({optionalLabel || 'необязательно'})</span>}
      </label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-[#FF577F]/60 transition-colors" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-11 pr-4 py-3 bg-white/[0.03] border rounded-xl text-sm text-white placeholder:text-slate-700 focus:outline-none transition-all ${
            error
              ? 'border-red-500/30 focus:border-red-400/50 bg-red-500/[0.02]'
              : 'border-white/[0.07] focus:border-[#FF577F]/30 focus:bg-[#FF577F]/[0.02]'
          }`}
        />
      </div>
      {error && <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}