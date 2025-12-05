"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/components/favorite-button"
import Link from "next/link"
import { BUSINESS_CATEGORIES } from "@/lib/categories"
import { Search as SearchIcon, MapPin, Grid3x3, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SearchPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get current user
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setUserId(data.id)
      })
      .catch(() => {})
  }, [])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchType, setSearchType] = useState<"text" | "category" | "city" | "location">("category")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [minRating, setMinRating] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationError, setLocationError] = useState<string>("")
  const [maxDistance, setMaxDistance] = useState<string>("10") // km

  useEffect(() => {
    fetchData()
  }, [searchQuery, selectedCategory, selectedCity, minRating, sortBy, userLocation, maxDistance])

  // Get user location when location search is selected
  useEffect(() => {
    if (searchType === "location" && !userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
          setLocationError("")
        },
        (error) => {
          setLocationError("לא ניתן לקבל מיקום. אנא בדוק את הרשאות הדפדפן.")
          console.error("Geolocation error:", error)
        }
      )
    }
  }, [searchType, userLocation])

  async function fetchData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("q", searchQuery)
      if (selectedCategory) params.append("category", selectedCategory)
      if (selectedCity) params.append("city", selectedCity)
      if (minRating) params.append("minRating", minRating)
      if (sortBy) params.append("sortBy", sortBy)
      
      // Add location parameters if available
      if (userLocation) {
        params.append("lat", userLocation.lat.toString())
        params.append("lon", userLocation.lon.toString())
        if (maxDistance) params.append("maxDistance", maxDistance)
        // Default to distance sort when location is used
        if (sortBy === "name") params.set("sortBy", "distance")
      }

      const res = await fetch(`/api/businesses/search?${params}`)
      const data = await res.json()
      
      setBusinesses(data.businesses || [])
      setCities(data.cities || [])
    } catch (error) {
      console.error("Error fetching businesses:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">חיפוש עסקים</h1>
        <p className="text-gray-600">מצא את העסק המושלם עבורך</p>
      </div>

      {/* Search Type Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={searchType === "category" ? "default" : "outline"}
          onClick={() => {
            setSearchType("category")
            setSearchQuery("")
            setSelectedCity("")
          }}
          className="whitespace-nowrap"
        >
          <Grid3x3 className="ml-2 h-4 w-4" />
          לפי קטגוריה
        </Button>
        <Button
          variant={searchType === "city" ? "default" : "outline"}
          onClick={() => {
            setSearchType("city")
            setSearchQuery("")
            setSelectedCategory("")
          }}
          className="whitespace-nowrap"
        >
          <MapPin className="ml-2 h-4 w-4" />
          לפי עיר
        </Button>
        <Button
          variant={searchType === "text" ? "default" : "outline"}
          onClick={() => {
            setSearchType("text")
            setSelectedCategory("")
            setSelectedCity("")
            setUserLocation(null)
          }}
          className="whitespace-nowrap"
        >
          <SearchIcon className="ml-2 h-4 w-4" />
          חיפוש חופשי
        </Button>
        <Button
          variant={searchType === "location" ? "default" : "outline"}
          onClick={() => {
            setSearchType("location")
            setSelectedCategory("")
            setSelectedCity("")
            setSearchQuery("")
            if (!userLocation && navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                  })
                  setLocationError("")
                },
                (error) => {
                  setLocationError("לא ניתן לקבל מיקום. אנא בדוק את הרשאות הדפדפן.")
                }
              )
            }
          }}
          className="whitespace-nowrap"
        >
          <MapPin className="ml-2 h-4 w-4" />
          לידך
        </Button>
      </div>
      
      {locationError && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {locationError}
        </div>
      )}
      
      {searchType === "location" && userLocation && (
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">חיפוש לפי מיקום</p>
                <p className="text-xs text-muted-foreground">מרחק מקסימלי: {maxDistance} ק"מ</p>
              </div>
              <Select value={maxDistance} onValueChange={setMaxDistance} className="mr-auto">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 ק"מ</SelectItem>
                  <SelectItem value="5">5 ק"מ</SelectItem>
                  <SelectItem value="10">10 ק"מ</SelectItem>
                  <SelectItem value="20">20 ק"מ</SelectItem>
                  <SelectItem value="50">50 ק"מ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">סינון ומיון מתקדם</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">דירוג מינימלי</label>
              <Select value={minRating || "all"} onValueChange={(v) => setMinRating(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="כל הדירוגים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הדירוגים</SelectItem>
                  <SelectItem value="4">⭐ 4+</SelectItem>
                  <SelectItem value="4.5">⭐ 4.5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">מיון לפי</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">שם</SelectItem>
                  <SelectItem value="rating">דירוג</SelectItem>
                  <SelectItem value="popularity">פופולריות</SelectItem>
                  {userLocation && <SelectItem value="distance">מרחק</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Input Based on Type */}
      <Card>
        <CardContent className="pt-6">
          {searchType === "text" && (
            <div className="relative">
              <SearchIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="חפש לפי שם עסק..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pr-12 pl-4 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          )}

          {searchType === "category" && (
            <div className="space-y-3">
              <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? "" : v)}>
                <SelectTrigger className="w-full py-6 text-base">
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הקטגוריות</SelectItem>
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {searchType === "city" && cities.length > 0 && (
            <div className="space-y-3">
              <Select value={selectedCity || "all"} onValueChange={(v) => setSelectedCity(v === "all" ? "" : v)}>
                <SelectTrigger className="w-full py-6 text-base">
                  <SelectValue placeholder="בחר עיר" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הערים</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {loading ? "טוען..." : `${businesses.length} עסקים נמצאו`}
        </h2>
        {businesses.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">לא נמצאו עסקים</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business: any) => (
              <div key={business.id} className="relative">
                <Link href={`/b/${business.slug || business.id}`}>
                  <Card className="overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full">
                    {business.logo && (
                      <div className="h-48 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
                        <img 
                          src={business.logo} 
                          alt={business.name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
                            {business.category}
                          </span>
                          {business.city && <span className="text-sm">• {business.city}</span>}
                          {business.avgRating > 0 && (
                            <span className="flex items-center gap-1 text-sm font-medium">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {business.avgRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {business.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {business.description}
                        </p>
                      )}
                      <div className="rounded-lg bg-indigo-600 py-2 text-center text-sm font-semibold text-white">
                        לחץ לצפייה ←
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <div className="absolute top-2 left-2 z-10">
                  <FavoriteButton businessId={business.id} userId={userId} initialIsFavorite={false} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
