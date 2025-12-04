import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-8 text-muted-foreground">הדף לא נמצא</p>
        <Button asChild>
          <Link href="/">חזור לדף הבית</Link>
        </Button>
      </div>
    </>
  )
}

