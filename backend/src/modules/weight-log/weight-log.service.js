import { prisma } from "../../lib/prisma.js";

export async function createWeightLog(userId, input) {
  return prisma.weightLog.create({
    data: {
      userId,
      weightKg: input.weightKg,
      loggedAt: new Date(input.loggedAt)
    }
  });
}

export async function listWeightLogs(
  userId,
  { page, limit, from, to }
) {
  const where = {
    userId
  };

  if (from || to) {
    where.loggedAt = {};

    if (from) {
      where.loggedAt.gte = new Date(from);
    }

    if (to) {
      where.loggedAt.lt = new Date(to);
    }
  }

  const skip = (page - 1) * limit;

  const [weightLogs, totalItems] =
    await prisma.$transaction([
      prisma.weightLog.findMany({
        where,
        orderBy: [
          {
            loggedAt: "desc"
          },
          {
            id: "desc"
          }
        ],
        skip,
        take: limit
      }),

      prisma.weightLog.count({
        where
      })
    ]);

  return {
    weightLogs,
    totalItems,
    page,
    limit
  };
}

export async function getWeightLogById(
  userId,
  weightLogId
) {
  return prisma.weightLog.findFirst({
    where: {
      id: weightLogId,
      userId
    }
  });
}

export async function updateWeightLog(
  userId,
  weightLogId,
  input
) {
  const existingWeightLog =
    await prisma.weightLog.findFirst({
      where: {
        id: weightLogId,
        userId
      }
    });

  if (!existingWeightLog) {
    return null;
  }

  return prisma.weightLog.update({
    where: {
      id: weightLogId
    },
    data: {
      ...(input.weightKg !== undefined && {
        weightKg: input.weightKg
      }),

      ...(input.loggedAt !== undefined && {
        loggedAt: new Date(input.loggedAt)
      })
    }
  });
}

export async function deleteWeightLog(
  userId,
  weightLogId
) {
  const result = await prisma.weightLog.deleteMany({
    where: {
      id: weightLogId,
      userId
    }
  });

  return result.count > 0;
}