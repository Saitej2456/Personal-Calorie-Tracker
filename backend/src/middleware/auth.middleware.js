import { verifyAccessToken } from "../lib/jwt.js";

export const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication required"
      }
    });
  }

  const token = authorization.substring(
    "Bearer ".length
  );

  try {
    const { userId } = verifyAccessToken(token);

    req.user = {
      id: userId
    };

    next();
  } catch {
    return res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Invalid or expired access token"
      }
    });
  }
};