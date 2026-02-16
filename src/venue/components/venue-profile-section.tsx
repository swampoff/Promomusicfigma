/**
 * VENUE PROFILE SECTION
 * Полный профиль заведения с управлением всеми данными
 * Enterprise-уровень с адаптивным дизайном
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Building2, MapPin, Phone, Mail, Globe, Clock, Users, Star,
  Camera, Upload, Save, Edit2, Check, X, Instagram, Facebook,
  Music, Briefcase, TrendingUp, Award, Shield, Settings as SettingsIcon,
  Calendar, DollarSign, Percent, Image as ImageIcon, Plus, Trash2,
  Info, AlertCircle, CheckCircle
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import type { VenueProfile, VenueType, VenueStatus } from '../types/venue-types';
import { fetchVenueProfile, updateVenueProfile } from '@/utils/api/venue-cabinet';

interface VenueProfileSectionProps {
  onProfileUpdate?: (profile: any) => void;
}

export function VenueProfileSection({ onProfileUpdate }: VenueProfileSectionProps = {}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'location' | 'media' | 'hours' | 'settings'>('general');
  
  // Profile data (loaded from API with fallback)
  const [profile, setProfile] = useState<Partial<VenueProfile>>({
    id: '1',
    venueName: 'Sunset Lounge Bar',
    description: 'Уютный лаунж-бар в центре города с живой музыкой, авторскими коктейлями и непринужденной атмосферой. Идеальное место для вечернего отдыха.',
    venueType: 'lounge' as VenueType,
    address: 'ул. Тверская, 15',
    city: 'Москва',
    country: 'Россия',
    capacity: 100,
    genres: ['jazz', 'soul', 'lounge', 'chill'],
    status: 'active' as VenueStatus,
    verified: true,
    subscriptionStatus: 'active',
    subscriptionPlan: 'business',
    logoUrl: null,
    coverImageUrl: null,
    socialLinks: {
      website: 'https://sunsetlounge.ru',
      instagram: 'sunsetlounge',
      facebook: 'sunsetloungeofficial'
    },
    workingHours: null
  });

  // Load profile from API
  useEffect(() => {
    fetchVenueProfile().then((data) => {
      if (data) {
        setProfile({
          id: data.id,
          venueName: data.venueName,
          description: data.description || '',
          venueType: (data.venueType || 'bar') as VenueType,
          address: data.address,
          city: data.city,
          country: data.country,
          capacity: data.capacity || 100,
          genres: data.genres || [],
          status: (data.status || 'active') as VenueStatus,
          verified: data.verified,
          subscriptionStatus: data.subscriptionStatus,
          subscriptionPlan: data.subscriptionPlan || 'start',
          logoUrl: data.logoUrl,
          coverImageUrl: data.coverImageUrl,
          socialLinks: data.socialLinks || {},
          workingHours: data.workingHours,
        });
      }
    }).catch(console.error);
  }, []);
  
  const [editedProfile, setEditedProfile] = useState(profile);

  const venueTypes: { value: VenueType; label: string; icon: string }[] = [
    { value: 'restaurant', label: 'Ресторан', icon: '🍽️' },
    { value: 'bar', label: 'Бар', icon: '🍺' },
    { value: 'cafe', label: 'Кафе', icon: '☕' },
    { value: 'club', label: 'Клуб', icon: '🎉' },
    { value: 'lounge', label: 'Лаунж', icon: '🛋️' },
    { value: 'hotel', label: 'Отель', icon: '🏨' },
    { value: 'spa', label: 'СПА', icon: '💆' },
    { value: 'gym', label: 'Фитнес', icon: '💪' },
    { value: 'shop', label: 'Магазин', icon: '🛍️' },
    { value: 'other', label: 'Другое', icon: '🏢' }
  ];

  const musicGenres = [
    'jazz', 'soul', 'lounge', 'chill', 'house', 'techno', 'rock',
    'pop', 'rnb', 'hip-hop', 'classical', 'electronic', 'indie'
  ];

  const weekDays = [
    { key: 'monday', label: 'Понедельник' },
    { key: 'tuesday', label: 'Вторник' },
    { key: 'wednesday', label: 'Среда' },
    { key: 'thursday', label: 'Четверг' },
    { key: 'friday', label: 'Пятница' },
    { key: 'saturday', label: 'Суббота' },
    { key: 'sunday', label: 'Воскресенье' }
  ];

  const defaultHours = {
    monday: { open: '10:00', close: '23:00', closed: false },
    tuesday: { open: '10:00', close: '23:00', closed: false },
    wednesday: { open: '10:00', close: '23:00', closed: false },
    thursday: { open: '10:00', close: '23:00', closed: false },
    friday: { open: '10:00', close: '02:00', closed: false },
    saturday: { open: '10:00', close: '02:00', closed: false },
    sunday: { open: '12:00', close: '23:00', closed: false }
  };

  const [workingHours, setWorkingHours] = useState(defaultHours);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // API call to save profile
      await updateVenueProfile(editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
      toast.success('Профиль успешно обновлен');
      if (onProfileUpdate) {
        onProfileUpdate(editedProfile);
      }
    } catch (error) {
      toast.error('Ошибка при сохранении профиля');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = editedProfile.genres || [];
    if (currentGenres.includes(genre)) {
      setEditedProfile({
        ...editedProfile,
        genres: currentGenres.filter(g => g !== genre)
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        genres: [...currentGenres, genre]
      });
    }
  };

  const handleImageUpload = (type: 'logo' | 'cover') => {
    // Создаем input для выбора файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Проверка размера (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }

      // Проверка типа
      if (!file.type.startsWith('image/')) {
        toast.error('Можно загружать только изображения');
        return;
      }

      try {
        toast.info('Загрузка изображения...');

        // Читаем файл как Data URL для превью
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          
          // Обновляем профиль с новым изображением
          const updatedProfile = type === 'cover' 
            ? { ...editedProfile, coverImageUrl: imageUrl }
            : { ...editedProfile, logoUrl: imageUrl };
          
          setEditedProfile(updatedProfile);
          
          // ✅ СИНХРОНИЗАЦИЯ: обновляем sidebar сразу!
          if (onProfileUpdate) {
            onProfileUpdate(updatedProfile);
          }
          
          if (type === 'cover') {
            toast.success('Обложка загружена и синхронизирована!');
          } else {
            toast.success('Логотип загружен и синхронизирован!');
          }
        };
        reader.readAsDataURL(file);

        // TODO: В production загружать в Supabase Storage
        // const { data, error } = await supabase.storage
        //   .from('venue-images')
        //   .upload(`${venueId}/${type}-${Date.now()}.${file.name.split('.').pop()}`, file);
        
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Ошибка при загрузке изображения');
      }
    };

    input.click();
  };

  const tabs = [
    { id: 'general', label: 'Основное', icon: Building2 },
    { id: 'location', label: 'Локация', icon: MapPin },
    { id: 'media', label: 'Медиа', icon: ImageIcon },
    { id: 'hours', label: 'Часы работы', icon: Clock },
    { id: 'settings', label: 'Настройки', icon: SettingsIcon }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Профиль заведения
            </h1>
            <p className="text-slate-400">
              Управляйте информацией о вашем заведении
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <Badge variant="outline" className={`
              ${profile.verified 
                ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }
            `}>
              {profile.verified ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Верифицировано
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Ожидает верификации
                </>
              )}
            </Badge>

            {/* Edit/Save buttons */}
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Отмена
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6 group cursor-pointer"
        onClick={() => handleImageUpload('cover')}
        title="Нажмите, чтобы изменить обложку"
      >
        {editedProfile.coverImageUrl ? (
          <img 
            src={editedProfile.coverImageUrl} 
            alt="Cover" 
            className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl flex items-center justify-center transition-opacity group-hover:opacity-80">
            <ImageIcon className="w-16 h-16 text-slate-600" />
          </div>
        )}
        
        {/* Иконка камеры при hover - всегда видна */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="text-center">
            <Camera className="w-12 h-12 text-white mx-auto mb-2" />
            <span className="text-white text-sm font-medium">
              {editedProfile.coverImageUrl ? 'Изменить обложку' : 'Загрузить обложку'}
            </span>
          </div>
        </div>

        {/* Logo */}
        <div 
          className="absolute -bottom-12 left-6 md:left-8"
          onClick={(e) => {
            e.stopPropagation(); // Не триггерим клик cover image
            handleImageUpload('logo');
          }}
        >
          <div className="relative group/logo cursor-pointer" title="Нажмите, чтобы изменить логотип">
            {editedProfile.logoUrl ? (
              <img 
                src={editedProfile.logoUrl} 
                alt="Logo" 
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-slate-900 object-cover transition-opacity group-hover/logo:opacity-80"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-slate-900 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold transition-opacity group-hover/logo:opacity-80">
                {editedProfile.venueName?.substring(0, 2).toUpperCase() || 'VN'}
              </div>
            )}
            
            {/* Иконка камеры при hover - всегда видна */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl opacity-0 group-hover/logo:opacity-100 transition-opacity pointer-events-none">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mt-16 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
      >
        {activeTab === 'general' && (
          <GeneralTab
            profile={editedProfile}
            isEditing={isEditing}
            venueTypes={venueTypes}
            musicGenres={musicGenres}
            onUpdate={setEditedProfile}
            onToggleGenre={toggleGenre}
          />
        )}

        {activeTab === 'location' && (
          <LocationTab
            profile={editedProfile}
            isEditing={isEditing}
            onUpdate={setEditedProfile}
          />
        )}

        {activeTab === 'media' && (
          <MediaTab
            profile={editedProfile}
            isEditing={isEditing}
            onUpdate={setEditedProfile}
          />
        )}

        {activeTab === 'hours' && (
          <HoursTab
            workingHours={workingHours}
            isEditing={isEditing}
            weekDays={weekDays}
            onUpdate={setWorkingHours}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            profile={editedProfile}
            isEditing={isEditing}
            onUpdate={setEditedProfile}
          />
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatsCard
          icon={Star}
          label="Рейтинг"
          value="4.8"
          color="amber"
        />
        <StatsCard
          icon={Calendar}
          label="Мероприятий"
          value="127"
          color="indigo"
        />
        <StatsCard
          icon={Users}
          label="Вместимость"
          value={profile.capacity?.toString() || '-'}
          color="green"
        />
        <StatsCard
          icon={TrendingUp}
          label="Букингов"
          value="45"
          color="purple"
        />
      </div>
    </div>
  );
}

// =====================================================
// GENERAL TAB
// =====================================================
function GeneralTab({ profile, isEditing, venueTypes, musicGenres, onUpdate, onToggleGenre }: any) {
  return (
    <div className="space-y-6">
      {/* Venue Name */}
      <div>
        <Label className="text-white mb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Название заведения
        </Label>
        <Input
          value={profile.venueName || ''}
          onChange={(e) => onUpdate({ ...profile, venueName: e.target.value })}
          disabled={!isEditing}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* Venue Type */}
      <div>
        <Label className="text-white mb-2 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Тип заведения
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {venueTypes.map((type: any) => (
            <button
              key={type.value}
              onClick={() => isEditing && onUpdate({ ...profile, venueType: type.value })}
              disabled={!isEditing}
              className={`
                p-3 rounded-xl border transition-all
                ${profile.venueType === type.value
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }
                ${!isEditing && 'opacity-60 cursor-not-allowed'}
              `}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-xs">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className="text-white mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Описание
        </Label>
        <Textarea
          value={profile.description || ''}
          onChange={(e) => onUpdate({ ...profile, description: e.target.value })}
          disabled={!isEditing}
          rows={4}
          className="bg-white/5 border-white/10 text-white resize-none"
          placeholder="Расскажите о вашем заведении..."
        />
      </div>

      {/* Music Genres */}
      <div>
        <Label className="text-white mb-2 flex items-center gap-2">
          <Music className="w-4 h-4" />
          Музыкальные жанры
        </Label>
        <div className="flex flex-wrap gap-2">
          {musicGenres.map((genre: string) => (
            <button
              key={genre}
              onClick={() => isEditing && onToggleGenre(genre)}
              disabled={!isEditing}
              className={`
                px-3 py-1.5 rounded-full text-sm transition-all
                ${(profile.genres || []).includes(genre)
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }
                ${!isEditing && 'opacity-60 cursor-not-allowed'}
              `}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div>
        <Label className="text-white mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Вместимость (чел.)
        </Label>
        <Input
          type="number"
          value={profile.capacity || ''}
          onChange={(e) => onUpdate({ ...profile, capacity: parseInt(e.target.value) })}
          disabled={!isEditing}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>
    </div>
  );
}

// =====================================================
// LOCATION TAB
// =====================================================
function LocationTab({ profile, isEditing, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country */}
        <div>
          <Label className="text-white mb-2">Страна</Label>
          <Input
            value={profile.country || ''}
            onChange={(e) => onUpdate({ ...profile, country: e.target.value })}
            disabled={!isEditing}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* City */}
        <div>
          <Label className="text-white mb-2">Город</Label>
          <Input
            value={profile.city || ''}
            onChange={(e) => onUpdate({ ...profile, city: e.target.value })}
            disabled={!isEditing}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <Label className="text-white mb-2">Адрес</Label>
        <Input
          value={profile.address || ''}
          onChange={(e) => onUpdate({ ...profile, address: e.target.value })}
          disabled={!isEditing}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-white mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Телефон
          </Label>
          <Input
            value={profile.socialLinks?.phone || ''}
            onChange={(e) => onUpdate({ 
              ...profile, 
              socialLinks: { ...profile.socialLinks, phone: e.target.value }
            })}
            disabled={!isEditing}
            placeholder="+7 (999) 123-45-67"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <Label className="text-white mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            type="email"
            value={profile.socialLinks?.email || ''}
            onChange={(e) => onUpdate({ 
              ...profile, 
              socialLinks: { ...profile.socialLinks, email: e.target.value }
            })}
            disabled={!isEditing}
            placeholder="info@venue.ru"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mt-6">
        <Label className="text-white mb-2">Локация на карте</Label>
        <div className="h-64 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">Карта будет интегрирована</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MEDIA TAB
// =====================================================
function MediaTab({ profile, isEditing, onUpdate }: any) {
  return (
    <div className="space-y-6">
      {/* Social Links */}
      <div>
        <Label className="text-white mb-4 text-lg">Социальные сети</Label>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-400" />
            <Input
              value={profile.socialLinks?.website || ''}
              onChange={(e) => onUpdate({ 
                ...profile, 
                socialLinks: { ...profile.socialLinks, website: e.target.value }
              })}
              disabled={!isEditing}
              placeholder="https://your-website.com"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <Instagram className="w-5 h-5 text-slate-400" />
            <Input
              value={profile.socialLinks?.instagram || ''}
              onChange={(e) => onUpdate({ 
                ...profile, 
                socialLinks: { ...profile.socialLinks, instagram: e.target.value }
              })}
              disabled={!isEditing}
              placeholder="username"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <Facebook className="w-5 h-5 text-slate-400" />
            <Input
              value={profile.socialLinks?.facebook || ''}
              onChange={(e) => onUpdate({ 
                ...profile, 
                socialLinks: { ...profile.socialLinks, facebook: e.target.value }
              })}
              disabled={!isEditing}
              placeholder="page-name"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div>
        <Label className="text-white mb-4 text-lg">Галерея</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
            >
              <Plus className="w-8 h-8 text-slate-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// HOURS TAB
// =====================================================
function HoursTab({ workingHours, isEditing, weekDays, onUpdate }: any) {
  return (
    <div className="space-y-4">
      {weekDays.map((day: any) => (
        <div key={day.key} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-4 md:w-48">
            <Switch
              checked={!workingHours[day.key]?.closed}
              onCheckedChange={(checked) => {
                onUpdate({
                  ...workingHours,
                  [day.key]: { ...workingHours[day.key], closed: !checked }
                });
              }}
              disabled={!isEditing}
            />
            <span className="text-white font-medium">{day.label}</span>
          </div>

          {!workingHours[day.key]?.closed ? (
            <div className="flex items-center gap-3 flex-1">
              <Input
                type="time"
                value={workingHours[day.key]?.open || ''}
                onChange={(e) => onUpdate({
                  ...workingHours,
                  [day.key]: { ...workingHours[day.key], open: e.target.value }
                })}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white"
              />
              <span className="text-slate-400">-</span>
              <Input
                type="time"
                value={workingHours[day.key]?.close || ''}
                onChange={(e) => onUpdate({
                  ...workingHours,
                  [day.key]: { ...workingHours[day.key], close: e.target.value }
                })}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          ) : (
            <span className="text-slate-500 italic">Выходной</span>
          )}
        </div>
      ))}
    </div>
  );
}

// =====================================================
// SETTINGS TAB
// =====================================================
function SettingsTab({ profile, isEditing, onUpdate }: any) {
  const settings = [
    {
      key: 'showInDirectory',
      label: 'Показывать в каталоге заведений',
      description: 'Ваше заведение будет видно в общем каталоге для артистов и посетителей'
    },
    {
      key: 'allowArtistBookings',
      label: 'Принимать заявки на букинг от артистов',
      description: 'Артисты смогут отправлять вам заявки на выступления и мероприятия'
    },
    {
      key: 'showCurrentlyPlaying',
      label: 'Показывать текущий трек публично',
      description: 'Посетители смогут видеть какая музыка сейчас играет в вашем заведении'
    },
    {
      key: 'emailNotifications',
      label: 'Email уведомления',
      description: 'Получать важные уведомления на почту (букинги, заявки, платежи)'
    },
    {
      key: 'showStatistics',
      label: 'Показывать статистику публично',
      description: 'Рейтинг, количество мероприятий и отзывы будут видны другим пользователям'
    }
  ];

  return (
    <div className="space-y-6">
      {settings.map((setting) => (
        <div key={setting.key} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <Switch
            checked={profile.settings?.[setting.key] || false}
            onCheckedChange={(checked) => {
              onUpdate({
                ...profile,
                settings: { ...profile.settings, [setting.key]: checked }
              });
            }}
            disabled={!isEditing}
          />
          <div className="flex-1">
            <div className="text-white font-medium mb-1">{setting.label}</div>
            <div className="text-slate-400 text-sm">{setting.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// STATS CARD
// =====================================================
function StatsCard({ icon: Icon, label, value, color }: any) {
  const colorClasses: any = {
    amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    indigo: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30',
    green: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
    purple: 'from-purple-500/20 to-pink-500/10 border-purple-500/30'
  };

  return (
    <div className={`p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}