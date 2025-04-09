"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BurgerMenuProps {
  savedModels: Array<{ url: string; name: string }>
  onSelectModel: (url: string) => void
  onDeleteModel: (index: number) => void
}

export default function BurgerMenu({ savedModels, onSelectModel, onDeleteModel }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative z-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="fixed top-6 right-6 bg-black/80 backdrop-blur-md border border-white/10 rounded-full h-10 w-10 flex items-center justify-center text-white hover:bg-white/10"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={toggleMenu}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-md border-l border-white/10 shadow-xl overflow-y-auto z-50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-white flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Сохраненные модели
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMenu}
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {savedModels.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <div className="mb-4 flex justify-center">
                      <Save className="h-12 w-12 opacity-20" />
                    </div>
                    <p>У вас пока нет сохраненных моделей</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedModels.map((model, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-white/10 rounded-lg overflow-hidden bg-black/50 group"
                      >
                        <div
                          className="h-32 cursor-pointer relative overflow-hidden"
                          onClick={() => {
                            onSelectModel(model.url)
                            toggleMenu()
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center"
                            >
                              <span className="text-white/50 text-3xl">3D</span>
                            </motion.div>
                          </div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-3"
                          >
                            <span className="text-white text-sm">Нажмите для просмотра</span>
                          </motion.div>
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
