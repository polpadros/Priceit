import { mockVenues } from '@/lib/mock-data'
import { VenueListClient } from '@/components/venue/VenueListClient'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero — black/gold */}
      <div className="relative overflow-hidden bg-zinc-950 border-b border-yellow-500/10">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-yellow-800/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            {/* Logo badge */}
            <div className="inline-flex items-center gap-2 border border-yellow-500/30 rounded-full px-4 py-1.5 mb-8 bg-yellow-500/5">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-sm font-bold tracking-widest uppercase">PriceIt Barcelona</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black mb-5 leading-tight text-white">
              The perfect<br />
              <span className="text-yellow-400">night out.</span>
            </h1>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl">
              Compare clubs, bars and restaurants in Barcelona. Filter by vibe and music,
              check live prices and plan your perfect night route.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/night-planner"
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-yellow-500/20"
              >
                🗺️ Plan my night
              </Link>
              <a href="#venues" className="inline-flex items-center gap-2 border border-zinc-700 hover:border-yellow-500/50 text-zinc-300 font-semibold px-6 py-3 rounded-xl transition-colors">
                Browse venues ↓
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex gap-8 overflow-x-auto">
          {[
            { label: 'Venues', value: mockVenues.length },
            { label: 'Clubs', value: mockVenues.filter((v) => v.type === 'discoteca').length },
            { label: 'Bars & Pre-parties', value: mockVenues.filter((v) => v.type === 'bar' || v.type === 'previa').length },
            { label: 'Restaurants', value: mockVenues.filter((v) => v.type === 'restaurant').length },
          ].map((s) => (
            <div key={s.label} className="shrink-0 text-center">
              <p className="text-2xl font-black text-yellow-400">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Venue list */}
      <div id="venues" className="max-w-6xl mx-auto px-4 py-8">
        <VenueListClient venues={mockVenues} />
      </div>
    </main>
  )
}
