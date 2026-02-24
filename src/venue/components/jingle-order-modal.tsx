/**
 * JINGLE ORDER MODAL - Модальное окно заказа джингла/рекламы/анонса
 * 
 * Workflow:
 * 1. Venue заполняет форму → Отправляет заказ (2000-10000₽)
 * 2. Admin получает → Отправляет в ElevenLabs API
 * 3. ElevenLabs генерирует → Возвращает аудио
 * 4. Admin проверяет → Отправляет клиенту или на доработку
 * 5. Venue слушает → Утверждает или отклоняет
 * 6. Контент МГНОВЕННО попадает в сетку вещания радиобренда
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Sparkles, Send, DollarSign, Clock, 
  Info, Loader2, CheckCheck, FileAudio, Mic2, Megaphone, Radio, Zap
} from 'lucide-react';

import { toast } from 'sonner';

interface JingleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: JingleOrder) => void;
  contentType?: 'jingles' | 'ads' | 'announcements';
}

export interface JingleOrder {
  contentType: 'jingles' | 'ads' | 'announcements';
  text: string;
  style: string;
  duration: number;
  voiceType: string;
  price: number;
}

const STYLES = [
  { id: 'energetic', label: 'Энергичный', price: 2000 },
  { id: 'professional', label: 'Профессиональный', price: 3000 },
  { id: 'friendly', label: 'Дружелюбный', price: 2500 },
  { id: 'luxury', label: 'Люксовый', price: 5000 },
  { id: 'custom', label: 'Индивидуальный', price: 10000 },
];

const DURATIONS = [
  { value: 10, label: '10 секунд' },
  { value: 15, label: '15 секунд' },
  { value: 20, label: '20 секунд' },
  { value: 30, label: '30 секунд' },
];

const VOICE_TYPES = [
  { id: 'male', label: 'Мужской голос' },
  { id: 'female', label: 'Женский голос' },
  { id: 'neutral', label: 'Нейтральный' },
];

export function JingleOrderModal({ isOpen, onClose, onSubmit, contentType = 'jingles' }: JingleOrderModalProps) {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('');
  const [duration, setDuration] = useState(15);
  const [voiceType, setVoiceType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedStyle = STYLES.find(s => s.id === style);
  const price = selectedStyle?.price || 0;

  // Content type labels
  const contentLabels = {
    jingles: { title: 'джингл', label: 'Заказать джингл', icon: Mic2 },
    ads: { title: 'рекламу', label: 'Заказать рекламу', icon: Megaphone },
    announcements: { title: 'анонс', label: 'Заказать анонс', icon: Radio },
  };

  const currentContent = contentLabels[contentType];

  const handleSubmit = async () => {
    if (!text || !style || !voiceType) return;

    setIsSubmitting(true);
    
    try {
      // Mock venue data (в реальном приложении из контекста/auth)
      const venueId = 'venue_001';
      const venueName = 'Sunset Lounge';

      const response = await fetch('https://qzpmiiqfwkcnrhvubdgt.supabase.co/functions/v1/make-server-84730125/api/content-orders/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzUzMzMsImV4cCI6MjA4NDkxMTMzM30.N3nzO5WooZSPS6U_b4_KEqD1ZIA-82q5_yMHKy-Jsg0'
        },
        body: JSON.stringify({
          venueId,
          venueName,
          contentType,
          text,
          style,
          duration,
          voiceType,
          price
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }



      onSubmit({
        contentType,
        text,
        style,
        duration,
        voiceType,
        price
      });

      // Reset form
      setText('');
      setStyle('');
      setVoiceType('');
      setDuration(15);
      
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Ошибка при создании заказа. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = text.length >= 10 && style && voiceType;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="contents">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[201] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a14] border border-white/10 shadow-2xl pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-white/10 bg-[#0a0a14]/95 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">{currentContent.label}</h2>
                      <p className="text-xs sm:text-sm text-slate-400">Профессиональное создание • 10 минут</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Info Banner */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">
                      <p className="font-semibold text-white mb-1">Как это работает:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
                        <li>Заполните форму и оплатите</li>
                        <li>Администратор проверит текст</li>
                        <li>Мы создадим {currentContent.title} (~10 мин)</li>
                        <li>Вы прослушаете и утвердите</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Auto-broadcast Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-white mb-1">⚡ Мгновенная интеграция</p>
                      <p className="text-slate-300 text-xs sm:text-sm">
                        После утверждения контент автоматически попадает в сетку вещания вашего радиобренда
                      </p>
                    </div>
                  </div>
                </div>

                {/* Text Input */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Текст {contentType === 'jingles' ? 'джингла' : contentType === 'ads' ? 'рекламы' : 'анонса'} *
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Напишите текст для вашего ${contentType === 'jingles' ? 'джингла' : contentType === 'ads' ? 'рекламного ролика' : 'анонса'}... (минимум 10 символов)`}
                    rows={4}
                    maxLength={300}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>{text.length}/300</span>
                    <span>{text.length >= 10 ? '✅' : '❌'} Минимум 10 символов</span>
                  </div>
                </div>

                {/* Style Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Стиль *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id)}
                        className={`p-3 rounded-xl transition-all text-left ${
                          style === s.id
                            ? 'bg-amber-500/20 border-2 border-amber-500/50'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <p className="text-sm font-semibold text-white mb-1">{s.label}</p>
                        <p className="text-xs text-slate-400">{s.price.toLocaleString('ru-RU')}₽</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Длительность
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDuration(d.value)}
                        className={`p-2 sm:p-3 rounded-lg transition-all ${
                          duration === d.value
                            ? 'bg-amber-500/20 border border-amber-500/50 text-white'
                            : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-medium">{d.value}с</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Type */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Тип голоса *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {VOICE_TYPES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVoiceType(v.id)}
                        className={`p-3 rounded-xl transition-all ${
                          voiceType === v.id
                            ? 'bg-amber-500/20 border border-amber-500/50 text-white'
                            : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-medium">{v.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                {price > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">Стиль:</span>
                      <span className="text-sm font-medium text-white">{selectedStyle?.label}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                      <span className="text-sm text-slate-300">Длительность:</span>
                      <span className="text-sm font-medium text-white">{duration} секунд</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-white">Итого:</span>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-amber-400" />
                        <span className="text-2xl font-bold text-amber-400">
                          {price.toLocaleString('ru-RU')}₽
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 p-4 sm:p-6 border-t border-white/10 bg-[#0a0a14]/95 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid || isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="contents">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Отправка...</span>
                      </span>
                    ) : (
                      <span className="contents">
                        <Send className="w-5 h-5" />
                        <span>Заказать за {price.toLocaleString('ru-RU')}₽</span>
                      </span>
                    )}
                  </button>
                </div>

                {!isValid && (
                  <p className="mt-3 text-xs text-center text-red-400">
                    ❌ Заполните все обязательные поля
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}