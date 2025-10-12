"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PlayerDetailsModalProps {
  playerId: string
  playerName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TacOpStats {
  name: string
  count: number
  avgScore: number
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

interface KillteamStats {
  name: string
  games: number
  wins: number
  losses: number
  draws: number
  winRate: number
}

interface KillzoneStats {
  name: string
  games: number
  wins: number
  losses: number
  draws: number
  winRate: number
}

interface OpponentStats {
  name: string
  games: number
  wins: number
  losses: number
  draws: number
  winRate: number
}

export function PlayerDetailsModal({ playerId, playerName, open, onOpenChange }: PlayerDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [tacOpStats, setTacOpStats] = useState<TacOpStats[]>([])
  const [critOpStats, setCritOpStats] = useState<CritOpStats[]>([])
  const [primaryOpStats, setPrimaryOpStats] = useState<PrimaryOpStats[]>([])
  const [killteamStats, setKillteamStats] = useState<KillteamStats[]>([])
  const [killzoneStats, setKillzoneStats] = useState<KillzoneStats[]>([])
  const [opponentStats, setOpponentStats] = useState<OpponentStats[]>([])

  useEffect(() => {
    if (open && playerId) {
      fetchPlayerDetails()
    }
  }, [open, playerId])

  async function fetchPlayerDetails() {
    setLoading(true)
    const supabase = createClient()

    const { data: games } = await supabase
      .from("games")
      .select(
        `
        *,
        player1:players!games_player1_id_fkey(id, playertag),
        player2:players!games_player2_id_fkey(id, playertag),
        player1_tacop:tacops!games_player1_tacop_id_fkey(name),
        player2_tacop:tacops!games_player2_tacop_id_fkey(name),
        critop:critops(name),
        player1_killteam:killteams!games_player1_killteam_id_fkey(name),
        player2_killteam:killteams!games_player2_killteam_id_fkey(name),
        killzone:killzones(name)
      `,
      )
      .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)

    if (!games) {
      setLoading(false)
      return
    }

    const opponentMap = new Map<string, { name: string; games: number; wins: number; losses: number; draws: number }>()
    games.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const opponent = isPlayer1
        ? (game.player2 as { id: string; playertag: string })
        : (game.player1 as { id: string; playertag: string })

      if (!opponent) return

      const playerScore = isPlayer1
        ? game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)
        : game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)

      const opponentScore = isPlayer1
        ? game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)
        : game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)

      if (!opponentMap.has(opponent.playertag)) {
        opponentMap.set(opponent.playertag, { name: opponent.playertag, games: 0, wins: 0, losses: 0, draws: 0 })
      }
      const stats = opponentMap.get(opponent.playertag)!
      stats.games++
      if (playerScore > opponentScore) {
        stats.wins++
      } else if (playerScore < opponentScore) {
        stats.losses++
      } else {
        stats.draws++
      }
    })

    const opponents: OpponentStats[] = Array.from(opponentMap.values()).map((stats) => ({
      name: stats.name,
      games: stats.games,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      winRate: (stats.wins / stats.games) * 100,
    }))
    setOpponentStats(opponents.sort((a, b) => b.games - a.games).slice(0, 3))

    const tacOpMap = new Map<string, { count: number; totalScore: number }>()
    games.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const tacOpName = isPlayer1
        ? (game.player1_tacop as { name: string }).name
        : (game.player2_tacop as { name: string }).name
      const tacOpScore = isPlayer1 ? game.player1_tacop_score : game.player2_tacop_score

      if (!tacOpMap.has(tacOpName)) {
        tacOpMap.set(tacOpName, { count: 0, totalScore: 0 })
      }
      const stats = tacOpMap.get(tacOpName)!
      stats.count++
      stats.totalScore += tacOpScore
    })

    const tacOps: TacOpStats[] = Array.from(tacOpMap.entries()).map(([name, stats]) => ({
      name,
      count: stats.count,
      avgScore: stats.totalScore / stats.count,
    }))
    setTacOpStats(tacOps.sort((a, b) => b.count - a.count))

    const critOpMap = new Map<string, { count: number; totalScore: number }>()
    games.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const critOpName = (game.critop as { name: string }).name
      const critOpScore = isPlayer1 ? game.player1_critop_score : game.player2_critop_score

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
    games.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const primaryOpName = isPlayer1 ? game.player1_primary_op : game.player2_primary_op
      const primaryOpScore = isPlayer1 ? game.player1_primary_op_score : game.player2_primary_op_score

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

    const killteamMap = new Map<string, { games: number; wins: number; losses: number; draws: number }>()
    games.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const killteamName = isPlayer1
        ? (game.player1_killteam as { name: string }).name
        : (game.player2_killteam as { name: string }).name

      const playerScore = isPlayer1
        ? game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)
        : game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)

      const opponentScore = isPlayer1
        ? game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)
        : game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)

      if (!killteamMap.has(killteamName)) {
        killteamMap.set(killteamName, { games: 0, wins: 0, losses: 0, draws: 0 })
      }
      const stats = killteamMap.get(killteamName)!
      stats.games++
      if (playerScore > opponentScore) {
        stats.wins++
      } else if (playerScore < opponentScore) {
        stats.losses++
      } else {
        stats.draws++
      }
    })

    const killteams: KillteamStats[] = Array.from(killteamMap.entries()).map(([name, stats]) => ({
      name,
      games: stats.games,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      winRate: (stats.wins / stats.games) * 100,
    }))
    setKillteamStats(killteams.sort((a, b) => b.games - a.games))

    const killzoneMap = new Map<string, { games: number; wins: number; losses: number; draws: number }>()
    games.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const killzoneName = (game.killzone as { name: string }).name

      const playerScore = isPlayer1
        ? game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)
        : game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)

      const opponentScore = isPlayer1
        ? game.player2_tacop_score +
          game.player2_critop_score +
          game.player2_killop_score +
          (game.player2_primary_op_score || 0)
        : game.player1_tacop_score +
          game.player1_critop_score +
          game.player1_killop_score +
          (game.player1_primary_op_score || 0)

      if (!killzoneMap.has(killzoneName)) {
        killzoneMap.set(killzoneName, { games: 0, wins: 0, losses: 0, draws: 0 })
      }
      const stats = killzoneMap.get(killzoneName)!
      stats.games++
      if (playerScore > opponentScore) {
        stats.wins++
      } else if (playerScore < opponentScore) {
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
    }))
    setKillzoneStats(killzones.sort((a, b) => b.games - a.games))

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{playerName}</DialogTitle>
          <DialogDescription className="text-sm">
            Detailed player statistics and performance breakdown
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-muted-foreground">Loading player statistics...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Kill Teams first */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Kill Teams</CardTitle>
                <CardDescription className="text-xs">Performance by Kill Team faction</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8 text-xs">Kill Team</TableHead>
                      <TableHead className="h-8 text-xs text-right">Games</TableHead>
                      <TableHead className="h-8 text-xs text-right">W</TableHead>
                      <TableHead className="h-8 text-xs text-right">L</TableHead>
                      <TableHead className="h-8 text-xs text-right">D</TableHead>
                      <TableHead className="h-8 text-xs text-right">Win %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {killteamStats.map((stat) => (
                      <TableRow key={stat.name} className="h-8">
                        <TableCell className="py-1 text-sm font-medium">{stat.name}</TableCell>
                        <TableCell className="py-1 text-sm text-right">{stat.games}</TableCell>
                        <TableCell className="py-1 text-sm text-right text-green-500">{stat.wins}</TableCell>
                        <TableCell className="py-1 text-sm text-right text-red-500">{stat.losses}</TableCell>
                        <TableCell className="py-1 text-sm text-right text-muted-foreground">{stat.draws}</TableCell>
                        <TableCell className="py-1 text-sm text-right font-semibold">
                          {stat.winRate.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

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
                      <TableHead className="h-8 text-xs text-right">W</TableHead>
                      <TableHead className="h-8 text-xs text-right">L</TableHead>
                      <TableHead className="h-8 text-xs text-right">D</TableHead>
                      <TableHead className="h-8 text-xs text-right">Win %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {killzoneStats.map((stat) => (
                      <TableRow key={stat.name} className="h-8">
                        <TableCell className="py-1 text-sm font-medium">{stat.name}</TableCell>
                        <TableCell className="py-1 text-sm text-right">{stat.games}</TableCell>
                        <TableCell className="py-1 text-sm text-right text-green-500">{stat.wins}</TableCell>
                        <TableCell className="py-1 text-sm text-right text-red-500">{stat.losses}</TableCell>
                        <TableCell className="py-1 text-sm text-right text-muted-foreground">{stat.draws}</TableCell>
                        <TableCell className="py-1 text-sm text-right font-semibold">
                          {stat.winRate.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tactical Operations</CardTitle>
                <CardDescription className="text-xs">TacOp usage and average scores</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8 text-xs">TacOp</TableHead>
                      <TableHead className="h-8 text-xs text-right">Games</TableHead>
                      <TableHead className="h-8 text-xs text-right">Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tacOpStats.map((stat) => (
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
                      <TableHead className="h-8 text-xs text-right">Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {critOpStats.map((stat) => (
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

            {opponentStats.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Top 3 Most Played Opponents</CardTitle>
                  <CardDescription className="text-xs">Most frequent matchups and head-to-head records</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-xs">Opponent</TableHead>
                        <TableHead className="h-8 text-xs text-right">Games</TableHead>
                        <TableHead className="h-8 text-xs text-right">W</TableHead>
                        <TableHead className="h-8 text-xs text-right">L</TableHead>
                        <TableHead className="h-8 text-xs text-right">D</TableHead>
                        <TableHead className="h-8 text-xs text-right">Win %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opponentStats.map((stat) => (
                        <TableRow key={stat.name} className="h-8">
                          <TableCell className="py-1 text-sm font-medium">{stat.name}</TableCell>
                          <TableCell className="py-1 text-sm text-right">{stat.games}</TableCell>
                          <TableCell className="py-1 text-sm text-right text-green-500">{stat.wins}</TableCell>
                          <TableCell className="py-1 text-sm text-right text-red-500">{stat.losses}</TableCell>
                          <TableCell className="py-1 text-sm text-right text-muted-foreground">{stat.draws}</TableCell>
                          <TableCell className="py-1 text-sm text-right font-semibold">
                            {stat.winRate.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
