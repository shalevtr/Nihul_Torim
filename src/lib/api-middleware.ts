/**
 * API middleware utilities for validation and rate limiting
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIdentifier, RATE_LIMITS } from './rate-limit'

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (request: Request): Promise<{ data: T } | NextResponse> => {
    try {
      const body = await request.json()
      const data = schema.parse(body)
      return { data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'שגיאת אימות',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'שגיאה בעיבוד הבקשה' },
        { status: 400 }
      )
    }
  }
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  request: Request,
  limitType: keyof typeof RATE_LIMITS = 'default'
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(request)
  const config = RATE_LIMITS[limitType]
  
  const result = await rateLimit(identifier, config.limit, config.windowMs)

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'יותר מדי בקשות. נסה שוב מאוחר יותר.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.reset.toString(),
        },
      }
    )
  }

  return null
}

/**
 * Combined middleware: rate limit + validation
 */
export async function apiMiddleware<T>(
  request: Request,
  schema: z.ZodSchema<T>,
  limitType: keyof typeof RATE_LIMITS = 'default'
): Promise<{ data: T } | NextResponse> {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(request, limitType)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Validate body
  return await validateBody(schema)(request)
}



