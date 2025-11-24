"use client"

import { useState } from "react"
import { MoreVertical, Flag, Info } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { DeletionReportDialog } from "./deletion-report-dialog"

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
  country: { name: string; id: number } | null
  killzone: { name: string; id: number } | null
  critop: { name: string; id: number } | null
  player1: { playertag: string; id: number } | null
  player2: { playertag: string; id: number } | null
  player1_killteam: { name: string; id: number } | null
  player2_killteam: { name: string; id: number } | null
  player1_tacop: { name: string; id: number } | null
  player2_tacop: { name: string; id: number } | null
}

export function GameActionsMenu({ game }: { game: Game }) {
  const [showDeletionDialog, setShowDeletionDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-card">
          <DropdownMenuItem onClick={() => setShowDeletionDialog(true)}>
            <Flag className="mr-2 h-4 w-4" />
            Mark for Deletion
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-3 text-xs bg-blue-500/10 rounded-md mx-2 mb-2">
            <div className="flex gap-2 items-start">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium text-foreground mb-1">Incorrect Results?</p>
                <p className="leading-relaxed text-muted-foreground">
                  If you've entered wrong results, mark the game for deletion and resubmit the correct results as a new
                  entry. The incorrect results will be reviewed and removed shortly.
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeletionReportDialog game={game} open={showDeletionDialog} onOpenChange={setShowDeletionDialog} />
    </>
  )
}
