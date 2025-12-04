"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2 } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
}

interface ServiceManagerProps {
  businessId: string
}

export function ServiceManager({ businessId }: ServiceManagerProps) {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [businessId])

  async function fetchServices() {
    try {
      const res = await fetch(`/api/services?businessId=${businessId}`)
      const data = await res.json()
      setServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      businessId,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || "",
      price: formData.get("price") as string,
      duration: formData.get("duration") as string,
    }

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "שגיאה")
      }

      toast({
        title: "✓ שירות נוסף בהצלחה!",
      })

      setShowForm(false)
      e.currentTarget.reset()
      await fetchServices()
    } catch (error: any) {
      console.error("Error adding service:", error)
      toast({
        title: "שגיאה",
        description: error.message || "לא ניתן להוסיף שירות. נסה שוב.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 ml-2" />
          הוסף שירות חדש
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם השירות *</Label>
            <Input id="name" name="name" required placeholder="לדוגמה: תספורת גברים" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור (אופציונלי)</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="פרטים נוספים על השירות"
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">מחיר (₪) *</Label>
              <Input 
                id="price" 
                name="price" 
                type="number" 
                required 
                min="0"
                step="0.01"
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">משך זמן (דקות) *</Label>
              <Input 
                id="duration" 
                name="duration" 
                type="number" 
                required 
                min="15"
                step="15"
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "שומר..." : "הוסף שירות"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              ביטול
            </Button>
          </div>
        </form>
      )}

      {services.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground py-8">
          אין שירותים עדיין. הוסף את השירות הראשון!
        </p>
      )}

      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-start justify-between rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
              )}
              <div className="flex gap-4 mt-2">
                <span className="text-sm text-gray-500">⏱ {service.duration} דקות</span>
                <span className="text-sm font-semibold text-indigo-600">₪{service.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

