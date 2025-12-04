import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Building2, Edit, Calendar, Scissors, Image as ImageIcon, Settings, BarChart3 } from "lucide-react"

async function getBusinesses(userId: string, userRole: string) {
  if (userRole === "ADMIN") {
    return await prisma.business.findMany({
      include: {
        owner: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            services: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  return await prisma.business.findMany({
    where: { ownerId: userId },
    include: {
      _count: {
        select: {
          appointments: true,
          services: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export default async function OwnerBusinessesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  if (user.role !== "BUSINESS_OWNER" && user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const businesses = await getBusinesses(user.id, user.role)

  // If user has exactly one business, redirect to its management page
  if (businesses.length === 1) {
    redirect(`/owner/businesses/${businesses[0].id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">העסקים שלי</h1>
          <p className="text-muted-foreground">נהל את העסקים שלך</p>
        </div>
        <Button asChild>
          <Link href="/owner/businesses/new">
            <Plus className="h-4 w-4 ml-2" />
            עסק חדש
          </Link>
        </Button>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">אין לך עסקים עדיין</h3>
            <p className="text-muted-foreground mb-6">
              צור עסק חדש כדי להתחיל לנהל תורים
            </p>
            <Button asChild>
              <Link href="/owner/businesses/new">צור עסק חדש</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Card key={business.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{business.name}</CardTitle>
                    <CardDescription>
                      {business.category} {business.city && `• ${business.city}`}
                    </CardDescription>
                  </div>
                  {business.logo && (
                    <img
                      src={business.logo}
                      alt={business.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-indigo-200"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{business._count.appointments} תורים</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Scissors className="h-4 w-4" />
                      <span>{business._count.services} שירותים</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={`/owner/businesses/${business.id}`}>
                        <Edit className="h-4 w-4 ml-1" />
                        ניהול
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={`/owner/businesses/${business.id}/appointments`}>
                        <Calendar className="h-4 w-4 ml-1" />
                        תורים
                      </Link>
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild className="flex-1">
                      <Link href={`/owner/businesses/${business.id}/services`}>
                        <Scissors className="h-4 w-4 ml-1" />
                        מחירון
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="flex-1">
                      <Link href={`/owner/businesses/${business.id}/gallery`}>
                        <ImageIcon className="h-4 w-4 ml-1" />
                        גלריה
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="flex-1">
                      <Link href={`/owner/businesses/${business.id}/statistics`}>
                        <BarChart3 className="h-4 w-4 ml-1" />
                        סטטיסטיקות
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="flex-1">
                      <Link href={`/owner/businesses/${business.id}/settings`}>
                        <Settings className="h-4 w-4 ml-1" />
                        הגדרות
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}



