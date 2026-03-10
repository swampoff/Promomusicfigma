# ПРОМО.МУЗЫКА — Project Notes

## Architecture
- **Framework:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase (Edge Functions + PostgreSQL)
- **Package Manager:** pnpm
- **Routing:** React Router v7 (createBrowserRouter)

## Key Components
- **UnifiedPlayerContext** (`src/contexts/UnifiedPlayerContext.tsx`) — глобальный контекст аудиоплеера с HTML5 Audio, управляет всем воспроизведением в приложении
- **UnifiedAudioPlayer** (`src/app/components/UnifiedAudioPlayer.tsx`) — UI плеер (fixed bottom bar, playlist drawer, fullscreen mobile), отображает обложки треков
- **DonateModal** (`src/app/components/DonateModal.tsx`) — реальные донаты артистам через donationsApi (POST /donations), поддержка анонимных, выбор суммы/способа оплаты
- **GlobalPlayer** (`src/app/components/landing/GlobalPlayer.tsx`) — старый плеер (заменён на UnifiedAudioPlayer)
- **DataContext** (`src/contexts/DataContext.tsx`) — хранилище данных (треки, видео, концерты и т.д.)

## Payment Infrastructure
- Payment gateways: YooKassa, Stripe, T-Bank (supabase/functions/server/)
- Donations API: `donationsApi.create()` → POST /donations
- Coins system: покупка, бонусы по подписке, трата на промо

## Routes
- `/` — Landing (SunoLayoutLanding)
- `/artist` — Artist cabinet (ArtistApp) — requires auth
- `/ctrl-pm7k2f` — Admin (hidden)
- `/radio`, `/dj`, `/venue`, `/producer` — Role cabinets

## Development Branch
- Feature branch: `claude/unified-audio-player-tWlix`
- Latest commit: `60b0194` — donation system + unified player
- Remote: `origin/claude/unified-audio-player-tWlix` (verified on GitHub)
