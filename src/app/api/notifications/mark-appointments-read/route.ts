import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentIds } = body

    // If appointmentIds provided, mark only those. Otherwise, mark all appointment-related notifications
    if (appointmentIds && Array.isArray(appointmentIds) && appointmentIds.length > 0) {
      // Mark all unread notifications for these specific appointments as read
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          appointmentId: {
            in: appointmentIds,
          },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
    } else {
      // Mark ALL unread notifications related to appointments (for the user's appointments page)
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          appointmentId: {
            not: null, // Only notifications related to appointments
          },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
    }

    return NextResponse.json({ success: true, message: "כל ההתראות הקשורות לתורים סומנו כנקראו" })
  } catch (error) {
    console.error("Error marking appointment notifications as read:", error)
    return NextResponse.json(
      { error: "שגיאה בעדכון התראות" },
      { status: 500 }
    )
  }
}

