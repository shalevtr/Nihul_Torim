"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Scissors } from "lucide-react"

interface Service {
  id: string
  name: string
  duration: number
}

interface ScheduleManagerProps {
  businessId: string
  slotDuration: number
}

export function ScheduleManager({ businessId, slotDuration }: ScheduleManagerProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>("none")
  const [useServiceDuration, setUseServiceDuration] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [businessId])

  async function fetchServices() {
    try {
      const res = await fetch(`/api/services?businessId=${businessId}`)
      const data = await res.json()
      setServices(data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const date = formData.get("date") as string
    const startHour = formData.get("startHour") as string
    const endHour = formData.get("endHour") as string
    
    // Use service duration if selected, otherwise use manual duration
    let duration = slotDuration
    const actualServiceId = selectedService === "none" ? "" : selectedService
    if (useServiceDuration && actualServiceId) {
      const service = services.find((s) => s.id === actualServiceId)
      if (service) {
        duration = service.duration
      }
    } else {
      duration = parseInt(formData.get("duration") as string)
    }

    try {
      const res = await fetch("/api/timeslots/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          businessId,
          date,
          startHour,
          endHour,
          slotDuration: duration,
          serviceId: actualServiceId || undefined,
        }),
      })

      if (!res.ok) throw new Error("שגיאה ביצירת תורים")

      const data = await res.json()

      toast({
        title: "הצלחה",
        description: `נוצרו ${data.count} תורים`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור תורים",
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border border-indigo-200">
        <p className="text-sm text-indigo-900">
          <strong>💡 טיפ:</strong> אתה יכול לפתוח תורים לפי שירות ספציפי או תורים כלליים. 
          אם תבחר שירות, התורים ייווצרו לפי משך הזמן של השירות.
        </p>
      </div>

      {/* Service Selection */}
      {services.length > 0 && (
        <div className="space-y-4 rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-indigo-600" />
            <Label className="text-base font-semibold">פתח תורים לפי שירות (אופציונלי)</Label>
          </div>
          <Select 
            value={selectedService} 
            onValueChange={(value) => {
              setSelectedService(value === "none" ? "" : value)
              if (value && value !== "none") {
                setUseServiceDuration(true)
              } else {
                setUseServiceDuration(false)
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="בחר שירות או השאר ריק לתורים כלליים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">תורים כלליים</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} ({service.duration} דקות)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedService && selectedService !== "none" && (
            <div className="rounded-md bg-indigo-50 p-3">
              <p className="text-sm text-indigo-900">
                ✓ התורים ייווצרו לפי משך השירות: <strong>{services.find(s => s.id === selectedService)?.duration} דקות</strong>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-base font-semibold">תאריך</Label>
          <Input 
            id="date" 
            name="date" 
            type="date" 
            required 
            min={minDate}
            className="text-lg py-6"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startHour" className="text-base font-semibold">שעת התחלה</Label>
            <Input 
              id="startHour" 
              name="startHour" 
              type="time" 
              required 
              className="text-lg py-6"
              defaultValue="08:00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endHour" className="text-base font-semibold">שעת סיום</Label>
            <Input 
              id="endHour" 
              name="endHour" 
              type="time" 
              required 
              className="text-lg py-6"
              defaultValue="14:00"
            />
          </div>
        </div>

        {!useServiceDuration && (
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-base font-semibold">משך כל תור (דקות)</Label>
            <Input 
              id="duration" 
              name="duration" 
              type="number" 
              required 
              min="15"
              max="240"
              step="15"
              defaultValue={slotDuration}
              className="text-lg py-6"
            />
            <p className="text-xs text-muted-foreground">לדוגמה: 30 דקות, 45 דקות, 60 דקות</p>
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full py-6 text-lg">
        {loading ? "יוצר תורים..." : "צור תורים"}
      </Button>
    </form>
  )
}

