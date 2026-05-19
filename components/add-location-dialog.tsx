"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface AddLocationDialogProps {
  children: React.ReactNode
}

export function AddLocationDialog({ children }: AddLocationDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  // Mandatory fields
  const [locationName, setLocationName] = useState("")
  const [city, setCity] = useState("")
  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")

  // Optional fields
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [discordHandle, setDiscordHandle] = useState("")
  const [freeText, setFreeText] = useState("")

  const resetForm = () => {
    setLocationName("")
    setCity("")
    setStreet("")
    setNumber("")
    setContactName("")
    setContactEmail("")
    setContactPhone("")
    setDiscordHandle("")
    setFreeText("")
    setSubmitStatus("idle")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!locationName || !city || !street || !number) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const supabase = createClient()

      // Insert into a location_requests table for admin review
      const { error } = await supabase.from("location_requests").insert({
        location_name: locationName,
        city,
        street,
        street_number: number,
        contact_name: contactName || null,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        discord_handle: discordHandle || null,
        message: freeText || null,
        status: "pending",
      })

      if (error) {
        console.error("Error submitting location request:", error)
        setSubmitStatus("error")
      } else {
        setSubmitStatus("success")
        setTimeout(() => {
          setOpen(false)
          resetForm()
        }, 2000)
      }
    } catch {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) resetForm()
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a Location</DialogTitle>
          <DialogDescription>
            Submit a gaming store or club to be added to our directory. We&apos;ll review your submission and add it soon.
          </DialogDescription>
        </DialogHeader>

        {submitStatus === "success" ? (
          <div className="py-8 text-center">
            <p className="text-lg font-medium text-green-600">Thank you for your submission!</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll review the location and add it to the directory soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Details (Mandatory) */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Location Details <span className="text-destructive">*</span></h4>
              
              <div className="space-y-2">
                <Label htmlFor="locationName">Name of Location <span className="text-destructive">*</span></Label>
                <Input
                  id="locationName"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g., Funtainment Berlin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Berlin"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Street <span className="text-destructive">*</span></Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g., Frankfurter Allee"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Number <span className="text-destructive">*</span></Label>
                  <Input
                    id="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="e.g., 79"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Details (Optional) */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Your Contact Details <span className="text-xs text-muted-foreground">(optional)</span></h4>
              
              <div className="space-y-2">
                <Label htmlFor="contactName">Your Name</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discordHandle">Discord Handle</Label>
                <Input
                  id="discordHandle"
                  value={discordHandle}
                  onChange={(e) => setDiscordHandle(e.target.value)}
                  placeholder="username#1234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="freeText">Additional Information</Label>
                <Textarea
                  id="freeText"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Any additional details about the location, opening hours, events, etc."
                  rows={4}
                />
              </div>
            </div>

            {submitStatus === "error" && (
              <p className="text-sm text-destructive">
                Something went wrong. Please try again later.
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !locationName || !city || !street || !number}>
                {isSubmitting ? "Submitting..." : "Submit Location"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
