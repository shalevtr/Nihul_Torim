"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle } from "lucide-react"
import { BlockCustomerDialog } from "@/components/block-customer-dialog"

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

interface AppointmentApprovalListProps {
  appointments: Appointment[]
  businessId: string
}

export function AppointmentApprovalList({ appointments: initialAppointments, businessId }: AppointmentApprovalListProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [appointments, setAppointments] = useState(initialAppointments)

  // Update appointments when prop changes
  useEffect(() => {
    setAppointments(initialAppointments)
  }, [initialAppointments])

  async function handleApprove(appointmentId: string) {
    setLoading(appointmentId)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "שגיאה באישור תור")
      }

      toast({
        title: "✓ התור אושר!",
        description: "הלקוח יראה את האישור ויקבל התראה",
      })

      // Remove the approved appointment from the list immediately
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId))

      // Refresh immediately to update the page
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

  async function handleReject(appointmentId: string) {
    setLoading(appointmentId)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "שגיאה בדחיית תור")
      }

      toast({
        title: "התור נדחה",
        description: "התור בוטל והלקוח יקבל התראה",
      })

      // Remove the rejected appointment from the list immediately
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId))

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

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="flex flex-col gap-3 rounded-lg border-2 border-yellow-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
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
            {appointment.notes && (
              <div className="text-sm text-gray-500 mt-1">
                💬 {appointment.notes}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleApprove(appointment.id)}
              disabled={loading === appointment.id}
              className="flex-1 bg-green-600 hover:bg-green-700 sm:flex-none"
            >
              <CheckCircle className="h-4 w-4 ml-1" />
              אשר
            </Button>
            <Button
              onClick={() => handleReject(appointment.id)}
              disabled={loading === appointment.id}
              variant="destructive"
              className="flex-1 sm:flex-none"
            >
              <XCircle className="h-4 w-4 ml-1" />
              דחה
            </Button>
            {appointment.customer && (appointment.customerId || appointment.customer.id) && (
              <BlockCustomerDialog
                businessId={businessId}
                customerId={appointment.customerId || appointment.customer.id || ""}
                customerName={appointment.customer.fullName || appointment.customer.email}
                onBlocked={() => router.refresh()}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

