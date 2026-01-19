import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const country = searchParams.get("country")
    const player = searchParams.get("player")
    const killteam = searchParams.get("killteam")
    const opponent = searchParams.get("opponent")
    const limit = 20

    const supabase = await createClient()

    const buildBaseQuery = (selectClause: string) => {
      let query = supabase.from("games").select(selectClause, { count: "exact" })

      // Apply date filters
      if (startDate) {
        query = query.gte("created_at", startDate)
      }
      if (endDate) {
        query = query.lte("created_at", endDate)
      }

      // Apply country filter
      if (country && country !== "all") {
        query = query.eq("country_id", country)
      }

      // Apply player filter
      if (player) {
        query = query.or(`player1_id.eq.${player},player2_id.eq.${player}`)
      }

      // Apply killteam and opponent filters
      if (killteam && opponent) {
        // Both killteam and opponent are selected - match specific matchup
        query = query.or(
          `and(player1_killteam_id.eq.${killteam},player2_killteam_id.eq.${opponent}),and(player1_killteam_id.eq.${opponent},player2_killteam_id.eq.${killteam})`
        )
      } else if (killteam) {
        // Only killteam selected
        query = query.or(`player1_killteam_id.eq.${killteam},player2_killteam_id.eq.${killteam}`)
      }

      return query
    }

    let totalCount = 0
    if (!cursor) {
      const countQuery = buildBaseQuery("id")
      const { count, error: countError } = await countQuery

      if (countError) {
        console.error("[v0] Error counting games:", countError)
      } else {
        totalCount = count || 0
      }
    }

    // Build query for fetching games
    let query = buildBaseQuery(
      `
        *,
        country:countries(name),
        killzone:killzones(name),
        critop:critops(name),
        player1:players!games_player1_id_fkey(playertag, supporter),
        player2:players!games_player2_id_fkey(playertag, supporter),
        player1_killteam:killteams!games_player1_killteam_id_fkey(name),
        player2_killteam:killteams!games_player2_killteam_id_fkey(name),
        player1_tacop:tacops!games_player1_tacop_id_fkey(name),
        player2_tacop:tacops!games_player2_tacop_id_fkey(name)
      `,
    )
      .order("created_at", { ascending: false })
      .limit(limit)

    // Apply cursor for pagination
    if (cursor) {
      query = query.lt("created_at", cursor)
    }

    const { data: games, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const hasMore = games && games.length === limit
    const nextCursor = games && games.length > 0 ? games[games.length - 1].created_at : null

    return NextResponse.json({
      games: games || [],
      hasMore,
      nextCursor,
      totalCount: !cursor ? totalCount : undefined, // Only return total count on initial load
    })
  } catch (error) {
    console.error("[v0] Error fetching matchlog:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
