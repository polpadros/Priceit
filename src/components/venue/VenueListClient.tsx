'use client'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Ambient, MusicGenre, VenueType, VenueWithDetails } from '@/types'
import { VenueCard } from './VenueCard'
import { VenueFilters } from './VenueFilters'
import { MapIcon, GridIcon, Search, X, Clock, CalendarCheck } from 'lucide-react'
import { isOpenNow, isOpenToday } from '@/lib/hours'

const VenueMap = dynamic(() => import('@/components/map/VenueMap').then((m) => m.VenueMap), {
  ssr: false,
  loading: () => <div className="h-96 bg-zinc-800 rounded-xl animate-pulse" />,
})

export function VenueListClient({ venues }: { venues: VenueWithDetails[] }) {
  const [selectedType, setSelectedType] = useState<VenueType | 'all'>('all')
  const [selectedAmbients, setSelectedAmbients] = useState<Ambient[]>([])
  const [selectedMusic, setSelectedMusic] = useState<MusicGenre[]>([])
  const [view, setView] = useState<'grid' | 'map'>('grid')
  const [search, setSearch] = useState('')
  const [openNow, setOpenNow] = useState(false)
  const [openToday, setOpenToday] = useState(false)

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      if (selectedType !== 'all' && v.type !== selectedType) return false
      if (selectedAmbients.length > 0 && !v.ambients.some((a) => selectedAmbients.includes(a as Ambient))) return false
      if (selectedMusic.length > 0 && !v.music.some((m) => selectedMusic.includes(m as MusicGenre))) return false
      if (search) {
        const q = search.toLowerCase()
        if (!v.name.toLowerCase().includes(q) && !v.neighborhood.toLowerCase().includes(q) && !v.description.toLowerCase().includes(q)) return false
      }
      if (openNow && !isOpenNow(v.opening_hours)) return false
      if (openToday && !openNow && !isOpenToday(v.opening_hours)) return false
      return true
    })
  }, [venues, selectedType, selectedAmbients, selectedMusic, search, openNow, openToday])

  function toggleAmbient(a: Ambient) {
    setSelectedAmbients(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }
  function toggleMusic(m: MusicGenre) {
    setSelectedMusic(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  const activeFilters = selectedAmbients.length + selectedMusic.length + (openNow ? 1 : 0) + (openToday && !openNow ? 1 : 0)

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search venues, neighbourhoods..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500/50 text-white rounded-2xl pl-11 pr-10 py-3.5 outline-none placeholder:text-zinc-600 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick filters: open now / open today */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setOpenNow(!openNow); if (!openNow) setOpenToday(false) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
            openNow ? 'bg-green-500 text-white border-green-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-green-500/50'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${openNow ? 'bg-white animate-pulse' : 'bg-green-500'}`} />
          Open now
        </button>
        <button
          onClick={() => { setOpenToday(!openToday); if (!openToday) setOpenNow(false) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
            openToday && !openNow ? 'bg-pink-500 text-white border-pink-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-pink-500/50'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Open today
        </button>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
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
        <p className="text-sm text-zinc-400">
          <span className="font-semibold text-white">{filtered.length}</span> venues found
          {activeFilters > 0 && <span className="ml-1 text-pink-400 font-medium">· {activeFilters} filter{activeFilters > 1 ? 's' : ''} active</span>}
        </p>
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          <button onClick={() => setView('grid')} className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-zinc-700 text-pink-400' : 'text-zinc-500'}`}>
            <GridIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setView('map')} className={`p-1.5 rounded-md transition-colors ${view === 'map' ? 'bg-zinc-700 text-pink-400' : 'text-zinc-500'}`}>
            <MapIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map view */}
      {view === 'map' && (
        <div className="rounded-2xl overflow-hidden border border-zinc-800">
          <VenueMap venues={filtered} height="500px" />
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(venue => <VenueCard key={venue.id} venue={venue} />)}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium text-white">No venues found</p>
              <p className="text-sm mt-1 text-zinc-500">Try different filters or search terms</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
