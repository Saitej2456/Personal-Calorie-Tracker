import { z } from "zod";

export const weightLogIdSchema = z.object({
  id: z.uuid()
});

export const createWeightLogSchema = z
  .object({
    weightKg: z.number().positive(),
    loggedAt: z.string().datetime({ offset: true })
  })
  .strict();

export const listWeightLogsSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional()
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.from !== undefined &&
      data.to !== undefined &&
      new Date(data.from) >= new Date(data.to)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "`to` must be after `from`"
      });
    }
  });

export const updateWeightLogSchema = z
  .object({
    weightKg: z.number().positive().optional(),
    loggedAt: z.string().datetime({ offset: true }).optional()
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