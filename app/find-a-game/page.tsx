"use client"

import { useState } from "react"
import { Search, MapPin, List, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Placeholder data for gaming stores/clubs
const placeholderLocations = [
  {
    id: 1,
    name: "Warhammer Store Hamburg",
    address: "Spitalerstraße 12, 20095 Hamburg",
    type: "Official Store",
    website: "https://www.warhammer.com",
  },
  {
    id: 2,
    name: "Fantastic Store Berlin",
    address: "Alexanderplatz 1, 10178 Berlin",
    type: "Gaming Store",
    website: "https://example.com",
  },
  {
    id: 3,
    name: "Tabletop Club Munich",
    address: "Marienplatz 8, 80331 Munich",
    type: "Gaming Club",
    website: "https://example.com",
  },
  {
    id: 4,
    name: "The Gaming Den",
    address: "Königsallee 45, 40212 Düsseldorf",
    type: "Gaming Store",
    website: "https://example.com",
  },
  {
    id: 5,
    name: "Warhammer Store Frankfurt",
    address: "Zeil 106, 60313 Frankfurt",
    type: "Official Store",
    website: "https://www.warhammer.com",
  },
]

export default function FindAGamePage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLocations = placeholderLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.type.toLowerCase().includes(searchQuery.toLowerCase())
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
              placeholder="Search by name, location, or type..."
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
              {filteredLocations.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No locations found matching your search.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredLocations.map((location) => (
                  <Card key={location.id}>
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{location.name}</h3>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {location.type}
                          </span>
                        </div>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {location.address}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={location.website} target="_blank" rel="noopener noreferrer" className="gap-2">
                          Visit Website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
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
