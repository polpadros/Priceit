'use client'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Ambient, MusicGenre, VenueType, VenueWithDetails } from '@/types'
import { VenueCard } from './VenueCard'
import { VenueFilters } from './VenueFilters'
import { MapIcon, GridIcon } from 'lucide-react'

const VenueMap = dynamic(() => import('@/components/map/VenueMap').then((m) => m.VenueMap), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />,
})

export function VenueListClient({ venues }: { venues: VenueWithDetails[] }) {
  const [selectedType, setSelectedType] = useState<VenueType | 'all'>('all')
  const [selectedAmbients, setSelectedAmbients] = useState<Ambient[]>([])
  const [selectedMusic, setSelectedMusic] = useState<MusicGenre[]>([])
  const [view, setView] = useState<'grid' | 'map'>('grid')

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      if (selectedType !== 'all' && v.type !== selectedType) return false
      if (selectedAmbients.length > 0) {
        if (!v.ambients.some((a) => selectedAmbients.includes(a as Ambient))) return false
      }
      if (selectedMusic.length > 0) {
        if (!v.music.some((m) => selectedMusic.includes(m as MusicGenre))) return false
      }
      return true
    })
  }, [venues, selectedType, selectedAmbients, selectedMusic])

  function toggleAmbient(a: Ambient) {
    setSelectedAmbients((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  function toggleMusic(m: MusicGenre) {
    setSelectedMusic((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    )
  }

  const activeFilters = selectedAmbients.length + selectedMusic.length

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <VenueFilters
          selectedType={selectedType}
          selectedAmbients={selectedAmbients}
          selectedMusic={selectedMusic}
          onTypeChange={setSelectedType}
          onAmbientToggle={toggleAmbient}
          onMusicToggle={toggleMusic}
        />
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filtered.length}</span> venues found
          {activeFilters > 0 && <span className="ml-1 text-fuchsia-600 font-medium">({activeFilters} filter{activeFilters > 1 ? 's' : ''} active)</span>}
        </p>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-fuchsia-600' : 'text-gray-500'}`}
          >
            <GridIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('map')}
            className={`p-1.5 rounded-md transition-colors ${view === 'map' ? 'bg-white shadow-sm text-fuchsia-600' : 'text-gray-500'}`}
          >
            <MapIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map view */}
      {view === 'map' && (
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <VenueMap venues={filtered} height="500px" />
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <p className="text-lg font-medium">No venues found</p>
              <p className="text-sm mt-1">Try different filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
