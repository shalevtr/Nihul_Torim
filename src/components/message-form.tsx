"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface MessageFormProps {
  businessId: string
}

export function MessageForm({ businessId }: MessageFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!user) {
      router.push(`/auth/login?callbackUrl=/business/${businessId}`)
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const content = formData.get("content") as string

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, content }),
      })

      if (!res.ok) throw new Error("שגיאה בשליחת הודעה")

      toast({
        title: "הצלחה",
        description: "ההודעה נשלחה בהצלחה",
      })

      e.currentTarget.reset()
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח הודעה",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        name="content"
        placeholder="כתוב הודעה לעסק..."
        required
        rows={4}
        className="text-base resize-none"
      />
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "שולח..." : "שלח הודעה"}
      </Button>
    </form>
  )
}

