/**
 * DJ PAGES - Thin route wrappers for DJ cabinet sections
 */

import { useOutletContext } from 'react-router';

import { DjDashboardHome } from '@/dj/components/DjDashboardHome';
import { DjProfileEditor } from '@/dj/components/DjProfileEditor';
import { DjMixManager } from '@/dj/components/DjMixManager';
import { DjBookingsManager } from '@/dj/components/DjBookingsManager';
import { DjFinances } from '@/dj/components/DjFinances';
import { DjAnalytics } from '@/dj/components/DjAnalytics';
import { DjEvents } from '@/dj/components/DjEvents';
import { DjPromotion } from '@/dj/components/DjPromotion';
import { DjCollaborations } from '@/dj/components/DjCollaborations';
import { DjNotifications } from '@/dj/components/DjNotifications';
import { DjSupport } from '@/dj/components/DjSupport';
import { DjSettings } from '@/dj/components/DjSettings';
import { DjSubscription } from '@/dj/components/DjSubscription';
import { MessagesPage } from '@/app/components/messages-page';
import { ExpertTrackReview } from '@/app/components/expert-track-review';

export interface DjLayoutContext {
  navigateSection: (section: string) => void;
  setUnreadMessages: (n: number) => void;
}

export function DjHomePage() {
  const { navigateSection } = useOutletContext<DjLayoutContext>();
  return <DjDashboardHome onNavigate={navigateSection} />;
}

export function DjProfilePage() {
  return <DjProfileEditor />;
}

export function DjMixesPage() {
  return <DjMixManager />;
}

export function DjBookingsPage() {
  return <DjBookingsManager />;
}

export function DjEventsPage() {
  return <DjEvents />;
}

export function DjPromotionPage() {
  return <DjPromotion />;
}

export function DjCollaborationsPage() {
  return <DjCollaborations />;
}

export function DjMessagesPage() {
  const { setUnreadMessages, navigateSection } = useOutletContext<DjLayoutContext>();
  return (
    <MessagesPage
      onUnreadCountChange={setUnreadMessages}
      onNavigateToCollabs={() => navigateSection('collaborations')}
    />
  );
}

export function DjAnalyticsPage() {
  return <DjAnalytics />;
}

export function DjFinancesPage() {
  return <DjFinances />;
}

export function DjNotificationsPage() {
  return <DjNotifications />;
}

export function DjSupportPage() {
  return <DjSupport />;
}

export function DjSettingsPage() {
  return <DjSettings />;
}

export function DjSubscriptionPage() {
  return <DjSubscription />;
}

export function DjTrackTestPage() {
  const djProfileId = localStorage.getItem('djProfileId') || 'dj-1';
  const djName = localStorage.getItem('djName') || 'DJ';
  return (
    <ExpertTrackReview
      expertId={djProfileId}
      expertName={djName}
      expertRole="dj"
      accentColor="purple"
    />
  );
}