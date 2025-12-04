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
    const { businessId, date, startHour, endHour, slotDuration, serviceId } = body

    if (!businessId || !date || !startHour || !endHour || !slotDuration) {
      return NextResponse.json(
        { error: "חסרים פרטים נדרשים" },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business || !canManageBusiness(user.role, business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    // Parse date properly
    const slotDate = new Date(date)
    if (isNaN(slotDate.getTime())) {
      return NextResponse.json(
        { error: "תאריך לא תקין" },
        { status: 400 }
      )
    }

    // Parse times
    const [startH, startM] = startHour.split(":").map(Number)
    const [endH, endM] = endHour.split(":").map(Number)
    
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
      return NextResponse.json(
        { error: "שעות לא תקינות" },
        { status: 400 }
      )
    }
    
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    
    if (startMinutes >= endMinutes) {
      return NextResponse.json(
        { error: "שעת התחלה חייבת להיות לפני שעת סיום" },
        { status: 400 }
      )
    }

    if (slotDuration <= 0 || slotDuration > 240) {
      return NextResponse.json(
        { error: "משך תור חייב להיות בין 1 ל-240 דקות" },
        { status: 400 }
      )
    }
    
    const slots = []
    let currentMinutes = startMinutes

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60)
      const minutes = currentMinutes % 60
      const startTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
      
      const endSlotMinutes = currentMinutes + slotDuration
      const endHours = Math.floor(endSlotMinutes / 60)
      const endMinutesSlot = endSlotMinutes % 60
      const endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutesSlot).padStart(2, "0")}`

      // Don't create slots that would go past the end time
      if (endSlotMinutes > endMinutes) {
        break
      }

      slots.push({
        businessId,
        date: slotDate,
        startTime,
        endTime,
        isBooked: false,
      })

      currentMinutes += slotDuration
    }

    if (slots.length === 0) {
      return NextResponse.json(
        { error: "לא ניתן ליצור תורים עם הפרמטרים שניתנו" },
        { status: 400 }
      )
    }

    // Create all slots
    const created = await prisma.timeSlot.createMany({
      data: slots,
      skipDuplicates: true,
    })

    return NextResponse.json({ 
      success: true, 
      count: created.count,
      message: `נוצרו ${created.count} תורים בהצלחה`
    })
  } catch (error: any) {
    console.error("Error creating time slots:", error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "חלק מהתורים כבר קיימים" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "שגיאה ביצירת תורים" },
      { status: 500 }
    )
  }
}
