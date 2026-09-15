import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";

import nutrientRoutes from "./modules/nutrient/nutrient.routes.js";
import reportRoutes from "./modules/report/report.routes.js";
import weightLogRoutes from "./modules/weight-log/weight-log.routes.js";
import goalRoutes from "./modules/goal/goal.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import foodEntryRoutes from "./modules/food-entry/food-entry.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/api/v1/auth", authRoutes);

app.use(
  "/api/v1/food-entries",
  foodEntryRoutes
);

app.use(
  "/api/v1/goals",
  goalRoutes
);
app.use("/api/v1/weight-logs", weightLogRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/nutrients", nutrientRoutes);
app.use("/api/v1/ai", aiRoutes);

app.use((req, res) => {
  return res.status(404).json({
    error: {
      code: "RESOURCE_NOT_FOUND",
      message: "Route not found"
    }
  });
});

app.use(errorHandler);

export default app;