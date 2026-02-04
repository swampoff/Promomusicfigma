/**
 * VALIDATION SCHEMAS - Zod схемы для валидации входных данных
 * 
 * Используется для валидации всех API endpoints
 */

import { z } from 'npm:zod';

// =====================================================
// COMMON SCHEMAS
// =====================================================

export const PeriodSchema = z.enum(['today', 'week', 'month', 'year']);
export const ExportFormatSchema = z.enum(['pdf', 'excel', 'csv', 'json']);
export const UUIDSchema = z.string().uuid();
export const EmailSchema = z.string().email();
export const PositiveNumberSchema = z.number().positive();

// =====================================================
// RADIO SCHEMAS
// =====================================================

// Analytics
export const RadioAnalyticsQuerySchema = z.object({
  period: PeriodSchema.optional().default('week'),
});

export const RadioRevenueQuerySchema = z.object({
  period: PeriodSchema.optional().default('week'),
});

// Finance
export const RadioWithdrawalSchema = z.object({
  amount: z.number().min(1000, 'Minimum withdrawal amount is 1000 RUB'),
  paymentMethod: z.enum(['bank_transfer', 'yoomoney', 'card', 'qiwi', 'webmoney']),
  paymentDetails: z.object({
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    cardNumber: z.string().optional(),
    walletId: z.string().optional(),
  }).optional(),
});

export const TransactionsQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

// Ad Slots
export const CreateAdSlotSchema = z.object({
  slotType: z.enum(['slot_5sec', 'slot_10sec', 'slot_15sec', 'slot_30sec']),
  timeSlot: z.enum(['morning', 'day', 'evening', 'night', 'prime_time', 'any_time']),
  price: z.number().positive(),
  duration: z.number().min(5).max(60),
  maxPerHour: z.number().min(1).max(12).optional(),
});

export const UpdateAdSlotSchema = CreateAdSlotSchema.partial();

// Rotation Packages
export const CreateRotationPackageSchema = z.object({
  packageName: z.string().min(3).max(255),
  packageType: z.enum(['light', 'medium', 'heavy', 'power']),
  playsPerDayMin: z.number().min(1).max(50),
  playsPerDayMax: z.number().min(1).max(100),
  durationDays: z.number().min(1).max(365),
  basePrice: z.number().positive(),
  allowedTimeSlots: z.array(z.enum(['morning', 'day', 'evening', 'night', 'prime_time', 'any_time'])).optional(),
});

export const OrderRotationPackageSchema = z.object({
  packageId: UUIDSchema,
  trackId: UUIDSchema,
  startDate: z.string().datetime().optional(),
  specialInstructions: z.string().max(1000).optional(),
});

// =====================================================
// VENUE SCHEMAS
// =====================================================

// Analytics
export const VenueAnalyticsQuerySchema = z.object({
  period: PeriodSchema.optional().default('month'),
});

export const VenueAnalyticsExportSchema = z.object({
  format: ExportFormatSchema,
  period: PeriodSchema.optional().default('month'),
  includeGraphs: z.boolean().optional().default(true),
});

// Profile
export const UpdateVenueProfileSchema = z.object({
  venueName: z.string().min(2).max(255).optional(),
  venueType: z.enum(['bar', 'club', 'restaurant', 'cafe', 'lounge', 'other']).optional(),
  description: z.string().max(2000).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional(),
  instagram: z.string().max(255).optional(),
  facebook: z.string().max(255).optional(),
  openingHours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),
  capacity: z.number().min(0).optional(),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
});

// =====================================================
// ELEVENLABS SCHEMAS
// =====================================================

export const GenerateAudioSchema = z.object({
  orderId: UUIDSchema,
  customText: z.string().min(1).max(5000).optional(),
});

// =====================================================
// BOOKING SCHEMAS
// =====================================================

export const CreateBookingSchema = z.object({
  performerId: UUIDSchema,
  performerType: z.enum(['artist', 'dj']),
  eventType: z.enum(['concert', 'private_event', 'corporate', 'wedding', 'party', 'other']),
  eventTitle: z.string().min(3).max(255),
  eventDescription: z.string().max(2000).optional(),
  eventDate: z.string().datetime(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  durationHours: z.number().min(0.5).max(12),
  venueAddress: z.string().max(500),
  venueCity: z.string().max(100),
  venueType: z.string().max(100).optional(),
  expectedAudience: z.number().min(0).optional(),
  audienceType: z.enum(['adults', 'youth', 'children', 'mixed']).optional(),
  technicalRequirements: z.string().max(2000).optional(),
  specialRequests: z.string().max(1000).optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
});

export const UpdateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'confirmed', 'cancelled', 'completed']),
  message: z.string().max(1000).optional(),
});

export const PayBookingSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(['card', 'bank_transfer', 'yoomoney', 'qiwi']),
  paymentDetails: z.object({}).passthrough().optional(),
});

// =====================================================
// CONTENT ORDERS SCHEMAS
// =====================================================

export const CreateContentOrderSchema = z.object({
  contentType: z.enum(['jingle', 'advertisement', 'announcement']),
  text: z.string().min(10).max(5000),
  voiceType: z.enum(['neutral', 'professional', 'energetic', 'calm', 'friendly']),
  style: z.enum(['professional', 'energetic', 'calm', 'friendly']),
  duration: z.number().min(5).max(60).optional(),
  specialInstructions: z.string().max(1000).optional(),
});

export const UpdateContentOrderStatusSchema = z.object({
  status: z.enum(['draft', 'pending', 'generating', 'processing', 'completed', 'rejected']),
  rejectionReason: z.string().max(1000).optional(),
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Validate request body with Zod schema
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Validation error: ${errors}` };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Invalid JSON body' };
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(
  queryParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const params: Record<string, string> = {};
    queryParams.forEach((value, key) => {
      params[key] = value;
    });
    
    const result = schema.safeParse(params);
    
    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Validation error: ${errors}` };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Invalid query parameters' };
  }
}

/**
 * Validate UUID parameter
 */
export function validateUUID(id: string): { success: true; data: string } | { success: false; error: string } {
  const result = UUIDSchema.safeParse(id);
  
  if (!result.success) {
    return { success: false, error: 'Invalid UUID format' };
  }
  
  return { success: true, data: result.data };
}
