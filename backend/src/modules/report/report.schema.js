import { z } from "zod";

const reportDateSchema = z
.string()
.date();

export const reportDateRangeSchema = z
.object({
from: reportDateSchema,
to: reportDateSchema
})
.strict()
.superRefine((data, ctx) => {
if (data.from >= data.to) {
ctx.addIssue({
code: "custom",
path: ["to"],
message: "`to` must be after `from`"
});
}
});

export const goalComparisonSchema = z
.object({
date: reportDateSchema
})
.strict();
