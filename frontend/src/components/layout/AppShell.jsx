import { Outlet } from "react-router-dom"

import Sidebar from "./Sidebar"
import MobileNav from "./MobileNav"

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      <main className="min-h-screen pb-20 md:pb-0 md:pl-64">
        <div className="mx-auto w-full max-w-7xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}