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

    const slot = await prisma.timeSlot.findUnique({
      where: { id: params.id },
      include: {
        business: true,
      },
    })

    if (!slot) {
      return NextResponse.json({ error: "תור לא נמצא" }, { status: 404 })
    }

    if (!canManageBusiness(user.role, slot.business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    // Block the slot by marking it as booked with a special system user
    await prisma.timeSlot.update({
      where: { id: params.id },
      data: {
        isBooked: true,
        bookedById: null, // null means blocked by owner
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error blocking slot:", error)
    return NextResponse.json(
      { error: "שגיאה בחסימת תור" },
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

    const slot = await prisma.timeSlot.findUnique({
      where: { id: params.id },
      include: {
        business: true,
      },
    })

    if (!slot) {
      return NextResponse.json({ error: "תור לא נמצא" }, { status: 404 })
    }

    if (!canManageBusiness(user.role, slot.business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    // Unblock the slot
    await prisma.timeSlot.update({
      where: { id: params.id },
      data: {
        isBooked: false,
        bookedById: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unblocking slot:", error)
    return NextResponse.json(
      { error: "שגיאה בשחרור תור" },
      { status: 500 }
    )
  }
}

