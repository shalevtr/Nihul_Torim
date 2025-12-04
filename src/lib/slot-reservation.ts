import { prisma } from "@/lib/db"

const RESERVATION_DURATION_MS = 2 * 60 * 1000 // 2 minutes

/**
 * Reserve a slot temporarily (for 2 minutes)
 * Returns true if reservation successful, false if slot is already booked/reserved
 */
export async function reserveSlot(
  slotId: string,
  deviceId: string
): Promise<{ success: boolean; reservedUntil?: Date; error?: string }> {
  const now = new Date()
  const reservedUntil = new Date(now.getTime() + RESERVATION_DURATION_MS)

  try {
    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check if slot exists and is available
      const slot = await tx.timeSlot.findUnique({
        where: { id: slotId },
      })

      if (!slot) {
        return { success: false, error: "תור לא נמצא" }
      }

      // Check if slot is already booked
      if (slot.isBooked) {
        return { success: false, error: "תור כבר תפוס" }
      }

      // Check if slot is currently reserved by someone else
      if (slot.reservedUntil && slot.reservedUntil > now) {
        return { success: false, error: "תור שמור כרגע" }
      }

      // Check if slot time has passed
      const slotDate = new Date(slot.date)
      const [startHour, startMinute] = slot.startTime.split(':').map(Number)
      const slotStartDateTime = new Date(slotDate)
      slotStartDateTime.setHours(startHour, startMinute, 0, 0)

      if (slotStartDateTime < now) {
        return { success: false, error: "לא ניתן לשמור תור שעבר" }
      }

      // Reserve the slot
      await tx.timeSlot.update({
        where: { id: slotId },
        data: {
          reservedUntil,
        },
      })

      return { success: true, reservedUntil }
    })

    return result
  } catch (error: any) {
    console.error("Error reserving slot:", error)
    return { success: false, error: "שגיאה בשמירת תור" }
  }
}

/**
 * Release a slot reservation
 */
export async function releaseSlotReservation(slotId: string): Promise<void> {
  try {
    await prisma.timeSlot.update({
      where: { id: slotId },
      data: {
        reservedUntil: null,
      },
    })
  } catch (error) {
    console.error("Error releasing slot reservation:", error)
  }
}

/**
 * Clean up expired reservations (should be called periodically)
 */
export async function cleanupExpiredReservations(): Promise<number> {
  const now = new Date()
  
  const result = await prisma.timeSlot.updateMany({
    where: {
      reservedUntil: {
        lte: now,
      },
      isBooked: false,
    },
    data: {
      reservedUntil: null,
    },
  })

  return result.count
}

