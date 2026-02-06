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

    // Call the database function that handles everything server-side
    // This avoids timeout and rate limiting issues
    const { data, error } = await supabase.rpc("recalculate_all_elo")

    if (error) {
      console.error("[v0] Error calling recalculate_all_elo:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Clear the elo_needs_recalc flag
    await supabase
      .from("system_settings")
      .update({ value: "false", updated_at: new Date().toISOString() })
      .eq("key", "elo_needs_recalc")

    // The RPC returns an array of rows, so we need to access the first element
    const result = Array.isArray(data) ? data[0] : data
    return NextResponse.json({
      success: true,
      gamesProcessed: result?.games_processed || 0,
      gamesSkipped: result?.games_skipped || 0,
      playersUpdated: result?.players_updated || 0,
    })
  } catch (error) {
    console.error("[v0] ELO recalculation error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
