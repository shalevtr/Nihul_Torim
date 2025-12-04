import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { generateSlug, getUniqueSlug } from "@/lib/slug"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { id: params.id },
    })

    if (!business) {
      return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 })
    }

    if (!canManageBusiness(user.role, business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const body = await request.json()

    // Generate slug if name changed or slug doesn't exist
    let slug = business.slug
    if (body.name && body.name !== business.name) {
      const baseSlug = generateSlug(body.name)
      slug = await getUniqueSlug(baseSlug, business.id)
    } else if (!slug && body.name) {
      const baseSlug = generateSlug(body.name)
      slug = await getUniqueSlug(baseSlug, business.id)
    }

    const updated = await prisma.business.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug,
        category: body.category,
        city: body.city || null,
        address: body.address || null,
        description: body.description || null,
        logo: body.logo || null,
        phone: body.phone || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating business:", error)
    return NextResponse.json(
      { error: "שגיאה בעדכון עסק" },
      { status: 500 }
    )
  }
}

