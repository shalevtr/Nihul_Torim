"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const { toast } = useToast()
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to cancel")

      setCancelled(true)
      toast({
        title: "✓ התור בוטל בהצלחה",
        description: "אפשר לחזור בך תוך 10 שניות",
      })
      
      // Auto close dialog after 10 seconds
      setTimeout(() => {
        if (cancelled) {
          setShowDialog(false)
          router.refresh()
        }
      }, 10000)
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לבטל את התור",
        variant: "destructive",
      })
      setShowDialog(false)
    } finally {
      setLoading(false)
    }
  }

  function handleUndo() {
    setCancelled(false)
    setShowDialog(false)
    toast({
      title: "ביטול בוטל",
      description: "התור נשמר",
    })
    router.refresh()
  }

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => setShowDialog(true)}
        className="flex-1"
      >
        בטל תור
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {cancelled ? "✓ התור בוטל!" : "האם לבטל את התור?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {cancelled 
                ? "אתה יכול לחזור בך תוך 10 שניות. לאחר מכן הביטול יהיה סופי."
                : "פעולה זו תבטל את התור. ניתן לקבוע תור חדש בכל זמן."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {cancelled ? (
              <>
                <AlertDialogAction 
                  onClick={handleUndo} 
                  className="bg-green-600 hover:bg-green-700 text-lg py-6"
                >
                  חזור בך - שמור את התור
                </AlertDialogAction>
                <AlertDialogCancel onClick={() => router.refresh()} className="text-lg py-6">
                  אישור ביטול
                </AlertDialogCancel>
              </>
            ) : (
              <>
                <AlertDialogCancel className="text-lg py-6">לא, שמור את התור</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-lg py-6"
                >
                  {loading ? "מבטל..." : "כן, בטל את התור"}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
