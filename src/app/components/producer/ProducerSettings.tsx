/**
 * PRODUCER SETTINGS TAB
 * Настройки с персистентностью в KV Store
 * Загружает при маунте, автосохраняет при изменениях
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, Clock, CreditCard, Shield, Moon,
  ChevronRight, Save, Smartphone,
  Lock, CheckCircle2, Loader2, RefreshCw, Cloud, CloudOff,
} from 'lucide-react';
import * as studioApi from '@/utils/api/producer-studio';
import type { ProducerSettingsData } from '@/utils/api/producer-studio';

interface ProducerSettingsProps {
  producerId: string;
  producerName: string;
}

type SettingsSection = 'notifications' | 'schedule' | 'payments' | 'privacy' | 'appearance';

const DEFAULTS: ProducerSettingsData = {
  emailNotifs: true, pushNotifs: true, soundNotifs: false,
  newOrderNotif: true, messageNotif: true, reviewNotif: true, payoutNotif: true, marketingNotif: false,
  workDays: [true, true, true, true, true, false, false],
  workStart: '10:00', workEnd: '20:00', timezone: 'Europe/Moscow',
  autoReply: true, autoReplyText: 'Спасибо за обращение! Отвечу в рабочее время.',
  vacationMode: false,
  profilePublic: true, showOnlineStatus: true, showLastSeen: false, twoFactorAuth: false,
  language: 'ru', theme: 'dark', density: 'standard',
  minPayoutAmount: 10000, legalStatus: 'individual', inn: '',
};

function ToggleSwitch({ enabled, onChange, label, description }: {
  enabled: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button onClick={() => onChange(!enabled)} className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${enabled ? 'bg-teal-500' : 'bg-white/10'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export function ProducerSettings({ producerId, producerName }: ProducerSettingsProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('notifications');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [synced, setSynced] = useState(false);
  const [settings, setSettings] = useState<ProducerSettingsData>(DEFAULTS);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load from KV Store ───
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const result = await studioApi.fetchSettings(producerId);
      if (result.success && result.data) {
        setSettings({ ...DEFAULTS, ...result.data });
        setSynced(true);
      }
      setIsLoading(false);
    })();
  }, [producerId]);

  // ─── Auto-save with debounce (1.5s) ───
  const scheduleAutoSave = useCallback((newSettings: ProducerSettingsData) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaved(false);
    saveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      const result = await studioApi.saveSettings(producerId, newSettings);
      if (result.success) {
        setSaved(true);
        setSynced(true);
        setTimeout(() => setSaved(false), 2000);
      }
      setIsSaving(false);
    }, 1500);
  }, [producerId]);

  const update = useCallback(<K extends keyof ProducerSettingsData>(key: K, value: ProducerSettingsData[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      scheduleAutoSave(next);
      return next;
    });
    setSynced(false);
  }, [scheduleAutoSave]);

  const updateWorkDay = useCallback((index: number) => {
    setSettings(prev => {
      const next = { ...prev, workDays: prev.workDays.map((v, i) => i === index ? !v : v) };
      scheduleAutoSave(next);
      return next;
    });
    setSynced(false);
  }, [scheduleAutoSave]);

  const handleManualSave = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setIsSaving(true);
    const result = await studioApi.saveSettings(producerId, settings);
    if (result.success) {
      setSaved(true);
      setSynced(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setIsSaving(false);
  }, [producerId, settings]);

  const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const sections: { id: SettingsSection; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'notifications', label: 'Уведомления', icon: Bell, description: 'Каналы и типы уведомлений' },
    { id: 'schedule', label: 'Расписание', icon: Clock, description: 'Рабочие часы и автоответчик' },
    { id: 'payments', label: 'Оплата', icon: CreditCard, description: 'Платёжные данные и реквизиты' },
    { id: 'privacy', label: 'Приватность', icon: Shield, description: 'Видимость профиля и безопасность' },
    { id: 'appearance', label: 'Интерфейс', icon: Moon, description: 'Язык и тема оформления' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Настройки</h2>
        <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Загрузка настроек...</span></div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'notifications':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Каналы доставки</h3>
              <p className="text-xs text-gray-500 mb-3">Как вы хотите получать уведомления</p>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 divide-y divide-white/5">
                <ToggleSwitch enabled={settings.emailNotifs} onChange={v => update('emailNotifs', v)} label="Email-уведомления" description="Письма о заказах и сообщениях" />
                <ToggleSwitch enabled={settings.pushNotifs} onChange={v => update('pushNotifs', v)} label="Push-уведомления" description="Мгновенные уведомления в браузере" />
                <ToggleSwitch enabled={settings.soundNotifs} onChange={v => update('soundNotifs', v)} label="Звуковые уведомления" description="Звук при новом сообщении" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Типы уведомлений</h3>
              <p className="text-xs text-gray-500 mb-3">Выберите, о чём вам сообщать</p>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 divide-y divide-white/5">
                <ToggleSwitch enabled={settings.newOrderNotif} onChange={v => update('newOrderNotif', v)} label="Новые заказы" description="Когда клиент оформляет заказ" />
                <ToggleSwitch enabled={settings.messageNotif} onChange={v => update('messageNotif', v)} label="Новые сообщения" description="Входящие сообщения от клиентов" />
                <ToggleSwitch enabled={settings.reviewNotif} onChange={v => update('reviewNotif', v)} label="Новые отзывы" description="Когда клиент оставляет отзыв" />
                <ToggleSwitch enabled={settings.payoutNotif} onChange={v => update('payoutNotif', v)} label="Выплаты" description="Уведомления о начислениях" />
                <ToggleSwitch enabled={settings.marketingNotif} onChange={v => update('marketingNotif', v)} label="Маркетинг" description="Акции и новости платформы" />
              </div>
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-5">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4">
              <ToggleSwitch enabled={settings.vacationMode} onChange={v => update('vacationMode', v)} label="Режим отпуска" description="Приостановить приём заказов и показать статус 'Не принимает заказы'" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Рабочие дни</h3>
              <p className="text-xs text-gray-500 mb-3">Отметьте дни, когда вы принимаете заказы</p>
              <div className="flex gap-2">
                {dayLabels.map((day, i) => (
                  <button key={day} onClick={() => updateWorkDay(i)} className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${settings.workDays[i] ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/5 text-gray-500 border border-white/10 hover:text-white'}`}>{day}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Рабочие часы</h3>
              <p className="text-xs text-gray-500 mb-3">Время, когда вы доступны для общения</p>
              <div className="flex items-center gap-3">
                <div className="flex-1"><label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Начало</label><input type="time" value={settings.workStart} onChange={e => update('workStart', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40" /></div>
                <span className="text-gray-500 mt-5">-</span>
                <div className="flex-1"><label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Конец</label><input type="time" value={settings.workEnd} onChange={e => update('workEnd', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40" /></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Часовой пояс</h3>
              <select value={settings.timezone} onChange={e => update('timezone', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40 mt-2">
                <option value="Europe/Moscow" className="bg-[#0a0a14]">Москва (UTC+3)</option>
                <option value="Europe/Kaliningrad" className="bg-[#0a0a14]">Калининград (UTC+2)</option>
                <option value="Asia/Yekaterinburg" className="bg-[#0a0a14]">Екатеринбург (UTC+5)</option>
                <option value="Asia/Novosibirsk" className="bg-[#0a0a14]">Новосибирск (UTC+7)</option>
                <option value="Asia/Vladivostok" className="bg-[#0a0a14]">Владивосток (UTC+10)</option>
              </select>
            </div>
            <div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4">
                <ToggleSwitch enabled={settings.autoReply} onChange={v => update('autoReply', v)} label="Автоответчик" description="Автоматический ответ вне рабочих часов" />
              </div>
              {settings.autoReply && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                  <textarea value={settings.autoReplyText} onChange={e => update('autoReplyText', e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40 resize-none" placeholder="Текст автоответа..." />
                </motion.div>
              )}
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Платёжные реквизиты</h3>
              <p className="text-xs text-gray-500 mb-3">Данные для получения выплат</p>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0"><CreditCard className="w-5 h-5 text-blue-400" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white">Сбербанк **** 4521</p><p className="text-[10px] text-gray-500">Visa - действует до 08/27</p></div>
                  <span className="text-[9px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded-full font-bold">Основная</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0"><CreditCard className="w-5 h-5 text-purple-400" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white">ЮMoney</p><p className="text-[10px] text-gray-500">Электронный кошелёк</p></div>
                </div>
                <button className="w-full p-3 rounded-xl border border-dashed border-white/10 text-center text-xs text-gray-500 hover:text-teal-400 hover:border-teal-500/30 transition-colors">+ Добавить способ оплаты</button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Минимальная сумма вывода</h3>
              <p className="text-xs text-gray-500 mb-3">Автоматический вывод при достижении суммы</p>
              <div className="flex gap-2">
                {[5000, 10000, 25000, 50000].map(amount => (
                  <button key={amount} onClick={() => update('minPayoutAmount', amount)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${settings.minPayoutAmount === amount ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-teal-400 hover:border-teal-500/30'}`}>{(amount / 1000)}k P</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Юридическая информация</h3>
              <p className="text-xs text-gray-500 mb-3">Для формирования документов и чеков</p>
              <div className="space-y-3">
                <div><label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Статус</label><select value={settings.legalStatus} onChange={e => update('legalStatus', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40"><option value="individual" className="bg-[#0a0a14]">Физическое лицо</option><option value="self_employed" className="bg-[#0a0a14]">Самозанятый</option><option value="ip" className="bg-[#0a0a14]">ИП</option><option value="llc" className="bg-[#0a0a14]">ООО</option></select></div>
                <div><label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">ИНН</label><input type="text" value={settings.inn} onChange={e => update('inn', e.target.value)} placeholder="Введите ИНН" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40" /></div>
              </div>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Видимость профиля</h3>
              <p className="text-xs text-gray-500 mb-3">Управление публичным отображением</p>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 divide-y divide-white/5">
                <ToggleSwitch enabled={settings.profilePublic} onChange={v => update('profilePublic', v)} label="Публичный профиль" description="Профиль виден всем пользователям" />
                <ToggleSwitch enabled={settings.showOnlineStatus} onChange={v => update('showOnlineStatus', v)} label="Статус онлайн" description="Показывать когда вы в сети" />
                <ToggleSwitch enabled={settings.showLastSeen} onChange={v => update('showLastSeen', v)} label="Последний визит" description="Показывать время последнего посещения" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Безопасность</h3>
              <p className="text-xs text-gray-500 mb-3">Защита аккаунта</p>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 divide-y divide-white/5">
                <ToggleSwitch enabled={settings.twoFactorAuth} onChange={v => update('twoFactorAuth', v)} label="Двухфакторная аутентификация" description="Дополнительная защита при входе" />
              </div>
              <div className="mt-3 space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"><div className="flex items-center gap-3"><Lock className="w-4 h-4 text-gray-400" /><span className="text-sm text-white">Сменить пароль</span></div><ChevronRight className="w-4 h-4 text-gray-500" /></button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"><div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-gray-400" /><span className="text-sm text-white">Активные сессии</span></div><ChevronRight className="w-4 h-4 text-gray-500" /></button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <h3 className="text-sm font-bold text-red-400 mb-1">Опасная зона</h3>
              <p className="text-xs text-gray-500 mb-3">Эти действия нельзя отменить</p>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">Деактивировать профиль</button>
                <button className="px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">Удалить аккаунт</button>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Язык интерфейса</h3>
              <select value={settings.language} onChange={e => update('language', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40 mt-2">
                <option value="ru" className="bg-[#0a0a14]">Русский</option>
                <option value="en" className="bg-[#0a0a14]">English</option>
                <option value="kz" className="bg-[#0a0a14]">Qazaqsha</option>
              </select>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Тема оформления</h3>
              <p className="text-xs text-gray-500 mb-3">Цветовая схема интерфейса</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Тёмная', colors: ['#0a0a14', '#14b8a6'] },
                  { id: 'midnight', label: 'Midnight', colors: ['#0f172a', '#14b8a6'] },
                  { id: 'amoled', label: 'AMOLED', colors: ['#000000', '#14b8a6'] },
                ].map(theme => (
                  <button key={theme.id} onClick={() => update('theme', theme.id)} className={`p-3 rounded-xl border text-center transition-all ${settings.theme === theme.id ? 'border-teal-500/30 bg-teal-500/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                    <div className="flex gap-1 justify-center mb-2">{theme.colors.map((c, i) => <div key={i} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />)}</div>
                    <p className={`text-xs font-medium ${settings.theme === theme.id ? 'text-teal-400' : 'text-gray-400'}`}>{theme.label}</p>
                    {settings.theme === theme.id && <CheckCircle2 className="w-3 h-3 text-teal-400 mx-auto mt-1" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Плотность интерфейса</h3>
              <p className="text-xs text-gray-500 mb-3">Размер элементов и отступов</p>
              <div className="flex gap-2">
                {[{ id: 'compact', label: 'Компактный' }, { id: 'standard', label: 'Стандартный' }, { id: 'spacious', label: 'Просторный' }].map(d => (
                  <button key={d.id} onClick={() => update('density', d.id)} className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${settings.density === d.id ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'}`}>{d.label}</button>
                ))}
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Настройки</h2>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-bold">Облако</span>
          {synced && <span className="flex items-center gap-1 text-[10px] text-emerald-400"><Cloud className="w-3 h-3" />Синхронизировано</span>}
          {!synced && !isSaving && <span className="flex items-center gap-1 text-[10px] text-amber-400"><CloudOff className="w-3 h-3" />Не сохранено</span>}
        </div>
        <button onClick={handleManualSave} disabled={isSaving} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30'}`}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Сохранение...' : saved ? 'Сохранено' : 'Сохранить'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-64 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {sections.map(section => (
              <button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeSection === section.id ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                <section.icon className={`w-4 h-4 flex-shrink-0 ${activeSection === section.id ? 'text-teal-400' : 'text-gray-500'}`} />
                <div className="text-left hidden lg:block"><p className="text-sm">{section.label}</p><p className="text-[10px] text-gray-600">{section.description}</p></div>
                <span className="lg:hidden">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6">
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}