"use client"

import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { StatsContent } from "./stats-content"
import { StatsSkeleton } from "./skeletons/stats-skeleton"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StatsContentWrapper({
  killzones,
  critops,
}: {
  killzones: Array<{ id: string; name: string }>
  critops: Array<{ id: string; name: string }>
}) {
  const searchParams = useSearchParams()

  const today = new Date().toISOString().split("T")[0]
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const defaultStartDate = sixMonthsAgo.toISOString().split("T")[0]

  const startDate = searchParams.get("startDate") || defaultStartDate
  const endDate = searchParams.get("endDate") || today
  const country = searchParams.get("country") || "all"
  const killzone = searchParams.get("killzone") || "all"
  const critop = searchParams.get("critop") || "all"

  const queryString = new URLSearchParams({
    startDate,
    endDate,
    country,
    killzone,
    critop,
  }).toString()

  const { data, error, isLoading } = useSWR(`/api/stats?${queryString}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (isLoading) {
    return <StatsSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-destructive">Failed to load statistics. Please try again.</p>
      </div>
    )
  }

  if (!data) {
    return <StatsSkeleton />
  }

  return (
    <StatsContent
      totalGames={data.totalGames}
      totalPlayers={data.totalPlayers}
      killzoneStats={data.killzoneStats}
      topTacops={data.topTacops}
      killteamWinRates={data.killteamWinRates}
      killzones={killzones}
      critops={critops}
    />
  )
}
