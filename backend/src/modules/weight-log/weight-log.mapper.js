export function mapWeightLog(weightLog) {
  return {
    id: weightLog.id,
    weightKg: weightLog.weightKg.toString(),
    loggedAt: weightLog.loggedAt,
    createdAt: weightLog.createdAt
  };
}