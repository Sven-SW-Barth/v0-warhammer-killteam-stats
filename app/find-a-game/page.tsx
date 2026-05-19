"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, List, ExternalLink, Mail, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface Location {
  id: number
  name: string
  address: string
  city: string
  postal_code: string | null
  country_id: number | null
  latitude: number | null
  longitude: number | null
  type: "store" | "club" | "cafe" | "other"
  description: string | null
  website: string | null
  email: string | null
  phone: string | null
  country?: {
    name: string
    code: string
  }
}

const typeLabels: Record<string, string> = {
  store: "Gaming Store",
  club: "Gaming Club",
  cafe: "Gaming Cafe",
  other: "Other",
}

export default function FindAGamePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLocations() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("locations")
        .select(`
          *,
          country:countries(name, code)
        `)
        .order("name")

      if (error) {
        console.error("Error fetching locations:", error)
      } else {
        setLocations(data || [])
      }
      setIsLoading(false)
    }

    fetchLocations()
  }, [])

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      typeLabels[location.type]?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find a Place to Play
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Discover local gaming stores, clubs, and communities where you can play Kill Team in person.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, city, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="table" className="w-full">
          <div className="mb-6 flex justify-center">
            <TabsList>
              <TabsTrigger value="table" className="gap-2">
                <List className="h-4 w-4" />
                Table View
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2">
                <MapPin className="h-4 w-4" />
                Map View
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Table View */}
          <TabsContent value="table">
            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Loading locations...</p>
                  </CardContent>
                </Card>
              ) : filteredLocations.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      {locations.length === 0
                        ? "No locations have been added yet. Check back soon!"
                        : "No locations found matching your search."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredLocations.map((location) => (
                  <Card key={location.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">{location.name}</h3>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {typeLabels[location.type]}
                            </span>
                          </div>
                          <p className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {location.address}, {location.postal_code && `${location.postal_code} `}{location.city}
                            {location.country && `, ${location.country.name}`}
                          </p>
                          {location.description && (
                            <p className="mb-3 text-sm text-muted-foreground">{location.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-sm">
                            {location.email && (
                              <a
                                href={`mailto:${location.email}`}
                                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                              >
                                <Mail className="h-3 w-3" />
                                {location.email}
                              </a>
                            )}
                            {location.phone && (
                              <a
                                href={`tel:${location.phone}`}
                                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                              >
                                <Phone className="h-3 w-3" />
                                {location.phone}
                              </a>
                            )}
                          </div>
                        </div>
                        {location.website && (
                          <Button variant="outline" size="sm" asChild className="shrink-0">
                            <a href={location.website} target="_blank" rel="noopener noreferrer" className="gap-2">
                              Visit Website
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Map View */}
          <TabsContent value="map">
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center p-6 sm:min-h-[500px]">
                <div className="text-center">
                  <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">Map View Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;re working on an interactive map to help you find gaming locations near you.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-12 rounded-lg border border-border bg-card p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Want to add your store or club?</h3>
          <p className="text-sm text-muted-foreground">
            If you run a gaming store or club that hosts Kill Team games, get in touch with us to be listed here.
          </p>
        </div>
      </div>
    </div>
  )
}
