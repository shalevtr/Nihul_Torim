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

    const business = await prisma.business.findUnique({
      where: { id: params.id },
    })

    if (!business || !canManageBusiness(user.role, business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const body = await request.json()
    const { customerId, reason } = body

    if (!customerId) {
      return NextResponse.json({ error: "נדרש מזהה לקוח" }, { status: 400 })
    }

    // Check if already blocked
    const existing = await prisma.blockedCustomer.findUnique({
      where: {
        businessId_customerId: {
          businessId: params.id,
          customerId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "הלקוח כבר חסום" }, { status: 400 })
    }

    // Block the customer
    const blocked = await prisma.blockedCustomer.create({
      data: {
        businessId: params.id,
        customerId,
        reason: reason || null,
        createdById: user.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      blocked,
      message: "הלקוח נחסם בהצלחה",
    })
  } catch (error) {
    console.error("Error blocking customer:", error)
    return NextResponse.json(
      { error: "שגיאה בחסימת לקוח" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { id: params.id },
    })

    if (!business || !canManageBusiness(user.role, business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "נדרש מזהה לקוח" }, { status: 400 })
    }

    // Unblock the customer
    await prisma.blockedCustomer.delete({
      where: {
        businessId_customerId: {
          businessId: params.id,
          customerId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "הלקוח שוחרר מהחסימה",
    })
  } catch (error) {
    console.error("Error unblocking customer:", error)
    return NextResponse.json(
      { error: "שגיאה בשחרור לקוח מחסימה" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { id: params.id },
    })

    if (!business || !canManageBusiness(user.role, business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const blocked = await prisma.blockedCustomer.findMany({
      where: { businessId: params.id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ blocked })
  } catch (error) {
    console.error("Error fetching blocked customers:", error)
    return NextResponse.json(
      { error: "שגיאה בטעינת לקוחות חסומים" },
      { status: 500 }
    )
  }
}



