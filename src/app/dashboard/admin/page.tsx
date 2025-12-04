import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/roles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminUsersTable } from "@/components/admin-users-table"
import { AdminBusinessesTable } from "@/components/admin-businesses-table"

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })
}

async function getBusinesses() {
  return await prisma.business.findMany({
    include: {
      owner: {
        select: {
          email: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export default async function AdminPage() {
  await requireAdmin()
  const users = await getUsers()
  const businesses = await getBusinesses()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">לוח בקרה - מנהל</h1>
        <p className="text-muted-foreground">נהל משתמשים ועסקים</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ניהול משתמשים</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminUsersTable users={users} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>סקירת עסקים</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminBusinessesTable businesses={businesses} />
        </CardContent>
      </Card>
    </div>
  )
}

