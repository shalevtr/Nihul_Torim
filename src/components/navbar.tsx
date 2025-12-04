"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsBadge } from "@/components/notifications-badge"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "מנהל",
    BUSINESS_OWNER: "בעל עסק",
    CUSTOMER: "לקוח",
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
        <Link href={user ? "/dashboard/search" : "/"} className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all">
          ש.ש ניהול תורים
        </Link>
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.fullName || user.email}
              </span>
              <span className="rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 px-3 py-1 text-xs font-semibold text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700">
                {roleLabels[user.role] || user.role}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
              התנתקות
            </Button>
          </div>
        )}
        {!user && (
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link href="/auth/login">התחברות</Link>
            </Button>
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/auth/register">התחלת עבודה חינם</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
