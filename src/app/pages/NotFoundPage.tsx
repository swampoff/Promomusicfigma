import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-black text-white/10 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Страница не найдена</h1>
        <p className="text-gray-400 mb-8">Такой страницы не существует или она была перемещена.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Home className="w-5 h-5" />
          На главную
        </button>
      </div>
    </div>
  );
}
