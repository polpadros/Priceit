'use client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, MapPin, Globe, Phone, Clock, Euro, ExternalLink, Calendar, Ticket, Music } from 'lucide-react'
import { mockVenues } from '@/lib/mock-data'
import { AmbientBadge } from '@/components/ui/AmbientBadge'
import { StarRating } from '@/components/ui/StarRating'
import { PhotoGallery } from '@/components/venue/PhotoGallery'
import type { Ambient } from '@/types'

const VenueMap = dynamic(() => import('@/components/map/VenueMap').then((m) => m.VenueMap), {
  ssr: false,
  loading: () => <div className="h-64 bg-zinc-800 rounded-xl animate-pulse" />,
})

export default function VenuePage() {
  const params = useParams()
  const venue = mockVenues.find((v) => v.id === params.id)
  const [ratingScore, setRatingScore] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!venue) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">Venue not found</p>
          <Link href="/" className="text-yellow-400 hover:underline">Back to home</Link>
        </div>
      </div>
    )
  }

  const currentPrices = venue.prices.filter((p) => p.is_current)
  const entryPrices = currentPrices.filter(p =>
    p.label.toLowerCase().includes('entry') ||
    p.entrada_tipus === 'free_list' ||
    p.entrada_tipus === 'free'
  )
  const drinkPrices = currentPrices.filter(p =>
    !p.label.toLowerCase().includes('entry') &&
    p.entrada_tipus !== 'free_list' &&
    p.entrada_tipus !== 'free' &&
    !p.label.toLowerCase().includes('vip table')
  )
  const otherPrices = currentPrices.filter(p =>
    p.label.toLowerCase().includes('vip table')
  )

  const upcomingEvents = venue.events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  function handleSubmitRating(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  function formatPrice(p: { amount: number; amount_max: number | null; entrada_tipus: string }) {
    if (p.amount === 0 && p.entrada_tipus === 'free_list') return 'Free*'
    if (p.amount === 0) return 'Free'
    if (p.amount_max) return `${p.amount}–${p.amount_max}€`
    return `${p.amount}€`
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero image */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {venue.image_url ? (
          <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        {/* PriceIt branding on banner */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="font-black text-yellow-400 text-lg tracking-widest uppercase">PriceIt</span>
          <span className="text-zinc-500 text-xs">Barcelona</span>
        </div>
        <Link href="/" className="absolute top-4 right-4 inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm bg-black/40 rounded-full px-3 py-1.5 backdrop-blur-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        {/* Venue info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{venue.name}</h1>
              <div className="flex items-center gap-2 text-zinc-400 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{venue.address}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {venue.ambients.map((a) => (
                  <AmbientBadge key={a} ambient={a as Ambient} size="md" />
                ))}
              </div>
            </div>
            {venue.google_rating && (
              <div className="bg-black/60 backdrop-blur-sm border border-yellow-500/20 rounded-2xl px-4 py-3 text-center">
                <p className="text-3xl font-black text-yellow-400">⭐ {venue.google_rating}</p>
                <p className="text-xs text-zinc-500 mt-1">Google rating</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Info + Prices grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Info card */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="font-bold text-white mb-4">Info</h2>
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">{venue.description}</p>

            {/* Music */}
            {venue.music.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Music className="w-4 h-4 text-yellow-400 shrink-0" />
                {venue.music.map(m => (
                  <span key={m} className="text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-full px-2 py-0.5">{m}</span>
                ))}
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              {venue.min_age > 0 && (
                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="w-5 text-center">🔞</span>
                  <span>Minimum age: {venue.min_age}+</span>
                </div>
              )}
              {venue.dress_code && (
                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="w-5 text-center">👔</span>
                  <span>Dress code: {venue.dress_code}</span>
                </div>
              )}
              {Object.entries(venue.opening_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-3 text-zinc-400">
                  <Clock className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>{day}: {hours}</span>
                </div>
              ))}
              {venue.website && (
                <a href={venue.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-yellow-400 hover:text-yellow-300 transition-colors">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>Official website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {venue.instagram && (
                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="w-4 text-center shrink-0">📸</span>
                  <span>{venue.instagram}</span>
                </div>
              )}
              {venue.phone && (
                <div className="flex items-center gap-3 text-zinc-400">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{venue.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prices card */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="font-bold text-white mb-1 flex items-center gap-2">
              <Euro className="w-5 h-5 text-yellow-400" />
              Prices
            </h2>
            {venue.price_sync_source && venue.price_sync_source !== 'manual' && (
              <p className="text-xs text-amber-500 mb-3 flex items-center gap-1">
                ⚡ Prices auto-updated via {venue.price_sync_source}
              </p>
            )}
            {!venue.price_sync_source && <div className="mb-3" />}

            {/* Entry prices with buy button */}
            {entryPrices.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">🎟 Entry</p>
                <div className="space-y-2">
                  {entryPrices.map(price => (
                    <div key={price.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800 border border-zinc-700">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">{formatPrice(price)}</span>
                          {price.entrada_tipus === 'dynamic' && (
                            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-1.5 py-0.5">⚡ live price</span>
                          )}
                          {price.entrada_tipus === 'free_list' && (
                            <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-1.5 py-0.5">📋 guest list</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{price.label}</p>
                        {price.includes && <p className="text-xs text-zinc-600">Includes: {price.includes}</p>}
                      </div>
                      {price.ticket_url && (
                        <a
                          href={price.ticket_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 shrink-0 flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          Buy
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drink prices */}
            {drinkPrices.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">🍹 Drinks</p>
                <div className="space-y-1.5">
                  {drinkPrices.map(price => (
                    <div key={price.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/50">
                      <span className="text-sm text-zinc-400">{price.label}</span>
                      <span className="text-sm font-semibold text-white">{formatPrice(price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIP */}
            {otherPrices.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">👑 VIP</p>
                <div className="space-y-1.5">
                  {otherPrices.map(price => (
                    <div key={price.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                      <span className="text-sm text-zinc-400">{price.label}</span>
                      <span className="text-sm font-bold text-yellow-400">{formatPrice(price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPrices.length === 0 && (
              <p className="text-zinc-500 text-sm">Prices not available</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              Upcoming events
            </h2>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start justify-between p-4 rounded-xl border border-zinc-700 hover:border-yellow-500/30 transition-colors bg-zinc-800/50">
                  <div>
                    <p className="font-semibold text-white">{event.name}</p>
                    {event.artists.length > 0 && (
                      <p className="text-sm text-zinc-400 mt-0.5">{event.artists.join(', ')}</p>
                    )}
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {event.doors_open && ` · Doors: ${event.doors_open}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    {event.price_min !== null && (
                      <p className="font-bold text-yellow-400">
                        {event.price_min === 0 ? 'Free' : `${event.price_min}€`}
                        {event.price_max && event.price_max !== event.price_min && `–${event.price_max}€`}
                      </p>
                    )}
                    {event.ticket_url && (
                      <a href={event.ticket_url} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
                        <Ticket className="w-3 h-3" />
                        Buy tickets
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-yellow-400" />
            Location
          </h2>
          <VenueMap venues={[venue]} height="260px" />
          <p className="text-sm text-zinc-500 mt-3">{venue.address}, {venue.neighborhood}</p>
        </div>

        {/* 📸 Community Photos */}
        <PhotoGallery venueId={venue.id} />

        {/* Reviews */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <h2 className="font-bold text-white mb-4">Reviews ({venue.rating_count})</h2>

          {venue.ratings.length > 0 ? (
            <div className="space-y-4 mb-6">
              {venue.ratings.map((rating) => (
                <div key={rating.id} className="p-4 rounded-xl bg-zinc-800 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating value={rating.score} size="sm" />
                    <span className="text-xs text-zinc-500">
                      {new Date(rating.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  {rating.comment && <p className="text-sm text-zinc-300">{rating.comment}</p>}
                  {rating.ambients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rating.ambients.map((a) => (
                        <AmbientBadge key={a} ambient={a as Ambient} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm mb-6">Be the first to review this venue.</p>
          )}

          {/* Add rating form */}
          {!submitted ? (
            <form onSubmit={handleSubmitRating} className="border-t border-zinc-800 pt-5">
              <h3 className="font-semibold text-white mb-3">Add your review</h3>
              <div className="mb-3">
                <p className="text-sm text-zinc-400 mb-2">Rating</p>
                <StarRating value={ratingScore} interactive onChange={setRatingScore} size="lg" />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 resize-none placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={ratingScore === 0}
                className="mt-3 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Submit review
              </button>
            </form>
          ) : (
            <div className="border-t border-zinc-800 pt-5 text-center text-green-400 font-semibold">
              ✅ Thanks for your review!
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
