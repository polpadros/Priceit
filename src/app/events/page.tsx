'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Ticket, Loader2, Search } from 'lucide-react'

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

export default function EventsPage() {
  const [events, setEvents] = useState<TMEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [hasKey, setHasKey] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/events/barcelona?size=20&keyword=${encodeURIComponent(search)}`)
        if (res.status === 500) { setHasKey(false); setLoading(false); return }
        const data = await res.json()
        setEvents(data.events ?? [])
      } catch { setHasKey(false) }
      setLoading(false)
    }
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-black border-b border-pink-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-600/25 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-pink-400 mb-8 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />Back
          </Link>
          <h1 className="text-6xl sm:text-8xl font-black mb-4 leading-none tracking-tight">
            <span className="text-pink-400 drop-shadow-[0_0_40px_rgba(236,72,153,0.6)]">Events</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8">Live events in Barcelona — prices updated via Ticketmaster</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search artist or event..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-pink-500/50 placeholder:text-zinc-600"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {!hasKey && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔑</p>
            <p className="text-white font-bold text-xl mb-2">Ticketmaster API key not configured</p>
            <p className="text-zinc-500">Add your TICKETMASTER_API_KEY to .env.local</p>
          </div>
        )}

        {hasKey && loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
          </div>
        )}

        {hasKey && !loading && events.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg">No events found for "{search}"</p>
          </div>
        )}

        {hasKey && !loading && events.length > 0 && (
          <>
            <p className="text-zinc-500 text-sm mb-6">
              <span className="text-white font-semibold">{events.length}</span> upcoming events in Barcelona
              <span className="ml-2 text-xs bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-full px-2 py-0.5">⚡ live prices</span>
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {events.map(event => (
                <div key={event.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-pink-500/30 transition-colors overflow-hidden">
                  {event.image && (
                    <img src={event.image} alt={event.name} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <p className="font-bold text-white text-lg leading-tight mb-1">{event.name}</p>
                    {event.artists.length > 0 && (
                      <p className="text-sm text-zinc-400 mb-2">{event.artists.join(', ')}</p>
                    )}
                    <p className="text-sm text-zinc-500 mb-1">📍 {event.venue_name}</p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4">
                      <span>📅 {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      {event.time && <span>🕐 {event.time.slice(0,5)}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pink-400 text-lg">
                        {event.price_min === null ? 'Price TBC' :
                         event.price_min === 0 ? 'Free' :
                         event.price_max && event.price_max !== event.price_min
                           ? `${event.price_min}–${event.price_max}€`
                           : `${event.price_min}€`}
                      </span>
                      <a href={event.ticket_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                        <Ticket className="w-4 h-4" />
                        Buy tickets
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
