import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/session"
import { apiMiddleware } from "@/lib/api-middleware"
import { loginSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    // Rate limiting and validation
    const validationResult = await apiMiddleware(request, loginSchema, 'login')
    if (validationResult instanceof NextResponse) {
      return validationResult
    }
    const { email, password } = validationResult.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "אימייל או סיסמה שגויים" },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: "אימייל או סיסמה שגויים" },
        { status: 401 }
      )
    }

    await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error("Login error:", error)
    
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
    
    return NextResponse.json(
      { error: `שגיאה בהתחברות: ${error?.message || "שגיאה לא ידועה"}` },
      { status: 500 }
    )
  }
}

