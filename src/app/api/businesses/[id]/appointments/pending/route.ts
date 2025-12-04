import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"

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

    const appointments = await prisma.appointment.findMany({
      where: {
        businessId: params.id,
        status: "PENDING",
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        customer: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching pending appointments:", error)
    return NextResponse.json(
      { error: "שגיאה בטעינת תורים" },
      { status: 500 }
    )
  }
}



