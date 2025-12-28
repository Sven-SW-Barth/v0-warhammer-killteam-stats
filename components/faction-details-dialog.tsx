"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp, ChevronsUpDown, Skull, Trophy } from "lucide-react"

interface FactionDetailsDialogProps {
  factionId: string
  factionName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TacOpStats {
  name: string
  count: number
  avgScore: number
  winRate: number
}

interface CritOpStats {
  name: string
  count: number
  avgScore: number
}

interface PrimaryOpStats {
  name: string
  count: number
  avgScore: number
}

interface KillzoneStats {
  name: string
  games: number
  wins: number
  losses: number
  draws: number
  winRate: number
  avgScore: number
}

interface OpponentStats {
  name: string
  games: number
  wins: number
  losses: number
  draws: number
  winRate: number
}

interface OverviewStats {
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number
  avgScore: number
}

export function FactionDetailsDialog({ factionId, factionName, open, onOpenChange }: FactionDetailsDialogProps) {
  const [loading, setLoading] = useState(true)
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null)
  const [tacOpStats, setTacOpStats] = useState<TacOpStats[]>([])
  const [critOpStats, setCritOpStats] = useState<CritOpStats[]>([])
  const [primaryOpStats, setPrimaryOpStats] = useState<PrimaryOpStats[]>([])
  const [killzoneStats, setKillzoneStats] = useState<KillzoneStats[]>([])
  const [opponentStats, setOpponentStats] = useState<OpponentStats[]>([])
  const [selectedOpponent, setSelectedOpponent] = useState<string>("all")
  const [selectedKillzone, setSelectedKillzone] = useState<string>("all")
  const [allOpponents, setAllOpponents] = useState<string[]>([])
  const [allKillzones, setAllKillzones] = useState<string[]>([])
  const [allGames, setAllGames] = useState<any[]>([])

  const [critOpSort, setCritOpSort] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "count",
    direction: "desc",
  })
  const [tacOpSort, setTacOpSort] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "count",
    direction: "desc",
  })
  const [primaryOpSort, setPrimaryOpSort] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "count",
    direction: "desc",
  })
  const [killzoneSort, setKillzoneSort] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "games",
    direction: "desc",
  })
  const [matchupSort, setMatchupSort] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "games",
    direction: "desc",
  })

  useEffect(() => {
    if (open && factionId) {
      fetchFactionDetails()
    }
  }, [open, factionId])

  useEffect(() => {
    if (allGames.length > 0) {
      calculateStats(allGames)
    }
  }, [selectedOpponent, selectedKillzone, allGames])

  async function fetchFactionDetails() {
    setLoading(true)
    const supabase = createClient()

    console.log("[v0] Fetching faction details for factionId:", factionId, "type:", typeof factionId)

    const { data: games } = await supabase
      .from("games")
      .select(
        `
        *,
        player1_tacop:tacops!games_player1_tacop_id_fkey(name),
        player2_tacop:tacops!games_player2_tacop_id_fkey(name),
        critop:critops(name),
        player1_killteam:killteams!games_player1_killteam_id_fkey(id, name),
        player2_killteam:killteams!games_player2_killteam_id_fkey(id, name),
        killzone:killzones(name)
      `,
      )
      .or(`player1_killteam_id.eq.${factionId},player2_killteam_id.eq.${factionId}`)

    if (!games) {
      setLoading(false)
      return
    }

    console.log("[v0] Found", games.length, "games for faction")

    setAllGames(games)

    const factionIdNum = Number(factionId)
    const opponents = new Set<string>()
    const killzones = new Set<string>()

    games.forEach((game) => {
      const isFactionPlayer1 = game.player1_killteam_id === factionIdNum
      const opponentName = isFactionPlayer1
        ? (game.player2_killteam as { name: string }).name
        : (game.player1_killteam as { name: string }).name
      opponents.add(opponentName)

      const killzoneName = (game.killzone as { name: string }).name
      killzones.add(killzoneName)
    })

    setAllOpponents(Array.from(opponents).sort())
    setAllKillzones(Array.from(killzones).sort())

    calculateStats(games)

    setLoading(false)
  }

  function calculateStats(games: any[]) {
    const factionIdNum = Number(factionId)

    let filteredGames = games

    if (selectedOpponent !== "all") {
      filteredGames = filteredGames.filter((game) => {
        const isFactionPlayer1 = game.player1_killteam_id === factionIdNum
        const opponentName = isFactionPlayer1
          ? (game.player2_killteam as { name: string }).name
          : (game.player1_killteam as { name: string }).name
        return opponentName === selectedOpponent
      })
    }

    if (selectedKillzone !== "all") {
      filteredGames = filteredGames.filter((game) => {
        const killzoneName = (game.killzone as { name: string }).name
        return killzoneName === selectedKillzone
      })
    }

    let totalWins = 0
    let totalLosses = 0
    let totalDraws = 0
    let totalScore = 0

    filteredGames.forEach((game) => {
      const isFactionPlayer1 = game.player1_killteam_id === factionIdNum

      const factionScore = isFactionPlayer1
        ? game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)
        : game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)

      const opponentScore = isFactionPlayer1
        ? game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)
        : game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)

      totalScore += factionScore

      if (factionScore > opponentScore) {
        totalWins++
      } else if (factionScore < opponentScore) {
        totalLosses++
      } else {
        totalDraws++
      }
    })

    setOverviewStats({
      totalGames: filteredGames.length,
      wins: totalWins,
      losses: totalLosses,
      draws: totalDraws,
      winRate: filteredGames.length > 0 ? (totalWins / filteredGames.length) * 100 : 0,
      avgScore: filteredGames.length > 0 ? totalScore / filteredGames.length : 0,
    })

    const tacOpMap = new Map<string, { count: number; totalScore: number; wins: number }>()
    filteredGames.forEach((game) => {
      const isFactionPlayer1 = game.player1_killteam_id === factionIdNum
      const tacOpName = isFactionPlayer1
        ? (game.player1_tacop as { name: string }).name
        : (game.player2_tacop as { name: string }).name
      const tacOpScore = isFactionPlayer1 ? game.player1_tacop_score : game.player2_tacop_score

      const factionScore = isFactionPlayer1
        ? game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)
        : game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)

      const opponentScore = isFactionPlayer1
        ? game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)
        : game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)

      if (!tacOpMap.has(tacOpName)) {
        tacOpMap.set(tacOpName, { count: 0, totalScore: 0, wins: 0 })
      }
      const stats = tacOpMap.get(tacOpName)!
      stats.count++
      stats.totalScore += tacOpScore
      if (factionScore > opponentScore) {
        stats.wins++
      }
    })

    const tacOps: TacOpStats[] = Array.from(tacOpMap.entries()).map(([name, stats]) => ({
      name,
      count: stats.count,
      avgScore: stats.totalScore / stats.count,
      winRate: (stats.wins / stats.count) * 100,
    }))
    setTacOpStats(tacOps.sort((a, b) => b.count - a.count))

    const critOpMap = new Map<string, { count: number; totalScore: number }>()
    filteredGames.forEach((game) => {
      const isFactionPlayer1 = game.player1_killteam_id === factionIdNum
      const critOpName = (game.critop as { name: string }).name
      const critOpScore = isFactionPlayer1 ? game.player1_critop_score : game.player2_critop_score

      if (!critOpMap.has(critOpName)) {
        critOpMap.set(critOpName, { count: 0, totalScore: 0 })
      }
      const stats = critOpMap.get(critOpName)!
      stats.count++
      stats.totalScore += critOpScore
    })

    const critOps: CritOpStats[] = Array.from(critOpMap.entries()).map(([name, stats]) => ({
      name,
      count: stats.count,
      avgScore: stats.totalScore / stats.count,
    }))
    setCritOpStats(critOps.sort((a, b) => b.count - a.count))

    const primaryOpMap = new Map<string, { count: number; totalScore: number }>()
    filteredGames.forEach((game) => {
      const isFactionPlayer1 = game.player1_killteam_id === factionIdNum
      const primaryOpName = isFactionPlayer1 ? game.player1_primary_op : game.player2_primary_op
      const primaryOpScore = isFactionPlayer1 ? game.player1_primary_op_score : game.player2_primary_op_score

      if (primaryOpName && primaryOpScore) {
        if (!primaryOpMap.has(primaryOpName)) {
          primaryOpMap.set(primaryOpName, { count: 0, totalScore: 0 })
        }
        const stats = primaryOpMap.get(primaryOpName)!
        stats.count++
        stats.totalScore += primaryOpScore
      }
    })

    const primaryOps: PrimaryOpStats[] = Array.from(primaryOpMap.entries()).map(([name, stats]) => ({
      name,
      count: stats.count,
      avgScore: stats.totalScore / stats.count,
    }))
    setPrimaryOpStats(primaryOps.sort((a, b) => b.count - a.count))

    const killzoneMap = new Map<
      string,
      { games: number; wins: number; losses: number; draws: number; totalScore: number }
    >()
    filteredGames.forEach((game) => {
      const isFactionPlayer1 = game.player1_killteam_id === factionIdNum
      const killzoneName = (game.killzone as { name: string }).name

      const factionScore = isFactionPlayer1
        ? game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)
        : game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)

      const opponentScore = isFactionPlayer1
        ? game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)
        : game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)

      if (!killzoneMap.has(killzoneName)) {
        killzoneMap.set(killzoneName, { games: 0, wins: 0, losses: 0, draws: 0, totalScore: 0 })
      }
      const stats = killzoneMap.get(killzoneName)!
      stats.games++
      stats.totalScore += factionScore
      if (factionScore > opponentScore) {
        stats.wins++
      } else if (factionScore < opponentScore) {
        stats.losses++
      } else {
        stats.draws++
      }
    })

    const killzones: KillzoneStats[] = Array.from(killzoneMap.entries()).map(([name, stats]) => ({
      name,
      games: stats.games,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      winRate: (stats.wins / stats.games) * 100,
      avgScore: stats.totalScore / stats.games,
    }))
    setKillzoneStats(killzones.sort((a, b) => b.games - a.games))

    const opponentMap = new Map<string, { games: number; wins: number; losses: number; draws: number }>()
    filteredGames.forEach((game) => {
      const isFactionPlayer1 = game.player1_killteam_id === factionIdNum
      const opponentName = isFactionPlayer1
        ? (game.player2_killteam as { name: string }).name
        : (game.player1_killteam as { name: string }).name

      const factionScore = isFactionPlayer1
        ? game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)
        : game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)

      const opponentScore = isFactionPlayer1
        ? game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)
        : game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)

      if (!opponentMap.has(opponentName)) {
        opponentMap.set(opponentName, { games: 0, wins: 0, losses: 0, draws: 0 })
      }
      const stats = opponentMap.get(opponentName)!
      stats.games++
      if (factionScore > opponentScore) {
        stats.wins++
      } else if (factionScore < opponentScore) {
        stats.losses++
      } else {
        stats.draws++
      }
    })

    const opponents: OpponentStats[] = Array.from(opponentMap.entries()).map(([name, stats]) => ({
      name,
      games: stats.games,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      winRate: (stats.wins / stats.games) * 100,
    }))
    setOpponentStats(opponents.sort((a, b) => b.games - a.games))
  }

  const toggleSort = (
    currentSort: { key: string; direction: "asc" | "desc" },
    setSort: React.Dispatch<React.SetStateAction<{ key: string; direction: "asc" | "desc" }>>,
    key: string,
  ) => {
    if (currentSort.key === key) {
      setSort({ key, direction: currentSort.direction === "asc" ? "desc" : "asc" })
    } else {
      setSort({ key, direction: "desc" })
    }
  }

  const sortCritOps = (data: typeof critOpStats) => {
    return [...data].sort((a, b) => {
      const multiplier = critOpSort.direction === "asc" ? 1 : -1
      if (critOpSort.key === "name") return multiplier * a.name.localeCompare(b.name)
      if (critOpSort.key === "count") return multiplier * (a.count - b.count)
      if (critOpSort.key === "usage")
        return (
          multiplier *
          ((a.count / (overviewStats?.totalGames || 1)) * 100 - (b.count / (overviewStats?.totalGames || 1)) * 100)
        )
      if (critOpSort.key === "avgScore") return multiplier * (a.avgScore - b.avgScore)
      return 0
    })
  }

  const sortTacOps = (data: typeof tacOpStats) => {
    return [...data].sort((a, b) => {
      const multiplier = tacOpSort.direction === "asc" ? 1 : -1
      if (tacOpSort.key === "name") return multiplier * a.name.localeCompare(b.name)
      if (tacOpSort.key === "count") return multiplier * (a.count - b.count)
      if (tacOpSort.key === "usage")
        return (
          multiplier *
          ((a.count / (overviewStats?.totalGames || 1)) * 100 - (b.count / (overviewStats?.totalGames || 1)) * 100)
        )
      if (tacOpSort.key === "avgScore") return multiplier * (a.avgScore - b.avgScore)
      if (tacOpSort.key === "winRate") return multiplier * (a.winRate - b.winRate)
      return 0
    })
  }

  const sortPrimaryOps = (data: typeof primaryOpStats) => {
    return [...data].sort((a, b) => {
      const multiplier = primaryOpSort.direction === "asc" ? 1 : -1
      if (primaryOpSort.key === "name") return multiplier * a.name.localeCompare(b.name)
      if (primaryOpSort.key === "count") return multiplier * (a.count - b.count)
      if (primaryOpSort.key === "avgScore") return multiplier * (a.avgScore - b.avgScore)
      return 0
    })
  }

  const sortKillzones = (data: typeof killzoneStats) => {
    return [...data].sort((a, b) => {
      const multiplier = killzoneSort.direction === "asc" ? 1 : -1
      if (killzoneSort.key === "name") return multiplier * a.name.localeCompare(b.name)
      if (killzoneSort.key === "games") return multiplier * (a.games - b.games)
      if (killzoneSort.key === "winRate") return multiplier * (a.winRate - b.winRate)
      if (killzoneSort.key === "avgScore") return multiplier * (a.avgScore - b.avgScore)
      return 0
    })
  }

  const sortMatchups = (data: typeof opponentStats) => {
    return [...data].sort((a, b) => {
      const multiplier = matchupSort.direction === "asc" ? 1 : -1
      if (matchupSort.key === "name") return multiplier * a.name.localeCompare(b.name)
      if (matchupSort.key === "games") return multiplier * (a.games - b.games)
      if (matchupSort.key === "winRate") return multiplier * (a.winRate - b.winRate)
      return 0
    })
  }

  const SortIcon = ({ column, sortKey, direction }: { column: string; sortKey: string; direction: "asc" | "desc" }) => {
    if (sortKey !== column) return <ChevronsUpDown className="ml-1 h-3 w-3 inline opacity-30" />
    return direction === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3 inline" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3 inline" />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{factionName}</DialogTitle>
          <DialogDescription className="text-sm">
            Detailed faction statistics and performance breakdown
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-muted-foreground">Loading faction statistics...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Opponent Killteam</label>
                  <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Opponents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Opponents</SelectItem>
                      {allOpponents.map((opponent) => (
                        <SelectItem key={opponent} value={opponent}>
                          {opponent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Killzone</label>
                  <Select value={selectedKillzone} onValueChange={setSelectedKillzone}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Killzones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Killzones</SelectItem>
                      {allKillzones.map((killzone) => (
                        <SelectItem key={killzone} value={killzone}>
                          {killzone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.totalGames}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.winRate.toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Avg Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.avgScore.toFixed(1)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Counterpicks and GG EZ matchup tiles */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Counterpicks - Worst Matchups */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Skull className="h-5 w-5 text-red-500" />
                    Counterpicks
                  </CardTitle>
                  <CardDescription className="text-xs">Toughest opponent matchups (min. 3 games)</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {opponentStats
                      .filter((stat) => stat.games >= 3)
                      .sort((a, b) => a.winRate - b.winRate)
                      .slice(0, 3)
                      .map((stat, index) => (
                        <div key={stat.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground w-4">#{index + 1}</span>
                            <span className="text-sm font-medium">{stat.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{stat.games} games</span>
                            <span
                              className={`text-sm font-bold ${stat.winRate < 50 ? "text-red-500" : "text-muted-foreground"}`}
                            >
                              {stat.winRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    {opponentStats.filter((stat) => stat.games >= 3).length === 0 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Not enough data (minimum 3 games required)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* GG EZ - Best Matchups */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-green-500" />
                    GG EZ
                  </CardTitle>
                  <CardDescription className="text-xs">Easiest opponent matchups (min. 3 games)</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {opponentStats
                      .filter((stat) => stat.games >= 3)
                      .sort((a, b) => b.winRate - a.winRate)
                      .slice(0, 3)
                      .map((stat, index) => (
                        <div key={stat.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground w-4">#{index + 1}</span>
                            <span className="text-sm font-medium">{stat.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{stat.games} games</span>
                            <span
                              className={`text-sm font-bold ${stat.winRate >= 50 ? "text-green-500" : "text-muted-foreground"}`}
                            >
                              {stat.winRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    {opponentStats.filter((stat) => stat.games >= 3).length === 0 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Not enough data (minimum 3 games required)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Critical Operations</CardTitle>
                <CardDescription className="text-xs">CritOp performance and average scores</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="h-8 text-xs cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(critOpSort, setCritOpSort, "name")}
                      >
                        CritOp
                        <SortIcon column="name" sortKey={critOpSort.key} direction={critOpSort.direction} />
                      </TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(critOpSort, setCritOpSort, "count")}
                      >
                        Games
                        <SortIcon column="count" sortKey={critOpSort.key} direction={critOpSort.direction} />
                      </TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(critOpSort, setCritOpSort, "usage")}
                      >
                        Usage %
                        <SortIcon column="usage" sortKey={critOpSort.key} direction={critOpSort.direction} />
                      </TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(critOpSort, setCritOpSort, "avgScore")}
                      >
                        Avg
                        <SortIcon column="avgScore" sortKey={critOpSort.key} direction={critOpSort.direction} />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortCritOps(critOpStats).map((stat) => (
                      <TableRow key={stat.name} className="h-8">
                        <TableCell className="py-1 text-sm font-medium">{stat.name}</TableCell>
                        <TableCell className="py-1 text-sm text-right">{stat.count}</TableCell>
                        <TableCell className="py-1 text-sm text-right">
                          {overviewStats ? ((stat.count / overviewStats.totalGames) * 100).toFixed(1) : 0}%
                        </TableCell>
                        <TableCell className="py-1 text-sm text-right">{stat.avgScore.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tactical Operations</CardTitle>
                <CardDescription className="text-xs">TacOp usage, average scores, and win rates</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="h-8 text-xs cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(tacOpSort, setTacOpSort, "name")}
                      >
                        TacOp
                        <SortIcon column="name" sortKey={tacOpSort.key} direction={tacOpSort.direction} />
                      </TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(tacOpSort, setTacOpSort, "count")}
                      >
                        Games
                        <SortIcon column="count" sortKey={tacOpSort.key} direction={tacOpSort.direction} />
                      </TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(tacOpSort, setTacOpSort, "usage")}
                      >
                        Usage %
                        <SortIcon column="usage" sortKey={tacOpSort.key} direction={tacOpSort.direction} />
                      </TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(tacOpSort, setTacOpSort, "avgScore")}
                      >
                        Avg
                        <SortIcon column="avgScore" sortKey={tacOpSort.key} direction={tacOpSort.direction} />
                      </TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(tacOpSort, setTacOpSort, "winRate")}
                      >
                        Win %
                        <SortIcon column="winRate" sortKey={tacOpSort.key} direction={tacOpSort.direction} />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortTacOps(tacOpStats).map((stat) => (
                      <TableRow key={stat.name} className="h-8">
                        <TableCell className="py-1 text-sm font-medium">{stat.name}</TableCell>
                        <TableCell className="py-1 text-sm text-right">{stat.count}</TableCell>
                        <TableCell className="py-1 text-sm text-right">
                          {overviewStats ? ((stat.count / overviewStats.totalGames) * 100).toFixed(1) : 0}%
                        </TableCell>
                        <TableCell className="py-1 text-sm text-right">{stat.avgScore.toFixed(1)}</TableCell>
                        <TableCell className="py-1 text-sm text-right font-semibold">
                          {stat.winRate.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {primaryOpStats.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Primary Operations</CardTitle>
                  <CardDescription className="text-xs">Primary Op usage and average scores</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="h-8 text-xs cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort(primaryOpSort, setPrimaryOpSort, "name")}
                        >
                          Primary Op
                          <SortIcon column="name" sortKey={primaryOpSort.key} direction={primaryOpSort.direction} />
                        </TableHead>
                        <TableHead
                          className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort(primaryOpSort, setPrimaryOpSort, "count")}
                        >
                          Games
                          <SortIcon column="count" sortKey={primaryOpSort.key} direction={primaryOpSort.direction} />
                        </TableHead>
                        <TableHead
                          className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort(primaryOpSort, setPrimaryOpSort, "avgScore")}
                        >
                          Avg
                          <SortIcon column="avgScore" sortKey={primaryOpSort.key} direction={primaryOpSort.direction} />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortPrimaryOps(primaryOpStats).map((stat) => (
                        <TableRow key={stat.name} className="h-8">
                          <TableCell className="py-1 text-sm font-medium">{stat.name}</TableCell>
                          <TableCell className="py-1 text-sm text-right">{stat.count}</TableCell>
                          <TableCell className="py-1 text-sm text-right">{stat.avgScore.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Kill Zones</CardTitle>
                <CardDescription className="text-xs">Performance by Kill Zone map</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="h-8 text-xs cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(killzoneSort, setKillzoneSort, "name")}
                      >
                        Kill Zone
                        <SortIcon column="name" sortKey={killzoneSort.key} direction={killzoneSort.direction} />
                      </TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(killzoneSort, setKillzoneSort, "games")}
                      >
                        Games
                        <SortIcon column="games" sortKey={killzoneSort.key} direction={killzoneSort.direction} />
                      </TableHead>
                      <TableHead className="h-8 text-xs text-right">W-L-D</TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(killzoneSort, setKillzoneSort, "winRate")}
                      >
                        Win %
                        <SortIcon column="winRate" sortKey={killzoneSort.key} direction={killzoneSort.direction} />
                      </TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(killzoneSort, setKillzoneSort, "avgScore")}
                      >
                        Avg
                        <SortIcon column="avgScore" sortKey={killzoneSort.key} direction={killzoneSort.direction} />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortKillzones(killzoneStats).map((stat) => (
                      <TableRow key={stat.name} className="h-8">
                        <TableCell className="py-1 text-sm font-medium">{stat.name}</TableCell>
                        <TableCell className="py-1 text-sm text-right">{stat.games}</TableCell>
                        <TableCell className="py-1 text-sm text-right">
                          <span className="text-green-500">{stat.wins}</span>-
                          <span className="text-red-500">{stat.losses}</span>-
                          <span className="text-muted-foreground">{stat.draws}</span>
                        </TableCell>
                        <TableCell className="py-1 text-sm text-right font-semibold">
                          {stat.winRate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="py-1 text-sm text-right">{stat.avgScore.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Matchup Statistics</CardTitle>
                <CardDescription className="text-xs">Performance against other factions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="h-8 text-xs cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(matchupSort, setMatchupSort, "name")}
                      >
                        Opponent
                        <SortIcon column="name" sortKey={matchupSort.key} direction={matchupSort.direction} />
                      </TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(matchupSort, setMatchupSort, "games")}
                      >
                        Games
                        <SortIcon column="games" sortKey={matchupSort.key} direction={matchupSort.direction} />
                      </TableHead>
                      <TableHead className="h-8 text-xs text-right">W-L-D</TableHead>
                      <TableHead
                        className="h-8 text-xs text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleSort(matchupSort, setMatchupSort, "winRate")}
                      >
                        Win %
                        <SortIcon column="winRate" sortKey={matchupSort.key} direction={matchupSort.direction} />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortMatchups(opponentStats).map((stat) => (
                      <TableRow key={stat.name} className="h-8">
                        <TableCell className="py-1 text-sm font-medium">{stat.name}</TableCell>
                        <TableCell className="py-1 text-sm text-right">{stat.games}</TableCell>
                        <TableCell className="py-1 text-sm text-right">
                          <span className="text-green-500">{stat.wins}</span>-
                          <span className="text-red-500">{stat.losses}</span>-
                          <span className="text-muted-foreground">{stat.draws}</span>
                        </TableCell>
                        <TableCell className="py-1 text-sm text-right font-semibold">
                          {stat.winRate.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
