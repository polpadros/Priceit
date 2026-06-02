'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, Euro, MapPin, Star, ChevronRight, RotateCcw, Search } from 'lucide-react'
import { mockVenues } from '@/lib/mock-data'
import { AMBIENT_LABELS } from '@/components/ui/AmbientBadge'
import { AmbientBadge } from '@/components/ui/AmbientBadge'
import { StarRating } from '@/components/ui/StarRating'
import type { Ambient, NightPlanFilters, NightRoute, VenueWithDetails } from '@/types'

const VenueMap = dynamic(() => import('@/components/map/VenueMap').then((m) => m.VenueMap), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />,
})

const AMBIENTS = Object.keys(AMBIENT_LABELS) as Ambient[]

const DAYS = [
  { value: 'divendres', label: 'Divendres' },
  { value: 'dissabte', label: 'Dissabte' },
  { value: 'dijous', label: 'Dijous' },
  { value: 'diumenge', label: 'Diumenge' },
]

const NEIGHBORHOODS = ['Tots', 'Barceloneta', 'Barri Gòtic', 'El Born', 'Eixample', 'Poblenou', 'Gràcia Alta', 'Sants']

function computeRoutes(filters: NightPlanFilters): NightRoute[] {
  const venues = mockVenues

  const matchesAmbient = (v: VenueWithDetails) =>
    filters.ambients.length === 0 || v.ambients.some((a) => filters.ambients.includes(a as Ambient))

  const discos = venues.filter((v) => v.type === 'discoteca' && matchesAmbient(v))
  const previes = venues.filter((v) => (v.type === 'previa' || v.type === 'bar') && matchesAmbient(v))
  const restaurants = venues.filter((v) => v.type === 'restaurant')

  const routes: NightRoute[] = []

  for (const disco of discos) {
    if (filters.neighborhood && filters.neighborhood !== 'Tots' && disco.neighborhood !== filters.neighborhood) continue

    const discoPrice = disco.prices.find((p) => p.is_current)?.amount ?? 0
    if (discoPrice > filters.budget) continue

    const remaining = filters.budget - discoPrice

    const previa = filters.includePrevia
      ? previes.find((p) => {
          const price = p.prices.find((pr) => pr.is_current)?.amount ?? 15
          return price <= remaining * 0.35
        }) ?? null
      : null

    const previaPrice = previa ? (previa.prices.find((p) => p.is_current)?.amount ?? 0) : 0

    const restaurant = filters.includeRestaurant
      ? restaurants.find((r) => {
          const price = r.prices.find((p) => p.is_current)?.amount ?? 20
          return price <= (remaining - previaPrice) * 0.6
        }) ?? null
      : null

    const restaurantPrice = restaurant ? (restaurant.prices.find((p) => p.is_current)?.amount ?? 0) : 0
    const totalEstimatedCost = discoPrice + previaPrice + restaurantPrice

    if (totalEstimatedCost <= filters.budget) {
      routes.push({ disco, previa, restaurant, totalEstimatedCost })
    }
  }

  return routes.slice(0, 3)
}

function RouteStep({
  emoji,
  label,
  venue,
}: {
  emoji: string
  label: string
  venue: VenueWithDetails | null
}) {
  if (!venue) return null
  const price = venue.prices.find((p) => p.is_current)

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-lg shrink-0">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-0.5">{label}</p>
        <Link href={`/venues/${venue.id}`} className="font-bold text-gray-900 hover:text-violet-700 transition-colors">
          {venue.name}
        </Link>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {venue.neighborhood}
          </span>
          {price && (
            <span className="flex items-center gap-1 font-semibold text-gray-700">
              <Euro className="w-3.5 h-3.5 text-violet-500" />
              {price.amount === 0 ? 'Gratis' : `${price.amount}€`}
            </span>
          )}
          {venue.rating_count > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              {venue.avg_rating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {venue.ambients.slice(0, 3).map((a) => (
            <AmbientBadge key={a} ambient={a as Ambient} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function NightPlannerPage() {
  const [filters, setFilters] = useState<NightPlanFilters>({
    budget: 50,
    ambients: [],
    day: 'dissabte',
    neighborhood: null,
    includeRestaurant: true,
    includePrevia: true,
  })
  const [routes, setRoutes] = useState<NightRoute[] | null>(null)
  const [searched, setSearched] = useState(false)

  function toggleAmbient(a: Ambient) {
    setFilters((f) => ({
      ...f,
      ambients: f.ambients.includes(a) ? f.ambients.filter((x) => x !== a) : [...f.ambients, a],
    }))
  }

  function handleSearch() {
    const result = computeRoutes(filters)
    setRoutes(result)
    setSearched(true)
  }

  function handleReset() {
    setFilters({
      budget: 50,
      ambients: [],
      day: 'dissabte',
      neighborhood: null,
      includeRestaurant: true,
      includePrevia: true,
    })
    setRoutes(null)
    setSearched(false)
  }

  const allVenuesInRoutes = routes
    ? [...routes.map((r) => r.disco), ...routes.map((r) => r.previa).filter(Boolean), ...routes.map((r) => r.restaurant).filter(Boolean)] as VenueWithDetails[]
    : []

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-violet-200 hover:text-white mb-6 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Tornar
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">🗺️ Night Planner</h1>
          <p className="text-violet-200">
            Diga&apos;ns el teu pressupost i ambient preferit. Nosaltres et dissenyem la nit perfecta.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[380px_1fr] gap-8">
          {/* Filter panel */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Configura la teva nit</h2>

              {/* Budget */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pressupost per persona
                </label>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">0€</span>
                  <span className="text-xl font-black text-violet-700">{filters.budget}€</span>
                  <span className="text-xs text-gray-400">150€</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={150}
                  step={5}
                  value={filters.budget}
                  onChange={(e) => setFilters((f) => ({ ...f, budget: Number(e.target.value) }))}
                  className="w-full accent-violet-600"
                />
              </div>

              {/* Day */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dia</label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setFilters((f) => ({ ...f, day: d.value }))}
                      className={`py-2 rounded-xl text-sm font-medium transition-colors border ${
                        filters.day === d.value
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambient */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ambient <span className="text-gray-400 font-normal">(pots escollir varios)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AMBIENTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAmbient(a)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                        filters.ambients.includes(a)
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      {AMBIENT_LABELS[a]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neighborhood */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Barri</label>
                <select
                  value={filters.neighborhood ?? 'Tots'}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      neighborhood: e.target.value === 'Tots' ? null : e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Includes */}
              <div className="mb-6 space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Inclou a la ruta</label>
                {[
                  { key: 'includeRestaurant', label: '🍽️ Sopar' },
                  { key: 'includePrevia', label: '🥂 Previa' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[key as keyof NightPlanFilters] as boolean}
                      onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-violet-600"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-violet-700 transition-colors text-sm"
                >
                  <Search className="w-4 h-4" />
                  Planificar nit
                </button>
                {searched && (
                  <button
                    onClick={handleReset}
                    className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-500"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-5">
            {!searched && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">🌙</p>
                <p className="text-lg font-semibold text-gray-600">Configura els filtres i planifica la nit perfecta</p>
                <p className="text-sm mt-1">Omplim la ruta de sopar, previa i discoteca dins del teu pressupost</p>
              </div>
            )}

            {searched && routes !== null && routes.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">😔</p>
                <p className="text-lg font-semibold text-gray-600">No hem trobat rutes</p>
                <p className="text-sm mt-1">Prova amb més pressupost, altri ambient o sense restricció de barri</p>
              </div>
            )}

            {routes && routes.length > 0 && (
              <>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{routes.length}</span> rutes suggerides per a{' '}
                  <span className="font-semibold text-violet-700">{filters.day}</span> amb{' '}
                  <span className="font-semibold text-violet-700">{filters.budget}€</span>
                </p>

                {routes.map((route, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-gray-900 text-lg">Ruta #{i + 1}</h3>
                      <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-1.5 text-sm">
                        <span className="text-gray-500">Cost estimat: </span>
                        <span className="font-black text-violet-700">{route.totalEstimatedCost}€</span>
                        <span className="text-gray-400"> / {filters.budget}€</span>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {route.restaurant && (
                        <>
                          <RouteStep emoji="🍽️" label="Sopar" venue={route.restaurant} />
                          <div className="flex items-center gap-2 ml-5">
                            <div className="w-0.5 h-6 bg-gray-200 ml-4" />
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </div>
                        </>
                      )}
                      {route.previa && (
                        <>
                          <RouteStep emoji="🥂" label="Previa" venue={route.previa} />
                          <div className="flex items-center gap-2 ml-5">
                            <div className="w-0.5 h-6 bg-gray-200 ml-4" />
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </div>
                        </>
                      )}
                      <RouteStep emoji="🪩" label="Discoteca" venue={route.disco} />
                    </div>

                    {/* Budget bar */}
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Pressupost utilitzat</span>
                        <span>{Math.round((route.totalEstimatedCost / filters.budget) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                          style={{ width: `${Math.min((route.totalEstimatedCost / filters.budget) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Map with all venues */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Mapa de les rutes</h3>
                  <VenueMap venues={allVenuesInRoutes} height="350px" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
