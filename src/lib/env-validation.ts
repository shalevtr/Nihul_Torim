/**
 * Environment variables validation
 * Ensures all required environment variables are set before the app starts
 */

function requireEnv(key: string, minLength?: number): string {
  const value = process.env[key]
  
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Please set it in your .env.local file or deployment environment.`
    )
  }
  
  if (minLength && value.length < minLength) {
    throw new Error(
      `Environment variable ${key} must be at least ${minLength} characters long. ` +
      `Current length: ${value.length}`
    )
  }
  
  return value
}

// Validate critical environment variables on module load
export function validateEnv() {
  // Database
  requireEnv('DATABASE_URL')
  
  // Auth - must be at least 32 characters for security
  const authSecret = requireEnv('NEXTAUTH_SECRET', 32)
  
  // URL - should be set in production
  const url = process.env.NEXTAUTH_URL
  if (process.env.NODE_ENV === 'production' && !url) {
    throw new Error(
      'NEXTAUTH_URL must be set in production. ' +
      'Set it to your production domain (e.g., https://yourdomain.com)'
    )
  }
  
  // Warn if using default secret in production
  if (process.env.NODE_ENV === 'production' && authSecret === 'your-secret-key') {
    throw new Error(
      'CRITICAL: Using default NEXTAUTH_SECRET in production is not allowed. ' +
      'Please generate a secure random secret (at least 32 characters).'
    )
  }
  
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: authSecret,
    NEXTAUTH_URL: url || 'http://localhost:3000',
  }
}

// Validate on import (only in production runtime, not during build)
// During build, we allow missing env vars for static pages
// NEVER throw during build phase - only warn
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV !== 'production'

if (!isBuildPhase) {
  // Only validate at runtime in production
  try {
    validateEnv()
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw error
  }
} else {
  // During build, just log warnings instead of throwing
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL not set during build. This is OK for static pages.')
  }
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn('⚠️ NEXTAUTH_SECRET not set during build. Set it in production environment.')
  }
}

