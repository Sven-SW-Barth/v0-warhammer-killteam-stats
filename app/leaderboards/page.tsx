import { createClient } from "@/lib/supabase/server"
import { LeaderboardsFilters } from "@/components/leaderboards-filters"
import { LeaderboardsContent } from "@/components/leaderboards-content"

export default async function LeaderboardsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()

  const countryId = searchParams.country as string

  // Fetch countries for filter
  const { data: countries } = await supabase.from("countries").select("id, name").order("name")

  // Fetch all games with player and country info
  let gamesQuery = supabase.from("games").select(`
      *,
      player1:players!games_player1_id_fkey(id, name, country:countries(name)),
      player2:players!games_player2_id_fkey(id, name, country:countries(name))
    `)

  if (countryId && countryId !== "all") {
    gamesQuery = gamesQuery.or(`player1.country_id.eq.${countryId},player2.country_id.eq.${countryId}`)
  }

  const { data: games } = await gamesQuery

  // Calculate player statistics
  const playerStats = new Map<
    string,
    {
      name: string
      wins: number
      losses: number
      draws: number
      totalGames: number
      totalScore: number
      countryCode: string | null
      countryName: string | null
      eloRating: number
    }
  >()

  games?.forEach((game: any) => {
    const player1 = game.player1
    const player2 = game.player2

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

    // Initialize player1 stats
    if (!playerStats.has(player1.id)) {
      playerStats.set(player1.id, {
        name: player1.name,
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        totalScore: 0,
        countryCode: player1.country?.code || null,
        countryName: player1.country?.name || null,
        eloRating: game.player1_elo_after || 1500,
      })
    }

    // Initialize player2 stats
    if (!playerStats.has(player2.id)) {
      playerStats.set(player2.id, {
        name: player2.name,
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        totalScore: 0,
        countryCode: player2.country?.code || null,
        countryName: player2.country?.name || null,
        eloRating: game.player2_elo_after || 1500,
      })
    }

    const stats1 = playerStats.get(player1.id)!
    const stats2 = playerStats.get(player2.id)!

    // Update ELO ratings to the most recent
    stats1.eloRating = game.player1_elo_after || stats1.eloRating
    stats2.eloRating = game.player2_elo_after || stats2.eloRating

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

  const players = Array.from(playerStats.entries())
    .map(([id, stats]) => ({
      id,
      ...stats,
      avgScore: stats.totalGames > 0 ? stats.totalScore / stats.totalGames : 0,
      winRate: stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0,
    }))
    .sort((a, b) => b.eloRating - a.eloRating)
    .map((player, index) => ({
      ...player,
      rank: index + 1,
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

        <LeaderboardsFilters countries={countries || []} />

        <LeaderboardsContent players={players} />
      </div>
    </div>
  )
}
