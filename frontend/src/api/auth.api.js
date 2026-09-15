import { apiRequest } from "./client"

export const register = async (data) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const login = async (data) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const refresh = async () => {
  return apiRequest("/auth/refresh", {
    method: "POST",
  })
}

export const logout = async () => {
  return apiRequest("/auth/logout", {
    method: "POST",
  })
}