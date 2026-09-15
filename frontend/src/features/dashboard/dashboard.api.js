import { apiRequest } from "../../api/client"
import { getNextDate } from "../../lib/dateTime"

export const getTodaySummary = (
  date,
  accessToken
) => {
  return apiRequest(
    `/reports/goal-comparison?date=${date}`,
    {
      accessToken,
    }
  )
}

export const getTodayFoodEntries = (
  date,
  accessToken
) => {
  return apiRequest(
    `/food-entries?page=1&limit=5&from=${date}&to=${getNextDate(date)}`,
    {
      accessToken,
    }
  )
}

export const getCalorieTrend = (
  from,
  to,
  accessToken
) => {
  return apiRequest(
    `/reports/calories?from=${from}&to=${to}`,
    {
      accessToken,
    }
  )
}

export const getLatestWeight = (
  accessToken
) => {
  return apiRequest(
    "/weight-logs?page=1&limit=1",
    {
      accessToken,
    }
  )
}