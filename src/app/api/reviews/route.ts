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
    const { businessId, rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "דירוג לא תקין" }, { status: 400 })
    }

    // Check if user already reviewed
    const existing = await prisma.review.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId: user.id,
        },
      },
    })

    let review
    if (existing) {
      review = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment },
      })
    } else {
      review = await prisma.review.create({
        data: {
          businessId,
          userId: user.id,
          rating,
          comment,
        },
      })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "שגיאה בשמירת ביקורת" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")

    if (!businessId) {
      return NextResponse.json({ error: "חסר businessId" }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate average
    const avg = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      reviews,
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: reviews.length,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "שגיאה בטעינת ביקורות" },
      { status: 500 }
    )
  }
}

