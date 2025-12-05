import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceTimeSlotPicker } from "@/components/service-time-slot-picker"
import { Navbar } from "@/components/navbar"
import { AccessibilityPanel } from "@/components/accessibility-panel"
import { Toaster } from "@/components/ui/toaster"

// Mark as dynamic to prevent DB calls during build
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getBusiness(id: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      category: true,
      city: true,
    },
  })

  return business
}

async function getAvailableSlots(businessId: string) {
  const now = new Date()
  const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000) // 1 minute from now - no past slots
  
  // Get all slots for this business
  const allSlots = await prisma.timeSlot.findMany({
    where: {
      businessId,
      isBooked: false,
    },
    orderBy: [
      { date: "asc" },
      { startTime: "asc" },
    ],
    take: 200, // Get more to filter properly
  })

  // Filter slots by actual datetime (date + time) - only show slots in the future (at least 1 minute)
  const filteredSlots = allSlots.filter((slot) => {
    const slotDate = new Date(slot.date)
    const [startHour, startMinute] = slot.startTime.split(':').map(Number)
    
    const slotStartDateTime = new Date(slotDate)
    slotStartDateTime.setHours(startHour, startMinute, 0, 0)
    
    // Only show slots that are at least 1 minute in the future
    return slotStartDateTime >= oneMinuteFromNow
  }).slice(0, 100) // Limit to 100 results

  return filteredSlots
}

export default async function BookAppointmentPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect(`/auth/login?callbackUrl=/b/${params.id}/book`)
  }

  const business = await getBusiness(params.id)

  if (!business) {
    notFound()
  }

  const availableSlots = await getAvailableSlots(params.id)

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">{business.name}</h1>
          <p className="text-xl text-muted-foreground">
            {business.category} {business.city && `• ${business.city}`}
          </p>
        </div>

        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <span>📅</span>
              בחר תור
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {availableSlots.length === 0 ? (
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
              <ServiceTimeSlotPicker slots={availableSlots} businessId={business.id} userName={user.fullName || user.email} />
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
      <AccessibilityPanel />
    </>
  )
}

