"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface StaffMember {
  id: string
  name: string
  email?: string
  phone?: string
  role?: string
  createdAt: string
}

interface Business {
  id: string
  name: string
  subscriptionPlan: string
}

export default function TeamManagementPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [business, setBusiness] = useState<Business | null>(null)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  async function fetchData() {
    try {
      // Fetch business
      const businessRes = await fetch(`/api/businesses/${params.id}`)
      if (businessRes.ok) {
        const businessData = await businessRes.json()
        setBusiness(businessData)

        // Check if user has team management permission
        if (businessData.subscriptionPlan === "BASIC") {
          return // Don't fetch staff if no access
        }
      }

      // Fetch staff
      const staffRes = await fetch(`/api/businesses/${params.id}/staff`)
      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaff(staffData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const res = await fetch(`/api/businesses/${params.id}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({
          title: "✓ נוסף בהצלחה",
          description: "חבר הצוות נוסף למערכת",
        })
        setIsDialogOpen(false)
        setFormData({ name: "", email: "", phone: "", role: "" })
        fetchData()
      } else {
        const data = await res.json()
        toast({
          title: "שגיאה",
          description: data.error || "שגיאה בהוספת חבר צוות",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding staff:", error)
      toast({
        title: "שגיאה",
        description: "שגיאה בהוספת חבר צוות",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(staffId: string) {
    if (!confirm("האם למחוק את חבר הצוות?")) return

    try {
      const res = await fetch(`/api/businesses/${params.id}/staff?staffId=${staffId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "✓ נמחק בהצלחה",
          description: "חבר הצוות הוסר מהמערכת",
        })
        fetchData()
      } else {
        const data = await res.json()
        toast({
          title: "שגיאה",
          description: data.error || "שגיאה במחיקת חבר צוות",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת חבר צוות",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-12">טוען...</div>
  }

  if (!business) {
    return <div className="text-center py-12">עסק לא נמצא</div>
  }

  // Check subscription
  if (business.subscriptionPlan === "BASIC") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            ניהול צוות - {business.name}
          </h1>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">גישה למסלול Standard ומעלה</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ניהול צוות זמין רק למנויי Standard ו-Premium
            </p>
            <p className="text-sm text-gray-500">פנה לאדמין להעלאת המסלול שלך</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            ניהול צוות - {business.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">נהל את עובדי העסק</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              הוסף עובד
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוסף חבר צוות</DialogTitle>
              <DialogDescription>הוסף עובד חדש לעסק שלך</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">שם מלא *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">תפקיד</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="לדוגמה: ספר, מאפר, קוסמטיקאית"
                />
              </div>

              <div>
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  הוסף
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff List */}
      {staff.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500">אין עובדים במערכת</p>
            <p className="text-sm text-gray-400 mt-1">לחץ על "הוסף עובד" כדי להתחיל</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    {member.role && (
                      <CardDescription className="mt-1">{member.role}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {member.email && (
                  <p className="text-gray-600 dark:text-gray-400">{member.email}</p>
                )}
                {member.phone && (
                  <p className="text-gray-600 dark:text-gray-400">{member.phone}</p>
                )}
                <p className="text-xs text-gray-400">
                  נוסף ב-{new Date(member.createdAt).toLocaleDateString("he-IL")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

