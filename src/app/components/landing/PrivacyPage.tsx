/**
 * PRIVACY PAGE - Политика конфиденциальности
 * Правовая информация о защите данных пользователей
 */

import { motion } from 'motion/react';
import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export function PrivacyPage() {
  const sections = [
    {
      title: '1. Сбор информации',
      icon: Database,
      content: [
        'Мы собираем информацию, которую вы предоставляете при регистрации: имя, email, телефон.',
        'Автоматически собираемые данные: IP-адрес, тип устройства, браузер, геолокация.',
        'Информация об использовании: загруженные треки, аналитика, статистика прослушиваний.',
        'Платежная информация обрабатывается через защищенные платежные системы (Т-Банк, ЮKassa).'
      ]
    },
    {
      title: '2. Использование данных',
      icon: Eye,
      content: [
        'Предоставление и улучшение наших услуг (тестирование треков, аналитика).',
        'Персонализация контента и рекомендаций на основе ваших предпочтений.',
        'Отправка уведомлений о статусе заказов, новых функциях, специальных предложениях.',
        'Обработка платежей и предотвращение мошенничества.',
        'Соблюдение законодательных требований и защита наших прав.'
      ]
    },
    {
      title: '3. Защита данных',
      icon: Lock,
      content: [
        'Шифрование данных при передаче (SSL/TLS 256-bit).',
        'Хранение паролей в зашифрованном виде (bcrypt с солью).',
        'Двухфакторная аутентификация (2FA) для дополнительной защиты.',
        'Регулярные аудиты безопасности и тестирование на проникновение.',
        'Ограниченный доступ к данным для сотрудников (need-to-know basis).',
        'Резервное копирование данных в защищенных дата-центрах.'
      ]
    },
    {
      title: '4. Передача третьим лицам',
      icon: UserCheck,
      content: [
        'Мы НЕ продаем ваши персональные данные третьим лицам.',
        'Передача данных партнерам только с вашего согласия (радиостанциям, заведениям).',
        'Использование сервисов для аналитики (Google Analytics - анонимизированные данные).',
        'Платежные системы: Т-Банк, ЮKassa (соответствуют PCI DSS).',
        'Облачные провайдеры: AWS, Supabase (сертифицированы SOC 2, ISO 27001).',
        'Раскрытие по требованию закона при наличии судебного решения.'
      ]
    },
    {
      title: '5. Cookies и трекинг',
      icon: AlertCircle,
      content: [
        'Мы используем cookies для улучшения пользовательского опыта.',
        'Обязательные cookies: аутентификация, безопасность, функциональность.',
        'Аналитические cookies: Google Analytics (можно отключить).',
        'Маркетинговые cookies: ретаргетинг, персонализация рекламы (с согласия).',
        'Вы можете управлять cookies через настройки браузера.'
      ]
    },
    {
      title: '6. Ваши права',
      icon: CheckCircle2,
      content: [
        'Право на доступ: получить копию всех своих данных.',
        'Право на исправление: изменить неверную информацию.',
        'Право на удаление: удалить свой аккаунт и все данные (право на забвение).',
        'Право на ограничение обработки: приостановить использование данных.',
        'Право на переносимость: экспортировать данные в машиночитаемом формате.',
        'Право на отзыв согласия: отказаться от маркетинговых рассылок.',
        'Право на возражение: возразить против автоматизированной обработки.'
      ]
    },
    {
      title: '7. Хранение данных',
      icon: Database,
      content: [
        'Активные аккаунты: данные хранятся бессрочно до удаления аккаунта.',
        'Неактивные аккаунты: после 2 лет неактивности мы можем удалить данные.',
        'Удаленные аккаунты: полное удаление в течение 30 дней (кроме данных для бухгалтерии).',
        'Финансовые данные: хранятся 7 лет согласно налоговому законодательству.',
        'Логи безопасности: хранятся 90 дней для расследования инцидентов.'
      ]
    },
    {
      title: '8. Международная передача',
      icon: Shield,
      content: [
        'Данные пользователей хранятся и обрабатываются на территории Российской Федерации.',
        'При необходимости передачи данных за рубеж применяются дополнительные меры защиты.',
        'Все провайдеры соответствуют GDPR и другим международным стандартам.',
        'Обработка данных ведётся в соответствии с ФЗ-152 «О персональных данных».'
      ]
    },
    {
      title: '9. Несовершеннолетние',
      icon: UserCheck,
      content: [
        'Наши услуги предназначены для лиц старше 18 лет.',
        'Мы не собираем намеренно данные детей младше 13 лет.',
        'Для пользователей 13-18 лет требуется согласие родителей.',
        'При обнаружении данных несовершеннолетних мы удаляем их незамедлительно.'
      ]
    },
    {
      title: '10. Изменения в политике',
      icon: FileText,
      content: [
        'Мы можем обновлять эту политику конфиденциальности.',
        'Существенные изменения: уведомление по email за 30 дней.',
        'Несущественные изменения: публикация на сайте с обновлением даты.',
        'Дата последнего обновления: 15 февраля 2026 года.',
        'Продолжение использования сервиса означает согласие с обновлениями.'
      ]
    }
  ];

  const highlights = [
    {
      icon: Shield,
      title: 'ФЗ-152',
      description: 'Соответствие закону о персональных данных'
    },
    {
      icon: Lock,
      title: 'SSL 256-bit',
      description: 'Шифрование всех данных'
    },
    {
      icon: Database,
      title: 'PCI DSS',
      description: 'Безопасность платежей'
    },
    {
      icon: UserCheck,
      title: 'Ваши права',
      description: 'Полный контроль над данными'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white pb-12 sm:pb-16 md:pb-20">
      
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
              <Shield className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-bold">Обновлено 15.02.2026</span>
            </div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-6 leading-[1.1]">
              Политика <span className="bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] bg-clip-text text-transparent">конфиденциальности</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Мы серьезно относимся к защите ваших персональных данных
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* HIGHLIGHTS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => (
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
          <FileText className="w-12 h-12 mx-auto mb-4 text-[#FF577F]" />
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Остались вопросы?
          </h3>
          <p className="text-slate-300 mb-6">
            Свяжитесь с нами: privacy@promo.music
          </p>
          <p className="text-xs text-slate-500">
            Мы ответим в течение 48 часов
          </p>
        </motion.div>
      </div>

    </div>
  );
}