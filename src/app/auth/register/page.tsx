"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"CUSTOMER" | "BUSINESS_OWNER">("CUSTOMER")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role,
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || "שגיאה בהרשמה")
        setLoading(false)
        return
      }

      // Auto login after register
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      if (loginRes.ok) {
        if (data.role === "BUSINESS_OWNER") {
          router.push("/dashboard/businesses")
        } else {
          router.push("/dashboard/search")
        }
        router.refresh()
      } else {
        router.push("/auth/login")
      }
    } catch (err) {
      setError("שגיאה בהרשמה")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>הרשמה</CardTitle>
          <CardDescription>צור חשבון חדש</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">מספר טלפון</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={6} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? "הסתר" : "הצג"}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">תפקיד</Label>
              <Select value={role} onValueChange={(val) => setRole(val as "CUSTOMER" | "BUSINESS_OWNER")}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר תפקיד" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">לקוח</SelectItem>
                  <SelectItem value="BUSINESS_OWNER">בעל עסק</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "מתבצע..." : "הרשמה"}
            </Button>
            <p className="text-center text-sm">
              כבר יש לך חשבון?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                התחבר
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
