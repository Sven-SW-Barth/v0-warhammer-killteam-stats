"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Shield, Lock, RefreshCw, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AdminReportsTables } from "@/components/admin-reports-tables"
import { createClient } from "@/lib/supabase/client"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [recalculationMessage, setRecalculationMessage] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [deletionReports, setDeletionReports] = useState<any[]>([])
  const [bugReports, setBugReports] = useState<any[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const [eloNeedsRecalc, setEloNeedsRecalc] = useState(false)
  const [serviceAlertEnabled, setServiceAlertEnabled] = useState(false)
  const [serviceAlertSeverity, setServiceAlertSeverity] = useState<"low" | "medium" | "high">("low")
  const [isSavingAlert, setIsSavingAlert] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("admin_authenticated") === "true"
      setIsAuthenticated(isAuth)
      if (isAuth) {
        loadReports()
        loadEloStatus()
        loadServiceAlertStatus()
      }
    }
  }, [])

  const loadEloStatus = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "elo_needs_recalc")
        .single()
      
      setEloNeedsRecalc(data?.value === "true")
    } catch (error) {
      console.error("[v0] Error loading ELO status:", error)
    }
  }

  const loadServiceAlertStatus = async () => {
    try {
      const supabase = createClient()
      const { data: enabledData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "service_alert_enabled")
        .single()
      
      const { data: severityData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "service_alert_severity")
        .single()
      
      setServiceAlertEnabled(enabledData?.value === "true")
      if (severityData?.value) {
        setServiceAlertSeverity(severityData.value as "low" | "medium" | "high")
      }
    } catch (error) {
      console.error("[v0] Error loading service alert status:", error)
    }
  }

  const handleServiceAlertChange = async (enabled: boolean, severity: "low" | "medium" | "high") => {
    setIsSavingAlert(true)
    try {
      const supabase = createClient()
      
      await supabase
        .from("system_settings")
        .update({ value: enabled ? "true" : "false", updated_at: new Date().toISOString() })
        .eq("key", "service_alert_enabled")
      
      await supabase
        .from("system_settings")
        .update({ value: severity, updated_at: new Date().toISOString() })
        .eq("key", "service_alert_severity")
      
      setServiceAlertEnabled(enabled)
      setServiceAlertSeverity(severity)
    } catch (error) {
      console.error("[v0] Error saving service alert:", error)
    } finally {
      setIsSavingAlert(false)
    }
  }

  const loadReports = async () => {
    setIsLoadingReports(true)
    try {
      const supabase = createClient()

      const { data: deletions, error: deletionError } = await supabase
        .from("deletion_reports")
        .select(`
          *,
          game:games(
            player1:players!games_player1_id_fkey(playertag),
            player2:players!games_player2_id_fkey(playertag)
          )
        `)
        .order("created_at", { ascending: false })

      if (deletionError) {
        console.error("[v0] Error loading deletion reports:", deletionError)
      }

      const { data: bugs, error: bugError } = await supabase
        .from("bug_reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (bugError) {
        console.error("[v0] Error loading bug reports:", bugError)
      }

      setDeletionReports(deletions || [])
      setBugReports(bugs || [])
    } catch (error) {
      console.error("[v0] Error loading reports:", error)
    } finally {
      setIsLoadingReports(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        if (typeof window !== "undefined") {
          sessionStorage.setItem("admin_authenticated", "true")
        }
        loadReports()
        loadEloStatus()
        loadServiceAlertStatus()
      } else {
        setError("Invalid password")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_authenticated")
    }
    setPassword("")
  }

  const handleRecalculateElo = async () => {
    setIsRecalculating(true)
    setRecalculationMessage(null)

    try {
      const response = await fetch("/api/admin/recalculate-elo", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setRecalculationMessage({
          type: "success",
          message: `ELO ratings recalculated successfully! Processed ${data.gamesProcessed} games. ${data.gamesSkipped > 0 ? `Skipped ${data.gamesSkipped} games (Anonymous players).` : ""}`,
        })
        setEloNeedsRecalc(false)
      } else {
        setRecalculationMessage({
          type: "error",
          message: data.error || "Failed to recalculate ELO ratings",
        })
      }
    } catch (err) {
      setRecalculationMessage({
        type: "error",
        message: "An error occurred while recalculating ELO ratings",
      })
    } finally {
      setIsRecalculating(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full max-w-md p-8">
            <div className="mb-6 flex flex-col items-center gap-2">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Admin Access</h1>
              <p className="text-center text-sm text-muted-foreground">Enter the admin password to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Access Admin Panel"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your Warhammer Killteam application</p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Service Alert Banner
            </h2>
            <p className="text-sm text-muted-foreground">Display a service alert banner to all users</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="service-alert-toggle" className="text-base font-medium">
                  Enable Service Alert
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show a banner at the top of all pages
                </p>
              </div>
              <Switch
                id="service-alert-toggle"
                checked={serviceAlertEnabled}
                onCheckedChange={(checked) => handleServiceAlertChange(checked, serviceAlertSeverity)}
                disabled={isSavingAlert}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity-select">Alert Severity</Label>
              <Select
                value={serviceAlertSeverity}
                onValueChange={(value: "low" | "medium" | "high") => handleServiceAlertChange(serviceAlertEnabled, value)}
                disabled={isSavingAlert}
              >
                <SelectTrigger id="severity-select">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      Low - Minor issue, quick fix expected
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-500" />
                      Medium - Working on a fix
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      High - Major issue, may take time to resolve
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-medium">Banner Preview</h3>
              {serviceAlertEnabled ? (
                <div className={`rounded-md p-3 text-sm ${
                  serviceAlertSeverity === "low" 
                    ? "bg-yellow-500/20 text-yellow-200 border border-yellow-500/30" 
                    : serviceAlertSeverity === "medium"
                    ? "bg-orange-500/20 text-orange-200 border border-orange-500/30"
                    : "bg-red-500/20 text-red-200 border border-red-500/30"
                }`}>
                  {serviceAlertSeverity === "low" && (
                    <>Service Alert: We are aware of an issue affecting <strong>KT Open Play</strong> and are working on a fix. Thanks for your patience, it will be up and running in no time!</>
                  )}
                  {serviceAlertSeverity === "medium" && (
                    <>Service Alert: We are aware of an issue affecting <strong>KT Open Play</strong> and are actively working on a fix. Thanks for your patience!</>
                  )}
                  {serviceAlertSeverity === "high" && (
                    <>Service Alert: We are aware of a significant issue affecting <strong>KT Open Play</strong>. Our team is working hard to resolve this, but it may take some time. We appreciate your patience and understanding.</>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Banner is currently disabled</p>
              )}
            </div>
          </div>
        </Card>

        {isLoadingReports ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Loading reports...</p>
          </Card>
        ) : (
          <AdminReportsTables deletionReports={deletionReports} bugReports={bugReports} onReportsChange={loadReports} />
        )}

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">ELO Rating System</h2>
            <p className="text-sm text-muted-foreground">Recalculate all player ELO ratings based on game history</p>
          </div>

          <div className="space-y-4">
            {eloNeedsRecalc && (
              <Alert variant="destructive" className="border-amber-500 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-500">
                  <strong>ELO Recalculation Required:</strong> Games have been deleted or historical games have been added. 
                  ELO ratings may be inaccurate until a full recalculation is performed.
                </AlertDescription>
              </Alert>
            )}

            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-medium">What does this do?</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Resets all player ELO ratings to 1200 (starting value)</li>
                <li>• Processes all games in chronological order</li>
                <li>• Calculates ELO changes using standard ELO formula</li>
                <li>• Excludes games against Anonymous players from ELO calculations</li>
                <li>• Updates player ratings and game records</li>
                <li>• Uses adaptive K-factor based on games played</li>
              </ul>
            </div>

            {recalculationMessage && (
              <Alert variant={recalculationMessage.type === "error" ? "destructive" : "default"}>
                {recalculationMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{recalculationMessage.message}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleRecalculateElo} disabled={isRecalculating} className="w-full" size="lg">
              {isRecalculating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Recalculating ELO Ratings...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recalculate All ELO Ratings
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
