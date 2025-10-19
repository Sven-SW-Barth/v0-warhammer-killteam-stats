import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { MatchlogItem } from "@/components/matchlog-item"
import { StatsFilters } from "@/components/stats-filters"

export default async function MatchlogPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; country?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const today = new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const startDate = params.startDate ? new Date(params.startDate) : sixMonthsAgo
  const endDate = params.endDate ? new Date(params.endDate) : today
  const countryId = params.country

  const { data: countries } = await supabase.from("countries").select("id, name").order("name")

  let query = supabase
    .from("games")
    .select(
      `
      *,
      country:countries(name),
      killzone:killzones(name),
      critop:critops(name),
      player1:players!games_player1_id_fkey(playertag),
      player2:players!games_player2_id_fkey(playertag),
      player1_killteam:killteams!games_player1_killteam_id_fkey(name),
      player2_killteam:killteams!games_player2_killteam_id_fkey(name),
      player1_tacop:tacops!games_player1_tacop_id_fkey(name),
      player2_tacop:tacops!games_player2_tacop_id_fkey(name)
    `,
    )
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())

  if (countryId && countryId !== "all") {
    query = query.eq("country_id", countryId)
  }

  const { data: games } = await query.order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:mb-3 sm:text-4xl">
            Match Log
          </h1>
          <p className="text-pretty text-sm text-muted-foreground sm:text-base">
            Complete history of all Kill Team battles. Click on any game to see detailed results.
          </p>
        </header>

        <StatsFilters countries={countries || []} />

        <Card>
          <CardHeader>
            <CardTitle>All Games</CardTitle>
            <CardDescription>
              {games?.length || 0} {games?.length === 1 ? "game" : "games"} recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {games && games.length > 0 ? (
              <div className="space-y-2">
                {games.map((game) => (
                  <MatchlogItem key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No games recorded yet. Be the first to add a game!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
