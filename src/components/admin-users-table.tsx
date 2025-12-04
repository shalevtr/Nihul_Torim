"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Role } from "@prisma/client"

interface User {
  id: string
  email: string
  fullName: string | null
  role: Role
  createdAt: Date
}

interface AdminUsersTableProps {
  users: User[]
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const { toast } = useToast()
  const router = useRouter()

  async function handleRoleChange(userId: string, newRole: Role) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) throw new Error("שגיאה בעדכון תפקיד")

      toast({
        title: "הצלחה",
        description: "התפקיד עודכן בהצלחה",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן תפקיד",
        variant: "destructive",
      })
    }
  }

  const roleLabels: Record<Role, string> = {
    ADMIN: "מנהל",
    BUSINESS_OWNER: "בעל עסק",
    CUSTOMER: "לקוח",
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-right">שם</th>
            <th className="p-2 text-right">אימייל</th>
            <th className="p-2 text-right">תפקיד</th>
            <th className="p-2 text-right">תאריך הרשמה</th>
            <th className="p-2 text-right">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.fullName || "-"}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value as Role)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">לקוח</SelectItem>
                    <SelectItem value="BUSINESS_OWNER">בעל עסק</SelectItem>
                    <SelectItem value="ADMIN">מנהל</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="p-2 text-sm text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("he-IL")}
              </td>
              <td className="p-2">-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

