"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitEditReport } from "@/app/actions"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  player1: { playertag: string; id: number } | null
  player2: { playertag: string; id: number } | null
  player1_killteam: { name: string; id: number } | null
  player2_killteam: { name: string; id: number } | null
  player1_tacop: { name: string; id: number } | null
  player2_tacop: { name: string; id: number } | null
  country: { name: string; id: number } | null
  killzone: { name: string; id: number } | null
  critop: { name: string; id: number } | null
}

export function EditReportDialog({
  game,
  open,
  onOpenChange,
}: {
  game: Game
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [reporterName, setReporterName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Player 1 scores
  const [p1TacOpScore, setP1TacOpScore] = useState(game.player1_tacop_score)
  const [p1CritOpScore, setP1CritOpScore] = useState(game.player1_critop_score)
  const [p1KillOpScore, setP1KillOpScore] = useState(game.player1_killop_score)
  const [p1PrimaryOpScore, setP1PrimaryOpScore] = useState(game.player1_primary_op_score || 0)

  // Player 2 scores
  const [p2TacOpScore, setP2TacOpScore] = useState(game.player2_tacop_score)
  const [p2CritOpScore, setP2CritOpScore] = useState(game.player2_critop_score)
  const [p2KillOpScore, setP2KillOpScore] = useState(game.player2_killop_score)
  const [p2PrimaryOpScore, setP2PrimaryOpScore] = useState(game.player2_primary_op_score || 0)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setP1TacOpScore(game.player1_tacop_score)
      setP1CritOpScore(game.player1_critop_score)
      setP1KillOpScore(game.player1_killop_score)
      setP1PrimaryOpScore(game.player1_primary_op_score || 0)
      setP2TacOpScore(game.player2_tacop_score)
      setP2CritOpScore(game.player2_critop_score)
      setP2KillOpScore(game.player2_killop_score)
      setP2PrimaryOpScore(game.player2_primary_op_score || 0)
    }
  }, [open, game])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const proposedChanges = {
        player1_tacop_score: p1TacOpScore,
        player1_critop_score: p1CritOpScore,
        player1_killop_score: p1KillOpScore,
        player1_primary_op_score: p1PrimaryOpScore,
        player2_tacop_score: p2TacOpScore,
        player2_critop_score: p2CritOpScore,
        player2_killop_score: p2KillOpScore,
        player2_primary_op_score: p2PrimaryOpScore,
      }

      const result = await submitEditReport({
        gameId: Number.parseInt(game.id),
        reporterName,
        proposedChanges,
      })

      if (result.success) {
        toast.success("Edit report submitted successfully")
        onOpenChange(false)
        setReporterName("")
      } else {
        toast.error(result.error || "Failed to submit edit report")
      }
    } catch (error) {
      toast.error("An error occurred while submitting the report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Report Game Edit</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6 pr-4">
            <div className="space-y-2">
              <Label htmlFor="reporter-name-edit">Reporter Name *</Label>
              <Input
                id="reporter-name-edit"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Player 1 Scores */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">
                  {game.player1?.playertag || "Player 1"} - {game.player1_killteam?.name || "Unknown"}
                </h3>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="p1-critop">CritOp Score</Label>
                    <Input
                      id="p1-critop"
                      type="number"
                      min="0"
                      value={p1CritOpScore}
                      onChange={(e) => setP1CritOpScore(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="p1-tacop">TacOp Score</Label>
                    <Input
                      id="p1-tacop"
                      type="number"
                      min="0"
                      value={p1TacOpScore}
                      onChange={(e) => setP1TacOpScore(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="p1-killop">KillOp Score</Label>
                    <Input
                      id="p1-killop"
                      type="number"
                      min="0"
                      value={p1KillOpScore}
                      onChange={(e) => setP1KillOpScore(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="p1-primaryop">PrimaryOp Score</Label>
                    <Input
                      id="p1-primaryop"
                      type="number"
                      min="0"
                      value={p1PrimaryOpScore}
                      onChange={(e) => setP1PrimaryOpScore(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Total VP:</p>
                    <p className="text-2xl font-bold">
                      {p1TacOpScore + p1CritOpScore + p1KillOpScore + p1PrimaryOpScore}
                    </p>
                  </div>
                </div>
              </div>

              {/* Player 2 Scores */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">
                  {game.player2?.playertag || "Player 2"} - {game.player2_killteam?.name || "Unknown"}
                </h3>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="p2-critop">CritOp Score</Label>
                    <Input
                      id="p2-critop"
                      type="number"
                      min="0"
                      value={p2CritOpScore}
                      onChange={(e) => setP2CritOpScore(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="p2-tacop">TacOp Score</Label>
                    <Input
                      id="p2-tacop"
                      type="number"
                      min="0"
                      value={p2TacOpScore}
                      onChange={(e) => setP2TacOpScore(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="p2-killop">KillOp Score</Label>
                    <Input
                      id="p2-killop"
                      type="number"
                      min="0"
                      value={p2KillOpScore}
                      onChange={(e) => setP2KillOpScore(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="p2-primaryop">PrimaryOp Score</Label>
                    <Input
                      id="p2-primaryop"
                      type="number"
                      min="0"
                      value={p2PrimaryOpScore}
                      onChange={(e) => setP2PrimaryOpScore(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Total VP:</p>
                    <p className="text-2xl font-bold">
                      {p2TacOpScore + p2CritOpScore + p2KillOpScore + p2PrimaryOpScore}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !reporterName}>
                {isSubmitting ? "Submitting..." : "Send Change Report"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
