import { NextResponse } from "next/server"
import { reserveSlot, releaseSlotReservation } from "@/lib/slot-reservation"
import { apiMiddleware } from "@/lib/api-middleware"
import { z } from "zod"

const reserveSlotSchema = z.object({
  slotId: z.string().min(1),
  deviceId: z.string().min(1),
})

const releaseSlotSchema = z.object({
  slotId: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const validationResult = await apiMiddleware(request, reserveSlotSchema, 'bookAppointment')
    if (validationResult instanceof NextResponse) {
      return validationResult
    }
    const { slotId, deviceId } = validationResult.data

    const result = await reserveSlot(slotId, deviceId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "לא ניתן לשמור תור" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      reservedUntil: result.reservedUntil,
    })
  } catch (error: any) {
    console.error("Error reserving slot:", error)
    return NextResponse.json(
      { error: "שגיאה בשמירת תור" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const validationResult = await apiMiddleware(request, releaseSlotSchema, 'default')
    if (validationResult instanceof NextResponse) {
      return validationResult
    }
    const { slotId } = validationResult.data

    await releaseSlotReservation(slotId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error releasing slot:", error)
    return NextResponse.json(
      { error: "שגיאה בשחרור תור" },
      { status: 500 }
    )
  }
}

