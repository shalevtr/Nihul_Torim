"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface BusinessImage {
  id: string
  url: string
  caption?: string | null
}

interface BusinessGalleryProps {
  businessId: string
  images: BusinessImage[]
  isOwner: boolean
}

export function BusinessGallery({ businessId, images, isOwner }: BusinessGalleryProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleAddImage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const url = formData.get("url") as string
    const caption = formData.get("caption") as string

    try {
      const res = await fetch("/api/businesses/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, url, caption }),
      })

      if (!res.ok) throw new Error("שגיאה בהוספת תמונה")

      toast({
        title: "הצלחה",
        description: "התמונה נוספה בהצלחה",
      })

      window.location.reload()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף תמונה",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (images.length === 0 && !isOwner) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">גלריה</h2>
        {isOwner && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">הוסף תמונה</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>הוסף תמונה</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddImage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">קישור לתמונה (URL)</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    required
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption">כותרת (אופציונלי)</Label>
                  <Input id="caption" name="caption" />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "מוסיף..." : "הוסף"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {images.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {images.map((image) => (
            <div key={image.id} className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={image.url}
                alt={image.caption || "תמונת עסק"}
                fill
                className="object-cover"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">אין תמונות עדיין</p>
      )}
    </div>
  )
}

