"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "אימייל או סיסמה שגויים")
        setLoading(false)
        return
      }

      // Redirect based on role
      if (data.user.role === "ADMIN" || data.user.role === "BUSINESS_OWNER") {
        router.push("/owner/businesses")
      } else {
        router.push("/dashboard/search")
      }
      router.refresh()
    } catch (err) {
      setError("שגיאה בהתחברות")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>התחברות</CardTitle>
          <CardDescription>הכנס לחשבון שלך</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? "text" : "password"} required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? "הסתר" : "הצג"}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "מתבצע..." : "התחבר"}
            </Button>
            <p className="text-center text-sm">
              אין לך חשבון?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                הרשמה
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
