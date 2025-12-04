import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/roles"
import { canCancelAppointment, CANCELLATION_POLICIES, CancellationPolicyType } from "@/lib/cancellation-policy"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const { id } = params

    // Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json(
        { error: "חשבונך חסום בגלל ביטולים רבים. אנא צור קשר עם התמיכה." },
        { status: 403 }
      )
    }

    // Get appointment with business
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            cancellationPolicy: true,
            name: true,
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "התור לא נמצא" }, { status: 404 })
    }

    if (appointment.customerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "אין לך הרשאה לבטל תור זה" }, { status: 403 })
    }

    if (appointment.status === "CANCELLED") {
      return NextResponse.json({ error: "התור כבר בוטל" }, { status: 400 })
    }

    // Check cancellation policy
    const policyType = (appointment.business.cancellationPolicy || "FLEXIBLE") as CancellationPolicyType
    const policy = CANCELLATION_POLICIES[policyType]
    const cancellationResult = canCancelAppointment(appointment.startTime, policy)

    if (!cancellationResult.canCancel) {
      return NextResponse.json(
        { error: cancellationResult.message },
        { status: 400 }
      )
    }

    // Cancel appointment
    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    })

    // Update user cancellation count (reset monthly)
    const now = new Date()
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        cancellationCount: true,
        lastCancellationReset: true,
      },
    })

    if (userData) {
      const daysSinceReset = Math.floor(
        (now.getTime() - new Date(userData.lastCancellationReset).getTime()) / (1000 * 60 * 60 * 24)
      )

      let newCount = userData.cancellationCount + 1
      let newReset = userData.lastCancellationReset

      // Reset monthly
      if (daysSinceReset >= 30) {
        newCount = 1
        newReset = now
      }

      // Block if too many cancellations
      const shouldBlock = newCount >= 3

      await prisma.user.update({
        where: { id: user.id },
        data: {
          cancellationCount: newCount,
          lastCancellationReset: newReset,
          isBlocked: shouldBlock,
        },
      })

      if (shouldBlock) {
        return NextResponse.json({
          success: true,
          warning: "התור בוטל. בגלל ביטולים רבים, חשבונך נחסם זמנית. אנא צור קשר עם התמיכה.",
          fee: cancellationResult.fee,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: cancellationResult.message,
      fee: cancellationResult.fee,
    })
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return NextResponse.json({ error: "שגיאה בביטול התור" }, { status: 500 })
  }
}

