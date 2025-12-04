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
    const { businessId, startTime, endTime, notes } = body

    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        customerId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes: notes || null,
        status: "PENDING",
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json(
      { error: "שגיאה בקביעת תור" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
  }

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  // Get all appointments (including all statuses)
  const allAppointments = await prisma.appointment.findMany({
    where: { customerId: user.id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  })

  // Filter active appointments (not archived)
  const activeAppointments = allAppointments.filter((appointment) => {
    const endTime = new Date(appointment.endTime)
    return endTime >= oneHourAgo
  })

  return NextResponse.json(activeAppointments)
}

