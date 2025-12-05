import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const city = searchParams.get("city")
  const timeRange = searchParams.get("timeRange") || "now"

  try {
    // Calculate time window
    const now = new Date()
    let startDateTime = new Date(now)
    let endDateTime = new Date()

    switch (timeRange) {
      case "now":
        // Next 2 hours from now
        endDateTime.setHours(now.getHours() + 2, now.getMinutes(), 0, 0)
        break
      case "today":
        // Rest of today
        endDateTime.setHours(23, 59, 59, 999)
        endDateTime.setDate(now.getDate())
        endDateTime.setMonth(now.getMonth())
        endDateTime.setFullYear(now.getFullYear())
        break
      case "tomorrow":
        // All of tomorrow
        startDateTime = new Date(now)
        startDateTime.setDate(now.getDate() + 1)
        startDateTime.setHours(0, 0, 0, 0)
        endDateTime = new Date(startDateTime)
        endDateTime.setHours(23, 59, 59, 999)
        break
    }

    // Build business filter
    const businessWhere: any = {}
    if (category) businessWhere.category = category
    if (city) businessWhere.city = city

    // Find available time slots - check both date and time
    const allSlots = await prisma.timeSlot.findMany({
      where: {
        isBooked: false,
        business: businessWhere,
      },
      include: {
        business: {
          select: {
            id: true,
            slug: true,
            name: true,
            category: true,
            city: true,
          },
        },
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ],
      take: 200, // Get more to filter properly
    })

    // Filter slots by actual datetime (date + time)
    const slots = allSlots.filter((slot) => {
      const slotDate = new Date(slot.date)
      const [startHour, startMinute] = slot.startTime.split(':').map(Number)
      
      const slotStartDateTime = new Date(slotDate)
      slotStartDateTime.setHours(startHour, startMinute, 0, 0)
      
      // Only show slots that are in the future (at least 1 minute from now - no past slots)
      const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000)
      
      // Check if slot is within the requested time range AND in the future
      return (
        slotStartDateTime >= startDateTime &&
        slotStartDateTime <= endDateTime &&
        slotStartDateTime >= oneMinuteFromNow // At least 1 minute in the future
      )
    }).slice(0, 50) // Limit to 50 results
    // Format response
    const formattedSlots = slots.map((slot) => {
      const slotDate = new Date(slot.date)
      const [startHour, startMinute] = slot.startTime.split(':').map(Number)
      const [endHour, endMinute] = slot.endTime.split(':').map(Number)
      
      const startDateTime = new Date(slotDate)
      startDateTime.setHours(startHour, startMinute, 0, 0)
      
      const endDateTime = new Date(slotDate)
      endDateTime.setHours(endHour, endMinute, 0, 0)
      
      return {
        slotId: slot.id,
        businessId: slot.business.id,
        businessSlug: slot.business.slug || slot.business.id,
        businessName: slot.business.name,
        category: slot.business.category,
        city: slot.business.city,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      }
    })

    return NextResponse.json({ slots: formattedSlots })
  } catch (error) {
    console.error("Error fetching available slots:", error)
    return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 })
  }
}

