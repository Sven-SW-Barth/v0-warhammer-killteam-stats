"use client"

import { useState } from "react"
import { FactionDetailsDialog } from "@/components/faction-details-dialog"

interface FactionStat {
  id: number
  name: string
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
}

export function StatsFactionTable({ factionStats }: StatsFactionTableProps) {
  const [selectedFaction, setSelectedFaction] = useState<{ id: string; name: string } | null>(null)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Faction</th>
              <th className="text-right py-2">Games</th>
              <th className="text-right py-2">Wins</th>
              <th className="text-right py-2">Losses</th>
              <th className="text-right py-2">Draws</th>
              <th className="text-right py-2">Win Rate</th>
              <th className="text-right py-2">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {factionStats.map((stat) => (
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
