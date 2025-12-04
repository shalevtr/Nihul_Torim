"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings } from "lucide-react"

export function AccessibilityPanel() {
  const [mounted, setMounted] = useState(false)
  const [textSize, setTextSize] = useState<"normal" | "large">("normal")
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTextSize = localStorage.getItem("textSize") as "normal" | "large" | null
    const savedHighContrast = localStorage.getItem("highContrast") === "true"

    if (savedTextSize) setTextSize(savedTextSize)
    if (savedHighContrast) setHighContrast(savedHighContrast)
  }, [])

  useEffect(() => {
    if (textSize === "large") {
      document.body.classList.add("text-lg")
    } else {
      document.body.classList.remove("text-lg")
    }
    localStorage.setItem("textSize", textSize)
  }, [textSize])

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast")
    } else {
      document.body.classList.remove("high-contrast")
    }
    localStorage.setItem("highContrast", String(highContrast))
  }, [highContrast])

  if (!mounted) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 z-50 rounded-full"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>נגישות</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="textSize" className="text-sm font-medium">
              טקסט גדול
            </label>
            <Button
              variant={textSize === "large" ? "default" : "outline"}
              onClick={() => setTextSize(textSize === "large" ? "normal" : "large")}
            >
              {textSize === "large" ? "מופעל" : "כבוי"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="highContrast" className="text-sm font-medium">
              ניגודיות גבוהה
            </label>
            <Button
              variant={highContrast ? "default" : "outline"}
              onClick={() => setHighContrast(!highContrast)}
            >
              {highContrast ? "מופעל" : "כבוי"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

