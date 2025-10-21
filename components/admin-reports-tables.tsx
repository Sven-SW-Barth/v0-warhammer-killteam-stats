"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Check, X, Eye } from "lucide-react"
import { approveDeletionReport, rejectDeletionReport, approveEditReport, rejectEditReport } from "@/app/actions"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type DeletionReport = {
  id: number
  game_id: number
  reporter_name: string
  reason: string
  explanation: string | null
  status: string
  created_at: string
  game: {
    player1: { playertag: string } | null
    player2: { playertag: string } | null
  } | null
}

type EditReport = {
  id: number
  game_id: number
  reporter_name: string
  proposed_changes: Record<string, number>
  status: string
  created_at: string
  game: {
    player1: { playertag: string } | null
    player2: { playertag: string } | null
  } | null
}

export function AdminReportsTables({
  deletionReports,
  editReports,
  onReportsChange,
}: {
  deletionReports: DeletionReport[]
  editReports: EditReport[]
  onReportsChange?: () => void
}) {
  const [selectedDeletion, setSelectedDeletion] = useState<DeletionReport | null>(null)
  const [selectedEdit, setSelectedEdit] = useState<EditReport | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApproveDeletion = async (reportId: number) => {
    setIsProcessing(true)
    try {
      console.log("[v0] Approving deletion report:", reportId)
      const result = await approveDeletionReport(reportId)
      console.log("[v0] Deletion approval result:", result)

      if (result.success) {
        toast.success("Deletion report approved and game deleted")
        setSelectedDeletion(null)
        if (onReportsChange) {
          onReportsChange()
        }
      } else {
        toast.error(result.error || "Failed to approve deletion")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectDeletion = async (reportId: number) => {
    setIsProcessing(true)
    try {
      console.log("[v0] Rejecting deletion report:", reportId)
      const result = await rejectDeletionReport(reportId)
      console.log("[v0] Deletion rejection result:", result)

      if (result.success) {
        toast.success("Deletion report rejected")
        setSelectedDeletion(null)
        if (onReportsChange) {
          onReportsChange()
        }
      } else {
        toast.error(result.error || "Failed to reject deletion")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApproveEdit = async (reportId: number) => {
    setIsProcessing(true)
    try {
      console.log("[v0] Approving edit report:", reportId)
      const result = await approveEditReport(reportId)
      console.log("[v0] Edit approval result:", result)

      if (result.success) {
        toast.success("Edit report approved and game updated")
        setSelectedEdit(null)
        if (onReportsChange) {
          onReportsChange()
        }
      } else {
        toast.error(result.error || "Failed to approve edit")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectEdit = async (reportId: number) => {
    setIsProcessing(true)
    try {
      console.log("[v0] Rejecting edit report:", reportId)
      const result = await rejectEditReport(reportId)
      console.log("[v0] Edit rejection result:", result)

      if (result.success) {
        toast.success("Edit report rejected")
        setSelectedEdit(null)
        if (onReportsChange) {
          onReportsChange()
        }
      } else {
        toast.error(result.error || "Failed to reject edit")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const pendingDeletions = deletionReports.filter((r) => r.status === "pending")
  const pendingEdits = editReports.filter((r) => r.status === "pending")

  return (
    <div className="space-y-6">
      {/* Deletion Reports */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Deletion Reports</h2>
          <p className="text-sm text-muted-foreground">
            {pendingDeletions.length} pending report{pendingDeletions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {pendingDeletions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending deletion reports</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDeletions.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.game?.player1?.playertag || "Unknown"} vs {report.game?.player2?.playertag || "Unknown"}
                    </TableCell>
                    <TableCell>{report.reporter_name}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{format(new Date(report.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{report.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedDeletion(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApproveDeletion(report.id)}
                          disabled={isProcessing}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRejectDeletion(report.id)}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Edit Reports */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Edit Reports</h2>
          <p className="text-sm text-muted-foreground">
            {pendingEdits.length} pending report{pendingEdits.length !== 1 ? "s" : ""}
          </p>
        </div>

        {pendingEdits.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending edit reports</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingEdits.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.game?.player1?.playertag || "Unknown"} vs {report.game?.player2?.playertag || "Unknown"}
                    </TableCell>
                    <TableCell>{report.reporter_name}</TableCell>
                    <TableCell>{format(new Date(report.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{report.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedEdit(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApproveEdit(report.id)}
                          disabled={isProcessing}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRejectEdit(report.id)}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Deletion Report Details Dialog */}
      <Dialog open={!!selectedDeletion} onOpenChange={() => setSelectedDeletion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletion Report Details</DialogTitle>
          </DialogHeader>
          {selectedDeletion && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Game:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedDeletion.game?.player1?.playertag || "Unknown"} vs{" "}
                  {selectedDeletion.game?.player2?.playertag || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Reporter:</p>
                <p className="text-sm text-muted-foreground">{selectedDeletion.reporter_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Reason:</p>
                <p className="text-sm text-muted-foreground">{selectedDeletion.reason}</p>
              </div>
              {selectedDeletion.explanation && (
                <div>
                  <p className="text-sm font-medium">Explanation:</p>
                  <p className="text-sm text-muted-foreground">{selectedDeletion.explanation}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleApproveDeletion(selectedDeletion.id)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Approve & Delete Game
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRejectDeletion(selectedDeletion.id)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Report Details Dialog */}
      <Dialog open={!!selectedEdit} onOpenChange={() => setSelectedEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Report Details</DialogTitle>
          </DialogHeader>
          {selectedEdit && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Game:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedEdit.game?.player1?.playertag || "Unknown"} vs{" "}
                  {selectedEdit.game?.player2?.playertag || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Reporter:</p>
                <p className="text-sm text-muted-foreground">{selectedEdit.reporter_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Proposed Changes:</p>
                <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                  {Object.entries(selectedEdit.proposed_changes).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key.replace(/_/g, " ")}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleApproveEdit(selectedEdit.id)} disabled={isProcessing} className="flex-1">
                  Approve & Update Game
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRejectEdit(selectedEdit.id)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
