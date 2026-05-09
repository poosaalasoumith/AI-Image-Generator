"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function SubmitButton({ 
  text, 
  variant = "default" 
}: { 
  text: string, 
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link" 
}) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" variant={variant} disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : text}
    </Button>
  )
}
