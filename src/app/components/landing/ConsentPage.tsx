/**
 * CONSENT PAGE - Согласие на обработку персональных данных
 * В соответствии с ФЗ-152 «О персональных данных»
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield, FileText, Database, UserCheck, Clock, AlertCircle,
  CheckCircle2, ChevronDown, ChevronUp, Printer, Download,
} from 'lucide-react';

const COMPANY_NAME = 'ООО «Промо Мьюзик»';
const COMPANY_ADDRESS = 'г. Москва, ул. Примерная, д. 1, офис 100';
const COMPANY_INN = '7700000000';
const EFFECTIVE_DATE = '15 февраля 2026 г.';

interface Section {
  id: string;
  title: string;
  icon: typeof Shield;
  content: string[];
}

const sections: Section[] = [
  {
    id: 'operator',
    title: '1. Оператор персональных данных',
    icon: Shield,
    content: [
      `Оператор персональных данных: ${COMPANY_NAME}, ИНН ${COMPANY_INN}.`,
      `Адрес: ${COMPANY_ADDRESS}.`,
      'Контактный email для вопросов по обработке данных: privacy@promo.music.',
      'Ответственное лицо за обработку данных: Отдел информационной безопасности.',
    ],
  },
  {
    id: 'data-list',
    title: '2. Перечень обрабатываемых данных',
    icon: Database,
    content: [
      'Фамилия, имя, отчество (при наличии).',
      'Адрес электронной почты (email).',
      'Номер телефона (при предоставлении).',
      'Творческий псевдоним (сценическое имя).',
      'Город проживания.',
      'Фотография профиля (при загрузке).',
      'Данные о музыкальной деятельности: жанры, треки, портфолио.',
      'Платежные данные: реквизиты для приёма оплаты (обрабатываются через Т-Банк и ЮKassa).',
      'Технические данные: IP-адрес, тип устройства, браузер, операционная система.',
      'Данные аналитики: статистика прослушиваний, активность на платформе.',
    ],
  },
  {
    id: 'purposes',
    title: '3. Цели обработки',
    icon: FileText,
    content: [
      'Регистрация и идентификация пользователя на платформе Promo.music.',
      'Предоставление доступа к функциям платформы: личный кабинет, маркетплейс, аналитика.',
      'Обработка заказов и платежей за услуги (тестирование треков, подписки, бронирования).',
      'Обеспечение связи между пользователями платформы (артисты, звукоинженеры, радиостанции, заведения).',
      'Формирование публичного профиля пользователя (имя, город, жанры, портфолио).',
      'Отправка уведомлений о статусе заказов, изменениях на платформе, технических работах.',
      'Улучшение работы платформы на основе анонимизированной аналитики.',
      'Исполнение требований законодательства Российской Федерации.',
    ],
  },
  {
    id: 'methods',
    title: '4. Способы обработки',
    icon: UserCheck,
    content: [
      'Сбор, запись, систематизация, накопление, хранение персональных данных.',
      'Уточнение (обновление, изменение) данных по запросу пользователя.',
      'Извлечение, использование, передача (предоставление, доступ) данных.',
      'Обезличивание, блокирование, удаление, уничтожение данных.',
      'Автоматизированная обработка с использованием средств вычислительной техники.',
      'Неавтоматизированная обработка персональных данных (при необходимости).',
      'Трансграничная передача данных не осуществляется, данные хранятся на территории РФ.',
    ],
  },
  {
    id: 'third-parties',
    title: '5. Передача данных третьим лицам',
    icon: AlertCircle,
    content: [
      'Платежные системы (Т-Банк, ЮKassa) - для обработки платежей в рамках оказания услуг.',
      'Облачные провайдеры (Supabase, AWS) - для хранения данных в защищенных дата-центрах.',
      'Другие пользователи платформы - только данные публичного профиля (имя, город, жанры).',
      'Государственные органы - исключительно по запросу в рамках действующего законодательства.',
      'Персональные данные НЕ передаются третьим лицам в маркетинговых целях без отдельного согласия.',
    ],
  },
  {
    id: 'storage',
    title: '6. Сроки хранения',
    icon: Clock,
    content: [
      'Персональные данные хранятся на протяжении всего срока действия учетной записи пользователя.',
      'При удалении аккаунта данные уничтожаются в течение 30 календарных дней.',
      'Данные финансовых операций хранятся 7 лет в соответствии с налоговым законодательством.',
      'Логи безопасности хранятся 90 дней для расследования инцидентов.',
      'Обезличенные аналитические данные могут храниться бессрочно.',
    ],
  },
  {
    id: 'rights',
    title: '7. Права субъекта персональных данных',
    icon: CheckCircle2,
    content: [
      'Получить информацию об обработке своих персональных данных (ст. 14 ФЗ-152).',
      'Требовать уточнения, блокирования или уничтожения данных (ст. 14 ФЗ-152).',
      'Отозвать настоящее согласие путём направления письменного заявления на privacy@promo.music.',
      'Обжаловать действия оператора в Роскомнадзор или в судебном порядке.',
      'При отзыве согласия оператор прекращает обработку данных в течение 30 дней.',
      'Отзыв согласия не влияет на законность обработки, проведённой до момента отзыва.',
    ],
  },
];

export function ConsentPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map((s) => [s.id, true]))
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white pb-12 sm:pb-16 md:pb-20">
      {/* Header */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-14">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-green-500 rounded-full"
            style={{ filter: 'blur(120px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-1/4 right-1/3 w-[350px] h-[250px] bg-emerald-500 rounded-full"
            style={{ filter: 'blur(100px)' }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-bold text-green-400 mb-6">
              <Shield className="w-3.5 h-3.5" />
              ФЗ-152 «О ПЕРСОНАЛЬНЫХ ДАННЫХ»
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Согласие на обработку{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                персональных данных
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-4">
              Настоящее согласие даётся в соответствии с Федеральным законом от 27.07.2006
              N 152-ФЗ «О персональных данных» на обработку персональных данных оператором
              {' '}{COMPANY_NAME}
            </p>
            <p className="text-xs text-slate-500">
              Дата вступления в силу: {EFFECTIVE_DATE}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Actions */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Распечатать
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            Сохранить PDF
          </motion.button>
        </div>
      </div>

      {/* Intro block */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10"
        >
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Я, субъект персональных данных (далее - Пользователь), действуя свободно, своей волей и в своём
            интересе, а также подтверждая свою дееспособность, даю своё согласие {COMPANY_NAME}{' '}
            (далее - Оператор) на обработку моих персональных данных на следующих условиях:
          </p>
        </motion.div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 space-y-4">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <h3 className="flex-1 text-sm sm:text-base font-bold text-white">
                {section.title}
              </h3>
              {expandedSections[section.id] ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
              )}
            </button>

            {expandedSections[section.id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-4 sm:px-5 pb-4 sm:pb-5"
              >
                <ul className="space-y-2.5 ml-[52px] sm:ml-[56px]">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400/70 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 sm:p-6"
        >
          <h4 className="text-sm sm:text-base font-bold text-green-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Важная информация
          </h4>
          <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              Настоящее согласие действует с момента его предоставления и до момента отзыва.
              Согласие может быть отозвано субъектом персональных данных путём направления
              письменного заявления на адрес электронной почты:{' '}
              <span className="text-green-400">privacy@promo.music</span>.
            </p>
            <p>
              При отзыве согласия Оператор прекращает обработку персональных данных и уничтожает
              их в течение 30 (тридцати) календарных дней с момента получения заявления, за исключением
              данных, хранение которых предусмотрено законодательством Российской Федерации.
            </p>
            <p>
              Принимая данное согласие при регистрации на платформе Promo.music, Пользователь
              подтверждает, что ознакомлен с условиями обработки персональных данных, понимает
              их и согласен с ними.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Legal footer */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 mt-6">
        <div className="text-center text-[10px] sm:text-xs text-slate-500 space-y-1">
          <p>{COMPANY_NAME} | ИНН {COMPANY_INN}</p>
          <p>{COMPANY_ADDRESS}</p>
          <p>Дата последнего обновления: {EFFECTIVE_DATE}</p>
        </div>
      </div>
    </div>
  );
}
