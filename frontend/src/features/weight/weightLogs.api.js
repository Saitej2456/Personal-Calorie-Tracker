import { apiRequest } from "../../api/client"

export const listWeightLogs = (
  { page = 1, limit = 20 } = {},
  accessToken
) => {
  const params = new URLSearchParams()

  params.set("page", page)
  params.set("limit", limit)

  return apiRequest(`/weight-logs?${params.toString()}`, {
    accessToken,
  })
}

export const createWeightLog = (data, accessToken) =>
  apiRequest("/weight-logs", {
    method: "POST",
    body: JSON.stringify(data),
    accessToken,
  })

export const updateWeightLog = (id, data, accessToken) =>
  apiRequest(`/weight-logs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    accessToken,
  })

export const deleteWeightLog = (id, accessToken) =>
  apiRequest(`/weight-logs/${id}`, {
    method: "DELETE",
    accessToken,
  })