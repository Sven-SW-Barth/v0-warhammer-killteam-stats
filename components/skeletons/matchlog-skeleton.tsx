import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function MatchlogSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters Skeleton */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Total Count Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Match List Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-4">
              {/* Date and Country Row */}
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>

              {/* Players Row */}
              <div className="flex items-center justify-between gap-4">
                {/* Player 1 */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>

                {/* Score */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-8 w-12" />
                </div>

                {/* Player 2 */}
                <div className="flex-1 space-y-2 text-right">
                  <Skeleton className="ml-auto h-5 w-32" />
                  <Skeleton className="ml-auto h-4 w-24" />
                </div>
              </div>

              {/* Operations Row */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More Button Skeleton */}
      <div className="flex justify-center pt-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
