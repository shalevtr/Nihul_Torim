"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart } from "lucide-react"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  async function fetchFavorites() {
    try {
      const res = await fetch("/api/favorites")
      const data = await res.json()
      setFavorites(data)
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl flex items-center gap-2">
          <Heart className="h-8 w-8 fill-red-500 text-red-500" />
          המועדפים שלי
        </h1>
        <p className="text-gray-600">כל העסקים שאהבת</p>
      </div>

      {loading ? (
        <p className="text-center py-8">טוען...</p>
      ) : favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-muted-foreground mb-4">אין מועדפים עדיין</p>
            <Button asChild>
              <Link href="/dashboard/search">חפש עסקים</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav: any) => (
            <Link key={fav.id} href={`/business/${fav.business.id}`}>
              <Card className="overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full">
                {fav.business.logo && (
                  <div className="h-32 overflow-hidden bg-gray-100">
                    <img 
                      src={fav.business.logo} 
                      alt={fav.business.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{fav.business.name}</CardTitle>
                  <CardDescription>
                    <span className="inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
                      {fav.business.category}
                    </span>
                    {fav.business.city && <span className="mr-2 text-sm">• {fav.business.city}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fav.business.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {fav.business.description}
                    </p>
                  )}
                  <div className="rounded-lg bg-red-500 py-2 text-center text-sm font-semibold text-white">
                    ❤️ לחץ לצפייה
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

