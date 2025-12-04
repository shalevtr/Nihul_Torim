import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AccessibilityPanel } from "@/components/accessibility-panel"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-5xl font-bold">ש.ש ניהול תורים</h1>
          <p className="mb-8 text-xl text-muted-foreground">
            פתרון מושלם לניהול תורים לעסקים קטנים ובינוניים
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/login">התחברות</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/register">התחלת עבודה חינם</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <h2 className="mb-8 text-center text-3xl font-bold">אודות המערכת</h2>
          <p className="mx-auto max-w-2xl text-center text-muted-foreground">
            מערכת ניהול תורים מתקדמת המאפשרת לעסקים לנהל את התורים שלהם בקלות,
            ולקוחות למצוא עסקים ולקבע תורים בצורה פשוטה ונוחה.
          </p>
        </section>

        <section className="container mx-auto px-4 py-12">
          <h2 className="mb-8 text-center text-3xl font-bold">תוכניות מחיר</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>בסיסי</CardTitle>
                <CardDescription>לעסקים קטנים</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-3xl font-bold">₪49</div>
                <ul className="mb-4 space-y-2 text-sm">
                  <li>תורים ללא הגבלה</li>
                  <li>ניהול עסק אחד</li>
                  <li>תמיכה בדוא"ל</li>
                </ul>
                <Button className="w-full" variant="outline" disabled>
                  בחר תוכנית
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>פרימיום</CardTitle>
                <CardDescription>לעסקים בינוניים</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-3xl font-bold">₪99</div>
                <ul className="mb-4 space-y-2 text-sm">
                  <li>תורים ללא הגבלה</li>
                  <li>ניהול עד 5 עסקים</li>
                  <li>תמיכה טלפונית</li>
                  <li>דוחות מתקדמים</li>
                </ul>
                <Button className="w-full" disabled>בחר תוכנית</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>עסקי</CardTitle>
                <CardDescription>לעסקים גדולים</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-3xl font-bold">₪199</div>
                <ul className="mb-4 space-y-2 text-sm">
                  <li>תורים ללא הגבלה</li>
                  <li>ניהול עסקים ללא הגבלה</li>
                  <li>תמיכה 24/7</li>
                  <li>API מותאם אישית</li>
                </ul>
                <Button className="w-full" variant="outline" disabled>
                  בחר תוכנית
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="border-t bg-muted/40 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ש.ש ניהול תורים. כל הזכויות שמורות.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              האתר נבנה בהתאם לתקנות הנגישות
            </p>
          </div>
        </footer>
      </main>
      <AccessibilityPanel />
    </>
  )
}

