import { createClient } from "@/lib/supabase/server"
import { StatsFactionTable } from "@/components/stats-faction-table"
import { StatsFilters } from "@/components/stats-filters"
import { Trophy, Target, MapPin, Map } from "lucide-react"

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const startDate = params.startDate as string | undefined
  const endDate = params.endDate as string | undefined
  const countryId = params.countryId as string | undefined
  const killzoneId = params.killzoneId as string | undefined
  const showLessThan3Games = params.showLessThan3Games !== "false"
  const showDeclassified = params.showDeclassified !== "false"

  // Fetch all games with pagination to bypass Supabase 1000 row limit
  const fetchAllGames = async () => {
    const allGames: any[] = []
    const pageSize = 1000
    let page = 0
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from("games")
        .select(`
          id,
          player1_killteam_id,
          player2_killteam_id,
          player1_primary_op_score,
          player1_tacop_score,
          player1_critop_score,
          player1_killop_score,
          player2_primary_op_score,
          player2_tacop_score,
          player2_critop_score,
          player2_killop_score,
          killzone_id,
          critop_id,
          player1_tacop_id,
          player2_tacop_id,
          country_id,
          created_at,
          map_layout
        `)
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("id", { ascending: true })

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

  const [
    games,
    { data: killteams },
    { data: killzones },
    { data: critops },
    { data: tacops },
    { data: countries },
    { data: rulesUpdates },
  ] = await Promise.all([
    fetchAllGames(),
    supabase.from("killteams").select("id, name, seasons, color"),
    supabase.from("killzones").select("id, name").order("name"),
    supabase.from("critops").select("id, name").order("name"),
    supabase.from("tacops").select("id, name").order("name"),
    supabase.from("countries").select("id, name, code").order("name"),
    supabase.from("rules_updates").select("id, name, release_date").order("release_date", { ascending: true }),
  ])

  const filteredGames = games?.filter((game: any) => {
    // Date filter
    if (startDate && new Date(game.created_at) < new Date(startDate)) return false
    if (endDate && new Date(game.created_at) > new Date(endDate)) return false

    // Country filter
    if (countryId && String(game.country_id) !== countryId) return false

    // Killzone filter
    if (killzoneId && String(game.killzone_id) !== killzoneId) return false

    return true
  })

  const killteamStatsMap: {
    [key: number]: { wins: number; losses: number; draws: number; totalVP: number; games: number }
  } = {}

  const killzoneCount: { [key: number]: number } = {}
  const layoutCount: { [key: string]: number } = {}
  const tacopsStats: {
    [key: string]: { name: string; count: number; wins: number; games: number }
  } = {}

  filteredGames?.forEach((game: any) => {
    const p1KtId = game.player1_killteam_id
    const p2KtId = game.player2_killteam_id
    const p1VP =
      (game.player1_primary_op_score || 0) +
      (game.player1_tacop_score || 0) +
      (game.player1_critop_score || 0) +
      (game.player1_killop_score || 0)
    const p2VP =
      (game.player2_primary_op_score || 0) +
      (game.player2_tacop_score || 0) +
      (game.player2_critop_score || 0) +
      (game.player2_killop_score || 0)

    if (!killteamStatsMap[p1KtId]) killteamStatsMap[p1KtId] = { wins: 0, losses: 0, draws: 0, totalVP: 0, games: 0 }
    if (!killteamStatsMap[p2KtId]) killteamStatsMap[p2KtId] = { wins: 0, losses: 0, draws: 0, totalVP: 0, games: 0 }

    const p1Won = p1VP > p2VP
    const p2Won = p2VP > p1VP

    if (p1Won) {
      killteamStatsMap[p1KtId].wins++
      killteamStatsMap[p2KtId].losses++
    } else if (p2Won) {
      killteamStatsMap[p2KtId].wins++
      killteamStatsMap[p1KtId].losses++
    } else {
      killteamStatsMap[p1KtId].draws++
      killteamStatsMap[p2KtId].draws++
    }

    killteamStatsMap[p1KtId].totalVP += p1VP
    killteamStatsMap[p2KtId].totalVP += p2VP
    killteamStatsMap[p1KtId].games++
    killteamStatsMap[p2KtId].games++

    if (game.map_layout) {
      const layout = game.map_layout.trim()
      if (layout) {
        layoutCount[layout] = (layoutCount[layout] || 0) + 1
      }
    }

    if (game.killzone_id) {
      killzoneCount[game.killzone_id] = (killzoneCount[game.killzone_id] || 0) + 1
    }

    if (game.player1_tacop_id) {
      const tacopId = String(game.player1_tacop_id)
      if (!tacopsStats[tacopId]) {
        const tacopsRecord = tacops?.find((t) => String(t.id) === tacopId)
        tacopsStats[tacopId] = {
          name: tacopsRecord?.name || `TacOp ${tacopId}`,
          count: 0,
          wins: 0,
          games: 0,
        }
      }
      tacopsStats[tacopId].count++
      tacopsStats[tacopId].games++
      if (p1Won) tacopsStats[tacopId].wins++
    }

    if (game.player2_tacop_id) {
      const tacopId = String(game.player2_tacop_id)
      if (!tacopsStats[tacopId]) {
        const tacopsRecord = tacops?.find((t) => String(t.id) === tacopId)
        tacopsStats[tacopId] = {
          name: tacopsRecord?.name || `TacOp ${tacopId}`,
          count: 0,
          wins: 0,
          games: 0,
        }
      }
      tacopsStats[tacopId].count++
      tacopsStats[tacopId].games++
      if (p2Won) tacopsStats[tacopId].wins++
    }
  })

  const factionStats = (killteams || [])
    .map((kt: any) => {
      const stats = killteamStatsMap[kt.id] || { wins: 0, losses: 0, draws: 0, totalVP: 0, games: 0 }
      const winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0
      const avgScore = stats.games > 0 ? stats.totalVP / stats.games : 0

      return {
        id: kt.id,
        name: kt.name,
        seasons: kt.seasons || [],
        color: kt.color || "#6366f1",
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
        totalGames: stats.games,
        winRate,
        avgScore,
      }
    })
    .sort((a, b) => b.winRate - a.winRate)

  const totalGames = filteredGames?.length || 0
  const killzoneDistribution = (killzones || [])
    .map((kz: any) => ({
      name: kz.name,
      count: killzoneCount[kz.id] || 0,
      percentage: totalGames > 0 ? ((killzoneCount[kz.id] || 0) / totalGames) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const layoutDistribution = Object.entries(layoutCount)
    .map(([layout, count]) => ({
      name: layout,
      count,
      percentage: totalGames > 0 ? (count / totalGames) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const tacopsData = Object.entries(tacopsStats)
    .map(([id, stats]) => ({
      name: stats.name,
      count: stats.count,
      percentage: totalGames > 0 ? (stats.count / (totalGames * 2)) * 100 : 0,
      winRate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const top5Killteams = (killteams || [])
    .map((kt: any) => {
      const stats = killteamStatsMap[kt.id] || { wins: 0, losses: 0, draws: 0, totalVP: 0, games: 0 }
      const winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0
      const pickPercentage = totalGames > 0 ? (stats.games / totalGames) * 100 : 0
      return {
        id: kt.id,
        name: kt.name,
        color: kt.color || "#6366f1",
        games: stats.games,
        winRate,
        pickPercentage,
      }
    })
    .sort((a, b) => b.games - a.games)
    .slice(0, 5)

  const selectedKillzone = killzoneId ? killzones?.find((kz) => String(kz.id) === killzoneId) : null

  // Serialize to break React 19 freezing
  const serializedStats = JSON.parse(
    JSON.stringify({
      factionStats,
      killzones: killzones || [],
      countries: countries || [],
      critops: critops || [],
      rulesUpdates: rulesUpdates || [],
      top5Killteams,
      killzoneDistribution,
      layoutDistribution,
      tacopsData,
      totalGames,
      selectedKillzone,
    }),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Global Statistics</h1>

      <div className="mb-6">
        <StatsFilters
          killzones={serializedStats.killzones}
          countries={serializedStats.countries}
          rulesUpdates={serializedStats.rulesUpdates}
          initialFilters={{
            startDate,
            endDate,
            countryId,
            killzoneId,
            showLessThan3Games: params.showLessThan3Games as string | undefined,
            showDeclassified: params.showDeclassified as string | undefined,
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Most Played Teams */}
        <div className="bg-card rounded-lg shadow p-6 border md:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Most Played Teams</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground border-b pb-1">
              <span className="flex-1">Killteam</span>
              <span className="w-16 text-right">Games</span>
              <span className="w-16 text-right">Pick %</span>
              <span className="w-16 text-right">WR %</span>
            </div>
            {serializedStats.top5Killteams.map((kt: any) => (
              <div key={kt.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-2 w-2 rounded-sm flex-shrink-0" style={{ backgroundColor: kt.color }} />
                  <span className="truncate">{kt.name}</span>
                </div>
                <span className="font-semibold w-16 text-right">{kt.games}</span>
                <span className="text-muted-foreground w-16 text-right">{kt.pickPercentage.toFixed(1)}%</span>
                <span
                  className={`font-semibold w-16 text-right ${kt.winRate >= 50 ? "text-green-500" : "text-red-500"}`}
                >
                  {kt.winRate.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Played TacOps */}
        <div className="bg-card rounded-lg shadow p-6 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Top TacOps</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground border-b pb-1">
              <span className="flex-1">TacOp</span>
              <span className="w-16 text-right">Count</span>
              <span className="w-16 text-right">Pick %</span>
              <span className="w-16 text-right">WR %</span>
            </div>
            {serializedStats.tacopsData.slice(0, 5).map((tacop: any) => (
              <div key={tacop.name} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1">{tacop.name}</span>
                <span className="font-semibold w-16 text-right">{tacop.count}</span>
                <span className="text-muted-foreground w-16 text-right">{tacop.percentage.toFixed(1)}%</span>
                <span
                  className={`font-semibold w-16 text-right ${tacop.winRate >= 50 ? "text-green-500" : "text-red-500"}`}
                >
                  {tacop.winRate.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {killzoneId && serializedStats.selectedKillzone ? (
          // Layout Distribution (when killzone is filtered)
          <div className="bg-card rounded-lg shadow p-6 border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Map className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Layout Distribution</h3>
                <p className="text-xs text-muted-foreground">{serializedStats.selectedKillzone.name}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground border-b pb-1">
                <span className="flex-1">Layout</span>
                <span className="w-16 text-right">Games</span>
                <span className="w-16 text-right">%</span>
              </div>
              {serializedStats.layoutDistribution.length > 0 ? (
                serializedStats.layoutDistribution.map((layout: any) => (
                  <div key={layout.name} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{layout.name}</span>
                    <span className="font-semibold w-16 text-right">{layout.count}</span>
                    <span className="text-muted-foreground w-16 text-right">{layout.percentage.toFixed(1)}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No layout data available</p>
              )}
            </div>
          </div>
        ) : (
          // Killzone Distribution (default)
          <div className="bg-card rounded-lg shadow p-6 border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Killzone Distribution</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground border-b pb-1">
                <span className="flex-1">Killzone</span>
                <span className="w-16 text-right">Games</span>
                <span className="w-16 text-right">%</span>
              </div>
              {serializedStats.killzoneDistribution.map((kz: any) => (
                <div key={kz.name} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{kz.name}</span>
                  <span className="font-semibold w-16 text-right">{kz.count}</span>
                  <span className="text-muted-foreground w-16 text-right">{kz.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Faction Statistics */}
      <div className="bg-card rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Faction Statistics</h2>
          <p className="text-sm text-muted-foreground mt-1">Based on {serializedStats.totalGames} total games</p>
        </div>

        <StatsFactionTable
          factionStats={serializedStats.factionStats}
          showLessThan3Games={showLessThan3Games}
          showDeclassified={showDeclassified}
        />
      </div>
    </div>
  )
}
