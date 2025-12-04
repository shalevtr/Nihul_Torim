"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CheckUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    checkUsers()
  }, [])

  async function checkUsers() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/check-users")
      
      // Check if response is HTML (error page)
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        if (text.includes("<!DOCTYPE")) {
          setError("השרת לא רץ או יש בעיה ב-API. ודא שהשרת רץ עם: npm run dev")
          setLoading(false)
          return
        }
      }
      
      const data = await res.json()
      
      if (data.success) {
        setUsers(data.users || [])
      } else {
        setError(data.error || "שגיאה בבדיקת משתמשים")
        if (data.details) {
          setError(`${data.error}\nפרטים: ${data.details}`)
        }
      }
    } catch (err: any) {
      setError(`שגיאה: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function createAdmin() {
    setCreating(true)
    setError("")
    try {
      const res = await fetch("/api/auth/create-admin", {
        method: "POST",
      })
      
      // Check if response is HTML (error page)
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        if (text.includes("<!DOCTYPE")) {
          setError("השרת לא רץ או יש בעיה ב-API. ודא שהשרת רץ עם: npm run dev")
          setCreating(false)
          return
        }
      }
      
      const data = await res.json()
      
      if (data.success) {
        alert(`משתמש admin נוצר בהצלחה!\nאימייל: ${data.user.email}\nסיסמה: ${data.password}`)
        checkUsers()
      } else {
        setError(data.error || "שגיאה ביצירת משתמש admin")
        if (data.details) {
          setError(`${data.error}\nפרטים: ${data.details}`)
        }
      }
    } catch (err: any) {
      setError(`שגיאה: ${err.message}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>בדיקת משתמשים במסד הנתונים</CardTitle>
          <CardDescription>רשימת כל המשתמשים הקיימים במערכת</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkUsers} disabled={loading}>
              {loading ? "בודק..." : "רענן רשימה"}
            </Button>
            <Button onClick={createAdmin} disabled={creating} variant="outline">
              {creating ? "יוצר..." : "צור משתמש Admin"}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
              <p className="font-semibold">שגיאה:</p>
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <p>טוען...</p>
          ) : users.length === 0 ? (
            <div className="p-4 bg-muted rounded-md">
              <p>אין משתמשים במסד הנתונים.</p>
              <p className="text-sm text-muted-foreground mt-2">
                לחץ על "צור משתמש Admin" כדי ליצור משתמש מנהל.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold">מספר משתמשים: {users.length}</p>
              <div className="border rounded-md divide-y">
                {users.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{user.fullName || "ללא שם"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          תפקיד: {user.role === "ADMIN" ? "מנהל" : user.role === "BUSINESS_OWNER" ? "בעל עסק" : "לקוח"}
                        </p>
                        {user.email === "admin@example.com" && (
                          <p className="text-xs text-green-600 mt-1 font-semibold">
                            סיסמה: Admin123!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
            <p className="font-semibold mb-2">פרטי התחברות למשתמש Admin:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>אימייל: <code className="bg-muted px-1 rounded">admin@example.com</code></li>
              <li>סיסמה: <code className="bg-muted px-1 rounded">Admin123!</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

