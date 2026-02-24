/**
 * PRODUCER CALENDAR TAB
 * Месячный календарь с drag-and-drop (react-dnd + TouchBackend для мобильных)
 * Подключён к KV Store API
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, Plus, Clock, X, Save,
  Mic, Sliders, Disc3, MessageSquare, CircleDot,
  CheckCircle2, AlertCircle, CalendarDays, RefreshCw,
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Auto-detect touch device for DnD backend selection
const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const getDndBackend = () => isTouchDevice() ? TouchBackend : HTML5Backend;
const getDndOptions = () => isTouchDevice() ? { enableMouseEvents: true, delayTouchStart: 200 } : undefined;
import * as studioApi from '@/utils/api/producer-studio';
import type { CalendarSession } from '@/utils/api/producer-studio';

interface ProducerCalendarProps { producerId: string; }

const DND_TYPE = 'CALENDAR_SESSION';
interface DragItem { sessionId: string; fromDate: string; }

const SESSION_TYPES = [
  { id: 'recording', label: 'Запись', icon: Mic, color: '#ef4444' },
  { id: 'mixing', label: 'Сведение', icon: Sliders, color: '#14b8a6' },
  { id: 'mastering', label: 'Мастеринг', icon: Disc3, color: '#8b5cf6' },
  { id: 'consultation', label: 'Консультация', icon: MessageSquare, color: '#f59e0b' },
  { id: 'other', label: 'Другое', icon: CircleDot, color: '#6b7280' },
] as const;

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  scheduled: { label: 'Запланировано', class: 'bg-blue-500/20 text-blue-400' },
  confirmed: { label: 'Подтверждено', class: 'bg-emerald-500/20 text-emerald-400' },
  completed: { label: 'Завершено', class: 'bg-gray-500/20 text-gray-400' },
  cancelled: { label: 'Отменено', class: 'bg-red-500/20 text-red-400' },
};

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfWeek(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

// ─── Draggable session bar ───
function DraggableBar({ session }: { session: CalendarSession }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: DND_TYPE,
    item: { sessionId: session.id, fromDate: session.date } as DragItem,
    collect: mon => ({ isDragging: mon.isDragging() }),
    canDrag: () => session.status !== 'completed' && session.status !== 'cancelled',
  });
  return (
    <div
      ref={dragRef as any}
      className={`h-[5px] rounded-full cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? 'opacity-30' : 'opacity-80'}`}
      style={{ background: session.color || '#14b8a6' }}
      title={`${session.startTime} ${session.title}`}
    />
  );
}

// ─── Droppable day cell ───
function DayCell({
  cell, sessions: daySessions, isSelected, onSelect, onDrop,
}: {
  cell: { day: number; date: string; isCurrentMonth: boolean; isToday: boolean };
  sessions: CalendarSession[];
  isSelected: boolean;
  onSelect: () => void;
  onDrop: (item: DragItem) => void;
}) {
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: DND_TYPE,
    drop: (item: DragItem) => onDrop(item),
    canDrop: (item: DragItem) => item.fromDate !== cell.date,
    collect: mon => ({ isOver: mon.isOver(), canDrop: mon.canDrop() }),
  });
  const highlight = isOver && canDrop;

  return (
    <div
      ref={dropRef as any}
      onClick={onSelect}
      className={`relative min-h-[72px] sm:min-h-[84px] p-1 sm:p-1.5 rounded-lg text-left transition-all cursor-pointer ${
        highlight
          ? 'bg-teal-500/25 border-2 border-teal-400/60 scale-[1.02]'
          : isSelected
            ? 'bg-teal-500/15 border border-teal-500/30'
            : cell.isCurrentMonth
              ? 'hover:bg-white/[0.04] border border-transparent'
              : 'opacity-30 border border-transparent'
      }`}
    >
      <span className={`text-xs font-medium block mb-0.5 ${
        cell.isToday
          ? 'w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-[11px] font-bold'
          : isSelected ? 'text-teal-400' : 'text-gray-400'
      }`}>{cell.day}</span>
      <div className="space-y-0.5">
        {daySessions.slice(0, 3).map(s => <DraggableBar key={s.id} session={s} />)}
        {daySessions.length > 3 && <span className="text-[8px] text-gray-500">+{daySessions.length - 3}</span>}
      </div>
      {highlight && <div className="absolute inset-0 rounded-lg border-2 border-dashed border-teal-400/40 pointer-events-none" />}
    </div>
  );
}

// ═══ MAIN ═══
export function ProducerCalendar({ producerId }: ProducerCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [formTitle, setFormTitle] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStart, setFormStart] = useState('10:00');
  const [formEnd, setFormEnd] = useState('13:00');
  const [formType, setFormType] = useState<string>('recording');
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastDropInfo, setLastDropInfo] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true); setError(null);
    const r = await studioApi.fetchCalendarSessions(producerId);
    if (r.success) setSessions(r.data); else setError(r.error);
    setIsLoading(false);
  }, [producerId]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const prevMonth = useCallback(() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); }, [currentMonth]);
  const nextMonth = useCallback(() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); }, [currentMonth]);
  const goToToday = useCallback(() => { setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()); }, []);

  // ─── Swipe gestures for mobile month navigation ───
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.t;
    touchStartRef.current = null;
    // Must be horizontal swipe: |dx| > 60px, |dy| < |dx|, within 400ms
    if (Math.abs(dx) > 60 && Math.abs(dy) < Math.abs(dx) && dt < 400) {
      if (dx < 0) nextMonth();
      else prevMonth();
    }
  }, [nextMonth, prevMonth]);

  const calendarGrid = useMemo(() => {
    const dim = getDaysInMonth(currentYear, currentMonth);
    const fd = getFirstDayOfWeek(currentYear, currentMonth);
    const cells: { day: number; date: string; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const prevDim = getDaysInMonth(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth - 1);
    for (let i = fd - 1; i >= 0; i--) {
      const d = prevDim - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({ day: d, date: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`, isCurrentMonth: false, isToday: false });
    }
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    for (let d = 1; d <= dim; d++) {
      const ds = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cells.push({ day: d, date: ds, isCurrentMonth: true, isToday: ds === todayStr });
    }
    const rem = 42 - cells.length;
    for (let d = 1; d <= rem; d++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({ day: d, date: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`, isCurrentMonth: false, isToday: false });
    }
    return cells;
  }, [currentYear, currentMonth]);

  const sessionsByDate = useMemo(() => {
    const map: Record<string, CalendarSession[]> = {};
    for (const s of sessions) { if (!map[s.date]) map[s.date] = []; map[s.date].push(s); }
    return map;
  }, [sessions]);

  const selectedDateSessions = selectedDate ? (sessionsByDate[selectedDate] || []) : [];

  const upcomingSessions = useMemo(() => {
    const ts = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    return [...sessions].filter(s => s.date >= ts && s.status !== 'cancelled').sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).slice(0,8);
  }, [sessions]);

  const handleCreate = useCallback(async () => {
    if (!formTitle.trim() || !formDate) return;
    setIsSaving(true);
    const r = await studioApi.createSession({ producerId, title: formTitle.trim(), clientName: formClient.trim(), date: formDate, startTime: formStart, endTime: formEnd, type: formType, notes: formNotes.trim() });
    if (r.success) { setSessions(prev => [...prev, r.data]); setShowCreateModal(false); setFormTitle(''); setFormClient(''); setFormDate(''); setFormNotes(''); }
    setIsSaving(false);
  }, [producerId, formTitle, formClient, formDate, formStart, formEnd, formType, formNotes]);

  const updateStatus = useCallback(async (session: CalendarSession, status: string) => {
    const r = await studioApi.updateSession(session.id, { producerId, status });
    if (r.success) { setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: status as any } : s)); setSelectedSession(prev => prev?.id === session.id ? { ...prev, status: status as any } : prev); }
  }, [producerId]);

  const handleDelete = useCallback(async (sessionId: string) => {
    const r = await studioApi.deleteSession(sessionId, producerId);
    if (r.success) { setSessions(prev => prev.filter(s => s.id !== sessionId)); setSelectedSession(null); }
  }, [producerId]);

  // ─── DnD: move session to new date ───
  const handleDrop = useCallback(async (item: DragItem, newDate: string) => {
    if (item.fromDate === newDate) return;
    const session = sessions.find(s => s.id === item.sessionId);
    if (!session) return;
    // Optimistic
    setSessions(prev => prev.map(s => s.id === item.sessionId ? { ...s, date: newDate } : s));
    const dateLabel = new Date(newDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    setLastDropInfo(`"${session.title}" перенесена на ${dateLabel}`);
    setTimeout(() => setLastDropInfo(null), 3000);
    // API
    const r = await studioApi.updateSession(item.sessionId, { producerId, date: newDate });
    if (!r.success) setSessions(prev => prev.map(s => s.id === item.sessionId ? { ...s, date: item.fromDate } : s));
  }, [producerId, sessions]);

  const openCreateForDate = useCallback((date: string) => { setFormDate(date); setShowCreateModal(true); }, []);

  if (isLoading) return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      <h2 className="text-lg xs:text-xl font-bold text-white">Календарь</h2>
      <div className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/5 p-5 h-96" />
    </div>
  );

  return (
    <DndProvider backend={getDndBackend()} options={getDndOptions()}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 xs:gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Календарь</h2>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-bold">{isTouchDevice() ? 'Touch DnD' : 'Drag & Drop'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
              <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'month' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-500 hover:text-white'}`}>Месяц</button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-500 hover:text-white'}`}>Список</button>
            </div>
            <button onClick={() => { setFormDate(''); setShowCreateModal(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400 rounded-xl text-xs font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Новая сессия</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" /><p className="text-sm text-red-300 flex-1">{error}</p>
            <button onClick={loadSessions} className="p-2 hover:bg-white/5 rounded-lg"><RefreshCw className="w-4 h-4 text-red-400" /></button>
          </div>
        )}

        {/* Drop notification toast */}
        <AnimatePresence>
          {lastDropInfo && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-sm text-teal-300 text-center">
              {lastDropInfo}
            </motion.div>
          )}
        </AnimatePresence>

        {viewMode === 'month' ? (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Calendar grid - swipe for month navigation on mobile */}
            <div ref={calendarRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-1.5 hover:bg-white/5 rounded-lg"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
                  <h3 className="text-base font-bold text-white min-w-[160px] text-center">{MONTHS_RU[currentMonth]} {currentYear}</h3>
                  <button onClick={nextMonth} className="p-1.5 hover:bg-white/5 rounded-lg"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
                </div>
                <button onClick={goToToday} className="text-xs text-teal-400 hover:text-teal-300">Сегодня</button>
              </div>
              <div className="grid grid-cols-7 gap-px mb-1">
                {DAYS_RU.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {calendarGrid.map((cell, i) => (
                  <DayCell
                    key={i}
                    cell={cell}
                    sessions={sessionsByDate[cell.date] || []}
                    isSelected={selectedDate === cell.date}
                    onSelect={() => setSelectedDate(cell.date)}
                    onDrop={(item) => handleDrop(item, cell.date)}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/5">
                {SESSION_TYPES.map(t => <div key={t.id} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} /><span className="text-[10px] text-gray-500">{t.label}</span></div>)}
                <div className="flex items-center gap-1.5 ml-auto"><span className="text-[10px] text-gray-600 italic">Перетащите сессию на другой день</span></div>
              </div>
            </div>

            {/* Day detail */}
            <div className="lg:w-80 xl:w-96 flex-shrink-0">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 sticky top-20">
                {selectedDate ? (
                  <div className="contents">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                      <button onClick={() => openCreateForDate(selectedDate)} className="p-1.5 hover:bg-teal-500/10 rounded-lg"><Plus className="w-4 h-4 text-teal-400" /></button>
                    </div>
                    {selectedDateSessions.length > 0 ? (
                      <div className="space-y-2.5">
                        {selectedDateSessions.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(session => {
                          const si = STATUS_LABELS[session.status];
                          return (
                            <motion.button key={session.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} onClick={() => setSelectedSession(session)} className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-teal-500/20 transition-colors">
                              <div className="flex items-start gap-2.5">
                                <div className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0" style={{ background: session.color || '#14b8a6' }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">{session.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{session.startTime} - {session.endTime}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${si?.class || ''}`}>{si?.label || session.status}</span>
                                  </div>
                                  {session.clientName && <p className="text-[10px] text-gray-500 mt-0.5 truncate">Клиент: {session.clientName}</p>}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarDays className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 mb-3">Нет сессий на этот день</p>
                        <button onClick={() => openCreateForDate(selectedDate)} className="text-xs text-teal-400 hover:text-teal-300">+ Запланировать сессию</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="contents">
                    <h4 className="text-sm font-bold text-white mb-3">Ближайшие сессии</h4>
                    {upcomingSessions.length > 0 ? (
                      <div className="space-y-2">
                        {upcomingSessions.map(session => (
                          <button key={session.id} onClick={() => { setSelectedDate(session.date); setSelectedSession(session); }} className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors flex items-center gap-2.5">
                            <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: session.color || '#14b8a6' }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{session.title}</p>
                              <p className="text-[10px] text-gray-500">{new Date(session.date + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - {session.startTime}-{session.endTime}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-6">Нет предстоящих сессий</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* List view */
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Все сессии - {MONTHS_RU[currentMonth]} {currentYear}</h3>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-1.5 hover:bg-white/5 rounded-lg"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-white/5 rounded-lg"><ChevronRight className="w-4 h-4 text-gray-400" /></button>
              </div>
            </div>
            <div className="space-y-2">
              {[...sessions].filter(s => { const d = new Date(s.date); return d.getFullYear() === currentYear && d.getMonth() === currentMonth; })
                .sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                .map((session, i) => {
                  const typeInfo = SESSION_TYPES.find(t => t.id === session.type);
                  const TypeIcon = typeInfo?.icon || CircleDot;
                  const si = STATUS_LABELS[session.status];
                  return (
                    <motion.button key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setSelectedSession(session)} className="w-full text-left p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 transition-colors flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${session.color || '#14b8a6'}15` }}>
                        <TypeIcon className="w-5 h-5" style={{ color: session.color || '#14b8a6' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${session.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-white'} truncate`}>{session.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-500">{new Date(session.date + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{session.startTime} - {session.endTime}</span>
                          {session.clientName && <span className="text-xs text-gray-500 hidden sm:inline">{session.clientName}</span>}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${si?.class || ''}`}>{si?.label || session.status}</span>
                    </motion.button>
                  );
                })}
              {sessions.filter(s => { const d = new Date(s.date); return d.getFullYear() === currentYear && d.getMonth() === currentMonth; }).length === 0 && (
                <div className="text-center py-12"><CalendarDays className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-500 text-sm">Нет сессий в этом месяце</p></div>
              )}
            </div>
          </div>
        )}

        {/* Session Detail Modal */}
        <AnimatePresence>
          {selectedSession && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedSession(null)}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="bg-[#12122a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${selectedSession.color || '#14b8a6'}20` }}>
                      {(() => { const T = SESSION_TYPES.find(t => t.id === selectedSession.type)?.icon || CircleDot; return <T className="w-5 h-5" style={{ color: selectedSession.color || '#14b8a6' }} />; })()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{selectedSession.title}</h3>
                      <p className="text-xs text-gray-500">{SESSION_TYPES.find(t => t.id === selectedSession.type)?.label}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSession(null)} className="p-1.5 hover:bg-white/5 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 text-sm"><CalendarDays className="w-4 h-4 text-gray-500" /><span className="text-white">{new Date(selectedSession.date + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Clock className="w-4 h-4 text-gray-500" /><span className="text-white">{selectedSession.startTime} - {selectedSession.endTime}</span></div>
                  {selectedSession.clientName && <div className="flex items-center gap-3 text-sm"><div className="w-4 h-4 rounded-full bg-teal-500/30 flex items-center justify-center flex-shrink-0"><span className="text-[8px] font-bold text-teal-400">{selectedSession.clientName[0]}</span></div><span className="text-white">{selectedSession.clientName}</span></div>}
                  {selectedSession.notes && <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5"><p className="text-xs text-gray-400">{selectedSession.notes}</p></div>}
                  <div><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_LABELS[selectedSession.status]?.class || ''}`}>{STATUS_LABELS[selectedSession.status]?.label || selectedSession.status}</span></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSession.status === 'scheduled' && <button onClick={() => updateStatus(selectedSession, 'confirmed')} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium hover:bg-emerald-500/30"><CheckCircle2 className="w-3.5 h-3.5" /> Подтвердить</button>}
                  {(selectedSession.status === 'scheduled' || selectedSession.status === 'confirmed') && <button onClick={() => updateStatus(selectedSession, 'completed')} className="flex items-center gap-1.5 px-3 py-2 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl text-xs font-medium hover:bg-teal-500/30"><CheckCircle2 className="w-3.5 h-3.5" /> Завершить</button>}
                  {selectedSession.status !== 'cancelled' && selectedSession.status !== 'completed' && <button onClick={() => updateStatus(selectedSession, 'cancelled')} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-medium hover:bg-red-500/20"><X className="w-3.5 h-3.5" /> Отменить</button>}
                  <button onClick={() => handleDelete(selectedSession.id)} className="px-3 py-2 bg-white/5 text-gray-400 border border-white/10 rounded-xl text-xs font-medium hover:text-red-400 hover:border-red-500/20 transition-colors ml-auto">Удалить</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Session Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="bg-[#12122a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-white">Новая сессия</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                  <div><label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Название *</label><input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Запись вокала, сведение..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40" /></div>
                  <div><label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Клиент</label><input type="text" value={formClient} onChange={e => setFormClient(e.target.value)} placeholder="Имя клиента" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40" /></div>
                  <div><label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Дата *</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Начало *</label><input type="time" value={formStart} onChange={e => setFormStart(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40" /></div>
                    <div><label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Конец *</label><input type="time" value={formEnd} onChange={e => setFormEnd(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40" /></div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Тип сессии</label>
                    <div className="flex flex-wrap gap-2">
                      {SESSION_TYPES.map(t => (
                        <button key={t.id} onClick={() => setFormType(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${formType === t.id ? 'border text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'}`} style={formType === t.id ? { background: `${t.color}20`, borderColor: `${t.color}40`, color: t.color } : {}}>
                          <t.icon className="w-3.5 h-3.5" />{t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Заметки</label><textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} placeholder="Дополнительная информация..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40 resize-none" /></div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Отмена</button>
                  <button onClick={handleCreate} disabled={!formTitle.trim() || !formDate || isSaving} className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Save className="w-4 h-4" />{isSaving ? 'Сохранение...' : 'Создать'}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}