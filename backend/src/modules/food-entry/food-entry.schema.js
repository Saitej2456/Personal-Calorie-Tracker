import { z } from "zod";

export const foodEntryIdSchema = z.object({
  id: z.uuid()
});

const micronutrientSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1),

    amount: z
      .number()
      .nonnegative()
  })
  .strict();

export const createFoodEntrySchema = z
  .object({
    foodName: z
      .string()
      .trim()
      .min(1)
      .max(200),

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
  .strict()
  .superRefine((data, ctx) => {
    /*
     * A manually entered food should not carry
     * an AI confidence score.
     */
    if (
      data.source === "MANUAL" &&
      data.aiConfidence != null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["aiConfidence"],
        message:
          "aiConfidence must be null or omitted when source is MANUAL"
      });
    }

    /*
     * A nutrient code may appear only once in a
     * single FoodEntry request.
     */
    const seenCodes = new Set();

    data.micronutrients.forEach(
      (nutrient, index) => {
        if (seenCodes.has(nutrient.code)) {
          ctx.addIssue({
            code: "custom",
            path: [
              "micronutrients",
              index,
              "code"
            ],
            message:
              "Duplicate micronutrient code"
          });
        }

        seenCodes.add(nutrient.code);
      }
    );
  });



  export const listFoodEntriesSchema = z
  .object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(20),

    from: z
      .string()
      .date()
      .optional(),

    to: z
      .string()
      .date()
      .optional(),

    mealType: z
      .enum([
        "BREAKFAST",
        "LUNCH",
        "DINNER",
        "SNACK"
      ])
      .optional()
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.from && data.to && data.from >= data.to) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "`to` must be after `from`"
      });
    }
  });


export const updateFoodEntrySchema = z
  .object({
    foodName: z.string().trim().min(1).max(200).optional(),
    mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]).optional(),
    eatenAt: z.string().datetime({ offset: true }).optional(),
    quantity: z.number().positive().optional(),
    quantityUnit: z
      .enum(["GRAM", "MILLILITER", "PIECE", "SERVING"])
      .optional(),
    calories: z.number().nonnegative().optional(),
    proteinG: z.number().nonnegative().optional(),
    carbsG: z.number().nonnegative().optional(),
    fatG: z.number().nonnegative().optional(),
    source: z.enum(["MANUAL", "AI_IMAGE"]).optional(),
    aiConfidence: z.number().min(0).max(1).nullable().optional(),
    micronutrients: z.array(micronutrientSchema).optional()
  })
  .strict()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided"
      });
    }

    if (data.source === "MANUAL" && data.aiConfidence != null) {
      ctx.addIssue({
        code: "custom",
        path: ["aiConfidence"],
        message:
          "aiConfidence must be null or omitted when source is MANUAL"
      });
    }

    const seenCodes = new Set();

    data.micronutrients?.forEach((nutrient, index) => {
      if (seenCodes.has(nutrient.code)) {
        ctx.addIssue({
          code: "custom",
          path: ["micronutrients", index, "code"],
          message: "Duplicate micronutrient code"
        });
      }

      seenCodes.add(nutrient.code);
    });
  });

export const bulkCreateFoodEntriesSchema = z.array(createFoodEntrySchema).min(1).max(500);