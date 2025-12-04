import { prisma } from "@/lib/db"
import { requireBusinessOwnerOrAdmin } from "@/lib/roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building2 } from "lucide-react"

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
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  return await prisma.business.findMany({
    where: {
      ownerId: userId,
    },
    include: {
      _count: {
        select: {
          appointments: true,
          images: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export default async function BusinessesPage() {
  const user = await requireBusinessOwnerOrAdmin()
  const businesses = await getBusinesses(user.id, user.role)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">העסקים שלי</h1>
          <p className="text-muted-foreground">נהל את העסקים שלך</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/businesses/new">
            <Building2 className="ml-2 h-4 w-4" />
            הוסף עסק חדש
          </Link>
        </Button>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">אין לך עסקים עדיין</p>
            <Button asChild>
              <Link href="/dashboard/businesses/new">צור עסק ראשון</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardHeader>
                <CardTitle>{business.name}</CardTitle>
                <CardDescription>
                  {business.category} {business.city && `• ${business.city}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {business._count.appointments} תורים • {business._count.images} תמונות
                </div>
                {user.role === "ADMIN" && (
                  <div className="text-xs text-muted-foreground">
                    בעלים: {business.owner?.email}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/businesses/${business.id}/edit`}>ערוך</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/businesses/${business.id}/services`}>מחירון</Link>
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/dashboard/businesses/${business.id}/slots`}>ניהול תורים</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/businesses/${business.id}/gallery`}>גלריה</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

