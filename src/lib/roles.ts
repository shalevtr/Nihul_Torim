import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Role } from "@prisma/client"

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }
  return user
}

export async function requireBusinessOwnerOrAdmin() {
  const user = await requireAuth()
  if (user.role !== "BUSINESS_OWNER" && user.role !== "ADMIN") {
    redirect("/dashboard")
  }
  return user
}

export function canManageBusiness(userRole: Role, businessOwnerId: string, userId: string) {
  return userRole === "ADMIN" || businessOwnerId === userId
}

