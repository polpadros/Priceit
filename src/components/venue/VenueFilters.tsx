'use client'
import { AMBIENT_LABELS } from '@/components/ui/AmbientBadge'
import type { Ambient, VenueType } from '@/types'

const AMBIENTS = Object.keys(AMBIENT_LABELS) as Ambient[]

const TYPES: { value: VenueType | 'all'; label: string }[] = [
  { value: 'all', label: 'Tots' },
  { value: 'discoteca', label: '🪩 Discoteques' },
  { value: 'bar', label: '🍺 Bars' },
  { value: 'previa', label: '🥂 Previes' },
  { value: 'restaurant', label: '🍽️ Restaurants' },
]

export function VenueFilters({
  selectedType,
  selectedAmbients,
  onTypeChange,
  onAmbientToggle,
}: {
  selectedType: VenueType | 'all'
  selectedAmbients: Ambient[]
  onTypeChange: (t: VenueType | 'all') => void
  onAmbientToggle: (a: Ambient) => void
}) {
  return (
    <div className="space-y-4">
      {/* Type filter */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipus</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => onTypeChange(t.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                selectedType === t.value
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ambient filter */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ambient</p>
        <div className="flex flex-wrap gap-2">
          {AMBIENTS.map((a) => (
            <button
              key={a}
              onClick={() => onAmbientToggle(a)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                selectedAmbients.includes(a)
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
              }`}
            >
              {AMBIENT_LABELS[a]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
