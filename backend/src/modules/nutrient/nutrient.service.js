import { prisma } from "../../lib/prisma.js";

export const listNutrients = async () => {
  return prisma.nutrient.findMany({
    orderBy: {
      code: "asc"
    },
    select: {
      code: true,
      name: true,
      unit: true,
      category: true
    }
  });
};