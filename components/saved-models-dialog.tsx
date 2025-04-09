"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface SavedModelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  savedModels: Array<{ url: string; name: string }>
  onSelectModel: (url: string) => void
  onDeleteModel: (index: number) => void
}

export default function SavedModelsDialog({
  open,
  onOpenChange,
  savedModels,
  onSelectModel,
  onDeleteModel,
}: SavedModelsDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const content = (
    <div className="py-4">
      {savedModels.length === 0 ? (
        <div className="text-center text-gray-400 py-8">У вас пока нет сохраненных моделей</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedModels.map((model, index) => (
            <div key={index} className="border border-white/10 rounded-lg overflow-hidden bg-black/50 relative group">
              <div className="h-40 cursor-pointer" onClick={() => onSelectModel(model.url)}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-2 border-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white/50 text-4xl">3D</span>
                  </div>
                </div>
              </div>
              <div className="p-3 flex justify-between items-center">
                <div className="text-sm text-white truncate">{model.name}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-red-900/20"
                  onClick={() => onDeleteModel(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-black border-[rgba(255,255,255,0.12)] text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white font-mono tracking-normal">Сохраненные модели</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black border-t border-[rgba(255,255,255,0.12)] text-white">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-xl text-white font-mono tracking-normal">Сохраненные модели</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">{content}</div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
