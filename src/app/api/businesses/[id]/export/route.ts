import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/roles"
import { SUBSCRIPTION_FEATURES } from "@/lib/subscription"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const { id } = params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "appointments"

    // Get business and check permissions
    const business = await prisma.business.findUnique({
      where: { id },
      select: {
        ownerId: true,
        name: true,
        subscriptionPlan: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    if (business.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if user has export permission (Standard or Premium)
    const plan = SUBSCRIPTION_FEATURES[business.subscriptionPlan]
    if (!plan.canExportData) {
      return NextResponse.json(
        { error: "יכולת ייצוא נתונים זמינה רק במסלול Standard ומעלה" },
        { status: 403 }
      )
    }

    // Export appointments
    if (type === "appointments") {
      const appointments = await prisma.appointment.findMany({
        where: { businessId: id },
        include: {
          customer: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { startTime: "desc" },
      })

      // Convert to CSV
      const headers = ["תאריך", "שעת התחלה", "שעת סיום", "שם לקוח", "טלפון", "אימייל", "סטטוס", "הערות"]
      const rows = appointments.map((apt) => [
        new Date(apt.startTime).toLocaleDateString("he-IL"),
        new Date(apt.startTime).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        new Date(apt.endTime).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        apt.customer?.fullName || "",
        apt.customer?.phone || "",
        apt.customer?.email || "",
        apt.status === "CONFIRMED" ? "מאושר" : apt.status === "PENDING" ? "ממתין" : "בוטל",
        apt.notes || "",
      ])

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="appointments_${business.name}_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Export customers
    if (type === "customers") {
      const appointments = await prisma.appointment.findMany({
        where: { businessId: id },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      })

      // Get unique customers
      const customersMap = new Map()
      appointments.forEach((apt) => {
        if (apt.customer && !customersMap.has(apt.customer.id)) {
          customersMap.set(apt.customer.id, apt.customer)
        }
      })

      const customers = Array.from(customersMap.values())

      // Convert to CSV
      const headers = ["שם מלא", "אימייל", "טלפון"]
      const rows = customers.map((customer) => [
        customer.fullName || "",
        customer.email || "",
        customer.phone || "",
      ])

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="customers_${business.name}_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

