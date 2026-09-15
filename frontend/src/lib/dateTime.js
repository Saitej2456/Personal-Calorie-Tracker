const getDateFormatter = (timeZone) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export const getTodayDate = (
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  return getDateFormatter(timeZone).format(new Date())
}

export const getDateDaysAgo = (
  days,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  const now = new Date()

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)

  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, Number(value)])
  )

  const date = new Date(
    Date.UTC(
      values.year,
      values.month - 1,
      values.day - days
    )
  )

  return date.toISOString().slice(0, 10)
}

export const getNextDate = (date) => {
  const [year, month, day] =
    date.split("-").map(Number)

  const nextDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day + 1
    )
  )

  return nextDate.toISOString().slice(0, 10)
}