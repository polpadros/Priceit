'use client'
import { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabase } from '@/lib/supabase'
import { LoginModal } from './LoginModal'

interface Profile {
  username: string | null
  avatar_url: string | null
}

export function AuthButton() {
  const { user, signOut } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!user) { setProfile(null); return }

    async function loadProfile() {
      const { data } = await getSupabase()
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user!.id)
        .single()
      if (data) setProfile(data)
    }

    loadProfile()

    // Re-load whenever the user saves their profile (listen to storage events)
    const handler = () => loadProfile()
    window.addEventListener('profile-updated', handler)
    return () => window.removeEventListener('profile-updated', handler)
  }, [user])

  const displayName = profile?.username ?? user?.email?.split('@')[0] ?? ''
  const avatarUrl = profile?.avatar_url

  if (user) {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-pink-500/30 hover:border-pink-500/60 transition-colors"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <span className="text-white text-xs font-black">
              {displayName[0]?.toUpperCase()}
            </span>
          )}
        </div>
        {/* Name */}
        <span className="text-sm text-pink-400 font-semibold max-w-[100px] truncate hidden sm:block">
          {displayName}
        </span>
      </Link>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="px-4 py-1.5 text-sm font-bold text-black bg-pink-500 hover:bg-pink-400 rounded-xl transition-colors"
      >
        Sign in
      </button>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
