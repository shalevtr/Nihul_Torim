import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Toaster } from "@/components/ui/toaster"
import { AccessibilityPanel } from "@/components/accessibility-panel"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
      <MobileNav />
      <Toaster />
      <AccessibilityPanel />
    </div>
  )
}

