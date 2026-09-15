import { useRef, useState } from "react"
import { ArrowLeft, Sparkles, Upload, X, CheckCircle, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import FoodEntryForm from "./FoodEntryForm"
import { createFoodEntry } from "./foodEntries.api"
import { extractNutrition } from "./ai.api"
import { useAuth } from "../auth/useAuth"

const MAX_FILE_SIZE_MB = 4
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"]

/**
 * Reads a File and resolves with { imageData (base64), mimeType }.
 * Strips the "data:<mime>;base64," prefix so we send only the raw
 * base64 string to the backend.
 */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      const base64 = dataUrl.split(",")[1]
      resolve({ imageData: base64, mimeType: file.type })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function FoodEntryCreatePage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // ── Form submit state ────────────────────────────────────────────────
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── AI extraction state ──────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState(null)   // File object
  const [previewUrl, setPreviewUrl] = useState(null)       // Object URL for img preview
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState("")
  const [aiData, setAiData] = useState(null)               // Extracted + passed to form as initialValues

  // ── File selection ───────────────────────────────────────────────────

  const handleFileChange = (file) => {
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAnalyzeError("Please select a JPEG, PNG, WebP, or HEIC image.")
      return
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setAnalyzeError(`Image must be smaller than ${MAX_FILE_SIZE_MB} MB.`)
      return
    }

    // Clear any previous AI data when a new file is chosen
    setAiData(null)
    setAnalyzeError("")
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleInputChange = (event) => {
    handleFileChange(event.target.files?.[0])
  }

  const handleDrop = (event) => {
    event.preventDefault()
    handleFileChange(event.dataTransfer.files?.[0])
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const clearImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setAiData(null)
    setAnalyzeError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // ── AI analysis ──────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!selectedFile) return

    try {
      setIsAnalyzing(true)
      setAnalyzeError("")
      setAiData(null)

      const { imageData, mimeType } = await readFileAsBase64(selectedFile)

      const response = await extractNutrition(imageData, mimeType, accessToken)

      // response.data matches the shape FoodEntryForm expects as initialValues,
      // plus source/aiConfidence which the form forwards on submit.
      setAiData({
        ...response.data,
        source: "AI_IMAGE",
      })
    } catch (err) {
      setAnalyzeError(err.message || "AI analysis failed. Please try a clearer image.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ── Form submit ──────────────────────────────────────────────────────

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true)
      setError("")

      await createFoodEntry(values, accessToken)

      navigate("/food")
    } catch (err) {
      setError(err.message || "Failed to create food entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Confidence label helper ──────────────────────────────────────────

  const confidenceLabel = (score) => {
    if (score >= 0.8) return { text: "High confidence", color: "text-emerald-600" }
    if (score >= 0.5) return { text: "Medium confidence", color: "text-amber-600" }
    return { text: "Low confidence — review carefully", color: "text-orange-600" }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div>
        <Link
          to="/food"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to food history
        </Link>

        <h1 className="text-2xl font-bold tracking-tight">
          Add Food
        </h1>

        <p className="text-sm text-muted-foreground">
          Scan a nutrition label or food photo with AI, or fill in the details manually.
        </p>
      </div>

      {/* ── AI Image Scanner ──────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-2 border-b bg-muted/30 px-6 py-4">
          <Sparkles className="size-4 text-primary" />
          <span className="font-semibold">
            AI Nutrition Scanner
          </span>
          <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Beta
          </span>
        </div>

        <div className="p-6 space-y-4">
          {!selectedFile ? (
            /* ── Drop zone ─────────────────────────────────────── */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Upload className="size-5 text-primary" />
              </div>

              <div>
                <p className="font-medium">
                  Drop an image here, or click to browse
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nutrition labels and food photos — JPEG, PNG, WebP, HEIC up to {MAX_FILE_SIZE_MB} MB
                </p>
              </div>
            </div>
          ) : (
            /* ── Preview + actions ─────────────────────────────── */
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border">
                <img
                  src={previewUrl}
                  alt="Selected food image"
                  className="max-h-64 w-full object-contain bg-muted/20"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/80 shadow-sm transition-colors hover:bg-background"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* AI result banner */}
              {aiData && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <div className="text-sm">
                    <p className="font-medium text-emerald-800 dark:text-emerald-400">
                      Nutrition extracted — &ldquo;{aiData.foodName}&rdquo;
                    </p>
                    <p className={`mt-0.5 ${confidenceLabel(aiData.aiConfidence).color}`}>
                      {confidenceLabel(aiData.aiConfidence).text} ({Math.round(aiData.aiConfidence * 100)}%)
                      &nbsp;&mdash; review and edit the values below before saving.
                    </p>
                  </div>
                </div>
              )}

              {/* Analyze button */}
              {!aiData && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Analyzing image...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Analyze with AI
                    </>
                  )}
                </button>
              )}

              {/* Re-analyze button if AI data already loaded */}
              {aiData && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <Sparkles className="size-4" />
                  Re-analyze
                </button>
              )}
            </div>
          )}

          {/* Error from analysis */}
          {analyzeError && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {analyzeError}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleInputChange}
        className="sr-only"
      />

      {/* ── Form error ────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* ── Food entry form ───────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        {/* Label to clarify context when AI pre-filled */}
        {aiData ? (
          <div className="mb-6 text-sm text-muted-foreground">
            The form below has been pre-filled with AI-extracted data.
            Review each field before saving — the AI may make mistakes.
          </div>
        ) : (
          <div className="mb-6 text-sm text-muted-foreground">
            Fill in the nutritional details manually, or scan an image above first.
          </div>
        )}

        <FoodEntryForm
          initialValues={aiData ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}