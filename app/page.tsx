import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { KofiButton } from "@/components/kofi-button"

export default async function LandingPage() {
  let totalGames = 0
  let totalPlayers = 0

  const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseConfigured) {
    try {
      const supabase = await createClient()

      const [gamesResult, playersResult] = await Promise.all([
        supabase.from("games").select("*", { count: "exact", head: true }),
        supabase.from("players").select("*", { count: "exact", head: true }),
      ])

      totalGames = gamesResult.count || 0
      totalPlayers = playersResult.count || 0
    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
      // Stats will remain at 0 if there's an error
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* Hero Section */}
        <div className="mb-12 text-center sm:mb-16">
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:mb-6 sm:text-6xl">
            KT Open Play
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-pretty text-base text-muted-foreground sm:mb-8 sm:text-xl">
            Track your Warhammer 40k Kill Team battles and compete with players worldwide. Record your games, analyze
            statistics, and climb the leaderboards.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/submit"
              className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-8 sm:py-4 sm:text-lg"
            >
              Submit Game Results
            </Link>
            <Link
              href="/stats"
              className="rounded-lg bg-secondary px-6 py-3 text-base font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 sm:px-8 sm:py-4 sm:text-lg"
            >
              View Statistics
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-12 grid gap-4 sm:mb-16 sm:gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6 text-center sm:p-8">
            <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">{totalGames}</div>
            <div className="text-base text-muted-foreground sm:text-lg">Games Recorded</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center sm:p-8">
            <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">{totalPlayers}</div>
            <div className="text-base text-muted-foreground sm:text-lg">Active Players</div>
          </div>
        </div>

        {/* Ko-fi Support Section */}
        <div className="mb-12 flex flex-col items-center justify-center rounded-lg border border-border bg-card p-6 text-center sm:mb-16 sm:p-8">
          <p className="mb-4 text-pretty text-base text-muted-foreground sm:text-lg">
            If you like this project, support it staying live by covering the running costs.
          </p>
          <KofiButton />
        </div>

        {/* Glass Feedback Video Section */}
        <div className="mb-12 flex flex-col items-center justify-center rounded-lg border border-border bg-card p-6 sm:mb-16 sm:p-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Listen to Glass honest feedback!
          </h2>
          <div className="w-full max-w-3xl">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/KXY1GHuGO7w"
                title="Glass honest feedback"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
            <h3 className="mb-2 text-lg font-semibold text-foreground sm:mb-3 sm:text-xl">Track Your Games</h3>
            <p className="text-sm text-muted-foreground sm:text-base">
              Record detailed match results including killzones, tactical operations, and victory points for each
              player.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
            <h3 className="mb-2 text-lg font-semibold text-foreground sm:mb-3 sm:text-xl">Global Statistics</h3>
            <p className="text-sm text-muted-foreground sm:text-base">
              View comprehensive statistics including faction win rates, average scores, and recent games from players
              worldwide.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
            <h3 className="mb-2 text-lg font-semibold text-foreground sm:mb-3 sm:text-xl">Compete on Leaderboards</h3>
            <p className="text-sm text-muted-foreground sm:text-base">
              Climb the rankings based on wins, win rate, and average victory points. See how you stack up against the
              competition.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
