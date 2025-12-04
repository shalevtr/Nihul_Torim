import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const body = await request.json()
    const { subscriptionPlan } = body

    if (!["BASIC", "STANDARD", "PREMIUM"].includes(subscriptionPlan)) {
      return NextResponse.json({ error: "מסלול לא חוקי" }, { status: 400 })
    }

    const business = await prisma.business.update({
      where: { id: params.id },
      data: { subscriptionPlan },
    })

    return NextResponse.json(business)
  } catch (error) {
    console.error("Error updating subscription:", error)
    return NextResponse.json(
      { error: "שגיאה בעדכון מסלול" },
      { status: 500 }
    )
  }
}

