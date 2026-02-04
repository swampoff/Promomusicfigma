# 🎙️ Руководство по подключению плеера заведения

## 📋 Содержание
1. [Быстрый старт](#быстрый-старт)
2. [API Endpoints](#api-endpoints)
3. [Примеры подключения](#примеры-подключения)
4. [Варианты развертывания](#варианты-развертывания)

---

## 🚀 Быстрый старт

### Шаг 1: Регистрация плеера

```javascript
// Frontend (React/TypeScript)
const registerPlayer = async (venueId: string) => {
  const response = await fetch(
    'https://your-project.supabase.co/functions/v1/make-server-84730125/radio/register-player',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        venue_id: venueId,
        player_type: 'web',
        device_id: `browser-${navigator.userAgent}-${Date.now()}`,
        location: {
          lat: 55.7558,
          lng: 37.6173
        }
      })
    }
  );

  const data = await response.json();
  
  console.log('📡 Плеер зарегистрирован:', data);
  /*
  {
    player_id: "uuid",
    stream_url: "https://...stream.m3u8",
    websocket_url: "wss://...ws/player/uuid",
    auth_token: "player_token",
    config: {
      playlist_id: "uuid",
      volume: 0.8,
      crossfade: 3,
      jingle_frequency: 5
    }
  }
  */

  return data;
};
```

### Шаг 2: Подключение к WebSocket

```javascript
class VenueRadioPlayer {
  private ws: WebSocket | null = null;
  private player: HTMLAudioElement;
  private config: PlayerConfig;

  async connect(venueId: string) {
    // 1. Регистрация
    const registration = await registerPlayer(venueId);
    this.config = registration.config;

    // 2. Подключение к WebSocket
    this.ws = new WebSocket(
      `${registration.websocket_url}?token=${registration.auth_token}`
    );

    this.ws.onopen = () => {
      console.log('🎵 WebSocket подключён');
      this.sendStatus();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleCommand(data);
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket ошибка:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket отключён, переподключение...');
      setTimeout(() => this.connect(venueId), 5000);
    };

    // 3. Начинаем воспроизведение стрима
    this.player = new Audio(registration.stream_url);
    this.player.volume = this.config.volume;
  }

  handleCommand(data: any) {
    switch (data.type) {
      case 'PLAY':
        this.player.play();
        break;
      
      case 'PAUSE':
        this.player.pause();
        break;
      
      case 'VOLUME':
        this.player.volume = data.volume;
        break;
      
      case 'LOAD_PLAYLIST':
        this.loadPlaylist(data.playlist_id);
        break;
    }
  }

  sendStatus() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      type: 'STATUS_UPDATE',
      status: {
        is_playing: !this.player.paused,
        current_track: this.currentTrack,
        current_time: this.player.currentTime,
        volume: this.player.volume,
        timestamp: Date.now()
      }
    }));
  }

  // Отправляем статус каждые 10 секунд
  startStatusReporting() {
    setInterval(() => this.sendStatus(), 10000);
  }
}

// Использование
const radioPlayer = new VenueRadioPlayer();
radioPlayer.connect('venue-uuid-here');
radioPlayer.startStatusReporting();
```

---

## 📡 API Endpoints

### 1. POST `/radio/register-player`
Регистрация нового плеера или переподключение существующего.

**Request:**
```json
{
  "venue_id": "uuid",
  "player_type": "web" | "hardware" | "mobile",
  "device_id": "unique-device-id",
  "location": {
    "lat": 55.7558,
    "lng": 37.6173
  }
}
```

**Response:**
```json
{
  "player_id": "uuid",
  "stream_url": "https://stream-url",
  "websocket_url": "wss://websocket-url",
  "auth_token": "jwt-token",
  "config": {
    "playlist_id": "uuid",
    "volume": 0.8,
    "crossfade": 3,
    "jingle_frequency": 5
  }
}
```

### 2. POST `/radio/player-status`
Обновление статуса плеера.

**Request:**
```json
{
  "player_id": "uuid",
  "status": {
    "is_playing": true,
    "current_track": { "id": "uuid", "title": "Track" },
    "current_time": 45,
    "volume": 0.8,
    "timestamp": 1738698543210
  }
}
```

### 3. GET `/radio/player/:id`
Получение информации о плеере.

**Response:**
```json
{
  "id": "uuid",
  "venue_id": "uuid",
  "player_type": "web",
  "status": "online",
  "is_playing": true,
  "current_track_id": "uuid",
  "volume": 0.8,
  "last_seen": "2026-02-04T12:30:00Z"
}
```

### 4. GET `/radio/venue/:venueId/players`
Получение всех плееров заведения.

**Response:**
```json
{
  "players": [
    {
      "id": "uuid",
      "player_type": "web",
      "status": "online",
      "last_seen": "2026-02-04T12:30:00Z"
    }
  ]
}
```

### 5. POST `/radio/player/:id/command`
Отправка команды плееру.

**Request:**
```json
{
  "command": "PLAY" | "PAUSE" | "VOLUME" | "LOAD_PLAYLIST" | "SKIP" | "INJECT_CONTENT",
  "params": {
    "volume": 0.5,
    "playlist_id": "uuid"
  }
}
```

---

## 💻 Примеры подключения

### Вариант 1: Веб-плеер (текущий)

```typescript
// /src/venue/hooks/useVenueRadioConnection.ts
import { useEffect, useState } from 'react';
import { useVenuePlayer } from '../contexts/VenuePlayerContext';

export function useVenueRadioConnection(venueId: string) {
  const player = useVenuePlayer();
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const connect = async () => {
      try {
        // Регистрация плеера
        const response = await fetch('/api/radio/register-player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            venue_id: venueId,
            player_type: 'web',
            device_id: `browser-${Date.now()}`
          })
        });

        const config = await response.json();
        setPlayerId(config.player_id);

        // Подключение к WebSocket
        ws = new WebSocket(
          `${config.websocket_url}?token=${config.auth_token}`
        );

        ws.onopen = () => setIsConnected(true);
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          // Обрабатываем команды от сервера
          switch (data.type) {
            case 'PLAY':
              player.play();
              break;
            case 'PAUSE':
              player.pause();
              break;
            case 'VOLUME':
              player.setVolume(data.volume);
              break;
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          setTimeout(connect, 5000); // Переподключение
        };

      } catch (error) {
        console.error('Connection error:', error);
      }
    };

    connect();

    return () => {
      ws?.close();
    };
  }, [venueId]);

  return { isConnected, playerId };
}
```

### Вариант 2: Hardware Box (Raspberry Pi)

```python
# /home/pi/promo-radio/player.py
import vlc
import websocket
import json
import requests
from threading import Thread

class PromoRadioPlayer:
    def __init__(self, venue_id):
        self.venue_id = venue_id
        self.device_id = self.get_device_id()
        self.player = vlc.MediaPlayer()
        self.config = None
        self.ws = None

    def get_device_id(self):
        # Уникальный ID устройства
        import subprocess
        result = subprocess.run(['cat', '/proc/cpuinfo'], capture_output=True)
        serial = result.stdout.decode().split('Serial')[1].split('\n')[0].strip()
        return f"rpi-{serial}"

    def register(self):
        response = requests.post(
            'https://api.promo.music/radio/register-player',
            json={
                'venue_id': self.venue_id,
                'player_type': 'hardware',
                'device_id': self.device_id
            }
        )
        self.config = response.json()
        print(f"✅ Registered as: {self.config['player_id']}")

    def connect_websocket(self):
        def on_message(ws, message):
            data = json.loads(message)
            self.handle_command(data)

        def on_error(ws, error):
            print(f"❌ Error: {error}")

        def on_close(ws):
            print("🔌 Disconnected, reconnecting...")
            time.sleep(5)
            self.connect_websocket()

        url = f"{self.config['websocket_url']}?token={self.config['auth_token']}"
        self.ws = websocket.WebSocketApp(
            url,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )

        Thread(target=self.ws.run_forever, daemon=True).start()

    def handle_command(self, data):
        cmd = data.get('type')
        if cmd == 'PLAY':
            self.player.play()
        elif cmd == 'PAUSE':
            self.player.pause()
        elif cmd == 'VOLUME':
            self.player.audio_set_volume(int(data['volume'] * 100))

    def start(self):
        self.register()
        self.connect_websocket()
        
        # Начинаем воспроизведение стрима
        media = vlc.Media(self.config['stream_url'])
        self.player.set_media(media)
        self.player.play()

        # Основной цикл
        while True:
            self.send_status()
            time.sleep(10)

    def send_status(self):
        if self.ws and self.ws.sock and self.ws.sock.connected:
            self.ws.send(json.dumps({
                'type': 'STATUS_UPDATE',
                'status': {
                    'is_playing': self.player.is_playing(),
                    'volume': self.player.audio_get_volume() / 100
                }
            }))

# Запуск
player = PromoRadioPlayer(venue_id='your-venue-id')
player.start()
```

**Systemd service:**
```ini
# /etc/systemd/system/promo-radio.service
[Unit]
Description=Promo.Music Radio Player
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/promo-radio
ExecStart=/usr/bin/python3 /home/pi/promo-radio/player.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## 🏗️ Варианты развертывания

### 1. MVP (Текущий)
✅ **Веб-плеер в браузере**
- Управление через кабинет заведения
- Локальное воспроизведение треков
- Подходит для тестирования

### 2. Production-ready
🔄 **Централизованный стриминг**
- Icecast/SRS сервер для стримов
- CloudFlare CDN для глобальной доставки
- WebSocket для real-time управления
- Мониторинг и аналитика

### 3. Enterprise
🚀 **Гибридная архитектура**
- Hardware Box (Raspberry Pi) в каждом заведении
- Локальное кеширование треков
- Fallback при потере связи
- Удалённое управление и обновления

---

## 🎬 Следующие шаги

### Для текущего MVP
1. ✅ Добавить регистрацию плеера при загрузке кабинета
2. ✅ Реализовать отправку статуса каждые 10 сек
3. ⏳ Создать SQL миграцию для таблиц плееров
4. ⏳ Добавить визуализацию статуса плеера в UI

### Для Production
1. ⏳ Развернуть Icecast/SRS streaming server
2. ⏳ Настроить CloudFlare Stream CDN
3. ⏳ Реализовать полноценный WebSocket сервер
4. ⏳ Создать систему мониторинга плееров

### Для Hardware
1. ⏳ Собрать прототип на Raspberry Pi
2. ⏳ Создать образ системы для массового развертывания
3. ⏳ Разработать систему OTA обновлений
4. ⏳ Провести полевые тесты в заведениях

---

## 📞 Поддержка

Для вопросов по интеграции плееров обращайтесь к основной документации:
- `/RADIO_INFRASTRUCTURE.md` - Полная архитектура
- `/supabase/functions/server/radio-player-api.ts` - API код
- `/supabase/functions/server/radio-player-tables.sql` - SQL схема
