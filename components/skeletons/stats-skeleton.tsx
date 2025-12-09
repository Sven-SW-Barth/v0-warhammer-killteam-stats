import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatsSkeleton() {
  return (
    <div>
      {/* Overview Stats */}
      <div className="mb-6 grid gap-3 sm:mb-8 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Games Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Games</CardDescription>
            <Skeleton className="h-10 w-24" />
          </CardHeader>
        </Card>

        {/* Total Players Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Players</CardDescription>
            <Skeleton className="h-10 w-24" />
          </CardHeader>
        </Card>

        {/* Killzone Distribution Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardDescription>Killzone Distribution</CardDescription>
            <div className="mt-2 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Top TacOps Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardDescription>Top 5 TacOps</CardDescription>
            <div className="mt-2 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Faction Win Rates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Faction Statistics</CardTitle>
              <CardDescription>Win rates and performance metrics for all factions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          {/* Filters Skeleton */}
          <div className="mb-6 flex flex-wrap gap-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Chart Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-[400px] w-full" />
          </div>

          {/* Table Skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
