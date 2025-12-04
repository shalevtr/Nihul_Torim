"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BUSINESS_CATEGORIES } from "@/lib/categories"

interface BusinessFormProps {
  business?: {
    id: string
    name: string
    category: string
    city?: string | null
    address?: string | null
    description?: string | null
    logo?: string | null
    phone?: string | null
  }
}

export function BusinessForm({ business }: BusinessFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState(business?.category || "")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      category: category,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      description: formData.get("description") as string,
      logo: formData.get("logo") as string,
      phone: formData.get("phone") as string,
    }

    try {
      const url = business
        ? `/api/businesses/${business.id}`
        : "/api/businesses"
      const method = business ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error("שגיאה בשמירה")
      }

      toast({
        title: "הצלחה",
        description: business ? "העסק עודכן בהצלחה" : "העסק נוצר בהצלחה",
      })

      // Redirect to owner area if user is business owner or admin, otherwise dashboard
      const currentPath = window.location.pathname
      if (currentPath.includes("/owner")) {
        router.push("/owner/businesses")
      } else {
        router.push("/dashboard/businesses")
      }
      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את העסק",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{business ? "ערוך עסק" : "עסק חדש"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם העסק *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={business?.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">קטגוריה *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">טלפון</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={business?.phone || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">לוגו (URL)</Label>
            <Input id="logo" name="logo" type="url" placeholder="https://example.com/logo.png" defaultValue={business?.logo || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">עיר</Label>
            <Input id="city" name="city" defaultValue={business?.city || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">כתובת</Label>
            <Input
              id="address"
              name="address"
              defaultValue={business?.address || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={business?.description || ""}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "שומר..." : business ? "עדכן" : "צור"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

