/**
 * DJ SETTINGS - Настройки кабинета DJ
 * Безопасность, авто-ответы, интеграции, рабочие часы
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings, Shield, Clock, Link, Bell, Mail, Key,
  Globe, Smartphone, Eye, EyeOff, Save, ChevronRight,
  ToggleLeft, ToggleRight, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface ToggleSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: typeof Bell;
}

export function DjSettings() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [generalSettings, setGeneralSettings] = useState<ToggleSetting[]>([
    { id: 'email_notif', label: 'Email-уведомления', description: 'Получать уведомления о букингах на email', enabled: true, icon: Mail },
    { id: 'push_notif', label: 'Push-уведомления', description: 'Уведомления в браузере о новых сообщениях', enabled: true, icon: Bell },
    { id: 'auto_reply', label: 'Авто-ответ на букинги', description: 'Автоматически подтверждать получение запроса', enabled: false, icon: MessageSquare },
    { id: 'public_profile', label: 'Публичный профиль', description: 'Показывать профиль в DJ Marketplace', enabled: true, icon: Globe },
    { id: 'show_fee', label: 'Показывать гонорар', description: 'Отображать диапазон гонорара в профиле', enabled: false, icon: Eye },
  ]);

  const [workingHours, setWorkingHours] = useState({
    mon: { active: true, from: '20:00', to: '04:00' },
    tue: { active: true, from: '20:00', to: '04:00' },
    wed: { active: false, from: '', to: '' },
    thu: { active: true, from: '21:00', to: '05:00' },
    fri: { active: true, from: '22:00', to: '06:00' },
    sat: { active: true, from: '22:00', to: '06:00' },
    sun: { active: false, from: '', to: '' },
  });

  const dayLabels: Record<string, string> = {
    mon: 'Понедельник', tue: 'Вторник', wed: 'Среда', thu: 'Четверг',
    fri: 'Пятница', sat: 'Суббота', sun: 'Воскресенье',
  };

  const toggleSetting = (id: string) => {
    setGeneralSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const toggleDay = (day: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], active: !prev[day as keyof typeof prev].active },
    }));
  };

  const categories = [
    { id: 'general', label: 'Основные', icon: Settings },
    { id: 'security', label: 'Безопасность', icon: Shield },
    { id: 'schedule', label: 'Расписание', icon: Clock },
    { id: 'integrations', label: 'Интеграции', icon: Link },
  ];

  const integrations = [
    { name: 'Spotify', connected: true, color: 'bg-green-500' },
    { name: 'SoundCloud', connected: true, color: 'bg-orange-500' },
    { name: 'Mixcloud', connected: false, color: 'bg-blue-500' },
    { name: 'Twitch', connected: false, color: 'bg-purple-500' },
    { name: 'Instagram', connected: true, color: 'bg-pink-500' },
    { name: 'Telegram Bot', connected: false, color: 'bg-sky-500' },
  ];

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white">Настройки</h1>
        <p className="text-xs xs:text-sm text-gray-400 mt-0.5">Безопасность, уведомления, интеграции</p>
      </div>

      {/* Category selector */}
      <div className="flex gap-1.5 xs:gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" /> {cat.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeCategory === 'general' && (
        <div className="space-y-2 xs:space-y-2.5">
          {generalSettings.map((setting, i) => (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between p-3.5 xs:p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-3 min-w-0">
                <setting.icon className="w-4 h-4 xs:w-5 xs:h-5 text-purple-400 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xs xs:text-sm font-bold text-white">{setting.label}</h3>
                  <p className="text-[10px] xs:text-xs text-gray-500 truncate">{setting.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(setting.id)}
                className="flex-shrink-0 ml-3"
              >
                {setting.enabled ? (
                  <ToggleRight className="w-8 h-8 xs:w-9 xs:h-9 text-purple-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 xs:w-9 xs:h-9 text-gray-600" />
                )}
              </button>
            </motion.div>
          ))}
          <button
            onClick={() => toast.success('Настройки сохранены')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all mt-4"
          >
            <Save className="w-4 h-4" /> Сохранить
          </button>
        </div>
      )}

      {/* Security */}
      {activeCategory === 'security' && (
        <div className="space-y-4">
          <div className="p-4 xs:p-5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
            <h3 className="text-sm xs:text-base font-black text-white mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" /> Смена пароля
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Текущий пароль"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 pr-10"
                />
                <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Новый пароль"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 pr-10"
                />
                <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
              <input
                type="password"
                placeholder="Подтвердите новый пароль"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={() => toast.success('Пароль успешно изменён')}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
              >
                Обновить пароль
              </button>
            </div>
          </div>

          <div className="p-4 xs:p-5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
            <h3 className="text-sm xs:text-base font-black text-white mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" /> Двухфакторная аутентификация
            </h3>
            <p className="text-xs text-gray-400 mb-3">Защитите аккаунт с помощью SMS или приложения-аутентификатора</p>
            <button className="px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-300 hover:bg-purple-500/10 transition-all">
              Настроить 2FA
            </button>
          </div>
        </div>
      )}

      {/* Schedule */}
      {activeCategory === 'schedule' && (
        <div className="p-4 xs:p-5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <h3 className="text-sm xs:text-base font-black text-white mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" /> Рабочие часы
          </h3>
          <p className="text-[10px] xs:text-xs text-gray-500 mb-4">Укажите время, когда вы доступны для букингов</p>
          <div className="space-y-2">
            {Object.entries(workingHours).map(([day, hours], i) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-2.5 xs:p-3 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <button onClick={() => toggleDay(day)} className="flex-shrink-0">
                  {hours.active ? (
                    <ToggleRight className="w-7 h-7 text-purple-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-gray-600" />
                  )}
                </button>
                <span className={`text-xs font-bold w-24 xs:w-28 flex-shrink-0 ${hours.active ? 'text-white' : 'text-gray-600'}`}>
                  {dayLabels[day]}
                </span>
                {hours.active ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <input
                      type="time"
                      value={hours.from}
                      onChange={e => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], from: e.target.value } }))}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-purple-500/50"
                    />
                    <span className="text-gray-600">-</span>
                    <input
                      type="time"
                      value={hours.to}
                      onChange={e => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], to: e.target.value } }))}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-600">Выходной</span>
                )}
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => toast.success('Расписание сохранено')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all mt-4"
          >
            <Save className="w-4 h-4" /> Сохранить расписание
          </button>
        </div>
      )}

      {/* Integrations */}
      {activeCategory === 'integrations' && (
        <div className="space-y-2.5">
          {integrations.map((integration, i) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between p-3.5 xs:p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 xs:w-9 xs:h-9 rounded-lg ${integration.color} flex items-center justify-center`}>
                  <Link className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs xs:text-sm font-bold text-white">{integration.name}</h3>
                  <p className="text-[10px] xs:text-xs text-gray-500">
                    {integration.connected ? 'Подключено' : 'Не подключено'}
                  </p>
                </div>
              </div>
              <button
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  integration.connected
                    ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                    : 'bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20'
                }`}
              >
                {integration.connected ? 'Отключить' : 'Подключить'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}