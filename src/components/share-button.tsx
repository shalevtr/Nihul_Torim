"use client"

import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
  businessId: string
  businessName: string
}

export function ShareButton({ businessId, businessName }: ShareButtonProps) {
  const { toast } = useToast()
  const url = typeof window !== "undefined" ? `${window.location.origin}/b/${businessId}` : ""

  function shareWhatsApp() {
    const text = `היי! מצאתי עסק מעולה: ${businessName}\nתבדוק: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
  }

  function copyLink() {
    navigator.clipboard.writeText(url)
    toast({
      title: "✓ הקישור הועתק!",
      description: "אפשר להדביק ולשתף",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 border-2 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
          title="שתף עסק זה"
          aria-label="שתף עסק זה"
        >
          <Share2 className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuItem 
          onClick={shareWhatsApp} 
          className="cursor-pointer rounded-lg p-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-lg">📱</span>
            </div>
            <div className="flex flex-col">
              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">WhatsApp</span>
              <span className="text-xs text-muted-foreground">שיתוף מהיר</span>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={shareFacebook} 
          className="cursor-pointer rounded-lg p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-lg">📘</span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">Facebook</span>
              <span className="text-xs text-muted-foreground">פוסט חדש</span>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={copyLink} 
          className="cursor-pointer rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-lg">📋</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">העתק קישור</span>
              <span className="text-xs text-muted-foreground">להדבקה</span>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
