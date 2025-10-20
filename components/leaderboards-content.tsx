"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { SortablePlayersTable } from "@/components/sortable-players-table"

type Player = {
  id: string
  name: string
  wins: number
  losses: number
  draws: number
  totalGames: number
  totalScore: number
  countryCode: string | null
  countryName: string | null
  avgScore: number
  winRate: number
  eloRating: number
  rank: number // Added rank property
}

export function LeaderboardsContent({ players }: { players: Player[] }) {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) {
      return players
    }

    const query = searchQuery.toLowerCase()
    return players.filter((player) => player.name.toLowerCase().includes(query))
  }, [players, searchQuery])

  return (
    <div className="mb-6 sm:mb-8">
      <SortablePlayersTable players={filteredPlayers} />
    </div>
  )
}
