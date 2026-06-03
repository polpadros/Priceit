'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { mockVenues } from '@/lib/mock-data'
import { getSupabase } from '@/lib/supabase'
import { ArrowLeft, Shield, Users, Star, Camera, MapPin, TrendingUp } from 'lucide-react'

const ADMIN_PASSWORD = 'priceit2026'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [stats, setStats] = useState({ ratings: 0, photos: 0, favorites: 0 })
  const [recentRatings, setRecentRatings] = useState<any[]>([])
  const [recentPhotos, setRecentPhotos] = useState<any[]>([])

  useEffect(() => {
    if (!authed) return
    async function loadStats() {
      const supabase = getSupabase()
      const [ratingsRes, photosRes, favsRes] = await Promise.all([
        supabase.from('ratings').select('*', { count: 'exact', head: false }).order('created_at', { ascending: false }).limit(5),
        supabase.from('venue_photos').select('*', { count: 'exact', head: false }).order('created_at', { ascending: false }).limit(6),
        supabase.from('favorites').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        ratings: ratingsRes.count ?? 0,
        photos: photosRes.count ?? 0,
        favorites: favsRes.count ?? 0,
      })
      setRecentRatings(ratingsRes.data ?? [])
      setRecentPhotos(photosRes.data ?? [])
    }
    loadStats()
  }, [authed])

  if (!authed) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-pink-400 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-white">Admin Panel</h1>
            <p className="text-zinc-500 text-sm mt-1">PriceIt Barcelona</p>
          </div>
          <input
            type="password"
            placeholder="Admin password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (pw === ADMIN_PASSWORD) setAuthed(true)
                else setError(true)
              }
            }}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none focus:border-pink-500/50 mb-3"
          />
          {error && <p className="text-red-400 text-sm mb-3">Wrong password</p>}
          <button
            onClick={() => { if (pw === ADMIN_PASSWORD) setAuthed(true); else setError(true) }}
            className="w-full bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl py-3 transition-colors"
          >
            Enter
          </button>
          <Link href="/" className="block text-center text-zinc-600 text-sm mt-4 hover:text-zinc-400">← Back to app</Link>
        </div>
      </main>
    )
  }

  const venuesByType = {
    discoteca: mockVenues.filter(v => v.type === 'discoteca').length,
    bar: mockVenues.filter(v => v.type === 'bar').length,
    previa: mockVenues.filter(v => v.type === 'previa').length,
    restaurant: mockVenues.filter(v => v.type === 'restaurant').length,
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="bg-black border-b border-pink-500/20">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-pink-400" />
            <span className="font-black text-white text-xl">PriceIt Admin</span>
          </div>
          <Link href="/" className="text-zinc-500 hover:text-pink-400 text-sm flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total venues', value: mockVenues.length, icon: MapPin, color: 'text-pink-400' },
            { label: 'User ratings', value: stats.ratings, icon: Star, color: 'text-yellow-400' },
            { label: 'Photos uploaded', value: stats.photos, icon: Camera, color: 'text-blue-400' },
            { label: 'Favorites saved', value: stats.favorites, icon: TrendingUp, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Venues breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4 text-lg">Venues breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {Object.entries(venuesByType).map(([type, count]) => (
              <div key={type} className="text-center p-4 bg-zinc-800 rounded-xl">
                <p className="text-2xl font-black text-pink-400">{count}</p>
                <p className="text-xs text-zinc-400 capitalize mt-1">{type === 'discoteca' ? 'Clubs' : type === 'previa' ? 'Pre-party' : type === 'bar' ? 'Bars' : 'Restaurants'}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-500 font-medium pb-3 pr-4">Venue</th>
                  <th className="text-left text-zinc-500 font-medium pb-3 pr-4">Type</th>
                  <th className="text-left text-zinc-500 font-medium pb-3 pr-4">Neighbourhood</th>
                  <th className="text-left text-zinc-500 font-medium pb-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                {mockVenues.slice(0, 20).map(v => (
                  <tr key={v.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-2.5 pr-4">
                      <Link href={`/venues/${v.id}`} className="text-white hover:text-pink-400 transition-colors font-medium">
                        {v.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-zinc-500 capitalize">{v.type}</td>
                    <td className="py-2.5 pr-4 text-zinc-500">{v.neighborhood}</td>
                    <td className="py-2.5 text-zinc-500">{v.google_rating ? `⭐ ${v.google_rating}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mockVenues.length > 20 && (
              <p className="text-zinc-600 text-xs mt-3">Showing 20 of {mockVenues.length} venues</p>
            )}
          </div>
        </div>

        {/* Recent ratings */}
        {recentRatings.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4 text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Recent ratings
            </h2>
            <div className="space-y-3">
              {recentRatings.map((r: any) => (
                <div key={r.id} className="flex items-start justify-between p-3 bg-zinc-800 rounded-xl">
                  <div>
                    <p className="text-white text-sm font-medium">{mockVenues.find(v => v.id === r.venue_id)?.name ?? r.venue_id}</p>
                    {r.comment && <p className="text-zinc-400 text-xs mt-0.5">"{r.comment}"</p>}
                    <p className="text-zinc-600 text-xs mt-1">{new Date(r.created_at).toLocaleDateString('en-GB')}</p>
                  </div>
                  <span className="text-yellow-400 font-bold">{'★'.repeat(r.score)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent photos */}
        {recentPhotos.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4 text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              Recent photos
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {recentPhotos.map((p: any) => (
                <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-zinc-800">
                  <img src={p.public_url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
