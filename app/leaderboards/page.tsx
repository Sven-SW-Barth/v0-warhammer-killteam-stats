import { createClient } from "@/lib/supabase/server"
import { StatsFilters } from "@/components/stats-filters"
import { SortablePlayersTable } from "@/components/sortable-players-table"

export default async function LeaderboardsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; country?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const today = new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const startDate = params.startDate ? new Date(params.startDate) : sixMonthsAgo
  const endDate = params.endDate ? new Date(params.endDate) : today
  const countryId = params.country

  const { data: countries } = await supabase.from("countries").select("id, name").order("name")

  const { data: allPlayers } = await supabase.from("players").select("id, playertag, elo_rating")

  let query = supabase
    .from("games")
    .select(
      `
      *,
      player1:players!games_player1_id_fkey(id, playertag),
      player2:players!games_player2_id_fkey(id, playertag),
      player1_killteam:killteams!games_player1_killteam_id_fkey!left(name),
      player2_killteam:killteams!games_player2_killteam_id_fkey!left(name),
      country:countries!left(id, name, code)
    `,
    )
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())

  if (countryId && countryId !== "all") {
    query = query.eq("country_id", countryId)
  }

  const { data: games, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching games:", error)
  }

  const playerStats = new Map<
    string,
    {
      id: string
      name: string
      wins: number
      losses: number
      draws: number
      totalGames: number
      totalScore: number
      avgScore: number
      countryCode: string | null
      countryName: string | null
      countryCounts: Map<string, number>
      eloRating: number
    }
  >()

  allPlayers?.forEach((player) => {
    playerStats.set(player.id.toString(), {
      id: player.id.toString(),
      name: player.playertag,
      wins: 0,
      losses: 0,
      draws: 0,
      totalGames: 0,
      totalScore: 0,
      avgScore: 0,
      countryCode: null,
      countryName: null,
      countryCounts: new Map(),
      eloRating: player.elo_rating || 1200,
    })
  })

  games?.forEach((game) => {
    const player1 = game.player1 as { id: string; playertag: string }
    const player2 = game.player2 as { id: string; playertag: string }
    const country = game.country as { id: string; name: string; code: string } | null

    if (!player1 || !player2) {
      console.warn("[v0] Skipping game with missing player data:", game.id)
      return
    }

    const player1Id = player1.id.toString()
    const player2Id = player2.id.toString()

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

    if (!playerStats.has(player1Id)) {
      playerStats.set(player1Id, {
        id: player1Id,
        name: player1.playertag,
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        totalScore: 0,
        avgScore: 0,
        countryCode: null,
        countryName: null,
        countryCounts: new Map(),
        eloRating: 1200,
      })
    }
    if (!playerStats.has(player2Id)) {
      playerStats.set(player2Id, {
        id: player2Id,
        name: player2.playertag,
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        totalScore: 0,
        avgScore: 0,
        countryCode: null,
        countryName: null,
        countryCounts: new Map(),
        eloRating: 1200,
      })
    }

    const stats1 = playerStats.get(player1Id)!
    const stats2 = playerStats.get(player2Id)!

    if (country && country.code !== "INT") {
      const count1 = stats1.countryCounts.get(country.code) || 0
      stats1.countryCounts.set(country.code, count1 + 1)

      const count2 = stats2.countryCounts.get(country.code) || 0
      stats2.countryCounts.set(country.code, count2 + 1)
    }

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

  playerStats.forEach((stats) => {
    if (stats.countryCounts.size === 0) {
      stats.countryCode = "INT"
      stats.countryName = "International"
    } else {
      let maxCount = 0
      let homeCountryCode = null
      stats.countryCounts.forEach((count, code) => {
        if (count > maxCount) {
          maxCount = count
          homeCountryCode = code
        }
      })
      stats.countryCode = homeCountryCode
    }
  })

  const playerArray = Array.from(playerStats.values()).map((stats) => ({
    id: stats.id,
    name: stats.name,
    wins: stats.wins,
    losses: stats.losses,
    draws: stats.draws,
    totalGames: stats.totalGames,
    totalScore: stats.totalScore,
    countryCode: stats.countryCode,
    countryName: stats.countryName,
    avgScore: stats.totalGames > 0 ? stats.totalScore / stats.totalGames : 0,
    winRate: stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0,
    eloRating: stats.eloRating,
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:mb-3 sm:text-4xl">
            Leaderboards
          </h1>
          <p className="text-pretty text-sm text-muted-foreground sm:text-base">
            Top performing Kill Team players worldwide
          </p>
        </header>

        <StatsFilters countries={countries || []} />

        {playerArray.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <SortablePlayersTable players={playerArray} />
          </div>
        )}
      </div>
    </div>
  )
}
