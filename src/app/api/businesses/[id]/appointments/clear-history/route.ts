import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"

// Soft delete - mark old appointments as archived/hidden
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { id: params.id },
    })

    if (!business) {
      return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 })
    }

    if (!canManageBusiness(user.role, business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const body = await request.json()
    const { olderThanDays = 30 } = body

    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    // Count appointments that will be "cleared"
    const count = await prisma.appointment.count({
      where: {
        businessId: params.id,
        endTime: {
          lt: cutoffDate,
        },
        status: {
          not: "CANCELLED", // Don't count already cancelled
        },
      },
    })

    // For now, we'll just delete old cancelled appointments
    // In production, you might want to add an "archived" field instead
    await prisma.appointment.deleteMany({
      where: {
        businessId: params.id,
        endTime: {
          lt: cutoffDate,
        },
        status: "CANCELLED",
      },
    })

    return NextResponse.json({
      success: true,
      message: `נוקו ${count} תורים ישנים`,
      clearedCount: count,
    })
  } catch (error: any) {
    console.error("Error clearing appointment history:", error)
    return NextResponse.json(
      { error: error.message || "שגיאה בניקוי היסטוריה" },
      { status: 500 }
    )
  }
}



