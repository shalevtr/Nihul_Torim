import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createAppointmentNotification } from "@/lib/notifications"
import { apiMiddleware } from "@/lib/api-middleware"
import { bookAppointmentSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    // Rate limiting and validation
    const validationResult = await apiMiddleware(request, bookAppointmentSchema, 'bookAppointment')
    if (validationResult instanceof NextResponse) {
      return validationResult
    }
    const { slotId, serviceId } = validationResult.data

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check if slot exists and is available (with lock)
      const slot = await tx.timeSlot.findUnique({
        where: { id: slotId },
        include: {
          business: {
            include: {
              owner: true,
            },
          },
        },
      })

      if (!slot) {
        throw new Error("תור לא נמצא")
      }

      // Check if slot is already booked (double-check with lock)
      if (slot.isBooked) {
        throw new Error("תור כבר תפוס")
      }

      // Check if slot time has passed
      const now = new Date()
      const slotDate = new Date(slot.date)
      const [startHour, startMinute] = slot.startTime.split(':').map(Number)
      const slotStartDateTime = new Date(slotDate)
      slotStartDateTime.setHours(startHour, startMinute, 0, 0)
      
      if (slotStartDateTime < now) {
        throw new Error("לא ניתן לקבוע תור שעבר")
      }

      // Check if customer is blocked
      const isBlocked = await tx.blockedCustomer.findUnique({
        where: {
          businessId_customerId: {
            businessId: slot.businessId,
            customerId: user.id,
          },
        },
      })

      if (isBlocked) {
        throw new Error("אתה חסום מלקבוע תורים בעסק זה")
      }

      // Check appointments limit for this user on this date for this business
      const existingAppointments = await tx.timeSlot.count({
        where: {
          bookedById: user.id,
          businessId: slot.businessId,
          date: slot.date,
          isBooked: true,
        },
      })

      if (existingAppointments >= 3) {
        throw new Error("הגעת למגבלת 3 תורים ביום אחד לעסק זה")
      }

      // Check for overlapping appointments across all businesses
      const slotStartTime = new Date(slotDate)
      slotStartTime.setHours(startHour, startMinute, 0, 0)
      
      const [endHour, endMinute] = slot.endTime.split(':').map(Number)
      const slotEndTime = new Date(slotDate)
      slotEndTime.setHours(endHour, endMinute, 0, 0)

      const overlappingAppointments = await tx.appointment.findMany({
        where: {
          customerId: user.id,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          OR: [
            {
              AND: [
                { startTime: { lte: slotStartTime } },
                { endTime: { gt: slotStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: slotEndTime } },
                { endTime: { gte: slotEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: slotStartTime } },
                { endTime: { lte: slotEndTime } },
              ],
            },
          ],
        },
      })

      if (overlappingAppointments.length > 0) {
        throw new Error("יש לך תור חופף בזמן זה. אנא בחר זמן אחר.")
      }

      // Book the slot (atomic update)
      await tx.timeSlot.update({
        where: { id: slotId },
        data: {
          isBooked: true,
          bookedById: user.id,
        },
      })

      // Create appointment for history
      const appointmentData: any = {
        businessId: slot.businessId,
        customerId: user.id,
        startTime: slotStartTime,
        endTime: slotEndTime,
        status: "PENDING",
        notes: serviceId ? `תור דרך המערכת - שירות נבחר` : `תור דרך המערכת`,
      }

      // Only include serviceId if it exists (not null/undefined)
      if (serviceId) {
        appointmentData.serviceId = serviceId
      }

      const appointment = await tx.appointment.create({
        data: appointmentData,
      })

      return { appointment, slot }
    })

    // Create notifications (outside transaction)
    try {
      await createAppointmentNotification(
        result.appointment.id,
        result.slot.businessId,
        user.id,
        result.slot.business.ownerId,
        "APPOINTMENT_PENDING"
      )
    } catch (notifError) {
      console.error("Error creating notification:", notifError)
      // Don't fail the booking if notification fails
    }

    // Log for debugging
    console.log("📧 תור חדש נקבע:")
    console.log("עסק:", result.slot.business.name)
    console.log("לקוח:", user.fullName, user.email, user.phone)
    console.log("תאריך:", new Date(result.slot.date).toLocaleDateString("he-IL"))
    console.log("שעה:", result.slot.startTime, "-", result.slot.endTime)
    console.log("בעל העסק:", result.slot.business.owner.email)

    return NextResponse.json({ 
      success: true,
      appointmentId: result.appointment.id 
    })
  } catch (error: any) {
    console.error("Error booking slot:", error)
    
    // Return user-friendly error message
    const errorMessage = error.message || "שגיאה בהזמנת תור"
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error.message?.includes("לא נמצא") ? 404 : 
               error.message?.includes("חסום") ? 403 : 400 }
    )
  }
}
