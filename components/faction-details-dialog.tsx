"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

  useEffect(() => {
    if (open && factionId) {
      fetchFactionDetails()
    }
  }, [open, factionId])

  async function fetchFactionDetails() {
    setLoading(true)
    const supabase = createClient()

    console.log("[v0] Fetching faction details for factionId:", factionId, "type:", typeof factionId)

    // Fetch all games for this faction
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

    // Calculate overview statistics
    let totalWins = 0
    let totalLosses = 0
    let totalDraws = 0
    let totalScore = 0

    const factionIdNum = Number(factionId)

    games.forEach((game) => {
      const isFactionPlayer1 = game.player1_killteam_id === factionIdNum

      console.log("[v0] Game", game.id, ":")
      console.log("  player1_killteam_id:", game.player1_killteam_id, "type:", typeof game.player1_killteam_id)
      console.log("  player2_killteam_id:", game.player2_killteam_id, "type:", typeof game.player2_killteam_id)
      console.log("  factionId:", factionId, "type:", typeof factionId)
      console.log("  isFactionPlayer1:", isFactionPlayer1)

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

      console.log("  factionScore:", factionScore)
      console.log("  opponentScore:", opponentScore)

      totalScore += factionScore

      if (factionScore > opponentScore) {
        console.log("  Result: WIN")
        totalWins++
      } else if (factionScore < opponentScore) {
        console.log("  Result: LOSS")
        totalLosses++
      } else {
        console.log("  Result: DRAW")
        totalDraws++
      }
    })

    console.log("[v0] Final stats - Wins:", totalWins, "Losses:", totalLosses, "Draws:", totalDraws)

    setOverviewStats({
      totalGames: games.length,
      wins: totalWins,
      losses: totalLosses,
      draws: totalDraws,
      winRate: games.length > 0 ? (totalWins / games.length) * 100 : 0,
      avgScore: games.length > 0 ? totalScore / games.length : 0,
    })

    // Calculate TacOp statistics
    const tacOpMap = new Map<string, { count: number; totalScore: number; wins: number }>()
    games.forEach((game) => {
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

    // Calculate CritOp statistics
    const critOpMap = new Map<string, { count: number; totalScore: number }>()
    games.forEach((game) => {
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

    // Calculate Primary Op statistics
    const primaryOpMap = new Map<string, { count: number; totalScore: number }>()
    games.forEach((game) => {
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

    // Calculate Killzone statistics
    const killzoneMap = new Map<
      string,
      { games: number; wins: number; losses: number; draws: number; totalScore: number }
    >()
    games.forEach((game) => {
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

    // Calculate opponent statistics
    const opponentMap = new Map<string, { games: number; wins: number; losses: number; draws: number }>()
    games.forEach((game) => {
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

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            {/* Overview Statistics */}
            {overviewStats && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Total Games</CardDescription>
                    <CardTitle className="text-2xl">{overviewStats.totalGames}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Win Rate</CardDescription>
                    <CardTitle className="text-2xl">{overviewStats.winRate.toFixed(1)}%</CardTitle>
                    <CardDescription className="text-xs">
                      {overviewStats.wins}W - {overviewStats.losses}L - {overviewStats.draws}D
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Avg Score</CardDescription>
                    <CardTitle className="text-2xl">{overviewStats.avgScore.toFixed(1)}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}

            {/* CritOps Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Critical Operations</CardTitle>
                <CardDescription className="text-xs">CritOp performance and average scores</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8 text-xs">CritOp</TableHead>
                      <TableHead className="h-8 text-xs text-right">Games</TableHead>
                      <TableHead className="h-8 text-xs text-right">Usage %</TableHead>
                      <TableHead className="h-8 text-xs text-right">Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {critOpStats.map((stat) => (
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

            {/* TacOps Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tactical Operations</CardTitle>
                <CardDescription className="text-xs">TacOp usage, average scores, and win rates</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8 text-xs">TacOp</TableHead>
                      <TableHead className="h-8 text-xs text-right">Games</TableHead>
                      <TableHead className="h-8 text-xs text-right">Usage %</TableHead>
                      <TableHead className="h-8 text-xs text-right">Avg</TableHead>
                      <TableHead className="h-8 text-xs text-right">Win %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tacOpStats.map((stat) => (
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

            {/* Primary Ops Statistics */}
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
                        <TableHead className="h-8 text-xs">Primary Op</TableHead>
                        <TableHead className="h-8 text-xs text-right">Games</TableHead>
                        <TableHead className="h-8 text-xs text-right">Avg</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {primaryOpStats.map((stat) => (
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

            {/* Killzone Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Kill Zones</CardTitle>
                <CardDescription className="text-xs">Performance by Kill Zone map</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8 text-xs">Kill Zone</TableHead>
                      <TableHead className="h-8 text-xs text-right">Games</TableHead>
                      <TableHead className="h-8 text-xs text-right">W-L-D</TableHead>
                      <TableHead className="h-8 text-xs text-right">Win %</TableHead>
                      <TableHead className="h-8 text-xs text-right">Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {killzoneStats.map((stat) => (
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

            {/* Opponent Matchups */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Matchup Statistics</CardTitle>
                <CardDescription className="text-xs">Performance against other factions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8 text-xs">Opponent</TableHead>
                      <TableHead className="h-8 text-xs text-right">Games</TableHead>
                      <TableHead className="h-8 text-xs text-right">W-L-D</TableHead>
                      <TableHead className="h-8 text-xs text-right">Win %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opponentStats.map((stat) => (
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
