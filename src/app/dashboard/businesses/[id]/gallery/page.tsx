import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { GalleryManager } from "@/components/gallery-manager"

async function getBusinessImages(businessId: string) {
  const images = await prisma.businessImage.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  })

  return images
}

export default async function BusinessGalleryPage({
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

  const images = await getBusinessImages(params.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/businesses`}>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            גלריה - {business.name}
          </h1>
          <p className="text-gray-600">נהל את התמונות שלך</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>תמונות</CardTitle>
          <CardDescription>
            העלה תמונות מהמחשבר שלך להצגה בעמוד העסק
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GalleryManager businessId={params.id} images={images} />
        </CardContent>
      </Card>
    </div>
  )
}

