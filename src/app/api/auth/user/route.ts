import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
  }
  
  // Return only safe user data (no sensitive info)
  return NextResponse.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    // Don't return: passwordHash, phone (unless needed), etc.
  })
}
