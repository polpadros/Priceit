'use client'
import type { VenueWithDetails } from '@/types'

export function VenueMap({
  venues,
  height = '300px',
}: {
  venues: VenueWithDetails[]
  selectedId?: string
  onSelect?: (id: string) => void
  height?: string
}) {
  if (venues.length === 0) return null

  // For single venue use place embed, for multiple use the first
  const primary = venues[0]
  const { lat, lng } = primary

  // Free Google Maps embed (no API key needed)
  const src = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ height }}>
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={primary.name}
      />
    </div>
  )
}

export default VenueMap
