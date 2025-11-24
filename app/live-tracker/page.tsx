"use client"

import { useState, useEffect } from "react"
import { LiveTrackerForm } from "@/components/live-tracker-form"
import { LiveTrackerSetupForm, type GameSetup as SetupData } from "@/components/live-tracker-setup-form"
import { createClient } from "@/lib/supabase/client"

type TacOp = {
  id: number
  name: string
  archetype: string
}

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

type Player = {
  id: number
  playertag: string
}

type Country = {
  id: number
  name: string
}

type GameSetup = {
  player1Id: number | null
  player2Id: number | null
  player1Name: string
  player2Name: string
  player1KillteamId: string
  player1KillteamName: string
  player2KillteamId: string
  player2KillteamName: string
  killzoneId: string
  killzoneName: string
  mapLayout: string
  critOpId: string
  critOpName: string
  countryId: string
  useChessClock: boolean
  clockMode: "up" | "down"
  clockTimeMinutes: number
}

export default function LiveTrackerPage() {
  const [showSetup, setShowSetup] = useState(true)
  const [gameSetup, setGameSetup] = useState<GameSetup | null>(null)
  const [tacops, setTacops] = useState<TacOp[]>([])
  const [killzones, setKillzones] = useState<Killzone[]>([])
  const [critops, setCritops] = useState<CritOp[]>([])
  const [killteams, setKillteams] = useState<Killteam[]>([])
  const [countries, setCountries] = useState<Country[]>([]) // Added countries state
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      const [tacopResult, killzoneResult, critopResult, killteamResult, countryResult, playerResult] =
        await Promise.all([
          supabase.from("tacops").select("*").order("archetype, name"),
          supabase.from("killzones").select("*").order("name"),
          supabase.from("critops").select("*").order("name"),
          supabase.from("killteams").select("*").order("name"),
          supabase.from("countries").select("*").order("name"),
          supabase.from("players").select("id, playertag").order("playertag"),
        ])

      if (tacopResult.data) setTacops(tacopResult.data)
      if (killzoneResult.data) setKillzones(killzoneResult.data)
      if (critopResult.data) setCritops(critopResult.data)
      if (killteamResult.data) setKillteams(killteamResult.data)
      if (countryResult.data) setCountries(countryResult.data) // Set countries data
      if (playerResult.data) setPlayers(playerResult.data)
    }

    loadData()
  }, [])

  const handleSetupConfirm = async (setup: SetupData) => {
    const supabase = createClient()

    const player1Name = players.find((p) => p.id === setup.player1Id)?.playertag || "Player 1"
    const player2Name = players.find((p) => p.id === setup.player2Id)?.playertag || "Player 2"

    const player1KillteamName = killteams.find((k) => k.id.toString() === setup.player1KillteamId)?.name || ""
    const player2KillteamName = killteams.find((k) => k.id.toString() === setup.player2KillteamId)?.name || ""

    const killzoneName = killzones.find((k) => k.id.toString() === setup.killzoneId)?.name || ""

    const critOpName = critops.find((c) => c.id.toString() === setup.critOpId)?.name || ""

    setGameSetup({
      player1Id: setup.player1Id,
      player2Id: setup.player2Id,
      player1Name,
      player2Name,
      player1KillteamId: setup.player1KillteamId,
      player1KillteamName,
      player2KillteamId: setup.player2KillteamId,
      player2KillteamName,
      killzoneId: setup.killzoneId,
      killzoneName,
      mapLayout: setup.mapLayout || "",
      critOpId: setup.critOpId,
      critOpName,
      countryId: setup.countryId, // Use actual countryId from setup instead of hardcoded "1"
      useChessClock: setup.useChessClock,
      clockMode: setup.clockMode,
      clockTimeMinutes: setup.clockTimeMinutes,
    })

    setShowSetup(false)
  }

  const primaryOps = [
    { id: 1, name: "CritOp" },
    { id: 2, name: "TacOp" },
    { id: 3, name: "KillOp" },
  ]

  if (showSetup || !gameSetup) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-6 text-center">
            <h1 className="mb-2 text-balance text-2xl font-bold tracking-tight text-foreground">Live Game Tracker</h1>
            <p className="text-sm text-muted-foreground">Set up your game to start tracking</p>
          </header>

          <div className="mx-auto max-w-md">
            <LiveTrackerSetupForm
              onConfirm={handleSetupConfirm}
              killzones={killzones}
              critops={critops}
              killteams={killteams}
              countries={countries}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 py-3">
        <header className="mb-3 text-center">
          <h1 className="mb-1 text-balance text-xl font-bold tracking-tight text-foreground">Live Game Tracker</h1>
        </header>

        <div className="mx-auto max-w-4xl">
          <LiveTrackerForm
            data={{
              tacops: tacops,
              primaryOps: primaryOps,
            }}
            gameSetup={gameSetup}
          />
        </div>
      </div>
    </div>
  )
}
