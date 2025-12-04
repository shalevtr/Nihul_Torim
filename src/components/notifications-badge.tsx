"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function NotificationsBadge() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function fetchNotifications() {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()

      if (res.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 10000)
    
    // Listen for custom event to refresh notifications
    const handleNotificationUpdate = () => {
      fetchNotifications()
    }
    window.addEventListener("notifications-updated", handleNotificationUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener("notifications-updated", handleNotificationUpdate)
    }
  }, [])

  async function markAsRead(notificationId: string) {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  async function markAllAsRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast({
          title: "הצלחה",
          description: "כל ההודעות סומנו כנקראו",
        })
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "APPOINTMENT_PENDING":
        return "⏳"
      case "APPOINTMENT_CONFIRMED":
        return "✅"
      case "APPOINTMENT_CANCELLED":
        return "❌"
      case "APPOINTMENT_BOOKED":
        return "📅"
      default:
        return "🔔"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <Bell className={`h-5 w-5 transition-all ${unreadCount > 0 ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse shadow-lg border-2 border-white dark:border-gray-900"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end">
        <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              הודעות
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} חדשות
                </Badge>
              )}
            </h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7"
              >
                סמן הכל כנקרא
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">אין הודעות חדשות</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10 border-r-4 border-blue-500" : ""
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id)
                    }
                    if (notification.appointmentId && notification.businessId) {
                      const userRole = notification.userId ? "owner" : "customer"
                      if (userRole === "owner") {
                        router.push(`/owner/businesses/${notification.businessId}/appointments`)
                      } else {
                        router.push(`/dashboard/appointments`)
                      }
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                      !notification.isRead 
                        ? "bg-blue-100 dark:bg-blue-900/30" 
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            !notification.isRead ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-2.5 w-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.business && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-2">
                          {notification.business.name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleString("he-IL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

