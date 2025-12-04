"use client"

import { useEffect } from "react"

interface MarkNotificationsReadProps {
  businessId?: string
  appointmentIds?: string[]
  type?: "all" | "business" | "appointments"
}

export function MarkNotificationsRead({ businessId, appointmentIds, type = "all" }: MarkNotificationsReadProps) {
  useEffect(() => {
    async function markAsRead() {
      try {
        if (type === "business" && businessId) {
          // Mark all notifications for this business as read
          await fetch("/api/notifications/mark-business-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessId }),
          })
        } else if (type === "appointments" || (appointmentIds && appointmentIds.length > 0)) {
          // Mark all appointment-related notifications as read (for customer appointments page)
          await fetch("/api/notifications/mark-appointments-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: appointmentIds ? JSON.stringify({ appointmentIds }) : JSON.stringify({}),
          })
        } else if (type === "all") {
          // Mark all notifications as read
          await fetch("/api/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markAllAsRead: true }),
          })
        }
        
        // Trigger notification update event
        window.dispatchEvent(new CustomEvent("notifications-updated"))
      } catch (error) {
        console.error("Error marking notifications as read:", error)
      }
    }

    markAsRead()
  }, [businessId, appointmentIds, type])

  return null // This component doesn't render anything
}

