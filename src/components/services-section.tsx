"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scissors } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
}

interface ServicesSectionProps {
  businessId: string
  isOwner?: boolean
}

export function ServicesSection({ businessId, isOwner = false }: ServicesSectionProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  // Only show to business owners, not to customers
  if (!isOwner) return null
  
  if (loading || services.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Scissors className="h-5 w-5" />
          מחירון
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-start justify-between rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-base">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{service.duration} דקות</p>
              </div>
              <div className="mr-4 text-left">
                <div className="text-xl font-bold text-indigo-600">₪{service.price}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

