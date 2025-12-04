import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Edit, Calendar, Scissors, Image as ImageIcon, Settings, BarChart3, Clock, Share2 } from "lucide-react"
import { CopyButton } from "@/components/copy-button"

async function getBusiness(id: string) {
  return await prisma.business.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          appointments: true,
          services: true,
          images: true,
        },
      },
    },
  })
}

export default async function OwnerBusinessPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const business = await getBusiness(params.id)

  if (!business || !canManageBusiness(user.role, business.ownerId, user.id)) {
    redirect("/owner/businesses")
  }

  const publicUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/b/${business.slug || business.id}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <p className="text-muted-foreground">
            {business.category} {business.city && `• ${business.city}`}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={publicUrl} target="_blank">
            <Share2 className="h-4 w-4 ml-2" />
            צפה בעמוד הציבורי
          </Link>
        </Button>
      </div>

      {/* Public Link Card */}
      <Card className="border-2 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            קישור ציבורי לשיתוף
          </CardTitle>
          <CardDescription>
            שתף את הקישור הזה עם הלקוחות שלך כדי שיוכלו לקבוע תורים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded border text-sm break-all">
              {publicUrl}
            </code>
            <CopyButton url={publicUrl} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">סה"כ תורים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{business._count.appointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">שירותים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{business._count.services}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">תמונות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{business._count.images}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={`/owner/businesses/${business.id}/edit`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                ערוך פרטי עסק
              </CardTitle>
              <CardDescription>עדכן שם, קטגוריה, כתובת ופרטים נוספים</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={`/owner/businesses/${business.id}/appointments`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                ניהול תורים
              </CardTitle>
              <CardDescription>צפה, אשר ודחה תורים ממתינים</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={`/owner/businesses/${business.id}/schedule`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                פתיחת תורים
              </CardTitle>
              <CardDescription>צור תורים חדשים עבור הלקוחות</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={`/owner/businesses/${business.id}/services`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                מחירון ושירותים
              </CardTitle>
              <CardDescription>נהל את השירותים והמחירים שלך</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={`/owner/businesses/${business.id}/gallery`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                גלריה
              </CardTitle>
              <CardDescription>העלה תמונות של העבודה שלך</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={`/owner/businesses/${business.id}/statistics`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                סטטיסטיקות
              </CardTitle>
              <CardDescription>צפה בדוחות וניתוחים</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={`/owner/businesses/${business.id}/settings`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                הגדרות
              </CardTitle>
              <CardDescription>הגדר שעות עבודה ומדיניות ביטול</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  )
}

