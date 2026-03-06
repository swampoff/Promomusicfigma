import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '@/utils/supabase/client';

const API_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface UserSettings {
  profile: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    genres: string[];
  };
  security: {
    twoFactorEnabled: boolean;
  };
  notifications: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    soundEnabled: boolean;
    notifyNewDonations: boolean;
    notifyNewMessages: boolean;
    notifyNewComments: boolean;
    notifyNewFollowers: boolean;
    notifyAnalytics: boolean;
    notifyStreamMilestones: boolean;
    notifyMarketingCampaigns: boolean;
    notifySubscriptionExpiry: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'followers';
    allowMessages: 'everyone' | 'followers' | 'none';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowTagging: boolean;
  };
  analytics: {
    trackPageViews: boolean;
    trackClicks: boolean;
    trackListens: boolean;
    trackDonations: boolean;
    shareDataWithPartners: boolean;
  };
  appearance: {
    theme: 'dark' | 'light' | 'auto';
    accentColor: string;
    compactMode: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    highContrast: boolean;
  };
  advanced: {
    language: string;
  };
}

async function getAuth(): Promise<{ userId: string; accessToken: string } | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return { userId: session.user.id, accessToken: session.access_token };
}

export const settingsAPI = {
  // Get user settings
  async getSettings(): Promise<UserSettings | null> {
    try {
      const auth = await getAuth();
      if (!auth) return null;
      const response = await fetch(`${API_URL}/settings/user/${auth.userId}`, {
        headers: { 'Authorization': `Bearer ${auth.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.settings;
      }
      return null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  },

  // Save all settings
  async saveSettings(settings: UserSettings): Promise<boolean> {
    try {
      const auth = await getAuth();
      if (!auth) return false;
      const response = await fetch(`${API_URL}/settings/user/${auth.userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },

  // Update profile only
  async updateProfile(profile: Partial<UserSettings['profile']>): Promise<boolean> {
    try {
      const auth = await getAuth();
      if (!auth) return false;
      const response = await fetch(`${API_URL}/settings/user/${auth.userId}/profile`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  },

  // Get active sessions
  async getSessions(): Promise<any[]> {
    try {
      const auth = await getAuth();
      if (!auth) return [];
      const response = await fetch(`${API_URL}/settings/user/${auth.userId}/sessions`, {
        headers: { 'Authorization': `Bearer ${auth.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.sessions || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  },

  // Terminate session
  async terminateSession(sessionId: number): Promise<boolean> {
    try {
      const auth = await getAuth();
      if (!auth) return false;
      const response = await fetch(`${API_URL}/settings/user/${auth.userId}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.accessToken}` },
      });
      return response.ok;
    } catch (error) {
      console.error('Error terminating session:', error);
      return false;
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const auth = await getAuth();
      if (!auth) return false;
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await response.json();
      return json.success === true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  },

  // Get payment methods
  async getPaymentMethods(): Promise<any[]> {
    try {
      const auth = await getAuth();
      if (!auth) return [];
      const response = await fetch(`${API_URL}/settings/user/${auth.userId}/payment-methods`, {
        headers: { 'Authorization': `Bearer ${auth.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.methods || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  },

  // Add payment method
  async addPaymentMethod(method: any): Promise<boolean> {
    try {
      const auth = await getAuth();
      if (!auth) return false;
      const response = await fetch(`${API_URL}/settings/user/${auth.userId}/payment-methods`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(method),
      });
      return response.ok;
    } catch (error) {
      console.error('Error adding payment method:', error);
      return false;
    }
  },

  // Delete payment method
  async deletePaymentMethod(methodId: number): Promise<boolean> {
    try {
      const auth = await getAuth();
      if (!auth) return false;
      const response = await fetch(`${API_URL}/settings/user/${auth.userId}/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.accessToken}` },
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return false;
    }
  },

  // Get current subscription
  async getCurrentSubscription(): Promise<any> {
    try {
      const auth = await getAuth();
      if (!auth) return null;
      const response = await fetch(`${API_URL}/subscriptions/${auth.userId}/current`, {
        headers: { 'Authorization': `Bearer ${auth.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.subscription;
      }
      return null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },

  // Get available plans
  async getAvailablePlans(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/subscriptions/plans`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.plans || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
  },

  // Get payment history
  async getPaymentHistory(): Promise<any[]> {
    return [];
  },

  // Change subscription plan
  async changePlan(planId: string, interval: 'month' | 'year'): Promise<boolean> {
    try {
      const auth = await getAuth();
      if (!auth) return false;
      const response = await fetch(`${API_URL}/subscriptions/${auth.userId}/change-plan`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error changing plan:', error);
      return false;
    }
  },

  // Cancel subscription
  async cancelSubscription(): Promise<boolean> {
    try {
      const auth = await getAuth();
      if (!auth) return false;
      const response = await fetch(`${API_URL}/subscriptions/${auth.userId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  },
};
