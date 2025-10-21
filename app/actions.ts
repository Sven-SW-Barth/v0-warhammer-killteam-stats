"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function submitGame(formData: FormData) {
  const supabase = await createClient()

  try {
    const countryId = Number.parseInt(formData.get("country") as string)
    const killzoneId = Number.parseInt(formData.get("killzone") as string)
    const mapLayout = formData.get("map_layout") as string
    const critopId = Number.parseInt(formData.get("critop") as string)
    const customDate = formData.get("custom_date") as string | null

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
      ...(customDate && { created_at: new Date(customDate).toISOString() }),
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

export async function submitDeletionReport(data: {
  gameId: number
  reporterName: string
  reason: string
  explanation: string
}) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("deletion_reports").insert({
      game_id: data.gameId,
      reporter_name: data.reporterName,
      reason: data.reason,
      explanation: data.explanation,
      status: "pending",
    })

    if (error) throw error

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error submitting deletion report:", error)
    return { error: "Failed to submit deletion report. Please try again." }
  }
}

export async function submitEditReport(data: {
  gameId: number
  reporterName: string
  proposedChanges: Record<string, number>
}) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("edit_reports").insert({
      game_id: data.gameId,
      reporter_name: data.reporterName,
      proposed_changes: data.proposedChanges,
      status: "pending",
    })

    if (error) throw error

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error submitting edit report:", error)
    return { error: "Failed to submit edit report. Please try again." }
  }
}

export async function approveDeletionReport(reportId: number) {
  const supabase = createAdminClient()

  try {
    console.log("[SERVER][v0] Fetching deletion report:", reportId)

    // Get the report
    const { data: report, error: fetchError } = await supabase
      .from("deletion_reports")
      .select("game_id")
      .eq("id", reportId)
      .single()

    if (fetchError) {
      console.error("[SERVER][v0] Error fetching report:", fetchError)
      throw fetchError
    }

    console.log("[SERVER][v0] Deleting game:", report.game_id)

    // Delete the game
    const { error: deleteError } = await supabase.from("games").delete().eq("id", report.game_id)

    if (deleteError) {
      console.error("[SERVER][v0] Error deleting game:", deleteError)
      throw deleteError
    }

    console.log("[SERVER][v0] Updating report status to approved")

    // Update report status
    const { error: updateError } = await supabase
      .from("deletion_reports")
      .update({ status: "approved" })
      .eq("id", reportId)

    if (updateError) {
      console.error("[SERVER][v0] Error updating report status:", updateError)
      throw updateError
    }

    console.log("[SERVER][v0] Deletion report approved successfully")

    revalidatePath("/admin")
    revalidatePath("/matchlog")
    revalidatePath("/stats")
    revalidatePath("/leaderboards")

    return { success: true }
  } catch (error) {
    console.error("[SERVER][v0] Error approving deletion report:", error)
    return { error: "Failed to approve deletion report. Please try again." }
  }
}

export async function rejectDeletionReport(reportId: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("deletion_reports").update({ status: "rejected" }).eq("id", reportId)

    if (error) throw error

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error rejecting deletion report:", error)
    return { error: "Failed to reject deletion report. Please try again." }
  }
}

export async function approveEditReport(reportId: number) {
  const supabase = createAdminClient()

  try {
    console.log("[SERVER][v0] Fetching edit report:", reportId)

    // Get the report
    const { data: report, error: fetchError } = await supabase
      .from("edit_reports")
      .select("game_id, proposed_changes")
      .eq("id", reportId)
      .single()

    if (fetchError) {
      console.error("[SERVER][v0] Error fetching report:", fetchError)
      throw fetchError
    }

    console.log("[SERVER][v0] Updating game:", report.game_id, "with changes:", report.proposed_changes)

    // Update the game with proposed changes
    const { error: updateError, data: updateData } = await supabase
      .from("games")
      .update(report.proposed_changes)
      .eq("id", report.game_id)
      .select()

    if (updateError) {
      console.error("[SERVER][v0] Error updating game:", updateError)
      throw updateError
    }

    console.log("[SERVER][v0] Game updated successfully:", updateData)
    console.log("[SERVER][v0] Updating report status to approved")

    // Update report status
    const { error: statusError } = await supabase.from("edit_reports").update({ status: "approved" }).eq("id", reportId)

    if (statusError) {
      console.error("[SERVER][v0] Error updating report status:", statusError)
      throw statusError
    }

    console.log("[SERVER][v0] Edit report approved successfully")

    revalidatePath("/admin")
    revalidatePath("/matchlog")
    revalidatePath("/stats")
    revalidatePath("/leaderboards")

    return { success: true }
  } catch (error) {
    console.error("[SERVER][v0] Error approving edit report:", error)
    return { error: "Failed to approve edit report. Please try again." }
  }
}

export async function rejectEditReport(reportId: number) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("edit_reports").update({ status: "rejected" }).eq("id", reportId)

    if (error) throw error

    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error rejecting edit report:", error)
    return { error: "Failed to reject edit report. Please try again." }
  }
}
