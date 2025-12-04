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
    const { businessId } = body

    if (!businessId) {
      return NextResponse.json({ error: "נדרש מזהה עסק" }, { status: 400 })
    }

    // Mark all unread notifications for this business as read
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        businessId: businessId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking business notifications as read:", error)
    return NextResponse.json(
      { error: "שגיאה בעדכון התראות" },
      { status: 500 }
    )
  }
}



