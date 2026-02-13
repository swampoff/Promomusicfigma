/**
 * RADIO PAGES - Thin route wrappers for Radio cabinet sections
 */

import { useOutletContext } from 'react-router';

import { ArtistRequestsSection } from '@/radio/components/artist-requests-section';
import { VenueRequestsSection } from '@/radio/components/venue-requests-section';
import { AdSlotsSection } from '@/radio/components/ad-slots-section';
import { AnalyticsSection } from '@/radio/components/analytics-section';
import { FinanceSection } from '@/radio/components/finance-section';
import { NotificationsSection } from '@/radio/components/notifications-section';
import { ProfileSection } from '@/radio/RadioApp';
import { MessagesPage } from '@/app/components/messages-page';

export interface RadioLayoutContext {
  setUnreadMessages: (n: number) => void;
}

export function RadioArtistRequestsPage() {
  return <ArtistRequestsSection />;
}

export function RadioVenueRequestsPage() {
  return <VenueRequestsSection />;
}

export function RadioAdSlotsPage() {
  return <AdSlotsSection />;
}

export function RadioAnalyticsPage() {
  return <AnalyticsSection />;
}

export function RadioProfilePage() {
  return <ProfileSection />;
}

export function RadioFinancePage() {
  return <FinanceSection />;
}

export function RadioNotificationsPage() {
  return <NotificationsSection />;
}

export function RadioMessagesPage() {
  const { setUnreadMessages } = useOutletContext<RadioLayoutContext>();
  return <MessagesPage onUnreadCountChange={setUnreadMessages} />;
}
