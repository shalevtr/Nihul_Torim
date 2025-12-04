import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/roles"
import { subscriptionPlans } from "@/lib/subscription"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const { id } = params

    // Get business and check permissions
    const business = await prisma.business.findUnique({
      where: { id },
      select: {
        ownerId: true,
        subscriptionPlan: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    if (business.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if user has team management permission
    const plan = subscriptionPlans[business.subscriptionPlan]
    if (!plan.canManageTeam) {
      return NextResponse.json(
        { error: "ניהול צוות זמין רק במסלול Standard ומעלה" },
        { status: 403 }
      )
    }

    const staff = await prisma.staff.findMany({
      where: { businessId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const { id } = params
    const { name, email, phone, role } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "שם חובה" }, { status: 400 })
    }

    // Get business and check permissions
    const business = await prisma.business.findUnique({
      where: { id },
      select: {
        ownerId: true,
        subscriptionPlan: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    if (business.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if user has team management permission
    const plan = subscriptionPlans[business.subscriptionPlan]
    if (!plan.canManageTeam) {
      return NextResponse.json(
        { error: "ניהול צוות זמין רק במסלול Standard ומעלה" },
        { status: 403 }
      )
    }

    const staff = await prisma.staff.create({
      data: {
        businessId: id,
        name,
        email,
        phone,
        role,
      },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error creating staff:", error)
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const { id } = params
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get("staffId")

    if (!staffId) {
      return NextResponse.json({ error: "Staff ID required" }, { status: 400 })
    }

    // Get business and check permissions
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        business: {
          select: {
            ownerId: true,
            subscriptionPlan: true,
          },
        },
      },
    })

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }

    if (staff.business.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.staff.delete({
      where: { id: staffId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting staff:", error)
    return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 })
  }
}

