import { apiRequest } from "../../api/client"

export const listFoodEntries = (
  {
    page = 1,
    limit = 20,
    from,
    to,
    mealType,
  } = {},
  accessToken
) => {
  const params = new URLSearchParams()

  params.set("page", page)
  params.set("limit", limit)

  if (from) {
    params.set("from", from)
  }

  if (to) {
    params.set("to", to)
  }

  if (mealType) {
    params.set("mealType", mealType)
  }

  return apiRequest(
    `/food-entries?${params.toString()}`,
    {
      accessToken,
    }
  )
}

export const deleteFoodEntry = (
  id,
  accessToken
) => {
  return apiRequest(
    `/food-entries/${id}`,
    {
      method: "DELETE",
      accessToken,
    }
  )
}

export const createFoodEntry = (
  data,
  accessToken
) => {
  return apiRequest(
    "/food-entries",
    {
      method: "POST",
      body: JSON.stringify(data),
      accessToken,
    }
  )
}

export const updateFoodEntry = (
  id,
  data,
  accessToken
) => {
  return apiRequest(
    `/food-entries/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
      accessToken,
    }
  )
}

export const getFoodEntry = (
  id,
  accessToken
) => {
  return apiRequest(
    `/food-entries/${id}`,
    {
      accessToken,
    }
  )
}