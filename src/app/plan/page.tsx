'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Euro, Star, ChevronRight, Ticket } from 'lucide-react'
import { mockVenues } from '@/lib/mock-data'
import { AmbientBadge } from '@/components/ui/AmbientBadge'
import { ShareButton } from '@/components/ui/ShareButton'
import { getDistanceInfo } from '@/lib/distance'
import type { Ambient, VenueWithDetails } from '@/types'

function PlanStep({ emoji, label, venue, customName }: {
  emoji: string; label: string
  venue: VenueWithDetails | null; customName?: string
}) {
  const name = venue?.name ?? customName
  if (!name) return null
  const price = venue?.prices.find(p => p.is_current)

  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-full bg-pink-500/20 flex items-center justify-center text-xl shrink-0">{emoji}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-pink-400 uppercase tracking-wide mb-0.5">{label}</p>
        {venue ? (
          <Link href={`/venues/${venue.id}`} className="font-black text-white hover:text-pink-400 transition-colors text-lg block">
            {venue.name}
          </Link>
        ) : (
          <p className="font-black text-white text-lg">{customName}</p>
        )}
        {venue && (
          <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{venue.neighborhood}</span>
            {price && <span className="flex items-center gap-1 font-semibold text-zinc-300"><Euro className="w-3.5 h-3.5 text-pink-400" />{price.amount === 0 ? 'Free' : `${price.amount}€`}</span>}
            {venue.rating_count > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />{venue.avg_rating.toFixed(1)}</span>}
          </div>
        )}
        {venue && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {venue.ambients.slice(0, 3).map(a => <AmbientBadge key={a} ambient={a as Ambient} />)}
          </div>
        )}
        {!venue && customName && <p className="text-xs text-zinc-500 mt-0.5">Your custom choice</p>}
      </div>
      {venue && (() => {
        const ep = venue.prices.find(p => p.ticket_url)
        return ep?.ticket_url ? (
          <a href={ep.ticket_url} target="_blank" rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
            <Ticket className="w-3.5 h-3.5" /> Buy
          </a>
        ) : null
      })()}
    </div>
  )
}

function PlanContent() {
  const params = useSearchParams()
  const discoId = params.get('d')
  const previaId = params.get('p')
  const restaurantId = params.get('r')
  const customPrevia = params.get('cp') ?? ''
  const customRestaurant = params.get('cr') ?? ''
  const budget = params.get('b') ?? '50'
  const day = params.get('day') ?? 'tonight'
  const from = params.get('from') ?? ''

  const disco = discoId ? mockVenues.find(v => v.id === discoId) ?? null : null
  const previa = previaId ? mockVenues.find(v => v.id === previaId) ?? null : null
  const restaurant = restaurantId ? mockVenues.find(v => v.id === restaurantId) ?? null : null

  if (!disco && !customPrevia && !customRestaurant) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🔗</p>
        <p className="text-white font-bold text-xl mb-2">Plan not found</p>
        <Link href="/night-planner" className="text-pink-400 hover:underline">Create your own plan →</Link>
      </div>
    )
  }

  // Build share text
  const lines = [`🎉 ${from ? `${from} invites you to go out` : 'Night out plan'} — ${day}`]
  if (restaurant) lines.push(`🍽️ Dinner: ${restaurant.name}`)
  else if (customRestaurant) lines.push(`🍽️ Dinner: ${customRestaurant}`)
  if (previa) lines.push(`🥂 Pre-party: ${previa.name}`)
  else if (customPrevia) lines.push(`🥂 Pre-party: ${customPrevia}`)
  if (disco) lines.push(`🪩 Club: ${disco.name}`)
  lines.push(`💰 Budget: ~${budget}€`)
  const shareText = lines.join('\n')

  // Distance previa → disco
  const distInfo = previa && disco ? getDistanceInfo(previa.lat, previa.lng, disco.lat, disco.lng) : null

  const total = [
    disco?.prices.find(p => p.is_current)?.amount ?? 0,
    previa?.prices.find(p => p.is_current)?.amount ?? 0,
    restaurant?.prices.find(p => p.is_current)?.amount ?? 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {from && (
        <div className="bg-pink-500/10 border border-pink-500/30 rounded-2xl px-5 py-4 mb-6 text-center">
          <p className="text-pink-400 font-bold text-lg">🎉 {from} is inviting you out!</p>
          <p className="text-zinc-400 text-sm mt-1">Here&apos;s the plan for {day}</p>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black text-white text-xl">The Plan</h2>
          <div className="flex gap-2">
            <ShareButton title="Night Plan" text={shareText} label="Share" />
            <ShareButton title="Night Plan" text={shareText} label="WhatsApp" variant="whatsapp" />
          </div>
        </div>

        {restaurant && <>
          <PlanStep emoji="🍽️" label="Dinner" venue={restaurant} />
          <div className="ml-14 flex items-center gap-2"><div className="w-0.5 h-5 bg-zinc-700" /><ChevronRight className="w-4 h-4 text-zinc-600" /></div>
        </>}
        {!restaurant && customRestaurant && <>
          <PlanStep emoji="🍽️" label="Dinner" venue={null} customName={customRestaurant} />
          <div className="ml-14 flex items-center gap-2"><div className="w-0.5 h-5 bg-zinc-700" /><ChevronRight className="w-4 h-4 text-zinc-600" /></div>
        </>}

        {previa && <>
          <PlanStep emoji="🥂" label="Pre-party" venue={previa} />
          {distInfo && disco && (
            <div className="ml-14 flex items-center gap-3 text-xs text-zinc-500">
              <div className="w-0.5 h-5 bg-zinc-700" />
              <span>🚶 {distInfo.walkMin}min</span>
              <span>🚲 {distInfo.bikeMin}min</span>
              <span>🚗 {distInfo.carMin}min</span>
            </div>
          )}
        </>}
        {!previa && customPrevia && <>
          <PlanStep emoji="🥂" label="Pre-party" venue={null} customName={customPrevia} />
          <div className="ml-14 flex items-center gap-2"><div className="w-0.5 h-5 bg-zinc-700" /><ChevronRight className="w-4 h-4 text-zinc-600" /></div>
        </>}

        {disco && <PlanStep emoji="🪩" label="Club" venue={disco} />}

        {total > 0 && (
          <div className="border-t border-zinc-800 pt-4 flex justify-between text-sm">
            <span className="text-zinc-500">Estimated total</span>
            <span className="font-black text-pink-400 text-lg">{total}€</span>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/night-planner" className="text-zinc-500 text-sm hover:text-pink-400 transition-colors">
          Create your own plan →
        </Link>
      </div>
    </div>
  )
}

export default function PlanPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden bg-black border-b border-pink-500/20">
        <div className="relative max-w-5xl mx-auto px-4 py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-pink-400 mb-4 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />Back
          </Link>
          <h1 className="text-4xl font-black text-pink-400">Night Plan 🎉</h1>
        </div>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <PlanContent />
      </Suspense>
    </main>
  )
}
