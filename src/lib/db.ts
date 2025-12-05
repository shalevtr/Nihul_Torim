import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL has SSL parameters for Neon
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    // During build time, return a placeholder URL to prevent build failures
    // The actual connection will fail at runtime if DATABASE_URL is missing
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn("⚠️ DATABASE_URL not set during build. This is OK for static pages, but runtime DB calls will fail.")
      return "postgresql://placeholder:placeholder@localhost:5432/placeholder?sslmode=require"
    }
    throw new Error("DATABASE_URL environment variable is not set")
  }

  // If using Neon pooler, ensure SSL is required
  if (url.includes("pooler") || url.includes("neon.tech")) {
    const urlObj = new URL(url)
    // Add SSL mode if not present
    if (!urlObj.searchParams.has("sslmode")) {
      urlObj.searchParams.set("sslmode", "require")
    }
    // Add connection pooling parameters if using pooler
    if (url.includes("pooler")) {
      if (!urlObj.searchParams.has("pgbouncer")) {
        urlObj.searchParams.set("pgbouncer", "true")
      }
    }
    return urlObj.toString()
  }

  return url
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Test connection on startup (only in development, not during build)
if (process.env.NODE_ENV === "development" && process.env.NEXT_PHASE !== "phase-production-build") {
  prisma.$connect().catch((error) => {
    console.error("Failed to connect to database:", error)
    console.error("DATABASE_URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"))
  })
}

