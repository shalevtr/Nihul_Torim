import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Cache search results for 5 minutes
export const revalidate = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""
  const category = searchParams.get("category")
  const city = searchParams.get("city")
  const minRating = searchParams.get("minRating")
  const sortBy = searchParams.get("sortBy") || "name"

  try {
    // Build where clause
    const where: any = {}
    
    if (q) {
      where.name = { contains: q, mode: "insensitive" }
    }
    
    if (category && category !== "all") {
      where.category = category
    }
    
    if (city && city !== "all") {
      where.city = city
    }

    // Get all cities for dropdown
    const cities = await prisma.business.findMany({
      select: { city: true },
      distinct: ["city"],
      where: { city: { not: null } },
    })

    // Fetch businesses with reviews for rating calculation
    // Select only needed fields for better performance
    const businesses = await prisma.business.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        city: true,
        address: true,
        description: true,
        logo: true,
        phone: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      take: 100, // Limit results
    })

    // Calculate average rating and filter
    let filtered = businesses.map((business) => {
      const avgRating =
        business.reviews.length > 0
          ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
          : 0
      
      return {
        ...business,
        avgRating,
      }
    })

    // Filter by minimum rating
    if (minRating) {
      filtered = filtered.filter((b) => b.avgRating >= parseFloat(minRating))
    }

    // Sort
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.avgRating - a.avgRating)
        break
      case "popularity":
        filtered.sort((a, b) => b._count.appointments - a._count.appointments)
        break
      case "name":
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name, "he"))
        break
    }

    return NextResponse.json({
      businesses: filtered.map(({ reviews, _count, ...rest }) => rest),
      cities: cities.map((c) => c.city).filter(Boolean),
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to search businesses" }, { status: 500 })
  }
}
