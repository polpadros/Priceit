'use client'
import { mockVenues } from '@/lib/mock-data'
import { VenueListClient } from '@/components/venue/VenueListClient'
import { CitySelector } from '@/components/ui/CitySelector'
import { useCity } from '@/contexts/CityContext'
import { CITY_LABELS } from '@/types'
import Link from 'next/link'

export default function HomePage() {
  const { city } = useCity()

  // Filter venues by city (default barcelona if city field not set)
  const cityVenues = mockVenues.filter(v => (v.city ?? 'barcelona') === city)

  const cityLabel = CITY_LABELS[city]

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-black border-b border-pink-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-600/25 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-800/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-7xl sm:text-9xl font-black mb-4 leading-none tracking-tight">
            <span className="text-pink-400 drop-shadow-[0_0_40px_rgba(236,72,153,0.6)]">
              Price<span className="italic">it</span>
            </span>
          </h1>
          <p className="text-zinc-300 text-xl sm:text-2xl font-semibold mb-3 tracking-wide">
            {cityLabel} Nightlife Guide
          </p>
          <p className="text-zinc-500 text-base mb-10 max-w-lg mx-auto">
            Compare clubs, bars and restaurants. Filter by vibe and music,
            check live prices and plan your perfect night out.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/night-planner"
              className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-bold px-8 py-3.5 rounded-2xl transition-colors shadow-lg shadow-pink-500/30 text-lg">
              🗺️ Plan my night
            </Link>
            <a href="#venues" className="inline-flex items-center gap-2 border border-zinc-700 hover:border-pink-500/50 text-zinc-300 font-semibold px-8 py-3.5 rounded-2xl transition-colors text-lg">
              Browse venues ↓
            </a>
          </div>
        </div>
      </div>

      {/* Stats bar with city selector */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-6 overflow-x-auto">
          <CitySelector />
          <div className="h-8 w-px bg-zinc-700 shrink-0" />
          {[
            { label: 'Venues', value: cityVenues.length },
            { label: 'Clubs', value: cityVenues.filter(v => v.type === 'discoteca').length },
            { label: 'Bars & Pre-parties', value: cityVenues.filter(v => v.type === 'bar' || v.type === 'previa').length },
            { label: 'Restaurants', value: cityVenues.filter(v => v.type === 'restaurant').length },
          ].map(s => (
            <div key={s.label} className="shrink-0 text-center">
              <p className="text-2xl font-black text-pink-400">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Venue list filtered by city */}
      <div id="venues" className="max-w-6xl mx-auto px-4 py-8">
        {cityVenues.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏙️</p>
            <p className="text-white font-bold text-xl mb-2">No venues yet in {cityLabel}</p>
            <p className="text-zinc-500 text-sm">We&apos;re adding venues soon!</p>
          </div>
        ) : (
          <VenueListClient venues={cityVenues} />
        )}
      </div>
    </main>
  )
}
