"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { StatsFilters } from "@/components/stats-filters"
import { PlayerSearchCombobox } from "@/components/player-search-combobox"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type Country = {
  id: number
  name: string
}

type MatchlogFiltersProps = {
  countries: Country[]
}

export function MatchlogFilters({ countries }: MatchlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const playerId = searchParams.get("player") || ""

  const handlePlayerChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("player", value)
    } else {
      params.delete("player")
    }
    router.push(`/matchlog?${params.toString()}`)
  }

  const handleClearPlayer = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("player")
    router.push(`/matchlog?${params.toString()}`)
  }

  return (
    <div className="mb-6 space-y-4">
      <StatsFilters countries={countries} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-foreground">Filter by Player</label>
          <PlayerSearchCombobox
            value={playerId}
            onValueChange={handlePlayerChange}
            placeholder="Search for a player..."
            name="player-filter"
          />
        </div>
        {playerId && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleClearPlayer}
            className="shrink-0 bg-transparent"
            title="Clear player filter"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
