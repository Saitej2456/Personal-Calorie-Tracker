import { apiRequest } from "../../api/client"

export const listNutrients = (accessToken) =>
  apiRequest("/nutrients", {
    accessToken,
  })