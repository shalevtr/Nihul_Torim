"use client"

"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns"
import { he } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Lock, Unlock, MoreVertical } from "lucide-react"

interface BookedSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
  bookedBy: {
    fullName: string | null
    email: string
    phone: string | null
  } | null
}

interface CalendarViewProps {
  bookedSlots: BookedSlot[]
}

function CalendarSlot({ slot }: { slot: BookedSlot }) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isBlocked = !slot.bookedBy
  
  async function handleBlock() {
    setLoading(true)
    try {
      const res = await fetch(`/api/timeslots/${slot.id}/block`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("שגיאה")

      toast({
        title: "✓ התור נחסם",
        description: "לא יהיה ניתן לקבוע תור זה",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לחסום תור",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleUnblock() {
    setLoading(true)
    try {
      const res = await fetch(`/api/timeslots/${slot.id}/block`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("שגיאה")

      toast({
        title: "✓ התור שוחרר",
        description: "ניתן לקבוע תור זה",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשחרר תור",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={`rounded p-1 text-xs cursor-pointer transition-all hover:scale-105 ${
            isBlocked
              ? "bg-gray-400 text-white"
              : "bg-indigo-600 text-white"
          }`}
          title={
            isBlocked
              ? "חסום ע\"י בעל העסק"
              : `${slot.bookedBy?.fullName || slot.bookedBy?.email}\n${slot.bookedBy?.phone || ""}`
          }
        >
          <div className="font-semibold flex items-center justify-between">
            <span>{slot.startTime}</span>
            <MoreVertical className="h-3 w-3" />
          </div>
          {isBlocked ? (
            <div className="text-[10px] flex items-center gap-1">
              <Lock className="h-2 w-2" />
              חסום
            </div>
          ) : (
            <>
              <div className="truncate text-[10px]">
                {slot.bookedBy?.fullName || slot.bookedBy?.email}
              </div>
              {slot.bookedBy?.phone && (
                <div className="text-[10px]">{slot.bookedBy.phone}</div>
              )}
            </>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isBlocked ? (
          <DropdownMenuItem onClick={handleUnblock} disabled={loading}>
            <Unlock className="ml-2 h-4 w-4" />
            שחרר תור
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleBlock} disabled={loading}>
            <Lock className="ml-2 h-4 w-4" />
            חסום תור
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CalendarView({ bookedSlots }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getSlotsForDay = (day: Date) => {
    return bookedSlots.filter((slot) => isSameDay(new Date(slot.date), day))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Button
          className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-6 text-base font-semibold"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          חודש קודם
        </Button>
        <h2 className="text-2xl font-bold">
          {format(currentMonth, "MMMM yyyy", { locale: he })}
        </h2>
        <Button
          className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-6 text-base font-semibold"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          חודש הבא
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"].map((day) => (
          <div key={day} className="p-2 text-center font-semibold text-sm">
            {day}
          </div>
        ))}

        {/* Days */}
        {daysInMonth.map((day) => {
          const daySlots = getSlotsForDay(day)
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={day.toISOString()}
              className={`min-h-24 rounded-lg border p-2 ${
                isToday ? "border-indigo-600 bg-indigo-50" : "border-gray-200"
              }`}
            >
              <div className="mb-1 text-sm font-semibold">
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {daySlots.map((slot) => (
                  <CalendarSlot key={slot.id} slot={slot} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 text-sm text-muted-foreground">
        <p>סה"כ {bookedSlots.length} תורים קבועים</p>
      </div>
    </div>
  )
}

