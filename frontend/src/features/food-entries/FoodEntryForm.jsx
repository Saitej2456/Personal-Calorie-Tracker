import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { listNutrients } from "./nutrients.api"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const foodEntrySchema = z.object({
  foodName: z
    .string()
    .trim()
    .min(1, "Food name is required"),

  mealType: z.enum([
    "BREAKFAST",
    "LUNCH",
    "DINNER",
    "SNACK",
  ]),

  quantity: z
    .number({
      error: "Quantity is required",
    })
    .positive("Quantity must be greater than 0"),

  quantityUnit: z.enum(
    ["GRAM", "MILLILITER", "PIECE", "SERVING"],
    {
      error: "Unit is required",
    }
  ),

  eatenAt: z
    .string()
    .min(1, "Date and time are required"),

  calories: z
    .number({
      error: "Calories are required",
    })
    .nonnegative("Calories cannot be negative"),

  proteinG: z
    .number({
      error: "Protein is required",
    })
    .nonnegative("Protein cannot be negative"),

  carbsG: z
    .number({
      error: "Carbs are required",
    })
    .nonnegative("Carbs cannot be negative"),

  fatG: z
    .number({
      error: "Fat is required",
    })
    .nonnegative("Fat cannot be negative"),

  micronutrients: z.array(
    z.object({
      code: z.string(),
      amount: z
        .number()
        .nonnegative("Amount cannot be negative")
        .optional(),
    })
  ),
})

const MEAL_TYPES = [
  {
    value: "BREAKFAST",
    label: "Breakfast",
  },
  {
    value: "LUNCH",
    label: "Lunch",
  },
  {
    value: "DINNER",
    label: "Dinner",
  },
  {
    value: "SNACK",
    label: "Snack",
  },
]

const DEFAULT_VALUES = {
  foodName: "",
  mealType: "BREAKFAST",
  quantity: "",
  quantityUnit: "",
  eatenAt: new Date().toISOString().slice(0, 16),
  calories: "",
  proteinG: "",
  carbsG: "",
  fatG: "",
  micronutrients: [],
}

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return ""
  }

  return Number(value)
}

const toDateTimeLocal = (value) => {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)

  return localDate.toISOString().slice(0, 16)
}

export default function FoodEntryForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
}) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(foodEntrySchema),
    defaultValues: DEFAULT_VALUES,
  })

  const [nutrients, setNutrients] = useState([])
  const [isLoadingNutrients, setIsLoadingNutrients] = useState(true)

  useEffect(() => {
    const loadNutrients = async () => {
      try {
        const response = await listNutrients()
        setNutrients(response.data)
      } catch (error) {
        console.error("Failed to load nutrients", error)
      } finally {
        setIsLoadingNutrients(false)
      }
    }

    loadNutrients()
  }, [])

  useEffect(() => {
    if (isLoadingNutrients) {
      return
    }

    if (!initialValues) {
      reset({
        ...DEFAULT_VALUES,
        micronutrients: nutrients.map((nutrient) => ({
          code: nutrient.code,
          amount: undefined,
        })),
      })

      return
    }

    const existingMicronutrients =
      initialValues.micronutrients ?? []

    const micronutrientValues = nutrients.map((nutrient) => {
      const existing = existingMicronutrients.find(
        (item) =>
          item.nutrient?.code === nutrient.code ||
          item.code === nutrient.code
      )

      return {
        code: nutrient.code,
        amount: existing
          ? toNumber(existing.amount)
          : undefined,
      }
    })

    reset({
      foodName: initialValues.foodName ?? "",
      mealType: initialValues.mealType ?? "BREAKFAST",
      quantity: toNumber(initialValues.quantity),
      quantityUnit: initialValues.quantityUnit ?? "",
      eatenAt: toDateTimeLocal(initialValues.eatenAt),
      calories: toNumber(initialValues.calories),
      proteinG: toNumber(initialValues.proteinG),
      carbsG: toNumber(initialValues.carbsG),
      fatG: toNumber(initialValues.fatG),
      micronutrients: micronutrientValues,
    })
  }, [
    initialValues,
    nutrients,
    isLoadingNutrients,
    reset,
  ])

  const submit = (values) => {
    const micronutrients = values.micronutrients
      .filter(
        (nutrient) =>
          nutrient.amount !== undefined &&
          nutrient.amount !== null &&
          nutrient.amount !== ""
      )
      .map((nutrient) => ({
        code: nutrient.code,
        amount: nutrient.amount,
      }))

    onSubmit({
      ...values,
      eatenAt: new Date(values.eatenAt).toISOString(),
      micronutrients,
      source: initialValues?.source ?? "MANUAL",
      aiConfidence: initialValues?.aiConfidence ?? null,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-8"
    >
      {/* Food details */}
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">
            Food details
          </h2>

          <p className="text-sm text-muted-foreground">
            What did you eat?
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Food name */}
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="foodName"
              className="text-sm font-medium"
            >
              Food name
            </label>

            <input
              id="foodName"
              {...register("foodName")}
              placeholder="e.g. Chicken breast"
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.foodName && (
              <p className="text-xs text-destructive">
                {errors.foodName.message}
              </p>
            )}
          </div>

          {/* Meal */}
          <div className="space-y-2">
            <label
              htmlFor="mealType"
              className="text-sm font-medium"
            >
              Meal
            </label>

            <select
              id="mealType"
              {...register("mealType")}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              {MEAL_TYPES.map((meal) => (
                <option
                  key={meal.value}
                  value={meal.value}
                >
                  {meal.label}
                </option>
              ))}
            </select>

            {errors.mealType && (
              <p className="text-xs text-destructive">
                {errors.mealType.message}
              </p>
            )}
          </div>

          {/* Eaten at */}
          <div className="space-y-2">
            <label
              htmlFor="eatenAt"
              className="text-sm font-medium"
            >
              Date and time
            </label>

            <input
              id="eatenAt"
              type="datetime-local"
              {...register("eatenAt")}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.eatenAt && (
              <p className="text-xs text-destructive">
                {errors.eatenAt.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label
              htmlFor="quantity"
              className="text-sm font-medium"
            >
              Quantity
            </label>

            <input
              id="quantity"
              type="number"
              step="any"
              {...register("quantity", {
                valueAsNumber: true,
              })}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.quantity && (
              <p className="text-xs text-destructive">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <label
              htmlFor="quantityUnit"
              className="text-sm font-medium"
            >
              Unit
            </label>

            <select
              id="quantityUnit"
              {...register("quantityUnit")}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">Select a unit</option>
              <option value="GRAM">Gram</option>
              <option value="MILLILITER">Milliliter</option>
              <option value="PIECE">Piece</option>
              <option value="SERVING">Serving</option>
            </select>

            {errors.quantityUnit && (
              <p className="text-xs text-destructive">
                {errors.quantityUnit.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Nutrition */}
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">
            Nutrition
          </h2>

          <p className="text-sm text-muted-foreground">
            Enter the nutritional values for this quantity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Calories */}
          <div className="space-y-2">
            <label
              htmlFor="calories"
              className="text-sm font-medium"
            >
              Calories (kcal)
            </label>

            <input
              id="calories"
              type="number"
              step="any"
              {...register("calories", {
                valueAsNumber: true,
              })}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.calories && (
              <p className="text-xs text-destructive">
                {errors.calories.message}
              </p>
            )}
          </div>

          {/* Protein */}
          <div className="space-y-2">
            <label
              htmlFor="proteinG"
              className="text-sm font-medium"
            >
              Protein (g)
            </label>

            <input
              id="proteinG"
              type="number"
              step="any"
              {...register("proteinG", {
                valueAsNumber: true,
              })}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.proteinG && (
              <p className="text-xs text-destructive">
                {errors.proteinG.message}
              </p>
            )}
          </div>

          {/* Carbs */}
          <div className="space-y-2">
            <label
              htmlFor="carbsG"
              className="text-sm font-medium"
            >
              Carbs (g)
            </label>

            <input
              id="carbsG"
              type="number"
              step="any"
              {...register("carbsG", {
                valueAsNumber: true,
              })}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.carbsG && (
              <p className="text-xs text-destructive">
                {errors.carbsG.message}
              </p>
            )}
          </div>

          {/* Fat */}
          <div className="space-y-2">
            <label
              htmlFor="fatG"
              className="text-sm font-medium"
            >
              Fat (g)
            </label>

            <input
              id="fatG"
              type="number"
              step="any"
              {...register("fatG", {
                valueAsNumber: true,
              })}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />

            {errors.fatG && (
              <p className="text-xs text-destructive">
                {errors.fatG.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Micronutrients */}
      <section className="space-y-4 border-t pt-6">
        <div>
          <h2 className="font-semibold">
            Micronutrients
          </h2>

          <p className="text-sm text-muted-foreground">
            Optional vitamins and minerals for this food.
            Leave anything blank if you don't know the amount.
          </p>
        </div>

        {isLoadingNutrients ? (
          <p className="text-sm text-muted-foreground">
            Loading nutrients...
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {nutrients.map((nutrient, index) => (
              <div
                key={nutrient.code}
                className="flex items-center gap-3 rounded-xl border p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {nutrient.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {nutrient.unit}
                  </p>
                </div>

                <input
                  type="number"
                  step="any"
                  placeholder="Amount"
                  {...register(
                    `micronutrients.${index}.amount`,
                    {
                      setValueAs: (value) =>
                        value === ""
                          ? undefined
                          : Number(value),
                    }
                  )}
                  className="h-10 w-32 rounded-lg border bg-background px-3 text-sm"
                />

                <input
                  type="hidden"
                  {...register(
                    `micronutrients.${index}.code`
                  )}
                  value={nutrient.code}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Food"}
        </button>
      </div>
    </form>
  )
}