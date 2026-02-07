/**
 * UNIFIED LOGIN - Единое окно входа с выбором роли
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Shield, Radio, ArrowLeft, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';

type Role = 'artist' | 'admin' | 'radio_station' | null;

interface UnifiedLoginProps {
  onLoginSuccess: (role: 'artist' | 'admin' | 'radio_station') => void;
  onBackToHome?: () => void;
}

export function UnifiedLogin({ onLoginSuccess, onBackToHome }: UnifiedLoginProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: 'artist' | 'admin' | 'radio_station') => {
    setSelectedRole(role);
    // Предзаполнение для демо
    if (role === 'artist') {
      setEmail('artist@promo.fm');
      setPassword('artist123');
    } else if (role === 'admin') {
      setEmail('admin@promo.fm');
      setPassword('admin123');
    } else if (role === 'radio_station') {
      setEmail('radio@promo.fm');
      setPassword('radio123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Демо-проверка
    const validCredentials = 
      (selectedRole === 'artist' && email === 'artist@promo.fm' && password === 'artist123') ||
      (selectedRole === 'admin' && email === 'admin@promo.fm' && password === 'admin123') ||
      (selectedRole === 'radio_station' && email === 'radio@promo.fm' && password === 'radio123');

    setTimeout(() => {
      if (validCredentials) {
        // Генерируем userId и userName на основе роли
        const userId = selectedRole === 'artist' ? 'artist_001' : 
                      selectedRole === 'admin' ? 'admin_001' : 'radio_001';
        const userName = selectedRole === 'artist' ? 'Александр Иванов' : 
                        selectedRole === 'admin' ? 'Администратор' : 'PROMO.FM Radio';
        
        toast.success(`Вход выполнен как ${
          selectedRole === 'artist' ? 'артист' : 
          selectedRole === 'admin' ? 'администратор' : 
          'радиостанция'
        }!`);
        
        // Сохраняем данные пользователя
        localStorage.setItem('userRole', selectedRole!);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
        localStorage.setItem('isAuthenticated', 'true');
        
        onLoginSuccess(selectedRole!);
      } else {
        toast.error('Неверный email или пароль');
      }
      setLoading(false);
    }, 1000);
  };

  const roles = [
    {
      id: 'artist' as const,
      name: 'Кабинет артиста',
      description: 'Для музыкантов и творческих людей',
      icon: Music2,
      color: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/50',
      hoverBorder: 'hover:border-cyan-400',
      features: ['Управление треками', 'Аналитика стримов', 'Донаты и подписки', 'Продвижение'],
    },
    {
      id: 'radio_station' as const,
      name: 'Радиостанция',
      description: 'Для радиостанций и медиа',
      icon: Radio,
      color: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-500/20 to-purple-500/20',
      borderColor: 'border-indigo-500/50',
      hoverBorder: 'hover:border-indigo-400',
      features: ['Заявки артистов', 'Рекламные слоты', 'Ротация треков', 'Доход 15%'],
    },
    {
      id: 'admin' as const,
      name: 'Администратор',
      description: 'CRM и модерация платформы',
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/50',
      hoverBorder: 'hover:border-purple-400',
      features: ['Управление пользователями', 'Модерация контента', 'Финансы', 'Аналитика'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1A1F35] to-[#0A0E1A] flex items-center justify-center p-3 xs:p-4 sm:p-6 md:p-8">
      <AnimatePresence mode="wait">
        {!selectedRole ? (
          // Role Selection Screen
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-[320px] xs:max-w-[440px] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl"
          >
            {/* Header */}
            <div className="text-center mb-6 xs:mb-8 sm:mb-10 md:mb-12">
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                onClick={onBackToHome}
                className="flex items-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 justify-center mb-3 xs:mb-4 sm:mb-5 md:mb-6 hover:opacity-80 transition-opacity cursor-pointer mx-auto"
              >
                <img 
                  src={promoLogo} 
                  alt="Promo.Music Logo" 
                  className="h-12 xs:h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto object-contain" 
                />
                <div className="flex flex-col -space-y-0.5 xs:-space-y-1">
                  <span 
                    className="text-[28px] xs:text-[38px] sm:text-[48px] md:text-[58px] lg:text-[68px] xl:text-[76px] font-black tracking-tight leading-none bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-[#FF577F] bg-clip-text text-transparent" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    PROMO
                  </span>
                  <span 
                    className="text-[10px] xs:text-[13px] sm:text-[15px] md:text-[17px] lg:text-[19px] font-bold text-white/60 tracking-[0.2em] uppercase" 
                    style={{ fontFamily: 'Golos Text, sans-serif' }}
                  >
                    MUSIC
                  </span>
                </div>
              </motion.button>
              <p 
                className="text-gray-400 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl px-2 xs:px-4" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Выберите способ входа в систему
              </p>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8">
              {roles.map((role, index) => {
                const Icon = role.icon;
                
                return (
                  <motion.button
                    key={role.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`relative p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 xl:p-10 rounded-lg xs:rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/5 border-2 ${role.borderColor} ${role.hoverBorder} transition-all duration-300 group overflow-hidden`}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg xs:rounded-xl sm:rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-7 shadow-2xl group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
                      </div>

                      {/* Title */}
                      <h2 
                        className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight text-white mb-1 xs:mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 text-left leading-tight" 
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {role.name}
                      </h2>
                      <p 
                        className="text-gray-400 text-xs xs:text-sm sm:text-base md:text-lg mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-7 text-left" 
                        style={{ fontFamily: 'Golos Text, sans-serif' }}
                      >
                        {role.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-1.5 xs:space-y-2 sm:space-y-2.5 md:space-y-3">
                        {role.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 text-left">
                            <Check className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0" />
                            <span 
                              className="text-[11px] xs:text-xs sm:text-sm md:text-base text-gray-300 font-medium" 
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Arrow */}
                      <div className="mt-3 xs:mt-4 sm:mt-5 md:mt-6 lg:mt-8 flex items-center justify-end text-white/60 group-hover:text-white transition-colors">
                        <span 
                          className="text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-bold mr-1.5 xs:mr-2 sm:mr-2.5 md:mr-3 uppercase tracking-wide" 
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          Войти
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform text-sm xs:text-base sm:text-lg md:text-xl">→</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <p 
              className="text-center text-[10px] xs:text-xs sm:text-sm text-gray-500 mt-4 xs:mt-6 sm:mt-8 px-2 xs:px-4" 
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              © 2026 promo.music • Маркетинговая экосистема для музыкантов
            </p>
          </motion.div>
        ) : (
          // Login Form Screen
          <motion.div
            key="login-form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-xl xs:rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className={`bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color} p-6 xs:p-7 sm:p-8 text-center relative`}>
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setEmail('');
                    setPassword('');
                  }}
                  className="absolute top-4 xs:top-5 sm:top-6 left-4 xs:left-5 sm:left-6 p-1.5 xs:p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                </button>

                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-xl rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
                  {selectedRole === 'artist' ? (
                    <Music2 className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white" />
                  ) : selectedRole === 'radio_station' ? (
                    <Radio className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white" />
                  ) : (
                    <Shield className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white" />
                  )}
                </div>
                <h2 className="text-xl xs:text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {selectedRole === 'artist' ? 'Вход для артиста' : selectedRole === 'radio_station' ? 'Вход для радиостанции' : 'Вход для администратора'}
                </h2>
                <p className="text-white/80 text-xs xs:text-sm mt-1.5 xs:mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedRole === 'artist' ? 'Управление творчеством' : selectedRole === 'radio_station' ? 'Управление эфиром' : 'Управление платформой'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="p-6 xs:p-7 sm:p-8 space-y-5 xs:space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-xs xs:text-sm font-semibold text-white mb-1.5 xs:mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedRole === 'artist' ? 'artist@promo.fm' : selectedRole === 'radio_station' ? 'radio@promo.fm' : 'admin@promo.fm'}
                      className="w-full pl-9 xs:pl-11 pr-3 xs:pr-4 py-2.5 xs:py-3 bg-white/5 border border-white/10 rounded-lg text-sm xs:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs xs:text-sm font-semibold text-white mb-1.5 xs:mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 xs:pl-11 pr-9 xs:pr-11 py-2.5 xs:py-3 bg-white/5 border border-white/10 rounded-lg text-sm xs:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 xs:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 xs:w-5 xs:h-5" /> : <Eye className="w-4 h-4 xs:w-5 xs:h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 xs:py-3 bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color} hover:opacity-90 text-white text-sm xs:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Вход...
                    </div>
                  ) : (
                    'Войти'
                  )}
                </button>

                {/* Demo Info */}
                <div className="pt-5 xs:pt-6 border-t border-white/10">
                  <p className="text-xs xs:text-sm text-gray-400 text-center mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Демо-доступ:</p>
                  <div className="bg-white/5 rounded-lg p-2.5 xs:p-3 space-y-1">
                    <p className="text-xs xs:text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="font-semibold">Email:</span> {selectedRole === 'artist' ? 'artist@promo.fm' : selectedRole === 'radio_station' ? 'radio@promo.fm' : 'admin@promo.fm'}
                    </p>
                    <p className="text-xs xs:text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="font-semibold">Пароль:</span> {selectedRole === 'artist' ? 'artist123' : selectedRole === 'radio_station' ? 'radio123' : 'admin123'}
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}