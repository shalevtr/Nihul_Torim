"use client"

import { useState } from "react"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, User } from "lucide-react"

interface TimeSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
  isBooked: boolean
  bookedBy: {
    fullName: string | null
    email: string
    phone: string | null
  } | null
}

interface SlotsByDate {
  [date: string]: TimeSlot[]
}

export function SlotsManager({ slots, businessId }: { slots: TimeSlot[]; businessId: string }) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  // Group slots by date
  const slotsByDate: SlotsByDate = slots.reduce((acc, slot) => {
    const dateKey = format(new Date(slot.date), "yyyy-MM-dd")
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(slot)
    return acc
  }, {} as SlotsByDate)

  function getSlotStatus(slot: TimeSlot): "available" | "pending" | "confirmed" {
    if (!slot.isBooked) return "available"
    if (slot.bookedBy) return "pending" // Has bookedBy = pending approval
    return "confirmed" // isBooked but no bookedBy = manually blocked or confirmed
  }

  function getSlotColor(status: string): string {
    switch (status) {
      case "available":
        return "bg-white border-2 border-gray-300"
      case "pending":
        return "bg-yellow-400 border-2 border-yellow-500"
      case "confirmed":
        return "bg-green-500 border-2 border-green-600 text-white"
      default:
        return "bg-gray-200"
    }
  }

  async function handleApprove(slotId: string) {
    setLoading(slotId)
    try {
      const res = await fetch(`/api/timeslots/${slotId}/approve`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("שגיאה")

      toast({
        title: "✓ התור אושר!",
        description: "התור סומן כירוק",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לאשר תור",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  async function handleReject(slotId: string) {
    setLoading(slotId)
    try {
      const res = await fetch(`/api/timeslots/${slotId}/reject`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("שגיאה")

      toast({
        title: "התור נדחה",
        description: "התור חזר להיות פנוי",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לדחות תור",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">אין תורים פתוחים כרגע</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(slotsByDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, dateSlots]) => (
          <div key={dateKey} className="space-y-3">
            <h3 className="text-lg font-semibold sticky top-0 bg-white py-2 border-b">
              {format(new Date(dateKey), "EEEE, d MMMM", { locale: he })}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {dateSlots.map((slot) => {
                const status = getSlotStatus(slot)
                return (
                  <div
                    key={slot.id}
                    className={`rounded-lg p-2 sm:p-3 ${getSlotColor(status)} transition-all shadow-sm`}
                  >
                    <div className="font-bold text-center text-base sm:text-lg mb-1 sm:mb-2">
                      {slot.startTime}
                    </div>
                    
                    {status === "pending" && slot.bookedBy && (
                      <div className="space-y-2">
                        <div className="text-xs space-y-1 bg-white/90 rounded p-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-semibold truncate">
                              {slot.bookedBy.fullName || slot.bookedBy.email}
                            </span>
                          </div>
                          {slot.bookedBy.phone && (
                            <div className="text-[10px]">📞 {slot.bookedBy.phone}</div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(slot.id)}
                            disabled={loading === slot.id}
                            className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(slot.id)}
                            disabled={loading === slot.id}
                            className="flex-1 h-8 text-xs"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {status === "confirmed" && (
                      <div className="text-xs text-center">מאושר</div>
                    )}

                    {status === "available" && (
                      <div className="text-xs text-center text-gray-500">פנוי</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
    </div>
  )
}

