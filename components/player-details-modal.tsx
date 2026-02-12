"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from "date-fns"
import { SimpleLineChart } from "@/components/simple-line-chart"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface PlayerDetailsModalProps {
  playerId: string
  playerName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TacOpStats {
  name: string
  games: number
  totalScore: number
  avgScore: number
  wins: number
  losses: number
  draws: number
  winRate: number
}

interface CritOpStats {
  name: string
  games: number
  totalScore: number
  avgScore: number
  wins: number
  losses: number
  draws: number
  winRate: number
}

interface PrimaryOpStats {
  name: string
  games: number
  totalScore: number
  avgScore: number
  wins: number
  losses: number
  draws: number
  winRate: number
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
  hasElo: boolean // Track whether this game has actual ELO data
}

interface EnemyKillteamStats {
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
  const [enemyKillteamStats, setEnemyKillteamStats] = useState<EnemyKillteamStats[]>([])
  const [selectedKillteam, setSelectedKillteam] = useState<string>("all")
  const [allGames, setAllGames] = useState<any[]>([])
  const [eloProgression, setEloProgression] = useState<EloDataPoint[]>([])
  const [frequentOpponents, setFrequentOpponents] = useState<FrequentOpponent[]>([])
  const [playerData, setPlayerData] = useState<any | null>(null)

  useEffect(() => {
    if (open && playerId) {
      fetchPlayerDetails()
    }
  }, [open, playerId])

  useEffect(() => {
    if (playerData?.games) {
      const stats = calculateFilteredStats(playerData.games, selectedKillteam)
      setTacOpStats(stats.tacOpStats)
      setCritOpStats(stats.critOpStats)
      setPrimaryOpStats(stats.primaryOpStats)
      setKillzoneStats(stats.killzoneStats)
      setEnemyKillteamStats(stats.enemyKillteamStats)
    }
  }, [playerData, selectedKillteam])

  function calculateFilteredStats(games: any[], killteamFilter: string) {
    const filteredGames =
      killteamFilter === "all"
        ? games
        : games.filter((game) => {
            const isPlayer1 = game.player1_id.toString() === playerId
            const killteam = isPlayer1 ? game.player1_killteam : game.player2_killteam
            return killteam?.name === killteamFilter
          })

    const tacOpMap = new Map<
      string,
      { games: number; totalScore: number; wins: number; losses: number; draws: number }
    >()
    filteredGames.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const tacOp = isPlayer1 ? game.player1_tacop : game.player2_tacop
      const tacOpScore = isPlayer1 ? game.player1_tacop_score : game.player2_tacop_score

      if (!tacOp || !tacOp.name) return

      const tacOpName = tacOp.name

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

      if (!tacOpMap.has(tacOpName)) {
        tacOpMap.set(tacOpName, { games: 0, totalScore: 0, wins: 0, losses: 0, draws: 0 })
      }
      const stats = tacOpMap.get(tacOpName)!
      stats.games++
      stats.totalScore += tacOpScore

      if (playerScore > opponentScore) {
        stats.wins++
      } else if (playerScore < opponentScore) {
        stats.losses++
      } else {
        stats.draws++
      }
    })

    const tacOps: TacOpStats[] = Array.from(tacOpMap.entries()).map(([name, stats]) => ({
      name,
      games: stats.games,
      totalScore: stats.totalScore,
      avgScore: stats.totalScore / stats.games,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      winRate: (stats.wins / stats.games) * 100,
    }))
    tacOps.sort((a, b) => b.games - a.games)

    const critOpMap = new Map<
      string,
      { games: number; totalScore: number; wins: number; losses: number; draws: number }
    >()
    filteredGames.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const critOp = game.critop
      const critOpScore = isPlayer1 ? game.player1_critop_score : game.player2_critop_score

      if (!critOp || !critOp.name) return

      const critOpName = critOp.name

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

      if (!critOpMap.has(critOpName)) {
        critOpMap.set(critOpName, { games: 0, totalScore: 0, wins: 0, losses: 0, draws: 0 })
      }
      const stats = critOpMap.get(critOpName)!
      stats.games++
      stats.totalScore += critOpScore

      if (playerScore > opponentScore) {
        stats.wins++
      } else if (playerScore < opponentScore) {
        stats.losses++
      } else {
        stats.draws++
      }
    })

    const critOps: CritOpStats[] = Array.from(critOpMap.entries()).map(([name, stats]) => ({
      name,
      games: stats.games,
      totalScore: stats.totalScore,
      avgScore: stats.totalScore / stats.games,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      winRate: (stats.wins / stats.games) * 100,
    }))
    critOps.sort((a, b) => b.games - a.games)

    const primaryOpMap = new Map<
      string,
      { games: number; totalScore: number; wins: number; losses: number; draws: number }
    >()
    filteredGames.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const primaryOpName = isPlayer1 ? game.player1_primary_op : game.player2_primary_op
      const primaryOpScore = isPlayer1 ? game.player1_primary_op_score : game.player2_primary_op_score

      if (primaryOpName && primaryOpScore) {
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

        if (!primaryOpMap.has(primaryOpName)) {
          primaryOpMap.set(primaryOpName, { games: 0, totalScore: 0, wins: 0, losses: 0, draws: 0 })
        }
        const stats = primaryOpMap.get(primaryOpName)!
        stats.games++
        stats.totalScore += primaryOpScore

        if (playerScore > opponentScore) {
          stats.wins++
        } else if (playerScore < opponentScore) {
          stats.losses++
        } else {
          stats.draws++
        }
      }
    })

    const primaryOps: PrimaryOpStats[] = Array.from(primaryOpMap.entries()).map(([name, stats]) => ({
      name,
      games: stats.games,
      totalScore: stats.totalScore,
      avgScore: stats.totalScore / stats.games,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      winRate: (stats.wins / stats.games) * 100,
    }))
    primaryOps.sort((a, b) => b.games - a.games)

    const killzoneMap = new Map<string, { games: number; wins: number; losses: number; draws: number }>()
    filteredGames.forEach((game) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const killzone = game.killzone

      if (!killzone || !killzone.name) return

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
    killzones.sort((a, b) => b.games - a.games)

    const enemyKillteamMap = new Map<string, { games: number; wins: number; losses: number; draws: number }>()
    filteredGames.forEach((game: any) => {
      const isPlayer1 = game.player1_id.toString() === playerId
      const enemyKillteam = isPlayer1 ? game.player2_killteam : game.player1_killteam

      if (!enemyKillteam || !enemyKillteam.name) return

      const enemyKillteamName = enemyKillteam.name

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

      if (!enemyKillteamMap.has(enemyKillteamName)) {
        enemyKillteamMap.set(enemyKillteamName, { games: 0, wins: 0, losses: 0, draws: 0 })
      }
      const stats = enemyKillteamMap.get(enemyKillteamName)!
      stats.games++
      if (playerScore > opponentScore) {
        stats.wins++
      } else if (playerScore < opponentScore) {
        stats.losses++
      } else {
        stats.draws++
      }
    })

    const enemyKillteams: EnemyKillteamStats[] = Array.from(enemyKillteamMap.entries()).map(([name, stats]) => ({
      name,
      games: stats.games,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      winRate: (stats.wins / stats.games) * 100,
    }))
    enemyKillteams.sort((a, b) => b.games - a.games)

    return {
      tacOpStats: tacOps,
      critOpStats: critOps,
      primaryOpStats: primaryOps,
      killzoneStats: killzones,
      enemyKillteamStats: enemyKillteams,
    }
  }

  async function fetchPlayerDetails() {
    setLoading(true)

    console.log("[v0] Fetching player details for:", playerId)

    try {
      const response = await fetch(`/api/players/${playerId}`)
      const { games, players, error } = await response.json()

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

      setAllGames(games)

      const playerMap = new Map<string, string>()
      players?.forEach((player: { id: string; playertag: string }) => {
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
        .slice(0, 5)

      setFrequentOpponents(opponents)

      const eloData: EloDataPoint[] = []
      let lastKnownElo = 1200 // Starting ELO
      games.forEach((game, index) => {
        const isPlayer1 = game.player1_id.toString() === playerId
        const eloAfter = isPlayer1 ? game.player1_elo_after : game.player2_elo_after

        if (eloAfter !== null && eloAfter !== undefined) {
          // Game has ELO data
          lastKnownElo = eloAfter
          eloData.push({
            date: format(new Date(game.created_at), "MMM dd, yyyy"),
            elo: eloAfter,
            gameNumber: index + 1,
            hasElo: true,
          })
        } else {
          // Game without ELO - use last known ELO and mark as grey
          eloData.push({
            date: format(new Date(game.created_at), "MMM dd, yyyy"),
            elo: lastKnownElo,
            gameNumber: index + 1,
            hasElo: false,
          })
        }
      })
      setEloProgression(eloData)

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
      killteams.sort((a, b) => b.games - a.games)

      setKillteamStats(killteams)

      const enemyKillteamMap = new Map<string, { games: number; wins: number; losses: number; draws: number }>()
      games.forEach((game: any) => {
        const isPlayer1 = game.player1_id.toString() === playerId
        const enemyKillteam = isPlayer1 ? game.player2_killteam : game.player1_killteam

        if (!enemyKillteam || !enemyKillteam.name) return

        const enemyKillteamName = enemyKillteam.name

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

        if (!enemyKillteamMap.has(enemyKillteamName)) {
          enemyKillteamMap.set(enemyKillteamName, { games: 0, wins: 0, losses: 0, draws: 0 })
        }
        const stats = enemyKillteamMap.get(enemyKillteamName)!
        stats.games++
        if (playerScore > opponentScore) {
          stats.wins++
        } else if (playerScore < opponentScore) {
          stats.losses++
        } else {
          stats.draws++
        }
      })

      const enemyKillteams: EnemyKillteamStats[] = Array.from(enemyKillteamMap.entries()).map(([name, stats]) => ({
        name,
        games: stats.games,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
        winRate: (stats.wins / stats.games) * 100,
      }))
      enemyKillteams.sort((a, b) => b.games - a.games)

      setEnemyKillteamStats(enemyKillteams)

      setPlayerData({ games, players })
      console.log("[v0] Processed stats successfully")
    } catch (error) {
      console.error("[v0] Error fetching player details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 50) return "text-green-500"
    if (winRate >= 33) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 md:p-6"
        style={{ maxWidth: "min(95vw, calc(100vw - 2rem))", width: "100%" }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {playerName.toLowerCase() === "effdeedee" && (
              <img
                src="/necron-symbol.svg"
                alt=""
                className="h-7 w-7 shrink-0"
                aria-hidden="true"
              />
            )}
            {playerName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading player statistics...</div>
          </div>
        ) : (
          <div className="space-y-6 min-w-0 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {eloProgression.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">ELO Rating Progression</CardTitle>
                    <CardDescription>Rating development over {eloProgression.length} games</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <SimpleLineChart data={eloProgression} />
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Kill Teams</CardTitle>
                    <CardDescription>Performance by faction</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {killteamStats.slice(0, 5).map((stat) => (
                        <div key={stat.name} className="flex justify-between items-center text-sm">
                          <span className="font-medium truncate flex-1">{stat.name}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">{stat.games}G</span>
                            <span className="font-semibold min-w-[45px] text-right">{stat.winRate.toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                      {killteamStats.length > 5 && (
                        <div className="text-xs text-muted-foreground pt-1">
                          +{killteamStats.length - 5} more factions
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {frequentOpponents.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Most Frequent Opponents</CardTitle>
                      <CardDescription>Top players faced</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {frequentOpponents.map((opponent, index) => (
                          <div key={opponent.id} className="flex justify-between items-center text-sm">
                            <span className="font-medium truncate flex-1">
                              {index + 1}. {opponent.name}
                            </span>
                            <span className="text-muted-foreground text-xs">{opponent.games} games</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-semibold">Operations Statistics</h3>
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                  <span className="text-sm text-muted-foreground">Filter by Kill Team:</span>
                  <Select value={selectedKillteam} onValueChange={setSelectedKillteam}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Select killteam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Kill Teams</SelectItem>
                      {killteamStats.map((kt) => (
                        <SelectItem key={kt.name} value={kt.name}>
                          {kt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Critical Operations</CardTitle>
                    <CardDescription className="text-xs">CritOp performance</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {critOpStats.length > 0 ? (
                        critOpStats.map((stat) => (
                          <div key={stat.name} className="flex justify-between items-center text-sm">
                            <span className="font-medium truncate flex-1">{stat.name}</span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-muted-foreground">{stat.games}G</span>
                              <span className="font-semibold min-w-[35px] text-right">{stat.avgScore.toFixed(1)}</span>
                              <span className={`${getWinRateColor(stat.winRate)} min-w-[45px] text-right`}>
                                {stat.winRate.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-muted-foreground py-4">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tactical Operations</CardTitle>
                    <CardDescription className="text-xs">TacOp performance</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {tacOpStats.length > 0 ? (
                        tacOpStats.map((stat) => (
                          <div key={stat.name} className="flex justify-between items-center text-sm">
                            <span className="font-medium truncate flex-1">{stat.name}</span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-muted-foreground">{stat.games}G</span>
                              <span className="font-semibold min-w-[35px] text-right">{stat.avgScore.toFixed(1)}</span>
                              <span className={`${getWinRateColor(stat.winRate)} min-w-[45px] text-right`}>
                                {stat.winRate.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-muted-foreground py-4">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Primary Operations</CardTitle>
                    <CardDescription className="text-xs">Primary Op performance</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {primaryOpStats.length > 0 ? (
                        primaryOpStats.map((stat) => (
                          <div key={stat.name} className="flex justify-between items-center text-sm">
                            <span className="font-medium truncate flex-1">{stat.name}</span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-muted-foreground">{stat.games}G</span>
                              <span className="font-semibold min-w-[35px] text-right">{stat.avgScore.toFixed(1)}</span>
                              <span className={`${getWinRateColor(stat.winRate)} min-w-[45px] text-right`}>
                                {stat.winRate.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-muted-foreground py-4">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Kill Zones</CardTitle>
                    <CardDescription className="text-xs">Map performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {killzoneStats.length > 0 ? (
                        killzoneStats.map((stat) => (
                          <div key={stat.name} className="flex justify-between items-center text-sm">
                            <span className="font-medium truncate flex-1">{stat.name}</span>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">{stat.games}G</span>
                              <span
                                className={`${getWinRateColor(stat.winRate)} font-semibold min-w-[45px] text-right`}
                              >
                                {stat.winRate.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-muted-foreground py-4 col-span-full">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Enemy Kill Teams</CardTitle>
                    <CardDescription className="text-xs">Performance against opponent factions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {enemyKillteamStats.length > 0 ? (
                        enemyKillteamStats.map((stat) => (
                          <div
                            key={stat.name}
                            className="text-sm border rounded-lg p-2"
                          >
                            <span className="font-medium block">{stat.name}</span>
                            <div className="flex items-center gap-2 text-xs mt-1">
                              <span className="text-muted-foreground">{stat.games}G</span>
                              <span className="text-green-600">{stat.wins}W</span>
                              <span className="text-gray-500">{stat.draws}D</span>
                              <span className="text-red-600">{stat.losses}L</span>
                              <span
                                className={`${getWinRateColor(stat.winRate)} font-semibold ml-auto`}
                              >
                                {stat.winRate.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-muted-foreground py-4 col-span-full">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
