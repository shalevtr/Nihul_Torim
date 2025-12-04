import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { createAppointmentNotification } from "@/lib/notifications"

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

    if (!slot.bookedById) {
      return NextResponse.json({ error: "תור זה לא תפוס" }, { status: 400 })
    }

    // Find the appointment for this slot
    const slotDate = new Date(slot.date)
    const [startHour, startMinute] = slot.startTime.split(':').map(Number)
    const slotStartTime = new Date(slotDate)
    slotStartTime.setHours(startHour, startMinute, 0, 0)

    const appointment = await prisma.appointment.findFirst({
      where: {
        businessId: slot.businessId,
        customerId: slot.bookedById,
        startTime: slotStartTime,
        status: "PENDING",
      },
      include: {
        customer: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "תור לא נמצא במערכת" }, { status: 404 })
    }

    // Update appointment status to CONFIRMED
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "CONFIRMED",
      },
      include: {
        customer: true,
        business: true,
      },
    })

    // Update slot (keep isBooked=true, bookedById stays the same for tracking)
    await prisma.timeSlot.update({
      where: { id: params.id },
      data: {
        isBooked: true,
        // Keep bookedById to track who booked it
      },
    })

    // Create notification for customer
    if (updatedAppointment.customerId) {
      await createAppointmentNotification(
        updatedAppointment.id,
        slot.businessId,
        updatedAppointment.customerId,
        slot.business.ownerId,
        "APPOINTMENT_CONFIRMED"
      )
    }

    return NextResponse.json({ 
      success: true,
      appointment: updatedAppointment 
    })
  } catch (error) {
    console.error("Error approving slot:", error)
    return NextResponse.json(
      { error: "שגיאה באישור תור" },
      { status: 500 }
    )
  }
}

