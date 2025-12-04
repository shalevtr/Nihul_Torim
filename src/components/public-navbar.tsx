"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PublicNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
        <Link href="/" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all">
          ש.ש ניהול תורים
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">בעל עסק? התחבר כאן</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}

