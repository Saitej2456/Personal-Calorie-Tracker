import { prisma } from "../../lib/prisma.js";

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
    const error = new Error(
      `Unknown nutrient codes: ${unknownCodes.join(", ")}`
    );

    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";

    throw error;
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