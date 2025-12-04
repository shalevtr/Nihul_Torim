import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { unlink } from "fs/promises"
import path from "path"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const image = await prisma.businessImage.findUnique({
      where: { id: params.id },
      include: {
        business: true,
      },
    })

    if (!image) {
      return NextResponse.json({ error: "תמונה לא נמצאה" }, { status: 404 })
    }

    if (!canManageBusiness(user.role, image.business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    // Delete file from filesystem
    if (image.url.startsWith("/uploads/")) {
      const filepath = path.join(process.cwd(), "public", image.url)
      try {
        await unlink(filepath)
      } catch (error) {
        console.error("Error deleting file:", error)
        // Continue even if file deletion fails
      }
    }

    // Delete from database
    await prisma.businessImage.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json(
      { error: "שגיאה במחיקת תמונה" },
      { status: 500 }
    )
  }
}

