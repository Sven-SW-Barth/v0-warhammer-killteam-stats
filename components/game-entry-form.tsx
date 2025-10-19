"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { submitGame } from "@/app/actions"
import { useRouter } from "next/navigation"
import { PlayerSearchCombobox } from "@/components/player-search-combobox"
import { CheckCircle2 } from "lucide-react"

type ReferenceData = {
  countries: Array<{ id: number; name: string }>
  killzones: Array<{ id: number; name: string }>
  critops: Array<{ id: number; name: string }>
  tacops: Array<{ id: number; name: string; archetype: string }>
  killteams: Array<{ id: number; name: string }>
}

export function GameEntryForm({ data }: { data: ReferenceData }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [mapLayout, setMapLayout] = useState<string>("")
  const [customMapLayout, setCustomMapLayout] = useState<string>("")

  const [player1Scores, setPlayer1Scores] = useState({ tacop: 0, critop: 0, killop: 0 })
  const [player1ScoreErrors, setPlayer1ScoreErrors] = useState({ tacop: false, critop: false, killop: false })
  const [player1PrimaryOp, setPlayer1PrimaryOp] = useState<string>("")
  const [player1Id, setPlayer1Id] = useState<string>("")

  const [player2Scores, setPlayer2Scores] = useState({ tacop: 0, critop: 0, killop: 0 })
  const [player2ScoreErrors, setPlayer2ScoreErrors] = useState({ tacop: false, critop: false, killop: false })
  const [player2PrimaryOp, setPlayer2PrimaryOp] = useState<string>("")
  const [player2Id, setPlayer2Id] = useState<string>("")

  const [isAnonymousOpponent, setIsAnonymousOpponent] = useState(false)

  const [formFields, setFormFields] = useState({
    country: false,
    killzone: false,
    critop: false,
    player1_name: false,
    player1_killteam: false,
    player1_tacop: false,
    player1_primary_op: false,
    player1_tacop_score: false,
    player1_critop_score: false,
    player1_killop_score: false,
    player2_name: false,
    player2_killteam: false,
    player2_tacop: false,
    player2_primary_op: false,
    player2_tacop_score: false,
    player2_critop_score: false,
    player2_killop_score: false,
  })

  const validateScore = (value: string): boolean => {
    const num = Number(value)
    return !isNaN(num) && num >= 0 && num <= 6 && value !== ""
  }

  const isFormValid =
    Object.values(formFields).every(Boolean) &&
    !player1ScoreErrors.tacop &&
    !player1ScoreErrors.critop &&
    !player1ScoreErrors.killop &&
    !player2ScoreErrors.tacop &&
    !player2ScoreErrors.critop &&
    !player2ScoreErrors.killop

  const calculatePrimaryOpScore = (primaryOp: string, scores: { tacop: number; critop: number; killop: number }) => {
    if (primaryOp === "TacOp") return Math.ceil(scores.tacop / 2)
    if (primaryOp === "CritOp") return Math.ceil(scores.critop / 2)
    if (primaryOp === "KillOp") return Math.ceil(scores.killop / 2)
    return 0
  }

  const player1PrimaryScore = calculatePrimaryOpScore(player1PrimaryOp, player1Scores)
  const player2PrimaryScore = calculatePrimaryOpScore(player2PrimaryOp, player2Scores)

  const player1Total = player1Scores.tacop + player1Scores.critop + player1Scores.killop + player1PrimaryScore
  const player2Total = player2Scores.tacop + player2Scores.critop + player2Scores.killop + player2PrimaryScore

  const getVPBoxStyle = (playerTotal: number, opponentTotal: number) => {
    if (playerTotal > opponentTotal) {
      return "bg-green-500/20 border-2 border-green-500/50"
    } else if (playerTotal < opponentTotal) {
      return "bg-red-500/20 border-2 border-red-500/50"
    } else {
      return "bg-muted/50 border-2 border-muted-foreground/30"
    }
  }

  const getVPTextStyle = (playerTotal: number, opponentTotal: number) => {
    if (playerTotal > opponentTotal) {
      return "text-green-500"
    } else if (playerTotal < opponentTotal) {
      return "text-red-500"
    } else {
      return "text-muted-foreground"
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)

    const finalMapLayout = mapLayout === "custom" ? customMapLayout : mapLayout
    formData.set("map_layout", finalMapLayout)

    formData.set("player1_primary_op_score", player1PrimaryScore.toString())
    formData.set("player2_primary_op_score", player2PrimaryScore.toString())

    if (isAnonymousOpponent) {
      formData.set("is_anonymous_opponent", "true")
    }

    try {
      const result = await submitGame(formData)

      if (result.success) {
        setSuccess(true)
        setShowSuccessScreen(true)
        e.currentTarget.reset()
        setMapLayout("")
        setCustomMapLayout("")
        setPlayer1Id("")
        setPlayer1Scores({ tacop: 0, critop: 0, killop: 0 })
        setPlayer1ScoreErrors({ tacop: false, critop: false, killop: false })
        setPlayer1PrimaryOp("")
        setPlayer2Id("")
        setPlayer2Scores({ tacop: 0, critop: 0, killop: 0 })
        setPlayer2ScoreErrors({ tacop: false, critop: false, killop: false })
        setPlayer2PrimaryOp("")
        setIsAnonymousOpponent(false)
        setFormFields({
          country: false,
          killzone: false,
          critop: false,
          player1_name: false,
          player1_killteam: false,
          player1_tacop: false,
          player1_primary_op: false,
          player1_tacop_score: false,
          player1_critop_score: false,
          player1_killop_score: false,
          player2_name: false,
          player2_killteam: false,
          player2_tacop: false,
          player2_primary_op: false,
          player2_tacop_score: false,
          player2_critop_score: false,
          player2_killop_score: false,
        })
        router.refresh()
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      console.error("[v0] Unexpected error during form submission:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAnother = () => {
    setShowSuccessScreen(false)
    setSuccess(false)
    setError(null)
  }

  if (showSuccessScreen) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-foreground">Game Recorded Successfully!</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Your Kill Team battle has been added to the global statistics.
          </p>
          <div className="flex gap-4">
            <Button onClick={handleSubmitAnother} size="lg">
              Submit Another Game
            </Button>
            <Button onClick={() => router.push("/matchlog")} variant="outline" size="lg">
              View Matchlog
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">Record a Game</CardTitle>
        <CardDescription>Enter the details of your Kill Team battle</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Details Section */}
          <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
            <h3 className="text-lg font-semibold text-foreground">Game Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  name="country"
                  required
                  onValueChange={(value) => setFormFields((prev) => ({ ...prev, country: !!value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.countries.map((country) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="killzone">Killzone</Label>
                <Select
                  name="killzone"
                  required
                  onValueChange={(value) => setFormFields((prev) => ({ ...prev, killzone: !!value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select killzone" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.killzones.map((killzone) => (
                      <SelectItem key={killzone.id} value={killzone.id.toString()}>
                        {killzone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="map_layout_select">
                  Map Layout <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Select value={mapLayout} onValueChange={setMapLayout}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select map layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {mapLayout === "custom" && (
                  <Input
                    placeholder="Enter custom map layout"
                    value={customMapLayout}
                    onChange={(e) => setCustomMapLayout(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="critop">Critical Operation</Label>
                <Select
                  name="critop"
                  required
                  onValueChange={(value) => setFormFields((prev) => ({ ...prev, critop: !!value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CritOp" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.critops.map((critop) => (
                      <SelectItem key={critop.id} value={critop.id.toString()}>
                        {critop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* VS illustration between player sections */}
          <div className="relative grid gap-6 lg:grid-cols-2">
            <div className="pointer-events-none absolute left-1/2 bottom-6 z-10 hidden -translate-x-1/2 lg:flex">
              <div className="relative flex items-center justify-center">
                {/* Left line */}
                <div className="absolute right-full mr-4 h-1 w-32 bg-gradient-to-r from-transparent to-primary/50" />

                {/* VS Badge */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-black via-primary/50 to-primary blur-sm" />
                  <div className="relative rounded-lg border-2 border-primary/50 bg-gradient-to-br from-black via-primary/30 to-primary px-6 py-3">
                    <span className="text-4xl font-black tracking-wider text-white drop-shadow-[0_2px_8px_rgba(201,106,58,0.5)]">
                      VS
                    </span>
                  </div>
                </div>

                {/* Right line */}
                <div className="absolute left-full ml-4 h-1 w-32 bg-gradient-to-l from-transparent to-primary/50" />
              </div>
            </div>

            {/* Player 1 Column */}
            <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
              <h3 className="text-lg font-semibold text-foreground">Player 1</h3>

              {/* Player 1 Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="player1_id">Player</Label>
                  <PlayerSearchCombobox
                    value={player1Id}
                    onValueChange={(value) => {
                      setPlayer1Id(value)
                      setFormFields((prev) => ({ ...prev, player1_name: !!value }))
                    }}
                    placeholder="Search by name or ID (#123)"
                    name="player1_id"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player1_killteam">Kill Team</Label>
                  <Select
                    name="player1_killteam"
                    required
                    onValueChange={(value) => setFormFields((prev) => ({ ...prev, player1_killteam: !!value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select kill team" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.killteams.map((killteam) => (
                        <SelectItem key={killteam.id} value={killteam.id.toString()}>
                          {killteam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player1_tacop">Selected TacOp</Label>
                  <Select
                    name="player1_tacop"
                    required
                    onValueChange={(value) => setFormFields((prev) => ({ ...prev, player1_tacop: !!value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select TacOp" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.tacops.map((tacop) => (
                        <SelectItem key={tacop.id} value={tacop.id.toString()}>
                          {tacop.name} ({tacop.archetype})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player1_primary_op">Selected Primary Op</Label>
                  <Select
                    name="player1_primary_op"
                    value={player1PrimaryOp}
                    onValueChange={(value) => {
                      setPlayer1PrimaryOp(value)
                      setFormFields((prev) => ({ ...prev, player1_primary_op: !!value }))
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Primary Op" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CritOp">CritOp</SelectItem>
                      <SelectItem value="TacOp">TacOp</SelectItem>
                      <SelectItem value="KillOp">KillOp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Player 1 Scoring */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Label className="text-base font-semibold">Scoring</Label>
                <div className="grid gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="player1_critop_score">CritOp Score (0-6)</Label>
                    <Input
                      id="player1_critop_score"
                      name="player1_critop_score"
                      type="number"
                      min="0"
                      max="6"
                      placeholder="0-6"
                      required
                      className={player1ScoreErrors.critop ? "border-destructive focus-visible:ring-destructive" : ""}
                      onChange={(e) => {
                        const value = e.target.value
                        const isValid = validateScore(value)
                        setPlayer1ScoreErrors((prev) => ({ ...prev, critop: !isValid }))
                        setPlayer1Scores((prev) => ({ ...prev, critop: isValid ? Number(value) : 0 }))
                        setFormFields((prev) => ({ ...prev, player1_critop_score: isValid }))
                      }}
                    />
                    {player1ScoreErrors.critop && (
                      <p className="text-xs text-destructive">Score must be between 0 and 6</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player1_tacop_score">TacOp Score (0-6)</Label>
                    <Input
                      id="player1_tacop_score"
                      name="player1_tacop_score"
                      type="number"
                      min="0"
                      max="6"
                      placeholder="0-6"
                      required
                      className={player1ScoreErrors.tacop ? "border-destructive focus-visible:ring-destructive" : ""}
                      onChange={(e) => {
                        const value = e.target.value
                        const isValid = validateScore(value)
                        setPlayer1ScoreErrors((prev) => ({ ...prev, tacop: !isValid }))
                        setPlayer1Scores((prev) => ({ ...prev, tacop: isValid ? Number(value) : 0 }))
                        setFormFields((prev) => ({ ...prev, player1_tacop_score: isValid }))
                      }}
                    />
                    {player1ScoreErrors.tacop && (
                      <p className="text-xs text-destructive">Score must be between 0 and 6</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player1_killop_score">KillOp Score (0-6)</Label>
                    <Input
                      id="player1_killop_score"
                      name="player1_killop_score"
                      type="number"
                      min="0"
                      max="6"
                      placeholder="0-6"
                      required
                      className={player1ScoreErrors.killop ? "border-destructive focus-visible:ring-destructive" : ""}
                      onChange={(e) => {
                        const value = e.target.value
                        const isValid = validateScore(value)
                        setPlayer1ScoreErrors((prev) => ({ ...prev, killop: !isValid }))
                        setPlayer1Scores((prev) => ({ ...prev, killop: isValid ? Number(value) : 0 }))
                        setFormFields((prev) => ({ ...prev, player1_killop_score: isValid }))
                      }}
                    />
                    {player1ScoreErrors.killop && (
                      <p className="text-xs text-destructive">Score must be between 0 and 6</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>PrimaryOp Score (Auto-calculated)</Label>
                    <div className="flex h-10 items-center rounded-md border border-input bg-background/50 px-3 text-sm">
                      {player1PrimaryScore > 0 ? player1PrimaryScore : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Player 1 Total VP */}
              <div
                className={`rounded-lg p-3 text-center transition-colors ${getVPBoxStyle(player1Total, player2Total)}`}
              >
                <div className="text-sm text-muted-foreground">Total Victory Points</div>
                <div className={`text-3xl font-bold ${getVPTextStyle(player1Total, player2Total)}`}>{player1Total}</div>
              </div>
            </div>

            {/* Player 2 Column */}
            <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
              <h3 className="text-lg font-semibold text-foreground">Player 2</h3>

              {/* Player 2 Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="player2_id">Player</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="anonymous_opponent"
                        checked={isAnonymousOpponent}
                        onChange={(e) => {
                          setIsAnonymousOpponent(e.target.checked)
                          if (e.target.checked) {
                            setPlayer2Id("")
                            setFormFields((prev) => ({ ...prev, player2_name: true }))
                          } else {
                            setFormFields((prev) => ({ ...prev, player2_name: false }))
                          }
                        }}
                        className="h-4 w-4 rounded border-border"
                      />
                      <Label htmlFor="anonymous_opponent" className="text-sm font-normal cursor-pointer">
                        Anonymous opponent
                      </Label>
                    </div>
                  </div>
                  <PlayerSearchCombobox
                    value={player2Id}
                    onValueChange={(value) => {
                      setPlayer2Id(value)
                      setFormFields((prev) => ({ ...prev, player2_name: !!value }))
                    }}
                    placeholder="Search by name or ID (#123)"
                    name="player2_id"
                    required={!isAnonymousOpponent}
                    disabled={isAnonymousOpponent}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player2_killteam">Kill Team</Label>
                  <Select
                    name="player2_killteam"
                    required
                    onValueChange={(value) => setFormFields((prev) => ({ ...prev, player2_killteam: !!value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select kill team" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.killteams.map((killteam) => (
                        <SelectItem key={killteam.id} value={killteam.id.toString()}>
                          {killteam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player2_tacop">Selected TacOp</Label>
                  <Select
                    name="player2_tacop"
                    required
                    onValueChange={(value) => setFormFields((prev) => ({ ...prev, player2_tacop: !!value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select TacOp" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.tacops.map((tacop) => (
                        <SelectItem key={tacop.id} value={tacop.id.toString()}>
                          {tacop.name} ({tacop.archetype})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player2_primary_op">Selected Primary Op</Label>
                  <Select
                    name="player2_primary_op"
                    value={player2PrimaryOp}
                    onValueChange={(value) => {
                      setPlayer2PrimaryOp(value)
                      setFormFields((prev) => ({ ...prev, player2_primary_op: !!value }))
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Primary Op" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CritOp">CritOp</SelectItem>
                      <SelectItem value="TacOp">TacOp</SelectItem>
                      <SelectItem value="KillOp">KillOp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Player 2 Scoring */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Label className="text-base font-semibold">Scoring</Label>
                <div className="grid gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="player2_critop_score">CritOp Score (0-6)</Label>
                    <Input
                      id="player2_critop_score"
                      name="player2_critop_score"
                      type="number"
                      min="0"
                      max="6"
                      placeholder="0-6"
                      required
                      className={player2ScoreErrors.critop ? "border-destructive focus-visible:ring-destructive" : ""}
                      onChange={(e) => {
                        const value = e.target.value
                        const isValid = validateScore(value)
                        setPlayer2ScoreErrors((prev) => ({ ...prev, critop: !isValid }))
                        setPlayer2Scores((prev) => ({ ...prev, critop: isValid ? Number(value) : 0 }))
                        setFormFields((prev) => ({ ...prev, player2_critop_score: isValid }))
                      }}
                    />
                    {player2ScoreErrors.critop && (
                      <p className="text-xs text-destructive">Score must be between 0 and 6</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player2_tacop_score">TacOp Score (0-6)</Label>
                    <Input
                      id="player2_tacop_score"
                      name="player2_tacop_score"
                      type="number"
                      min="0"
                      max="6"
                      placeholder="0-6"
                      required
                      className={player2ScoreErrors.tacop ? "border-destructive focus-visible:ring-destructive" : ""}
                      onChange={(e) => {
                        const value = e.target.value
                        const isValid = validateScore(value)
                        setPlayer2ScoreErrors((prev) => ({ ...prev, tacop: !isValid }))
                        setPlayer2Scores((prev) => ({ ...prev, tacop: isValid ? Number(value) : 0 }))
                        setFormFields((prev) => ({ ...prev, player2_tacop_score: isValid }))
                      }}
                    />
                    {player2ScoreErrors.tacop && (
                      <p className="text-xs text-destructive">Score must be between 0 and 6</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player2_killop_score">KillOp Score (0-6)</Label>
                    <Input
                      id="player2_killop_score"
                      name="player2_killop_score"
                      type="number"
                      min="0"
                      max="6"
                      placeholder="0-6"
                      required
                      className={player2ScoreErrors.killop ? "border-destructive focus-visible:ring-destructive" : ""}
                      onChange={(e) => {
                        const value = e.target.value
                        const isValid = validateScore(value)
                        setPlayer2ScoreErrors((prev) => ({ ...prev, killop: !isValid }))
                        setPlayer2Scores((prev) => ({ ...prev, killop: isValid ? Number(value) : 0 }))
                        setFormFields((prev) => ({ ...prev, player2_killop_score: isValid }))
                      }}
                    />
                    {player2ScoreErrors.killop && (
                      <p className="text-xs text-destructive">Score must be between 0 and 6</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>PrimaryOp Score (Auto-calculated)</Label>
                    <div className="flex h-10 items-center rounded-md border border-input bg-background/50 px-3 text-sm">
                      {player2PrimaryScore > 0 ? player2PrimaryScore : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Player 2 Total VP */}
              <div
                className={`rounded-lg p-3 text-center transition-colors ${getVPBoxStyle(player2Total, player1Total)}`}
              >
                <div className="text-sm text-muted-foreground">Total Victory Points</div>
                <div className={`text-3xl font-bold ${getVPTextStyle(player2Total, player1Total)}`}>{player2Total}</div>
              </div>
            </div>
          </div>

          {error && !success && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {success && !error && (
            <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-500">Game recorded successfully!</div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !isFormValid}>
            {isSubmitting ? "Recording Game..." : "Record Game"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
