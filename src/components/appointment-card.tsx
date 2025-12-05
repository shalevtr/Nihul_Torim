"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { X } from "lucide-react"
import { CancelAppointmentButton } from "@/components/cancel-appointment-button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Appointment {
  id: string
  startTime: Date
  endTime: Date
  status: string
  notes: string | null
  business: {
    id: string
    name: string
    category: string
  }
}

interface AppointmentCardProps {
  appointment: Appointment
  onDismiss?: (id: string) => void
}

export function AppointmentCard({ appointment, onDismiss }: AppointmentCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isDismissing, setIsDismissing] = useState(false)

  async function handleDismiss() {
    if (!confirm("האם אתה בטוח שברצונך להעלים תור זה מהרשימה?")) {
      return
    }

    setIsDismissing(true)
    try {
      // Call API to mark as dismissed (we'll add a field for this)
      const res = await fetch(`/api/appointments/${appointment.id}/dismiss`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("שגיאה בהעלמת תור")

      toast({
        title: "התור הוסתר",
        description: "התור הוסתר מהרשימה",
      })

      if (onDismiss) {
        onDismiss(appointment.id)
      } else {
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להעלים תור",
        variant: "destructive",
      })
    } finally {
      setIsDismissing(false)
    }
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative border-2 hover:scale-[1.02] group">
      {/* Dismiss button for cancelled appointments */}
      {appointment.status === "CANCELLED" && (
        <button
          onClick={handleDismiss}
          disabled={isDismissing}
          className="absolute top-3 left-3 z-10 rounded-full bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 p-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
          title="העלם תור זה"
        >
          <X className="h-4 w-4 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" />
        </button>
      )}

      <div className={`h-2 ${
        appointment.status === "CONFIRMED"
          ? "bg-gradient-to-r from-green-500 to-emerald-500"
          : appointment.status === "CANCELLED"
          ? "bg-gradient-to-r from-red-500 to-rose-500"
          : "bg-gradient-to-r from-yellow-500 to-amber-500"
      }`} />
      <CardHeader className="pb-3 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
              {appointment.business.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-indigo-600 dark:text-indigo-400">📍</span>
              {appointment.business.category}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap flex-shrink-0 shadow-sm ${
              appointment.status === "CONFIRMED"
                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border border-green-200 dark:border-green-800"
                : appointment.status === "CANCELLED"
                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border border-red-200 dark:border-red-800"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800"
            }`}
          >
            {appointment.status === "CONFIRMED"
              ? "✓ מאושר"
              : appointment.status === "CANCELLED"
              ? "✗ בוטל"
              : "⏱ ממתין"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-4 border border-indigo-100 dark:border-indigo-800">
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl flex-shrink-0">
              📅
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base text-gray-900 dark:text-gray-100">
                {new Date(appointment.startTime).toLocaleDateString("he-IL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
              <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                ⏰ שעה {new Date(appointment.startTime).toLocaleTimeString("he-IL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
          
          {appointment.notes && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 border-r-4 border-indigo-300 dark:border-indigo-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                💬 {appointment.notes}
              </p>
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" asChild className="flex-1 gap-2">
              <Link href={`/b/${appointment.business.slug || appointment.business.id}`}>
                <span>👁️</span>
                צפה בעסק
              </Link>
            </Button>
            {appointment.status === "PENDING" && (
              <CancelAppointmentButton appointmentId={appointment.id} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

