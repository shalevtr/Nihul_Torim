import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const adminEmail = "admin@example.com"
    const adminPassword = "Admin123!"

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "משתמש admin כבר קיים",
        user: {
          email: existingAdmin.email,
          fullName: existingAdmin.fullName,
          role: existingAdmin.role,
        },
        password: adminPassword,
      })
    }

    // Create admin user
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: "מנהל מערכת",
        role: "ADMIN",
      },
    })

    return NextResponse.json({
      success: true,
      message: "משתמש admin נוצר בהצלחה",
      user: {
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
      password: adminPassword,
    })
  } catch (error: any) {
    console.error("Create admin error:", error)
    
    let errorMessage = "שגיאה ביצירת משתמש admin"
    
    if (error?.code === "P1001" || error?.message?.includes("connect") || error?.message?.includes("ECONNREFUSED")) {
      errorMessage = "שגיאת חיבור למסד הנתונים. בדוק את החיבור לאינטרנט ואת הגדרות מסד הנתונים."
    } else if (error?.message?.includes("PrismaClient") || error?.message?.includes("generated")) {
      errorMessage = "Prisma Client לא מוכן. יש להריץ: npm run db:generate"
    } else if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      errorMessage = "טבלאות מסד הנתונים לא קיימות. יש להריץ: npm run db:migrate"
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: error?.message || error?.code || "Unknown error"
      },
      { status: 500 }
    )
  }
}



