import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "./useAuth"

/**
 * Wraps public-only routes like /login and /register.
 * If the user is already authenticated, redirect them to /dashboard.
 * While the session is loading, render nothing to avoid a flash.
 */
export default function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
