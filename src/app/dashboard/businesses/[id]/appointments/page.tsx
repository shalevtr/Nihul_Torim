import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { BusinessAppointmentsWithNotifications } from "@/components/business-appointments-with-notifications"

async function getBusinessAppointments(businessId: string) {
  // Get all appointments (not just slots) - this includes all statuses
  const appointments = await prisma.appointment.findMany({
    where: {
      businessId,
      startTime: {
        gte: new Date(), // Only future appointments
      },
    },
    include: {
      customer: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
      service: {
        select: {
          name: true,
          duration: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  })

  return appointments
}

async function getPendingAppointments(businessId: string) {
  const appointments = await prisma.appointment.findMany({
    where: {
      businessId,
      status: "PENDING",
      startTime: {
        gte: new Date(),
      },
    },
    include: {
      customer: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  })

  return appointments
}

export default async function BusinessAppointmentsPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const business = await prisma.business.findUnique({
    where: { id: params.id },
  })

  if (!business || !canManageBusiness(user.role, business.ownerId, user.id)) {
    redirect("/dashboard")
  }

  const appointments = await getBusinessAppointments(params.id)
  const pendingAppointments = await getPendingAppointments(params.id)

  return (
    <BusinessAppointmentsWithNotifications
      businessId={params.id}
      businessName={business.name}
      appointments={appointments}
      pendingAppointments={pendingAppointments}
    />
  )
}
