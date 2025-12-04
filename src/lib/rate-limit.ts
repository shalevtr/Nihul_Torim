/**
 * Rate limiting utility
 * Uses in-memory storage for development, can be upgraded to Redis for production
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

/**
 * Simple in-memory rate limiter
 * For production, consider using @upstash/ratelimit with Redis
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })
  }

  const entry = store[key]

  if (!entry || entry.resetTime < now) {
    // Create new entry
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return {
      success: true,
      remaining: limit - 1,
      reset: now + windowMs,
    }
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (works with most proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  return ip
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 60 * 1000 }, // 5 per minute
  register: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  bookAppointment: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  uploadImage: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  createBusiness: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  sendMessage: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  default: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
} as const



