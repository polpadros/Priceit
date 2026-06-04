'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabase } from '@/lib/supabase'
import { FollowButton } from '@/components/social/FollowButton'

interface Profile { id: string; username: string | null; avatar_url: string | null }

export default function PeoplePage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = getSupabase().from('profiles').select('id, username, avatar_url').limit(50)
      if (user) query = query.neq('id', user.id)
      const { data } = await query
      setProfiles(data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = profiles.filter(p =>
    !search || p.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="sticky top-14 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
          <Link href="/social" className="text-zinc-500 hover:text-pink-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-black text-white text-lg">Find people</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by username..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500/50 text-white rounded-2xl pl-10 pr-4 py-3 outline-none placeholder:text-zinc-600" />
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <Link href={`/users/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                    {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" /> : (p.username?.[0] ?? '?').toUpperCase()}
                  </div>
                  <p className="font-semibold text-white truncate">{p.username ?? 'Anonymous user'}</p>
                </Link>
                <FollowButton userId={p.id} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
