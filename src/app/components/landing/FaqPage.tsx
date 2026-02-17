/**
 * FAQ PAGE - Часто задаваемые вопросы
 * Аккордеон с категориями, glassmorphism дизайн
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle, ChevronDown, Music, Disc3, Radio, Building2,
  CreditCard, Shield, Headphones, TestTube, Sparkles,
  MessageSquare, ArrowRight,
} from 'lucide-react';

interface FaqPageProps {
  onGetStarted: () => void;
}

type FaqCategory = 'general' | 'artists' | 'dj' | 'venues' | 'payments' | 'promo-lab';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: Record<FaqCategory, { label: string; icon: typeof Music; items: FaqItem[] }> = {
  general: {
    label: 'Общие вопросы',
    icon: HelpCircle,
    items: [
      {
        question: 'Что такое ПРОМО.МУЗЫКА?',
        answer: 'ПРОМО.МУЗЫКА - это маркетинговая экосистема для музыкальной индустрии. Платформа объединяет артистов, продюсеров, DJs, радиостанции, заведения и слушателей в единое пространство для продвижения музыки, букинга и монетизации.',
      },
      {
        question: 'Какие продукты входят в экосистему?',
        answer: 'Экосистема включает четыре продукта: ПРОМО.МУЗЫКА (маркетинговая платформа для артистов), ПРОМО.ЭИР (музыкальное радио для заведений), ПРОМО.ГИД (открытие музыки через любимые места) и ПРОМО.ЛАБ (тест-драйв треков перед релизом).',
      },
      {
        question: 'Нужно ли платить за регистрацию?',
        answer: 'Нет, регистрация на платформе полностью бесплатна. Базовый функционал доступен без оплаты. Расширенные возможности доступны в платных тарифах.',
      },
      {
        question: 'Как связаться с поддержкой?',
        answer: 'Вы можете обратиться в поддержку через раздел "Поддержка" в личном кабинете, написать на email support@promo.music или через форму на странице контактов.',
      },
    ],
  },
  artists: {
    label: 'Для артистов',
    icon: Music,
    items: [
      {
        question: 'Как загрузить свою музыку?',
        answer: 'После регистрации и входа в кабинет артиста перейдите в раздел "Публикация". Загрузите аудиофайл (MP3, WAV, FLAC), заполните метаданные (название, жанр, описание) и отправьте на модерацию.',
      },
      {
        question: 'Как попасть в чарты?',
        answer: 'Чарты формируются автоматически на основе количества прослушиваний, лайков и активности слушателей. Чем больше прослушиваний получает ваш трек, тем выше он поднимается в рейтинге.',
      },
      {
        question: 'Что такое питчинг в плейлисты?',
        answer: 'Питчинг - это отправка вашего трека кураторам плейлистов для рассмотрения включения. Доступен в тарифах "Профессионал" и "Премиум". Вы выбираете подходящие плейлисты и отправляете заявку.',
      },
      {
        question: 'Как работает аналитика?',
        answer: 'Аналитика показывает количество прослушиваний, географию слушателей, источники трафика, динамику роста аудитории и другие метрики. Расширенная аналитика доступна в платных тарифах.',
      },
    ],
  },
  dj: {
    label: 'Для DJs',
    icon: Disc3,
    items: [
      {
        question: 'Как создать профиль DJ?',
        answer: 'Зарегистрируйтесь и выберите роль "DJ" при первом входе. Заполните профиль: добавьте фото, укажите жанры, город, опыт, загрузите миксы и настройте календарь доступности.',
      },
      {
        question: 'Как получать заявки на букинг?',
        answer: 'После создания профиля вы автоматически появляетесь в каталоге DJ. Клиенты могут находить вас через фильтры и отправлять заявки на букинг прямо в вашем профиле.',
      },
      {
        question: 'Какая комиссия платформы?',
        answer: 'Комиссия платформы составляет 15% от стоимости букинга. Эта сумма включает обработку платежей, маркетинг вашего профиля и поддержку клиентов.',
      },
      {
        question: 'Можно ли загружать миксы?',
        answer: 'Да, вы можете загружать миксы и сеты для демонстрации своего стиля. Миксы доступны для прослушивания на вашей публичной странице.',
      },
    ],
  },
  venues: {
    label: 'Для заведений',
    icon: Building2,
    items: [
      {
        question: 'Что такое ПРОМО.ЭИР?',
        answer: 'ПРОМО.ЭИР - это сервис легальной музыки для бизнеса. Он автоматически подбирает музыку под формат вашего заведения, время дня и предпочтения гостей.',
      },
      {
        question: 'Нужно ли специальное оборудование?',
        answer: 'Нет, ПРОМО.ЭИР работает на любом устройстве с доступом в интернет - компьютер, планшет или смартфон. Достаточно подключить устройство к аудиосистеме заведения.',
      },
      {
        question: 'Легально ли использовать музыку?',
        answer: 'Да, все треки в ПРОМО.ЭИР полностью лицензированы. Авторские отчисления включены в стоимость подписки. Вы защищены от любых претензий правообладателей.',
      },
      {
        question: 'Можно ли подключить сеть заведений?',
        answer: 'Да, для сетей заведений есть специальный тариф с единой панелью управления, централизованным контролем и расширенной аналитикой по всем точкам.',
      },
    ],
  },
  payments: {
    label: 'Оплата',
    icon: CreditCard,
    items: [
      {
        question: 'Какие способы оплаты доступны?',
        answer: 'Мы принимаем банковские карты (Visa, MasterCard, МИР), электронные кошельки и банковские переводы для юридических лиц.',
      },
      {
        question: 'Можно ли отменить подписку?',
        answer: 'Да, вы можете отменить подписку в любой момент. Доступ к платным функциям сохранится до конца оплаченного периода.',
      },
      {
        question: 'Как получить выплату за букинг?',
        answer: 'Выплаты за букинги производятся в течение 3-5 рабочих дней после завершения мероприятия. Средства поступают на указанную банковскую карту или расчётный счёт.',
      },
      {
        question: 'Есть ли скидки при годовой оплате?',
        answer: 'Да, при оплате за год вы получаете скидку 20% по сравнению с ежемесячной оплатой.',
      },
    ],
  },
  'promo-lab': {
    label: 'ПРОМО.ЛАБ',
    icon: TestTube,
    items: [
      {
        question: 'Что такое ПРОМО.ЛАБ?',
        answer: 'ПРОМО.ЛАБ - это сервис профессиональной оценки треков перед релизом. Эксперты анализируют ваш трек по нескольким критериям и дают подробные рекомендации.',
      },
      {
        question: 'Кто оценивает треки?',
        answer: 'Треки оценивают профессиональные музыканты, продюсеры и A&R-менеджеры с опытом работы в индустрии.',
      },
      {
        question: 'Сколько времени занимает оценка?',
        answer: 'Стандартная оценка занимает 24-48 часов. В премиум-тарифе доступна ускоренная оценка за 12 часов.',
      },
      {
        question: 'Что я получу в результате?',
        answer: 'Вы получите детальный отчёт с оценками по категориям (аранжировка, микс, мастеринг, вокал, текст), общий балл и конкретные рекомендации по улучшению.',
      },
    ],
  },
};

export function FaqPage({ onGetStarted }: FaqPageProps) {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('general');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const categories = Object.entries(FAQ_DATA) as [FaqCategory, typeof FAQ_DATA[FaqCategory]][];
  const currentData = FAQ_DATA[activeCategory];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF577F]/10 border border-[#FF577F]/20 text-[#FF577F] text-xs font-bold mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          Помощь
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3">
          Часто задаваемые{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF577F] to-[#FF3366]">вопросы</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
          Ответы на популярные вопросы о платформе и экосистеме ПРОМО.МУЗЫКА
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category sidebar */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="lg:w-56 flex-shrink-0">
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
            {categories.map(([key, data]) => {
              const Icon = data.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === key
                      ? 'bg-[#FF577F]/20 text-[#FF577F] border border-[#FF577F]/30'
                      : 'bg-white/[0.03] text-slate-500 border border-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {data.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {currentData.items.map((item, i) => {
                const itemKey = `${activeCategory}-${i}`;
                const isOpen = openItems.has(itemKey);
                return (
                  <motion.div
                    key={itemKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(itemKey)}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 text-left group"
                    >
                      <span className={`text-sm font-bold transition-colors ${isOpen ? 'text-[#FF577F]' : 'text-white group-hover:text-[#FF577F]'}`}>
                        {item.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 ml-3"
                      >
                        <ChevronDown className={`w-4 h-4 ${isOpen ? 'text-[#FF577F]' : 'text-slate-600'}`} />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 sm:mt-16 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 sm:p-8 text-center"
      >
        <MessageSquare className="w-8 h-8 text-[#FF577F] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Не нашли ответ?</h3>
        <p className="text-sm text-slate-400 mb-5">Напишите нам, и мы ответим в течение 24 часов</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white font-bold text-sm shadow-lg shadow-[#FF577F]/20">
          <MessageSquare className="w-4 h-4" />
          Написать в поддержку
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}