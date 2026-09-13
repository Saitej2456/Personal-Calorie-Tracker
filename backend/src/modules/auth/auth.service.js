import { prisma } from "../../lib/prisma.js";
import { createAccessToken } from "../../lib/jwt.js";
import {
  hashPassword,
  verifyPassword
} from "../../utils/password.js";
import { AppError } from "../../utils/app-error.js";

export const register = async (input) => {
  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

  if (existingUser) {
  throw new AppError(
    "Email already registered",
    409,
    "CONFLICT"
  );
}

  const passwordHash =
    await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      timezone: input.timezone
    }
  });

  const accessToken =
    createAccessToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      timezone: user.timezone
    },
    accessToken
  };
};

export const login = async (input) => {
  const user =
    await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

  if (!user) {
    throw new AppError(
        "Invalid email or password",
        401,
        "UNAUTHENTICATED"
    );
    }

  const validPassword =
    await verifyPassword(
      input.password,
      user.passwordHash
    );

  if (!validPassword) {
    throw new AppError(
        "Invalid email or password",
        401,
        "UNAUTHENTICATED"
    );
    }

  const accessToken =
    createAccessToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      timezone: user.timezone
    },
    accessToken
  };
};