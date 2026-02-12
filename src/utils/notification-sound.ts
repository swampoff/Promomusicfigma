/**
 * NOTIFICATION SOUND - Звуковые уведомления через Web Audio API
 * 
 * Генерирует приятные звуковые оповещения без внешних файлов.
 * Поддерживает три уровня: normal (одобрено), warning (доработка), critical (отклонено).
 * Настройки сохраняются в localStorage.
 */

const LS_KEY = 'promo_notification_sound_enabled';
const LS_VOLUME_KEY = 'promo_notification_sound_volume';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ── Persistence ──────────────────────────────────────────

export function isSoundEnabled(): boolean {
  const val = localStorage.getItem(LS_KEY);
  return val === null ? true : val === 'true';
}

export function toggleSound(): boolean {
  const next = !isSoundEnabled();
  localStorage.setItem(LS_KEY, String(next));
  return next;
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(LS_KEY, String(enabled));
}

export function getSoundVolume(): number {
  const val = localStorage.getItem(LS_VOLUME_KEY);
  return val ? Math.min(1, Math.max(0, parseFloat(val))) : 0.3;
}

export function setSoundVolume(volume: number): void {
  localStorage.setItem(LS_VOLUME_KEY, String(Math.min(1, Math.max(0, volume))));
}

// ── Sound generators ─────────────────────────────────────

type NotificationLevel = 'normal' | 'warning' | 'critical';

/**
 * Воспроизводит звуковое уведомление.
 * - normal: мягкий двутональный chime (одобрено, опубликовано)
 * - warning: три восходящих тона (доработка, на проверке)
 * - critical: два нисходящих тона (отклонено)
 */
export function playNotificationSound(level: NotificationLevel = 'normal'): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    const volume = getSoundVolume();
    const now = ctx.currentTime;

    switch (level) {
      case 'normal':
        playTone(ctx, 880, now, 0.12, volume * 0.5, 'sine');
        playTone(ctx, 1174.66, now + 0.12, 0.18, volume * 0.4, 'sine');
        break;

      case 'warning':
        playTone(ctx, 587.33, now, 0.1, volume * 0.4, 'triangle');
        playTone(ctx, 739.99, now + 0.1, 0.1, volume * 0.35, 'triangle');
        playTone(ctx, 880, now + 0.2, 0.15, volume * 0.3, 'triangle');
        break;

      case 'critical':
        playTone(ctx, 659.25, now, 0.15, volume * 0.5, 'square');
        playTone(ctx, 493.88, now + 0.18, 0.22, volume * 0.4, 'square');
        break;
    }
  } catch (err) {
    console.warn('Notification sound failed:', err);
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType,
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  // Envelope: быстрый attack, плавный release
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.01);
}

/**
 * Определяет уровень звука по статусу публикации.
 */
export function getLevelForStatus(status: string): NotificationLevel {
  switch (status) {
    case 'approved':
    case 'published':
    case 'paid':
    case 'pending_payment':
      return 'normal';

    case 'revision':
    case 'in_review':
      return 'warning';

    case 'rejected':
      return 'critical';

    default:
      return 'normal';
  }
}

/**
 * Воспроизводит звук для конкретного статуса.
 */
export function playStatusSound(status: string): void {
  playNotificationSound(getLevelForStatus(status));
}
