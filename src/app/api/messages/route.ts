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
    const { businessId, content } = body

    const message = await prisma.message.create({
      data: {
        businessId,
        fromUserId: user.id,
        content,
        isRead: false,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json(
      { error: "שגיאה בשליחת הודעה" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
  }

  // Get messages for businesses owned by user
  const businesses = await prisma.business.findMany({
    where: {
      ownerId: user.id,
    },
    select: {
      id: true,
    },
  })

  const businessIds = businesses.map((b) => b.id)

  const messages = await prisma.message.findMany({
    where: {
      businessId: {
        in: businessIds,
      },
    },
    include: {
      fromUser: {
        select: {
          fullName: true,
          email: true,
        },
      },
      business: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(messages)
}

