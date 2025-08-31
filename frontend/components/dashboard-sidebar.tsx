"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Map,
  Heart,
  Bell,
  Clock,
  Users,
  BarChart3,
  Settings,
  LogOut,
  UserCheck,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["visitor", "operator", "admin"],
  },
  {
    title: "Institutions",
    href: "/dashboard/institutions",
    icon: Building2,
    roles: ["visitor"],
  },
  {
    title: "Interactive Map",
    href: "/dashboard/map",
    icon: Map,
    roles: ["visitor"],
  },
  {
    title: "Favorites",
    href: "/dashboard/favorites",
    icon: Heart,
    roles: ["visitor"],
  },
  {
    title: "Alerts",
    href: "/dashboard/alerts",
    icon: Bell,
    roles: ["visitor"],
  },
  {
    title: "Wait Time Prediction",
    href: "/dashboard/wait-time",
    icon: Clock,
    roles: ["visitor"],
  },
  {
    title: "Crowd Management",
    href: "/dashboard/crowd",
    icon: Users,
    roles: ["operator"],
  },
  {
    title: "Branch Info",
    href: "/dashboard/branch",
    icon: Building2,
    roles: ["operator"],
  },
  {
    title: "Visitor Log",
    href: "/dashboard/visitor-log",
    icon: UserCheck,
    roles: ["operator"],
  },
  {
    title: "Institution Management",
    href: "/dashboard/institutions-admin",
    icon: Building2,
    roles: ["admin"],
  },
  {
    title: "Operator Management",
    href: "/dashboard/operators",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["visitor", "operator", "admin"],
  },
]

export function DashboardSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const userNavItems = navItems.filter((item) => item.roles.includes(user.role))

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h2 className="text-lg font-semibold text-sidebar-primary cursor-pointer">SmartQueue</h2>
      </div>

      {/* User Info */}
      <div className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-accent capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {userNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="cursor-pointer">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer transition-colors duration-200",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground cursor-pointer transition-colors duration-200"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
