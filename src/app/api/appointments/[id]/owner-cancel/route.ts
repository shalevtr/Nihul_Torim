import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { createAppointmentNotification } from "@/lib/notifications"

// Owner can cancel any appointment without restrictions
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
      include: {
        business: true,
        customer: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "התור לא נמצא" }, { status: 404 })
    }

    // Check if user can manage this business
    if (!canManageBusiness(user.role, appointment.business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    if (appointment.status === "CANCELLED") {
      return NextResponse.json({ error: "התור כבר בוטל" }, { status: 400 })
    }

    // Cancel appointment and free the slot
    await prisma.$transaction(async (tx) => {
      // Update appointment status
      await tx.appointment.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
      })

      // Find and free the associated time slot
      const slotDate = new Date(appointment.startTime)
      const startTimeStr = slotDate.toTimeString().slice(0, 5) // "HH:MM"

      await tx.timeSlot.updateMany({
        where: {
          businessId: appointment.businessId,
          date: {
            gte: new Date(slotDate.setHours(0, 0, 0, 0)),
            lt: new Date(slotDate.setHours(23, 59, 59, 999)),
          },
          startTime: startTimeStr,
          isBooked: true,
        },
        data: {
          isBooked: false,
          bookedById: null,
        },
      })
    })

    // Create notification for customer if exists
    if (appointment.customerId) {
      try {
        await createAppointmentNotification(
          appointment.id,
          appointment.businessId,
          appointment.customerId,
          appointment.business.ownerId,
          "APPOINTMENT_CANCELLED"
        )
      } catch (notifError) {
        console.error("Error creating notification:", notifError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "התור בוטל בהצלחה והתור שוחרר",
    })
  } catch (error: any) {
    console.error("Error cancelling appointment:", error)
    return NextResponse.json(
      { error: error.message || "שגיאה בביטול התור" },
      { status: 500 }
    )
  }
}



