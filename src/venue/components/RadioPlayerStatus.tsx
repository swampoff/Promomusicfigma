/**
 * RADIO PLAYER STATUS - Отображение статуса подключения плеера
 * 
 * Показывает:
 * - Статус подключения к платформе
 * - ID плеера
 * - Последнее обновление
 * - Качество соединения
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Wifi, WifiOff, Activity, Clock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface PlayerConnection {
  playerId: string | null;
  isConnected: boolean;
  lastSeen: Date | null;
  status: 'online' | 'offline' | 'connecting' | 'error';
}

interface RadioPlayerStatusProps {
  venueId: string;
  className?: string;
}

export function RadioPlayerStatus({ venueId, className = '' }: RadioPlayerStatusProps) {
  const [connection, setConnection] = useState<PlayerConnection>({
    playerId: null,
    isConnected: false,
    lastSeen: null,
    status: 'offline',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    registerPlayer();
    
    // Обновляем статус каждые 30 секунд
    const interval = setInterval(() => {
      updatePlayerStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [venueId]);

  const registerPlayer = async () => {
    try {
      setConnection(prev => ({ ...prev, status: 'connecting' }));

      // Временно пропускаем регистрацию, если API не готово
      // TODO: Раскомментировать когда SQL таблицы будут созданы
      setConnection({
        playerId: 'demo-player-' + Date.now(),
        isConnected: true,
        lastSeen: new Date(),
        status: 'online',
      });
      
      return;

      /* РАСКОММЕНТИРОВАТЬ КОГДА SQL ТАБЛИЦЫ ГОТОВЫ:
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/radio/register-player`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            venue_id: venueId,
            player_type: 'web',
            device_id: `browser-${navigator.userAgent.substring(0, 50)}-${Date.now()}`,
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to register player');
      }

      const data = await response.json();
      


      setConnection({
        playerId: data.player_id,
        isConnected: true,
        lastSeen: new Date(),
        status: 'online',
      });

      // Сохраняем в localStorage для переиспользования
      localStorage.setItem('radio_player_id', data.player_id);
      localStorage.setItem('radio_player_token', data.auth_token);
      */

    } catch (error) {
      console.error('[RadioPlayerStatus] Ошибка регистрации:', error);
      setConnection(prev => ({
        ...prev,
        status: 'error',
        isConnected: false,
      }));
    }
  };

  const updatePlayerStatus = async () => {
    if (!connection.playerId) return;

    // ВРЕМЕННО ОТКЛЮЧЕНО: используем демо-режим
    // TODO: Раскомментировать когда SQL таблицы будут созданы

    
    setConnection(prev => ({
      ...prev,
      lastSeen: new Date(),
      status: 'online',
    }));
    
    return;

    /* РАСКОММЕНТИРОВАТЬ КОГДА SQL ТАБЛИЦЫ ГОТОВЫ:
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/radio/player-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            player_id: connection.playerId,
            status: {
              is_playing: true, // TODO: получать из контекста плеера
              current_track: null,
              current_time: 0,
              volume: 0.8,
              timestamp: Date.now(),
            }
          })
        }
      );

      setConnection(prev => ({
        ...prev,
        lastSeen: new Date(),
        status: 'online',
      }));
    } catch (error) {
      console.error('[RadioPlayerStatus] Ошибка обновления статуса:', error);
    }
    */
  };

  const getStatusColor = () => {
    switch (connection.status) {
      case 'online': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'offline': return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
      case 'connecting': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30';
    }
  };

  const getStatusIcon = () => {
    switch (connection.status) {
      case 'online': return CheckCircle;
      case 'offline': return WifiOff;
      case 'connecting': return Loader2;
      case 'error': return AlertCircle;
    }
  };

  const getStatusText = () => {
    switch (connection.status) {
      case 'online': return 'Подключено';
      case 'offline': return 'Не подключено';
      case 'connecting': return 'Подключение...';
      case 'error': return 'Ошибка';
    }
  };

  const formatLastSeen = () => {
    if (!connection.lastSeen) return 'Никогда';
    
    const seconds = Math.floor((Date.now() - connection.lastSeen.getTime()) / 1000);
    
    if (seconds < 60) return 'Только что';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
    return `${Math.floor(seconds / 3600)} ч назад`;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className={`${className}`}>
      {/* Компактный индикатор */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-all ${getStatusColor()}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <StatusIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${connection.status === 'connecting' ? 'animate-spin' : ''}`} />
        <span className="text-xs sm:text-sm font-medium hidden xs:inline">{getStatusText()}</span>
        
        {connection.status === 'online' && (
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        )}
      </motion.button>

      {/* Развёрнутая информация */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10 space-y-2"
          >
            {/* Player ID */}
            {connection.playerId && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">ID плеера:</span>
                <span className="text-white font-mono text-[10px] truncate max-w-[100px] sm:max-w-[150px]">
                  {connection.playerId}
                </span>
              </div>
            )}

            {/* Last Seen */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Обновлено:
              </span>
              <span className="text-white">{formatLastSeen()}</span>
            </div>

            {/* Status Details */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Соединение:
              </span>
              <span className={`${connection.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {connection.isConnected ? 'Активно' : 'Неактивно'}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                onClick={registerPlayer}
                disabled={connection.status === 'connecting'}
                className="flex-1 px-3 py-1.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-medium hover:bg-purple-500/30 transition-all disabled:opacity-50"
              >
                Переподключить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}