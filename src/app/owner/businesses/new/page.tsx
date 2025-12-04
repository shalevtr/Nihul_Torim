import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { BusinessForm } from "@/components/business-form"

export default async function OwnerNewBusinessPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  if (user.role !== "BUSINESS_OWNER" && user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">עסק חדש</h1>
        <p className="text-muted-foreground">צור עסק חדש</p>
      </div>
      <BusinessForm />
    </div>
  )
}



