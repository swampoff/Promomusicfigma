/**
 * DJ PROFILE EDITOR - Редактор профиля диджея
 * Основная информация, букинг настройки, оборудование, портфолио, ценообразование
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Music, MapPin, Globe, Camera, Link2, Headphones, DollarSign,
  Calendar, Settings, Award, Save, Plus, X, ChevronDown, ChevronRight,
  Instagram, MessageCircle, Phone, Mail, FileText, Wrench, HelpCircle,
  Sparkles, Tag, Clock, Zap, Shield, Eye, Edit3, CheckCircle2, AlertCircle
} from 'lucide-react';

// Profile tabs
type ProfileTab = 'basic' | 'booking' | 'equipment' | 'portfolio' | 'pricing' | 'addons' | 'faq' | 'contacts';

export function DjProfileEditor() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Profile data
  const [profile, setProfile] = useState({
    djName: 'DJ Pulse',
    bio: 'Профессиональный диджей с 8-летним опытом. Специализация: deep house, tech house, melodic techno. Резидент клубов Pravda и Gazgolder.',
    bioShort: 'Deep House / Tech House DJ | 8 лет опыта',
    city: 'Москва',
    country: 'Россия',
    genres: ['Deep House', 'Tech House', 'Melodic Techno', 'Progressive House'],
    availableForTravel: true,
    travelRegions: ['Москва и МО', 'Санкт-Петербург', 'Сочи', 'Казань'],
    specializations: ['Клубный DJ', 'Корпоративный DJ', 'Свадебный DJ', 'Фестивальный DJ'],
    openForBookings: true,
    ratePerHour: 8000,
    ratePerEvent: 35000,
    minBookingHours: 3,
    equipmentIncluded: true,
    depositRequired: true,
    depositPercentage: 30,
    verified: true,
  });

  // Equipment list
  const equipment = [
    { name: 'Pioneer CDJ-3000', type: 'Плееры', count: 2 },
    { name: 'Pioneer DJM-900NXS2', type: 'Микшер', count: 1 },
    { name: 'Pioneer RMX-1000', type: 'Эффекты', count: 1 },
    { name: 'QSC K12.2', type: 'Акустика', count: 2 },
    { name: 'Sennheiser HD 25', type: 'Наушники', count: 1 },
  ];

  // Addons
  const addons = [
    { name: 'Расширенный сет (5+ часов)', price: 5000, perHour: true },
    { name: 'Световое оборудование', price: 15000, perHour: false },
    { name: 'Звуковое оборудование', price: 20000, perHour: false },
    { name: 'MC/Ведущий', price: 10000, perHour: false },
    { name: 'Визуальное шоу (VJ)', price: 25000, perHour: false },
  ];

  // Dynamic pricing
  const dynamicPricing = [
    { name: 'Выходные (Пт-Сб)', multiplier: 1.3 },
    { name: 'Праздники (Новый год, 8 марта)', multiplier: 2.0 },
    { name: 'Свадьбы', multiplier: 1.5 },
    { name: 'Корпоративы', multiplier: 1.4 },
    { name: 'Высокий сезон (июнь-август)', multiplier: 1.2 },
  ];

  const tabs: { id: ProfileTab; label: string; icon: typeof User }[] = [
    { id: 'basic', label: 'Основное', icon: User },
    { id: 'booking', label: 'Букинг', icon: Calendar },
    { id: 'pricing', label: 'Цены', icon: DollarSign },
    { id: 'addons', label: 'Услуги', icon: Plus },
    { id: 'equipment', label: 'Оборудование', icon: Wrench },
    { id: 'portfolio', label: 'Портфолио', icon: Music },
    { id: 'contacts', label: 'Контакты', icon: Phone },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsSaving(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl lg:text-2xl xl:text-3xl font-black text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-400" />
            Редактор профиля
          </h1>
          <p className="text-xs lg:text-sm text-gray-400 mt-1">Настройте свой публичный профиль DJ</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Превью
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-xs lg:text-sm font-bold shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </motion.button>
        </div>
      </motion.div>

      {/* Profile Card Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/10"
      >
        <div className="flex items-start gap-4 lg:gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl lg:text-2xl font-black">
              DJ
            </div>
            <button className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </button>
            {profile.verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-white" />
              </div>
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg lg:text-xl font-black text-white">{profile.djName}</h2>
              {profile.verified && (
                <span className="px-2 py-0.5 bg-cyan-500/20 rounded-full text-[10px] font-bold text-cyan-400">Verified</span>
              )}
            </div>
            <p className="text-xs lg:text-sm text-gray-400 mb-2">{profile.bioShort}</p>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-[10px] lg:text-xs text-gray-500">
                <MapPin className="w-3 h-3" /> {profile.city}, {profile.country}
              </span>
              <span className="flex items-center gap-1 text-[10px] lg:text-xs text-gray-500">
                <DollarSign className="w-3 h-3" /> от {profile.ratePerHour.toLocaleString()} ₽/час
              </span>
              <span className="flex items-center gap-1 text-[10px] lg:text-xs text-green-400">
                <Calendar className="w-3 h-3" /> Открыт для букинга
              </span>
            </div>
          </div>
        </div>
        {/* Genres */}
        <div className="mt-3 lg:mt-4 flex flex-wrap gap-1.5">
          {profile.genres.map((genre) => (
            <span key={genre} className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[10px] lg:text-xs font-bold text-cyan-300">
              {genre}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/10"
        >
          {/* BASIC */}
          {activeTab === 'basic' && (
            <div className="space-y-4 lg:space-y-5">
              <h3 className="text-base lg:text-lg font-bold text-white">Основная информация</h3>
              <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">Сценическое имя</label>
                  <input
                    type="text"
                    value={profile.djName}
                    onChange={(e) => setProfile({ ...profile, djName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">Город</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">Краткое описание</label>
                <input
                  type="text"
                  value={profile.bioShort}
                  onChange={(e) => setProfile({ ...profile, bioShort: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">Полная биография</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">Жанры</label>
                <div className="flex flex-wrap gap-2">
                  {profile.genres.map((genre) => (
                    <span key={genre} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300">
                      {genre}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors" />
                    </span>
                  ))}
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 border-dashed rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all">
                    <Plus className="w-3 h-3" /> Добавить
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">Специализации</label>
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec) => (
                    <span key={spec} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-300">
                      {spec}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors" />
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs lg:text-sm text-white font-medium">Готов к выездам</span>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, availableForTravel: !profile.availableForTravel })}
                  className={`w-10 h-5 rounded-full transition-all ${profile.availableForTravel ? 'bg-cyan-500' : 'bg-white/20'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${profile.availableForTravel ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}

          {/* BOOKING */}
          {activeTab === 'booking' && (
            <div className="space-y-4 lg:space-y-5">
              <h3 className="text-base lg:text-lg font-bold text-white">Настройки букинга</h3>
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-white font-bold">Открыт для букинга</span>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, openForBookings: !profile.openForBookings })}
                  className={`w-12 h-6 rounded-full transition-all ${profile.openForBookings ? 'bg-green-500' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${profile.openForBookings ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">Ставка за час (₽)</label>
                  <input
                    type="number"
                    value={profile.ratePerHour}
                    onChange={(e) => setProfile({ ...profile, ratePerHour: +e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">Ставка за мероприятие (₽)</label>
                  <input
                    type="number"
                    value={profile.ratePerEvent}
                    onChange={(e) => setProfile({ ...profile, ratePerEvent: +e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">Мин. часов для заказа</label>
                  <input
                    type="number"
                    value={profile.minBookingHours}
                    onChange={(e) => setProfile({ ...profile, minBookingHours: +e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">Размер депозита (%)</label>
                  <input
                    type="number"
                    value={profile.depositPercentage}
                    onChange={(e) => setProfile({ ...profile, depositPercentage: +e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Оборудование включено в стоимость', checked: profile.equipmentIncluded },
                  { label: 'Требуется депозит', checked: profile.depositRequired },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-xs lg:text-sm text-white">{item.label}</span>
                    <div className={`w-10 h-5 rounded-full ${item.checked ? 'bg-cyan-500' : 'bg-white/20'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 lg:space-y-5">
              <h3 className="text-base lg:text-lg font-bold text-white">Динамическое ценообразование</h3>
              <p className="text-xs lg:text-sm text-gray-400">Автоматическая корректировка цен в зависимости от типа мероприятия и времени</p>
              <div className="space-y-2">
                {dynamicPricing.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <span className="text-xs lg:text-sm text-white font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs lg:text-sm font-bold text-cyan-400">x{item.multiplier}</span>
                      <span className="text-[10px] text-gray-500">
                        = {Math.round(profile.ratePerHour * item.multiplier).toLocaleString()} ₽/час
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs lg:text-sm text-white font-bold mb-1">Как это работает?</p>
                    <p className="text-[10px] lg:text-xs text-gray-400">
                      Множители автоматически применяются к вашей базовой ставке при создании букинга. 
                      Клиент видит финальную цену с учётом всех множителей.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADDONS */}
          {activeTab === 'addons' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base lg:text-lg font-bold text-white">Дополнительные услуги</h3>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors">
                  <Plus className="w-3 h-3" /> Добавить
                </button>
              </div>
              <div className="space-y-2">
                {addons.map((addon) => (
                  <div key={addon.name} className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm text-white font-medium">{addon.name}</p>
                        <p className="text-[10px] text-gray-500">{addon.perHour ? 'За каждый доп. час' : 'Фиксированная стоимость'}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white">{addon.price.toLocaleString()} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EQUIPMENT */}
          {activeTab === 'equipment' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base lg:text-lg font-bold text-white">Моё оборудование</h3>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors">
                  <Plus className="w-3 h-3" /> Добавить
                </button>
              </div>
              <div className="space-y-2">
                {equipment.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm text-white font-medium">{item.name}</p>
                        <p className="text-[10px] text-gray-500">{item.type}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-400">x{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-dashed border-white/10">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400">
                    Указание вашего оборудования повышает доверие клиентов и помогает заведениям подготовить техническую часть.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4 lg:space-y-5">
              <h3 className="text-base lg:text-lg font-bold text-white">Портфолио и медиа</h3>
              <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
                {[
                  { label: 'Промо-миксы', count: 12, icon: Headphones, color: 'from-cyan-500 to-blue-500' },
                  { label: 'Лайв-сеты', count: 5, icon: Music, color: 'from-purple-500 to-pink-500' },
                  { label: 'Радио-шоу', count: 3, icon: Headphones, color: 'from-green-500 to-emerald-500' },
                  { label: 'Видео', count: 8, icon: Eye, color: 'from-orange-500 to-red-500' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-bold">{item.label}</p>
                          <p className="text-[10px] text-gray-500">{item.count} файлов</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                  );
                })}
              </div>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-colors cursor-pointer group">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2 group-hover:text-cyan-400 transition-colors" />
                <p className="text-xs lg:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  Перетащите файлы или нажмите для загрузки
                </p>
                <p className="text-[10px] text-gray-600 mt-1">MP3, WAV, MP4, JPG, PNG до 500MB</p>
              </div>
            </div>
          )}

          {/* CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4 lg:space-y-5">
              <h3 className="text-base lg:text-lg font-bold text-white">Контактная информация</h3>
              <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
                {[
                  { icon: Mail, label: 'Email', value: 'booking@djpulse.ru' },
                  { icon: Phone, label: 'Телефон', value: '+7 (999) 123-45-67' },
                  { icon: MessageCircle, label: 'Telegram', value: '@djpulse' },
                  { icon: Instagram, label: 'Instagram', value: '@djpulse_official' },
                ].map((contact) => {
                  const Icon = contact.icon;
                  return (
                    <div key={contact.label} className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mb-1.5">
                        <Icon className="w-3 h-3" /> {contact.label}
                      </label>
                      <input
                        type="text"
                        defaultValue={contact.value}
                        className="w-full bg-transparent text-sm text-white focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 mb-2">Контактные лица</h4>
                <div className="space-y-2">
                  {[
                    { role: 'Букинг-агент', name: 'Андрей Смирнов', phone: '+7 (999) 111-22-33' },
                    { role: 'PR-менеджер', name: 'Мария Иванова', phone: '+7 (999) 444-55-66' },
                  ].map((person) => (
                    <div key={person.role} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-xs text-white font-medium">{person.name}</p>
                        <p className="text-[10px] text-gray-500">{person.role}</p>
                      </div>
                      <span className="text-[10px] text-gray-400">{person.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base lg:text-lg font-bold text-white">Часто задаваемые вопросы</h3>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors">
                  <Plus className="w-3 h-3" /> Добавить
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { q: 'Какие жанры вы играете?', a: 'Deep house, tech house, melodic techno, progressive house. Могу адаптировать программу под мероприятие.' },
                  { q: 'Предоставляете ли вы оборудование?', a: 'Да, полный комплект оборудования включён в стоимость. Также могу работать на оборудовании площадки.' },
                  { q: 'Как происходит оплата?', a: 'Депозит 30% при подтверждении букинга. Остаток - в день мероприятия или на следующий рабочий день.' },
                ].map((faq, i) => (
                  <div key={i} className="p-3 lg:p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs lg:text-sm text-white font-bold mb-1">{faq.q}</p>
                    <p className="text-[10px] lg:text-xs text-gray-400">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}