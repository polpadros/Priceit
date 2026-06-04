'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Users, Bell } from 'lucide-react'
import { useSocial } from '@/contexts/SocialContext'
import { useAuth } from '@/contexts/AuthContext'
import { FeedPost } from '@/components/social/FeedPost'
import { FeedUpload } from '@/components/social/FeedUpload'

export default function SocialPage() {
  const { feedPhotos, loadFeed, unreadCount } = useSocial()
  const { user } = useAuth()

  useEffect(() => { loadFeed() }, [])

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <h1 className="font-black text-white text-lg">
            Social <span className="text-pink-400">feed</span>
          </h1>
          <div className="flex items-center gap-2">
            <FeedUpload onUploaded={loadFeed} />
            <Link href="/social/dm" className="relative p-2 text-zinc-400 hover:text-pink-400 transition-colors">
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />
              )}
            </Link>
            <Link href="/social/connections" className="p-2 text-zinc-400 hover:text-pink-400 transition-colors" title="Followers & Following">
              <Users className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {!user && (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl mb-6">
            <p className="text-3xl mb-3">👥</p>
            <p className="font-bold text-white mb-1">Sign in to see the social feed</p>
            <p className="text-zinc-500 text-sm">Follow friends and share your nights out</p>
          </div>
        )}

        {user && feedPhotos.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-5xl mb-4">📸</p>
            <p className="font-semibold text-white text-lg mb-2">No photos yet</p>
            <p className="text-sm mb-6">Follow people or be the first to share your night!</p>
            <div className="flex gap-3 justify-center">
              <FeedUpload />
              <Link href="/social/people"
                className="flex items-center gap-2 border border-zinc-700 hover:border-pink-500/50 text-zinc-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                <Users className="w-4 h-4" /> Find people
              </Link>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-5">
          {feedPhotos.map(photo => (
            <FeedPost
              key={photo.id}
              photo={photo}
              onDelete={(id) => loadFeed()}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
