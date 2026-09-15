import { apiRequest } from "../../api/client"

export const getCaloriesReport = async (
  { from, to },
  accessToken
) => {
  const response = await apiRequest(
    `/reports/calories?from=${from}&to=${to}`,
    { accessToken }
  )

  return response.data.days
}

export const getMacrosReport = async (
  { from, to },
  accessToken
) => {
  const response = await apiRequest(
    `/reports/macros?from=${from}&to=${to}`,
    { accessToken }
  )

  return response.data.days
}

export const getMicronutrientsReport = async (
  { from, to },
  accessToken
) => {
  const response = await apiRequest(
    `/reports/micronutrients?from=${from}&to=${to}`,
    { accessToken }
  )

  return response.data.days
}

export const getGoalComparisonReport = async (
  date,
  accessToken
) => {
  const response = await apiRequest(
    `/reports/goal-comparison?date=${date}`,
    { accessToken }
  )

  return response.data
}