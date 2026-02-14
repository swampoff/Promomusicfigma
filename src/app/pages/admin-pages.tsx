/**
 * ADMIN PAGES - Thin route wrappers for Admin cabinet sections
 * Each component renders through React Router's Outlet
 */

import { useOutletContext } from 'react-router';

// Section components
import { Dashboard } from '@/admin/pages/Dashboard';
import { Moderation } from '@/admin/pages/Moderation';
import { TrackModeration } from '@/admin/pages/TrackModeration';
import { VideoModeration } from '@/admin/pages/VideoModeration';
import { ConcertModeration } from '@/admin/pages/ConcertModeration';
import { NewsModeration } from '@/admin/pages/NewsModeration';
import { PitchingDistribution } from '@/admin/pages/PitchingDistribution';
import { UsersManagement } from '@/admin/pages/UsersManagement';
import { PartnersManagement } from '@/admin/pages/PartnersManagement';
import { Finances } from '@/admin/pages/Finances';
import { Support } from '@/admin/pages/Support';
import { AdminSettings } from '@/admin/pages/Settings';
import { ContentOrdersAdmin } from '@/admin/components/content-orders-admin';
import { AIAgentDashboard } from '@/admin/components/AIAgentDashboard';
import { PublishModeration } from '@/admin/pages/PublishModeration';
import { MessagesPage } from '@/app/components/messages-page';
import { TrackTestManagement } from '@/admin/pages/TrackTestManagement';
import { MarketplaceAdmin } from '@/admin/pages/MarketplaceAdmin';
import { ChartsManagement } from '@/admin/pages/ChartsManagement';

export interface AdminLayoutContext {
  setUnreadMessages: (n: number) => void;
}

export function AdminDashboardPage() {
  return <Dashboard />;
}

export function AdminModerationPage() {
  return <Moderation />;
}

export function AdminPublishPage() {
  return <PublishModeration />;
}

export function AdminAIAgentPage() {
  return <AIAgentDashboard />;
}

export function AdminContentOrdersPage() {
  return <ContentOrdersAdmin />;
}

export function AdminPitchingPage() {
  return <PitchingDistribution />;
}

export function AdminMessagesPage() {
  const { setUnreadMessages } = useOutletContext<AdminLayoutContext>();
  return <MessagesPage onUnreadCountChange={setUnreadMessages} />;
}

export function AdminUsersPage() {
  return <UsersManagement />;
}

export function AdminPartnersPage() {
  return <PartnersManagement />;
}

export function AdminFinancesPage() {
  return <Finances />;
}

export function AdminSupportPage() {
  return <Support />;
}

export function AdminSettingsPage() {
  return <AdminSettings />;
}

export function AdminTrackTestPage() {
  return <TrackTestManagement />;
}

export function AdminMarketplacePage() {
  return <MarketplaceAdmin />;
}

export function AdminChartsPage() {
  return <ChartsManagement />;
}