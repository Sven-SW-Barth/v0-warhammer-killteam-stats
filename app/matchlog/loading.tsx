import { MatchlogSkeleton } from "@/components/skeletons/matchlog-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:mb-3 sm:text-4xl">
            Match Log
          </h1>
          <p className="text-pretty text-sm text-muted-foreground sm:text-base">
            Complete history of all Kill Team battles. Click on any game to see detailed results.
          </p>
        </header>

        <MatchlogSkeleton />
      </div>
    </div>
  )
}
