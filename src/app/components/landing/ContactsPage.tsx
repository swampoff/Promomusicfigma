/**
 * CONTACTS PAGE - Страница контактов
 * Форма обратной связи и контактная информация
 */

import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Globe, MessageSquare, Building2, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';

export function ContactsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contacts = [
    {
      icon: Mail,
      title: 'Email',
      value: 'hello@promo.music',
      description: 'Напишите нам письмо',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Phone,
      title: 'Телефон',
      value: '+1 (555) 123-4567',
      description: 'Звоните в рабочее время',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: MapPin,
      title: 'Адрес',
      value: 'San Francisco, CA 94103',
      description: '123 Music Street, Suite 100',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Часы работы',
      value: 'Пн-Пт 9:00-18:00 EST',
      description: 'Поддержка 24/7 онлайн',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const offices = [
    {
      city: 'Сан-Франциско',
      country: 'США',
      address: '123 Music Street, Suite 100',
      type: 'Головной офис'
    },
    {
      city: 'Лондон',
      country: 'Великобритания',
      address: '456 Sound Avenue, Floor 5',
      type: 'Европейский офис'
    },
    {
      city: 'Токио',
      country: 'Япония',
      address: '789 Harmony Road, Building A',
      type: 'Азиатский офис'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Отправка формы
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
        
        <div className="relative max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-[#FF577F]/20">
              <MessageSquare className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-bold">Свяжитесь с нами</span>
            </div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-6 leading-[1.1]">
              Давайте <span className="bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] bg-clip-text text-transparent">обсудим</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Есть вопросы? Хотите сотрудничать? Мы всегда рады общению
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* CONTACT INFO */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contacts.map((contact, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all text-center"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${contact.color} flex items-center justify-center mx-auto mb-4`}>
                <contact.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-sm font-bold text-slate-400 mb-1">{contact.title}</h3>
              <p className="text-lg font-black mb-2">{contact.value}</p>
              <p className="text-xs text-slate-500">{contact.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CONTACT FORM & MAP */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* FORM */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10"
          >
            <h2 className="text-2xl sm:text-3xl font-black mb-6">Напишите нам</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2">Имя</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF577F]/50 transition-all"
                  placeholder="Ваше имя"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF577F]/50 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Тема</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF577F]/50 transition-all"
                  required
                >
                  <option value="">Выберите тему</option>
                  <option value="general">Общий вопрос</option>
                  <option value="support">Техническая поддержка</option>
                  <option value="partnership">Партнерство</option>
                  <option value="business">Для бизнеса</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Сообщение</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF577F]/50 transition-all min-h-[150px] resize-none"
                  placeholder="Расскажите подробнее..."
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-[#FF577F] hover:bg-[#FF4D7D] font-bold py-6 rounded-xl"
              >
                <Send className="w-5 h-5 mr-2" />
                Отправить сообщение
              </Button>
            </form>
          </motion.div>

          {/* OFFICES */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-black mb-6">Наши офисы</h2>
            
            {offices.map((office, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-[#FF577F]" />
                  </div>
                  <div>
                    <div className="inline-block px-3 py-1 bg-[#FF577F]/20 rounded-full text-xs font-bold text-[#FF577F] mb-2">
                      {office.type}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{office.city}</h3>
                    <p className="text-sm text-slate-400 mb-2">{office.country}</p>
                    <p className="text-sm text-slate-500">{office.address}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Social Links */}
            <div className="bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 rounded-2xl p-6 border border-[#FF577F]/30">
              <h3 className="text-lg font-bold mb-4">Социальные сети</h3>
              <div className="flex gap-3">
                {['Twitter', 'Instagram', 'Facebook', 'LinkedIn'].map((social, idx) => (
                  <button
                    key={idx}
                    className="flex-1 bg-white/10 hover:bg-white/20 rounded-xl py-3 text-sm font-bold transition-all"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
