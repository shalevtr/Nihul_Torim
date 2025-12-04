import { NextResponse } from "next/server"
import { cleanupExpiredReservations } from "@/lib/slot-reservation"

/**
 * Cleanup endpoint - should be called periodically (via cron job)
 * Cleans up expired slot reservations
 */
export async function POST(request: Request) {
  try {
    // Optional: Add authentication/authorization here
    // For now, allow anyone to call it (you might want to protect this)
    
    const count = await cleanupExpiredReservations()
    
    return NextResponse.json({
      success: true,
      cleanedUp: count,
    })
  } catch (error: any) {
    console.error("Error cleaning up reservations:", error)
    return NextResponse.json(
      { error: "שגיאה בניקוי הזמנות" },
      { status: 500 }
    )
  }
}

