export function mapGoal(goal) {
  return {
    id: goal.id,

    calorieTarget:
      goal.calorieTarget.toString(),

    proteinTarget:
      goal.proteinTarget.toString(),

    carbsTarget:
      goal.carbsTarget.toString(),

    fatTarget:
      goal.fatTarget.toString(),

    weightGoal:
      goal.weightGoal === null
        ? null
        : goal.weightGoal.toString(),

    effectiveFrom: goal.effectiveFrom,
    effectiveTo: goal.effectiveTo,

    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt
  };
}