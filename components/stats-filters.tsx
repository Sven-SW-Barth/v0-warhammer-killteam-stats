"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"

type Killzone = {
  id: number
  name: string
}

type Country = {
  id: number
  name: string
  code: string
}

type StatsFiltersProps = {
  killzones: Killzone[]
  countries: Country[]
  initialFilters: {
    startDate?: string
    endDate?: string
    countryId?: string
    killzoneId?: string
  }
}

export function StatsFilters({ killzones, countries, initialFilters }: StatsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialFilters.startDate ? new Date(initialFilters.startDate) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialFilters.endDate ? new Date(initialFilters.endDate) : undefined,
  )
  const [countryId, setCountryId] = useState<string>(initialFilters.countryId || "all")
  const [killzoneId, setKillzoneId] = useState<string>(initialFilters.killzoneId || "all")

  const hasActiveFilters =
    startDate !== undefined || endDate !== undefined || countryId !== "all" || killzoneId !== "all"

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (startDate) {
      params.set("startDate", format(startDate, "yyyy-MM-dd"))
    }
    if (endDate) {
      params.set("endDate", format(endDate, "yyyy-MM-dd"))
    }
    if (countryId && countryId !== "all") {
      params.set("countryId", countryId)
    }
    if (killzoneId && killzoneId !== "all") {
      params.set("killzoneId", killzoneId)
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setCountryId("all")
    setKillzoneId("all")

    startTransition(() => {
      router.push(pathname)
    })
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-auto">
              Active
            </Badge>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => (endDate ? date > endDate : false) || date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => (startDate ? date < startDate : false) || date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Country Filter */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={countryId} onValueChange={setCountryId}>
              <SelectTrigger id="country">
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

          <div className="space-y-2">
            <Label htmlFor="killzone">Killzone</Label>
            <Select value={killzoneId} onValueChange={setKillzoneId}>
              <SelectTrigger id="killzone">
                <SelectValue placeholder="All Killzones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Killzones</SelectItem>
                {killzones.map((killzone) => (
                  <SelectItem key={killzone.id} value={String(killzone.id)}>
                    {killzone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={applyFilters} disabled={isPending} className="flex-1">
            {isPending ? "Applying..." : "Apply Filters"}
          </Button>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" disabled={isPending}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
