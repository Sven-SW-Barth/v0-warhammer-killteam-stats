"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format } from "date-fns"

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

interface FrequentOpponent {
  id: string
  name: string
  games: number
}

interface EloDataPoint {
  date: string
  elo: number
  gameNumber: number
}

export function PlayerDetailsModal({ playerId, playerName, open, onOpenChange }: PlayerDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [tacOpStats, setTacOpStats] = useState<TacOpStats[]>([])
  const [critOpStats, setCritOpStats] = useState<CritOpStats[]>([])
  const [primaryOpStats, setPrimaryOpStats] = useState<PrimaryOpStats[]>([])
  const [killteamStats, setKillteamStats] = useState<KillteamStats[]>([])
  const [killzoneStats, setKillzoneStats] = useState<KillzoneStats[]>([])
  const [eloProgression, setEloProgression] = useState<EloDataPoint[]>([])
  const [frequentOpponents, setFrequentOpponents] = useState<FrequentOpponent[]>([])

  useEffect(() => {
    if (open && playerId) {
      fetchPlayerDetails()
    }
  }, [open, playerId])

  async function fetchPlayerDetails() {
    setLoading(true)
    const supabase = createClient()

    console.log("[v0] Fetching player details for:", playerId)

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
      .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
      .order("created_at", { ascending: true })

    console.log("[v0] Query result:", { games, error })

    if (error) {
      console.error("[v0] Error fetching games:", error)
      setLoading(false)
      return
    }

    if (!games || games.length === 0) {
      console.log("[v0] No games found")
      setLoading(false)
      return
    }

    const playerIds = new Set<string>()
    games.forEach((game) => {
      playerIds.add(game.player1_id.toString())
      playerIds.add(game.player2_id.toString())
    })

    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("id, playertag")
      .in("id", Array.from(playerIds))

    if (playersError) {
      console.error("[v0] Error fetching players:", playersError)
      setLoading(false)
      return
    }

    // Create a map of player IDs to playertags
    const playerMap = new Map<string, string>()
    players?.forEach((player) => {
      playerMap.set(player.id.toString(), player.playertag)
    })

    const opponentMap = new Map<string, { name: string; count: number }>()
    games.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const opponentId = isPlayer1 ? game.player2_id.toString() : game.player1_id.toString()
      const opponentName = playerMap.get(opponentId)

      if (!opponentName) {
        return
      }

      if (!opponentMap.has(opponentId)) {
        opponentMap.set(opponentId, { name: opponentName, count: 0 })
      }
      const stats = opponentMap.get(opponentId)!
      stats.count++
    })

    const opponents: FrequentOpponent[] = Array.from(opponentMap.entries())
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        games: stats.count,
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 3)

    setFrequentOpponents(opponents)

    const eloData: EloDataPoint[] = []
    games.forEach((game, index) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const eloBefore = isPlayer1 ? game.player1_elo_before : game.player2_elo_before
      const eloAfter = isPlayer1 ? game.player1_elo_after : game.player2_elo_after

      if (eloAfter !== null && eloAfter !== undefined) {
        eloData.push({
          date: format(new Date(game.created_at), "MMM dd, yyyy"),
          elo: eloAfter,
          gameNumber: index + 1,
        })
      }
    })
    setEloProgression(eloData)

    const tacOpMap = new Map<string, { count: number; totalScore: number }>()
    games.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const tacOp = isPlayer1 ? game.player1_tacop : game.player2_tacop
      const tacOpScore = isPlayer1 ? game.player1_tacop_score : game.player2_tacop_score

      if (!tacOp || !tacOp.name) {
        return
      }

      const tacOpName = tacOp.name

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
      const critOp = game.critop
      const critOpScore = isPlayer1 ? game.player1_critop_score : game.player2_critop_score

      if (!critOp || !critOp.name) {
        return
      }

      const critOpName = critOp.name

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
      const killteam = isPlayer1 ? game.player1_killteam : game.player2_killteam

      if (!killteam || !killteam.name) {
        return
      }

      const killteamName = killteam.name

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
      const killzone = game.killzone

      if (!killzone || !killzone.name) {
        return
      }

      const killzoneName = killzone.name

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

    console.log("[v0] Processed stats successfully")
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
            {eloProgression.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">ELO Rating Progression</CardTitle>
                  <CardDescription className="text-xs">
                    ELO rating development over {eloProgression.length} games
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={eloProgression} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        domain={["dataMin - 50", "dataMax + 50"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                        }}
                        labelStyle={{ color: "#e5e7eb" }}
                        itemStyle={{ color: "#60a5fa" }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "10px" }} />
                      <Line
                        type="monotone"
                        dataKey="elo"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ fill: "#60a5fa", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="ELO Rating"
                      />
                    </LineChart>
                  </ResponsiveContainer>
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

            {frequentOpponents.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Most Frequent Opponents</CardTitle>
                  <CardDescription className="text-xs">Top 3 players faced most often</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-xs">Player</TableHead>
                        <TableHead className="h-8 text-xs text-right">Games Played</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {frequentOpponents.map((opponent, index) => (
                        <TableRow key={opponent.id} className="h-8">
                          <TableCell className="py-1 text-sm font-medium">
                            {index + 1}. {opponent.name}
                          </TableCell>
                          <TableCell className="py-1 text-sm text-right">{opponent.games}</TableCell>
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
