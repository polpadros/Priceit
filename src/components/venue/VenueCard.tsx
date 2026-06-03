import Link from 'next/link'
import { MapPin, Euro, Users, Music } from 'lucide-react'
import type { VenueWithDetails } from '@/types'
import { AmbientBadge } from '@/components/ui/AmbientBadge'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { isOpenNow } from '@/lib/hours'
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
  const openNow = isOpenNow(venue.opening_hours)

  return (
    <Link href={`/venues/${venue.id}`} className="group block">
      <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 overflow-hidden hover:shadow-xl hover:border-pink-500/30 transition-all duration-200">
        {/* Header with photo */}
        <div className="h-44 relative overflow-hidden flex items-end justify-between p-4">
          {venue.image_url ? (
            <img
              src={venue.image_url}
              alt={venue.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {/* PriceIt watermark */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="text-xs font-black text-pink-400/80 tracking-widest uppercase">PriceIt</span>
            {openNow && (
              <span className="flex items-center gap-1 text-xs font-bold text-white bg-green-500/90 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Open
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton venueId={venue.id} size="sm" />
          </div>
          <span className="relative z-10 text-xs font-semibold text-white/90 bg-black/40 rounded-full px-3 py-1 backdrop-blur-sm border border-white/10">
            {TYPE_LABELS[venue.type]}
          </span>
          <div className="relative z-10 flex items-center gap-2">
            {venue.google_rating && (
              <span className="text-xs font-bold text-white bg-black/50 rounded-full px-2 py-1 backdrop-blur-sm flex items-center gap-1">
                ⭐ {venue.google_rating}
              </span>
            )}
            {nextEvent && (
              <span className="text-xs font-semibold text-white bg-red-600 rounded-full px-2 py-1">
                🎟 EVENT
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-white text-lg leading-tight group-hover:text-pink-400 transition-colors mb-1">
            {venue.name}
          </h3>

          <div className="flex items-center gap-1 text-zinc-400 text-sm mb-3">
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
              <Music className="w-3 h-3 text-zinc-500 shrink-0" />
              {venue.music.slice(0, 4).map((m) => (
                <span key={m} className="text-xs text-zinc-400 bg-zinc-800 rounded-full px-2 py-0.5">
                  {m}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {currentPrice ? (
              <div className="flex items-center gap-1.5 font-semibold text-white flex-wrap">
                <Euro className="w-4 h-4 text-pink-400 shrink-0" />
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
              <span className="text-sm text-zinc-500">Price TBC</span>
            )}
            {venue.min_age > 0 && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
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
