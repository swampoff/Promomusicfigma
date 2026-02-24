/**
 * DJ SETTINGS - Настройки кабинета DJ
 * Responsive табы: Основные, Безопасность, Расписание, Интеграции,
 * Подписка, Уведомления, Поддержка
 * 
 * Паттерн: горизонтальный скролл на мобильных, вертикальный сайдбар на desktop
 * (аналогично SettingsPage артиста)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, Shield, Clock, Link, Bell, Mail, Key,
  Globe, Smartphone, Eye, EyeOff, Save, ChevronRight,
  ToggleLeft, ToggleRight, MessageSquare, Crown, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Embedded tab contents
import { DjSubscription } from '@/dj/components/DjSubscription';
import { DjNotifications } from '@/dj/components/DjNotifications';
import { DjSupport } from '@/dj/components/DjSupport';

type DjSettingsTab = 'general' | 'security' | 'schedule' | 'integrations' | 'subscription' | 'notifications' | 'support';

interface ToggleSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: typeof Bell;
}

export function DjSettings() {
  const [activeTab, setActiveTab] = useState<DjSettingsTab>(() => {
    const requested = sessionStorage.getItem('promo_dj_settings_tab');
    if (requested) {
      sessionStorage.removeItem('promo_dj_settings_tab');
      const validTabs: DjSettingsTab[] = ['general', 'security', 'schedule', 'integrations', 'subscription', 'notifications', 'support'];
      if (validTabs.includes(requested as DjSettingsTab)) return requested as DjSettingsTab;
    }
    return 'general';
  });

  // Re-check sessionStorage on focus (handles re-navigation from sidebar redirect)
  useEffect(() => {
    const handleFocus = () => {
      const requested = sessionStorage.getItem('promo_dj_settings_tab');
      if (requested) {
        sessionStorage.removeItem('promo_dj_settings_tab');
        const validTabs: DjSettingsTab[] = ['general', 'security', 'schedule', 'integrations', 'subscription', 'notifications', 'support'];
        if (validTabs.includes(requested as DjSettingsTab)) {
          setActiveTab(requested as DjSettingsTab);
        }
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Also check on mount in case navigation happened without a focus event
  useEffect(() => {
    const requested = sessionStorage.getItem('promo_dj_settings_tab');
    if (requested) {
      sessionStorage.removeItem('promo_dj_settings_tab');
      const validTabs: DjSettingsTab[] = ['general', 'security', 'schedule', 'integrations', 'subscription', 'notifications', 'support'];
      if (validTabs.includes(requested as DjSettingsTab)) {
        setActiveTab(requested as DjSettingsTab);
      }
    }
  });

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

  const tabs: { id: DjSettingsTab; label: string; icon: typeof Settings }[] = [
    { id: 'general', label: 'Основные', icon: Settings },
    { id: 'security', label: 'Безопасность', icon: Shield },
    { id: 'schedule', label: 'Расписание', icon: Clock },
    { id: 'integrations', label: 'Интеграции', icon: Link },
    { id: 'subscription', label: 'Подписка', icon: Crown },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'support', label: 'Поддержка', icon: HelpCircle },
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
    <div className="w-full min-h-screen pb-20 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                Настройки
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">
                Управление кабинетом и предп��чтениями
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Sidebar - Horizontal scroll on mobile, vertical on desktop */}
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            {/* Mobile: horizontal scrollable tabs */}
            <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-2 px-2 pb-1">
              <div className="flex gap-2 w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.div
                      key={tab.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(tab.id)}
                      role="button"
                      tabIndex={0}
                      className={`px-3 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-white/5 border border-white/10 text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold">{tab.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            {/* Desktop: vertical sidebar */}
            <div className="hidden lg:block backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sticky top-4">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.div
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      role="button"
                      tabIndex={0}
                      className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-left cursor-pointer select-none ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/20'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-base font-semibold flex-1">{tab.label}</span>
                      {activeTab === tab.id && (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {/* General Settings */}
                {activeTab === 'general' && (
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
                            <div className="text-xs xs:text-sm font-bold text-white">{setting.label}</div>
                            <p className="text-[10px] xs:text-xs text-gray-500 truncate">{setting.description}</p>
                          </div>
                        </div>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleSetting(setting.id)}
                          className="flex-shrink-0 ml-3 cursor-pointer"
                        >
                          {setting.enabled ? (
                            <ToggleRight className="w-8 h-8 xs:w-9 xs:h-9 text-purple-400" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 xs:w-9 xs:h-9 text-gray-600" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toast.success('Настройки сохранены')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all mt-4 cursor-pointer select-none"
                    >
                      <Save className="w-4 h-4" /> Сохранить
                    </div>
                  </div>
                )}

                {/* Security */}
                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <div className="p-4 xs:p-5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                      <div className="text-sm xs:text-base font-black text-white mb-4 flex items-center gap-2">
                        <Key className="w-4 h-4 text-purple-400" /> Смена пароля
                      </div>
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Текущий пароль"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 pr-10"
                          />
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Новый пароль"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 pr-10"
                          />
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                          </div>
                        </div>
                        <input
                          type="password"
                          placeholder="Подтвердите новый пароль"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                        />
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toast.success('Пароль успешно изменён')}
                          className="inline-flex px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all cursor-pointer select-none"
                        >
                          Обновить пароль
                        </div>
                      </div>
                    </div>

                    <div className="p-4 xs:p-5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                      <div className="text-sm xs:text-base font-black text-white mb-3 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-purple-400" /> Двухфакторная аутентификация
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Защитите аккаунт с помощью SMS или приложения-аутентификатора</p>
                      <div
                        role="button"
                        tabIndex={0}
                        className="inline-flex px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-300 hover:bg-purple-500/10 transition-all cursor-pointer select-none"
                      >
                        Настроить 2FA
                      </div>
                    </div>
                  </div>
                )}

                {/* Schedule */}
                {activeTab === 'schedule' && (
                  <div className="p-4 xs:p-5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                    <div className="text-sm xs:text-base font-black text-white mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" /> Рабочие часы
                    </div>
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
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleDay(day)}
                            className="flex-shrink-0 cursor-pointer"
                          >
                            {hours.active ? (
                              <ToggleRight className="w-7 h-7 text-purple-400" />
                            ) : (
                              <ToggleLeft className="w-7 h-7 text-gray-600" />
                            )}
                          </div>
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
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toast.success('Расписание сохранено')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all mt-4 cursor-pointer select-none"
                    >
                      <Save className="w-4 h-4" /> Сохранить расписание
                    </div>
                  </div>
                )}

                {/* Integrations */}
                {activeTab === 'integrations' && (
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
                            <div className="text-xs xs:text-sm font-bold text-white">{integration.name}</div>
                            <p className="text-[10px] xs:text-xs text-gray-500">
                              {integration.connected ? 'Подключено' : 'Не подключено'}
                            </p>
                          </div>
                        </div>
                        <div
                          role="button"
                          tabIndex={0}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                            integration.connected
                              ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                              : 'bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20'
                          }`}
                        >
                          {integration.connected ? 'Отключить' : 'Подключить'}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Subscription - embedded component */}
                {activeTab === 'subscription' && <DjSubscription />}

                {/* Notifications - embedded component */}
                {activeTab === 'notifications' && <DjNotifications />}

                {/* Support - embedded component */}
                {activeTab === 'support' && <DjSupport />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
