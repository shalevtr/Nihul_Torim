import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AppointmentsList } from "@/components/appointments-list"
import { MarkNotificationsRead } from "@/components/mark-notifications-read"

async function getOwnerAppointments(userId: string, userRole: string) {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  // Get businesses owned by user
  const businesses = await prisma.business.findMany({
    where: userRole === "ADMIN" ? {} : { ownerId: userId },
    select: { id: true },
  })

  const businessIds = businesses.map((b) => b.id)

  if (businessIds.length === 0) {
    return { active: [], archived: [] }
  }

  // Get all appointments for these businesses
  const allAppointments = await prisma.appointment.findMany({
    where: {
      businessId: { in: businessIds },
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      customer: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  })

  // Filter by actual end time
  const activeAppointments = allAppointments
    .filter((appointment) => {
      const endTime = new Date(appointment.endTime)
      return endTime >= oneHourAgo
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const archivedAppointments = allAppointments
    .filter((appointment) => {
      const endTime = new Date(appointment.endTime)
      return endTime < oneHourAgo
    })
    .slice(0, 50)

  return {
    active: activeAppointments,
    archived: archivedAppointments,
  }
}

export default async function OwnerAppointmentsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  if (user.role !== "BUSINESS_OWNER" && user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const { active, archived } = await getOwnerAppointments(user.id, user.role)

  return (
    <>
      <MarkNotificationsRead type="appointments" />
      <AppointmentsList activeAppointments={active} archivedAppointments={archived} />
    </>
  )
}

