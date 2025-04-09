"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "info"

interface ToastProps {
  message: string
  type: ToastType
  id: string
  onClose: (id: string) => void
}

export default function Toast({ message, type, id, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 5000)

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 0.5
      })
    }, 25)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [id, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />
      case "info":
        return <AlertCircle className="h-5 w-5 text-blue-400" />
      default:
        return null
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-green-900/50 to-green-800/30"
      case "error":
        return "bg-gradient-to-r from-red-900/50 to-red-800/30"
      case "info":
        return "bg-gradient-to-r from-blue-900/50 to-blue-800/30"
      default:
        return "bg-gradient-to-r from-gray-900/50 to-gray-800/30"
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-green-500/30"
      case "error":
        return "border-red-500/30"
      case "info":
        return "border-blue-500/30"
      default:
        return "border-gray-500/30"
    }
  }

  const getProgressColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "info":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "w-full max-w-sm rounded-lg border backdrop-blur-md shadow-lg pointer-events-auto overflow-hidden",
        getBgColor(),
        getBorderColor(),
      )}
    >
      <div className="p-4 flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-white">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-200 focus:outline-none"
            onClick={() => onClose(id)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="h-1 w-full bg-black/20">
        <div
          className={cn("h-full transition-all duration-100", getProgressColor())}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  )
}
