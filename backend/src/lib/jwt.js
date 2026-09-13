import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createAccessToken = (userId) => {
  return jwt.sign(
    {
      sub: userId
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    }
  );
};

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(
    token,
    env.JWT_ACCESS_SECRET
  );

  if (typeof payload.sub !== "string") {
    throw new Error("Invalid token");
  }

  return {
    userId: payload.sub
  };
};