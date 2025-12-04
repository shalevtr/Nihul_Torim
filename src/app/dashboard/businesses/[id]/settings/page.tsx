import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CANCELLATION_POLICIES } from "@/lib/cancellation-policy"

async function getBusiness(id: string, userId: string) {
  const business = await prisma.business.findUnique({
    where: { id },
  })

  if (!business) return null
  if (business.ownerId !== userId) return null

  return business
}

async function updatePolicy(formData: FormData) {
  "use server"

  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const businessId = formData.get("businessId") as string
  const policy = formData.get("policy") as string

  await prisma.business.update({
    where: { id: businessId },
    data: { cancellationPolicy: policy },
  })

  redirect(`/dashboard/businesses/${businessId}/settings`)
}

export default async function BusinessSettingsPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const business = await getBusiness(params.id, user.id)
  if (!business) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          הגדרות עסק - {business.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">נהל את מדיניות הביטולים של העסק</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>תקנון ביטולים</CardTitle>
          <CardDescription>
            בחר את מדיניות הביטולים שמתאימה לעסק שלך. מדיניות זו תחול על כל התורים החדשים.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePolicy} className="space-y-4">
            <input type="hidden" name="businessId" value={business.id} />

            <div className="space-y-4">
              {Object.values(CANCELLATION_POLICIES).map((policy) => (
                <label
                  key={policy.type}
                  className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    business.cancellationPolicy === policy.type
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="policy"
                    value={policy.type}
                    defaultChecked={business.cancellationPolicy === policy.type}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">
                      {policy.type === "FLEXIBLE" && "גמיש"}
                      {policy.type === "MODERATE" && "בינוני"}
                      {policy.type === "STRICT" && "מחמיר"}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {policy.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              שמור שינויים
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              ⚠️ חשוב לדעת
            </h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• המדיניות תחול רק על תורים חדשים שייקבעו מעתה והלאה</li>
              <li>• לקוחות שמבטלים 3 תורים בחודש יחסמו אוטומטית</li>
              <li>• החסימה מתבצעת על ידי המערכת ודורשת פנייה לתמיכה</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

