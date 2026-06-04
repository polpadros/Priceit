'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocial } from '@/contexts/SocialContext'
import { getSupabase } from '@/lib/supabase'
import { FollowButton } from '@/components/social/FollowButton'

interface Profile { id: string; username: string | null; avatar_url: string | null }

export default function ConnectionsPage() {
  const { user } = useAuth()
  const { following, followers } = useSocial()
  const [tab, setTab] = useState<'following' | 'followers'>('following')
  const [followingProfiles, setFollowingProfiles] = useState<Profile[]>([])
  const [followerProfiles, setFollowerProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      const supabase = getSupabase()
      const [fwRes, frRes] = await Promise.all([
        following.size > 0
          ? supabase.from('profiles').select('id,username,avatar_url').in('id', [...following])
          : Promise.resolve({ data: [] }),
        followers.size > 0
          ? supabase.from('profiles').select('id,username,avatar_url').in('id', [...followers])
          : Promise.resolve({ data: [] }),
      ])
      setFollowingProfiles((fwRes as any).data ?? [])
      setFollowerProfiles((frRes as any).data ?? [])
      setLoading(false)
    }
    load()
  }, [user, following, followers])

  const list = tab === 'following' ? followingProfiles : followerProfiles

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="sticky top-14 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
          <Link href="/social" className="text-zinc-500 hover:text-pink-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-black text-white text-lg">Connections</h1>
        </div>
        {/* Tabs */}
        <div className="max-w-lg mx-auto flex border-b border-zinc-800">
          {([['following', `Following (${following.size})`], ['followers', `Followers (${followers.size})`]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === key ? 'border-pink-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse" />)}</div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-4xl mb-3">{tab === 'following' ? '🔍' : '👤'}</p>
            <p className="font-semibold text-white mb-1">{tab === 'following' ? 'Not following anyone yet' : 'No followers yet'}</p>
            {tab === 'following' && (
              <Link href="/social/people" className="text-pink-400 hover:underline text-sm mt-2 inline-block">Find people to follow →</Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {list.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <Link href={`/users/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                    {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" /> : (p.username?.[0] ?? '?').toUpperCase()}
                  </div>
                  <p className="font-semibold text-white truncate">{p.username ?? 'Anonymous'}</p>
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
