"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  LineChart,
  Settings,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ROUTES } from "@/lib/constants"
import { signOut } from "@repo/auth"

const navigationItems = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: ROUTES.ANALYTICS,
    icon: LineChart,
  },
  {
    title: "Meta Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
]

interface AppSidebarProps {
  profile: {
    id: string
    email: string | null
    fullName: string | null
    avatarUrl: string | null
    status: string
  } | null
}

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const getInitials = () => {
    if (profile?.fullName) {
      return profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase()
    }
    return "U"
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await signOut()

      if (error) {
        console.error("Logout error:", error)
        setIsLoggingOut(false)
        return
      }

      window.location.href = ROUTES.LOGIN
    } catch (err) {
      console.error("Unexpected logout error:", err)
      setIsLoggingOut(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={(props) => (
                <Link href={ROUTES.DASHBOARD} {...props} />
              )}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <Image
                  src="/logo.png"
                  alt="JakeX Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">JakeX</span>
                <span className="truncate text-xs text-muted-foreground">Ads Manager</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} className="contents">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={{ children: item.title }}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {profile && (
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Link
                  href={ROUTES.PROFILE}
                  className="flex items-center gap-2 flex-1 min-w-0 rounded-md px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={profile.avatarUrl || undefined} alt={profile.fullName || "User"} />
                    <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-semibold">
                      {profile.fullName || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {profile.email}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="shrink-0 p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors disabled:opacity-50"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
