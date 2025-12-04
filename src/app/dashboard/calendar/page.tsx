import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarView } from "@/components/calendar-view"
import { format } from "date-fns"

async function getAppointmentsForUser(userId: string, userRole: string) {
  if (userRole === "BUSINESS_OWNER" || userRole === "ADMIN") {
    // Business owner sees all their businesses' appointments
    const businesses = await prisma.business.findMany({
      where: userRole === "ADMIN" ? {} : { ownerId: userId },
      select: { id: true },
    })

    const businessIds = businesses.map((b) => b.id)

    const slots = await prisma.timeSlot.findMany({
      where: {
        businessId: { in: businessIds },
        isBooked: true,
      },
      include: {
        bookedBy: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    return slots
  } else {
    // Customer sees their own appointments
    const slots = await prisma.timeSlot.findMany({
      where: {
        bookedById: userId,
        isBooked: true,
      },
      include: {
        bookedBy: {
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
        date: "asc",
      },
    })

    return slots
  }
}

export default async function CalendarPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const appointments = await getAppointmentsForUser(user.id, user.role)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">יומן תורים</h1>
        <p className="text-gray-600">
          {user.role === "CUSTOMER"
            ? "כל התורים שלך"
            : "כל התורים של העסקים שלך"}
        </p>
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

