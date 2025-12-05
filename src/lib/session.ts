import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.NEXTAUTH_SECRET

// During build, allow missing secret (will fail at runtime instead)
if (!JWT_SECRET) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn("⚠️ NEXTAUTH_SECRET not set during build. This is OK for static pages, but auth will fail at runtime.")
  } else {
    throw new Error("NEXTAUTH_SECRET environment variable is required")
  }
}

if (JWT_SECRET && JWT_SECRET.length < 32) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn("⚠️ NEXTAUTH_SECRET is too short. Auth will fail at runtime.")
  } else {
    throw new Error("NEXTAUTH_SECRET must be at least 32 characters long")
  }
}

export async function createSession(userId: string) {
  if (!JWT_SECRET) {
    throw new Error("NEXTAUTH_SECRET environment variable is required")
  }
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getSession() {
  const token = cookies().get("session")?.value
  if (!token) return null

  // During build, return null to prevent Prisma calls
  if (!JWT_SECRET || process.env.NEXT_PHASE === 'phase-production-build') {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isBlocked: true,
        phone: true,
      },
    })
    return user
  } catch {
    return null
  }
}

export async function destroySession() {
  cookies().delete("session")
}

