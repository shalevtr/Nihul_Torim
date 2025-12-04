import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/roles"
import { prisma } from "@/lib/db"
import { Role } from "@prisma/client"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { role } = body

    if (!["CUSTOMER", "BUSINESS_OWNER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "תפקיד לא חוקי" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        role: role as Role,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "שגיאה בעדכון משתמש" },
      { status: 500 }
    )
  }
}

