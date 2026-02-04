/**
 * WHO'S HERE NOW - Социальный слой для venue
 * Показывает кто сейчас в venue, совпадение вкусов, возможность познакомиться
 */

import { useState } from 'react';
import { Users, Heart, MessageCircle, Send, Star, Music, MapPin, Award, Sparkles, Coffee, Wine } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// ==============================================
// TYPES
// ==============================================
interface UserProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio?: string;
  level: number;
  badges: string[];
  
  // Music taste
  favoriteGenres: string[];
  favoriteArtists: string[];
  
  // Compatibility
  musicCompatibility: number; // 0-100
  commonGenres: string[];
  commonArtists: string[];
  
  // Location
  locationInVenue?: string;
  openToConnect: boolean;
  
  // Status
  currentMood?: string;
}

interface WhoIsHereProps {
  venueId: string;
  venueName: string;
  currentUserId: string;
}

// ==============================================
// MOCK DATA
// ==============================================
const mockUsers: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Алексей',
    age: 28,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    bio: 'Фанат джаза и виниловых пластинок 🎷',
    level: 3,
    badges: ['Jazz Lover', 'Night Owl', 'Vinyl Hunter'],
    favoriteGenres: ['Jazz', 'Soul', 'Neo-Soul'],
    favoriteArtists: ['Miles Davis', 'John Coltrane', 'Norah Jones'],
    musicCompatibility: 94,
    commonGenres: ['Jazz', 'Soul'],
    commonArtists: ['Miles Davis', 'John Coltrane'],
    locationInVenue: 'За барой',
    openToConnect: true,
    currentMood: 'Обожаю этот трек! 🔥'
  },
  {
    id: 'user-2',
    name: 'Мария',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    bio: 'Певица, ищу коллаборации',
    level: 4,
    badges: ['Music Explorer', 'Early Bird', 'Jazz Lover'],
    favoriteGenres: ['Jazz', 'Indie', 'Alternative'],
    favoriteArtists: ['Billie Holiday', 'Norah Jones', 'Amy Winehouse'],
    musicCompatibility: 87,
    commonGenres: ['Jazz'],
    commonArtists: ['Norah Jones'],
    locationInVenue: 'Community Table',
    openToConnect: true,
    currentMood: 'Ищу джем-партнеров! 🎤'
  },
  {
    id: 'user-3',
    name: 'Дмитрий',
    age: 32,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    bio: 'Музыкальный продюсер',
    level: 3,
    badges: ['Techno Head', 'Night Owl'],
    favoriteGenres: ['Jazz', 'Blues', 'Funk'],
    favoriteArtists: ['Miles Davis', 'Herbie Hancock'],
    musicCompatibility: 78,
    commonGenres: ['Jazz'],
    commonArtists: ['Miles Davis'],
    openToConnect: true
  },
  {
    id: 'user-4',
    name: 'Анна',
    age: 27,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    bio: 'DJ и коллекционер винила',
    level: 2,
    badges: ['Vinyl Hunter'],
    favoriteGenres: ['Jazz', 'Soul', 'R&B'],
    favoriteArtists: ['Ella Fitzgerald', 'Billie Holiday'],
    musicCompatibility: 82,
    commonGenres: ['Jazz', 'Soul'],
    commonArtists: [],
    locationInVenue: 'У окна',
    openToConnect: true
  }
];

// ==============================================
// MAIN COMPONENT
// ==============================================
export function WhoIsHere({ venueId, venueName, currentUserId }: WhoIsHereProps) {
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Sort by compatibility
  const sortedUsers = [...users].sort((a, b) => b.musicCompatibility - a.musicCompatibility);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Кто здесь сейчас
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {users.length} {users.length === 1 ? 'человек' : 'людей'} из Promo.Guide в {venueName}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowChat(true)}
          className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Venue Chat
        </Button>
      </div>

      {/* Top Match */}
      {sortedUsers[0] && sortedUsers[0].musicCompatibility >= 85 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 border border-purple-500/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Лучшее совпадение!</span>
          </div>
          <UserCard user={sortedUsers[0]} onSelect={() => setSelectedUser(sortedUsers[0])} isTopMatch />
        </motion.div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 gap-4">
        {sortedUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <UserCard user={user} onSelect={() => setSelectedUser(user)} />
          </motion.div>
        ))}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            venueId={venueId}
          />
        )}
      </AnimatePresence>

      {/* Venue Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <VenueChatModal
            venueId={venueId}
            venueName={venueName}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==============================================
// USER CARD
// ==============================================
function UserCard({ user, onSelect, isTopMatch = false }: { user: UserProfile; onSelect: () => void; isTopMatch?: boolean }) {
  const compatibilityColor = 
    user.musicCompatibility >= 90 ? 'text-green-400' :
    user.musicCompatibility >= 80 ? 'text-blue-400' :
    user.musicCompatibility >= 70 ? 'text-yellow-400' :
    'text-slate-400';

  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Photo */}
        <div className="relative flex-shrink-0">
          <img
            src={user.photo}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/50"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-950">
            {user.level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name & Age */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
              {user.name}, {user.age}
            </h3>
            {user.level >= 3 && (
              <Award className="w-4 h-4 text-amber-400" />
            )}
          </div>

          {/* Compatibility */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-1 ${compatibilityColor}`}>
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold">{user.musicCompatibility}%</span>
            </div>
            <span className="text-xs text-slate-400">совпадение вкусов</span>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-slate-300 mb-2">{user.bio}</p>
          )}

          {/* Common Genres */}
          {user.commonGenres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {user.commonGenres.map((genre) => (
                <Badge key={genre} variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* Location & Mood */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {user.locationInVenue && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{user.locationInVenue}</span>
              </div>
            )}
            {user.currentMood && (
              <div className="flex items-center gap-1">
                <Music className="w-3 h-3" />
                <span className="text-purple-300">{user.currentMood}</span>
              </div>
            )}
          </div>

          {/* Badges */}
          {user.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.badges.slice(0, 3).map((badge) => (
                <span key={badge} className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={(e) => {
              e.stopPropagation();
              toast.success(`Вы помахали ${user.name}!`);
            }}
          >
            👋
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-purple-500/30 text-purple-300"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ==============================================
// USER DETAIL MODAL
// ==============================================
function UserDetailModal({ user, onClose, venueId }: { user: UserProfile; onClose: () => void; venueId: string }) {
  const [showDrinkMenu, setShowDrinkMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-white/10"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-start gap-4">
            <img
              src={user.photo}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/50"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.name}, {user.age}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 text-green-400">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="text-lg font-semibold">{user.musicCompatibility}%</span>
                </div>
                <span className="text-sm text-slate-400">совпадение вкусов</span>
              </div>
              {user.bio && (
                <p className="text-sm text-slate-300">{user.bio}</p>
              )}
            </div>
            <Button variant="ghost" onClick={onClose} className="text-slate-400">
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location & Status */}
          {user.locationInVenue && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-300">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Сейчас: {user.locationInVenue}</span>
              </div>
            </div>
          )}

          {user.currentMood && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center gap-2 text-purple-300">
                <Music className="w-5 h-5" />
                <span>{user.currentMood}</span>
              </div>
            </div>
          )}

          {/* Music Taste */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Музыкальные вкусы</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-400 mb-2">Любимые жанры:</div>
                <div className="flex flex-wrap gap-2">
                  {user.favoriteGenres.map((genre) => (
                    <Badge 
                      key={genre} 
                      className={`${
                        user.commonGenres.includes(genre)
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                          : 'bg-slate-500/10 border-slate-500/30 text-slate-300'
                      }`}
                    >
                      {genre}
                      {user.commonGenres.includes(genre) && ' ✓'}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-2">Любимые артисты:</div>
                <div className="flex flex-wrap gap-2">
                  {user.favoriteArtists.map((artist) => (
                    <Badge 
                      key={artist}
                      className={`${
                        user.commonArtists.includes(artist)
                          ? 'bg-green-500/20 border-green-500/50 text-green-300'
                          : 'bg-slate-500/10 border-slate-500/30 text-slate-300'
                      }`}
                    >
                      {artist}
                      {user.commonArtists.includes(artist) && ' ✓'}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Достижения</h3>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge) => (
                <div key={badge} className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium">
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold text-white">
                {user.level}
              </div>
              <div>
                <div className="text-sm text-slate-400">Уровень</div>
                <div className="text-white font-semibold">
                  {user.level === 1 && 'Beginner'}
                  {user.level === 2 && 'Explorer'}
                  {user.level === 3 && 'Connoisseur'}
                  {user.level === 4 && 'Legend'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                toast.success(`Вы помахали ${user.name}!`);
              }}
            >
              👋 Помахать
            </Button>
            <Button
              className="bg-pink-600 hover:bg-pink-700 text-white"
              onClick={() => setShowDrinkMenu(true)}
            >
              🍷 Предложить выпить
            </Button>
            <Button
              variant="outline"
              className="border-purple-500/30 text-purple-300 col-span-2"
              onClick={() => {
                toast.success(`Начат чат с ${user.name}`);
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Начать чат
            </Button>
          </div>
        </div>

        {/* Drink Menu */}
        <AnimatePresence>
          {showDrinkMenu && (
            <DrinkMenu
              userName={user.name}
              onClose={() => setShowDrinkMenu(false)}
              onSend={(drink) => {
                toast.success(`Предложение отправлено ${user.name}!`);
                setShowDrinkMenu(false);
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ==============================================
// DRINK MENU
// ==============================================
function DrinkMenu({ userName, onClose, onSend }: { userName: string; onClose: () => void; onSend: (drink: any) => void }) {
  const [selectedDrink, setSelectedDrink] = useState<string>('cocktail');
  const [message, setMessage] = useState('');

  const drinks = [
    { id: 'coffee', name: 'Кофе', price: 5, icon: <Coffee className="w-5 h-5" /> },
    { id: 'beer', name: 'Пиво', price: 7, icon: '🍺' },
    { id: 'cocktail', name: 'Коктейль', price: 12, icon: '🍸' },
    { id: 'wine', name: 'Вино', price: 15, icon: <Wine className="w-5 h-5" /> },
    { id: 'champagne', name: 'Шампанское', price: 25, icon: '🍾' }
  ];

  const selected = drinks.find(d => d.id === selectedDrink)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4">
          🍷 Предложить выпить
        </h3>
        <p className="text-sm text-slate-400 mb-6">Кому: {userName}</p>

        {/* Drinks */}
        <div className="space-y-2 mb-4">
          {drinks.map((drink) => (
            <label
              key={drink.id}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                selectedDrink === drink.id
                  ? 'bg-purple-500/20 border-2 border-purple-500'
                  : 'bg-white/5 border-2 border-transparent hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="drink"
                  value={drink.id}
                  checked={selectedDrink === drink.id}
                  onChange={(e) => setSelectedDrink(e.target.value)}
                  className="sr-only"
                />
                <span className="text-2xl">{typeof drink.icon === 'string' ? drink.icon : drink.icon}</span>
                <span className="text-white font-medium">{drink.name}</span>
              </div>
              <span className="text-purple-300 font-semibold">${drink.price}</span>
            </label>
          ))}
        </div>

        {/* Message */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Добавить сообщение (опционально)"
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
          rows={3}
        />

        {/* Total */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 mb-4">
          <span className="text-purple-300">Итого:</span>
          <span className="text-xl font-bold text-white">${selected.price}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => onSend({ drink: selected, message })}
          >
            <Send className="w-4 h-4 mr-2" />
            Отправить
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==============================================
// VENUE CHAT MODAL
// ==============================================
function VenueChatModal({ venueId, venueName, onClose }: { venueId: string; venueName: string; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', user: 'Алексей', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop', text: 'Кто-нибудь знает что это за трек? Огонь! 🔥', time: '2 мин назад' },
    { id: '2', user: 'Мария', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop', text: 'Miles Davis - So What! Классика! 🎷', time: '1 мин назад' },
    { id: '3', user: 'Алексей', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop', text: 'Спасибо! Обожаю джаз. Ты часто здесь?', time: 'сейчас' }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, {
      id: Date.now().toString(),
      user: 'Вы',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
      text: message,
      time: 'сейчас'
    }]);
    setMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl h-[600px] flex flex-col rounded-2xl bg-slate-900 border border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">💬 Чат {venueName}</h3>
            <p className="text-xs text-slate-400">7 онлайн</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-slate-400">
            ✕
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <img src={msg.avatar} alt={msg.user} className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">{msg.user}</span>
                  <span className="text-xs text-slate-500">{msg.time}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-slate-300">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Написать сообщение..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
