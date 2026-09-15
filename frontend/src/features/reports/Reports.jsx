import { useEffect, useState } from "react"
import {
  CalendarDays,
  TrendingUp,
} from "lucide-react"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { useAuth } from "../auth/useAuth"

import {
  getCaloriesReport,
  getMacrosReport,
  getMicronutrientsReport,
  getGoalComparisonReport,
} from "./reports.api"

import {
  getTodayDate,
  getDateDaysAgo,
} from "../../lib/dateTime"

const toNumber = (value) => Number(value ?? 0)

const formatDate = (value) => {
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  )
}

const formatNumber = (value) => {
  return Number(value).toFixed(0)
}

const GoalProgress = ({
  label,
  actual,
  target,
  unit,
}) => {
  const actualValue = toNumber(actual)
  const targetValue = toNumber(target)

  const percentage =
    targetValue > 0
      ? Math.min((actualValue / targetValue) * 100, 100)
      : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {label}
        </span>

        <span className="text-sm text-muted-foreground">
          {formatNumber(actualValue)} /{" "}
          {formatNumber(targetValue)} {unit}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {Math.round(percentage)}% of target
      </p>
    </div>
  )
}

export default function Reports() {
  const { accessToken } = useAuth()

  const [range, setRange] = useState(7)

  const [calorieData, setCalorieData] = useState([])
  const [macroData, setMacroData] = useState([])
  const [micronutrientData, setMicronutrientData] = useState([])

  const [goalDate, setGoalDate] =
    useState(getTodayDate())

  const [goalComparison, setGoalComparison] =
    useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const today = getTodayDate()
  const from = getDateDaysAgo(range - 1)

  /*
   * -----------------------------------------
   * Load range reports
   * -----------------------------------------
   */

  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true)
        setError("")

        const [
          calories,
          macros,
          micronutrients,
        ] = await Promise.all([
          getCaloriesReport(
            {
              from,
              to: today,
            },
            accessToken
          ),

          getMacrosReport(
            {
              from,
              to: today,
            },
            accessToken
          ),

          getMicronutrientsReport(
            {
              from,
              to: today,
            },
            accessToken
          ),
        ])

        setCalorieData(calories)
        setMacroData(macros)
        setMicronutrientData(micronutrients)
      } catch (error) {
        setError(
          error.message ||
            "Failed to load reports"
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
  }, [accessToken, range, from, today])

  /*
   * -----------------------------------------
   * Load goal comparison
   * -----------------------------------------
   */

  useEffect(() => {
    const loadGoalComparison = async () => {
      try {
        const response =
          await getGoalComparisonReport(
            goalDate,
            accessToken
          )

        setGoalComparison(response)
      } catch (error) {
        setGoalComparison(null)
      }
    }

    loadGoalComparison()
  }, [accessToken, goalDate])

  /*
   * -----------------------------------------
   * Calorie chart data
   * -----------------------------------------
   */

  const chartData = calorieData.map((item) => ({
    date: formatDate(item.date),
    calories: toNumber(item.calories),
  }))

  /*
   * -----------------------------------------
   * Macro chart data
   * -----------------------------------------
   */

  const macroChartData = macroData.map((item) => ({
    date: formatDate(item.date),
    protein: toNumber(item.proteinG),
    carbs: toNumber(item.carbsG),
    fat: toNumber(item.fatG),
  }))

  /*
   * -----------------------------------------
   * Calorie summary
   * -----------------------------------------
   */

  const totalCalories = calorieData.reduce(
    (total, item) =>
      total + toNumber(item.calories),
    0
  )

  const averageCalories =
    calorieData.length > 0
      ? totalCalories / calorieData.length
      : 0

  /*
   * -----------------------------------------
   * Micronutrient aggregation
   * -----------------------------------------
   */

  const micronutrientTotals = new Map()

  for (const day of micronutrientData) {
    for (const nutrient of day.nutrients ?? []) {
      const existing = micronutrientTotals.get(
        nutrient.code
      )

      if (existing) {
        existing.amount += toNumber(
          nutrient.amount
        )
      } else {
        micronutrientTotals.set(
          nutrient.code,
          {
            code: nutrient.code,
            name: nutrient.name,
            unit: nutrient.unit,
            amount: toNumber(
              nutrient.amount
            ),
          }
        )
      }
    }
  }

  const micronutrientSummary =
    Array.from(
      micronutrientTotals.values()
    ).sort((a, b) =>
      a.name.localeCompare(b.name)
    )

  /*
   * -----------------------------------------
   * Loading
   * -----------------------------------------
   */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Loading reports...
        </p>
      </div>
    )
  }

  /*
   * -----------------------------------------
   * Error
   * -----------------------------------------
   */

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold">
          Couldn't load reports
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* -------------------------------- */}
      {/* Header                           */}
      {/* -------------------------------- */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />

            <h1 className="text-2xl font-bold tracking-tight">
              Reports
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Understand your nutrition trends and progress.
          </p>
        </div>

        {/* Date range selector */}
        <div className="flex items-center gap-2 rounded-xl border bg-card p-1">
          <CalendarDays className="ml-2 size-4 text-muted-foreground" />

          {[7, 14, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                range === days
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Calorie summary                  */}
      {/* -------------------------------- */}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total calories
          </p>

          <p className="mt-2 text-3xl font-bold">
            {Math.round(totalCalories)}

            <span className="ml-1 text-base font-medium text-muted-foreground">
              kcal
            </span>
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Across the last {range} days
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Average per day
          </p>

          <p className="mt-2 text-3xl font-bold">
            {Math.round(averageCalories)}

            <span className="ml-1 text-base font-medium text-muted-foreground">
              kcal
            </span>
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Daily calorie average
          </p>
        </div>
      </section>

      {/* -------------------------------- */}
      {/* Calorie trend                    */}
      {/* -------------------------------- */}

      <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
        <div>
          <h2 className="font-semibold">
            Calorie trend
          </h2>

          <p className="text-sm text-muted-foreground">
            Your daily calorie intake over the selected period.
          </p>
        </div>

        <div className="mt-6 h-[320px] w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl bg-muted/40">
              <p className="text-sm text-muted-foreground">
                No calorie data available for this period.
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
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={55}
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(0)} kcal`,
                    "Calories",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="calories"
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

      {/* -------------------------------- */}
      {/* Macro breakdown                  */}
      {/* -------------------------------- */}

      <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
        <div>
          <h2 className="font-semibold">
            Macro breakdown
          </h2>

          <p className="text-sm text-muted-foreground">
            Your daily protein, carbohydrate, and fat intake.
          </p>
        </div>

        <div className="mt-6 h-[320px] w-full">
          {macroChartData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl bg-muted/40">
              <p className="text-sm text-muted-foreground">
                No macro data available for this period.
              </p>
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={macroChartData}
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
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={55}
                />

                <Tooltip
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1)} g`,
                    name,
                  ]}
                />

                <Bar
                  dataKey="protein"
                  name="Protein"
                  stackId="macros"
                  fill="var(--chart-1)"
                />

                <Bar
                  dataKey="carbs"
                  name="Carbs"
                  stackId="macros"
                  fill="var(--chart-2)"
                />

                <Bar
                  dataKey="fat"
                  name="Fat"
                  stackId="macros"
                  fill="var(--chart-3)"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* -------------------------------- */}
      {/* Micronutrients                   */}
      {/* -------------------------------- */}

      <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
        <div>
          <h2 className="font-semibold">
            Micronutrients
          </h2>

          <p className="text-sm text-muted-foreground">
            Total micronutrient intake across the selected period.
          </p>
        </div>

        <div className="mt-6">
          {micronutrientSummary.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-muted/40">
              <p className="text-sm text-muted-foreground">
                No micronutrient data available for this period.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
                <span>
                  Nutrient
                </span>

                <span className="text-right">
                  Total
                </span>

                <span className="w-16 text-right">
                  Unit
                </span>
              </div>

              <div>
                {micronutrientSummary.map(
                  (nutrient) => (
                    <div
                      key={nutrient.code}
                      className="grid grid-cols-[1fr_auto_auto] gap-4 border-b px-4 py-3 last:border-b-0"
                    >
                      <span className="text-sm font-medium">
                        {nutrient.name}
                      </span>

                      <span className="text-right text-sm tabular-nums">
                        {nutrient.amount.toFixed(2)}
                      </span>

                      <span className="w-16 text-right text-sm text-muted-foreground">
                        {nutrient.unit}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------- */}
      {/* Goal vs Actual                   */}
      {/* -------------------------------- */}

      <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-semibold">
              Goal vs Actual
            </h2>

            <p className="text-sm text-muted-foreground">
              Compare your intake with your nutrition goals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="goal-date"
              className="text-sm text-muted-foreground"
            >
              Date
            </label>

            <input
              id="goal-date"
              type="date"
              value={goalDate}
              max={today}
              onChange={(event) =>
                setGoalDate(event.target.value)
              }
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="mt-6">
          {!goalComparison?.goal ? (
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-muted/40 px-6 text-center">
              <div>
                <p className="font-medium">
                  No goal for this date
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  There is no active nutrition goal for{" "}
                  {formatDate(goalDate)}.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <GoalProgress
                label="Calories"
                actual={
                  goalComparison.actual.calories
                }
                target={
                  goalComparison.goal.calorieTarget
                }
                unit="kcal"
              />

              <GoalProgress
                label="Protein"
                actual={
                  goalComparison.actual.proteinG
                }
                target={
                  goalComparison.goal.proteinTarget
                }
                unit="g"
              />

              <GoalProgress
                label="Carbs"
                actual={
                  goalComparison.actual.carbsG
                }
                target={
                  goalComparison.goal.carbsTarget
                }
                unit="g"
              />

              <GoalProgress
                label="Fat"
                actual={
                  goalComparison.actual.fatG
                }
                target={
                  goalComparison.goal.fatTarget
                }
                unit="g"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}