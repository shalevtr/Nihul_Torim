import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canManageBusiness } from "@/lib/roles"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    // Rate limiting
    const { applyRateLimit } = await import('@/lib/api-middleware')
    const rateLimitResponse = await applyRateLimit(request, 'uploadImage')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const formData = await request.formData()
    const file = formData.get("image") as File
    const caption = formData.get("caption") as string
    const businessId = formData.get("businessId") as string

    if (!file || !businessId) {
      return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "סוג קובץ לא נתמך. אנא העלה תמונה בפורמט JPG, PNG או WebP" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "גודל הקובץ גדול מדי. מקסימום 5MB" },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business || !canManageBusiness(user.role, business.ownerId, user.id)) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Save to public/uploads
    const publicPath = path.join(process.cwd(), "public", "uploads")
    
    // Create uploads directory if it doesn't exist
    try {
      const fs = require('fs')
      if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true })
      }
    } catch (error) {
      console.error("Error creating uploads directory:", error)
    }

    const filepath = path.join(publicPath, filename)
    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`

    // Save to database
    const image = await prisma.businessImage.create({
      data: {
        businessId,
        url,
        caption: caption || null,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "שגיאה בהעלאת תמונה" },
      { status: 500 }
    )
  }
}
