import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const countryId = searchParams.get("country")

  const supabase = await createClient()

  const { data: allPlayers } = await supabase.from("players").select("id, playertag, elo_rating, supporter")

  // Fetch all games with pagination to bypass Supabase 1000 row limit
  const fetchAllGames = async () => {
    const allGames: any[] = []
    const pageSize = 1000
    let page = 0
    let hasMore = true

    while (hasMore) {
      let query = supabase.from("games").select(
        `
          *,
          player1:players!games_player1_id_fkey(id, playertag, supporter),
          player2:players!games_player2_id_fkey(id, playertag, supporter),
          player1_killteam:killteams!games_player1_killteam_id_fkey(name),
          player2_killteam:killteams!games_player2_killteam_id_fkey(name),
          country:countries(id, name, code)
        `,
      )

      if (countryId && countryId !== "all") {
        query = query.eq("country_id", countryId)
      }

      const { data, error } = await query
        .order("id", { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error || !data || data.length === 0) {
        hasMore = false
      } else {
        allGames.push(...data)
        hasMore = data.length === pageSize
        page++
      }
    }

    return allGames
  }

  const games = await fetchAllGames()

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
      isSupporter: boolean
    }
  >()

  allPlayers?.forEach((player) => {
    if (player.playertag !== "Anonymous") {
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
        isSupporter: player.supporter || false,
      })
    }
  })

  games?.forEach((game) => {
    const player1 = game.player1 as { id: string; playertag: string; supporter?: boolean }
    const player2 = game.player2 as { id: string; playertag: string; supporter?: boolean }
    const country = game.country as { id: string; name: string; code: string } | null

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

    if (player1.playertag !== "Anonymous" && !playerStats.has(player1Id)) {
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
        isSupporter: player1.supporter || false,
      })
    }
    if (player2.playertag !== "Anonymous" && !playerStats.has(player2Id)) {
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
        isSupporter: player2.supporter || false,
      })
    }

    const stats1 = player1.playertag !== "Anonymous" ? playerStats.get(player1Id) : null
    const stats2 = player2.playertag !== "Anonymous" ? playerStats.get(player2Id) : null

    if (stats1 && country && country.code !== "INT") {
      const count1 = stats1.countryCounts.get(country.code) || 0
      stats1.countryCounts.set(country.code, count1 + 1)
    }

    if (stats2 && country && country.code !== "INT") {
      const count2 = stats2.countryCounts.get(country.code) || 0
      stats2.countryCounts.set(country.code, count2 + 1)
    }

    if (stats1) {
      stats1.totalGames++
      stats1.totalScore += player1Total
    }

    if (stats2) {
      stats2.totalGames++
      stats2.totalScore += player2Total
    }

    if (player1Total > player2Total) {
      if (stats1) stats1.wins++
      if (stats2) stats2.losses++
    } else if (player2Total > player1Total) {
      if (stats2) stats2.wins++
      if (stats1) stats1.losses++
    } else {
      if (stats1) stats1.draws++
      if (stats2) stats2.draws++
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

  let playerArray = Array.from(playerStats.values()).map((stats) => ({
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
    isSupporter: stats.isSupporter,
  }))

  playerArray = playerArray.filter((player) => player.totalGames > 0)

  const sortedByElo = [...playerArray].sort((a, b) => b.eloRating - a.eloRating)
  const playersWithRanks = sortedByElo.map((player, index) => ({
    ...player,
    rank: index + 1,
  }))

  return Response.json({ players: playersWithRanks })
}
