"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Location {
  id: number
  name: string
  address: string
  city: string
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  type: string
  description: string | null
  website: string | null
  email: string | null
  phone: string | null
}

interface LocationsMapProps {
  locations: Location[]
  selectedLocation?: Location | null
  onLocationSelect?: (location: Location) => void
}

// Custom marker icon to avoid default icon issues
const createIcon = (type: string) => {
  const colors: Record<string, string> = {
    store: "#22c55e",
    club: "#3b82f6",
    cafe: "#f59e0b",
    other: "#8b5cf6",
  }
  const color = colors[type] || colors.other

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

export function LocationsMap({ locations, selectedLocation, onLocationSelect }: LocationsMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map centered on Europe
    const map = L.map(mapContainerRef.current, {
      center: [51.1657, 10.4515], // Center of Germany
      zoom: 6,
    })

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Add/update markers when locations change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    // Add markers for locations with coordinates
    const validLocations = locations.filter((loc) => loc.latitude && loc.longitude)

    validLocations.forEach((location) => {
      if (!location.latitude || !location.longitude) return

      const marker = L.marker([location.latitude, location.longitude], {
        icon: createIcon(location.type),
      })

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${location.name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${location.address}</p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${location.postal_code || ""} ${location.city}</p>
          ${location.website ? `<a href="${location.website}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: #3b82f6;">Visit Website</a>` : ""}
        </div>
      `

      marker.bindPopup(popupContent)

      marker.on("click", () => {
        if (onLocationSelect) {
          onLocationSelect(location)
        }
      })

      marker.addTo(map)
      markersRef.current.set(location.id, marker)
    })

    // Fit bounds if there are locations
    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(
        validLocations.map((loc) => [loc.latitude!, loc.longitude!] as [number, number])
      )
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
    }
  }, [locations, onLocationSelect])

  // Pan to selected location
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedLocation?.latitude || !selectedLocation?.longitude) return

    map.setView([selectedLocation.latitude, selectedLocation.longitude], 14, {
      animate: true,
    })

    const marker = markersRef.current.get(selectedLocation.id)
    if (marker) {
      marker.openPopup()
    }
  }, [selectedLocation])

  return (
    <div
      ref={mapContainerRef}
      className="h-[500px] w-full rounded-lg border border-border"
      style={{ zIndex: 0 }}
    />
  )
}
