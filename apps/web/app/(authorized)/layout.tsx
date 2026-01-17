import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getUserProfile } from "@/lib/actions/profile"
import { PageHeader } from "@/components/page-header"

export default async function AuthorizedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch user profile for sidebar
  const profileResult = await getUserProfile()
  const profile = profileResult.success ? profileResult.profile : null

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <SidebarInset>
        <PageHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
