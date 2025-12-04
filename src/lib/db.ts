import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL has SSL parameters for Neon
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
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

// Test connection on startup (only in development)
if (process.env.NODE_ENV === "development") {
  prisma.$connect().catch((error) => {
    console.error("Failed to connect to database:", error)
    console.error("DATABASE_URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"))
  })
}

