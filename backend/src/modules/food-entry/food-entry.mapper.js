export function mapFoodEntry(foodEntry) {
  return {
    id: foodEntry.id,
    foodName: foodEntry.foodName,
    mealType: foodEntry.mealType,
    eatenAt: foodEntry.eatenAt,

    quantity: foodEntry.quantity.toString(),
    quantityUnit: foodEntry.quantityUnit,

    calories: foodEntry.calories.toString(),
    proteinG: foodEntry.proteinG.toString(),
    carbsG: foodEntry.carbsG.toString(),
    fatG: foodEntry.fatG.toString(),

    source: foodEntry.source,
    aiConfidence:
      foodEntry.aiConfidence === null
        ? null
        : foodEntry.aiConfidence.toString(),

    createdAt: foodEntry.createdAt,
    updatedAt: foodEntry.updatedAt,

    micronutrients: foodEntry.micronutrients.map((item) => ({
      code: item.nutrient.code,
      name: item.nutrient.name,
      unit: item.nutrient.unit,
      category: item.nutrient.category,
      amount: item.amount.toString()
    }))
  };
}