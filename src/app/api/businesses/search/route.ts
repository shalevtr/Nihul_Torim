import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Cache search results for 5 minutes
export const revalidate = 300

// Haversine formula to calculate distance between two coordinates (in km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""
  const category = searchParams.get("category")
  const city = searchParams.get("city")
  const minRating = searchParams.get("minRating")
  const sortBy = searchParams.get("sortBy") || "name"
  const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null
  const userLon = searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : null
  const maxDistance = searchParams.get("maxDistance") ? parseFloat(searchParams.get("maxDistance")!) : null // in km

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
        latitude: true,
        longitude: true,
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
      take: 200, // Get more to filter by distance
    })

    // Calculate average rating and distance
    let filtered = businesses.map((business) => {
      const avgRating =
        business.reviews.length > 0
          ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
          : 0
      
      let distance: number | null = null
      if (userLat !== null && userLon !== null && business.latitude !== null && business.longitude !== null) {
        distance = calculateDistance(userLat, userLon, business.latitude, business.longitude)
      }
      
      return {
        ...business,
        avgRating,
        distance,
      }
    })

    // Filter by distance if maxDistance is specified
    if (maxDistance !== null && maxDistance > 0) {
      filtered = filtered.filter((b) => b.distance !== null && b.distance <= maxDistance)
    }

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
      case "distance":
        // Sort by distance (closest first), then by rating
        filtered.sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0
          if (a.distance === null) return 1
          if (b.distance === null) return -1
          if (a.distance !== b.distance) return a.distance - b.distance
          return b.avgRating - a.avgRating
        })
        break
      case "name":
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name, "he"))
        break
    }

    return NextResponse.json({
      businesses: filtered.map(({ reviews, _count, ...rest }) => ({
        ...rest,
        distance: rest.distance !== null ? Math.round(rest.distance * 10) / 10 : null, // Round to 1 decimal
      })),
      cities: cities.map((c) => c.city).filter(Boolean),
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to search businesses" }, { status: 500 })
  }
}
