import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BusinessGallery } from "@/components/business-gallery"
import { PublicShareButton } from "@/components/public-share-button"
import { ReviewSection } from "@/components/review-section"
import { PublicServicesSection } from "@/components/public-services-section"
import { WorkingHoursSection } from "@/components/working-hours-section"
import { BeforeAfterGallery } from "@/components/before-after-gallery"
import { PublicNavbar } from "@/components/public-navbar"
import { AccessibilityPanel } from "@/components/accessibility-panel"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { Phone, MapPin, Clock } from "lucide-react"
import { Metadata } from "next"

// Enable caching for public pages, but allow dynamic rendering if DB fails
export const revalidate = 300 // 5 minutes
export const dynamic = 'force-dynamic' // Allow DB calls at runtime

async function getBusiness(idOrSlug: string) {
  const business = await prisma.business.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug }
      ]
    },
    include: {
      images: {
        orderBy: {
          createdAt: "desc",
        },
      },
      workingHours: true,
    },
  })

  return business
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const business = await getBusiness(params.id)

  if (!business) {
    return {
      title: 'עסק לא נמצא',
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const businessUrl = `${baseUrl}/b/${business.slug || business.id}`
  const description = business.description || `קביעת תורים ב-${business.name}${business.city ? ` ב-${business.city}` : ''}`

  return {
    title: `${business.name} - קביעת תורים`,
    description,
    openGraph: {
      title: business.name,
      description,
      url: businessUrl,
      siteName: 'ש.ש ניהול תורים',
      images: business.logo ? [business.logo] : [],
      locale: 'he_IL',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: business.name,
      description,
      images: business.logo ? [business.logo] : [],
    },
    alternates: {
      canonical: businessUrl,
    },
  }
}

export default async function PublicBusinessPage({
  params,
}: {
  params: { id: string }
}) {
  const business = await getBusiness(params.id)

  if (!business) {
    notFound()
  }

  return (
    <>
      <PublicNavbar />
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold sm:text-4xl">{business.name}</h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                {business.category} {business.city && `• ${business.city}`}
              </p>
              {business.address && (
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  <p>{business.address}</p>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${business.phone}`} className="hover:text-indigo-600">
                    {business.phone}
                  </a>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <PublicShareButton businessId={business.id} businessName={business.name} />
            </div>
          </div>
        </div>

        <div className="mb-8 flex gap-3">
          <Button size="lg" asChild className="flex-1 sm:flex-none">
            <Link href={`/b/${business.slug || business.id}/book`}>קבע תור</Link>
          </Button>
          {business.phone && (
            <Button size="lg" variant="outline" asChild>
              <a href={`tel:${business.phone}`}>
                <Phone className="h-4 w-4 ml-2" />
                התקשר
              </a>
            </Button>
          )}
          {business.phone && (
            <Button size="lg" variant="outline" asChild>
              <a href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
          )}
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
          <BusinessGallery businessId={business.id} images={business.images} isOwner={false} />
        </div>

        <div className="space-y-6">
          {/* Services and Working Hours */}
          <div className="grid gap-6 lg:grid-cols-2">
            <PublicServicesSection businessId={business.id} />
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
            userId={undefined}
            isBusinessOwner={false}
          />
        </div>
      </main>
      <Toaster />
      <AccessibilityPanel />
    </>
  )
}

