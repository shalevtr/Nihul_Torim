/**
 * Zod validation schemas for API requests
 */

import { z } from 'zod'

// Business schemas
export const createBusinessSchema = z.object({
  name: z.string().min(2, 'שם העסק חייב להכיל לפחות 2 תווים').max(100, 'שם העסק לא יכול להיות יותר מ-100 תווים'),
  category: z.string().min(1, 'קטגוריה נדרשת'),
  city: z.string().max(100).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  logo: z.string().url().optional().nullable(),
  phone: z.string().regex(/^[0-9\-\+\(\)\s]+$/, 'מספר טלפון לא תקין').max(20).optional().nullable(),
})

export const updateBusinessSchema = createBusinessSchema.partial()

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
})

export const registerSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים').max(100),
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים').max(100).optional(),
  phone: z.string().regex(/^[0-9\-\+\(\)\s]+$/, 'מספר טלפון לא תקין').max(20).optional(),
  role: z.enum(['CUSTOMER', 'BUSINESS_OWNER', 'ADMIN']).optional(),
})

// Appointment schemas
export const bookAppointmentSchema = z.object({
  slotId: z.string().min(1, 'מזהה תור נדרש'),
  serviceId: z.string().optional().nullable(),
})

export const bookPublicAppointmentSchema = z.object({
  slotId: z.string().min(1, 'מזהה תור נדרש'),
  serviceId: z.string().optional().nullable(),
  customerData: z.object({
    deviceId: z.string().min(1, 'מזהה מכשיר נדרש'),
    fullName: z.string().min(2, 'שם מלא נדרש').max(100),
    phone: z.string().regex(/^[0-9\-\+\(\)\s]+$/, 'מספר טלפון לא תקין').min(9).max(20),
    email: z.string().email().optional().nullable(),
  }),
})

// TimeSlot schemas
export const createTimeSlotsSchema = z.object({
  businessId: z.string().min(1, 'מזהה עסק נדרש'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין'),
  startHour: z.string().regex(/^\d{2}:\d{2}$/, 'שעת התחלה לא תקינה'),
  endHour: z.string().regex(/^\d{2}:\d{2}$/, 'שעת סיום לא תקינה'),
  slotDuration: z.number().int().min(5).max(240, 'משך תור לא יכול להיות יותר מ-240 דקות'),
  serviceId: z.string().optional().nullable(),
})

// Service schemas
export const createServiceSchema = z.object({
  businessId: z.string().min(1, 'מזהה עסק נדרש'),
  name: z.string().min(2, 'שם שירות חייב להכיל לפחות 2 תווים').max(100),
  description: z.string().max(500).optional().nullable(),
  price: z.number().min(0, 'מחיר לא יכול להיות שלילי').max(100000),
  duration: z.number().int().min(5, 'משך שירות חייב להיות לפחות 5 דקות').max(480, 'משך שירות לא יכול להיות יותר מ-480 דקות'),
})

export const updateServiceSchema = createServiceSchema.partial().extend({
  businessId: z.string().optional(),
})

// Review schemas
export const createReviewSchema = z.object({
  businessId: z.string().min(1, 'מזהה עסק נדרש'),
  rating: z.number().int().min(1, 'דירוג חייב להיות בין 1 ל-5').max(5, 'דירוג חייב להיות בין 1 ל-5'),
  comment: z.string().max(1000).optional().nullable(),
})

// Message schemas
export const sendMessageSchema = z.object({
  businessId: z.string().min(1, 'מזהה עסק נדרש'),
  content: z.string().min(1, 'תוכן הודעה נדרש').max(1000, 'הודעה לא יכולה להיות יותר מ-1000 תווים'),
})

// Appointment status update schema
export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']),
  notes: z.string().max(500).optional().nullable(),
})

// Block customer schema
export const blockCustomerSchema = z.object({
  customerId: z.string().min(1, 'מזהה לקוח נדרש'),
  reason: z.string().max(500).optional().nullable(),
})



