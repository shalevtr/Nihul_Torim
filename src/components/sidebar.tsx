"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, Search, Building2, CalendarCheck, Shield, Heart, User, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
  }, [])

  // Fetch unread notifications count
  useEffect(() => {
    if (user) {
      async function fetchNotifications() {
        try {
          const res = await fetch("/api/notifications")
          const data = await res.json()
          if (data.unreadCount !== undefined) {
            // Only update if count increased (new notifications), not if it decreased (already marked as read)
            setUnreadNotifications((prev) => {
              // If new count is higher, update. If lower, keep current (user already saw it)
              return data.unreadCount > prev ? data.unreadCount : prev
            })
          }
        } catch (error) {
          console.error("Error fetching notifications:", error)
        }
      }
      
      fetchNotifications()
      
      // Refresh every 10 seconds
      const interval = setInterval(fetchNotifications, 10000)
      
      // Listen for custom event to refresh notifications
      const handleNotificationUpdate = () => {
        // When notifications are updated, fetch immediately but respect the "already read" state
        fetchNotifications()
      }
      window.addEventListener("notifications-updated", handleNotificationUpdate)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener("notifications-updated", handleNotificationUpdate)
      }
    }
  }, [user])

  if (!user) return null

  const menuItems = [
    {
      label: "יומן",
      href: "/dashboard/calendar",
      icon: Calendar,
      roles: ["CUSTOMER", "BUSINESS_OWNER", "ADMIN"],
    },
    {
      label: "חיפוש עסקים",
      href: "/dashboard/search",
      icon: Search,
      roles: ["CUSTOMER", "BUSINESS_OWNER", "ADMIN"],
    },
    {
      label: "תור מהיר",
      href: "/dashboard/quick-book",
      icon: () => <Zap className="h-5 w-5" />,
      roles: ["CUSTOMER", "BUSINESS_OWNER", "ADMIN"],
    },
    {
      label: "מועדפים",
      href: "/dashboard/favorites",
      icon: () => <Heart className="h-5 w-5" />,
      roles: ["CUSTOMER", "BUSINESS_OWNER", "ADMIN"],
    },
    {
      label: "הפרופיל שלי",
      href: "/dashboard/profile",
      icon: () => <User className="h-5 w-5" />,
      roles: ["CUSTOMER"],
    },
    {
      label: "העסקים שלי",
      href: "/dashboard/businesses",
      icon: Building2,
      roles: ["BUSINESS_OWNER", "ADMIN"],
    },
    {
      label: "התורים שלי",
      href: "/dashboard/appointments",
      icon: CalendarCheck,
      roles: ["CUSTOMER", "BUSINESS_OWNER", "ADMIN"],
      showNotification: true,
    },
    {
      label: "אדמין",
      href: "/dashboard/admin",
      icon: Shield,
      roles: ["ADMIN"],
    },
  ]

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  )

  return (
    <aside className="sticky top-0 h-screen w-64 border-l bg-white dark:bg-gray-900 p-4 shadow-lg hidden md:block overflow-y-auto">
      <nav className="space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const showBadge = item.showNotification && unreadNotifications > 0
          async function handleClick(e: React.MouseEvent) {
            // If clicking on "התורים שלי" and there are unread notifications, mark them as read immediately
            if (item.href === "/dashboard/appointments" && unreadNotifications > 0) {
              e.preventDefault()
              try {
                const res = await fetch("/api/notifications/mark-appointments-read", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({}), // Empty body = mark all appointment notifications
                })
                
                if (res.ok) {
                  // Immediately set count to 0 - don't wait for polling
                  setUnreadNotifications(0)
                  // Trigger update event so other components know
                  window.dispatchEvent(new CustomEvent("notifications-updated"))
                }
                
                router.push(item.href)
                router.refresh()
              } catch (error) {
                console.error("Error marking notifications as read:", error)
                router.push(item.href)
              }
            }
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClick}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {showBadge && (
                <Badge
                  variant="destructive"
                  className="h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
                >
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
