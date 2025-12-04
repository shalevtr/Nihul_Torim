import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarView } from "@/components/calendar-view"

async function getAppointmentsForOwner(userId: string, userRole: string) {
  const businesses = await prisma.business.findMany({
    where: userRole === "ADMIN" ? {} : { ownerId: userId },
    select: { id: true },
  })

  const businessIds = businesses.map((b) => b.id)

  if (businessIds.length === 0) {
    return []
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      businessId: { in: businessIds },
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
      business: {
        select: {
          name: true,
          category: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  })

  // Convert appointments to slot format for CalendarView
  return appointments.map((apt) => ({
    id: apt.id,
    date: apt.startTime,
    startTime: apt.startTime.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
    endTime: apt.endTime.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
    isBooked: true,
    bookedBy: apt.customer,
    business: apt.business,
  }))
}

export default async function OwnerCalendarPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  if (user.role !== "BUSINESS_OWNER" && user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const appointments = await getAppointmentsForOwner(user.id, user.role)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">יומן תורים</h1>
        <p className="text-muted-foreground">תצוגת יומן של כל התורים</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>לוח שנה</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarView bookedSlots={appointments as any} />
        </CardContent>
      </Card>
    </div>
  )
}



