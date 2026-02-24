/**
 * PUBLISH WIZARD - Мастер публикации контента
 * 
 * 4-шаговый wizard: Тип -> Детали -> Модерация -> Оплата
 * Поддерживает публикацию видео и анонсов концертов
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video, Calendar, ChevronRight, ChevronLeft, Check, X, Upload,
  Link as LinkIcon, Coins, Shield, Clock, Zap, Star, Crown,
  Eye, FileVideo, Music, MapPin, Ticket, Globe, Tag, Info,
  CreditCard, Wallet, Sparkles, ArrowRight, Loader2, CheckCircle,
  AlertCircle, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import {
  createPublishOrder, fetchPricing, submitForReview,
  type PublishType, type PublishPlan, type PricingData
} from '@/utils/api/publish-api';

interface PublishWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: PublishType;
  userId?: string;
  onSuccess?: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

const VIDEO_CATEGORIES = [
  'Музыкальный клип', 'Лирик-видео', 'Live выступление', 'Behind the scenes',
  'Интервью', 'Vlog', 'Короткое видео', 'Другое'
];

const CONCERT_GENRES = [
  'Pop', 'Rock', 'Electronic', 'Hip-Hop', 'R&B', 'Jazz', 'Classical',
  'Folk', 'Metal', 'Indie', 'Reggae', 'Latin', 'Blues', 'Soul', 'Другое'
];

export function PublishWizard({
  isOpen,
  onClose,
  initialType,
  userId = 'demo-artist',
  onSuccess,
}: PublishWizardProps) {
  const [step, setStep] = useState<WizardStep>(initialType ? 2 : 1);
  const [contentType, setContentType] = useState<PublishType | null>(initialType || null);
  const [plan, setPlan] = useState<PublishPlan>('free');
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video form
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    videoSource: 'link' as 'file' | 'link',
    videoCategory: '',
    tags: '',
  });

  // Concert form
  const [concertForm, setConcertForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    city: '',
    venueName: '',
    venueAddress: '',
    ticketPriceMin: '',
    ticketPriceMax: '',
    ticketUrl: '',
    genre: '',
  });

  // Load pricing
  useEffect(() => {
    if (isOpen) {
      fetchPricing().then((data) => {
        if (data) setPricing(data);
      });
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(initialType ? 2 : 1);
        setContentType(initialType || null);
        setPlan('free');
        setIsComplete(false);
        setError(null);
        setIsSubmitting(false);
      }, 300);
    }
  }, [isOpen, initialType]);

  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return contentType !== null;
      case 2:
        if (contentType === 'video') {
          return videoForm.title.trim().length > 0 && videoForm.videoUrl.trim().length > 0;
        }
        return concertForm.title.trim().length > 0 && concertForm.eventDate.length > 0 && concertForm.city.trim().length > 0;
      case 3:
        return true; // Review step - always proceed
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, contentType, videoForm, concertForm]);

  const handleSubmit = useCallback(async () => {
    if (!contentType) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const baseData = {
        userId,
        type: contentType,
        plan,
      };

      const orderData = contentType === 'video'
        ? {
            ...baseData,
            title: videoForm.title,
            description: videoForm.description,
            videoUrl: videoForm.videoUrl,
            videoSource: videoForm.videoSource,
            videoCategory: videoForm.videoCategory,
            tags: videoForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
          }
        : {
            ...baseData,
            title: concertForm.title,
            description: concertForm.description,
            eventDate: concertForm.eventDate,
            eventTime: concertForm.eventTime,
            city: concertForm.city,
            venueName: concertForm.venueName,
            venueAddress: concertForm.venueAddress,
            ticketPriceMin: concertForm.ticketPriceMin ? Number(concertForm.ticketPriceMin) : 0,
            ticketPriceMax: concertForm.ticketPriceMax ? Number(concertForm.ticketPriceMax) : 0,
            ticketUrl: concertForm.ticketUrl,
            genre: concertForm.genre,
          };

      const order = await createPublishOrder(orderData);
      if (!order) {
        setError('Не удалось создать заказ. Попробуйте позже.');
        setIsSubmitting(false);
        return;
      }

      // Submit for review
      await submitForReview(order.id);

      setIsComplete(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  }, [contentType, videoForm, concertForm, plan, userId, onSuccess]);

  const goNext = () => {
    if (step === 4) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(s + 1, 4) as WizardStep);
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1) as WizardStep);
  };

  if (!isOpen) return null;

  const currentPricing = contentType && pricing ? pricing[contentType] : null;
  const selectedPricing = currentPricing ? currentPricing[plan] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 xs:p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#0f0f1e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 xs:px-6 py-4 border-b border-white/10 flex-shrink-0">
              <div>
                <h2 className="text-lg xs:text-xl font-black text-white">
                  {isComplete ? 'Готово!' : 'Публикация контента'}
                </h2>
                {!isComplete && (
                  <p className="text-xs xs:text-sm text-slate-500 mt-0.5">
                    Шаг {step} из 4
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            {!isComplete && (
              <div className="px-4 xs:px-6 py-3 border-b border-white/5 flex-shrink-0">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex-1 flex items-center gap-1">
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                          s <= step
                            ? 'bg-gradient-to-r from-[#FF577F] to-purple-500'
                            : 'bg-white/10'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {['Тип', 'Детали', 'Проверка', 'Оплата'].map((label, i) => (
                    <span
                      key={label}
                      className={`text-[10px] xs:text-xs font-medium transition-colors ${
                        i + 1 <= step ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 xs:px-6 py-4 xs:py-5 scrollbar-hide">
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <SuccessStep
                    key="success"
                    contentType={contentType!}
                    plan={plan}
                    onClose={onClose}
                  />
                ) : (
                  <div className="contents">
                    {step === 1 && (
                      <StepChooseType
                        key="step1"
                        contentType={contentType}
                        onSelect={(t) => setContentType(t)}
                      />
                    )}
                    {step === 2 && contentType === 'video' && (
                      <StepVideoDetails
                        key="step2v"
                        form={videoForm}
                        onChange={setVideoForm}
                      />
                    )}
                    {step === 2 && contentType === 'concert' && (
                      <StepConcertDetails
                        key="step2c"
                        form={concertForm}
                        onChange={setConcertForm}
                      />
                    )}
                    {step === 3 && (
                      <StepReview
                        key="step3"
                        contentType={contentType!}
                        videoForm={videoForm}
                        concertForm={concertForm}
                      />
                    )}
                    {step === 4 && (
                      <StepPayment
                        key="step4"
                        contentType={contentType!}
                        plan={plan}
                        onPlanChange={setPlan}
                        pricing={currentPricing}
                      />
                    )}
                  </div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {!isComplete && (
              <div className="px-4 xs:px-6 py-4 border-t border-white/10 flex items-center justify-between flex-shrink-0">
                <button
                  onClick={step === 1 ? onClose : goBack}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {step === 1 ? 'Отмена' : 'Назад'}
                </button>

                <button
                  onClick={goNext}
                  disabled={!canProceed || isSubmitting}
                  className={`flex items-center gap-2 px-5 xs:px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    canProceed && !isSubmitting
                      ? 'bg-gradient-to-r from-[#FF577F] to-purple-500 hover:from-[#FF4D7D] hover:to-purple-400 text-white shadow-lg shadow-[#FF577F]/20'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="contents">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Отправка...
                    </span>
                  ) : step === 4 ? (
                    <span className="contents">
                      {selectedPricing && selectedPricing.price > 0 ? (
                        <span className="contents">
                          Оплатить {selectedPricing.price.toLocaleString()} ₽
                          <CreditCard className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="contents">
                          Опубликовать бесплатно
                          <Check className="w-4 h-4" />
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="contents">
                      Далее
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════
// STEP 1 - Choose Type
// ═══════════════════════════════════════════════════════

function StepChooseType({
  contentType,
  onSelect,
}: {
  contentType: PublishType | null;
  onSelect: (t: PublishType) => void;
}) {
  const types = [
    {
      id: 'video' as PublishType,
      icon: Video,
      title: 'Разместить видео',
      description: 'Загрузи клип, live-видео или лирик-видео. После модерации - публикация на платформе',
      gradient: 'from-[#FF577F] to-pink-600',
      border: 'border-[#FF577F]/30 hover:border-[#FF577F]/60',
      activeBorder: 'border-[#FF577F]',
      shadow: 'shadow-[#FF577F]/20',
      features: ['Страница видео', 'Встраивание плеера', 'Аналитика просмотров'],
    },
    {
      id: 'concert' as PublishType,
      icon: Calendar,
      title: 'Анонсировать концерт',
      description: 'Создай страницу события с продажей билетов. Продвижение на главной и в рекомендациях',
      gradient: 'from-orange-500 to-amber-600',
      border: 'border-orange-500/30 hover:border-orange-500/60',
      activeBorder: 'border-orange-500',
      shadow: 'shadow-orange-500/20',
      features: ['Страница события', 'Продажа билетов', 'Push-уведомления'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg xs:text-xl font-black text-white mb-2">Что хочешь опубликовать?</h3>
        <p className="text-xs xs:text-sm text-slate-500">Выбери тип контента - мы поможем с публикацией и продвижением</p>
      </div>

      <div className="space-y-3">
        {types.map((type) => {
          const isSelected = contentType === type.id;
          return (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(type.id)}
              className={`w-full text-left p-4 xs:p-5 rounded-2xl border-2 transition-all duration-300 ${
                isSelected ? `${type.activeBorder} bg-gradient-to-r ${type.gradient.replace('from-', 'from-').split(' ')[0]}/10 to-transparent shadow-lg ${type.shadow}` : `${type.border} bg-white/[0.02]`
              }`}
            >
              <div className="flex items-start gap-3 xs:gap-4">
                <div className={`w-12 h-12 xs:w-14 xs:h-14 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center flex-shrink-0 shadow-lg ${type.shadow}`}>
                  <type.icon className="w-6 h-6 xs:w-7 xs:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base xs:text-lg font-black text-white">{type.title}</h4>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs xs:text-sm text-slate-400 mb-3">{type.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {type.features.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] xs:text-xs text-slate-400"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// STEP 2A - Video Details
// ═══════════════════════════════════════════════════════

function StepVideoDetails({
  form,
  onChange,
}: {
  form: { title: string; description: string; videoUrl: string; videoSource: 'file' | 'link'; videoCategory: string; tags: string };
  onChange: (f: { title: string; description: string; videoUrl: string; videoSource: 'file' | 'link'; videoCategory: string; tags: string }) => void;
}) {
  const inputClass = "w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#FF577F]/50 focus:ring-2 focus:ring-[#FF577F]/20 outline-none transition-all text-white placeholder:text-slate-600 text-sm";
  const labelClass = "block text-xs xs:text-sm font-bold text-slate-300 mb-1.5";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#FF577F]/20 flex items-center justify-center">
          <Video className="w-4 h-4 text-[#FF577F]" />
        </div>
        <h3 className="text-base xs:text-lg font-black text-white">Детали видео</h3>
      </div>

      <div>
        <label className={labelClass}>Название *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder="Название клипа или видео"
          className={inputClass}
          maxLength={120}
        />
      </div>

      <div>
        <label className={labelClass}>Ссылка на видео *</label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="url"
            value={form.videoUrl}
            onChange={(e) => onChange({ ...form, videoUrl: e.target.value })}
            placeholder="YouTube, Vimeo, VK Video или прямая ссылка"
            className={`${inputClass} pl-10`}
          />
        </div>
        <p className="text-[10px] text-slate-600 mt-1">Поддерживаются: YouTube, Vimeo, VK Video, Rutube, прямые ссылки</p>
      </div>

      <div>
        <label className={labelClass}>Категория</label>
        <select
          value={form.videoCategory}
          onChange={(e) => onChange({ ...form, videoCategory: e.target.value })}
          className={`${inputClass} appearance-none cursor-pointer`}
        >
          <option value="" className="bg-[#0f0f1e]">Выберите категорию</option>
          {VIDEO_CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-[#0f0f1e]">{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Описание</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="Описание видео, история создания, участники..."
          className={`${inputClass} h-20 xs:h-24 resize-none`}
          maxLength={1000}
        />
      </div>

      <div>
        <label className={labelClass}>Теги</label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={form.tags}
            onChange={(e) => onChange({ ...form, tags: e.target.value })}
            placeholder="клип, pop, 2026 (через запятую)"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// STEP 2B - Concert Details
// ═══════════════════════════════════════════════════════

function StepConcertDetails({
  form,
  onChange,
}: {
  form: { title: string; description: string; eventDate: string; eventTime: string; city: string; venueName: string; venueAddress: string; ticketPriceMin: string; ticketPriceMax: string; ticketUrl: string; genre: string };
  onChange: (f: typeof form) => void;
}) {
  const inputClass = "w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-white placeholder:text-slate-600 text-sm";
  const labelClass = "block text-xs xs:text-sm font-bold text-slate-300 mb-1.5";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-orange-400" />
        </div>
        <h3 className="text-base xs:text-lg font-black text-white">Детали концерта</h3>
      </div>

      <div>
        <label className={labelClass}>Название события *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder="Например: Презентация альбома в Москве"
          className={inputClass}
          maxLength={120}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Дата *</label>
          <input
            type="date"
            value={form.eventDate}
            onChange={(e) => onChange({ ...form, eventDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Время</label>
          <input
            type="time"
            value={form.eventTime}
            onChange={(e) => onChange({ ...form, eventTime: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Город *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={form.city}
              onChange={(e) => onChange({ ...form, city: e.target.value })}
              placeholder="Москва"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Жанр</label>
          <select
            value={form.genre}
            onChange={(e) => onChange({ ...form, genre: e.target.value })}
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            <option value="" className="bg-[#0f0f1e]">Жанр</option>
            {CONCERT_GENRES.map((g) => (
              <option key={g} value={g} className="bg-[#0f0f1e]">{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Площадка</label>
        <input
          type="text"
          value={form.venueName}
          onChange={(e) => onChange({ ...form, venueName: e.target.value })}
          placeholder="Название площадки"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Цена от, ₽</label>
          <div className="relative">
            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="number"
              value={form.ticketPriceMin}
              onChange={(e) => onChange({ ...form, ticketPriceMin: e.target.value })}
              placeholder="500"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Цена до, ₽</label>
          <input
            type="number"
            value={form.ticketPriceMax}
            onChange={(e) => onChange({ ...form, ticketPriceMax: e.target.value })}
            placeholder="3000"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Описание</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="Программа, участники, дополнительная информация..."
          className={`${inputClass} h-16 xs:h-20 resize-none`}
          maxLength={1000}
        />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// STEP 3 - Review
// ═══════════════════════════════════════════════════════

function StepReview({
  contentType,
  videoForm,
  concertForm,
}: {
  contentType: PublishType;
  videoForm: any;
  concertForm: any;
}) {
  const isVideo = contentType === 'video';
  const form = isVideo ? videoForm : concertForm;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Eye className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-base xs:text-lg font-black text-white">Проверьте перед отправкой</h3>
      </div>

      {/* Preview Card */}
      <div className="p-4 xs:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {isVideo ? <Video className="w-4 h-4 text-[#FF577F]" /> : <Calendar className="w-4 h-4 text-orange-400" />}
          <span>{isVideo ? 'Видео' : 'Концерт'}</span>
        </div>

        <h4 className="text-base xs:text-lg font-bold text-white">{form.title || 'Без названия'}</h4>

        {form.description && (
          <p className="text-xs xs:text-sm text-slate-400 line-clamp-3">{form.description}</p>
        )}

        <div className="pt-2 border-t border-white/5 space-y-2">
          {isVideo && (
            <div className="contents">
              {videoForm.videoUrl && (
                <DetailRow icon={LinkIcon} label="Ссылка" value={videoForm.videoUrl} truncate />
              )}
              {videoForm.videoCategory && (
                <DetailRow icon={FileVideo} label="Категория" value={videoForm.videoCategory} />
              )}
              {videoForm.tags && (
                <DetailRow icon={Tag} label="Теги" value={videoForm.tags} />
              )}
            </div>
          )}
          {!isVideo && (
            <div className="contents">
              {concertForm.eventDate && (
                <DetailRow icon={Calendar} label="Дата" value={`${concertForm.eventDate}${concertForm.eventTime ? ` в ${concertForm.eventTime}` : ''}`} />
              )}
              {concertForm.city && (
                <DetailRow icon={MapPin} label="Город" value={concertForm.city} />
              )}
              {concertForm.venueName && (
                <DetailRow icon={Music} label="Площадка" value={concertForm.venueName} />
              )}
              {concertForm.genre && (
                <DetailRow icon={Tag} label="Жанр" value={concertForm.genre} />
              )}
              {(concertForm.ticketPriceMin || concertForm.ticketPriceMax) && (
                <DetailRow icon={Ticket} label="Билеты" value={`${concertForm.ticketPriceMin || '?'} - ${concertForm.ticketPriceMax || '?'} ₽`} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Moderation Info */}
      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-3">
        <h5 className="text-sm font-bold text-blue-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Что происходит после отправки
        </h5>
        <div className="space-y-2">
          <ModerationStep number={1} title="Модерация" description="Наша команда проверит контент на соответствие правилам (до 24ч)" />
          <ModerationStep number={2} title="Уведомление" description="Получишь уведомление о результате - одобрено или нужна доработка" />
          <ModerationStep number={3} title="Публикация" description="После одобрения и оплаты (если выбран платный тариф) - контент публикуется" />
        </div>
      </div>
    </motion.div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  truncate,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs xs:text-sm">
      <Icon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
      <span className="text-slate-500">{label}:</span>
      <span className={`text-white font-medium ${truncate ? 'truncate max-w-[200px]' : ''}`}>{value}</span>
    </div>
  );
}

function ModerationStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[10px] font-bold text-blue-400">{number}</span>
      </div>
      <div>
        <p className="text-xs xs:text-sm font-medium text-white">{title}</p>
        <p className="text-[10px] xs:text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STEP 4 - Payment
// ═══════════════════════════════════════════════════════

function StepPayment({
  contentType,
  plan,
  onPlanChange,
  pricing,
}: {
  contentType: PublishType;
  plan: PublishPlan;
  onPlanChange: (p: PublishPlan) => void;
  pricing: Record<PublishPlan, { price: number; label: string; features: string[] }> | null;
}) {
  const plans: Array<{ id: PublishPlan; icon: React.ElementType; color: string; gradient: string }> = [
    { id: 'free', icon: Zap, color: 'text-slate-400', gradient: 'from-slate-500 to-slate-600' },
    { id: 'standard', icon: Star, color: 'text-blue-400', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'premium', icon: Crown, color: 'text-amber-400', gradient: 'from-amber-500 to-orange-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-purple-400" />
        </div>
        <h3 className="text-base xs:text-lg font-black text-white">Выберите тариф</h3>
      </div>

      <div className="space-y-3">
        {plans.map((p) => {
          const info = pricing?.[p.id] || {
            price: p.id === 'free' ? 0 : p.id === 'standard' ? 990 : 2990,
            label: p.id === 'free' ? 'Бесплатно' : p.id === 'standard' ? 'Стандарт' : 'Премиум',
            features: ['Публикация на платформе'],
          };
          const isSelected = plan === p.id;

          return (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onPlanChange(p.id)}
              className={`w-full text-left p-3 xs:p-4 rounded-2xl border-2 transition-all duration-300 ${
                isSelected
                  ? `border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10`
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center flex-shrink-0`}>
                    <p.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm xs:text-base font-bold text-white">{info.label}</h4>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {info.features.map((f, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 text-[10px] xs:text-xs text-slate-400"
                        >
                          <Check className="w-3 h-3 text-green-400" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg xs:text-xl font-black ${info.price === 0 ? 'text-green-400' : 'text-white'}`}>
                    {info.price === 0 ? '0 ₽' : `${info.price.toLocaleString()} ₽`}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Payment method hint */}
      {plan !== 'free' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 xs:p-4 rounded-xl bg-white/5 border border-white/10 space-y-2"
        >
          <p className="text-xs font-bold text-white">Способы оплаты</p>
          <div className="flex flex-wrap gap-2">
            {['Банковская карта', 'СБП', 'ЮMoney', 'Promo Coins'].map((m) => (
              <span key={m} className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] xs:text-xs text-slate-400 border border-white/5">
                {m}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-slate-600">Платеж защищен SSL-шифрованием. Возврат в течение 14 дней</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// SUCCESS STEP
// ═══════════════════════════════════════════════════════

function SuccessStep({
  contentType,
  plan,
  onClose,
}: {
  contentType: PublishType;
  plan: PublishPlan;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-6 xs:py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
        className="w-20 h-20 xs:w-24 xs:h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-2xl shadow-green-500/30"
      >
        <CheckCircle className="w-10 h-10 xs:w-12 xs:h-12 text-white" />
      </motion.div>

      <h3 className="text-xl xs:text-2xl font-black text-white mb-2">
        {contentType === 'video' ? 'Видео отправлено!' : 'Концерт отправлен!'}
      </h3>

      <p className="text-sm xs:text-base text-slate-400 mb-6 max-w-sm">
        {plan === 'free'
          ? 'Ваш контент отправлен на модерацию. После проверки он будет опубликован на платформе'
          : 'Ваш контент отправлен на модерацию. После проверки вы получите уведомление для оплаты и публикации'}
      </p>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 w-full max-w-xs space-y-2 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Статус</span>
          <span className="text-amber-400 font-bold">На модерации</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Ожидание</span>
          <span className="text-white font-medium">
            {plan === 'premium' ? 'до 4 часов' : plan === 'standard' ? 'до 24 часов' : 'до 48 часов'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Тариф</span>
          <span className="text-white font-medium">
            {plan === 'free' ? 'Бесплатный' : plan === 'standard' ? 'Стандарт' : 'Премиум'}
          </span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF577F] to-purple-500 hover:from-[#FF4D7D] hover:to-purple-400 text-white font-bold text-sm shadow-lg shadow-[#FF577F]/20 transition-all"
      >
        Отлично, закрыть
      </button>
    </motion.div>
  );
}