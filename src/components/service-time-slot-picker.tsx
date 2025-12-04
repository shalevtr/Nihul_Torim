"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Clock, Calendar } from "lucide-react"

interface TimeSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
}

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
}

interface ServiceTimeSlotPickerProps {
  slots: TimeSlot[]
  businessId: string
  userName: string
}

export function ServiceTimeSlotPicker({ slots, businessId, userName }: ServiceTimeSlotPickerProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [booking, setBooking] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [businessId])

  async function fetchServices() {
    try {
      const res = await fetch(`/api/services?businessId=${businessId}`)
      const data = await res.json()
      setServices(data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter slots by service duration if service is selected
  const filteredSlots = selectedService && selectedService !== "all"
    ? (() => {
        const service = services.find((s) => s.id === selectedService)
        if (!service) return slots

        // Filter slots that match the service duration
        return slots.filter((slot) => {
          const [startH, startM] = slot.startTime.split(":").map(Number)
          const [endH, endM] = slot.endTime.split(":").map(Number)
          const startMinutes = startH * 60 + startM
          const endMinutes = endH * 60 + endM
          const slotDuration = endMinutes - startMinutes
          return slotDuration >= service.duration
        })
      })()
    : slots

  // Group slots by date
  const slotsByDate = filteredSlots.reduce((acc, slot) => {
    const dateKey = new Date(slot.date).toISOString().split("T")[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  const dates = Object.keys(slotsByDate).sort()

  async function handleBookSlot(slotId: string) {
    setBooking(slotId)

    try {
      const actualServiceId = selectedService === "all" ? "" : selectedService
      const res = await fetch("/api/timeslots/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          slotId,
          serviceId: actualServiceId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "שגיאה בהזמנת תור")
      }

      toast({
        title: "הצלחה!",
        description: "התור נקבע בהצלחה וממתין לאישור",
      })

      router.push("/dashboard/appointments")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "לא ניתן לקבוע תור",
        variant: "destructive",
      })
    } finally {
      setBooking(null)
    }
  }

  const actualServiceId = selectedService === "all" ? "" : selectedService
  const selectedServiceData = actualServiceId ? services.find((s) => s.id === actualServiceId) : null

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      {services.length > 0 && (
        <div className="rounded-lg border bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            בחר שירות (אופציונלי):
          </label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="בחר שירות או השאר ריק לכל השירותים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל השירותים</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{service.name}</span>
                    <span className="mr-2 text-xs text-muted-foreground">
                      ₪{service.price} • {service.duration} דק'
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedServiceData && (
            <div className="mt-3 rounded-md bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{selectedServiceData.name}</p>
                  {selectedServiceData.description && (
                    <p className="text-sm text-gray-600">{selectedServiceData.description}</p>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-indigo-600">₪{selectedServiceData.price}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedServiceData.duration} דקות
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date Selection */}
      {dates.length > 0 ? (
        <>
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Calendar className="h-5 w-5" />
              בחר יום:
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {dates.map((date) => {
                const dateObj = new Date(date + "T12:00:00")
                const dayName = format(dateObj, "EEEE", { locale: he })
                const dayDate = format(dateObj, "d/M", { locale: he })
                const slotCount = slotsByDate[date].length

                return (
                  <Button
                    key={date}
                    variant={selectedDate === date ? "default" : "outline"}
                    onClick={() => setSelectedDate(date)}
                    className="h-auto flex-col gap-1 py-3 transition-all hover:scale-105"
                  >
                    <div className="font-bold text-base">{dayName}</div>
                    <div className="text-xs opacity-80">{dayDate}</div>
                    <div className="text-xs opacity-60">{slotCount} תורים</div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Clock className="h-5 w-5" />
                בחר שעה:
              </h3>
              {slotsByDate[selectedDate].length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  אין תורים זמינים ליום זה
                  {selectedServiceData && ` עבור השירות "${selectedServiceData.name}"`}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {slotsByDate[selectedDate]
                    .filter((slot) => {
                      // Filter out past slots - check if slot time has passed
                      const slotDate = new Date(slot.date)
                      const [startHour, startMinute] = slot.startTime.split(':').map(Number)
                      const slotStartDateTime = new Date(slotDate)
                      slotStartDateTime.setHours(startHour, startMinute, 0, 0)
                      
                      // Only show slots that are at least 1 minute in the future
                      const now = new Date()
                      const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000)
                      return slotStartDateTime >= oneMinuteFromNow
                    })
                    .map((slot) => (
                    <Button
                      key={slot.id}
                      variant="outline"
                      onClick={() => handleBookSlot(slot.id)}
                      disabled={booking === slot.id}
                      className="h-auto flex-col gap-1 py-4 transition-all hover:scale-105 hover:bg-indigo-50 hover:border-indigo-500 hover:shadow-md disabled:opacity-50"
                    >
                      <div className="text-xl font-bold">{slot.startTime}</div>
                      <div className="text-xs text-muted-foreground">עד {slot.endTime}</div>
                      {booking === slot.id && (
                        <div className="text-xs text-indigo-600 animate-pulse">מתבצע...</div>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            אין תורים זמינים כרגע
          </p>
          <p className="text-sm text-gray-500">
            {selectedServiceData
              ? `אין תורים זמינים עבור השירות "${selectedServiceData.name}"`
              : "נסה לבחור שירות אחר או לחזור מאוחר יותר"}
          </p>
        </div>
      )}
    </div>
  )
}

