import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { BusinessForm } from "@/components/business-form"

async function getBusiness(id: string) {
  return await prisma.business.findUnique({
    where: { id },
  })
}

export default async function OwnerEditBusinessPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const business = await getBusiness(params.id)

  if (!business) {
    redirect("/owner/businesses")
  }

  if (!canManageBusiness(user.role, business.ownerId, user.id)) {
    redirect("/owner/businesses")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ערוך עסק</h1>
        <p className="text-muted-foreground">ערוך את פרטי העסק</p>
      </div>
      <BusinessForm business={business} />
    </div>
  )
}



