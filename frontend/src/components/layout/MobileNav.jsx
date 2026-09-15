import {
  BarChart3,
  Home,
  Scale,
  Target,
  Utensils,
} from "lucide-react"

import { NavLink } from "react-router-dom"

const navigation = [
  {
    label: "Home",
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

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
      <div className="grid grid-cols-5">
        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground",
                ].join(" ")
              }
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}