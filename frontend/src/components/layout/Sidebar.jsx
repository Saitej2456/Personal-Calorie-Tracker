import {
  BarChart3,
  Home,
  LogOut,
  Scale,
  Target,
  Utensils,
} from "lucide-react"

import { NavLink } from "react-router-dom"

import { useAuth } from "../../features/auth/useAuth"

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    label: "Food",
    path: "/food",
    icon: Utensils,
  },
  {
    label: "Goals",
    path: "/goals",
    icon: Target,
  },
  {
    label: "Weight",
    path: "/weight",
    icon: Scale,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
]

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <div>
          <h1 className="text-lg font-bold">
            Calorie Tracker
          </h1>

          <p className="text-xs text-muted-foreground">
            Eat well. Track better.
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Log out
        </button>
      </div>
    </aside>
  )
}