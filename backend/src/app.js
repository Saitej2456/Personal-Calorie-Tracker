import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import foodEntryRoutes from "./modules/food-entry/food-entry.routes.js";
// import goalRoutes from "./modules/goals/goals.routes.js";
// import weightLogRoutes from "./modules/weight-log/weight-log.routes.js";
// import nutrientRoutes from "./modules/nutrients/nutrients.routes.js";
// import reportRoutes from "./modules/reports/reports.routes.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL
  })
);

app.use(express.json());

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

// app.use("/api/v1/goals", goalRoutes);

// app.use(
//   "/api/v1/weight-logs",
//   weightLogRoutes
// );

// app.use(
//   "/api/v1/nutrients",
//   nutrientRoutes
// );

// app.use(
//   "/api/v1/reports",
//   reportRoutes
// );

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