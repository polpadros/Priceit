'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { useSocial } from '@/contexts/SocialContext'
import { useAuth } from '@/contexts/AuthContext'

export default function DMListPage() {
  const { conversations, loadConversations } = useSocial()
  const { user } = useAuth()

  useEffect(() => { loadConversations() }, [])

  if (!user) return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-500">Sign in to access messages</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="sticky top-14 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
          <Link href="/social" className="text-zinc-500 hover:text-pink-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-black text-white text-lg">Messages</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {conversations.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-white mb-1">No conversations yet</p>
            <p className="text-sm">Visit someone&apos;s profile to start a DM</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <Link key={conv.id} href={`/social/dm/${conv.id}`}>
                <div className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 hover:border-pink-500/30 rounded-2xl transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                    {conv.other_avatar
                      ? <img src={conv.other_avatar} className="w-full h-full object-cover" alt="" />
                      : (conv.other_username?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{conv.other_username ?? 'User'}</p>
                    <p className="text-sm text-zinc-500 truncate">{conv.last_message ?? 'No messages yet'}</p>
                  </div>
                  {conv.last_message_at && (
                    <p className="text-xs text-zinc-600 shrink-0">
                      {new Date(conv.last_message_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
