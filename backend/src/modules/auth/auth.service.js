import crypto from "crypto";
import jwt from "jsonwebtoken";

import { prisma } from "../../lib/prisma.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken
} from "../../lib/jwt.js";
import {
  hashPassword,
  verifyPassword
} from "../../utils/password.js";
import { AppError } from "../../utils/app-error.js";

const hashRefreshToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const createRefreshTokenRecord = async (userId) => {
  const refreshTokenId = crypto.randomUUID();

  const refreshToken =
    createRefreshToken(
      userId,
      refreshTokenId
    );

  const decoded = jwt.decode(refreshToken);

  if (
    !decoded ||
    typeof decoded !== "object" ||
    typeof decoded.exp !== "number"
  ) {
    throw new Error(
      "Failed to determine refresh token expiration"
    );
  }

  const expiresAt =
    new Date(decoded.exp * 1000);

  const tokenHash =
    hashRefreshToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      id: refreshTokenId,
      userId,
      tokenHash,
      expiresAt
    }
  });

  return refreshToken;
};

export const refresh = async (token) => {
  let payload;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(
      "Invalid refresh token",
      401,
      "UNAUTHENTICATED"
    );
  }

  const refreshToken =
    await prisma.refreshToken.findUnique({
      where: {
        id: payload.refreshTokenId
      }
    });

  if (!refreshToken) {
    throw new AppError(
      "Invalid refresh token",
      401,
      "UNAUTHENTICATED"
    );
  }

  const tokenHash =
    hashRefreshToken(token);

  if (tokenHash !== refreshToken.tokenHash) {
    throw new AppError(
      "Invalid refresh token",
      401,
      "UNAUTHENTICATED"
    );
  }

  if (
    refreshToken.revokedAt ||
    refreshToken.expiresAt <= new Date()
  ) {
    throw new AppError(
      "Refresh token expired or revoked",
      401,
      "UNAUTHENTICATED"
    );
  }

  await prisma.refreshToken.update({
    where: {
      id: refreshToken.id
    },
    data: {
      revokedAt: new Date()
    }
  });

  const accessToken =
    createAccessToken(
      refreshToken.userId
    );

  const newRefreshToken =
    await createRefreshTokenRecord(
      refreshToken.userId
    );

  return {
    accessToken,
    refreshToken: newRefreshToken
  };
};

export const logout = async (token) => {
  if (!token) {
    return;
  }

  let payload;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: {
      id: payload.refreshTokenId,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};

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

  const refreshToken =
    await createRefreshTokenRecord(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      timezone: user.timezone
    },
    accessToken,
    refreshToken
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

  const refreshToken =
    await createRefreshTokenRecord(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      timezone: user.timezone
    },
    accessToken,
    refreshToken
  };
};