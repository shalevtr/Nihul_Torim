"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Archive, Calendar } from "lucide-react"
import { AppointmentCard } from "@/components/appointment-card"
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

interface AppointmentsListWithNotificationsProps {
  activeAppointments: Appointment[]
  archivedAppointments: Appointment[]
}

export function AppointmentsListWithNotifications({ 
  activeAppointments: initialActive, 
  archivedAppointments 
}: AppointmentsListWithNotificationsProps) {
  const [showArchived, setShowArchived] = useState(false)
  const [appointments, setAppointments] = useState(initialActive)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const router = useRouter()

  // Filter out dismissed appointments
  const visibleAppointments = appointments.filter((apt) => !dismissedIds.has(apt.id))

  // Poll for appointment updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/appointments")
        if (res.ok) {
          const data = await res.json()
          const updatedAppointments = data.map((apt: any) => ({
            ...apt,
            startTime: new Date(apt.startTime),
            endTime: new Date(apt.endTime),
          }))

          // Check for status changes and show toast notifications
          updatedAppointments.forEach((updated: Appointment) => {
            const old = appointments.find((a) => a.id === updated.id)
            if (old && old.status !== updated.status) {
              if (updated.status === "CONFIRMED") {
                toast({
                  title: "🎉 התור שלך אושר!",
                  description: `התור ב-${updated.business.name} אושר בהצלחה`,
                  duration: 5000,
                  className: "bg-green-50 border-green-200",
                })
              } else if (updated.status === "CANCELLED") {
                toast({
                  title: "⚠️ התור בוטל",
                  description: `התור ב-${updated.business.name} בוטל`,
                  variant: "destructive",
                  duration: 5000,
                })
              }
            }
          })

          // Filter active appointments (not archived)
          const now = new Date()
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
          const active = updatedAppointments.filter((apt: Appointment) => {
            const endTime = new Date(apt.endTime)
            return endTime >= oneHourAgo
          }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

          setAppointments(active)
        }
      } catch (error) {
        console.error("Error polling appointments:", error)
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [appointments, toast])

  function handleDismiss(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">התורים שלי</h1>
        <p className="text-muted-foreground">צפה וניהול את התורים שלך</p>
      </div>

      {/* Active Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            תורים פעילים ({visibleAppointments.length})
          </h2>
        </div>

        {visibleAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">אין לך תורים פעילים כרגע</p>
              <Button asChild>
                <Link href="/dashboard/search">חפש עסקים</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {visibleAppointments.map((appointment) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        )}
      </div>

      {/* Archived Appointments */}
      {archivedAppointments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Archive className="h-5 w-5" />
              ארכיון תורים ({archivedAppointments.length})
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              {showArchived ? "הסתר ארכיון" : "הצג ארכיון"}
            </Button>
          </div>

          {showArchived && (
            <div className="grid gap-4 opacity-75">
              {archivedAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}



