import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, Users, DollarSign, Clock } from "lucide-react"
import { subscriptionPlans } from "@/lib/subscription"

async function getBusinessStats(id: string, userId: string, userRole: string) {
  const business = await prisma.business.findUnique({
    where: { id },
  })

  if (!business) return null
  if (!canManageBusiness(userRole, business.ownerId, userId)) return null

  // Check if user has statistics permission (Premium only)
  const plan = subscriptionPlans[business.subscriptionPlan]
  if (!plan.canUseStats) {
    return { business, noAccess: true }
  }

  // Get stats for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [appointments, allAppointments, reviews] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        businessId: id,
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        customer: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.appointment.findMany({
      where: { businessId: id },
      select: {
        customerId: true,
      },
    }),
    prisma.review.findMany({
      where: { businessId: id },
      select: {
        rating: true,
      },
    }),
  ])

  // Calculate statistics
  const totalAppointments = appointments.length
  const confirmedAppointments = appointments.filter((a) => a.status === "CONFIRMED").length
  const cancelledAppointments = appointments.filter((a) => a.status === "CANCELLED").length

  // Unique customers this month
  const uniqueCustomers = new Set(appointments.map((a) => a.customerId).filter(Boolean)).size

  // Returning customers (had more than one appointment ever)
  const customerCounts = new Map<string, number>()
  allAppointments.forEach((apt) => {
    if (apt.customerId) {
      customerCounts.set(apt.customerId, (customerCounts.get(apt.customerId) || 0) + 1)
    }
  })
  const returningCustomers = Array.from(customerCounts.values()).filter((count) => count > 1).length
  const newCustomers = uniqueCustomers - returningCustomers

  // Average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0"

  // Appointments by hour (peak hours)
  const hourCounts = new Map<number, number>()
  appointments.forEach((apt) => {
    const hour = new Date(apt.startTime).getHours()
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
  })
  const peakHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]

  // Appointments by day of week
  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]
  const dayCounts = new Map<number, number>()
  appointments.forEach((apt) => {
    const day = new Date(apt.startTime).getDay()
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
  })
  const busiestDay = Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0]

  return {
    business,
    stats: {
      totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      uniqueCustomers,
      newCustomers,
      returningCustomers,
      avgRating,
      peakHour: peakHour ? `${peakHour[0]}:00 - ${peakHour[0] + 1}:00 (${peakHour[1]} תורים)` : "אין נתונים",
      busiestDay: busiestDay ? `יום ${dayNames[busiestDay[0]]} (${busiestDay[1]} תורים)` : "אין נתונים",
    },
  }
}

export default async function OwnerStatisticsPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const data = await getBusinessStats(params.id, user.id, user.role)
  if (!data) notFound()

  if (data.noAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            סטטיסטיקות - {data.business.name}
          </h1>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">גישה למסלול Premium בלבד</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              סטטיסטיקות ודוחות זמינים רק למנויי Premium
            </p>
            <p className="text-sm text-gray-500">
              פנה לאדמין להעלאת המסלול שלך
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { business, stats } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          סטטיסטיקות - {business.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">נתונים מ-30 הימים האחרונים</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              סה"כ תורים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats!.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {stats!.confirmedAppointments} מאושרים • {stats!.cancelledAppointments} בוטלו
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              לקוחות ייחודיים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats!.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {stats!.newCustomers} חדשים • {stats!.returningCustomers} חוזרים
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              דירוג ממוצע
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats!.avgRating} ⭐</div>
            <p className="text-xs text-muted-foreground">מכל הביקורות</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              שעת שיא
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stats!.peakHour}</div>
            <p className="text-xs text-muted-foreground">הכי עמוס</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              יום עמוס
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stats!.busiestDay}</div>
            <p className="text-xs text-muted-foreground">הכי פופולרי</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              אחוז אישור
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats!.totalAppointments > 0
                ? Math.round((stats!.confirmedAppointments / stats!.totalAppointments) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">תורים מאושרים</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



