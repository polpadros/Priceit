'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Grid, Heart, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocial } from '@/contexts/SocialContext'
import { getSupabase } from '@/lib/supabase'
import { mockVenues } from '@/lib/mock-data'
import { FollowButton } from '@/components/social/FollowButton'
import { VenueCard } from '@/components/venue/VenueCard'
import type { VenueWithDetails } from '@/types'

interface Profile { id: string; username: string | null; avatar_url: string | null }

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { following, getOrCreateConversation } = useSocial()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [favorites, setFavorites] = useState<VenueWithDetails[]>([])
  const [tab, setTab] = useState<'photos' | 'likes'>('photos')
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const isMe = user?.id === id

  useEffect(() => {
    if (!id) return
    async function load() {
      const supabase = getSupabase()
      const [profileRes, photosRes, favsRes, fwRes, frRes] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url').eq('id', id).single(),
        supabase.from('feed_photos').select('*').eq('user_id', id).order('created_at', { ascending: false }),
        supabase.from('favorites').select('venue_id').eq('user_id', id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id),
      ])
      setProfile(profileRes.data)
      setPhotos(photosRes.data ?? [])
      setFollowingCount(fwRes.count ?? 0)
      setFollowerCount(frRes.count ?? 0)
      if (favsRes.data) {
        const venueIds = favsRes.data.map((f: any) => f.venue_id)
        setFavorites(mockVenues.filter(v => venueIds.includes(v.id)))
      }
    }
    load()
  }, [id])

  async function handleDM() {
    if (!user || !id) return
    const convId = await getOrCreateConversation(id)
    if (convId) window.location.href = `/social/dm/${convId}`
  }

  const displayName = profile?.username ?? id?.slice(0, 8) ?? 'User'

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="sticky top-14 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
          <Link href="/social" className="text-zinc-500 hover:text-pink-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-white">{displayName}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="flex items-start gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-3xl shrink-0 overflow-hidden border-2 border-pink-500/30">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
              : displayName[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-black text-white text-xl mb-1">{displayName}</p>
            <div className="flex gap-5 text-center mb-3">
              {[
                { label: 'Posts', value: photos.length, link: null },
                { label: 'Followers', value: followerCount, link: isMe ? '/social/connections' : null },
                { label: 'Following', value: followingCount, link: isMe ? '/social/connections' : null },
              ].map(s => (
                s.link ? (
                  <Link key={s.label} href={s.link} className="hover:opacity-70 transition-opacity">
                    <p className="font-black text-white text-lg">{s.value}</p>
                    <p className="text-zinc-500 text-xs">{s.label}</p>
                  </Link>
                ) : (
                  <div key={s.label}>
                    <p className="font-black text-white text-lg">{s.value}</p>
                    <p className="text-zinc-500 text-xs">{s.label}</p>
                  </div>
                )
              ))}
            </div>
            {!isMe && (
              <div className="flex gap-2">
                <FollowButton userId={id} />
                <button onClick={handleDM}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                  <MessageCircle className="w-4 h-4" /> Message
                </button>
              </div>
            )}
            {isMe && (
              <Link href="/profile" className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                Edit profile
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 mb-5">
          {[
            { key: 'photos', icon: Grid, label: 'Posts' },
            { key: 'likes', icon: Heart, label: 'Favourites' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key ? 'border-pink-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Photos grid */}
        {tab === 'photos' && (
          photos.length === 0 ? (
            <div className="text-center py-12 text-zinc-600">
              <p>No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {photos.map(p => (
                <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-zinc-800">
                  <img src={p.public_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
                </div>
              ))}
            </div>
          )
        )}

        {/* Favourites — like TikTok likes */}
        {tab === 'likes' && (
          favorites.length === 0 ? (
            <div className="text-center py-12 text-zinc-600">
              <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No favourites yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {favorites.map(v => <VenueCard key={v.id} venue={v} />)}
            </div>
          )
        )}
      </div>
    </main>
  )
}
