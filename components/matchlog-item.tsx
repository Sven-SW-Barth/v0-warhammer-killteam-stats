"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronRight } from "lucide-react"
import { GameActionsMenu } from "./game-actions-menu"
import { PuritySealIcon } from "./purity-seal-icon"

type Game = {
  id: string
  player1_id: number
  player2_id: number
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
  player1: { playertag: string; supporter?: boolean } | null
  player2: { playertag: string; supporter?: boolean } | null
  player1_killteam: { name: string } | null
  player2_killteam: { name: string } | null
  player1_tacop: { name: string } | null
  player2_tacop: { name: string } | null
}

export function MatchlogItem({ game, filteredPlayerId }: { game: Game; filteredPlayerId?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const shouldSwapPlayers = filteredPlayerId && String(game.player2_id) === filteredPlayerId

  const leftPlayer = shouldSwapPlayers
    ? {
        playertag: game.player2?.playertag,
        supporter: game.player2?.supporter,
        killteam: game.player2_killteam?.name,
        tacop: game.player2_tacop?.name,
        primary_op: game.player2_primary_op,
        tacop_score: game.player2_tacop_score,
        critop_score: game.player2_critop_score,
        killop_score: game.player2_killop_score,
        primary_op_score: game.player2_primary_op_score,
      }
    : {
        playertag: game.player1?.playertag,
        supporter: game.player1?.supporter,
        killteam: game.player1_killteam?.name,
        tacop: game.player1_tacop?.name,
        primary_op: game.player1_primary_op,
        tacop_score: game.player1_tacop_score,
        critop_score: game.player1_critop_score,
        killop_score: game.player1_killop_score,
        primary_op_score: game.player1_primary_op_score,
      }

  const rightPlayer = shouldSwapPlayers
    ? {
        playertag: game.player1?.playertag,
        supporter: game.player1?.supporter,
        killteam: game.player1_killteam?.name,
        tacop: game.player1_tacop?.name,
        primary_op: game.player1_primary_op,
        tacop_score: game.player1_tacop_score,
        critop_score: game.player1_critop_score,
        killop_score: game.player1_killop_score,
        primary_op_score: game.player1_primary_op_score,
      }
    : {
        playertag: game.player2?.playertag,
        supporter: game.player2?.supporter,
        killteam: game.player2_killteam?.name,
        tacop: game.player2_tacop?.name,
        primary_op: game.player2_primary_op,
        tacop_score: game.player2_tacop_score,
        critop_score: game.player2_critop_score,
        killop_score: game.player2_killop_score,
        primary_op_score: game.player2_primary_op_score,
      }

  const leftTotal =
    leftPlayer.tacop_score + leftPlayer.critop_score + leftPlayer.killop_score + (leftPlayer.primary_op_score || 0)
  const rightTotal =
    rightPlayer.tacop_score + rightPlayer.critop_score + rightPlayer.killop_score + (rightPlayer.primary_op_score || 0)

  const getResultColor = (p1: number, p2: number) => {
    if (p1 > p2) return "text-green-500"
    if (p1 < p2) return "text-red-500"
    return "text-muted-foreground"
  }

  const renderPlayerName = (name: string | undefined, isSupporter: boolean | undefined) => {
    const displayName = name || "Unknown"
    if (isSupporter) {
      return (
        <span className="inline-flex items-center gap-1.5">
          {displayName}
          <PuritySealIcon className="h-3.5 w-3.5" />
        </span>
      )
    }
    return displayName
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
                  <span className="font-medium text-sm">
                    {renderPlayerName(leftPlayer.playertag, leftPlayer.supporter)}
                  </span>
                  <span className="text-xs text-muted-foreground">({leftPlayer.killteam || "Unknown"})</span>
                </div>
                <span className={`text-xl font-bold tabular-nums ${getResultColor(leftTotal, rightTotal)}`}>
                  {leftTotal}
                </span>
              </div>
              <div className="text-center text-xs text-muted-foreground">vs</div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {renderPlayerName(rightPlayer.playertag, rightPlayer.supporter)}
                  </span>
                  <span className="text-xs text-muted-foreground">({rightPlayer.killteam || "Unknown"})</span>
                </div>
                <span className={`text-xl font-bold tabular-nums ${getResultColor(rightTotal, leftTotal)}`}>
                  {rightTotal}
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

            {/* Left Player */}
            <div className="flex flex-col items-start min-w-[180px]">
              <span className="font-semibold text-base">
                {renderPlayerName(leftPlayer.playertag, leftPlayer.supporter)}
              </span>
              <span className="text-sm text-muted-foreground">{leftPlayer.killteam || "Unknown"}</span>
            </div>

            {/* Scores - Centered */}
            <div className="flex items-center justify-center gap-4 flex-1">
              <span className={`text-3xl font-bold tabular-nums ${getResultColor(leftTotal, rightTotal)}`}>
                {leftTotal}
              </span>
              <span className="text-muted-foreground text-sm">vs</span>
              <span className={`text-3xl font-bold tabular-nums ${getResultColor(rightTotal, leftTotal)}`}>
                {rightTotal}
              </span>
            </div>

            {/* Right Player */}
            <div className="flex flex-col items-end min-w-[180px]">
              <span className="font-semibold text-base">
                {renderPlayerName(rightPlayer.playertag, rightPlayer.supporter)}
              </span>
              <span className="text-sm text-muted-foreground">{rightPlayer.killteam || "Unknown"}</span>
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

            {/* Left Player Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">
                {renderPlayerName(leftPlayer.playertag, leftPlayer.supporter)} - {leftPlayer.killteam || "Unknown"}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected TacOp:</span>
                  <span className="font-medium">{leftPlayer.tacop || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Primary Op:</span>
                  <span className="font-medium">{leftPlayer.primary_op}</span>
                </div>
                <div className="mt-3 space-y-1 rounded-lg bg-background p-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CritOp Score:</span>
                    <span className="font-bold">{leftPlayer.critop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TacOp Score:</span>
                    <span className="font-bold">{leftPlayer.tacop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KillOp Score:</span>
                    <span className="font-bold">{leftPlayer.killop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PrimaryOp Score:</span>
                    <span className="font-bold">{leftPlayer.primary_op_score || 0}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2">
                    <span className="font-semibold">Total VP:</span>
                    <span className={`text-xl font-bold ${getResultColor(leftTotal, rightTotal)}`}>{leftTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Player Details */}
            <div className="space-y-3 md:col-start-2">
              <h4 className="font-semibold text-foreground">
                {renderPlayerName(rightPlayer.playertag, rightPlayer.supporter)} - {rightPlayer.killteam || "Unknown"}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected TacOp:</span>
                  <span className="font-medium">{rightPlayer.tacop || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Primary Op:</span>
                  <span className="font-medium">{rightPlayer.primary_op}</span>
                </div>
                <div className="mt-3 space-y-1 rounded-lg bg-background p-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CritOp Score:</span>
                    <span className="font-bold">{rightPlayer.critop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TacOp Score:</span>
                    <span className="font-bold">{rightPlayer.tacop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KillOp Score:</span>
                    <span className="font-bold">{rightPlayer.killop_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PrimaryOp Score:</span>
                    <span className="font-bold">{rightPlayer.primary_op_score || 0}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2">
                    <span className="font-semibold">Total VP:</span>
                    <span className={`text-xl font-bold ${getResultColor(rightTotal, leftTotal)}`}>{rightTotal}</span>
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
