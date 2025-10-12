import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { FactionWinRates } from "@/components/faction-win-rates"
import { StatsFilters } from "@/components/stats-filters"

export default async function StatsPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string; country?: string; killzone?: string; critop?: string }
}) {
  const supabase = await createClient()

  const today = new Date().toISOString().split("T")[0]
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const defaultStartDate = sixMonthsAgo.toISOString().split("T")[0]

  const startDate = searchParams.startDate || defaultStartDate
  const endDate = searchParams.endDate || today
  const countryId = searchParams.country
  const killzoneId = searchParams.killzone
  const critopId = searchParams.critop

  const { data: countries } = await supabase.from("countries").select("id, name").order("name")
  const { data: killzones } = await supabase.from("killzones").select("id, name").order("name")
  const { data: critops } = await supabase.from("critops").select("id, name").order("name")

  let gamesQuery = supabase
    .from("games")
    .select(
      `
      *,
      player1_killteam:killteams!games_player1_killteam_id_fkey(id, name, color),
      player2_killteam:killteams!games_player2_killteam_id_fkey(id, name, color)
    `,
    )
    .gte("created_at", `${startDate}T00:00:00`)
    .lte("created_at", `${endDate}T23:59:59`)
    .order("created_at", { ascending: false })

  if (countryId && countryId !== "all") {
    gamesQuery = gamesQuery.eq("country_id", countryId)
  }

  if (killzoneId && killzoneId !== "all") {
    gamesQuery = gamesQuery.eq("killzone_id", killzoneId)
  }

  if (critopId && critopId !== "all") {
    gamesQuery = gamesQuery.eq("critop_id", critopId)
  }

  const { data: games } = await gamesQuery

  let totalGamesQuery = supabase
    .from("games")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${startDate}T00:00:00`)
    .lte("created_at", `${endDate}T23:59:59`)

  if (countryId && countryId !== "all") {
    totalGamesQuery = totalGamesQuery.eq("country_id", countryId)
  }

  if (killzoneId && killzoneId !== "all") {
    totalGamesQuery = totalGamesQuery.eq("killzone_id", killzoneId)
  }

  if (critopId && critopId !== "all") {
    totalGamesQuery = totalGamesQuery.eq("critop_id", critopId)
  }

  const { count: totalGames } = await totalGamesQuery

  const uniquePlayerIds = new Set<string>()
  games?.forEach((game) => {
    uniquePlayerIds.add(game.player1_id)
    uniquePlayerIds.add(game.player2_id)
  })
  const totalPlayers = uniquePlayerIds.size

  const killteamStats = new Map<
    string,
    { name: string; wins: number; losses: number; draws: number; totalGames: number; color: string; totalScore: number }
  >()

  games?.forEach((game) => {
    const killteam1 = game.player1_killteam as { id: string; name: string; color: string }
    const killteam2 = game.player2_killteam as { id: string; name: string; color: string }

    const player1Total =
      game.player1_tacop_score +
      game.player1_critop_score +
      game.player1_killop_score +
      (game.player1_primary_op_score || 0)
    const player2Total =
      game.player2_tacop_score +
      game.player2_critop_score +
      game.player2_killop_score +
      (game.player2_primary_op_score || 0)

    if (!killteamStats.has(killteam1.id)) {
      killteamStats.set(killteam1.id, {
        name: killteam1.name,
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        color: killteam1.color,
        totalScore: 0,
      })
    }
    if (!killteamStats.has(killteam2.id)) {
      killteamStats.set(killteam2.id, {
        name: killteam2.name,
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        color: killteam2.color,
        totalScore: 0,
      })
    }

    const stats1 = killteamStats.get(killteam1.id)!
    const stats2 = killteamStats.get(killteam2.id)!

    stats1.totalGames++
    stats2.totalGames++

    stats1.totalScore += player1Total
    stats2.totalScore += player2Total

    if (player1Total > player2Total) {
      stats1.wins++
      stats2.losses++
    } else if (player2Total > player1Total) {
      stats2.wins++
      stats1.losses++
    } else {
      stats1.draws++
      stats2.draws++
    }
  })

  const killteamWinRates = Array.from(killteamStats.values())
    .map((stats) => ({
      id: Array.from(killteamStats.entries()).find(([_, s]) => s === stats)?.[0] || "",
      ...stats,
      winRate: stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0,
      avgScore: stats.totalGames > 0 ? stats.totalScore / stats.totalGames : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate)

  const totalScores =
    games?.reduce((sum, game) => {
      const p1Total =
        game.player1_tacop_score +
        game.player1_critop_score +
        game.player1_killop_score +
        (game.player1_primary_op_score || 0)
      const p2Total =
        game.player2_tacop_score +
        game.player2_critop_score +
        game.player2_killop_score +
        (game.player2_primary_op_score || 0)
      return sum + p1Total + p2Total
    }, 0) || 0
  const avgScore = games && games.length > 0 ? totalScores / (games.length * 2) : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:mb-3 sm:text-4xl">
            Global Statistics
          </h1>
          <p className="text-pretty text-sm text-muted-foreground sm:text-base">
            Comprehensive statistics from Kill Team battles around the world
          </p>
        </header>

        <StatsFilters countries={countries || []} killzones={killzones || []} critops={critops || []} />

        {/* Overview Stats */}
        <div className="mb-6 grid gap-3 sm:mb-8 sm:gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Games</CardDescription>
              <CardTitle className="text-4xl">{totalGames || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Players</CardDescription>
              <CardTitle className="text-4xl">{totalPlayers || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Total Score</CardDescription>
              <CardTitle className="text-4xl">{avgScore.toFixed(1)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Kill Team Win Rates */}
        <div className="mb-6 sm:mb-8">
          <FactionWinRates factionStats={killteamWinRates} killzones={killzones || []} critops={critops || []} />
        </div>

        {/* Recent Games */}
      </div>
    </div>
  )
}
