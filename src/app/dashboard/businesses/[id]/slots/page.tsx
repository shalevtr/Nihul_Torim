import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SlotsManager } from "@/components/slots-manager"

async function getBusinessTimeSlots(businessId: string) {
  const slots = await prisma.timeSlot.findMany({
    where: {
      businessId,
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
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
    orderBy: [
      { date: "asc" },
      { startTime: "asc" },
    ],
  })

  return slots
}

export default async function BusinessSlotsPage({
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

  const timeSlots = await getBusinessTimeSlots(params.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/businesses`}>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            ניהול תורים - {business.name}
          </h1>
          <p className="text-gray-600">כל התורים הפתוחים והתפוסים</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/businesses/${params.id}/schedule`}>
            פתח תורים חדשים
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>תורים פתוחים</CardTitle>
          <div className="text-sm text-muted-foreground">
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white border-2 border-gray-300"></div>
                פנוי
              </span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-400"></div>
                ממתין לאישור
              </span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                תפוס/מאושר
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SlotsManager slots={timeSlots as any} businessId={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}

