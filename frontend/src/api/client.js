import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./token"

const API_BASE_URL = "http://localhost:5000/api/v1"

let refreshPromise = null

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch(
      `${API_BASE_URL}/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.error?.message ||
              "Session refresh failed"
          )
        }

        const newAccessToken =
          data.data.accessToken

        setAccessToken(newAccessToken)

        return newAccessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export const apiRequest = async (
  endpoint,
  options = {},
  retry = true
) => {
  const {
    accessToken,
    ...fetchOptions
  } = options

  const token =
    accessToken ?? getAccessToken()

  const headers = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...fetchOptions,
      credentials: "include",
      headers,
    }
  )

  const text = await response.text()

    const data = text
    ? JSON.parse(text)
    : null

  if (
    response.status === 401 &&
    retry
  ) {
    try {
      const newAccessToken =
        await refreshAccessToken()

      return apiRequest(
        endpoint,
        {
          ...options,
          accessToken: newAccessToken,
        },
        false
      )
    } catch (error) {
      clearAccessToken()
      throw error
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.error?.message ||
        "Something went wrong"
    )

    error.status = response.status
    error.code = data?.error?.code

    throw error
  }

  return data
}