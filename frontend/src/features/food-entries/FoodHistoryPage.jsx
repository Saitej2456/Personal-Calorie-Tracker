import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Link } from "react-router-dom"

import {
  listFoodEntries,
  deleteFoodEntry,
} from "./foodEntries.api"


import { useAuth } from "../auth/useAuth"

const MEAL_TYPES = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
]

const PAGE_SIZE = 10

const toNumber = (value) => {
  return Number(value ?? 0)
}

export default function FoodHistoryPage() {
  const { accessToken } = useAuth()

  const [entries, setEntries] = useState([])
  const [pagination, setPagination] =
    useState(null)

  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [mealType, setMealType] = useState("")

  const [page, setPage] = useState(1)

  const [isLoading, setIsLoading] =
    useState(true)

  const [deletingId, setDeletingId] =
  useState(null)

  const [error, setError] =
    useState("")

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true)
        setError("")

        const response =
          await listFoodEntries(
            {
              page,
              limit: PAGE_SIZE,
              from: from || undefined,
              to: to || undefined,
              mealType:
                mealType || undefined,
            },
            accessToken
          )

        setEntries(response.data)
        setPagination(response.pagination)
      } catch (error) {
        setError(
          error.message ||
            "Failed to load food entries"
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadEntries()
  }, [
    page,
    from,
    to,
    mealType,
    accessToken,
  ])

  const handleFromChange = (value) => {
    setFrom(value)
    setPage(1)
  }

  const handleToChange = (value) => {
    setTo(value)
    setPage(1)
  }

  const handleMealChange = (value) => {
    setMealType(value)
    setPage(1)
  }

  const clearFilters = () => {
    setFrom("")
    setTo("")
    setMealType("")
    setPage(1)
  }

  const handleDelete = async (id) => {
    const confirmed =
        window.confirm(
        "Are you sure you want to delete this food entry?"
        )

    if (!confirmed) {
        return
    }

    try {
        setDeletingId(id)
        setError("")

        await deleteFoodEntry(
        id,
        accessToken
        )

        setEntries((current) =>
        current.filter(
            (entry) => entry.id !== id
        )
        )
    } catch (error) {
        setError(
        error.message ||
            "Failed to delete food entry"
        )
    } finally {
        setDeletingId(null)
    }
    }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Food History
          </h1>

          <p className="text-sm text-muted-foreground">
            View and manage your food entries.
          </p>
        </div>

        <Link
          to="/food/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add Food
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">

          <div className="space-y-2">
            <label
              htmlFor="from"
              className="text-sm font-medium"
            >
              From
            </label>

            <input
              id="from"
              type="date"
              value={from}
              onChange={(event) =>
                handleFromChange(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="to"
              className="text-sm font-medium"
            >
              To
            </label>

            <input
              id="to"
              type="date"
              value={to}
              onChange={(event) =>
                handleToChange(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="mealType"
              className="text-sm font-medium"
            >
              Meal
            </label>

            <select
              id="mealType"
              value={mealType}
              onChange={(event) =>
                handleMealChange(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">
                All meals
              </option>

              {MEAL_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(from || to || mealType) && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            {error}
          </p>
        </div>
      )}

      {/* Entries */}
      <div className="rounded-2xl border bg-card shadow-sm">

        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">
            Entries
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading food entries...
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">
              No food entries found.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your filters or add a new meal.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
                >
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                    {entry.foodName}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                    {entry.mealType}
                    {" · "}
                    {entry.quantity}{" "}
                    {entry.quantityUnit}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                    <p className="text-sm font-semibold">
                        {toNumber(
                        entry.calories
                        ).toFixed(0)}{" "}
                        kcal
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(
                        entry.eatenAt
                        ).toLocaleString()}
                    </p>
                    </div>

                    <div className="flex items-center gap-1">
                    <Link
                        to={`/food/${entry.id}/edit`}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Edit ${entry.foodName}`}
                    >
                        <Pencil className="size-4" />
                    </Link>

                    <button
                        type="button"
                        disabled={deletingId === entry.id}
                        onClick={() =>
                        handleDelete(entry.id)
                        }
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                        aria-label={`Delete ${entry.foodName}`}
                    >
                        <Trash2 className="size-4" />
                    </button>
                    </div>
                </div>
                </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination &&
        pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">

            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >=
                  pagination.totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
              >
                Next
                <ChevronRight className="size-4" />
              </button>

            </div>
          </div>
        )}
    </div>
  )
}