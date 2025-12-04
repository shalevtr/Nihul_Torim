import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Cache public business data for 5 minutes
export const revalidate = 300

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const business = await prisma.business.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      },
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        city: true,
        address: true,
        phone: true,
        description: true,
        logo: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (error) {
    console.error("Error fetching business:", error)
    return NextResponse.json(
      { error: "שגיאה בטעינת עסק" },
      { status: 500 }
    )
  }
}

