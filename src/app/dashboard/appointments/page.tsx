import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/roles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Archive, Calendar } from "lucide-react"
import { CancelAppointmentButton } from "@/components/cancel-appointment-button"
import { AppointmentsList } from "@/components/appointments-list"
import { MarkNotificationsRead } from "@/components/mark-notifications-read"

async function getCustomerAppointments(userId: string) {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago
  
  // Get ALL appointments first - include all statuses
  const allAppointments = await prisma.appointment.findMany({
    where: { 
      customerId: userId,
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  })

  // Filter by actual end time (date + time) - include all statuses
  const activeAppointments = allAppointments.filter((appointment) => {
    const endTime = new Date(appointment.endTime)
    return endTime >= oneHourAgo
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const archivedAppointments = allAppointments.filter((appointment) => {
    const endTime = new Date(appointment.endTime)
    return endTime < oneHourAgo
  }).slice(0, 50) // Limit archived to 50 most recent
  
  return {
    active: activeAppointments,
    archived: archivedAppointments,
  }
}

export default async function CustomerAppointmentsPage() {
  const user = await requireAuth()
  const { active, archived } = await getCustomerAppointments(user.id)

  return (
    <>
      <MarkNotificationsRead type="appointments" />
      <AppointmentsList activeAppointments={active} archivedAppointments={archived} />
    </>
  )
}
