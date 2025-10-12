import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()

  const [{ count: totalGames }, { count: totalPlayers }] = await Promise.all([
    supabase.from("games").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }),
  ])

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
            <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">{totalGames || 0}</div>
            <div className="text-base text-muted-foreground sm:text-lg">Games Recorded</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center sm:p-8">
            <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">{totalPlayers || 0}</div>
            <div className="text-base text-muted-foreground sm:text-lg">Active Players</div>
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

      <footer className="border-t border-border bg-card/50 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built with ❤️ from stickon2 for the Kill Team community •{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
