import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        business: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "שירות לא נמצא" }, { status: 404 })
    }

    if (!canManageBusiness(user.role, service.business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    await prisma.service.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json(
      { error: "שגיאה במחיקת שירות" },
      { status: 500 }
    )
  }
}

