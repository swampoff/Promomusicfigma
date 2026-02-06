/**
 * BOOKING API - Клиентская библиотека для работы с API букинга
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/booking`;

interface CreateBookingParams {
  performerId: string;
  performerType: 'artist' | 'dj';
  eventType: string;
  eventTitle: string;
  eventDescription?: string;
  eventDate: string;
  startTime: string;
  durationHours: number;
  venueAddress?: string;
  venueCity?: string;
  venueType?: string;
  expectedAudience?: number;
  audienceType?: string;
  technicalRequirements?: any;
  specialRequests?: string;
}

interface PaymentParams {
  paymentMethodId?: string;
}

/**
 * Создать заявку на букинг
 */
export async function createBooking(params: CreateBookingParams, token: string) {
  try {
    const response = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create booking');
    }

    return data;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Получить список букингов
 */
export async function getBookings(role: 'requester' | 'performer' | 'all', status?: string, token?: string) {
  try {
    const params = new URLSearchParams();
    if (role !== 'all') params.append('role', role);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE}/list?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch bookings');
    }

    return data.bookings || [];
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

/**
 * Получить детали букинга
 */
export async function getBooking(bookingId: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/${bookingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch booking');
    }

    return data.booking;
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    throw error;
  }
}

/**
 * Принять заявку (Artist)
 */
export async function acceptBooking(bookingId: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/${bookingId}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to accept booking');
    }

    return data.booking;
  } catch (error: any) {
    console.error('Error accepting booking:', error);
    throw error;
  }
}

/**
 * Отклонить заявку (Artist)
 */
export async function rejectBooking(bookingId: string, rejectionReason: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/${bookingId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ rejectionReason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reject booking');
    }

    return data.booking;
  } catch (error: any) {
    console.error('Error rejecting booking:', error);
    throw error;
  }
}

/**
 * Оплатить депозит (Venue)
 */
export async function payDeposit(bookingId: string, params: PaymentParams, token: string) {
  try {
    const response = await fetch(`${API_BASE}/${bookingId}/pay-deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to pay deposit');
    }

    return data;
  } catch (error: any) {
    console.error('Error paying deposit:', error);
    throw error;
  }
}

/**
 * Оплатить остаток (Venue)
 */
export async function payFinal(bookingId: string, params: PaymentParams, token: string) {
  try {
    const response = await fetch(`${API_BASE}/${bookingId}/pay-final`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to pay final amount');
    }

    return data;
  } catch (error: any) {
    console.error('Error paying final amount:', error);
    throw error;
  }
}

/**
 * Отменить букинг
 */
export async function cancelBooking(bookingId: string, cancellationReason: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/${bookingId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ cancellationReason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel booking');
    }

    return data.booking;
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
}
