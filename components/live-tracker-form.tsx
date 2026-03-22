"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skull, Zap, Trophy, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import ChessClock from "@/components/chess-clock" // Import ChessClock component
import { LiveTrackerSubmitDialog } from "@/components/live-tracker-submit-dialog"

type TacOp = {
  id: number
  name: string
  archetype: string
}

type PrimaryOp = {
  id: number
  name: string
}

export type GameSetupInfo = {
  player1Id: number
  player2Id: number
  player1Name: string
  player2Name: string
  player1KillteamId: string
  player1KillteamName: string
  player2KillteamId: string
  player2KillteamName: string
  killzoneId: string
  killzoneName: string
  mapLayout?: string
  critOpId: string
  critOpName: string
  countryId: string
  useChessClock: boolean
  clockMode: "up" | "down"
  clockTimeMinutes: number
}

type Props = {
  data: {
    tacops: TacOp[]
    primaryOps: PrimaryOp[]
  }
  gameSetup: GameSetupInfo
}

type RoundScores = {
  critOp1: boolean
  critOp2: boolean
  tacOp1: boolean
  tacOp2: boolean
}

export function LiveTrackerForm({ data, gameSetup }: Props) {
  const player1Id = gameSetup.player1Id
  const player2Id = gameSetup.player2Id

  const [player1Initiative, setPlayer1Initiative] = useState<boolean[]>([false, false, false, false])
  const [player2Initiative, setPlayer2Initiative] = useState<boolean[]>([false, false, false, false])

  const [player1Rounds, setPlayer1Rounds] = useState<RoundScores[]>([
    { critOp1: false, critOp2: false, tacOp1: false, tacOp2: false },
    { critOp1: false, critOp2: false, tacOp1: false, tacOp2: false },
    { critOp1: false, critOp2: false, tacOp1: false, tacOp2: false },
    { critOp1: false, critOp2: false, tacOp1: false, tacOp2: false },
  ])

  const [player2Rounds, setPlayer2Rounds] = useState<RoundScores[]>([
    { critOp1: false, critOp2: false, tacOp1: false, tacOp2: false },
    { critOp1: false, critOp2: false, tacOp1: false, tacOp2: false },
    { critOp1: false, critOp2: false, tacOp1: false, tacOp2: false },
    { critOp1: false, critOp2: false, tacOp1: false, tacOp2: false },
  ])

  const [player1KillOp, setPlayer1KillOp] = useState(0)
  const [player2KillOp, setPlayer2KillOp] = useState(0)

  const [player1TacOp, setPlayer1TacOp] = useState<string>("")
  const [player2TacOp, setPlayer2TacOp] = useState<string>("")

  const [player1PrimaryOp, setPlayer1PrimaryOp] = useState<string>("")
  const [player2PrimaryOp, setPlayer2PrimaryOp] = useState<string>("")

  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [isCompetitivePlay, setIsCompetitivePlay] = useState(false)
  const [notes, setNotes] = useState("")

  const canSubmitGame = player1TacOp !== "" && player2TacOp !== "" && player1PrimaryOp !== "" && player2PrimaryOp !== ""

  const togglePlayer1Skull = (round: number, key: keyof RoundScores) => {
    setPlayer1Rounds((prev) => {
      const newRounds = [...prev]
      newRounds[round] = { ...newRounds[round], [key]: !newRounds[round][key] }
      return newRounds
    })
  }

  const togglePlayer2Skull = (round: number, key: keyof RoundScores) => {
    setPlayer2Rounds((prev) => {
      const newRounds = [...prev]
      newRounds[round] = { ...newRounds[round], [key]: !newRounds[round][key] }
      return newRounds
    })
  }

  const toggleInitiative = (round: number, player: 1 | 2) => {
    if (player === 1) {
      setPlayer1Initiative((prev) => {
        const newInit = [...prev]
        newInit[round] = !newInit[round]
        // If setting player 1, unset player 2
        if (newInit[round]) {
          setPlayer2Initiative((p) => {
            const newP = [...p]
            newP[round] = false
            return newP
          })
        }
        return newInit
      })
    } else {
      setPlayer2Initiative((prev) => {
        const newInit = [...prev]
        newInit[round] = !newInit[round]
        // If setting player 2, unset player 1
        if (newInit[round]) {
          setPlayer1Initiative((p) => {
            const newP = [...p]
            newP[round] = false
            return newP
          })
        }
        return newInit
      })
    }
  }

  const calculatePrimaryOpScore = (primaryOpId: string, critTotal: number, tacTotal: number, killOp: number) => {
    const primaryOp = data.primaryOps.find((op) => op.id.toString() === primaryOpId)
    if (!primaryOp) return 0

    switch (primaryOp.name) {
      case "CritOp":
        return Math.min(3, Math.ceil(critTotal * 0.5))
      case "TacOp":
        return Math.min(3, Math.ceil(tacTotal * 0.5))
      case "KillOp":
        return Math.min(3, Math.ceil(killOp * 0.5))
      default:
        return 0
    }
  }

  const player1CritTotal = player1Rounds.reduce((sum, r) => sum + (r.critOp1 ? 1 : 0) + (r.critOp2 ? 1 : 0), 0)
  const player2CritTotal = player2Rounds.reduce((sum, r) => sum + (r.critOp1 ? 1 : 0) + (r.critOp2 ? 1 : 0), 0)
  const player1TacTotal = player1Rounds.reduce((sum, r) => sum + (r.tacOp1 ? 1 : 0) + (r.tacOp2 ? 1 : 0), 0)
  const player2TacTotal = player2Rounds.reduce((sum, r) => sum + (r.tacOp1 ? 1 : 0) + (r.tacOp2 ? 1 : 0), 0)

  const player1PrimaryScore = calculatePrimaryOpScore(
    player1PrimaryOp,
    player1CritTotal,
    player1TacTotal,
    player1KillOp,
  )
  const player2PrimaryScore = calculatePrimaryOpScore(
    player2PrimaryOp,
    player2CritTotal,
    player2TacTotal,
    player2KillOp,
  )

  // Calculate totals
  const player1CritOpTotal = player1CritTotal
  const player2CritOpTotal = player2CritTotal

  const player1TacOpTotal = player1TacTotal
  const player2TacOpTotal = player2TacTotal

  const player1Total = player1CritOpTotal + player1TacOpTotal + player1KillOp + player1PrimaryScore
  const player2Total = player2CritOpTotal + player2TacOpTotal + player2KillOp + player2PrimaryScore

  return (
    <div className="space-y-2">
      {/* Game Info Display */}
      <div className="rounded-lg border border-border bg-card p-2 space-y-1">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Killzone:</span>{" "}
            <span className="font-medium">{gameSetup.killzoneName || "N/A"}</span>
          </div>
          {gameSetup.mapLayout && (
            <div>
              <span className="text-muted-foreground">Map:</span>{" "}
              <span className="font-medium">{gameSetup.mapLayout}</span>
            </div>
          )}
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">Crit Op:</span>{" "}
          <span className="font-medium">{gameSetup.critOpName || "N/A"}</span>
        </div>
      </div>

      {/* Player Display (Locked) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-orange-500">Player 1</label>
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
            {gameSetup.player1Name || "Player 1"}
          </div>
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
            {gameSetup.player1KillteamName || "Killteam 1"}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-blue-500">Player 2</label>
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
            {gameSetup.player2Name || "Player 2"}
          </div>
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
            {gameSetup.player2KillteamName || "Killteam 2"}
          </div>
        </div>
      </div>

      {gameSetup.useChessClock && (
        <ChessClock
          mode={gameSetup.clockMode}
          initialMinutes={gameSetup.clockTimeMinutes}
          player1Name={gameSetup.player1Name}
          player2Name={gameSetup.player2Name}
        />
      )}

      {/* Rounds */}
      {[0, 1, 2, 3].map((roundIndex) => (
        <div key={roundIndex} className="rounded-lg border border-border bg-card p-2">
          {/* Round Header with Initiative */}
          <div className="mb-2 grid grid-cols-3 items-center gap-2">
            <button
              onClick={() => toggleInitiative(roundIndex, 1)}
              className={cn(
                "flex items-center justify-center rounded-md p-1 transition-colors",
                player1Initiative[roundIndex] ? "bg-orange-500/20" : "bg-muted hover:bg-muted/80",
              )}
            >
              <Zap
                className={cn(
                  "h-4 w-4",
                  player1Initiative[roundIndex] ? "fill-orange-500 text-orange-500" : "text-muted-foreground",
                )}
              />
            </button>

            <div className="text-center">
              <div className="text-sm font-bold text-orange-500">TP{roundIndex + 1}</div>
            </div>

            <button
              onClick={() => toggleInitiative(roundIndex, 2)}
              className={cn(
                "flex items-center justify-center rounded-md p-1 transition-colors",
                player2Initiative[roundIndex] ? "bg-blue-500/20" : "bg-muted hover:bg-muted/80",
              )}
            >
              <Zap
                className={cn(
                  "h-4 w-4",
                  player2Initiative[roundIndex] ? "fill-blue-500 text-blue-500" : "text-muted-foreground",
                )}
              />
            </button>
          </div>

          {/* Scoring Grid */}
          {roundIndex > 0 && (
            <div className="grid grid-cols-4 gap-1">
              {/* Player 1 Crit Ops */}
              <button
                onClick={() => togglePlayer1Skull(roundIndex, "critOp1")}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md p-1.5 transition-colors",
                  player1Rounds[roundIndex].critOp1 ? "bg-orange-500/20" : "bg-muted hover:bg-muted/80",
                )}
              >
                <Skull
                  className={cn(
                    "h-6 w-6",
                    player1Rounds[roundIndex].critOp1 ? "text-orange-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-[10px] font-medium text-orange-500">C1</span>
              </button>

              <button
                onClick={() => togglePlayer1Skull(roundIndex, "critOp2")}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md p-1.5 transition-colors",
                  player1Rounds[roundIndex].critOp2 ? "bg-orange-500/20" : "bg-muted hover:bg-muted/80",
                )}
              >
                <Skull
                  className={cn(
                    "h-6 w-6",
                    player1Rounds[roundIndex].critOp2 ? "text-orange-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-[10px] font-medium text-orange-500">C2</span>
              </button>

              {/* Player 2 Crit Ops */}
              <button
                onClick={() => togglePlayer2Skull(roundIndex, "critOp1")}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md p-1.5 transition-colors",
                  player2Rounds[roundIndex].critOp1 ? "bg-blue-500/20" : "bg-muted hover:bg-muted/80",
                )}
              >
                <Skull
                  className={cn(
                    "h-6 w-6",
                    player2Rounds[roundIndex].critOp1 ? "text-blue-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-[10px] font-medium text-blue-500">C1</span>
              </button>

              <button
                onClick={() => togglePlayer2Skull(roundIndex, "critOp2")}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md p-1.5 transition-colors",
                  player2Rounds[roundIndex].critOp2 ? "bg-blue-500/20" : "bg-muted hover:bg-muted/80",
                )}
              >
                <Skull
                  className={cn(
                    "h-6 w-6",
                    player2Rounds[roundIndex].critOp2 ? "text-blue-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-[10px] font-medium text-blue-500">C2</span>
              </button>

              {/* Player 1 Tac Ops */}
              <button
                onClick={() => togglePlayer1Skull(roundIndex, "tacOp1")}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md p-1.5 transition-colors",
                  player1Rounds[roundIndex].tacOp1 ? "bg-orange-500/20" : "bg-muted hover:bg-muted/80",
                )}
              >
                <Skull
                  className={cn(
                    "h-6 w-6",
                    player1Rounds[roundIndex].tacOp1 ? "text-orange-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-[10px] font-medium text-orange-500">T1</span>
              </button>

              <button
                onClick={() => togglePlayer1Skull(roundIndex, "tacOp2")}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md p-1.5 transition-colors",
                  player1Rounds[roundIndex].tacOp2 ? "bg-orange-500/20" : "bg-muted hover:bg-muted/80",
                )}
              >
                <Skull
                  className={cn(
                    "h-6 w-6",
                    player1Rounds[roundIndex].tacOp2 ? "text-orange-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-[10px] font-medium text-orange-500">T2</span>
              </button>

              {/* Player 2 Tac Ops */}
              <button
                onClick={() => togglePlayer2Skull(roundIndex, "tacOp1")}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md p-1.5 transition-colors",
                  player2Rounds[roundIndex].tacOp1 ? "bg-blue-500/20" : "bg-muted hover:bg-muted/80",
                )}
              >
                <Skull
                  className={cn(
                    "h-6 w-6",
                    player2Rounds[roundIndex].tacOp1 ? "text-blue-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-[10px] font-medium text-blue-500">T1</span>
              </button>

              <button
                onClick={() => togglePlayer2Skull(roundIndex, "tacOp2")}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md p-1.5 transition-colors",
                  player2Rounds[roundIndex].tacOp2 ? "bg-blue-500/20" : "bg-muted hover:bg-muted/80",
                )}
              >
                <Skull
                  className={cn(
                    "h-6 w-6",
                    player2Rounds[roundIndex].tacOp2 ? "text-blue-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-[10px] font-medium text-blue-500">T2</span>
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Kill Op Section */}
      <div className="rounded-lg border border-border bg-card p-2">
        <div className="mb-2 text-center text-sm font-bold text-orange-500">Kill Op</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 bg-transparent"
              onClick={() => setPlayer1KillOp(Math.max(0, player1KillOp - 1))}
            >
              -
            </Button>
            <span className="text-xl font-bold text-orange-500 w-8 text-center">{player1KillOp}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 bg-transparent"
              onClick={() => setPlayer1KillOp(Math.min(6, player1KillOp + 1))}
            >
              +
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 bg-transparent"
              onClick={() => setPlayer2KillOp(Math.max(0, player2KillOp - 1))}
            >
              -
            </Button>
            <span className="text-xl font-bold text-blue-500 w-8 text-center">{player2KillOp}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 bg-transparent"
              onClick={() => setPlayer2KillOp(Math.min(6, player2KillOp + 1))}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Tac Op Selection */}
      <div className="rounded-lg border border-border bg-card p-2">
        <div className="mb-2 text-center text-sm font-bold text-orange-500">Tac Op</div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={player1TacOp} onValueChange={setPlayer1TacOp}>
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue placeholder="Select TacOp" />
            </SelectTrigger>
            <SelectContent>
              {data.tacops.map((tacop) => (
                <SelectItem key={tacop.id} value={tacop.id.toString()}>
                  {tacop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={player2TacOp} onValueChange={setPlayer2TacOp}>
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue placeholder="Select TacOp" />
            </SelectTrigger>
            <SelectContent>
              {data.tacops.map((tacop) => (
                <SelectItem key={tacop.id} value={tacop.id.toString()}>
                  {tacop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Primary Op Selection */}
      <div className="rounded-lg border border-border bg-card p-2">
        <div className="mb-2 text-center text-sm font-bold text-orange-500">Primary Op</div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={player1PrimaryOp} onValueChange={setPlayer1PrimaryOp}>
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue placeholder="Select PrimaryOp" />
            </SelectTrigger>
            <SelectContent>
              {data.primaryOps.map((op) => (
                <SelectItem key={op.id} value={op.id.toString()}>
                  {op.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={player2PrimaryOp} onValueChange={setPlayer2PrimaryOp}>
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue placeholder="Select PrimaryOp" />
            </SelectTrigger>
            <SelectContent>
              {data.primaryOps.map((op) => (
                <SelectItem key={op.id} value={op.id.toString()}>
                  {op.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Totals Display */}
      <div className="rounded-lg border border-border bg-card p-2">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-500">{player1CritOpTotal}/6</div>
            <div className="text-[10px] font-medium text-muted-foreground">Crit</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-500">{player2CritOpTotal}/6</div>
            <div className="text-[10px] font-medium text-muted-foreground">Crit</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-500">{player1TacOpTotal}/6</div>
            <div className="text-[10px] font-medium text-muted-foreground">Tac</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-500">{player2TacOpTotal}/6</div>
            <div className="text-[10px] font-medium text-muted-foreground">Tac</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-500">{player1KillOp}/6</div>
            <div className="text-[10px] font-medium text-muted-foreground">Kill</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-500">{player2KillOp}/6</div>
            <div className="text-[10px] font-medium text-muted-foreground">Kill</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-500">{player1PrimaryScore}/3</div>
            <div className="text-[10px] font-medium text-muted-foreground">Primary</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-500">{player2PrimaryScore}/3</div>
            <div className="text-[10px] font-medium text-muted-foreground">Primary</div>
          </div>
        </div>

        {/* Grand Totals */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center rounded-lg border-2 border-orange-500 p-4">
            <span className="text-4xl font-bold text-orange-500">{player1Total}</span>
          </div>

          <div className="flex items-center justify-center rounded-lg border-2 border-blue-500 p-4">
            <span className="text-4xl font-bold text-blue-500">{player2Total}</span>
          </div>
        </div>
      </div>

      {/* Tournament Match & Notes */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="competitive_play_tracker"
            checked={isCompetitivePlay}
            onCheckedChange={(checked) => setIsCompetitivePlay(checked === true)}
          />
          <Label htmlFor="competitive_play_tracker" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
            <Trophy className="h-4 w-4 text-amber-500" />
            Tournament Match
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Check this field when the game was held in a competitive tournament setting.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="notes_tracker" className="text-sm">Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Textarea
            id="notes_tracker"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the game..."
            className="h-16 resize-none text-sm"
          />
        </div>
      </div>

      {/* Submit Game Button */}
      <div className="mt-4 flex justify-center">
        <Button
          onClick={() => setShowSubmitDialog(true)}
          disabled={!canSubmitGame}
          size="lg"
          className="w-full max-w-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Game
        </Button>
      </div>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <LiveTrackerSubmitDialog
          open={showSubmitDialog}
          onOpenChange={setShowSubmitDialog}
          gameData={{
            gameSetup,
            player1: {
              tacOpId: player1TacOp,
              primaryOp: player1PrimaryOp,
              tacOpScore: player1TacTotal,
              critOpScore: player1CritTotal,
              killOpScore: player1KillOp,
              primaryOpScore: player1PrimaryScore,
            },
            player2: {
              tacOpId: player2TacOp,
              primaryOp: player2PrimaryOp,
              tacOpScore: player2TacTotal,
              critOpScore: player2CritTotal,
              killOpScore: player2KillOp,
              primaryOpScore: player2PrimaryScore,
            },
            tacops: data.tacops,
            primaryOps: data.primaryOps,
            isCompetitivePlay,
            notes,
          }}
          onSuccess={() => setShowSuccessScreen(true)}
        />
      )}

      {/* Success Screen */}
      {showSuccessScreen && (
        <div className="mt-4 flex justify-center">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-2xl font-bold text-green-500">Game Submitted Successfully!</div>
          </div>
        </div>
      )}
    </div>
  )
}
