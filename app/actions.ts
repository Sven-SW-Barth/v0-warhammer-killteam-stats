"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitGame(formData: FormData) {
  const supabase = await createClient()

  try {
    const countryId = Number.parseInt(formData.get("country") as string)
    const killzoneId = Number.parseInt(formData.get("killzone") as string)
    const mapLayout = formData.get("map_layout") as string
    const critopId = Number.parseInt(formData.get("critop") as string)

    // Player 1 data - can be either ID or playertag
    const player1Value = formData.get("player1_id") as string
    const player1KillteamId = Number.parseInt(formData.get("player1_killteam") as string)
    const player1TacopId = Number.parseInt(formData.get("player1_tacop") as string)
    const player1PrimaryOp = formData.get("player1_primary_op") as string
    const player1PrimaryOpScore = Number.parseInt(formData.get("player1_primary_op_score") as string)
    const player1TacopScore = Number.parseInt(formData.get("player1_tacop_score") as string)
    const player1CritopScore = Number.parseInt(formData.get("player1_critop_score") as string)
    const player1KillopScore = Number.parseInt(formData.get("player1_killop_score") as string)

    const player2Value = formData.get("player2_id") as string
    const player2KillteamId = Number.parseInt(formData.get("player2_killteam") as string)
    const player2TacopId = Number.parseInt(formData.get("player2_tacop") as string)
    const player2PrimaryOp = formData.get("player2_primary_op") as string
    const player2PrimaryOpScore = Number.parseInt(formData.get("player2_primary_op_score") as string)
    const player2TacopScore = Number.parseInt(formData.get("player2_tacop_score") as string)
    const player2CritopScore = Number.parseInt(formData.get("player2_critop_score") as string)
    const player2KillopScore = Number.parseInt(formData.get("player2_killop_score") as string)

    const isAnonymousOpponent = formData.get("is_anonymous_opponent") === "true"

    // Validate inputs
    if (!player1Value || (!player2Value && !isAnonymousOpponent) || !player1PrimaryOp || !player2PrimaryOp) {
      return { error: "All required fields must be filled" }
    }

    if (
      isNaN(countryId) ||
      isNaN(killzoneId) ||
      isNaN(critopId) ||
      isNaN(player1KillteamId) ||
      isNaN(player1TacopId) ||
      isNaN(player2KillteamId) ||
      isNaN(player2TacopId)
    ) {
      return { error: "Invalid selection for dropdown fields" }
    }

    // Validate scores (0-6)
    const scores = [
      player1TacopScore,
      player1CritopScore,
      player1KillopScore,
      player2TacopScore,
      player2CritopScore,
      player2KillopScore,
    ]
    if (scores.some((score) => isNaN(score) || score < 0 || score > 6)) {
      return { error: "All scores must be between 0 and 6" }
    }

    const primaryScores = [player1PrimaryOpScore, player2PrimaryOpScore]
    if (primaryScores.some((score) => isNaN(score) || score < 0 || score > 3)) {
      return { error: "Primary Op scores must be between 0 and 3" }
    }

    let player1Data
    const player1Id = Number.parseInt(player1Value)

    if (!isNaN(player1Id)) {
      // Value is a valid ID, fetch existing player
      const { data } = await supabase.from("players").select("id").eq("id", player1Id).maybeSingle()
      player1Data = data
    }

    if (!player1Data) {
      // Value is a playertag or ID not found, get or create by playertag
      const { data } = await supabase.from("players").select("id").eq("playertag", player1Value).maybeSingle()

      if (data) {
        player1Data = data
      } else {
        // Create new player
        const { data: newPlayer1, error: player1Error } = await supabase
          .from("players")
          .insert({ playertag: player1Value })
          .select("id")
          .single()

        if (player1Error) throw player1Error
        player1Data = newPlayer1
      }
    }

    let player2Data

    if (isAnonymousOpponent) {
      // Get or create the Anonymous player
      const { data } = await supabase.from("players").select("id").eq("playertag", "Anonymous").maybeSingle()

      if (data) {
        player2Data = data
      } else {
        // Create Anonymous player if it doesn't exist
        const { data: newAnonymous, error: anonymousError } = await supabase
          .from("players")
          .insert({ playertag: "Anonymous", elo_rating: 1200 })
          .select("id")
          .single()

        if (anonymousError) throw anonymousError
        player2Data = newAnonymous
      }
    } else {
      const player2Id = Number.parseInt(player2Value)

      if (!isNaN(player2Id)) {
        // Value is a valid ID, fetch existing player
        const { data } = await supabase.from("players").select("id").eq("id", player2Id).maybeSingle()
        player2Data = data
      }

      if (!player2Data) {
        // Value is a playertag or ID not found, get or create by playertag
        const { data } = await supabase.from("players").select("id").eq("playertag", player2Value).maybeSingle()

        if (data) {
          player2Data = data
        } else {
          // Create new player
          const { data: newPlayer2, error: player2Error } = await supabase
            .from("players")
            .insert({ playertag: player2Value })
            .select("id")
            .single()

          if (player2Error) throw player2Error
          player2Data = newPlayer2
        }
      }
    }

    const { error: gameError } = await supabase.from("games").insert({
      country_id: countryId,
      killzone_id: killzoneId,
      map_layout: mapLayout || null,
      critop_id: critopId,
      player1_id: player1Data.id,
      player1_killteam_id: player1KillteamId,
      player1_tacop_id: player1TacopId,
      player1_primary_op: player1PrimaryOp,
      player1_primary_op_score: player1PrimaryOpScore,
      player1_tacop_score: player1TacopScore,
      player1_critop_score: player1CritopScore,
      player1_killop_score: player1KillopScore,
      player2_id: player2Data.id,
      player2_killteam_id: player2KillteamId,
      player2_tacop_id: player2TacopId,
      player2_primary_op: player2PrimaryOp,
      player2_primary_op_score: player2PrimaryOpScore,
      player2_tacop_score: player2TacopScore,
      player2_critop_score: player2CritopScore,
      player2_killop_score: player2KillopScore,
    })

    if (gameError) throw gameError

    revalidatePath("/")
    revalidatePath("/stats")
    revalidatePath("/leaderboards")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error submitting game:", error)
    return { error: "Failed to record game. Please try again." }
  }
}
