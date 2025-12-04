import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { cleanupOldAppointments, markPastAppointmentsAsCompleted } from "@/lib/cleanup"

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const cleanupResult = await cleanupOldAppointments()
    const markedCount = await markPastAppointmentsAsCompleted()

    return NextResponse.json({
      success: true,
      cleanup: cleanupResult,
      markedAsCompleted: markedCount,
      message: "ניקוי הושלם בהצלחה",
    })
  } catch (error) {
    console.error("Error in cleanup:", error)
    return NextResponse.json(
      { error: "שגיאה בניקוי" },
      { status: 500 }
    )
  }
}



