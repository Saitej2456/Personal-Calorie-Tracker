import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

import LoginPage from "./features/auth/LoginPage"
import ProtectedRoute from "./features/auth/ProtectedRoute"
import AppShell from "./components/layout/AppShell"
import DashboardPage from "./features/dashboard/DashboardPage"
import FoodHistoryPage from "./features/food-entries/FoodHistoryPage"
import FoodEntryCreatePage from "./features/food-entries/FoodEntryCreatePage"
import EditFood from "./features/food-entries/EditFood"
import Goals from "./features/goals/Goals"
import Weight from "./features/weight/Weight"
import Reports from "./features/reports/Reports"

function Register() {
  return <h1>Register</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route
              path="/dashboard"
              element={<DashboardPage  />}
            />

            <Route
              path="/food"
              element={<FoodHistoryPage  />}
            />

            <Route
              path="/food/new"
              element={<FoodEntryCreatePage  />}
            />

            <Route
              path="/food/:id/edit"
              element={<EditFood />}
            />

            <Route
              path="/goals"
              element={<Goals />}
            />

            <Route
              path="/weight"
              element={<Weight />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App