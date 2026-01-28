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

    // Step 1: Count total games in database
    const { count: totalGamesCount, error: countError } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("[v0] Error counting games:", countError)
      return NextResponse.json({ success: false, error: countError.message }, { status: 500 })
    }

    const totalGames = totalGamesCount || 0
    console.log(`[v0] Total games in database: ${totalGames}`)

    if (totalGames === 0) {
      return NextResponse.json({ success: false, error: "No games found" }, { status: 500 })
    }

    // Step 2: Reset all player ELOs to 1200 using raw SQL (faster)
    const { error: resetError } = await supabase.rpc("exec_sql", {
      sql: "UPDATE players SET elo_rating = 1200"
    }).maybeSingle()
    
    // Fallback if RPC doesn't exist
    if (resetError) {
      await supabase.from("players").update({ elo_rating: 1200 }).neq("id", 0)
    }

    // Step 3: Clear existing ELO tracking in games
    const { error: clearError } = await supabase
      .from("games")
      .update({
        player1_elo_before: null,
        player1_elo_after: null,
        player2_elo_before: null,
        player2_elo_after: null,
        elo_processed: false,
      })
      .neq("id", 0)

    if (clearError) {
      console.error("[v0] Error clearing game ELOs:", clearError)
      return NextResponse.json({ success: false, error: clearError.message }, { status: 500 })
    }

    // Step 4: Fetch ALL games (in batches)
    const PAGE_SIZE = 1000
    const allGames: any[] = []
    const totalPages = Math.ceil(totalGames / PAGE_SIZE)

    for (let page = 0; page < totalPages; page++) {
      const { data, error } = await supabase
        .from("games")
        .select(`
          *,
          player1:players!player1_id(id, playertag),
          player2:players!player2_id(id, playertag)
        `)
        .order("created_at", { ascending: true })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (error) {
        console.error(`[v0] Error fetching games page ${page}:`, error)
        return NextResponse.json({ success: false, error: `Failed to fetch games page ${page}` }, { status: 500 })
      }

      if (data) {
        allGames.push(...data)
      }
    }

    const games = allGames
    console.log(`[v0] Fetched ${games.length} of ${totalGames} games for ELO recalculation`)

    // Step 5: Calculate all ELO changes in memory
    const playerElos = new Map<number, number>()
    const playerGamesPlayed = new Map<number, number>()
    const gameUpdates: Array<{
      id: number
      player1_elo_before: number
      player1_elo_after: number
      player2_elo_before: number
      player2_elo_after: number
    }> = []

    let gamesProcessed = 0
    let gamesSkipped = 0

    for (const game of games) {
      const player1Tag = (game.player1 as any)?.playertag
      const player2Tag = (game.player2 as any)?.playertag

      if (player1Tag === "Anonymous" || player2Tag === "Anonymous") {
        gamesSkipped++
        continue
      }

      const player1Elo = playerElos.get(game.player1_id) || 1200
      const player2Elo = playerElos.get(game.player2_id) || 1200

      const player1GamesPlayed = playerGamesPlayed.get(game.player1_id) || 0
      const player2GamesPlayed = playerGamesPlayed.get(game.player2_id) || 0

      const player1KFactor = player1GamesPlayed < 20 ? 16 : 12
      const player2KFactor = player2GamesPlayed < 20 ? 16 : 12

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

      const player1Expected = 1 / (1 + Math.pow(10, (player2Elo - player1Elo) / 500))
      const player2Expected = 1 / (1 + Math.pow(10, (player1Elo - player2Elo) / 500))

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

      const player1NewElo = Math.round(player1Elo + player1KFactor * (player1Actual - player1Expected))
      const player2NewElo = Math.round(player2Elo + player2KFactor * (player2Actual - player2Expected))

      gameUpdates.push({
        id: game.id,
        player1_elo_before: player1Elo,
        player1_elo_after: player1NewElo,
        player2_elo_before: player2Elo,
        player2_elo_after: player2NewElo,
      })

      playerElos.set(game.player1_id, player1NewElo)
      playerElos.set(game.player2_id, player2NewElo)
      playerGamesPlayed.set(game.player1_id, player1GamesPlayed + 1)
      playerGamesPlayed.set(game.player2_id, player2GamesPlayed + 1)

      gamesProcessed++
    }

    console.log(`[v0] Calculated ELO for ${gamesProcessed} games, now bulk updating...`)

    // Step 6: Bulk update games using raw SQL (MUCH faster than individual updates)
    // Process in chunks of 100 games per SQL statement
    const CHUNK_SIZE = 100
    for (let i = 0; i < gameUpdates.length; i += CHUNK_SIZE) {
      const chunk = gameUpdates.slice(i, i + CHUNK_SIZE)
      
      // Build a single UPDATE statement using CASE WHEN for all games in this chunk
      const ids = chunk.map(u => u.id).join(',')
      const p1BeforeCases = chunk.map(u => `WHEN ${u.id} THEN ${u.player1_elo_before}`).join(' ')
      const p1AfterCases = chunk.map(u => `WHEN ${u.id} THEN ${u.player1_elo_after}`).join(' ')
      const p2BeforeCases = chunk.map(u => `WHEN ${u.id} THEN ${u.player2_elo_before}`).join(' ')
      const p2AfterCases = chunk.map(u => `WHEN ${u.id} THEN ${u.player2_elo_after}`).join(' ')

      const sql = `
        UPDATE games SET 
          player1_elo_before = CASE id ${p1BeforeCases} END,
          player1_elo_after = CASE id ${p1AfterCases} END,
          player2_elo_before = CASE id ${p2BeforeCases} END,
          player2_elo_after = CASE id ${p2AfterCases} END,
          elo_processed = true
        WHERE id IN (${ids})
      `

      const { error: updateError } = await supabase.rpc("exec_sql", { sql }).maybeSingle()
      
      // Fallback: if RPC doesn't exist, use individual updates for this chunk
      if (updateError) {
        for (const update of chunk) {
          await supabase
            .from("games")
            .update({
              player1_elo_before: update.player1_elo_before,
              player1_elo_after: update.player1_elo_after,
              player2_elo_before: update.player2_elo_before,
              player2_elo_after: update.player2_elo_after,
              elo_processed: true,
            })
            .eq("id", update.id)
        }
      }
    }

    console.log(`[v0] Updated ${gameUpdates.length} games, now updating players...`)

    // Step 7: Bulk update player ELO ratings
    const playerUpdates = Array.from(playerElos.entries())
    const PLAYER_CHUNK_SIZE = 50
    
    for (let i = 0; i < playerUpdates.length; i += PLAYER_CHUNK_SIZE) {
      const chunk = playerUpdates.slice(i, i + PLAYER_CHUNK_SIZE)
      
      const playerIds = chunk.map(([id]) => id).join(',')
      const eloCases = chunk.map(([id, elo]) => `WHEN ${id} THEN ${elo}`).join(' ')
      
      const sql = `UPDATE players SET elo_rating = CASE id ${eloCases} END WHERE id IN (${playerIds})`
      
      const { error: playerUpdateError } = await supabase.rpc("exec_sql", { sql }).maybeSingle()
      
      // Fallback
      if (playerUpdateError) {
        for (const [playerId, elo] of chunk) {
          await supabase.from("players").update({ elo_rating: elo }).eq("id", playerId)
        }
      }
    }

    console.log(`[v0] Updated ${playerElos.size} players`)

    // Step 8: Clear the elo_needs_recalc flag
    await supabase
      .from("system_settings")
      .update({ value: "false", updated_at: new Date().toISOString() })
      .eq("key", "elo_needs_recalc")

    console.log(
      `[v0] ELO recalculation complete: ${gamesProcessed} games processed, ${gamesSkipped} games skipped (Anonymous)`,
    )

    return NextResponse.json({
      success: true,
      gamesProcessed,
      gamesSkipped,
      totalGames: games.length,
      playersUpdated: playerElos.size,
    })
  } catch (error) {
    console.error("[v0] ELO recalculation error:", error)
    return NextResponse.json({ success: false, error: "Failed to recalculate ELO ratings" }, { status: 500 })
  }
}
