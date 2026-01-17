"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ROUTES } from "@/lib/constants"

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.PROFILE]: "Profile",
  [ROUTES.SETTINGS]: "Meta Account",
  [ROUTES.ANALYTICS]: "Analytics",
  [ROUTES.AUTHORIZE_META]: "Authorize Meta",
  [ROUTES.SELECT_ACCOUNT]: "Select Account",
}

export function PageHeader() {
  const pathname = usePathname()
  const pageTitle = PAGE_TITLES[pathname] || "Dashboard"

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{pageTitle}</span>
      </div>
    </header>
  )
}
