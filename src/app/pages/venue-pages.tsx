/**
 * VENUE PAGES - Thin route wrappers for Venue cabinet sections
 */

import { useOutletContext } from 'react-router';

import { VenueDashboard } from '@/venue/components/venue-dashboard';
import RadioBrand from '@/venue/components/radio-brand';
import { BookingSection } from '@/venue/components/booking-section';
import { RadioSection } from '@/venue/components/radio-section';
import { SubscriptionSection } from '@/venue/components/subscription-section';
import { AnalyticsSection } from '@/venue/components/analytics-section';
import { VenueProfileSection } from '@/venue/components/venue-profile-section';
import { NotificationsSection } from '@/venue/components/notifications-section';
import { MessagesPage } from '@/app/components/messages-page';

export interface VenueLayoutContext {
  handleProfileUpdate: (profile: any) => void;
}

export function VenueDashboardPage() {
  return <VenueDashboard />;
}

export function VenueRadioBrandPage() {
  return <RadioBrand />;
}

export function VenueBookingPage() {
  return <BookingSection />;
}

export function VenueRadioIntegrationPage() {
  return <RadioSection />;
}

export function VenueSubscriptionPage() {
  return <SubscriptionSection />;
}

export function VenueAnalyticsPage() {
  return <AnalyticsSection />;
}

export function VenueMessagesPage() {
  return <MessagesPage />;
}

export function VenueProfilePage() {
  const { handleProfileUpdate } = useOutletContext<VenueLayoutContext>();
  return <VenueProfileSection onProfileUpdate={handleProfileUpdate} />;
}

export function VenueNotificationsPage() {
  return <NotificationsSection />;
}
