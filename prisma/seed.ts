import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Create admin user
  const adminEmail = "admin@example.com"
  const adminPassword = "Admin123!"

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log("✅ Admin user already exists")
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: "מנהל מערכת",
        role: "ADMIN",
      },
    })

    console.log("✅ Created admin user:", admin.email)
    console.log("   Password:", adminPassword)
  }

  console.log("✨ Seed completed!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

