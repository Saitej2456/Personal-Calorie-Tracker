import { mapPrismaError } from "../utils/prisma-error.js";

export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  console.error(err);

  const mappedError = mapPrismaError(err);

  const statusCode =
    mappedError.statusCode || 500;

  const code =
    mappedError.code ||
    "INTERNAL_SERVER_ERROR";

  return res.status(statusCode).json({
    error: {
      code,
      message:
        statusCode === 500
          ? "Internal server error"
          : mappedError.message,

      ...(mappedError.details && {
        details: mappedError.details
      })
    }
  });
};