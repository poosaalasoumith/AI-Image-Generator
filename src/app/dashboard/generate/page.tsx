"use client"

import { useState, useEffect, Suspense } from "react"
import { generateImageAction } from "@/actions/generate"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles, Download, Copy, AlertCircle, Image as ImageIcon, Maximize2, X, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { PageTransition } from "@/components/page-transition"

function GeneratePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [prompt, setPrompt] = useState(searchParams.get("prompt") || "")
  const [style, setStyle] = useState(searchParams.get("style") || "none")
  
  const [images, setImages] = useState<string[]>([])
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImageModal(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleGenerate(currentPrompt: string, currentStyle: string, isVariation = false) {
    if (!currentPrompt) {
      toast.error("Prompt is required")
      return
    }

    if (!isVariation) {
      setImages([]) // Clear when submitting a brand new prompt via form
    }

    setIsGenerating(true)
    if (isVariation) {
      toast.info("Generating variation...")
    }

    const formData = new FormData()
    formData.append("prompt", currentPrompt)
    formData.append("style", currentStyle)
    
    if (isVariation) {
      const randomSeed = Math.floor(Math.random() * 1000000)
      formData.append("seed", randomSeed.toString())
    }

    const result = await generateImageAction(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsGenerating(false)
      return
    }

    if (result?.imageUrl) {
      setImages((prev) => [result.imageUrl, ...prev])
      toast.success(isVariation ? "Variation generated successfully!" : "Image generated successfully!")
      router.refresh() // Refreshes the server-side layouts to update credits instantly
    }
    
    setIsGenerating(false)
  }

  const copyToClipboard = (url: string) => {
    if (url) {
      navigator.clipboard.writeText(url)
      toast.success("Image URL copied to clipboard")
    }
  }

  const handleDownload = async (url: string) => {
    if (!url) return;
    toast.info("Download started...");
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error("Failed to download image");
    }
  }

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Generate Image</h2>
        <p className="text-muted-foreground">
          Turn your ideas into stunning visuals using AI.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Input 
                  id="prompt" 
                  name="prompt" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic city at sunset..." 
                  required 
                  className="transition-shadow focus-visible:ring-primary/50"
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Describe what you want to see in detail.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style (Optional)</Label>
                <Select value={style} onValueChange={(val) => setStyle(val || "none")} disabled={isGenerating}>
                  <SelectTrigger className="transition-shadow focus:ring-primary/50">
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Let AI decide)</SelectItem>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                    <SelectItem value="3d-render">3D Render</SelectItem>
                    <SelectItem value="oil-painting">Oil Painting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => handleGenerate(prompt, style, false)} 
                disabled={isGenerating || !prompt} 
                className="w-full hover:shadow-md transition-all"
              >
                {isGenerating && images.length === 0 ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Results</Label>
            {images.length > 0 && !isGenerating && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleGenerate(prompt, style, true)}
                className="h-8 text-xs font-medium"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Generate Variation
              </Button>
            )}
          </div>
          
          {images.length === 0 && !isGenerating ? (
            <div className="border rounded-xl bg-card flex flex-col items-center justify-center overflow-hidden aspect-square relative shadow-sm">
              <div className="text-center p-6 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your generated images will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {isGenerating && (
                <div className="border rounded-xl bg-muted/20 flex flex-col items-center justify-center overflow-hidden aspect-square relative shadow-sm animate-pulse">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                    <Sparkles className="h-10 w-10 text-primary/60 relative z-10 animate-bounce" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Generating variation...</p>
                </div>
              )}
              {images.map((imgUrl, idx) => (
                <div key={idx} className="border rounded-xl bg-card flex flex-col items-center justify-center overflow-hidden aspect-square relative shadow-sm group">
                  <img 
                    src={imgUrl} 
                    alt="Generated Image" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <Button size="icon" variant="secondary" className="hover:scale-105 transition-transform" onClick={() => setSelectedImageModal(imgUrl)} title="Maximize Image" aria-label="Maximize Image">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="hover:scale-105 transition-transform" onClick={() => copyToClipboard(imgUrl)} title="Copy URL" aria-label="Copy Image URL">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="hover:scale-105 transition-transform" onClick={() => handleDownload(imgUrl)} title="Download Image" aria-label="Download Image">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Maximize Image Modal */}
      {selectedImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImageModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image Preview"
        >
          <div className="relative max-w-5xl w-full flex flex-col items-center justify-center outline-none">
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute -top-12 right-0 md:-right-12 md:top-0 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedImageModal(null); }}
              aria-label="Close Preview"
            >
              <X className="h-5 w-5" />
            </Button>
            <img 
              src={selectedImageModal} 
              alt="Generated Image Fullscreen" 
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </PageTransition>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <GeneratePageContent />
    </Suspense>
  )
}
