'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabase } from '@/lib/supabase'
import { Avatar } from '@/components/ui/Avatar'
import { LoginModal } from './LoginModal'

interface Profile {
  username: string | null
  avatar_url: string | null
}

export function AuthButton() {
  const { user } = useAuth()
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

    const handler = () => loadProfile()
    window.addEventListener('profile-updated', handler)
    return () => window.removeEventListener('profile-updated', handler)
  }, [user])

  const displayName = profile?.username ?? user?.email?.split('@')[0] ?? ''
  // Add cache-busting for display only so fresh photo shows immediately
  const avatarUrl = profile?.avatar_url
    ? `${profile.avatar_url.split('?')[0]}?v=${profile.avatar_url.length}`
    : null

  if (user) {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-pink-500/30 hover:border-pink-500/60 transition-colors"
      >
        <Avatar src={avatarUrl} name={displayName} size="xs" />
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
