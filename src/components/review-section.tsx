"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Review {
  id: string
  rating: number
  comment: string | null
  reply: string | null
  repliedAt: Date | null
  createdAt: Date
  user: {
    fullName: string | null
    email: string
  }
}

interface ReviewSectionProps {
  businessId: string
  userId?: string
  isBusinessOwner?: boolean
}

export function ReviewSection({ businessId, userId, isBusinessOwner = false }: ReviewSectionProps) {
  const { toast} = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  useEffect(() => {
    fetchReviews()
  }, [businessId])

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/reviews?businessId=${businessId}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setAverageRating(data.averageRating || 0)
      setTotalReviews(data.totalReviews || 0)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) {
      toast({
        title: "נדרש להתחבר",
        description: "יש להתחבר כדי להוסיף ביקורת",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "בחר דירוג",
        description: "יש לבחור כמה כוכבים",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, rating, comment }),
      })

      if (!res.ok) throw new Error("שגיאה בשמירה")

      toast({
        title: "תודה!",
        description: "הביקורת נשמרה בהצלחה",
      })

      setShowForm(false)
      setRating(0)
      setComment("")
      fetchReviews()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור ביקורת",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            ⭐ ביקורות
            {totalReviews > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalReviews})
              </span>
            )}
          </CardTitle>
          {userId && !showForm && (
            <Button onClick={() => setShowForm(true)} size="sm" className="w-full sm:w-auto">
              הוסף ביקורת
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Rating */}
        {totalReviews > 0 && (
          <div className="flex items-center gap-4 rounded-lg bg-indigo-50 p-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              מבוסס על {totalReviews} ביקורות
            </div>
          </div>
        )}

        {/* Add Review Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
            <div>
              <label className="block text-sm font-semibold mb-2">דירוג</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      className={`h-8 w-8 sm:h-10 sm:w-10 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">תגובה (אופציונלי)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="ספר לנו על החוויה שלך..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "שומר..." : "שלח ביקורת"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                ביטול
              </Button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 && !showForm && (
            <p className="text-center text-muted-foreground py-8">
              אין ביקורות עדיין. היה הראשון!
            </p>
          )}
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">
                    {review.user.fullName || review.user.email.split("@")[0]}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("he-IL")}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
              )}
              
              {review.reply && (
                <div className="mt-3 rounded-lg bg-indigo-50 border-r-4 border-indigo-500 p-3">
                  <div className="text-xs font-semibold text-indigo-900 mb-1">
                    תגובת בעל העסק:
                  </div>
                  <p className="text-sm text-gray-700">{review.reply}</p>
                  {review.repliedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(review.repliedAt).toLocaleDateString("he-IL")}
                    </div>
                  )}
                </div>
              )}

              {isBusinessOwner && !review.reply && (
                replyingTo === review.id ? (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="כתוב תגובה..."
                      rows={2}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/reviews/${review.id}/reply`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ reply: replyText }),
                            })
                            if (!res.ok) throw new Error("שגיאה")
                            toast({ title: "✓ התגובה נשמרה" })
                            setReplyingTo(null)
                            setReplyText("")
                            fetchReviews()
                          } catch (error) {
                            toast({ title: "שגיאה", variant: "destructive" })
                          }
                        }}
                      >
                        שלח
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText("")
                        }}
                      >
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => setReplyingTo(review.id)}
                  >
                    הגב לביקורת
                  </Button>
                )
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

