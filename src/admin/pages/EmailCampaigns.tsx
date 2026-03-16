/**
 * EMAIL CAMPAIGNS — Админ-страница рассылок (аналог SendPulse)
 * Создание, редактирование, сегментация, отправка, статистика
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Plus, Send, Eye, Trash2, Edit3, Users, BarChart3,
  Play, Pause, CheckCircle2, AlertCircle, Clock, Search,
  ChevronDown, X, FileText, TestTube2, Copy, RefreshCw, Calendar, AlertTriangle,
  MousePointerClick, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/utils/sanitize-html';

const API = import.meta.env.VITE_API_URL || '';

// ── Types ──

interface CampaignSegment {
  roles?: string[];
  registered_after?: string;
  registered_before?: string;
  has_tracks?: boolean;
  has_subscription?: boolean;
  email_verified?: boolean;
  custom_emails?: string[];
}

interface CampaignStats {
  total_recipients: number;
  sent: number;
  failed: number;
  opened: number;
  errors: string[];
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  html: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'paused';
  segment: CampaignSegment;
  stats: CampaignStats;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

// ── API calls ──

async function apiCall(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}/server/api/email-campaigns${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  });
  return res.json();
}

// ── Status badge ──

const statusConfig: Record<string, { label: string; color: string; icon: typeof Mail }> = {
  draft: { label: 'Черновик', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: FileText },
  scheduled: { label: 'Запланировано', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Clock },
  sending: { label: 'Отправляется', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: RefreshCw },
  sent: { label: 'Отправлено', color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: CheckCircle2 },
  failed: { label: 'Ошибка', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: AlertCircle },
  paused: { label: 'Пауза', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: Pause },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── Role tags ──

const roleLabels: Record<string, string> = {
  artist: 'Артисты',
  dj: 'DJ',
  venue: 'Заведения',
  producer: 'Продюсеры',
  radio_station: 'Радиостанции',
};

// ── Email HTML templates ──

const emailTemplates = [
  {
    id: 'blank',
    name: 'Пустой шаблон',
    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #FF577F;">Заголовок</h1>
  <p>Текст вашего письма здесь.</p>
  <p>С уважением,<br>Команда ПРОМО.МУЗЫКА</p>
</div>`,
  },
  {
    id: 'announcement',
    name: 'Объявление',
    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a1a; padding: 40px 20px;">
  <div style="background: #1a1a2e; border-radius: 16px; overflow: hidden;">
    <div style="padding: 32px 40px; background: linear-gradient(135deg, #FF577F 0%, #7C3AED 100%);">
      <h1 style="margin: 0; color: #fff; font-size: 24px;">ПРОМО.МУЗЫКА</h1>
    </div>
    <div style="padding: 32px 40px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
      <h2 style="color: #fff; margin-top: 0;">Привет, {{name}}!</h2>
      <p>У нас важные новости для вас.</p>
      <p>Расскажите тут о вашем обновлении или событии.</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="https://promo-music.ru" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FF577F 0%, #7C3AED 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Подробнее</a>
      </p>
    </div>
    <div style="padding: 20px 40px; color: #666; font-size: 12px; border-top: 1px solid #2a2a3e;">
      <p style="margin: 0;">© 2026 ПРОМО.МУЗЫКА — платформа продвижения музыки</p>
    </div>
  </div>
</div>`,
  },
  {
    id: 'promo',
    name: 'Промо-акция',
    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a1a; padding: 40px 20px;">
  <div style="background: #1a1a2e; border-radius: 16px; overflow: hidden;">
    <div style="padding: 32px 40px; background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);">
      <h1 style="margin: 0; color: #fff; font-size: 24px;">ПРОМО-АКЦИЯ</h1>
    </div>
    <div style="padding: 32px 40px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
      <h2 style="color: #F59E0B; margin-top: 0;">Специальное предложение!</h2>
      <p>{{name}}, только для вас особые условия.</p>
      <div style="background: #F59E0B20; border: 1px solid #F59E0B40; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
        <p style="font-size: 32px; font-weight: bold; color: #F59E0B; margin: 0;">-50%</p>
        <p style="color: #999; margin: 8px 0 0;">на все услуги продвижения</p>
      </div>
      <p style="text-align: center; margin: 28px 0;">
        <a href="https://promo-music.ru" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Воспользоваться</a>
      </p>
    </div>
    <div style="padding: 20px 40px; color: #666; font-size: 12px; border-top: 1px solid #2a2a3e;">
      <p style="margin: 0;">© 2026 ПРОМО.МУЗЫКА</p>
    </div>
  </div>
</div>`,
  },
];

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════

export function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load campaigns
  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, statsRes] = await Promise.all([
        apiCall('/campaigns'),
        apiCall('/stats'),
      ]);
      if (campRes.success) setCampaigns(campRes.data.filter((c: Campaign) => !c.name.startsWith('[DELETED]')));
      if (statsRes.success) setOverallStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleCreate = () => {
    setEditing(null);
    setView('editor');
  };

  const handleEdit = (c: Campaign) => {
    setEditing(c);
    setView('editor');
  };

  const handleBack = () => {
    setView('list');
    setEditing(null);
    loadCampaigns();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить кампанию?')) return;
    const res = await apiCall(`/campaigns/${id}`, { method: 'DELETE' });
    if (res.success) {
      toast.success('Кампания удалена');
      loadCampaigns();
    } else {
      toast.error(res.error || 'Ошибка удаления');
    }
  };

  const handlePause = async (id: string) => {
    const res = await apiCall(`/campaigns/${id}/pause`, { method: 'POST' });
    if (res.success) {
      toast.success('Рассылка приостановлена');
      loadCampaigns();
    } else {
      toast.error(res.error || 'Ошибка паузы');
    }
  };

  const handleResume = async (id: string) => {
    if (!confirm('Возобновить отправку оставшихся писем?')) return;
    const res = await apiCall(`/campaigns/${id}/resume`, { method: 'POST' });
    if (res.success) {
      toast.success(res.message || 'Отправка возобновлена');
      loadCampaigns();
    } else {
      toast.error(res.error || 'Ошибка возобновления');
    }
  };

  const handleResendUnopened = async (id: string) => {
    if (!confirm('Повторно отправить письмо тем, кто не открыл?')) return;
    const res = await apiCall(`/campaigns/${id}/resend-unopened`, { method: 'POST' });
    if (res.success) {
      toast.success(res.message || 'Повторная отправка запущена');
      loadCampaigns();
    } else {
      toast.error(res.error || 'Ошибка повторной отправки');
    }
  };

  const handleClone = async (c: Campaign) => {
    const res = await apiCall('/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        name: `${c.name} (копия)`,
        subject: c.subject,
        html: c.html,
        segment: c.segment,
      }),
    });
    if (res.success) {
      toast.success('Кампания скопирована');
      loadCampaigns();
    } else {
      toast.error(res.error || 'Ошибка копирования');
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            Рассылки
          </h1>
          <p className="text-gray-400 text-sm mt-1">Email-кампании и массовые рассылки</p>
        </div>
        {view === 'list' && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Новая рассылка
          </button>
        )}
        {view === 'editor' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4" />
            Назад к списку
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Stats cards */}
            {overallStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Кампаний', value: overallStats.total_campaigns, icon: Mail, color: 'from-pink-500 to-purple-600' },
                  { label: 'Отправлено', value: overallStats.total_emails_sent, icon: Send, color: 'from-green-500 to-emerald-600' },
                  { label: 'Открыто', value: overallStats.total_opened, icon: Eye, color: 'from-blue-500 to-cyan-600' },
                  { label: 'Open Rate', value: overallStats.avg_open_rate, icon: BarChart3, color: 'from-orange-500 to-red-600' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-400 text-xs">{stat.label}</span>
                    </div>
                    <div className="text-white text-xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Поиск кампаний..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
              />
            </div>

            {/* Campaign list */}
            {loading ? (
              <div className="flex justify-center py-20">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-20">
                <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Нет рассылок</p>
                <p className="text-gray-500 text-sm">Создайте первую email-кампанию</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCampaigns.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold truncate">{c.name}</h3>
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="text-gray-400 text-sm truncate">{c.subject}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{new Date(c.created_at).toLocaleDateString('ru')}</span>
                          {c.stats.sent > 0 && <span>Отправлено: {c.stats.sent}</span>}
                          {c.stats.failed > 0 && (
                            <span className="flex items-center gap-1 text-red-400">
                              <AlertTriangle className="w-3 h-3" />
                              Ошибок: {c.stats.failed}
                            </span>
                          )}
                          {c.stats.opened > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {c.stats.opened}
                              {c.stats.sent > 0 && ` (${((c.stats.opened / c.stats.sent) * 100).toFixed(1)}%)`}
                            </span>
                          )}
                          {(c.stats as any).clicked > 0 && (
                            <span className="flex items-center gap-1 text-purple-400">
                              <MousePointerClick className="w-3 h-3" />
                              Кликов: {(c.stats as any).clicked}
                            </span>
                          )}
                          {c.scheduled_at && c.status === 'scheduled' && (
                            <span className="flex items-center gap-1 text-blue-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(c.scheduled_at).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {c.segment.roles && c.segment.roles.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {c.segment.roles.map(r => roleLabels[r] || r).join(', ')}
                            </span>
                          )}
                        </div>
                        {/* Error details */}
                        {c.stats.errors && c.stats.errors.length > 0 && c.status === 'failed' && (
                          <details className="mt-2">
                            <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300">
                              Показать ошибки ({c.stats.errors.length})
                            </summary>
                            <div className="mt-1 p-2 rounded-lg bg-red-500/10 border border-red-500/20 max-h-24 overflow-y-auto">
                              {c.stats.errors.slice(0, 10).map((err, i) => (
                                <p key={i} className="text-[10px] text-red-300 font-mono truncate">{err}</p>
                              ))}
                              {c.stats.errors.length > 10 && (
                                <p className="text-[10px] text-red-400 mt-1">...и ещё {c.stats.errors.length - 10}</p>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {c.status === 'sent' && c.stats.sent > 0 && (
                          <button
                            onClick={() => handleResendUnopened(c.id)}
                            className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors"
                            title="Повторно отправить неоткрывшим"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {c.status === 'sending' && (
                          <button
                            onClick={() => handlePause(c.id)}
                            className="p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 transition-colors"
                            title="Поставить на паузу"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {c.status === 'paused' && (
                          <button
                            onClick={() => handleResume(c.id)}
                            className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-colors"
                            title="Возобновить отправку"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Редактировать"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleClone(c)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Копировать кампанию"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CampaignEditor campaign={editing} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CAMPAIGN EDITOR
// ══════════════════════════════════════════════════════════════

function CampaignEditor({ campaign, onBack }: { campaign: Campaign | null; onBack: () => void }) {
  const [name, setName] = useState(campaign?.name || '');
  const [subject, setSubject] = useState(campaign?.subject || '');
  const [html, setHtml] = useState(campaign?.html || emailTemplates[0].html);
  const [tab, setTab] = useState<'edit' | 'preview' | 'segment'>('edit');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(campaign?.scheduled_at || '');
  const [autoSaved, setAutoSaved] = useState(false);
  const [campaignId, setCampaignId] = useState(campaign?.id || '');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewSample, setPreviewSample] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Segment state
  const [selectedRoles, setSelectedRoles] = useState<string[]>(campaign?.segment.roles || []);
  const [registeredAfter, setRegisteredAfter] = useState(campaign?.segment.registered_after || '');
  const [registeredBefore, setRegisteredBefore] = useState(campaign?.segment.registered_before || '');
  const [emailVerified, setEmailVerified] = useState(campaign?.segment.email_verified || false);
  const [customEmails, setCustomEmails] = useState(campaign?.segment.custom_emails?.join('\n') || '');
  const [showTemplates, setShowTemplates] = useState(false);

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    if (!name && !subject) return;
    const timer = setInterval(() => {
      const draft = { name, subject, html, scheduledAt, selectedRoles, registeredAfter, registeredBefore, emailVerified, customEmails };
      try {
        localStorage.setItem('email_campaign_draft', JSON.stringify(draft));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      } catch { /* ignore */ }
    }, 30000);
    return () => clearInterval(timer);
  }, [name, subject, html, scheduledAt, selectedRoles, registeredAfter, registeredBefore, emailVerified, customEmails]);

  // Restore draft on mount (only for new campaigns)
  useEffect(() => {
    if (campaign) return; // don't restore for existing
    try {
      const saved = localStorage.getItem('email_campaign_draft');
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.name) setName(draft.name);
        if (draft.subject) setSubject(draft.subject);
        if (draft.html) setHtml(draft.html);
        if (draft.scheduledAt) setScheduledAt(draft.scheduledAt);
        if (draft.selectedRoles) setSelectedRoles(draft.selectedRoles);
        if (draft.registeredAfter) setRegisteredAfter(draft.registeredAfter);
        if (draft.registeredBefore) setRegisteredBefore(draft.registeredBefore);
        if (draft.emailVerified) setEmailVerified(draft.emailVerified);
        if (draft.customEmails) setCustomEmails(draft.customEmails);
        toast.info('Восстановлен черновик из автосохранения');
      }
    } catch { /* ignore */ }
  }, [campaign]);

  const buildSegment = (): CampaignSegment => ({
    roles: selectedRoles.length > 0 ? selectedRoles : undefined,
    registered_after: registeredAfter || undefined,
    registered_before: registeredBefore || undefined,
    email_verified: emailVerified || undefined,
    custom_emails: customEmails.trim() ? customEmails.trim().split('\n').map(e => e.trim()).filter(Boolean) : undefined,
  });

  // Save campaign
  const handleSave = async () => {
    if (!name || !subject) {
      toast.error('Укажите название и тему письма');
      return;
    }
    setSaving(true);
    try {
      const segment = buildSegment();
      const payload = { name, subject, html, segment, scheduled_at: scheduledAt || undefined };
      if (campaignId) {
        const res = await apiCall(`/campaigns/${campaignId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        if (res.success) toast.success('Сохранено');
        else toast.error(res.error);
      } else {
        const res = await apiCall('/campaigns', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (res.success) {
          setCampaignId(res.data.id);
          toast.success('Кампания создана');
          try { localStorage.removeItem('email_campaign_draft'); } catch { /* ignore */ }
        } else toast.error(res.error);
      }
    } catch (err) {
      toast.error('Ошибка сохранения');
    }
    setSaving(false);
  };

  // Preview segment
  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await apiCall('/segment/preview', {
        method: 'POST',
        body: JSON.stringify(buildSegment()),
      });
      if (res.success) {
        setPreviewCount(res.data.count);
        setPreviewSample(res.data.sample);
      }
    } catch { /* ignore */ }
    setPreviewLoading(false);
  };

  // Send test email
  const handleTestSend = async () => {
    if (!campaignId) {
      toast.error('Сначала сохраните кампанию');
      return;
    }
    if (!testEmail) {
      toast.error('Укажите email для тестовой отправки');
      return;
    }
    setTestSending(true);
    try {
      const res = await apiCall(`/campaigns/${campaignId}/test`, {
        method: 'POST',
        body: JSON.stringify({ email: testEmail }),
      });
      if (res.success) toast.success(`Тестовое письмо отправлено на ${testEmail}`);
      else toast.error(res.error || 'Ошибка отправки');
    } catch {
      toast.error('Ошибка отправки');
    }
    setTestSending(false);
  };

  // Start campaign
  const handleSend = async () => {
    if (!campaignId) {
      toast.error('Сначала сохраните кампанию');
      return;
    }
    if (!confirm('Начать рассылку? Письма будут отправлены всем получателям из сегмента.')) return;

    setSending(true);
    try {
      // Save latest version first
      await apiCall(`/campaigns/${campaignId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, subject, html, segment: buildSegment() }),
      });

      const res = await apiCall(`/campaigns/${campaignId}/send`, { method: 'POST' });
      if (res.success) {
        toast.success(res.data.message);
        setTimeout(onBack, 2000);
      } else {
        toast.error(res.error || 'Ошибка отправки');
      }
    } catch {
      toast.error('Ошибка отправки');
    }
    setSending(false);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  return (
    <div className="space-y-4">
      {/* Campaign name & subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Название кампании</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Новогодняя рассылка"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Тема письма</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Важные новости от ПРОМО.МУЗЫКА"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 w-fit">
        {[
          { id: 'edit' as const, label: 'Редактор', icon: Edit3 },
          { id: 'preview' as const, label: 'Превью', icon: Eye },
          { id: 'segment' as const, label: 'Получатели', icon: Users },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'edit' && (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {/* Template selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white text-sm transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Шаблоны
                <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
              </button>
              <span className="text-gray-500 text-xs">
                Переменные: {'{{name}}'}, {'{{email}}'}, {'{{role}}'}
              </span>
            </div>

            {showTemplates && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {emailTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setHtml(t.html); setShowTemplates(false); toast.success(`Шаблон "${t.name}" применён`); }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/30 text-left transition-colors"
                  >
                    <div className="text-white text-sm font-medium">{t.name}</div>
                    <div className="text-gray-500 text-xs mt-1 line-clamp-2">{t.html.replace(/<[^>]*>/g, '').slice(0, 80)}...</div>
                  </button>
                ))}
              </div>
            )}

            {/* HTML editor */}
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 rounded-xl bg-[#0d0d1a] border border-white/10 text-gray-300 font-mono text-sm focus:outline-none focus:border-pink-500/50 resize-y"
              placeholder="<h1>Ваш HTML здесь</h1>"
            />
          </motion.div>
        )}

        {tab === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-2xl bg-white overflow-hidden shadow-2xl">
              <div className="p-2 bg-gray-100 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-gray-500 text-xs flex-1 text-center">{subject || 'Тема письма'}</span>
              </div>
              <div
                className="p-4"
                dangerouslySetInnerHTML={{
                  __html: html
                    .replace(/\{\{name\}\}/g, 'Иван Петров')
                    .replace(/\{\{email\}\}/g, 'ivan@example.com')
                    .replace(/\{\{role\}\}/g, 'artist'),
                }}
              />
            </div>
          </motion.div>
        )}

        {tab === 'segment' && (
          <motion.div key="segment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Schedule */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <label className="flex items-center gap-2 text-sm text-blue-300 font-medium mb-2">
                <Calendar className="w-4 h-4" />
                Планирование отправки
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                />
                {scheduledAt && (
                  <button
                    onClick={() => setScheduledAt('')}
                    className="px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white text-sm"
                  >
                    Сбросить
                  </button>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-1.5">
                {scheduledAt
                  ? `Отправка запланирована на ${new Date(scheduledAt).toLocaleString('ru')}`
                  : 'Оставьте пустым для ручной отправки'}
              </p>
            </div>

            {/* Role filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Роли получателей</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(roleLabels).map(([role, label]) => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedRoles.includes(role)
                        ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {selectedRoles.length > 0 && (
                  <button
                    onClick={() => setSelectedRoles([])}
                    className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-white"
                  >
                    Сбросить
                  </button>
                )}
              </div>
              {selectedRoles.length === 0 && (
                <p className="text-gray-500 text-xs mt-1">Если не выбрано — рассылка всем пользователям</p>
              )}
            </div>

            {/* Date filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Зарегистрированы после</label>
                <input
                  type="date"
                  value={registeredAfter}
                  onChange={(e) => setRegisteredAfter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Зарегистрированы до</label>
                <input
                  type="date"
                  value={registeredBefore}
                  onChange={(e) => setRegisteredBefore(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>
            </div>

            {/* Email verified */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emailVerified}
                onChange={(e) => setEmailVerified(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-gray-300 text-sm">Только с подтверждённым email</span>
            </label>

            {/* Custom emails */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Или ручной список email (по одному на строку)</label>
              <textarea
                value={customEmails}
                onChange={(e) => setCustomEmails(e.target.value)}
                rows={4}
                placeholder="user1@example.com&#10;user2@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-pink-500/50 resize-y"
              />
              {customEmails.trim() && (
                <p className="text-gray-500 text-xs mt-1">
                  При наличии ручного списка фильтры по ролям игнорируются
                </p>
              )}
            </div>

            {/* Preview segment */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                disabled={previewLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors disabled:opacity-50"
              >
                <Users className="w-4 h-4" />
                {previewLoading ? 'Загрузка...' : 'Посмотреть получателей'}
              </button>
              {previewCount !== null && (
                <span className="text-white font-semibold">
                  {previewCount} получателей
                </span>
              )}
            </div>

            {previewSample.length > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2 text-left text-gray-400 font-medium">Email</th>
                      <th className="px-4 py-2 text-left text-gray-400 font-medium">Имя</th>
                      <th className="px-4 py-2 text-left text-gray-400 font-medium">Роль</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewSample.map((r: any, i: number) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-4 py-2 text-gray-300">{r.email}</td>
                        <td className="px-4 py-2 text-gray-400">{r.name}</td>
                        <td className="px-4 py-2 text-gray-500">{roleLabels[r.role] || r.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewCount !== null && previewCount > 10 && (
                  <div className="px-4 py-2 text-gray-500 text-xs">
                    ...и ещё {previewCount - 10} получателей
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save indicator */}
      {autoSaved && (
        <div className="text-xs text-green-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Автосохранено
        </div>
      )}

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        {/* Test send */}
        <div className="flex items-center gap-2 flex-1">
          <TestTube2 className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@email.com"
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
          />
          <button
            onClick={handleTestSend}
            disabled={testSending || !campaignId}
            className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {testSending ? 'Отправка...' : 'Тест'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Сохранить
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !campaignId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Отправить рассылку
          </button>
        </div>
      </div>
    </div>
  );
}
