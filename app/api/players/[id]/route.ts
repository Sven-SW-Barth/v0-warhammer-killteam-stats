import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: games, error } = await supabase
      .from("games")
      .select(
        `
        *,
        player1_tacop:tacops!games_player1_tacop_id_fkey(name),
        player2_tacop:tacops!games_player2_tacop_id_fkey(name),
        critop:critops(name),
        player1_killteam:killteams!games_player1_killteam_id_fkey(name),
        player2_killteam:killteams!games_player2_killteam_id_fkey(name),
        killzone:killzones(name)
      `,
      )
      .or(`player1_id.eq.${id},player2_id.eq.${id}`)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!games || games.length === 0) {
      return NextResponse.json({ games: [] })
    }

    const playerIds = new Set<string>()
    games.forEach((game) => {
      playerIds.add(game.player1_id.toString())
      playerIds.add(game.player2_id.toString())
    })

    const { data: players } = await supabase.from("players").select("id, playertag").in("id", Array.from(playerIds))

    return NextResponse.json({ games, players })
  } catch (error) {
    console.error("Error fetching player details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
