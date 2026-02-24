/**
 * ONBOARDING WIZARD - Универсальный визард первичной настройки профиля
 * Запускается при первом входе нового пользователя (не демо)
 * Адаптируется под роль: артист / DJ / радиостанция / площадка / продюсер
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music2, Disc3, Radio, MapPin, Sliders, ArrowRight, ArrowLeft,
  Check, Sparkles, User, Share2, X, Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

export const LS_NEEDED_KEY = 'onboarding_needed';
const LS_DONE_KEY = 'promo_onboarding_v1';

type ORole = 'artist' | 'dj' | 'radio_station' | 'producer' | 'venue';

const ROLE_CONFIG: Record<ORole, {
  name: string; icon: React.ElementType; color: string; shadow: string; firstAction: string;
}> = {
  artist:        { name: 'Артист',        icon: Music2,  color: 'from-cyan-500 to-blue-500',     shadow: 'shadow-cyan-500/20',    firstAction: 'Загрузить первый трек' },
  dj:            { name: 'DJ',            icon: Disc3,   color: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/20',  firstAction: 'Добавить первый микс' },
  radio_station: { name: 'Радиостанция',  icon: Radio,   color: 'from-indigo-500 to-purple-500', shadow: 'shadow-indigo-500/20', firstAction: 'Принять заявку артиста' },
  producer:      { name: 'Продюсер',      icon: Sliders, color: 'from-teal-500 to-emerald-500',  shadow: 'shadow-teal-500/20',   firstAction: 'Опубликовать услугу' },
  venue:         { name: 'Заведение',     icon: MapPin,  color: 'from-amber-500 to-orange-500',  shadow: 'shadow-amber-500/20',  firstAction: 'Настроить плейлист' },
};

const GENRES = ['Pop','Rock','Hip-Hop','R&B','Electronic','House','Techno','Trance','Indie','Alternative','Jazz','Soul','Folk','Reggae','Classical'];
const PRODUCER_SERVICES = ['Сведение','Мастеринг','Аранжировка','Запись вокала','Биты','Саунд-дизайн','Написание текстов','Консалтинг'];
const VENUE_TYPES = ['Бар','Ресторан','Клуб','Лаунж','Концертный зал','Кафе','Галерея','Другое'];
const RADIO_FORMATS = ['Pop','Rock','Electronic','Hip-Hop','R&B','Ретро','Джаз','Топ чарты','Новинки','Классика'];

interface WizardData {
  name: string; city: string; bio: string;
  genres: string[]; services: string[];
  venueType: string; capacity: string;
  frequency: string; radioFormats: string[];
  vk: string; telegram: string; youtube: string; website: string;
}

interface OnboardingWizardProps {
  role: ORole;
  onComplete?: (data: WizardData) => void;
}

export function OnboardingWizard({ role, onComplete }: OnboardingWizardProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const roleKey = role === 'radio_station' ? 'radio' : role;
  const [form, setForm] = useState<WizardData>({
    name:         localStorage.getItem(`${roleKey}Name`)      || localStorage.getItem('userName') || '',
    city:         localStorage.getItem(`${roleKey}City`)      || '',
    bio:          '',
    genres:       JSON.parse(localStorage.getItem(`${role}Genres`) || '[]'),
    services:     [],
    venueType:    localStorage.getItem('venueType')           || '',
    capacity:     localStorage.getItem('venueCapacity')       || '',
    frequency:    localStorage.getItem('radioFrequency')      || '',
    radioFormats: JSON.parse(localStorage.getItem('radioFormats') || '[]'),
    vk: '', telegram: '', youtube: '', website: '',
  });

  useEffect(() => {
    const needed = localStorage.getItem(LS_NEEDED_KEY);
    const done   = localStorage.getItem(LS_DONE_KEY);
    if (needed === 'v1' && !done) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  const TOTAL = 3;

  const set = (field: keyof WizardData, val: any) =>
    setForm(p => ({ ...p, [field]: val }));

  const toggle = (field: 'genres' | 'services' | 'radioFormats', val: string) =>
    set(field, (form[field] as string[]).includes(val)
      ? (form[field] as string[]).filter(x => x !== val)
      : [...(form[field] as string[]), val]);

  const finish = async () => {
    setSaving(true);
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/onboarding/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ role, userId: localStorage.getItem('userId') || `${role}_${Date.now()}`, ...form }),
        }
      );
    } catch (e) { console.log('Onboarding save (non-critical):', e); }
    localStorage.removeItem(LS_NEEDED_KEY);
    localStorage.setItem(LS_DONE_KEY, 'done');
    setSaving(false);
    setVisible(false);
    toast.success('Профиль настроен!');
    onComplete?.(form);
  };

  const skip = () => {
    localStorage.removeItem(LS_NEEDED_KEY);
    localStorage.setItem(LS_DONE_KEY, 'skipped');
    setVisible(false);
  };

  if (!visible) return null;

  const tagPill = (label: string, active: boolean, onClick: () => void) => (
    <div
      key={label}
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border select-none ${
        active
          ? `bg-gradient-to-r ${cfg.color} text-white border-transparent`
          : 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
      }`}
    >
      {label}
    </div>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-[#07070f]/92 backdrop-blur-2xl flex items-center justify-center p-3 xs:p-4"
        >
          {/* Skip */}
          <div
            onClick={skip}
            className="absolute top-4 right-4 p-2 text-slate-600 hover:text-slate-400 cursor-pointer transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </div>

          {/* Progress dots */}
          {step >= 1 && step <= TOTAL && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i + 1 === step
                      ? `w-5 h-1.5 bg-gradient-to-r ${cfg.color}`
                      : i + 1 < step
                      ? 'w-1.5 h-1.5 bg-white/30'
                      : 'w-1.5 h-1.5 bg-white/10'
                  }`}
                />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="w-full max-w-sm xs:max-w-md"
            >
              <div className="bg-[#0f1020] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

                {/* ── STEP 0: Welcome ── */}
                {step === 0 && (
                  <div className="p-7 xs:p-8 text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center mx-auto mb-5 shadow-xl ${cfg.shadow}`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <div
                      className="text-white font-black mb-1.5"
                      style={{ fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Добро пожаловать!
                    </div>
                    <div className="mb-1.5" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                      <span className="text-slate-400">Кабинет </span>
                      <span className={`font-bold bg-gradient-to-r ${cfg.color} bg-clip-text text-transparent`}>
                        {cfg.name}
                      </span>
                      <span className="text-slate-400"> готов</span>
                    </div>
                    <div
                      className="text-slate-500 text-sm mb-7"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Настройте профиль за 2 минуты - это повысит охват и доверие аудитории
                    </div>
                    <div
                      onClick={() => setStep(1)}
                      className={`flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r ${cfg.color} rounded-xl text-white font-bold cursor-pointer hover:opacity-90 transition-opacity`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Настроить профиль
                    </div>
                    <div
                      onClick={skip}
                      className="mt-3 text-slate-600 text-xs cursor-pointer hover:text-slate-500 transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Пропустить - настрою позже
                    </div>
                  </div>
                )}

                {/* ── STEP 1: Profile ── */}
                {step === 1 && (
                  <div className="p-5 xs:p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Ваш профиль
                        </div>
                        <div className="text-slate-500 text-xs">Основная информация</div>
                      </div>
                    </div>
                    <div className="space-y-3.5">
                      <div>
                        <div className="text-xs font-semibold text-slate-400 mb-1.5">
                          {role === 'radio_station' ? 'Название станции' : role === 'venue' ? 'Название заведения' : 'Имя / Псевдоним'}
                        </div>
                        <input
                          value={form.name}
                          onChange={e => set('name', e.target.value)}
                          placeholder={
                            role === 'dj' ? 'DJ Pulse' :
                            role === 'radio_station' ? 'PROMO.FM' :
                            role === 'venue' ? 'Bar Decor' : 'Ваше имя'
                          }
                          className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-white/25 transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-400 mb-1.5">Город</div>
                        <input
                          value={form.city}
                          onChange={e => set('city', e.target.value)}
                          placeholder="Москва"
                          className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-white/25 transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-400 mb-1.5">
                          О себе <span className="text-slate-600 font-normal">(необязательно)</span>
                        </div>
                        <textarea
                          value={form.bio}
                          onChange={e => set('bio', e.target.value)}
                          placeholder={
                            role === 'radio_station' ? 'Краткое описание станции...' :
                            role === 'venue' ? 'Концепция и атмосфера заведения...' :
                            'Пара строк о вас и вашей музыке...'
                          }
                          rows={3}
                          className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-white/25 resize-none transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Specialization ── */}
                {step === 2 && (
                  <div className="p-5 xs:p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Специализация
                        </div>
                        <div className="text-slate-500 text-xs">Расскажите подробнее</div>
                      </div>
                    </div>

                    {(role === 'artist' || role === 'dj') && (
                      <div>
                        <div className="text-xs font-semibold text-slate-400 mb-3">Жанры (выберите несколько)</div>
                        <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto pr-1">
                          {GENRES.map(g => tagPill(g, form.genres.includes(g), () => toggle('genres', g)))}
                        </div>
                      </div>
                    )}

                    {role === 'producer' && (
                      <div>
                        <div className="text-xs font-semibold text-slate-400 mb-3">Услуги</div>
                        <div className="flex flex-wrap gap-1.5">
                          {PRODUCER_SERVICES.map(s => tagPill(s, form.services.includes(s), () => toggle('services', s)))}
                        </div>
                      </div>
                    )}

                    {role === 'venue' && (
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-3">Тип заведения</div>
                          <div className="flex flex-wrap gap-1.5">
                            {VENUE_TYPES.map(t => tagPill(t, form.venueType === t, () => set('venueType', t)))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-1.5">Вместимость (чел.)</div>
                          <input
                            value={form.capacity}
                            onChange={e => set('capacity', e.target.value)}
                            placeholder="150"
                            type="number"
                            className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-white/25 transition-colors"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                        </div>
                      </div>
                    )}

                    {role === 'radio_station' && (
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-1.5">Частота вещания</div>
                          <input
                            value={form.frequency}
                            onChange={e => set('frequency', e.target.value)}
                            placeholder="FM 100.5"
                            className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-white/25 transition-colors"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-3">Форматы эфира</div>
                          <div className="flex flex-wrap gap-1.5">
                            {RADIO_FORMATS.map(f => tagPill(f, form.radioFormats.includes(f), () => toggle('radioFormats', f)))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 3: Socials ── */}
                {step === 3 && (
                  <div className="p-5 xs:p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                        <Share2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Соцсети
                        </div>
                        <div className="text-slate-500 text-xs">Повышает охват и доверие</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { k: 'vk',       label: 'ВКонтакте', ph: 'vk.com/yourpage',          emoji: '🅱' },
                        { k: 'telegram', label: 'Telegram',  ph: 't.me/yourhandle',           emoji: '✈' },
                        { k: 'youtube',  label: 'YouTube',   ph: 'youtube.com/@yourchannel',  emoji: '▶' },
                        { k: 'website',  label: 'Сайт',      ph: 'yoursite.ru',               emoji: '🌐' },
                      ].map(({ k, label, ph, emoji }) => (
                        <div key={k} className="flex items-center gap-2.5">
                          <span className="text-base w-6 text-center flex-shrink-0 select-none">{emoji}</span>
                          <input
                            value={form[k as keyof WizardData] as string}
                            onChange={e => set(k as keyof WizardData, e.target.value)}
                            placeholder={ph}
                            className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-white/25 transition-colors"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Done ── */}
                {step === 4 && (
                  <div className="p-7 xs:p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-500/20"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <div
                      className="text-white font-black mb-1.5"
                      style={{ fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Профиль готов!
                    </div>
                    <div
                      className="text-slate-400 text-sm mb-7"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Отличный старт. Теперь сделайте первый шаг.
                    </div>
                    <div
                      onClick={finish}
                      className={`flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r ${cfg.color} rounded-xl text-white font-bold cursor-pointer hover:opacity-90 transition-opacity mb-2 ${saving ? 'opacity-60 pointer-events-none' : ''}`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <Zap className="w-4 h-4" />
                      {saving ? 'Сохраняю...' : cfg.firstAction}
                    </div>
                    <div
                      onClick={finish}
                      className="text-slate-500 text-xs cursor-pointer hover:text-slate-400 transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Открыть кабинет
                    </div>
                  </div>
                )}

                {/* ── Footer nav for steps 1-3 ── */}
                {step >= 1 && step <= TOTAL && (
                  <div className="px-5 xs:px-6 pb-5 xs:pb-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div
                      onClick={() => setStep(s => s - 1)}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Назад
                    </div>
                    <div className="text-slate-600 text-xs">{step} / {TOTAL}</div>
                    <div
                      onClick={() => setStep(s => s + 1)}
                      className={`flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r ${cfg.color} rounded-xl text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      {step === TOTAL ? 'Готово' : 'Далее'}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
