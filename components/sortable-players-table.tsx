"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayerNameButton } from "@/components/player-name-button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

type Player = {
  id: string
  name: string
  wins: number
  losses: number
  draws: number
  totalGames: number
  totalScore: number
  countryCode: string | null
  countryName: string | null
  avgScore: number
  winRate: number
  eloRating: number
}

type SortColumn = "elo" | "games" | "winRate" | "avgScore" | "wins"
type SortDirection = "asc" | "desc"

export function SortablePlayersTable({ players }: { players: Player[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("elo")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const sortedPlayers = [...players].sort((a, b) => {
    let aValue: number
    let bValue: number

    switch (sortColumn) {
      case "elo":
        aValue = a.eloRating
        bValue = b.eloRating
        break
      case "games":
        aValue = a.totalGames
        bValue = b.totalGames
        break
      case "winRate":
        aValue = a.winRate
        bValue = b.winRate
        break
      case "avgScore":
        aValue = a.avgScore
        bValue = b.avgScore
        break
      case "wins":
      default:
        aValue = a.wins
        bValue = b.wins
        break
    }

    return sortDirection === "desc" ? bValue - aValue : aValue - bValue
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Players</CardTitle>
        <CardDescription>Complete player statistics - Click column headers to sort</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="min-w-[800px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Rank</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">ID</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Player</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Country</th>
                  <th
                    className="cursor-pointer pb-3 text-right font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("elo")}
                  >
                    Elo
                    <SortIcon column="elo" />
                  </th>
                  <th
                    className="cursor-pointer pb-3 text-right font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("games")}
                  >
                    Games
                    <SortIcon column="games" />
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Wins</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Losses</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Draws</th>
                  <th
                    className="cursor-pointer pb-3 text-right font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("winRate")}
                  >
                    Win Rate
                    <SortIcon column="winRate" />
                  </th>
                  <th
                    className="cursor-pointer pb-3 text-right font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("avgScore")}
                  >
                    Avg Score
                    <SortIcon column="avgScore" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, index) => (
                  <tr key={player.id} className="border-b border-border/50">
                    <td className="py-3 text-muted-foreground">{index + 1}</td>
                    <td className="py-3">
                      <span className="font-mono text-xs text-muted-foreground">#{player.id}</span>
                    </td>
                    <td className="py-3">
                      <PlayerNameButton playerId={player.id} playerName={player.name} className="font-medium" />
                    </td>
                    <td className="py-3">
                      {player.countryCode ? (
                        <Badge variant="secondary" className="font-mono">
                          {player.countryCode}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-bold text-primary">{player.eloRating}</span>
                      {player.totalGames < 20 && <span className="ml-1 text-xs text-muted-foreground">*</span>}
                    </td>
                    <td className="py-3 text-right">{player.totalGames}</td>
                    <td className="py-3 text-right text-green-500">{player.wins}</td>
                    <td className="py-3 text-right text-red-500">{player.losses}</td>
                    <td className="py-3 text-right text-muted-foreground">{player.draws}</td>
                    <td className="py-3 text-right font-semibold">{player.winRate.toFixed(1)}%</td>
                    <td className="py-3 text-right">{player.avgScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">* Provisional rating (less than 20 games played)</p>
      </CardContent>
    </Card>
  )
}
