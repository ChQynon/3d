"use client"

import { useState, useEffect } from "react"
import { Download, ArrowLeft, Save } from "lucide-react"
import type { FormValues } from "@/lib/form-schema"
import { submitRodinJob, checkJobStatus, downloadModel } from "@/lib/api-service"
import ModelViewer from "./model-viewer"
import Form from "./form"
import OptionsDialog from "./options-dialog"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import GenerationProgress from "./generation-progress"
import { useToast } from "./toast-container"
import BurgerMenu from "./burger-menu"

export default function Rodin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [jobStatuses, setJobStatuses] = useState<Array<{ uuid: string; status: string }>>([])
  const [showOptions, setShowOptions] = useState(false)
  const [showPromptContainer, setShowPromptContainer] = useState(true)
  const [savedModels, setSavedModels] = useState<Array<{ url: string; name: string }>>([])
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [generationStep, setGenerationStep] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { showToast } = useToast()
  const [options, setOptions] = useState({
    condition_mode: "concat" as const,
    quality: "medium" as const,
    geometry_file_format: "glb" as const,
    use_hyper: false,
    tier: "Regular" as const,
    TAPose: false,
    material: "PBR" as const,
  })

  // Load saved models from localStorage on initial render
  useEffect(() => {
    const savedModelsData = localStorage.getItem("savedModels")
    if (savedModelsData) {
      try {
        setSavedModels(JSON.parse(savedModelsData))
      } catch (e) {
        console.error("Failed to parse saved models", e)
      }
    }
  }, [])

  // Prevent body scroll on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"

      return () => {
        document.body.style.overflow = ""
        document.documentElement.style.overflow = ""
      }
    }
  }, [isMobile])

  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      showToast(error, "error")
    }
  }, [error, showToast])

  const handleOptionsChange = (newOptions: any) => {
    setOptions(newOptions)
  }

  async function handleStatusCheck(subscriptionKey: string, taskUuid: string) {
    try {
      setIsPolling(true)

      const data = await checkJobStatus(subscriptionKey)
      console.log("Status response:", data)

      // Check if jobs array exists
      if (!data.jobs || !Array.isArray(data.jobs) || data.jobs.length === 0) {
        throw new Error("No jobs found in status response")
      }

      // Update job statuses
      setJobStatuses(data.jobs)

      // Check status of all jobs
      const allJobsDone = data.jobs.every((job: any) => job.status === "Done")
      const anyJobFailed = data.jobs.some((job: any) => job.status === "Failed")

      if (allJobsDone) {
        setIsPolling(false)
        setGenerationStep("Финализация модели...")

        // Get the download URL using the task UUID
        try {
          const downloadData = await downloadModel(taskUuid)
          console.log("Download response:", downloadData)

          // Check if there's an error in the download response
          if (downloadData.error && downloadData.error !== "OK") {
            throw new Error(`Download error: ${downloadData.error}`)
          }

          // Find the first GLB file to display in the 3D viewer
          if (downloadData.list && downloadData.list.length > 0) {
            const glbFile = downloadData.list.find((file: { name: string }) => file.name.toLowerCase().endsWith(".glb"))

            if (glbFile) {
              const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(glbFile.url)}`
              setModelUrl(proxyUrl)
              setDownloadUrl(glbFile.url)
              setIsLoading(false)
              setShowPromptContainer(false)
              setGenerationStep(null)
              showToast("Модель успешно создана!", "success")
            } else {
              setError("Не найден GLB файл в результатах")
              setIsLoading(false)
              setGenerationStep(null)
            }
          } else {
            setError("Нет доступных файлов для скачивания")
            setIsLoading(false)
            setGenerationStep(null)
          }
        } catch (downloadErr) {
          setError(
            `Не удалось загрузить модель: ${downloadErr instanceof Error ? downloadErr.message : "Неизвестная ошибка"}`,
          )
          setIsLoading(false)
          setGenerationStep(null)
        }
      } else if (anyJobFailed) {
        setIsPolling(false)
        setError("Задача генерации не удалась")
        setIsLoading(false)
        setGenerationStep(null)
      } else {
        // Still processing, poll again after a delay
        setTimeout(() => handleStatusCheck(subscriptionKey, taskUuid), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось проверить статус")
      setIsPolling(false)
      setIsLoading(false)
      setGenerationStep(null)
    }
  }

  async function handleSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setModelUrl(null)
    setDownloadUrl(null)
    setJobStatuses([])
    setGenerationStep("Подготовка запроса...")

    // Save the current prompt for model naming
    if (values.prompt) {
      setCurrentPrompt(values.prompt)
    } else {
      setCurrentPrompt("3D модель")
    }

    try {
      const formData = new FormData()

      if (values.images && values.images.length > 0) {
        values.images.forEach((image) => {
          formData.append("images", image)
        })
      }

      if (values.prompt) {
        formData.append("prompt", values.prompt)
      }

      // Add all the advanced options
      formData.append("condition_mode", options.condition_mode)
      formData.append("geometry_file_format", options.geometry_file_format)
      formData.append("material", options.material)
      formData.append("quality", options.quality)
      formData.append("use_hyper", options.use_hyper.toString())
      formData.append("tier", options.tier)
      formData.append("TAPose", options.TAPose.toString())
      formData.append("mesh_mode", "Quad")
      formData.append("mesh_simplify", "true")
      formData.append("mesh_smooth", "true")

      setGenerationStep("Отправка запроса на сервер...")

      // Make the API call through our server route
      const data = await submitRodinJob(formData)
      console.log("Generation response:", data)

      setResult(data)
      setGenerationStep("Генерация 3D модели...")

      // Start polling for status
      if (data.jobs && data.jobs.subscription_key && data.uuid) {
        handleStatusCheck(data.jobs.subscription_key, data.uuid)
      } else {
        setError("Отсутствуют необходимые данные для проверки статуса")
        setIsLoading(false)
        setGenerationStep(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла неизвестная ошибка")
      setIsLoading(false)
      setGenerationStep(null)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank")
      showToast("Скачивание модели началось", "info")
    }
  }

  const handleBack = () => {
    setShowPromptContainer(true)
  }

  const handleSaveModel = () => {
    if (modelUrl && downloadUrl) {
      // Create a name for the model based on the prompt
      const modelName =
        currentPrompt.length > 30 ? currentPrompt.substring(0, 30) + "..." : currentPrompt || "3D модель"

      // Add to saved models
      const newSavedModels = [
        ...savedModels,
        {
          url: modelUrl,
          name: modelName,
        },
      ]

      // Update state and save to localStorage
      setSavedModels(newSavedModels)
      localStorage.setItem("savedModels", JSON.stringify(newSavedModels))

      // Show confirmation toast
      showToast("Модель успешно сохранена!", "success")
    }
  }

  const handleSelectModel = (url: string) => {
    setModelUrl(url)
    setShowPromptContainer(false)
  }

  const handleDeleteModel = (index: number) => {
    const newSavedModels = [...savedModels]
    newSavedModels.splice(index, 1)
    setSavedModels(newSavedModels)
    localStorage.setItem("savedModels", JSON.stringify(newSavedModels))
    showToast("Модель удалена", "info")
  }

  return (
    <div className="relative h-[100dvh] w-full">
      {/* Full-screen canvas */}
      <div className="absolute inset-0 z-0">
        <ModelViewer modelUrl={isLoading ? null : modelUrl} />
      </div>

      {/* Overlay UI - Increased z-index to ensure visibility */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Logo in top left */}
        <div className="absolute top-6 left-6 pointer-events-auto z-30">
          <h1 className="text-3xl text-white font-normal tracking-normal">Генератор 3D Моделей</h1>
          <p className="text-gray-400 text-sm mt-1 tracking-normal">by plexy.3d</p>
        </div>

        {/* Burger menu in top right */}
        <div className="pointer-events-auto z-30">
          <BurgerMenu savedModels={savedModels} onSelectModel={handleSelectModel} onDeleteModel={handleDeleteModel} />
        </div>

        {/* Loading indicator with beautiful animation */}
        {isLoading && (
          <GenerationProgress isLoading={isLoading} jobStatuses={jobStatuses} currentStep={generationStep} />
        )}

        {/* Model controls when model is loaded */}
        {!isLoading && modelUrl && !showPromptContainer && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 pointer-events-auto z-30">
            <Button
              onClick={handleBack}
              className="bg-black hover:bg-gray-900 text-white border border-white/20 rounded-full px-4 py-2 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="tracking-normal">Назад</span>
            </Button>

            <Button
              onClick={handleSaveModel}
              className="bg-black hover:bg-gray-900 text-white border border-white/20 rounded-full px-4 py-2 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="tracking-normal">Сохранить</span>
            </Button>

            <Button
              onClick={handleDownload}
              className="bg-white hover:bg-gray-200 text-black rounded-full px-4 py-2 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="tracking-normal">Скачать</span>
            </Button>
          </div>
        )}

        {/* Input field at bottom */}
        {showPromptContainer && (
          <div className="absolute bottom-8 left-0 right-0 w-full flex justify-center items-center pointer-events-auto z-30">
            <div className="w-full max-w-3xl px-4 sm:px-0">
              <Form isLoading={isLoading} onSubmit={handleSubmit} onOpenOptions={() => setShowOptions(true)} />
            </div>
          </div>
        )}
      </div>

      {/* Options Dialog/Drawer */}
      <OptionsDialog
        open={showOptions}
        onOpenChange={setShowOptions}
        options={options}
        onOptionsChange={handleOptionsChange}
      />
      {/* Creator Button */}
      <div className="absolute bottom-2 right-4 pointer-events-auto z-30">
        <a
          href="https://t.me/qynon"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white text-sm transition-colors tracking-normal"
        >
          создано qynon
        </a>
      </div>
    </div>
  )
}
