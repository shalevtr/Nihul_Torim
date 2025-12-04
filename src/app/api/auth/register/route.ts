import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { apiMiddleware } from "@/lib/api-middleware"
import { registerSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    // Rate limiting and validation
    const validationResult = await apiMiddleware(request, registerSchema, 'register')
    if (validationResult instanceof NextResponse) {
      return validationResult
    }
    const { email, password, fullName, phone, role = 'CUSTOMER' } = validationResult.data

    // Additional role validation
    if (role !== "CUSTOMER" && role !== "BUSINESS_OWNER") {
      return NextResponse.json(
        { error: "תפקיד לא חוקי" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "משתמש עם אימייל זה כבר קיים" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName || null,
        phone: phone || null,
        role: role as Role,
      },
    })

    return NextResponse.json({ 
      success: true, 
      userId: user.id,
      message: "המשתמש נוצר בהצלחה ונשמר במסד הנתונים"
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Check if it's a database connection error
    if (error?.code === "P1001" || error?.message?.includes("connect") || error?.message?.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "שגיאת חיבור למסד הנתונים. בדוק את החיבור לאינטרנט ואת הגדרות מסד הנתונים." },
        { status: 503 }
      )
    }
    
    // Check if Prisma Client is not generated
    if (error?.message?.includes("PrismaClient") || error?.message?.includes("generated")) {
      return NextResponse.json(
        { error: "מסד הנתונים לא מוכן. יש להריץ: npm run db:generate && npm run db:migrate" },
        { status: 500 }
      )
    }
    
    // Check if table doesn't exist
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      return NextResponse.json(
        { error: "טבלאות מסד הנתונים לא קיימות. יש להריץ: npm run db:migrate" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: `שגיאה בהרשמה: ${error?.message || "שגיאה לא ידועה"}` },
      { status: 500 }
    )
  }
}

