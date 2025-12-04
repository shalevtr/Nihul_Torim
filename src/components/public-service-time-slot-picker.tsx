"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Clock, Calendar } from "lucide-react"
import { CustomerData, getCustomerData } from "@/lib/customer-cookie"

interface TimeSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
  isReserved?: boolean
}

interface Service {
  id: string
  name: string
  duration: number
}

interface PublicServiceTimeSlotPickerProps {
  slots: TimeSlot[]
  businessId: string
  customerData: CustomerData
}

export function PublicServiceTimeSlotPicker({
  slots: initialSlots,
  businessId,
  customerData,
}: PublicServiceTimeSlotPickerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [booking, setBooking] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots)
  const [reservedSlotId, setReservedSlotId] = useState<string | null>(null)
  const reservationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetch(`/api/businesses/${businessId}/services`)
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || [])
      })
      .catch(() => {})

    // Poll for slot updates every 5 seconds
    const interval = setInterval(() => {
      fetch(`/api/businesses/${businessId}/slots/public`)
        .then((res) => res.json())
        .then((data) => {
          if (data.slots) {
            setSlots(data.slots)
          }
        })
        .catch(() => {})
    }, 5000)

    return () => {
      clearInterval(interval)
      // Release reservation on unmount
      if (reservedSlotId) {
        fetch(`/api/timeslots/reserve`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotId: reservedSlotId }),
        }).catch(() => {})
      }
      if (reservationTimeoutRef.current) {
        clearTimeout(reservationTimeoutRef.current)
      }
    }
  }, [businessId, reservedSlotId])

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const dateKey = new Date(slot.date).toISOString().split("T")[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  const dates = Object.keys(slotsByDate).sort()

  // Filter slots by service if selected
  const filteredSlots = selectedService && selectedService !== "all"
    ? (() => {
        const service = services.find((s) => s.id === selectedService)
        if (!service) return slots
        return slots.filter((slot) => {
          // This would need to check if slot is for this service
          // For now, show all slots
          return true
        })
      })()
    : slots

  const filteredSlotsByDate = filteredSlots.reduce((acc, slot) => {
    const dateKey = new Date(slot.date).toISOString().split("T")[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  async function handleBookSlot(slotId: string) {
    if (!customerData) {
      toast({
        title: "שגיאה",
        description: "נדרשים פרטי יצירת קשר",
        variant: "destructive",
      })
      return
    }

    // Release previous reservation if exists
    if (reservedSlotId && reservedSlotId !== slotId) {
      try {
        await fetch(`/api/timeslots/reserve`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotId: reservedSlotId }),
        })
      } catch {}
      if (reservationTimeoutRef.current) {
        clearTimeout(reservationTimeoutRef.current)
      }
    }

    setBooking(slotId)

    try {
      // First, reserve the slot temporarily
      const customer = getCustomerData()
      const reserveRes = await fetch("/api/timeslots/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          deviceId: customer?.deviceId || customerData.deviceId,
        }),
      })

      const reserveData = await reserveRes.json()

      if (!reserveRes.ok) {
        throw new Error(reserveData.error || "לא ניתן לשמור תור")
      }

      setReservedSlotId(slotId)
      
      // Set timeout to auto-release reservation after 2 minutes
      if (reservationTimeoutRef.current) {
        clearTimeout(reservationTimeoutRef.current)
      }
      reservationTimeoutRef.current = setTimeout(() => {
        setReservedSlotId(null)
      }, 2 * 60 * 1000)

      // Update slots to show this one as reserved
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, isReserved: true } : slot
        )
      )

      // Now book the slot
      const actualServiceId = selectedService === "all" ? "" : selectedService
      const res = await fetch("/api/timeslots/book-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          serviceId: actualServiceId || undefined,
          customerData: {
            deviceId: customerData.deviceId,
            fullName: customerData.fullName,
            phone: customerData.phone,
            email: customerData.email,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Release reservation on error
        await fetch(`/api/timeslots/reserve`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotId }),
        }).catch(() => {})
        setReservedSlotId(null)
        throw new Error(data.error || "שגיאה בהזמנת תור")
      }

      // Clear reservation timeout
      if (reservationTimeoutRef.current) {
        clearTimeout(reservationTimeoutRef.current)
      }
      setReservedSlotId(null)

      toast({
        title: "הצלחה!",
        description: "התור נקבע בהצלחה וממתין לאישור",
      })

      // Redirect to confirmation page
      router.push(`/b/${businessId}/confirmation?appointmentId=${data.appointmentId}`)
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "לא ניתן לקבוע תור",
        variant: "destructive",
      })
      setReservedSlotId(null)
    } finally {
      setBooking(null)
    }
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">אין תורים זמינים כרגע</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      {services.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">בחר שירות (אופציונלי)</label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="כל השירותים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל השירותים</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} ({service.duration} דקות)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date Selection */}
      {dates.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Calendar className="h-5 w-5" />
            בחר תאריך:
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((date) => {
              const dayDate = new Date(date)
              const slotCount = filteredSlotsByDate[date]?.length || 0
              const isSelected = selectedDate === date

              return (
                <Button
                  key={date}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedDate(date)}
                  className="min-w-[100px] flex-col h-auto py-3"
                >
                  <div className="text-sm font-semibold">
                    {dayDate.toLocaleDateString("he-IL", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                  <div className="text-xs opacity-80">{slotCount} תורים</div>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Time Slots */}
      {selectedDate && filteredSlotsByDate[selectedDate] && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Clock className="h-5 w-5" />
            בחר שעה:
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredSlotsByDate[selectedDate]
              .filter((slot) => {
                const slotDate = new Date(slot.date)
                const [startHour, startMinute] = slot.startTime.split(':').map(Number)
                const slotStartDateTime = new Date(slotDate)
                slotStartDateTime.setHours(startHour, startMinute, 0, 0)
                const now = new Date()
                const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000)
                return slotStartDateTime >= oneMinuteFromNow
              })
              .map((slot) => {
                const isReserved = slot.isReserved || reservedSlotId === slot.id
                const isDisabled = booking === slot.id || (isReserved && reservedSlotId !== slot.id)

                return (
                  <Button
                    key={slot.id}
                    variant={isReserved && reservedSlotId === slot.id ? "default" : "outline"}
                    onClick={() => handleBookSlot(slot.id)}
                    disabled={isDisabled}
                    className={`h-auto flex-col gap-1 py-4 transition-all hover:scale-105 hover:bg-indigo-50 hover:border-indigo-500 hover:shadow-md disabled:opacity-50 ${
                      isReserved && reservedSlotId === slot.id ? "bg-indigo-100 border-indigo-500" : ""
                    }`}
                  >
                    <div className="text-xl font-bold">{slot.startTime}</div>
                    <div className="text-xs text-muted-foreground">עד {slot.endTime}</div>
                    {booking === slot.id && (
                      <div className="text-xs text-indigo-600 animate-pulse">מתבצע...</div>
                    )}
                    {isReserved && reservedSlotId !== slot.id && (
                      <div className="text-xs text-orange-600">שמור</div>
                    )}
                    {isReserved && reservedSlotId === slot.id && (
                      <div className="text-xs text-indigo-600">שמור עבורך</div>
                    )}
                  </Button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}



