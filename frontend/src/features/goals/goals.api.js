import { apiRequest } from "../../api/client"

export const listGoals = (
  { page = 1, limit = 20 } = {},
  accessToken
) => {
  const params = new URLSearchParams()

  params.set("page", page)
  params.set("limit", limit)

  return apiRequest(`/goals?${params.toString()}`, {
    accessToken,
  })
}

export const createGoal = (data, accessToken) =>
  apiRequest("/goals", {
    method: "POST",
    body: JSON.stringify(data),
    accessToken,
  })

export const updateGoal = (id, data, accessToken) =>
  apiRequest(`/goals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    accessToken,
  })

export const deleteGoal = (id, accessToken) =>
  apiRequest(`/goals/${id}`, {
    method: "DELETE",
    accessToken,
  })