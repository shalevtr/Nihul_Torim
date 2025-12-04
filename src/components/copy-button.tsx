"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Copy } from "lucide-react"

interface CopyButtonProps {
  url: string
}

export function CopyButton({ url }: CopyButtonProps) {
  const { toast } = useToast()

  function handleCopy() {
    navigator.clipboard.writeText(url)
    toast({
      title: "✓ הקישור הועתק!",
      description: "אפשר להדביק ולשתף",
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <Copy className="h-4 w-4 ml-1" />
      העתק
    </Button>
  )
}



