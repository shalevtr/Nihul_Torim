import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { requireBusinessOwnerOrAdmin } from "@/lib/roles"
import { generateSlug, getUniqueSlug } from "@/lib/slug"

export async function POST(request: Request) {
  try {
    const user = await requireBusinessOwnerOrAdmin()
    const body = await request.json()

    // Generate unique slug
    const baseSlug = generateSlug(body.name)
    const slug = await getUniqueSlug(baseSlug)

    const business = await prisma.business.create({
      data: {
        name: body.name,
        slug,
        category: body.category,
        city: body.city || null,
        address: body.address || null,
        description: body.description || null,
        logo: body.logo || null,
        phone: body.phone || null,
        ownerId: user.id,
      },
    })

    return NextResponse.json(business)
  } catch (error) {
    console.error("Error creating business:", error)
    return NextResponse.json(
      { error: "שגיאה ביצירת עסק" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
  }

  const businesses = await prisma.business.findMany({
    where:
      user.role === "ADMIN"
        ? {}
        : {
            ownerId: user.id,
          },
    include: {
      owner: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  })

  return NextResponse.json(businesses)
}

