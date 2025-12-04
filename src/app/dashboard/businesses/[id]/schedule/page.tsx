import { prisma } from "@/lib/db"
import { requireAuth, canManageBusiness } from "@/lib/roles"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScheduleManager } from "@/components/schedule-manager"

async function getBusiness(id: string) {
  return await prisma.business.findUnique({
    where: { id },
  })
}

export default async function SchedulePage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireAuth()
  const business = await getBusiness(params.id)

  if (!business) {
    redirect("/dashboard/businesses")
  }

  if (!canManageBusiness(user.role, business.ownerId, user.id)) {
    redirect("/dashboard/businesses")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ניהול תורים - {business.name}</h1>
        <p className="text-muted-foreground">פתח תורים זמינים ללקוחות</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פתיחת תורים</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleManager businessId={business.id} slotDuration={business.slotDuration} />
        </CardContent>
      </Card>
    </div>
  )
}

