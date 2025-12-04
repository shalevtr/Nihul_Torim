"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, Settings, Calendar, Users, TrendingUp, Download } from "lucide-react"

interface BusinessMenuProps {
  businessId: string
  subscriptionPlan: string
}

export function BusinessMenu({ businessId, subscriptionPlan }: BusinessMenuProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      label: "פרטי עסק",
      href: `/dashboard/businesses/${businessId}/edit`,
      icon: Building2,
      available: true,
    },
    {
      label: "תורים",
      href: `/dashboard/businesses/${businessId}/appointments`,
      icon: Calendar,
      available: true,
    },
    {
      label: "צוות",
      href: `/dashboard/businesses/${businessId}/team`,
      icon: Users,
      available: subscriptionPlan !== "BASIC",
      badge: subscriptionPlan === "BASIC" ? "Standard+" : undefined,
    },
    {
      label: "סטטיסטיקות",
      href: `/dashboard/businesses/${businessId}/statistics`,
      icon: TrendingUp,
      available: subscriptionPlan === "PREMIUM",
      badge: subscriptionPlan !== "PREMIUM" ? "Premium" : undefined,
    },
    {
      label: "הגדרות",
      href: `/dashboard/businesses/${businessId}/settings`,
      icon: Settings,
      available: true,
    },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.href} href={item.available ? item.href : "#"}>
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap relative"
              disabled={!item.available}
            >
              <Icon className="h-4 w-4 ml-2" />
              {item.label}
              {item.badge && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Button>
          </Link>
        )
      })}
    </div>
  )
}

