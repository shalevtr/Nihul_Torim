import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ServiceManager } from "@/components/service-manager"

export default async function BusinessServicesPage({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/businesses/${params.id}/edit`}>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            מחירון - {business.name}
          </h1>
          <p className="text-gray-600">נהל את השירותים והמחירים שלך</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>שירותים</CardTitle>
          <CardDescription>
            הוסף ועדכן את השירותים שאתה מציע ללקוחות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceManager businessId={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}

