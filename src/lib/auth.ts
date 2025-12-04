import { getSession } from "@/lib/session"

export async function getCurrentUser() {
  return await getSession()
}
