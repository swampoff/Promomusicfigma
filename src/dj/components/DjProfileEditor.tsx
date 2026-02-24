/**
 * DJ PROFILE EDITOR - Редактор профиля диджея
 * Основная информация, букинг настройки, оборудование, портфолио, ценообразование
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  User, Music, MapPin, Globe, Camera, Link2, Headphones, DollarSign,
  Calendar, Save, Plus, X, ChevronRight,
  Instagram, MessageCircle, Phone, Mail, Wrench, HelpCircle,
  Sparkles, Tag, Clock, Shield, Eye, Edit3, CheckCircle2, AlertCircle,
  Upload, Trash2, Play, ExternalLink, Video, Mic,
  Check, Percent, Loader2
} from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/dj-studio`;

type ProfileTab = 'basic' | 'booking' | 'equipment' | 'portfolio' | 'pricing' | 'addons' | 'faq' | 'contacts';

interface EquipmentItem { id: string; name: string; type: string; count: number; }
interface ContactPerson { id: string; role: string; name: string; phone: string; }
interface PortfolioFile { id: string; name: string; duration?: string; date: string; plays?: number; size?: string; }
interface PortfolioCategory { id: string; label: string; icon: typeof Headphones; color: string; files: PortfolioFile[]; }
interface AddonItem { id: string; name: string; price: number; perHour: boolean; enabled: boolean; }
interface PricingRule { id: string; name: string; multiplier: number; enabled: boolean; }
interface FaqItem { id: string; q: string; a: string; }

const EQUIPMENT_TYPES = ['Плееры', 'Микшер', 'Эффекты', 'Акустика', 'Наушники', 'Контроллер', 'Освещение', 'Кабели', 'Другое'];

const GENRE_SUGGESTIONS = [
  'Deep House', 'Tech House', 'Melodic Techno', 'Progressive House', 'Minimal',
  'Afro House', 'Indie Dance', 'Disco', 'Nu Disco', 'Organic House',
  'Trance', 'Drum & Bass', 'Dubstep', 'Future Bass', 'Trap',
  'Hip-Hop', 'R&B', 'Pop', 'Electro', 'Breaks', 'Downtempo',
];

const SPEC_SUGGESTIONS = [
  'Клубный DJ', 'Корпоративный DJ', 'Свадебный DJ', 'Фестивальный DJ',
  'Бар/Лаунж DJ', 'Open Format DJ', 'Резидент', 'Продюсер',
  'Виниловый DJ', 'Скретч DJ', 'MC/Ведущий',
];

export function DjProfileEditor() {
  const { accessToken, userId, isDemoMode, userName } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Заголовки авторизации: реальный токен > anon key fallback
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
      if (userId) headers['X-User-Id'] = userId;
    }
    return headers;
  }, [accessToken, userId]);

  // === BASIC STATE ===
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
    verified: true,
  });
  const [showGenreInput, setShowGenreInput] = useState(false);
  const [newGenre, setNewGenre] = useState('');
  const [showSpecInput, setShowSpecInput] = useState(false);
  const [newSpec, setNewSpec] = useState('');
  const [showRegionInput, setShowRegionInput] = useState(false);
  const [newRegion, setNewRegion] = useState('');

  // === BOOKING STATE ===
  const [booking, setBooking] = useState({
    openForBookings: true,
    ratePerHour: 8000,
    ratePerEvent: 35000,
    minBookingHours: 3,
    maxBookingHours: 10,
    equipmentIncluded: true,
    depositRequired: true,
    depositPercentage: 30,
    advanceNoticeDays: 7,
    cancellationPolicy: 'Бесплатная отмена за 7 дней. При отмене менее чем за 3 дня - удержание 50% депозита.',
    workingDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    selectedDays: ['Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    travelFee: 5000,
    travelFeeEnabled: true,
  });

  // === PRICING STATE ===
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    { id: '1', name: 'Выходные (Пт-Сб)', multiplier: 1.3, enabled: true },
    { id: '2', name: 'Праздники (Новый год, 8 марта)', multiplier: 2.0, enabled: true },
    { id: '3', name: 'Свадьбы', multiplier: 1.5, enabled: true },
    { id: '4', name: 'Корпоративы', multiplier: 1.4, enabled: true },
    { id: '5', name: 'Высокий сезон (июнь-август)', multiplier: 1.2, enabled: true },
  ]);
  const [showAddPricing, setShowAddPricing] = useState(false);
  const [newPricing, setNewPricing] = useState({ name: '', multiplier: 1.5 });
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);

  // === ADDONS STATE ===
  const [addonsList, setAddonsList] = useState<AddonItem[]>([
    { id: '1', name: 'Расширенный сет (5+ часов)', price: 5000, perHour: true, enabled: true },
    { id: '2', name: 'Световое оборудование', price: 15000, perHour: false, enabled: true },
    { id: '3', name: 'Звуковое оборудование', price: 20000, perHour: false, enabled: true },
    { id: '4', name: 'MC/Ведущий', price: 10000, perHour: false, enabled: true },
    { id: '5', name: 'Визуальное шоу (VJ)', price: 25000, perHour: false, enabled: false },
  ]);
  const [showAddAddon, setShowAddAddon] = useState(false);
  const [newAddon, setNewAddon] = useState({ name: '', price: 0, perHour: false });
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);

  // === CONTACTS STATE ===
  const [contacts, setContacts] = useState({
    email: 'booking@djpulse.ru',
    phone: '+7 (999) 123-45-67',
    telegram: '@djpulse',
    instagram: '@djpulse_official',
    website: '',
    vk: '',
  });
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([
    { id: '1', role: 'Букинг-агент', name: 'Андрей Смирнов', phone: '+7 (999) 111-22-33' },
    { id: '2', role: 'PR-менеджер', name: 'Мария Иванова', phone: '+7 (999) 444-55-66' },
  ]);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPerson, setNewPerson] = useState<Omit<ContactPerson, 'id'>>({ role: '', name: '', phone: '' });
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [contactsDirty, setContactsDirty] = useState(false);

  // === EQUIPMENT STATE ===
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([
    { id: '1', name: 'Pioneer CDJ-3000', type: 'Плееры', count: 2 },
    { id: '2', name: 'Pioneer DJM-900NXS2', type: 'Микшер', count: 1 },
    { id: '3', name: 'Pioneer RMX-1000', type: 'Эффекты', count: 1 },
    { id: '4', name: 'QSC K12.2', type: 'Акустика', count: 2 },
    { id: '5', name: 'Sennheiser HD 25', type: 'Наушники', count: 1 },
  ]);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [newEquipment, setNewEquipment] = useState({ name: '', type: EQUIPMENT_TYPES[0], count: 1 });
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  // === PORTFOLIO STATE ===
  const [portfolioCategories, setPortfolioCategories] = useState<PortfolioCategory[]>([
    {
      id: 'mixes', label: 'Промо-миксы', icon: Headphones, color: 'from-cyan-500 to-blue-500',
      files: [
        { id: 'm1', name: 'Summer Vibes Mix 2025', duration: '1:12:30', date: '2025-06-15', plays: 3420 },
        { id: 'm2', name: 'Deep Night Session Vol.4', duration: '58:45', date: '2025-05-22', plays: 2180 },
        { id: 'm3', name: 'Melodic Journey', duration: '1:05:10', date: '2025-04-10', plays: 5670 },
        { id: 'm4', name: 'Afterhours Podcast #12', duration: '1:30:00', date: '2025-03-01', plays: 1890 },
      ]
    },
    {
      id: 'live', label: 'Лайв-сеты', icon: Music, color: 'from-purple-500 to-pink-500',
      files: [
        { id: 'l1', name: 'Pravda Club - NYE 2025', duration: '2:30:00', date: '2025-01-01', plays: 8900 },
        { id: 'l2', name: 'Gazgolder Rooftop Session', duration: '1:45:00', date: '2025-07-20', plays: 4350 },
        { id: 'l3', name: 'Mutabor - Tech Night', duration: '1:20:00', date: '2025-06-08', plays: 3210 },
      ]
    },
    {
      id: 'radio', label: 'Радио-шоу', icon: Mic, color: 'from-green-500 to-emerald-500',
      files: [
        { id: 'r1', name: 'ПРОМО.ЭИР Weekly #45', duration: '1:00:00', date: '2025-08-12', plays: 1560 },
        { id: 'r2', name: 'ПРОМО.ЭИР Weekly #44', duration: '1:00:00', date: '2025-08-05', plays: 1320 },
      ]
    },
    {
      id: 'video', label: 'Видео', icon: Video, color: 'from-orange-500 to-red-500',
      files: [
        { id: 'v1', name: 'Promo Reel 2025', duration: '3:20', date: '2025-01-15', plays: 12400, size: '245 MB' },
        { id: 'v2', name: 'Live @ Pravda Club', duration: '15:30', date: '2025-04-22', plays: 6780, size: '890 MB' },
        { id: 'v3', name: 'Behind The Decks Ep.1', duration: '8:45', date: '2025-06-30', plays: 3450, size: '420 MB' },
      ]
    },
  ]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showAddFile, setShowAddFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  // === FAQ STATE ===
  const [faqList, setFaqList] = useState<FaqItem[]>([
    { id: '1', q: 'Какие жанры вы играете?', a: 'Deep house, tech house, melodic techno, progressive house. Могу адаптировать программу под мероприятие.' },
    { id: '2', q: 'Предоставляете ли вы оборудование?', a: 'Да, полный комплект оборудования включён в стоимость. Также могу работать на оборудовании площадки.' },
    { id: '3', q: 'Как происходит оплата?', a: 'Депозит 30% при подтверждении букинга. Остаток - в день мероприятия или на следующий рабочий день.' },
  ]);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  const tabs: { id: ProfileTab; label: string; icon: typeof User }[] = [
    { id: 'basic', label: 'Основное', icon: User },
    { id: 'booking', label: 'Букинг', icon: Calendar },
    { id: 'pricing', label: 'Цены', icon: DollarSign },
    { id: 'addons', label: 'Услуги', icon: Tag },
    { id: 'equipment', label: 'Оборудование', icon: Wrench },
    { id: 'portfolio', label: 'Портфолио', icon: Music },
    { id: 'contacts', label: 'Контакты', icon: Phone },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  // Собрать все данные в единый объект для сохранения
  const gatherAllData = useCallback(() => ({
    profile,
    booking,
    contacts,
    contactPersons,
    equipmentList,
    portfolioCategories: portfolioCategories.map(c => ({ ...c, icon: undefined })),
    pricingRules,
    addonsList,
    faqList,
  }), [profile, booking, contacts, contactPersons, equipmentList, portfolioCategories, pricingRules, addonsList, faqList]);

  // Загрузить профиль при монтировании
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);
        const res = await fetch(`${API_BASE}/profile`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (d.profile) setProfile(d.profile);
          if (d.booking) setBooking(d.booking);
          if (d.contacts) setContacts(d.contacts);
          if (d.contactPersons) setContactPersons(d.contactPersons);
          if (d.equipmentList) setEquipmentList(d.equipmentList);
          if (d.pricingRules) setPricingRules(d.pricingRules);
          if (d.addonsList) setAddonsList(d.addonsList);
          if (d.faqList) setFaqList(d.faqList);
          if (d.portfolioCategories) {
            // Восстанавливаем иконки по id категории
            const iconMap: Record<string, typeof Headphones> = { mixes: Headphones, live: Music, radio: Mic, video: Video };
            const colorMap: Record<string, string> = { mixes: 'from-cyan-500 to-blue-500', live: 'from-purple-500 to-pink-500', radio: 'from-green-500 to-emerald-500', video: 'from-orange-500 to-red-500' };
            setPortfolioCategories(d.portfolioCategories.map((cat: any) => ({
              ...cat,
              icon: iconMap[cat.id] || Headphones,
              color: cat.color || colorMap[cat.id] || 'from-cyan-500 to-blue-500',
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load DJ profile:', err);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [getAuthHeaders]);

  // Помечать, что есть несохранённые изменения
  const markDirty = useCallback(() => { setHasUnsaved(true); setSaveSuccess(false); }, []);

  // Автоотслеживание изменений в booking (inline onChange в JSX)
  const loadedRef = React.useRef(false);
  // Сброс при начале перезагрузки (смена аккаунта)
  useEffect(() => {
    if (isLoading) loadedRef.current = false;
  }, [isLoading]);
  useEffect(() => {
    // Пропускаем все изменения до завершения начальной загрузки + 1 тик
    if (isLoading) return;
    if (!loadedRef.current) { loadedRef.current = true; return; }
    markDirty();
  }, [booking, isLoading, markDirty]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = gatherAllData();
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Unknown error');
      setSaveSuccess(true);
      setHasUnsaved(false);
      setContactsDirty(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save DJ profile:', err);
      toast.error('Не удалось сохранить профиль. Попробуйте ещё раз.');
    } finally {
      setIsSaving(false);
    }
  };

  // === BASIC HANDLERS ===
  const addGenre = (g?: string) => {
    const genre = (g || newGenre).trim();
    if (!genre || profile.genres.includes(genre)) return;
    setProfile(p => ({ ...p, genres: [...p.genres, genre] })); markDirty();
    setNewGenre('');
    if (!g) setShowGenreInput(false);
  };
  const removeGenre = (g: string) => { setProfile(p => ({ ...p, genres: p.genres.filter(x => x !== g) })); markDirty(); };
  const addSpec = (s?: string) => {
    const spec = (s || newSpec).trim();
    if (!spec || profile.specializations.includes(spec)) return;
    setProfile(p => ({ ...p, specializations: [...p.specializations, spec] })); markDirty();
    setNewSpec('');
    if (!s) setShowSpecInput(false);
  };
  const removeSpec = (s: string) => { setProfile(p => ({ ...p, specializations: p.specializations.filter(x => x !== s) })); markDirty(); };
  const addRegion = () => {
    if (!newRegion.trim() || profile.travelRegions.includes(newRegion.trim())) return;
    setProfile(p => ({ ...p, travelRegions: [...p.travelRegions, newRegion.trim()] })); markDirty();
    setNewRegion('');
    setShowRegionInput(false);
  };
  const removeRegion = (r: string) => { setProfile(p => ({ ...p, travelRegions: p.travelRegions.filter(x => x !== r) })); markDirty(); };

  // === PRICING HANDLERS ===
  const addPricingRule = () => {
    if (!newPricing.name.trim()) return;
    setPricingRules(prev => [...prev, { id: Date.now().toString(), name: newPricing.name.trim(), multiplier: newPricing.multiplier, enabled: true }]); markDirty();
    setNewPricing({ name: '', multiplier: 1.5 });
    setShowAddPricing(false);
  };
  const deletePricingRule = (id: string) => { setPricingRules(prev => prev.filter(r => r.id !== id)); markDirty(); };
  const togglePricingRule = (id: string) => { setPricingRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)); markDirty(); };
  const updatePricingRule = (id: string, field: 'name' | 'multiplier', value: string | number) => {
    setPricingRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r)); markDirty();
  };

  // === ADDON HANDLERS ===
  const addAddon = () => {
    if (!newAddon.name.trim() || newAddon.price <= 0) return;
    setAddonsList(prev => [...prev, { id: Date.now().toString(), ...newAddon, name: newAddon.name.trim(), enabled: true }]); markDirty();
    setNewAddon({ name: '', price: 0, perHour: false });
    setShowAddAddon(false);
  };
  const deleteAddon = (id: string) => { setAddonsList(prev => prev.filter(a => a.id !== id)); markDirty(); };
  const toggleAddon = (id: string) => { setAddonsList(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)); markDirty(); };
  const updateAddon = (id: string, field: keyof AddonItem, value: string | number | boolean) => {
    setAddonsList(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a)); markDirty();
  };

  // === EQUIPMENT HANDLERS ===
  const addEquipment = () => {
    if (!newEquipment.name.trim()) return;
    setEquipmentList(prev => [...prev, { id: Date.now().toString(), name: newEquipment.name.trim(), type: newEquipment.type, count: newEquipment.count }]); markDirty();
    setNewEquipment({ name: '', type: EQUIPMENT_TYPES[0], count: 1 });
    setShowAddEquipment(false);
  };
  const deleteEquipment = (id: string) => { setEquipmentList(prev => prev.filter(e => e.id !== id)); markDirty(); };
  const updateEquipment = (id: string, field: keyof EquipmentItem, value: string | number) => {
    setEquipmentList(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e)); markDirty();
  };

  // === CONTACT HANDLERS ===
  const addContactPerson = () => {
    if (!newPerson.name.trim() || !newPerson.role.trim()) return;
    setContactPersons(prev => [...prev, { ...newPerson, id: Date.now().toString() }]); markDirty();
    setNewPerson({ role: '', name: '', phone: '' });
    setShowAddPerson(false);
    setContactsDirty(true);
  };
  const deleteContactPerson = (id: string) => { setContactPersons(prev => prev.filter(p => p.id !== id)); setContactsDirty(true); markDirty(); };
  const updateContactPerson = (id: string, field: keyof Omit<ContactPerson, 'id'>, value: string) => {
    setContactPersons(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    setContactsDirty(true); markDirty();
  };

  // === PORTFOLIO HANDLERS ===
  const toggleCategory = (id: string) => { setExpandedCategory(prev => prev === id ? null : id); setShowAddFile(null); };
  const addPortfolioFile = (categoryId: string) => {
    if (!newFileName.trim()) return;
    setPortfolioCategories(prev => prev.map(cat => cat.id !== categoryId ? cat : {
      ...cat, files: [...cat.files, { id: Date.now().toString(), name: newFileName.trim(), duration: '0:00', date: new Date().toISOString().split('T')[0], plays: 0 }]
    })); markDirty();
    setNewFileName('');
    setShowAddFile(null);
  };
  const deletePortfolioFile = (categoryId: string, fileId: string) => {
    setPortfolioCategories(prev => prev.map(cat => cat.id !== categoryId ? cat : { ...cat, files: cat.files.filter(f => f.id !== fileId) })); markDirty();
  };

  // === FAQ HANDLERS ===
  const addFaqItem = () => {
    if (!newFaq.q.trim() || !newFaq.a.trim()) return;
    setFaqList(prev => [...prev, { id: Date.now().toString(), q: newFaq.q.trim(), a: newFaq.a.trim() }]); markDirty();
    setNewFaq({ q: '', a: '' });
    setShowAddFaq(false);
  };
  const deleteFaqItem = (id: string) => { setFaqList(prev => prev.filter(f => f.id !== id)); markDirty(); };
  const updateFaqItem = (id: string, field: 'q' | 'a', value: string) => {
    setFaqList(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f)); markDirty();
  };

  // Reusable toggle component
  const Toggle = ({ checked, onChange, size = 'sm' }: { checked: boolean; onChange: () => void; size?: 'sm' | 'md' }) => {
    const w = size === 'md' ? 'w-12 h-6' : 'w-10 h-5';
    const dot = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
    const on = size === 'md' ? 'translate-x-6.5' : 'translate-x-5.5';
    return (
      <div onClick={onChange} className={`${w} rounded-full cursor-pointer transition-all ${checked ? 'bg-cyan-500' : 'bg-white/20'}`} role="button">
        <div className={`${dot} rounded-full bg-white shadow-sm transition-transform ${checked ? on : 'translate-x-0.5'}`} />
      </div>
    );
  };

  // Available genre suggestions (not yet added)
  const availableGenres = GENRE_SUGGESTIONS.filter(g => !profile.genres.includes(g));
  const availableSpecs = SPEC_SUGGESTIONS.filter(s => !profile.specializations.includes(s));

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
        <p className="text-sm text-gray-400">Загрузка профиля...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-8 h-8 text-amber-400 mb-4" />
        <p className="text-sm text-gray-400 mb-1">Не удалось загрузить профиль с сервера</p>
        <p className="text-xs text-gray-500 mb-4">Данные будут сохранены при первом нажатии «Сохранить»</p>
        <div onClick={() => setLoadError(false)} role="button"
          className="px-4 py-2 bg-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors cursor-pointer">
          Продолжить с данными по умолчанию
        </div>
      </div>
    );
  }

  // Save button for inside tabs
  const TabSaveButton = () => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleSave}
      role="button"
      className={`mt-4 w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer select-none transition-all ${
        isSaving ? 'bg-gray-500/20 text-gray-400 pointer-events-none' :
        hasUnsaved ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20' :
        'bg-white/5 text-gray-500 border border-white/10'
      }`}
    >
      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {isSaving ? 'Сохранение...' : hasUnsaved ? 'Сохранить изменения' : 'Все данные сохранены'}
    </motion.div>
  );

  return (
    <div className="space-y-3 xs:space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4"
      >
        <div>
          <h1 className="text-lg xs:text-xl lg:text-2xl xl:text-3xl font-black text-white flex items-center gap-1.5 xs:gap-2">
            <Edit3 className="w-4 h-4 xs:w-5 xs:h-5 lg:w-6 lg:h-6 text-cyan-400" />
            Редактор профиля
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] xs:text-xs lg:text-sm text-gray-400">Настройте свой публичный профиль DJ</p>
            {isDemoMode && (
              <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-[10px] font-bold text-amber-400">
                Демо
              </span>
            )}
            {!isDemoMode && userName && (
              <span className="px-2 py-0.5 bg-green-500/15 border border-green-500/30 rounded-lg text-[10px] font-bold text-green-400">
                {userName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-xl"
              >
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-bold text-green-400">Сохранено</span>
              </motion.div>
            )}
            {hasUnsaved && !saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">Не сохранено</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer" role="button">
            <Eye className="w-3.5 h-3.5" /> Превью
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            role="button"
            className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer select-none ${
              isSaving ? 'bg-gray-600 opacity-50 pointer-events-none shadow-none' :
              hasUnsaved ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/30' :
              'bg-white/10 shadow-none text-gray-400'
            }`}
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </motion.div>
        </div>
      </motion.div>

      {/* Profile Card Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl rounded-lg xs:rounded-xl lg:rounded-2xl p-3 xs:p-4 lg:p-6 border border-white/10"
      >
        <div className="flex items-start gap-3 xs:gap-4 lg:gap-5">
          <div className="relative group">
            <div className="w-14 h-14 xs:w-16 xs:h-16 lg:w-20 lg:h-20 rounded-xl xs:rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg xs:text-xl lg:text-2xl font-black">DJ</div>
            <div className="absolute inset-0 rounded-xl xs:rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
            </div>
            {profile.verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg lg:text-xl font-black text-white">{profile.djName}</h2>
              {profile.verified && <span className="px-2 py-0.5 bg-cyan-500/20 rounded-full text-[10px] font-bold text-cyan-400">Verified</span>}
            </div>
            <p className="text-xs lg:text-sm text-gray-400 mb-2">{profile.bioShort}</p>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-[10px] lg:text-xs text-gray-500"><MapPin className="w-3 h-3" /> {profile.city}, {profile.country}</span>
              <span className="flex items-center gap-1 text-[10px] lg:text-xs text-gray-500"><DollarSign className="w-3 h-3" /> от {booking.ratePerHour.toLocaleString()} ₽/час</span>
              <span className={`flex items-center gap-1 text-[10px] lg:text-xs ${booking.openForBookings ? 'text-green-400' : 'text-red-400'}`}>
                <Calendar className="w-3 h-3" /> {booking.openForBookings ? 'Открыт для букинга' : 'Закрыт для букинга'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 lg:mt-4 flex flex-wrap gap-1.5">
          {profile.genres.map(genre => (
            <span key={genre} className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[10px] lg:text-xs font-bold text-cyan-300">{genre}</span>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)} role="button"
              className={`flex items-center gap-1.5 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold whitespace-nowrap transition-all cursor-pointer select-none ${
                isActive ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}>
              <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              {tab.label}
            </div>
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

          {/* ====== BASIC ====== */}
          {activeTab === 'basic' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="text-base lg:text-lg font-bold text-white">Основная информация</div>

              <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">Сценическое имя</label>
                  <input type="text" value={profile.djName} onChange={e => { setProfile({ ...profile, djName: e.target.value }); markDirty(); }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-1.5 block">Город</label>
                    <input type="text" value={profile.city} onChange={e => { setProfile({ ...profile, city: e.target.value }); markDirty(); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-1.5 block">Страна</label>
                    <input type="text" value={profile.country} onChange={e => { setProfile({ ...profile, country: e.target.value }); markDirty(); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-400">Краткое описание</label>
                  <span className={`text-[10px] ${profile.bioShort.length > 80 ? 'text-amber-400' : 'text-gray-600'}`}>{profile.bioShort.length}/100</span>
                </div>
                <input type="text" value={profile.bioShort} maxLength={100} onChange={e => { setProfile({ ...profile, bioShort: e.target.value }); markDirty(); }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-400">Полная биография</label>
                  <span className={`text-[10px] ${profile.bio.length > 450 ? 'text-amber-400' : 'text-gray-600'}`}>{profile.bio.length}/500</span>
                </div>
                <textarea value={profile.bio} maxLength={500} onChange={e => { setProfile({ ...profile, bio: e.target.value }); markDirty(); }} rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors resize-none" />
              </div>

              {/* Genres with add */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">Жанры <span className="text-gray-600 font-normal">({profile.genres.length})</span></label>
                <div className="flex flex-wrap gap-2">
                  {profile.genres.map(genre => (
                    <span key={genre} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300">
                      {genre}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors" onClick={() => removeGenre(genre)} />
                    </span>
                  ))}
                  {showGenreInput ? (
                    <div className="flex items-center gap-1">
                      <input type="text" value={newGenre} onChange={e => setNewGenre(e.target.value)} autoFocus placeholder="Название жанра"
                        onKeyDown={e => { if (e.key === 'Enter') addGenre(); if (e.key === 'Escape') setShowGenreInput(false); }}
                        className="bg-white/5 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none w-36" />
                      <div onClick={() => addGenre()} className={`p-1.5 bg-cyan-500 rounded-lg cursor-pointer ${!newGenre.trim() ? 'opacity-40' : ''}`} role="button">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div onClick={() => { setShowGenreInput(false); setNewGenre(''); }} className="p-1.5 bg-white/5 rounded-lg cursor-pointer" role="button">
                        <X className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setShowGenreInput(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 border-dashed rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all cursor-pointer" role="button">
                      <Plus className="w-3 h-3" /> Добавить
                    </div>
                  )}
                </div>
                {/* Quick genre suggestions */}
                {showGenreInput && availableGenres.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex flex-wrap gap-1">
                    {availableGenres.slice(0, 12).map(g => (
                      <span key={g} onClick={() => addGenre(g)} className="px-2 py-1 bg-white/3 border border-white/5 rounded-lg text-[10px] text-gray-500 hover:text-cyan-300 hover:border-cyan-500/20 cursor-pointer transition-all">{g}</span>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Specializations with add */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">Специализации <span className="text-gray-600 font-normal">({profile.specializations.length})</span></label>
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map(spec => (
                    <span key={spec} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-300">
                      {spec}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors" onClick={() => removeSpec(spec)} />
                    </span>
                  ))}
                  {showSpecInput ? (
                    <div className="flex items-center gap-1">
                      <input type="text" value={newSpec} onChange={e => setNewSpec(e.target.value)} autoFocus placeholder="Специализация"
                        onKeyDown={e => { if (e.key === 'Enter') addSpec(); if (e.key === 'Escape') setShowSpecInput(false); }}
                        className="bg-white/5 border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none w-36" />
                      <div onClick={() => addSpec()} className={`p-1.5 bg-purple-500 rounded-lg cursor-pointer ${!newSpec.trim() ? 'opacity-40' : ''}`} role="button">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div onClick={() => { setShowSpecInput(false); setNewSpec(''); }} className="p-1.5 bg-white/5 rounded-lg cursor-pointer" role="button">
                        <X className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setShowSpecInput(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 border-dashed rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:border-purple-500/30 transition-all cursor-pointer" role="button">
                      <Plus className="w-3 h-3" /> Добавить
                    </div>
                  )}
                </div>
                {showSpecInput && availableSpecs.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex flex-wrap gap-1">
                    {availableSpecs.map(s => (
                      <span key={s} onClick={() => addSpec(s)} className="px-2 py-1 bg-white/3 border border-white/5 rounded-lg text-[10px] text-gray-500 hover:text-purple-300 hover:border-purple-500/20 cursor-pointer transition-all">{s}</span>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Travel */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs lg:text-sm text-white font-medium">Готов к выездам</span>
                </div>
                <Toggle checked={profile.availableForTravel} onChange={() => { setProfile({ ...profile, availableForTravel: !profile.availableForTravel }); markDirty(); }} />
              </div>

              {/* Travel regions */}
              {profile.availableForTravel && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">Регионы выездов</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.travelRegions.map(r => (
                      <span key={r} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl text-xs font-bold text-green-300">
                        {r}
                        <X className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors" onClick={() => removeRegion(r)} />
                      </span>
                    ))}
                    {showRegionInput ? (
                      <div className="flex items-center gap-1">
                        <input type="text" value={newRegion} onChange={e => setNewRegion(e.target.value)} autoFocus placeholder="Регион"
                          onKeyDown={e => { if (e.key === 'Enter') addRegion(); if (e.key === 'Escape') setShowRegionInput(false); }}
                          className="bg-white/5 border border-green-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none w-36" />
                        <div onClick={addRegion} className={`p-1.5 bg-green-500 rounded-lg cursor-pointer ${!newRegion.trim() ? 'opacity-40' : ''}`} role="button">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <div onClick={() => { setShowRegionInput(false); setNewRegion(''); }} className="p-1.5 bg-white/5 rounded-lg cursor-pointer" role="button">
                          <X className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => setShowRegionInput(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 border-dashed rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:border-green-500/30 transition-all cursor-pointer" role="button">
                        <Plus className="w-3 h-3" /> Добавить
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              <TabSaveButton />
            </div>
          )}

          {/* ====== BOOKING ====== */}
          {activeTab === 'booking' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="text-base lg:text-lg font-bold text-white">Настройки букинга</div>

              {/* Status */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${booking.openForBookings ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${booking.openForBookings ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className="text-sm text-white font-bold">{booking.openForBookings ? 'Открыт для букинга' : 'Закрыт для букинга'}</span>
                </div>
                <Toggle checked={booking.openForBookings} onChange={() => setBooking({ ...booking, openForBookings: !booking.openForBookings })} size="md" />
              </div>

              {/* Rates */}
              <div>
                <div className="text-xs font-bold text-gray-400 mb-3">Ставки</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Ставка за час (₽)</label>
                    <input type="number" value={booking.ratePerHour} onChange={e => setBooking({ ...booking, ratePerHour: Math.max(0, +e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Ставка за мероприятие (₽)</label>
                    <input type="number" value={booking.ratePerEvent} onChange={e => setBooking({ ...booking, ratePerEvent: Math.max(0, +e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              {/* Duration & notice */}
              <div>
                <div className="text-xs font-bold text-gray-400 mb-3">Длительность и уведомления</div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Мин. часов</label>
                    <input type="number" min={1} value={booking.minBookingHours} onChange={e => setBooking({ ...booking, minBookingHours: Math.max(1, +e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Макс. часов</label>
                    <input type="number" min={1} value={booking.maxBookingHours} onChange={e => setBooking({ ...booking, maxBookingHours: Math.max(1, +e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Уведомление за (дней)</label>
                    <input type="number" min={0} value={booking.advanceNoticeDays} onChange={e => setBooking({ ...booking, advanceNoticeDays: Math.max(0, +e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              {/* Working days */}
              <div>
                <div className="text-xs font-bold text-gray-400 mb-3">Рабочие дни</div>
                <div className="flex gap-2">
                  {booking.workingDays.map(day => {
                    const selected = booking.selectedDays.includes(day);
                    return (
                      <div key={day}
                        onClick={() => setBooking({ ...booking, selectedDays: selected ? booking.selectedDays.filter(d => d !== day) : [...booking.selectedDays, day] })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                          selected ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300' : 'bg-white/5 border border-white/5 text-gray-500 hover:border-white/10'
                        }`} role="button"
                      >{day}</div>
                    );
                  })}
                </div>
              </div>

              {/* Deposit */}
              <div>
                <div className="text-xs font-bold text-gray-400 mb-3">Депозит и оплата</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-xs lg:text-sm text-white">Оборудование включено в стоимость</span>
                    <Toggle checked={booking.equipmentIncluded} onChange={() => setBooking({ ...booking, equipmentIncluded: !booking.equipmentIncluded })} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-xs lg:text-sm text-white">Требуется депозит</span>
                    <Toggle checked={booking.depositRequired} onChange={() => setBooking({ ...booking, depositRequired: !booking.depositRequired })} />
                  </div>
                  {booking.depositRequired && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                      <div className="p-3 bg-white/3 rounded-xl">
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">Размер депозита (%)</label>
                        <div className="flex items-center gap-3">
                          <input type="range" min={10} max={100} step={5} value={booking.depositPercentage}
                            onChange={e => setBooking({ ...booking, depositPercentage: +e.target.value })}
                            className="flex-1 accent-cyan-500" />
                          <span className="text-sm font-bold text-cyan-400 w-12 text-right">{booking.depositPercentage}%</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1">= {Math.round(booking.ratePerEvent * booking.depositPercentage / 100).toLocaleString()} ₽ от ставки за мероприятие</p>
                      </div>
                    </motion.div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <span className="text-xs lg:text-sm text-white">Доплата за выезд</span>
                      {booking.travelFeeEnabled && <span className="text-[10px] text-gray-500 ml-2">({booking.travelFee.toLocaleString()} ₽)</span>}
                    </div>
                    <Toggle checked={booking.travelFeeEnabled} onChange={() => setBooking({ ...booking, travelFeeEnabled: !booking.travelFeeEnabled })} />
                  </div>
                  {booking.travelFeeEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                      <div className="p-3 bg-white/3 rounded-xl">
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">Стоимость выезда (₽)</label>
                        <input type="number" min={0} value={booking.travelFee} onChange={e => setBooking({ ...booking, travelFee: Math.max(0, +e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Cancellation */}
              <div>
                <div className="text-xs font-bold text-gray-400 mb-2">Политика отмены</div>
                <textarea value={booking.cancellationPolicy} onChange={e => setBooking({ ...booking, cancellationPolicy: e.target.value })} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none transition-colors resize-none" />
              </div>
              <TabSaveButton />
            </div>
          )}

          {/* ====== PRICING ====== */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base lg:text-lg font-bold text-white">Динамическое ценообразование</div>
                  <p className="text-xs text-gray-400 mt-0.5">Множители применяются к базовой ставке {booking.ratePerHour.toLocaleString()} ₽/час</p>
                </div>
                <div onClick={() => { setShowAddPricing(true); setEditingPricingId(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors cursor-pointer" role="button">
                  <Plus className="w-3 h-3" /> Добавить
                </div>
              </div>

              {/* Add pricing form */}
              <AnimatePresence>
                {showAddPricing && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300">Новое правило</span>
                        <X className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" onClick={() => setShowAddPricing(false)} />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-gray-500 mb-1 block">Название</label>
                          <input type="text" value={newPricing.name} onChange={e => setNewPricing({ ...newPricing, name: e.target.value })}
                            placeholder="Например: Летние фестивали"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none" />
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">Множитель</label>
                            <input type="number" step={0.1} min={0.5} max={10} value={newPricing.multiplier}
                              onChange={e => setNewPricing({ ...newPricing, multiplier: Math.max(0.5, +e.target.value) })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none" />
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addPricingRule}
                            className={`px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg cursor-pointer ${!newPricing.name.trim() ? 'opacity-40 pointer-events-none' : ''}`} role="button">
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rules list */}
              <div className="space-y-2">
                {pricingRules.map(rule => {
                  const isEditing = editingPricingId === rule.id;
                  return (
                    <motion.div key={rule.id} layout className="group">
                      {isEditing ? (
                        <div className="p-3 lg:p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                          <div className="grid sm:grid-cols-3 gap-2">
                            <input type="text" value={rule.name} onChange={e => updatePricingRule(rule.id, 'name', e.target.value)}
                              className="sm:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none" />
                            <div className="flex gap-2">
                              <input type="number" step={0.1} min={0.5} max={10} value={rule.multiplier}
                                onChange={e => updatePricingRule(rule.id, 'multiplier', Math.max(0.5, +e.target.value))}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none" />
                              <div onClick={() => setEditingPricingId(null)} className="px-3 py-2 bg-cyan-500 rounded-lg cursor-pointer flex items-center" role="button">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-between p-3 lg:p-4 rounded-xl border transition-colors ${rule.enabled ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Toggle checked={rule.enabled} onChange={() => togglePricingRule(rule.id)} />
                            <span className={`text-xs lg:text-sm font-medium truncate ${rule.enabled ? 'text-white' : 'text-gray-500'}`}>{rule.name}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <div className="text-right">
                              <span className="text-xs lg:text-sm font-bold text-cyan-400">x{rule.multiplier}</span>
                              <span className="text-[10px] text-gray-500 ml-2">= {Math.round(booking.ratePerHour * rule.multiplier).toLocaleString()} ₽/час</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div onClick={() => setEditingPricingId(rule.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer" role="button">
                                <Edit3 className="w-3 h-3 text-gray-400" />
                              </div>
                              <div onClick={() => deletePricingRule(rule.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center cursor-pointer" role="button">
                                <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {pricingRules.length === 0 && (
                <div className="text-center py-8">
                  <Percent className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Правила ценообразования не заданы</p>
                  <p className="text-xs text-gray-600 mt-1">Добавьте множители для разных типов мероприятий</p>
                </div>
              )}

              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs lg:text-sm text-white font-bold mb-1">Как это работает?</p>
                    <p className="text-[10px] lg:text-xs text-gray-400">
                      Множители автоматически применяются к вашей базовой ставке при создании букинга.
                      Клиент видит финальную цену с учётом всех множителей. Вы можете временно отключить любое правило.
                    </p>
                  </div>
                </div>
              </div>
              <TabSaveButton />
            </div>
          )}

          {/* ====== ADDONS ====== */}
          {activeTab === 'addons' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base lg:text-lg font-bold text-white">Дополнительные услуги</div>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">
                    {addonsList.filter(a => a.enabled).length} активных из {addonsList.length}
                  </p>
                </div>
                <div onClick={() => { setShowAddAddon(true); setEditingAddonId(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors cursor-pointer" role="button">
                  <Plus className="w-3 h-3" /> Добавить
                </div>
              </div>

              {/* Add addon form */}
              <AnimatePresence>
                {showAddAddon && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300">Новая услуга</span>
                        <X className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" onClick={() => setShowAddAddon(false)} />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 mb-1 block">Название</label>
                          <input type="text" value={newAddon.name} onChange={e => setNewAddon({ ...newAddon, name: e.target.value })}
                            placeholder="Фотограф на мероприятие"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 mb-1 block">Цена (₽)</label>
                          <input type="number" min={0} value={newAddon.price || ''} onChange={e => setNewAddon({ ...newAddon, price: Math.max(0, +e.target.value) })}
                            placeholder="10000"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none" />
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">Тип</label>
                            <select value={newAddon.perHour ? 'hour' : 'fixed'} onChange={e => setNewAddon({ ...newAddon, perHour: e.target.value === 'hour' })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none">
                              <option value="fixed" className="bg-[#0a0a14]">Фикс.</option>
                              <option value="hour" className="bg-[#0a0a14]">За час</option>
                            </select>
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addAddon}
                            className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg cursor-pointer ${(!newAddon.name.trim() || newAddon.price <= 0) ? 'opacity-40 pointer-events-none' : ''}`} role="button">
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Addons list */}
              <div className="space-y-2">
                {addonsList.map(addon => {
                  const isEditing = editingAddonId === addon.id;
                  return (
                    <motion.div key={addon.id} layout className="group">
                      {isEditing ? (
                        <div className="p-3 lg:p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                          <div className="grid sm:grid-cols-3 gap-2">
                            <input type="text" value={addon.name} onChange={e => updateAddon(addon.id, 'name', e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                            <input type="number" min={0} value={addon.price} onChange={e => updateAddon(addon.id, 'price', Math.max(0, +e.target.value))}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                            <div className="flex gap-2">
                              <select value={addon.perHour ? 'hour' : 'fixed'} onChange={e => updateAddon(addon.id, 'perHour', e.target.value === 'hour')}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                                <option value="fixed" className="bg-[#0a0a14]">Фикс.</option>
                                <option value="hour" className="bg-[#0a0a14]">За час</option>
                              </select>
                              <div onClick={() => setEditingAddonId(null)} className="px-3 py-2 bg-purple-500 rounded-lg cursor-pointer flex items-center" role="button">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-between p-3 lg:p-4 rounded-xl border transition-all ${addon.enabled ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                          <div className="flex items-center gap-3">
                            <Toggle checked={addon.enabled} onChange={() => toggleAddon(addon.id)} />
                            <div className={`w-8 h-8 rounded-lg ${addon.enabled ? 'bg-purple-500/20' : 'bg-white/5'} flex items-center justify-center`}>
                              <Tag className={`w-4 h-4 ${addon.enabled ? 'text-purple-400' : 'text-gray-600'}`} />
                            </div>
                            <div>
                              <p className={`text-xs lg:text-sm font-medium ${addon.enabled ? 'text-white' : 'text-gray-500'}`}>{addon.name}</p>
                              <p className="text-[10px] text-gray-500">{addon.perHour ? 'За каждый доп. час' : 'Фиксированная стоимость'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{addon.price.toLocaleString()} ₽</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div onClick={() => setEditingAddonId(addon.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer" role="button">
                                <Edit3 className="w-3 h-3 text-gray-400" />
                              </div>
                              <div onClick={() => deleteAddon(addon.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center cursor-pointer" role="button">
                                <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {addonsList.length === 0 && (
                <div className="text-center py-8">
                  <Tag className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Услуги не добавлены</p>
                  <p className="text-xs text-gray-600 mt-1">Добавьте дополнительные услуги для ваших клиентов</p>
                </div>
              )}

              {/* Total summary */}
              {addonsList.filter(a => a.enabled).length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Итого стоимость всех активных услуг</span>
                    <span className="text-sm font-bold text-purple-300">
                      {addonsList.filter(a => a.enabled).reduce((sum, a) => sum + a.price, 0).toLocaleString()} ₽
                    </span>
                  </div>
                </div>
              )}
              <TabSaveButton />
            </div>
          )}

          {/* ====== EQUIPMENT ====== */}
          {activeTab === 'equipment' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base lg:text-lg font-bold text-white">Моё оборудование</div>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">{equipmentList.length} позиций</p>
                </div>
                <div onClick={() => { setShowAddEquipment(true); setEditingEquipmentId(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors cursor-pointer" role="button">
                  <Plus className="w-3 h-3" /> Добавить
                </div>
              </div>

              <AnimatePresence>
                {showAddEquipment && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300">Новое оборудование</span>
                        <X className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" onClick={() => setShowAddEquipment(false)} />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 mb-1 block">Название</label>
                          <input type="text" value={newEquipment.name} onChange={e => setNewEquipment({ ...newEquipment, name: e.target.value })}
                            placeholder="Pioneer CDJ-3000"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 mb-1 block">Тип</label>
                          <select value={newEquipment.type} onChange={e => setNewEquipment({ ...newEquipment, type: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none">
                            {EQUIPMENT_TYPES.map(t => <option key={t} value={t} className="bg-[#0a0a14]">{t}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">Кол-во</label>
                            <input type="number" min={1} value={newEquipment.count} onChange={e => setNewEquipment({ ...newEquipment, count: Math.max(1, +e.target.value) })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none" />
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addEquipment}
                            className={`px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg cursor-pointer ${!newEquipment.name.trim() ? 'opacity-40 pointer-events-none' : ''}`} role="button">
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {equipmentList.map(item => {
                  const isEditing = editingEquipmentId === item.id;
                  return (
                    <motion.div key={item.id} layout className="group">
                      {isEditing ? (
                        <div className="p-3 lg:p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                          <div className="grid sm:grid-cols-3 gap-2">
                            <input type="text" value={item.name} onChange={e => updateEquipment(item.id, 'name', e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                            <select value={item.type} onChange={e => updateEquipment(item.id, 'type', e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                              {EQUIPMENT_TYPES.map(t => <option key={t} value={t} className="bg-[#0a0a14]">{t}</option>)}
                            </select>
                            <div className="flex gap-2">
                              <input type="number" min={1} value={item.count} onChange={e => updateEquipment(item.id, 'count', Math.max(1, +e.target.value))}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                              <div onClick={() => setEditingEquipmentId(null)} className="px-3 py-2 bg-cyan-500 rounded-lg cursor-pointer flex items-center" role="button">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center"><Wrench className="w-4 h-4 text-cyan-400" /></div>
                            <div>
                              <p className="text-xs lg:text-sm text-white font-medium">{item.name}</p>
                              <p className="text-[10px] text-gray-500">{item.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400">x{item.count}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div onClick={() => setEditingEquipmentId(item.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer" role="button">
                                <Edit3 className="w-3 h-3 text-gray-400" />
                              </div>
                              <div onClick={() => deleteEquipment(item.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center cursor-pointer" role="button">
                                <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {equipmentList.length === 0 && (
                <div className="text-center py-8">
                  <Wrench className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">Оборудование не добавлено</p>
                  <p className="text-xs text-gray-600 mt-1">Нажмите «Добавить» чтобы указать своё оборудование</p>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-4 border border-dashed border-white/10">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400">Указание вашего оборудования повышает доверие клиентов и помогает заведениям подготовить техническую часть.</p>
                </div>
              </div>
              <TabSaveButton />
            </div>
          )}

          {/* ====== PORTFOLIO ====== */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base lg:text-lg font-bold text-white">Портфолио и медиа</div>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">
                    {portfolioCategories.reduce((sum, cat) => sum + cat.files.length, 0)} файлов в {portfolioCategories.length} категориях
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {portfolioCategories.map(cat => {
                  const Icon = cat.icon;
                  const isExpanded = expandedCategory === cat.id;
                  return (
                    <motion.div key={cat.id} layout className="overflow-hidden">
                      <div onClick={() => toggleCategory(cat.id)} role="button"
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          isExpanded ? 'bg-white/8 border-white/15' : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center transition-transform ${isExpanded ? 'scale-110' : ''}`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-white font-bold">{cat.label}</p>
                            <p className="text-[10px] text-gray-500">{cat.files.length} файлов</p>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                            <div className="mt-2 space-y-1.5 pl-2">
                              {cat.files.map((file, idx) => (
                                <motion.div key={file.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                  className="flex items-center justify-between p-3 bg-white/3 hover:bg-white/5 rounded-lg border border-white/5 group transition-colors">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} opacity-60 flex items-center justify-center flex-shrink-0`}>
                                      <Play className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs lg:text-sm text-white font-medium truncate">{file.name}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        {file.duration && <span className="text-[10px] text-gray-500 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {file.duration}</span>}
                                        <span className="text-[10px] text-gray-600">{file.date}</span>
                                        {file.plays !== undefined && <span className="text-[10px] text-gray-500 flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {file.plays.toLocaleString()}</span>}
                                        {file.size && <span className="text-[10px] text-gray-600">{file.size}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                    <div className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer" role="button">
                                      <ExternalLink className="w-3 h-3 text-gray-400" />
                                    </div>
                                    <div onClick={() => deletePortfolioFile(cat.id, file.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center cursor-pointer" role="button">
                                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                                    </div>
                                  </div>
                                </motion.div>
                              ))}

                              {showAddFile === cat.id ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                  <div className="flex gap-2 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                                    <input type="text" value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="Название файла..." autoFocus
                                      onKeyDown={e => e.key === 'Enter' && addPortfolioFile(cat.id)}
                                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none" />
                                    <div onClick={() => addPortfolioFile(cat.id)} className={`px-3 py-2 bg-cyan-500 rounded-lg cursor-pointer flex items-center ${!newFileName.trim() ? 'opacity-40 pointer-events-none' : ''}`} role="button">
                                      <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <div onClick={() => { setShowAddFile(null); setNewFileName(''); }} className="px-3 py-2 bg-white/5 rounded-lg cursor-pointer flex items-center hover:bg-white/10" role="button">
                                      <X className="w-4 h-4 text-gray-400" />
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                <div onClick={() => { setShowAddFile(cat.id); setNewFileName(''); }} role="button"
                                  className="flex items-center gap-2 p-3 border border-dashed border-white/10 hover:border-cyan-500/30 rounded-lg cursor-pointer group/add transition-colors">
                                  <Plus className="w-3.5 h-3.5 text-gray-500 group-hover/add:text-cyan-400 transition-colors" />
                                  <span className="text-xs text-gray-500 group-hover/add:text-gray-300 transition-colors">Добавить файл</span>
                                </div>
                              )}

                              {cat.files.length === 0 && (
                                <div className="text-center py-4"><p className="text-xs text-gray-600">В этой категории пока нет файлов</p></div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-colors cursor-pointer group" role="button">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2 group-hover:text-cyan-400 transition-colors" />
                <p className="text-xs lg:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Перетащите файлы или нажмите для загрузки</p>
                <p className="text-[10px] text-gray-600 mt-1">MP3, WAV, MP4, JPG, PNG до 500MB</p>
              </div>
              <TabSaveButton />
            </div>
          )}

          {/* ====== CONTACTS ====== */}
          {activeTab === 'contacts' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base lg:text-lg font-bold text-white">Контактная информация</div>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">Данные для связи с вами и вашей командой</p>
                </div>
                {contactsDirty && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400">Не сохранено</span>
                  </motion.div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
                {([
                  { icon: Mail, label: 'Email', key: 'email' as const, placeholder: 'booking@example.ru' },
                  { icon: Phone, label: 'Телефон', key: 'phone' as const, placeholder: '+7 (999) 000-00-00' },
                  { icon: MessageCircle, label: 'Telegram', key: 'telegram' as const, placeholder: '@username' },
                  { icon: Instagram, label: 'Instagram', key: 'instagram' as const, placeholder: '@username' },
                  { icon: Globe, label: 'Сайт', key: 'website' as const, placeholder: 'https://djpulse.ru' },
                  { icon: Link2, label: 'ВКонтакте', key: 'vk' as const, placeholder: 'vk.com/djpulse' },
                ] as const).map(contact => {
                  const Icon = contact.icon;
                  const hasValue = !!contacts[contact.key];
                  return (
                    <div key={contact.key} className={`p-3 rounded-xl border transition-all ${hasValue ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 border-dashed'}`}>
                      <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mb-1.5">
                        <Icon className="w-3 h-3" /> {contact.label}
                        {hasValue && <Check className="w-2.5 h-2.5 text-green-500 ml-auto" />}
                      </label>
                      <input type="text" value={contacts[contact.key]}
                        onChange={e => { setContacts({ ...contacts, [contact.key]: e.target.value }); setContactsDirty(true); markDirty(); }}
                        placeholder={contact.placeholder}
                        className="w-full bg-transparent text-sm text-white placeholder:text-gray-700 focus:outline-none" />
                    </div>
                  );
                })}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-gray-400">Контактные лица</div>
                  <div onClick={() => { setShowAddPerson(true); setEditingPersonId(null); }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/20 rounded-lg text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors cursor-pointer" role="button">
                    <Plus className="w-3 h-3" /> Добавить
                  </div>
                </div>

                <AnimatePresence>
                  {showAddPerson && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
                      <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-300">Новое контактное лицо</span>
                          <X className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" onClick={() => setShowAddPerson(false)} />
                        </div>
                        <div className="grid sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">Имя</label>
                            <input type="text" value={newPerson.name} onChange={e => setNewPerson({ ...newPerson, name: e.target.value })} placeholder="Иван Иванов"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">Роль</label>
                            <input type="text" value={newPerson.role} onChange={e => setNewPerson({ ...newPerson, role: e.target.value })} placeholder="Букинг-агент"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none" />
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-gray-500 mb-1 block">Телефон</label>
                              <input type="text" value={newPerson.phone} onChange={e => setNewPerson({ ...newPerson, phone: e.target.value })} placeholder="+7 (999) 000-00-00"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none" />
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addContactPerson}
                              className={`px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg cursor-pointer flex items-center ${(!newPerson.name.trim() || !newPerson.role.trim()) ? 'opacity-40 pointer-events-none' : ''}`} role="button">
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  {contactPersons.map(person => {
                    const isEditing = editingPersonId === person.id;
                    return (
                      <motion.div key={person.id} layout>
                        {isEditing ? (
                          <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                            <div className="grid sm:grid-cols-3 gap-2">
                              <input type="text" value={person.name} onChange={e => updateContactPerson(person.id, 'name', e.target.value)} placeholder="Имя"
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                              <input type="text" value={person.role} onChange={e => updateContactPerson(person.id, 'role', e.target.value)} placeholder="Роль"
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                              <div className="flex gap-2">
                                <input type="text" value={person.phone} onChange={e => updateContactPerson(person.id, 'phone', e.target.value)} placeholder="Телефон"
                                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                <div onClick={() => setEditingPersonId(null)} className="px-3 py-2 bg-cyan-500 rounded-lg cursor-pointer flex items-center" role="button">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-purple-400" />
                              </div>
                              <div>
                                <p className="text-xs text-white font-medium">{person.name}</p>
                                <p className="text-[10px] text-gray-500">{person.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400">{person.phone}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div onClick={() => setEditingPersonId(person.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer" role="button">
                                  <Edit3 className="w-3 h-3 text-gray-400" />
                                </div>
                                <div onClick={() => deleteContactPerson(person.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center cursor-pointer" role="button">
                                  <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  {contactPersons.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                      <User className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Контактные лица не добавлены</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white font-bold mb-0.5">Видимость контактов</p>
                    <p className="text-[10px] text-gray-400">
                      Телефон и email видны только авторизованным заказчикам после подтверждения букинга.
                      Telegram и ссылки на соцсети отображаются в вашем публичном профиле.
                    </p>
                  </div>
                </div>
              </div>
              <TabSaveButton />
            </div>
          )}

          {/* ====== FAQ ====== */}
          {activeTab === 'faq' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base lg:text-lg font-bold text-white">Часто задаваемые вопросы</div>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">{faqList.length} вопросов</p>
                </div>
                <div onClick={() => { setShowAddFaq(true); setEditingFaqId(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors cursor-pointer" role="button">
                  <Plus className="w-3 h-3" /> Добавить
                </div>
              </div>

              <AnimatePresence>
                {showAddFaq && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300">Новый вопрос</span>
                        <X className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" onClick={() => setShowAddFaq(false)} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">Вопрос</label>
                        <input type="text" value={newFaq.q} onChange={e => setNewFaq({ ...newFaq, q: e.target.value })} placeholder="Как забронировать ваше выступление?"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">Ответ</label>
                        <textarea value={newFaq.a} onChange={e => setNewFaq({ ...newFaq, a: e.target.value })} rows={2} placeholder="Напишите подробный ответ..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none resize-none" />
                      </div>
                      <div className="flex justify-end">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addFaqItem}
                          className={`px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-xs font-bold text-white cursor-pointer flex items-center gap-1.5 ${(!newFaq.q.trim() || !newFaq.a.trim()) ? 'opacity-40 pointer-events-none' : ''}`} role="button">
                          <Check className="w-3.5 h-3.5" /> Добавить
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {faqList.map(faq => {
                  const isEditing = editingFaqId === faq.id;
                  return (
                    <motion.div key={faq.id} layout className="group">
                      {isEditing ? (
                        <div className="p-3 lg:p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20 space-y-2">
                          <input type="text" value={faq.q} onChange={e => updateFaqItem(faq.id, 'q', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none" />
                          <textarea value={faq.a} onChange={e => updateFaqItem(faq.id, 'a', e.target.value)} rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none" />
                          <div className="flex justify-end">
                            <div onClick={() => setEditingFaqId(null)} className="px-3 py-1.5 bg-cyan-500 rounded-lg cursor-pointer flex items-center gap-1 text-xs font-bold text-white" role="button">
                              <Check className="w-3.5 h-3.5" /> Готово
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 lg:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs lg:text-sm text-white font-bold mb-1">{faq.q}</p>
                              <p className="text-[10px] lg:text-xs text-gray-400">{faq.a}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <div onClick={() => setEditingFaqId(faq.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer" role="button">
                                <Edit3 className="w-3 h-3 text-gray-400" />
                              </div>
                              <div onClick={() => deleteFaqItem(faq.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center cursor-pointer" role="button">
                                <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {faqList.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Нет вопросов</p>
                  <p className="text-xs text-gray-600 mt-1">Добавьте частые вопросы для потенциальных клиентов</p>
                </div>
              )}
              <TabSaveButton />
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
