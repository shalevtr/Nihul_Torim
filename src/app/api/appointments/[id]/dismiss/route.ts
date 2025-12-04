import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    })

    if (!appointment) {
      return NextResponse.json({ error: "תור לא נמצא" }, { status: 404 })
    }

    // Only allow dismissing cancelled appointments
    if (appointment.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "ניתן להעלים רק תורים שבוטלו" },
        { status: 400 }
      )
    }

    // Check if user owns this appointment
    if (appointment.customerId !== user.id) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    // For now, we'll just return success - the frontend will handle hiding it
    // In the future, we can add a "dismissed" field to the schema
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error dismissing appointment:", error)
    return NextResponse.json(
      { error: "שגיאה בהעלמת תור" },
      { status: 500 }
    )
  }
}



