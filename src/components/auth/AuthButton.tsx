'use client'
import { useState, useEffect } from 'react'
import { LogOut, User, Settings } from 'lucide-react'
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
  const [showMenu, setShowMenu] = useState(false)
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
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
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
        </button>

        {showMenu && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-1 min-w-[180px] z-50">
              {/* Profile preview */}
              <div className="flex items-center gap-3 px-3 py-2.5 border-b border-zinc-800 mb-1">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-black">{displayName[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                  <p className="text-zinc-500 text-xs truncate">{user.email}</p>
                </div>
              </div>

              <Link href="/profile" onClick={() => setShowMenu(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                Edit profile
              </Link>
              <button
                onClick={async () => { await signOut(); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
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
