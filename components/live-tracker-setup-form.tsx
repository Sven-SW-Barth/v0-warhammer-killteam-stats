"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlayerSearchCombobox } from "@/components/player-search-combobox"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Killzone = {
  id: number
  name: string
}

type CritOp = {
  id: number
  name: string
}

type Killteam = {
  id: number
  name: string
  Season: number
  color: string
}

type Country = {
  id: number
  name: string
}

type Props = {
  onConfirm: (setup: GameSetup) => void
  killzones: Killzone[]
  critops: CritOp[]
  killteams: Killteam[]
  countries: Country[]
}

export type GameSetup = {
  player1Id: number | null
  player2Id: number | null
  player1KillteamId: string
  player2KillteamId: string
  killzoneId: string
  mapLayout: string
  critOpId: string
  countryId: string
  useChessClock: boolean
  clockMode: "up" | "down"
  clockTimeMinutes: number
}

export function LiveTrackerSetupForm({ onConfirm, killzones, critops, killteams, countries }: Props) {
  const [player1Id, setPlayer1Id] = useState<number | null>(null)
  const [player2Id, setPlayer2Id] = useState<number | null>(null)
  const [player1KillteamId, setPlayer1KillteamId] = useState<string>("")
  const [player2KillteamId, setPlayer2KillteamId] = useState<string>("")
  const [killzoneId, setKillzoneId] = useState<string>("")
  const [mapLayout, setMapLayout] = useState<string>("")
  const [critOpId, setCritOpId] = useState<string>("")
  const [countryId, setCountryId] = useState<string>("")
  const [useChessClock, setUseChessClock] = useState(false)
  const [clockMode, setClockMode] = useState<"up" | "down">("down")
  const [clockTimeMinutes, setClockTimeMinutes] = useState(55)

  useEffect(() => {
    if (typeof window !== "undefined" && !countryId && countries.length > 0) {
      const locale = navigator.language || "en-US"
      const countryCode = locale.split("-")[1]?.toUpperCase()

      const countryMap: Record<string, string> = {
        US: "United States",
        GB: "United Kingdom",
        DE: "Germany",
        FR: "France",
        ES: "Spain",
        IT: "Italy",
        CA: "Canada",
        AU: "Australia",
        NZ: "New Zealand",
        JP: "Japan",
        CN: "China",
        BR: "Brazil",
        MX: "Mexico",
        AR: "Argentina",
        CL: "Chile",
        NL: "Netherlands",
        BE: "Belgium",
        SE: "Sweden",
        NO: "Norway",
        DK: "Denmark",
        FI: "Finland",
        PL: "Poland",
        CZ: "Czech Republic",
        AT: "Austria",
        CH: "Switzerland",
        PT: "Portugal",
        GR: "Greece",
        IE: "Ireland",
        RU: "Russia",
        IN: "India",
        KR: "South Korea",
        SG: "Singapore",
        TH: "Thailand",
        MY: "Malaysia",
        PH: "Philippines",
        ID: "Indonesia",
        VN: "Vietnam",
        ZA: "South Africa",
        EG: "Egypt",
        IL: "Israel",
        TR: "Turkey",
        SA: "Saudi Arabia",
        AE: "United Arab Emirates",
      }

      const detectedCountryName = countryCode ? countryMap[countryCode] : null

      if (detectedCountryName) {
        const country = countries.find((c) => c.name === detectedCountryName)
        if (country) {
          setCountryId(country.id.toString())
        }
      }
    }
  }, [countries, countryId])

  const handleConfirm = () => {
    if (
      !player1Id ||
      !player2Id ||
      !player1KillteamId ||
      !player2KillteamId ||
      !killzoneId ||
      !critOpId ||
      !countryId
    ) {
      return
    }

    onConfirm({
      player1Id,
      player2Id,
      player1KillteamId,
      player2KillteamId,
      killzoneId,
      mapLayout,
      critOpId,
      countryId,
      useChessClock,
      clockMode,
      clockTimeMinutes,
    })
  }

  const isValid =
    player1Id && player2Id && player1KillteamId && player2KillteamId && killzoneId && critOpId && countryId

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Game Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player 1 */}
        <div className="space-y-2">
          <Label htmlFor="player1">Player 1</Label>
          <PlayerSearchCombobox
            value={player1Id?.toString() || ""}
            onValueChange={(val) => setPlayer1Id(val ? Number.parseInt(val) : null)}
            allowCreate={true}
          />
          <Select value={player1KillteamId} onValueChange={setPlayer1KillteamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select killteam" />
            </SelectTrigger>
            <SelectContent>
              {killteams.map((killteam) => (
                <SelectItem key={killteam.id} value={killteam.id.toString()}>
                  {killteam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Player 2 */}
        <div className="space-y-2">
          <Label htmlFor="player2">Player 2</Label>
          <PlayerSearchCombobox
            value={player2Id?.toString() || ""}
            onValueChange={(val) => setPlayer2Id(val ? Number.parseInt(val) : null)}
            allowCreate={true}
          />
          <Select value={player2KillteamId} onValueChange={setPlayer2KillteamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select killteam" />
            </SelectTrigger>
            <SelectContent>
              {killteams.map((killteam) => (
                <SelectItem key={killteam.id} value={killteam.id.toString()}>
                  {killteam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={countryId} onValueChange={setCountryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Killzone */}
        <div className="space-y-2">
          <Label htmlFor="killzone">Killzone</Label>
          <Select value={killzoneId} onValueChange={setKillzoneId}>
            <SelectTrigger>
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

        {/* Map Layout (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="mapLayout">
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
            </SelectContent>
          </Select>
        </div>

        {/* CritOp */}
        <div className="space-y-2">
          <Label htmlFor="critop">Crit Op</Label>
          <Select value={critOpId} onValueChange={setCritOpId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Crit Op" />
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

        {/* Chess Clock */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="chessClock"
              checked={useChessClock}
              onCheckedChange={(checked) => setUseChessClock(!!checked)}
            />
            <Label htmlFor="chessClock" className="text-sm font-normal cursor-pointer">
              Use Chess Clock
            </Label>
          </div>

          {useChessClock && (
            <div className="space-y-3 pl-6 border-l-2 border-orange-500/30">
              {/* Clock Mode Toggle */}
              <div className="space-y-2">
                <Label htmlFor="clockMode" className="text-sm">
                  Clock Mode
                </Label>
                <Select value={clockMode} onValueChange={(val) => setClockMode(val as "up" | "down")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="down">Countdown</SelectItem>
                    <SelectItem value="up">Count Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Input (only for countdown) */}
              {clockMode === "down" && (
                <div className="space-y-2">
                  <Label htmlFor="clockTime" className="text-sm">
                    Time per Player (minutes)
                  </Label>
                  <Input
                    id="clockTime"
                    type="number"
                    min="1"
                    max="180"
                    value={clockTimeMinutes}
                    onChange={(e) => setClockTimeMinutes(Number.parseInt(e.target.value) || 55)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <Button onClick={handleConfirm} disabled={!isValid} className="w-full">
          Start Tracking
        </Button>
      </CardContent>
    </Card>
  )
}
