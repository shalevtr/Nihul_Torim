import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createAppointmentNotification } from "@/lib/notifications"
import { apiMiddleware } from "@/lib/api-middleware"
import { bookPublicAppointmentSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    // Rate limiting and validation
    const validationResult = await apiMiddleware(request, bookPublicAppointmentSchema, 'bookAppointment')
    if (validationResult instanceof NextResponse) {
      return validationResult
    }
    const { slotId, serviceId, customerData } = validationResult.data

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check if slot exists and is available
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

      // Check if slot is already booked
      if (slot.isBooked) {
        throw new Error("תור כבר תפוס")
      }

      // Check if slot is currently reserved by someone else
      const now = new Date()
      if (slot.reservedUntil && slot.reservedUntil > now) {
        throw new Error("תור שמור כרגע על ידי משתמש אחר")
      }

      // Check if slot time has passed
      const slotDate = new Date(slot.date)
      const [startHour, startMinute] = slot.startTime.split(':').map(Number)
      const slotStartDateTime = new Date(slotDate)
      slotStartDateTime.setHours(startHour, startMinute, 0, 0)

      if (slotStartDateTime < now) {
        throw new Error("לא ניתן לקבוע תור שעבר")
      }

      // Find or create customer by deviceId
      let customer = await tx.user.findFirst({
        where: {
          email: `device_${customerData.deviceId}@temp.local`,
        },
      })

      if (!customer) {
        // Create a temporary customer user (no password, role is CUSTOMER)
        const tempPassword = `temp_${customerData.deviceId}_${Date.now()}`
        const bcrypt = require("bcryptjs")
        const passwordHash = await bcrypt.hash(tempPassword, 10)

        const customerEmail = customerData.email || `device_${customerData.deviceId}@temp.local`

        customer = await tx.user.create({
          data: {
            email: customerEmail,
            passwordHash,
            fullName: customerData.fullName,
            phone: customerData.phone,
            role: "CUSTOMER",
          },
        })
      } else {
        // Update customer data
        customer = await tx.user.update({
          where: { id: customer.id },
          data: {
            fullName: customerData.fullName,
            phone: customerData.phone,
            email: customerData.email || customer.email,
          },
        })
      }

      // Check for overlapping appointments
      const [endHour, endMinute] = slot.endTime.split(':').map(Number)
      const slotEndTime = new Date(slotDate)
      slotEndTime.setHours(endHour, endMinute, 0, 0)

      const overlappingAppointments = await tx.appointment.findMany({
        where: {
          customerId: customer.id,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          OR: [
            {
              AND: [
                { startTime: { lte: slotStartDateTime } },
                { endTime: { gt: slotStartDateTime } },
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
                { startTime: { gte: slotStartDateTime } },
                { endTime: { lte: slotEndTime } },
              ],
            },
          ],
        },
      })

      if (overlappingAppointments.length > 0) {
        throw new Error("יש לך תור חופף בזמן זה. אנא בחר זמן אחר.")
      }

      // Book the slot and clear reservation
      await tx.timeSlot.update({
        where: { id: slotId },
        data: {
          isBooked: true,
          bookedById: customer.id,
          reservedUntil: null, // Clear reservation when booking
        },
      })

      // Create appointment
      const appointmentData: any = {
        businessId: slot.businessId,
        customerId: customer.id,
        startTime: slotStartDateTime,
        endTime: slotEndTime,
        status: "PENDING",
        notes: `תור דרך הקישור הציבורי - ${customerData.fullName}`,
      }

      if (serviceId) {
        appointmentData.serviceId = serviceId
      }

      const appointment = await tx.appointment.create({
        data: appointmentData,
      })

      return { appointment, slot, customer }
    })

    // Create notifications (outside transaction)
    try {
      await createAppointmentNotification(
        result.appointment.id,
        result.slot.businessId,
        result.customer.id,
        result.slot.business.ownerId,
        "APPOINTMENT_PENDING"
      )
    } catch (notifError) {
      console.error("Error creating notification:", notifError)
    }

    return NextResponse.json({
      success: true,
      appointmentId: result.appointment.id,
    })
  } catch (error: any) {
    console.error("Error booking slot:", error)
    return NextResponse.json(
      { error: error.message || "שגיאה בהזמנת תור" },
      { status: error.message?.includes("לא נמצא") ? 404 : 400 }
    )
  }
}

