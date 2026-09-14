// import { addDays } from "date-fns";

import { fromZonedTime } from "date-fns-tz";

export function startOfUserDay(date, timezone) {
  return fromZonedTime(
    `${date}T00:00:00`,
    timezone
  );
}

// export function startOfNextUserDay(date, timezone) {
//   const nextDate = addDays(
//     new Date(`${date}T00:00:00Z`),
//     1
//   )
//     .toISOString()
//     .slice(0, 10);

//   return fromZonedTime(
//     `${nextDate}T00:00:00`,
//     timezone
//   );
// }