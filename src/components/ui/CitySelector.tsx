'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { useCity } from '@/contexts/CityContext'
import { CITY_LABELS, type City } from '@/types'

const CITIES = Object.entries(CITY_LABELS) as [City, string][]

export function CitySelector() {
  const { city, setCity } = useCity()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      })
    }
    setOpen(!open)
  }

  // Close on scroll
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, { once: true })
    return () => window.removeEventListener('scroll', close)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 hover:border-pink-500/50 text-zinc-300 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors shrink-0"
      >
        <MapPin className="w-3.5 h-3.5 text-pink-400" />
        {CITY_LABELS[city]}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown — fixed so it escapes any overflow container */}
          <div
            className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-1.5 min-w-[170px]"
            style={{ top: pos.top, left: pos.left }}
          >
            {CITIES.map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setCity(key); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  city === key
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {label}
                {city === key && <span className="ml-auto text-pink-400 text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
