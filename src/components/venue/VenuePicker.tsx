'use client'
import { useState, useMemo } from 'react'
import { Search, X, Check, MapPin, Euro } from 'lucide-react'
import { mockVenues } from '@/lib/mock-data'
import type { VenueType, VenueWithDetails } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  discoteca: '🪩 Club',
  previa: '🥂 Pre-party bar',
  bar: '🍸 Bar',
  restaurant: '🍽️ Restaurant',
}

interface Props {
  type: VenueType | VenueType[]
  selectedId: string | null
  onSelect: (venue: VenueWithDetails | null) => void
  placeholder?: string
}

export function VenuePicker({ type, selectedId, onSelect, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const types = Array.isArray(type) ? type : [type]
  const venues = useMemo(() =>
    mockVenues.filter(v => types.includes(v.type as VenueType)),
    [types.join(',')]
  )

  const filtered = useMemo(() =>
    venues.filter(v =>
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.neighborhood.toLowerCase().includes(search.toLowerCase())
    ), [venues, search])

  const selected = selectedId ? mockVenues.find(v => v.id === selectedId) : null

  function handleSelect(venue: VenueWithDetails) {
    onSelect(venue)
    setOpen(false)
    setSearch('')
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onSelect(null)
  }

  const entryPrice = (v: VenueWithDetails) => {
    const p = v.prices.find(p => p.label.toLowerCase().includes('entry') || p.entrada_tipus === 'free' || p.entrada_tipus === 'free_list')
    if (!p) return null
    if (p.amount === 0) return 'Free'
    if (p.amount_max) return `${p.amount}–${p.amount_max}€`
    return `${p.amount}€`
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm border transition-colors text-left ${
          selected
            ? 'bg-zinc-800 border-pink-500/40 text-white'
            : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-pink-500/40'
        }`}
      >
        {selected ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selected.image_url && (
              <img src={selected.image_url} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{selected.name}</p>
              <p className="text-xs text-zinc-500">{selected.neighborhood}</p>
            </div>
          </div>
        ) : (
          <span>{placeholder ?? `Choose ${types.map(t => TYPE_LABELS[t]).join(' / ')}`}</span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {selected && (
            <button onClick={handleClear} className="text-zinc-500 hover:text-red-400 p-0.5 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-zinc-600 text-xs">{selected ? '✓' : '›'}</span>
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => { setOpen(false); setSearch('') }}>
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="font-black text-white text-lg">
                {placeholder ?? `Choose ${types.map(t => TYPE_LABELS[t]).join(' / ')}`}
              </h3>
              <button onClick={() => { setOpen(false); setSearch('') }} className="text-zinc-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative px-5 pb-3">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-pink-500/50 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none placeholder:text-zinc-600"
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 px-3 pb-5">
              {filtered.length === 0 ? (
                <p className="text-center text-zinc-500 py-8 text-sm">No venues found</p>
              ) : (
                <div className="space-y-1.5">
                  {filtered.map(venue => {
                    const price = entryPrice(venue)
                    const isSelected = venue.id === selectedId
                    return (
                      <button
                        key={venue.id}
                        onClick={() => handleSelect(venue)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors ${
                          isSelected
                            ? 'bg-pink-500/20 border border-pink-500/40'
                            : 'hover:bg-zinc-800 border border-transparent'
                        }`}
                      >
                        {venue.image_url ? (
                          <img src={venue.image_url} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-zinc-700 shrink-0 flex items-center justify-center text-lg">
                            {TYPE_LABELS[venue.type]?.split(' ')[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{venue.name}</p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{venue.neighborhood}</span>
                            {price && <span className="flex items-center gap-1 text-pink-400 font-semibold"><Euro className="w-3 h-3" />{price}</span>}
                            {venue.google_rating && <span>⭐ {venue.google_rating}</span>}
                          </div>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-pink-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
