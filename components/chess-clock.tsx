"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Maximize2, X, RotateCw } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent } from "@/components/ui/dialog"

type Props = {
  mode: "up" | "down"
  initialMinutes: number
  player1Name: string
  player2Name: string
}

export default function ChessClock({ mode, initialMinutes, player1Name, player2Name }: Props) {
  const [player1Time, setPlayer1Time] = useState(mode === "down" ? initialMinutes * 60 : 0)
  const [player2Time, setPlayer2Time] = useState(mode === "down" ? initialMinutes * 60 : 0)
  const [activePlayer, setActivePlayer] = useState<1 | 2 | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [wasRunningBeforeDialog, setWasRunningBeforeDialog] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlayer1Rotated, setIsPlayer1Rotated] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const initialSeconds = mode === "down" ? initialMinutes * 60 : 0
    setPlayer1Time(initialSeconds)
    setPlayer2Time(initialSeconds)
    setActivePlayer(null)
    setIsPaused(false)
  }, [mode, initialMinutes])

  useEffect(() => {
    if (activePlayer && !isPaused && !showResetDialog) {
      intervalRef.current = setInterval(() => {
        if (activePlayer === 1) {
          setPlayer1Time((prev) => {
            const newTime = mode === "down" ? prev - 1 : prev + 1
            if (mode === "down" && newTime <= 0) {
              stopClock()
              return 0
            }
            return newTime
          })
        } else {
          setPlayer2Time((prev) => {
            const newTime = mode === "down" ? prev - 1 : prev + 1
            if (mode === "down" && newTime <= 0) {
              stopClock()
              return 0
            }
            return newTime
          })
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activePlayer, isPaused, mode, showResetDialog])

  const stopClock = () => {
    setActivePlayer(null)
    setIsPaused(false)
  }

  const togglePause = () => {
    if (activePlayer === null) {
      setActivePlayer(1)
      setIsPaused(false)
    } else {
      setIsPaused(!isPaused)
    }
  }

  const switchPlayer = () => {
    if (activePlayer !== null && !isPaused) {
      setActivePlayer(activePlayer === 1 ? 2 : 1)
    }
  }

  const handleResetClick = () => {
    setWasRunningBeforeDialog(activePlayer !== null && !isPaused)
    setShowResetDialog(true)
  }

  const confirmReset = () => {
    stopClock()
    const initialSeconds = mode === "down" ? initialMinutes * 60 : 0
    setPlayer1Time(initialSeconds)
    setPlayer2Time(initialSeconds)
    setShowResetDialog(false)
    setWasRunningBeforeDialog(false)
  }

  const cancelReset = () => {
    setShowResetDialog(false)
    setWasRunningBeforeDialog(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.abs(seconds) % 60
    const sign = seconds < 0 ? "-" : ""
    return `${sign}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const isPlayer1Warning = mode === "down" && player1Time <= 300 && player1Time > 0
  const isPlayer2Warning = mode === "down" && player2Time <= 300 && player2Time > 0
  const isPlayer1Expired = mode === "down" && player1Time <= 0
  const isPlayer2Expired = mode === "down" && player2Time <= 0

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-2 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Chess Clock</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px]">{mode === "down" ? "Countdown" : "Count Up"}</span>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Fullscreen mode"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Player 1 Clock */}
          <button
            onClick={switchPlayer}
            disabled={activePlayer === null || isPaused}
            className={`rounded-lg border-2 p-2 transition-all ${
              activePlayer === 1
                ? "border-orange-500 bg-orange-500/10"
                : activePlayer === 2
                  ? "border-border bg-muted opacity-50"
                  : "border-border bg-muted"
            } ${isPlayer1Expired ? "border-red-500 bg-red-500/10" : ""} ${isPlayer1Warning ? "border-yellow-500" : ""}`}
          >
            <div className="text-[10px] text-muted-foreground mb-1 truncate">{player1Name}</div>
            <div
              className={`text-xl font-mono font-bold ${activePlayer === 1 ? "text-orange-500" : ""} ${isPlayer1Expired ? "text-red-500" : ""} ${isPlayer1Warning ? "text-yellow-500" : ""}`}
            >
              {formatTime(player1Time)}
            </div>
          </button>

          {/* Player 2 Clock */}
          <button
            onClick={switchPlayer}
            disabled={activePlayer === null || isPaused}
            className={`rounded-lg border-2 p-2 transition-all ${
              activePlayer === 2
                ? "border-blue-500 bg-blue-500/10"
                : activePlayer === 1
                  ? "border-border bg-muted opacity-50"
                  : "border-border bg-muted"
            } ${isPlayer2Expired ? "border-red-500 bg-red-500/10" : ""} ${isPlayer2Warning ? "border-yellow-500" : ""}`}
          >
            <div className="text-[10px] text-muted-foreground mb-1 truncate">{player2Name}</div>
            <div
              className={`text-xl font-mono font-bold ${activePlayer === 2 ? "text-blue-500" : ""} ${isPlayer2Expired ? "text-red-500" : ""} ${isPlayer2Warning ? "text-yellow-500" : ""}`}
            >
              {formatTime(player2Time)}
            </div>
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={togglePause}
            className="flex-1 h-8 text-xs bg-transparent"
            disabled={isPlayer1Expired || isPlayer2Expired}
          >
            {activePlayer === null ? (
              <>
                <Play className="w-3 h-3 mr-1" />
                Start
              </>
            ) : isPaused ? (
              <>
                <Play className="w-3 h-3 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={handleResetClick} className="h-8 px-3 bg-transparent">
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="!fixed !inset-0 !top-0 !left-0 !right-0 !bottom-0 !translate-x-0 !translate-y-0 !transform-none max-w-none w-full h-full p-0 m-0 border-0 rounded-none [&>button]:hidden overflow-hidden">
          <div className="flex flex-col h-full w-full bg-background">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0 bg-background z-50">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium">Chess Clock</span>
                <span className="text-sm text-muted-foreground">{mode === "down" ? "Countdown" : "Count Up"}</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsFullscreen(false)}
                className="h-12 w-12 shrink-0 hover:bg-accent"
                aria-label="Close fullscreen"
              >
                <X className="w-7 h-7" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col landscape:flex-row p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden min-h-0">
              {/* Player 1 Clock - full width on mobile, half width on landscape */}
              <div className="flex-1 relative overflow-hidden min-h-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPlayer1Rotated(!isPlayer1Rotated)
                  }}
                  className="absolute top-2 right-2 z-10 p-2 sm:p-3 rounded-lg bg-background/80 backdrop-blur-sm border border-border hover:bg-accent transition-colors"
                  aria-label="Rotate Player 1 clock"
                >
                  <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button
                  onClick={switchPlayer}
                  disabled={activePlayer === null || isPaused}
                  className={`w-full h-full rounded-2xl border-4 p-4 transition-all flex flex-col items-center justify-center ${
                    activePlayer === 1
                      ? "border-orange-500 bg-orange-500/10"
                      : activePlayer === 2
                        ? "border-border bg-muted opacity-50"
                        : "border-border bg-muted"
                  } ${isPlayer1Expired ? "border-red-500 bg-red-500/10" : ""} ${isPlayer1Warning ? "border-yellow-500" : ""}`}
                >
                  <div
                    className="flex flex-col items-center justify-center transition-transform duration-300"
                    style={{ transform: isPlayer1Rotated ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <div className="text-base sm:text-lg text-muted-foreground mb-2 sm:mb-4 truncate w-full text-center">
                      {player1Name}
                    </div>
                    <div
                      className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-mono font-bold tabular-nums leading-none ${activePlayer === 1 ? "text-orange-500" : ""} ${isPlayer1Expired ? "text-red-500" : ""} ${isPlayer1Warning ? "text-yellow-500" : ""}`}
                    >
                      {formatTime(player1Time)}
                    </div>
                  </div>
                </button>
              </div>

              {/* Player 2 Clock - full width on mobile, half width on landscape */}
              <button
                onClick={switchPlayer}
                disabled={activePlayer === null || isPaused}
                className={`flex-1 rounded-2xl border-4 p-4 transition-all flex flex-col items-center justify-center overflow-hidden min-h-0 ${
                  activePlayer === 2
                    ? "border-blue-500 bg-blue-500/10"
                    : activePlayer === 1
                      ? "border-border bg-muted opacity-50"
                      : "border-border bg-muted"
                } ${isPlayer2Expired ? "border-red-500 bg-red-500/10" : ""} ${isPlayer2Warning ? "border-yellow-500" : ""}`}
              >
                <div className="text-base sm:text-lg text-muted-foreground mb-2 sm:mb-4 truncate w-full text-center">
                  {player2Name}
                </div>
                <div
                  className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-mono font-bold tabular-nums leading-none ${activePlayer === 2 ? "text-blue-500" : ""} ${isPlayer2Expired ? "text-red-500" : ""} ${isPlayer2Warning ? "text-yellow-500" : ""}`}
                >
                  {formatTime(player2Time)}
                </div>
              </button>
            </div>

            <div className="flex gap-2 sm:gap-4 px-2 sm:px-4 py-3 sm:py-4 shrink-0 bg-background">
              <Button
                size="lg"
                variant="outline"
                onClick={togglePause}
                className="flex-1 h-14 sm:h-16 md:h-20 text-base sm:text-lg md:text-xl bg-transparent"
                disabled={isPlayer1Expired || isPlayer2Expired}
              >
                {activePlayer === null ? (
                  <>
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-2" />
                    Start
                  </>
                ) : isPaused ? (
                  <>
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleResetClick}
                className="h-14 sm:h-16 md:h-20 px-6 sm:px-8 md:px-10 bg-transparent"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Timer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the chess clock? This will reset both players' timers to their initial
              values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelReset}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
