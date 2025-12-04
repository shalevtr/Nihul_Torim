"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface WorkingHoursSectionProps {
  businessId: string
  workingHours?: string | null
}

const daysOfWeek = [
  { key: "sunday", label: "ראשון" },
  { key: "monday", label: "שני" },
  { key: "tuesday", label: "שלישי" },
  { key: "wednesday", label: "רביעי" },
  { key: "thursday", label: "חמישי" },
  { key: "friday", label: "שישי" },
  { key: "saturday", label: "שבת" },
]

export function WorkingHoursSection({ workingHours }: WorkingHoursSectionProps) {
  if (!workingHours) return null

  let hours: Record<string, string> = {}
  try {
    hours = JSON.parse(workingHours)
  } catch {
    return null
  }

  const hasAnyHours = Object.values(hours).some((h) => h && h !== "")
  if (!hasAnyHours) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="h-5 w-5" />
          שעות פעילות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {daysOfWeek.map((day) => {
            const dayHours = hours[day.key]
            return (
              <div
                key={day.key}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <span className="font-medium text-gray-700">{day.label}</span>
                <span className={dayHours ? "text-indigo-600 font-semibold" : "text-gray-400"}>
                  {dayHours || "סגור"}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

