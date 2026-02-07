/**
 * TERMS PAGE - Условия использования
 * Правовые условия предоставления услуг
 */

import { motion } from 'motion/react';
import { FileText, Scale, AlertTriangle, CheckCircle2, XCircle, DollarSign, Shield, Users } from 'lucide-react';

export function TermsPage() {
  const sections = [
    {
      title: '1. Принятие условий',
      icon: CheckCircle2,
      content: [
        'Используя Promo.Music, вы соглашаетесь с настоящими Условиями использования.',
        'Если вы не согласны с условиями, пожалуйста, не используйте наш сервис.',
        'Мы можем обновлять условия с уведомлением за 30 дней для существенных изменений.',
        'Продолжение использования после изменений означает согласие с новыми условиями.'
      ]
    },
    {
      title: '2. Учетная запись',
      icon: Users,
      content: [
        'Для использования сервиса необходимо создать учетную запись.',
        'Вы должны быть старше 18 лет или иметь согласие родителей (13-18 лет).',
        'Вы несете ответственность за конфиденциальность пароля.',
        'Запрещено создавать несколько аккаунтов для обхода ограничений.',
        'Мы оставляем право приостановить или удалить аккаунт при нарушении условий.',
        'При подозрении на взлом немедленно свяжитесь с нами: security@promo.music'
      ]
    },
    {
      title: '3. Услуги и тарифы',
      icon: DollarSign,
      content: [
        'Мы предоставляем услуги тестирования треков, радиопродвижения и аналитики.',
        'Для артистов: тарифы Basic ($49/мес), Standard ($99/мес), Professional ($199/мес).',
        'Для радиостанций: все функции бесплатны навсегда.',
        'Для заведений: тарифы Basic ($99/мес), Premium ($199/мес), Enterprise (от $299/мес).',
        'Цены могут меняться с уведомлением за 30 дней для текущих подписчиков.',
        'Оплата производится через Stripe или PayPal. Возврат в течение 14 дней.',
        'Бесплатный пробный период: 14 дней для артистов, 30 дней для заведений.'
      ]
    },
    {
      title: '4. Интеллектуальная собственность',
      icon: Shield,
      content: [
        'Вы сохраняете все права на загруженный контент (треки, обложки, метаданные).',
        'Загружая контент, вы предоставляете нам лицензию на использование для предоставления услуг.',
        'Запрещено загружать контент, нарушающий авторские права третьих лиц.',
        'Мы удаляем контент по запросу правообладателя (DMCA процедура).',
        'Товарные знаки Promo.Music принадлежат нам и защищены законом.',
        'Использование нашего логотипа, названия, дизайна без разрешения запрещено.'
      ]
    },
    {
      title: '5. Запрещенные действия',
      icon: XCircle,
      content: [
        'Загрузка нелегального, оскорбительного, порнографического контента.',
        'Попытки взлома, DDoS-атак, SQL-инъекций и других хакерских действий.',
        'Спам, рассылка вирусов, фишинг, мошенничество.',
        'Использование ботов, скриптов для накрутки статистики.',
        'Копирование, декомпиляция, реверс-инжиниринг нашего ПО.',
        'Перепродажа наших услуг без письменного разрешения.',
        'Импersonация других пользователей или представителей компании.'
      ]
    },
    {
      title: '6. Модерация контента',
      icon: Shield,
      content: [
        'Мы модерируем загруженный контент на соответствие правилам.',
        'Модерация занимает до 24 часов (экспресс - до 2 часов на Premium).',
        'Отклоненный контент: нарушение авторских прав, низкое качество, неприемлемая тематика.',
        'При отклонении мы предоставляем причину и возможность исправить.',
        'Повторные нарушения (3+) ведут к ограничению или блокировке аккаунта.',
        'Вы можете обжаловать решение модераторов: appeals@promo.music'
      ]
    },
    {
      title: '7. Ограничение ответственности',
      icon: AlertTriangle,
      content: [
        'Услуги предоставляются "КАК ЕСТЬ" без гарантий качества результатов.',
        'Мы не гарантируем, что ваш трек станет хитом после тестирования.',
        'Мы не несем ответственности за действия третьих лиц (радиостанции, заведения).',
        'Максимальная сумма возмещения ограничена суммой, уплаченной за последние 12 месяцев.',
        'Мы не несем ответственности за упущенную выгоду, косвенные убытки.',
        'Мы не гарантируем бесперебойную работу сервиса (целевой uptime 99.9%).',
        'Плановые технические работы проводятся с уведомлением за 48 часов.'
      ]
    },
    {
      title: '8. Возврат средств',
      icon: DollarSign,
      content: [
        'Возврат возможен в течение 14 дней с момента покупки.',
        'Для подписок: возврат пропорционален неиспользованному периоду.',
        'Для разовых услуг: возврат 100% если услуга не была оказана.',
        'Частичный возврат (50%): если услуга оказана частично или вы не удовлетворены.',
        'Возврат невозможен: если вы нарушили условия и аккаунт заблокирован.',
        'Запрос возврата: refunds@promo.music, обработка до 7 рабочих дней.',
        'Деньги возвращаются тем же способом, которым была произведена оплата.'
      ]
    },
    {
      title: '9. Прекращение услуг',
      icon: XCircle,
      content: [
        'Вы можете отменить подписку в любое время в настройках аккаунта.',
        'Отмена вступает в силу в конце текущего расчетного периода.',
        'Мы можем приостановить услуги при неоплате в течение 7 дней.',
        'Мы можем прекратить услуги при серьезном нарушении условий (с уведомлением).',
        'При удалении аккаунта все данные удаляются в течение 30 дней.',
        'Резервные копии для восстановления хранятся 90 дней после удаления.'
      ]
    },
    {
      title: '10. Разрешение споров',
      icon: Scale,
      content: [
        'Применимое право: законодательство штата Калифорния, США.',
        'Досудебное урегулирование: обязательная попытка решить спор переговорами.',
        'Арбитраж: споры на сумму до $10,000 решаются через арбитраж (AAA).',
        'Судебное разбирательство: для споров свыше $10,000 - суды Сан-Франциско, Калифорния.',
        'Отказ от коллективных исков: споры решаются индивидуально, не класс-экшн.',
        'Срок исковой давности: 1 год с момента возникновения претензии.'
      ]
    },
    {
      title: '11. Форс-мажор',
      icon: AlertTriangle,
      content: [
        'Мы не несем ответственности за неисполнение обязательств из-за форс-мажора.',
        'Форс-мажор: войны, стихийные бедствия, пандемии, террористические акты.',
        'Технические форс-мажоры: отключения AWS, DDoS от третьих лиц, интернет-сбои.',
        'При форс-мажоре мы уведомляем пользователей и предлагаем компенсацию (продление подписки).'
      ]
    },
    {
      title: '12. Контакты и уведомления',
      icon: FileText,
      content: [
        'Юридический адрес: 123 Music Street, Suite 100, San Francisco, CA 94103, USA',
        'Email для юридических вопросов: legal@promo.music',
        'Email для жалоб по авторским правам (DMCA): dmca@promo.music',
        'Все уведомления направляются на email, указанный при регистрации.',
        'Вы обязаны поддерживать актуальность контактных данных.',
        'Дата последнего обновления условий: 07 февраля 2026 года.'
      ]
    }
  ];

  const keyPoints = [
    {
      icon: CheckCircle2,
      title: '14 дней возврат',
      description: 'Гарантия возврата средств'
    },
    {
      icon: Shield,
      title: 'Ваши права защищены',
      description: 'Справедливые условия'
    },
    {
      icon: Scale,
      title: 'Прозрачность',
      description: 'Понятные правила'
    },
    {
      icon: Users,
      title: 'Поддержка 24/7',
      description: 'Всегда на связи'
    }
  ];

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
              <Scale className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-bold">Обновлено 07.02.2026</span>
            </div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-6 leading-[1.1]">
              Условия <span className="bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] bg-clip-text text-transparent">использования</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Правила и условия использования платформы Promo.Music
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* KEY POINTS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyPoints.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#FF577F]/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-[#FF577F]" />
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-[#FF577F]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black pt-2">{section.title}</h2>
              </div>
              <ul className="space-y-3 ml-16">
                {section.content.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-sm sm:text-base text-slate-300 leading-relaxed flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF577F] flex-shrink-0 mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CONTACT CTA */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 rounded-2xl p-8 border border-[#FF577F]/30 text-center"
        >
          <Scale className="w-12 h-12 mx-auto mb-4 text-[#FF577F]" />
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Вопросы по условиям?
          </h3>
          <p className="text-slate-300 mb-6">
            Свяжитесь с нами: legal@promo.music
          </p>
          <p className="text-xs text-slate-500">
            Наша юридическая команда ответит в течение 48 часов
          </p>
        </motion.div>
      </div>

    </div>
  );
}
