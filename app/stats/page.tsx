import { createClient } from "@/lib/supabase/server"
import { StatsFilters } from "@/components/stats-filters"
import { StatsContent } from "@/components/stats-content"

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const countryId = params.country === "all" || !params.country ? undefined : params.country
  const killzoneId = params.killzone === "all" || !params.killzone ? undefined : params.killzone
  const critopId = params.critop === "all" || !params.critop ? undefined : params.critop

  const supabase = await createClient()

  // Fetch filter options
  const [{ data: countries }, { data: killzones }, { data: critops }, { data: tacops }] = await Promise.all([
    supabase.from("countries").select("id, name").order("name"),
    supabase.from("killzones").select("id, name").order("name"),
    supabase.from("critops").select("id, name").order("name"),
    supabase.from("tacops").select("id, name").order("name"),
  ])

  // Fetch games with filters
  let gamesQuery = supabase.from("games").select(
    `
      id,
      player1_killteam_id,
      player2_killteam_id,
      player1_primary_op_score,
      player1_tacop_score,
      player1_critop_score,
      player1_killop_score,
      player2_primary_op_score,
      player2_tacop_score,
      player2_critop_score,
      player2_killop_score,
      player1_tacop_id,
      player2_tacop_id,
      killzone_id,
      critop_id,
      country_id,
      killteams_p1:killteams!player1_killteam_id(id, name, seasons),
      killteams_p2:killteams!player2_killteam_id(id, name, seasons)
    `,
  )

  if (countryId) {
    gamesQuery = gamesQuery.eq("country_id", countryId)
  }
  if (killzoneId) {
    gamesQuery = gamesQuery.eq("killzone_id", killzoneId)
  }
  if (critopId) {
    gamesQuery = gamesQuery.eq("critop_id", critopId)
  }

  const { data: games } = await gamesQuery

  // Calculate statistics
  const totalGames = games?.length || 0
  const countrySet = new Set()
  games?.forEach((game: any) => {
    if (game.country_id) countrySet.add(game.country_id)
  })
  const totalPlayers = countrySet.size

  // Killzone distribution
  const killzoneCount: { [key: string]: number } = {}
  games?.forEach((game: any) => {
    const kzId = game.killzone_id
    killzoneCount[kzId] = (killzoneCount[kzId] || 0) + 1
  })
  const killzoneStats = Object.entries(killzoneCount)
    .map(([kzId, count]) => {
      const kz = killzones?.find((k) => k.id === Number.parseInt(kzId))
      return { name: kz?.name || "Unknown", percentage: (count / totalGames) * 100 }
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)

  // Top TacOps
  const tacopsStats: { [key: string]: { count: number; totalScore: number } } = {}
  games?.forEach((game: any) => {
    // Player 1 tacop
    if (game.player1_tacop_id) {
      if (!tacopsStats[game.player1_tacop_id]) {
        tacopsStats[game.player1_tacop_id] = { count: 0, totalScore: 0 }
      }
      tacopsStats[game.player1_tacop_id].count++
      tacopsStats[game.player1_tacop_id].totalScore += game.player1_tacop_score || 0
    }
    // Player 2 tacop
    if (game.player2_tacop_id) {
      if (!tacopsStats[game.player2_tacop_id]) {
        tacopsStats[game.player2_tacop_id] = { count: 0, totalScore: 0 }
      }
      tacopsStats[game.player2_tacop_id].count++
      tacopsStats[game.player2_tacop_id].totalScore += game.player2_tacop_score || 0
    }
  })
  const topTacops = Object.entries(tacopsStats)
    .map(([tacId, stats]) => {
      const tac = tacops?.find((t) => t.id === Number.parseInt(tacId))
      return {
        name: tac?.name || "Unknown",
        count: stats.count,
        avgScore: stats.totalScore / stats.count,
      }
    })
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5)

  // Killteam win rates
  const killteamStats: {
    [key: number]: { wins: number; losses: number; draws: number; totalVP: number; games: number }
  } = {}

  games?.forEach((game: any) => {
    const p1KtId = game.player1_killteam_id
    const p2KtId = game.player2_killteam_id
    const p1VP =
      (game.player1_primary_op_score || 0) +
      (game.player1_tacop_score || 0) +
      (game.player1_critop_score || 0) +
      (game.player1_killop_score || 0)
    const p2VP =
      (game.player2_primary_op_score || 0) +
      (game.player2_tacop_score || 0) +
      (game.player2_critop_score || 0) +
      (game.player2_killop_score || 0)

    if (!killteamStats[p1KtId]) {
      killteamStats[p1KtId] = { wins: 0, losses: 0, draws: 0, totalVP: 0, games: 0 }
    }
    if (!killteamStats[p2KtId]) {
      killteamStats[p2KtId] = { wins: 0, losses: 0, draws: 0, totalVP: 0, games: 0 }
    }

    killteamStats[p1KtId] = {
      ...killteamStats[p1KtId],
      wins: killteamStats[p1KtId].wins + (p1VP > p2VP ? 1 : 0),
      losses: killteamStats[p1KtId].losses + (p1VP < p2VP ? 1 : 0),
      draws: killteamStats[p1KtId].draws + (p1VP === p2VP ? 1 : 0),
      totalVP: killteamStats[p1KtId].totalVP + p1VP,
      games: killteamStats[p1KtId].games + 1,
    }

    killteamStats[p2KtId] = {
      ...killteamStats[p2KtId],
      wins: killteamStats[p2KtId].wins + (p2VP > p1VP ? 1 : 0),
      losses: killteamStats[p2KtId].losses + (p2VP < p1VP ? 1 : 0),
      draws: killteamStats[p2KtId].draws + (p1VP === p2VP ? 1 : 0),
      totalVP: killteamStats[p2KtId].totalVP + p2VP,
      games: killteamStats[p2KtId].games + 1,
    }
  })

  const { data: allKillteams } = await supabase.from("killteams").select("id, name, seasons, color").order("name")

  const killteamWinRates = (allKillteams || []).map((kt) => {
    const stats = killteamStats[kt.id] || { wins: 0, losses: 0, draws: 0, totalVP: 0, games: 0 }
    const totalGames = stats.games
    const winRate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0
    const avgVP = totalGames > 0 ? stats.totalVP / totalGames : 0

    return {
      id: kt.id.toString(), // Add id for faction details dialog
      killteam: kt.name,
      name: kt.name, // Add name alias for FactionWinRates component
      seasons: kt.seasons,
      color: kt.color || "#6366f1", // Add color with fallback
      winRate,
      avgVP,
      avgScore: avgVP, // Add avgScore alias for FactionWinRates component
      totalGames,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
    }
  })

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

        <StatsContent
          totalGames={totalGames}
          totalPlayers={totalPlayers}
          killzoneStats={killzoneStats}
          topTacops={topTacops}
          killteamWinRates={killteamWinRates}
          killzones={killzones || []}
          critops={critops || []}
          initialKillzone={(params.killzone as string) || "all"}
          initialCritop={(params.critop as string) || "all"}
        />
      </div>
    </div>
  )
}
