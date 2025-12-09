"use client"

import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { LeaderboardsContent } from "./leaderboards-content"
import { LeaderboardsSkeleton } from "./skeletons/leaderboards-skeleton"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function LeaderboardsContentWrapper() {
  const searchParams = useSearchParams()

  const country = searchParams.get("country") || "all"
  const queryString = new URLSearchParams({ country }).toString()

  const { data, error, isLoading } = useSWR(`/api/leaderboards?${queryString}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (isLoading) {
    return <LeaderboardsSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-destructive">Failed to load leaderboards. Please try again.</p>
      </div>
    )
  }

  if (!data || !data.players || data.players.length === 0) {
    return <LeaderboardsSkeleton />
  }

  return <LeaderboardsContent players={data.players} />
}
