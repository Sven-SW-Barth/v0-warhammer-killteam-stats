"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

type Country = {
  id: string
  name: string
}

export function LeaderboardsFilters({ countries }: { countries: Country[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const countryId = searchParams.get("country") || "all"
  const searchQuery = searchParams.get("search") || ""

  const [localSearch, setLocalSearch] = useState(searchQuery)

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all" && key === "country") {
      params.delete("country")
    } else if (value === "" && key === "search") {
      params.delete("search")
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    updateFilters("search", value)
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Player Search */}
          <div className="space-y-2">
            <Label htmlFor="player-search">Search Player</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="player-search"
                type="text"
                placeholder="Search by player name..."
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Country Filter */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={countryId} onValueChange={(value) => updateFilters("country", value)}>
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={String(country.id)}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
