import {
  createContext,
  useEffect,
  useState,
} from "react"

import * as authApi from "../../api/auth.api"
import {
  setAccessToken,
  clearAccessToken,
} from "../../api/token"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const result = await authApi.refresh()

        setAccessTokenState(result.data.accessToken)
        setAccessToken(result.data.accessToken)
      } catch {
        clearAccessToken()
        setAccessTokenState(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (credentials) => {
    const result = await authApi.login(credentials)

    setAccessTokenState(result.data.accessToken)
    setAccessToken(result.data.accessToken)
  }

  const register = async (userData) => {
    const result = await authApi.register(userData)

    setAccessTokenState(result.data.accessToken)
    setAccessToken(result.data.accessToken)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearAccessToken()
      setAccessTokenState(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: Boolean(accessToken),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}