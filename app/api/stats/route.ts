import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const today = new Date().toISOString().split("T")[0]
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const defaultStartDate = sixMonthsAgo.toISOString().split("T")[0]

  const startDate = searchParams.get("startDate") || defaultStartDate
  const endDate = searchParams.get("endDate") || today
  const countryId = searchParams.get("country")
  const killzoneId = searchParams.get("killzone")
  const critopId = searchParams.get("critop")

  const supabase = await createClient()

  let gamesQuery = supabase
    .from("games")
    .select(
      `
      *,
      player1_killteam:killteams!games_player1_killteam_id_fkey(id, name, color, seasons),
      player2_killteam:killteams!games_player2_killteam_id_fkey(id, name, color, seasons)
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

  const [{ data: games }, { data: killzones }, { data: tacops }] = await Promise.all([
    gamesQuery,
    supabase.from("killzones").select("id, name").order("name"),
    supabase.from("tacops").select("id, name").order("name"),
  ])

  const filteredGames = games || []

  // Calculate total games count
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

  // Calculate unique players
  const uniquePlayerIds = new Set<string>()
  filteredGames.forEach((game) => {
    uniquePlayerIds.add(game.player1_id)
    uniquePlayerIds.add(game.player2_id)
  })
  const totalPlayers = uniquePlayerIds.size

  // Calculate killteam stats
  const killteamStats = new Map<
    string,
    {
      name: string
      wins: number
      losses: number
      draws: number
      totalGames: number
      color: string
      totalScore: number
      seasons: number
    }
  >()

  filteredGames.forEach((game) => {
    const killteam1 = game.player1_killteam as { id: string; name: string; color: string; seasons: number }
    const killteam2 = game.player2_killteam as { id: string; name: string; color: string; seasons: number }

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
        seasons: killteam1.seasons,
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
        seasons: killteam2.seasons,
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

  // Calculate killzone distribution
  const killzoneDistribution = new Map<string, { name: string; count: number; percentage: number }>()

  filteredGames.forEach((game) => {
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

  const totalGamesForKillzone = filteredGames.length
  killzoneDistribution.forEach((stats) => {
    stats.percentage = totalGamesForKillzone > 0 ? (stats.count / totalGamesForKillzone) * 100 : 0
  })

  const killzoneStats = Array.from(killzoneDistribution.values()).sort((a, b) => b.count - a.count)

  // Calculate tacop stats
  const tacopStats = new Map<string, { name: string; count: number; totalScore: number; avgScore: number }>()

  filteredGames.forEach((game) => {
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

  return Response.json({
    totalGames: totalGames || 0,
    totalPlayers,
    killzoneStats,
    topTacops,
    killteamWinRates,
  })
}
