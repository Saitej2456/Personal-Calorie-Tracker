import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import {startOfUserDay} from "../../utils/date.js";

export async function getFoodEntryById(userId, foodEntryId) {
  const foodEntry = await prisma.foodEntry.findFirst({
    where: {
      id: foodEntryId,
      userId
    },
    include: {
      micronutrients: {
        include: {
          nutrient: true
        }
      }
    }
  });

  if (!foodEntry) {
    throw new AppError(
      "Food entry not found",
      404,
      "RESOURCE_NOT_FOUND"
    );
  }

  return foodEntry;
}

export const createFoodEntry = async (
  userId,
  input
) => {
  const nutrientCodes =
    input.micronutrients.map(
      (item) => item.code
    );

  const nutrients =
    await prisma.nutrient.findMany({
      where: {
        code: {
          in: nutrientCodes
        }
      }
    });

  const foundCodes = new Set(
    nutrients.map(
      (nutrient) => nutrient.code
    )
  );

  const unknownCodes =
    nutrientCodes.filter(
      (code) => !foundCodes.has(code)
    );

  if (unknownCodes.length > 0) {
    throw new AppError(
        `Unknown nutrient codes: ${unknownCodes.join(", ")}`,
        400,
        "VALIDATION_ERROR"
    );
  }

  const nutrientMap = new Map(
    nutrients.map((nutrient) => [
      nutrient.code,
      nutrient
    ])
  );

  return prisma.$transaction(
    async (tx) => {
      const foodEntry =
        await tx.foodEntry.create({
          data: {
            userId,

            foodName: input.foodName,
            mealType: input.mealType,

            eatenAt:
              new Date(input.eatenAt),

            quantity: input.quantity,
            quantityUnit:
              input.quantityUnit,

            calories: input.calories,
            proteinG: input.proteinG,
            carbsG: input.carbsG,
            fatG: input.fatG,

            source: input.source,

            aiConfidence:
              input.aiConfidence ?? null
          }
        });

      if (
        input.micronutrients.length > 0
      ) {
        await tx.foodEntryNutrient.createMany({
          data:
            input.micronutrients.map(
              (item) => ({
                foodEntryId:
                  foodEntry.id,

                nutrientId:
                  nutrientMap.get(
                    item.code
                  ).id,

                amount: item.amount
              })
            )
        });
      }

      return tx.foodEntry.findUniqueOrThrow({
        where: {
          id: foodEntry.id
        },
        include: {
          micronutrients: {
            include: {
              nutrient: true
            }
          }
        }
      });
    }
  );
};

export const bulkCreateFoodEntries = async (userId, entries) => {
  return prisma.$transaction(async (tx) => {
    const results = [];
    for (const input of entries) {
      const foodEntry = await tx.foodEntry.create({
        data: {
          userId,
          foodName: input.foodName,
          mealType: input.mealType,
          eatenAt: new Date(input.eatenAt),
          quantity: input.quantity,
          quantityUnit: input.quantityUnit,
          calories: input.calories,
          proteinG: input.proteinG,
          carbsG: input.carbsG,
          fatG: input.fatG,
          source: input.source,
          aiConfidence: input.aiConfidence ?? null
        }
      });
      
      // If the bulk data included micronutrients, we'd add them here.
      // But standard CSV uploads typically only have macros.
      
      results.push(foodEntry);
    }
    return results;
  });
};

export async function listFoodEntries(
  userId,
  query
) {
  const {
    page,
    limit,
    from,
    to,
    mealType
  } = query;

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      timezone: true
    }
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "RESOURCE_NOT_FOUND"
    );
  }

  const where = {
    userId
  };

  if (mealType) {
    where.mealType = mealType;
  }

  if (from || to) {
    where.eatenAt = {};

    if (from) {
      where.eatenAt.gte =
        startOfUserDay(
          from,
          user.timezone
        );
    }

    if (to) {
      where.eatenAt.lt =
        startOfUserDay(
          to,
          user.timezone
        );
    }
  }

  const skip = (page - 1) * limit;

  const [foodEntries, totalItems] =
    await prisma.$transaction([
      prisma.foodEntry.findMany({
        where,
        include: {
          micronutrients: {
            include: {
              nutrient: true
            }
          }
        },
        orderBy: [
          {
            eatenAt: "desc"
          },
          {
            id: "desc"
          }
        ],
        skip,
        take: limit
      }),

      prisma.foodEntry.count({
        where
      })
    ]);

  return {
    foodEntries,
    totalItems,
    page,
    limit
  };
}


export async function updateFoodEntry(
  userId,
  foodEntryId,
  input
) {
  const existingEntry =
    await prisma.foodEntry.findFirst({
      where: {
        id: foodEntryId,
        userId
      },
      include: {
        micronutrients: {
          include: {
            nutrient: true
          }
        }
      }
    });

  if (!existingEntry) {
    throw new AppError(
      "Food entry not found",
      404,
      "RESOURCE_NOT_FOUND"
    );
  }

  const updatedSource =
    input.source ?? existingEntry.source;

  const updatedAiConfidence =
    input.aiConfidence !== undefined
      ? input.aiConfidence
      : existingEntry.aiConfidence;

  if (
    updatedSource === "MANUAL" &&
    updatedAiConfidence != null
  ) {
    throw new AppError(
      "aiConfidence must be null or omitted when source is MANUAL",
      400,
      "VALIDATION_ERROR"
    );
  }

  let nutrientMap = new Map();

  if (input.micronutrients !== undefined) {
    const nutrientCodes =
      input.micronutrients.map(
        (item) => item.code
      );

    const nutrients =
      await prisma.nutrient.findMany({
        where: {
          code: {
            in: nutrientCodes
          }
        }
      });

    const foundCodes = new Set(
      nutrients.map(
        (nutrient) => nutrient.code
      )
    );

    const unknownCodes =
      nutrientCodes.filter(
        (code) => !foundCodes.has(code)
      );

    if (unknownCodes.length > 0) {
      throw new AppError(
        `Unknown nutrient codes: ${unknownCodes.join(", ")}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    nutrientMap = new Map(
      nutrients.map((nutrient) => [
        nutrient.code,
        nutrient
      ])
    );
  }

  const foodEntryData = {};

  if (input.foodName !== undefined) {
    foodEntryData.foodName =
      input.foodName;
  }

  if (input.mealType !== undefined) {
    foodEntryData.mealType =
      input.mealType;
  }

  if (input.eatenAt !== undefined) {
    foodEntryData.eatenAt =
      new Date(input.eatenAt);
  }

  if (input.quantity !== undefined) {
    foodEntryData.quantity =
      input.quantity;
  }

  if (input.quantityUnit !== undefined) {
    foodEntryData.quantityUnit =
      input.quantityUnit;
  }

  if (input.calories !== undefined) {
    foodEntryData.calories =
      input.calories;
  }

  if (input.proteinG !== undefined) {
    foodEntryData.proteinG =
      input.proteinG;
  }

  if (input.carbsG !== undefined) {
    foodEntryData.carbsG =
      input.carbsG;
  }

  if (input.fatG !== undefined) {
    foodEntryData.fatG =
      input.fatG;
  }

  if (input.source !== undefined) {
    foodEntryData.source =
      input.source;
  }

  if (input.aiConfidence !== undefined) {
    foodEntryData.aiConfidence =
      input.aiConfidence;
  }

  return prisma.$transaction(
    async (tx) => {
      await tx.foodEntry.update({
        where: {
          id: existingEntry.id
        },
        data: foodEntryData
      });

      if (
        input.micronutrients !== undefined
      ) {
        await tx.foodEntryNutrient.deleteMany({
          where: {
            foodEntryId: existingEntry.id
          }
        });

        if (
          input.micronutrients.length > 0
        ) {
          await tx.foodEntryNutrient.createMany({
            data:
              input.micronutrients.map(
                (item) => ({
                  foodEntryId:
                    existingEntry.id,

                  nutrientId:
                    nutrientMap.get(
                      item.code
                    ).id,

                  amount: item.amount
                })
              )
          });
        }
      }

      return tx.foodEntry.findUniqueOrThrow({
        where: {
          id: existingEntry.id
        },
        include: {
          micronutrients: {
            include: {
              nutrient: true
            }
          }
        }
      });
    }
  );
}


export async function deleteFoodEntry(userId, foodEntryId) {
  const foodEntry = await prisma.foodEntry.findFirst({
    where: {
      id: foodEntryId,
      userId
    }
  });

  if (!foodEntry) {
    throw new AppError(
      "Food entry not found",
      404,
      "RESOURCE_NOT_FOUND"
    );
  }

  await prisma.foodEntry.delete({
    where: {
      id: foodEntry.id
    }
  });
}