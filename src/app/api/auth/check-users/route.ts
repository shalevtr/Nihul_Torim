import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Try to connect to database and get users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    })
  } catch (error: any) {
    console.error("Check users error:", error)
    
    let errorMessage = "שגיאה בבדיקת משתמשים"
    
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



