import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import FoodEntryForm from "./FoodEntryForm"
import { createFoodEntry } from "./foodEntries.api"

import { useAuth } from "../auth/useAuth"

export default function FoodEntryCreatePage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true)
      setError("")

      await createFoodEntry(
        values,
        accessToken
      )

      navigate("/food")
    } catch (error) {
      setError(
        error.message ||
          "Failed to create food entry"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}
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
          Add a meal and its nutritional information.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            {error}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <FoodEntryForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}