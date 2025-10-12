"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

type Country = {
  id: string
  name: string
}

export function StatsFilters({ countries }: { countries: Country[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const today = new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const startDateParam = searchParams.get("startDate")
  const endDateParam = searchParams.get("endDate")

  const startDate = startDateParam ? new Date(startDateParam) : sixMonthsAgo
  const endDate = endDateParam ? new Date(endDateParam) : today
  const countryId = searchParams.get("country") || "all"

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all" && key === "country") {
      params.delete("country")
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const updateDateFilter = (key: string, date: Date | undefined) => {
    if (date) {
      const dateString = format(date, "yyyy-MM-dd")
      updateFilters(key, dateString)
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-input dark:bg-input">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => updateDateFilter("startDate", date)}
                  disabled={(date) => date > endDate || date > today}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-input dark:bg-input">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(endDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => updateDateFilter("endDate", date)}
                  disabled={(date) => date < startDate || date > today}
                  initialFocus
                />
                <div className="border-t p-3">
                  <Button
                    variant="outline"
                    className="w-full bg-input dark:bg-input"
                    onClick={() => updateDateFilter("endDate", today)}
                  >
                    Today
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
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
