import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Cache services for 5 minutes
export const revalidate = 300

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const services = await prisma.service.findMany({
      where: {
        businessId: params.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ services }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "שגיאה בטעינת שירותים" },
      { status: 500 }
    )
  }
}



