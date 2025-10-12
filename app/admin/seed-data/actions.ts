"use server"

import { createClient } from "@/lib/supabase/server"

export async function seedMockData() {
  const supabase = await createClient()

  try {
    // First, get reference data IDs
    const { data: countries } = await supabase.from("countries").select("id, name").limit(5)
    const { data: killzones } = await supabase.from("killzones").select("id, name").limit(5)
    const { data: critops } = await supabase.from("critops").select("id, name").limit(5)
    const { data: tacops } = await supabase.from("tacops").select("id, name").limit(10)
    const { data: killteams } = await supabase
      .from("killteams")
      .select("id, name")
      .in("name", ["Phobos Strike Team", "Kommandos", "Pathfinders", "Legionary", "Kasrkin"])

    if (!countries?.length || !killzones?.length || !critops?.length || !tacops?.length || !killteams?.length) {
      console.log("[v0] Warning: Some reference data is missing, but continuing anyway")
    }

    // Create players
    const playerNames = [
      "ShadowHunter",
      "IronFist",
      "StormBringer",
      "NightStalker",
      "BattleForge",
      "WarHawk",
      "SteelRain",
      "ThunderStrike",
    ]
    const playerIds: string[] = []

    for (const name of playerNames) {
      const { data: existingPlayer } = await supabase.from("players").select("id").eq("playertag", name).maybeSingle()

      if (existingPlayer) {
        playerIds.push(existingPlayer.id)
      } else {
        const { data: newPlayer, error } = await supabase
          .from("players")
          .insert({ playertag: name })
          .select("id")
          .single()

        if (error) {
          console.error("[v0] Error creating player:", error)
          return { error: `Failed to create player ${name}: ${error.message}` }
        }
        playerIds.push(newPlayer.id)
      }
    }

    // Create games - ensure each killteam appears at least 4 times
    const games = []
    const mapLayouts = ["1", "2", "3", "4", "5", "6", null]
    const primaryOps = ["TacOp", "CritOp", "KillOp"]

    // Create 20 games with 5 killteams (each appears 4 times)
    for (let i = 0; i < 20; i++) {
      const player1Idx = i % playerIds.length
      const player2Idx = (i + 1) % playerIds.length
      const killteam1Idx = i % killteams.length
      const killteam2Idx = (i + 2) % killteams.length

      const p1TacOpScore = Math.floor(Math.random() * 7)
      const p1CritOpScore = Math.floor(Math.random() * 7)
      const p1KillOpScore = Math.floor(Math.random() * 7)
      const p1PrimaryOp = primaryOps[Math.floor(Math.random() * primaryOps.length)]

      const p2TacOpScore = Math.floor(Math.random() * 7)
      const p2CritOpScore = Math.floor(Math.random() * 7)
      const p2KillOpScore = Math.floor(Math.random() * 7)
      const p2PrimaryOp = primaryOps[Math.floor(Math.random() * primaryOps.length)]

      // Calculate primary op scores
      const p1PrimaryOpScore = Math.ceil(
        (p1PrimaryOp === "TacOp" ? p1TacOpScore : p1PrimaryOp === "CritOp" ? p1CritOpScore : p1KillOpScore) / 2,
      )
      const p2PrimaryOpScore = Math.ceil(
        (p2PrimaryOp === "TacOp" ? p2TacOpScore : p2PrimaryOp === "CritOp" ? p2CritOpScore : p2KillOpScore) / 2,
      )

      games.push({
        country_id: countries[i % countries.length].id,
        killzone_id: killzones[i % killzones.length].id,
        map_layout: mapLayouts[i % mapLayouts.length],
        critop_id: critops[i % critops.length].id,
        player1_id: playerIds[player1Idx],
        player1_killteam_id: killteams[killteam1Idx].id,
        player1_tacop_id: tacops[i % tacops.length].id,
        player1_tacop_score: p1TacOpScore,
        player1_critop_score: p1CritOpScore,
        player1_killop_score: p1KillOpScore,
        player1_primary_op: p1PrimaryOp,
        player1_primary_op_score: p1PrimaryOpScore,
        player2_id: playerIds[player2Idx],
        player2_killteam_id: killteams[killteam2Idx].id,
        player2_tacop_id: tacops[(i + 1) % tacops.length].id,
        player2_tacop_score: p2TacOpScore,
        player2_critop_score: p2CritOpScore,
        player2_killop_score: p2KillOpScore,
        player2_primary_op: p2PrimaryOp,
        player2_primary_op_score: p2PrimaryOpScore,
        created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    // Insert all games
    const { error: gamesError } = await supabase.from("games").insert(games)

    if (gamesError) {
      console.error("[v0] Error inserting games:", gamesError)
      return { error: `Failed to insert games: ${gamesError.message}` }
    }

    return { success: true, message: `Successfully inserted ${playerNames.length} players and ${games.length} games!` }
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return { error: "An unexpected error occurred" }
  }
}
