"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Upload } from "lucide-react"
import Image from "next/image"

interface BusinessImage {
  id: string
  url: string
  caption: string | null
  createdAt: Date
}

export function GalleryManager({ businessId, images }: { businessId: string; images: BusinessImage[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch("/api/businesses/images", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("שגיאה")

      toast({
        title: "✓ התמונה הועלתה!",
      })

      setShowForm(false)
      e.currentTarget.reset()
      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להעלות תמונה",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("האם למחוק תמונה זו?")) return

    try {
      const res = await fetch(`/api/businesses/images/${imageId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("שגיאה")

      toast({
        title: "✓ התמונה נמחקה",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק תמונה",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 ml-2" />
          הוסף תמונה
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
          <input type="hidden" name="businessId" value={businessId} />
          
          <div className="space-y-2">
            <Label htmlFor="image">בחר תמונה *</Label>
            <Input 
              id="image" 
              name="image" 
              type="file"
              accept="image/*"
              required 
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">JPG, PNG או GIF עד 5MB</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">כיתוב (אופציונלי)</Label>
            <Input 
              id="caption" 
              name="caption" 
              placeholder="תיאור התמונה"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "מעלה..." : "העלה תמונה"}
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

      {images.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground py-8">
          אין תמונות עדיין. הוסף את התמונה הראשונה!
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="relative group rounded-lg overflow-hidden border shadow-sm">
            <img
              src={image.url}
              alt={image.caption || ""}
              className="h-40 w-full object-cover"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                {image.caption}
              </div>
            )}
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(image.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

