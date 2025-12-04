"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { he } from "date-fns/locale"

interface TimeSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
}

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  businessId: string
  userName: string
}

export function TimeSlotPicker({ slots, businessId, userName }: TimeSlotPickerProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [booking, setBooking] = useState<string | null>(null)

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

  async function handleBookSlot(slotId: string) {
    setBooking(slotId)

    try {
      const res = await fetch("/api/timeslots/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      })

      if (!res.ok) throw new Error("שגיאה בהזמנת תור")

      toast({
        title: "הצלחה!",
        description: "התור נקבע בהצלחה",
      })

      router.push("/dashboard/appointments")
      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לקבוע תור",
        variant: "destructive",
      })
    } finally {
      setBooking(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <h3 className="mb-3 font-semibold">בחר יום:</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {dates.map((date) => {
            const dateObj = new Date(date + "T12:00:00")
            const dayName = format(dateObj, "EEEE", { locale: he })
            const dayDate = format(dateObj, "d/M", { locale: he })
            
            return (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                onClick={() => setSelectedDate(date)}
                className="h-auto flex-col py-3"
              >
                <div className="font-bold">{dayName}</div>
                <div className="text-xs">{dayDate}</div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h3 className="mb-3 font-semibold">בחר שעה:</h3>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
            {slotsByDate[selectedDate].map((slot) => (
              <Button
                key={slot.id}
                variant="outline"
                onClick={() => handleBookSlot(slot.id)}
                disabled={booking === slot.id}
                className="h-auto flex-col gap-1 py-3 hover:bg-indigo-50 hover:border-indigo-500"
              >
                <div className="text-lg font-bold">{slot.startTime}</div>
                <div className="text-xs text-muted-foreground">עד {slot.endTime}</div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

