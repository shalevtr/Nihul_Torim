"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, Search, Building2, CalendarCheck, Shield, Heart, Calendar as CalendarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function MobileNav() {
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
      label: "חיפוש",
      href: "/dashboard/search",
      icon: Search,
      roles: ["CUSTOMER", "BUSINESS_OWNER", "ADMIN"],
    },
    {
      label: "יומן",
      href: "/dashboard/calendar",
      icon: Calendar,
      roles: ["CUSTOMER", "BUSINESS_OWNER", "ADMIN"],
    },
    {
      label: "תורים",
      href: "/dashboard/appointments",
      icon: CalendarCheck,
      roles: ["CUSTOMER", "BUSINESS_OWNER", "ADMIN"],
      showNotification: true,
    },
    {
      label: "עסקים",
      href: "/dashboard/businesses",
      icon: Building2,
      roles: ["BUSINESS_OWNER", "ADMIN"],
    },
  ]

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  ).slice(0, 4) // Max 4 items for mobile

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-2xl md:hidden safe-area-inset-bottom">
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const showBadge = item.showNotification && unreadNotifications > 0
          async function handleClick(e: React.MouseEvent) {
            // If clicking on "תורים" and there are unread notifications, mark them as read immediately
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
                "flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium transition-all duration-200 min-w-[60px] relative",
                isActive 
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 scale-105" 
                  : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {showBadge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[8px] font-bold"
                  >
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </Badge>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

