"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Archive, Calendar } from "lucide-react"
import { AppointmentCard } from "@/components/appointment-card"
import { useToast } from "@/hooks/use-toast"

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

interface AppointmentsListProps {
  activeAppointments: Appointment[]
  archivedAppointments: Appointment[]
}

export function AppointmentsList({ activeAppointments: initialActive, archivedAppointments }: AppointmentsListProps) {
  const [showArchived, setShowArchived] = useState(false)
  const [appointments, setAppointments] = useState(initialActive)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            התורים שלי
          </h1>
          <p className="text-muted-foreground mt-1">צפה וניהול את התורים שלך</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard/search">
            <Calendar className="h-4 w-4" />
            קבע תור חדש
          </Link>
        </Button>
      </div>

      {/* Active Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            תורים פעילים
            <span className="ml-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {visibleAppointments.length}
            </span>
          </h2>
        </div>

        {visibleAppointments.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                אין תורים פעילים כרגע
              </h3>
              <p className="mb-6 text-muted-foreground">
                קבע תור חדש כדי להתחיל
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link href="/dashboard/search">
                  <Calendar className="h-4 w-4" />
                  חפש עסקים
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                  <Archive className="h-5 w-5" />
                  ארכיון תורים
                  <span className="ml-2 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium">
                    {archivedAppointments.length}
                  </span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowArchived(!showArchived)}
                  className="gap-2"
                >
                  <Archive className="h-4 w-4" />
                  {showArchived ? "הסתר" : "הצג"}
                </Button>
              </div>

              {showArchived && (
                <div className="p-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-75">
                    {archivedAppointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

