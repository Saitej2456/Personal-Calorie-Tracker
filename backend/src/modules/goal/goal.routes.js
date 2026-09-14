import { Router } from "express";
import {
  createGoalSchema,
  listGoalsSchema,
  goalIdSchema,
  updateGoalSchema
} from "./goal.schema.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  validateBody,
  validateParams,
  validateQuery
} from "../../middleware/validate.middleware.js";

import * as controller from "./goal.controller.js";


const router = Router();

router.use(requireAuth);

router.patch(
  "/:id",
  validateParams(goalIdSchema),
  validateBody(updateGoalSchema),
  controller.update
);

router.delete(
  "/:id",
  validateParams(goalIdSchema),
  controller.remove
);

router.post(
  "/",
  validateBody(createGoalSchema),
  controller.create
);

router.get(
  "/",
  validateQuery(listGoalsSchema),
  controller.list
);

router.get(
  "/:id",
  validateParams(goalIdSchema),
  controller.getById
);
export default router;