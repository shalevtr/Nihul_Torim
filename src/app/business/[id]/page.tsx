import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BusinessGallery } from "@/components/business-gallery"
import { MessageForm } from "@/components/message-form"
import { Navbar } from "@/components/navbar"
import { AccessibilityPanel } from "@/components/accessibility-panel"
import { Toaster } from "@/components/ui/toaster"
import { FavoriteButton } from "@/components/favorite-button"
import { ShareButton } from "@/components/share-button"
import { ReviewSection } from "@/components/review-section"
import { ServicesSection } from "@/components/services-section"
import { WorkingHoursSection } from "@/components/working-hours-section"
import { BeforeAfterGallery } from "@/components/before-after-gallery"
import Link from "next/link"

async function getBusiness(id: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          fullName: true,
          // Don't expose owner email publicly
        },
      },
      images: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  return business
}

export default async function BusinessPage({
  params,
}: {
  params: { id: string }
}) {
  const business = await getBusiness(params.id)
  const user = await getCurrentUser()

  if (!business) {
    notFound()
  }

  const isOwner = user?.id === business.ownerId || user?.role === "ADMIN"

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold sm:text-4xl">{business.name}</h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                {business.category} {business.city && `• ${business.city}`}
              </p>
              {business.address && (
                <p className="text-muted-foreground">{business.address}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <FavoriteButton businessId={business.id} userId={user?.id} />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">מועדפים</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ShareButton businessId={business.id} businessName={business.name} />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">שתף</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 flex gap-3">
          <Button size="lg" asChild className="flex-1 sm:flex-none">
            <Link href={`/business/${business.id}/book`}>קבע תור</Link>
          </Button>
        </div>

        {business.logo && (
          <div className="mb-8 flex justify-center">
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg">
              <img
                src={business.logo}
                alt={business.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="mb-8">
          <BusinessGallery businessId={business.id} images={business.images} isOwner={isOwner} />
        </div>

        <div className="space-y-6">
          {/* Services and Working Hours */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ServicesSection businessId={business.id} isOwner={isOwner} />
            <WorkingHoursSection businessId={business.id} workingHours={business.workingHours} />
          </div>

          {/* Gallery */}
          {business.images && business.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>גלריה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {business.images.map((image: any) => (
                    <img
                      key={image.id}
                      src={image.url}
                      alt={image.caption || ""}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {business.description && (
            <Card>
              <CardHeader>
                <CardTitle>תיאור</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-base leading-relaxed">{business.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <ReviewSection 
            businessId={business.id} 
            userId={user?.id}
            isBusinessOwner={isOwner}
          />
        </div>
      </main>
      <Toaster />
      <AccessibilityPanel />
    </>
  )
}

