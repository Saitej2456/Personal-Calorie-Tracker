import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import FoodEntryForm from "./FoodEntryForm"
import { getFoodEntry, updateFoodEntry } from "./foodEntries.api"
import { useAuth } from "../auth/useAuth"

export default function EditFood() {
  const { id } = useParams()
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [foodEntry, setFoodEntry] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadFoodEntry = async () => {
      try {
        setIsLoading(true)
        setError("")

        const response = await getFoodEntry(id, accessToken)

        setFoodEntry(response.data)
      } catch (error) {
        setError(error.message || "Failed to load food entry")
      } finally {
        setIsLoading(false)
      }
    }

    loadFoodEntry()
  }, [id, accessToken])

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true)
      setError("")

      await updateFoodEntry(id, values, accessToken)

      navigate("/food")
    } catch (error) {
      setError(error.message || "Failed to update food entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Loading food entry...
        </p>
      </div>
    )
  }

  if (error && !foodEntry) {
    return (
      <div className="space-y-4">
        <Link
          to="/food"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to food history
        </Link>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/food"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to food history
        </Link>

        <h1 className="text-2xl font-bold tracking-tight">
          Edit Food
        </h1>

        <p className="text-sm text-muted-foreground">
          Update the details and nutritional information.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <FoodEntryForm
          initialValues={foodEntry}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}