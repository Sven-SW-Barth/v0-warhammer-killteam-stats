"use client"

import { useState } from "react"
import { FactionDetailsDialog } from "@/components/faction-details-dialog"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface FactionStat {
  id: number
  name: string
  seasons: number
  color: string
  wins: number
  losses: number
  draws: number
  totalGames: number
  winRate: number
  avgScore: number
}

interface StatsFactionTableProps {
  factionStats: FactionStat[]
  showLessThan3Games: boolean
  showDeclassified: boolean
}

export function StatsFactionTable({ factionStats, showLessThan3Games, showDeclassified }: StatsFactionTableProps) {
  const [selectedFaction, setSelectedFaction] = useState<{ id: string; name: string } | null>(null)
  const [sortKey, setSortKey] = useState<"name" | "totalGames" | "wins" | "losses" | "draws" | "winRate" | "avgScore">(
    "totalGames",
  )
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (key: "name" | "totalGames" | "wins" | "losses" | "draws" | "winRate" | "avgScore") => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  const filteredStats = factionStats.filter((stat) => {
    if (!showLessThan3Games && stat.totalGames < 3) return false
    if (!showDeclassified && stat.seasons <= 1) return false
    return true
  })

  const sortedStats = [...filteredStats].sort((a, b) => {
    let aVal = a[sortKey]
    let bVal = b[sortKey]

    if (sortKey === "name") {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const SortIcon = ({
    column,
  }: { column: "name" | "totalGames" | "wins" | "losses" | "draws" | "winRate" | "avgScore" }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Faction
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="text-right py-2">
                <button
                  onClick={() => handleSort("totalGames")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  Games
                  <SortIcon column="totalGames" />
                </button>
              </th>
              <th className="text-right py-2">
                <button
                  onClick={() => handleSort("wins")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  Wins
                  <SortIcon column="wins" />
                </button>
              </th>
              <th className="text-right py-2">
                <button
                  onClick={() => handleSort("losses")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  Losses
                  <SortIcon column="losses" />
                </button>
              </th>
              <th className="text-right py-2">
                <button
                  onClick={() => handleSort("draws")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  Draws
                  <SortIcon column="draws" />
                </button>
              </th>
              <th className="text-right py-2">
                <button
                  onClick={() => handleSort("winRate")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  Win Rate
                  <SortIcon column="winRate" />
                </button>
              </th>
              <th className="text-right py-2">
                <button
                  onClick={() => handleSort("avgScore")}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  Avg Score
                  <SortIcon column="avgScore" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((stat) => (
              <tr key={stat.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-2">
                  <button
                    onClick={() => setSelectedFaction({ id: String(stat.id), name: stat.name })}
                    className="flex items-center gap-2 hover:underline text-left"
                  >
                    <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: stat.color }} />
                    <span>{stat.name}</span>
                  </button>
                </td>
                <td className="text-right">{stat.totalGames}</td>
                <td className="text-right text-green-500">{stat.wins}</td>
                <td className="text-right text-red-500">{stat.losses}</td>
                <td className="text-right text-muted-foreground">{stat.draws}</td>
                <td className="text-right font-semibold">{stat.winRate.toFixed(1)}%</td>
                <td className="text-right font-semibold">{stat.avgScore.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedFaction && (
        <FactionDetailsDialog
          factionId={selectedFaction.id}
          factionName={selectedFaction.name}
          open={!!selectedFaction}
          onOpenChange={(open) => !open && setSelectedFaction(null)}
        />
      )}
    </>
  )
}
