import { prisma } from "@/lib/db"

/**
 * מנקה תורים ישנים (יותר מ-30 יום אחורה)
 * יש לקרוא לפונקציה זו באופן תקופתי (cron job)
 */
export async function cleanupOldAppointments() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Delete old appointments that are cancelled or past
    const deleted = await prisma.appointment.deleteMany({
      where: {
        OR: [
          {
            status: "CANCELLED",
            createdAt: {
              lt: thirtyDaysAgo,
            },
          },
          {
            endTime: {
              lt: thirtyDaysAgo,
            },
            status: {
              in: ["CANCELLED"],
            },
          },
        ],
      },
    })

    // Delete old time slots that are past and not booked
    const deletedSlots = await prisma.timeSlot.deleteMany({
      where: {
        date: {
          lt: thirtyDaysAgo,
        },
        isBooked: false,
      },
    })

    // Delete old notifications (more than 30 days)
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        isRead: true,
      },
    })

    console.log(`🧹 Cleanup completed: ${deleted.count} appointments, ${deletedSlots.count} slots, ${deletedNotifications.count} notifications`)

    return {
      appointments: deleted.count,
      slots: deletedSlots.count,
      notifications: deletedNotifications.count,
    }
  } catch (error) {
    console.error("Error cleaning up old data:", error)
    throw error
  }
}

/**
 * מנקה תורים שעברו (מעדכן סטטוס)
 */
export async function markPastAppointmentsAsCompleted() {
  try {
    const now = new Date()

    const updated = await prisma.appointment.updateMany({
      where: {
        endTime: {
          lt: now,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      data: {
        status: "CONFIRMED", // Keep as confirmed for history
      },
    })

    return updated.count
  } catch (error) {
    console.error("Error marking past appointments:", error)
    throw error
  }
}



