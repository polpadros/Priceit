'use client'
import { AMBIENT_LABELS } from '@/components/ui/AmbientBadge'
import type { Ambient, MusicGenre, VenueType } from '@/types'

const AMBIENTS = Object.keys(AMBIENT_LABELS) as Ambient[]

const MUSIC_GENRES: MusicGenre[] = [
  'House', 'Electronic', 'Techno', 'Deep House', 'Tech House',
  'Pop', 'R&B', 'Hip-Hop', 'Reggaeton', 'Latin',
  'Indie', 'Rock', 'Jazz', 'Soul', 'K-Pop', 'World Music',
]

const TYPES: { value: VenueType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'discoteca', label: '🪩 Clubs' },
  { value: 'bar', label: '🍸 Bars' },
  { value: 'previa', label: '🥂 Pre-party' },
  { value: 'restaurant', label: '🍽️ Restaurants' },
]

export function VenueFilters({
  selectedType,
  selectedAmbients,
  selectedMusic,
  onTypeChange,
  onAmbientToggle,
  onMusicToggle,
}: {
  selectedType: VenueType | 'all'
  selectedAmbients: Ambient[]
  selectedMusic: MusicGenre[]
  onTypeChange: (t: VenueType | 'all') => void
  onAmbientToggle: (a: Ambient) => void
  onMusicToggle: (m: MusicGenre) => void
}) {
  return (
    <div className="space-y-4">
      {/* Type filter */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Type</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => onTypeChange(t.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                selectedType === t.value
                  ? 'bg-yellow-500 text-black border-yellow-500'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-yellow-500/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vibe filter */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Vibe</p>
        <div className="flex flex-wrap gap-2">
          {AMBIENTS.map((a) => (
            <button
              key={a}
              onClick={() => onAmbientToggle(a)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                selectedAmbients.includes(a)
                  ? 'bg-yellow-500 text-black border-yellow-500'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-yellow-500/50'
              }`}
            >
              {AMBIENT_LABELS[a]}
            </button>
          ))}
        </div>
      </div>

      {/* Music filter */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">🎵 Music</p>
        <div className="flex flex-wrap gap-2">
          {MUSIC_GENRES.map((m) => (
            <button
              key={m}
              onClick={() => onMusicToggle(m)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                selectedMusic.includes(m)
                  ? 'bg-yellow-500 text-black border-yellow-500'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-yellow-500/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
