"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Ban } from "lucide-react"

interface BlockCustomerDialogProps {
  businessId: string
  customerId: string
  customerName: string
  onBlocked?: () => void
}

export function BlockCustomerDialog({
  businessId,
  customerId,
  customerName,
  onBlocked,
}: BlockCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleBlock() {
    setLoading(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/block-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          reason: reason || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "שגיאה בחסימת לקוח")
      }

      toast({
        title: "הצלחה",
        description: "הלקוח נחסם בהצלחה",
      })

      setOpen(false)
      setReason("")
      if (onBlocked) onBlocked()
      router.refresh()
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "לא ניתן לחסום לקוח",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Ban className="h-4 w-4 ml-1" />
          חסום לקוח
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>חסימת לקוח</DialogTitle>
          <DialogDescription>
            האם אתה בטוח שברצונך לחסום את {customerName}? הלקוח לא יוכל לקבוע תורים בעסק שלך.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">סיבת החסימה (אופציונלי)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="הסבר מדוע אתה חוסם את הלקוח..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            ביטול
          </Button>
          <Button variant="destructive" onClick={handleBlock} disabled={loading}>
            {loading ? "מתבצע..." : "חסום"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



