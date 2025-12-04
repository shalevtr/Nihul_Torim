import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("🔍 בודק משתמשים במסד הנתונים...\n")
    
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

    if (users.length === 0) {
      console.log("❌ אין משתמשים במסד הנתונים")
      console.log("\n💡 כדי ליצור משתמש admin, הרץ:")
      console.log("   npm run db:seed")
      console.log("\n   או גש ל: http://localhost:3000/check-users")
    } else {
      console.log(`✅ נמצאו ${users.length} משתמשים:\n`)
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName || "ללא שם"}`)
        console.log(`   אימייל: ${user.email}`)
        console.log(`   תפקיד: ${user.role}`)
        
        // Show password for admin user
        if (user.email === "admin@example.com") {
          console.log(`   סיסמה: Admin123!`)
        } else {
          console.log(`   סיסמה: (מוצפנת במסד הנתונים)`)
        }
        console.log("")
      })
      
      console.log("📝 פרטי התחברות למשתמש Admin:")
      console.log("   אימייל: admin@example.com")
      console.log("   סיסמה: Admin123!")
    }
  } catch (error: any) {
    console.error("❌ שגיאה:", error.message)
    
    if (error.code === "P1001" || error.message.includes("connect")) {
      console.error("\n💡 בעיית חיבור למסד הנתונים:")
      console.error("   1. ודא שיש חיבור לאינטרנט")
      console.error("   2. בדוק את ה-DATABASE_URL בקובץ .env.local")
      console.error("   3. ודא שהפרויקט ב-Neon פעיל")
    } else if (error.message.includes("PrismaClient") || error.message.includes("generated")) {
      console.error("\n💡 Prisma Client לא מוכן:")
      console.error("   הרץ: npm run db:generate")
    } else if (error.code === "P2021" || error.message.includes("does not exist")) {
      console.error("\n💡 טבלאות מסד הנתונים לא קיימות:")
      console.error("   הרץ: npm run db:migrate")
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()



