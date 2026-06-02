'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, use } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, MapPin, Globe, Phone, Clock, Euro, ExternalLink, Calendar } from 'lucide-react'
import { mockVenues } from '@/lib/mock-data'
import { AmbientBadge } from '@/components/ui/AmbientBadge'
import { StarRating } from '@/components/ui/StarRating'
import type { Ambient } from '@/types'

const VenueMap = dynamic(() => import('@/components/map/VenueMap').then((m) => m.VenueMap), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />,
})

export default function VenuePage() {
  const params = useParams()
  const venue = mockVenues.find((v) => v.id === params.id)
  const [ratingScore, setRatingScore] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">Local no trobat</p>
          <Link href="/" className="text-violet-600 hover:underline">Torna a l&apos;inici</Link>
        </div>
      </div>
    )
  }

  const currentPrices = venue.prices.filter((p) => p.is_current)
  const upcomingEvents = venue.events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  function handleSubmitRating(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-violet-200 hover:text-white mb-6 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Tornar
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2">{venue.name}</h1>
              <div className="flex items-center gap-2 text-violet-200 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{venue.address}, {venue.neighborhood}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {venue.ambients.map((a) => (
                  <AmbientBadge key={a} ambient={a as Ambient} size="md" />
                ))}
              </div>
            </div>
            {venue.rating_count > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-4xl font-black">{venue.avg_rating.toFixed(1)}</p>
                <StarRating value={Math.round(venue.avg_rating)} size="md" />
                <p className="text-xs text-violet-200 mt-1">{venue.rating_count} valoracions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Info + Prices */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Informació</h2>
            <p className="text-gray-600 mb-5">{venue.description}</p>
            <div className="space-y-3 text-sm">
              {venue.min_age > 0 && (
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="w-5 text-center">🔞</span>
                  <span>Minimum age: {venue.min_age}+</span>
                </div>
              )}
              {venue.dress_code && (
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="w-5 text-center">👔</span>
                  <span>Dress code: {venue.dress_code}</span>
                </div>
              )}
              {Object.entries(venue.opening_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="capitalize">{day}: {hours}</span>
                </div>
              ))}
              {venue.website && (
                <a href={venue.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-violet-600 hover:underline">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>Web oficial</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {venue.instagram && (
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="w-4 text-center shrink-0">📸</span>
                  <span>{venue.instagram}</span>
                </div>
              )}
              {venue.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{venue.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prices */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Euro className="w-5 h-5 text-violet-600" />
              Current prices
            </h2>
            {venue.price_sync_source && venue.price_sync_source !== 'manual' && (
              <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
                ⚡ Prices auto-updated via {venue.price_sync_source}
                {venue.price_sync_url && (
                  <a href={venue.price_sync_url} target="_blank" rel="noopener noreferrer"
                    className="underline hover:text-amber-800 ml-1">source ↗</a>
                )}
              </p>
            )}
            {!venue.price_sync_source && <div className="mb-3" />}
            {currentPrices.length > 0 ? (
              <div className="space-y-3">
                {currentPrices.map((price) => (
                  <div key={price.id} className="flex items-start justify-between p-3 rounded-xl bg-violet-50 border border-violet-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{price.label}</p>
                        {price.entrada_tipus === 'dynamic' && (
                          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-1.5 py-0.5">⚡ dynamic</span>
                        )}
                        {price.entrada_tipus === 'free_list' && (
                          <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-1.5 py-0.5">📋 guest list</span>
                        )}
                      </div>
                      {price.includes && (
                        <p className="text-xs text-gray-500 mt-0.5">Includes: {price.includes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400 capitalize">Source: {price.source}</p>
                        {price.last_synced_at && (
                          <p className="text-xs text-amber-500">
                            · synced {new Date(price.last_synced_at).toLocaleDateString('en-GB')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-black text-violet-700 shrink-0 ml-3">
                      {price.amount === 0 && price.entrada_tipus === 'free_list'
                        ? 'Free*'
                        : price.amount === 0
                        ? 'Free'
                        : price.amount_max
                        ? `${price.amount}–${price.amount_max}€`
                        : `${price.amount}€`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Prices not available</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-600" />
              Propers events
            </h2>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-violet-200 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">{event.name}</p>
                    {event.artists.length > 0 && (
                      <p className="text-sm text-gray-600 mt-0.5">{event.artists.join(', ')}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.date).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {event.doors_open && ` · Portes: ${event.doors_open}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {event.price_min !== null && (
                      <p className="font-bold text-violet-700">
                        {event.price_min === 0 ? 'Gratis' : `${event.price_min}€`}
                        {event.price_max && event.price_max !== event.price_min && ` - ${event.price_max}€`}
                      </p>
                    )}
                    {event.ticket_url && (
                      <a href={event.ticket_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-violet-600 hover:underline mt-1 inline-flex items-center gap-1">
                        Entrades <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-violet-600" />
            Ubicació
          </h2>
          <VenueMap venues={[venue]} height="280px" />
          <p className="text-sm text-gray-500 mt-3">{venue.address}</p>
        </div>

        {/* Ratings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Valoracions ({venue.rating_count})</h2>

          {venue.ratings.length > 0 ? (
            <div className="space-y-4 mb-6">
              {venue.ratings.map((rating) => (
                <div key={rating.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating value={rating.score} size="sm" />
                    <span className="text-xs text-gray-400">
                      {new Date(rating.created_at).toLocaleDateString('ca-ES')}
                    </span>
                  </div>
                  {rating.comment && <p className="text-sm text-gray-700">{rating.comment}</p>}
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
            <p className="text-gray-400 text-sm mb-6">Sigues el primer a valorar aquest local.</p>
          )}

          {/* Add rating form */}
          {!submitted ? (
            <form onSubmit={handleSubmitRating} className="border-t border-gray-100 pt-5">
              <h3 className="font-semibold text-gray-900 mb-3">Afegeix la teva valoració</h3>
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Puntuació</p>
                <StarRating value={ratingScore} interactive onChange={setRatingScore} size="lg" />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explica la teva experiència..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              />
              <button
                type="submit"
                disabled={ratingScore === 0}
                className="mt-3 px-5 py-2 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Enviar valoració
              </button>
            </form>
          ) : (
            <div className="border-t border-gray-100 pt-5 text-center text-green-600 font-semibold">
              ✅ Gràcies per la teva valoració!
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
