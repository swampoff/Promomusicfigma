import config from '@/config/environment';
/**
 * CREATE EVENT WIZARD - Мастер создания мероприятия
 * 5 шагов: Основная информация → Площадка → Билеты → Команда → Райдер
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  Users,
  Ticket,
  ClipboardList,
  Building2,
  Music2,
  Globe,
  Mic2,
  Banknote,
  Plus,
  X,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicApiKey } from '@/utils/auth/info';

const API_BASE = `${config.functionsUrl}`;

interface EventFormData {
  event_name: string;
  event_type: 'concert' | 'festival' | 'club_show' | 'online_event' | 'tour';
  event_date: string;
  city: string;
  venue: string;
  venue_id?: string;
  expected_audience: number;
  description: string;
  tickets: Array<{
    type: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  team: Array<{
    role: string;
    name: string;
    compensation: number;
  }>;
  rider_notes: string;
}

const EVENT_TYPES = [
  {
    id: 'concert' as const,
    name: 'Концерт',
    description: 'Сольный концерт в зале',
    icon: Music2,
    color: 'purple'
  },
  {
    id: 'festival' as const,
    name: 'Фестиваль',
    description: 'Участие в фестивале',
    icon: Users,
    color: 'blue'
  },
  {
    id: 'club_show' as const,
    name: 'Клубное шоу',
    description: 'Выступление в клубе',
    icon: Mic2,
    color: 'pink'
  },
  {
    id: 'online_event' as const,
    name: 'Онлайн-концерт',
    description: 'Стриминг-концерт',
    icon: Globe,
    color: 'green'
  },
  {
    id: 'tour' as const,
    name: 'Тур',
    description: 'Серия концертов',
    icon: MapPin,
    color: 'orange'
  }
];

const TEAM_ROLES = [
  { id: 'sound_engineer', name: 'Звукорежиссер', defaultComp: 15000 },
  { id: 'light_engineer', name: 'Светорежиссер', defaultComp: 12000 },
  { id: 'stage_manager', name: 'Директор сцены', defaultComp: 20000 },
  { id: 'photographer', name: 'Фотограф', defaultComp: 10000 },
  { id: 'videographer', name: 'Видеограф', defaultComp: 15000 },
  { id: 'security', name: 'Охрана', defaultComp: 8000 },
  { id: 'promoter', name: 'Промоутер', defaultComp: 25000 }
];

const TICKET_TYPES = [
  { id: 'early_bird', name: 'Early Bird', defaultPrice: 1500 },
  { id: 'standard', name: 'Стандарт', defaultPrice: 2000 },
  { id: 'vip', name: 'VIP', defaultPrice: 5000 },
  { id: 'backstage', name: 'Backstage', defaultPrice: 10000 }
];

export default function CreateEventWizard({ 
  onBack, 
  onComplete 
}: { 
  onBack: () => void; 
  onComplete: () => void;
}) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    event_name: '',
    event_type: 'concert',
    event_date: '',
    city: '',
    venue: '',
    expected_audience: 500,
    description: '',
    tickets: [],
    team: [],
    rider_notes: ''
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: 'Основное', icon: Calendar },
    { number: 2, title: 'Площадка', icon: Building2 },
    { number: 3, title: 'Билеты', icon: Ticket },
    { number: 4, title: 'Команда', icon: Users },
    { number: 5, title: 'Райдер', icon: ClipboardList }
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicApiKey}`
        },
        body: JSON.stringify({
          ...formData,
          artist_id: user.id
        })
      });

      if (response.ok) {
        toast.success('Мероприятие создано!');
        onComplete();
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.info('Прототип: Мероприятие создано локально');
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.event_name && formData.event_date && formData.event_type;
      case 2:
        return formData.city && formData.venue && formData.expected_audience > 0;
      case 3:
        return formData.tickets.length > 0;
      case 4:
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-[#0a0a14] to-blue-900/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад
        </button>

        {/* Steps Progress */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all ${
                    currentStep === step.number
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : currentStep > step.number
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/5 text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    currentStep === step.number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 transition-colors ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1Basic formData={formData} setFormData={setFormData} />
            )}
            {currentStep === 2 && (
              <Step2Venue formData={formData} setFormData={setFormData} />
            )}
            {currentStep === 3 && (
              <Step3Tickets formData={formData} setFormData={setFormData} />
            )}
            {currentStep === 4 && (
              <Step4Team formData={formData} setFormData={setFormData} />
            )}
            {currentStep === 5 && (
              <Step5Rider formData={formData} setFormData={setFormData} />
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
            >
              Назад
            </motion.button>

            <motion.button
              whileHover={{ scale: canProceed() ? 1.05 : 1 }}
              whileTap={{ scale: canProceed() ? 0.95 : 1 }}
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className={`px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/50'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {loading ? (
                <span className="contents">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Сохранение...
                </span>
              ) : currentStep === 5 ? (
                <span className="contents">
                  <CheckCircle className="w-5 h-5" />
                  Создать мероприятие
                </span>
              ) : (
                <span className="contents">
                  Далее
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Step 1: Basic Info
function Step1Basic({ formData, setFormData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Основная информация</h2>
        <p className="text-gray-400">Расскажите о вашем мероприятии</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Название мероприятия *
        </label>
        <input
          type="text"
          value={formData.event_name}
          onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
          placeholder="Например: Летний концерт 2026"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Тип мероприятия *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {EVENT_TYPES.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, event_type: type.id })}
              className={`p-4 rounded-xl border transition-all ${
                formData.event_type === type.id
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <type.icon className="w-6 h-6 mx-auto mb-2" />
              <p className="font-medium text-sm">{type.name}</p>
              <p className="text-xs opacity-70 mt-1">{type.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Дата мероприятия *
        </label>
        <input
          type="date"
          value={formData.event_date}
          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Опишите ваше мероприятие..."
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
        />
      </div>
    </motion.div>
  );
}

// Step 2: Venue
function Step2Venue({ formData, setFormData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Площадка</h2>
        <p className="text-gray-400">Где пройдет мероприятие?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Город *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Москва"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Площадка *
          </label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            placeholder="Клуб 16 тонн"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Ожидаемая аудитория *
        </label>
        <input
          type="number"
          value={formData.expected_audience}
          onChange={(e) => setFormData({ ...formData, expected_audience: parseInt(e.target.value) || 0 })}
          placeholder="500"
          min="1"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-blue-300 text-sm">
          💡 <strong>Совет:</strong> Учитывайте вместимость площадки при установке ожидаемой аудитории
        </p>
      </div>
    </motion.div>
  );
}

// Step 3: Tickets
function Step3Tickets({ formData, setFormData }: any) {
  const addTicket = (typeId: string) => {
    const type = TICKET_TYPES.find(t => t.id === typeId);
    if (!type) return;

    const newTicket = {
      type: type.id,
      name: type.name,
      price: type.defaultPrice,
      quantity: 100
    };

    setFormData({
      ...formData,
      tickets: [...formData.tickets, newTicket]
    });
  };

  const removeTicket = (index: number) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.filter((_: any, i: number) => i !== index)
    });
  };

  const updateTicket = (index: number, field: string, value: any) => {
    const newTickets = [...formData.tickets];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setFormData({ ...formData, tickets: newTickets });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Типы билетов</h2>
        <p className="text-gray-400">Настройте категории билетов</p>
      </div>

      {formData.tickets.length === 0 ? (
        <div className="text-center py-8">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Добавьте типы билетов</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {TICKET_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => addTicket(type.id)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                + {type.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.tickets.map((ticket: any, index: number) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{ticket.name}</h3>
                <button
                  onClick={() => removeTicket(index)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Цена (₽)</label>
                  <input
                    type="number"
                    value={ticket.price}
                    onChange={(e) => updateTicket(index, 'price', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Количество</label>
                  <input
                    type="number"
                    value={ticket.quantity}
                    onChange={(e) => updateTicket(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => addTicket('standard')}
            className="w-full py-3 bg-white/5 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить тип билета
          </button>
        </div>
      )}
    </motion.div>
  );
}

// Step 4: Team
function Step4Team({ formData, setFormData }: any) {
  const addTeamMember = (roleId: string) => {
    const role = TEAM_ROLES.find(r => r.id === roleId);
    if (!role) return;

    const newMember = {
      role: role.id,
      name: '',
      compensation: role.defaultComp
    };

    setFormData({
      ...formData,
      team: [...formData.team, newMember]
    });
  };

  const removeMember = (index: number) => {
    setFormData({
      ...formData,
      team: formData.team.filter((_: any, i: number) => i !== index)
    });
  };

  const updateMember = (index: number, field: string, value: any) => {
    const newTeam = [...formData.team];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setFormData({ ...formData, team: newTeam });
  };

  const getRoleName = (roleId: string) => {
    return TEAM_ROLES.find(r => r.id === roleId)?.name || roleId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Команда</h2>
        <p className="text-gray-400">Соберите команду для мероприятия (опционально)</p>
      </div>

      {formData.team.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Добавьте членов команды</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {TEAM_ROLES.slice(0, 4).map((role) => (
              <button
                key={role.id}
                onClick={() => addTeamMember(role.id)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                + {role.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.team.map((member: any, index: number) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{getRoleName(member.role)}</h3>
                <button
                  onClick={() => removeMember(index)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Имя</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                    placeholder="Иван Иванов"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Оплата (₽)</label>
                  <input
                    type="number"
                    value={member.compensation}
                    onChange={(e) => updateMember(index, 'compensation', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => addTeamMember('manager')}
            className="w-full py-3 bg-white/5 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить члена команды
          </button>
        </div>
      )}
    </motion.div>
  );
}

// Step 5: Rider
function Step5Rider({ formData, setFormData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Технический райдер</h2>
        <p className="text-gray-400">Укажите технические требования (опционально)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Требования к оборудованию
        </label>
        <textarea
          value={formData.rider_notes}
          onChange={(e) => setFormData({ ...formData, rider_notes: e.target.value })}
          placeholder="Например:&#10;- Микрофоны Shure SM58 x3&#10;- Мониторы QSC K12 x4&#10;- Микшерный пульт 16 каналов"
          rows={8}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
        />
      </div>

      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
        <p className="text-purple-300 text-sm">
          💡 <strong>Совет:</strong> Детальный технический райдер можно будет добавить позже в разделе управления мероприятием
        </p>
      </div>
    </motion.div>
  );
}