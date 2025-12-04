"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
}

interface PublicServicesSectionProps {
  businessId: string
}

export function PublicServicesSection({ businessId }: PublicServicesSectionProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/businesses/${businessId}/services`)
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [businessId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>שירותים</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">טוען...</p>
        </CardContent>
      </Card>
    )
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>שירותים</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">אין שירותים זמינים כרגע</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>שירותים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-start justify-between gap-4 p-4 rounded-lg border-2 border-indigo-100 dark:border-indigo-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration} דקות</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}



