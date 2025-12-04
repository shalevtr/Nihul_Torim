"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Business {
  id: string
  name: string
  category: string
  city?: string | null
  subscriptionPlan: string
  owner: {
    email: string
    fullName: string | null
  }
  createdAt: Date
}

interface AdminBusinessesTableProps {
  businesses: Business[]
}

export function AdminBusinessesTable({ businesses }: AdminBusinessesTableProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(businessId: string, businessName: string) {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את העסק "${businessName}"?`)) {
      return
    }

    setDeleting(businessId)

    try {
      const res = await fetch(`/api/businesses/${businessId}/delete`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("שגיאה במחיקה")

      toast({
        title: "הצלחה",
        description: "העסק נמחק בהצלחה",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את העסק",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-right">שם עסק</th>
            <th className="p-2 text-right">קטגוריה</th>
            <th className="p-2 text-right">עיר</th>
            <th className="p-2 text-right">בעלים</th>
            <th className="p-2 text-right">מסלול</th>
            <th className="p-2 text-right">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((business) => (
            <tr key={business.id} className="border-b hover:bg-gray-50">
              <td className="p-2 font-medium">{business.name}</td>
              <td className="p-2">{business.category}</td>
              <td className="p-2">{business.city || "-"}</td>
              <td className="p-2 text-sm">{business.owner.email}</td>
              <td className="p-2">
                <Select
                  value={business.subscriptionPlan}
                  onValueChange={async (plan) => {
                    try {
                      const res = await fetch(`/api/admin/businesses/${business.id}/subscription`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ subscriptionPlan: plan }),
                      })
                      if (!res.ok) throw new Error("שגיאה")
                      toast({ title: "✓ המסלול עודכן" })
                      router.refresh()
                    } catch (error) {
                      toast({ title: "שגיאה", variant: "destructive" })
                    }
                  }}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">בסיסי</SelectItem>
                    <SelectItem value="STANDARD">סטנדרט</SelectItem>
                    <SelectItem value="PREMIUM">פרימיום</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="p-2">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/business/${business.id}`}>צפה</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deleting === business.id}
                    onClick={() => handleDelete(business.id, business.name)}
                  >
                    {deleting === business.id ? "מוחק..." : "מחק"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
