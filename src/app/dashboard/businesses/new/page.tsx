import { requireBusinessOwnerOrAdmin } from "@/lib/roles"
import { BusinessForm } from "@/components/business-form"

export default async function NewBusinessPage() {
  await requireBusinessOwnerOrAdmin()

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

