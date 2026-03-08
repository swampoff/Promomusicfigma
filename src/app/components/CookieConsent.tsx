import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'soulfm_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
      style={{ animation: 'cookieSlideUp 0.5s ease-out' }}
    >
      <style>{`
        @keyframes cookieSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div className="max-w-4xl mx-auto bg-[#0d1a2d]/95 backdrop-blur-xl border border-[#00d9ff]/20 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,217,255,0.1)] flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-cyan-100/80 leading-relaxed">
          <span className="text-white font-medium">Мы обрабатываем cookies</span>, чтобы сделать наш сайт удобнее и персонализированнее для вас.{' '}
          <a
            href="/about#privacy"
            className="text-[#00d9ff] hover:text-[#00ffaa] underline underline-offset-2 transition-colors"
          >
            Подробнее: политика использования cookies и защита данных
          </a>.
        </div>
        <button
          onClick={handleAccept}
          className="shrink-0 px-6 py-2.5 bg-gradient-to-r from-[#00d9ff] to-[#00ffaa] text-slate-900 font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all duration-300 cursor-pointer"
        >
          Принять
        </button>
      </div>
    </div>
  );
}
