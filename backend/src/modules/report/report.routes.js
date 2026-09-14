import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateQuery } from "../../middleware/validate.middleware.js";

import { reportDateRangeSchema, goalComparisonSchema } from "./report.schema.js";
import * as controller from "./report.controller.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/calories",
  validateQuery(reportDateRangeSchema),
  controller.calories
);

router.get(
  "/macros",
  validateQuery(reportDateRangeSchema),
  controller.macros
);

router.get(
  "/goal-comparison",
  validateQuery(goalComparisonSchema),
  controller.goalComparison
);

router.get(
  "/micronutrients",
  validateQuery(reportDateRangeSchema),
  controller.micronutrients
);

export default router;
