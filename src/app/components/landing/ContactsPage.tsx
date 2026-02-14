/**
 * CONTACTS PAGE - Страница контактов
 * Форма обратной связи и контактная информация
 * ООО "ПФМ", Геленджик, Краснодарский край
 */

import { motion } from 'motion/react';
import { Mail, MapPin, Send, MessageSquare, Building2, Clock, Globe } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';

export function ContactsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const contacts = [
    {
      icon: Mail,
      title: 'Email',
      value: 'info@promofm.ru',
      description: 'Основной канал связи',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MapPin,
      title: 'Адрес',
      value: 'г. Геленджик',
      description: 'Ул. Новороссийская, 163',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Часы работы',
      value: 'Пн-Пт 9:00 - 18:00',
      description: 'Поддержка 24/7 онлайн',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-12 sm:pb-16 md:pb-20">

      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden border-b border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF577F]/10 via-transparent to-[#3E4C5E]/10" />

        <div className="relative max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-14 md:py-18 lg:py-22">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 xs:px-4 py-1.5 xs:py-2 mb-4 xs:mb-5 sm:mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-[#FF577F]/20">
              <MessageSquare className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#FF577F]" />
              <span className="text-xs xs:text-sm font-bold">Свяжитесь с нами</span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 xs:mb-4 sm:mb-5 leading-[1.1]">
              Давайте{' '}
              <span className="bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] bg-clip-text text-transparent">
                обсудим
              </span>
            </h1>

            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed px-2">
              Есть вопросы? Хотите сотрудничать? Мы всегда рады общению
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* CONTACT CARDS */}
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-14 md:py-18">
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 lg:gap-6 mb-8 xs:mb-10 sm:mb-14 md:mb-16">
          {contacts.map((contact, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all text-center"
            >
              <div className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-lg xs:rounded-xl bg-gradient-to-br ${contact.color} flex items-center justify-center mx-auto mb-3 xs:mb-4`}>
                <contact.icon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xs xs:text-sm font-bold text-slate-400 mb-0.5 xs:mb-1">{contact.title}</h3>
              <p className="text-sm xs:text-base sm:text-lg font-black mb-1 xs:mb-2">{contact.value}</p>
              <p className="text-[11px] xs:text-xs text-slate-500">{contact.description}</p>
            </motion.div>
          ))}
        </div>

        {/* FORM + COMPANY INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* FORM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-8 border border-white/10"
          >
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-black mb-4 xs:mb-5 sm:mb-6">Напишите нам</h2>

            <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4 sm:space-y-5">
              {/* Name + Email row on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs xs:text-sm font-bold mb-1.5 xs:mb-2">Имя</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base focus:outline-none focus:border-[#FF577F]/50 transition-all placeholder:text-slate-600"
                    placeholder="Ваше имя"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs xs:text-sm font-bold mb-1.5 xs:mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base focus:outline-none focus:border-[#FF577F]/50 transition-all placeholder:text-slate-600"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs xs:text-sm font-bold mb-1.5 xs:mb-2">Тема</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base focus:outline-none focus:border-[#FF577F]/50 transition-all text-white"
                  required
                >
                  <option value="" className="bg-[#0a0a14]">Выберите тему</option>
                  <option value="general" className="bg-[#0a0a14]">Общий вопрос</option>
                  <option value="support" className="bg-[#0a0a14]">Техническая поддержка</option>
                  <option value="partnership" className="bg-[#0a0a14]">Партнерство</option>
                  <option value="business" className="bg-[#0a0a14]">Для бизнеса</option>
                  <option value="other" className="bg-[#0a0a14]">Другое</option>
                </select>
              </div>

              <div>
                <label className="block text-xs xs:text-sm font-bold mb-1.5 xs:mb-2">Сообщение</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base focus:outline-none focus:border-[#FF577F]/50 transition-all min-h-[120px] xs:min-h-[140px] sm:min-h-[150px] resize-none placeholder:text-slate-600"
                  placeholder="Расскажите подробнее..."
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-[#FF577F] hover:bg-[#FF4D7D] disabled:opacity-60 font-bold py-5 xs:py-6 rounded-lg xs:rounded-xl text-sm xs:text-base"
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Отправка...
                  </span>
                ) : sent ? (
                  <span className="flex items-center justify-center gap-2">
                    ✓ Отправлено
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4 xs:w-5 xs:h-5" />
                    Отправить сообщение
                  </span>
                )}
              </Button>
            </form>
          </motion.div>

          {/* COMPANY INFO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 xs:space-y-5 sm:space-y-6"
          >
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-black">Компания</h2>

            {/* Main Office Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all">
              <div className="flex items-start gap-3 xs:gap-4">
                <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
                </div>
                <div className="min-w-0">
                  <div className="inline-block px-2.5 xs:px-3 py-0.5 xs:py-1 bg-[#FF577F]/20 rounded-full text-[10px] xs:text-xs font-bold text-[#FF577F] mb-2">
                    Юридическое лицо
                  </div>
                  <h3 className="text-lg xs:text-xl font-bold mb-0.5 xs:mb-1">ООО &laquo;ПФМ&raquo;</h3>
                  <p className="text-xs xs:text-sm text-slate-400">Россия, Краснодарский край</p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all">
              <div className="flex items-start gap-3 xs:gap-4">
                <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 xs:w-6 xs:h-6 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="inline-block px-2.5 xs:px-3 py-0.5 xs:py-1 bg-emerald-500/20 rounded-full text-[10px] xs:text-xs font-bold text-emerald-400 mb-2">
                    Фактический адрес
                  </div>
                  <h3 className="text-lg xs:text-xl font-bold mb-0.5 xs:mb-1">г. Геленджик</h3>
                  <p className="text-xs xs:text-sm text-slate-400">Ул. Новороссийская, 163</p>
                  <p className="text-xs xs:text-sm text-slate-500 mt-1">Краснодарский край, Россия</p>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all">
              <div className="flex items-start gap-3 xs:gap-4">
                <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg xs:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 xs:w-6 xs:h-6 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="inline-block px-2.5 xs:px-3 py-0.5 xs:py-1 bg-blue-500/20 rounded-full text-[10px] xs:text-xs font-bold text-blue-400 mb-2">
                    Электронная почта
                  </div>
                  <a href="mailto:info@promofm.ru" className="block text-lg xs:text-xl font-bold mb-0.5 xs:mb-1 hover:text-[#FF577F] transition-colors">
                    info@promofm.ru
                  </a>
                  <p className="text-xs xs:text-sm text-slate-400">Ответим в течение 24 часов</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-br from-[#FF577F]/10 to-[#3E4C5E]/10 rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-[#FF577F]/20">
              <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
                <Globe className="w-4 h-4 xs:w-5 xs:h-5 text-[#FF577F]" />
                <h3 className="text-base xs:text-lg font-bold">Мы в сети</h3>
              </div>
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 xs:gap-3">
                {[
                  { name: 'VK', label: 'ВКонтакте', href: 'https://vk.com/promofm' },
                  { name: 'TG', label: 'Telegram', href: 'https://t.me/promofm' },
                  { name: 'YT', label: 'YouTube', href: 'https://youtube.com/@promofm7379?si=Kz4vu-pa0USE1lK_' },
                  { name: 'IG', label: 'Instagram', href: 'https://www.instagram.com/promo_fm?igsh=aHc1MjNuM3EzYmt6&utm_source=qr' },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 rounded-lg xs:rounded-xl py-2.5 xs:py-3 text-xs xs:text-sm font-bold transition-all hover:scale-105 active:scale-95 text-center block"
                  >
                    <span className="block text-[#FF577F] text-base xs:text-lg font-black leading-none mb-0.5">{social.name}</span>
                    <span className="text-[10px] xs:text-xs text-slate-400 hidden xs:block">{social.label}</span>
                    <span className="text-[10px] xs:text-xs text-slate-400 xs:hidden">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}