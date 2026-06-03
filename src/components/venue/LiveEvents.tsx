'use client'
import { useEffect, useState } from 'react'
import { Calendar, Ticket, Loader2, ExternalLink } from 'lucide-react'

interface TMEvent {
  id: string
  name: string
  date: string
  time: string | null
  venue_name: string
  price_min: number | null
  price_max: number | null
  currency: string
  ticket_url: string
  image: string | null
  artists: string[]
  genre: string | null
}

export function LiveEvents({ venueName }: { venueName: string }) {
  const [events, setEvents] = useState<TMEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [hasKey, setHasKey] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/events/barcelona?keyword=${encodeURIComponent(venueName)}&size=5`
        )
        if (res.status === 500) { setHasKey(false); setLoading(false); return }
        const data = await res.json()
        setEvents(data.events ?? [])
      } catch {
        setHasKey(false)
      }
      setLoading(false)
    }
    load()
  }, [venueName])

  if (!hasKey) return null // silently hide if no API key
  if (loading) return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-pink-400" />
        <h2 className="font-bold text-white">Live events from Ticketmaster</h2>
        <span className="text-xs bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-full px-2 py-0.5">LIVE</span>
      </div>
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
      </div>
    </div>
  )
  if (events.length === 0) return null

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-pink-400" />
        <h2 className="font-bold text-white">Live events from Ticketmaster</h2>
        <span className="text-xs bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-full px-2 py-0.5">⚡ LIVE</span>
      </div>

      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-pink-500/30 transition-colors">
            {event.image && (
              <img
                src={event.image}
                alt={event.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white leading-tight">{event.name}</p>
              {event.artists.length > 0 && (
                <p className="text-sm text-zinc-400 mt-0.5">{event.artists.join(', ')}</p>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                <span>📅 {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                {event.time && <span>🕐 {event.time.slice(0, 5)}</span>}
                {event.genre && <span>🎵 {event.genre}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              {event.price_min !== null ? (
                <p className="font-bold text-pink-400 text-sm">
                  {event.price_min === 0 ? 'Free' : `${event.price_min}€`}
                  {event.price_max && event.price_max !== event.price_min && `–${event.price_max}€`}
                </p>
              ) : (
                <p className="text-xs text-zinc-500">Price TBC</p>
              )}
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
              >
                <Ticket className="w-3 h-3" />
                Buy
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-600 mt-3 flex items-center gap-1">
        <ExternalLink className="w-3 h-3" />
        Events & prices updated live via Ticketmaster API
      </p>
    </div>
  )
}
