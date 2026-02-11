/**
 * BEFORE/AFTER AUDIO PLAYER
 * Интерактивный плеер для сравнения "До" и "После" обработки
 * Используется в портфолио продюсера
 * Генерирует демо-аудио через Web Audio API (осциллятор)
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface BeforeAfterPlayerProps {
  title: string;
  type: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeAfterDescription?: string;
  accentColor?: string;
}

// Generate deterministic pseudo-random waveform bars
function generateWaveform(seed: string, bars: number, isProcessed: boolean): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const result: number[] = [];
  for (let i = 0; i < bars; i++) {
    hash = ((hash * 1103515245 + 12345) & 0x7fffffff);
    const base = (hash % 100) / 100;
    // "After" has more dynamics and louder peaks
    const val = isProcessed
      ? 0.25 + base * 0.75
      : 0.1 + base * 0.45;
    result.push(val);
  }
  return result;
}

export function BeforeAfterPlayer({
  title,
  type,
  beforeLabel = 'До',
  afterLabel = 'После',
  beforeAfterDescription,
  accentColor,
}: BeforeAfterPlayerProps) {
  const [mode, setMode] = useState<'before' | 'after'>('before');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const DURATION = 8; // seconds

  const barCount = 48;
  const beforeWave = useMemo(() => generateWaveform(title + 'before', barCount, false), [title]);
  const afterWave = useMemo(() => generateWaveform(title + 'after', barCount, true), [title]);
  const currentWave = mode === 'before' ? beforeWave : afterWave;

  const stopAudio = useCallback(() => {
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch {}
      oscillatorRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(() => {
    stopAudio();

    const ctx = audioContextRef.current || new AudioContext();
    audioContextRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // "Before" - simple, dry sine wave; "After" - richer, processed sound
    if (mode === 'before') {
      osc.type = 'sine';
      osc.frequency.value = 220;
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      gain.gain.value = isMuted ? 0 : 0.15;
    } else {
      osc.type = 'sawtooth';
      osc.frequency.value = 220;
      filter.type = 'lowpass';
      filter.frequency.value = 3000;
      filter.Q.value = 2;
      gain.gain.value = isMuted ? 0 : 0.08;
      // Add slight pitch envelope for richness
      osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.5);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 1.5);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + DURATION);

    oscillatorRef.current = osc;
    gainRef.current = gain;
    startTimeRef.current = ctx.currentTime;
    setIsPlaying(true);

    const animate = () => {
      if (!audioContextRef.current) return;
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);
      if (pct < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);

    osc.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, isMuted, stopAudio]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAudio();
      setProgress(0);
    } else {
      playAudio();
    }
  }, [isPlaying, playAudio, stopAudio]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (gainRef.current) {
        gainRef.current.gain.value = next ? 0 : (mode === 'before' ? 0.15 : 0.08);
      }
      return next;
    });
  }, [mode]);

  const pendingAutoPlayRef = useRef(false);

  const switchMode = useCallback((newMode: 'before' | 'after') => {
    if (newMode === mode) return;
    const wasPlaying = isPlaying;
    stopAudio();
    setProgress(0);
    setMode(newMode);
    if (wasPlaying) {
      pendingAutoPlayRef.current = true;
    }
  }, [mode, isPlaying, stopAudio]);

  // Auto-restart playback after mode switch
  useEffect(() => {
    if (pendingAutoPlayRef.current) {
      pendingAutoPlayRef.current = false;
      const timer = setTimeout(() => playAudio(), 80);
      return () => clearTimeout(timer);
    }
  }, [mode, playAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopAudio]);

  const progressBarIndex = Math.floor(progress * barCount);

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 overflow-hidden">
      {/* Mode Toggle */}
      <div className="flex items-stretch border-b border-white/5">
        <button
          onClick={() => switchMode('before')}
          className={`flex-1 py-2.5 text-xs font-bold tracking-wide transition-all ${
            mode === 'before'
              ? 'bg-gray-500/20 text-gray-300'
              : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          {beforeLabel}
        </button>
        <div className="w-px bg-white/5" />
        <button
          onClick={() => switchMode('after')}
          className={`flex-1 py-2.5 text-xs font-bold tracking-wide transition-all ${
            mode === 'after'
              ? 'bg-teal-500/20 text-teal-400'
              : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          {afterLabel}
        </button>
      </div>

      {/* Waveform */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-end gap-[2px] h-12">
          {currentWave.map((val, i) => {
            const isActive = i <= progressBarIndex && isPlaying;
            const barColor = mode === 'after'
              ? (isActive ? 'bg-teal-400' : 'bg-teal-500/25')
              : (isActive ? 'bg-gray-300' : 'bg-gray-600/40');
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-colors duration-75 ${barColor}`}
                style={{ height: `${val * 100}%`, minHeight: '2px' }}
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-3 pb-3">
        <button
          onClick={togglePlay}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
            mode === 'after'
              ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400'
              : 'bg-white/10 hover:bg-white/15 text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${mode === 'after' ? 'bg-teal-400' : 'bg-gray-400'}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <button
          onClick={toggleMute}
          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>

        <span className="text-[10px] text-gray-600 font-mono tabular-nums min-w-[24px]">
          {Math.floor(progress * DURATION)}s
        </span>
      </div>

      {/* Description */}
      {beforeAfterDescription && (
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 pb-3"
          >
            <p className={`text-[10px] leading-relaxed ${
              mode === 'after' ? 'text-teal-400/70' : 'text-gray-500'
            }`}>
              {mode === 'before'
                ? beforeAfterDescription.split('. После:')[0]?.replace('До: ', '') || beforeAfterDescription
                : beforeAfterDescription.split('После: ')[1] || beforeAfterDescription
              }
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
