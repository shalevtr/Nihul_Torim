"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BUSINESS_CATEGORIES } from "@/lib/categories"
import { Clock, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AvailableSlot {
  slotId: string
  businessId: string
  businessName: string
  category: string
  city: string
  startTime: string
  endTime: string
}

export default function QuickBookPage() {
  const router = useRouter()
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [cities, setCities] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<"now" | "today" | "tomorrow">("now")

  useEffect(() => {
    fetchCities()
  }, [])

  useEffect(() => {
    if (selectedCategory || selectedCity || timeRange) {
      fetchAvailableSlots()
    }
  }, [selectedCategory, selectedCity, timeRange])

  async function fetchCities() {
    try {
      const res = await fetch("/api/businesses/search")
      const data = await res.json()
      setCities(data.cities || [])
    } catch (error) {
      console.error("Error fetching cities:", error)
    }
  }

  async function fetchAvailableSlots() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append("category", selectedCategory)
      if (selectedCity) params.append("city", selectedCity)
      params.append("timeRange", timeRange)

      const res = await fetch(`/api/timeslots/available?${params}`)
      const data = await res.json()
      setSlots(data.slots || [])
    } catch (error) {
      console.error("Error fetching slots:", error)
    } finally {
      setLoading(false)
    }
  }

  async function bookSlot(slotId: string, businessId: string) {
    try {
      const res = await fetch("/api/timeslots/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          slotId,
          serviceId: undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "שגיאה בהזמנת התור")
      }

      // Show success message
      alert("התור נקבע בהצלחה וממתין לאישור")
      router.push("/dashboard/appointments")
      router.refresh()
    } catch (error: any) {
      console.error("Error booking slot:", error)
      alert(error.message || "שגיאה בהזמנת התור")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">קביעת תור מהירה</h1>
        <p className="text-gray-600 dark:text-gray-400">מצא והזמן תור פנוי באזור שלך עכשיו</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">מה את/ה מחפש/ת?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">קטגוריה</label>
              <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="כל הקטגוריות" />
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

            <div>
              <label className="text-sm font-medium mb-2 block">עיר</label>
              <Select value={selectedCity || "all"} onValueChange={(v) => setSelectedCity(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="כל הערים" />
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

            <div>
              <label className="text-sm font-medium mb-2 block">מתי?</label>
              <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">עכשיו (שעתיים הקרובות)</SelectItem>
                  <SelectItem value="today">היום</SelectItem>
                  <SelectItem value="tomorrow">מחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {loading ? "מחפש תורים..." : `${slots.length} תורים פנויים`}
        </h2>
        
        {slots.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">לא נמצאו תורים פנויים</p>
              <p className="text-sm text-gray-400 mt-1">נסה לשנות את הסינונים</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <Card key={slot.slotId} className="overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
                  <CardTitle className="text-lg">{slot.businessName}</CardTitle>
                  <CardDescription>
                    <span className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900 px-2 py-1 text-xs font-medium text-indigo-800 dark:text-indigo-200">
                      {slot.category}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {slot.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {slot.city}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium">
                      {new Date(slot.startTime).toLocaleDateString("he-IL", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium">
                      {new Date(slot.startTime).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {new Date(slot.endTime).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => bookSlot(slot.slotId, slot.businessId)}
                    >
                      קבע עכשיו
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/b/${slot.businessSlug || slot.businessId}`}>פרטים</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

