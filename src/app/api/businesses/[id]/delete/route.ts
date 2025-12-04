import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    await prisma.business.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting business:", error)
    return NextResponse.json(
      { error: "שגיאה במחיקת עסק" },
      { status: 500 }
    )
  }
}

