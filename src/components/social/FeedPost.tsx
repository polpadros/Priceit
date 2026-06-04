'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Send, MapPin, MoreHorizontal, Trash2 } from 'lucide-react'
import { useSocial, type FeedPhoto } from '@/contexts/SocialContext'
import { useAuth } from '@/contexts/AuthContext'
import { mockVenues } from '@/lib/mock-data'
import { getSupabase } from '@/lib/supabase'

export function FeedPost({ photo, onDelete }: { photo: FeedPhoto; onDelete?: (id: string) => void }) {
  const { likePhoto } = useSocial()
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const venue = photo.venue_id ? mockVenues.find(v => v.id === photo.venue_id) : null
  const displayName = photo.username ?? photo.user_id?.slice(0, 8)
  const isOwn = user?.id === photo.user_id

  async function handleDelete() {
    if (!isOwn) return
    await getSupabase().from('feed_photos').delete().eq('id', photo.id)
    await getSupabase().storage.from('venue-photos').remove([photo.storage_path])
    onDelete?.(photo.id)
  }

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link href={`/users/${photo.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
              {photo.avatar_url
                ? <img src={photo.avatar_url} className="w-full h-full object-cover" alt="" />
                : displayName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{displayName}</p>
              {venue && (
                <p className="text-zinc-500 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <Link href={`/venues/${venue.id}`} className="hover:text-pink-400 transition-colors">
                    {venue.name}
                  </Link>
                </p>
              )}
            </div>
          </Link>
          {isOwn && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-zinc-600 hover:text-zinc-400 p-1">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl p-1 z-10 min-w-[120px]">
                  <button onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-700 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Photo */}
        <div className="cursor-pointer" onClick={() => setLightbox(true)}>
          <img src={photo.public_url} alt={photo.caption ?? 'Night photo'}
            className="w-full aspect-square sm:aspect-[4/3] object-cover" />
        </div>

        {/* Actions */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => likePhoto(photo.id)}
              className={`flex items-center gap-1.5 transition-colors ${photo.is_liked ? 'text-pink-500' : 'text-zinc-400 hover:text-pink-400'}`}>
              <Heart className={`w-5 h-5 ${photo.is_liked ? 'fill-pink-500' : ''}`} />
              <span className="text-sm font-semibold">{photo.likes_count}</span>
            </button>
          </div>
          {photo.caption && (
            <p className="text-sm text-zinc-300">
              <span className="text-white font-semibold mr-1">{displayName}</span>
              {photo.caption}
            </p>
          )}
          <p className="text-xs text-zinc-600 mt-1">
            {new Date(photo.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" onClick={() => setLightbox(false)}>
          <img src={photo.public_url} alt="" className="max-w-full max-h-[90vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
