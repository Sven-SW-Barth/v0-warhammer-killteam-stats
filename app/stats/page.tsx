import { createClient } from "@/lib/supabase/server"
import { StatsFactionTable } from "@/components/stats-faction-table"

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch all data
  const [{ data: games }, { data: killteams }, { data: killzones }, { data: critops }] = await Promise.all([
    supabase.from("games").select(`
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
      killzone_id,
      critop_id
    `),
    supabase.from("killteams").select("id, name, seasons, color"),
    supabase.from("killzones").select("id, name").order("name"),
    supabase.from("critops").select("id, name").order("name"),
  ])

  // Calculate stats
  const killteamStatsMap: {
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

    if (!killteamStatsMap[p1KtId]) killteamStatsMap[p1KtId] = { wins: 0, losses: 0, draws: 0, totalVP: 0, games: 0 }
    if (!killteamStatsMap[p2KtId]) killteamStatsMap[p2KtId] = { wins: 0, losses: 0, draws: 0, totalVP: 0, games: 0 }

    if (p1VP > p2VP) {
      killteamStatsMap[p1KtId].wins++
      killteamStatsMap[p2KtId].losses++
    } else if (p2VP > p1VP) {
      killteamStatsMap[p2KtId].wins++
      killteamStatsMap[p1KtId].losses++
    } else {
      killteamStatsMap[p1KtId].draws++
      killteamStatsMap[p2KtId].draws++
    }

    killteamStatsMap[p1KtId].totalVP += p1VP
    killteamStatsMap[p2KtId].totalVP += p2VP
    killteamStatsMap[p1KtId].games++
    killteamStatsMap[p2KtId].games++
  })

  const factionStats = (killteams || [])
    .map((kt: any) => {
      const stats = killteamStatsMap[kt.id] || { wins: 0, losses: 0, draws: 0, totalVP: 0, games: 0 }
      const winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0
      const avgScore = stats.games > 0 ? stats.totalVP / stats.games : 0

      return {
        id: kt.id,
        name: kt.name,
        seasons: kt.seasons,
        color: kt.color || "#6366f1",
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
        totalGames: stats.games,
        winRate,
        avgScore,
      }
    })
    .filter((f) => f.totalGames >= 3)
    .sort((a, b) => b.winRate - a.winRate)

  // Serialize to break React 19 freezing
  const serializedStats = JSON.parse(
    JSON.stringify({
      factionStats,
      killzones: killzones || [],
      critops: critops || [],
    }),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Global Statistics</h1>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Faction Win Rates</h2>

        <StatsFactionTable factionStats={serializedStats.factionStats} />
      </div>
    </div>
  )
}
