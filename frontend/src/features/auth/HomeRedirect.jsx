import { Navigate } from "react-router-dom"

import { useAuth } from "./useAuth"

/**
 * Handles the "/" route.
 * - While session is being restored, show nothing (avoids flash).
 * - Authenticated users go to /dashboard.
 * - Everyone else goes to /register.
 */
export default function HomeRedirect() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/register" replace />
}
