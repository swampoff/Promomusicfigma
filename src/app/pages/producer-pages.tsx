/**
 * PRODUCER PAGES - Thin route wrappers for Producer cabinet sections
 * Uses outlet context to pass API data from the layout (ProducerApp)
 */

import { useOutletContext } from 'react-router';
import type {
  ProducerProfile,
  ProducerReview,
  ProducerService,
  PortfolioItem,
  ProducerOrder,
  ProducerWallet as ProducerWalletType,
} from '@/utils/api/landing-data';
import * as studioApi from '@/utils/api/producer-studio';
import { toast } from 'sonner';

// Inline tabs exported from ProducerApp
import {
  OverviewTab,
  ServicesTab,
  OrdersTab,
  PortfolioTab,
  ProfileTab,
  WalletTab,
} from '@/app/ProducerApp';

// Dedicated components
import { ProducerAnalytics } from '@/app/components/producer/ProducerAnalytics';
import { ProducerMessages } from '@/app/components/producer/ProducerMessages';
import { ProducerSettings } from '@/app/components/producer/ProducerSettings';
import { ProducerCalendar } from '@/app/components/producer/ProducerCalendar';
import { ProducerAI } from '@/app/components/producer/ProducerAI';
import { ProducerCollaboration } from '@/app/components/producer/ProducerCollaboration';

export interface ProducerLayoutContext {
  profileData: ProducerProfile | null;
  profileLoading: boolean;
  reviewsLoading: boolean;
  reviews: ProducerReview[];
  myServices: ProducerService[];
  servicesLoading: boolean;
  servicesError: string | null;
  refetchServices: () => void;
  myPortfolio: PortfolioItem[];
  portfolioLoading: boolean;
  portfolioError: string | null;
  refetchPortfolio: () => void;
  ordersData: ProducerOrder[];
  ordersLoading: boolean;
  ordersError: string | null;
  refetchOrders: () => void;
  walletData: ProducerWalletType | null;
  walletLoading: boolean;
  walletError: string | null;
  refetchWallet: () => void;
  producerProfileId: string;
  producerUserId: string;
  producerName: string;
  handleTabChange: (tab: string) => void;
}

export function ProducerOverviewPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <OverviewTab
      profile={ctx.profileData}
      services={ctx.myServices}
      reviews={ctx.reviews}
      orders={ctx.ordersData}
      wallet={ctx.walletData}
      isLoading={ctx.profileLoading || ctx.reviewsLoading}
      onNavigate={ctx.handleTabChange}
    />
  );
}

export function ProducerServicesPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <ServicesTab
      services={ctx.myServices}
      isLoading={ctx.servicesLoading}
      error={ctx.servicesError}
      onRetry={ctx.refetchServices}
      producerId={ctx.producerProfileId}
    />
  );
}

export function ProducerOrdersPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <OrdersTab
      orders={ctx.ordersData}
      isLoading={ctx.ordersLoading}
      error={ctx.ordersError}
      onRetry={ctx.refetchOrders}
      producerId={ctx.producerProfileId}
      onNavigateToMessages={(clientName, orderTitle) => {
        studioApi
          .createConversation({ producerId: ctx.producerProfileId, clientName, orderTitle })
          .then(() => {
            ctx.handleTabChange('messages');
            toast.success(`Открыт диалог с ${clientName}`);
          });
      }}
      onNavigateToCalendar={(order) => {
        const typeMap: Record<string, string> = {
          Сведение: 'mixing',
          Мастеринг: 'mastering',
          Аранжировка: 'other',
          Битмейкинг: 'other',
          'Запись вокала': 'recording',
          'Гост-продакшн': 'other',
        };
        const sessionType =
          Object.entries(typeMap).find(([k]) => order.serviceTitle.includes(k))?.[1] || 'other';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        studioApi
          .createSession({
            producerId: ctx.producerProfileId,
            title: order.serviceTitle,
            clientName: order.client,
            date: dateStr,
            startTime: '10:00',
            endTime: '14:00',
            type: sessionType,
            orderId: order.id,
          })
          .then((r) => {
            if (r.success) {
              ctx.handleTabChange('calendar');
              toast.success(`Сессия "${order.serviceTitle}" добавлена в календарь`);
            }
          });
      }}
    />
  );
}

export function ProducerPortfolioPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <PortfolioTab
      items={ctx.myPortfolio}
      isLoading={ctx.portfolioLoading}
      error={ctx.portfolioError}
      onRetry={ctx.refetchPortfolio}
      producerId={ctx.producerProfileId}
    />
  );
}

export function ProducerAnalyticsPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <ProducerAnalytics
      orders={ctx.ordersData}
      services={ctx.myServices}
      reviews={ctx.reviews}
      isLoading={ctx.ordersLoading || ctx.servicesLoading}
    />
  );
}

export function ProducerMessagesPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <ProducerMessages
      producerId={ctx.producerProfileId}
      producerName={ctx.producerName}
    />
  );
}

export function ProducerCalendarPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return <ProducerCalendar producerId={ctx.producerProfileId} />;
}

export function ProducerProfilePage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <ProfileTab
      profile={ctx.profileData}
      isLoading={ctx.profileLoading}
      producerId={ctx.producerProfileId}
    />
  );
}

export function ProducerWalletPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <WalletTab
      wallet={ctx.walletData}
      isLoading={ctx.walletLoading}
      error={ctx.walletError}
      onRetry={ctx.refetchWallet}
      profileTotalEarnings={ctx.profileData?.totalEarnings ?? 890000}
      producerId={ctx.producerProfileId}
    />
  );
}

export function ProducerCollaborationPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <ProducerCollaboration
      producerId={ctx.producerProfileId}
      producerName={ctx.producerName}
    />
  );
}

export function ProducerAIPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <ProducerAI producerId={ctx.producerProfileId} producerName={ctx.producerName} />
  );
}

export function ProducerSettingsPage() {
  const ctx = useOutletContext<ProducerLayoutContext>();
  return (
    <ProducerSettings
      producerId={ctx.producerProfileId}
      producerName={ctx.producerName}
    />
  );
}
