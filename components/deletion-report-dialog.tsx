"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitDeletionReport } from "@/app/actions"
import { toast } from "sonner"

type Game = {
  id: string
  player1: { playertag: string } | null
  player2: { playertag: string } | null
}

const DELETION_REASONS = [
  "Duplicate Entry",
  "Wrong Data Entered",
  "Test Entry",
  "Player Request",
  "Invalid Game",
  "Other",
]

export function DeletionReportDialog({
  game,
  open,
  onOpenChange,
}: {
  game: Game
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [reporterName, setReporterName] = useState("")
  const [reason, setReason] = useState("")
  const [explanation, setExplanation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await submitDeletionReport({
        gameId: Number.parseInt(game.id),
        reporterName,
        reason,
        explanation,
      })

      if (result.success) {
        toast.success("Deletion report submitted successfully")
        onOpenChange(false)
        // Reset form
        setReporterName("")
        setReason("")
        setExplanation("")
      } else {
        toast.error(result.error || "Failed to submit deletion report")
      }
    } catch (error) {
      toast.error("An error occurred while submitting the report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Game for Deletion</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Game Details:</p>
            <p className="text-muted-foreground">
              {game.player1?.playertag || "Unknown"} vs {game.player2?.playertag || "Unknown"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporter-name">Reporter Name *</Label>
            <Input
              id="reporter-name"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DELETION_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explain Reasoning</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Provide additional details..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !reporterName || !reason}>
              {isSubmitting ? "Submitting..." : "Send Deletion Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
