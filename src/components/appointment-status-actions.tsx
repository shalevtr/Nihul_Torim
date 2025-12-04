"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface AppointmentStatusActionsProps {
  appointmentId: string
  currentStatus: string
}

export function AppointmentStatusActions({
  appointmentId,
  currentStatus,
}: AppointmentStatusActionsProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(status: string) {
    setLoading(true)

    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error("שגיאה בעדכון סטטוס")

      toast({
        title: "הצלחה",
        description: "הסטטוס עודכן בהצלחה",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן סטטוס",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={loading}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">ממתין</SelectItem>
        <SelectItem value="CONFIRMED">מאושר</SelectItem>
        <SelectItem value="CANCELLED">בוטל</SelectItem>
      </SelectContent>
    </Select>
  )
}

