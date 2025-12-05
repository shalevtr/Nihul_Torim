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

    const favorite = await prisma.favorite.create({
      data: {
        businessId,
        userId: user.id,
      },
    })

    return NextResponse.json(favorite)
  } catch (error) {
    console.error("Error adding favorite:", error)
    return NextResponse.json(
      { error: "שגיאה בהוספה למועדפים" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")

    if (!businessId) {
      return NextResponse.json({ error: "חסר businessId" }, { status: 400 })
    }

    await prisma.favorite.deleteMany({
      where: {
        businessId,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing favorite:", error)
    return NextResponse.json(
      { error: "שגיאה בהסרה ממועדפים" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")

    // If businessId is provided, check if it's favorite
    if (businessId) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          businessId_userId: {
            businessId,
            userId: user.id,
          },
        },
      })
      return NextResponse.json({ isFavorite: !!favorite })
    }

    // Otherwise return all favorites
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        business: {
          select: {
            id: true,
            slug: true,
            name: true,
            category: true,
            city: true,
            logo: true,
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json(
      { error: "שגיאה בטעינת מועדפים" },
      { status: 500 }
    )
  }
}

