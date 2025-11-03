"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitEditReport } from "@/app/actions"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlayerSearchCombobox } from "@/components/player-search-combobox"
import { createClient } from "@/lib/supabase/client"

type Game = {
  id: string
  map_layout: string | null
  created_at: string
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

  const [player1Id, setPlayer1Id] = useState<number | null>(game.player1?.id || null)
  const [player2Id, setPlayer2Id] = useState<number | null>(game.player2?.id || null)
  const [gameDate, setGameDate] = useState(game.created_at.split("T")[0])
  const [critopId, setCritopId] = useState<number | null>(game.critop?.id || null)
  const [killzoneId, setKillzoneId] = useState<number | null>(game.killzone?.id || null)
  const [mapLayout, setMapLayout] = useState(game.map_layout || "")

  const [players, setPlayers] = useState<Array<{ id: number; playertag: string }>>([])
  const [critops, setCritops] = useState<Array<{ id: number; name: string }>>([])
  const [killzones, setKillzones] = useState<Array<{ id: number; name: string }>>([])

  // Player scores
  const [p1TacOpScore, setP1TacOpScore] = useState(game.player1_tacop_score)
  const [p1CritOpScore, setP1CritOpScore] = useState(game.player1_critop_score)
  const [p1KillOpScore, setP1KillOpScore] = useState(game.player1_killop_score)
  const [p1PrimaryOpScore, setP1PrimaryOpScore] = useState(game.player1_primary_op_score || 0)

  const [p2TacOpScore, setP2TacOpScore] = useState(game.player2_tacop_score)
  const [p2CritOpScore, setP2CritOpScore] = useState(game.player2_critop_score)
  const [p2KillOpScore, setP2KillOpScore] = useState(game.player2_killop_score)
  const [p2PrimaryOpScore, setP2PrimaryOpScore] = useState(game.player2_primary_op_score || 0)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [playersRes, critopsRes, killzonesRes] = await Promise.all([
        supabase.from("players").select("id, playertag").order("playertag"),
        supabase.from("critops").select("id, name").order("name"),
        supabase.from("killzones").select("id, name").order("name"),
      ])

      if (playersRes.data) setPlayers(playersRes.data)
      if (critopsRes.data) setCritops(critopsRes.data)
      if (killzonesRes.data) setKillzones(killzonesRes.data)
    }

    fetchData()
  }, [])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPlayer1Id(game.player1?.id || null)
      setPlayer2Id(game.player2?.id || null)
      setGameDate(game.created_at.split("T")[0])
      setCritopId(game.critop?.id || null)
      setKillzoneId(game.killzone?.id || null)
      setMapLayout(game.map_layout || "")
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
      console.log("[v0] Edit report form data:", {
        player1Id,
        player2Id,
        gameDate,
        critopId,
        killzoneId,
        mapLayout,
      })

      const proposedChanges: Record<string, any> = {
        player1_tacop_score: p1TacOpScore,
        player1_critop_score: p1CritOpScore,
        player1_killop_score: p1KillOpScore,
        player1_primary_op_score: p1PrimaryOpScore,
        player2_tacop_score: p2TacOpScore,
        player2_critop_score: p2CritOpScore,
        player2_killop_score: p2KillOpScore,
        player2_primary_op_score: p2PrimaryOpScore,
      }

      // Add new fields if they changed
      if (player1Id !== game.player1?.id) proposedChanges.player1_id = player1Id
      if (player2Id !== game.player2?.id) proposedChanges.player2_id = player2Id
      if (gameDate !== game.created_at.split("T")[0]) proposedChanges.created_at = gameDate
      if (critopId !== game.critop?.id) proposedChanges.critop_id = critopId
      if (killzoneId !== game.killzone?.id) proposedChanges.killzone_id = killzoneId
      if (mapLayout !== game.map_layout) proposedChanges.map_layout = mapLayout

      console.log("[v0] Proposed changes:", proposedChanges)

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
      console.error("[v0] Error submitting edit report:", error)
      toast.error("An error occurred while submitting the report")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPlayer1 = players.find((p) => p.id === player1Id)
  const selectedPlayer2 = players.find((p) => p.id === player2Id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
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

            <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
              <h3 className="font-semibold">Game Details</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="game-date">Date</Label>
                  <Input id="game-date" type="date" value={gameDate} onChange={(e) => setGameDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="map-layout">Map Layout</Label>
                  <Select value={mapLayout} onValueChange={setMapLayout}>
                    <SelectTrigger id="map-layout">
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="critop">Critical Operation</Label>
                  <Select value={critopId?.toString() || ""} onValueChange={(v) => setCritopId(Number(v))}>
                    <SelectTrigger id="critop">
                      <SelectValue placeholder="Select CritOp" />
                    </SelectTrigger>
                    <SelectContent>
                      {critops.map((critop) => (
                        <SelectItem key={critop.id} value={critop.id.toString()}>
                          {critop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="killzone">Killzone (Map)</Label>
                  <Select value={killzoneId?.toString() || ""} onValueChange={(v) => setKillzoneId(Number(v))}>
                    <SelectTrigger id="killzone">
                      <SelectValue placeholder="Select killzone" />
                    </SelectTrigger>
                    <SelectContent>
                      {killzones.map((killzone) => (
                        <SelectItem key={killzone.id} value={killzone.id.toString()}>
                          {killzone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Player 1 Section */}
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label>Player 1</Label>
                  <PlayerSearchCombobox
                    value={player1Id?.toString() || ""}
                    onValueChange={(value) => {
                      console.log("[v0] Player 1 value changed:", value)
                      setPlayer1Id(value ? Number(value) : null)
                    }}
                    placeholder="Select player 1"
                    name="player1"
                    allowCreate={true}
                  />
                </div>

                <h3 className="font-semibold">
                  {selectedPlayer1?.playertag || "Player 1"} - {game.player1_killteam?.name || "Unknown"}
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

              {/* Player 2 Section */}
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label>Player 2</Label>
                  <PlayerSearchCombobox
                    value={player2Id?.toString() || ""}
                    onValueChange={(value) => {
                      console.log("[v0] Player 2 value changed:", value)
                      setPlayer2Id(value ? Number(value) : null)
                    }}
                    placeholder="Select player 2"
                    name="player2"
                    allowCreate={true}
                  />
                </div>

                <h3 className="font-semibold">
                  {selectedPlayer2?.playertag || "Player 2"} - {game.player2_killteam?.name || "Unknown"}
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
