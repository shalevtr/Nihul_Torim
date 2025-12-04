import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const body = await request.json()
    const { reply } = body

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        business: true,
      },
    })

    if (!review) {
      return NextResponse.json({ error: "ביקורת לא נמצאה" }, { status: 404 })
    }

    if (!canManageBusiness(user.role, review.business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        reply,
        repliedAt: new Date(),
      },
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error("Error replying to review:", error)
    return NextResponse.json(
      { error: "שגיאה בתגובה" },
      { status: 500 }
    )
  }
}

