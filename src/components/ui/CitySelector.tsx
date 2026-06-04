'use client'
import { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { useCity } from '@/contexts/CityContext'
import { CITY_LABELS, type City } from '@/types'

const CITIES = Object.entries(CITY_LABELS) as [City, string][]

export function CitySelector() {
  const { city, setCity } = useCity()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 hover:border-pink-500/50 text-zinc-300 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 text-pink-400" />
        {CITY_LABELS[city]}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl p-1.5 z-50 min-w-[160px]">
            {CITIES.map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setCity(key); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  city === key
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {label}
                {city === key && <span className="ml-auto text-pink-400">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
