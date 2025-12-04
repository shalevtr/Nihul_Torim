"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Bell, XCircle, Trash2 } from "lucide-react"
import { CalendarView } from "@/components/calendar-view"
import { AppointmentApprovalList } from "@/components/appointment-approval-list"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Appointment {
  id: string
  startTime: Date
  endTime: Date
  notes: string | null
  customerId?: string
  customer: {
    id?: string
    fullName: string | null
    email: string
    phone: string | null
  } | null
}

interface BusinessAppointmentsWithNotificationsProps {
  businessId: string
  businessName: string
  appointments: any[]
  pendingAppointments: Appointment[]
}

export function BusinessAppointmentsWithNotifications({
  businessId,
  businessName,
  appointments: initialAppointments,
  pendingAppointments: initialPending,
}: BusinessAppointmentsWithNotificationsProps) {
  const [pendingAppointments, setPendingAppointments] = useState(initialPending)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [clearingHistory, setClearingHistory] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Mark all notifications for this business as read when entering the page (like chat)
  useEffect(() => {
    async function markBusinessNotificationsAsRead() {
      try {
        await fetch("/api/notifications/mark-business-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId }),
        })
        // Refresh notifications count in sidebar
        window.dispatchEvent(new CustomEvent("notifications-updated"))
      } catch (error) {
        console.error("Error marking notifications as read:", error)
      }
    }

    markBusinessNotificationsAsRead()
  }, [businessId])

  // Update appointments when prop changes
  useEffect(() => {
    setPendingAppointments(initialPending)
    setAppointments(initialAppointments)
  }, [initialPending, initialAppointments])

  async function handleOwnerCancel(appointmentId: string) {
    setCancellingId(appointmentId)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/owner-cancel`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "שגיאה בביטול תור")
      }

      toast({
        title: "✓ התור בוטל",
        description: "התור בוטל והתור שוחרר לזמינות",
      })

      // Remove from list
      setAppointments((prev) => prev.filter((apt: any) => apt.id !== appointmentId))
      router.refresh()
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "לא ניתן לבטל תור",
        variant: "destructive",
      })
    } finally {
      setCancellingId(null)
    }
  }

  async function handleClearHistory() {
    setClearingHistory(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/appointments/clear-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ olderThanDays: 30 }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "שגיאה בניקוי היסטוריה")
      }

      toast({
        title: "✓ היסטוריה נוקתה",
        description: `נוקו ${data.clearedCount || 0} תורים ישנים`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "לא ניתן לנקות היסטוריה",
        variant: "destructive",
      })
    } finally {
      setClearingHistory(false)
    }
  }

  // Poll for new pending appointments every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/businesses/${businessId}/appointments/pending`)
        if (res.ok) {
          const data = await res.json()
          const newPending = data.map((apt: any) => ({
            ...apt,
            startTime: new Date(apt.startTime),
            endTime: new Date(apt.endTime),
          }))

          // Check for new appointments
          const currentIds = new Set(pendingAppointments.map(apt => apt.id))
          const newIds = new Set(newPending.map((apt: any) => apt.id))
          const newCount = newPending.length - pendingAppointments.length

          if (newCount > 0) {
            toast({
              title: "🔔 תור חדש!",
              description: `יש לך ${newCount} תור${newCount > 1 ? 'ים' : ''} חדש${newCount > 1 ? 'ים' : ''} שממתין${newCount > 1 ? 'ים' : ''} לאישור`,
              duration: 5000,
              className: "bg-yellow-50 border-yellow-200",
            })
          }

          setPendingAppointments(newPending)
        }
      } catch (error) {
        console.error("Error polling pending appointments:", error)
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [businessId, pendingAppointments, toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/businesses/${businessId}/edit`}>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            יומן תורים - {businessName}
          </h1>
          <p className="text-gray-600">כל התורים הקבועים שלך</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/businesses/${businessId}/schedule`}>
            פתח תורים חדשים
          </Link>
        </Button>
      </div>

      {pendingAppointments.length > 0 && (
        <Card className="border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-200">
              <Bell className="h-5 w-5 animate-bounce" />
              ממתינים לאישור ({pendingAppointments.length})
            </CardTitle>
            <CardDescription className="text-yellow-800 dark:text-yellow-300">
              יש לך תורים חדשים שממתינים לאישור!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentApprovalList appointments={pendingAppointments} businessId={businessId} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>כל התורים</CardTitle>
              <CardDescription>תצוגת תורים לפי תאריך</CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  נקה היסטוריה
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ניקוי היסטוריית תורים</AlertDialogTitle>
                  <AlertDialogDescription>
                    פעולה זו תמחק תורים בוטלים בני יותר מ-30 יום. האם אתה בטוח?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearHistory}
                    disabled={clearingHistory}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {clearingHistory ? "מנקה..." : "נקה"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">אין תורים קבועים כרגע</p>
            ) : (
              appointments.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className={`p-4 rounded-lg border-2 ${
                    appointment.status === "CONFIRMED"
                      ? "border-green-300 bg-green-50"
                      : appointment.status === "CANCELLED"
                      ? "border-red-300 bg-red-50"
                      : "border-yellow-300 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {appointment.customer?.fullName || "לקוח"}
                      </div>
                      {appointment.customer?.phone && (
                        <div className="text-sm text-gray-600">
                          📞 {appointment.customer.phone}
                        </div>
                      )}
                      {appointment.customer?.email && (
                        <div className="text-xs text-gray-500">
                          ✉️ {appointment.customer.email}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 mt-1">
                        📅 {new Date(appointment.startTime).toLocaleString("he-IL", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {appointment.service && (
                        <div className="text-sm text-gray-600 mt-1">
                          ✂️ {appointment.service.name} ({appointment.service.duration} דקות)
                        </div>
                      )}
                      {appointment.notes && (
                        <div className="text-sm text-gray-500 mt-1">
                          💬 {appointment.notes}
                        </div>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        appointment.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status === "CONFIRMED"
                        ? "✓ מאושר"
                        : appointment.status === "CANCELLED"
                        ? "✗ בוטל"
                        : "⏱ ממתין לאישור"}
                    </span>
                  </div>
                  {/* Owner actions */}
                  {appointment.status !== "CANCELLED" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOwnerCancel(appointment.id)}
                        disabled={cancellingId === appointment.id}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        {cancellingId === appointment.id ? "מבטל..." : "בטל תור"}
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

