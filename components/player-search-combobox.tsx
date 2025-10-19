"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"

type Player = {
  id: number
  playertag: string
}

type PlayerSearchComboboxProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  name: string
  required?: boolean
  disabled?: boolean
}

export function PlayerSearchCombobox({
  value,
  onValueChange,
  placeholder = "Search player...",
  name,
  required = false,
  disabled = false,
}: PlayerSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [players, setPlayers] = React.useState<Player[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    const fetchPlayers = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("players").select("id, playertag").order("playertag")
      if (data) {
        setPlayers(data)
      }
      setLoading(false)
    }
    fetchPlayers()
  }, [])

  const selectedPlayer = players.find((player) => player.id.toString() === value)
  const displayValue = selectedPlayer ? selectedPlayer.playertag : value

  // Filter players based on search query (supports both playertag and ID)
  const filterPlayers = (search: string) => {
    const searchLower = search.toLowerCase().trim()
    const searchWithoutHash = searchLower.replace(/^#/, "")

    return players.filter((player) => {
      const matchesTag = player.playertag.toLowerCase().includes(searchLower)
      const matchesId = player.id.toString().includes(searchWithoutHash)
      return matchesTag || matchesId
    })
  }

  const filteredPlayers = filterPlayers(searchQuery)
  const hasExactMatch = filteredPlayers.some(
    (player) => player.playertag.toLowerCase() === searchQuery.toLowerCase().trim(),
  )
  const showCreateOption = searchQuery.trim().length > 0 && !hasExactMatch

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal bg-input dark:bg-input"
            disabled={disabled}
          >
            {displayValue ? (
              <span>
                {displayValue}
                {selectedPlayer && (
                  <span className="text-muted-foreground font-mono text-xs ml-2">#{selectedPlayer.id}</span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command
            filter={(value, search) => {
              setSearchQuery(search)
              if (value.startsWith("new:")) return 1
              return filterPlayers(search).some((p) => p.id.toString() === value) ? 1 : 0
            }}
          >
            <CommandInput placeholder="Search by name or ID (#123)..." />
            <CommandList>
              <CommandEmpty>{loading ? "Loading players..." : "No player found."}</CommandEmpty>
              {showCreateOption && (
                <CommandGroup>
                  <CommandItem
                    value={`new:${searchQuery.trim()}`}
                    onSelect={() => {
                      onValueChange(searchQuery.trim())
                      setOpen(false)
                    }}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Create new player: {searchQuery.trim()}</span>
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {filteredPlayers.map((player) => (
                  <CommandItem
                    key={player.id}
                    value={player.id.toString()}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", value === player.id.toString() ? "opacity-100" : "opacity-0")}
                    />
                    <span className="flex-1">{player.playertag}</span>
                    <span className="text-muted-foreground font-mono text-xs">#{player.id}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={value} required={required} />
    </>
  )
}
