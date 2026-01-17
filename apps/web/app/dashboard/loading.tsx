import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
        <div className="min-h-screen relative z-10">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div>
                <Skeleton className="h-5 w-20 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar Skeleton */}
          <aside className="col-span-3 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </aside>

          {/* Center - Card Skeleton */}
          <div className="col-span-6 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-96 rounded-3xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>

          {/* Right Sidebar Skeleton */}
          <aside className="col-span-3 space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </aside>
        </div>
      </main>
    </div>
  )}
