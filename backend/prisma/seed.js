import { prisma } from "../src/lib/prisma.js";

const nutrients = [
  // Vitamins
  {
    code: "VITAMIN_A",
    name: "Vitamin A",
    unit: "µg",
    category: "VITAMIN"
  },
  {
    code: "VITAMIN_C",
    name: "Vitamin C",
    unit: "mg",
    category: "VITAMIN"
  },
  {
    code: "VITAMIN_D",
    name: "Vitamin D",
    unit: "µg",
    category: "VITAMIN"
  },
  {
    code: "VITAMIN_E",
    name: "Vitamin E",
    unit: "mg",
    category: "VITAMIN"
  },
  {
    code: "VITAMIN_K",
    name: "Vitamin K",
    unit: "µg",
    category: "VITAMIN"
  },

  // Minerals
  {
    code: "CALCIUM",
    name: "Calcium",
    unit: "mg",
    category: "MINERAL"
  },
  {
    code: "IRON",
    name: "Iron",
    unit: "mg",
    category: "MINERAL"
  },
  {
    code: "MAGNESIUM",
    name: "Magnesium",
    unit: "mg",
    category: "MINERAL"
  },
  {
    code: "PHOSPHORUS",
    name: "Phosphorus",
    unit: "mg",
    category: "MINERAL"
  },
  {
    code: "POTASSIUM",
    name: "Potassium",
    unit: "mg",
    category: "MINERAL"
  },
  {
    code: "ZINC",
    name: "Zinc",
    unit: "mg",
    category: "MINERAL"
  }
];

async function main() {
  for (const nutrient of nutrients) {
    await prisma.nutrient.upsert({
      where: {
        code: nutrient.code
      },
      update: {
        name: nutrient.name,
        unit: nutrient.unit,
        category: nutrient.category
      },
      create: nutrient
    });
  }

  console.log(
    `Seeded ${nutrients.length} nutrients.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });