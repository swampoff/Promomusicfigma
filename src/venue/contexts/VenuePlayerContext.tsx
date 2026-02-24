/**
 * VENUE PLAYER CONTEXT - Контекст управления музыкальным плеером заведения
 * Enterprise-система воспроизведения музыки с полным управлением
 */

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import type { Playlist, PlaylistTrack } from '../types/venue-types';

// =====================================================
// TYPES
// =====================================================

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  // Current playback
  currentTrack: PlaylistTrack | null;
  currentPlaylist: Playlist | null;
  isPlaying: boolean;
  
  // Progress
  currentTime: number;
  duration: number;
  
  // Controls
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  
  // Queue
  queue: PlaylistTrack[];
  currentIndex: number;
}

interface PlayerControls {
  // Playback
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  
  // Navigation
  next: () => void;
  previous: () => void;
  seekTo: (time: number) => void;
  
  // Volume
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Modes
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  
  // Playlist
  loadPlaylist: (playlist: Playlist) => void;
  loadTrack: (track: PlaylistTrack, playlist?: Playlist) => void;
  addToQueue: (track: PlaylistTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

type VenuePlayerContextType = PlayerState & PlayerControls;

// =====================================================
// CONTEXT
// =====================================================

const VenuePlayerContext = createContext<VenuePlayerContextType | undefined>(undefined);

export function useVenuePlayer(): VenuePlayerContextType {
  const context = useContext(VenuePlayerContext);
  if (context === undefined) {
    throw new Error('useVenuePlayer must be used within VenuePlayerProvider');
  }
  return context;
}

// =====================================================
// PROVIDER
// =====================================================

interface VenuePlayerProviderProps {
  children: ReactNode;
}

export function VenuePlayerProvider({ children }: VenuePlayerProviderProps) {
  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null); // ✅ Добавляем реф для GainNode
  const startTimeRef = useRef<number>(0); // Время начала воспроизведения

  // State
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    currentPlaylist: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    repeatMode: 'off',
    isShuffle: false,
    queue: [],
    currentIndex: -1,
  });

  // Initialize audio element on mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.7;
    
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      if (audio) {
        setState(prev => ({
          ...prev,
          duration: audio.duration,
        }));
      }
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      // Не сбрасываем isPlaying сразу - даем время для альтернативных попыток загрузки
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Update progress when playing (для Web Audio API)
  useEffect(() => {
    if (state.isPlaying) {
      // Запоминаем время начала
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      
      progressIntervalRef.current = window.setInterval(() => {
        if (audioContextRef.current) {
          // Вычисляем текущее время воспроизведения
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          
          if (elapsed >= state.duration) {
            // Трек закончился
            setState(prev => ({ ...prev, isPlaying: false, currentTime: prev.duration }));
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
          } else {
            setState(prev => ({ ...prev, currentTime: elapsed }));
          }
        }
      }, 100);
    } else {
      // Сбрасываем время начала
      startTimeRef.current = 0;
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [state.isPlaying, state.duration]);

  // =====================================================
  // CONTROLS
  // =====================================================

  // Создаем синтетический аудиобуфер для демонстрации
  const createDemoAudioBuffer = (audioContext: AudioContext, duration: number = 30): AudioBuffer => {
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    // Генерируем приятную мелодию
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Простая мелодия с несколькими частотами
        const freq1 = 440; // A4
        const freq2 = 554.37; // C#5
        const freq3 = 659.25; // E5
        
        const wave = 
          Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
          Math.sin(2 * Math.PI * freq2 * t) * 0.2 +
          Math.sin(2 * Math.PI * freq3 * t) * 0.1;
        
        // Envelope для плавного затухания
        const envelope = Math.exp(-t / 10);
        data[i] = wave * envelope;
      }
    }
    return buffer;
  };

  const play = () => {
    if (!state.currentTrack) {
      console.warn('[VenuePlayer] Cannot play - no currentTrack');
      return;
    }

    try {
      // Используем Web Audio API для создания демо-звука
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Останавливаем предыдущий источник если есть
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch (e) {
          // Игнорируем ошибки при остановке
        }
      }

      // Создаем новый источник
      const buffer = createDemoAudioBuffer(audioContext, 30);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      
      // Создаем узел громкости
      const gainNode = audioContext.createGain();
      gainNode.gain.value = state.isMuted ? 0 : state.volume;
      gainNodeRef.current = gainNode; // ✅ Сохраняем GainNode в реф
      
      // Подключаем: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Обработчик окончания
      source.onended = () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      };
      
      source.start(0);
      sourceNodeRef.current = source;
      
      // Устанавливаем длительность
      setState(prev => ({ 
        ...prev, 
        isPlaying: true,
        duration: buffer.duration,
        currentTime: 0
      }));
      
      console.log('[VenuePlayer] Started Web Audio playback, duration:', buffer.duration);
    } catch (err) {
      console.error('[VenuePlayer] Web Audio error:', err);
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const pause = () => {
    // Останавливаем Web Audio источник
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      } catch (e) {
        console.error('Error stopping audio source:', e);
      }
    }
    
    // ✅ Очищаем gainNode, так как он связан с остановленным источником
    gainNodeRef.current = null;
    
    // Также останавливаем HTML Audio элемент если используется
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setState(prev => ({ ...prev, isPlaying: false }));
    
    console.log('[VenuePlayer] Paused');
  };

  const togglePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const stop = () => {
    // Останавливаем Web Audio источник
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      } catch (e) {
        console.error('Error stopping audio source:', e);
      }
    }
    
    // ✅ Очищаем gainNode
    gainNodeRef.current = null;
    
    // Также останавливаем HTML Audio элемент если используется
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }));
  };

  const next = () => {
    if (state.queue.length === 0) return;

    let nextIndex: number;

    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else {
      nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          stop();
          return;
        }
      }
    }

    const nextTrack = state.queue[nextIndex];
    setState(prev => ({
      ...prev,
      currentTrack: nextTrack,
      currentIndex: nextIndex,
      currentTime: 0,
    }));

    if (state.isPlaying) {
      setTimeout(() => play(), 100);
    }
  };

  const previous = () => {
    if (state.currentTime > 3) {
      seekTo(0);
      return;
    }

    if (state.queue.length === 0) return;

    let prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
      if (state.repeatMode === 'all') {
        prevIndex = state.queue.length - 1;
      } else {
        seekTo(0);
        return;
      }
    }

    const prevTrack = state.queue[prevIndex];
    setState(prev => ({
      ...prev,
      currentTrack: prevTrack,
      currentIndex: prevIndex,
      currentTime: 0,
    }));

    if (state.isPlaying) {
      setTimeout(() => play(), 100);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    
    // ✅ Обновляем GainNode если он существует (во время воспроизведения)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume;
    }
    
    setState(prev => ({
      ...prev,
      volume: clampedVolume,
      isMuted: clampedVolume === 0,
    }));
  };

  const toggleMute = () => {
    const newMutedState = !state.isMuted;
    
    if (audioRef.current) {
      audioRef.current.volume = newMutedState ? 0 : state.volume;
    }
    
    // ✅ Обновляем GainNode при изменении mute
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newMutedState ? 0 : state.volume;
    }
    
    setState(prev => ({ ...prev, isMuted: newMutedState }));
  };

  const setRepeatMode = (mode: RepeatMode) => {
    setState(prev => ({ ...prev, repeatMode: mode }));
  };

  const toggleShuffle = () => {
    setState(prev => ({ ...prev, isShuffle: !prev.isShuffle }));
  };

  const loadPlaylist = (playlist: Playlist) => {
    const tracks = playlist.contentItems || [];
    
    setState(prev => ({
      ...prev,
      currentPlaylist: playlist,
      queue: tracks,
      currentTrack: tracks[0] || null,
      currentIndex: 0,
      currentTime: 0,
    }));

    console.log('[VenuePlayer] Loaded playlist:', playlist.title, '- Tracks:', tracks.length);
  };

  const loadTrack = (track: PlaylistTrack, playlist?: Playlist) => {
    setState(prev => ({
      ...prev,
      currentTrack: track,
      currentPlaylist: playlist || prev.currentPlaylist,
      currentTime: 0,
    }));

    console.log('[VenuePlayer] Loaded track:', track.title);
  };

  const addToQueue = (track: PlaylistTrack) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
  };

  const removeFromQueue = (index: number) => {
    setState(prev => {
      const newQueue = [...prev.queue];
      newQueue.splice(index, 1);
      
      let newIndex = prev.currentIndex;
      if (index < prev.currentIndex) {
        newIndex--;
      } else if (index === prev.currentIndex) {
        newIndex = Math.min(newIndex, newQueue.length - 1);
      }

      return {
        ...prev,
        queue: newQueue,
        currentIndex: newIndex,
        currentTrack: newQueue[newIndex] || null,
      };
    });
  };

  const clearQueue = () => {
    stop();
    setState(prev => ({
      ...prev,
      queue: [],
      currentTrack: null,
      currentPlaylist: null,
      currentIndex: -1,
    }));
  };

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value: VenuePlayerContextType = {
    // State
    ...state,
    
    // Controls
    play,
    pause,
    togglePlayPause,
    stop,
    next,
    previous,
    seekTo,
    setVolume,
    toggleMute,
    setRepeatMode,
    toggleShuffle,
    loadPlaylist,
    loadTrack,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };

  return (
    <VenuePlayerContext.Provider value={value}>
      {children}
    </VenuePlayerContext.Provider>
  );
}