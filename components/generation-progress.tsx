"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface GenerationProgressProps {
  isLoading: boolean
  jobStatuses: Array<{ uuid: string; status: string }>
  currentStep: string | null
}

export default function GenerationProgress({ isLoading, jobStatuses, currentStep }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      setAnimationComplete(false)
      return
    }

    // Calculate progress based on job statuses
    const actualTasks = jobStatuses.length
    const totalTasks = actualTasks > 0 ? actualTasks + 2 : 3 // Add initial request and finalization
    const completedJobTasks = jobStatuses.filter((job) => job.status === "Done").length
    const initialRequestComplete = actualTasks > 0 ? 1 : 0
    const completedTasks = completedJobTasks + initialRequestComplete

    // Calculate percentage (0-100)
    const calculatedProgress =
      totalTasks > 0
        ? (completedTasks / totalTasks) * 100
        : currentStep === "Подготовка запроса..."
          ? 10
          : currentStep === "Отправка запроса на сервер..."
            ? 20
            : currentStep === "Генерация 3D модели..."
              ? 40
              : currentStep === "Финализация модели..."
                ? 90
                : 30

    setProgress(calculatedProgress)

    // Simulate progress animation for better UX
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Don't increment beyond 95% until we're actually done
        if (prev < 95 && !animationComplete) {
          return prev + 0.2
        }
        return prev
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isLoading, jobStatuses, currentStep, animationComplete])

  // Set animation complete when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      setAnimationComplete(true)
    }
  }, [progress])

  if (!isLoading) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl w-80"
      >
        <div className="w-full space-y-6">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-16 h-16 mb-4"
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={[1, 2]}
                  animate={{
                    strokeDasharray: ["1 150", "125 150", "150 150"],
                    strokeDashoffset: [0, -35, -75],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </svg>
            </motion.div>

            <h3 className="text-white text-xl font-medium mb-1">Создание 3D модели</h3>
            <p className="text-gray-300 text-sm mb-4 text-center">{currentStep || "Обработка..."}</p>
          </div>

          <div className="w-full">
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="mt-2 text-right text-xs text-gray-400">{Math.round(progress)}%</div>
          </div>

          <div className="text-center text-xs text-gray-400 italic">Это может занять несколько минут</div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
