'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, MapPin, Euro, Music, X } from 'lucide-react'
import { mockVenues } from '@/lib/mock-data'
import { AmbientBadge } from '@/components/ui/AmbientBadge'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { isOpenNow } from '@/lib/hours'
import type { Ambient } from '@/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return mockVenues.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.neighborhood.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.music.some(m => m.toLowerCase().includes(q)) ||
      v.ambients.some(a => a.toLowerCase().includes(q))
    )
  }, [query])

  const entryPrice = (v: typeof mockVenues[0]) => {
    const p = v.prices.find(p => p.label.toLowerCase().includes('entry') || p.entrada_tipus === 'free_list' || p.entrada_tipus === 'free')
    if (!p) return null
    if (p.amount === 0 && p.entrada_tipus === 'free_list') return 'Free (list)'
    if (p.amount === 0) return 'Free'
    if (p.amount_max) return `${p.amount}–${p.amount_max}€`
    return `${p.amount}€`
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden bg-black border-b border-pink-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 py-14 text-center">
          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-none">
            <span className="text-pink-400 drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">Search</span>
          </h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              autoFocus
              placeholder="Club name, neighbourhood, music style..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-pink-500/60 text-white text-lg rounded-2xl pl-12 pr-12 py-4 outline-none placeholder:text-zinc-600 transition-colors"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {query && (
            <p className="text-zinc-500 text-sm mt-3">
              {results.length === 0 ? 'No results found' : `${results.length} venue${results.length !== 1 ? 's' : ''} found`}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {!query && (
          <div className="text-center py-20 text-zinc-600">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Start typing to search venues</p>
            <p className="text-sm mt-1">Search by name, neighbourhood or music style</p>
          </div>
        )}

        <div className="space-y-3">
          {results.map(venue => {
            const open = isOpenNow(venue.opening_hours)
            const price = entryPrice(venue)
            return (
              <Link key={venue.id} href={`/venues/${venue.id}`}>
                <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-pink-500/30 rounded-2xl p-4 transition-all group">
                  {venue.image_url && (
                    <img src={venue.image_url} alt={venue.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white group-hover:text-pink-400 transition-colors">{venue.name}</p>
                      {open && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Open</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{venue.neighborhood}</span>
                      {price && <span className="flex items-center gap-1 text-pink-400 font-semibold"><Euro className="w-3 h-3" />{price}</span>}
                      {venue.google_rating && <span>⭐ {venue.google_rating}</span>}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {venue.music.slice(0, 3).map(m => (
                        <span key={m} className="text-xs text-zinc-500 bg-zinc-800 rounded-full px-2 py-0.5">{m}</span>
                      ))}
                      {venue.ambients.slice(0, 2).map(a => (
                        <AmbientBadge key={a} ambient={a as Ambient} />
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <FavoriteButton venueId={venue.id} size="sm" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
