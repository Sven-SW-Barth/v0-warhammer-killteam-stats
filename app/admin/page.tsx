"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Shield, Lock, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("admin_authenticated") === "true"
      setIsAuthenticated(isAuth)
    }
  }, [])

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
          message: `ELO ratings recalculated successfully! Processed ${data.gamesProcessed} games.`,
        })
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
            <h2 className="text-xl font-semibold">ELO Rating System</h2>
            <p className="text-sm text-muted-foreground">Recalculate all player ELO ratings based on game history</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-medium">What does this do?</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Resets all player ELO ratings to 1200 (starting value)</li>
                <li>• Processes all games in chronological order</li>
                <li>• Calculates ELO changes using standard ELO formula</li>
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
