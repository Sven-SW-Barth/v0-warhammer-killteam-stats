"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FactionDetailsDialog } from "@/components/faction-details-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

type FactionStat = {
  id: string
  name: string
  wins: number
  losses: number
  draws: number
  totalGames: number
  winRate: number
  avgScore: number
  color: string
}

type Killzone = {
  id: number
  name: string
}

type Critop = {
  id: number
  name: string
}

type SortColumn = "name" | "games" | "wins" | "losses" | "draws" | "winRate" | "avgScore"
type SortDirection = "asc" | "desc"

export function FactionWinRates({
  factionStats,
  killzones,
  critops,
}: {
  factionStats: FactionStat[]
  killzones: Killzone[]
  critops: Critop[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAllFactions, setShowAllFactions] = useState(false)
  const [viewMode, setViewMode] = useState<"winRate" | "avgScore">("winRate")
  const [selectedFaction, setSelectedFaction] = useState<{ id: string; name: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<SortColumn>("winRate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const selectedKillzone = searchParams.get("killzone") || "all"
  const selectedCritop = searchParams.get("critop") || "all"
  const excludeSeason1 = searchParams.get("excludeSeason1") === "true"

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/stats?${params.toString()}`)
  }

  const toggleExcludeSeason1 = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (checked) {
      params.set("excludeSeason1", "true")
    } else {
      params.delete("excludeSeason1")
    }
    router.push(`/stats?${params.toString()}`)
  }

  const filteredForChart = showAllFactions ? factionStats : factionStats.filter((stat) => stat.totalGames >= 3)

  const sortedStats = [...filteredForChart].sort((a, b) =>
    viewMode === "winRate" ? b.winRate - a.winRate : b.avgScore - a.avgScore,
  )

  const chartData = sortedStats.map((stat) => ({
    faction: stat.name,
    value:
      viewMode === "winRate" ? Number.parseFloat(stat.winRate.toFixed(1)) : Number.parseFloat(stat.avgScore.toFixed(1)),
    games: stat.totalGames,
    fill: stat.color,
  }))

  const handleFactionClick = (factionId: string, factionName: string) => {
    setSelectedFaction({ id: factionId, name: factionName })
    setDialogOpen(true)
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const sortedFactionStats = [...factionStats].sort((a, b) => {
    let aValue: number | string
    let bValue: number | string

    switch (sortColumn) {
      case "name":
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case "games":
        aValue = a.totalGames
        bValue = b.totalGames
        break
      case "wins":
        aValue = a.wins
        bValue = b.wins
        break
      case "losses":
        aValue = a.losses
        bValue = b.losses
        break
      case "draws":
        aValue = a.draws
        bValue = b.draws
        break
      case "winRate":
        aValue = a.winRate
        bValue = b.winRate
        break
      case "avgScore":
      default:
        aValue = a.avgScore
        bValue = b.avgScore
        break
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "desc" ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue)
    }

    return sortDirection === "desc" ? (bValue as number) - (aValue as number) : (aValue as number) - (bValue as number)
  })

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 inline h-4 w-4 text-muted-foreground/50" />
    }
    return sortDirection === "desc" ? (
      <ArrowDown className="ml-1 inline h-4 w-4 text-primary" />
    ) : (
      <ArrowUp className="ml-1 inline h-4 w-4 text-primary" />
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#1a1f2e",
            border: "1px solid #4a5568",
            borderRadius: "8px",
            padding: "12px",
            color: "#e5e7eb",
          }}
        >
          <p style={{ color: "#e5e7eb", marginBottom: "8px", fontWeight: "500" }}>{label}</p>
          <p style={{ color: "#ffffff", marginBottom: "4px" }}>
            {viewMode === "winRate" ? "Win Rate %" : "Average Score"}: {payload[0].value}
          </p>
          <p style={{ color: "#ffffff" }}>Games: {payload[0].payload.games}</p>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Faction Statistics</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {showAllFactions
                  ? `All factions (${filteredForChart.length} shown)`
                  : `Top performing factions with at least 3 games (${filteredForChart.length} shown)`}
              </CardDescription>
            </div>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "winRate" | "avgScore")}>
              <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                <TabsTrigger value="winRate" className="text-xs sm:text-sm">
                  Win Rate
                </TabsTrigger>
                <TabsTrigger value="avgScore" className="text-xs sm:text-sm">
                  Avg Score
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Label htmlFor="killzone-filter" className="text-sm font-medium whitespace-nowrap">
                Killzone:
              </Label>
              <Select value={selectedKillzone} onValueChange={(value) => updateFilter("killzone", value)}>
                <SelectTrigger id="killzone-filter" className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Killzones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Killzones</SelectItem>
                  {killzones.map((killzone) => (
                    <SelectItem key={killzone.id} value={killzone.id.toString()}>
                      {killzone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Label htmlFor="critop-filter" className="text-sm font-medium whitespace-nowrap">
                CritOp:
              </Label>
              <Select value={selectedCritop} onValueChange={(value) => updateFilter("critop", value)}>
                <SelectTrigger id="critop-filter" className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All CritOps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All CritOps</SelectItem>
                  {critops.map((critop) => (
                    <SelectItem key={critop.id} value={critop.id.toString()}>
                      {critop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-all-factions"
                checked={showAllFactions}
                onCheckedChange={(checked) => setShowAllFactions(checked === true)}
              />
              <Label htmlFor="show-all-factions" className="text-xs font-normal cursor-pointer sm:text-sm">
                Show factions with less than 3 games
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="exclude-season1"
                checked={excludeSeason1}
                onCheckedChange={(checked) => toggleExcludeSeason1(checked === true)}
              />
              <Label htmlFor="exclude-season1" className="text-xs font-normal cursor-pointer sm:text-sm">
                Exclude declassified Killteams
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" opacity={0.5} />
                  <XAxis
                    dataKey="faction"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    stroke="#e5e7eb"
                    tick={{ fill: "#e5e7eb", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#e5e7eb"
                    tick={{ fill: "#e5e7eb", fontSize: 12 }}
                    label={{
                      value: viewMode === "winRate" ? "Win Rate %" : "Average Score",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#e5e7eb" },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#e5e7eb" }} />
                  <Bar
                    dataKey="value"
                    name={viewMode === "winRate" ? "Win Rate %" : "Average Score"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-center text-sm text-muted-foreground sm:h-[400px] sm:text-base">
              No faction data available yet. Record some games to see statistics!
            </div>
          )}

          {factionStats.length > 0 && (
            <div className="mt-6 overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
              <div className="min-w-[600px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th
                        className="cursor-pointer pb-2 text-left font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort("name")}
                      >
                        Faction
                        <SortIcon column="name" />
                      </th>
                      <th
                        className="cursor-pointer pb-2 text-right font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort("games")}
                      >
                        Games
                        <SortIcon column="games" />
                      </th>
                      <th
                        className="cursor-pointer pb-2 text-right font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort("wins")}
                      >
                        Wins
                        <SortIcon column="wins" />
                      </th>
                      <th
                        className="cursor-pointer pb-2 text-right font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort("losses")}
                      >
                        Losses
                        <SortIcon column="losses" />
                      </th>
                      <th
                        className="cursor-pointer pb-2 text-right font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort("draws")}
                      >
                        Draws
                        <SortIcon column="draws" />
                      </th>
                      <th
                        className="cursor-pointer pb-2 text-right font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort("winRate")}
                      >
                        Win Rate
                        <SortIcon column="winRate" />
                      </th>
                      <th
                        className="cursor-pointer pb-2 text-right font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort("avgScore")}
                      >
                        Avg Score
                        <SortIcon column="avgScore" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFactionStats.map((stat) => (
                      <tr key={stat.name} className="border-b border-border/50">
                        <td className="py-2 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: stat.color }} />
                            <button
                              onClick={() => handleFactionClick(stat.id, stat.name)}
                              className="text-left hover:text-primary hover:underline transition-colors"
                            >
                              {stat.name}
                            </button>
                          </div>
                        </td>
                        <td className="py-2 text-right">{stat.totalGames}</td>
                        <td className="py-2 text-right text-green-500">{stat.wins}</td>
                        <td className="py-2 text-right text-red-500">{stat.losses}</td>
                        <td className="py-2 text-right text-muted-foreground">{stat.draws}</td>
                        <td className="py-2 text-right font-semibold">{stat.winRate.toFixed(1)}%</td>
                        <td className="py-2 text-right font-semibold">{stat.avgScore.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFaction && (
        <FactionDetailsDialog
          factionId={selectedFaction.id}
          factionName={selectedFaction.name}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  )
}
