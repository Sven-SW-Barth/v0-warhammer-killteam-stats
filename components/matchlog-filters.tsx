"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { PlayerSearchCombobox } from "@/components/player-search-combobox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

type Killteam = {
  id: number
  name: string
}

type MatchlogFiltersProps = {
  killteams: Killteam[]
}

export function MatchlogFilters({ killteams }: MatchlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const playerId = searchParams.get("player") || ""
  const killteamId = searchParams.get("killteam") || ""
  const opponentKillteamId = searchParams.get("opponent") || ""

  const handlePlayerChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("player", value)
    } else {
      params.delete("player")
    }
    router.push(`/matchlog?${params.toString()}`)
  }

  const handleKillteamChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set("killteam", value)
    } else {
      params.delete("killteam")
      params.delete("opponent") // Clear opponent when killteam is cleared
    }
    router.push(`/matchlog?${params.toString()}`)
  }

  const handleOpponentKillteamChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set("opponent", value)
    } else {
      params.delete("opponent")
    }
    router.push(`/matchlog?${params.toString()}`)
  }

  const handleClearFilters = () => {
    const params = new URLSearchParams()
    router.push(`/matchlog?${params.toString()}`)
  }

  const hasActiveFilters = playerId || killteamId || opponentKillteamId
  const isKillteamSelected = killteamId && killteamId !== "all"

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-foreground">Filter by Player</label>
          <PlayerSearchCombobox
            value={playerId}
            onValueChange={handlePlayerChange}
            placeholder="Search for a player..."
            name="player-filter"
            allowCreate={false}
          />
        </div>
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-foreground">Filter by Killteam</label>
          <Select value={killteamId || "all"} onValueChange={handleKillteamChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Killteams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Killteams</SelectItem>
              {killteams.map((kt) => (
                <SelectItem key={kt.id} value={kt.id.toString()}>
                  {kt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-foreground">Opponent Killteam</label>
          <Select 
            value={opponentKillteamId || "all"} 
            onValueChange={handleOpponentKillteamChange}
            disabled={!isKillteamSelected}
          >
            <SelectTrigger className={!isKillteamSelected ? "opacity-50" : ""}>
              <SelectValue placeholder="All Opponents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Opponents</SelectItem>
              {killteams
                .filter((kt) => kt.id.toString() !== killteamId)
                .map((kt) => (
                  <SelectItem key={kt.id} value={kt.id.toString()}>
                    {kt.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleClearFilters}
            className="shrink-0 bg-transparent"
            title="Clear all filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
