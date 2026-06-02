'use client'
import { useEffect, useRef } from 'react'
import type { VenueWithDetails } from '@/types'

export function VenueMap({
  venues,
  selectedId,
  onSelect,
  height = '400px',
}: {
  venues: VenueWithDetails[]
  selectedId?: string
  onSelect?: (id: string) => void
  height?: string
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return
    if (mapInstanceRef.current) return

    // Dynamic import per evitar SSR issues amb Leaflet
    import('leaflet').then((L) => {
      // Fix icones Leaflet amb Next.js
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })

      const map = L.map(mapRef.current!).setView([41.3874, 2.1686], 13)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      venues.forEach((venue) => {
        const marker = L.marker([venue.lat, venue.lng], { icon: DefaultIcon })
          .addTo(map)
          .bindPopup(
            `<div class="font-semibold">${venue.name}</div><div class="text-sm text-gray-600">${venue.neighborhood}</div>`
          )

        if (onSelect) {
          marker.on('click', () => onSelect(venue.id))
        }
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [venues, onSelect])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-xl z-0" />
    </>
  )
}
