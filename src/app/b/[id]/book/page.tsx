"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PublicServiceTimeSlotPicker } from "@/components/public-service-time-slot-picker"
import { PublicNavbar } from "@/components/public-navbar"
import { AccessibilityPanel } from "@/components/accessibility-panel"
import { Toaster } from "@/components/ui/toaster"
import { getCustomerData, saveCustomerData, generateDeviceId, CustomerData } from "@/lib/customer-cookie"
import { User } from "lucide-react"

interface Business {
  id: string
  name: string
  category: string
  city: string | null
}

async function getBusiness(id: string): Promise<Business | null> {
  try {
    const res = await fetch(`/api/businesses/${id}/public`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function getAvailableSlots(businessId: string) {
  try {
    const res = await fetch(`/api/businesses/${businessId}/slots/public`)
    if (!res.ok) return []
    const data = await res.json()
    return data.slots || []
  } catch {
    return []
  }
}

export default function PublicBookAppointmentPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  })

  useEffect(() => {
    // Load business and slots
    Promise.all([
      fetch(`/api/businesses/${params.id}/public`).then((res) => res.json()),
      fetch(`/api/businesses/${params.id}/slots/public`).then((res) => res.json()),
    ])
      .then(([businessData, slotsData]) => {
        setBusiness(businessData)
        setSlots(slotsData.slots || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // Check if customer data exists
    const stored = getCustomerData()
    if (stored) {
      setCustomerData(stored)
      setFormData({
        fullName: stored.fullName,
        phone: stored.phone,
        email: stored.email || "",
      })
    } else {
      setShowCustomerForm(true)
    }
  }, [params.id])

  function handleSaveCustomerData() {
    if (!formData.fullName || !formData.phone) {
      return
    }

    const deviceId = generateDeviceId()
    const data: CustomerData = {
      deviceId,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
    }

    saveCustomerData(data)
    setCustomerData(data)
    setShowCustomerForm(false)
  }

  if (loading) {
    return (
      <>
        <PublicNavbar />
        <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">טוען...</p>
          </div>
        </main>
      </>
    )
  }

  if (!business) {
    return (
      <>
        <PublicNavbar />
        <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
          <div className="text-center py-12">
            <p className="text-lg font-semibold">עסק לא נמצא</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <PublicNavbar />
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">{business.name}</h1>
          <p className="text-xl text-muted-foreground">
            {business.category} {business.city && `• ${business.city}`}
          </p>
        </div>

        {/* Customer Details Form */}
        {showCustomerForm && !customerData && (
          <Card className="mb-6 shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5" />
                פרטי יצירת קשר
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">שם מלא *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="הכנס שם מלא"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">טלפון *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="הכנס מספר טלפון"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">אימייל (אופציונלי)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="הכנס אימייל"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleSaveCustomerData}
                  disabled={!formData.fullName || !formData.phone}
                  className="w-full"
                  size="lg"
                >
                  המשך לקביעת תור
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Form */}
        {customerData && (
          <>
            <Card className="mb-4 border-indigo-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">מזמין תור:</p>
                    <p className="font-semibold">{customerData.fullName}</p>
                    <p className="text-sm text-muted-foreground">{customerData.phone}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomerForm(true)}
                  >
                    ערוך פרטים
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-2">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <span>📅</span>
                  בחר תור
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {slots.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      אין תורים זמינים כרגע
                    </p>
                    <p className="text-sm text-muted-foreground">
                      נסה לחזור מאוחר יותר או צור קשר עם העסק
                    </p>
                  </div>
                ) : (
                  <PublicServiceTimeSlotPicker
                    slots={slots}
                    businessId={business.id}
                    customerData={customerData}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <Toaster />
      <AccessibilityPanel />
    </>
  )
}

