import { Router } from "express";

import * as authController
  from "./auth.controller.js";

import { validateBody }
  from "../../middleware/validate.middleware.js";

import {
  registerSchema,
  loginSchema
} from "./auth.schema.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerSchema),
  authController.register
);

router.post(
  "/login",
  validateBody(loginSchema),
  authController.login
);

router.post(
  "/refresh",
  authController.refresh
);

router.post(
  "/logout",
  authController.logout
);

export default router;