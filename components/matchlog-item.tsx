"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronRight } from "lucide-react"
import { GameActionsMenu } from "./game-actions-menu"

type Game = {
  id: string
  map_layout: string | null
  player1_tacop_score: number
  player1_critop_score: number
  player1_killop_score: number
  player1_primary_op: string
  player1_primary_op_score: number | null
  player2_tacop_score: number
  player2_critop_score: number
  player2_killop_score: number
  player2_primary_op: string
  player2_primary_op_score: number | null
  created_at: string
  country: { name: string } | null
  killzone: { name: string } | null
  critop: { name: string } | null
  player1: { playertag: string } | null
  player2: { playertag: string } | null
  player1_killteam: { name: string } | null
  player2_killteam: { name: string } | null
  player1_tacop: { name: string } | null
  player2_tacop: { name: string } | null
}

export function MatchlogItem({ game }: { game: Game }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const player1Total =
    game.player1_tacop_score +
    game.player1_critop_score +
    game.player1_killop_score +
    (game.player1_primary_op_score || 0)
  const player2Total =
    game.player2_tacop_score +
    game.player2_critop_score +
    game.player2_killop_score +
    (game.player2_primary_op_score || 0)

  const getResultColor = (p1: number, p2: number) => {
    if (p1 > p2) return "text-green-500"
    if (p1 < p2) return "text-red-500"
    return "text-muted-foreground"
  }

  return (
    <div className="rounded-lg border border-border bg-card transition-colors hover:bg-accent/50">
      {/* Collapsed View */}
      <div className="flex items-center gap-2">
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex-1 p-4 text-left">
          {/* Mobile: Stacked layout */}
          <div className="flex items-start gap-3 sm:hidden">
            <div className="flex-shrink-0 pt-1">
              {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{game.player1?.playertag || "Unknown"}</span>
                  <span className="text-xs text-muted-foreground">({game.player1_killteam?.name || "Unknown"})</span>
                </div>
                <span className={`text-xl font-bold tabular-nums ${getResultColor(player1Total, player2Total)}`}>
                  {player1Total}
                </span>
              </div>
              <div className="text-center text-xs text-muted-foreground">vs</div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{game.player2?.playertag || "Unknown"}</span>
                  <span className="text-xs text-muted-foreground">({game.player2_killteam?.name || "Unknown"})</span>
                </div>
                <span className={`text-xl font-bold tabular-nums ${getResultColor(player2Total, player1Total)}`}>
                  {player2Total}
                </span>
              </div>
              <div className="text-xs text-muted-foreground text-center mt-1">
                {format(new Date(game.created_at), "MMM d, yyyy")}
              </div>
            </div>
          </div>

          {/* Desktop: Horizontal layout with proper spacing */}
          <div className="hidden sm:flex items-center gap-6 w-full">
            {/* Chevron Icon */}
            <div className="flex-shrink-0">
              {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>

            {/* Player 1 - Left aligned */}
            <div className="flex flex-col items-start min-w-[180px]">
              <span className="font-semibold text-base">{game.player1?.playertag || "Unknown"}</span>
              <span className="text-sm text-muted-foreground">{game.player1_killteam?.name || "Unknown"}</span>
            </div>

            {/* Scores - Centered */}
            <div className="flex items-center justify-center gap-4 flex-1">
              <span className={`text-3xl font-bold tabular-nums ${getResultColor(player1Total, player2Total)}`}>
                {player1Total}
              </span>
              <span className="text-muted-foreground text-sm">vs</span>
              <span className={`text-3xl font-bold tabular-nums ${getResultColor(player2Total, player1Total)}`}>
                {player2Total}
              </span>
            </div>

            {/* Player 2 - Right aligned */}
            <div className="flex flex-col items-end min-w-[180px]">
              <span className="font-semibold text-base">{game.player2?.playertag || "Player 2"}</span>
              <span className="text-sm text-muted-foreground">{game.player2_killteam?.name || "Unknown"}</span>
            </div>

            {/* Date */}
            <div className="text-sm text-muted-foreground whitespace-nowrap min-w-[100px] text-right">
              {format(new Date(game.created_at), "MMM d, yyyy")}
            </div>
          </div>
        </button>

        <div className="pr-4">
          <GameActionsMenu game={game} />
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-border p-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Game Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Game Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Game ID:</span>
                  <span className="font-medium font-mono">{game.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-medium">{game.country?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Killzone:</span>
                  <span className="font-medium">{game.killzone?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Map Layout:</span>
                  <span className="font-medium">{game.map_layout || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Critical Operation:</span>
                  <span className="font-medium">{game.critop?.name || "Unknown"}</span>
                </div>
              </div>
            </div>

            {/* Player 1 Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">
                {game.player1?.playertag || "Player 1"} - {game.player1_killteam?.name || "Unknown"}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected TacOp:</span>
                  <span className="font-medium">{game.player1_tacop?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Primary Op:</span>
                  <span className="font-medium">{game.player1_primary_op}</span>
                </div>
                <div className="mt-3 space-y-1 rounded-lg bg-background p-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CritOp Score:</span>
                    <span className="font-bold">{game.player1_critop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TacOp Score:</span>
                    <span className="font-bold">{game.player1_tacop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KillOp Score:</span>
                    <span className="font-bold">{game.player1_killop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PrimaryOp Score:</span>
                    <span className="font-bold">{game.player1_primary_op_score || 0}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2">
                    <span className="font-semibold">Total VP:</span>
                    <span className={`text-xl font-bold ${getResultColor(player1Total, player2Total)}`}>
                      {player1Total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Player 2 Details */}
            <div className="space-y-3 md:col-start-2">
              <h4 className="font-semibold text-foreground">
                {game.player2?.playertag || "Player 2"} - {game.player2_killteam?.name || "Unknown"}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected TacOp:</span>
                  <span className="font-medium">{game.player2_tacop?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Primary Op:</span>
                  <span className="font-medium">{game.player2_primary_op}</span>
                </div>
                <div className="mt-3 space-y-1 rounded-lg bg-background p-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CritOp Score:</span>
                    <span className="font-bold">{game.player2_critop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TacOp Score:</span>
                    <span className="font-bold">{game.player2_tacop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KillOp Score:</span>
                    <span className="font-bold">{game.player2_killop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PrimaryOp Score:</span>
                    <span className="font-bold">{game.player2_primary_op_score || 0}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2">
                    <span className="font-semibold">Total VP:</span>
                    <span className={`text-xl font-bold ${getResultColor(player2Total, player1Total)}`}>
                      {player2Total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
