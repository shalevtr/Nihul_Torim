import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Simple query to test DB connection
    await prisma.$queryRaw`SELECT 1`
    
    // Try to count businesses
    const businessCount = await prisma.business.count()
    
    return NextResponse.json({
      status: "ok",
      database: "connected",
      businessCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Database health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error.message,
        hint: "Check DATABASE_URL in .env.local and ensure it includes sslmode=require for Neon",
      },
      { status: 500 }
    )
  }
}



