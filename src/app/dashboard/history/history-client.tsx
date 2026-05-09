"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Maximize2, RefreshCw, X, Calendar, Trash2, CheckSquare, Square, ImageOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { deleteImagesAction } from "@/actions/history"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

type ImageRecord = {
  id: string
  prompt: string
  style: string
  url: string
  createdAt: string
}

export function HistoryClient({ initialImages }: { initialImages: ImageRecord[] }) {
  const router = useRouter()
  const [localImages, setLocalImages] = useState<ImageRecord[]>(initialImages)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null)
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  
  // Deletion State
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, type: "single" | "multi", targetId?: string}>({ isOpen: false, type: "single" })

  useEffect(() => {
    setLocalImages(initialImages)
  }, [initialImages])

  const filteredImages = useMemo(() => {
    if (!searchQuery) return localImages
    const query = searchQuery.toLowerCase()
    return localImages.filter(img => 
      img.prompt.toLowerCase().includes(query) || 
      img.style.toLowerCase().includes(query)
    )
  }, [localImages, searchQuery])

  // Handle ESC key for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false)
        setConfirmModal({ isOpen: false, type: "single" })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDownload = async (url: string) => {
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

  const openImageModal = (img: ImageRecord) => {
    setSelectedImage(img)
    setIsModalOpen(true)
  }

  // Selection Logic
  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    if (newSelected.size === 0) {
      setIsSelectionMode(false)
    } else {
      setIsSelectionMode(true)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredImages.length) {
      setSelectedIds(new Set())
      setIsSelectionMode(false)
    } else {
      const allIds = new Set(filteredImages.map(img => img.id))
      setSelectedIds(allIds)
      setIsSelectionMode(true)
    }
  }

  const cancelSelection = () => {
    setSelectedIds(new Set())
    setIsSelectionMode(false)
  }

  // Deletion Logic
  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    
    let idsToDelete: string[] = []
    if (confirmModal.type === "single" && confirmModal.targetId) {
      idsToDelete = [confirmModal.targetId]
    } else if (confirmModal.type === "multi") {
      idsToDelete = Array.from(selectedIds)
    }

    if (idsToDelete.length === 0) {
      setIsDeleting(false)
      return
    }

    // Optimistic UI Update
    setLocalImages(prev => prev.filter(img => !idsToDelete.includes(img.id)))
    setSelectedIds(new Set())
    setIsSelectionMode(false)
    setConfirmModal({ isOpen: false, type: "single" })
    
    // Server Deletion
    const result = await deleteImagesAction(idsToDelete)
    
    if (result.error) {
      toast.error(result.error)
      // Rollback
      setLocalImages(initialImages)
    } else {
      toast.success(idsToDelete.length === 1 ? "Image deleted successfully" : `${idsToDelete.length} images deleted successfully`)
      router.refresh()
    }
    
    setIsDeleting(false)
  }

  return (
    <div className="space-y-6 relative pb-24">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search prompts or styles..." 
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {filteredImages.length > 0 && (
          <Button 
            variant="outline" 
            onClick={toggleSelectAll}
            className="w-full sm:w-auto min-w-[140px]"
          >
            {selectedIds.size === filteredImages.length ? (
              <><CheckSquare className="mr-2 h-4 w-4" /> Deselect All</>
            ) : (
              <><Square className="mr-2 h-4 w-4" /> Select All</>
            )}
          </Button>
        )}
      </div>

      {filteredImages.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-16 text-center border-dashed rounded-2xl bg-card border"
        >
          <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
            <ImageOff className="h-10 w-10 text-muted-foreground opacity-70" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No generations yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery ? "Try adjusting your search query to find what you're looking for." : "You haven't generated any images yet. Head over to the generator to bring your ideas to life!"}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/generate">
              <Button size="lg">Start Generating</Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredImages.map((img) => {
              const isSelected = selectedIds.has(img.id)
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  key={img.id} 
                  className={`group relative rounded-xl overflow-hidden border bg-card aspect-square transition-all duration-300 ${isSelected ? 'ring-4 ring-primary border-primary shadow-lg scale-[0.98]' : 'shadow-sm hover:shadow-md'}`}
                  onClick={(e) => {
                    if (isSelectionMode) toggleSelection(img.id, e as any)
                    else openImageModal(img)
                  }}
                >
                  <img 
                    src={img.url} 
                    alt={img.prompt} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 pointer-events-none ${isSelected ? 'opacity-30' : 'opacity-0 group-hover:opacity-100'}`} />
                  
                  {/* Selection Checkbox */}
                  <div className={`absolute top-3 left-3 z-10 transition-opacity duration-200 ${(isSelected || isSelectionMode) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Button 
                      size="icon" 
                      variant={isSelected ? "default" : "secondary"} 
                      className={`h-8 w-8 rounded-md shadow-sm ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white/90 text-zinc-900 hover:bg-white'}`}
                      onClick={(e) => toggleSelection(img.id, e as any)}
                    >
                      {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 opacity-50" />}
                    </Button>
                  </div>

                  {/* Top Right Actions */}
                  {!isSelectionMode && (
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <Button size="icon" variant="destructive" className="h-8 w-8 hover:scale-105 shadow-sm" onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, type: "single", targetId: img.id }) }} title="Delete Image">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Bottom Info Overlay */}
                  <div className={`absolute bottom-0 left-0 right-0 p-3 translate-y-4 transition-all duration-300 z-10 ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}>
                    <p className="text-white text-xs line-clamp-2 mb-2 font-medium drop-shadow-md">
                      {img.prompt}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/generate?prompt=${encodeURIComponent(img.prompt)}&style=${encodeURIComponent(img.style)}`} onClick={e => e.stopPropagation()} className="flex-1">
                        <Button size="sm" className="w-full h-8 text-xs bg-white text-black hover:bg-gray-200">
                          <RefreshCw className="mr-1.5 h-3 w-3" />
                          Reuse
                        </Button>
                      </Link>
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/20 hover:bg-white/40 text-white backdrop-blur border-0" onClick={(e) => { e.stopPropagation(); handleDownload(img.url); }} title="Download Image">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Action Bar for Bulk Delete */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-card border shadow-2xl rounded-full px-6 py-3 flex items-center gap-6"
          >
            <div className="text-sm font-medium">
              <span className="bg-primary text-primary-foreground w-6 h-6 inline-flex items-center justify-center rounded-full text-xs mr-2">{selectedIds.size}</span>
              Selected
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={cancelSelection} disabled={isDeleting} className="rounded-full">
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setConfirmModal({ isOpen: true, type: "multi" })} disabled={isDeleting} className="rounded-full px-6 shadow-md">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Dialog */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setConfirmModal({ isOpen: false, type: "single" })}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-card border shadow-2xl rounded-2xl p-6 w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-destructive/20">
                <div className="h-full bg-destructive w-1/3" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Generation{confirmModal.type === "multi" && selectedIds.size > 1 ? 's' : ''}</h3>
              <p className="text-muted-foreground mb-8">
                Are you sure you want to delete {confirmModal.type === "multi" ? `these ${selectedIds.size} images` : "this image"}? This action cannot be undone and will permanently remove the files from our servers.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setConfirmModal({ isOpen: false, type: "single" })} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting} className="w-[120px]">
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Maximize Image Modal */}
      <AnimatePresence>
        {isModalOpen && selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setIsModalOpen(false)}
            role="dialog"
          >
            <div className="relative max-w-5xl w-full flex flex-col md:flex-row items-center justify-center outline-none gap-4">
              <Button 
                size="icon" 
                variant="secondary" 
                className="absolute -top-12 right-0 md:-right-12 md:top-0 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
              >
                <X className="h-5 w-5" />
              </Button>
              
              <motion.img 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                src={selectedImage.url} 
                alt={selectedImage.prompt} 
                className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain rounded-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              
              <motion.div 
                initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="bg-card/95 backdrop-blur text-card-foreground p-5 rounded-2xl shadow-xl max-w-md w-full border border-white/5" 
                onClick={e => e.stopPropagation()}
              >
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  {new Date(selectedImage.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Prompt</p>
                    <p className="text-sm leading-relaxed">{selectedImage.prompt}</p>
                  </div>
                  {selectedImage.style && selectedImage.style !== "none" && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Style</p>
                      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                        {selectedImage.style}
                      </span>
                    </div>
                  )}
                  <div className="pt-4 flex gap-3 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => handleDownload(selectedImage.url)}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Link href={`/dashboard/generate?prompt=${encodeURIComponent(selectedImage.prompt)}&style=${encodeURIComponent(selectedImage.style)}`} className="flex-1">
                      <Button className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" /> Reuse
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
