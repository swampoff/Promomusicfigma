/**
 * ARTIST PAGES - Thin route wrappers for Artist cabinet sections
 * Each component renders through React Router's Outlet context
 */

import { useOutletContext } from 'react-router';
import type { PromotedConcert } from '@/app/components/promoted-concerts-sidebar';

// Section components
import { HomePage } from '@/app/components/home-page';
import { TracksPage } from '@/app/components/tracks-page';
import { VideoPage } from '@/app/components/video-page';
import { MyConcertsPage } from '@/app/components/my-concerts-page';
import { NewsPage } from '@/app/components/news-page';
import TrackTestPage from '@/app/pages/TrackTestPage';
import { PitchingPage } from '@/app/components/pitching-page';
import { AnalyticsPage } from '@/app/components/analytics-page';
import { FinancesPage } from '@/app/components/finances-page';
import { SettingsPage } from '@/app/components/settings-page';
import { PricingPage } from '@/app/components/pricing-page';
import { SupportPage } from '@/app/components/support-page';
import { PublishOrdersPage } from '@/app/components/publish-orders-page';
import { NotificationHistoryPage } from '@/app/components/notification-history-page';
import { CollaborationCenter } from '@/app/components/collaboration-center';
import { MessagesPage } from '@/app/components/messages-page';
import { ArtistPromoCampaigns } from '@/app/components/artist-promo-campaigns';

export interface ArtistLayoutContext {
  promotedConcerts: PromotedConcert[];
  navigateSection: (section: string) => void;
  coinsBalance: number;
  setCoinsBalance: (n: number) => void;
  openPublishWizard: (type?: 'video' | 'concert') => void;
  handleNotificationNavigate: (orderId: string) => void;
  artistUserId: string;
  userData: {
    name: string;
    email: string;
    city: string;
    genres: string[];
    rating: number;
    bio: string;
    isVerified: boolean;
    initials: string;
  };
  messageContext: { userId: string; userName: string } | null;
  setMessageContext: (ctx: { userId: string; userName: string } | null) => void;
  setUnreadMessages: (n: number) => void;
  setForceTour: (show: boolean) => void;
}

export function ArtistHomePage() {
  const { promotedConcerts, navigateSection } = useOutletContext<ArtistLayoutContext>();
  return <HomePage promotedConcerts={promotedConcerts} onNavigate={navigateSection} />;
}

export function ArtistPublishPage() {
  const { openPublishWizard } = useOutletContext<ArtistLayoutContext>();
  return <PublishOrdersPage onPublish={() => openPublishWizard()} />;
}

export function ArtistNotificationsPage() {
  const { handleNotificationNavigate, navigateSection } = useOutletContext<ArtistLayoutContext>();
  return (
    <NotificationHistoryPage
      onNavigateToOrder={handleNotificationNavigate}
      onNavigateToCollabs={() => navigateSection('collaboration')}
    />
  );
}

export function ArtistMessagesPage() {
  const { messageContext, setMessageContext, setUnreadMessages, navigateSection } =
    useOutletContext<ArtistLayoutContext>();
  return (
    <MessagesPage
      initialUser={messageContext}
      onMessageContextClear={() => setMessageContext(null)}
      onUnreadCountChange={setUnreadMessages}
      onNavigateToCollabs={() => navigateSection('collaboration')}
    />
  );
}

export function ArtistCollaborationPage() {
  const { artistUserId, userData, setMessageContext, navigateSection } =
    useOutletContext<ArtistLayoutContext>();
  return (
    <CollaborationCenter
      artistId={artistUserId}
      artistName={userData.name}
      onOpenInMessages={(producerId, producerName) => {
        setMessageContext({ userId: producerId, userName: producerName });
        navigateSection('messages');
      }}
    />
  );
}

export function ArtistTracksPage() {
  return <TracksPage />;
}

export function ArtistVideoPage() {
  return <VideoPage />;
}

export function ArtistConcertsPage() {
  return <MyConcertsPage />;
}

export function ArtistNewsPage() {
  return <NewsPage />;
}

export function ArtistTrackTestPage() {
  const { artistUserId } = useOutletContext<ArtistLayoutContext>();
  return <TrackTestPage userId={artistUserId} />;
}

export function ArtistPitchingPage() {
  const { coinsBalance, setCoinsBalance } = useOutletContext<ArtistLayoutContext>();
  return <PitchingPage userCoins={coinsBalance} onCoinsUpdate={setCoinsBalance} />;
}

export function ArtistPricingPage() {
  return <PricingPage />;
}

export function ArtistAnalyticsPage() {
  return <AnalyticsPage />;
}

export function ArtistPaymentsPage() {
  return <FinancesPage />;
}

export function ArtistSupportPage() {
  const { setForceTour } = useOutletContext<ArtistLayoutContext>();
  return <SupportPage onRestartTour={() => setForceTour(true)} />;
}

export function ArtistSettingsPage() {
  return <SettingsPage />;
}

export function ArtistCampaignsPage() {
  const { artistUserId, userData } = useOutletContext<ArtistLayoutContext>();
  return <ArtistPromoCampaigns userId={artistUserId} artistName={userData.name} />;
}