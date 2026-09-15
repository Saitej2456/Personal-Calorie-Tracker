import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const getLocalDateTimeStart = (date) => {
  if (!date) return null

  const [year, month, day] = date.split("-").map(Number)

  const localDate = new Date(year, month - 1, day)

  const offsetMinutes = -localDate.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const absoluteOffset = Math.abs(offsetMinutes)

  const hours = String(
    Math.floor(absoluteOffset / 60)
  ).padStart(2, "0")

  const minutes = String(
    absoluteOffset % 60
  ).padStart(2, "0")

  return `${date}T00:00:00${sign}${hours}:${minutes}`
}

const toDateInputValue = (value) => {
  if (!value) return ""

  // Backend returns an ISO datetime.
  // Convert it back to YYYY-MM-DD for <input type="date">.
  return new Date(value).toISOString().slice(0, 10)
}

const goalSchema = z
  .object({
    calorieTarget: z
      .number({
        error: "Calorie target is required",
      })
      .positive("Calorie target must be greater than 0"),

    proteinTarget: z
      .number({
        error: "Protein target is required",
      })
      .nonnegative("Protein target cannot be negative"),

    carbsTarget: z
      .number({
        error: "Carbs target is required",
      })
      .nonnegative("Carbs target cannot be negative"),

    fatTarget: z
      .number({
        error: "Fat target is required",
      })
      .nonnegative("Fat target cannot be negative"),

    weightGoal: z
      .number({
        error: "Weight goal is required",
      })
      .positive("Weight goal must be greater than 0")
      .optional(),

    effectiveFrom: z
      .string()
      .min(1, "Start date is required"),

    effectiveTo: z
      .string()
      .optional(),
  })
  .superRefine((values, context) => {
    if (!values.effectiveFrom || !values.effectiveTo) {
      return
    }

    if (values.effectiveTo <= values.effectiveFrom) {
      context.addIssue({
        code: "custom",
        path: ["effectiveTo"],
        message: "End date must be after the start date",
      })
    }
  })

export default function GoalForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(goalSchema),

    defaultValues: {
      calorieTarget:
        initialValues?.calorieTarget ?? "",

      proteinTarget:
        initialValues?.proteinTarget ?? "",

      carbsTarget:
        initialValues?.carbsTarget ?? "",

      fatTarget:
        initialValues?.fatTarget ?? "",

      weightGoal:
        initialValues?.weightGoal ?? "",

      effectiveFrom:
        toDateInputValue(initialValues?.effectiveFrom),

      effectiveTo:
        toDateInputValue(initialValues?.effectiveTo),
    },
  })

  const submit = (values) => {
    onSubmit({
      ...values,

      effectiveFrom: getLocalDateTimeStart(
        values.effectiveFrom
      ),

      effectiveTo: values.effectiveTo
        ? getLocalDateTimeStart(values.effectiveTo)
        : null,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-8"
    >
      {/* Nutrition targets */}
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">
            Daily nutrition targets
          </h2>

          <p className="text-sm text-muted-foreground">
            Set the amount you want to target each day.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Calories */}
          <div className="space-y-2">
            <label
              htmlFor="calorieTarget"
              className="text-sm font-medium"
            >
              Calories (kcal)
            </label>

            <input
              id="calorieTarget"
              type="number"
              step="any"
              {...register("calorieTarget", {
                valueAsNumber: true,
              })}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.calorieTarget && (
              <p className="text-xs text-destructive">
                {errors.calorieTarget.message}
              </p>
            )}
          </div>

          {/* Protein */}
          <div className="space-y-2">
            <label
              htmlFor="proteinTarget"
              className="text-sm font-medium"
            >
              Protein (g)
            </label>

            <input
              id="proteinTarget"
              type="number"
              step="any"
              {...register("proteinTarget", {
                valueAsNumber: true,
              })}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.proteinTarget && (
              <p className="text-xs text-destructive">
                {errors.proteinTarget.message}
              </p>
            )}
          </div>

          {/* Carbs */}
          <div className="space-y-2">
            <label
              htmlFor="carbsTarget"
              className="text-sm font-medium"
            >
              Carbs (g)
            </label>

            <input
              id="carbsTarget"
              type="number"
              step="any"
              {...register("carbsTarget", {
                valueAsNumber: true,
              })}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.carbsTarget && (
              <p className="text-xs text-destructive">
                {errors.carbsTarget.message}
              </p>
            )}
          </div>

          {/* Fat */}
          <div className="space-y-2">
            <label
              htmlFor="fatTarget"
              className="text-sm font-medium"
            >
              Fat (g)
            </label>

            <input
              id="fatTarget"
              type="number"
              step="any"
              {...register("fatTarget", {
                valueAsNumber: true,
              })}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.fatTarget && (
              <p className="text-xs text-destructive">
                {errors.fatTarget.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Weight goal */}
      <section className="space-y-4 border-t pt-6">
        <div>
          <h2 className="font-semibold">
            Weight goal
          </h2>

          <p className="text-sm text-muted-foreground">
            Optional target weight.
          </p>
        </div>

        <div className="max-w-sm space-y-2">
          <label
            htmlFor="weightGoal"
            className="text-sm font-medium"
          >
            Target weight (kg)
          </label>

          <input
            id="weightGoal"
            type="number"
            step="any"
            {...register("weightGoal", {
              setValueAs: (value) =>
                value === ""
                  ? undefined
                  : Number(value),
            })}
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
          />

          {errors.weightGoal && (
            <p className="text-xs text-destructive">
              {errors.weightGoal.message}
            </p>
          )}
        </div>
      </section>

      {/* Effective period */}
      <section className="space-y-4 border-t pt-6">
        <div>
          <h2 className="font-semibold">
            Goal period
          </h2>

          <p className="text-sm text-muted-foreground">
            Choose when this goal becomes active.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Effective from */}
          <div className="space-y-2">
            <label
              htmlFor="effectiveFrom"
              className="text-sm font-medium"
            >
              Effective from
            </label>

            <input
              id="effectiveFrom"
              type="date"
              {...register("effectiveFrom")}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.effectiveFrom && (
              <p className="text-xs text-destructive">
                {errors.effectiveFrom.message}
              </p>
            )}
          </div>

          {/* Effective to */}
          <div className="space-y-2">
            <label
              htmlFor="effectiveTo"
              className="text-sm font-medium"
            >
              Effective to
            </label>

            <input
              id="effectiveTo"
              type="date"
              {...register("effectiveTo")}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            <p className="text-xs text-muted-foreground">
              Leave blank to keep this goal active indefinitely.
            </p>

            {errors.effectiveTo && (
              <p className="text-xs text-destructive">
                {errors.effectiveTo.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end border-t pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Goal"}
        </button>
      </div>
    </form>
  )
}