import { Prisma } from "@prisma/client";
import { AppError } from "./app-error.js";

export const mapPrismaError = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return new AppError(
          "Resource already exists",
          409,
          "CONFLICT"
        );

      case "P2025":
        return new AppError(
          "Resource not found",
          404,
          "RESOURCE_NOT_FOUND"
        );

      default:
        return new AppError(
          "Database operation failed",
          500,
          "INTERNAL_SERVER_ERROR"
        );
    }
  }

  return error;
};