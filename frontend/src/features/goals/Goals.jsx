import { useEffect, useState } from "react"
import GoalForm from "./GoalForm"
import {
  createGoal,
  listGoals,
  updateGoal,
} from "./goals.api"

import {
  CalendarDays,
  Flame,
  Target,
  Weight,
  X,
} from "lucide-react"

import { useAuth } from "../auth/useAuth"

const toNumber = (value) => Number(value ?? 0)

const formatDate = (value) => {
  if (!value) return "No end date"

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function Goals() {
  const { accessToken } = useAuth()

  const [goals, setGoals] = useState([])
  const [pagination, setPagination] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const [editingGoal, setEditingGoal] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editError, setEditError] = useState("")

  const loadGoals = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await listGoals(
        {
          page: 1,
          limit: 20,
        },
        accessToken
      )

      setGoals(response.data)
      setPagination(response.pagination)
    } catch (error) {
      setError(error.message || "Failed to load goals")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGoals()
  }, [accessToken])

  // -----------------------------------------
  // Form state helpers
  // -----------------------------------------

  const openCreateForm = () => {
    setShowForm(true)
    setEditingGoal(null)
    setFormError("")
    setEditError("")
  }

  const closeForms = () => {
    setShowForm(false)
    setEditingGoal(null)
    setFormError("")
    setEditError("")
  }

  const openEditForm = (goal) => {
    setEditingGoal(goal)
    setShowForm(false)
    setFormError("")
    setEditError("")
  }

  // -----------------------------------------
  // Create goal
  // -----------------------------------------

  const handleCreateGoal = async (values) => {
    try {
      setIsSubmitting(true)
      setFormError("")

      await createGoal(values, accessToken)

      closeForms()

      await loadGoals()
    } catch (error) {
      if (error.code === "CONFLICT") {
        setFormError(
          "This goal period overlaps with an existing goal. Choose a different date range."
        )
      } else {
        setFormError(
          error.message || "Failed to create goal"
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // -----------------------------------------
  // Update goal
  // -----------------------------------------

  const handleEditGoal = async (values) => {
    if (!editingGoal) return

    try {
      setIsUpdating(true)
      setEditError("")

      await updateGoal(
        editingGoal.id,
        values,
        accessToken
      )

      closeForms()

      await loadGoals()
    } catch (error) {
      if (error.code === "CONFLICT") {
        setEditError(
          "This goal period overlaps with another goal. Choose a different date range."
        )
      } else {
        setEditError(
          error.message || "Failed to update goal"
        )
      }
    } finally {
      setIsUpdating(false)
    }
  }

  // -----------------------------------------
  // Loading state
  // -----------------------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Loading goals...
        </p>
      </div>
    )
  }

  // -----------------------------------------
  // Error state
  // -----------------------------------------

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold">
          Couldn't load goals
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {error}
        </p>
      </div>
    )
  }

  // -----------------------------------------
  // Current / previous goals
  // -----------------------------------------

  const currentGoal = goals.find(
    (goal) => goal.effectiveTo === null
  )

  const previousGoals = goals.filter(
    (goal) => goal.id !== currentGoal?.id
  )

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Goals
          </h1>

          <p className="text-sm text-muted-foreground">
            Set and manage your daily nutrition targets.
          </p>
        </div>

        {/* IMPORTANT:
            Render two different buttons instead of
            trying to make one button do both jobs.
        */}
        {showForm || editingGoal ? (
          <button
            type="button"
            onClick={closeForms}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Add Goal
          </button>
        )}
      </div>

      {/* --------------------------------------- */}
      {/* Create Goal Form */}
      {/* --------------------------------------- */}

      {showForm && (
        <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Create a new goal
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Set your nutrition targets and the period they should apply to.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForms}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close form"
            >
              <X className="size-4" />
            </button>
          </div>

          {formError && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">
                {formError}
              </p>
            </div>
          )}

          <GoalForm
            onSubmit={handleCreateGoal}
            isSubmitting={isSubmitting}
          />
        </section>
      )}

      {/* --------------------------------------- */}
      {/* Edit Goal Form */}
      {/* --------------------------------------- */}

      {editingGoal && (
        <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Edit goal
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Update your nutrition targets or end date.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForms}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close form"
            >
              <X className="size-4" />
            </button>
          </div>

          {editError && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">
                {editError}
              </p>
            </div>
          )}

          <GoalForm
            initialValues={editingGoal}
            onSubmit={handleEditGoal}
            isSubmitting={isUpdating}
          />
        </section>
      )}

      {/* --------------------------------------- */}
      {/* Current Goal */}
      {/* --------------------------------------- */}

      {currentGoal ? (
        <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-primary/10 p-2">
                  <Target className="size-5 text-primary" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Current goal
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Active since{" "}
                    {formatDate(currentGoal.effectiveFrom)}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openEditForm(currentGoal)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Edit
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Calories */}
            <div className="rounded-2xl bg-muted/50 p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="size-4" />
                Calories
              </div>

              <p className="mt-3 text-3xl font-bold">
                {toNumber(
                  currentGoal.calorieTarget
                ).toFixed(0)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                kcal / day
              </p>
            </div>

            {/* Protein */}
            <div className="rounded-2xl bg-muted/50 p-5">
              <p className="text-sm text-muted-foreground">
                Protein
              </p>

              <p className="mt-3 text-3xl font-bold">
                {toNumber(
                  currentGoal.proteinTarget
                ).toFixed(0)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                g / day
              </p>
            </div>

            {/* Carbs */}
            <div className="rounded-2xl bg-muted/50 p-5">
              <p className="text-sm text-muted-foreground">
                Carbs
              </p>

              <p className="mt-3 text-3xl font-bold">
                {toNumber(
                  currentGoal.carbsTarget
                ).toFixed(0)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                g / day
              </p>
            </div>

            {/* Fat */}
            <div className="rounded-2xl bg-muted/50 p-5">
              <p className="text-sm text-muted-foreground">
                Fat
              </p>

              <p className="mt-3 text-3xl font-bold">
                {toNumber(
                  currentGoal.fatTarget
                ).toFixed(0)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                g / day
              </p>
            </div>
          </div>

          {/* Weight goal */}
          {currentGoal.weightGoal !== null && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border p-4">
              <Weight className="size-5 text-primary" />

              <div>
                <p className="text-sm font-medium">
                  Weight goal
                </p>

                <p className="text-sm text-muted-foreground">
                  {toNumber(
                    currentGoal.weightGoal
                  ).toFixed(1)}{" "}
                  kg
                </p>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <Target className="mx-auto size-8 text-muted-foreground" />

          <h2 className="mt-3 font-semibold">
            No active goal
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a goal to start tracking your progress.
          </p>
        </section>
      )}

      {/* --------------------------------------- */}
      {/* Goal History */}
      {/* --------------------------------------- */}

      {previousGoals.length > 0 && (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div>
            <h2 className="font-semibold">
              Goal history
            </h2>

            <p className="text-sm text-muted-foreground">
              Your previous nutrition targets.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {previousGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {toNumber(
                      goal.calorieTarget
                    ).toFixed(0)}{" "}
                    kcal/day
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />

                    {formatDate(
                      goal.effectiveFrom
                    )}

                    {" → "}

                    {formatDate(
                      goal.effectiveTo
                    )}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  P{" "}
                  {toNumber(
                    goal.proteinTarget
                  ).toFixed(0)}
                  g
                  {" · "}
                  C{" "}
                  {toNumber(
                    goal.carbsTarget
                  ).toFixed(0)}
                  g
                  {" · "}
                  F{" "}
                  {toNumber(
                    goal.fatTarget
                  ).toFixed(0)}
                  g
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}