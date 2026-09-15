import { useEffect, useState } from "react"
import {
  Scale,
  Plus,
  X,
} from "lucide-react"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { useAuth } from "../auth/useAuth"

import {
  listWeightLogs,
  createWeightLog,
  updateWeightLog,
  deleteWeightLog,
} from "./weightLogs.api"

const toNumber = (value) => Number(value ?? 0)

const formatDate = (value) => {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatDateTime = (value) => {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const getCurrentDateTimeLocal = () => {
  const now = new Date()

  const offset = now.getTimezoneOffset()

  const localDate = new Date(
    now.getTime() - offset * 60 * 1000
  )

  return localDate.toISOString().slice(0, 16)
}

const toISOWithOffset = (value) => {
  if (!value) return ""

  const date = new Date(value)

  const offsetMinutes = -date.getTimezoneOffset()

  const sign = offsetMinutes >= 0 ? "+" : "-"

  const absoluteOffset = Math.abs(offsetMinutes)

  const hours = String(
    Math.floor(absoluteOffset / 60)
  ).padStart(2, "0")

  const minutes = String(
    absoluteOffset % 60
  ).padStart(2, "0")

  return `${value}:00${sign}${hours}:${minutes}`
}

export default function Weight() {
  const { accessToken } = useAuth()

  const [weightLogs, setWeightLogs] = useState([])
  const [pagination, setPagination] = useState(null)

  // Pagination
  const [page, setPage] = useState(1)
  const limit = 10

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)

  const [editingLog, setEditingLog] = useState(null)

  const [weightKg, setWeightKg] = useState("")

  const [loggedAt, setLoggedAt] = useState(
    getCurrentDateTimeLocal()
  )

  const [formError, setFormError] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  // -----------------------------------------
  // Load weight logs
  // -----------------------------------------

  const loadWeightLogs = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await listWeightLogs(
        {
          page,
          limit,
        },
        accessToken
      )

      setWeightLogs(response.data)
      setPagination(response.pagination)
    } catch (error) {
      setError(
        error.message || "Failed to load weight logs"
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWeightLogs()
  }, [accessToken, page])

  // -----------------------------------------
  // Form helpers
  // -----------------------------------------

  const openCreateForm = () => {
    setEditingLog(null)
    setWeightKg("")
    setLoggedAt(getCurrentDateTimeLocal())
    setFormError("")
    setShowForm(true)
  }

  const openEditForm = (log) => {
    setEditingLog(log)

    setWeightKg(
      toNumber(log.weightKg).toString()
    )

    const date = new Date(log.loggedAt)

    const offset = date.getTimezoneOffset()

    const localDate = new Date(
      date.getTime() - offset * 60 * 1000
    )

    setLoggedAt(
      localDate.toISOString().slice(0, 16)
    )

    setFormError("")
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingLog(null)
    setWeightKg("")
    setLoggedAt(getCurrentDateTimeLocal())
    setFormError("")
  }

  // -----------------------------------------
  // Create / Update
  // -----------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault()

    setFormError("")

    const numericWeight = Number(weightKg)

    if (
      !weightKg ||
      !Number.isFinite(numericWeight)
    ) {
      setFormError("Please enter your weight.")
      return
    }

    if (numericWeight <= 0) {
      setFormError(
        "Weight must be greater than 0."
      )
      return
    }

    if (!loggedAt) {
      setFormError(
        "Please select a date and time."
      )
      return
    }

    try {
      if (editingLog) {
        setIsUpdating(true)

        await updateWeightLog(
          editingLog.id,
          {
            weightKg: numericWeight,
            loggedAt: toISOWithOffset(loggedAt),
          },
          accessToken
        )

        closeForm()

        // Refresh the current page after editing.
        await loadWeightLogs()
      } else {
        setIsSubmitting(true)

        await createWeightLog(
          {
            weightKg: numericWeight,
            loggedAt: toISOWithOffset(loggedAt),
          },
          accessToken
        )

        closeForm()

        // A newly created log is the newest entry,
        // so it belongs on page 1.
        if (page !== 1) {
          setPage(1)
        } else {
          await loadWeightLogs()
        }
      }
    } catch (error) {
      setFormError(
        error.message ||
          `Failed to ${
            editingLog
              ? "update"
              : "log"
          } weight`
      )
    } finally {
      setIsSubmitting(false)
      setIsUpdating(false)
    }
  }

  // -----------------------------------------
  // Delete
  // -----------------------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this weight entry?"
    )

    if (!confirmed) return

    try {
      setDeletingId(id)
      setError("")

      await deleteWeightLog(
        id,
        accessToken
      )

      /*
       * If the deleted item was the only item
       * on the current page and we're not on page 1,
       * move back to the previous page.
       *
       * Changing `page` will automatically trigger
       * loadWeightLogs through the useEffect.
       */
      if (weightLogs.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1)
      } else {
        await loadWeightLogs()
      }
    } catch (error) {
      setError(
        error.message ||
          "Failed to delete weight log"
      )
    } finally {
      setDeletingId(null)
    }
  }

  // -----------------------------------------
  // Loading state
  // -----------------------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Loading weight data...
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
          Couldn't load weight data
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {error}
        </p>
      </div>
    )
  }

  // -----------------------------------------
  // Derived data
  // -----------------------------------------

  const latestWeight = weightLogs[0]

  const chartData = [...weightLogs]
    .reverse()
    .map((log) => ({
      date: new Date(log.loggedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      weight: toNumber(log.weightKg),
    }))

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-start justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Weight
          </h1>

          <p className="text-sm text-muted-foreground">
            Track your weight and see how it changes over time.
          </p>
        </div>

        {showForm ? (
          <button
            type="button"
            onClick={closeForm}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Log weight
          </button>
        )}

      </div>

      {/* Log / Edit Weight Form */}

      {showForm && (
        <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">

          <div className="mb-6 flex items-start justify-between gap-4">

            <div>
              <h2 className="text-lg font-semibold">
                {editingLog
                  ? "Edit weight"
                  : "Log your weight"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {editingLog
                  ? "Update this weight measurement."
                  : "Record a new weight measurement."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
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

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Weight */}

            <div className="space-y-2">

              <label
                htmlFor="weightKg"
                className="text-sm font-medium"
              >
                Weight
              </label>

              <div className="relative">

                <input
                  id="weightKg"
                  type="number"
                  step="0.1"
                  min="0"
                  value={weightKg}
                  onChange={(event) =>
                    setWeightKg(
                      event.target.value
                    )
                  }
                  placeholder="68.5"
                  className="w-full rounded-xl border bg-background px-4 py-3 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  kg
                </span>

              </div>

            </div>

            {/* Date and time */}

            <div className="space-y-2">

              <label
                htmlFor="loggedAt"
                className="text-sm font-medium"
              >
                Date & time
              </label>

              <input
                id="loggedAt"
                type="datetime-local"
                value={loggedAt}
                onChange={(event) =>
                  setLoggedAt(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>

            {/* Form actions */}

            <div className="flex justify-end gap-3 pt-2">

              <button
                type="button"
                onClick={closeForm}
                disabled={
                  isSubmitting ||
                  isUpdating
                }
                className="rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isUpdating
                }
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ||
                isUpdating
                  ? "Saving..."
                  : editingLog
                    ? "Update weight"
                    : "Save weight"}
              </button>

            </div>

          </form>

        </section>
      )}

      {/* Summary */}

      <section className="grid gap-4 md:grid-cols-2">

        {/* Current weight */}

        <div className="rounded-3xl border bg-card p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-primary/10 p-2.5">
              <Scale className="size-5 text-primary" />
            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Current weight
              </p>

              <p className="mt-1 text-3xl font-bold">

                {latestWeight
                  ? toNumber(
                      latestWeight.weightKg
                    ).toFixed(1)
                  : "—"}

                {latestWeight && (
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    kg
                  </span>
                )}

              </p>

            </div>

          </div>

          {latestWeight && (
            <p className="mt-4 text-sm text-muted-foreground">
              Last logged{" "}
              {formatDate(
                latestWeight.loggedAt
              )}
            </p>
          )}

        </div>

        {/* Quick action */}

        {!showForm && (
          <button
            type="button"
            onClick={openCreateForm}
            className="flex min-h-[130px] items-center justify-center gap-2 rounded-3xl border border-dashed bg-card p-6 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          >
            <Plus className="size-5" />
            Log another measurement
          </button>
        )}

      </section>

      {/* Weight Trend */}

      <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">

        <div>
          <h2 className="font-semibold">
            Weight trend
          </h2>

          <p className="text-sm text-muted-foreground">
            Your recent weight measurements.
          </p>
        </div>

        <div className="mt-6 h-[300px] w-full">

          {chartData.length < 2 ? (

            <div className="flex h-full items-center justify-center rounded-2xl bg-muted/40">

              <p className="text-sm text-muted-foreground">
                Log at least two measurements to see your weight trend.
              </p>

            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  domain={[
                    "dataMin - 1",
                    "dataMax + 1",
                  ]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={45}
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(1)} kg`,
                    "Weight",
                  ]}
                  labelFormatter={(label) =>
                    label
                  }
                />

                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>

            </ResponsiveContainer>

          )}

        </div>

      </section>

      {/* Weight History */}

      <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">

        <div>

          <h2 className="font-semibold">
            Weight history
          </h2>

          <p className="text-sm text-muted-foreground">
            Your recorded weight measurements.
          </p>

        </div>

        {weightLogs.length === 0 ? (

          <div className="mt-6 rounded-2xl bg-muted/40 p-8 text-center">

            <Scale className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              No weight logs yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Start by logging your current weight.
            </p>

          </div>

        ) : (

          <div className="mt-6 space-y-3">

            {weightLogs.map((log) => (

              <div
                key={log.id}
                className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >

                <div>

                  <p className="font-medium">
                    {toNumber(
                      log.weightKg
                    ).toFixed(1)}{" "}
                    kg
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(
                      log.loggedAt
                    )}
                  </p>

                </div>

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(log)
                    }
                    disabled={
                      deletingId === log.id
                    }
                    className="text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(log.id)
                    }
                    disabled={
                      deletingId === log.id
                    }
                    className="text-sm font-medium text-destructive hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === log.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

        {/* Pagination */}

        {pagination &&
          pagination.totalPages > 1 && (

            <div className="mt-6 flex items-center justify-between border-t pt-4">

              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() => {
                    setPage(
                      (currentPage) =>
                        currentPage - 1
                    )
                  }}
                  disabled={
                    pagination.page <= 1
                  }
                  className="rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPage(
                      (currentPage) =>
                        currentPage + 1
                    )
                  }}
                  disabled={
                    pagination.page >=
                    pagination.totalPages
                  }
                  className="rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>

              </div>

            </div>

          )}

      </section>

    </div>
  )
}