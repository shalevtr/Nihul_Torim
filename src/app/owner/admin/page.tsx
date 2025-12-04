import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminUsersTable } from "@/components/admin-users-table"
import { AdminBusinessesTable } from "@/components/admin-businesses-table"
import { requireAdmin } from "@/lib/roles"

async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
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
          fullName: true,
          email: true,
        },
      },
      _count: {
        select: {
          appointments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export default async function OwnerAdminPage() {
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



