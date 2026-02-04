/**
 * PROMO CODE CARD - QR-код со скидкой для venue
 * Пользователь показывает этот код → получает скидку
 */

import { useState } from 'react';
import { Gift, QrCode, Clock, Star, Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface PromoCodeCardProps {
  venue: {
    id: string;
    name: string;
    type: string;
  };
  user: {
    level: number;
    isFirstVisit: boolean;
  };
}

export function PromoCodeCard({ venue, user }: PromoCodeCardProps) {
  const [isActivated, setIsActivated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Расчет скидки
  const baseDiscount = 15;
  const levelBonus = user.level * 2; // +2% за уровень
  const firstVisitBonus = user.isFirstVisit ? 5 : 0;
  const totalDiscount = baseDiscount + levelBonus + firstVisitBonus;

  // Генерация кода (в реальности - с бэкенда)
  const promoCode = `PROMO-${venue.id.substring(0, 8).toUpperCase()}`;
  
  // Срок действия (сегодня до 23:59)
  const expiresAt = new Date();
  expiresAt.setHours(23, 59, 59, 999);

  const handleActivate = () => {
    setIsActivated(true);
    toast.success('Промокод активирован! Покажите QR-код официанту');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    toast.success('Код скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Скидка ${totalDiscount}% в ${venue.name}`,
        text: `Получи ${totalDiscount}% скидку в ${venue.name} через Promo.Guide!`,
        url: `https://promo.guide/v/${venue.id}`
      });
    } else {
      toast.info('Поделиться недоступно на этом устройстве');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 border border-purple-500/30 p-6"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Специальное предложение</h3>
              <p className="text-sm text-purple-300">Для пользователей Promo.Guide</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-purple-300 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Discount Badge */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Star className="w-8 h-8 text-amber-400 fill-current" />
            <div>
              <div className="text-3xl font-bold text-white">{totalDiscount}%</div>
              <div className="text-sm text-amber-300">Скидка на весь счет</div>
            </div>
          </div>

          {/* Breakdown */}
          {(levelBonus > 0 || firstVisitBonus > 0) && (
            <div className="mt-3 space-y-1 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Базовая скидка:</span>
                <span className="text-white">{baseDiscount}%</span>
              </div>
              {levelBonus > 0 && (
                <div className="flex items-center justify-between">
                  <span>Бонус за уровень {user.level}:</span>
                  <span className="text-purple-400">+{levelBonus}%</span>
                </div>
              )}
              {firstVisitBonus > 0 && (
                <div className="flex items-center justify-between">
                  <span>Первый визит:</span>
                  <span className="text-green-400">+{firstVisitBonus}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!isActivated ? (
            <motion.div
              key="inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Benefits */}
              <div className="space-y-2">
                <BenefitItem text="Покажи код при заказе" />
                <BenefitItem text="Получи скидку на весь счет" />
                <BenefitItem text="Заработай 100 Promo Credits" />
              </div>

              {/* Expiry */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Действует до {expiresAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Activate Button */}
              <Button
                onClick={handleActivate}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Активировать промокод
              </Button>

              <p className="text-xs text-center text-slate-500">
                После активации у вас будет 30 минут чтобы применить код
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="p-6 rounded-2xl bg-white">
                  <QRCodePlaceholder size={200} data={promoCode} />
                </div>
                
                {/* Code */}
                <div className="mt-4 flex items-center gap-2">
                  <code className="px-4 py-2 rounded-lg bg-white/10 text-purple-300 font-mono text-lg">
                    {promoCode}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className={copied ? 'border-green-500 text-green-400' : ''}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs">1</span>
                  Покажите QR-код официанту
                </h4>
                <p className="text-xs text-slate-300 mb-4 ml-8">
                  Официант отсканирует код планшетом и применит скидку {totalDiscount}%
                </p>

                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs">2</span>
                  Получите скидку и бонусы
                </h4>
                <p className="text-xs text-slate-300 ml-8">
                  Скидка {totalDiscount}% + 100 Promo Credits на ваш счет
                </p>
              </div>

              {/* Timer */}
              <CountdownTimer expiresAt={new Date(Date.now() + 30 * 60 * 1000)} />

              {/* Share */}
              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться в Stories
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {!isActivated && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Промокод персональный</span>
              <span>Одноразовый</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =====================================================
// BENEFIT ITEM
// =====================================================
function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-green-400" />
      </div>
      <span className="text-slate-300">{text}</span>
    </div>
  );
}

// =====================================================
// QR CODE PLACEHOLDER
// =====================================================
function QRCodePlaceholder({ size, data }: { size: number; data: string }) {
  return (
    <div 
      className="relative bg-white flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* QR pattern simulation */}
      <div className="absolute inset-0 grid grid-cols-8 gap-1 p-2">
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}
          />
        ))}
      </div>

      {/* Center logo */}
      <div className="relative z-10 w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
        P.G
      </div>

      {/* In production: use QRCode library
      <QRCodeSVG
        value={data}
        size={size}
        level="H"
        includeMargin={true}
        imageSettings={{
          src: "/logo.png",
          height: 40,
          width: 40,
          excavate: true,
        }}
      />
      */}
    </div>
  );
}

// =====================================================
// COUNTDOWN TIMER
// =====================================================
function CountdownTimer({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useState(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = expiresAt.getTime();
      const diff = Math.max(0, end - now);
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  });

  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const isUrgent = minutes < 5;

  return (
    <div className={`p-3 rounded-xl border ${
      isUrgent 
        ? 'bg-red-500/10 border-red-500/30' 
        : 'bg-blue-500/10 border-blue-500/30'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-blue-400'}`} />
          <span className={`text-sm font-medium ${isUrgent ? 'text-red-300' : 'text-blue-300'}`}>
            {isUrgent ? 'Код истекает через:' : 'Время действия:'}
          </span>
        </div>
        <div className={`text-lg font-bold font-mono ${isUrgent ? 'text-red-400' : 'text-white'}`}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PROMO CODE USAGE STATS (для venue dashboard)
// =====================================================
export function PromoCodeStats() {
  const stats = {
    today: {
      scans: 12,
      revenue: 600,
      discountGiven: 90,
      avgBill: 50
    },
    month: {
      scans: 127,
      revenue: 6350,
      discountGiven: 952,
      avgBill: 50
    }
  };

  const roi = ((stats.month.revenue - 299) / 299 * 100).toFixed(0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-4">
          📊 Статистика промокодов
        </h3>
        <p className="text-sm text-slate-400">
          Клиенты, пришедшие через Promo.Guide с QR-кодами
        </p>
      </div>

      {/* Today */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Сегодня</h4>
          <Badge className="bg-green-500/20 border-green-500/30 text-green-300">
            {stats.today.scans} клиентов
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatItem label="Доход" value={`$${stats.today.revenue}`} />
          <StatItem label="Скидка" value={`$${stats.today.discountGiven}`} />
          <StatItem label="Средний чек" value={`$${stats.today.avgBill}`} />
          <StatItem label="Прибыль" value={`$${stats.today.revenue - stats.today.discountGiven}`} />
        </div>
      </div>

      {/* Month */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Этот месяц</h4>
          <Badge className="bg-purple-500/20 border-purple-500/30 text-purple-300">
            {stats.month.scans} клиентов
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatItem label="Доход" value={`$${stats.month.revenue}`} />
          <StatItem label="Скидка" value={`$${stats.month.discountGiven}`} />
          <StatItem label="Подписка" value="$299" />
          <StatItem 
            label="ROI" 
            value={`${roi}%`} 
            highlight 
          />
        </div>
      </div>

      {/* Insights */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <h5 className="text-sm font-semibold text-blue-300 mb-2">💡 Инсайт</h5>
        <p className="text-xs text-slate-300">
          Промокоды Promo.Guide привели {stats.month.scans} клиентов, которые иначе не пришли бы. 
          Чистая прибыль ${stats.month.revenue - stats.month.discountGiven - 299} при инвестиции $299. 
          ROI {roi}% за месяц!
        </p>
      </div>
    </div>
  );
}

function StatItem({ label, value, highlight = false }: any) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-lg font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}
