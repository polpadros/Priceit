import Link from 'next/link'
import { MapPin, Euro, Users, Music } from 'lucide-react'
import type { VenueWithDetails } from '@/types'
import { AmbientBadge } from '@/components/ui/AmbientBadge'
import type { Ambient } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  discoteca: '🪩 Club',
  bar: '🍸 Bar',
  restaurant: '🍽️ Restaurant',
  previa: '🥂 Pre-party',
}

export function VenueCard({ venue }: { venue: VenueWithDetails }) {
  const entryPrice = venue.prices.find((p) => p.is_current && (p.entrada_tipus === 'dynamic' || p.entrada_tipus === 'fixed' || p.entrada_tipus === 'free' || p.entrada_tipus === 'free_list') && (p.label.toLowerCase().includes('entry') || p.label.toLowerCase().includes('free')))
  const currentPrice = entryPrice ?? venue.prices.find((p) => p.is_current)
  const nextEvent = venue.events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  return (
    <Link href={`/venues/${venue.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-fuchsia-200 transition-all duration-200">
        {/* Header */}
        <div className="h-40 bg-gradient-to-br from-fuchsia-500 via-fuchsia-600 to-pink-800 relative flex items-end justify-between p-4">
          <span className="text-xs font-semibold text-white/90 bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
            {TYPE_LABELS[venue.type]}
          </span>
          <div className="flex items-center gap-2">
            {venue.google_rating && (
              <span className="text-xs font-bold text-white bg-white/20 rounded-full px-2 py-1 backdrop-blur-sm flex items-center gap-1">
                ⭐ {venue.google_rating}
              </span>
            )}
            {nextEvent && (
              <span className="text-xs font-semibold text-white bg-red-500 rounded-full px-2 py-1">
                EVENT {new Date(nextEvent.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-fuchsia-700 transition-colors mb-1">
            {venue.name}
          </h3>

          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{venue.neighborhood}</span>
          </div>

          {/* Vibe badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {venue.ambients.slice(0, 3).map((a) => (
              <AmbientBadge key={a} ambient={a as Ambient} />
            ))}
          </div>

          {/* Music tags */}
          {venue.music.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mb-3">
              <Music className="w-3 h-3 text-gray-400 shrink-0" />
              {venue.music.slice(0, 4).map((m) => (
                <span key={m} className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                  {m}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {currentPrice ? (
              <div className="flex items-center gap-1.5 font-semibold text-gray-900 flex-wrap">
                <Euro className="w-4 h-4 text-fuchsia-600 shrink-0" />
                <span>
                  {currentPrice.amount === 0 && currentPrice.entrada_tipus === 'free_list'
                    ? 'Free (guest list)'
                    : currentPrice.amount === 0
                    ? 'Free entry'
                    : currentPrice.amount_max
                    ? `${currentPrice.amount}–${currentPrice.amount_max}€`
                    : `${currentPrice.amount}€`}
                </span>
                {currentPrice.entrada_tipus === 'dynamic' && (
                  <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-1.5 py-0.5 font-medium">
                    ⚡ live
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-400">Price TBC</span>
            )}
            {venue.min_age > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3.5 h-3.5" />
                <span>+{venue.min_age}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
