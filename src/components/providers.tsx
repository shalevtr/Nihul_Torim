"use client"

import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const textSize = localStorage.getItem("textSize")
    const highContrast = localStorage.getItem("highContrast")
    const theme = localStorage.getItem("theme")
    
    if (textSize === "large") {
      document.body.classList.add("text-lg")
    }
    if (highContrast === "true") {
      document.body.classList.add("high-contrast")
    }
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    }
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
