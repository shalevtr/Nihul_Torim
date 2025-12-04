"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface AppointmentWidgetProps {
  businessId: string
}

export function AppointmentWidget({ businessId }: AppointmentWidgetProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!user) {
      router.push(`/auth/login?callbackUrl=/business/${businessId}`)
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const notes = formData.get("notes") as string

    const startTime = new Date(`${date}T${time}`)
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          notes,
        }),
      })

      if (!res.ok) throw new Error("שגיאה בקביעת תור")

      toast({
        title: "הצלחה",
        description: "התור נשלח וממתין לאישור",
      })

      e.currentTarget.reset()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לקבוע תור",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">תאריך</Label>
        <Input id="date" name="date" type="date" required min={minDate} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time">שעה</Label>
        <Input id="time" name="time" type="time" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">הערות (אופציונלי)</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "קובע תור..." : "קבע תור"}
      </Button>
    </form>
  )
}

