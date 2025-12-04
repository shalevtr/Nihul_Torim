import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Cache slots for 30 seconds (they change frequently)
export const revalidate = 30

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Find business by id or slug
    const business = await prisma.business.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      },
      select: { id: true },
    })

    if (!business) {
      return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 })
    }

    const now = new Date()
    const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000)

    // Build datetime filter in database for better performance
    // We'll filter by date first, then by time
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    // Get slots efficiently - filter in database where possible
    const slots = await prisma.timeSlot.findMany({
      where: {
        businessId: business.id,
        isBooked: false,
        date: {
          gte: today, // Only future dates
        },
        OR: [
          { reservedUntil: null },
          { reservedUntil: { lt: now } }, // Expired reservations
        ],
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        reservedUntil: true,
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
      take: 100, // Limit results
    })

    // Filter by actual datetime (date + time) - only show slots in the future
    const filteredSlots = slots
      .map((slot) => {
        const slotDate = new Date(slot.date)
        const [startHour, startMinute] = slot.startTime.split(':').map(Number)
        const slotStartDateTime = new Date(slotDate)
        slotStartDateTime.setHours(startHour, startMinute, 0, 0)

        return {
          id: slot.id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isReserved: slot.reservedUntil ? slot.reservedUntil > now : false,
          startDateTime: slotStartDateTime,
        }
      })
      .filter((slot) => slot.startDateTime >= oneMinuteFromNow)
      .map(({ startDateTime, ...slot }) => slot) // Remove computed field

    return NextResponse.json({ 
      slots: filteredSlots,
      timestamp: now.toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json(
      { error: "שגיאה בטעינת תורים" },
      { status: 500 }
    )
  }
}

