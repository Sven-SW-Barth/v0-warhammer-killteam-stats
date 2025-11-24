import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { FactionWinRates } from "@/components/faction-win-rates"
import { StatsFilters } from "@/components/stats-filters"

export default async function StatsPage({
  searchParams,
}: {
  searchParams: {
    startDate?: string
    endDate?: string
    country?: string
    killzone?: string
    critop?: string
    excludeSeason1?: string
  }
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
  const excludeSeason1 = searchParams.excludeSeason1 === "true"

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

  const filteredGames = games

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
  filteredGames?.forEach((game) => {
    uniquePlayerIds.add(game.player1_id)
    uniquePlayerIds.add(game.player2_id)
  })
  const totalPlayers = uniquePlayerIds.size

  const killteamStats = new Map<
    string,
    { name: string; wins: number; losses: number; draws: number; totalGames: number; color: string; totalScore: number }
  >()

  filteredGames?.forEach((game) => {
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
    filteredGames?.reduce((sum, game) => {
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

  const killzoneDistribution = new Map<string, { name: string; count: number; percentage: number }>()

  filteredGames?.forEach((game) => {
    const killzoneId = game.killzone_id
    if (killzoneId) {
      const killzone = killzones?.find((k) => k.id === killzoneId)
      if (killzone) {
        if (!killzoneDistribution.has(killzoneId)) {
          killzoneDistribution.set(killzoneId, { name: killzone.name, count: 0, percentage: 0 })
        }
        const stats = killzoneDistribution.get(killzoneId)!
        stats.count++
      }
    }
  })

  const totalGamesForKillzone = filteredGames?.length || 0
  killzoneDistribution.forEach((stats) => {
    stats.percentage = totalGamesForKillzone > 0 ? (stats.count / totalGamesForKillzone) * 100 : 0
  })

  const killzoneStats = Array.from(killzoneDistribution.values()).sort((a, b) => b.count - a.count)

  const { data: tacops } = await supabase.from("tacops").select("id, name").order("name")

  const tacopStats = new Map<string, { name: string; count: number; totalScore: number; avgScore: number }>()

  filteredGames?.forEach((game) => {
    if (game.player1_tacop_id) {
      const tacop = tacops?.find((t) => t.id === game.player1_tacop_id)
      if (tacop) {
        if (!tacopStats.has(game.player1_tacop_id)) {
          tacopStats.set(game.player1_tacop_id, { name: tacop.name, count: 0, totalScore: 0, avgScore: 0 })
        }
        const stats = tacopStats.get(game.player1_tacop_id)!
        stats.count++
        stats.totalScore += game.player1_tacop_score
      }
    }

    if (game.player2_tacop_id) {
      const tacop = tacops?.find((t) => t.id === game.player2_tacop_id)
      if (tacop) {
        if (!tacopStats.has(game.player2_tacop_id)) {
          tacopStats.set(game.player2_tacop_id, { name: tacop.name, count: 0, totalScore: 0, avgScore: 0 })
        }
        const stats = tacopStats.get(game.player2_tacop_id)!
        stats.count++
        stats.totalScore += game.player2_tacop_score
      }
    }
  })

  tacopStats.forEach((stats) => {
    stats.avgScore = stats.count > 0 ? stats.totalScore / stats.count : 0
  })

  const topTacops = Array.from(tacopStats.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

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
        <div className="mb-6 grid gap-3 sm:mb-8 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
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

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardDescription>Killzone Distribution</CardDescription>
              <div className="mt-2 space-y-2">
                {killzoneStats.length > 0 ? (
                  killzoneStats.map((kz) => (
                    <div key={kz.name} className="flex items-center justify-between text-sm">
                      <span className="truncate text-muted-foreground">{kz.name}</span>
                      <span className="ml-2 font-semibold text-foreground">{kz.percentage.toFixed(1)}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardDescription>Top 5 TacOps</CardDescription>
              <div className="mt-2 space-y-2">
                {topTacops.length > 0 ? (
                  topTacops.map((tacop, index) => (
                    <div key={tacop.name} className="flex items-center justify-between text-sm">
                      <span className="truncate text-muted-foreground">
                        {index + 1}. {tacop.name}
                      </span>
                      <div className="ml-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">({tacop.count}x)</span>
                        <span className="font-semibold text-foreground">{tacop.avgScore.toFixed(1)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
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
