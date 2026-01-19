"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { MatchlogItem } from "@/components/matchlog-item"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { MatchlogSkeleton } from "@/components/skeletons/matchlog-skeleton"

type Game = any // Use the proper Game type from your schema

export function MatchlogContent() {
  const searchParams = useSearchParams()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)

  // Get filter params
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const country = searchParams.get("country")
  const player = searchParams.get("player")
  const killteam = searchParams.get("killteam")
  const opponent = searchParams.get("opponent")

  // Fetch initial games when filters change
  useEffect(() => {
    fetchInitialGames()
  }, [startDate, endDate, country, player, killteam, opponent])

  const fetchInitialGames = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()

      // Apply date defaults if not provided
      if (startDate) params.append("startDate", startDate)
      else {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        params.append("startDate", sixMonthsAgo.toISOString())
      }

      if (endDate) params.append("endDate", endDate)
      else {
        params.append("endDate", new Date().toISOString())
      }

      if (country && country !== "all") params.append("country", country)
      if (player) params.append("player", player)
      if (killteam) params.append("killteam", killteam)
      if (opponent) params.append("opponent", opponent)

      const response = await fetch(`/api/matchlog?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch games")
      }

      setGames(data.games)
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)
      if (data.totalCount !== undefined) {
        setTotalCount(data.totalCount)
      }
    } catch (err) {
      console.error("[v0] Error fetching games:", err)
      setError(err instanceof Error ? err.message : "Failed to load games")
    } finally {
      setLoading(false)
    }
  }

  const loadMoreGames = async () => {
    if (!nextCursor || loadingMore) return

    setLoadingMore(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("cursor", nextCursor)

      // Include all filters
      if (startDate) params.append("startDate", startDate)
      else {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        params.append("startDate", sixMonthsAgo.toISOString())
      }

      if (endDate) params.append("endDate", endDate)
      else {
        params.append("endDate", new Date().toISOString())
      }

      if (country && country !== "all") params.append("country", country)
      if (player) params.append("player", player)
      if (killteam) params.append("killteam", killteam)
      if (opponent) params.append("opponent", opponent)

      const response = await fetch(`/api/matchlog?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch more games")
      }

      setGames((prev) => [...prev, ...data.games])
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)
    } catch (err) {
      console.error("[v0] Error loading more games:", err)
      setError(err instanceof Error ? err.message : "Failed to load more games")
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return <MatchlogSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
        <p className="font-semibold">Error loading games</p>
        <p className="text-sm">{error}</p>
        <Button onClick={fetchInitialGames} variant="outline" size="sm" className="mt-4 bg-transparent">
          Retry
        </Button>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">No games found matching your filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {totalCount !== null && (
        <div className="text-sm text-muted-foreground">
          Showing {games.length} of {totalCount} total games
        </div>
      )}

      <div className="space-y-3">
        {games.map((game) => (
          <MatchlogItem key={game.id} game={game} filteredPlayerId={player} filteredKillteamId={killteam} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button onClick={loadMoreGames} disabled={loadingMore} variant="outline" size="lg">
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More Games`
            )}
          </Button>
        </div>
      )}

      {!hasMore && games.length > 0 && totalCount !== null && (
        <p className="py-4 text-center text-sm text-muted-foreground">All {totalCount} games loaded</p>
      )}
    </div>
  )
}
