"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FactionWinRates } from "@/components/faction-win-rates"

type StatsContentProps = {
  totalGames: number
  totalPlayers: number
  killzoneStats: Array<{ name: string; percentage: number }>
  topTacops: Array<{ name: string; count: number; avgScore: number }>
  killteamWinRates: any[]
  killzones: any[]
  critops: any[]
  initialKillzone?: string
  initialCritop?: string
}

export function StatsContent({
  totalGames,
  totalPlayers,
  killzoneStats,
  topTacops,
  killteamWinRates,
  killzones,
  critops,
  initialKillzone = "all",
  initialCritop = "all",
}: StatsContentProps) {
  return (
    <div>
      {/* Overview Stats */}
      <div className="mb-6 grid gap-3 sm:mb-8 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Games</CardDescription>
            <CardTitle className="text-4xl">{totalGames || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Players</CardDescription>
            <CardTitle className="text-4xl">{totalPlayers || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardDescription>Killzone Distribution</CardDescription>
            <div className="mt-2 space-y-2">
              {killzoneStats.length > 0 ? (
                killzoneStats.map((kz) => (
                  <div key={kz.name} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{kz.name}</span>
                    <span className="ml-2 font-semibold text-foreground">{kz.percentage.toFixed(1)}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardHeader>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardDescription>Top 5 TacOps</CardDescription>
            <div className="mt-2 space-y-2">
              {topTacops.length > 0 ? (
                topTacops.map((tacop, index) => (
                  <div key={tacop.name} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">
                      {index + 1}. {tacop.name}
                    </span>
                    <div className="ml-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">({tacop.count}x)</span>
                      <span className="font-semibold text-foreground">{tacop.avgScore.toFixed(1)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Kill Team Win Rates */}
      <div className="mb-6 sm:mb-8">
        <FactionWinRates
          factionStats={killteamWinRates}
          killzones={killzones || []}
          critops={critops || []}
          initialKillzone={initialKillzone}
          initialCritop={initialCritop}
        />
      </div>
    </div>
  )
}
