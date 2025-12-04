import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { AppointmentStatus } from "@prisma/client"
import { createAppointmentNotification } from "@/lib/notifications"

export async function PUT(
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
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "תור לא נמצא" }, { status: 404 })
    }

    // Check if user can manage this appointment
    const canManage =
      appointment.customerId === user.id ||
      canManageBusiness(user.role, appointment.business.ownerId, user.id)

    if (!canManage) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "סטטוס לא חוקי" }, { status: 400 })
    }

    const oldStatus = appointment.status
    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: status as AppointmentStatus,
      },
      include: {
        business: true,
        customer: true,
      },
    })

    // Create notification if status changed
    if (oldStatus !== status) {
      let notificationType: "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_PENDING" = "APPOINTMENT_PENDING"
      
      if (status === "CONFIRMED") {
        notificationType = "APPOINTMENT_CONFIRMED"
      } else if (status === "CANCELLED") {
        notificationType = "APPOINTMENT_CANCELLED"
      }

      await createAppointmentNotification(
        updated.id,
        updated.businessId,
        updated.customerId || null,
        updated.business.ownerId,
        notificationType
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json(
      { error: "שגיאה בעדכון תור" },
      { status: 500 }
    )
  }
}

