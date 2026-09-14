import { prisma } from "../../lib/prisma.js";
import {
  fromZonedTime,
  formatInTimeZone
} from "date-fns-tz";
import { Prisma } from "@prisma/client";
import { AppError } from "../../utils/app-error.js";

function getUtcRange(from, to, timezone) {
  return {
    start: fromZonedTime(
      `${from}T00:00:00`,
      timezone
    ),
    end: fromZonedTime(
      `${to}T00:00:00`,
      timezone
    )
  };
}

function getDatesInRange(from, to) {
  const dates = [];

  const [fromYear, fromMonth, fromDay] =
    from.split("-").map(Number);

  const [toYear, toMonth, toDay] =
    to.split("-").map(Number);

  const current = new Date(
    Date.UTC(fromYear, fromMonth - 1, fromDay)
  );

  const end = new Date(
    Date.UTC(toYear, toMonth - 1, toDay)
  );

  while (current < end) {
    dates.push(
      current.toISOString().slice(0, 10)
    );

    current.setUTCDate(
      current.getUTCDate() + 1
    );
  }

  return dates;
}

export async function getCalorieReport(
  userId,
  { from, to }
) {
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

  const timezone = user.timezone;

  const { start, end } =
    getUtcRange(from, to, timezone);

  const foodEntries =
    await prisma.foodEntry.findMany({
      where: {
        userId,
        eatenAt: {
          gte: start,
          lt: end
        }
      },
      select: {
        eatenAt: true,
        calories: true
      },
      orderBy: [
        {
          eatenAt: "asc"
        },
        {
          id: "asc"
        }
      ]
    });

  const dailyCalories = new Map();

  for (const date of getDatesInRange(from, to)) {
    dailyCalories.set(
      date,
      new Prisma.Decimal(0)
    );
  }

  for (const entry of foodEntries) {
    const date = formatInTimeZone(
      entry.eatenAt,
      timezone,
      "yyyy-MM-dd"
    );

    const currentTotal =
      dailyCalories.get(date) ??
      new Prisma.Decimal(0);

    dailyCalories.set(
      date,
      currentTotal.plus(entry.calories)
    );
  }

  return {
    from,
    to,
    days: Array.from(
      dailyCalories,
      ([date, calories]) => ({
        date,
        calories: calories.toFixed(2)
      })
    )
  };
}

export async function getMacroReport(
  userId,
  { from, to }
) {
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

  const timezone = user.timezone;

  const { start, end } =
    getUtcRange(from, to, timezone);

  const foodEntries =
    await prisma.foodEntry.findMany({
      where: {
        userId,
        eatenAt: {
          gte: start,
          lt: end
        }
      },
      select: {
        eatenAt: true,
        proteinG: true,
        carbsG: true,
        fatG: true
      },
      orderBy: [
        {
          eatenAt: "asc"
        },
        {
          id: "asc"
        }
      ]
    });

  const dailyMacros = new Map();

  for (const date of getDatesInRange(from, to)) {
    dailyMacros.set(date, {
      proteinG: new Prisma.Decimal(0),
      carbsG: new Prisma.Decimal(0),
      fatG: new Prisma.Decimal(0)
    });
  }

  for (const entry of foodEntries) {
    const date = formatInTimeZone(
      entry.eatenAt,
      timezone,
      "yyyy-MM-dd"
    );

    const current =
      dailyMacros.get(date) ?? {
        proteinG: new Prisma.Decimal(0),
        carbsG: new Prisma.Decimal(0),
        fatG: new Prisma.Decimal(0)
      };

    dailyMacros.set(date, {
      proteinG: current.proteinG.plus(entry.proteinG),
      carbsG: current.carbsG.plus(entry.carbsG),
      fatG: current.fatG.plus(entry.fatG)
    });
  }

  return {
    from,
    to,
    days: Array.from(
      dailyMacros,
      ([date, macros]) => ({
        date,
        proteinG: macros.proteinG.toFixed(2),
        carbsG: macros.carbsG.toFixed(2),
        fatG: macros.fatG.toFixed(2)
      })
    )
  };
}

export async function getMicronutrientReport(
  userId,
  { from, to }
) {
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

  const timezone = user.timezone;

  const { start, end } =
    getUtcRange(from, to, timezone);

  const foodEntries =
    await prisma.foodEntry.findMany({
      where: {
        userId,
        eatenAt: {
          gte: start,
          lt: end
        }
      },
      select: {
        eatenAt: true,
        micronutrients: {
          select: {
            amount: true,
            nutrient: {
              select: {
                code: true,
                name: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: [
        {
          eatenAt: "asc"
        }
      ]
    });

  const dailyNutrients = new Map();

  for (const date of getDatesInRange(from, to)) {
    dailyNutrients.set(date, new Map());
  }

  for (const entry of foodEntries) {
    const date = formatInTimeZone(
      entry.eatenAt,
      timezone,
      "yyyy-MM-dd"
    );

    const nutrientsForDay =
      dailyNutrients.get(date);

    if (!nutrientsForDay) {
      continue;
    }

    for (const item of entry.micronutrients) {
      const existing =
        nutrientsForDay.get(
          item.nutrient.code
        );

      if (existing) {
        existing.amount =
          existing.amount.plus(item.amount);
      } else {
        nutrientsForDay.set(
          item.nutrient.code,
          {
            code: item.nutrient.code,
            name: item.nutrient.name,
            unit: item.nutrient.unit,
            amount: new Prisma.Decimal(
              item.amount
            )
          }
        );
      }
    }
  }

  return {
    from,
    to,
    days: Array.from(
      dailyNutrients,
      ([date, nutrients]) => ({
        date,
        nutrients: Array.from(
          nutrients.values()
        )
          .sort((a, b) =>
            a.code.localeCompare(b.code)
          )
          .map((nutrient) => ({
            code: nutrient.code,
            name: nutrient.name,
            unit: nutrient.unit,
            amount:
              nutrient.amount.toFixed(2)
          }))
      })
    )
  };
}

function getUtcDayRange(date, timezone) {
  const start = fromZonedTime(
    `${date}T00:00:00`,
    timezone
  );

  const [year, month, day] =
    date.split("-").map(Number);

  const nextDay = new Date(
    Date.UTC(year, month - 1, day + 1)
  );

  const nextDate =
    nextDay.toISOString().slice(0, 10);

  const end = fromZonedTime(
    `${nextDate}T00:00:00`,
    timezone
  );

  return { start, end };
}

export async function getGoalComparison(
  userId,
  { date }
) {
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

  const timezone = user.timezone;

  const { start, end } =
    getUtcDayRange(date, timezone);

  const [foodTotals, goal] =
    await prisma.$transaction([
      prisma.foodEntry.aggregate({
        where: {
          userId,
          eatenAt: {
            gte: start,
            lt: end
          }
        },
        _sum: {
          calories: true,
          proteinG: true,
          carbsG: true,
          fatG: true
        }
      }),

      prisma.goal.findFirst({
        where: {
          userId,
          effectiveFrom: {
            lte: start
          },
          OR: [
            {
              effectiveTo: null
            },
            {
              effectiveTo: {
                gt: start
              }
            }
          ]
        },
        orderBy: {
          effectiveFrom: "desc"
        }
      })
    ]);

  return {
    date,

    actual: {
      calories:
        (foodTotals._sum.calories ??
          new Prisma.Decimal(0)
        ).toFixed(2),

      proteinG:
        (foodTotals._sum.proteinG ??
          new Prisma.Decimal(0)
        ).toFixed(2),

      carbsG:
        (foodTotals._sum.carbsG ??
          new Prisma.Decimal(0)
        ).toFixed(2),

      fatG:
        (foodTotals._sum.fatG ??
          new Prisma.Decimal(0)
        ).toFixed(2)
    },

    goal: goal
      ? {
          id: goal.id,

          calorieTarget:
            goal.calorieTarget.toFixed(2),

          proteinTarget:
            goal.proteinTarget.toFixed(2),

          carbsTarget:
            goal.carbsTarget.toFixed(2),

          fatTarget:
            goal.fatTarget.toFixed(2),

          weightGoal:
            goal.weightGoal === null
              ? null
              : goal.weightGoal.toFixed(3),

          effectiveFrom:
            goal.effectiveFrom,

          effectiveTo:
            goal.effectiveTo
        }
      : null
  };
}