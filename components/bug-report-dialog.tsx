"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bug } from "lucide-react"
import { toast } from "sonner"
import { submitBugReport } from "@/app/actions"

export function BugReportDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    reporterName: "",
    reporterEmail: "",
    title: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Capture browser info
      const browserInfo = typeof window !== "undefined" ? navigator.userAgent : ""
      const pageUrl = typeof window !== "undefined" ? window.location.href : ""

      const result = await submitBugReport({
        ...formData,
        pageUrl,
        browserInfo,
      })

      if (result.success) {
        toast.success("Bug report submitted successfully! Thank you for your feedback.")
        setFormData({
          reporterName: "",
          reporterEmail: "",
          title: "",
          description: "",
        })
        setOpen(false)
      } else {
        toast.error(result.error || "Failed to submit bug report")
      }
    } catch (error) {
      toast.error("An error occurred while submitting the bug report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Bug className="h-4 w-4" />
          Report a Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>
          <DialogDescription>
            Found something that's not working correctly? Let us know and we'll fix it as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reporterName">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reporterName"
              value={formData.reporterName}
              onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporterEmail">Email (optional)</Label>
            <Input
              id="reporterEmail"
              type="email"
              value={formData.reporterEmail}
              onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
              placeholder="john@example.com"
            />
            <p className="text-xs text-muted-foreground">We'll only use this to follow up if needed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Bug Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please describe what happened, what you expected to happen, and steps to reproduce the issue..."
              rows={5}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Bug Report"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
