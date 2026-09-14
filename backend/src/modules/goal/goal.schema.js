import { z } from "zod";

export const goalIdSchema = z.object({
  id: z.uuid()
});

export const createGoalSchema = z
  .object({
    calorieTarget: z
      .number()
      .positive(),

    proteinTarget: z
      .number()
      .nonnegative(),

    carbsTarget: z
      .number()
      .nonnegative(),

    fatTarget: z
      .number()
      .nonnegative(),

    weightGoal: z
      .number()
      .positive()
      .nullable()
      .optional(),

    effectiveFrom: z
      .string()
      .datetime({
        offset: true
      }),

    effectiveTo: z
      .string()
      .datetime({
        offset: true
      })
      .nullable()
      .optional()
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.effectiveTo != null &&
      new Date(data.effectiveTo) <=
        new Date(data.effectiveFrom)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["effectiveTo"],
        message:
          "`effectiveTo` must be after `effectiveFrom`"
      });
    }
  });

export const listGoalsSchema = z
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
      .default(20)
  })
  .strict();

export const updateGoalSchema = z
  .object({
    calorieTarget: z
      .number()
      .positive()
      .optional(),

    proteinTarget: z
      .number()
      .nonnegative()
      .optional(),

    carbsTarget: z
      .number()
      .nonnegative()
      .optional(),

    fatTarget: z
      .number()
      .nonnegative()
      .optional(),

    weightGoal: z
      .number()
      .positive()
      .nullable()
      .optional(),

    effectiveFrom: z
      .string()
      .datetime({
        offset: true
      })
      .optional(),

    effectiveTo: z
      .string()
      .datetime({
        offset: true
      })
      .nullable()
      .optional()
  })
  .strict()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided"
      });
    }
  });