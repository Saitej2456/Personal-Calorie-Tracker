import { Router } from "express";

import {
  createWeightLogSchema,
  listWeightLogsSchema,
  weightLogIdSchema,
  updateWeightLogSchema
} from "./weight-log.schema.js";

import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  validateBody,
  validateParams,
  validateQuery
} from "../../middleware/validate.middleware.js";

import * as controller from "./weight-log.controller.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  validateBody(createWeightLogSchema),
  controller.create
);

router.get(
  "/",
  validateQuery(listWeightLogsSchema),
  controller.list
);

router.get(
  "/:id",
  validateParams(weightLogIdSchema),
  controller.getById
);

router.patch(
  "/:id",
  validateParams(weightLogIdSchema),
  validateBody(updateWeightLogSchema),
  controller.update
);

router.delete(
  "/:id",
  validateParams(weightLogIdSchema),
  controller.remove
);

export default router;