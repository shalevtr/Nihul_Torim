import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const slot = await prisma.timeSlot.findUnique({
      where: { id: params.id },
      include: {
        business: true,
      },
    })

    if (!slot) {
      return NextResponse.json({ error: "תור לא נמצא" }, { status: 404 })
    }

    if (!canManageBusiness(user.role, slot.business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const customerId = slot.bookedById

    // Reject: clear the booking
    await prisma.timeSlot.update({
      where: { id: params.id },
      data: {
        isBooked: false,
        bookedById: null,
      },
    })

    // Also cancel the appointment
    if (customerId) {
      await prisma.appointment.updateMany({
        where: {
          businessId: slot.businessId,
          customerId: customerId,
          startTime: {
            gte: new Date(new Date(slot.date).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(slot.date).setHours(23, 59, 59, 999)),
          },
          status: "PENDING",
        },
        data: {
          status: "CANCELLED",
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error rejecting slot:", error)
    return NextResponse.json(
      { error: "שגיאה בדחיית תור" },
      { status: 500 }
    )
  }
}

