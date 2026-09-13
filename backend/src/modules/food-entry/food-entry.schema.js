import { z } from "zod";

const micronutrientSchema = z
  .object({
    code: z.string().min(1),
    amount: z.number().nonnegative()
  })
  .strict();

export const createFoodEntrySchema = z
  .object({
    foodName: z
      .string()
      .trim()
      .min(1),

    mealType: z.enum([
      "BREAKFAST",
      "LUNCH",
      "DINNER",
      "SNACK"
    ]),

    eatenAt: z.string().datetime({
      offset: true
    }),

    quantity: z
      .number()
      .positive(),

    quantityUnit: z.enum([
      "GRAM",
      "MILLILITER",
      "PIECE",
      "SERVING"
    ]),

    calories: z
      .number()
      .nonnegative(),

    proteinG: z
      .number()
      .nonnegative(),

    carbsG: z
      .number()
      .nonnegative(),

    fatG: z
      .number()
      .nonnegative(),

    source: z
      .enum([
        "MANUAL",
        "AI_IMAGE"
      ])
      .default("MANUAL"),

    aiConfidence: z
      .number()
      .min(0)
      .max(1)
      .nullable()
      .optional(),

    micronutrients: z
      .array(micronutrientSchema)
      .default([])
  })
  .strict();