/**
 * PRODUCER MESSAGES TAB
 * Реальная переписка с клиентами через KV Store
 * Polling каждые 4 сек, Browser Notification API, аудио-запись/загрузка через Supabase Storage
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Send, ArrowLeft, Paperclip, Music2,
  Check, CheckCheck, Search,
  Mic, Image as ImageIcon, Smile, MoreVertical,
  Wifi, WifiOff, RefreshCw, BellRing, BellOff,
  X, Upload, Square, Loader2, Play, Pause, FileAudio,
} from 'lucide-react';
import * as studioApi from '@/utils/api/producer-studio';
import type { Message, ConversationMeta } from '@/utils/api/producer-studio';

interface ProducerMessagesProps {
  producerId: string;
  producerName: string;
}

const POLL_INTERVAL = 4000;

// ─── Notification Helper ───
function requestNotifPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'promo-producer-msg',
      silent: false,
    });
  }
}

// ─── Notification Sound ───
const NOTIF_SOUND_URL = 'data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToFAAAAAAEAAgADAAQABQAGAAcACAAJAAoACwAMAA0ADgAPABAAGAAgACgAMAA4AEAAUABgAHAAeACAAIgAkACYAKAAqACwALgAwADIANAA4AD4ABABKAFAAXABkAGwAdAB+AEgAkgCeAKoAtgDCAM4A2gDmAPIA/gDKARYBIgEuAToBQgFOAVgBYAFmAW4BdAF6AYABhgGKAY4BkAGSAZIBkAGMAYgBgAG4AXABZAFQAU4BRgE+APoAsgCmAJoAkgCAAJ4AXABNAE0ARQA6AC4AKQAZABQADAAIAAEAD4APgA6ADYAMgAwACoAKAAoACgAKAAqACwAMgA0ADgAPAA+ADYAOAA2ADAALAAoACQAIAAgABwAGAAUABAADAAIAAQAAAA==';

function playNotifSound() {
  try {
    const audio = new Audio(NOTIF_SOUND_URL);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch {}
}

// ─── Inline Audio Player ───
function InlineAudioPlayer({ src, name }: { src?: string; name: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('timeupdate', () => setProgress(audio.currentTime));
    audio.addEventListener('ended', () => { setPlaying(false); setProgress(0); });
    return () => { audio.pause(); audio.src = ''; };
  }, [src]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
      <button onClick={toggle} className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 hover:bg-teal-500/30 transition-colors">
        {playing ? <Pause className="w-3 h-3 text-teal-400" /> : <Play className="w-3 h-3 text-teal-400 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 rounded-full transition-all" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} />
          </div>
          <span className="text-[9px] text-gray-500 flex-shrink-0">{fmt(progress)}/{fmt(duration)}</span>
        </div>
        <p className="text-[9px] text-gray-500 truncate mt-0.5">{name}</p>
      </div>
    </div>
  );
}

export function ProducerMessages({ producerId, producerName }: ProducerMessagesProps) {
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollActive, setPollActive] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPollTimeRef = useRef<string>('1970-01-01T00:00:00Z');

  // ─── Audio Recording ───
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Request notification permission ───
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') setNotificationsEnabled(true);
    }
  }, []);

  const toggleNotifications = useCallback(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(prev => !prev);
    } else {
      Notification.requestPermission().then(p => {
        if (p === 'granted') setNotificationsEnabled(true);
      });
    }
  }, []);

  // ─── Load conversations ───
  const loadConversations = useCallback(async () => {
    setIsLoadingConvs(true);
    const result = await studioApi.fetchConversations(producerId);
    if (result.success) setConversations(result.data);
    setIsLoadingConvs(false);
  }, [producerId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ─── Load messages ───
  const loadMessages = useCallback(async (convId: string) => {
    setIsLoadingMsgs(true);
    const result = await studioApi.fetchMessages(convId);
    if (result.success) {
      setMessages(result.data);
      lastPollTimeRef.current = result.data.length > 0 ? result.data[result.data.length - 1].timestamp : new Date().toISOString();
    }
    setIsLoadingMsgs(false);
  }, []);

  const selectConversation = useCallback(async (convId: string) => {
    setActiveConvId(convId);
    await loadMessages(convId);
    studioApi.markRead({ conversationId: convId, producerId });
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread: 0 } : c));
  }, [loadMessages, producerId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  useEffect(() => { if (messages.length) scrollToBottom(); }, [messages.length, scrollToBottom]);

  // ─── Polling with notifications ───
  useEffect(() => {
    if (!activeConvId || !pollActive) return;

    const poll = async () => {
      try {
        setIsPolling(true);
        const result = await studioApi.pollMessages(activeConvId, lastPollTimeRef.current);
        if (result.success && result.data.length > 0) {
          const clientMsgs = result.data.filter((m: Message) => m.sender === 'client');

          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMsgs = result.data.filter((m: Message) => !existingIds.has(m.id));
            if (newMsgs.length === 0) return prev;
            const updated = [...prev, ...newMsgs];
            lastPollTimeRef.current = updated[updated.length - 1].timestamp;
            return updated;
          });

          // Browser notification for client messages
          if (notificationsEnabled && clientMsgs.length > 0) {
            const conv = conversations.find(c => c.id === activeConvId);
            const clientName = conv?.clientName || 'Клиент';
            showBrowserNotification(
              `Новое сообщение от ${clientName}`,
              clientMsgs[clientMsgs.length - 1].text
            );
            playNotifSound();
          }

          // Refresh conversations
          const convsResult = await studioApi.fetchConversations(producerId);
          if (convsResult.success) {
            setConversations(convsResult.data.map(c => c.id === activeConvId ? { ...c, unread: 0 } : c));
          }
          scrollToBottom();
        }
      } catch (e) {
        console.error('Poll error:', e);
      } finally {
        setIsPolling(false);
      }
    };

    pollTimerRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  }, [activeConvId, pollActive, producerId, scrollToBottom, notificationsEnabled, conversations]);

  // ─── Send text message ───
  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !activeConvId || isSending) return;
    const text = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    const optimisticMsg: Message = { id: `opt-${Date.now()}`, text, sender: 'producer', timestamp: new Date().toISOString(), read: false };
    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    const result = await studioApi.sendMessage({ conversationId: activeConvId, producerId, text, sender: 'producer' });
    if (result.success) {
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? result.data : m));
      lastPollTimeRef.current = result.data.timestamp;
      setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, lastMessage: text.length > 50 ? text.slice(0, 47) + '...' : text, lastTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) } : c));
    }
    setIsSending(false);
  }, [newMessage, activeConvId, isSending, producerId, scrollToBottom]);

  // ─── Audio Recording (MediaRecorder API) ───
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !activeConvId) return;
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks
        mediaRecorderRef.current!.stream.getTracks().forEach(t => t.stop());

        // Convert to base64 and upload
        setIsUploading(true);
        try {
          const base64 = await blobToBase64(blob);
          const fileName = `voice_${Date.now()}.webm`;
          const uploadResult = await studioApi.uploadAudio({
            fileName,
            base64Data: base64,
            contentType: 'audio/webm',
          });

          if (uploadResult.success) {
            // Send message with audio attachment
            const text = 'Голосовое сообщение';
            await studioApi.sendMessage({
              conversationId: activeConvId!,
              producerId,
              text,
              sender: 'producer',
              attachment: { type: 'audio', name: fileName },
            });
            // Reload messages to get the server version
            await loadMessages(activeConvId!);
          }
        } catch (err) {
          console.error('Upload error:', err);
        }
        setIsUploading(false);
        resolve();
      };

      mediaRecorderRef.current!.stop();
    });
  }, [activeConvId, producerId, loadMessages]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    audioChunksRef.current = [];
  }, []);

  // ─── File Upload (from file picker) ───
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvId) return;

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const uploadResult = await studioApi.uploadAudio({
        fileName: file.name,
        base64Data: base64,
        contentType: file.type || 'audio/mpeg',
      });

      if (uploadResult.success) {
        await studioApi.sendMessage({
          conversationId: activeConvId,
          producerId,
          text: `Аудио: ${file.name}`,
          sender: 'producer',
          attachment: { type: 'audio', name: file.name },
        });
        await loadMessages(activeConvId);
      }
    } catch (err) {
      console.error('File upload error:', err);
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [activeConvId, producerId, loadMessages]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
      }
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConvId);
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);
  const filteredConversations = searchQuery
    ? conversations.filter(c => c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || c.orderTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (isLoadingConvs) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Сообщения</h2>
        {[1, 2, 3].map(i => <div key={i} className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/5 p-4 h-20" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Сообщения</h2>
          {totalUnread > 0 && <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs font-bold rounded-full">{totalUnread}</span>}
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-bold">Онлайн</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleNotifications}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${notificationsEnabled ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}
            title={notificationsEnabled ? 'Уведомления включены' : 'Включить уведомления'}
          >
            {notificationsEnabled ? <BellRing className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
            {notificationsEnabled ? 'Notify' : 'Off'}
          </button>
          <button
            onClick={() => setPollActive(p => !p)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${pollActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}
          >
            {pollActive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {pollActive ? 'Live' : 'Off'}
          </button>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 240px)', minHeight: '480px' }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={`${activeConvId ? 'hidden sm:flex' : 'flex'} flex-col border-r border-white/5`} style={{ width: '320px', minWidth: '280px' }}>
            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск диалогов..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map(conv => (
                <button key={conv.id} onClick={() => selectConversation(conv.id)} className={`w-full flex items-start gap-3 p-3 text-left transition-colors border-b border-white/[0.03] ${activeConvId === conv.id ? 'bg-teal-500/10 border-l-2 border-l-teal-400' : 'hover:bg-white/[0.03]'}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/20 flex items-center justify-center"><span className="text-sm font-bold text-teal-300">{conv.clientInitial}</span></div>
                    {conv.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0a14]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-white truncate">{conv.clientName}</p>
                      <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{conv.lastTime}</span>
                    </div>
                    <p className="text-[10px] text-teal-400/70 mb-0.5 truncate">{conv.orderTitle}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                      {conv.unread > 0 && <span className="ml-2 w-5 h-5 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">{conv.unread}</span>}
                    </div>
                  </div>
                </button>
              ))}
              {filteredConversations.length === 0 && (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">{searchQuery ? 'Ничего не найдено' : 'Нет диалогов'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${activeConvId ? 'flex' : 'hidden sm:flex'} flex-col flex-1 min-w-0`}>
            {activeConversation ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <button onClick={() => setActiveConvId(null)} className="sm:hidden p-1.5 hover:bg-white/5 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-400" /></button>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/20 flex items-center justify-center"><span className="text-xs font-bold text-teal-300">{activeConversation.clientInitial}</span></div>
                    {activeConversation.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0a14]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{activeConversation.clientName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{activeConversation.orderTitle}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isPolling && pollActive && <RefreshCw className="w-3 h-3 text-teal-400 animate-spin" />}
                    <button className="p-2 hover:bg-white/5 rounded-lg"><MoreVertical className="w-4 h-4 text-gray-500" /></button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {isLoadingMsgs ? (
                    <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 text-teal-400 animate-spin" /></div>
                  ) : (
                    <>
                      {messages.map(msg => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'producer' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.sender === 'producer' ? 'bg-teal-500/20 border border-teal-500/20 rounded-br-md' : 'bg-white/[0.06] border border-white/10 rounded-bl-md'}`}>
                            {msg.attachment && (
                              msg.attachment.type === 'audio' ? (
                                <InlineAudioPlayer name={msg.attachment.name} />
                              ) : (
                                <div className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${msg.sender === 'producer' ? 'bg-teal-500/10' : 'bg-white/5'}`}>
                                  {msg.attachment.type === 'image' ? <ImageIcon className="w-4 h-4 text-blue-400 flex-shrink-0" /> : <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                                  <span className="text-xs text-gray-300 truncate">{msg.attachment.name}</span>
                                </div>
                              )
                            )}
                            <p className="text-sm text-white/90 leading-relaxed">{msg.text}</p>
                            <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'producer' ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                              {msg.sender === 'producer' && (msg.read ? <CheckCheck className="w-3 h-3 text-teal-400" /> : <Check className="w-3 h-3 text-gray-500" />)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input area */}
                <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                  {/* Recording UI */}
                  {isRecording ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-red-400">Запись... {fmtTime(recordingTime)}</span>
                      </div>
                      <button onClick={cancelRecording} className="p-2.5 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
                      <button onClick={stopRecording} className="p-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20"><Send className="w-4 h-4" /></button>
                    </div>
                  ) : isUploading ? (
                    <div className="flex items-center justify-center gap-2 py-3">
                      <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                      <span className="text-sm text-gray-400">Загрузка аудио...</span>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <div className="flex gap-1">
                        {/* File upload */}
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Прикрепить аудио">
                          <FileAudio className="w-4 h-4 text-gray-500" />
                        </button>
                        <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                        {/* Voice recording */}
                        <button onClick={startRecording} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Записать голосовое">
                          <Mic className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <div className="flex-1 relative">
                        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Написать сообщение..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40 pr-10" disabled={isSending} />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-lg hidden sm:block"><Smile className="w-4 h-4 text-gray-500" /></button>
                      </div>
                      <button onClick={handleSend} disabled={!newMessage.trim() || isSending} className={`p-2.5 rounded-xl transition-all ${newMessage.trim() && !isSending ? 'bg-teal-500 text-white hover:bg-teal-400 shadow-lg shadow-teal-500/20' : 'bg-white/5 text-gray-600'}`}><Send className="w-4 h-4" /></button>
                    </div>
                  )}
                  {pollActive && !isRecording && !isUploading && (
                    <p className="text-[9px] text-gray-600 mt-1.5 text-center">Ответы клиентов появятся автоматически через 3-8 секунд</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4"><MessageSquare className="w-8 h-8 text-teal-400/40" /></div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Выберите диалог</p>
                  <p className="text-gray-600 text-xs">Выберите диалог для просмотра переписки</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Utils ───
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:... prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fileToBase64(file: File): Promise<string> {
  return blobToBase64(file);
}