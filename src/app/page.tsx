import { mockVenues } from '@/lib/mock-data'
import { VenueListClient } from '@/components/venue/VenueListClient'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🎉</span>
              <span className="text-xl font-black tracking-tight">PriceIt</span>
              <span className="ml-2 text-xs bg-white/20 rounded-full px-2 py-0.5 backdrop-blur-sm">Barcelona</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              La nit perfecta,<br />al millor preu.
            </h1>
            <p className="text-violet-200 text-lg mb-8">
              Compara discoteques, bars i restaurants de Barcelona. Filtra per ambient,
              consulta preus actualitzats i planifica la teva ruta de nit.
            </p>
            <Link
              href="/night-planner"
              className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 transition-colors shadow-lg"
            >
              🗺️ Night Planner
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex gap-8 overflow-x-auto">
          {[
            { label: 'Locals', value: mockVenues.length },
            { label: 'Discoteques', value: mockVenues.filter((v) => v.type === 'discoteca').length },
            { label: 'Bars & Previes', value: mockVenues.filter((v) => v.type === 'bar' || v.type === 'previa').length },
            { label: 'Restaurants', value: mockVenues.filter((v) => v.type === 'restaurant').length },
          ].map((s) => (
            <div key={s.label} className="shrink-0 text-center">
              <p className="text-2xl font-black text-violet-700">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Venue list */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <VenueListClient venues={mockVenues} />
      </div>
    </main>
  )
}
