import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        appointment: {
          select: {
            id: true,
            startTime: true,
            status: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "שגיאה בטעינת הודעות" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true, message: "כל ההודעות סומנו כנקראו" })
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true, message: "הודעה סומנה כנקראה" })
    }

    return NextResponse.json({ error: "נדרש מזהה הודעה" }, { status: 400 })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "שגיאה בעדכון הודעה" },
      { status: 500 }
    )
  }
}



