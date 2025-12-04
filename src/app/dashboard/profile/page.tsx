import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Heart, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getUserData(userId: string) {
  const [appointments, favorites, reviews] = await Promise.all([
    prisma.appointment.findMany({
      where: { customerId: userId },
      include: {
        business: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
      take: 10,
    }),
    prisma.favorite.findMany({
      where: { userId },
      include: {
        business: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { userId },
      include: {
        business: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return { appointments, favorites, reviews }
}

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const { appointments, favorites, reviews } = await getUserData(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">הפרופיל שלי</h1>
        <p className="text-gray-600">כל המידע והפעילות שלך במערכת</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              תורים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">סה"כ תורים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              מועדפים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.length}</div>
            <p className="text-xs text-muted-foreground">עסקים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ביקורות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">שכתבתי</p>
          </CardContent>
        </Card>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>פרטים אישיים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">שם מלא:</span>
            <p className="font-medium">{user.fullName || "-"}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">אימייל:</span>
            <p className="font-medium">{user.email}</p>
          </div>
          {user.phone && (
            <div>
              <span className="text-sm text-muted-foreground">טלפון:</span>
              <p className="font-medium">{user.phone}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-muted-foreground">תפקיד:</span>
            <p className="font-medium">
              {user.role === "CUSTOMER" && "לקוח"}
              {user.role === "BUSINESS_OWNER" && "בעל עסק"}
              {user.role === "ADMIN" && "מנהל"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>תורים אחרונים</CardTitle>
            <CardDescription>10 התורים האחרונים שלך</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">אין תורים</p>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-start justify-between text-sm border-b pb-2">
                    <div>
                      <p className="font-medium">{apt.business.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(apt.startTime).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      apt.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                      apt.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {apt.status === "CONFIRMED" && "מאושר"}
                      {apt.status === "PENDING" && "ממתין"}
                      {apt.status === "CANCELLED" && "בוטל"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/appointments">כל התורים</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>ביקורות אחרונות</CardTitle>
            <CardDescription>הביקורות שכתבת</CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">אין ביקורות</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{review.business.name}</p>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

