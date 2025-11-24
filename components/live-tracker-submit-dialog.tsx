"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { CheckCircle2 } from "lucide-react"
import { submitGame } from "@/app/actions"
import type { GameSetupInfo } from "./live-tracker-form"

type GameData = {
  gameSetup: GameSetupInfo
  player1: {
    tacOpId: string
    primaryOp: string
    tacOpScore: number
    critOpScore: number
    killOpScore: number
    primaryOpScore: number
  }
  player2: {
    tacOpId: string
    primaryOp: string
    tacOpScore: number
    critOpScore: number
    killOpScore: number
    primaryOpScore: number
  }
  tacops: Array<{ id: number; name: string; archetype: string }>
  primaryOps: Array<{ id: number; name: string }>
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameData: GameData
}

export function LiveTrackerSubmitDialog({ open, onOpenChange, gameData }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const player1PrimaryOpName =
        gameData.primaryOps.find((op) => op.id.toString() === gameData.player1.primaryOp)?.name || ""
      const player2PrimaryOpName =
        gameData.primaryOps.find((op) => op.id.toString() === gameData.player2.primaryOp)?.name || ""

      const validPrimaryOps = ["CritOp", "TacOp", "KillOp"]
      if (!validPrimaryOps.includes(player1PrimaryOpName)) {
        setError(`Invalid Player 1 Primary Op: ${player1PrimaryOpName}. Must select CritOp, TacOp, or KillOp.`)
        setIsSubmitting(false)
        return
      }
      if (!validPrimaryOps.includes(player2PrimaryOpName)) {
        setError(`Invalid Player 2 Primary Op: ${player2PrimaryOpName}. Must select CritOp, TacOp, or KillOp.`)
        setIsSubmitting(false)
        return
      }

      const formData = new FormData()

      formData.append("country", gameData.gameSetup.countryId)
      formData.append("killzone", gameData.gameSetup.killzoneId)
      formData.append("map_layout", gameData.gameSetup.mapLayout || "")
      formData.append("critop", gameData.gameSetup.critOpId)

      formData.append("player1_id", gameData.gameSetup.player1Id?.toString() || "")
      formData.append("player1_killteam", gameData.gameSetup.player1KillteamId)
      formData.append("player1_tacop", gameData.player1.tacOpId)
      formData.append("player1_primary_op", player1PrimaryOpName)
      formData.append("player1_primary_op_score", gameData.player1.primaryOpScore.toString())
      formData.append("player1_tacop_score", gameData.player1.tacOpScore.toString())
      formData.append("player1_critop_score", gameData.player1.critOpScore.toString())
      formData.append("player1_killop_score", gameData.player1.killOpScore.toString())

      formData.append("player2_id", gameData.gameSetup.player2Id?.toString() || "")
      formData.append("player2_killteam", gameData.gameSetup.player2KillteamId)
      formData.append("player2_tacop", gameData.player2.tacOpId)
      formData.append("player2_primary_op", player2PrimaryOpName)
      formData.append("player2_primary_op_score", gameData.player2.primaryOpScore.toString())
      formData.append("player2_tacop_score", gameData.player2.tacOpScore.toString())
      formData.append("player2_critop_score", gameData.player2.critOpScore.toString())
      formData.append("player2_killop_score", gameData.player2.killOpScore.toString())

      const result = await submitGame(formData)

      if (result.success) {
        setShowSuccess(true)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      console.error("[v0] Error submitting game:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const player1TacOp = gameData.tacops.find((t) => t.id.toString() === gameData.player1.tacOpId)
  const player2TacOp = gameData.tacops.find((t) => t.id.toString() === gameData.player2.tacOpId)

  const player1PrimaryOpName =
    gameData.primaryOps.find((op) => op.id.toString() === gameData.player1.primaryOp)?.name || "Not selected"
  const player2PrimaryOpName =
    gameData.primaryOps.find((op) => op.id.toString() === gameData.player2.primaryOp)?.name || "Not selected"

  const player1Total =
    gameData.player1.tacOpScore +
    gameData.player1.critOpScore +
    gameData.player1.killOpScore +
    gameData.player1.primaryOpScore
  const player2Total =
    gameData.player2.tacOpScore +
    gameData.player2.critOpScore +
    gameData.player2.killOpScore +
    gameData.player2.primaryOpScore

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-md [&>button]:hidden">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Game Recorded Successfully!</h2>
            <p className="mb-8 text-muted-foreground">Your Kill Team battle has been added to the global statistics.</p>
            <Button
              onClick={() => {
                router.push("/matchlog")
              }}
              size="lg"
            >
              View Matchlog
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Game Submission</DialogTitle>
          <DialogDescription>Please review the game details before submitting</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Game Details */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <h3 className="font-semibold mb-2 text-sm">Game Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Killzone:</span>
                <span className="ml-2 font-medium">{gameData.gameSetup.killzoneName}</span>
              </div>
              {gameData.gameSetup.mapLayout && (
                <div>
                  <span className="text-muted-foreground">Map Layout:</span>
                  <span className="ml-2 font-medium">{gameData.gameSetup.mapLayout}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Crit Op:</span>
                <span className="ml-2 font-medium">{gameData.gameSetup.critOpName}</span>
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="grid gap-3 md:grid-cols-2">
            {/* Player 1 */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <h3 className="font-semibold mb-2 text-sm text-orange-500">{gameData.gameSetup.player1Name}</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Killteam:</span>
                  <span className="ml-2 font-medium">{gameData.gameSetup.player1KillteamName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">TacOp:</span>
                  <span className="ml-2 font-medium">
                    {player1TacOp ? `${player1TacOp.name} (${player1TacOp.archetype})` : "Not selected"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Primary:</span>
                  <span className="ml-2 font-medium">{player1PrimaryOpName}</span>
                </div>
                <div className="pt-2 border-t border-border mt-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      Tac Op: <span className="font-semibold">{gameData.player1.tacOpScore}</span>
                    </div>
                    <div>
                      Crit Op: <span className="font-semibold">{gameData.player1.critOpScore}</span>
                    </div>
                    <div>
                      Kill Op: <span className="font-semibold">{gameData.player1.killOpScore}</span>
                    </div>
                    <div>
                      Primary: <span className="font-semibold">{gameData.player1.primaryOpScore}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border text-base font-bold">Total: {player1Total} VP</div>
                </div>
              </div>
            </div>

            {/* Player 2 */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <h3 className="font-semibold mb-2 text-sm text-blue-500">{gameData.gameSetup.player2Name}</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Killteam:</span>
                  <span className="ml-2 font-medium">{gameData.gameSetup.player2KillteamName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">TacOp:</span>
                  <span className="ml-2 font-medium">
                    {player2TacOp ? `${player2TacOp.name} (${player2TacOp.archetype})` : "Not selected"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Primary:</span>
                  <span className="ml-2 font-medium">{player2PrimaryOpName}</span>
                </div>
                <div className="pt-2 border-t border-border mt-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      Tac Op: <span className="font-semibold">{gameData.player2.tacOpScore}</span>
                    </div>
                    <div>
                      Crit Op: <span className="font-semibold">{gameData.player2.critOpScore}</span>
                    </div>
                    <div>
                      Kill Op: <span className="font-semibold">{gameData.player2.killOpScore}</span>
                    </div>
                    <div>
                      Primary: <span className="font-semibold">{gameData.player2.primaryOpScore}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border text-base font-bold">Total: {player2Total} VP</div>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Confirm & Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
