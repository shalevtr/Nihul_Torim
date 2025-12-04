"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface FavoriteButtonProps {
  businessId: string
  userId?: string
  initialIsFavorite?: boolean
}

export function FavoriteButton({ businessId, userId, initialIsFavorite = false }: FavoriteButtonProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)

  // Check if favorite on mount
  useEffect(() => {
    if (userId) {
      fetch(`/api/favorites?businessId=${businessId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.isFavorite !== undefined) {
            setIsFavorite(data.isFavorite)
          }
        })
        .catch(() => {})
    }
  }, [businessId, userId])

  async function toggleFavorite() {
    if (!userId) {
      toast({
        title: "נדרש להתחבר",
        description: "יש להתחבר כדי לשמור מועדפים",
        variant: "destructive",
      })
      router.push(`/auth/login?callbackUrl=/business/${businessId}`)
      return
    }

    setLoading(true)

    try {
      if (isFavorite) {
        const res = await fetch(`/api/favorites?businessId=${businessId}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error("שגיאה")
        setIsFavorite(false)
        toast({
          title: "הוסר ממועדפים",
          description: "העסק הוסר מהרשימה שלך",
        })
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId }),
        })
        if (!res.ok) throw new Error("שגיאה")
        setIsFavorite(true)
        toast({
          title: "נוסף למועדפים",
          description: "העסק נוסף לרשימת המועדפים שלך",
        })
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן מועדפים",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={loading}
      className={`h-12 w-12 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 relative shadow-lg hover:shadow-xl ${
        isFavorite 
          ? "bg-gradient-to-br from-red-500 via-red-500 to-pink-500 hover:from-red-600 hover:via-red-600 hover:to-pink-600 border-2 border-red-400 text-white" 
          : "bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600"
      }`}
      title={isFavorite ? "הסר ממועדפים" : "הוסף למועדפים"}
      aria-label={isFavorite ? "הסר ממועדפים" : "הוסף למועדפים"}
    >
      <Heart
        className={`h-6 w-6 transition-all duration-300 ${
          isFavorite 
            ? "fill-white text-white scale-110 animate-in zoom-in-50" 
            : "text-red-500 dark:text-red-400 fill-transparent hover:fill-red-200 dark:hover:fill-red-800"
        }`}
        strokeWidth={isFavorite ? 2 : 2.5}
      />
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      )}
    </Button>
  )
}
