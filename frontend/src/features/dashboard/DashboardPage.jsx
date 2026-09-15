import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Activity,
  ArrowRight,
  Flame,
  Plus,
  Scale,
  Utensils,
} from "lucide-react"

import {
  getTodaySummary,
  getTodayFoodEntries,
  getCalorieTrend,
  getLatestWeight,
} from "./dashboard.api"

import {
  getTodayDate,
  getDateDaysAgo,
} from "../../lib/dateTime"

import { useAuth } from "../auth/useAuth"

import { Progress } from "../../components/ui/progress"

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const toNumber = (value) => {
  return Number(value ?? 0)
}

export default function DashboardPage() {
  const { accessToken } = useAuth()

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true)
        setError("")

        const today = getTodayDate()
        const sevenDaysAgo = getDateDaysAgo(6)

        const [
          todaySummary,
          todayFood,
          calorieTrend,
          latestWeight,
        ] = await Promise.all([
          getTodaySummary(
            today,
            accessToken
          ),
          getTodayFoodEntries(
            today,
            accessToken
          ),
          getCalorieTrend(
            sevenDaysAgo,
            today,
            accessToken
          ),
          getLatestWeight(
            accessToken
          ),
        ])

        setData({
          todaySummary: todaySummary.data,
          todayFood: todayFood.data,
          calorieTrend: calorieTrend.data,
          latestWeight: latestWeight.data,
        })
      } catch (error) {
        setError(
          error.message ||
            "Failed to load dashboard"
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [accessToken])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold">
          Couldn't load dashboard
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {error}
        </p>
      </div>
    )
  }

  const {
    todaySummary,
    todayFood,
    calorieTrend,
    latestWeight,
  } = data

  const actual = todaySummary.actual
  const goal = todaySummary.goal

  const calories = toNumber(
    actual.calories
  )

  const calorieTarget = goal
    ? toNumber(goal.calorieTarget)
    : 0

  const calorieProgress =
    calorieTarget > 0
      ? Math.min(
          (calories / calorieTarget) * 100,
          100
        )
      : 0

  const remainingCalories =
    Math.max(
      calorieTarget - calories,
      0
    )

  const chartData =
    calorieTrend.days.map((day) => ({
      date: day.date.slice(5),
      calories: toNumber(day.calories),
    }))

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Today
        </h1>

        <p className="text-sm text-muted-foreground">
          Here's how you're doing today.
        </p>
      </div>

      {/* Main cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* Calories */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8 xl:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Today's calories
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">
                  {calories.toFixed(0)}
                </span>

                {calorieTarget > 0 && (
                  <span className="text-sm text-muted-foreground">
                    / {calorieTarget.toFixed(0)} kcal
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3">
              <Flame className="size-6 text-primary" />
            </div>
          </div>

          {calorieTarget > 0 ? (
            <div className="mt-6">
              <Progress
                value={calorieProgress}
                className="h-3"
              />

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {calorieProgress.toFixed(0)}% of goal
                </span>

                <span className="text-muted-foreground">
                  {remainingCalories.toFixed(0)} kcal remaining
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              No calorie goal has been set for today.
            </p>
          )}
        </div>

        {/* Protein */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-primary/10 p-2">
              <Activity className="size-5 text-primary" />
            </div>

            <span className="text-sm text-muted-foreground">
              Protein
            </span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-bold">
              {toNumber(
                actual.proteinG
              ).toFixed(0)}
            </span>

            <span className="ml-1 text-sm text-muted-foreground">
              g
            </span>
          </div>

          {goal && (
            <p className="mt-2 text-xs text-muted-foreground">
              Goal:{" "}
              {toNumber(
                goal.proteinTarget
              ).toFixed(0)}{" "}
              g
            </p>
          )}
        </div>

        {/* Weight */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-primary/10 p-2">
              <Scale className="size-5 text-primary" />
            </div>

            <span className="text-sm text-muted-foreground">
              Latest weight
            </span>
          </div>

          <div className="mt-4">
            {latestWeight.length > 0 ? (
              <>
                <span className="text-3xl font-bold">
                  {toNumber(
                    latestWeight[0].weightKg
                  ).toFixed(1)}
                </span>

                <span className="ml-1 text-sm text-muted-foreground">
                  kg
                </span>
              </>
            ) : (
              <span className="text-lg font-medium">
                No weight logged
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Trend + recent food */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Calorie trend */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div>
            <h2 className="font-semibold">
              Calorie trend
            </h2>

            <p className="text-sm text-muted-foreground">
              Last 7 days
            </p>
          </div>

          <div className="mt-6 h-64">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Line
                type="monotone"
                dataKey="calories"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent food */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
        <div>
            <h2 className="font-semibold">
            Recent food
            </h2>

            <p className="text-sm text-muted-foreground">
            What you've eaten today
            </p>
        </div>

        <div className="flex items-center gap-3">
            <Link
            to="/food"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline sm:flex"
            >
            View all
            <ArrowRight className="size-4" />
            </Link>

            <Link
            to="/food/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
            <Plus className="size-4" />
            Add Food
            </Link>
        </div>
        </div>

        <div className="mt-5 space-y-3">
            {todayFood.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl bg-muted/50 px-6 py-8 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                <Utensils className="size-5 text-primary" />
                </div>

                <p className="mt-3 text-sm font-medium">
                Nothing logged yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                Add your first meal for today.
                </p>

                
            </div>
            ) : (
            todayFood.map((entry) => (
                <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50"
                >
                <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                    <Utensils className="size-4 text-primary" />
                    </div>

                    <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                        {entry.foodName}
                    </p>

                    <p className="text-xs text-muted-foreground">
                        {entry.mealType}
                        {" · "}
                        {entry.quantity} {entry.quantityUnit}
                    </p>
                    </div>
                </div>

                <span className="ml-4 shrink-0 text-sm font-semibold">
                    {toNumber(
                    entry.calories
                    ).toFixed(0)}{" "}
                    kcal
                </span>
                </div>
            ))
            )}
        </div>
        </div>
      </div>
    </div>
  )
}