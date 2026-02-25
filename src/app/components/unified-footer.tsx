/**
 * UNIFIED FOOTER - Единый футер для всех кабинетов и публичных страниц
 * Логотип всегда ведёт на главную публичную страницу (/)
 * Колонки: Логотип + описание | Продукт | Ресурсы | Компания
 * Нижняя строка: копирайт + статус + юр. ссылки
 * Все текстовые элементы через inline style чтобы не конфликтовать с theme.css
 */

import { useNavigate } from 'react-router';
import { PromoLogo } from '@/app/components/promo-logo';
import { GlassTelegram, GlassVK, GlassYoutube } from '@/app/components/landing/GlassSocialIcons';

interface UnifiedFooterProps {
  /** Для лендинга: кастомный обработчик навигации вместо react-router navigate */
  onNavigate?: (path: string) => void;
  /** Дополнительный padding снизу (напр. для плеера) */
  className?: string;
}

const productLinks = [
  { label: 'Радиостанциям', path: '/for-business' },
  { label: 'ПРОМО.ЭИР', path: '/promo-air' },
  { label: 'ПРОМО.ЛАБ', path: '/promo-lab' },
  { label: 'ПРОМО.ГИД', path: '/promo-guide' },
  { label: 'Телеканалам', path: '/for-tv' },
  { label: 'Лейблам', path: '/for-labels' },
  { label: 'СМИ', path: '/for-media' },
  { label: 'Блогерам', path: '/for-bloggers' },
  { label: 'Чарты', path: '/charts' },
  { label: 'Концерты', path: '/concerts' },
];

const resourceLinks = [
  { label: 'ПРОМО.ГИД', path: '/promo-guide' },
  { label: 'Блог', path: '/news' },
  { label: 'Поддержка', path: '/support-info' },
  { label: 'Документация', path: '/docs' },
  { label: 'API', path: '/docs' },
];

const companyLinks = [
  { label: 'О нас', path: '/about' },
  { label: 'Карьера', path: '/careers' },
  { label: 'Новости', path: '/news' },
  { label: 'Партнеры', path: '/partners' },
  { label: 'Инвесторам', path: '/investors' },
  { label: 'Контакты', path: '/contact' },
];

const legalLinks = [
  { label: 'Политика конфиденциальности', path: '/privacy' },
  { label: 'Условия использования', path: '/user-agreement' },
  { label: 'Обработка данных', path: '/consent' },
];

export function UnifiedFooter({ onNavigate, className = '' }: UnifiedFooterProps) {
  const navigate = useNavigate();

  const navTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <footer className={`relative w-full bg-black ${className}`}>
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#FF577F]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 lg:px-16 py-10 xs:py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-8 sm:gap-12 mb-8 xs:mb-10 sm:mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 lg:col-span-1 mb-4 lg:mb-0">
            <PromoLogo
              size="md"
              animated={false}
              subtitle="МУЗЫКА"
              className="mb-3 xs:mb-4"
              customClasses={{
                logo: 'h-10 w-10 xs:h-12 xs:w-12',
                promo: 'text-[22px] xs:text-[26px]',
                subtitle: 'text-[10px] xs:text-xs',
                gap: 'gap-2 xs:gap-3',
              }}
              onClick={goHome}
              title="На главную"
            />
            <p
              className="text-slate-400 leading-relaxed max-w-xs mb-5"
              style={{ fontSize: '0.8125rem' }}
            >
              Маркетинговая экосистема для музыкантов. Продвигай музыку, попадай в ротацию, расти.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2.5">
              <GlassTelegram />
              <GlassVK />
              <GlassYoutube />
            </div>
          </div>

          {/* Продукт */}
          <div className="min-w-0">
            <div
              className="text-white font-bold mb-3 xs:mb-4"
              style={{ fontSize: '0.8125rem', lineHeight: 1.5, letterSpacing: 'normal' }}
            >
              Продукт
            </div>
            <ul className="space-y-1.5 xs:space-y-2">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <span
                    role="button"
                    onClick={() => navTo(item.path)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    style={{ fontSize: '0.8125rem', fontWeight: 400 }}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ресурсы */}
          <div className="min-w-0">
            <div
              className="text-white font-bold mb-3 xs:mb-4"
              style={{ fontSize: '0.8125rem', lineHeight: 1.5, letterSpacing: 'normal' }}
            >
              Ресурсы
            </div>
            <ul className="space-y-1.5 xs:space-y-2">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <span
                    role="button"
                    onClick={() => navTo(item.path)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    style={{ fontSize: '0.8125rem', fontWeight: 400 }}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Компания */}
          <div className="min-w-0">
            <div
              className="text-white font-bold mb-3 xs:mb-4"
              style={{ fontSize: '0.8125rem', lineHeight: 1.5, letterSpacing: 'normal' }}
            >
              Компания
            </div>
            <ul className="space-y-1.5 xs:space-y-2">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <span
                    role="button"
                    onClick={() => navTo(item.path)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    style={{ fontSize: '0.8125rem', fontWeight: 400 }}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 xs:pt-7 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 xs:gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="text-slate-500" style={{ fontSize: '0.75rem' }}>
              &copy; 2026 ПРОМО.МУЗЫКА. Все права защищены.
            </span>
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500/60" style={{ fontSize: '0.625rem' }}>
                Все системы работают
              </span>
            </div>
          </div>
          <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4 sm:gap-6 text-slate-500">
            {legalLinks.map((item) => (
              <span
                key={item.label}
                role="button"
                onClick={() => navTo(item.path)}
                className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                style={{ fontSize: '0.75rem' }}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}