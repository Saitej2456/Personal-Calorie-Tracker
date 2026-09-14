import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";

export async function createGoal(userId, input) {
  return prisma.goal.create({
    data: {
      userId,

      calorieTarget: input.calorieTarget,
      proteinTarget: input.proteinTarget,
      carbsTarget: input.carbsTarget,
      fatTarget: input.fatTarget,

      weightGoal:
        input.weightGoal ?? null,

      effectiveFrom:
        new Date(input.effectiveFrom),

      effectiveTo:
        input.effectiveTo == null
          ? null
          : new Date(input.effectiveTo)
    }
  });
}

export async function listGoals(userId, { page, limit }) {
  const skip = (page - 1) * limit;

  const [goals, total] = await prisma.$transaction([
    prisma.goal.findMany({
      where: { userId },
      orderBy: [
        { effectiveFrom: "desc" },
        { id: "desc" }
      ],
      skip,
      take: limit
    }),

    prisma.goal.count({
      where: { userId }
    })
  ]);

  return {
    goals,
    total
  };
}

export async function getGoalById(userId, goalId) {
  return prisma.goal.findFirst({
    where: {
      id: goalId,
      userId
    }
  });
}

export async function updateGoal(userId, goalId, input) {
  const existingGoal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      userId
    }
  });

  if (!existingGoal) {
    return null;
  }

  const effectiveFrom =
    input.effectiveFrom !== undefined
      ? new Date(input.effectiveFrom)
      : existingGoal.effectiveFrom;

  const effectiveTo =
    input.effectiveTo !== undefined
      ? input.effectiveTo === null
        ? null
        : new Date(input.effectiveTo)
      : existingGoal.effectiveTo;

  if (
    effectiveTo !== null &&
    effectiveTo <= effectiveFrom
  ) {
    throw new AppError(
      "`effectiveTo` must be after `effectiveFrom`",
      400,
      "VALIDATION_ERROR"
    );
  }

  return prisma.goal.update({
    where: {
      id: goalId
    },
    data: {
      ...(input.calorieTarget !== undefined && {
        calorieTarget: input.calorieTarget
      }),

      ...(input.proteinTarget !== undefined && {
        proteinTarget: input.proteinTarget
      }),

      ...(input.carbsTarget !== undefined && {
        carbsTarget: input.carbsTarget
      }),

      ...(input.fatTarget !== undefined && {
        fatTarget: input.fatTarget
      }),

      ...(input.weightGoal !== undefined && {
        weightGoal: input.weightGoal
      }),

      ...(input.effectiveFrom !== undefined && {
        effectiveFrom
      }),

      ...(input.effectiveTo !== undefined && {
        effectiveTo
      })
    }
  });
}

export async function deleteGoal(userId, goalId) {
  const result = await prisma.goal.deleteMany({
    where: {
      id: goalId,
      userId
    }
  });

  return result.count > 0;
}