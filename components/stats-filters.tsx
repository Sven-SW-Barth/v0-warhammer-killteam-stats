"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useTransition, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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

type RulesUpdate = {
  id: number
  name: string
  release_date: string
}

type StatsFiltersProps = {
  killzones?: Killzone[]
  countries?: Country[]
  rulesUpdates?: RulesUpdate[]
  initialFilters?: {
    startDate?: string
    endDate?: string
    countryId?: string
    killzoneId?: string
    showLessThan3Games?: string
    showDeclassified?: string
  }
}

export function StatsFilters({ killzones = [], countries = [], rulesUpdates = [], initialFilters = {} }: StatsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // Find the Hivestorm (Launch) entry as default
  const hivestormEntry = rulesUpdates.find(ru => ru.name.toLowerCase().includes("hivestorm"))
  const defaultStartRulesUpdateId = hivestormEntry ? String(hivestormEntry.id) : (rulesUpdates[0] ? String(rulesUpdates[0].id) : "")

  // Determine initial start rules update ID from date
  const getInitialStartRulesUpdateId = () => {
    if (initialFilters.startDate) {
      const matchingUpdate = rulesUpdates.find(ru => ru.release_date === initialFilters.startDate)
      if (matchingUpdate) return String(matchingUpdate.id)
      return "custom"
    }
    return defaultStartRulesUpdateId
  }

  // Determine initial end rules update ID from date
  const getInitialEndRulesUpdateId = () => {
    if (initialFilters.endDate) {
      const matchingUpdate = rulesUpdates.find(ru => ru.release_date === initialFilters.endDate)
      if (matchingUpdate) return String(matchingUpdate.id)
      return "custom"
    }
    return "all"
  }

  const [startRulesUpdateId, setStartRulesUpdateId] = useState<string>(getInitialStartRulesUpdateId())
  const [endRulesUpdateId, setEndRulesUpdateId] = useState<string>(getInitialEndRulesUpdateId())
  const [useCustomStartDate, setUseCustomStartDate] = useState<boolean>(getInitialStartRulesUpdateId() === "custom")
  const [useCustomEndDate, setUseCustomEndDate] = useState<boolean>(getInitialEndRulesUpdateId() === "custom")

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialFilters.startDate ? new Date(initialFilters.startDate) : (hivestormEntry ? new Date(hivestormEntry.release_date) : undefined),
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialFilters.endDate ? new Date(initialFilters.endDate) : undefined,
  )
  const [countryId, setCountryId] = useState<string>(initialFilters.countryId || "all")
  const [killzoneId, setKillzoneId] = useState<string>(initialFilters.killzoneId || "all")

  const [showLessThan3Games, setShowLessThan3Games] = useState<boolean>(initialFilters.showLessThan3Games === "true")
  const [showDeclassified, setShowDeclassified] = useState<boolean>(initialFilters.showDeclassified === "true")

  // Update start date when rules update selection changes
  useEffect(() => {
    if (!useCustomStartDate && startRulesUpdateId && startRulesUpdateId !== "all") {
      const selectedUpdate = rulesUpdates.find(ru => String(ru.id) === startRulesUpdateId)
      if (selectedUpdate) {
        setStartDate(new Date(selectedUpdate.release_date))
      }
    }
  }, [startRulesUpdateId, useCustomStartDate, rulesUpdates])

  // Update end date when rules update selection changes
  useEffect(() => {
    if (!useCustomEndDate && endRulesUpdateId && endRulesUpdateId !== "all") {
      const selectedUpdate = rulesUpdates.find(ru => String(ru.id) === endRulesUpdateId)
      if (selectedUpdate) {
        setEndDate(new Date(selectedUpdate.release_date))
      }
    } else if (!useCustomEndDate && endRulesUpdateId === "all") {
      setEndDate(undefined)
    }
  }, [endRulesUpdateId, useCustomEndDate, rulesUpdates])

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
    params.set("showLessThan3Games", String(showLessThan3Games))
    params.set("showDeclassified", String(showDeclassified))

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setStartRulesUpdateId(defaultStartRulesUpdateId)
    setEndRulesUpdateId("all")
    setUseCustomStartDate(false)
    setUseCustomEndDate(false)
    setStartDate(hivestormEntry ? new Date(hivestormEntry.release_date) : undefined)
    setEndDate(undefined)
    setCountryId("all")
    setKillzoneId("all")
    setShowLessThan3Games(false)
    setShowDeclassified(false)

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

        {/* Timeframe Section */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Timeframe</Label>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Start</Label>
              <Select 
                value={startRulesUpdateId} 
                onValueChange={setStartRulesUpdateId}
                disabled={useCustomStartDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start" />
                </SelectTrigger>
                <SelectContent>
                  {rulesUpdates.map((ru) => (
                    <SelectItem key={ru.id} value={String(ru.id)}>
                      {ru.name} ({format(new Date(ru.release_date), "dd.MM.yyyy")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom-start-date"
                  checked={useCustomStartDate}
                  onCheckedChange={(checked) => {
                    setUseCustomStartDate(checked as boolean)
                    if (!checked && startRulesUpdateId) {
                      const selectedUpdate = rulesUpdates.find(ru => String(ru.id) === startRulesUpdateId)
                      if (selectedUpdate) {
                        setStartDate(new Date(selectedUpdate.release_date))
                      }
                    }
                  }}
                />
                <Label htmlFor="custom-start-date" className="text-xs font-normal cursor-pointer">
                  Select custom date
                </Label>
              </div>
              {useCustomStartDate && (
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
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">End</Label>
              <Select 
                value={endRulesUpdateId} 
                onValueChange={setEndRulesUpdateId}
                disabled={useCustomEndDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Today (Latest)</SelectItem>
                  {rulesUpdates.map((ru) => (
                    <SelectItem key={ru.id} value={String(ru.id)}>
                      {ru.name} ({format(new Date(ru.release_date), "dd.MM.yyyy")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom-end-date"
                  checked={useCustomEndDate}
                  onCheckedChange={(checked) => {
                    setUseCustomEndDate(checked as boolean)
                    if (!checked) {
                      if (endRulesUpdateId === "all") {
                        setEndDate(undefined)
                      } else {
                        const selectedUpdate = rulesUpdates.find(ru => String(ru.id) === endRulesUpdateId)
                        if (selectedUpdate) {
                          setEndDate(new Date(selectedUpdate.release_date))
                        }
                      }
                    }
                  }}
                />
                <Label htmlFor="custom-end-date" className="text-xs font-normal cursor-pointer">
                  Select custom date
                </Label>
              </div>
              {useCustomEndDate && (
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
              )}
            </div>
          </div>
        </div>

        {/* Country & Killzone Row */}
        <div className="grid gap-4 md:grid-cols-2 mb-4">
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

        <div className="flex items-center gap-6 border-t pt-4 pb-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-less-than-3"
              checked={showLessThan3Games}
              onCheckedChange={(checked) => setShowLessThan3Games(checked as boolean)}
            />
            <Label htmlFor="show-less-than-3" className="text-sm font-normal cursor-pointer">
              Display teams with less than 3 games
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-declassified"
              checked={showDeclassified}
              onCheckedChange={(checked) => setShowDeclassified(checked as boolean)}
            />
            <Label htmlFor="show-declassified" className="text-sm font-normal cursor-pointer">
              Display declassified teams
            </Label>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={applyFilters} disabled={isPending} className="flex-1">
            {isPending ? "Applying..." : "Apply Filters"}
          </Button>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" disabled={isPending} className="bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
