import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Step 1: Reset all player ELOs to 1200
    const { error: resetError } = await supabase.from("players").update({ elo_rating: 1200 }).neq("id", 0)

    if (resetError) {
      console.error("[v0] Error resetting ELOs:", resetError)
      return NextResponse.json({ success: false, error: resetError.message }, { status: 500 })
    }

    // Step 2: Clear existing ELO tracking in games
    const { error: clearError } = await supabase
      .from("games")
      .update({
        player1_elo_before: null,
        player1_elo_after: null,
        player2_elo_before: null,
        player2_elo_after: null,
      })
      .neq("id", 0)

    if (clearError) {
      console.error("[v0] Error clearing game ELOs:", clearError)
      return NextResponse.json({ success: false, error: clearError.message }, { status: 500 })
    }

    // Step 3: Fetch all games in chronological order
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: true })

    if (gamesError || !games) {
      console.error("[v0] Error fetching games:", gamesError)
      return NextResponse.json({ success: false, error: gamesError?.message || "No games found" }, { status: 500 })
    }

    // Step 4: Process each game and calculate ELO changes
    const playerElos = new Map<number, number>()
    const playerGamesPlayed = new Map<number, number>()

    for (const game of games) {
      // Get current ELO ratings (from our map or default 1200)
      const player1Elo = playerElos.get(game.player1_id) || 1200
      const player2Elo = playerElos.get(game.player2_id) || 1200

      // Get games played count for K-factor calculation
      const player1GamesPlayed = playerGamesPlayed.get(game.player1_id) || 0
      const player2GamesPlayed = playerGamesPlayed.get(game.player2_id) || 0

      // Determine adaptive K-factor (32 for <20 games, 24 for 20-50, 16 for 50+)
      const player1KFactor = player1GamesPlayed < 20 ? 32 : player1GamesPlayed < 50 ? 24 : 16
      const player2KFactor = player2GamesPlayed < 20 ? 32 : player2GamesPlayed < 50 ? 24 : 16

      // Calculate total scores
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

      // Calculate expected scores using ELO formula
      const player1Expected = 1 / (1 + Math.pow(10, (player2Elo - player1Elo) / 400))
      const player2Expected = 1 / (1 + Math.pow(10, (player1Elo - player2Elo) / 400))

      // Determine actual scores (1 for win, 0 for loss, 0.5 for draw)
      let player1Actual: number, player2Actual: number
      if (player1Total > player2Total) {
        player1Actual = 1
        player2Actual = 0
      } else if (player2Total > player1Total) {
        player1Actual = 0
        player2Actual = 1
      } else {
        player1Actual = 0.5
        player2Actual = 0.5
      }

      // Calculate new ELO ratings
      const player1NewElo = Math.round(player1Elo + player1KFactor * (player1Actual - player1Expected))
      const player2NewElo = Math.round(player2Elo + player2KFactor * (player2Actual - player2Expected))

      // Update game record with ELO changes
      await supabase
        .from("games")
        .update({
          player1_elo_before: player1Elo,
          player1_elo_after: player1NewElo,
          player2_elo_before: player2Elo,
          player2_elo_after: player2NewElo,
        })
        .eq("id", game.id)

      // Update our maps
      playerElos.set(game.player1_id, player1NewElo)
      playerElos.set(game.player2_id, player2NewElo)
      playerGamesPlayed.set(game.player1_id, player1GamesPlayed + 1)
      playerGamesPlayed.set(game.player2_id, player2GamesPlayed + 1)
    }

    // Step 5: Update all player ELO ratings in the database
    for (const [playerId, elo] of playerElos.entries()) {
      await supabase.from("players").update({ elo_rating: elo }).eq("id", playerId)
    }

    return NextResponse.json({
      success: true,
      gamesProcessed: games.length,
    })
  } catch (error) {
    console.error("[v0] ELO recalculation error:", error)
    return NextResponse.json({ success: false, error: "Failed to recalculate ELO ratings" }, { status: 500 })
  }
}
