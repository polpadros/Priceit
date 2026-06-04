'use client'
import { useState } from 'react'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { useSocial } from '@/contexts/SocialContext'
import { useAuth } from '@/contexts/AuthContext'

export function FollowButton({ userId, size = 'md' }: { userId: string; size?: 'sm' | 'md' }) {
  const { isFollowing, follow, unfollow } = useSocial()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const following = isFollowing(userId)

  if (!user || user.id === userId) return null

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setLoading(true)
    if (following) await unfollow(userId)
    else await follow(userId)
    setLoading(false)
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className={`flex items-center gap-1.5 font-bold rounded-xl transition-colors disabled:opacity-50 ${
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
      } ${following
        ? 'bg-zinc-800 text-zinc-300 hover:bg-red-900/30 hover:text-red-400 border border-zinc-700'
        : 'bg-pink-500 hover:bg-pink-400 text-white'
      }`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
        following ? <><UserCheck className="w-3.5 h-3.5" />Following</> :
          <><UserPlus className="w-3.5 h-3.5" />Follow</>}
    </button>
  )
}
