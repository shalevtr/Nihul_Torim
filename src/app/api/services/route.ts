import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, name, description, price, duration } = body

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business || !canManageBusiness(user.role, business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const service = await prisma.service.create({
      data: {
        businessId,
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "שגיאה ביצירת שירות" },
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

    const services = await prisma.service.findMany({
      where: { businessId },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "שגיאה בטעינת שירותים" },
      { status: 500 }
    )
  }
}

